import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Eye, 
  EyeOff,
  Palette,
  Check
} from 'lucide-react';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  onChange: (strokes: DrawingStroke[]) => void;
  isDrawingActive: boolean;
  onToggleDrawing: (active: boolean) => void;
  canvasHeight?: number;
  className?: string;
  title?: string;
}

const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Slate', hex: '#0F172A' }
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 5 },
  { label: 'Thick', value: 10 },
  { label: 'Marker', value: 18 }
];

export function DrawingCanvas({
  strokes,
  onChange,
  isDrawingActive,
  onToggleDrawing,
  className = '',
  title = 'Freehand Drawing Layer'
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#EF4444');
  const [currentWidth, setCurrentWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Redraw all strokes onto HTML5 canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isVisible) return;

    const scaleX = canvas.width / 1000;
    const scaleY = canvas.height / 700;

    // Draw saved strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();

      // Normalize or direct scale depending on if point is in 0..1000 coordinates
      const isNorm = stroke.points[0].x <= 1000 && stroke.points[0].y <= 700;
      const sx = isNorm ? scaleX : 1;
      const sy = isNorm ? scaleY : 1;

      ctx.moveTo(stroke.points[0].x * sx, stroke.points[0].y * sy);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * sx, stroke.points[i].y * sy);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = stroke.width * (isNorm ? scaleX : 1) * 2.5;
      } else if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width * (isNorm ? scaleX : 1) * 3;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.width * (isNorm ? scaleX : 1);
      }

      ctx.stroke();
      ctx.restore();
    });

    // Draw active stroke being drawn right now
    if (isDrawing && currentPoints.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x * scaleX, currentPoints[0].y * scaleY);

      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x * scaleX, currentPoints[i].y * scaleY);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentTool === 'highlighter') {
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = currentWidth * scaleX * 2.5;
      } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentWidth * scaleX * 3;
      } else {
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = currentWidth * scaleX;
      }

      ctx.stroke();
      ctx.restore();
    }
  }, [strokes, isDrawing, currentPoints, currentTool, currentColor, currentWidth, isVisible]);

  // Adjust canvas size to container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive) return;
    e.stopPropagation();
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 700;

    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingActive) return;
    e.stopPropagation();
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 700;

    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDrawing(false);

    if (currentPoints.length > 1) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        points: currentPoints,
        color: currentColor,
        width: currentWidth,
        tool: currentTool
      };
      onChange([...strokes, newStroke]);
    }
    setCurrentPoints([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    onChange(strokes.slice(0, -1));
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Clear all drawing annotations on this page?')) {
      onChange([]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Drawing Toolbar */}
      <div 
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="pointer-events-auto flex items-center justify-between gap-2 p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg flex-wrap mb-3 text-xs z-30"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDrawing(!isDrawingActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              isDrawingActive 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-500/20' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
            title={isDrawingActive ? 'Turn off drawing mode to interact with elements' : 'Turn on freehand drawing on canvas'}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingActive ? 'Drawing Active' : 'Enable Drawing'}</span>
          </button>

          {isDrawingActive && (
            <>
              <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Tool Picker */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentTool === 'pen' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Pen / Fine Ink"
                >
                  <PenTool className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentTool('highlighter')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentTool === 'highlighter' ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Highlighter / Semi-Transparent"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentTool === 'eraser' ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Eraser"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Color Presets (Pen/Highlighter) */}
              {currentTool !== 'eraser' && (
                <div className="flex items-center gap-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setCurrentColor(c.hex)}
                      className={`w-5 h-5 rounded-full border border-black/10 dark:border-white/10 transition-transform cursor-pointer ${
                        currentColor === c.hex ? 'scale-125 ring-2 ring-purple-600 ring-offset-1' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                {STROKE_WIDTHS.map(w => (
                  <button
                    key={w.value}
                    onClick={() => setCurrentWidth(w.value)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                      currentWidth === w.value ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action buttons: Undo, Clear, Visibility */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title={isVisible ? 'Hide drawing layer' : 'Show drawing layer'}
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
          </button>
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title="Undo last stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 rounded-lg text-rose-500 transition-colors cursor-pointer"
            title="Clear all drawings"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {strokes.length > 0 && (
            <span className="text-[10px] font-bold text-slate-400 px-1">
              {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
            </span>
          )}
        </div>
      </div>

      {/* Drawing Overlay Canvas Container */}
      <div 
        ref={containerRef} 
        className={`absolute inset-0 z-20 overflow-hidden ${isDrawingActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`w-full h-full ${isDrawingActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
        />
      </div>
    </div>
  );
}
