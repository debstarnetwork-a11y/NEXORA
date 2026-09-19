import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  MapPin, 
  Edit3, 
  Type, 
  Layers, 
  Tag, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { DiagramConcept, LabelPin } from '../types';

interface DiagramContentEditorProps {
  concept: DiagramConcept;
  pins: LabelPin[];
  onChangeConcept: (updated: DiagramConcept) => void;
  onChangePins: (updated: LabelPin[]) => void;
  fontFamily: string;
  onFontChange: (font: string) => void;
  activePinId: string | null;
  onSelectPin: (pin: LabelPin) => void;
}

const PIN_COLORS = [
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6'  // Teal
];

export const DIAGRAM_FONTS = [
  { name: 'Poppins', css: "'Poppins', sans-serif", category: 'Modern Geometric' },
  { name: 'Montserrat', css: "'Montserrat', sans-serif", category: 'Bold Display' },
  { name: 'Inter', css: "'Inter', sans-serif", category: 'Standard Sans' },
  { name: 'Playfair Display', css: "'Playfair Display', serif", category: 'Editorial Luxury' },
  { name: 'Georgia', css: "'Georgia', serif", category: 'Academic Serif' }
];

export function DiagramContentEditor({
  concept,
  pins,
  onChangeConcept,
  onChangePins,
  fontFamily,
  onFontChange,
  activePinId,
  onSelectPin
}: DiagramContentEditorProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(activePinId || (pins[0]?.id ?? null));

  const updateConceptField = <K extends keyof DiagramConcept>(field: K, val: DiagramConcept[K]) => {
    onChangeConcept({ ...concept, [field]: val });
  };

  const updatePin = (pinId: string, updates: Partial<LabelPin>) => {
    const updated = pins.map(p => p.id === pinId ? { ...p, ...updates } : p);
    onChangePins(updated);
  };

  const addPin = () => {
    const nextNum = pins.length + 1;
    const newPin: LabelPin = {
      id: `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      number: nextNum,
      name: `Structure Feature ${nextNum}`,
      functionSummary: 'Functional significance or cellular role',
      detailedNotes: 'Detailed anatomical or physiological description of this feature.',
      category: 'Anatomy',
      color: PIN_COLORS[(nextNum - 1) % PIN_COLORS.length],
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30
    };
    const updated = [...pins, newPin];
    onChangePins(updated);
    setSelectedPinId(newPin.id);
    onSelectPin(newPin);
  };

  const deletePin = (pinId: string) => {
    if (pins.length <= 1) {
      alert('A diagram must have at least 1 labeled pin.');
      return;
    }
    const updated = pins.filter(p => p.id !== pinId);
    onChangePins(updated);
    if (selectedPinId === pinId) {
      setSelectedPinId(updated[0]?.id || null);
    }
  };

  const duplicatePin = (pinId: string) => {
    const source = pins.find(p => p.id === pinId);
    if (!source) return;
    const nextNum = pins.length + 1;
    const cloned: LabelPin = {
      ...source,
      id: `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      number: nextNum,
      name: `${source.name} (Copy)`,
      x: Math.min(90, source.x + 5),
      y: Math.min(90, source.y + 5)
    };
    const updated = [...pins, cloned];
    onChangePins(updated);
    setSelectedPinId(cloned.id);
    onSelectPin(cloned);
  };

  const currentPin = pins.find(p => p.id === selectedPinId) || pins[0];

  return (
    <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 shadow-md space-y-6 mb-6">
      {/* Header with Font Family & Concept Info */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
            <Edit3 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Diagram Content & Label Editing Kit
          </span>
        </div>

        {/* Font Family Selector (Featuring Poppins) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Font Style:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
            {DIAGRAM_FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => onFontChange(f.css)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontFamily === f.css 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                style={{ fontFamily: f.css }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Concept Metadata Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Diagram Concept Title
          </label>
          <input
            type="text"
            value={concept.title}
            onChange={(e) => updateConceptField('title', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Subtitle / Scientific Category
          </label>
          <input
            type="text"
            value={concept.subtitle}
            onChange={(e) => updateConceptField('subtitle', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Scientific Overview & Description
          </label>
          <textarea
            value={concept.description}
            onChange={(e) => updateConceptField('description', e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
          />
        </div>

        {concept.funFact && (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fun Fact / Clinical Pearl
            </label>
            <input
              type="text"
              value={concept.funFact}
              onChange={(e) => updateConceptField('funFact', e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        )}
      </div>

      {/* Pins Manager */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Pins & Labels ({pins.length})
            </span>
          </div>

          <button
            onClick={addPin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add New Pin</span>
          </button>
        </div>

        {/* Pin Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5">
          {pins.map(pin => (
            <button
              key={pin.id}
              onClick={() => {
                setSelectedPinId(pin.id);
                onSelectPin(pin);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                pin.id === selectedPinId
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: pin.color || '#10B981' }} 
              />
              <span>#{pin.number} {pin.name}</span>
            </button>
          ))}
        </div>

        {/* Active Pin Detailed Editor */}
        {currentPin && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span 
                  className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow"
                  style={{ backgroundColor: currentPin.color || '#10B981' }}
                >
                  {currentPin.number}
                </span>
                <input
                  type="text"
                  value={currentPin.name}
                  onChange={(e) => updatePin(currentPin.id, { name: e.target.value })}
                  placeholder="Pin Name (e.g. Nucleolus)"
                  className="font-bold text-sm bg-transparent border-b border-transparent focus:border-emerald-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => duplicatePin(currentPin.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Duplicate this pin"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => deletePin(currentPin.id)}
                  className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Delete this pin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Category & Color Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={currentPin.category || ''}
                  onChange={(e) => updatePin(currentPin.id, { category: e.target.value })}
                  placeholder="Category (e.g. Organelle, Membrane, Atom)"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Pin Color Accent
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {PIN_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updatePin(currentPin.id, { color: c })}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        currentPin.color === c ? 'scale-125 ring-2 ring-emerald-600' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Summary & Detailed Function */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Summary / Function Tagline
              </label>
              <input
                type="text"
                value={currentPin.functionSummary || ''}
                onChange={(e) => updatePin(currentPin.id, { functionSummary: e.target.value })}
                placeholder="Brief summary of function..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Comprehensive Anatomical / Physiological Details
              </label>
              <textarea
                value={currentPin.detailedNotes || ''}
                onChange={(e) => updatePin(currentPin.id, { detailedNotes: e.target.value })}
                rows={2}
                placeholder="Full scientific explanation..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none resize-none"
              />
            </div>

            {/* Coordinate info (X%, Y%) */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Position on Diagram: X: {Math.round(currentPin.x)}%, Y: {Math.round(currentPin.y)}%</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Tip: You can drag any pin on the diagram to reposition it!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
