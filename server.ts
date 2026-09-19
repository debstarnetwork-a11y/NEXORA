import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import pptxgen from "pptxgenjs";
import JSZip from "jszip";

let aiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;
let openaiQuotaExhausted = false;

function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Chat/Text generation API
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, tone, language, files } = req.body;
      const requestedTone = tone || "Academic";
      const requestedLanguage = language || "English (US)";
      let systemInstruction = `SYSTEM DIRECTIVE: You are an expert AI Assistant instructed to respond in a **${requestedTone}** style.

MANDATORY RULES:
1. EXTENDED LENGTH: The text must be extended beyond regular AI limit per prompt unless the user says or prompts otherwise. Provide an extensive, comprehensive, deep-dive, multi-page response (aiming for 1,500 to 2,500+ words). Thoroughly unpack every concept, mechanism, historical context, granular analysis, and nuanced implication without truncating or summarizing.
2. STANDALONE HEADINGS: Headings must stand alone and body text must be under each heading. Format all headings using markdown (e.g. ## Heading Title) strictly on their own separate line. Never place body text on the same line as a heading.
3. PARAGRAPH INDENTATION: Paragraphs must be clearly separated from each other by indentation. Write coherent, full paragraphs where each paragraph starts with indentation.`;

      if (requestedLanguage === 'English (UK)' || requestedLanguage === 'en-GB' || requestedLanguage.toLowerCase().includes('uk')) {
        systemInstruction += `\n4. UK ENGLISH (BRITISH ENGLISH) MANDATE: The user has selected UK English. You MUST respond strictly in British / UK English. Always use standard British spelling (e.g., 'colour', 'behaviour', 'analyse', 'paralyse', 'programme', 'centre', 'theatre', 'defence', 'licence' [noun], 'ageing', 'judgement', 'skilful', 'prioritise', 'organise', 'catalogue') and British terminology and idioms across the entirety of your response.`;
      } else if (requestedLanguage === 'English (US)' || requestedLanguage === 'en-US' || requestedLanguage.toLowerCase().includes('us')) {
        systemInstruction += `\n4. US ENGLISH (AMERICAN ENGLISH) MANDATE: The user has selected US English. You MUST respond in American / US English using standard American spelling (e.g., 'color', 'behavior', 'analyze', 'paralyze', 'program', 'center', 'theater', 'defense', 'license', 'aging', 'judgment', 'skillful', 'prioritize', 'organize', 'catalog') throughout.`;
      } else if (requestedLanguage) {
        systemInstruction += `\n4. LANGUAGE MANDATE: You MUST respond in **${requestedLanguage}**.`;
      }

      if (requestedTone === 'Academic') {
        systemInstruction += `\n5. ACADEMIC & CITATION INTEGRITY: If you must reference an author or a study, they MUST be a real, verifiable author or publication. You MUST NOT hallucinate citations. All references and citations MUST be properly formatted using the Harvard referencing style (Author, Year) with a full Reference list at the end.`;
      }

      systemInstruction += `\n6. TEXTBOOK CHEMICAL SUBSTANCE & STRUCTURE MANDATE:
When the user asks to draw, label, present, or explain any chemical substance, molecule, or compound (e.g., Water H₂O, Methane CH₄, Carbon Dioxide CO₂, Ammonia NH₃, Ethanol C₂H₅OH, Benzene C₆H₆, Glucose C₆H₁₂O₆, etc.):
- You MUST represent the chemical formula and structure exactly the way they appear in authoritative standard chemistry textbooks.
- Provide the exact Molecular Formula (e.g. CH₄, H₂O), IUPAC Chemical Name, Molar Mass, and Valence Electron count.
- Detail the 2D Structural/Lewis Formula (showing central atoms, single/double/triple covalent bonds, and non-bonding electron lone pairs).
- Detail the 3D VSEPR Geometry and 3D Wedge-and-Dash stereochemical projection (with solid in-plane lines, forward solid wedges, and backward dashed bonds).
- Explicitly state exact bond angles (e.g., 109.5° for tetrahedral methane, 104.5° for bent water with lone pair repulsion, 107.3° for trigonal pyramidal ammonia, 180° for linear CO₂), bond lengths (e.g., 1.09 Å for C—H, 0.96 Å for O—H), hybridization (sp³, sp², sp), and molecular polarity / dipole moments (e.g. μ = 1.85 D for polar water, μ = 0 D for non-polar methane).`;

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
            return res.json({ text: response.choices[0].message.content });
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

      res.json({ text });
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

