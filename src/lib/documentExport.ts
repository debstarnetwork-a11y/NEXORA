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
  BorderStyle
} from 'docx';
import { jsPDF } from 'jspdf';

export interface DocExportSection {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'quote' | 'table' | 'image';
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
 * Strip raw markdown markers (#, **, *, ~~, _, `) from a string for clean display
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
): TextRun[] {
  if (!text) return [new TextRun({ text: '', ...defaults })];

  const runs: TextRun[] = [];

  // Match HTML tags (<span style="...">, <mark>, <font>, <b>, <i>, <u>, etc.) and Markdown (**bold**, *italic*, etc.)
  const pattern = /(<mark[^>]*>.*?<\/mark>|<span[^>]*>.*?<\/span>|<font[^>]*>.*?<\/font>|<b[^>]*>.*?<\/b>|<strong[^>]*>.*?<\/strong>|<i[^>]*>.*?<\/i>|<em[^>]*>.*?<\/em>|<u[^>]*>.*?<\/u>|\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~|`.*?`|[^*<~`]+)/gi;
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
    // 2. Markdown **bold**
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
 * Convert dataURL (base64) to Uint8Array for docx ImageRun
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  try {
    const parts = dataUrl.split(',');
    const base64 = parts.length > 1 ? parts[1] : parts[0];
    const cleanBase64 = base64.replace(/\s+/g, '');
    const binaryString = atob(cleanBase64);
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

/**
 * Universal Image / SVG to PNG Uint8Array rasterizer for Word .docx export
 */
async function imageSourceToPngUint8Array(src: string): Promise<Uint8Array | null> {
  if (!src) return null;
  const cleanSrc = src.trim();

  // If it's already a base64 PNG or JPEG
  if (cleanSrc.startsWith('data:image/png;base64,') || cleanSrc.startsWith('data:image/jpeg;base64,')) {
    const bytes = dataUrlToUint8Array(cleanSrc);
    if (bytes.length > 0) return bytes;
  }

  // If it's an SVG (data URL or raw XML) or any image format, rasterize it onto a clean canvas
  return new Promise((resolve) => {
    try {
      let finalUrl = cleanSrc;
      let isObjectUrl = false;

      if (cleanSrc.startsWith('<svg')) {
        const blob = new Blob([cleanSrc], { type: 'image/svg+xml;charset=utf-8' });
        finalUrl = URL.createObjectURL(blob);
        isObjectUrl = true;
      } else if (cleanSrc.startsWith('data:image/svg+xml')) {
        if (!cleanSrc.includes(';base64,')) {
          const parts = cleanSrc.split(',');
          const rawSvg = decodeURIComponent(parts.slice(1).join(','));
          const blob = new Blob([rawSvg], { type: 'image/svg+xml;charset=utf-8' });
          finalUrl = URL.createObjectURL(blob);
          isObjectUrl = true;
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || 1000;
          const height = img.naturalHeight || 700;
          canvas.width = Math.max(width, 1000);
          canvas.height = Math.max(height, 700);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (isObjectUrl) URL.revokeObjectURL(finalUrl);
            resolve(null);
            return;
          }
          // White paper background for genuine Word printing
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngDataUrl = canvas.toDataURL('image/png', 0.95);
          if (isObjectUrl) URL.revokeObjectURL(finalUrl);
          resolve(dataUrlToUint8Array(pngDataUrl));
        } catch (e) {
          if (isObjectUrl) URL.revokeObjectURL(finalUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        if (isObjectUrl) URL.revokeObjectURL(finalUrl);
        try {
          const fallbackBytes = dataUrlToUint8Array(cleanSrc);
          resolve(fallbackBytes.length > 0 ? fallbackBytes : null);
        } catch {
          resolve(null);
        }
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
    const line = lines[i].trim();
    if (!line) {
      flushTable();
      continue;
    }

    // Markdown or HTML Image Check: ![alt](url) or <img src="url" /> or data:image/...
    const mdImgMatch = line.match(/!\[(.*?)\]\((data:image\/[^)]+|https?:\/\/[^)]+|\/?[^)]+)\)/i);
    const htmlImgMatch = line.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?/i) || line.match(/<img[^>]+src=["']([^"']+)["']/i);

    if (mdImgMatch) {
      flushTable();
      sections.push({
        type: 'image',
        imageData: {
          base64Data: mdImgMatch[2].trim(),
          caption: mdImgMatch[1].trim() || undefined,
          width: 520,
          height: 360
        }
      });
      continue;
    }

    if (htmlImgMatch) {
      flushTable();
      sections.push({
        type: 'image',
        imageData: {
          base64Data: htmlImgMatch[1].trim(),
          caption: (htmlImgMatch[2] || '').trim() || undefined,
          width: 520,
          height: 360
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
  const sections = payload.sections && payload.sections.length > 0 
    ? payload.sections 
    : parseContentToSections(payload.rawText || payload.title);

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
    if (payload.subtitle) metaParts.push(cleanMarkdownText(payload.subtitle));
    if (payload.author) metaParts.push(`Author: ${cleanMarkdownText(payload.author)}`);
    if (payload.category) metaParts.push(`Category: ${cleanMarkdownText(payload.category)}`);

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
        const width = sec.imageData?.width || 520;
        const height = sec.imageData?.height || 360;
        const imageBytes = await imageSourceToPngUint8Array(rawSrc);
        if (imageBytes && imageBytes.length > 0) {
          const isJpg = rawSrc.startsWith('data:image/jpeg') || rawSrc.startsWith('data:image/jpg') || /\.jpe?g($|\?)/i.test(rawSrc);
          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 100 },
              children: [
                new ImageRun({
                  type: isJpg ? 'jpg' : 'png',
                  data: imageBytes,
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
    } else {
      // Standard Paragraph
      docxChildren.push(
        new Paragraph({
          spacing: { after: 140 },
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
 * Export to Professional Academic PDF Document (.pdf) with multi-page handling
 */
export function exportToPdfDocument(payload: DocExportPayload): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const drawHeaderFooter = () => {
    // Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('NEXORA ACADEMIC RESEARCH WORKSPACE', margin, 12);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    doc.text(`Page ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Confidential Academic Work', margin, pageHeight - 10);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      cursorY = margin + 8;
      drawHeaderFooter();
    }
  };

  drawHeaderFooter();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  const cleanTitle = cleanMarkdownText(payload.title);
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, cursorY + 6);
  cursorY += titleLines.length * 8 + 4;

