import { extractTextFromPdf } from './pdfExtractor';
import mammoth from 'mammoth';

export interface UploadedDocumentPayload {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'text' | 'image' | 'spreadsheet' | 'code' | 'other';
  extension: string;
  size: number;
  sizeFormatted: string;
  text: string;
  pageCount?: number;
  preview: string;
  rawBase64?: string;
  timestamp: number;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Universal document parser supporting PDF, Word DOCX, TXT, CSV, JSON, MD, code, and images
 */
export async function parseUploadedFile(file: File): Promise<UploadedDocumentPayload> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const size = file.size;
  const sizeFormatted = formatBytes(size);

  // 1. PDF Files
  if (ext === 'pdf' || file.type === 'application/pdf') {
    try {
      const extracted = await extractTextFromPdf(file);
      return {
        id,
        name: file.name,
        type: 'pdf',
        extension: 'pdf',
        size,
        sizeFormatted,
        text: extracted.text,
        pageCount: extracted.pageCount,
        preview: extracted.text.slice(0, 300) + (extracted.text.length > 300 ? '...' : ''),
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('PDF extraction failed:', err);
      return {
        id,
        name: file.name,
        type: 'pdf',
        extension: 'pdf',
        size,
        sizeFormatted,
        text: `[PDF Document: ${file.name}]`,
        preview: `PDF Document (${sizeFormatted})`,
        timestamp: Date.now()
      };
    }
  }

  // 2. Microsoft Word (.docx) Files
  if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value || '';
      return {
        id,
        name: file.name,
        type: 'docx',
        extension: 'docx',
        size,
        sizeFormatted,
        text,
        preview: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('DOCX extraction failed:', err);
      return {
        id,
        name: file.name,
        type: 'docx',
        extension: 'docx',
        size,
        sizeFormatted,
        text: `[Microsoft Word Document: ${file.name}]`,
        preview: `Word Document (${sizeFormatted})`,
        timestamp: Date.now()
      };
    }
  }

  // 3. Images (PNG, JPG, JPEG, WEBP, SVG)
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string) || '';
        resolve({
          id,
          name: file.name,
          type: 'image',
          extension: ext,
          size,
          sizeFormatted,
          text: `[Image: ${file.name} - ${sizeFormatted}]`,
          preview: `Image: ${file.name}`,
          rawBase64: base64,
          timestamp: Date.now()
        });
      };
      reader.onerror = () => {
        resolve({
          id,
          name: file.name,
          type: 'image',
          extension: ext,
          size,
          sizeFormatted,
          text: `[Image File: ${file.name}]`,
          preview: `Image (${sizeFormatted})`,
          timestamp: Date.now()
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // 4. Spreadsheets & Tabular Data (CSV, TSV)
  if (['csv', 'tsv'].includes(ext)) {
    try {
      const text = await file.text();
      return {
        id,
        name: file.name,
        type: 'spreadsheet',
        extension: ext,
        size,
        sizeFormatted,
        text,
        preview: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
        timestamp: Date.now()
      };
    } catch {
      // Fallback
    }
  }

  // 5. Code & Data Files (JSON, XML, HTML, LaTeX, JS, TS, PY, etc.)
  if (['json', 'xml', 'html', 'tex', 'py', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'java', 'r'].includes(ext)) {
    try {
      const text = await file.text();
      return {
        id,
        name: file.name,
        type: 'code',
        extension: ext,
        size,
        sizeFormatted,
        text,
        preview: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
        timestamp: Date.now()
      };
    } catch {
      // Fallback
    }
  }

  // 6. Default Text / Markdown Files
  try {
    const text = await file.text();
    return {
      id,
      name: file.name,
      type: 'text',
      extension: ext || 'txt',
      size,
      sizeFormatted,
      text,
      preview: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
      timestamp: Date.now()
    };
  } catch (err) {
    return {
      id,
      name: file.name,
      type: 'other',
      extension: ext,
      size,
      sizeFormatted,
      text: `[Attached File: ${file.name}]`,
      preview: `${file.name} (${sizeFormatted})`,
      timestamp: Date.now()
    };
  }
}