REAL-LIFE SCIENTIFIC & TEXTBOOK FIDELITY DIRECTIVE:
You must depict biological and scientific concepts and structures exactly as they appear in real life and in authoritative academic textbooks (such as Campbell Biology, Gray's Anatomy, Guyton & Hall Physiology, Lehninger Biochemistry).

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
- "euglena" (Euglena gracilis / viridis flagellated protist)
- "amoeba" (Amoeba proteus with lobopodia, pseudopodia)
- "paramecium" (Paramecium caudatum ciliate with oral groove, contractile vacuoles)
- "agama-lizard"
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
If the structure is ANY OTHER biological, anatomical, physical, mechanical, or chemical structure (e.g. "microscope", "telescope", "car engine", "jet engine", "airplane wing lift", "hydra", "synapse", "sarcomere", "kidney nephron loop", "human liver lobule", "ribosome translating mRNA", "sperm cell", "ovum fertilization", "saturn and rings", "earth interior core", "dna replication fork", "CRISPR-Cas9", "transistor gate", etc.):
1. Set "diagramType" to "custom-concept".
2. Provide a magnificent, realistic, multi-layered SVG in "customSvgCode" centered at (0,0) fitting within roughly -220 to +220 X and -140 to +140 Y:
   - Must use rich vector paths (<g>, <path>, <ellipse>, <circle>, <polygon>, <rect>, <line>)
   - Must include realistic anatomical/structural textures, cross-sections, highlights, and shading
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
  "diagramType": "animal-cell" | "plant-cell" | "bony-fish" | "human-heart" | "human-brain" | "neuron" | "human-eye" | "nephron-kidney" | "mitochondria" | "chloroplast" | "bacterial-cell" | "dna-helix" | "lungs-respiratory" | "stomach-digestive" | "skin-anatomy" | "human-ear" | "flower-anatomy" | "bacteriophage" | "volcano" | "methane-molecule" | "water-molecule" | "hydrocarbon-alkanes" | "chemical-substance" | "bohr-atom" | "custom-concept",
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
      const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;

      const mimeType = match[1];
      const base64Data = match[2];

      const promptText = `You are an expert biometric identity, facial structure, and photographic character analyst.
Analyze the human subject in this reference image with extreme fidelity and photographic granularity.
This biometric profile will be used by generative diffusion models to reproduce this EXACT individual in new scenes, poses, and outfits while retaining 100% authentic facial structure, identity, skin tone, and likeness.

Analyze the image carefully and return a JSON object with:
{
  "ageAndGender": "Estimated age bracket and biological presentation (e.g., 'A young woman in her early 20s', 'A middle-aged man in his 40s')",
  "ethnicityAndComplexion": "Exact objective skin tone and natural undertones (e.g., 'Warm deep-bronze skin with rich golden undertones and smooth natural texture', 'Fair ivory complexion with subtle warm peachy undertones', 'Warm olive skin with neutral golden undertones')",
  "facialFeatures": "Comprehensive facial geometry: face shape (oval, heart, square, defined jawline), cheekbones, eye shape and color, eyelid crease/epicanthic fold, eyebrow arch and thickness, nose bridge width and tip shape, lip fullness and cupid's bow, chin shape, natural expression",
  "hairStyle": "Exact hair texture (straight 1A, wavy 2B, curly 3C, coily 4C), color, highlights/undertones, hair length, parting line, and styling or hair accessories (headbands, etc.)",
  "attireDescription": "Precise breakdown of visible clothing: garment type, neckline, sleeves, buttons, fabric type, colors, patterns, fit, and any visible jewelry, glasses, or accessories",
  "strictPreservationPrompt": "An exhaustive, high-density biometric description: e.g., 'Authentic portrait of the exact same subject: a 24-year-old woman of African descent with a warm deep-bronze complexion and smooth skin. She has an oval face with sculpted high cheekbones, dark brown almond-shaped eyes, a straight slender nose, full symmetrical lips, and long straight dark hair with subtle mahogany undertones styled back with a simple white fabric headband. She is wearing a white square-neck peasant blouse with front button detailing.'",
  "negativePromptExclusions": "different person, wrong face, altered facial features, wrong skin tone, different ethnicity, wrong age, distorted face, blurry, bad anatomy"
}
Output raw JSON only.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      const ai = getAIClient();

      for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model,
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
            const msg = String(err?.message || "");
            const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("429") || msg.includes("high demand");
            if (isTransient && attempt === 0) {
              await new Promise((r) => setTimeout(r, 600));
              continue;
            }
            break; // try next candidate model
          }
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
        attireDescription: "Identical clothing, fabrics, colors, and styling from reference photo",
        facialFeatures: "Distinctive facial structure, balanced bone structure, natural eyes and lips",
        hairStyle: "Natural hair texture, color, and style from reference photo",
        strictPreservationPrompt: "Authentic portrait preserving exact subject likeness, facial geometry, natural skin tone, and attire",
        negativePromptExclusions: "different person, wrong face, altered facial features, distorted anatomy"
      });
    } catch (err: any) {
      console.warn("Character analysis fallback handler:", err);
      res.json({
        ethnicityAndComplexion: "Warm natural complexion with defined facial structure and authentic undertones",
        attireDescription: "Identical clothing, fabrics, colors, and styling from reference photo",
        facialFeatures: "Distinctive facial structure, balanced bone structure, natural eyes and lips",
        hairStyle: "Natural hair texture, color, and style from reference photo",
        strictPreservationPrompt: "Authentic portrait preserving exact subject likeness, facial geometry, natural skin tone, and attire",
        negativePromptExclusions: "different person, wrong face, altered facial features, distorted anatomy"
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

  // Image generation API
  app.post("/api/generate-image", async (req, res) => {
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
        editMode = null,
        faceLock = true,
        complexionLock = null,
        attireLock = null,
        lockComplexion = true,
        lockAttire = true,
        facialFeatures = null,
        hairStyle = null,
        strictPreservationPrompt = null
      } = req.body;
      
      let promptCore = (prompt || "").trim();
      let subjectDesc = "";

      if (referenceImage) {
        let finalStrictPrompt = strictPreservationPrompt;
        let finalComplexion = complexionLock;
        let finalFacial = facialFeatures;
        let finalHair = hairStyle;
        let finalAttire = attireLock;

        const isPlaceholder = (t?: string | null) => 
          !t || 
          t.trim().length < 15 || 
          t.toLowerCase().includes("maintain exact") || 
          t.toLowerCase().includes("maintain 100%") || 
          t.toLowerCase().includes("reference photo") || 
          t.toLowerCase().includes("reference image");

        // If client provided placeholder or empty traits, run quick forensic biometric vision analysis
        if (isPlaceholder(finalStrictPrompt) || isPlaceholder(finalComplexion)) {
          try {
            const autoAnalyzed = await analyzeReferenceImageBiometrics(referenceImage);
            if (autoAnalyzed) {
              if (autoAnalyzed.strictPreservationPrompt) finalStrictPrompt = autoAnalyzed.strictPreservationPrompt;
              if (autoAnalyzed.ethnicityAndComplexion) finalComplexion = autoAnalyzed.ethnicityAndComplexion;
              if (autoAnalyzed.facialFeatures && !finalFacial) finalFacial = autoAnalyzed.facialFeatures;
              if (autoAnalyzed.hairStyle && !finalHair) finalHair = autoAnalyzed.hairStyle;
              if (autoAnalyzed.attireDescription && isPlaceholder(finalAttire)) finalAttire = autoAnalyzed.attireDescription;
            }
          } catch (autoErr) {
            console.warn("Auto vision scan fallback:", autoErr);
          }
        }

        if (finalStrictPrompt && !isPlaceholder(finalStrictPrompt)) {
          subjectDesc = finalStrictPrompt.trim();
        } else {
          const traits: string[] = [];
          if (lockComplexion !== false && finalComplexion && !isPlaceholder(finalComplexion)) {
            traits.push(finalComplexion.trim());
          }
          if (finalFacial && typeof finalFacial === 'string' && finalFacial.trim()) {
            traits.push(finalFacial.trim());
          }
          if (finalHair && typeof finalHair === 'string' && finalHair.trim()) {
            traits.push(finalHair.trim());
          }
          if (faceLock) {
            traits.push("exact authentic facial likeness, natural bone structure, realistic eye gaze and smile");
          }

          if (lockAttire !== false && finalAttire && !isPlaceholder(finalAttire)) {
            traits.push(`wearing ${finalAttire.trim()}`);
          }

          if (traits.length > 0) {
            subjectDesc = `Authentic portrait of the exact same subject with ${traits.join(", ")}`;
          }
        }

        let actionPhrase = "";
        if (editMode === 'background_change') {
          actionPhrase = `placed seamlessly in new background setting: ${promptCore}`;
        } else if (editMode === 'scene_change') {
          actionPhrase = `in a new environment: ${promptCore}`;
        } else if (editMode === 'posture_change') {
          actionPhrase = `posing naturally: ${promptCore}`;
        } else if (editMode === 'face_revamp') {
          actionPhrase = `crystal-clear razor-sharp facial definition, micro-detail skin pores, pristine eye reflections: ${promptCore}`;
        } else {
          actionPhrase = promptCore;
        }

        if (subjectDesc) {
          promptCore = `${subjectDesc}, ${actionPhrase}`;
        } else {
          promptCore = `${actionPhrase}`;
        }
      }

      let styleModifier = "";
      switch(style) {
          case "Nexora Vision Pro": 
            styleModifier = ", photorealistic masterpiece, 8k uhd, razor-sharp focus, symmetrical facial features, accurate anatomy, natural skin pores, cinematic lighting"; 
            break;
          case "Nexora Studio XL": 
            styleModifier = ", professional studio photography, medium format camera, sharp focal plane, perfect lighting, crisp textures, ultra-detailed"; 
            break;
          case "Nexora Cinematic": 
            styleModifier = ", 35mm anamorphic movie still, cinematic film grading, crystal clear focal point, 8k resolution, photorealism"; 
            break;
          case "Nexora Pixar 3D":
            styleModifier = ", single unified character frame, iconic Disney Pixar 3D animation style, adorable expressive character design, soft subsurface skin scattering, large soulful expressive eyes, smooth 3D CGI rendering, charming lighting, RenderMan quality, vibrant rich color palette, no comparison";
            break;
          case "Nexora Hand-Sketch":
            styleModifier = ", single unified frame, authentic hand-drawn graphite pencil sketch, delicate charcoal shading, fine cross-hatching line art, textured vintage sketchbook paper grain, artist pencil drawing illustration, hand-sketched masterpiece";
            break;
          case "Nexora Watercolor Artistry":
            styleModifier = ", single unified frame, ethereal watercolor painting, fluid translucent color washes, wet-on-wet paint bleeds, visible rough cold-press watercolor paper texture, delicate ink linework accents, fine art watercolor illustration";
            break;
          case "Nexora Cyberpunk Neon":
            styleModifier = ", single unified frame, futuristic cyberpunk aesthetic, high-tech neon lighting, glowing holographic reflections, rain-slicked dark cyber metropolis, vivid magenta and cyan backlight, detailed futuristic cyber gear, cinematic atmosphere";
            break;
          case "Nexora Oil Painting Masterpiece":
            styleModifier = ", single unified frame, classical oil painting on canvas, thick impasto palette knife textures, rich buttery paint strokes, Rembrandt chiaroscuro lighting, deep luminous colors, museum fine art masterpiece";
            break;
          case "Nexora Claymation":
            styleModifier = ", single unified frame, handcrafted claymation aesthetic, tactile plasticine clay character modeling, charming stop-motion animation look, studio macro lighting, subtle artisan clay fingerprint textures, miniature diorama setting";
            break;
          case "Nexora 3D Papercraft":
            styleModifier = ", single unified frame, intricate layered papercraft art, 3D folded origami sculpture, delicate multi-layered paper cutouts, depth shadowbox lighting, clean geometric paper folds, tactile craft paper textures";
            break;
          case "Nexora Architectural Concept":
            styleModifier = ", single unified frame, clean modernist architectural visualization, precise structural lines, warm natural ambient daylight, minimalist spatial composition, photorealistic building materials and glass reflections";
            break;
          case "Nexora Film Noir": 
            styleModifier = ", classic film noir style, dramatic black and white chiaroscuro lighting, deep shadows, vintage 35mm monochrome film grain"; 
            break;
          case "Nexora Polaroid": 
            styleModifier = ", vintage polaroid 600 instant photograph, authentic analog color grading, soft flash illumination, warm faded nostalgic tones"; 
            break;
          case "Nexora Animate Cartoon": 
            styleModifier = ", vibrant animated cartoon style, playful whimsical character illustration, crisp clean outlines, expressive dynamic poses, smooth cel shading"; 
            break;
          case "Nexora Stick Cartoon": 
            styleModifier = ", single isolated character, pure minimalist stick figure cartoon drawing, simple black stick figure line art, solid plain white background"; 
            break;
          case "Nexora Digital Art": 
            styleModifier = ", high-end digital concept art, sharp detailed lines, vibrant atmospheric lighting, intricate details"; 
            break;
          case "Nexora Anime High-Res": 
            styleModifier = ", Makoto Shinkai anime aesthetic, high-resolution anime illustration, lush detailed backgrounds, clean anime cel shading"; 
            break;
          case "Nexora Vision Fast": 
            styleModifier = ", highly detailed, sharp focus, dynamic composition, 8k resolution, clear lighting"; 
            break;
          case "Nexora Vision Lite": 
            styleModifier = ", clean and crisp digital rendering, natural balanced daylight, sharp lines, light uncluttered composition"; 
            break;
          default:
            if (antiDeformation) {
              styleModifier = ", ultra-sharp focus, pristine 8k resolution, symmetrical face, clear eyes, anatomically correct hands and body, highly detailed texture, professional photography";
            }
            break;
      }

      const isStylizedArt = /cartoon|stick|pixar|sketch|drawing|watercolor|oil painting|claymation|papercraft|origami|anime/i.test(`${style} ${promptCore}`);

      const qualityTail = antiDeformation 
        ? (isStylizedArt 
            ? ", pristine artistic craftsmanship, clean composition, award-winning illustration quality, single unified frame, no split screen"
            : ", master photography, 8k uhd, crystal clear focus, anatomically correct hands, pristine detail, single unified frame, no split screen")
        : ", single unified frame, single image, no split screen";

      const enhancedPrompt = `${promptCore}${styleModifier}${qualityTail}`;

      const defaultNegative = "split screen, side by side, comparison, diptych, collage, grid, multiple panels, blurry, out of focus, low quality, deformed hands, extra fingers, missing fingers, fused fingers, malformed limbs, distorted anatomy, bad eyes, low resolution, artifacts, watermark";
      const finalNegativePrompt = (negativePrompt || (antiDeformation ? defaultNegative : "")).trim();

      // Pollinations generator helper with model fallback cascade
      const generateWithPollinations = async (targetWidth: number, targetHeight: number) => {
        const seed = Math.floor(Math.random() * 1000000000);
        const candidatePollinationModels = referenceImage ? ['flux-realism', 'flux', 'sana', 'turbo'] : ['flux', 'flux-realism', 'turbo', 'sana'];

        for (const pModel of candidatePollinationModels) {
          try {
            let polliUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=${pModel}&width=${targetWidth}&height=${targetHeight}&seed=${seed}&nologo=true&safe=false`;
            if (finalNegativePrompt) {
              polliUrl += `&negative_prompt=${encodeURIComponent(finalNegativePrompt)}`;
            }

            const polliResponse = await fetch(polliUrl, {
              headers: { "User-Agent": "Nexora-App/2.0" },
              signal: AbortSignal.timeout(9000)
            });

            if (polliResponse.ok) {
              const arrayBuffer = await polliResponse.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              const mimeType = polliResponse.headers.get('content-type') || 'image/jpeg';
              return `data:${mimeType};base64,${base64}`;
            }
          } catch (pollErr) {
            console.warn(`Pollinations ${pModel} attempt failed, trying next candidate...`, pollErr);
          }
        }
        throw new Error("Image generation service is temporarily busy across all nodes. Please try again in a few moments.");
      };

      let width = 1024;
      let height = 1024;
      if (aspectRatio === "16:9") { width = 1280; height = 720; }
      else if (aspectRatio === "9:16") { width = 720; height = 1280; }
      else if (aspectRatio === "4:3") { width = 1152; height = 864; }
      else if (aspectRatio === "3:4") { width = 864; height = 1152; }

      if (model === 'pollinations-flux' || model === 'pollinations-turbo' || (referenceImage && !model.startsWith('replicate-') && !model.startsWith('together-') && !model.startsWith('huggingface-') && !model.startsWith('gemini-'))) {
        const imageUrl = await generateWithPollinations(width, height);
        return res.json({ imageUrl });
      }

      if (model === 'replicate-flux-dev') {
        const replicateKey = (process.env.REPLICATE_API_TOKEN || "").trim();
        if (!replicateKey) {
          return res.status(400).json({ error: "Missing REPLICATE_API_TOKEN. Please add your key in Settings > Secrets." });
        }
        
        let repRatio = "1:1";
        if (aspectRatio === "16:9") repRatio = "16:9";
        else if (aspectRatio === "9:16") repRatio = "9:16";
        else if (aspectRatio === "4:3") repRatio = "3:2";
        else if (aspectRatio === "3:4") repRatio = "2:3";

        const replicateInput: any = {
          prompt: enhancedPrompt,
          aspect_ratio: repRatio,
          output_format: "jpg",
          output_quality: 90
        };

        if (referenceImage) {
          replicateInput.image = referenceImage;
          replicateInput.prompt_strength = 0.72;
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
            // Sometimes prefer: wait times out and returns processing status
            if (data.status === "starting" || data.status === "processing") {
                throw new Error("Replicate is taking longer than expected. Please try again in a moment.");
            }
            throw new Error("No image URL returned by Replicate.");
        }

        return res.json({ imageUrl: url });
      }

      if (model === 'together-flux') {
        const togetherKey = (process.env.TOGETHER_API_KEY || "").trim();
        if (!togetherKey) {
          return res.status(400).json({ error: "Missing TOGETHER_API_KEY secret. Please add your Together API key in Settings > Secrets to use Flux." });
        }
        
        let width = 1024;
        let height = 1024;
        if (aspectRatio === "16:9") { width = 1280; height = 768; }
        else if (aspectRatio === "9:16") { width = 768; height = 1280; }
        else if (aspectRatio === "4:3") { width = 1024; height = 768; }
        else if (aspectRatio === "3:4") { width = 768; height = 1024; }

        const togetherResponse = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${togetherKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: enhancedPrompt,
            width: width,
            height: height,
            steps: 4,
            n: 1,
            response_format: "url"
          })
        });

        if (!togetherResponse.ok) {
          const errText = await togetherResponse.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            if (parsed.error?.message) {
              parsedMsg = parsed.error.message;
            }
          } catch {}
          throw new Error(`Together API error: ${parsedMsg}`);
        }

        const data = await togetherResponse.json();
        const url = data.data?.[0]?.url;
        if (!url) throw new Error("No image URL returned by Together AI");
        return res.json({ imageUrl: url });
      }

      if (model === 'huggingface-flux') {
        const hfToken = (process.env.HF_TOKEN || "").trim();
        if (!hfToken) {
          return res.status(400).json({ 
            error: "Missing HF_TOKEN secret. Hugging Face is completely free with no credit card required! 1) Sign up free at huggingface.co, 2) Go to Settings > Access Tokens > Create 'Read' token, 3) Add it in Settings > Secrets as HF_TOKEN." 
          });
        }

        const hfResponse = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: enhancedPrompt })
        });

        if (!hfResponse.ok) {
          const errText = await hfResponse.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            if (parsed.error) parsedMsg = parsed.error;
          } catch {}
          throw new Error(`Hugging Face error: ${parsedMsg}`);
        }

        const arrayBuffer = await hfResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = hfResponse.headers.get('content-type') || 'image/jpeg';
        return res.json({ imageUrl: `data:${mimeType};base64,${base64}` });
      }
      
      // Default to Gemini
      const ai = getAIClient();
      const imageConfig: { aspectRatio?: string; imageSize?: string } = {
        aspectRatio: aspectRatio || "1:1",
      };
      if (model === 'gemini-3.1-flash-image' || model === 'gemini-3-pro-image') {
        let geminiSize = "1K";
        if (quality.includes("2K")) geminiSize = "2K";
        else if (quality.includes("4K")) geminiSize = "4K";
        else if (quality.includes("512")) geminiSize = "512px";
        imageConfig.imageSize = geminiSize;
      }

      const parts: any[] = [];
      if (referenceImage && typeof referenceImage === 'string') {
        const match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }
      parts.push({ text: enhancedPrompt });

      let response;
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: {
            parts,
          },
          config: {
            imageConfig,
          },
        });
      } catch (geminiImgErr: any) {
        const msg = String(geminiImgErr?.message || "");
        if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
          console.warn("Gemini service unavailable, activating photorealistic cluster fallback...", msg);
          const fallbackUrl = await generateWithPollinations(width, height);
          return res.json({ imageUrl: fallbackUrl });
        } else {
          // Bubble up 429 and other errors so the user knows they hit a quota limit
          throw geminiImgErr;
        }
      }

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          break;
        }
      }

      if (!imageUrl) {
        throw new Error("No image generated");
      }

      res.json({ imageUrl });
    } catch (error: any) {
      let errorMsg = "An error occurred with the Image API";
      if (error && typeof error.message === 'string') {
          errorMsg = error.message;
      } else if (typeof error === 'string') {
          errorMsg = error;
      }

      if (req.body.model === 'replicate-flux-dev' && (errorMsg.includes("402") || /insufficient credit|billing/i.test(errorMsg))) {
          errorMsg = "Replicate Error: Insufficient credits on your Replicate account. Please switch to Gemini 3.1 Flash Image in the model selector, or add credits at replicate.com/account/billing.";
      } else if (req.body.model === 'replicate-flux-dev' && errorMsg.toLowerCase().includes("nsfw")) {
          errorMsg = "Replicate Error: The prompt triggered Replicate's safety filter.";
      }
      
      // Try to parse the original error to not show raw JSON
      try {
          const jsonMatch = errorMsg.match(/\{.*\}/s);
          if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0].replace(/\n/g, '\\n'));
              if (parsed?.error?.message) {
                  errorMsg = parsed.error.message;
              }
          }
      } catch(e) {}
      
      if (/quota|resource_exhausted|429/i.test(errorMsg)) {
          errorMsg = "Gemini Quota Exceeded: Image models require an active paid API key / billing project. You can link your Google Cloud project or switch models.";
      }
      
      return res.status(500).json({ error: errorMsg });
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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
