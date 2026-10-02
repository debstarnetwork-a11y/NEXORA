import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

let mjDocInstance: any = null;
let adaptorInstance: any = null;

function getMathJaxDocument() {
  if (mjDocInstance && adaptorInstance) {
    return { mjDoc: mjDocInstance, adaptor: adaptorInstance };
  }

  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  const tex = new TeX({
    packages: AllPackages,
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  });

  const svg = new SVG({
    fontCache: 'none' // Embed full vector paths in each equation SVG (self-contained, no external font dependency)
  });

  const mjDoc = mathjax.document('', {
    InputJax: tex,
    OutputJax: svg
  });

  mjDocInstance = mjDoc;
  adaptorInstance = adaptor;
  return { mjDoc, adaptor };
}

export interface RenderedMathSvg {
  svgString: string;
  svgElement: SVGElement | null;
  widthMm: number;
  heightMm: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

const mathSvgCache = new Map<string, RenderedMathSvg>();
const rasterCache = new Map<string, { dataUrl: string; widthMm: number; heightMm: number }>();

/**
 * Normalizes LaTeX math strings before rendering
 */
export function normalizeLatexMath(latex: string): string {
  let cleaned = (latex || '').trim();
  // Strip outer delimiters if present: $$...$$, $...$, \[...\], \(...\)
  if (cleaned.startsWith('$$') && cleaned.endsWith('$$') && cleaned.length >= 4) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]') && cleaned.length >= 4) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)') && cleaned.length >= 4) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$') && cleaned.endsWith('$') && cleaned.length >= 2 && !cleaned.slice(1, -1).includes('$')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Render a LaTeX equation into a pure vector SVG using MathJax mathematical typesetting engine.
 * True mathematical layout: proper fraction bars, roots, superscripts, subscripts, Greek characters.
 */
export function renderLatexToVectorSvg(
  latex: string,
  displayMode: boolean = true,
  maxAvailableWidthMm: number = 165
): RenderedMathSvg | null {
  const formula = normalizeLatexMath(latex);
  if (!formula) return null;

  const cacheKey = `${formula}___${displayMode}___${maxAvailableWidthMm}`;
  if (mathSvgCache.has(cacheKey)) {
    return mathSvgCache.get(cacheKey)!;
  }

  try {
    const { mjDoc, adaptor } = getMathJaxDocument();
    const node = mjDoc.convert(formula, { display: displayMode });
    let svgString = adaptor.innerHTML(node);
    if (!svgString || !svgString.includes('<svg')) {
      return null;
    }

    // Ensure colors match academic styling
    svgString = svgString.replace(/currentColor/g, '#0F172A');

    // Extract viewBox dimensions
    const vbMatch = svgString.match(/viewBox="([^"]+)"/);
    let vbW = 1000;
    let vbH = 500;
    if (vbMatch) {
      const parts = vbMatch[1].split(/\s+/).map(Number);
      if (parts.length === 4) {
        vbW = Math.max(parts[2] || 1000, 10);
        vbH = Math.max(parts[3] || 500, 10);
      }
    }

    // Harmonized academic typography scale:
    // MathJax 1em = 1000 units.
    // Body font is 10.5pt (~3.7mm).
    // Using 0.0050 mm/unit provides crisp, proportionate mathematical display.
    const baseScale = displayMode ? 0.0050 : 0.0042;
    let widthMm = Math.max(vbW * baseScale, 5);
    let heightMm = Math.max(vbH * baseScale, 3);

    // Ensure formula never overflows available page width
    if (widthMm > maxAvailableWidthMm) {
      const shrinkRatio = maxAvailableWidthMm / widthMm;
      widthMm = maxAvailableWidthMm;
      heightMm = heightMm * shrinkRatio;
    }

    let svgElement: SVGElement | null = null;
    if (typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(svgString, 'image/svg+xml');
        svgElement = parsedDoc.documentElement as unknown as SVGElement;
      } catch {
        svgElement = null;
      }
    }

    const result: RenderedMathSvg = {
      svgString,
      svgElement,
      widthMm,
      heightMm,
      viewBoxWidth: vbW,
      viewBoxHeight: vbH
    };

    mathSvgCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('MathJax vector SVG generation failed for:', formula, err);
    return null;
  }
}

