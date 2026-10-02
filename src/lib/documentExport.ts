import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  ImageRun, 
  BorderStyle,
  ShadingType,
  ImportedXmlComponent,
  Math as DocxMath,
  MathRun,
  ExternalHyperlink,
  Footer,
  PageNumber
} from 'docx';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import katex from 'katex';
import { mml2omml } from 'mathml2omml';
import { setupPdfUnicodeFonts } from './pdfUnicodeFont';
import { 
  renderLatexToVectorSvg, 
  renderLatexToRasterDataUrl, 
  embedMathInPdf,
  normalizeLatexMath 
} from './mathRenderer';

export interface DocExportSection {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'quote' | 'table' | 'image' | 'equation' | 'diagram';
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bullet?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  imageSrc?: string;
  caption?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  imageData?: {
    base64Data: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export interface DocExportPayload {
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  filename?: string;
  sections?: DocExportSection[];
  rawText?: string;
}

/**
 * Normalizes all citation "Accessed [Date]" strings to strictly match today's real current date
 * Ensures that Harvard, APA, MLA, and web references consistently tally with current date.
 */
export function normalizeAccessedDates(text: string): string {
  if (!text) return '';
  const now = new Date();
  const harvardDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); // e.g. "21 September 2026"
  
  // Replace brackets like [Accessed 14 May 2023], [Accessed: 2024], [Accessed Date], [Accessed ...]
  let normalized = text.replace(/\[Accessed(?:\s*:\s*|\s+)[^\]\n]+\]/gi, `[Accessed ${harvardDate}]`);
  
  // Replace unbracketed occurrences like "Accessed 14 March 2023" or "Accessed: 9/15/2023"
  normalized = normalized.replace(/\bAccessed(?:\s*:\s*|\s+)(?:(?:\d{1,2}\s+[A-Za-z]+\s+\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s+\d{4})|(?:\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})|Date)/gi, `Accessed ${harvardDate}`);
  
  return normalized;
}

/**
 * Convert standard LaTeX equation syntax to genuine Microsoft Word Office Math (OMML)
 * This enables Microsoft Word to open, render in Cambria Math, and interactively edit equations natively.
 */
export function latexToDocxMathComponent(latex: string, isBlock: boolean = false): any {
  if (!latex) return null;
  const trimmed = latex.trim();
  if (!trimmed) return null;

  try {
    // 1. Render LaTeX to MathML using KaTeX
    const mathmlRaw = katex.renderToString(trimmed, { 
      output: 'mathml',
      throwOnError: false 
    });

    // 2. Strip KaTeX semantic annotations so mml2omml receives clean MathML
    const mathmlClean = mathmlRaw.replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/gi, '');
    const match = mathmlClean.match(/<math[\s\S]*<\/math>/i);
    const mathml = match ? match[0] : mathmlClean;

    // 3. Convert MathML to authentic Office Open XML Math (OMML)
    let omml = mml2omml(mathml);

    // If block equation, wrap in m:oMathPara for native centered Word equation block
    if (isBlock && !omml.includes('<m:oMathPara')) {
      omml = `<m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${omml}</m:oMathPara>`;
    }

    const imported = ImportedXmlComponent.fromXmlString(omml);
    return (imported as any).root?.[0] || imported;
  } catch (err) {
    console.warn('LaTeX to OMML conversion failed, falling back to DocxMath:', err);
    try {
      return new DocxMath({
        children: [new MathRun(trimmed)]
      });
    } catch {
      return new TextRun({
        text: trimmed,
        italics: true,
        font: 'Cambria Math',
        size: isBlock ? 24 : 22
      });
    }
  }
}

/**
 * Helper to parse matching balanced curly braces { ... } in LaTeX strings
 */
function parseBraces(str: string, startIdx: number): { content: string; end: number } | null {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (str[i] === '}') {
      depth--;
      if (depth === 0) return { content: str.slice(start + 1, i), end: i };
    }
  }
  return null;
}

/**
 * Replaces nested fractions \frac{num}{den} recursively with clean mathematical representations
 */
function replaceFractions(s: string): string {
  let idx = 0;
  while ((idx = s.indexOf('\\frac')) !== -1) {
    const num = parseBraces(s, idx + 5);
    if (!num) break;
    const den = parseBraces(s, num.end + 1);
    if (!den) break;
    const numClean = replaceFractions(num.content);
    const denClean = replaceFractions(den.content);
    let rep = '';
    if (numClean === '1' && denClean === '2') rep = '½';
    else if (numClean === '1' && denClean === '3') rep = '⅓';
    else if (numClean === '2' && denClean === '3') rep = '⅔';
    else if (numClean === '1' && denClean === '4') rep = '¼';
    else if (numClean === '3' && denClean === '4') rep = '¾';
    else if (numClean === '1') rep = `1 / ${denClean}`;
    else rep = `(${numClean})/(${denClean})`;
    s = s.slice(0, idx) + rep + s.slice(den.end + 1);
  }
  return s;
}

/**
 * Converts common LaTeX math expressions and symbols into clean, readable Unicode representations
 * for high-legibility document paragraphs, tables, and fallback rendering.
 * Accurately handles Greek letters, tensor indices (R_μν, g_μν, T_μν), sub/superscripts (c², 4f¹⁴, 5d¹⁰, 6s¹),
 * nested fractions, square roots, and operators.
 */
export function convertLatexToUnicode(latex: string): string {
  if (!latex) return '';
  let res = latex.trim();

  // Fractions (including nested braces like \frac{1}{\sqrt{...}})
  res = replaceFractions(res);

  // Square roots (with balanced brace support)
  let sqrtIdx = 0;
  while ((sqrtIdx = res.indexOf('\\sqrt')) !== -1) {
    const content = parseBraces(res, sqrtIdx + 5);
    if (content) {
      res = res.slice(0, sqrtIdx) + `√(${content.content})` + res.slice(content.end + 1);
    } else {
      res = res.replace(/\\sqrt\s*([a-zA-Z0-9])/, '√$1');
      break;
    }
  }

  // Common Greek symbols
  const greek: Record<string, string> = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ',
    '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
    '\\Theta': 'Θ', '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\Lambda': 'Λ',
    '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\Xi': 'Ξ', '\\pi': 'π', '\\Pi': 'Π',
    '\\rho': 'ρ', '\\sigma': 'σ', '\\Sigma': 'Σ', '\\tau': 'τ', '\\upsilon': 'υ',
    '\\phi': 'φ', '\\Phi': 'Φ', '\\chi': 'χ', '\\psi': 'ψ', '\\Psi': 'Ψ',
    '\\omega': 'ω', '\\Omega': 'Ω'
  };
  for (const [cmd, sym] of Object.entries(greek)) {
    res = res.replaceAll(cmd, sym);
  }

  // Tensor indices formatting: R_{\mu\nu} -> Rμν, g_{\mu\nu} -> gμν, T_{\mu\nu} -> Tμν
  res = res.replace(/([RgtTFgAR])_\{([^{}]+)\}/g, (_, tensor, indices) => {
    return tensor + indices.replace(/[\s\\]/g, '');
  });
  res = res.replace(/([RgtTFgAR])_([a-zA-Zα-ωΑ-Ω]{1,2})/g, '$1$2');

  // Degree / circle superscripts
  res = res.replace(/\^\\circ/g, '°');
  res = res.replace(/\^circ/g, '°');

  // Superscripts (supports multi-digit like 4f^{14}, 5d^{10}, 6s^1, c^2, etc.)
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ'
  };
  res = res.replace(/\^\{([0-9nix+\-]+)\}/g, (_, str) => str.split('').map((c: string) => superscripts[c] || c).join(''));
  res = res.replace(/\^([0-9nix+\-])/g, (_, c) => superscripts[c] || `^${c}`);

  // Subscripts
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', 'a': 'ₐ', 'e': 'ₑ',
    'o': 'ₒ', 'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ',
    'm': 'ₘ', 'n': 'ₙ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ',
    'i': 'ᵢ', 'j': 'ⱼ', 'r': 'ᵣ', 'u': 'ᵤ', 'v': 'ᵥ'
  };
  res = res.replace(/\_\{([0-9a-z+\-]+)\}/g, (_, str) => str.split('').map((c: string) => subscripts[c] || c).join(''));
  res = res.replace(/\_([0-9a-z+\-])/g, (_, c) => subscripts[c] || `_${c}`);

  // Math operators & relational symbols
  const mathOps: Record<string, string> = {
    '\\times': '×', '\\cdot': '·', '\\pm': '±', '\\mp': '∓',
    '\\div': '÷', '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
    '\\neq': '≠', '\\ne': '≠', '\\approx': '≈', '\\sim': '~',
    '\\equiv': '≡', '\\propto': '∝', '\\infty': '∞', '\\hbar': 'ħ',
    '\\circ': '°', '\\partial': '∂', '\\nabla': '∇', '\\sum': '∑',
    '\\prod': '∏', '\\int': '∫', '\\to': '→', '\\rightarrow': '→',
    '\\leftarrow': '←', '\\Rightarrow': '⇒', '\\Leftarrow': '⇐',
    '\\leftrightarrow': '↔', '\\forall': '∀', '\\exists': '∃',
    '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
    '\\cup': '∪', '\\cap': '∩', '\\bullet': '•', '\\langle': '⟨',
    '\\rangle': '⟩', '\\ll': '≪', '\\gg': '≫'
  };
  for (const [cmd, sym] of Object.entries(mathOps)) {
    res = res.replaceAll(cmd, sym);
  }

  // Text / formatting tags
  res = res.replace(/\\(?:text|mathrm|mathbf|mathit|mathsf)\{([^{}]+)\}/g, '$1');

  // Strip extraneous braces and backslashes
  res = res.replace(/[{}]/g, '');
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');
  res = res.replace(/\s+/g, ' ');
  return res.trim();
}

