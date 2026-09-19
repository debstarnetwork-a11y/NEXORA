import React, { useState, useRef } from 'react';
import { 
  Square, 
  Circle, 
  ArrowRight, 
  Star, 
  MessageSquare, 
  Diamond, 
  Minus, 
  Trash2, 
  Plus, 
  Edit3, 
  Move,
  Palette,
  Type,
  Maximize2
} from 'lucide-react';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'star' | 'callout' | 'diamond' | 'line';

export interface CanvasShape {
  id: string;
  type: ShapeType;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // in pixels
  height: number; // in pixels
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
}

interface ShapesLayerProps {
  shapes: CanvasShape[];
  onChange: (shapes: CanvasShape[]) => void;
  fontFamily?: string;
  isEditingEnabled?: boolean;
}

const SHAPE_PALETTE = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#0F172A', // Slate Dark
  '#FFFFFF'  // White
];

export function ShapesLayer({
  shapes,
  onChange,
  fontFamily = 'Poppins, sans-serif',
  isEditingEnabled = true
}: ShapesLayerProps) {
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeShape = shapes.find(s => s.id === selectedShapeId);

  const addShape = (type: ShapeType) => {
    const newShape: CanvasShape = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: 30 + Math.random() * 25,
      y: 30 + Math.random() * 25,
      width: type === 'line' ? 140 : type === 'arrow' ? 120 : type === 'circle' ? 90 : 110,
      height: type === 'line' ? 4 : type === 'circle' ? 90 : 70,
      fillColor: type === 'line' ? '#6366F1' : '#6366F122',
      strokeColor: '#6366F1',
      strokeWidth: 2,
      opacity: 0.95,
      text: type === 'callout' ? 'Key Finding' : type === 'star' ? 'Crucial' : '',
      textColor: '#1E293B',
      fontSize: 12
    };

    const updated = [...shapes, newShape];
    onChange(updated);
    setSelectedShapeId(newShape.id);
  };

  const updateSelectedShape = (updates: Partial<CanvasShape>) => {
    if (!selectedShapeId) return;
    onChange(shapes.map(s => s.id === selectedShapeId ? { ...s, ...updates } : s));
  };

  const deleteSelectedShape = () => {
    if (!selectedShapeId) return;
    onChange(shapes.filter(s => s.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  // Dragging support
  const handlePointerDown = (e: React.PointerEvent, shape: CanvasShape) => {
    if (!isEditingEnabled) return;
    e.stopPropagation();
    setSelectedShapeId(shape.id);
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: clickXPercent - shape.x,
      y: clickYPercent - shape.y
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedShapeId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const yPercent = Math.max(0, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y));

    onChange(shapes.map(s => s.id === selectedShapeId ? { ...s, x: xPercent, y: yPercent } : s));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Top Toolbar for Shapes Kit */}
      {isEditingEnabled && (
        <div className="flex items-center justify-between gap-2 p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex-wrap mb-3 text-xs z-30">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 text-[11px] mr-1 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-purple-600" /> Add Shape:
            </span>
            <button
              onClick={() => addShape('rectangle')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Box / Rectangle"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Box</span>
            </button>
            <button
              onClick={() => addShape('circle')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Circle / Focus Ring"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => addShape('arrow')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Pointer Arrow"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Arrow</span>
            </button>
            <button
              onClick={() => addShape('star')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Star Badge"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Star</span>
            </button>
            <button
              onClick={() => addShape('callout')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Callout Bubble"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Callout</span>
            </button>
            <button
              onClick={() => addShape('diamond')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Diamond Marker"
            >
              <Diamond className="w-3.5 h-3.5" />
              <span>Diamond</span>
            </button>
            <button
              onClick={() => addShape('line')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
              title="Add Divider Line"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>

          {/* Active Shape Property Inspector */}
          {activeShape && (
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 p-1.5 rounded-xl border border-purple-200 dark:border-purple-800 flex-wrap">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                Selected:
              </span>

              {/* Text Editor */}
              <input
                type="text"
                value={activeShape.text || ''}
                onChange={(e) => updateSelectedShape({ text: e.target.value })}
                placeholder="Shape Label..."
                className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded text-xs outline-none w-28"
              />

              {/* Color Presets */}
              <div className="flex items-center gap-1">
                {SHAPE_PALETTE.slice(0, 5).map(c => (
                  <button
                    key={c}
                    onClick={() => updateSelectedShape({ strokeColor: c, fillColor: `${c}22` })}
                    className="w-4 h-4 rounded-full border border-black/10 cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Size Adjusters */}
              <button
                onClick={() => updateSelectedShape({ width: activeShape.width + 15, height: activeShape.height + 10 })}
                className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-purple-200 text-[10px] font-bold"
                title="Enlarge shape"
              >
                + Size
              </button>
              <button
                onClick={() => updateSelectedShape({ width: Math.max(30, activeShape.width - 15), height: Math.max(20, activeShape.height - 10) })}
                className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-purple-200 text-[10px] font-bold"
                title="Shrink shape"
              >
                - Size
              </button>

              <button
                onClick={deleteSelectedShape}
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 rounded transition-colors cursor-pointer"
                title="Delete shape"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shapes Container (Overlaid on Canvas) */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 pointer-events-none z-15 overflow-hidden"
      >
        {shapes.map((shape) => {
          const isSelected = shape.id === selectedShapeId;

          return (
            <div
              key={shape.id}
              onPointerDown={(e) => handlePointerDown(e, shape)}
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.width}px`,
                height: `${shape.height}px`,
                fontFamily
              }}
              className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow select-none ${
                isSelected ? 'ring-2 ring-purple-600 ring-offset-2 shadow-xl' : 'hover:ring-1 hover:ring-purple-400'
              }`}
            >
              {shape.type === 'rectangle' && (
                <div 
                  className="w-full h-full rounded-xl flex items-center justify-center p-2 text-center transition-all font-semibold"
                  style={{
                    backgroundColor: shape.fillColor,
                    borderColor: shape.strokeColor,
                    borderWidth: `${shape.strokeWidth}px`,
                    borderStyle: 'solid',
                    color: shape.textColor,
                    fontSize: `${shape.fontSize}px`
                  }}
                >
                  {shape.text || ''}
                </div>
              )}

              {shape.type === 'circle' && (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center p-2 text-center transition-all font-semibold shadow-sm"
                  style={{
                    backgroundColor: shape.fillColor,
                    borderColor: shape.strokeColor,
                    borderWidth: `${shape.strokeWidth}px`,
                    borderStyle: 'solid',
                    color: shape.textColor,
                    fontSize: `${shape.fontSize}px`
                  }}
                >
                  {shape.text || ''}
                </div>
              )}

              {shape.type === 'arrow' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow">
                    <defs>
                      <marker id={`arr_${shape.id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={shape.strokeColor} />
                      </marker>
                    </defs>
                    <line 
                      x1="5" y1="20" x2="88" y2="20" 
                      stroke={shape.strokeColor} 
                      strokeWidth={shape.strokeWidth * 1.5} 
                      markerEnd={`url(#arr_${shape.id})`}
                    />
                    {shape.text && (
                      <text 
                        x="45" y="14" 
                        textAnchor="middle" 
                        fill={shape.strokeColor} 
                        fontSize="10" 
                        fontWeight="bold"
                      >
                        {shape.text}
                      </text>
                    )}
                  </svg>
                </div>
              )}

              {shape.type === 'star' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                    <polygon 
                      points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" 
                      fill={shape.fillColor} 
                      stroke={shape.strokeColor} 
                      strokeWidth={shape.strokeWidth} 
                    />
                    {shape.text && (
                      <text 
                        x="50" y="58" 
                        textAnchor="middle" 
                        fill={shape.textColor || shape.strokeColor} 
                        fontSize="9" 
                        fontWeight="bold"
                      >
                        {shape.text}
                      </text>
                    )}
                  </svg>
                </div>
              )}

              {shape.type === 'callout' && (
                <div 
                  className="w-full h-full rounded-2xl p-2 flex items-center justify-center text-center font-bold relative shadow-md"
                  style={{
                    backgroundColor: shape.fillColor,
                    borderColor: shape.strokeColor,
                    borderWidth: `${shape.strokeWidth}px`,
                    borderStyle: 'solid',
                    color: shape.textColor,
                    fontSize: `${shape.fontSize}px`
                  }}
                >
                  <span>{shape.text || 'Insight'}</span>
                  {/* Callout Triangle pointer */}
                  <div 
                    className="absolute -bottom-2 left-6 w-3 h-3 rotate-45" 
                    style={{ 
                      backgroundColor: shape.fillColor, 
                      borderColor: shape.strokeColor, 
                      borderRightWidth: `${shape.strokeWidth}px`, 
                      borderBottomWidth: `${shape.strokeWidth}px` 
                    }} 
                  />
                </div>
              )}

              {shape.type === 'diamond' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                    <polygon 
                      points="50,5 95,50 50,95 5,50" 
                      fill={shape.fillColor} 
                      stroke={shape.strokeColor} 
                      strokeWidth={shape.strokeWidth} 
                    />
                    {shape.text && (
                      <text 
                        x="50" y="54" 
                        textAnchor="middle" 
                        fill={shape.textColor || shape.strokeColor} 
                        fontSize="10" 
                        fontWeight="bold"
                      >
                        {shape.text}
                      </text>
                    )}
                  </svg>
                </div>
              )}

              {shape.type === 'line' && (
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    backgroundColor: shape.strokeColor
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