/**
 * Render MathJax vector SVG to a high-resolution PNG data URL using native browser Image/Canvas
 * (Fast, self-contained fallback that does NOT use html2canvas or DOM manipulation)
 */
export async function renderLatexToRasterDataUrl(
  latex: string,
  displayMode: boolean = true,
  maxAvailableWidthMm: number = 165
): Promise<{ dataUrl: string; widthMm: number; heightMm: number } | null> {
  const formula = normalizeLatexMath(latex);
  if (!formula) return null;

  const cacheKey = `${formula}___${displayMode}___${maxAvailableWidthMm}`;
  if (rasterCache.has(cacheKey)) {
    return rasterCache.get(cacheKey)!;
  }

  const vector = renderLatexToVectorSvg(formula, displayMode, maxAvailableWidthMm);
  if (!vector) return null;

  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return null;
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      // 300 DPI multiplier (approx 12 pixels per mm)
      const scaleMultiplier = 12;
      const widthPx = Math.max(Math.round(vector.widthMm * scaleMultiplier), 100);
      const heightPx = Math.max(Math.round(vector.heightMm * scaleMultiplier), 40);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = widthPx;
          canvas.height = heightPx;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable'));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, widthPx, heightPx);
          const pngUrl = canvas.toDataURL('image/png');
          resolve(pngUrl);
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = (e) => reject(e);

      // Clean SVG base64 data URL
      const svgUtf8 = encodeURIComponent(vector.svgString);
      img.src = `data:image/svg+xml;charset=utf-8,${svgUtf8}`;
    });

    const res = {
      dataUrl,
      widthMm: vector.widthMm,
      heightMm: vector.heightMm
    };
    rasterCache.set(cacheKey, res);
    return res;
  } catch (err) {
    console.warn('Native SVG rasterization fallback failed:', err);
    return null;
  }
}

/**
 * Embeds a mathematical equation into a jsPDF document using true vector SVG paths
 * with automatic fallback to high-resolution raster if vector SVG rendering fails.
 */
export async function embedMathInPdf(
  doc: jsPDF,
  latex: string,
  x: number,
  y: number,
  options: {
    displayMode?: boolean;
    maxWidthMm?: number;
  } = {}
): Promise<{ widthMm: number; heightMm: number } | null> {
  const displayMode = options.displayMode !== false;
  const maxWidthMm = options.maxWidthMm || 165;

  const vector = renderLatexToVectorSvg(latex, displayMode, maxWidthMm);
  if (!vector) return null;

  // Try pure vector embedding first via svg2pdf.js
  if (vector.svgElement && typeof (doc as any).svg === 'function') {
    try {
      await (doc as any).svg(vector.svgElement, {
        x,
        y,
        width: vector.widthMm,
        height: vector.heightMm
      });
      return { widthMm: vector.widthMm, heightMm: vector.heightMm };
    } catch (svgErr) {
      console.warn('svg2pdf vector embed encountered error, falling back to raster:', svgErr);
    }
  }

  // Fallback: render vector SVG directly onto offscreen canvas and insert as PNG
  try {
    const raster = await renderLatexToRasterDataUrl(latex, displayMode, maxWidthMm);
    if (raster) {
      doc.addImage(raster.dataUrl, 'PNG', x, y, raster.widthMm, raster.heightMm);
      return { widthMm: raster.widthMm, heightMm: raster.heightMm };
    }
  } catch (imgErr) {
    console.warn('Math raster fallback failed:', imgErr);
  }

  return null;
}