/**
 * Render a LaTeX equation to high-resolution PNG image via MathJax vector SVG pipeline.
 * Enables crisp, genuine vector-grade mathematical formula embedding in documents without html2canvas artifacts.
 */
export async function renderLatexToImage(
  latex: string, 
  displayMode: boolean = true
): Promise<{ dataUrl: string; widthMm: number; heightMm: number } | null> {
  const trimmed = (latex || '').trim();
  if (!trimmed) return null;
  return renderLatexToRasterDataUrl(trimmed, displayMode, 165);
}

/**
 * Checks whether a line belongs to an ASCII diagram, box drawing, flowchart, or architecture diagram
 */
export function isDiagramLine(rawLine: string): boolean {
  if (!rawLine || !rawLine.trim()) return false;
  const trimmed = rawLine.trim();

  // Exclude standard markdown elements
  if (/^#{1,6}\s+/.test(trimmed)) return false;
  if (/^[-*•]\s+[a-zA-Z]/.test(trimmed)) return false;
  if (/^>\s+/.test(trimmed)) return false;

  // Box borders: +---+ or +===+ or |...|
  if (/^[ \t]*\+[-=+]{3,}\+[ \t]*$/.test(rawLine)) return true;
  if (/^[ \t]*\|.*\|[ \t]*$/.test(rawLine)) return true;

  // Multiple boxes side-by-side: +---+ +---+ or |...| |...|
  if (/\+[-=+]+\+[ \t]+\+[-=+]+\+/.test(rawLine)) return true;
  if (/\|[ \t]*\+[ \t]*\|/.test(rawLine)) return true;

  // Vertical connectors and directional arrows
  if (/^[ \t]*[|!v^▲▼│║]+([ \t]+[|!v^▲▼│║]+)*[ \t]*$/.test(rawLine)) return true;

  // Branching connectors: +------+------+
  if (/^[ \t]*\+[-=+]+\+/.test(rawLine) && /[-=]{3,}/.test(rawLine)) return true;

  // Text line containing explicit horizontal arrows
  if (/(-->|<--|==>|<==|\|->|<-\||->|<-)/.test(rawLine)) return true;

  // Unicode box drawing characters
  if (/[┌┐└┘├┤┬┴┼│─═║╔╗╚╝╠╣╦╩╬▲▼◀▶←↑→↓↔↕]/.test(rawLine)) return true;

  // Horizontal border line with corner markers (+----+ or +=====+)
  if (/[-+=\\]{4,}/.test(trimmed) && (trimmed.startsWith('+') || trimmed.endsWith('+'))) return true;

  return false;
}

/**
 * Render an ASCII diagram, flowchart, or box drawing into a crisp high-DPI image
 * Preserves exact alignment, typography, and visual clarity across all devices and viewers.
 */
export function renderAsciiDiagramToImage(asciiText: string): { 
  dataUrl: string; 
  widthPx: number; 
  heightPx: number; 
  widthMm: number; 
  heightMm: number;
} | null {
  if (typeof document === 'undefined') return null;
  try {
    const rawLines = asciiText.split('\n');
    while (rawLines.length > 0 && !rawLines[0].trim()) rawLines.shift();
    while (rawLines.length > 0 && !rawLines[rawLines.length - 1].trim()) rawLines.pop();
    if (rawLines.length === 0) return null;

    const maxLineLen = Math.max(...rawLines.map(l => l.length), 10);

    const fontSize = 13;
    const lineHeight = 18;
    const paddingX = 24;
    const paddingY = 20;

    const approxCharW = 7.82;
    const widthPx = Math.max(520, Math.ceil(maxLineLen * approxCharW + paddingX * 2));
    const heightPx = Math.ceil(rawLines.length * lineHeight + paddingY * 2);

    const canvas = document.createElement('canvas');
    const scale = 2.5; // High-DPI supersampling
    canvas.width = Math.ceil(widthPx * scale);
    canvas.height = Math.ceil(heightPx * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Card background
    ctx.fillStyle = '#F8FAFC'; // Tailwind slate-50
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Outer border
    ctx.strokeStyle = '#CBD5E1'; // Tailwind slate-300
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, widthPx - 1, heightPx - 1);

    // Left brand accent bar
    ctx.fillStyle = '#4F46E5'; // Tailwind indigo-600
    ctx.fillRect(0, 0, 4, heightPx);

    // Monospace text rendering
    ctx.font = '13px Consolas, "Cascadia Code", "Liberation Mono", Menlo, Courier, monospace';
    ctx.fillStyle = '#0F172A'; // Tailwind slate-900
    ctx.textBaseline = 'middle';

    rawLines.forEach((line, idx) => {
      const y = paddingY + idx * lineHeight + lineHeight / 2;
      ctx.fillText(line, paddingX, y);
    });

    const dataUrl = canvas.toDataURL('image/png');
    const contentWidthMm = 174;
    let widthMm = Math.min(contentWidthMm, widthPx * 0.264583);
    const aspect = heightPx / widthPx;
    let heightMm = widthMm * aspect;

    if (heightMm > 220) {
      const scaleDown = 220 / heightMm;
      heightMm = 220;
      widthMm = widthMm * scaleDown;
    }

    return {
      dataUrl,
      widthPx,
      heightPx,
      widthMm,
      heightMm
    };
  } catch (err) {
    console.warn('Failed to render ASCII diagram to image:', err);
    return null;
  }
}

/**
 * Strip raw markdown markers (#, **, *, ~~, _, `) from a string and convert LaTeX equations to readable Unicode
 */
export function cleanMarkdownText(str: string): string {
  if (!str) return '';
  return str
    .replace(/^#{1,6}\s+/, '') // Remove leading # heading markers
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
    .replace(/__(.*?)__/g, '$1') // Remove __bold__
    .replace(/_(.*?)_/g, '$1') // Remove _italic_
    .replace(/~~(.*?)~~/g, '$1') // Remove ~~strike~~
    .replace(/`([^`]+)`/g, '$1') // Remove `code`
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => convertLatexToUnicode(eq)) // Convert $$ display math to Unicode
    .replace(/\$([^$\n]+?)\$/g, (_, eq) => convertLatexToUnicode(eq)) // Convert $ inline math to Unicode
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Convert markdown links [text](url) to display text
    .trim();
}

/**
 * Helper to convert CSS color formats (hex, rgb, named) to 6-digit Hex string without '#'
 */
function colorToHex(colStr: string): string | null {
  if (!colStr) return null;
  colStr = colStr.trim().toLowerCase();
  if (colStr.startsWith('#')) {
    const hex = colStr.slice(1);
    if (hex.length === 3) {
      return hex.split('').map(c => c + c).join('').toUpperCase();
    }
    return hex.toUpperCase().slice(0, 6);
  }
  const rgbMatch = colStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `${r}${g}${b}`.toUpperCase();
  }
  const named: Record<string, string> = {
    red: 'FF0000', green: '008000', blue: '0000FF', yellow: 'FFFF00',
    black: '000000', white: 'FFFFFF', gray: '808080', grey: '808080',
    purple: '800080', orange: 'FFA500', pink: 'FFC0CB', cyan: '00FFFF',
    amber: 'F59E0B', emerald: '10B981', indigo: '6366F1', rose: 'F43F5E',
    darkblue: '0F172A', slate: '334155', maroon: '800000'
  };
  return named[colStr] || null;
}

interface ParsedStyle {
  color?: string;
  bgColor?: string;
  size?: number;
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  allCaps?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  smallCaps?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
}

function parseCssStyleString(styleStr: string): ParsedStyle {
  const result: ParsedStyle = {};
  if (!styleStr) return result;

  const colorMatch = styleStr.match(/color\s*:\s*([^;]+)/i);
  if (colorMatch) {
    const col = colorToHex(colorMatch[1].trim());
    if (col) result.color = col;
  }

  const bgMatch = styleStr.match(/background(?:-color)?\s*:\s*([^;]+)/i);
  if (bgMatch) {
    const bg = colorToHex(bgMatch[1].trim());
    if (bg) result.bgColor = bg;
  }

  const fontMatch = styleStr.match(/font-size\s*:\s*([^;]+)/i);
  if (fontMatch) {
    const val = fontMatch[1].trim();
    if (val.endsWith('pt')) {
      const num = parseFloat(val);
      if (!isNaN(num)) result.size = Math.round(num * 2);
    } else if (val.endsWith('px')) {
      const num = parseFloat(val);
      if (!isNaN(num)) result.size = Math.round((num * 0.75) * 2);
    } else if (val.endsWith('rem') || val.endsWith('em')) {
      const num = parseFloat(val);
      if (!isNaN(num)) result.size = Math.round(num * 12 * 2);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) result.size = Math.round(num * 2);
    }
  }

  if (/font-weight\s*:\s*(bold|700|800|900)/i.test(styleStr)) {
    result.bold = true;
  }
  if (/font-style\s*:\s*italic/i.test(styleStr)) {
    result.italics = true;
  }
  if (/text-decoration\s*:\s*underline/i.test(styleStr)) {
    result.underline = true;
  }
  if (/text-transform\s*:\s*uppercase/i.test(styleStr)) {
    result.allCaps = true;
  }
  if (/text-transform\s*:\s*lowercase/i.test(styleStr)) {
    result.lowercase = true;
  }
  if (/text-transform\s*:\s*capitalize/i.test(styleStr)) {
    result.capitalize = true;
  }
  if (/font-variant\s*:\s*small-caps/i.test(styleStr)) {
    result.smallCaps = true;
  }
  const alignMatch = styleStr.match(/text-align\s*:\s*(center|right|justify|left)/i);
  if (alignMatch) {
    result.align = alignMatch[1].toLowerCase() as any;
  }

  return result;
}

/**
 * Parses inline markdown formatted text and HTML style tags into docx TextRuns
 * Preserves text color, background highlight color, font size, uppercase/capitalization, bold, italic, and underline!
 */
export function parseInlineMarkdownToDocxRuns(
  text: string, 
  defaults: { size?: number; color?: string; font?: string; bold?: boolean; italics?: boolean } = {}
): any[] {
  if (!text) return [new TextRun({ text: '', ...defaults })];

  const runs: any[] = [];

  // Match HTML tags (<span style="...">, <mark>, <font>, <b>, <i>, <u>, etc.), LaTeX ($$math$$, $math$), Markdown links [text](url), and Markdown (**bold**, *italic*, etc.)
  const pattern = /(<mark[^>]*>.*?<\/mark>|<span[^>]*>.*?<\/span>|<font[^>]*>.*?<\/font>|<b[^>]*>.*?<\/b>|<strong[^>]*>.*?<\/strong>|<i[^>]*>.*?<\/i>|<em[^>]*>.*?<\/em>|<u[^>]*>.*?<\/u>|\[[^\]]+\]\([^\)]+\)|\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~|`.*?`|[^*<~`$\[]+)/gi;
  const matches = text.match(pattern) || [text];

  for (const match of matches) {
    if (!match) continue;

    // 1. HTML span or mark tag with style attribute
    if (/^<(span|mark|font|b|strong|i|em|u)\b/i.test(match)) {
      const styleAttrMatch = match.match(/style=["']([^"']+)["']/i);
      const colorAttrMatch = match.match(/color=["']([^"']+)["']/i);
      const sizeAttrMatch = match.match(/size=["']([^"']+)["']/i);
      const styleObj = styleAttrMatch ? parseCssStyleString(styleAttrMatch[1]) : {};
      
      if (colorAttrMatch) {
        const colHex = colorToHex(colorAttrMatch[1]);
        if (colHex) styleObj.color = colHex;
      }
      if (sizeAttrMatch && !styleObj.size) {
        const sNum = parseFloat(sizeAttrMatch[1]);
        if (!isNaN(sNum)) styleObj.size = Math.round(sNum * 2);
      }

      // Check tag types for default semantics
      if (/^<mark\b/i.test(match) && !styleObj.bgColor) {
        styleObj.bgColor = 'FEF08A'; // Default yellow highlight for <mark>
      }
      if (/^<(b|strong)\b/i.test(match)) {
        styleObj.bold = true;
      }
      if (/^<(i|em)\b/i.test(match)) {
        styleObj.italics = true;
      }
      if (/^<u\b/i.test(match)) {
        styleObj.underline = true;
      }

      // Strip tag wrapper to get inner text
      const innerText = match.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
      let cleanInner = cleanMarkdownText(innerText);

      if (styleObj.allCaps) {
        cleanInner = cleanInner.toUpperCase();
      } else if (styleObj.lowercase) {
        cleanInner = cleanInner.toLowerCase();
      } else if (styleObj.capitalize) {
        cleanInner = cleanInner.replace(/\b\w/g, c => c.toUpperCase());
      }

      runs.push(
        new TextRun({
          text: cleanInner,
          bold: styleObj.bold !== undefined ? styleObj.bold : !!defaults.bold,
          italics: styleObj.italics !== undefined ? styleObj.italics : !!defaults.italics,
          underline: styleObj.underline ? {} : undefined,
          size: styleObj.size || defaults.size || 22,
          color: styleObj.color || defaults.color || '1E293B',
          shading: styleObj.bgColor ? { fill: styleObj.bgColor } : undefined,
          font: defaults.font || 'Calibri',
          allCaps: styleObj.allCaps,
          smallCaps: styleObj.smallCaps
        })
      );
    } 
    // 2. Markdown Hyperlink: [text](URL)
    else if (match.startsWith('[') && match.includes('](') && match.endsWith(')')) {
      const splitIdx = match.indexOf('](');
      const linkText = match.slice(1, splitIdx);
      const linkUrl = match.slice(splitIdx + 2, -1);
      runs.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: cleanMarkdownText(linkText),
              style: 'Hyperlink',
              color: '1D4ED8',
              underline: {},
              size: defaults.size || 22,
              font: defaults.font || 'Calibri'
            })
          ],
          link: linkUrl
        })
      );
    }
    // 3. LaTeX Math Formulas ($$block$$ or $inline$)
    else if ((match.startsWith('$$') && match.endsWith('$$') && match.length >= 4) || (match.startsWith('$') && match.endsWith('$') && match.length >= 2)) {
      const isBlock = match.startsWith('$$');
      const formula = isBlock ? match.slice(2, -2).trim() : match.slice(1, -1).trim();
      const mathComp = latexToDocxMathComponent(formula, isBlock);
      if (mathComp) {
        runs.push(mathComp);
      } else {
        runs.push(
          new DocxMath({
            children: [new MathRun(formula)]
          })
        );
      }
    }
    // 4. Markdown **bold**
    else if (match.startsWith('**') && match.endsWith('**') && match.length >= 4) {
      const inner = match.slice(2, -2);
      runs.push(
        new TextRun({
          text: inner,
          bold: true,
          size: defaults.size || 22,
          color: defaults.color || '1E293B',
          font: defaults.font || 'Calibri'
        })
      );
    } 
    // 3. Markdown *italic*
    else if (match.startsWith('*') && match.endsWith('*') && match.length >= 2) {
      const inner = match.slice(1, -1);
      runs.push(
        new TextRun({
          text: inner,
          italics: true,
          size: defaults.size || 22,
          color: defaults.color || '334155',
          font: defaults.font || 'Calibri'
        })
      );
    } 
    // 4. Markdown <u>underline</u>
    else if (match.startsWith('<u>') && match.endsWith('</u>')) {
      const inner = match.slice(3, -4);
      runs.push(
        new TextRun({
          text: inner,
          underline: {},
          size: defaults.size || 22,
          color: defaults.color || '1E293B',
          font: defaults.font || 'Calibri'
        })
      );
    } 
    // 5. Plain text chunk
    else {
      runs.push(
        new TextRun({
          text: match,
          bold: !!defaults.bold,
          italics: !!defaults.italics,
          size: defaults.size || 22,
          color: defaults.color || '334155',
          font: defaults.font || 'Calibri'
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: cleanMarkdownText(text), ...defaults })];
}

