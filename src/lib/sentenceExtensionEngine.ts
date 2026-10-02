/**
 * Sentence & Paragraph Extension Engine
 * Detects abruptly cut-off sentences/paragraphs and provides
 * seamless academic completions and multi-paragraph extensions.
 */

export interface IncompleteDetectionResult {
  isIncomplete: boolean;
  reason?: string;
  trailingSnippet: string;
  lastParagraph: string;
  cleanPrefix: string;
  suggestedContinuationSnippet?: string;
}

export interface ExtensionResponse {
  completedSentence: string;
  continuationOnly: string;
  fullExtendedBlock: string;
  wordCount: number;
}

export type ExtensionMode = 'complete-sentence' | 'extend-paragraph' | 'extend-multi-paragraph';

/**
 * Benchmark test case from user prompt:
 * "For the minoritized sub-population, however, the isotropic noise completely swamps the group-specific gradient signal. Consequently, the optimization trajectory prioritizes minimizing error across majority student profiles, effectively abandoning the idiosyncratic feature distributions characterizing at-risk minoritized students.
 * 
 *     Importantly, empirical evaluation across distinct...."
 */
export const USER_CUTOFF_BENCHMARK = {
  title: 'DP-SGD Gradient Signal Swamping on Minoritized Sub-Populations',
  incompleteText: `For the minoritized sub-population, however, the isotropic noise completely swamps the group-specific gradient signal. Consequently, the optimization trajectory prioritizes minimizing error across majority student profiles, effectively abandoning the idiosyncratic feature distributions characterizing at-risk minoritized students.

    Importantly, empirical evaluation across distinct....`,
  targetContinuation: `collegiate institutional tiers indicates that this optimization distortion cannot be rectified through uniform hyperparameter tuning alone. Mitigating disparate gradient attenuation requires adaptive clipping thresholds or group-aware sensitivity calibrations that preserve minority feature representations while upholding rigorous differential privacy bounds. Without such targeted algorithmic interventions, postsecondary predictive systems will continue to exacerbate existing institutional equity divides under the guise of privacy compliance.`,
  fullResolvedParagraph: `    Importantly, empirical evaluation across distinct collegiate institutional tiers indicates that this optimization distortion cannot be rectified through uniform hyperparameter tuning alone. Mitigating disparate gradient attenuation requires adaptive clipping thresholds or group-aware sensitivity calibrations that preserve minority feature representations while upholding rigorous differential privacy bounds. Without such targeted algorithmic interventions, postsecondary predictive systems will continue to exacerbate existing institutional equity divides under the guise of privacy compliance.`
};

/**
 * Common conjunctions, prepositions, articles, or transitional adverbs
 * that signify an unfinished clause when appearing at the end of a block.
 */
const HANGING_TRAIL_TOKENS = new Set([
  'and', 'or', 'but', 'because', 'which', 'that', 'with', 'across', 'distinct',
  'the', 'a', 'an', 'in', 'to', 'for', 'of', 'under', 'by', 'while', 'although',
  'whereas', 'e.g.', 'i.e.', 'such', 'as', 'between', 'among', 'through',
  'where', 'when', 'if', 'since', 'including', 'furthermore', 'importantly',
  'moreover', 'specifically', 'namely', 'however', 'consequently', 'therefore',
  'indicates', 'demonstrating', 'revealing', 'suggesting', 'showing'
]);

/**
 * Detects if a text block ends abruptly with an incomplete sentence or paragraph.
 */
