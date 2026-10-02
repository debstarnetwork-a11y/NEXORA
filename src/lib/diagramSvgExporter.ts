import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiagramConcept, LabelPin } from '../types';
import { ScientificStructureRenderer } from '../components/ScientificStructureRenderer';

/**
 * Computes callout positions for standalone vector SVG generation
 */
function computeCalloutLayout(pins: LabelPin[]) {
  const leftPins = [...pins.filter(p => p.x <= 50)].sort((a, b) => a.y - b.y);
  const rightPins = [...pins.filter(p => p.x > 50)].sort((a, b) => a.y - b.y);

  const leftCount = leftPins.length;
  const leftResults = leftPins.map((pin, idx) => {
    const targetX = 260 + (pin.x / 100) * 480;
    const targetY = 130 + (pin.y / 100) * 440;
    const labelW = 255;
    const labelH = 62;
    const labelX = 20;
    const labelY = leftCount === 1 
      ? Math.max(50, Math.min(600, targetY - labelH / 2))
      : 55 + (idx / (leftCount - 1 || 1)) * 550;

    const anchorX = labelX + labelW;
    const anchorY = labelY + labelH / 2;
    const corridorX = anchorX + 16;
    const midX = Math.min(corridorX + 14, targetX - 16);
    const pathData = `M ${anchorX} ${anchorY} L ${corridorX} ${anchorY} C ${midX} ${anchorY}, ${midX} ${targetY}, ${targetX - 2} ${targetY}`;

    return {
      pin,
      isLeft: true,
      targetX,
      targetY,
      labelX,
      labelY,
      labelW,
      labelH,
      anchorX,
      anchorY,
      pathData
    };
  });

  const rightCount = rightPins.length;
  const rightResults = rightPins.map((pin, idx) => {
    const targetX = 260 + (pin.x / 100) * 480;
    const targetY = 130 + (pin.y / 100) * 440;
    const labelW = 255;
    const labelH = 62;
    const labelX = 1000 - 20 - labelW;
    const labelY = rightCount === 1 
      ? Math.max(50, Math.min(600, targetY - labelH / 2))
      : 55 + (idx / (rightCount - 1 || 1)) * 550;

    const anchorX = labelX;
    const anchorY = labelY + labelH / 2;
    const corridorX = anchorX - 16;
    const midX = Math.max(corridorX - 14, targetX + 16);
    const pathData = `M ${anchorX} ${anchorY} L ${corridorX} ${anchorY} C ${midX} ${anchorY}, ${midX} ${targetY}, ${targetX + 2} ${targetY}`;

    return {
      pin,
      isLeft: false,
      targetX,
      targetY,
      labelX,
      labelY,
      labelW,
      labelH,
      anchorX,
      anchorY,
      pathData
    };
  });

  return [...leftResults, ...rightResults];
}

/**
 * Escapes XML strings
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an authoritative, standalone SVG string for any scientific concept.
 */
export function generatePresetSVGString(concept: DiagramConcept, isPaperMode: boolean = false): string {
  const innerMarkup = renderToStaticMarkup(
    React.createElement(ScientificStructureRenderer, {
      concept,
      isPaperMode,
      activePinId: null
    })
  );

  const callouts = computeCalloutLayout(concept.pins || []);

  const bgColor = isPaperMode ? '#FFFFFF' : '#0B1120';
  const borderColor = isPaperMode ? '#000000' : '#1E293B';
  const headerSubColor = isPaperMode ? '#000000' : '#34D399';
  const headerTitleColor = isPaperMode ? '#000000' : '#FFFFFF';
  const headerDescColor = isPaperMode ? '#333333' : '#94A3B8';

  const cardBg = isPaperMode ? '#FFFFFF' : '#111827';
  const cardBorder = isPaperMode ? '#000000' : '#374151';
  const cardTitle = isPaperMode ? '#000000' : '#F9FAFB';
  const cardSubtitle = isPaperMode ? '#333333' : '#9CA3AF';
  const leaderLineColor = isPaperMode ? '#000000' : '#10B981';

  let calloutSvg = '';
  callouts.forEach(c => {
    // Leader line
    calloutSvg += `
      <g>
        <path d="${c.pathData}" fill="none" stroke="${leaderLineColor}" stroke-width="${isPaperMode ? 2.75 : 3.25}" stroke-linecap="round" />
        <circle cx="${c.targetX}" cy="${c.targetY}" r="6.5" fill="${isPaperMode ? '#000000' : '#10B981'}" stroke="#FFFFFF" stroke-width="2.5" />
      </g>
    `;

    // Callout card with extra large, crisp typography for mobile / device exports
    calloutSvg += `
      <g transform="translate(${c.labelX}, ${c.labelY})">
        <rect x="0" y="0" width="${c.labelW}" height="${c.labelH}" rx="12" fill="${cardBg}" stroke="${cardBorder}" stroke-width="${isPaperMode ? 2 : 1.5}" />
        <circle cx="26" cy="${c.labelH / 2}" r="17" fill="${isPaperMode ? '#000000' : (c.pin.color || '#3B82F6')}" />
        <text x="26" y="${c.labelH / 2 + 6}" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold">${c.pin.number}</text>
        <text x="52" y="24" fill="${cardSubtitle}" font-family="system-ui, -apple-system, monospace" font-size="12" font-weight="bold" letter-spacing="0.5">${escapeXml((c.pin.category || 'Structure').toUpperCase().slice(0, 22))}</text>
        <text x="52" y="46" fill="${cardTitle}" font-family="system-ui, -apple-system, sans-serif" font-size="${c.pin.name.length > 20 ? 14.5 : 16.5}" font-weight="bold">${escapeXml(c.pin.name)}</text>
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <style>
      text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
  </defs>
  <!-- Background Plate -->
  <rect x="0" y="0" width="1000" height="700" rx="12" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5" />
  
  <!-- Header Bar -->
  <g transform="translate(40, 36)">
    <text x="0" y="0" fill="${headerSubColor}" font-size="13" font-weight="bold" letter-spacing="1.5">NEXORA SCIENTIFIC STUDIO • ANATOMICAL ULTRASTRUCTURE</text>
    <text x="0" y="26" fill="${headerTitleColor}" font-size="25" font-weight="bold">${escapeXml(concept.title)}</text>
    <text x="0" y="46" fill="${headerDescColor}" font-size="14">${escapeXml(concept.category)} • ${concept.pins?.length || 0} Verified Anatomical Structures</text>
  </g>

  <!-- Central Scientific Structure Group -->
  <g id="central-structure" transform="translate(500, 350)">
    ${innerMarkup}
  </g>

  <!-- Callout Cards & Leader Lines -->
  ${calloutSvg}

  <!-- Footer Academic Note -->
  <g transform="translate(40, 678)">
    <text x="0" y="0" fill="${headerDescColor}" font-size="12" font-weight="500">Prepared for Educational & Scientific Ultrastructure Analysis • Nexora Biology Engine</text>
  </g>
</svg>`;
}

/**
 * Returns a base64 or encoded SVG Data URL suitable for markdown ![alt](url) embedding.
 */
export function generatePresetSVGDataUrl(concept: DiagramConcept, isPaperMode: boolean = false): string {
  const svgString = generatePresetSVGString(concept, isPaperMode);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
