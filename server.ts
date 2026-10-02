import express from "express";
import path from "path";
import os from "os";
import fs from "fs";
import sharp from "sharp";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { Client as MagicHourClient } from "magic-hour";
import pptxgen from "pptxgenjs";
import JSZip from "jszip";
import { CANONICAL_RESEARCH_SOURCES, buildEvidenceMatrixRows, findCanonicalSource } from "./src/lib/researchEvidenceRegistry";
import { 
  extractClaimsFromText, 
  verifyNumericalStatement, 
  runPreSubmissionAudit, 
  calculateIntegrityMetrics,
  applyIntegrityQualificationsToText 
} from "./src/lib/researchIntegrityEngine";
import { generateBenchmarkResearchProject } from "./src/lib/benchmarkResearchProject";
import { runAllIntegrityTests } from "./src/lib/__tests__/researchIntegrityTests";
import { resolveAllAuditIssues, resolveSingleAuditIssue } from "./src/lib/auditAutoResolver";

let aiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;
let openaiQuotaExhausted = false;

function getGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    null
  );
}

function getAIClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function canUseOpenAI(): boolean {
  return Boolean(!openaiQuotaExhausted && process.env.OPENAI_API_KEY);
}

function handleOpenAIError(err: any) {
  const errMsg = String(err?.message || err || "");
  if (
    errMsg.includes("429") ||
    errMsg.includes("credits remaining") ||
    errMsg.includes("quota") ||
    errMsg.includes("insufficient_quota") ||
    errMsg.includes("RateLimitError")
  ) {
    if (!openaiQuotaExhausted) {
      openaiQuotaExhausted = true;
      console.info("OpenAI API rate limit/quota reached. Seamlessly routing requests to Google Gemini engine.");
    }
  }
}