/**
 * Convert dataURL (base64) to Uint8Array for docx ImageRun safely
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  try {
    const commaIndex = dataUrl.indexOf(',');
    let base64 = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    // Remove all whitespace/newlines
    base64 = base64.replace(/\s+/g, '');
    // If it contains URL encoded entities
    if (base64.includes('%')) {
      try {
        base64 = decodeURIComponent(base64);
      } catch {
        // keep base64 as-is
      }
    }
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.warn('Failed to parse base64 dataUrl:', err);
    return new Uint8Array(0);
  }
}

export interface WordImageResult {
  bytes: Uint8Array;
  type: 'jpg' | 'png';
}

/**
 * Universal Image / SVG / Base64 to Word ImageRun bytes rasterizer.
 * Guarantees that any SVG or image format is converted into a solid, high-resolution JPEG or PNG
 * with genuine white background that Microsoft Word can reliably render without corruption or missing elements.
 */
async function imageSourceToWordImageBytes(src: string): Promise<WordImageResult | null> {
  if (!src) return null;
  const cleanSrc = src.trim();

  // 1. Direct JPEG Data URL
  if (cleanSrc.startsWith('data:image/jpeg') || cleanSrc.startsWith('data:image/jpg')) {
    const bytes = dataUrlToUint8Array(cleanSrc);
    if (bytes.length > 0) {
      return { bytes, type: 'jpg' };
    }
  }

  // 2. Direct PNG Data URL
  if (cleanSrc.startsWith('data:image/png')) {
    const bytes = dataUrlToUint8Array(cleanSrc);
    if (bytes.length > 0) {
      return { bytes, type: 'png' };
    }
  }

  // 3. SVG (data URL or raw XML) or external URL: rasterize onto clean white-background canvas
  return new Promise((resolve) => {
    try {
      let finalUrl = cleanSrc;
      let isObjectUrl = false;

      if (cleanSrc.startsWith('<svg') || cleanSrc.includes('<svg')) {
        let svgContent = cleanSrc;
        if (!svgContent.includes('xmlns=')) {
          svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!svgContent.includes('width=') || svgContent.includes('width="100%"')) {
          svgContent = svgContent.replace('<svg', '<svg width="1200" height="840"');
        }
        finalUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
      } else if (cleanSrc.startsWith('data:image/svg+xml')) {
        let rawSvg = '';
        if (cleanSrc.includes(';base64,')) {
          const base64Part = cleanSrc.split(';base64,')[1].replace(/\s+/g, '');
          try {
            rawSvg = decodeURIComponent(escape(atob(base64Part)));
          } catch {
            try {
              rawSvg = atob(base64Part);
            } catch {
              rawSvg = decodeURIComponent(base64Part);
            }
          }
        } else {
          const parts = cleanSrc.split(',');
          rawSvg = decodeURIComponent(parts.slice(1).join(','));
        }
        if (!rawSvg.includes('xmlns=')) {
          rawSvg = rawSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!rawSvg.includes('width=') || rawSvg.includes('width="100%"')) {
          rawSvg = rawSvg.replace('<svg', '<svg width="1200" height="840"');
        }
        finalUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
      }

      const img = new Image();
      // DO NOT set crossOrigin for data: or blob: URLs, as this causes CORS errors in sandboxed iframes
      if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      // Safety timeout so Word export never hangs or stalls
      const timer = setTimeout(() => {
        if (isObjectUrl) URL.revokeObjectURL(finalUrl);
        const fallbackBytes = dataUrlToUint8Array(cleanSrc);
        if (fallbackBytes.length > 2) {
          if (fallbackBytes[0] === 0xFF && fallbackBytes[1] === 0xD8) {
            resolve({ bytes: fallbackBytes, type: 'jpg' });
            return;
          }
          if (fallbackBytes[0] === 0x89 && fallbackBytes[1] === 0x50) {
            resolve({ bytes: fallbackBytes, type: 'png' });
            return;
          }
        }
        resolve(null);
      }, 5000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || 1400;
          const height = img.naturalHeight || 980;
          canvas.width = Math.max(width, 1400);
          canvas.height = Math.max(height, 980);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (isObjectUrl) URL.revokeObjectURL(finalUrl);
            resolve(null);
            return;
          }
          // Solid white paper background for genuine Word printing
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to high-fidelity JPEG for universal Word rendering
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          if (isObjectUrl) URL.revokeObjectURL(finalUrl);
          const bytes = dataUrlToUint8Array(jpegDataUrl);
          if (bytes.length > 0) {
            resolve({ bytes, type: 'jpg' });
          } else {
            resolve(null);
          }
        } catch (e) {
          if (isObjectUrl) URL.revokeObjectURL(finalUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        if (isObjectUrl) URL.revokeObjectURL(finalUrl);
        // Fallback: check if cleanSrc was already base64 with valid magic bytes
        const fallbackBytes = dataUrlToUint8Array(cleanSrc);
        if (fallbackBytes.length > 2) {
          if (fallbackBytes[0] === 0xFF && fallbackBytes[1] === 0xD8) {
            resolve({ bytes: fallbackBytes, type: 'jpg' });
            return;
          }
          if (fallbackBytes[0] === 0x89 && fallbackBytes[1] === 0x50) {
            resolve({ bytes: fallbackBytes, type: 'png' });
            return;
          }
        }
        resolve(null);
      };
      img.src = finalUrl;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Parses raw text or markdown-formatted content into structured DocExportSections
 */
export function parseContentToSections(content: string): DocExportSection[] {
  const lines = content.split('\n');
  const sections: DocExportSection[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (inTable && tableHeaders.length > 0) {
      sections.push({
        type: 'table',
        tableData: {
          headers: [...tableHeaders],
          rows: [...tableRows]
        }
      });
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedRaw = rawLine.trim();
    if (!trimmedRaw) {
      flushTable();
      continue;
    }

    // Direct check for code fence or diagram blocks (``` or ~~~)
    if (trimmedRaw.startsWith('```') || trimmedRaw.startsWith('~~~')) {
      flushTable();
      const fence = trimmedRaw.slice(0, 3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      sections.push({
        type: 'diagram',
        text: codeLines.join('\n')
      });
      continue;
    }

    // Direct check for ASCII diagrams, process flowcharts, box drawings, or schematics
    if (isDiagramLine(rawLine)) {
      flushTable();
      const diagramLines: string[] = [rawLine];
      while (i + 1 < lines.length) {
        const nextRaw = lines[i + 1];
        if (isDiagramLine(nextRaw)) {
          i++;
          diagramLines.push(nextRaw);
        } else if (nextRaw.trim() === '' && i + 2 < lines.length && isDiagramLine(lines[i + 2])) {
          i++;
          diagramLines.push(nextRaw);
        } else {
          break;
        }
      }

      if (diagramLines.filter(l => l.trim()).length >= 2) {
        sections.push({
          type: 'diagram',
          text: diagramLines.join('\n')
        });
        continue;
      }
    }

    const line = trimmedRaw;

    // Direct check for markdown image: ![alt](src) - uses string indexing to avoid regex backtracking on large base64
    if (line.startsWith('![') && line.includes('](')) {
      const openIdx = line.indexOf('](');
      const closeIdx = line.lastIndexOf(')');
      if (openIdx > 1 && closeIdx > openIdx) {
        const altText = line.substring(2, openIdx).trim();
        const src = line.substring(openIdx + 2, closeIdx).trim();
        if (src.length > 5) {
          flushTable();
          sections.push({
            type: 'image',
            imageSrc: src,
            caption: altText || undefined,
            imageData: {
              base64Data: src,
              caption: altText || undefined,
              width: 540,
              height: 380
            }
          });
          continue;
        }
      }
    }

    // Direct check for standalone SVG block: <svg ... </svg>
    if (line.includes('<svg')) {
      flushTable();
      let svgContent = line;
      if (!svgContent.includes('</svg>')) {
        while (i + 1 < lines.length && !svgContent.includes('</svg>')) {
          i++;
          svgContent += '\n' + lines[i];
        }
      }
      sections.push({
        type: 'image',
        imageSrc: svgContent,
        imageData: {
          base64Data: svgContent,
          width: 540,
          height: 380
        }
      });
      continue;
    }

    // Direct check for standalone data:image/ string
    if (line.startsWith('data:image/')) {
      flushTable();
      sections.push({
        type: 'image',
        imageSrc: line,
        imageData: {
          base64Data: line,
          width: 540,
          height: 380
        }
      });
      continue;
    }

    // HTML Image Check: <img src="..." alt="..." />
    const htmlImgMatch = line.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?/i) || line.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImgMatch) {
      flushTable();
      sections.push({
        type: 'image',
        imageSrc: htmlImgMatch[1].trim(),
        imageData: {
          base64Data: htmlImgMatch[1].trim(),
          caption: (htmlImgMatch[2] || '').trim() || undefined,
          width: 540,
          height: 380
        }
      });
      continue;
    }

    // Markdown Table Check
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Separator line (e.g. |---|---| or |:---|:---|)
      if (cells.every(c => /^[:\s-]+$/.test(c))) {
        inTable = true;
        continue;
      }

      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells;
        inTable = true;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Display Math Equation: \[...\] or \begin{equation}...\end{equation}
    if (line.includes('\\[') || line.startsWith('\\begin{equation}')) {
      flushTable();
      if (line.includes('\\[') && line.includes('\\]')) {
        const start = line.indexOf('\\[');
        const end = line.indexOf('\\]', start + 2);
        const before = line.substring(0, start).trim();
        const formula = line.substring(start + 2, end).trim();
        const after = line.substring(end + 2).trim();
        if (before) sections.push({ type: 'paragraph', text: before });
        if (formula) sections.push({ type: 'equation', text: formula, align: 'center' });
        if (after) sections.push({ type: 'paragraph', text: after });
        continue;
      } else if (line.startsWith('\\begin{equation}')) {
        const formulaParts: string[] = [];
        const rest = line.replace('\\begin{equation}', '').trim();
        if (rest && !rest.includes('\\end{equation}')) formulaParts.push(rest);
        while (i + 1 < lines.length && !lines[i + 1].includes('\\end{equation}')) {
          i++;
          formulaParts.push(lines[i].trim());
        }
        if (i + 1 < lines.length) {
          i++;
          const last = lines[i].replace('\\end{equation}', '').trim();
          if (last) formulaParts.push(last);
        }
        sections.push({ type: 'equation', text: formulaParts.join(' '), align: 'center' });
        continue;
      }
    }

    // Display Math Equation: $$...$$ or lines containing $$
    if (line.includes('$$')) {
      flushTable();
      const firstIdx = line.indexOf('$$');
      const secondIdx = line.indexOf('$$', firstIdx + 2);
      if (secondIdx > firstIdx) {
        // Single line containing $$formula$$
        const beforeText = line.substring(0, firstIdx).trim();
        const formula = line.substring(firstIdx + 2, secondIdx).trim();
        const afterText = line.substring(secondIdx + 2).trim();

        if (beforeText) {
          sections.push({ type: 'paragraph', text: beforeText });
        }
        if (formula) {
          sections.push({ type: 'equation', text: formula, align: 'center' });
        }
        if (afterText) {
          sections.push({ type: 'paragraph', text: afterText });
        }
        continue;
      } else {
        // Multi-line block equation starting with $$
        const beforeText = line.substring(0, firstIdx).trim();
        if (beforeText) {
          sections.push({ type: 'paragraph', text: beforeText });
        }
        const formulaParts: string[] = [];
        const restOfLine = line.substring(firstIdx + 2).trim();
        if (restOfLine) formulaParts.push(restOfLine);

        while (i + 1 < lines.length && !lines[i + 1].includes('$$')) {
          i++;
          formulaParts.push(lines[i].trim());
        }
        if (i + 1 < lines.length) {
          i++;
          const closingLine = lines[i];
          const closeIdx = closingLine.indexOf('$$');
          const lastPart = closingLine.substring(0, closeIdx).trim();
          if (lastPart) formulaParts.push(lastPart);
          const afterText = closingLine.substring(closeIdx + 2).trim();
          sections.push({
            type: 'equation',
            text: formulaParts.join(' '),
            align: 'center'
          });
          if (afterText) {
            sections.push({ type: 'paragraph', text: afterText });
          }
        } else {
          sections.push({
            type: 'equation',
            text: formulaParts.join(' '),
            align: 'center'
          });
        }
        continue;
      }
    }

    // Standalone single-line equation wrapped in single $ (e.g. $E = mc^2$)
    if (/^\$[^$\n]+\$$/.test(line.trim()) && line.trim().length > 2) {
      flushTable();
      const mathContent = line.trim().slice(1, -1).trim();
      sections.push({
        type: 'equation',
        text: mathContent,
        align: 'center'
      });
      continue;
    }

    // Check for paragraph-level text alignment (<p style="text-align: ...">, <center>, <div align="...">)
    let paragraphAlign: 'left' | 'center' | 'right' | 'justify' | undefined = undefined;
    const alignTagMatch = line.match(/(?:text-align\s*:\s*|align=["'])(center|right|justify|left)/i) || (line.startsWith('<center>') ? ['center', 'center'] : null);
    if (alignTagMatch) {
      paragraphAlign = alignTagMatch[1].toLowerCase() as any;
    }

    // Headings (strip leading # markers)
    if (line.startsWith('# ')) {
      sections.push({ type: 'heading1', text: line.replace(/^#\s+/, ''), align: paragraphAlign });
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'heading2', text: line.replace(/^##\s+/, ''), align: paragraphAlign });
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'heading3', text: line.replace(/^###\s+/, ''), align: paragraphAlign });
    } else if (line.startsWith('#### ')) {
      sections.push({ type: 'heading3', text: line.replace(/^####\s+/, ''), align: paragraphAlign });
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      sections.push({ type: 'bullet', text: line.replace(/^[-*•]\s+/, '') });
    } else if (line.startsWith('> ')) {
      sections.push({ type: 'quote', text: line.replace(/^>\s+/, ''), italic: true, align: paragraphAlign });
    } else {
      sections.push({ type: 'paragraph', text: line, align: paragraphAlign });
    }
  }

  flushTable();
  return sections;
}

/**
 * Export to genuine Microsoft Word Document (.docx)
 */
export async function exportToWordDocument(payload: DocExportPayload): Promise<void> {
  const rawTextWithNormalizedDates = payload.rawText ? normalizeAccessedDates(payload.rawText) : '';
  const sections = payload.sections && payload.sections.length > 0 
    ? payload.sections.map(s => ({
        ...s,
        text: s.text ? normalizeAccessedDates(s.text) : s.text,
        tableData: s.tableData ? {
          headers: s.tableData.headers.map(h => normalizeAccessedDates(h)),
          rows: s.tableData.rows.map(r => r.map(c => normalizeAccessedDates(c)))
        } : undefined
      }))
    : parseContentToSections(rawTextWithNormalizedDates || payload.title);

  const docxChildren: (Paragraph | Table)[] = [];

  // Title
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 100 },
      children: [
        new TextRun({
          text: cleanMarkdownText(payload.title),
          bold: true,
          size: 36, // 18pt
          color: '1E293B',
          font: 'Calibri'
        })
      ]
    })
  );

  // Subtitle / Author metadata
  if (payload.subtitle || payload.author || payload.category) {
    const metaParts = [];
    if (payload.subtitle) {
      metaParts.push(cleanMarkdownText(payload.subtitle));
    }
    if (payload.author && (!payload.subtitle || !payload.subtitle.includes(payload.author))) {
      metaParts.push(`Author: ${cleanMarkdownText(payload.author)}`);
    }
    if (payload.category && (!payload.subtitle || !payload.subtitle.includes(payload.category))) {
      metaParts.push(`Category: ${cleanMarkdownText(payload.category)}`);
    }

    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: metaParts.join('  •  '),
            italics: true,
            size: 22,
            color: '64748B',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Divider
  docxChildren.push(
    new Paragraph({
      spacing: { after: 300 },
      border: {
        bottom: {
          color: 'CBD5E1',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6
        }
      }
    })
  );

  // Body content sections
  for (const sec of sections) {
    const pAlign = sec.align === 'center' ? AlignmentType.CENTER : sec.align === 'right' ? AlignmentType.RIGHT : sec.align === 'justify' ? AlignmentType.JUSTIFIED : AlignmentType.LEFT;

    if (sec.type === 'heading1') {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: pAlign,
          spacing: { before: 360, after: 120 },
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { bold: true, size: 28, color: '0F172A' })
        })
      );
    } else if (sec.type === 'heading2') {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: pAlign,
          spacing: { before: 260, after: 100 },
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { bold: true, size: 24, color: '4338CA' })
        })
      );
    } else if (sec.type === 'heading3') {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          alignment: pAlign,
          spacing: { before: 200, after: 80 },
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { bold: true, size: 22, color: '334155' })
        })
      );
    } else if (sec.type === 'bullet') {
      docxChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          alignment: pAlign,
          spacing: { after: 100 },
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { size: 22, color: '334155' })
        })
      );
    } else if (sec.type === 'quote') {
      docxChildren.push(
        new Paragraph({
          spacing: { before: 160, after: 160 },
          alignment: pAlign,
          indent: { left: 720 },
          border: {
            left: {
              color: '9333EA',
              space: 10,
              style: BorderStyle.SINGLE,
              size: 18
            }
          },
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { italics: true, size: 22, color: '475569' })
        })
      );
    } else if (sec.type === 'table' && sec.tableData) {
      const { headers, rows } = sec.tableData;
      const tableRows: TableRow[] = [];

      if (headers.length > 0) {
        tableRows.push(
          new TableRow({
            tableHeader: true,
            children: headers.map(h => 
              new TableCell({
                shading: { fill: 'F1F5F9' },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({ 
                        text: cleanMarkdownText(h), 
                        bold: true, 
                        size: 20, 
                        color: '0F172A' 
                      })
                    ]
                  })
                ]
              })
            )
          })
        );
      }

      rows.forEach((rowCells) => {
        tableRows.push(
          new TableRow({
            children: rowCells.map(c => 
              new TableCell({
                children: [
                  new Paragraph({
                    children: parseInlineMarkdownToDocxRuns(c, { size: 20, color: '334155' })
                  })
                ]
              })
            )
          })
        );
      });

      docxChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );

      // Add spacing after table
      docxChildren.push(new Paragraph({ spacing: { after: 200 } }));
    } else if (sec.type === 'image' && (sec.imageData?.base64Data || sec.imageSrc)) {
      try {
        const rawSrc = sec.imageData?.base64Data || sec.imageSrc || '';
        const caption = sec.imageData?.caption || sec.caption;
        const width = sec.imageData?.width || 540;
        const height = sec.imageData?.height || 380;
        const imageResult = await imageSourceToWordImageBytes(rawSrc);
        if (imageResult && imageResult.bytes.length > 0) {
          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 100 },
              children: [
                new ImageRun({
                  type: imageResult.type,
                  data: imageResult.bytes,
                  transformation: {
                    width: width,
                    height: height
                  }
                })
              ]
            })
          );
          if (caption) {
            docxChildren.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 },
                children: [
                  new TextRun({
                    text: cleanMarkdownText(caption),
                    italics: true,
                    size: 18,
                    color: '64748B'
                  })
                ]
              })
            );
          }
        }
      } catch (imgErr) {
        console.warn('Could not insert image into DOCX:', imgErr);
      }
    } else if (sec.type === 'diagram') {
      const diagramText = sec.text || '';
      // 1. Render high-resolution diagram image
      const diagramImg = renderAsciiDiagramToImage(diagramText);
      if (diagramImg) {
        try {
          const imgBytes = dataUrlToUint8Array(diagramImg.dataUrl);
          if (imgBytes.length > 0) {
            docxChildren.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 120 },
                children: [
                  new ImageRun({
                    data: imgBytes,
                    transformation: {
                      width: Math.min(540, diagramImg.widthPx * 0.72),
                      height: Math.min(680, diagramImg.heightPx * 0.72)
                    },
                    type: 'png'
                  })
                ]
              })
            );
            docxChildren.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 180 },
                children: [
                  new TextRun({
                    text: 'Figure: Process & System Architecture Diagram',
                    italics: true,
                    size: 18,
                    color: '64748B'
                  })
                ]
              })
            );
          }
        } catch (e) {
          console.warn('Could not insert diagram image into DOCX:', e);
        }
      }

      // 2. Structured Monospace Table for editable, selectable text in Word
      const diagramLines = diagramText.split('\n');
      const cellParagraphs = diagramLines.map(line => new Paragraph({
        spacing: { before: 0, after: 0, line: 200 },
        indent: { firstLine: 0 },
        children: [
          new TextRun({
            text: line,
            font: 'Consolas',
            size: 15,
            color: '0F172A'
          })
        ]
      }));

      docxChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                  margins: { top: 140, bottom: 140, left: 180, right: 180 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    left: { style: BorderStyle.SINGLE, size: 12, color: '4F46E5' },
                    right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
                  },
                  children: cellParagraphs
                })
              ]
            })
          ]
        })
      );

      docxChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          children: []
        })
      );
    } else if (sec.type === 'equation') {
      const mathComp = latexToDocxMathComponent(sec.text || '', true);
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 },
          children: mathComp ? [mathComp] : [
            new DocxMath({
              children: [new MathRun(sec.text || '')]
            })
          ]
        })
      );
    } else {
      // Standard Paragraph
      docxChildren.push(
        new Paragraph({
          spacing: { after: 140 },
          indent: { firstLine: 480 },
          alignment: pAlign,
          children: parseInlineMarkdownToDocxRuns(sec.text || '', { size: 22, color: '1E293B' })
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                    color: '64748B'
                  })
                ]
              })
            ]
          })
        },
        children: docxChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  const safeName = (payload.filename || payload.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName || 'academic-document'}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Export to Professional Academic PDF Document (.pdf) with pristine typography,
 * consistent font sizing, robust pagination, and clear equation rendering.
 */