  // Subtitle / Author
  if (payload.subtitle || payload.author || payload.category) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    const subParts = [
      payload.subtitle ? cleanMarkdownText(payload.subtitle) : '',
      payload.author ? `By ${cleanMarkdownText(payload.author)}` : '',
      payload.category ? `Field: ${cleanMarkdownText(payload.category)}` : ''
    ].filter(Boolean);
    doc.text(subParts.join('  |  '), margin, cursorY);
    cursorY += 7;
  }

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  const sections = payload.sections && payload.sections.length > 0 
    ? payload.sections 
    : parseContentToSections(payload.rawText || payload.title);

  for (const sec of sections) {
    if (sec.type === 'heading1') {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const text = cleanMarkdownText(sec.text || '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 6 + 3;
    } else if (sec.type === 'heading2') {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(67, 56, 202);
      const text = cleanMarkdownText(sec.text || '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 5.5 + 3;
    } else if (sec.type === 'heading3') {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const text = cleanMarkdownText(sec.text || '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 5 + 2;
    } else if (sec.type === 'bullet') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const cleanBullet = cleanMarkdownText(sec.text || '');
      const bulletLines = doc.splitTextToSize(`•  ${cleanBullet}`, contentWidth - 4);
      checkPageBreak(bulletLines.length * 5);
      doc.text(bulletLines, margin + 3, cursorY);
      cursorY += bulletLines.length * 5 + 2;
    } else if (sec.type === 'quote') {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const cleanQuote = cleanMarkdownText(sec.text || '');
      const quoteLines = doc.splitTextToSize(cleanQuote, contentWidth - 12);
      checkPageBreak(quoteLines.length * 5 + 4);
      
      // Draw left accent bar
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(1.2);
      doc.line(margin + 2, cursorY - 2, margin + 2, cursorY + quoteLines.length * 5 - 2);

      doc.text(quoteLines, margin + 7, cursorY);
      cursorY += quoteLines.length * 5 + 3;
    } else if (sec.type === 'image' && sec.imageData) {
      try {
        const imgH = 70; // mm
        checkPageBreak(imgH + 12);
        doc.addImage(sec.imageData.base64Data, 'PNG', margin + 8, cursorY, contentWidth - 16, imgH);
        cursorY += imgH + 3;
        if (sec.imageData.caption) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(sec.imageData.caption, pageWidth / 2, cursorY, { align: 'center' });
          cursorY += 5;
        }
        cursorY += 4;
      } catch (err) {
        console.warn('Failed to render image in PDF:', err);
      }
    } else if (sec.type === 'table' && sec.tableData) {
      const { headers, rows } = sec.tableData;
      const numCols = Math.max(headers.length, rows[0]?.length || 1);
      const colW = contentWidth / numCols;
      const cellPad = 2.5;
      const innerW = colW - cellPad * 2;

      // Table Header Row
      let headerMaxLines = 1;
      const splitHeaders = headers.map(h => {
        const lines = doc.splitTextToSize(cleanMarkdownText(h), innerW);
        if (lines.length > headerMaxLines) headerMaxLines = lines.length;
        return lines;
      });

      const headerRowH = Math.max(8, headerMaxLines * 4.5 + 4);
      checkPageBreak(headerRowH + 10);

      // Draw Header Background
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, cursorY - 2, contentWidth, headerRowH, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin, cursorY - 2, contentWidth, headerRowH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      splitHeaders.forEach((hLines, colIdx) => {
        const cellX = margin + colIdx * colW + cellPad;
        doc.text(hLines, cellX, cursorY + 2.5);
      });
      cursorY += headerRowH;

      // Table Body Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      rows.forEach((rowCells, rIdx) => {
        let rowMaxLines = 1;
        const splitCells = rowCells.map(c => {
          const lines = doc.splitTextToSize(cleanMarkdownText(c), innerW);
          if (lines.length > rowMaxLines) rowMaxLines = lines.length;
          return lines;
        });

        const rowH = Math.max(7, rowMaxLines * 4 + 3);
        checkPageBreak(rowH);

        // Alternating row background
        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, cursorY - 2, contentWidth, rowH, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(margin, cursorY - 2, contentWidth, rowH, 'S');

        splitCells.forEach((cLines, colIdx) => {
          const cellX = margin + colIdx * colW + cellPad;
          // If first column, bold it
          if (colIdx === 0) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
          }
          doc.text(cLines, cellX, cursorY + 2);
        });

        cursorY += rowH;
      });

      cursorY += 6;
    } else {
      // Regular paragraph
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const cleanPara = cleanMarkdownText(sec.text || '');
      const pLines = doc.splitTextToSize(cleanPara, contentWidth);
      checkPageBreak(pLines.length * 4.8 + 2);
      doc.text(pLines, margin, cursorY);
      cursorY += pLines.length * 4.8 + 3;
    }
  }

  const safeName = (payload.filename || payload.title)
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
    md += payload.rawText;
  } else if (payload.sections) {
    payload.sections.forEach(s => {
      if (s.type === 'heading1') md += `## ${cleanMarkdownText(s.text || '')}\n\n`;
      else if (s.type === 'heading2') md += `### ${cleanMarkdownText(s.text || '')}\n\n`;
      else if (s.type === 'heading3') md += `#### ${cleanMarkdownText(s.text || '')}\n\n`;
      else if (s.type === 'bullet') md += `- ${cleanMarkdownText(s.text || '')}\n`;
      else if (s.type === 'quote') md += `> ${cleanMarkdownText(s.text || '')}\n\n`;
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
    (payload.rawText ? cleanMarkdownText(payload.rawText) : (payload.sections ? payload.sections.map(s => cleanMarkdownText(s.text || '')).join('\n\n') : ''));

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const safeName = (payload.filename || payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName || 'document'}.txt`;
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
