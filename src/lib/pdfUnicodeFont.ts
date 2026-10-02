import { jsPDF } from 'jspdf';

let cachedRegularBase64: string | null = null;
let cachedBoldBase64: string | null = null;
let fontLoadPromise: Promise<{ regular: string; bold: string } | null> | null = null;

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Loads and caches TrueType Unicode fonts (FreeSans and FreeSansBold)
 * Providing full native UTF-8 / CID-0 font embedding for mathematical Greek letters,
 * tensor indices, superscripts, subscripts, and scientific symbols in jsPDF.
 */
export async function loadUnicodeFonts(): Promise<{ regular: string; bold: string } | null> {
  if (cachedRegularBase64 && cachedBoldBase64) {
    return { regular: cachedRegularBase64, bold: cachedBoldBase64 };
  }

  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    try {
      // In Node.js environment (e.g. tests or SSR)
      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const regPath = path.join(process.cwd(), 'public', 'fonts', 'FreeSans.ttf');
        const boldPath = path.join(process.cwd(), 'public', 'fonts', 'FreeSansBold.ttf');
        if (fs.existsSync(regPath) && fs.existsSync(boldPath)) {
          cachedRegularBase64 = fs.readFileSync(regPath).toString('base64');
          cachedBoldBase64 = fs.readFileSync(boldPath).toString('base64');
          return { regular: cachedRegularBase64, bold: cachedBoldBase64 };
        }
      }

      // In browser environment
      const [regRes, boldRes] = await Promise.all([
        fetch('/fonts/FreeSans.ttf'),
        fetch('/fonts/FreeSansBold.ttf')
      ]);

      if (!regRes.ok || !boldRes.ok) {
        console.warn('Could not fetch Unicode fonts, falling back to standard fonts');
        return null;
      }

      const [regBuf, boldBuf] = await Promise.all([
        regRes.arrayBuffer(),
        boldRes.arrayBuffer()
      ]);

      cachedRegularBase64 = await arrayBufferToBase64(regBuf);
      cachedBoldBase64 = await arrayBufferToBase64(boldBuf);

      return {
        regular: cachedRegularBase64,
        bold: cachedBoldBase64
      };
    } catch (err) {
      console.warn('Unicode font load error:', err);
      return null;
    }
  })();

  return fontLoadPromise;
}

/**
 * Injects Unicode TrueType fonts into a jsPDF document instance.
 * Returns the font family name to use ('FreeSans' on success, 'helvetica' on fallback).
 */
export async function setupPdfUnicodeFonts(doc: jsPDF): Promise<string> {
  try {
    const fonts = await loadUnicodeFonts();
    if (fonts) {
      doc.addFileToVFS('FreeSans.ttf', fonts.regular);
      doc.addFont('FreeSans.ttf', 'FreeSans', 'normal');

      doc.addFileToVFS('FreeSansBold.ttf', fonts.bold);
      doc.addFont('FreeSansBold.ttf', 'FreeSans', 'bold');

      // Test font readiness
      doc.setFont('FreeSans', 'normal');
      return 'FreeSans';
    }
  } catch (err) {
    console.warn('Failed to configure Unicode font in jsPDF:', err);
  }

  doc.setFont('helvetica', 'normal');
  return 'helvetica';
}
