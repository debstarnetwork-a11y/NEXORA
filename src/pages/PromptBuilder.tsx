import { useState, useMemo, useEffect } from 'react';
import { Copy, Sparkles, CheckCircle2, ChevronRight, Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { useSpeech } from '../hooks/useSpeech';

const SECTIONS = [
  { id: 'subject', label: 'Subject', placeholder: 'e.g., A cybernetic samurai', icon: '👤' },
  { id: 'style', label: 'Style', placeholder: 'e.g., Photorealistic, Oil painting, 3D Render', icon: '🎨' },
  { id: 'lighting', label: 'Lighting', placeholder: 'e.g., Cinematic, Volumetric, Neon glow', icon: '💡' },
  { id: 'camera', label: 'Camera', placeholder: 'e.g., 35mm lens, Drone shot, Macro', icon: '📷' },
  { id: 'background', label: 'Background', placeholder: 'e.g., Dystopian city street, Blurred', icon: '🌆' },
  { id: 'colors', label: 'Colors', placeholder: 'e.g., Monochromatic red, Pastel, High contrast', icon: '🌈' },
  { id: 'composition', label: 'Composition', placeholder: 'e.g., Rule of thirds, Symmetrical, Dutch angle', icon: '📐' },
  { id: 'extra', label: 'Extra Details', placeholder: 'e.g., 8k resolution, Masterpiece, Trending on ArtStation', icon: '✨' },
];

export function PromptBuilder() {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexora_prompt_builder_draft');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved prompt draft", e);
        }
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexora_prompt_builder_draft', JSON.stringify(fields));
    }
  }, [fields]);

  const [copied, setCopied] = useState(false);
  const { savePrompt } = useAppStore();
  
  const { isListening, startListening, stopListening, isSupported } = useSpeech();
  const [activeMicField, setActiveMicField] = useState<string | null>(null);

  useEffect(() => {
    if (!isListening) setActiveMicField(null);
  }, [isListening]);

  const handleMicClick = (fieldId: string) => {
    if (isListening && activeMicField === fieldId) {
      stopListening();
    } else {
      if (isListening) stopListening();
      setActiveMicField(fieldId);
      startListening((text) => {
        setFields(prev => ({
          ...prev,
          [fieldId]: (prev[fieldId] || '') + (prev[fieldId] ? ' ' : '') + text
        }));
      });
    }
  };

  const handleFieldChange = (id: string, value: string) => {
    setFields(prev => ({ ...prev, [id]: value }));
  };

  const finalPrompt = useMemo(() => {
    return SECTIONS
      .map(s => fields[s.id]?.trim())
      .filter(Boolean)
      .join(', ');
  }, [fields]);

  const handleCopy = () => {
    if (!finalPrompt) return;
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!finalPrompt) return;
    savePrompt({
      id: Date.now().toString(),
      title: fields.subject?.substring(0, 30) || 'Untitled Prompt',
      content: finalPrompt,
      timestamp: Date.now()
    });
    alert('Prompt saved to Projects!');
  };

  const clearAll = () => {
    setFields({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexora_prompt_builder_draft');
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Prompt Builder</h2>
          <p className="text-slate-500 mt-1">Structurally design the perfect prompt</p>
        </div>
        <button onClick={clearAll} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Builder Form */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map((section, idx) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-purple-900/20 focus-within:border-purple-900 transition-all"
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <span className="text-lg">{section.icon}</span>
                {section.label}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fields[section.id] || ''}
                  onChange={(e) => handleFieldChange(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 focus:outline-none focus:bg-white transition-colors"
                />
                {isSupported && (
                  <button
                    onClick={() => handleMicClick(section.id)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                      isListening && activeMicField === section.id 
                        ? 'text-red-500 bg-red-50' 
                        : 'text-slate-400 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    {isListening && activeMicField === section.id ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-slate-900 rounded-2xl p-8 shadow-xl h-full flex flex-col sticky top-8 border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Final Output</h3>
            </div>
            
            <div className="flex-1 bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              {finalPrompt ? (
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  {finalPrompt}
                </p>
              ) : (
                <p className="text-slate-500 italic text-center mt-10">
                  Start typing to build your prompt...
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCopy}
                disabled={!finalPrompt}
                className={`py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                {copied ? (
                  <><CheckCircle2 className="w-5 h-5" /> Copied!</>
                ) : (
                  <><Copy className="w-5 h-5" /> Copy Prompt</>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!finalPrompt}
                className="py-3.5 rounded-xl font-semibold bg-purple-900 text-amber-500 hover:bg-purple-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Save to Projects <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
