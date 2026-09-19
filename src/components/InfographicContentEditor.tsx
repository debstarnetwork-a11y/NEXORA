import React from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Palette, 
  Check, 
  Type, 
  ListPlus, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { InfographicData, InfographicSection } from '../types';

interface InfographicContentEditorProps {
  infographic: InfographicData;
  onChange: (updated: InfographicData) => void;
  fontFamily: string;
  onFontChange: (font: string) => void;
}

const SECTION_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#475569'  // Slate
];

export const AVAILABLE_FONTS = [
  { name: 'Poppins', css: "'Poppins', sans-serif", category: 'Modern Geometric' },
  { name: 'Montserrat', css: "'Montserrat', sans-serif", category: 'Bold Display' },
  { name: 'Inter', css: "'Inter', sans-serif", category: 'Clean Sans' },
  { name: 'Playfair Display', css: "'Playfair Display', serif", category: 'Editorial Luxury' },
  { name: 'Georgia', css: "'Georgia', serif", category: 'Classic Book' }
];

export function InfographicContentEditor({
  infographic,
  onChange,
  fontFamily,
  onFontChange
}: InfographicContentEditorProps) {
  const updateField = <K extends keyof InfographicData>(field: K, value: InfographicData[K]) => {
    onChange({ ...infographic, [field]: value });
  };

  const updateSection = (secId: string, updates: Partial<InfographicSection>) => {
    const newSections = infographic.sections.map(sec => 
      sec.id === secId ? { ...sec, ...updates } : sec
    );
    updateField('sections', newSections);
  };

  const addSection = () => {
    const nextIdx = infographic.sections.length + 1;
    const newSec: InfographicSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Component Stage ${nextIdx}`,
      badge: `Stage 0${nextIdx}`,
      description: 'Comprehensive breakdown of this parameter and its interactions.',
      color: SECTION_COLORS[(nextIdx - 1) % SECTION_COLORS.length],
      points: ['Primary observation and rule', 'Observed characteristic'],
      metrics: [{ label: 'Significance', value: 'High' }]
    };
    updateField('sections', [...infographic.sections, newSec]);
  };

  const deleteSection = (secId: string) => {
    if (infographic.sections.length <= 1) {
      alert('An infographic must have at least 1 section.');
      return;
    }
    updateField('sections', infographic.sections.filter(s => s.id !== secId));
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= infographic.sections.length) return;
    const newSections = [...infographic.sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(targetIdx, 0, moved);
    updateField('sections', newSections);
  };

  const addPointToSection = (secId: string) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec) return;
    const newPoints = [...(sec.points || []), 'New key takeaway or supporting evidence'];
    updateSection(secId, { points: newPoints });
  };

  const updatePoint = (secId: string, pIdx: number, val: string) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec || !sec.points) return;
    const newPoints = [...sec.points];
    newPoints[pIdx] = val;
    updateSection(secId, { points: newPoints });
  };

  const deletePoint = (secId: string, pIdx: number) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec || !sec.points) return;
    const newPoints = sec.points.filter((_, i) => i !== pIdx);
    updateSection(secId, { points: newPoints });
  };

  const addMetricToSection = (secId: string) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec) return;
    const newMetrics = [...(sec.metrics || []), { label: 'Metric', value: '100%' }];
    updateSection(secId, { metrics: newMetrics });
  };

  const updateMetric = (secId: string, mIdx: number, key: 'label' | 'value', val: string) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec || !sec.metrics) return;
    const newMetrics = sec.metrics.map((m, i) => i === mIdx ? { ...m, [key]: val } : m);
    updateSection(secId, { metrics: newMetrics });
  };

  const deleteMetric = (secId: string, mIdx: number) => {
    const sec = infographic.sections.find(s => s.id === secId);
    if (!sec || !sec.metrics) return;
    const newMetrics = sec.metrics.filter((_, i) => i !== mIdx);
    updateSection(secId, { metrics: newMetrics });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-purple-200 dark:border-purple-900/60 shadow-md space-y-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600 text-white rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Content Editing Kit & Typography
          </span>
        </div>

        {/* Font Family Selector (Featuring Poppins) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Font Style:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
            {AVAILABLE_FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => onFontChange(f.css)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontFamily === f.css 
                    ? 'bg-purple-900 text-white shadow-sm' 
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

      {/* Main Info: Title, Subtitle, Summary, Conclusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Infographic Title
          </label>
          <input
            type="text"
            value={infographic.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Subtitle / Conceptual Tagline
          </label>
          <input
            type="text"
            value={infographic.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Executive Summary / Core Definition
          </label>
          <textarea
            value={infographic.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Conclusion / Key Significance
          </label>
          <input
            type="text"
            value={infographic.conclusion || ''}
            onChange={(e) => updateField('conclusion', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Section Blocks Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sections & Pillars ({infographic.sections.length})
          </span>
          <button
            onClick={addSection}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add New Section</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infographic.sections.map((sec, idx) => (
            <div 
              key={sec.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              {/* Header with Title, Reorder, Delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: sec.color }}
                  />
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                    className="font-bold text-xs bg-transparent border-b border-transparent focus:border-purple-600 outline-none w-full text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded text-slate-500"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === infographic.sections.length - 1}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded text-slate-500"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSection(sec.id)}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badge & Color Picker */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sec.badge || ''}
                  onChange={(e) => updateSection(sec.id, { badge: e.target.value })}
                  placeholder="Badge (e.g. Stage 01)"
                  className="px-2 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none w-28"
                />

                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {SECTION_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateSection(sec.id, { color: c })}
                      className={`w-3.5 h-3.5 rounded-full transition-transform ${
                        sec.color === c ? 'scale-125 ring-2 ring-purple-600' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <textarea
                value={sec.description}
                onChange={(e) => updateSection(sec.id, { description: e.target.value })}
                rows={2}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-300 outline-none resize-none"
              />

              {/* Bullet Points */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Bullet Points</span>
                  <button 
                    onClick={() => addPointToSection(sec.id)}
                    className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Point
                  </button>
                </div>
                {sec.points?.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-1">
                    <span className="text-purple-600 text-xs">•</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => updatePoint(sec.id, pIdx, e.target.value)}
                      className="flex-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none"
                    />
                    <button 
                      onClick={() => deletePoint(sec.id, pIdx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Metrics / KPIs</span>
                  <button 
                    onClick={() => addMetricToSection(sec.id)}
                    className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Metric
                  </button>
                </div>
                {sec.metrics?.map((m, mIdx) => (
                  <div key={mIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => updateMetric(sec.id, mIdx, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-1/2 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none"
                    />
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => updateMetric(sec.id, mIdx, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-1/3 text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none text-purple-600"
                    />
                    <button 
                      onClick={() => deleteMetric(sec.id, mIdx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