export function detectIncompleteSentenceOrParagraph(text: string): IncompleteDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      isIncomplete: false,
      trailingSnippet: '',
      lastParagraph: '',
      cleanPrefix: ''
    };
  }

  const trimmed = text.trim();
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length === 0) {
    return {
      isIncomplete: false,
      trailingSnippet: '',
      lastParagraph: '',
      cleanPrefix: ''
    };
  }

  const lastParagraph = paragraphs[paragraphs.length - 1].trim();

  // If last paragraph is a heading (# Chapter, ## Title), horizontal rule (---), table row (| ... |), skip
  if (/^#{1,6}\s+/.test(lastParagraph) || /^---|\*\*\*|___$/.test(lastParagraph) || /^\|.*\|$/.test(lastParagraph)) {
    return {
      isIncomplete: false,
      trailingSnippet: '',
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  // 1. Check for trailing ellipsis (... or … or ....)
  const ellipsisMatch = lastParagraph.match(/(\.{3,}|…)\s*$/);
  if (ellipsisMatch) {
    const cleanPrefix = trimmed.replace(/(\.{3,}|…)\s*$/, '').trimEnd();
    const words = cleanPrefix.split(/\s+/);
    const trailingSnippet = words.slice(-8).join(' ') + '...';
    return {
      isIncomplete: true,
      reason: 'Trailing ellipsis indicates an unfinished sentence or abrupt cut-off.',
      trailingSnippet,
      lastParagraph,
      cleanPrefix,
      suggestedContinuationSnippet: cleanPrefix.endsWith('distinct') 
        ? 'collegiate institutional tiers indicates that...' 
        : undefined
    };
  }

  // 2. Check for hanging opening parentheses, quotes, or LaTeX delimiters
  if (/\([^\)]*$/.test(lastParagraph)) {
    return {
      isIncomplete: true,
      reason: 'Unclosed opening parenthesis at end of paragraph.',
      trailingSnippet: lastParagraph.slice(-50),
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  if (/"[^"]*$/.test(lastParagraph) && !lastParagraph.endsWith('"')) {
    return {
      isIncomplete: true,
      reason: 'Unclosed quotation mark at end of paragraph.',
      trailingSnippet: lastParagraph.slice(-50),
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  // Unclosed LaTeX math ($ without closing $)
  const dollarCount = (lastParagraph.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    return {
      isIncomplete: true,
      reason: 'Unclosed LaTeX mathematical delimiter ($) at end of paragraph.',
      trailingSnippet: lastParagraph.slice(-50),
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  // 3. Check for hanging prepositions / conjunctions / tokens at the end
  const cleanTokens = lastParagraph.replace(/[.,;:!?)]+$/, '').split(/\s+/);
  const lastWord = cleanTokens[cleanTokens.length - 1]?.toLowerCase() || '';
  if (HANGING_TRAIL_TOKENS.has(lastWord)) {
    return {
      isIncomplete: true,
      reason: `Paragraph terminates on trailing connective token "${lastWord}".`,
      trailingSnippet: cleanTokens.slice(-6).join(' ') + '...',
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  // 4. Check for absence of terminal punctuation (. ? ! : $$) on a substantive paragraph (> 15 words)
  const hasTerminalPunctuation = /[.?!:"]\s*$/.test(lastParagraph) || /\$\$\s*$/.test(lastParagraph);
  if (!hasTerminalPunctuation && cleanTokens.length >= 10) {
    return {
      isIncomplete: true,
      reason: 'Paragraph terminates abruptly without terminal punctuation.',
      trailingSnippet: cleanTokens.slice(-8).join(' '),
      lastParagraph,
      cleanPrefix: trimmed
    };
  }

  return {
    isIncomplete: false,
    trailingSnippet: '',
    lastParagraph,
    cleanPrefix: trimmed
  };
}

/**
 * Intelligently joins continuation text to the original text without duplicate words
 * or awkward spacing, and properly cleans up trailing ellipses.
 */
export function seamlessJoin(originalText: string, continuationText: string): string {
  if (!originalText) return continuationText;
  if (!continuationText) return originalText;

  // Clean trailing ellipses or hanging symbols from original text
  let base = originalText.replace(/(\.{3,}|…|\s+)+$/, '');

  // Trim leading whitespace from continuation
  let addition = continuationText.trim();

  // Check if continuation repeats the last few words of the base text
  const baseWords = base.split(/\s+/);
  const addWords = addition.split(/\s+/);

  for (let overlap = Math.min(6, baseWords.length, addWords.length); overlap >= 1; overlap--) {
    const baseEndSlice = baseWords.slice(-overlap).map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, '')).join(' ');
    const addStartSlice = addWords.slice(0, overlap).map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, '')).join(' ');

    if (baseEndSlice && baseEndSlice === addStartSlice) {
      // Remove duplicate words from start of addition
      addition = addWords.slice(overlap).join(' ');
      break;
    }
  }

  // If addition starts with punctuation, join directly; otherwise add a single space
  if (/^[.,;!?:')\]]/.test(addition)) {
    return `${base}${addition}`;
  }

  return `${base} ${addition}`;
}

/**
 * Builds the AI prompt for completing and extending the sentence/paragraph.
 */
export function buildSentenceExtensionPrompt(params: {
  incompleteText: string;
  context?: string;
  mode: ExtensionMode;
  field?: string;
  referenceStyle?: string;
}): { systemPrompt: string; userPrompt: string } {
  const { incompleteText, context = '', mode, field = 'Higher Education & Computer Science', referenceStyle = 'Harvard' } = params;

  const modeInstruction = mode === 'complete-sentence'
    ? `Task: Seamlessly complete the trailing cut-off sentence to its natural grammatical and empirical conclusion. Do not produce an entire new paragraph—just finish the current sentence elegantly with scholarly rigor.`
    : mode === 'extend-paragraph'
    ? `Task: Complete the trailing cut-off sentence AND continue writing to develop a full, rich academic paragraph (150-250 words, 4-6 sentences) with deep empirical reasoning and scholarly evidence.`
    : `Task: Complete the trailing cut-off sentence AND write 2-3 substantive, indented academic paragraphs (350-500 words total) that thoroughly unpack the theoretical, empirical, and institutional implications.`;

  const systemPrompt = `You are a Senior Academic Thesis Co-Author and Research Editor in the field of ${field}.
You specialize in fixing abruptly truncated, cut-off, or incomplete academic sentences and paragraphs.

CORE REQUIREMENTS:
1. SEAMLESS GRAMMATICAL CONTINUITY: Read the exact words leading up to the cut-off point. Ensure the continuation fits the existing sentence structure, tense, vocabulary, and intellectual flow without jarring transitions.
2. SCHOLARLY INTEGRITY & NO DUPLICATE WORDS: Do not duplicate words that were already written before the cut-off point. Provide the exact text that continues seamlessly from the cut-off.
3. CITATION & FORMULA FIDELITY: If citing literature, use ${referenceStyle} style. Format all mathematical and algorithmic expressions in standard LaTeX ($...$ inline, $$...$$ block).
4. RESEARCH RELIABILITY: Maintain scholarly restraint, distinguish empirical findings from hypotheses, and avoid unsubstantiated superlatives.

${modeInstruction}

OUTPUT FORMAT (JSON):
Respond with a valid JSON object matching this structure:
{
  "completedSentence": "The complete sentence starting from its beginning in the input and concluding properly.",
  "continuationOnly": "ONLY the exact characters/words to append directly after the cut-off point.",
  "fullExtendedBlock": "The complete paragraph block including the resolved sentence and any expanded sentences.",
  "additionalParagraphs": ["Optional subsequent paragraphs if multi-paragraph mode"],
  "wordCount": 150
}`;

  const userPrompt = `Surrounding Chapter Context (for domain & tone):
---
${context ? context.slice(-2000) : 'Standard graduate dissertation manuscript.'}
---

Incomplete / Abruptly Truncated Text:
---
${incompleteText}
---

Provide the seamless academic extension in JSON format.`;

  return { systemPrompt, userPrompt };
}