function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function normalizeAccessedDatesServer(text: string): string {
  if (!text) return '';
  const now = new Date();
  const harvardDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  let normalized = text.replace(/\[Accessed(?:\s*:\s*|\s+)[^\]\n]+\]/gi, `[Accessed ${harvardDate}]`);
  normalized = normalized.replace(/\bAccessed(?:\s*:\s*|\s+)(?:(?:\d{1,2}\s+[A-Za-z]+\s+\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s+\d{4})|(?:\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})|Date)/gi, `Accessed ${harvardDate}`);
  return normalized;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Enable CORS & OPTIONS preflight for all /api routes
  app.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // Diagnostic middleware specifically for /api/generate-image
  app.use("/api/generate-image", (req, res, next) => {
    res.setHeader("X-Nexora-API", "image-generation-express");
    console.log(`[Diagnostic /api/generate-image] Incoming request: Method=${req.method}, Path=${req.path}, Content-Type=${req.headers["content-type"] || "none"}`);
    next();
  });

  // Diagnostic middleware specifically for Magic Hour endpoints
  app.use(["/api/magic-hour", "/api/magic-hour-transform"], (req, res, next) => {
    res.setHeader("X-Nexora-API", "magic-hour-express");
    console.log(`[Diagnostic Magic Hour] Incoming request: Method=${req.method}, Path=${req.path}, Content-Type=${req.headers["content-type"] || "none"}`);
    next();
  });

  // Prevent Express body-parser from returning HTML error pages on malformed payloads
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      if (req.path.startsWith("/api/")) {
        console.warn(`[Express Body Error on ${req.method} ${req.path}]:`, err.message || err);
        return res.status(err.status || err.statusCode || 400).json({
          error: `Invalid request payload: ${err.message || "Failed to parse request body"}`
        });
      }
    }
    next(err);
  });

  // Chat/Text generation API
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, tone, language, referenceStyle, files, engine } = req.body;
      const requestedTone = tone || "Academic";
      const requestedLanguage = language || "English (US)";
      const requestedRefStyle = referenceStyle || "Harvard";

      const now = new Date();
      const formattedCurrentDateHarvard = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const formattedCurrentDateNumeric = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
      const formattedCurrentDateUS = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      let systemInstruction = `SYSTEM DIRECTIVE: You are an expert AI Research Assistant instructed to respond in a **${requestedTone}** style.

MANDATORY STRUCTURAL & COMPOSITION RULES:
1. EXTENDED DEPTH & SCHOLARLY LENGTH: Provide an extensive, comprehensive, multi-page scholarly analysis (aiming for 1,500 to 2,500+ words). Thoroughly unpack every concept, mechanism, historical context, empirical data, granular analysis, and nuanced implication without abbreviating or summarizing.
2. STANDALONE HEADINGS & SUBHEADINGS:
   - Headings and subheadings (e.g. ## Major Section, ### Granular Subheading) MUST stand strictly on their own separate line in clean markdown. Never place body text on the same line as a heading.
3. NO PROLIFERATION OF SUBHEADINGS & SUBSTANTIAL MULTI-PARAGRAPH DEPTH:
   - You must NOT proliferate subheadings without substantial content or text under each subheading. Never create shallow, fragmented subheadings followed by only 1, 2, or 3 brief paragraphs or bullet points.
   - Under EVERY single subheading (H2, H3, H4), you MUST provide MORE THAN 3 OR 4 PARAGRAPHS (at least 4 to 6+ rich, well-developed, coherent, and empirically grounded paragraphs per subheading).
   - Under no circumstances should any subheading contain only 1, 2, or 3 brief paragraphs or a summary.
   - Deeply articulate theoretical context, biochemical, physical, or computational mechanisms, experimental evidence, literature debates, and practical implications across consecutive paragraphs under each subheading.
4. PARAGRAPH INDENTATION & CLEAR DEMARCATION:
   - Each paragraph under a subheading must be distinctly separated from consecutive paragraphs with double line breaks and clear first-line paragraph indentations.
   - Separate every paragraph so that each paragraph under a subheading is clearly delineated and formatted for indented academic reading.`;

      if (requestedLanguage === 'English (UK)' || requestedLanguage === 'en-GB' || requestedLanguage.toLowerCase().includes('uk')) {
        systemInstruction += `\n5. UK ENGLISH (BRITISH ENGLISH) MANDATE: The user has selected UK English. You MUST respond strictly in British / UK English. Always use standard British spelling (e.g., 'colour', 'behaviour', 'analyse', 'paralyse', 'programme', 'centre', 'theatre', 'defence', 'licence' [noun], 'ageing', 'judgement', 'skilful', 'prioritise', 'organise', 'catalogue') and British terminology and idioms across the entirety of your response.`;
      } else if (requestedLanguage === 'English (US)' || requestedLanguage === 'en-US' || requestedLanguage.toLowerCase().includes('us')) {
        systemInstruction += `\n5. US ENGLISH (AMERICAN ENGLISH) MANDATE: The user has selected US English. You MUST respond in American / US English using standard American spelling (e.g., 'color', 'behavior', 'analyze', 'paralyze', 'program', 'center', 'theater', 'defense', 'license', 'aging', 'judgment', 'skillful', 'prioritize', 'organize', 'catalog') throughout.`;
      } else if (requestedLanguage) {
        systemInstruction += `\n5. LANGUAGE MANDATE: You MUST respond in **${requestedLanguage}**.`;
      }

      // Dynamic Reference Style & Real Online Links Mandate with Current Date
      systemInstruction += `\n6. CURRENT CALENDAR DATE & CITATION INTEGRITY (${requestedRefStyle.toUpperCase()} STYLE):
- CRITICAL REAL-TIME CALENDAR DATE: Today's exact current date is **${formattedCurrentDateHarvard}** (${formattedCurrentDateNumeric} / ${formattedCurrentDateUS}).
- The user has selected **${requestedRefStyle}** reference style (default: Harvard Style).
- In-text citations and the concluding References / Bibliography section MUST strictly adhere to the official rules of **${requestedRefStyle}**:
  * If Harvard Style: In-text citations formatted as (Author, Year) or (Author, Year, p. xx). References list alphabetized by author surname: Author, A.A. (Year) 'Title of article', *Journal Name*, Volume(Issue), pp. xx–xx. Available at: URL [Accessed ${formattedCurrentDateHarvard}].
  * If APA 7th Edition: In-text citations formatted as (Author, Year). References list: Author, A. A. (Year). Title of article. *Journal Title*, Volume(Issue), pages. https://doi.org/...
  * If MLA 9th Edition: In-text citations formatted as (Author page). Works Cited list alphabetized with container details and direct URLs/DOIs. Accessed ${formattedCurrentDateHarvard}.
  * If Chicago / Turabian: Author-Date format (Author Year, page) with complete References list.
  * If IEEE: Numbered in-text citations in square brackets like [1], [2] corresponding to a sequential numbered Reference list.
  * If Vancouver: Numbered citations in parentheses (1) or superscript corresponding to an indexed biomedical Reference list.
  * If Nature Style: Numbered superscript citations matching the bibliography list: Author, A. Title. *Journal* Vol, pages (Year).
- ACCESSED DATE ACCURACY MANDATE: For ANY citation that includes an "Accessed [Date]" or "Accessed: [Date]" notation, you MUST strictly use TODAY'S real current date: **${formattedCurrentDateHarvard}** (or **${formattedCurrentDateNumeric}**). NEVER invent an obsolete or past date (such as 2022, 2023, 2024, or 2025). Every single accessed date MUST tally with today's date (${formattedCurrentDateNumeric} / ${formattedCurrentDateHarvard}).

7. REAL AND VERIFIED ONLINE REFERENCES ONLY (NO FICTIONAL OR BROKEN LINKS):
- Every cited online source, journal paper, textbook, preprint, or digital resource MUST be real, verifiable, and accurately attributed. You are STRICTLY FORBIDDEN from inventing fictional authors, non-existent studies, or hallucinating false URLs.
- In the References list, online sources MUST provide REAL, CORRECT, AND RESOLVABLE hyperlinks.
- Use genuine, permanent DOIs where available (e.g., [https://doi.org/10.xxxx/...](https://doi.org/10.xxxx/...)), official PubMed IDs (e.g., [PubMed: 12345678](https://pubmed.ncbi.nlm.nih.gov/12345678/)), NCBI/NIH records ([https://www.ncbi.nlm.nih.gov/...](https://www.ncbi.nlm.nih.gov/...)), arXiv preprints ([https://arxiv.org/abs/...](https://arxiv.org/abs/...)), Nature/Science/Cell publishing domains, or authoritative educational databases (such as [https://en.wikipedia.org/wiki/...](https://en.wikipedia.org/wiki/...) or [https://www.britannica.com/...](https://www.britannica.com/...)).
- If you cite an established study whose exact deep article path or DOI string you cannot guarantee with 100% certainty, you MUST link directly to the verified PubMed database query link or Google Scholar query link for that exact paper title (e.g., [PubMed Search: Author Title](https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent('cell biology')}) or [Google Scholar Search](https://scholar.google.com/scholar?q=${encodeURIComponent('cell biology')})). NEVER invent a fake dead URL. Every link must be real, active, and lead to the authentic scientific record.`;

      systemInstruction += `\n8. SCIENTIFIC FORMULA LATEX MANDATE:
- EVERY scientific formula, chemical reaction equation, mathematical expression, thermodynamic equation, physical law, quantum mechanical equation, stoichiometry, and statistical formulation MUST be correctly written using standard LaTeX notation.
- Inline formulas MUST use standard inline LaTeX delimiters: $formula$ (e.g., $E = mc^2$, $\\Delta G^\\circ = -RT \\ln K_{eq}$, $PV = nRT$, $pH = -\\log_{10}[H^+]$, $\\lambda = \\frac{h}{p}$, $v = \\frac{V_{\\max}[S]}{K_m + [S]}$, $\\text{H}_2\\text{O}$, $\\mathrm{6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2}$).
- Display / Block formulas, major chemical equations, and numbered mathematical derivations MUST be enclosed in standalone display LaTeX delimiters:
  $$
  \\text{Formula / Derivation}
  $$
  (e.g.,
  $$ \\Delta G = \\Delta H - T\\Delta S $$
  $$ \\hat{H}\\Psi = E\\Psi $$
  $$ \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} $$
  $$ \\mathrm{CH_4(g) + 2O_2(g) \rightarrow CO_2(g) + 2H_2O(l)} \\quad \\Delta H^\\circ = -890.3\\text{ kJ/mol} $$
  )
- NEVER output plain ASCII or unformatted approximations for formulas (such as "E=mc^2", "PV=nRT", "delta G = delta H - T delta S", or "H2O -> H+ + OH-"). Always format every scientific formula with exact, clean LaTeX syntax.`;

      systemInstruction += `\n9. TEXTBOOK CHEMICAL SUBSTANCE & STRUCTURE MANDATE:
When the user asks to draw, label, present, or explain any chemical substance, molecule, or compound (e.g., Water H₂O, Methane CH₄, Carbon Dioxide CO₂, Ammonia NH₃, Ethanol C₂H₅OH, Benzene C₆H₆, Glucose C₆H₁₂O₆, etc.):
- You MUST represent the chemical formula and structure exactly the way they appear in authoritative standard chemistry textbooks, using LaTeX for chemical formulas and equations.
- Provide the exact Molecular Formula in LaTeX (e.g. $\\mathrm{CH_4}$, $\\mathrm{H_2O}$), IUPAC Chemical Name, Molar Mass, and Valence Electron count.
- Detail the 2D Structural/Lewis Formula (showing central atoms, single/double/triple covalent bonds, and non-bonding electron lone pairs).
- Detail the 3D VSEPR Geometry and 3D Wedge-and-Dash stereochemical projection (with solid in-plane lines, forward solid wedges, and backward dashed bonds).
- Explicitly state exact bond angles (e.g., 109.5° for tetrahedral methane, 104.5° for bent water with lone pair repulsion, 107.3° for trigonal pyramidal ammonia, 180° for linear CO₂), bond lengths (e.g., 1.09 Å for C—H, 0.96 Å for O—H), hybridization (sp³, sp², sp), and molecular polarity / dipole moments (e.g. μ = 1.85 D for polar water, μ = 0 D for non-polar methane).`;

      // Optional Anthropic Claude routing if API key configured
      if (process.env.ANTHROPIC_API_KEY && (engine === 'puter-claude-3-5' || engine === 'claude')) {
        try {
          const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 4096,
              system: systemInstruction,
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (anthropicRes.ok) {
            const data: any = await anthropicRes.json();
            const textContent = data.content?.map((c: any) => c.text || '').join('\n');
            if (textContent) {
              return res.json({ text: normalizeAccessedDatesServer(textContent) });
            }
          }
        } catch (anthropicErr) {
          console.warn("Anthropic API call failed, falling back to Gemini:", anthropicErr);
        }
      }

      // Optional xAI Grok routing if API key configured
      if (process.env.XAI_API_KEY && (engine === 'puter-grok' || engine === 'grok')) {
        try {
          const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "grok-2-latest",
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
              ],
              max_tokens: 4096
            })
          });
          if (grokRes.ok) {
            const data: any = await grokRes.json();
            const textContent = data.choices?.[0]?.message?.content;
            if (textContent) {
              return res.json({ text: normalizeAccessedDatesServer(textContent) });
            }
          }
        } catch (grokErr) {
          console.warn("xAI Grok API call failed, falling back to Gemini:", grokErr);
        }
      }

      // Optional Moonshot Kimi routing if API key configured
      if (process.env.MOONSHOT_API_KEY && (engine === 'puter-kimi' || engine === 'kimi')) {
        try {
          const kimiRes = await fetch("https://api.moonshot.cn/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.MOONSHOT_API_KEY}`
            },
            body: JSON.stringify({
              model: "moonshot-v1-8k",
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
              ],
              max_tokens: 4096
            })
          });
          if (kimiRes.ok) {
            const data: any = await kimiRes.json();
            const textContent = data.choices?.[0]?.message?.content;
            if (textContent) {
              return res.json({ text: normalizeAccessedDatesServer(textContent) });
            }
          }
        } catch (kimiErr) {
          console.warn("Moonshot Kimi API call failed, falling back to Gemini:", kimiErr);
        }
      }

      // Use OpenAI if available and quota is active
      if (canUseOpenAI()) {
        try {
          const openai = getOpenAIClient();
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            max_tokens: 4096
          });
          if (response.choices?.[0]?.message?.content) {
            return res.json({ text: normalizeAccessedDatesServer(response.choices[0].message.content) });
          }
        } catch (error: any) {
          handleOpenAIError(error);
          // Seamlessly fall through to Gemini below
        }
      }

      const ai = getAIClient();
      let text = "";
      try {
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
        let lastError: any = null;
        
        // Prepare contents array for Gemini
        const parts: any[] = [];
        
        // Add files if present
        if (req.body.files && Array.isArray(req.body.files)) {
          for (const file of req.body.files) {
             const match = file.match(/^data:(.+?);base64,(.+)$/);
             if (match) {
                parts.push({
                   inlineData: {
                     mimeType: match[1],
                     data: match[2]
                   }
                });
             } else {
                parts.push({ text: `File content:\n${file}` }); // For text files read as text
             }
          }
        }
        
        parts.push({ text: prompt });

        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: parts,
              config: {
                systemInstruction,
                maxOutputTokens: 8192
              }
            });
            if (response?.text) {
              text = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            continue;
          }
        }
        if (!text && lastError) throw lastError;
      } catch (err: any) {
        throw err;
      }

      res.json({ text: normalizeAccessedDatesServer(text) });
    } catch (error: any) {
      let errorMessage = error.message || "An unknown error occurred";
      if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = `API Quota Exceeded: ${errorMessage}`;
      } else if (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        errorMessage = "Service temporarily busy. Please retry in a moment.";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Dedicated Academic Research Topic Ideation & Literature Gap API
  app.post("/api/generate-topics", async (req, res) => {
    try {
      const { degreeLevel = 'masters', field = 'Computer Science & AI', interest = '', methodology = 'quantitative', geography = '' } = req.body;
      const ai = getAIClient();
      const systemPrompt = `You are a Distinguished Academic Dean, Doctoral Supervisor, and Chair of the University Postgraduate Research & Ethics Board.
Your mission is to generate 3 to 4 completely UNIQUE, NOVEL, DEFENDABLE, and SCHOLARLY academic research topics for ${degreeLevel.toUpperCase()} students in the field of "${field}".
Methodological Preference: ${methodology}.
Context/Geography: ${geography || 'Global & Cross-Institutional'}.
Seed/Interest: ${interest || 'Contemporary empirical anomalies, structural paradigms, and unresolved tensions'}.

CRITICAL MANDATES FOR 100% UNIQUENESS & NOVELTY:
- Avoid generic, overused, or cliché topics.
- Every single topic MUST possess a distinct Literature Gap (an unstudied intersection, a novel empirical context, a contemporary technological or regulatory paradigm, or a methodological advancement).
- For Undergraduate: rigorous, empirical, clearly bounded, executable in 6-12 months.
- For Master's: advanced theoretical grounding, sophisticated multivariate or qualitative methodology, publishable caliber.
- For Ph.D.: substantial original contribution to knowledge, addressing fundamental theoretical tension, novel conceptual synthesis, or new empirical discovery that will withstand rigorous thesis defense examination.

You MUST respond ONLY with a valid JSON object of the format:
{
  "topics": [
    {
      "id": "topic-gen-1",
      "title": "Authoritative Scholarly Title",
      "degreeLevel": "${degreeLevel}",
      "field": "${field}",
      "researchGap": "Exhaustive explanation of why this topic is 100% unique and what specific void in literature it addresses",
      "statementOfProblem": "Precise articulation of the academic problem, tension, or empirical contradiction",
      "backgroundSummary": "Historical and contemporary empirical background leading to this inquiry",
      "researchQuestions": ["Question 1", "Question 2", "Question 3"],
      "hypotheses": ["$H_0$: ...", "$H_1$: ..."],
      "theoreticalFramework": "Primary foundational theories and conceptual paradigms",
      "methodology": "Detailed research design, population, sample determination formula (e.g. Taro Yamane / Cochran in LaTeX), instruments, and statistical tests",
      "expectedContribution": "Theoretical, empirical, and policy contributions to knowledge",
      "defendabilityScore": 96,
      "defenseAnticipations": [
        {
          "question": "Probing question from defense examiner",
          "defenseStrategy": "Rigorous scholarly response and methodological justification"
        }
      ],
      "suggestedChaptersOverview": [
        "Chapter 1: Introduction & Problem Context",
        "Chapter 2: Literature Review & Theoretical Synthesis",
        "Chapter 3: Methodology & Analytical Design",
        "Chapter 4: Data Analysis & Empirical Findings",
        "Chapter 5: Summary, Conclusions & Policy Recommendations"
      ],
      "tags": ["Tag1", "Tag2"]
    }
  ]
}
No markdown fences, no conversational prose, only the valid JSON object.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let rawText = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: "Synthesize the 100% unique research topics according to the academic guidelines." }],
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              maxOutputTokens: 8192
            }
          });
          if (response?.text) {
            rawText = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!rawText) {
        return res.status(500).json({ error: "Failed to generate topics from AI model." });
      }

      const clean = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(clean);
      return res.json(parsed);
    } catch (error: any) {
      console.error("Topic generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate topics" });
    }
  });

  // Dedicated Multi-Page Thesis / Dissertation Chapter Drafting API
  app.post("/api/generate-thesis-chapter", async (req, res) => {
    try {
      const { 
        topic, 
        chapterNumber = 1, 
        degreeLevel = 'masters', 
        field = 'Academic Research', 
        referenceStyle = 'Harvard',
        customNotes = '' 
      } = req.body;

      const ai = getAIClient();
      const systemPrompt = `You are an Elite Academic Writing Specialist and Doctoral Thesis Supervisor.
You are tasked with drafting an EXHAUSTIVE, MULTI-PAGE, SCHOLARLY CHAPTER for a ${degreeLevel.toUpperCase()} dissertation.
Topic: "${topic}"
Discipline: "${field}"
Chapter Target: Chapter ${chapterNumber}
Citation Format: ${referenceStyle} (Mandatory in-text citations throughout every paragraph, e.g. (Author, Year) or (Author, Year, p. XX), with verified academic literature).
Additional Context / Focus: "${customNotes}".

CRITICAL RESEARCH INTEGRITY & SOURCE FIDELITY RULES:
- Adhere strictly to: RESEARCH → EVIDENCE → REASONING → VERIFICATION → WRITING → AUDIT.
- NEVER fabricate citations, authors, publication years, sample sizes, epsilon values, or statistical metrics.
- Explicitly distinguish LITERATURE FINDINGS from AUTHOR INTERPRETATIONS from RESEARCH HYPOTHESES.
- Distinguish DIRECT EVIDENCE from TRANSFERABLE / INDIRECT EVIDENCE (e.g. general machine learning benchmarks vs. higher education student retention).
- If exact numerical claims cannot be verified from reliable literature, qualify statement honestly or state that magnitudes require independent verification.
- Ban inflated academic buzzwords ("the theoretical gold standard", "fundamentally demonstrates", "paradigm-shifting"). Use measured, scholarly diction.
- Distinguish correlation/association from causal claims in observational settings.
- Explicitly justify theoretical frameworks and fairness metrics (what they measure, what they do NOT measure, assumptions, and trade-offs).

CRITICAL MULTI-PAGE, DEPTH & SUBHEADING ARCHITECTURE REQUIREMENTS:
- Produce an exhaustive, multi-page, publication-grade academic manuscript (aiming for 2,500+ to 4,000+ words).
- STRICT BAN ON SUBHEADING PROLIFERATION: You must NOT proliferate subheadings without substantial content or text under each subheading. Avoid fragmenting ideas across shallow micro-headings.
- EVERY SUBHEADING MUST CONTAIN MORE THAN 3 OR 4 PARAGRAPHS: Under every single subheading (e.g. ## 1.1, ## 1.2, ## 2.1, ## 2.2, etc.), provide at least 4 to 6+ robust, exhaustive, evidence-grounded paragraphs.
- Under NO circumstances should any subheading contain only 1, 2, or 3 brief paragraphs or bullet placeholders.
- DEMARCATED BY INDENTATIONS: Every paragraph must be separated by double line breaks and structured for academic reading with distinct paragraph indentations.
- Do NOT abbreviate or summarize. Thoroughly unpack historical backgrounds, conceptual models, empirical evidence, and methodological procedures.
- Format all mathematical equations, statistical formulas, and sample size calculations in LaTeX notation ($...$ inline, $$...$$ block).
- Ensure strict academic tone, passive scholarly voice, and structured section numbering (e.g. ## 1.1, ### 1.1.1).

For Chapter 1 (Introduction):
Must include:
- 1.1 Background to the Study (multi-page comprehensive historical, empirical, global, regional, and institutional grounding)
- 1.2 Statement of the Problem (exhaustive articulation of the specific tension/void)
- 1.3 Purpose and Objectives of the Study (General & Specific Objectives)
- 1.4 Research Questions (3-4 granular questions)
- 1.5 Research Hypotheses ($H_0$ and $H_1$)
- 1.6 Significance of the Study (Theoretical, Practical, Policy implications)
- 1.7 Scope and Delimitations of the Study
- 1.8 Operational Definition of Terms

For Chapter 2 (Literature Review):
Must include:
- 2.1 Conceptual Framework & Definitions
- 2.2 Theoretical Framework (in-depth examination of 2-3 foundational theories, their origins, assumptions, and link to this inquiry)
- 2.3 Empirical Literature Review (critical review of 8+ peer-reviewed studies across 2020-2026)
- 2.4 Critical Review and Research Gap Synthesis (explicit matrix contrasting past literature with this study)
- 2.5 Summary of Literature Review

For Chapter 3 (Research Methodology):
Must include:
- 3.1 Research Design & Philosophical Paradigm
- 3.2 Target Population & Setting
- 3.3 Sample Size Determination (Exact mathematical formula e.g. Taro Yamane or Cochran formula with calculated parameters)
- 3.4 Sampling Technique (Stratified, purposive, multi-stage)
- 3.5 Instrumentation & Data Collection Tools
- 3.6 Validity and Reliability of Instruments (Face validity, Cronbach's alpha formula and benchmark)
- 3.7 Method of Data Analysis (Descriptive & inferential statistical models, regression equation in LaTeX)
- 3.8 Ethical Considerations

For Chapter 4 (Results, Data Analysis & Discussion):
Must include:
- 4.1 Response Rate and Demographic Presentation (with structured Markdown tables)
- 4.2 Presentation and Analysis of Research Questions
- 4.3 Testing of Research Hypotheses (ANOVA, t-test, regression with test statistics and p-values)
- 4.4 In-Depth Discussion of Findings (comparing findings with Chapter 2 literature)

For Chapter 5 (Summary, Conclusion & Recommendations):
Must include:
- 5.1 Summary of Major Findings
- 5.2 Scholarly Conclusion
- 5.3 Concrete Policy & Practical Recommendations
- 5.4 Contribution to Knowledge
- 5.5 Limitations & Suggestions for Further Research

Include a comprehensive References list at the end formatted strictly in ${referenceStyle} style.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let chapterText = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: `Draft the comprehensive, multi-page Chapter ${chapterNumber} for the dissertation on "${topic}".` }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 8192
            }
          });
          if (response?.text) {
            chapterText = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!chapterText) {
        return res.status(500).json({ error: "Failed to generate chapter content from AI." });
      }

      return res.json({ 
        chapterNumber,
        content: normalizeAccessedDatesServer(chapterText),
        wordCount: chapterText.split(/\s+/).filter(Boolean).length
      });
    } catch (error: any) {
      console.error("Chapter generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate chapter" });
    }
  });

  // Dedicated Subheading Academic Expansion API
  app.post("/api/expand-subheading", async (req, res) => {
    try {
      const {
        topic,
        chapterTitle,
        subheading,
        existingContext = '',
        expansionDepth = 'multi-page-deep',
        referenceStyle = 'Harvard',
        customNotes = ''
      } = req.body;

      const ai = getAIClient();
      const depthWordCount = expansionDepth === 'exhaustive' ? '1,500 - 2,500 words across 4-6 pages' :
        expansionDepth === 'multi-page-deep' ? '1,000 - 1,800 words across 3-4 pages' : '600 - 1,000 words across 2 pages';

      const systemPrompt = `You are a Senior University Thesis Supervisor and World-Class Academic Researcher.
You are tasked with expanding the specific academic subheading: "${subheading}" within the thesis chapter: "${chapterTitle}".
Overall Thesis Topic: "${topic}".
Reference Style: ${referenceStyle} (Mandatory rigorous in-text citations: e.g., (Author, Year) or (Author, Year, p. XX)).
Target Depth: ${depthWordCount}.
Custom Focus / Instructions: "${customNotes}".

CRITICAL SCHOLARLY EXTENSION REQUIREMENTS:
1. STRICT BAN ON SUBHEADING PROLIFERATION: Do not fragment this section into shallow sub-headers. You must maintain cohesive, deep, and exhaustive prose under this subheading without scattering it across micro-subheadings.
2. EVERY SUBHEADING MUST CONTAIN MORE THAN 3 OR 4 PARAGRAPHS: Under this specific subheading ("${subheading}"), produce at least 4 to 8 rich, expansive, literature-grounded paragraphs. Under no circumstances produce only 1, 2, or 3 brief paragraphs.
3. DEMARCATED BY INDENTATIONS: Separate every paragraph clearly with double line breaks structured for indented academic reading.
4. Deeply unpack theoretical foundations, biochemical/empirical/computational mechanisms, critical debates, experimental data, and contextual applications.
5. Every single mathematical formula, chemical reaction, statistical model, or equation MUST be formatted in clean LaTeX ($...$ inline, $$...$$ block).
6. If relevant (especially for Literature Review or Methodology), include a structured Markdown comparison table (e.g. Author, Year, Focus, Methodology, Key Findings, Critical Gaps).
7. Ground all discussions in real, contemporary scholarly literature (2020-2026).
8. Return clean Markdown starting directly with the heading:
   \`### ${subheading}\`
   Followed by the rich, multi-page scholarly expansion.`;

      const promptUser = `Here is the surrounding chapter context:
---
${existingContext.slice(0, 3000)}
---
Now thoroughly expand and extend the subheading "${subheading}" with multi-page scholarly depth, extensive citations, and LaTeX formulas.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let expandedText = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: promptUser }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 8192
            }
          });
          if (response?.text) {
            expandedText = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!expandedText) {
        return res.status(500).json({ error: "Failed to expand subheading from AI." });
      }

      return res.json({
        subheading,
        content: normalizeAccessedDatesServer(expandedText),
        wordCount: expandedText.split(/\s+/).filter(Boolean).length
      });
    } catch (error: any) {
      console.error("Subheading expansion error:", error);
      res.status(500).json({ error: error.message || "Failed to expand subheading" });
    }
  });

  // Dedicated Sentence & Paragraph Extension API
  app.post("/api/extend-sentence-paragraph", async (req, res) => {
    try {
      const {
        incompleteText,
        context = '',
        mode = 'extend-paragraph',
        field = 'Higher Education & Differential Privacy',
        referenceStyle = 'Harvard'
      } = req.body;

      if (!incompleteText || typeof incompleteText !== 'string') {
        return res.status(400).json({ error: "Missing or invalid incompleteText" });
      }

      const ai = getAIClient();
      const modeInstruction = mode === 'complete-sentence'
        ? 'Task: Seamlessly complete the trailing cut-off sentence to its natural grammatical and empirical conclusion. Finish this specific sentence only.'
        : mode === 'extend-paragraph'
        ? 'Task: Complete the trailing cut-off sentence AND continue writing to develop a full, rich academic paragraph (150-250 words, 4-6 sentences) with deep empirical reasoning and scholarly evidence.'
        : 'Task: Complete the trailing cut-off sentence AND write 2-3 substantive, indented academic paragraphs (350-500 words total) that thoroughly unpack the theoretical, empirical, and institutional implications.';

      const systemPrompt = `You are a Senior Academic Thesis Co-Author and Research Editor in the field of ${field}.
You specialize in fixing abruptly truncated, cut-off, or incomplete academic sentences and paragraphs.

CORE MANDATES:
1. SEAMLESS GRAMMATICAL CONTINUITY: Read the exact words leading up to the cut-off point. Ensure the continuation fits the existing sentence structure, tense, vocabulary, and intellectual flow without jarring transitions.
2. ZERO DUPLICATE WORDS: Do NOT repeat words that appear right before the cut-off. Ensure the continuation joins seamlessly to the cut-off point.
3. CITATION & FORMULA FIDELITY: If citing literature, use ${referenceStyle} style with authentic peer-reviewed conventions. Format all mathematical and algorithmic expressions in standard LaTeX ($...$ inline, $$...$$ block).
4. RESEARCH RELIABILITY: Distinguish empirical literature findings from hypotheses, and maintain restrained scholarly tone.
${modeInstruction}

OUTPUT FORMAT (JSON ONLY):
Return a single JSON object with these keys:
{
  "completedSentence": "The complete sentence starting from its beginning in the input and concluding properly.",
  "continuationOnly": "ONLY the exact characters/words to append directly after the cut-off point.",
  "fullExtendedBlock": "The complete paragraph block including the resolved sentence and any expanded sentences.",
  "wordCount": 150
}`;

      const promptUser = `Surrounding Chapter Context (for domain & tone):
---
${context ? context.slice(-2000) : 'Standard graduate dissertation manuscript.'}
---

Incomplete / Abruptly Truncated Text:
---
${incompleteText}
---

Provide the seamless academic extension in JSON format.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let rawResponse = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: promptUser }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 4096,
              responseMimeType: "application/json"
            }
          });
          if (response?.text) {
            rawResponse = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!rawResponse) {
        return res.status(500).json({ error: "Failed to generate extension from AI." });
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch (e) {
        // Fallback regex extraction if markdown json wrapper was returned
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = {
            completedSentence: rawResponse.trim(),
            continuationOnly: rawResponse.trim(),
            fullExtendedBlock: `${incompleteText.replace(/(\.{3,}|…|\s+)+$/, '')} ${rawResponse.trim()}`,
            wordCount: rawResponse.split(/\s+/).filter(Boolean).length
          };
        }
      }

      return res.json({
        success: true,
        completedSentence: parsed.completedSentence || "",
        continuationOnly: parsed.continuationOnly || "",
        fullExtendedBlock: normalizeAccessedDatesServer(parsed.fullExtendedBlock || ""),
        wordCount: parsed.wordCount || parsed.fullExtendedBlock?.split(/\s+/).filter(Boolean).length || 0
      });
    } catch (error: any) {
      console.error("Sentence/paragraph extension error:", error);
      res.status(500).json({ error: error.message || "Failed to extend sentence/paragraph" });
    }
  });

  // Dedicated Cross-Chapter Table of Contents Synthesizer API
  app.post("/api/generate-table-of-contents", async (req, res) => {
    try {
      const { topic, pages = [], degreeLevel = 'masters' } = req.body;

      const ai = getAIClient();
      const pagesSummary = pages.map((p: any, idx: number) => {
        const headings = (p.content || '').match(/^#{1,3}\s+(.+)$/gm) || [];
        const words = (p.content || '').split(/\s+/).filter(Boolean).length;
        return `Page ${idx + 1}: Title="${p.title}", Words=${words}\nHeadings:\n${headings.slice(0, 10).join('\n')}`;
      }).join('\n\n---\n\n');

      const systemPrompt = `You are an Academic Registrar and Dissertation Formatting Authority.
You are tasked with generating an Authoritative, Formal TABLE OF CONTENTS for a ${degreeLevel.toUpperCase()} dissertation on:
Topic: "${topic}".

Generate a complete, formal academic Table of Contents in Markdown.
Must include:
1. Preliminary Pages (in small Roman numerals: i, ii, iii, iv, v, vi, vii):
   - Title Page ............................................................................ i
   - Declaration ........................................................................... ii
   - Certification / Approval ............................................................. iii
   - Dedication ............................................................................ iv
   - Acknowledgements ...................................................................... v
   - Abstract .............................................................................. vi
   - Table of Contents .................................................................... vii
   - List of Tables ....................................................................... viii
   - List of Figures ....................................................................... ix
2. Chapters with their respective subheadings (1.1, 1.2, 2.1, 2.2, 3.1, 4.1, 5.1...) mapped accurately to computed Arabic page numbers (1, 2, 3...) based on the provided project pages and word counts.
3. Concluding Pages:
   - References / Bibliography ............................................................ [computed page]
   - Appendix A: Survey Instrument / Research Protocol .................................... [computed page]
   - Appendix B: Statistical Models & Formulations ........................................ [computed page]

Format with classic academic dot leaders (\`.....\`) aligning right. Use clean, pristine Markdown.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let tocText = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: `Generate the formal Table of Contents based on this project structure:\n\n${pagesSummary}` }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 4096
            }
          });
          if (response?.text) {
            tocText = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!tocText) {
        return res.status(500).json({ error: "Failed to generate Table of Contents" });
      }

      return res.json({ tableOfContents: tocText });
    } catch (error: any) {
      console.error("TOC generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate Table of Contents" });
    }
  });

  // Dedicated Master Reference List Synthesizer API from In-Text Citations
  app.post("/api/synthesize-master-references", async (req, res) => {
    try {
      const { topic, pages = [], referenceStyle = 'Harvard' } = req.body;

      // Extract all text and in-text citation patterns
      let fullCorpus = '';
      const inTextCitationsSet = new Set<string>();

      for (const p of pages) {
        const text = p.content || '';
        fullCorpus += `\n\n=== ${p.title} ===\n\n` + text;

        // Match parenthetical citations like (Smith, 2023), (Johnson & Lee, 2021), (World Bank, 2024), etc.
        const parentheticalMatches = text.match(/\([A-Z][a-zA-Z\s&.,-]+(?:,\s*|\s+)(?:19\d{2}|20\d{2})[^\)]*\)/g) || [];
        parentheticalMatches.forEach((m: string) => inTextCitationsSet.add(m));

        // Match bracketed citations like [1], [2], [1-3]
        const bracketMatches = text.match(/\[\d+(?:[–-]\d+)?\]/g) || [];
        bracketMatches.forEach((m: string) => inTextCitationsSet.add(m));
      }

      const citationsList = Array.from(inTextCitationsSet).slice(0, 80).join('\n');

      const ai = getAIClient();
      const systemPrompt = `You are a Chief Academic Bibliographer and Citation Integrity Specialist.
Your mission is to compile an EXHAUSTIVE, VERIFIED, ALPHABETICALLY ORGANIZED MASTER REFERENCES & BIBLIOGRAPHY LIST for the research dissertation:
Topic: "${topic}".
Citation Standard: **${referenceStyle}**.

INPUT CITATIONS SCANNED ACROSS ALL CHAPTERS:
${citationsList}

MANDATORY RULES:
1. Every reference MUST adhere strictly to the rules of ${referenceStyle}:
   - Alphabetical order by primary author's last name (A to Z) or numeric order if IEEE/Vancouver.
   - Authors (Surname, Initials), Publication Year, Article Title in quotes or italics, Journal/Book in italics, Volume(Issue), Pages, and valid DOI/URL links.
   - For web/database citations, ensure Accessed date reflects today's date (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}).
2. NEVER output fictional or placeholder references. Ensure comprehensive, peer-reviewed journal entries matching the exact topics, theories, and empirical models referenced across the thesis chapters.
3. Provide at least 25-40 full bibliographic references covering all cited authors, seminal theoretical works, empirical studies, and institutional reports.
4. Output clean Markdown starting with:
   \`# REFERENCES & BIBLIOGRAPHY\`
   \`*Compiled in accordance with ${referenceStyle} Editorial Standards*\``;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let refText = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: `Synthesize the Master References list based on the extracted citations and research context:\n\n${fullCorpus.slice(0, 15000)}` }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 8192
            }
          });
          if (response?.text) {
            refText = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!refText) {
        return res.status(500).json({ error: "Failed to synthesize reference list" });
      }

      return res.json({ references: normalizeAccessedDatesServer(refText) });
    } catch (error: any) {
      console.error("Reference synthesis error:", error);
      res.status(500).json({ error: error.message || "Failed to synthesize reference list" });
    }
  });

  // Dedicated Full Thesis Consolidation & Unification API
  app.post("/api/consolidate-thesis", async (req, res) => {
    try {
      const { topic, pages = [], degreeLevel = 'masters', referenceStyle = 'Harvard' } = req.body;

      const ai = getAIClient();
      const chaptersText = pages.map((p: any) => `## ${p.title}\n\n${p.content}`).join('\n\n---\n\n');

      const systemPrompt = `You are a Distinguished Dean of Graduate Studies and Academic Review Board Chair.
You are tasked with reviewing, harmonizing, and organizing an entire ${degreeLevel.toUpperCase()} dissertation into ONE cohesive, unified master manuscript.
Topic: "${topic}".
Citation Format: ${referenceStyle}.

Review the multi-chapter content, ensure smooth transitional linkages between Chapter 1 (Introduction), Chapter 2 (Literature Review), Chapter 3 (Methodology), Chapter 4 (Results), Chapter 5 (Conclusions), and Appendices.
Eliminate duplicate titles or confusing repetitions.
Format with clean academic hierarchy, unified LaTeX mathematical equations, and consistent citation conventions.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let consolidated = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [{ text: `Synthesize and harmonize this multi-chapter dissertation:\n\n${chaptersText.slice(0, 20000)}` }],
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 8192
            }
          });
          if (response?.text) {
            consolidated = response.text;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!consolidated) {
        return res.status(500).json({ error: "Failed to consolidate thesis" });
      }

      return res.json({ consolidatedText: normalizeAccessedDatesServer(consolidated) });
    } catch (error: any) {
      console.error("Thesis consolidation error:", error);
      res.status(500).json({ error: error.message || "Failed to consolidate thesis" });
    }
  });

  // ==========================================================================
  // ACADEMIC RESEARCH INTEGRITY, EVIDENCE MATRIX & AUDIT API ENDPOINTS
  // Implements: RESEARCH → EVIDENCE → REASONING → VERIFICATION → WRITING → AUDIT
  // ==========================================================================

  // 1. Claim Extraction & Classification Audit API
  app.post("/api/audit-claims", async (req, res) => {
    try {
      const { text = "", domainContext = "Higher Education" } = req.body;
      const claims = extractClaimsFromText(text, domainContext);
      const metrics = calculateIntegrityMetrics(claims, CANONICAL_RESEARCH_SOURCES);
      return res.json({
        claims,
        metrics,
        totalClaims: claims.length,
        verifiedCount: claims.filter(c => c.verification_status === 'verified').length,
        qualifiedCount: claims.filter(c => c.verification_status === 'qualified' || c.verification_status === 'indirect').length,
        unsupportedCount: claims.filter(c => c.verification_status === 'unsupported').length
      });
    } catch (error: any) {
      console.error("Claim audit error:", error);
      res.status(500).json({ error: error.message || "Failed to audit claims" });
    }
  });

  // 2. Comprehensive Pre-Submission Academic Integrity Audit API (17 Checks)
  app.post("/api/run-integrity-audit", async (req, res) => {
    try {
      const { title = "Research Dissertation", content = "" } = req.body;
      const auditResult = runPreSubmissionAudit(title, content, CANONICAL_RESEARCH_SOURCES);
      return res.json(auditResult);
    } catch (error: any) {
      console.error("Integrity audit error:", error);
      res.status(500).json({ error: error.message || "Failed to run pre-submission audit" });
    }
  });

  // 3. Evidence Matrix Retrieval API
  app.get("/api/get-evidence-matrix", async (req, res) => {
    try {
      const matrixRows = buildEvidenceMatrixRows(CANONICAL_RESEARCH_SOURCES);
      return res.json({
        sources: CANONICAL_RESEARCH_SOURCES,
        matrixRows,
        totalSources: CANONICAL_RESEARCH_SOURCES.length,
        primaryCount: CANONICAL_RESEARCH_SOURCES.filter(s => s.primarySource).length,
        peerReviewedCount: CANONICAL_RESEARCH_SOURCES.filter(s => s.peerReviewed).length
      });
    } catch (error: any) {
      console.error("Evidence matrix error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve evidence matrix" });
    }
  });

  // 4. Apply Academic Integrity Qualifications & De-Inflation API
  app.post("/api/apply-integrity-fixes", async (req, res) => {
    try {
      const { text = "" } = req.body;
      const { sanitizedText, fixesAppliedCount } = applyIntegrityQualificationsToText(text);
      return res.json({ sanitizedText, fixesAppliedCount });
    } catch (error: any) {
      console.error("Apply integrity fixes error:", error);
      res.status(500).json({ error: error.message || "Failed to apply integrity fixes" });
    }
  });

  // 5. Benchmark Research Project Generator API
  app.get("/api/benchmark-research-project", async (req, res) => {
    try {
      const project = generateBenchmarkResearchProject();
      return res.json({ project });
    } catch (error: any) {
      console.error("Benchmark project error:", error);
      res.status(500).json({ error: error.message || "Failed to generate benchmark research project" });
    }
  });

  // 6. Automated Test Suite Execution API
  app.get("/api/run-integrity-test-suite", async (req, res) => {
    try {
      const testReport = runAllIntegrityTests();
      return res.json(testReport);
    } catch (error: any) {
      console.error("Test suite error:", error);
      res.status(500).json({ error: error.message || "Failed to run automated test suite" });
    }
  });

  // 7. Auto-Resolve Single Pre-Submission Audit Issue API
  app.post("/api/resolve-audit-issue", async (req, res) => {
    try {
      const { checkId, title = "Academic Dissertation", content = "", pages } = req.body;
      const result = resolveSingleAuditIssue(checkId, title, content, pages);
      const updatedAudit = runPreSubmissionAudit(result.resolvedTitle, result.resolvedContent, CANONICAL_RESEARCH_SOURCES);
      return res.json({
        ...result,
        audit: updatedAudit
      });
    } catch (error: any) {
      console.error("Resolve audit issue error:", error);
      res.status(500).json({ error: error.message || "Failed to resolve audit issue" });
    }
  });

  // 8. Auto-Resolve All Pre-Submission Audit Issues API
  app.post("/api/resolve-all-audit-issues", async (req, res) => {
    try {
      const { title = "Academic Dissertation", content = "", pages } = req.body;
      const result = resolveAllAuditIssues(title, content, pages);
      const updatedAudit = runPreSubmissionAudit(result.resolvedTitle, result.resolvedContent, CANONICAL_RESEARCH_SOURCES);
      return res.json({
        ...result,
        audit: updatedAudit
      });
    } catch (error: any) {
      console.error("Resolve all audit issues error:", error);
      res.status(500).json({ error: error.message || "Failed to resolve all audit issues" });
    }
  });

  // Dedicated PowerPoint / Slide Deck Generation API
  app.post("/api/presentation-generate", async (req, res) => {
    try {
      const { topic, docText, targetAudience, slideCount, theme, language, fileData } = req.body;
      const requestedSlideCount = Math.max(3, Math.min(15, parseInt(slideCount) || 6));
      const requestedTheme = theme || "royal-purple";
      const requestedAudience = targetAudience || "Academic & Research";
      const requestedLang = language || "English (US)";

      const systemPrompt = `You are an elite Presentation Architect and PowerPoint Specialist.
Your task is to transform the provided document or topic into a highly structured, professional, executive-ready presentation slide deck.
CRITICAL MANDATE: You MUST output ONLY a valid, parseable JSON object adhering strictly to the schema below. Never add any markdown fences, conversational commentary, or trailing text.

JSON Schema:
{
  "title": "Clear, engaging presentation title",
  "description": "Executive summary of the slide deck (1-2 sentences)",
  "theme": "${requestedTheme}",
  "slides": [
    {
      "id": "s1",
      "title": "Title of the slide",
      "subtitle": "Optional contextual subtitle",
      "layout": "title" | "bullet-points" | "two-column" | "stat-highlight" | "conclusion",
      "bullets": ["Insight point 1", "Insight point 2", "Insight point 3"],
      "statValue": "e.g. 94.8% or 4.2x (only when layout is stat-highlight)",
      "statLabel": "Metric description or impact",
      "leftContent": ["Left column point 1", "Left column point 2"],
      "rightContent": ["Right column point 1", "Right column point 2"],
      "notes": "Comprehensive presenter speaking notes explaining this slide in depth",
      "accentColor": "#6366F1"
    }
  ]
}`;

      const userPrompt = `Generate exactly ${requestedSlideCount} slides for:
Topic: ${topic || 'Comprehensive Document Synthesis'}
Target Audience: ${requestedAudience}
Language: ${requestedLang}

${docText ? `DOCUMENT CONTEXT / EXTRACTED CONTENT:\n${docText.slice(0, 15000)}` : ''}`;

      // 1. Try OpenAI if configured and quota is active
      if (canUseOpenAI()) {
        try {
          const openai = getOpenAIClient();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          });
          const content = completion.choices?.[0]?.message?.content;
          if (content) {
            return res.json({ json: content });
          }
        } catch (openaiErr: any) {
          handleOpenAIError(openaiErr);
          // Seamlessly proceed to Gemini below
        }
      }

      // 2. Try Gemini with JSON response mime type
      try {
        const ai = getAIClient();
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
        let lastErr: any = null;

        const parts: any[] = [];
        if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
          const match = fileData.match(/^data:(.+?);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
        parts.push({ text: userPrompt });

        for (const model of candidateModels) {
          try {
            const result = await ai.models.generateContent({
              model,
              contents: parts,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
              }
            });
            if (result?.text) {
              return res.json({ json: result.text });
            }
          } catch (modelErr) {
            lastErr = modelErr;
            continue;
          }
        }
        if (lastErr) throw lastErr;
      } catch (geminiErr: any) {
        console.warn("Gemini presentation generation error:", geminiErr);
        return res.status(500).json({ error: geminiErr.message || "Failed to generate presentation via AI backend." });
      }

      res.status(500).json({ error: "Unable to generate presentation" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal presentation generation error" });
    }
  });

  // Export 100% Microsoft Office & Browser Compliant OpenXML PPTX File
  app.post("/api/export-pptx", async (req, res) => {
    try {
      const { deck } = req.body;
      if (!deck || typeof deck !== "object") {
        return res.status(400).json({ error: "Presentation deck data is required." });
      }

      const pres = new pptxgen();
      pres.layout = "LAYOUT_16x9";
      pres.author = "NEXORA Academic AI Studio";
      pres.company = "NEXORA Scientific";
      pres.title = deck.title || "PowerPoint Presentation";
      pres.subject = deck.description || "Synthesized Presentation Deck";

      const cleanColor = (hex: string | undefined, fallback = "FFFFFF"): string => {
        if (!hex) return fallback;
        const cleaned = hex.replace(/^#/, "").trim();
        return cleaned.length === 6 ? cleaned : fallback;
      };

      const themeColors: Record<string, { bg: string; title: string; text: string; accent: string }> = {
        "royal-purple": { bg: "1E1B4B", title: "FDE047", text: "E0E7FF", accent: "C084FC" },
        "academic-navy": { bg: "0F172A", title: "38BDF8", text: "E2E8F0", accent: "818CF8" },
        "emerald-forest": { bg: "064E3B", title: "A7F3D0", text: "ECFDF5", accent: "34D399" },
        "sunset-amber": { bg: "451A03", title: "FDE68A", text: "FFFBEB", accent: "F59E0B" },
        "slate-minimal": { bg: "F8FAFC", title: "0F172A", text: "334155", accent: "6366F1" },
        "cyber-dark": { bg: "090D16", title: "38BDF8", text: "E2E8F0", accent: "A855F7" },
        "burgundy-crimson": { bg: "350A10", title: "FECDD3", text: "FFF1F2", accent: "FB7185" },
        "ocean-cyan": { bg: "032B44", title: "67E8F9", text: "E0F2FE", accent: "38BDF8" },
        "warm-ivory": { bg: "FFFDF5", title: "292524", text: "44403C", accent: "D97706" },
        "clean-white": { bg: "FFFFFF", title: "0F172A", text: "334155", accent: "2563EB" }
      };

      const c = themeColors[deck.theme] || themeColors["royal-purple"];
      const slides = Array.isArray(deck.slides) ? deck.slides : [];

      slides.forEach((slideData: any, idx: number) => {
        const slide = pres.addSlide();

        const effectiveBg = slideData.customBg || deck.customBg || c.bg;
        const effectiveFont = slideData.customFontFamily || deck.fontFamily || "Calibri";
        const effectiveTitleSize = Number(slideData.customTitleFontSize || deck.titleFontSize || 26);
        const effectiveBodySize = Number(slideData.customBodyFontSize || deck.bodyFontSize || 14);
        const effectiveTitleColor = slideData.customTitleColor || deck.titleColor || c.title;
        const effectiveTextColor = slideData.customTextColor || deck.textColor || c.text;
        const effectiveAccentColor = slideData.customAccentColor || deck.accentColor || c.accent;

        slide.background = { color: cleanColor(effectiveBg) };

        // Slide Header Title
        slide.addText(slideData.title || `Slide ${idx + 1}`, {
          x: 0.8,
          y: 0.5,
          w: 11.7,
          h: 0.85,
          fontSize: effectiveTitleSize,
          bold: true,
          color: cleanColor(effectiveTitleColor),
          fontFace: effectiveFont,
          valign: "top"
        });

        // Subtitle
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: 0.8,
            y: 1.35,
            w: 11.7,
            h: 0.45,
            fontSize: Math.max(11, effectiveBodySize - 1),
            italic: true,
            color: cleanColor(effectiveAccentColor),
            fontFace: effectiveFont,
            valign: "top"
          });
        }

        // Slide Content Body
        if (slideData.layout === "two-column") {
          const leftItems = (slideData.leftContent || []).filter(Boolean).map((text: string) => ({
            text: String(text).replace(/^[•\-\*]\s*/, ""),
            options: {
              bullet: true,
              fontSize: effectiveBodySize,
              color: cleanColor(effectiveTextColor),
              paraSpaceAfter: 8,
              fontFace: effectiveFont
            }
          }));
          const rightItems = (slideData.rightContent || []).filter(Boolean).map((text: string) => ({
            text: String(text).replace(/^[•\-\*]\s*/, ""),
            options: {
              bullet: true,
              fontSize: effectiveBodySize,
              color: cleanColor(effectiveTextColor),
              paraSpaceAfter: 8,
              fontFace: effectiveFont
            }
          }));

          if (leftItems.length > 0) {
            slide.addText(leftItems, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, valign: "top" });
          }
          if (rightItems.length > 0) {
            slide.addText(rightItems, { x: 6.8, y: 2.0, w: 5.6, h: 4.5, valign: "top" });
          }
        } else if (slideData.layout === "stat-highlight") {
          if (slideData.statValue) {
            slide.addText(String(slideData.statValue), {
              x: 0.8,
              y: 2.2,
              w: 4.8,
              h: 1.4,
              fontSize: Math.max(36, effectiveTitleSize + 16),
              bold: true,
              color: cleanColor(effectiveTitleColor),
              fontFace: effectiveFont,
              align: "center",
              valign: "middle"
            });
            if (slideData.statLabel) {
              slide.addText(String(slideData.statLabel), {
                x: 0.8,
                y: 3.7,
                w: 4.8,
                h: 1.0,
                fontSize: Math.max(11, effectiveBodySize - 2),
                italic: true,
                color: cleanColor(effectiveAccentColor),
                fontFace: effectiveFont,
                align: "center",
                valign: "top"
              });
            }
          }
          const bullets = (slideData.bullets || []).filter(Boolean).map((text: string) => ({
            text: String(text).replace(/^[•\-\*]\s*/, ""),
            options: {
              bullet: true,
              fontSize: effectiveBodySize,
              color: cleanColor(effectiveTextColor),
              paraSpaceAfter: 8,
              fontFace: effectiveFont
            }
          }));
          if (bullets.length > 0) {
            slide.addText(bullets, { x: 6.0, y: 2.0, w: 6.5, h: 4.5, valign: "top" });
          }
        } else {
          const bullets = (slideData.bullets || []).filter(Boolean).map((text: string) => ({
            text: String(text).replace(/^[•\-\*]\s*/, ""),
            options: {
              bullet: true,
              fontSize: effectiveBodySize,
              color: cleanColor(effectiveTextColor),
              paraSpaceAfter: 10,
              fontFace: effectiveFont
            }
          }));
          if (bullets.length > 0) {
            slide.addText(bullets, { x: 0.8, y: 2.0, w: 11.7, h: 4.5, valign: "top" });
          }
        }

        // Slide Footer
        slide.addText(`${deck.title || "Presentation"} | NEXORA Studio`, {
          x: 0.8,
          y: 6.8,
          w: 11.7,
          h: 0.4,
          fontSize: 10,
          color: cleanColor(c.accent),
          fontFace: "Calibri"
        });
      });

      const rawBuffer = await pres.write({ outputType: "nodebuffer" }) as Buffer;

      // XML Compliance Sanitization with JSZip:
      // Replace name="" with valid non-empty names across all XML files to strictly satisfy OpenXML schema validators in Microsoft PowerPoint
      const zip = await JSZip.loadAsync(rawBuffer);
      for (const [filename, file] of Object.entries(zip.files)) {
        if (filename.endsWith(".xml") && !file.dir) {
          const xml = await file.async("string");
          if (xml.includes("name=\"\"")) {
            const fixedXml = xml.replace(/name=""/g, `name="Object"`);
            zip.file(filename, fixedXml);
          }
        }
      }

      const cleanBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const sanitizedFilename = (deck.title || "presentation")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase()
        .slice(0, 40) || "presentation";

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFilename}.pptx"`);
      res.setHeader("Content-Length", cleanBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(cleanBuffer);
    } catch (err: any) {
      console.error("PPTX export endpoint error:", err);
      res.status(500).json({ error: err.message || "Failed to compile PowerPoint file." });
    }
  });

  // Scientific Diagram & Label Generator API with 3D/2D & Black-and-White Paper Support
  app.post("/api/diagram-generate", async (req, res) => {
    try {
      const { prompt, requestedDimension, language } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "A scientific topic prompt is required." });
      }

      const promptLower = prompt.toLowerCase();
      const hasExplicit3D = Boolean(requestedDimension === '3d' || /\b(3d|three[- ]dimensional|3-d|ball[- ]and[- ]stick|volumetric|spatial)\b/i.test(prompt));
      const hasExplicit2D = Boolean(requestedDimension === '2d' || /\b(2d|two[- ]dimensional|2-d|flat|cross[- ]section|schematic)\b/i.test(prompt));
      const hasExplicitPaper = Boolean(requestedDimension === 'paper' || /\b(paper|black[- ]and[- ]white|b&w|notebook|handwritten)\b/i.test(prompt));

      const isChemical = /(hydrocarbon|alkane|methane|ethane|propane|butane|benzene|water|carbon|dioxide|ammonia|molecule|compound|chemical|chemistry|h2o|ch4|co2|nh3|c2h6|c3h8|c2h5oh|ethanol|glucose|acid|formula|equation|reaction|covalent|ionic|orbital|lewis|vsepr|bond)/i.test(promptLower);
      const isBiological = /(cell|organ|heart|brain|kidney|nephron|liver|lung|eye|skin|digestive|respiratory|circulatory|nervous|immune|mitochondria|chloroplast|nucleus|ribosome|bacteria|virus|plant|animal|tissue|neuron|synapse|dna|rna|biology|anatomy|physiology)/i.test(promptLower);
      const isPhysical = /(atom|bohr|rutherford|electron|proton|neutron|physics|circuit|lens|optics|wave|field|magnetic|gravity|solar|planet|star|galaxy|telescope|quantum|pendulum)/i.test(promptLower);

      let domain: 'biological' | 'chemical' | 'physical' | 'general' = 'general';
      if (isChemical) domain = 'chemical';
      else if (isBiological) domain = 'biological';
      else if (isPhysical) domain = 'physical';

      let renderMode: '3d' | '2d' | 'paper' = '3d';
      if (hasExplicit3D) {
        renderMode = '3d';
      } else if (hasExplicit2D) {
        renderMode = '2d';
      } else if (hasExplicitPaper) {
        renderMode = 'paper';
      } else {
        // Default Rule:
        // Scientific formulas & chemical compounds are formatted on black-and-white paper.
        // Biological cells, organs, and systems are formatted in 3D/2D form in multiple colours.
        if (domain === 'chemical') {
          renderMode = 'paper';
        } else {
          renderMode = '3d';
        }
      }

      const systemPrompt = `You are a World-Renowned Scientific Illustrator and Medical Textbook Author specializing in High-Precision Anatomical and Scientific Visuals.
The user requested: "${prompt}".

CRITICAL SCIENTIFIC ACCURACY & VERIFICATION DIRECTIVE:
1. NEVER equate visual polish or aesthetic gradients with scientific correctness.
2. DO NOT place anatomical labels on simplified, generic, or hallucinated shapes.
3. Every single pin coordinate (x, y) MUST point with pinpoint precision to the actual structural/anatomical part it describes in your vector diagram or standard cross-section.
4. You must depict biological, anatomical, and scientific structures strictly according to authoritative academic reference standards (such as Campbell Biology, Gray's Anatomy 42nd Ed, Guyton & Hall Physiology, Lehninger Biochemistry, and OpenStax Ultrastructure).
5. For female reproductive anatomy: Ensure a pear-shaped muscular uterus with distinct fundus, myometrium, and endometrium, accurately convoluted fallopian tubes (uterine tubes) featuring the ampulla, infundibulum, and realistic fringed fimbriae grasping near almond-shaped ovaries with ovarian and suspensory ligaments, a distinct cervix with internal and external os, and vaginal canal.
6. For protozoan ultrastructures (Euglena, Paramecium, Amoeba): Include verified cytological features (such as contractile vacuoles with radial canals, pellicle protein strips, paramylon grains, eyespot stigma near the flagellar reservoir, macronucleus and micronucleus).

CLASSIFICATION & FORMAT DIRECTIVE:
1. Domain: ${domain}
2. Requested Render Mode: ${renderMode}
- If renderMode is "paper" (Scientific Formulas & Chemical Compounds on Paper):
  - Formatted and drawn on clean black-and-white paper styling.
  - Include precise chemical data (formula, IUPAC name, molar mass, geometry, bond angles, bond lengths, hybridization, dipole moment, and Lewis notation).
  - Pins should highlight structural bonds (e.g. C-C single bonds, C-H single bonds), central atoms, terminal atoms, functional groups, and bond angles.
- If renderMode is "3d":
  - 3D spatial/volumetric representation with multiple vibrant colors.
  - If biological: 3D multi-color organ/cell with differentiated organelle membranes, cytoplasmic gradients, and depth.
  - If chemical: 3D ball-and-stick / tetrahedral / space-filling model with CPK element colors.
  - If physical: 3D multi-color dimensional physics model (e.g. 3D electron orbitals, planetary orbits, magnetic flux).
- If renderMode is "2d":
  - 2D multi-color cross-section / anatomical schematic with rich color-coded layers.

DIAGRAM TYPE SELECTION:
Select the most accurate diagramType from:
- "female-reproductive-system" (Uterus, ovaries, fallopian tubes, fimbriae, endometrium, cervix, vagina)
- "carbon-cycle" (Atmosphere CO₂, terrestrial photosynthesis, respiration, soil decomposition, fossil fuels, marine solubility sink)
- "nitrogen-cycle" (Atmospheric N₂, Rhizobium fixation, ammonification, Nitrosomonas/Nitrobacter nitrification, denitrification)
- "male-reproductive-system" (Testes, epididymis, vas deferens, prostate, seminal vesicles, bulbourethral gland, penis)
- "water-cycle" (Solar evaporation, evapotranspiration, condensation clouds, precipitation, runoff, infiltration, ocean sink)
- "human-sperm" (Spermatozoon with acrosome, nucleus, mitochondrial spiral neck/midpiece, axoneme tail)
- "euglena" (Euglena gracilis / viridis with long locomotory flagellum, reservoir/gullet, eyespot stigma, chloroplasts with pyrenoids, paramylon granules, contractile vacuole, pellicle)
- "amoeba" (Amoeba proteus with lobopodia, ectoplasm, granular endoplasm, contractile vacuole, food vacuoles, discoid nucleus)
- "paramecium" (Paramecium caudatum ciliate with pellicle cilia, oral groove, cytostome, anterior/posterior star contractile vacuoles, kidney macronucleus, spherical micronucleus, cytoproct)
- "agama-lizard" (Agama agama anatomy, nuchal crest, gular fold, clawed pentadactyl limbs, vertebral column, lungs, 3-chambered heart)
- "animal-cell"
- "plant-cell"
- "bony-fish"
- "human-heart"
- "human-brain"
- "neuron"
- "human-eye"
- "nephron-kidney"
- "mitochondria"
- "chloroplast"
- "bacterial-cell"
- "dna-helix"
- "lungs-respiratory"
- "digestive-system"
- "stomach-digestive"
- "skin-anatomy"
- "human-ear"
- "flower-anatomy"
- "bacteriophage"
- "volcano"
- "methane-molecule"
- "water-molecule"
- "hydrocarbon-alkanes"
- "chemical-substance"
- "bohr-atom"
- "custom-concept"

If the structure matches one of the specific built-in types above, use that exact diagramType.
If the structure is ANY OTHER biological, anatomical, physical, mechanical, botanical, or chemical structure:
1. Set "diagramType" to "custom-concept".
2. You MUST search your extensive internal scientific textbook database (Campbell Biology, Gray's Anatomy, Guyton & Hall Physiology, Lehninger, OpenStax, Encyclopedia of Life Sciences) to construct an exact, authentic, textbook-grade vector illustration in "customSvgCode" centered at (0,0) fitting within roughly -220 to +220 X and -140 to +140 Y:
   - Must contain rich vector paths (<g>, <path>, <ellipse>, <circle>, <polygon>, <rect>, <line>)
   - Must include realistic anatomical/structural textures, cross-sections, highlights, drop shadows, and distinct structural layers
   - If renderMode is "paper": crisp black and white linework, stippling, hatching, white fills, and bold outlines
   - If renderMode is "3d" or "2d": vibrant multi-colored fills, high contrast structural boundaries, and distinct color codes for each part
3. Provide 6 to 10 accurately positioned pins whose (x, y) percentage coordinates (15% to 85%) point precisely to the rendered parts in your customSvgCode!

Generate 6 to 10 strategically positioned pins with X and Y percentages (15 to 85) that cleanly identify key components without crowding.

CRITICAL: Return ONLY valid JSON (no markdown wrapping, no code fences):
{
  "title": "Precise Academic Title of the Structure",
  "category": "Biology & Cells" | "Human Anatomy" | "Botany & Ecology" | "Physics & Chemistry" | "Organic Chemistry" | "Earth & Space",
  "subtitle": "Clear academic subtitle indicating morphological and physiological focus",
  "description": "2-3 sentence academic overview of the structure explaining its authentic textbook morphology and real-life appearance",
  "diagramType": "paramecium" | "amoeba" | "euglena" | "female-reproductive-system" | "male-reproductive-system" | "human-sperm" | "carbon-cycle" | "nitrogen-cycle" | "water-cycle" | "electric-circuit" | "electromagnetic-spectrum" | "agama-lizard" | "animal-cell" | "plant-cell" | "bony-fish" | "human-heart" | "human-brain" | "neuron" | "human-eye" | "nephron-kidney" | "mitochondria" | "chloroplast" | "bacterial-cell" | "dna-helix" | "lungs-respiratory" | "digestive-system" | "stomach-digestive" | "skin-anatomy" | "human-ear" | "flower-anatomy" | "bacteriophage" | "volcano" | "methane-molecule" | "water-molecule" | "hydrocarbon-alkanes" | "chemical-substance" | "bohr-atom" | "custom-concept",
  "domain": "${domain}",
  "renderMode": "${renderMode}",
  "colorTheme": "${renderMode === 'paper' ? 'black-white-paper' : 'vibrant-multicolor'}",
  "funFact": "High-interest scientific fact grounded in real anatomy or physiology",
  "customSvgCode": "If custom-concept, provide comprehensive SVG markup (<g> containing paths, polygons, circles, curves) illustrating the authentic structure centered at (0,0) fitting within roughly -220 to +220 X and -140 to +140 Y",
  ${isChemical || renderMode === 'paper' ? `"chemicalData": {
    "formula": "Exact molecular formula",
    "iupacName": "IUPAC Name",
    "molarMass": "e.g. 16.04 g/mol",
    "geometry": "e.g. Tetrahedral (AX4) or Bent (AX2E2)",
    "bondAngle": "e.g. 109.5°",
    "bondLength": "e.g. 1.09 Å",
    "hybridization": "e.g. sp3",
    "dipoleMoment": "e.g. 0.00 D",
    "lewisStructure": "2D Lewis representation"
  },` : ''}
  "pins": [
    {
      "id": "p-1",
      "number": 1,
      "name": "Component Name",
      "x": 35,
      "y": 40,
      "color": "${renderMode === 'paper' ? '#0F172A' : '#6366F1'}",
      "category": "Subsystem",
      "functionSummary": "Concise 1-sentence function",
      "detailedNotes": "In-depth academic explanation of physiological role and histological composition"
    }
  ]
}`;

      let outputJson = '';

      // Try OpenAI first if available and quota is active
      if (canUseOpenAI()) {
        try {
          const openai = getOpenAIClient();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: systemPrompt }],
            response_format: { type: "json_object" },
            max_tokens: 4096
          });
          outputJson = completion.choices?.[0]?.message?.content || '';
        } catch (e: any) {
          handleOpenAIError(e);
          // Fallback to Gemini
        }
      }

      // Try Gemini
      if (!outputJson && process.env.GEMINI_API_KEY) {
        const ai = getAIClient();
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
        for (const model of candidateModels) {
          try {
            const resp = await ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              config: {
                responseMimeType: "application/json"
              }
            });
            if (resp?.text) {
              outputJson = resp.text;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }

      if (!outputJson) {
        return res.status(500).json({ error: "Failed to generate diagram metadata from AI models." });
      }

      const cleanJson = outputJson.replace(/^```json/i, '').replace(/```$/i, '').trim();
      const parsedData = JSON.parse(cleanJson);
      res.json({ diagram: parsedData, ...parsedData });
    } catch (err: any) {
      console.error("Diagram generator route error:", err);
      res.status(500).json({ error: err.message || "Failed to generate diagram" });
    }
  });

  // Helper for deep biometric analysis of a reference image
  async function analyzeReferenceImageBiometrics(imageDataUrl: string) {
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return null;
      }

      const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;

      const mimeType = match[1];
      const base64Data = match[2];

      const promptText = `You are an expert biometric identity, facial structure, ocular geometry, and photographic character analyst.
Analyze the human subject in this reference image with extreme fidelity, biometric precision, and photographic granularity.
This profile is used by generative diffusion models to reproduce this EXACT individual in transformed scenes, poses, and full-body compositions while retaining 100% authentic facial identity, eye openness, facial geometry, skin tone, and attire.

Analyze the image carefully and return a JSON object with:
{
  "ageAndGender": "Estimated age bracket and biological presentation (e.g., 'A man in his late 20s or early 30s', 'A young woman in her early 20s')",
  "ethnicityAndComplexion": "Exact objective skin tone, undertones, and texture (e.g., 'Warm deep-brown skin with rich golden undertones and smooth natural texture')",
  "eyeDescription": "CRITICAL OCULAR DETAILS: Exact eye openness state (e.g. 'Both eyes are clearly and fully open, alert, forward-facing gaze, with distinct dark irises and pupils, sharp eyelid aperture, no squinting, no drooping'), eye shape (almond/round/hooded), eye spacing, and eyebrow arch",
  "expressionDescription": "Exact natural facial expression (e.g. 'Composed, relaxed neutral expression, calm demeanor, mouth closed with natural relaxed lips, no forced smile, unwrinkled brow')",
  "facialFeatures": "Comprehensive facial geometry: face shape (oval, angular, defined jawline, rounded chin), cheekbone prominence, nose bridge shape and nostril width, lip proportions and fullness, forehead proportions, ear shape, and any facial hair (neatly trimmed beard, mustache, clean-shaven)",
  "hairStyle": "Exact hair texture, hairline, hair length, color, parting line, and styling (e.g., 'Short clean fade haircut, natural dark black texture, sharp hairline')",
  "attireDescription": "Precise breakdown of visible clothing: garment type, collar type, neckline, embroidery patterns, fabric color and texture, buttons, sleeves, fit (e.g., 'Traditional Nigerian royal blue senator-style tunic with gold/white intricate neckline embroidery and structured mandarin collar')",
  "strictPreservationPrompt": "An exhaustive biometric preservation prompt that locks identity and eyes: e.g., 'Authentic portrait of the exact same subject from the reference image: a man with warm deep-brown skin, fully open and alert dark brown almond eyes with clear pupil definition, composed natural expression with relaxed lips, short clean black fade haircut, and authentic facial bone structure, wearing his identical royal blue senator-style attire with neckline embroidery.'",
  "negativePromptExclusions": "closed eyes, squinting, squinting eyes, half-closed eyes, shut eyes, blinking, sleepy eyes, distorted eyes, asymmetrical eyes, droopy eyelids, cross-eyed, sunglasses, sun glare squint, unnatural smile, forced expression, altered facial features, face drift, wrong face, different person, western suit, business suit, blazer, tuxedo, wrong clothing, distorted anatomy, blurry face, blurry eyes"
}
Output raw JSON only.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      const ai = getAIClient();

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                },
                { text: promptText }
              ]
            },
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response?.text) {
            const parsed = JSON.parse(response.text);
            if (parsed && typeof parsed === 'object') {
              return parsed;
            }
          }
        } catch (err: any) {
          // Silently continue to next text candidate model
          continue;
        }
      }
    } catch (err) {
      console.warn("Biometric vision scan error:", err);
    }
    return null;
  }

  // Forensic character and attire vision analysis API
  app.post("/api/analyze-character", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: "Image data is required for character analysis." });
      }

      const analyzed = await analyzeReferenceImageBiometrics(image);
      if (analyzed) {
        return res.json(analyzed);
      }

      // Safe universal match profile so the app flow never halts
      res.json({
        ethnicityAndComplexion: "Warm natural complexion with defined facial structure and authentic undertones",
        eyeDescription: "Both eyes clearly open, sharp iris and pupil definition, natural eye shape, alert forward gaze, no squinting",
        expressionDescription: "Authentic composed natural expression, relaxed lips, neutral facial demeanor, no forced smile",
        attireDescription: "Identical clothing, fabrics, colors, and styling from reference photo",
        facialFeatures: "Distinctive facial structure, balanced bone structure, natural eyes, defined jawline, and lips",
        hairStyle: "Natural hair texture, color, and style from reference photo",
        strictPreservationPrompt: "Authentic portrait preserving exact subject likeness, wide open alert eyes, facial geometry, natural skin tone, and attire",
        negativePromptExclusions: "closed eyes, squinting, squinting eyes, half-closed eyes, blinking, different person, wrong face, altered facial features, distorted anatomy"
      });
    } catch (err: any) {
      console.warn("Character analysis fallback handler:", err);
      res.json({
        ethnicityAndComplexion: "Warm natural complexion with defined facial structure and authentic undertones",
        eyeDescription: "Both eyes clearly open, sharp iris and pupil definition, natural eye shape, alert forward gaze, no squinting",
        expressionDescription: "Authentic composed natural expression, relaxed lips, neutral facial demeanor, no forced smile",
        attireDescription: "Identical clothing, fabrics, colors, and styling from reference photo",
        facialFeatures: "Distinctive facial structure, balanced bone structure, natural eyes, defined jawline, and lips",
        hairStyle: "Natural hair texture, color, and style from reference photo",
        strictPreservationPrompt: "Authentic portrait preserving exact subject likeness, wide open alert eyes, facial geometry, natural skin tone, and attire",
        negativePromptExclusions: "closed eyes, squinting, squinting eyes, half-closed eyes, blinking, different person, wrong face, altered facial features, distorted anatomy"
      });
    }
  });

  // Voice Prompt Audio Transcription API
  app.post("/api/transcribe-audio", async (req, res) => {
    try {
      const { audio, mimeType } = req.body;
      if (!audio || typeof audio !== "string") {
        return res.status(400).json({ error: "No audio data provided" });
      }

      const cleanBase64 = audio.includes(",") ? audio.split(",")[1] : audio;
      const resolvedMime = mimeType || "audio/webm";

      const ai = getAIClient();
      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

      let transcript = "";
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  mimeType: resolvedMime,
                  data: cleanBase64,
                },
              },
              {
                text: "Accurately transcribe the spoken voice in this audio into text. If the speaker describes an image prompt, subject, scene, or style, transcribe the exact words faithfully. Output ONLY the clean transcribed words without quotation marks, markdown formatting, commentary, or conversational filler. If the audio is silent or contains no discernible speech, return an empty string.",
              },
            ],
          });

          if (response?.text) {
            transcript = response.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Audio transcription with ${model} warning:`, err?.message || err);
          continue;
        }
      }

      transcript = transcript.replace(/^["'`]+|["'`]+$/g, "").trim();
      if (transcript.toUpperCase() === "SILENCE" || transcript.toUpperCase() === "NO SPEECH") {
        transcript = "";
      }

      return res.json({ text: transcript });
    } catch (error: any) {
      console.error("Audio transcription error:", error);
      return res.status(500).json({ error: error?.message || "Failed to transcribe audio" });
    }
  });

  // Helper to synthesize a crisp, razor-sharp 1024x1024 scene using FLUX
  async function generateCrispScene({
    prompt,
    width = 1024,
    height = 1024,
    negativePrompt
  }: {
    prompt: string;
    width?: number;
    height?: number;
    negativePrompt?: string;
  }): Promise<Buffer> {
    const seed = Math.floor(Math.random() * 1000000000);
    const candidateModels = ['flux', 'turbo', 'sana'];

    for (const pModel of candidateModels) {
      try {
        const timeoutMs = pModel === 'flux' ? 9500 : 7500;
        const postResponse = await fetch("https://image.pollinations.ai/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Nexora-App/2.0"
          },
          body: JSON.stringify({
            prompt: `${prompt}, 8k uhd, photorealistic masterpiece, razor-sharp focus, highly detailed, perfect studio lighting, pristine clarity, sharp background`,
            model: pModel,
            width,
            height,
            seed,
            nologo: true,
            safe: false,
            negative_prompt: negativePrompt || "blurry, low resolution, out of focus, distorted, artifacts, noise"
          }),
          signal: AbortSignal.timeout(timeoutMs)
        });

        if (postResponse.ok) {
          const arrayBuffer = await postResponse.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }

        // GET fallback
        const polliUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 260) + ', 8k uhd, razor-sharp focus, clear background')}?model=${pModel}&width=${width}&height=${height}&seed=${seed}&nologo=true&safe=false`;
        const polliResponse = await fetch(polliUrl, {
          headers: { "User-Agent": "Nexora-App/2.0" },
          signal: AbortSignal.timeout(7500)
        });
        if (polliResponse.ok) {
          const arrayBuffer = await polliResponse.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch {}
    }
    throw new Error("Unable to synthesize scene background.");
  }

  // Helper to enhance clarity, sharpness, and upscale output images using Sharp
  async function enhanceImageClarity(inputBuffer: Buffer, targetWidth: number, targetHeight: number): Promise<Buffer> {
    try {
      return await sharp(inputBuffer)
        .resize(targetWidth, targetHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'cover'
        })
        .sharpen({
          sigma: 1.4,
          m1: 1.6,
          m2: 0.8
        })
        .modulate({
          brightness: 1.02,
          saturation: 1.04
        })
        .jpeg({ quality: 95 })
        .toBuffer();
    } catch {
      return inputBuffer;
    }
  }

  // Magic Hour AI Reference and Image Generation Engine
  async function generateWithMagicHour(options: {
    prompt: string;
    referenceImage?: { mimeType: string; base64Data: string; byteSize?: number } | null;
    aspectRatio?: string;
    quality?: string;
    style?: string;
    negativePrompt?: string;
    editMode?: string;
    fidelityMode?: string;
  }): Promise<string> {
    const token = (process.env.MAGIC_HOUR_API_KEY || "").trim();

    if (!token) {
      throw new Error("MAGIC_HOUR_API_KEY is not configured in the server environment.");
    }

    const magicHourClient = new MagicHourClient({ token });
    const { prompt, referenceImage, aspectRatio = "1:1", quality } = options;

    // Map aspect ratio to supported Magic Hour aspect ratio: ("16:9" | "1:1" | "2:3" | "3:2" | "4:3" | "4:5" | "9:16" | "auto")
    let mhAspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "2:3" | "3:2" | "auto" = "1:1";
    if (aspectRatio === "16:9") mhAspectRatio = "16:9";
    else if (aspectRatio === "9:16") mhAspectRatio = "9:16";
    else if (aspectRatio === "4:3") mhAspectRatio = "4:3";
    else if (aspectRatio === "3:4" || aspectRatio === "2:3") mhAspectRatio = "2:3";
    else if (aspectRatio === "3:2") mhAspectRatio = "3:2";

    // High-resolution mapping: avoid "auto" which Magic Hour maps to low-res/640px compressed
    let mhResolution: "1k" | "2k" | "640px" = "1k";
    if (quality?.includes("2K") || quality?.includes("4K")) {
      mhResolution = "2k";
    } else if (quality?.includes("512")) {
      mhResolution = "640px";
    } else {
      mhResolution = "1k";
    }

    const categorizeMagicHourError = (err: any): Error => {
      const msg = String(err?.message || err?.error || err || "");
      const status = Number(err?.status || err?.statusCode || 0);

      if (status === 401 || status === 403 || /unauthorized|forbidden|invalid token|api key/i.test(msg)) {
        return new Error(`Magic Hour Authentication Error: Invalid or unauthorized MAGIC_HOUR_API_KEY (${msg}).`);
      }
      if (status === 402 || /quota|insufficient[ _-]?credits|payment[ _-]?required|billing|subscription/i.test(msg)) {
        return new Error(`Magic Hour Billing/Quota Error: Insufficient credits or payment required on your Magic Hour account (${msg}).`);
      }
      if (status === 429 || /rate[ _-]?limit|too many requests/i.test(msg)) {
        return new Error(`Magic Hour Rate Limit Error: Rate limit reached on Magic Hour API (HTTP 429: ${msg}).`);
      }
      if (/model[ _-]?unavailable|model not found|unsupported model/i.test(msg)) {
        return new Error(`Magic Hour Model Error: The selected Magic Hour image editing model is currently unavailable (${msg}).`);
      }
      return new Error(`Magic Hour Error: ${msg}`);
    };

    if (referenceImage?.base64Data) {
      const ext = referenceImage.mimeType.includes("png")
        ? "png"
        : referenceImage.mimeType.includes("webp")
        ? "webp"
        : "jpg";

      const tempSourcePath = path.join(
        os.tmpdir(),
        `magichour_reference_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      );

      fs.writeFileSync(
        tempSourcePath,
        Buffer.from(referenceImage.base64Data, "base64")
      );

      try {
        console.log(`[Magic Hour AI Image Editor] Executing reference image edit (AspectRatio: ${mhAspectRatio}, Resolution: ${mhResolution})...`);
        let editResult: any = null;
        const candidateEditorModels: ("default" | "qwen-edit" | "krea-2" | "flux-2-klein")[] = ["default", "qwen-edit", "krea-2", "flux-2-klein"];
        let lastModelErr: any = null;

        for (const candidateModel of candidateEditorModels) {
          try {
            console.log(`[Magic Hour] Attempting AI Image Editor with model '${candidateModel}' at resolution '${mhResolution}'...`);
            editResult = await magicHourClient.v1.aiImageEditor.generate(
              {
                assets: {
                  imageFilePaths: [tempSourcePath],
                },
                style: {
                  prompt: prompt,
                },
                aspectRatio: mhAspectRatio,
                model: candidateModel,
                resolution: mhResolution,
              },
              {
                waitForCompletion: true,
                downloadOutputs: false,
              }
            );
            if (editResult && editResult.status !== "error") {
              break;
            }
          } catch (modelErr: any) {
            lastModelErr = modelErr;
            console.warn(`[Magic Hour] Model '${candidateModel}' unavailable:`, modelErr?.message);
          }
        }

        if (!editResult) {
          throw lastModelErr || new Error("Magic Hour Image Editor processing failed across all candidate models.");
        }

        if (editResult.status === "error") {
          throw categorizeMagicHourError(editResult.error || "Image Editor processing failed.");
        }

        const downloadUrl = editResult.downloads?.[0]?.url;
        if (!downloadUrl) {
          throw new Error("Magic Hour Image Editor completed without returning a download URL.");
        }

        try {
          const imgRes = await fetch(downloadUrl);
          if (imgRes.ok) {
            const rawBuffer = Buffer.from(await imgRes.arrayBuffer());
            const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
            return `data:${mimeType};base64,${rawBuffer.toString("base64")}`;
          }
        } catch (fetchErr: any) {
          console.warn("[Magic Hour] Notice fetching generated image bytes:", fetchErr?.message);
        }

        return downloadUrl;
      } catch (err: any) {
        throw categorizeMagicHourError(err);
      } finally {
        try {
          if (fs.existsSync(tempSourcePath)) {
            fs.unlinkSync(tempSourcePath);
          }
        } catch {}
      }
    } else {
      // Text-to-image mode with Magic Hour
      let generatorAspectRatio: "1:1" | "16:9" | "9:16" = "1:1";
      if (aspectRatio === "16:9") generatorAspectRatio = "16:9";
      else if (aspectRatio === "9:16") generatorAspectRatio = "9:16";

      const generatorResolution: "1k" | "2k" | "640px" = (quality?.includes("2K") || quality?.includes("4K")) ? "2k" : "1k";
      console.log(`[Magic Hour AI Image Generator] Starting text-to-image generation (AspectRatio: ${generatorAspectRatio}, Resolution: ${generatorResolution})...`);
      try {
        const result = await magicHourClient.v1.aiImageGenerator.generate(
          {
            imageCount: 1,
            style: { prompt },
            aspectRatio: generatorAspectRatio,
            resolution: generatorResolution,
          },
          { waitForCompletion: true, downloadOutputs: false }
        );

        if (result.status === "error") {
          throw categorizeMagicHourError(result.error || "Image Generator processing failed.");
        }

        if (!result.downloads || result.downloads.length === 0) {
          throw new Error("Magic Hour Image Generator completed without returning download URLs.");
        }

        const downloadUrl = result.downloads[0].url;
        try {
          const imgRes = await fetch(downloadUrl);
          if (imgRes.ok) {
            const rawBuffer = Buffer.from(await imgRes.arrayBuffer());
            const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
            return `data:${mimeType};base64,${rawBuffer.toString("base64")}`;
          }
        } catch (fetchErr: any) {
          console.warn("[Magic Hour] Notice fetching generated image bytes:", fetchErr?.message);
        }
        return downloadUrl;
      } catch (err: any) {
        throw categorizeMagicHourError(err);
      }
    }
  }

  // Replicate FLUX.1 Dev helper (supports reference image transformation)
  async function generateWithReplicate({
    prompt,
    referenceImage = null,
    aspectRatio = "1:1",
    editMode = null
  }: {
    prompt: string;
    referenceImage?: string | null;
    aspectRatio?: string;
    editMode?: string | null;
  }): Promise<string> {
    const replicateKey = (process.env.REPLICATE_API_TOKEN || "").trim();
    if (!replicateKey) {
      throw new Error("Replicate service is currently unavailable.");
    }

    let repRatio = "1:1";
    if (aspectRatio === "16:9") repRatio = "16:9";
    else if (aspectRatio === "9:16") repRatio = "9:16";
    else if (aspectRatio === "4:3") repRatio = "3:2";
    else if (aspectRatio === "3:4") repRatio = "2:3";

    const replicateInput: any = {
      prompt,
      aspect_ratio: repRatio,
      output_format: "jpg",
      output_quality: 90
    };

    if (referenceImage) {
      replicateInput.image = referenceImage;
      let promptStrength = 0.70;
      if (editMode === "posture_change") {
        promptStrength = 0.76;
      } else if (editMode === "custom_edit") {
        promptStrength = 0.72;
      } else if (editMode === "background_change") {
        promptStrength = 0.68;
      }
      replicateInput.prompt_strength = promptStrength;
    }

    const replicateResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({ input: replicateInput })
    });

    if (!replicateResponse.ok) {
      const errText = await replicateResponse.text();
      let parsedMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail) parsedMsg = parsed.detail;
        if (parsed.error) parsedMsg = parsed.error;
      } catch {}
      throw new Error(`Replicate API error: ${parsedMsg}`);
    }

    const data = await replicateResponse.json();

    if (data.status === "failed") {
      throw new Error(`Replicate failed: ${data.error || 'Unknown error'}`);
    }

    const url = Array.isArray(data.output) ? data.output[0] : data.output;
    if (!url) {
      if (data.status === "starting" || data.status === "processing") {
        throw new Error("Replicate is taking longer than expected. Please try again in a moment.");
      }
      throw new Error("No image URL returned by Replicate.");
    }

    return url;
  }

  // Dedicated Magic Hour endpoints
  app.post(["/api/magic-hour/generate", "/api/magic-hour-transform"], async (req, res) => {
    res.setHeader("X-Nexora-API", "magic-hour-express");
    try {
      const {
        prompt,
        aspectRatio = "1:1",
        quality = "1K",
        style = "",
        referenceImage = null,
        negativePrompt
      } = req.body;

      let validatedReference: { mimeType: string; base64Data: string; byteSize: number } | null = null;
      if (referenceImage && typeof referenceImage === "string" && referenceImage.startsWith("data:")) {
        const match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1].trim().toLowerCase();
          const base64Data = match[2].trim();
          if (mimeType.startsWith("image/") && base64Data.length > 0) {
            validatedReference = { mimeType, base64Data, byteSize: Math.round(base64Data.length * 0.75) };
          }
        }
      }

      const originalPrompt = (prompt || "").trim();

      const imageUrl = await generateWithMagicHour({
        prompt: originalPrompt,
        referenceImage: validatedReference,
        aspectRatio,
        quality,
        style,
        negativePrompt
      });

      return res.json({ imageUrl });
    } catch (error: any) {
      const msg = error?.message || "Magic Hour generation failed.";
      const status = msg.includes("Missing MAGIC_HOUR_API_KEY") || msg.includes("MAGIC_HOUR_API_KEY") ? 400 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  // Image generation API
  app.post("/api/generate-image", async (req, res) => {
    res.setHeader("X-Nexora-API", "image-generation-express");
    console.log(`[Diagnostic /api/generate-image] Express handler REACHED: app.post("/api/generate-image"), Method=${req.method}`);

    // ============================================================================
    // IMAGE STUDIO INTELLIGENT PROVIDER CAPABILITY & AVAILABILITY LAYER
    // ============================================================================

    type ImageStudioOp = "TEXT_TO_IMAGE" | "REFERENCE_IMAGE_EDIT" | "IMAGE_TO_IMAGE" | "IMAGE_UPSCALE";

    interface StudioProvider {
      id: string;
      name: string;
      capabilities: ImageStudioOp[];
      isConfigured: () => boolean;
    }

    const STUDIO_PROVIDERS: Record<string, StudioProvider> = {
      "magic-hour": {
        id: "magic-hour",
        name: "Magic Hour AI",
        capabilities: ["REFERENCE_IMAGE_EDIT", "IMAGE_TO_IMAGE", "TEXT_TO_IMAGE"],
        isConfigured: () => Boolean((process.env.MAGIC_HOUR_API_KEY || "").trim())
      },
      "gemini": {
        id: "gemini",
        name: "Google Gemini Multimodal",
        capabilities: ["REFERENCE_IMAGE_EDIT", "IMAGE_TO_IMAGE", "TEXT_TO_IMAGE"],
        isConfigured: () => Boolean(getGeminiApiKey())
      },
      "replicate": {
        id: "replicate",
        name: "Replicate FLUX.1 [dev]",
        capabilities: ["REFERENCE_IMAGE_EDIT", "IMAGE_TO_IMAGE", "TEXT_TO_IMAGE"],
        isConfigured: () => Boolean((process.env.REPLICATE_API_TOKEN || "").trim())
      },
      "together": {
        id: "together",
        name: "Together AI FLUX",
        capabilities: ["TEXT_TO_IMAGE"], // Strictly txt2img only
        isConfigured: () => Boolean((process.env.TOGETHER_API_KEY || "").trim())
      },
      "huggingface": {
        id: "huggingface",
        name: "Hugging Face FLUX",
        capabilities: ["TEXT_TO_IMAGE"], // Strictly txt2img only
        isConfigured: () => Boolean((process.env.HF_TOKEN || "").trim())
      },
      "pollinations": {
        id: "pollinations",
        name: "Pollinations AI",
        capabilities: ["TEXT_TO_IMAGE"], // Strictly txt2img only
        isConfigured: () => true // Always configured serverless
      }
    };

    // In-memory provider availability and cooldown state tracking (server-side session cache)
    const providerStateCache = (global as any).__studioProviderState || new Map<string, {
      status: string;
      lastError: string | null;
      cooldownUntil: number;
      tempErrorCount: number;
    }>();
    (global as any).__studioProviderState = providerStateCache;

    const getHealth = (providerId: string) => {
      let rec = providerStateCache.get(providerId);
      if (!rec) {
        rec = { status: "available", lastError: null, cooldownUntil: 0, tempErrorCount: 0 };
        providerStateCache.set(providerId, rec);
      }
      return rec;
    };

    const isProviderReady = (provider: StudioProvider): boolean => {
      if (!provider.isConfigured()) return false;
      const h = getHealth(provider.id);
      if (h.cooldownUntil > Date.now()) return false;
      return true;
    };

    const classifyError = (err: any): "quota_exhausted" | "rate_limited" | "unauthorized" | "temporary_error" => {
      const msg = String(err?.message || err?.error || err?.statusText || err || "").toLowerCase();
      const status = Number(err?.status || err?.statusCode || 0);

      if (status === 401 || status === 403 || /\b(401|403|unauthorized|forbidden|invalid key|invalid token|auth error)\b/i.test(msg)) {
        return "unauthorized";
      }
      if (status === 402 || status === 410 || /\b(402|410|quota|credit|billing|payment_required|insufficient|resource_exhausted|deprecated)\b/i.test(msg)) {
        return "quota_exhausted";
      }
      if (status === 429 || /\b(429|rate_limit|rate limit|too many requests)\b/i.test(msg)) {
        return "rate_limited";
      }
      return "temporary_error";
    };

    const recordResult = (
      op: ImageStudioOp,
      providerId: string,
      resCode: "success" | "quota_exhausted" | "rate_limited" | "unauthorized" | "temporary_error",
      errMessage?: string
    ) => {
      const opTag = op === "REFERENCE_IMAGE_EDIT" ? "reference-edit" : "text-to-image";
      console.info(`[ImageStudio] operation=${opTag} provider=${providerId} result=${resCode}`);

      const h = getHealth(providerId);
      h.status = resCode;
      h.lastError = errMessage || null;

      if (resCode === "success") {
        h.status = "available";
        h.cooldownUntil = 0;
        h.tempErrorCount = 0;
      } else if (resCode === "quota_exhausted" || resCode === "unauthorized") {
        h.cooldownUntil = Date.now() + 5 * 60 * 1000; // 5-min cooldown
      } else if (resCode === "rate_limited") {
        h.cooldownUntil = Date.now() + 60 * 1000; // 1-min cooldown
      } else if (resCode === "temporary_error") {
        h.tempErrorCount += 1;
        if (h.tempErrorCount >= 2) {
          h.cooldownUntil = Date.now() + 2 * 60 * 1000;
        }
      }
    };

    // Response normalizer & safe logger
    const normalizeImageResponse = async (output: any): Promise<string> => {
      if (!output) {
        throw new Error("Provider returned empty output.");
      }

      let candidate: string = "";

      if (typeof output === "string") {
        candidate = output.trim();
      } else if (typeof output === "object") {
        if (output.imageUrl && typeof output.imageUrl === "string") {
          candidate = output.imageUrl.trim();
        } else if (output.url && typeof output.url === "string") {
          candidate = output.url.trim();
        } else if (output.downloadUrl && typeof output.downloadUrl === "string") {
          candidate = output.downloadUrl.trim();
        } else if (Array.isArray(output.downloads) && output.downloads[0]?.url) {
          candidate = output.downloads[0].url.trim();
        } else if (Array.isArray(output.output) && typeof output.output[0] === "string") {
          candidate = output.output[0].trim();
        } else if (output.data && typeof output.data === "string") {
          candidate = output.data.trim();
        }
      }

      if (!candidate) {
        throw new Error("Could not extract image data or URL from provider response.");
      }

      if (candidate.startsWith("data:image/")) {
        return candidate;
      }

      if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
        try {
          const fetchRes = await fetch(candidate, {
            headers: { "User-Agent": "Nexora-App/2.0" },
            signal: AbortSignal.timeout(12000)
          });
          if (fetchRes.ok) {
            const arrayBuf = await fetchRes.arrayBuffer();
            const base64 = Buffer.from(arrayBuf).toString("base64");
            const mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
            return `data:${mimeType};base64,${base64}`;
          }
        } catch (e: any) {
          console.warn("[ImageStudio] Notice fetching external image into base64:", e?.message || e);
        }
        return candidate;
      }

      return candidate;
    };

    const sendNormalizedSuccess = async (providerId: string, rawOutput: any) => {
      const normalized = await normalizeImageResponse(rawOutput);
      const hasImage = Boolean(normalized && (normalized.startsWith("data:image/") || normalized.startsWith("http")));

      console.info(`[ImageStudio] provider: ${providerId}`);
      console.info(`[ImageStudio] HTTP status: 200`);
      console.info(`[ImageStudio] response content-type: application/json`);
      console.info(`[ImageStudio] response keys: imageUrl`);
      console.info(`[ImageStudio] normalized image found: ${hasImage}`);

      if (!hasImage) {
        throw new Error(`Provider ${providerId} returned an unrecognized image payload.`);
      }

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ imageUrl: normalized });
    };

    const sendCategorizedError = (err: any, fallbackStatus = 500, fallbackCode = "GENERATION_ERROR") => {
      const rawMsg = err?.message || String(err || "Image generation failed.");
      const errType = classifyError(err);
      let status = fallbackStatus;
      let code = fallbackCode;

      if (errType === "unauthorized") {
        status = 401;
        code = "PROVIDER_UNAUTHORIZED";
      } else if (errType === "quota_exhausted") {
        status = 402;
        code = "PROVIDER_QUOTA_EXHAUSTED";
      } else if (errType === "rate_limited") {
        status = 429;
        code = "PROVIDER_RATE_LIMITED";
      } else if (errType === "temporary_error") {
        status = 503;
        code = "PROVIDER_UNAVAILABLE";
      }

      console.info(`[ImageStudio] HTTP status: ${status}`);
      console.info(`[ImageStudio] response content-type: application/json`);
      console.info(`[ImageStudio] error code: ${code}`);

      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error: rawMsg, code });
    };

    try {
      const { 
        prompt, 
        aspectRatio = "1:1", 
        quality = "1K", 
        negativePrompt, 
        model = "gemini-3.1-flash-image", 
        style = "",
        antiDeformation = true,
        referenceImage = null,
        editMode = "background_change",
        fidelityMode = "high"
      } = req.body;

      // STEP 1: Strict Reference Image Validation
      let validatedReference: { mimeType: string; base64Data: string; byteSize: number } | null = null;
      const isReferenceProvided = referenceImage !== null && referenceImage !== undefined && referenceImage !== "";

      if (isReferenceProvided) {
        if (typeof referenceImage !== "string" || !referenceImage.startsWith("data:")) {
          return res.status(400).json({
            error: "Reference image was supplied but could not be decoded. Generation stopped to prevent loss of reference identity."
          });
        }

        const match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
          return res.status(400).json({
            error: "Reference image was supplied but could not be decoded. Generation stopped to prevent loss of reference identity."
          });
        }

        const mimeType = match[1].trim().toLowerCase();
        const base64Data = match[2].trim();

        if (!mimeType.startsWith("image/") || base64Data.length === 0) {
          return res.status(400).json({
            error: "Reference image was supplied but could not be decoded. Generation stopped to prevent loss of reference identity."
          });
        }

        const byteSize = Math.round(base64Data.length * 0.75);
        validatedReference = { mimeType, base64Data, byteSize };
      }

      // Development-only diagnostics (NEVER log the actual base64 image data)
      if (process.env.NODE_ENV !== "production") {
        console.log("[ImageStudio Diagnostics - Step 1 Reference Integrity]", {
          referenceImageReceived: Boolean(validatedReference),
          mimeType: validatedReference ? validatedReference.mimeType : null,
          approximateSizeKB: validatedReference ? `${(validatedReference.byteSize / 1024).toFixed(1)} KB` : "0 KB",
          base64LengthChars: validatedReference ? validatedReference.base64Data.length : 0,
          attachedToGeminiRequest: Boolean(validatedReference),
          selectedModel: model
        });
      }
      
      const originalPrompt = (prompt || "").trim();
      let enhancedPrompt = originalPrompt;
      let finalNegativePrompt = "";
      let complexionReinforcement = "";
      let complexionNegative = "";

      const defaultNegative = "extra person, second person, duplicate person, clone, twin, multiple people, two heads, multiple faces, distorted face, nonhuman, alien, creature, monster, animal, caricature, cartoon, deformed, mutated, disfigured, photo within photo, picture in picture, inset photo, framed picture, smartphone screen, polaroid, split screen, before and after, collage, deformed hands, extra fingers, missing fingers, bad anatomy, bad eyes, blurry face, low resolution, artifacts";

      if (validatedReference) {
        // Comprehensive intent detection: check whether the user instruction modifies attire, complexion, hair, pose, background, or scene
        const promptLower = originalPrompt.toLowerCase();

        // 1. Precise Complexion Intent Detection and Reinforcement:
        const isChangingComplexion = 
          req.body.lockComplexion === false ||
          /\b(complexion|skin|skin tone|skin color|tan|tanned|tanning|pale|fair|fairer|dark|darker|dark-skinned|light-skinned|ebony|bronze|bronzed|olive|brown|black skin|white skin|lighter skin|darker skin|melanin|glow|complexioned|sun-kissed|wheatish)\b/i.test(promptLower);

        if (/\b(very fair|extremely fair|pale|porcelain|ivory|alabaster|light fair|fair skin|fair complexion)\b/i.test(promptLower)) {
          complexionReinforcement = "distinct very fair porcelain alabaster skin complexion, luminous pale ivory porcelain skin tone, clear bright porcelain skin";
          complexionNegative = "dark skin, tanned skin, brown skin, dark complexion, muddy skin, uneven skin tone, redness, sunburn, sallow";
        } else if (/\b(dark|ebony|deep brown|black skin|dark-skinned|dark complexion)\b/i.test(promptLower)) {
          complexionReinforcement = "radiant rich dark melanin skin complexion, deep brown glowing skin tone, smooth rich dark skin";
          complexionNegative = "pale skin, fair skin, light skin, bleached skin, ashy skin";
        } else if (/\b(olive|tan|tanned|bronze|bronzed|golden|wheatish)\b/i.test(promptLower)) {
          complexionReinforcement = "warm golden olive tanned bronze skin complexion, sun-kissed glowing warm skin tone";
          complexionNegative = "pale skin, ashy skin, washed out skin";
        }

        // 2. Precise Attire & Clothing Color Intent Detection:
        const isChangingAttire = req.body.editMode === 'custom_edit' || 
          req.body.lockAttire === false ||
          /\b(wear|wearing|dressed|dress|clothe|clothes|clothing|attire|apparel|outfit|suit|tuxedo|blazer|jacket|coat|hoodie|sweater|cardigan|shirt|t-shirt|tee|top|polo|blouse|pants|jeans|trousers|shorts|skirt|garb|uniform|costume|robe|gown|vest|tie|swimsuit|swimwear|color of clothes|clothes color|clothing color|attire color)\b/i.test(promptLower) ||
          (/\b(red|blue|green|yellow|black|white|purple|orange|pink|brown|grey|gray|navy|beige|crimson|maroon|scarlet|violet|indigo|gold|silver|dark|light|bright)\b/i.test(promptLower) && /\b(clothe|clothes|clothing|outfit|attire|shirt|dress|suit|wear|jacket|top|pants|coat|sweater|hoodie)\b/i.test(promptLower));
        
        const isChangingHair = req.body.lockHairstyle === false ||
          /\b(hair|hairstyle|haircut|blonde|brunette|bald|braids|ponytail|bangs|curls|curly|straight hair|shaved|wig|hairdo|redhead)\b/i.test(promptLower);

        // 1. Primary Instruction: The user's requested transformation leads the prompt directly
        const actionDirective = originalPrompt
          ? `A realistic, ultra-sharp portrait photograph of the individual, faithfully rendering ${originalPrompt}${complexionReinforcement ? ', ' + complexionReinforcement : ''}`
          : `High-fidelity professional portrait photograph of the individual`;

        // 2. Identity preservation (without conflicting with user instructions)
        const identityDirectives: string[] = [];
        if (req.body.faceLock !== false) {
          identityDirectives.push("preserving exact facial likeness, features, and facial structure");
        }
        // ONLY preserve skin tone if user is NOT explicitly modifying complexion
        if (req.body.lockComplexion !== false && !isChangingComplexion) {
          const cLock = req.body.complexionLock;
          if (cLock && typeof cLock === 'string' && cLock.trim().length > 0 && !cLock.toLowerCase().includes('maintain exact')) {
            identityDirectives.push(`natural skin tone (${cLock.trim()})`);
          } else {
            identityDirectives.push("natural skin tone");
          }
        }
        // ONLY preserve hairstyle if user is NOT explicitly modifying hair
        if (req.body.lockHairstyle !== false && !isChangingHair) {
          identityDirectives.push("original hairstyle");
        }
        // ONLY preserve clothing if user is NOT explicitly modifying clothes or clothing colors
        if (req.body.lockAttire !== false && !isChangingAttire) {
          const aLock = req.body.attireLock;
          if (aLock && typeof aLock === 'string' && aLock.trim().length > 0 && !aLock.toLowerCase().includes('maintain 100%')) {
            identityDirectives.push(`original clothing (${aLock.trim()})`);
          } else {
            identityDirectives.push("original clothing");
          }
        }

        const identitySentence = identityDirectives.length > 0
          ? `${identityDirectives.join(", ")}.`
          : "";

        // 3. Positive Solo-Subject Human Architecture:
        // Purely positive human cues (strictly zero negative phrases in the positive prompt)
        const singleSubjectEnforcement = isChangingComplexion
          ? "A solitary person centered in the frame, single unified camera shot, authentic human appearance, lifelike clear eyes, warm human expression, masterwork portrait photography, crisp lighting, rich contrast."
          : "A solitary person centered in the frame, single unified camera shot, authentic human appearance, natural skin texture, lifelike clear eyes, warm human expression, masterwork portrait photography, crisp lighting, rich contrast.";

        enhancedPrompt = [
          actionDirective,
          identitySentence,
          singleSubjectEnforcement
        ].filter(Boolean).join(". ").replace(/\.\s*\./g, '.').replace(/\s+/g, ' ').trim();

        // All negative prevention tokens belong strictly in the negative prompt
        finalNegativePrompt = [
          negativePrompt,
          complexionNegative,
          defaultNegative,
          "faint, washed out, blurry, out of focus, distorted face, muddy colors, hazy, low contrast, desaturated"
        ].filter(Boolean).join(", ").trim();
      } else {
        // Standard Text-to-Image prompt composition
        let styleModifier = "";
        switch(style) {
            case "Photorealistic":
            case "Nexora Photorealistic":
            case "Nexora Vision Pro": 
              styleModifier = ", high resolution photograph, natural lighting, sharp focus"; 
              break;
            case "Studio Portrait":
            case "Nexora Studio Portrait":
            case "Nexora Studio XL": 
              styleModifier = ", professional studio portrait lighting, medium format camera, crisp focus"; 
              break;
            case "Cinematic Film":
            case "Nexora Cinematic Film":
            case "Nexora Cinematic": 
              styleModifier = ", 35mm film still, cinematic anamorphic lighting, fine film grain"; 
              break;
            case "3D Animation":
            case "Nexora 3D Animation":
            case "Nexora Pixar 3D":
              styleModifier = ", 3D character animation aesthetic, smooth subsurface rendering, vibrant lighting";
              break;
            case "Sticker Cartoon":
            case "Nexora Sticker Cartoon":
            case "Nexora Stick Cartoon":
              styleModifier = ", cute die-cut vector sticker cartoon, thick white outline border, vibrant flat colors, smooth cel shading, playful character design, isolated sticker graphic on clean background";
              break;
            case "Hand-Drawn Sketch":
            case "Nexora Hand-Drawn Sketch":
            case "Nexora Hand-Sketch":
              styleModifier = ", authentic graphite pencil sketch, delicate shading, textured sketchbook paper";
              break;
            case "Watercolor Painting":
            case "Nexora Watercolor Painting":
            case "Nexora Watercolor Artistry":
              styleModifier = ", watercolor illustration, fluid translucent pigment washes, cold-press paper texture";
              break;
            case "Cyberpunk Neon":
            case "Nexora Cyberpunk Neon":
              styleModifier = ", cyberpunk aesthetic, neon lighting, dark city backdrop, high contrast";
              break;
            case "Classical Oil Painting":
            case "Nexora Classical Oil Painting":
            case "Nexora Oil Painting Masterpiece":
              styleModifier = ", fine oil painting on canvas, subtle impasto texture, museum lighting";
              break;
            case "Claymation Art":
            case "Nexora Claymation Art":
            case "Nexora Claymation":
              styleModifier = ", handcrafted plasticine clay modeling, tactile stop-motion animation aesthetic";
              break;
            case "Layered Papercraft":
            case "Nexora Layered Papercraft":
            case "Nexora 3D Papercraft":
              styleModifier = ", layered paper sculpture, clean geometric paper cutouts, soft depth shadows";
              break;
            case "Architectural Concept":
            case "Nexora Architectural Concept":
              styleModifier = ", modern architectural rendering, clean structural lines, natural daylight";
              break;
            case "Film Noir Monochrome":
            case "Nexora Film Noir Monochrome":
            case "Nexora Film Noir": 
              styleModifier = ", classic monochrome film noir photography, dramatic high-contrast chiaroscuro shadows"; 
              break;
            case "Retro Polaroid":
            case "Nexora Retro Polaroid":
            case "Nexora Polaroid": 
              styleModifier = ", vintage instant film snapshot, warm nostalgic tones, authentic soft flash"; 
              break;
            case "Animated Illustration":
            case "Nexora Animated Illustration":
            case "Nexora Animate Cartoon": 
              styleModifier = ", vibrant 2D animated illustration, clean linework, expressive cel shading"; 
              break;
            case "Minimalist Line Art":
            case "Nexora Minimalist Line Art": 
              styleModifier = ", minimalist line art drawing, clean black outlines on plain background"; 
              break;
            case "Digital Concept Art":
            case "Nexora Digital Concept Art":
            case "Nexora Digital Art": 
              styleModifier = ", digital concept artwork, detailed composition, atmospheric lighting"; 
              break;
            case "Anime High-Res": 
            case "Nexora Anime High-Res": 
              styleModifier = ", high-resolution anime illustration, clean line art, luminous sky and cloud lighting"; 
              break;
            case "Natural Daylight":
            case "Nexora Natural Daylight":
            case "Nexora Vision Lite": 
            case "Nexora Vision Fast": 
              styleModifier = ", natural balanced daylight, crisp details, clean composition"; 
              break;
            default:
              styleModifier = ", high resolution, sharp focus";
              break;
        }

        enhancedPrompt = `${originalPrompt}${styleModifier}`.trim();
        finalNegativePrompt = (negativePrompt || (antiDeformation ? defaultNegative : "")).trim();
      }

      // Development-only diagnostics (NEVER log the actual base64 image data)
      if (process.env.NODE_ENV !== "production") {
        console.log("[ImageStudio Diagnostics - Step 2 Prompt Integrity]", {
          originalPrompt: originalPrompt,
          referenceImageAttached: Boolean(validatedReference),
          selectedModel: model
        });
      }

      // Pollinations generator helper with validation to avoid corrupted/static nonhuman images
      const generateWithPollinations = async (targetWidth: number, targetHeight: number) => {
        const seed = Math.floor(Math.random() * 1000000000);
        const candidatePollinationModels = model === 'pollinations-flux' 
          ? ['flux', 'turbo'] 
          : ['turbo', 'flux'];

        for (const pModel of candidatePollinationModels) {
          try {
            let polliUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt.slice(0, 280))}?model=${pModel}&width=${targetWidth}&height=${targetHeight}&seed=${seed}&nologo=true&safe=false`;
            if (finalNegativePrompt) {
              polliUrl += `&negative_prompt=${encodeURIComponent(finalNegativePrompt.slice(0, 120))}`;
            }

            const polliResponse = await fetch(polliUrl, {
              headers: { "User-Agent": "Nexora-App/2.0" },
              signal: AbortSignal.timeout(8000)
            });

            if (polliResponse.ok) {
              const contentType = polliResponse.headers.get('content-type') || '';
              if (!contentType.includes('image/')) {
                continue;
              }

              const arrayBuffer = await polliResponse.arrayBuffer();
              // Prevent returning static 122643-byte fallback placeholder or corrupted data
              if (arrayBuffer.byteLength === 122643 || arrayBuffer.byteLength < 5000) {
                console.warn("[Pollinations] Detected static fallback placeholder or invalid buffer, rejecting.");
                continue;
              }

              // Verify buffer starts with valid image magic bytes (JPEG: ffd8 or PNG: 89504e47)
              const firstBytes = Buffer.from(arrayBuffer.slice(0, 4));
              const isJpeg = firstBytes[0] === 0xff && firstBytes[1] === 0xd8;
              const isPng = firstBytes[0] === 0x89 && firstBytes[1] === 0x50;
              if (!isJpeg && !isPng) {
                continue;
              }

              const base64 = Buffer.from(arrayBuffer).toString('base64');
              const mimeType = contentType.includes('png') ? 'image/png' : 'image/jpeg';
              return `data:${mimeType};base64,${base64}`;
            }
          } catch {
            // Silently advance to the next candidate model
          }
        }
        throw new Error("Pollinations image generation is temporarily unavailable.");
      };

      let width = 1024;
      let height = 1024;
      if (aspectRatio === "16:9") { width = 1280; height = 720; }
      else if (aspectRatio === "9:16") { width = 720; height = 1280; }
      else if (aspectRatio === "4:3") { width = 1152; height = 864; }
      else if (aspectRatio === "3:4") { width = 864; height = 1152; }

      // ==========================================
      // ROUTE A: REFERENCE IMAGE EDITING MODE
      // ==========================================
      if (validatedReference) {
        const currentOp: ImageStudioOp = "REFERENCE_IMAGE_EDIT";

        // Filter eligible providers: MUST genuinely support REFERENCE_IMAGE_EDIT
        const allReferenceProviders = [
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["replicate"]
        ];

        // Determine priority based on user's selected model preference
        let prioritizedRefProviders = [...allReferenceProviders];
        if (model.startsWith("gemini") || model === "gemini-3.1-flash-image" || model === "gemini-3-pro-image") {
          prioritizedRefProviders = [STUDIO_PROVIDERS["gemini"], STUDIO_PROVIDERS["magic-hour"], STUDIO_PROVIDERS["replicate"]];
        } else if (model === "replicate-flux-dev") {
          prioritizedRefProviders = [STUDIO_PROVIDERS["replicate"], STUDIO_PROVIDERS["magic-hour"], STUDIO_PROVIDERS["gemini"]];
        } else {
          prioritizedRefProviders = [STUDIO_PROVIDERS["magic-hour"], STUDIO_PROVIDERS["gemini"], STUDIO_PROVIDERS["replicate"]];
        }

        const eligibleProviders = prioritizedRefProviders.filter(p => p.capabilities.includes(currentOp) && isProviderReady(p));

        if (eligibleProviders.length === 0) {
          console.info("[ImageStudio] operation=reference-edit result=no_eligible_provider_available");
          res.setHeader("Content-Type", "application/json");
          return res.status(503).json({
            error: "No image-editing provider is currently available. Your reference image is safe; please try again when an image-editing provider has available quota.",
            code: "PROVIDER_UNAVAILABLE"
          });
        }

        for (const provider of eligibleProviders) {
          try {
            if (provider.id === "magic-hour") {
              const mhPrompt = originalPrompt 
                ? `Transform image: ${originalPrompt}${complexionReinforcement ? ', ' + complexionReinforcement : ''}, razor sharp crisp focus, rich deep contrast, vibrant natural lighting, pristine 8k masterpiece portrait, anatomically perfect` 
                : enhancedPrompt;
              const mhUrl = await generateWithMagicHour({
                prompt: mhPrompt,
                referenceImage: validatedReference,
                aspectRatio,
                quality: quality || "2K",
                style,
                negativePrompt: finalNegativePrompt,
                editMode,
                fidelityMode
              });
              if (mhUrl) {
                recordResult(currentOp, "magic-hour", "success");
                return await sendNormalizedSuccess("magic-hour", mhUrl);
              }
            } else if (provider.id === "gemini") {
              const ai = getAIClient();
              const imageConfig: { aspectRatio?: string; imageSize?: string } = {
                aspectRatio: aspectRatio || "1:1",
              };
              let geminiSize = "1K";
              if (quality.includes("2K")) geminiSize = "2K";
              else if (quality.includes("4K")) geminiSize = "4K";
              else if (quality.includes("512")) geminiSize = "512px";
              imageConfig.imageSize = geminiSize;

              const parts = [
                {
                  inlineData: {
                    mimeType: validatedReference.mimeType,
                    data: validatedReference.base64Data,
                  },
                },
                { text: enhancedPrompt }
              ];

              const candidateModels = ["gemini-3.1-flash-image", "gemini-3-pro-image", "gemini-3.1-flash-lite-image"];
              let geminiUrl: string | null = null;

              for (const targetModel of candidateModels) {
                try {
                  const response = await ai.models.generateContent({
                    model: targetModel,
                    contents: { parts },
                    config: { imageConfig },
                  });

                  for (const part of response.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData && part.inlineData.data) {
                      geminiUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                      break;
                    }
                  }

                  if (geminiUrl) break;
                } catch (gErr: any) {
                  const errType = classifyError(gErr);
                  if (errType === "quota_exhausted" || errType === "rate_limited") {
                    throw gErr;
                  }
                }
              }

              if (geminiUrl) {
                recordResult(currentOp, "gemini", "success");
                return await sendNormalizedSuccess("gemini", geminiUrl);
              }
              throw new Error("Gemini reference generation completed without image data.");
            } else if (provider.id === "replicate") {
              const repUrl = await generateWithReplicate({
                prompt: enhancedPrompt,
                referenceImage: referenceImage,
                aspectRatio,
                editMode
              });
              if (repUrl) {
                recordResult(currentOp, "replicate", "success");
                return await sendNormalizedSuccess("replicate", repUrl);
              }
              throw new Error("Replicate reference generation did not return a valid URL.");
            }
          } catch (err: any) {
            const errType = classifyError(err);
            recordResult(currentOp, provider.id, errType, err?.message);
          }
        }

        // All eligible reference providers failed - NEVER fall back to text2img
        console.info("[ImageStudio] operation=reference-edit result=all_eligible_providers_exhausted");
        res.setHeader("Content-Type", "application/json");
        return res.status(503).json({
          error: "No image-editing provider is currently available. Your reference image is safe; please try again when an image-editing provider has available quota.",
          code: "PROVIDER_UNAVAILABLE"
        });
      }

      // ==========================================
      // ROUTE B: NORMAL TEXT-TO-IMAGE MODE
      // ==========================================
      const currentTextOp: ImageStudioOp = "TEXT_TO_IMAGE";

      const allTextProviders = [
        STUDIO_PROVIDERS["gemini"],
        STUDIO_PROVIDERS["magic-hour"],
        STUDIO_PROVIDERS["together"],
        STUDIO_PROVIDERS["huggingface"],
        STUDIO_PROVIDERS["replicate"],
        STUDIO_PROVIDERS["pollinations"]
      ];

      // Determine priority ordering based on requested model
      let prioritizedTextProviders: StudioProvider[] = [];
      if (model.startsWith("pollinations")) {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["replicate"]
        ];
      } else if (model === "magic-hour") {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["replicate"]
        ];
      } else if (model === "together-flux") {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["replicate"]
        ];
      } else if (model === "huggingface-flux") {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["replicate"]
        ];
      } else if (model === "replicate-flux-dev") {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["replicate"],
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["magic-hour"]
        ];
      } else {
        prioritizedTextProviders = [
          STUDIO_PROVIDERS["gemini"],
          STUDIO_PROVIDERS["magic-hour"],
          STUDIO_PROVIDERS["together"],
          STUDIO_PROVIDERS["huggingface"],
          STUDIO_PROVIDERS["pollinations"],
          STUDIO_PROVIDERS["replicate"]
        ];
      }

      const eligibleTextProviders = prioritizedTextProviders.filter(p => p.capabilities.includes(currentTextOp) && isProviderReady(p));

      // Always ensure Pollinations is included in the chain as guaranteed fallback
      if (!eligibleTextProviders.some(p => p.id === "pollinations")) {
        eligibleTextProviders.push(STUDIO_PROVIDERS["pollinations"]);
      }

      for (const provider of eligibleTextProviders) {
        try {
          if (provider.id === "gemini") {
            const ai = getAIClient();
            const imageConfig: { aspectRatio?: string; imageSize?: string } = {
              aspectRatio: aspectRatio || "1:1",
            };
            let geminiSize = "1K";
            if (quality.includes("2K")) geminiSize = "2K";
            else if (quality.includes("4K")) geminiSize = "4K";
            else if (quality.includes("512")) geminiSize = "512px";
            imageConfig.imageSize = geminiSize;

            const parts = [{ text: enhancedPrompt }];
            const candidateModels = [model, "gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-3-pro-image"].filter((v, i, a) => v && a.indexOf(v) === i);
            let geminiUrl: string | null = null;

            for (const targetModel of candidateModels) {
              try {
                const response = await ai.models.generateContent({
                  model: targetModel,
                  contents: { parts },
                  config: { imageConfig },
                });

                for (const part of response.candidates?.[0]?.content?.parts || []) {
                  if (part.inlineData && part.inlineData.data) {
                    geminiUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    break;
                  }
                }
                if (geminiUrl) break;
              } catch (gErr: any) {
                const errType = classifyError(gErr);
                if (errType === "quota_exhausted" || errType === "rate_limited") {
                  throw gErr;
                }
              }
            }

            if (geminiUrl) {
              recordResult(currentTextOp, "gemini", "success");
              return await sendNormalizedSuccess("gemini", geminiUrl);
            }
            throw new Error("Gemini text-to-image did not return image data.");
          } else if (provider.id === "magic-hour") {
            const mhUrl = await generateWithMagicHour({
              prompt: enhancedPrompt,
              aspectRatio,
              quality,
              style,
              negativePrompt: finalNegativePrompt
            });
            if (mhUrl) {
              recordResult(currentTextOp, "magic-hour", "success");
              return await sendNormalizedSuccess("magic-hour", mhUrl);
            }
            throw new Error("Magic Hour text-to-image did not return an image URL.");
          } else if (provider.id === "together") {
            const togetherKey = (process.env.TOGETHER_API_KEY || "").trim();
            let tWidth = 1024;
            let tHeight = 1024;
            if (aspectRatio === "16:9") { tWidth = 1280; tHeight = 768; }
            else if (aspectRatio === "9:16") { tWidth = 768; tHeight = 1280; }
            else if (aspectRatio === "4:3") { tWidth = 1024; tHeight = 768; }
            else if (aspectRatio === "3:4") { tWidth = 768; tHeight = 1024; }

            const togetherResponse = await fetch("https://api.together.xyz/v1/images/generations", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${togetherKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "black-forest-labs/FLUX.1-schnell-Free",
                prompt: enhancedPrompt,
                width: tWidth,
                height: tHeight,
                steps: 4,
                n: 1,
                response_format: "url"
              })
            });

            if (togetherResponse.ok) {
              const data = await togetherResponse.json();
              const url = data.data?.[0]?.url;
              if (url) {
                recordResult(currentTextOp, "together", "success");
                return await sendNormalizedSuccess("together", url);
              }
            }
            const tErr = new Error(`Together AI failed with status ${togetherResponse.status}`);
            (tErr as any).status = togetherResponse.status;
            throw tErr;
          } else if (provider.id === "huggingface") {
            const hfToken = (process.env.HF_TOKEN || "").trim();
            const hfResponse = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ inputs: enhancedPrompt })
            });

            if (hfResponse.ok) {
              const arrayBuffer = await hfResponse.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              const mimeType = hfResponse.headers.get('content-type') || 'image/jpeg';
              recordResult(currentTextOp, "huggingface", "success");
              return await sendNormalizedSuccess("huggingface", `data:${mimeType};base64,${base64}`);
            }
            const hfErr = new Error(`Hugging Face inference failed with status ${hfResponse.status}`);
            (hfErr as any).status = hfResponse.status;
            throw hfErr;
          } else if (provider.id === "replicate") {
            const repUrl = await generateWithReplicate({
              prompt: enhancedPrompt,
              aspectRatio
            });
            if (repUrl) {
              recordResult(currentTextOp, "replicate", "success");
              return await sendNormalizedSuccess("replicate", repUrl);
            }
            throw new Error("Replicate did not return an image URL.");
          } else if (provider.id === "pollinations") {
            const polliUrl = await generateWithPollinations(width, height);
            if (polliUrl) {
              recordResult(currentTextOp, "pollinations", "success");
              return await sendNormalizedSuccess("pollinations", polliUrl);
            }
            throw new Error("Pollinations did not return an image.");
          }
        } catch (err: any) {
          const errType = classifyError(err);
          recordResult(currentTextOp, provider.id, errType, err?.message);
        }
      }

      // If all text providers failed
      console.info("[ImageStudio] operation=text-to-image result=all_providers_exhausted");
      res.setHeader("Content-Type", "application/json");
      return res.status(503).json({
        error: "All image generation engines are currently busy. Please try again in a few moments.",
        code: "PROVIDER_UNAVAILABLE"
      });
    } catch (error: any) {
      return sendCategorizedError(error, 500, "GENERATION_ERROR");
    }
  });

  // Supabase proxy helper
  function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (!url || !key || url.includes("your-project-ref") || !url.startsWith("https://")) {
      return null;
    }
    return { url: url.replace(/\/+$/, ""), key };
  }

  // Supabase Image History GET Proxy
  app.get("/api/supabase/image-history", async (req, res) => {
    const config = getSupabaseConfig();
    if (!config) {
      return res.json({ success: false, items: [], message: "Supabase not configured" });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const limit = Math.min(Number(req.query.limit) || 25, 50);
      const response = await fetch(
        `${config.url}/rest/v1/image_history?select=id,image_url,prompt,negative_prompt,aspect_ratio,quality,model,style,created_at&order=created_at.desc&limit=${limit}`,
        {
          headers: {
            apikey: config.key,
            Authorization: `Bearer ${config.key}`,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`Supabase REST fetch returned ${response.status}:`, errorText.slice(0, 100));
        return res.json({ success: false, items: [] });
      }

      const rows = await response.json();
      const items = (rows || []).map((row: any) => ({
        id: row.id,
        imageUrl: row.image_url,
        prompt: row.prompt,
        negativePrompt: row.negative_prompt || undefined,
        aspectRatio: row.aspect_ratio || "1:1",
        quality: row.quality || "1K",
        model: row.model,
        style: row.style,
        timestamp: new Date(row.created_at).getTime(),
      }));

      return res.json({ success: true, items });
    } catch (err: any) {
      console.warn("Supabase fetchImageHistory server error:", err?.message || err);
      return res.json({ success: false, items: [] });
    }
  });

  // Supabase Image History POST Proxy
  app.post("/api/supabase/image-history", async (req, res) => {
    const config = getSupabaseConfig();
    if (!config) {
      return res.json({ success: false, message: "Supabase not configured" });
    }

    try {
      const { item } = req.body;
      if (!item) {
        return res.status(400).json({ success: false, message: "Missing item" });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${config.url}/rest/v1/image_history`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          image_url: item.imageUrl,
          prompt: item.prompt,
          negative_prompt: item.negativePrompt || null,
          aspect_ratio: item.aspectRatio,
          quality: item.quality,
          model: item.model,
          style: item.style,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`Supabase insert returned ${response.status}:`, errorText.slice(0, 100));
        return res.json({ success: false });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.warn("Supabase insertImageHistory server error:", err?.message || err);
      return res.json({ success: false });
    }
  });

  // Terminal handler for unmatched /api routes to NEVER fall through to Vite SPA index.html
  app.all(["/api", "/api/*"], (req, res) => {
    res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global uncaught API error handler ensuring all /api errors return JSON
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[API Uncaught Error on ${req.method} ${req.originalUrl}]:`, err);
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || "Internal server error"
    });
  });

  // Serve static assets from public directory (e.g. fonts)
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Explicitly shield Vite middleware from ever intercepting /api requests
    app.use((req, res, next) => {
      if (req.url.startsWith("/api") || req.originalUrl?.startsWith("/api")) {
        return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.url.startsWith("/api") || req.originalUrl?.startsWith("/api")) {
        return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