export async function exportToPdfDocument(payload: DocExportPayload): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configure high-fidelity Unicode TrueType font (FreeSans / FreeSansBold)
  // Providing native mathematical Greek letters, tensor indices, superscripts, subscripts
  const fontFamily = await setupPdfUnicodeFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20; // 20mm margin (academic standard)
  const contentWidth = pageWidth - margin * 2;
  const pageLimitY = pageHeight - margin - 6; // Leave space for footer
  let cursorY = margin;

  // Consistent typography settings
  const BODY_FONT_SIZE = 10;
  const BODY_LINE_HEIGHT = 5.0;

  // Add page helper ensuring uniform top margin
  const newPage = () => {
    doc.addPage();
    cursorY = margin;
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(BODY_FONT_SIZE);
    doc.setTextColor(15, 23, 42);
  };

  // Check if needed height exceeds printable page height
  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageLimitY) {
      newPage();
    }
  };

  // Prevent orphan headings: ensures room for heading + at least 15mm of following text
  const checkHeadingBreak = (hHeight: number) => {
    if (cursorY + hHeight + 15 > pageLimitY) {
      newPage();
    }
  };

  // Sanitize title/metadata by removing any NEXORA branding, confidential labels, or date strings
  const sanitizeMeta = (txt?: string): string => {
    if (!txt) return '';
    return txt
      .replace(/\bNEXORA\s*(?:Academic\s*(?:Research\s*)?Workspace|Academic\s*Assistant|Scientific\s*Research)?\b/gi, '')
      .replace(/\bConfidential(?:\s+Academic(?:\s+Work|\s+Content)?)?\b/gi, '')
      .replace(/\b(?:Date:?\s*)?\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/gi, '')
      .replace(/\b(?:Date:?\s*)?[A-Za-z]+\s+\d{1,2},?\s+\d{4}\b/gi, '')
      .replace(/\b(?:Date:?\s*)?\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/gi, '')
      .replace(/\|\s*\|/g, '|')
      .replace(/(?:^\s*\|\s*|\s*\|\s*$)/g, '')
      .trim();
  };

  // Clean title without branding/confidential markers
  let cleanTitle = sanitizeMeta(cleanMarkdownText(payload.title)) || 'Academic Research Report';

  // Document Title
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  ensureSpace(titleLines.length * 7.5 + 10);
  doc.text(titleLines, margin, cursorY + 4);
  cursorY += titleLines.length * 7.5 + 4;

  // Subtitle / Category (sanitized of NEXORA, Confidential, dates)
  const cleanSub = sanitizeMeta(payload.subtitle ? cleanMarkdownText(payload.subtitle) : '');
  const cleanAuthor = sanitizeMeta(payload.author ? cleanMarkdownText(payload.author) : '');
  const cleanCat = sanitizeMeta(payload.category ? cleanMarkdownText(payload.category) : '');

  const metaParts = [
    cleanSub,
    cleanAuthor ? `By ${cleanAuthor}` : '',
    cleanCat ? `Field: ${cleanCat}` : ''
  ].filter(Boolean);

  if (metaParts.length > 0) {
    if (fontFamily === 'FreeSans') {
      doc.setFont(fontFamily, 'normal');
    } else {
      doc.setFont('helvetica', 'italic');
    }
    doc.setFontSize(BODY_FONT_SIZE);
    doc.setTextColor(71, 85, 105);
    const metaText = metaParts.join('   |   ');
    const metaLines = doc.splitTextToSize(metaText, contentWidth);
    ensureSpace(metaLines.length * BODY_LINE_HEIGHT + 4);
    doc.text(metaLines, margin, cursorY + 2);
    cursorY += metaLines.length * BODY_LINE_HEIGHT + 4;
  }

  // Subtle separator line below title block
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 7;

  // Parse document sections
  const rawTextWithNormalizedDates = payload.rawText ? normalizeAccessedDates(payload.rawText) : '';
  const sections = payload.sections && payload.sections.length > 0 
    ? payload.sections.map(s => ({
        ...s,
        text: s.text ? normalizeAccessedDates(s.text) : s.text,
        tableData: s.tableData ? {
          headers: s.tableData.headers.map(h => normalizeAccessedDates(h)),
          rows: s.tableData.rows.map(r => r.map(c => normalizeAccessedDates(c)))
        } : undefined
      }))
    : parseContentToSections(rawTextWithNormalizedDates || cleanTitle);

  // Render sections with unified, mathematically consistent font sizes and natural flow
  for (const sec of sections) {
    if (sec.type === 'heading1') {
      const text = cleanMarkdownText(sec.text || '');
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(text, contentWidth);
      const hHeight = lines.length * 6;
      checkHeadingBreak(hHeight);
      cursorY += 5; // spacing before heading
      doc.text(lines, margin, cursorY);
      cursorY += hHeight + 3.5; // spacing after heading

    } else if (sec.type === 'heading2') {
      const text = cleanMarkdownText(sec.text || '');
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(text, contentWidth);
      const hHeight = lines.length * 5.5;
      checkHeadingBreak(hHeight);
      cursorY += 4.5;
      doc.text(lines, margin, cursorY);
      cursorY += hHeight + 3.0;

    } else if (sec.type === 'heading3') {
      const text = cleanMarkdownText(sec.text || '');
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(text, contentWidth);
      const hHeight = lines.length * 5.0;
      checkHeadingBreak(hHeight);
      cursorY += 3.5;
      doc.text(lines, margin, cursorY);
      cursorY += hHeight + 2.5;

    } else if (sec.type === 'bullet') {
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(15, 23, 42);

      const rawBullet = sec.text || '';
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const links: { text: string; url: string }[] = [];
      let lMatch;
      while ((lMatch = linkRegex.exec(rawBullet)) !== null) {
        links.push({ text: lMatch[1], url: lMatch[2] });
      }

      const cleanBullet = cleanMarkdownText(rawBullet);
      if (links.length === 0) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let uMatch;
        while ((uMatch = urlRegex.exec(cleanBullet)) !== null) {
          links.push({ text: uMatch[1], url: uMatch[1] });
        }
      }

      const bulletLines = doc.splitTextToSize(cleanBullet, contentWidth - 6);

      // Page break check for bullet item
      if (cursorY + bulletLines.length * BODY_LINE_HEIGHT > pageLimitY) {
        newPage();
      }

      doc.text('•', margin + 1, cursorY);
      bulletLines.forEach((bLine: string) => {
        if (cursorY + BODY_LINE_HEIGHT > pageLimitY) {
          newPage();
        }
        doc.text(bLine, margin + 5, cursorY);

        // Clickable link annotations
        for (const lnk of links) {
          const cleanLinkText = cleanMarkdownText(lnk.text);
          const linkIdx = bLine.indexOf(cleanLinkText);
          if (linkIdx !== -1) {
            const beforeStr = bLine.substring(0, linkIdx);
            const linkX = margin + 5 + doc.getTextWidth(beforeStr);
            const linkW = doc.getTextWidth(cleanLinkText);
            doc.setTextColor(29, 78, 216); // Academic blue
            doc.text(cleanLinkText, linkX, cursorY);
            doc.link(linkX, cursorY - 3.2, linkW, 4.2, { url: lnk.url });
            doc.setTextColor(15, 23, 42);
          }
        }

        cursorY += BODY_LINE_HEIGHT;
      });
      cursorY += 2.0;

    } else if (sec.type === 'quote') {
      if (fontFamily === 'FreeSans') {
        doc.setFont(fontFamily, 'normal');
      } else {
        doc.setFont('helvetica', 'italic');
      }
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(51, 65, 85);
      const cleanQuote = cleanMarkdownText(sec.text || '');
      const quoteLines = doc.splitTextToSize(cleanQuote, contentWidth - 12);

      const quoteH = quoteLines.length * BODY_LINE_HEIGHT;
      if (cursorY + quoteH > pageLimitY) {
        newPage();
      }

      const quoteStart = cursorY;
      quoteLines.forEach((qLine: string) => {
        doc.text(qLine, margin + 7, cursorY);
        cursorY += BODY_LINE_HEIGHT;
      });

      // Left accent bar
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(1.0);
      doc.line(margin + 2, quoteStart - 3.5, margin + 2, cursorY - 1.5);
      cursorY += 3.0;

    } else if (sec.type === 'equation') {
      const eqText = (sec.text || '').trim();
      cursorY += 2.5; // Spacing before formula card
      
      const vectorMath = renderLatexToVectorSvg(eqText, true, contentWidth - 20);
      if (vectorMath) {
        const cardPaddingX = 6.0;
        const cardPaddingY = 3.0;
        const cardWidth = Math.min(contentWidth, Math.max(vectorMath.widthMm + cardPaddingX * 2, 70));
        const cardHeight = vectorMath.heightMm + cardPaddingY * 2;
        const cardX = (pageWidth - cardWidth) / 2;

        ensureSpace(cardHeight + 6);

        // Academic equation card (light purple tint, crisp lavender border, purple left accent line)
        doc.setFillColor(250, 245, 255); // #FAF5FF
        doc.setDrawColor(233, 213, 255); // #E9D5FF
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 2, 2, 'FD');

        // Distinctive purple accent bar on the left of the card
        doc.setDrawColor(147, 51, 234); // #9333EA
        doc.setLineWidth(1.0);
        doc.line(cardX, cursorY, cardX, cursorY + cardHeight);

        // Center equation inside the card
        const mathX = cardX + (cardWidth - vectorMath.widthMm) / 2;
        const mathY = cursorY + cardPaddingY;

        try {
          await embedMathInPdf(doc, eqText, mathX, mathY, {
            displayMode: true,
            maxWidthMm: contentWidth - 20
          });
          cursorY += cardHeight + 4.0; // Spacing after formula card
        } catch (eqErr) {
          console.warn('Could not embed equation into PDF:', eqErr);
          doc.setFont(fontFamily, 'normal');
          doc.setFontSize(BODY_FONT_SIZE);
          doc.setTextColor(15, 23, 42);
          const cleanEq = convertLatexToUnicode(eqText);
          doc.text(cleanEq, pageWidth / 2, cursorY + cardHeight / 2 + 1, { align: 'center' });
          cursorY += cardHeight + 4.0;
        }
      } else {
        const cleanEq = convertLatexToUnicode(eqText);
        const cardHeight = 11.0;
        const cardWidth = Math.min(contentWidth, Math.max(doc.getTextWidth(cleanEq) + 24, 70));
        const cardX = (pageWidth - cardWidth) / 2;
        ensureSpace(cardHeight + 6);

        doc.setFillColor(250, 245, 255);
        doc.setDrawColor(233, 213, 255);
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 2, 2, 'FD');
        doc.setDrawColor(147, 51, 234);
        doc.setLineWidth(1.0);
        doc.line(cardX, cursorY, cardX, cursorY + cardHeight);

        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(15, 23, 42);
        doc.text(cleanEq, pageWidth / 2, cursorY + 7.0, { align: 'center' });
        cursorY += cardHeight + 4.0;
      }

    } else if (sec.type === 'diagram') {
      const diagramText = sec.text || '';
      cursorY += 4.0;
      const diagramImg = renderAsciiDiagramToImage(diagramText);
      if (diagramImg) {
        ensureSpace(diagramImg.heightMm + 14);
        const posX = Math.max(margin, (pageWidth - diagramImg.widthMm) / 2);
        try {
          doc.addImage(diagramImg.dataUrl, 'PNG', posX, cursorY, diagramImg.widthMm, diagramImg.heightMm);
          cursorY += diagramImg.heightMm + 3.5;

          if (fontFamily === 'FreeSans') {
            doc.setFont(fontFamily, 'normal');
          } else {
            doc.setFont('helvetica', 'italic');
          }
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text('Figure: Process & System Architecture Diagram', pageWidth / 2, cursorY, { align: 'center' });
          cursorY += 7.0;
        } catch (diagErr) {
          console.warn('Could not insert diagram image into PDF:', diagErr);
        }
      } else {
        const dLines = diagramText.split('\n');
        const boxH = dLines.length * 4.0 + 6;
        ensureSpace(boxH + 6);

        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY - 2, contentWidth, boxH, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(margin, cursorY - 2, contentWidth, boxH, 'S');
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.8);
        doc.line(margin, cursorY - 2, margin, cursorY - 2 + boxH);

        doc.setFont('courier', 'normal');
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(15, 23, 42);

        let lineY = cursorY + 2;
        dLines.forEach(line => {
          doc.text(line, margin + 3, lineY);
          lineY += 4.0;
        });

        cursorY += boxH + 5.0;
      }

    } else if (sec.type === 'table' && sec.tableData) {
      const { headers, rows } = sec.tableData;
      const numCols = Math.max(headers.length, rows[0]?.length || 1);
      const colW = contentWidth / numCols;
      const cellPad = 3.0;
      const innerW = colW - cellPad * 2;

      cursorY += 4.0;

      // Table Header Row helper function
      const drawTableHeader = () => {
        let hMaxLines = 1;
        const splitH = headers.map(h => {
          const lines = doc.splitTextToSize(cleanMarkdownText(h), innerW);
          if (lines.length > hMaxLines) hMaxLines = lines.length;
          return lines;
        });

        const headerH = Math.max(9, hMaxLines * 4.8 + 4);
        ensureSpace(headerH + 8);

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, cursorY - 2, contentWidth, headerH, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(margin, cursorY - 2, contentWidth, headerH, 'S');

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(15, 23, 42);
        splitH.forEach((hLines, cIdx) => {
          const cellX = margin + cIdx * colW + cellPad;
          doc.text(hLines, cellX, cursorY + 2.5);
        });
        cursorY += headerH;
      };

      drawTableHeader();

      // Table Body Rows
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(15, 23, 42);

      rows.forEach((rowCells, rIdx) => {
        let rMaxLines = 1;
        const splitC = rowCells.map(c => {
          const lines = doc.splitTextToSize(cleanMarkdownText(c), innerW);
          if (lines.length > rMaxLines) rMaxLines = lines.length;
          return lines;
        });

        const rowH = Math.max(8, rMaxLines * 4.6 + 3);
        
        // Multi-page table handling: if row overflows, start fresh page and repeat header
        if (cursorY + rowH > pageLimitY) {
          newPage();
          drawTableHeader();
          doc.setFont(fontFamily, 'normal');
          doc.setFontSize(BODY_FONT_SIZE);
          doc.setTextColor(15, 23, 42);
        }

        // Alternating row background
        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, cursorY - 2, contentWidth, rowH, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(margin, cursorY - 2, contentWidth, rowH, 'S');

        splitC.forEach((cLines, cIdx) => {
          const cellX = margin + cIdx * colW + cellPad;
          if (cIdx === 0) {
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(15, 23, 42);
          } else {
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(15, 23, 42);
          }
          doc.text(cLines, cellX, cursorY + 2.5);
        });

        cursorY += rowH;
      });

      cursorY += 5.0;

    } else if (sec.type === 'image' && sec.imageData) {
      try {
        const imgH = 70; // mm
        ensureSpace(imgH + 12);
        doc.addImage(sec.imageData.base64Data, 'PNG', margin + 8, cursorY, contentWidth - 16, imgH);
        cursorY += imgH + 3.0;
        if (sec.imageData.caption) {
          if (fontFamily === 'FreeSans') {
            doc.setFont(fontFamily, 'normal');
          } else {
            doc.setFont('helvetica', 'italic');
          }
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(sec.imageData.caption, pageWidth / 2, cursorY, { align: 'center' });
          cursorY += 5.0;
        }
        cursorY += 4.0;
      } catch (err) {
        console.warn('Failed to render image in PDF:', err);
      }

    } else {
      // Regular paragraph - render with continuous line-by-line flow (eliminating scattered white space)
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(15, 23, 42);

      const rawPara = sec.text || '';
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const links: { text: string; url: string }[] = [];
      let lMatch;
      while ((lMatch = linkRegex.exec(rawPara)) !== null) {
        links.push({ text: lMatch[1], url: lMatch[2] });
      }

      const cleanPara = cleanMarkdownText(rawPara);
      if (links.length === 0) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let uMatch;
        while ((uMatch = urlRegex.exec(cleanPara)) !== null) {
          links.push({ text: uMatch[1], url: uMatch[1] });
        }
      }

      // Academic Paragraph Demarcation with First-Line Indentation (7.5 mm)
      const firstLineIndentMm = 7.5;
      const firstLineArr = doc.splitTextToSize(cleanPara, contentWidth - firstLineIndentMm);
      let pLines: string[] = [];
      if (firstLineArr.length > 0) {
        const firstLine = firstLineArr[0];
        const remainingText = cleanPara.slice(firstLine.length).trimStart();
        if (remainingText) {
          const restLines = doc.splitTextToSize(remainingText, contentWidth);
          pLines = [firstLine, ...restLines];
        } else {
          pLines = [firstLine];
        }
      } else {
        pLines = doc.splitTextToSize(cleanPara, contentWidth);
      }

      for (let lIdx = 0; lIdx < pLines.length; lIdx++) {
        const pLine = pLines[lIdx];
        const lineX = margin + (lIdx === 0 ? firstLineIndentMm : 0);

        if (cursorY + BODY_LINE_HEIGHT > pageLimitY) {
          newPage();
        }
        doc.text(pLine, lineX, cursorY);

        // Clickable link annotations
        for (const lnk of links) {
          const cleanLinkText = cleanMarkdownText(lnk.text);
          const linkIdx = pLine.indexOf(cleanLinkText);
          if (linkIdx !== -1) {
            const beforeStr = pLine.substring(0, linkIdx);
            const linkX = lineX + doc.getTextWidth(beforeStr);
            const linkW = doc.getTextWidth(cleanLinkText);
            doc.setTextColor(29, 78, 216); // Academic blue
            doc.text(cleanLinkText, linkX, cursorY);
            doc.link(linkX, cursorY - 3.2, linkW, 4.2, { url: lnk.url });
            doc.setTextColor(15, 23, 42);
          }
        }

        cursorY += BODY_LINE_HEIGHT;
      }
      cursorY += 3.0; // Paragraph bottom margin
    }
  }

  // Draw clean, elegant, professional page numbers on all pages (just a number automatically indicating page number)
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`${p}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  const safeName = (payload.filename || cleanTitle)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`${safeName || 'academic-report'}.pdf`);
}

/**
 * Export to Markdown (.md)
 */
export function exportToMarkdown(payload: DocExportPayload): void {
  let md = `# ${cleanMarkdownText(payload.title)}\n\n`;
  if (payload.subtitle) md += `*${cleanMarkdownText(payload.subtitle)}*\n\n`;
  if (payload.author) md += `**Author:** ${cleanMarkdownText(payload.author)}\n\n`;
  md += `---\n\n`;

  if (payload.rawText) {
    md += normalizeAccessedDates(payload.rawText);
  } else if (payload.sections) {
    payload.sections.forEach(s => {
      const normalizedSecText = s.text ? normalizeAccessedDates(s.text) : '';
      if (s.type === 'heading1') md += `## ${cleanMarkdownText(normalizedSecText)}\n\n`;
      else if (s.type === 'heading2') md += `### ${cleanMarkdownText(normalizedSecText)}\n\n`;
      else if (s.type === 'heading3') md += `#### ${cleanMarkdownText(normalizedSecText)}\n\n`;
      else if (s.type === 'bullet') md += `- ${cleanMarkdownText(normalizedSecText)}\n`;
      else if (s.type === 'quote') md += `> ${cleanMarkdownText(normalizedSecText)}\n\n`;
      else if (s.type === 'equation') md += `$$\n${s.text || ''}\n$$\n\n`;
      else if (s.type === 'diagram') md += `\`\`\`text\n${s.text || ''}\n\`\`\`\n\n`;
      else if (s.type === 'table' && s.tableData) {
        md += `| ${s.tableData.headers.map(cleanMarkdownText).join(' | ')} |\n`;
        md += `| ${s.tableData.headers.map(() => '---').join(' | ')} |\n`;
        s.tableData.rows.forEach(r => {
          md += `| ${r.map(cleanMarkdownText).join(' | ')} |\n`;
        });
        md += `\n`;
      } else {
        md += `${s.text}\n\n`;
      }
    });
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  const safeName = (payload.filename || payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName || 'document'}.md`;
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Export to Text (.txt)
 */
export function exportToText(payload: DocExportPayload): void {
  const text = `${cleanMarkdownText(payload.title)}\n${'='.repeat(cleanMarkdownText(payload.title).length)}\n\n` + 
    (payload.subtitle ? `${cleanMarkdownText(payload.subtitle)}\n\n` : '') +
    (payload.rawText 
      ? payload.rawText 
      : (payload.sections ? payload.sections.map(s => s.type === 'diagram' ? (s.text || '') : cleanMarkdownText(s.text || '')).join('\n\n') : ''));

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const safeName = (payload.filename || payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName || 'document'}.txt`;
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
