import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Copy, 
  RotateCcw, 
  Trash2, 
  PlusCircle, 
  User, 
  Bot, 
  Loader2, 
  Mic, 
  MicOff, 
  FileDown, 
  Sparkles, 
  ShieldCheck, 
  Bookmark, 
  Check, 
  Eye, 
  BookOpen, 
  FileImage, 
  ExternalLink, 
  Layers, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Sliders,
  Maximize2,
  Info,
  FileText,
  FileCode,
  Download,
  FolderKanban
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, DiagramConcept, LabelPin, InfographicData, SlideDeck } from '../types';
import { useAppStore } from '../store';
import { useSpeech } from '../hooks/useSpeech';
import { puterChat } from '../lib/puter';
import { ScientificStructureRenderer } from '../components/ScientificStructureRenderer';
import { 
  exportToWordDocument, 
  exportToPdfDocument, 
  exportToMarkdown, 
  exportToText, 
  parseContentToSections 
} from '../lib/documentExport';
import { parseUploadedFile, UploadedDocumentPayload } from '../lib/documentImporter';

// Interactive In-Chat Diagram Visualizer
function DiagramCardInChat({ diagram, onOpenStudio }: { diagram: DiagramConcept; onOpenStudio: () => void }) {
  const [selectedPin, setSelectedPin] = useState<LabelPin>(diagram.pins[0] || null);

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient background
    const grad = ctx.createRadialGradient(1200, 900, 100, 1200, 900, 1400);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2400, 1800);

    // Title & Header
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('NEXORA KIT VISUAL DIAGRAM', 100, 110);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(diagram.title, 100, 190);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '32px sans-serif';
    ctx.fillText(diagram.subtitle || diagram.category, 100, 240);

    // Central Diagram Graphic
    const centerX = 1200;
    const centerY = 900;
    const scale = 3.2;

    if (diagram.diagramType === 'animal-cell') {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 14;
      ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 220 * scale, 150 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 10;
      ctx.fillStyle = 'rgba(49, 46, 129, 0.7)';
      ctx.beginPath();
      ctx.ellipse(centerX - 30, centerY - 50, 75 * scale, 60 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(centerX + 10, centerY - 80, 24 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (diagram.diagramType === 'human-heart') {
      ctx.fillStyle = 'rgba(127, 29, 29, 0.65)';
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 50, 160 * scale, 130 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (diagram.diagramType === 'methane-molecule') {
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY); ctx.lineTo(centerX - 180, centerY - 180);
      ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + 180, centerY - 180);
      ctx.moveTo(centerX, centerY); ctx.lineTo(centerX - 180, centerY + 180);
      ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + 180, centerY + 180);
      ctx.stroke();

      [
        {x: centerX - 180, y: centerY - 180},
        {x: centerX + 180, y: centerY - 180},
        {x: centerX - 180, y: centerY + 180},
        {x: centerX + 180, y: centerY + 180}
      ].forEach(h => {
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#DBEAFE';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(h.x, h.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', h.x, h.y);
      });

      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = '#FEE2E2';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('C', centerX, centerY);
    } else if (diagram.diagramType === 'water-molecule') {
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60); ctx.lineTo(centerX - 180, centerY + 140);
      ctx.moveTo(centerX, centerY - 60); ctx.lineTo(centerX + 180, centerY + 140);
      ctx.stroke();

      [
        {x: centerX - 180, y: centerY + 140},
        {x: centerX + 180, y: centerY + 140}
      ].forEach(h => {
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#DBEAFE';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(h.x, h.y, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 54px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', h.x, h.y);
      });

      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = '#FEE2E2';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 60, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 74px sans-serif';
      ctx.fillText('O', centerX, centerY - 60);
    } else {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 8;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.beginPath();
      ctx.roundRect(centerX - 500, centerY - 380, 1000, 760, 40);
      ctx.fill();
      ctx.stroke();
    }

    if (diagram.chemicalData) {
      // Create a data url and open in new tab (bypassing label generation)
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${diagram.title.replace(/\s+/g, '_')}_Diagram.png`;
      link.href = dataUrl;
      link.click();
      return;
    }

    // Render Outside Labels & Arrows
    const leftPins = [...diagram.pins.filter(p => p.x <= 50)].sort((a, b) => a.y - b.y);
    const rightPins = [...diagram.pins.filter(p => p.x > 50)].sort((a, b) => a.y - b.y);

    const drawArrowhead = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
      const headlen = 22;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    };

    leftPins.forEach((pin, idx) => {
      const targetX = 640 + (pin.x / 100) * 1120;
      const targetY = 440 + (pin.y / 100) * 920;
      
      const labelX = 80;
      const labelW = 480;
      const labelH = 80;
      const labelY = leftPins.length === 1 ? targetY - labelH / 2 : 340 + (idx / (leftPins.length - 1 || 1)) * 1080;

      const anchorX = labelX + labelW;
      const anchorY = labelY + labelH / 2;
      const elbowX = Math.min(targetX - 50, anchorX + 80);

      ctx.strokeStyle = pin.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(elbowX, anchorY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      drawArrowhead(elbowX, anchorY, targetX, targetY, pin.color);

      ctx.fillStyle = pin.color;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = pin.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pin.color;
      ctx.beginPath();
      ctx.arc(labelX + 46, labelY + 40, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.number.toString(), labelX + 46, labelY + 40);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(pin.category.toUpperCase(), labelX + 85, labelY + 28);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(pin.name.length > 28 ? pin.name.slice(0, 27) + '…' : pin.name, labelX + 85, labelY + 56);
    });

    rightPins.forEach((pin, idx) => {
      const targetX = 640 + (pin.x / 100) * 1120;
      const targetY = 440 + (pin.y / 100) * 920;
      
      const labelX = 1840;
      const labelW = 480;
      const labelH = 80;
      const labelY = rightPins.length === 1 ? targetY - labelH / 2 : 340 + (idx / (rightPins.length - 1 || 1)) * 1080;

      const anchorX = labelX;
      const anchorY = labelY + labelH / 2;
      const elbowX = Math.max(targetX + 50, anchorX - 80);

      ctx.strokeStyle = pin.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(elbowX, anchorY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      drawArrowhead(elbowX, anchorY, targetX, targetY, pin.color);

      ctx.fillStyle = pin.color;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = pin.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pin.color;
      ctx.beginPath();
      ctx.arc(labelX + 46, labelY + 40, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.number.toString(), labelX + 46, labelY + 40);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(pin.category.toUpperCase(), labelX + 85, labelY + 28);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(pin.name.length > 28 ? pin.name.slice(0, 27) + '…' : pin.name, labelX + 85, labelY + 56);
    });

    const link = document.createElement('a');
    link.download = `diagram-${diagram.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Compute Layout for In-Chat SVG
  const chatLeftPins = [...diagram.pins.filter(p => p.x <= 50)].sort((a, b) => a.y - b.y);
  const chatRightPins = [...diagram.pins.filter(p => p.x > 50)].sort((a, b) => a.y - b.y);

  const callouts = [
    ...chatLeftPins.map((pin, idx) => {
      const targetX = 260 + (pin.x / 100) * 480;
      const targetY = 130 + (pin.y / 100) * 440;
      const labelW = 210;
      const labelH = 46;
      const labelX = 20;
      const labelY = chatLeftPins.length === 1 ? Math.max(50, Math.min(600, targetY - labelH / 2)) : 60 + (idx / (chatLeftPins.length - 1 || 1)) * 540;
      const anchorX = labelX + labelW;
      const anchorY = labelY + labelH / 2;
      const elbowX = Math.min(targetX - 25, anchorX + 35);
      const pathData = `M ${anchorX} ${anchorY} L ${elbowX} ${anchorY} L ${targetX} ${targetY}`;
      return { pin, isLeft: true, targetX, targetY, labelX, labelY, labelW, labelH, pathData };
    }),
    ...chatRightPins.map((pin, idx) => {
      const targetX = 260 + (pin.x / 100) * 480;
      const targetY = 130 + (pin.y / 100) * 440;
      const labelW = 210;
      const labelH = 46;
      const labelX = 770;
      const labelY = chatRightPins.length === 1 ? Math.max(50, Math.min(600, targetY - labelH / 2)) : 60 + (idx / (chatRightPins.length - 1 || 1)) * 540;
      const anchorX = labelX;
      const anchorY = labelY + labelH / 2;
      const elbowX = Math.max(targetX + 25, anchorX - 35);
      const pathData = `M ${anchorX} ${anchorY} L ${elbowX} ${anchorY} L ${targetX} ${targetY}`;
      return { pin, isLeft: false, targetX, targetY, labelX, labelY, labelW, labelH, pathData };
    })
  ];

  return (
    <div className="w-full my-4 rounded-2xl bg-slate-950 border border-slate-800 text-white overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
              {diagram.category} • Visual Scientific Model
            </span>
            <h4 className="text-sm font-bold text-white">
              {diagram.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Download PNG"
          >
            <FileImage className="w-3.5 h-3.5 text-amber-300" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            title="Open interactive Draw & Label Studio"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Draw & Label Studio</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas with Non-Overlapping Outside Labels */}
      <div className="relative w-full min-h-[380px] sm:min-h-[440px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
        {/* Bioluminescent grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_75%)] pointer-events-none" />
        
        <svg 
          className="w-full h-full max-w-[900px] max-h-[580px] overflow-visible" 
          viewBox="0 0 1000 700" 
          fill="none"
        >
          {/* Arrowhead Marker Definitions */}
          <defs>
            {callouts.map(({ pin }) => (
              <marker
                key={`chat-arrow-marker-${pin.id}`}
                id={`chat-arrow-${pin.id}`}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={pin.color} />
              </marker>
            ))}
          </defs>

          {/* Paper sheet backing if in paper mode */}
          {diagram.renderMode === "paper" && (
            <g id="chat-paper-sheet">
              <rect x="25" y="20" width="950" height="660" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="85" y1="20" x2="85" y2="680" stroke="#FCA5A5" strokeWidth="1.5" strokeOpacity="0.6" />
              {[90, 150, 210, 270, 330, 390, 450, 510, 570, 630].map(y => (
                <line key={`chat-ruling-${y}`} x1="85" y1={y} x2="975" y2={y} stroke="#F1F5F9" strokeWidth="1" />
              ))}
            </g>
          )}

          {/* Central Scientific Structure Renderer - Textbook & Real-Life Fidelity */}
          <g transform="translate(500, 350)">
            <ScientificStructureRenderer 
              concept={diagram} 
              isPaperMode={diagram.renderMode === "paper"} 
              activePinId={selectedPin?.id} 
            />
          </g>

          {/* Leader Lines & Arrows */}
          {callouts.length > 0 && callouts.map((c) => {
            const isSelected = selectedPin?.id === c.pin.id;
            return (
              <g key={`chat-leader-${c.pin.id}`}>
                {isSelected && (
                  <path 
                    d={c.pathData} 
                    stroke={c.pin.color} 
                    strokeWidth="6" 
                    strokeOpacity="0.35" 
                    fill="none" 
                  />
                )}
                <path 
                  d={c.pathData} 
                  stroke={c.pin.color} 
                  strokeWidth={isSelected ? "3" : "2"} 
                  fill="none" 
                  markerEnd={`url(#chat-arrow-${c.pin.id})`}
                />
              </g>
            );
          })}

          {/* Target Pinpoint Markers on Organelles & Structures */}
          {callouts.length > 0 && callouts.map((c) => {
            const isSelected = selectedPin?.id === c.pin.id;
            return (
              <g 
                key={`chat-target-${c.pin.id}`}
                transform={`translate(${c.targetX}, ${c.targetY})`}
                className="cursor-pointer group"
                onClick={() => setSelectedPin(c.pin)}
              >
                {isSelected && (
                  <circle 
                    r="12" 
                    fill={c.pin.color} 
                    fillOpacity="0.3" 
                    className="animate-ping" 
                  />
                )}
                <circle 
                  r={isSelected ? "7" : "5.5"} 
                  fill={c.pin.color} 
                  stroke="#FFFFFF" 
                  strokeWidth="2" 
                />
                <circle 
                  r="2.5" 
                  fill="#FFFFFF" 
                />
              </g>
            );
          })}

          {/* Outside Label Cards */}
          {callouts.length > 0 && callouts.map((c) => {
            const isSelected = selectedPin?.id === c.pin.id;
            const isPaper = diagram.renderMode === 'paper';
            return (
              <g 
                key={`chat-card-${c.pin.id}`}
                transform={`translate(${c.labelX}, ${c.labelY})`}
                className="cursor-pointer select-none group"
                onClick={() => setSelectedPin(c.pin)}
              >
                <rect 
                  width={c.labelW} 
                  height={c.labelH} 
                  rx="12" 
                  fill={isPaper ? "#FFFFFF" : "#0F172A"} 
                  fillOpacity={isPaper ? 0.98 : 0.95} 
                  stroke={isSelected ? (isPaper ? '#0284C7' : '#FFFFFF') : (isPaper ? '#94A3B8' : c.pin.color)} 
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                />
                <circle 
                  cx="24" 
                  cy={c.labelH / 2} 
                  r="14" 
                  fill={c.pin.color} 
                />
                <text 
                  x="24" 
                  y={c.labelH / 2 + 4.5} 
                  fill="#FFFFFF" 
                  fontSize="12" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {c.pin.number}
                </text>
                <text 
                  x="46" 
                  y="18" 
                  fill={isPaper ? "#0369A1" : "#10B981"} 
                  fontSize="9" 
                  fontWeight="bold" 
                  fontFamily="monospace"
                >
                  {c.pin.category.toUpperCase().slice(0, 22)}
                </text>
                <text 
                  x="46" 
                  y="33" 
                  fill={isPaper ? "#0F172A" : "#F8FAFC"} 
                  fontSize="11.5" 
                  fontWeight="bold"
                >
                  {c.pin.name.length > 20 ? c.pin.name.slice(0, 19) + '…' : c.pin.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Pin Details Inspector */}
      {selectedPin && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md"
              style={{ backgroundColor: selectedPin.color }}
            >
              {selectedPin.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedPin.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                  {selectedPin.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {selectedPin.functionSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {diagram.pins.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPin(p)}
                className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                  selectedPin.id === p.id 
                    ? 'ring-2 ring-white text-white font-black' 
                    : 'opacity-60 hover:opacity-100 text-white'
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {p.number}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// In-Chat Infographic Visualizer
function InfographicCardInChat({ infographic, onOpenStudio }: { infographic: InfographicData; onOpenStudio: () => void }) {
  return (
    <div className="w-full my-4 rounded-2xl bg-slate-900 text-white border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-600/30 text-pink-400 rounded-lg">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400 block">
              {infographic.style} • {infographic.palette}
            </span>
            <h4 className="text-sm font-bold text-white">{infographic.title}</h4>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Infographic Studio</span>
        </button>
      </div>

      <p className="text-xs text-slate-300">{infographic.summary}</p>

      {/* Grid of Infographic Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {infographic.sections.map((sec, idx) => (
          <div 
            key={sec.id || idx}
            className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: sec.color || '#EC4899' }}
                >
                  {sec.badge || `Section ${idx + 1}`}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white mb-1">{sec.title}</h5>
              <p className="text-[11px] text-slate-300 line-clamp-3">{sec.description}</p>
            </div>

            {sec.metrics && sec.metrics.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                <span className="text-[10px] text-pink-300 font-mono block">
                  {sec.metrics[0].label}: <strong>{sec.metrics[0].value}</strong>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// In-Chat Slide Deck Visualizer
function SlideDeckCardInChat({ slideDeck, onOpenStudio }: { slideDeck: SlideDeck; onOpenStudio: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const slide = slideDeck.slides[activeIdx] || slideDeck.slides[0];

  return (
    <div className="w-full my-4 rounded-2xl bg-slate-900 text-white border border-slate-800 p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
              Presentation Deck • {slideDeck.slides.length} Slides
            </span>
            <h4 className="text-sm font-bold text-white">{slideDeck.title}</h4>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Presentation Studio</span>
        </button>
      </div>

      {/* Slide Preview Card */}
      {slide && (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              Slide {activeIdx + 1} of {slideDeck.slides.length} • {slide.layout}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(p => Math.max(0, p - 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={activeIdx === slideDeck.slides.length - 1}
                onClick={() => setActiveIdx(p => Math.min(slideDeck.slides.length - 1, p + 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h5 className="text-base font-bold text-amber-300">{slide.title}</h5>
          {slide.subtitle && <p className="text-xs text-slate-400 italic">{slide.subtitle}</p>}

          <ul className="space-y-1 text-xs text-slate-200 mt-2 list-disc pl-4">
            {slide.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AIResearch() {
  const { saveChat, language, activeChatToLoad, clearActiveChatToLoad, setCurrentView, loadDiagram, createWorkspaceProject } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'model',
    content: 'Hello! I am NEXORA, your AI research assistant. How can I help you today?',
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatEngine, setChatEngine] = useState<string>('gemini-flash'); // Default to gemini-flash since it handles files
  const [chatTone, setChatTone] = useState<string>('Academic'); // Default to Academic
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{name: string, data: string, type: 'image' | 'text'}[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<UploadedDocumentPayload[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const universalFileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, startListening, stopListening, isSupported } = useSpeech();

  useEffect(() => {
    if (activeChatToLoad && activeChatToLoad.length > 0) {
      setMessages(activeChatToLoad);
      clearActiveChatToLoad();
      setSaveToast({ message: 'Content successfully imported into AI Assistant session!', type: 'success' });
      setTimeout(() => setSaveToast(null), 4000);
    }
  }, [activeChatToLoad, clearActiveChatToLoad]);

  const handleUniversalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    for (const file of Array.from(fileList)) {
      try {
        const payload = await parseUploadedFile(file);
        setAttachedDocs(prev => [...prev, payload]);
        setSaveToast({ 
          message: `Uploaded: ${payload.name} (${payload.type.toUpperCase()} • ${payload.sizeFormatted}${payload.pageCount ? ` • ${payload.pageCount} pages` : ''})`, 
          type: 'info' 
        });
        setTimeout(() => setSaveToast(null), 3500);
      } catch (err: any) {
        setSaveToast({ message: `Could not parse file: ${err.message || 'Unknown error'}`, type: 'info' });
        setTimeout(() => setSaveToast(null), 3500);
      }
    }
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    setAttachedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportContent = async (
    content: string, 
    title: string, 
    format: 'word' | 'pdf' | 'markdown' | 'text' | 'workspace'
  ) => {
    const cleanTitle = title || 'NEXORA Scientific Research';
    const sections = parseContentToSections(content);
    const payload = {
      title: cleanTitle,
      author: 'NEXORA Academic Assistant',
      category: 'Scientific Research',
      rawText: content,
      sections
    };

    try {
      if (format === 'word') {
        setSaveToast({ message: 'Generating Microsoft Word (.docx) document...', type: 'info' });
        await exportToWordDocument(payload);
        setSaveToast({ message: 'Word document (.docx) downloaded successfully!', type: 'success' });
        setTimeout(() => setSaveToast(null), 3000);
      } else if (format === 'pdf') {
        setSaveToast({ message: 'Generating PDF document...', type: 'info' });
        exportToPdfDocument(payload);
        setSaveToast({ message: 'PDF document (.pdf) downloaded successfully!', type: 'success' });
        setTimeout(() => setSaveToast(null), 3000);
      } else if (format === 'markdown') {
        exportToMarkdown(payload);
        setSaveToast({ message: 'Markdown file (.md) downloaded!', type: 'success' });
        setTimeout(() => setSaveToast(null), 3000);
      } else if (format === 'text') {
        exportToText(payload);
        setSaveToast({ message: 'Text file (.txt) downloaded!', type: 'success' });
        setTimeout(() => setSaveToast(null), 3000);
      } else if (format === 'workspace') {
        const newProj = createWorkspaceProject({
          title: cleanTitle,
          role: 'researcher',
          category: 'Scientific Research',
          description: `Imported from AI Research session on ${new Date().toLocaleDateString()}`,
          pages: [
            {
              id: `page-${Date.now()}-1`,
              title: '1. Research Overview & Synthesis',
              content: content,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]
        });
        setCurrentView('workspace');
        setSaveToast({ message: `Imported to Workspace: "${newProj.title}"`, type: 'success' });
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (err: any) {
      setSaveToast({ message: `Export error: ${err.message}`, type: 'info' });
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'text') => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file: File) => {
      const reader = new FileReader();
      if (type === 'image' || file.type.startsWith('image/')) {
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachedFiles(prev => [...prev, { name: file.name, data: event.target!.result as string, type: 'image' }]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachedFiles(prev => [...prev, { name: file.name, data: event.target!.result as string, type: 'text' }]);
          }
        };
        reader.readAsText(file);
      }
    });
    e.target.value = ''; // reset
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setInput(prev => prev + (prev ? ' ' : '') + text);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0 && attachedDocs.length === 0) || isLoading) return;

    let contentToDisplay = input;
    if (attachedFiles.length > 0) {
      contentToDisplay += `\n\n[Attached ${attachedFiles.length} file(s): ${attachedFiles.map(f => f.name).join(', ')}]`;
    }
    if (attachedDocs.length > 0) {
      contentToDisplay += `\n\n[Attached ${attachedDocs.length} document(s): ${attachedDocs.map(d => `${d.name} (${d.type.toUpperCase()}${d.pageCount ? ` • ${d.pageCount}p` : ''})`).join(', ')}]`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToDisplay.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...attachedFiles];
    const currentDocs = [...attachedDocs];

    setInput('');
    setAttachedFiles([]);
    setAttachedDocs([]);
    setIsLoading(true);
    setFallbackNotice(null);

    try {
      let fullPrompt = `SYSTEM DIRECTIVE: You are an expert AI Assistant instructed to respond in a **${chatTone}** style.

MANDATORY RULES:
1. EXTENDED LENGTH: The text must be extended beyond regular AI limit per prompt unless the user says or prompts otherwise. Provide an extensive, comprehensive, deep-dive, multi-page response (aiming for 1,500 to 2,500+ words). Thoroughly unpack every concept, mechanism, historical context, granular analysis, and nuanced implication without truncating or summarizing.
2. STANDALONE HEADINGS: Headings must stand alone and body text must be under each heading. Format all headings using markdown (e.g. ## Heading Title) strictly on their own separate line. Never place body text on the same line as a heading.
3. PARAGRAPH INDENTATION: Paragraphs must be clearly separated from each other by indentation. Write coherent, full paragraphs where each paragraph starts with indentation.`;

      if (language === 'English (UK)' || language === 'en-GB' || language?.toLowerCase().includes('uk')) {
        fullPrompt += `\n4. UK ENGLISH (BRITISH ENGLISH) MANDATE: The user has selected UK English. You MUST respond strictly in British / UK English. Always use standard British spelling (e.g., 'colour', 'behaviour', 'analyse', 'paralyse', 'programme', 'centre', 'theatre', 'defence', 'licence' [noun], 'ageing', 'judgement', 'skilful', 'prioritise', 'organise', 'catalogue') and British terminology and idioms across the entirety of your response.`;
      } else if (language === 'English (US)' || language === 'en-US' || language?.toLowerCase().includes('us')) {
        fullPrompt += `\n4. US ENGLISH (AMERICAN ENGLISH) MANDATE: The user has selected US English. You MUST respond in American / US English using standard American spelling (e.g., 'color', 'behavior', 'analyze', 'paralyze', 'program', 'center', 'theater', 'defense', 'license', 'aging', 'judgment', 'skillful', 'prioritize', 'organize', 'catalog') throughout.`;
      } else if (language) {
        fullPrompt += `\n4. LANGUAGE MANDATE: You MUST respond in **${language}**.`;
      }

      if (chatTone === 'Academic') {
        fullPrompt += `\n5. ACADEMIC & CITATION INTEGRITY: If you must reference an author or a study, they MUST be a real, verifiable author or publication. You MUST NOT hallucinate citations. All references and citations MUST be properly formatted using the Harvard referencing style (Author, Year) with a full Reference list at the end.`;
      }

      fullPrompt += `\n\nUser Query:\n${currentInput}`;

      if (currentFiles.length > 0) {
        fullPrompt += '\n\nAdditional Context (Files):\n';
        currentFiles.forEach(f => {
          if (f.type === 'text') {
            fullPrompt += `--- FILE: ${f.name} ---\n${f.data}\n\n`;
          } else {
             fullPrompt += `[Image File attached: ${f.name}]\n`;
          }
        });
      }

      if (currentDocs.length > 0) {
        fullPrompt += '\n\nAdditional Context (Extracted Documents):\n';
        currentDocs.forEach(d => {
          fullPrompt += `--- DOCUMENT: ${d.name} (${d.type.toUpperCase()}${d.pageCount ? `, ${d.pageCount} pages` : ''}) ---\n${d.text}\n\n`;
        });
      }

      if (chatEngine.startsWith('puter-')) {
        let puterModel = 'gpt-4o-mini';
        if (chatEngine === 'puter-claude-3-5') puterModel = 'claude-3-5-sonnet';
        if (chatEngine === 'puter-deepseek') puterModel = 'deepseek-chat';
        if (chatEngine === 'puter-gpt-4o') puterModel = 'gpt-4o';

        const reply = await puterChat(fullPrompt, puterModel);
        const modelMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: reply,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        // Try Gemini backend API first
        try {
          const formattedFiles = [
            ...currentFiles.map(f => f.type === 'image' ? f.data : `${f.name}:\n${f.data}`),
            ...currentDocs.map(d => d.type === 'image' && d.rawBase64 ? d.rawBase64 : `${d.name} (${d.type}):\n${d.text}`)
          ];

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: currentInput,
              tone: chatTone,
              language: language || 'English (US)',
              files: formattedFiles
            })
          });

          const data = await response.json();
          if (response.ok && data.text) {
            const modelMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: data.text,
              timestamp: Date.now()
            };
            setMessages(prev => [...prev, modelMessage]);
            return;
          } else {
            throw new Error(data.error || 'Gemini API unavailable');
          }
        } catch (geminiErr: any) {
          console.warn('Gemini chat failed, seamlessly falling back to backup AI engine:', geminiErr);
          setFallbackNotice('Primary AI engine busy. Seamlessly switched to backup engine with identical depth constraints.');
          
          const reply = await puterChat(fullPrompt, 'gpt-4o-mini');
          const modelMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: reply,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, modelMessage]);
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      content: 'Hello! I am NEXORA, your AI research assistant. How can I help you today?',
      timestamp: Date.now()
    }]);
    setSaveToast(null);
  };

  const handleSave = () => {
    const userMsgs = messages.filter(m => m.role === 'user');
    const nonWelcomeMsgs = messages.filter(m => !(m.role === 'model' && m.id === '1'));
    
    if (messages.length === 0 || (userMsgs.length === 0 && nonWelcomeMsgs.length === 0)) {
      setSaveToast({ message: 'Please start a conversation before saving the research chat.', type: 'info' });
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }

    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg 
      ? (firstUserMsg.content.length > 45 ? firstUserMsg.content.substring(0, 42) + '...' : firstUserMsg.content)
      : `Research Session (${new Date().toLocaleDateString()})`;

    saveChat({
      id: Date.now().toString(),
      title,
      messages: [...messages],
      timestamp: Date.now()
    });

    setSaveToast({ message: 'Research chat successfully saved to Projects!', type: 'success' });
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NEXORA - AI Research Chat Log', margin, y);
    y += 15;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'User' : 'NEXORA';
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      if (msg.role === 'user') {
        doc.setTextColor(88, 28, 135); // purple-900 rgb
      } else {
        doc.setTextColor(0, 0, 0); // black
      }
      doc.text(`${role}:`, margin, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85); // slate-700 rgb
      
      const lines = doc.splitTextToSize(msg.content, maxLineWidth);
      
      lines.forEach((line: string) => {
         if (y > doc.internal.pageSize.height - margin) {
           doc.addPage();
           y = margin + 10;
         }
         doc.text(line, margin, y);
         y += 6;
      });
      y += 8; // space between messages
    });

    doc.save(`NEXORA_Chat_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-purple-900 tracking-tight flex items-center gap-2.5">
            AI Research
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conversational research and intelligence assistant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Style/Tone Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-500 font-medium pl-2 hidden sm:inline">Style:</span>
            <select
              value={chatTone}
              onChange={(e) => setChatTone(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-900 cursor-pointer text-xs"
            >
              <option value="Academic">Academic</option>
              <option value="Formal">Formal</option>
              <option value="Standard">Standard</option>
              <option value="Creative">Creative</option>
              <option value="Informal/Friendly">Informal/Friendly</option>
              <option value="Witty">Witty</option>
            </select>
          </div>

          {/* AI Engine Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-500 font-medium pl-2 hidden sm:inline">Engine:</span>
            <select
              value={chatEngine}
              onChange={(e) => setChatEngine(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-900 cursor-pointer text-xs"
            >
              <option value="puter-gpt-4o-mini">GPT-4o-mini</option>
              <option value="puter-claude-3-5">Claude 3.5 Sonnet</option>
              <option value="puter-deepseek">DeepSeek Chat</option>
              <option value="gemini-flash">Gemini 2.5 Flash</option>
            </select>
          </div>

          {/* Dialect Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700" title="Selected in Settings > Language & Region">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{language === 'English (UK)' ? 'UK English' : language === 'English (US)' ? 'US English' : language}</span>
          </div>

          <button onClick={handleExportPDF} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-900 transition-all shadow-sm" title="Export as PDF">
            <FileDown className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 font-semibold text-xs transition-all shadow-sm" title="Save Chat to Projects">
            <Bookmark className="w-4 h-4 text-purple-900" />
            <span>Save Chat</span>
          </button>
          <button onClick={handleClear} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all shadow-sm" title="Clear Chat">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {saveToast && (
        <div className={`mb-4 p-3.5 rounded-xl text-xs flex items-center justify-between shadow-sm transition-all animate-fadeIn ${
          saveToast.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
            : 'bg-blue-50 border border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveToast.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {saveToast.type === 'success' && (
              <button 
                onClick={() => setCurrentView('projects')}
                className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 transition-colors"
              >
                View in Projects
              </button>
            )}
            <button 
              onClick={() => setSaveToast(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {fallbackNotice && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{fallbackNotice}</span>
          </div>
          <button 
            onClick={() => setFallbackNotice(null)}
            className="text-amber-600 hover:text-amber-800 text-xs font-bold ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-purple-900 text-amber-400' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Rich Media Visual Attachment Preview (Diagram, Infographic, Slides) */}
                {msg.attachment && msg.role === 'model' && msg.attachment.type === 'diagram' && msg.attachment.diagramData && (
                  <DiagramCardInChat 
                    diagram={msg.attachment.diagramData} 
                    onOpenStudio={() => loadDiagram(msg.attachment.diagramData!)} 
                  />
                )}

                {msg.attachment && msg.role === 'model' && msg.attachment.type === 'infographic' && msg.attachment.infographicData && (
                  <InfographicCardInChat 
                    infographic={msg.attachment.infographicData} 
                    onOpenStudio={() => setCurrentView('infographic')} 
                  />
                )}

                {msg.attachment && msg.role === 'model' && msg.attachment.type === 'slide-deck' && msg.attachment.slideDeckData && (
                  <SlideDeckCardInChat 
                    slideDeck={msg.attachment.slideDeckData} 
                    onOpenStudio={() => setCurrentView('slides')} 
                  />
                )}

                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
                  msg.role === 'user'
                    ? 'bg-purple-900 text-white rounded-tr-none border-purple-900 shadow-md'
                    : 'bg-white text-slate-800 rounded-tl-none border-slate-200'
                }`}>
                  <div className={`markdown-body custom-markdown ${msg.role === 'user' ? 'text-white' : ''}`}>
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 block text-slate-900 border-b pb-1.5 border-slate-200" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2.5 block text-slate-900" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 block text-purple-950" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-3 mb-1.5 block text-slate-900" {...props} />,
                        p: ({ node, ...props }) => <p className="leading-relaxed my-2 block" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-slate-950" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-slate-800" {...props} />,
                        ul: ({ node, ...props }) => <ul className="my-3 pl-6 list-disc space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="my-3 pl-6 list-decimal space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1 leading-relaxed" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-800 bg-purple-50 px-4 py-2 my-3 rounded-r-lg italic text-slate-700" {...props} />,
                        table: ({ node, ...props }) => (
                          <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-300 shadow-xs">
                            <table className="w-full text-left border-collapse text-sm bg-white" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => <thead className="bg-purple-900 text-white font-bold" {...props} />,
                        th: ({ node, ...props }) => <th className="py-2.5 px-3.5 text-xs font-bold uppercase tracking-wider border border-purple-800/40 text-white whitespace-nowrap" {...props} />,
                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-200" {...props} />,
                        tr: ({ node, ...props }) => <tr className="hover:bg-purple-50/50 even:bg-slate-50/70" {...props} />,
                        td: ({ node, ...props }) => <td className="py-2.5 px-3.5 text-sm text-slate-800 border border-slate-200 align-top" {...props} />,
                        img: ({ node, src, alt, ...props }: any) => {
                          if (!src || typeof src !== 'string' || src.trim() === '') return null;
                          return <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-xl my-2 border border-slate-200" {...props} />;
                        }
                      }}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                </div>
                
                {msg.role === 'model' && (
                  <div className="flex flex-wrap items-center gap-1.5 px-2 pt-1">
                    <button 
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Copy response"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Direct Word (.docx) Export */}
                    <button
                      onClick={() => handleExportContent(msg.content, 'AI Research Synthesis', 'word')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="Export this comprehensive response directly to a formatted Microsoft Word document (.docx)"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Word (.docx)</span>
                    </button>

                    {/* Direct PDF Export */}
                    <button
                      onClick={() => handleExportContent(msg.content, 'AI Research Synthesis', 'pdf')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Export this response as a publication-ready PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>PDF</span>
                    </button>

                    {/* Send to Academic Workspace */}
                    <button
                      onClick={() => handleExportContent(msg.content, 'AI Research Synthesis', 'workspace')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                      title="Import this research directly into your Academic & Research Workspace for editing, notes, and manuscript development"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                      <span>Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-50 rounded-tl-none border border-slate-200 flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">NEXORA is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex flex-col gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-900/10 transition-all">
            
            {/* Attached Universal Documents & Media Files */}
            {(attachedFiles.length > 0 || attachedDocs.length > 0) && (
              <div className="flex flex-wrap gap-2 px-3 pt-2">
                {attachedDocs.map((doc, i) => (
                  <div key={`doc-${i}`} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-xl text-xs font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <span className="truncate max-w-[140px] font-semibold">{doc.name}</span>
                    <span className="text-indigo-600/70 text-[11px]">{doc.sizeFormatted}</span>
                    {doc.pageCount && <span className="text-indigo-600/80 text-[11px]">({doc.pageCount}p)</span>}
                    <button onClick={() => removeDoc(i)} className="p-0.5 hover:bg-indigo-100 rounded-md text-indigo-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {attachedFiles.map((f, i) => (
                  <div key={`file-${i}`} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    {f.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> : <Paperclip className="w-3.5 h-3.5 text-blue-600" />}
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="p-0.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              {/* Hidden Inputs */}
              <input 
                type="file" 
                multiple 
                ref={universalFileInputRef} 
                className="hidden" 
                onChange={handleUniversalUpload} 
                accept=".pdf,.docx,.doc,.txt,.md,.csv,.tsv,.json,.xml,.tex,.html,.js,.ts,.py,image/*" 
              />
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'text')} accept=".txt,.md,.csv,.json,.js,.ts,.html,.css" />
              <input type="file" multiple ref={imageInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" />

              {/* Universal Document Upload (PDF, DOCX, CSV, etc.) */}
              <button 
                onClick={() => universalFileInputRef.current?.click()} 
                className="p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                title="Upload any document (PDF, Word DOCX, TXT, CSV, JSON, Images)"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-bold hidden sm:inline">Upload Doc</span>
              </button>

              <button onClick={() => imageInputRef.current?.click()} className="p-3 text-slate-400 hover:text-purple-900 rounded-xl hover:bg-slate-50 transition-colors shrink-0" title="Attach image">
                <ImageIcon className="w-5 h-5" />
              </button>

              {isSupported && (
                <button 
                  onClick={handleMicClick}
                  className={`p-3 rounded-xl transition-colors shrink-0 ${isListening ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-purple-900 hover:bg-slate-50'}`}
                  title="Dictate query"
                >
                  {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXORA anything or prompt to summarize, analyze, or synthesize..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-slate-700 placeholder:text-slate-400 text-[15px]"
                rows={1}
              />

              {/* Quick Export Prompt Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                  title="Export options for current prompt or session"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 flex flex-col">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Export Prompt / Session
                    </div>
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const compiled = messages.map(m => `### ${m.role === 'user' ? 'Question' : 'Response'}\n\n${m.content}`).join('\n\n---\n\n');
                        handleExportContent(compiled || input, 'AI Research Session', 'word');
                      }}
                      className="px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Export as Word (.docx)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const compiled = messages.map(m => `### ${m.role === 'user' ? 'Question' : 'Response'}\n\n${m.content}`).join('\n\n---\n\n');
                        handleExportContent(compiled || input, 'AI Research Session', 'pdf');
                      }}
                      className="px-3 py-2 text-left text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 font-medium"
                    >
                      <FileDown className="w-4 h-4 text-rose-600" />
                      <span>Export as PDF (.pdf)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const compiled = messages.map(m => `### ${m.role === 'user' ? 'Question' : 'Response'}\n\n${m.content}`).join('\n\n---\n\n');
                        handleExportContent(compiled || input, 'AI Research Session', 'markdown');
                      }}
                      className="px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <FileCode className="w-4 h-4 text-slate-600" />
                      <span>Export as Markdown (.md)</span>
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const compiled = messages.map(m => `### ${m.role === 'user' ? 'Question' : 'Response'}\n\n${m.content}`).join('\n\n---\n\n');
                        handleExportContent(compiled || input, 'AI Research Project', 'workspace');
                      }}
                      className="px-3 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold"
                    >
                      <FolderKanban className="w-4 h-4 text-purple-600" />
                      <span>Open in Research Workspace</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachedFiles.length === 0 && attachedDocs.length === 0) || isLoading}
                className="px-5 py-3 bg-purple-900 text-amber-500 rounded-xl hover:bg-purple-800 disabled:opacity-50 disabled:hover:bg-purple-900 transition-colors shrink-0 shadow-sm font-semibold flex items-center gap-2"
              >
                Send <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-center mt-4 text-xs font-medium text-slate-400">
            NEXORA can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
}
