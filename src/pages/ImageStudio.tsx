import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Save, 
  Wand2, 
  Loader2, 
  Sparkles, 
  Info, 
  X, 
  AlertCircle, 
  History, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Search, 
  Check, 
  Eye, 
  ArrowRight, 
  SlidersHorizontal, 
  ChevronRight, 
  Gift, 
  ExternalLink, 
  HelpCircle,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../store';
import { ImageHistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { insertSupabaseImageHistory, fetchSupabaseImageHistory, isSupabaseConfigured } from '../lib/supabase';
import { puterGenerateImage } from '../lib/puter';

const STORAGE_KEY = 'nexora_image_studio_history';

const DEFAULT_NEGATIVE_PROMPT = 'blurry, out of focus, low quality, deformed hands, extra fingers, missing fingers, mutated hands, bad anatomy, bad eyes, crossed eyes, disfigured, distorted face, low resolution, ugly, artifacts, watermark';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITIES = ['1K (High-Definition)', '2K (Ultra-Sharp)', '4K (Maximum Crisp)'];
const MODELS = [
  { label: 'Puter.js: FLUX.1 Schnell (Ultra-Sharp - 100% Free)', value: 'puter-flux' },
  { label: 'Puter.js: GPT-Image 2 (High-Fidelity Photorealism - Free)', value: 'puter-gpt-image' },
  { label: 'Puter.js: AI General (Free Auto-Select)', value: 'puter-image' },
  { label: 'FLUX.1 High-Definition (100% Free - Serverless)', value: 'pollinations-flux' },
  { label: 'Gemini 3.1 Flash Image (Google Cloud Credits)', value: 'gemini-3.1-flash-image' },
  { label: 'Gemini 3 Pro Image (Google Cloud Credits)', value: 'gemini-3-pro-image' },
  { label: 'Flux.1 Schnell (Together AI - Free Trial)', value: 'together-flux' },
  { label: 'FLUX.1 Schnell (Hugging Face - Free Token)', value: 'huggingface-flux' },
  { label: 'Flux.1 [dev] (Replicate)', value: 'replicate-flux-dev' }
];

const STYLES = [
  { label: 'Nexora Vision Pro (Photorealistic Masterpiece)', value: 'Nexora Vision Pro' },
  { label: 'Nexora Studio XL (Hasselblad Studio 100MP)', value: 'Nexora Studio XL' },
  { label: 'Nexora Cinematic (35mm Anamorphic Film)', value: 'Nexora Cinematic' },
  { label: 'Nexora Digital Art (Sharp Concept Illustration)', value: 'Nexora Digital Art' },
  { label: 'Nexora Anime High-Res (Makoto Shinkai Crisp)', value: 'Nexora Anime High-Res' },
  { label: 'Nexora Vision Fast (Crisp Dynamic)', value: 'Nexora Vision Fast' }
];

// Helper to safely load initial history from localStorage
const loadStoredHistory = (): ImageHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load image history from localStorage:', e);
    return [];
  }
};

export function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('1K (High-Definition)');
  const [model, setModel] = useState('puter-flux');
  const [style, setStyle] = useState('Nexora Vision Pro');
  const [antiDeformation, setAntiDeformation] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isFreeCreditsModalOpen, setIsFreeCreditsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Local Storage Image History State
  const [history, setHistory] = useState<ImageHistoryItem[]>(loadStoredHistory);
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHistoryItem, setActiveHistoryItem] = useState<ImageHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const { saveImage } = useAppStore();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      showToast('Type a prompt description first to enhance it!');
      return;
    }
    const base = prompt.trim().replace(/,\s*(masterpiece|8k|sharp focus|ultra-detailed|photorealistic).*$/i, '');
    const enhanced = `${base}, masterpiece photograph, 8k resolution, razor-sharp focus, symmetrical clear eyes, anatomically correct hands and fingers, smooth natural skin texture, professional cinematic lighting, crisp fine details`;
    setPrompt(enhanced);
    showToast('Prompt upgraded with Anti-Deformation & Sharpness filters!');
  };

  // Persist updated history to localStorage safely
  const persistHistory = (updatedHistory: ImageHistoryItem[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('LocalStorage quota limit reached, trimming older history items:', err);
      try {
        const trimmed = updatedHistory.slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (inner) {
        console.error('Could not persist image history to localStorage:', inner);
      }
    }
  };

  // Sync from Supabase on component mount if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseImageHistory().then((cloudItems) => {
        if (cloudItems && cloudItems.length > 0) {
          setHistory((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const toAdd = cloudItems.filter((c) => !existingIds.has(c.id));
            if (toAdd.length === 0) return prev;
            return [...toAdd, ...prev].slice(0, 50);
          });
        }
      });
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || isImageLoading) return;
    setIsGenerating(true);
    setIsImageLoading(false);
    setError(null);
    setWarning(null);

    const currentPrompt = prompt.trim();
    const currentNegativePrompt = negativePrompt.trim();
    const currentAspectRatio = aspectRatio;
    const currentQuality = quality;
    const currentModel = model;
    const currentStyle = style;

    try {
      let finalImageUrl = '';

      if (currentModel.startsWith('puter-')) {
        let puterModel = 'black-forest-labs/flux-schnell';
        if (currentModel === 'puter-gpt-image') puterModel = 'openai/gpt-image-2';
        else if (currentModel === 'puter-flux') puterModel = 'black-forest-labs/flux-schnell';

        const styleModifier = currentStyle && currentStyle !== 'Nexora Vision Pro' ? `, style of ${currentStyle}` : '';
        const enhancedPrompt = `${currentPrompt}${styleModifier}`;

        finalImageUrl = await puterGenerateImage(enhancedPrompt, {
          model: puterModel,
          aspectRatio: currentAspectRatio,
          quality: currentQuality,
          antiDeformation: antiDeformation
        });
      } else {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: currentPrompt, 
            negativePrompt: currentNegativePrompt || (antiDeformation ? DEFAULT_NEGATIVE_PROMPT : ''), 
            aspectRatio: currentAspectRatio, 
            quality: currentQuality, 
            model: currentModel, 
            style: currentStyle,
            antiDeformation: antiDeformation
          })
        });

        const data = await response.json();
        if (response.ok && data.imageUrl) {
          finalImageUrl = data.imageUrl;
          if (data.warning) setWarning(data.warning);
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      }

      if (finalImageUrl) {
        setIsImageLoading(true);

        const newHistoryItem: ImageHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          imageUrl: finalImageUrl,
          prompt: currentPrompt,
          negativePrompt: currentNegativePrompt || undefined,
          aspectRatio: currentAspectRatio,
          quality: currentQuality,
          model: currentModel,
          style: currentStyle,
          timestamp: Date.now()
        };

        // Pre-load the image so it doesn't show blank/broken while downloading
        const img = new Image();
        const onFinish = () => {
          setGeneratedImage(finalImageUrl);
          setActiveHistoryItem(newHistoryItem);
          setIsImageLoading(false);
          setIsGenerating(false);

          // Save to localStorage history
          persistHistory([newHistoryItem, ...history.filter(h => h.id !== newHistoryItem.id)].slice(0, 50));
          
          // Asynchronously persist to Supabase if configured
          if (isSupabaseConfigured) {
            insertSupabaseImageHistory(newHistoryItem).catch((e) => {
              console.warn('Failed to sync image to Supabase:', e);
            });
          }

          showToast('Image generated and saved to history!');
        };

        img.onload = onFinish;
        img.onerror = onFinish;
        img.src = finalImageUrl;
      }
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
      setIsImageLoading(false);
    }
  };

  const handleSaveToProjects = (itemPrompt: string, itemUrl: string) => {
    saveImage({
      id: Date.now().toString(),
      url: itemUrl,
      prompt: itemPrompt,
      timestamp: Date.now()
    });
    showToast('Saved to your Projects gallery!');
  };

  const handleDownload = async (imageUrl: string, promptText?: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexora-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Image download started');
    } catch (e) {
      console.error('Failed to download directly:', e);
      window.open(imageUrl, '_blank');
    }
  };

  const copyPromptText = (text: string, id: string = 'current') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Prompt copied to clipboard!');
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleRestoreHistoryItem = (item: ImageHistoryItem) => {
    setPrompt(item.prompt);
    setNegativePrompt(item.negativePrompt || '');
    setAspectRatio(item.aspectRatio || '1:1');
    setQuality(item.quality || '1K');
    setModel(item.model || 'replicate-flux-dev');
    setStyle(item.style || 'Nexora Vision Pro');
    setGeneratedImage(item.imageUrl);
    setActiveHistoryItem(item);
    setActiveTab('studio');
    showToast('Restored prompt and generation settings to Studio!');
  };

  const handleDeleteHistoryItem = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const filtered = history.filter(item => item.id !== id);
    persistHistory(filtered);
    if (activeHistoryItem?.id === id) {
      setActiveHistoryItem(null);
    }
    showToast('Removed from history');
  };

  const handleClearAllHistory = () => {
    persistHistory([]);
    setActiveHistoryItem(null);
    setIsClearModalOpen(false);
    showToast('Local generation history cleared');
  };

  // Filtered history list based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(item => 
      item.prompt.toLowerCase().includes(q) ||
      (item.negativePrompt && item.negativePrompt.toLowerCase().includes(q)) ||
      item.model.toLowerCase().includes(q) ||
      item.style.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const formatTimestamp = (ts: number): string => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModelShortLabel = (modelVal: string): string => {
    const found = MODELS.find(m => m.value === modelVal);
    if (found) {
      if (modelVal === 'puter-image') return 'Puter.js AI (Free)';
      if (modelVal === 'pollinations-flux') return 'FLUX.1 (Free)';
      if (modelVal === 'pollinations-turbo') return 'SDXL Turbo (Free)';
      if (modelVal === 'huggingface-flux') return 'FLUX.1 Schnell (HF Free)';
      if (modelVal === 'together-flux') return 'FLUX.1 Schnell (Together)';
      if (modelVal.startsWith('gemini')) return found.label.replace(/\s*\(.*\)/, '');
      return found.label.split(' - ')[0];
    }
    return modelVal;
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Image Studio
          </h2>
          <p className="text-slate-500 mt-1">
            Create high-fidelity visuals • Prompts and results automatically saved locally
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsFreeCreditsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            title="Learn how to get $300 to $25k in free AI API credits"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            Free Credits Guide
          </button>

          {/* View Switcher: Studio vs History */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-4 h-4 text-purple-700" />
              Studio
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-purple-700" />
              History
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'history' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-slate-300/80 text-slate-700'
              }`}>
                {history.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'studio' ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-5">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">AI Model</label>
                      <select 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                      >
                        {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Aesthetic Style</label>
                      <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                      >
                        {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">Prompt</label>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={handleEnhancePrompt}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Inject anti-deformation keywords, lighting, and razor-sharp photographic details"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Enhance Clarity
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsTipsModalOpen(true)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Tips
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to create in vivid detail (e.g. portrait of a person, landscape, etc.)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none resize-none h-28 text-sm leading-relaxed"
                    />

                    {/* Anti-Deformation & Clarity Engine Status Banner */}
                    <div className="mt-2 p-3 bg-gradient-to-r from-purple-50/90 to-indigo-50/90 border border-purple-200/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            Anti-Deformation & Anatomy Shield
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              antiDeformation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {antiDeformation ? 'ACTIVE' : 'OFF'}
                            </span>
                          </div>
                          <p className="text-[11px] text-purple-800/80">
                            Prevents distorted faces, extra fingers, and blurry artifacts
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !antiDeformation;
                          setAntiDeformation(nextState);
                          if (nextState) {
                            setNegativePrompt(DEFAULT_NEGATIVE_PROMPT);
                            showToast('Anti-Deformation Shield active');
                          } else {
                            setNegativePrompt('');
                            showToast('Anti-Deformation Shield disabled');
                          }
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none ${
                          antiDeformation ? 'bg-purple-900' : 'bg-slate-300'
                        }`}
                        title={antiDeformation ? 'Disable anti-deformation guard' : 'Enable anti-deformation guard'}
                      >
                        <span className={`w-4.5 h-4.5 rounded-full bg-white block absolute top-0.75 transition-transform shadow-sm ${
                          antiDeformation ? 'left-5' : 'left-0.75'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Negative Prompt <span className="text-slate-400 font-normal">(Filtered terms)</span>
                      </label>
                      {negativePrompt !== DEFAULT_NEGATIVE_PROMPT && (
                        <button
                          type="button"
                          onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
                          className="text-[11px] text-purple-700 hover:text-purple-900 font-medium"
                        >
                          Reset to Anti-Deform defaults
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="What to exclude (e.g., blurry, bad hands, distortion)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Aspect Ratio</label>
                      <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                      >
                        {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Quality</label>
                      <select 
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                      >
                        {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating || isImageLoading}
                    className={`w-full font-semibold rounded-xl py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 ${
                      (isGenerating || isImageLoading)
                        ? 'bg-purple-500 text-white cursor-wait animate-pulse'
                        : 'bg-purple-900 hover:bg-purple-800 text-white disabled:opacity-50 disabled:hover:bg-purple-900'
                    }`}
                  >
                    {(isGenerating || isImageLoading) ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating & Saving...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Image
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}
                  
                  {warning && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{warning}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-7 flex flex-col h-[540px] lg:h-auto">
              <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm relative flex items-center justify-center overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group">
                
                {/* Active History item info banner */}
                {activeHistoryItem && generatedImage === activeHistoryItem.imageUrl && !isGenerating && !isImageLoading && (
                  <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-md flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 truncate mr-2">
                      <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="font-semibold text-slate-900">Saved History:</span>
                      <span className="text-slate-500 truncate">{formatTimestamp(activeHistoryItem.timestamp)} • {activeHistoryItem.style}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreHistoryItem(activeHistoryItem)}
                      className="px-2.5 py-1 bg-purple-50 text-purple-900 font-semibold rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reuse Parameters
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {(isGenerating || isImageLoading) ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-900 animate-spin flex items-center justify-center" />
                        <Sparkles className="w-8 h-8 text-purple-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                        Synthesizing Image...
                      </h3>
                      <p className="text-slate-500 max-w-sm text-sm">
                        Rendering composition with {style}... Prompt & result will be auto-saved to local history.
                      </p>
                      <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-900 rounded-full text-xs font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Please wait a moment
                      </div>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full rounded-xl overflow-hidden shadow-sm flex items-center justify-center"
                    >
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="w-full h-full object-contain rounded-xl"
                      />
                      
                      {/* Actions Overlay */}
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button 
                          onClick={() => setZoomedImage(generatedImage)}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors"
                          title="Inspect High-Res (Full Size)"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => copyPromptText(prompt, 'preview')}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors"
                          title="Copy Prompt"
                        >
                          {copiedId === 'preview' ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleDownload(generatedImage, prompt)}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleSaveToProjects(prompt, generatedImage)}
                          className="p-3 bg-purple-900 shadow-lg shadow-purple-900/30 text-white rounded-xl hover:bg-purple-800 transition-colors"
                          title="Save to Projects Gallery"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-400 flex flex-col items-center"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 text-purple-800">
                        <ImageIcon className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                      <p className="font-semibold text-slate-700 text-lg">Visual Canvas Ready</p>
                      <p className="text-slate-400 text-sm mt-1 max-w-xs text-center">
                        Configure your prompt and click Generate to see your vision brought to life.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {error && (
                  <div className="absolute top-4 left-4 right-4 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm z-20 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 text-sm">Generation Notice</p>
                          <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {model !== 'puter-flux' && (
                              <button
                                onClick={() => {
                                  setModel('puter-flux');
                                  setError(null);
                                  showToast('Switched to Puter.js FLUX.1 (Ultra-Sharp & Free)');
                                }}
                                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Try Puter.js FLUX.1 (Free)
                              </button>
                            )}

                            {model !== 'puter-gpt-image' && (
                              <button
                                onClick={() => {
                                  setModel('puter-gpt-image');
                                  setError(null);
                                  showToast('Switched to Puter GPT-Image 2 (High-Fidelity Photorealism)');
                                }}
                                className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                Try Puter GPT-Image 2 (Free)
                              </button>
                            )}

                            {model !== 'pollinations-flux' && (
                              <button
                                onClick={() => {
                                  setModel('pollinations-flux');
                                  setError(null);
                                  showToast('Switched to FLUX.1 Serverless');
                                }}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                Try FLUX.1 Serverless
                              </button>
                            )}

                            <button
                              onClick={() => setIsFreeCreditsModalOpen(true)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              Free Credits Guide ($300 - $25k)
                            </button>

                            {model !== 'huggingface-flux' && (
                              <button
                                onClick={() => {
                                  setModel('huggingface-flux');
                                  setError(null);
                                  showToast('Switched to FLUX.1 Schnell (Hugging Face)');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                Try Free Hugging Face
                              </button>
                            )}

                            {model !== 'gemini-3.1-flash-image' && (
                              <button
                                onClick={() => {
                                  setModel('gemini-3.1-flash-image');
                                  setError(null);
                                  showToast('Switched to Gemini 3.1 Flash Image');
                                }}
                                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                Try Gemini 3.1
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600 p-1 shrink-0"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick-Access Recent History Strip in Studio */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-700" />
                  <h3 className="font-bold text-slate-900 text-base">Recent Generations</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {history.length} saved locally
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
                >
                  View full history
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {history.slice(0, 6).map((item) => {
                  const isSelected = activeHistoryItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setGeneratedImage(item.imageUrl);
                        setActiveHistoryItem(item);
                      }}
                      className={`group cursor-pointer rounded-xl overflow-hidden border p-1.5 transition-all bg-slate-50 hover:bg-white hover:shadow-md ${
                        isSelected 
                          ? 'border-purple-700 ring-2 ring-purple-600/30' 
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-200 relative mb-2">
                        <img 
                          src={item.imageUrl} 
                          alt={item.prompt} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreHistoryItem(item);
                            }}
                            title="Reuse prompt & settings"
                            className="p-1.5 bg-white text-slate-800 rounded-md hover:bg-purple-50 hover:text-purple-900 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPromptText(item.prompt, item.id);
                            }}
                            title="Copy prompt"
                            className="p-1.5 bg-white text-slate-800 rounded-md hover:bg-purple-50 hover:text-purple-900 transition-colors"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 truncate" title={item.prompt}>
                        {item.prompt}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        <span className="font-mono">{item.aspectRatio}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full Generation History Archive View */
        <div className="space-y-6">
          {/* History Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by prompt or style..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredHistory.length} of {history.length} items
              </span>
              
              {history.length > 0 && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200/80 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>
          </div>

          {/* History Grid or Empty State */}
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Generation History Yet</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Whenever you generate images in the Image Studio, both the prompts and rendered visual outputs will be automatically cataloged right here in your browser's local storage.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Start Creating in Studio
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No matching generations found</h3>
              <p className="text-slate-500 text-sm">
                No history entries matched "<span className="text-slate-700 font-medium">{searchQuery}</span>".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Display */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[11px] font-mono rounded-md font-semibold">
                        {item.aspectRatio}
                      </span>
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[11px] rounded-md font-medium">
                        {item.quality}
                      </span>
                    </div>

                    {/* Image Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={() => {
                          setGeneratedImage(item.imageUrl);
                          setActiveHistoryItem(item);
                          setActiveTab('studio');
                        }}
                        className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-purple-50 hover:text-purple-900 transition-colors shadow-md"
                        title="View on Canvas in Studio"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreHistoryItem(item)}
                        className="p-2.5 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-colors shadow-md"
                        title="Load prompt & settings into Studio"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(item.imageUrl, item.prompt)}
                        className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-purple-50 hover:text-purple-900 transition-colors shadow-md"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-2.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-colors shadow-md"
                        title="Delete from local history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Pills */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {item.style}
                        </span>
                      </div>

                      {/* Prompt Text */}
                      <div className="mb-3">
                        <p className="text-slate-800 text-sm font-medium line-clamp-3 leading-relaxed">
                          "{item.prompt}"
                        </p>
                      </div>

                      {/* Negative Prompt if present */}
                      {item.negativePrompt && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-1 italic">
                          <span className="font-semibold text-slate-500">Excluded:</span> {item.negativePrompt}
                        </p>
                      )}

                      {/* Model badge */}
                      <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 w-fit mb-4 font-mono truncate max-w-full">
                        {getModelShortLabel(item.model)}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleRestoreHistoryItem(item)}
                        className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reuse in Studio
                      </button>

                      <button
                        onClick={() => copyPromptText(item.prompt, item.id)}
                        className="p-2 border border-slate-200 text-slate-600 hover:text-purple-900 hover:border-purple-300 rounded-xl transition-colors"
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleSaveToProjects(item.prompt, item.imageUrl)}
                        className="p-2 border border-slate-200 text-slate-600 hover:text-purple-900 hover:border-purple-300 rounded-xl transition-colors"
                        title="Save to Projects Gallery"
                      >
                        <Save className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors"
                        title="Delete from History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Clearing History */}
      <AnimatePresence>
        {isClearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Clear Generation History?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This will delete all {history.length} saved prompts and results from your browser's local storage. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllHistory}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prompt Tips Modal */}
      <AnimatePresence>
        {isTipsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTipsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">Prompting Tips for Realism</h3>
                </div>
                <button 
                  onClick={() => setIsTipsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-6 text-sm text-slate-600">
                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">1. Formula for Photorealism</h4>
                  <p>Start with the subject, then add environment, lighting, and camera details.</p>
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                    [Subject description] + [Environment] + [Lighting conditions] + [Camera lens/style]
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">2. Magic Keywords to Include</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Quality:</strong> 8k resolution, highly detailed, photorealistic, cinematic</li>
                    <li><strong>Lighting:</strong> soft studio lighting, golden hour, rim lighting, dramatic shadows</li>
                    <li><strong>Camera:</strong> shot on 85mm lens, f/1.8, shallow depth of field, sharp focus</li>
                    <li><strong>Human details:</strong> natural skin texture, visible pores, symmetrical facial features</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">3. Guarding against Distortions</h4>
                  <p>Put these in your <strong>Negative Prompt</strong> box to fix eyes and hands:</p>
                  <div className="mt-2 p-3 bg-red-50 text-red-800 rounded-lg border border-red-100 font-mono text-xs">
                    bad anatomy, distorted eyes, asymmetrical eyes, cross-eyed, extra fingers, missing fingers, malformed hands, deformed limbs, floating limbs, disfigured, mutated, cartoon, illustration
                  </div>
                </section>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setIsTipsModalOpen(false)}
                  className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Free API Credits & Grants Modal */}
      <AnimatePresence>
        {isFreeCreditsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFreeCreditsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">How to Get Free API Credits ($0 Cost)</h3>
                    <p className="text-xs text-slate-500">Official developer programs, grants, and free API keys</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFreeCreditsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-600">
                {/* 1. Puter.js Zero-Risk Free AI */}
                <div className="p-4 rounded-xl border border-purple-300 bg-purple-50/70 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <h4 className="font-bold text-slate-900 text-base">Puter.js (100% Free - Safe from Grok / xAI IP Blocks)</h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full">Safe &amp; Free</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Unlike xAI / Grok, which requires paid billing and aggressively suspends accounts or blocks IP addresses when attempting free calls, <strong>Puter.js</strong> provides open AI access directly without API keys, cards, or IP blocking risks.
                  </p>
                  <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-purple-200 text-xs text-slate-700 space-y-1 font-medium">
                    <p>✨ <strong>Integrated in this app:</strong></p>
                    <p>• <strong>Image Studio:</strong> Select <strong>Puter.js AI (100% Free)</strong> in the model dropdown.</p>
                    <p>• <strong>AI Research:</strong> Use Puter.js GPT-4o-mini, Claude 3.5 Sonnet, or DeepSeek without keys.</p>
                  </div>
                </div>

                {/* 2. Instant Zero-Account Free FLUX */}
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <h4 className="font-bold text-slate-900 text-base">FLUX.1 & SDXL Turbo (100% Free - No Account Needed!)</h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">Ready Now</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    You <strong>do not need to create an account or provide any payment details</strong>! We have enabled serverless FLUX.1 Schnell and SDXL Turbo directly inside this app.
                  </p>
                  <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700 space-y-1 font-medium">
                    <p>✨ <strong>How to use right now:</strong></p>
                    <p>1. In the Studio model dropdown, select <strong>FLUX.1 Schnell (100% Free - No Account Needed)</strong>.</p>
                    <p>2. Enter your visual prompt and click <strong>Generate</strong>.</p>
                  </div>
                </div>

                {/* 3. Google Cloud $300 Free Trial */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <h4 className="font-bold text-slate-900 text-base">Google Cloud $300 Free Trial (Use Your Google Account)</h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">$300 Free</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Since you already have a Google account and Google Pro, you do not need to register on a new third-party site. Activate the $300 Google Cloud credit grant directly to unlock <strong>Gemini 3.1 Flash Image</strong> with $0 out of pocket.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <a 
                      href="https://cloud.google.com/free" 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Activate $300 Google Cloud Free Trial
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 4. NVIDIA & Hugging Face Status */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                      <h4 className="font-bold text-slate-900 text-base">Hugging Face (NVIDIA Acquisition Notice)</h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Sign-up Issues</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    NVIDIA officially announced an agreement to acquire Hugging Face for $12.9B. Due to extreme traffic surges and account migration policies, new account registrations are experiencing verification errors. <strong>You can skip Hugging Face entirely</strong> by using the built-in free FLUX.1 model above.
                  </p>
                </div>

                {/* 5. Google for Startups Cloud Program */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-900 text-white text-xs font-bold flex items-center justify-center">5</span>
                      <h4 className="font-bold text-slate-900 text-base">Google for Startups ($2k to $25k+ Grants)</h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-900 rounded-full">Grants up to $25k+</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Google donates up to $2,000 in free credits for early-stage builders (Start Tier, no venture capital needed) and up to $25,000–$350,000 for AI developers.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <a 
                      href="https://cloud.google.com/startup" 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Apply to Google for Startups
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 6. Together AI Free Starter Credits */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">6</span>
                      <h4 className="font-bold text-slate-900 text-base">Together AI ($5 Free Starter Credits)</h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full">~1,500 Images</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Sign up with your existing GitHub account or email at <strong>api.together.ai</strong> to get $5 in free credits for FLUX.1 Schnell.
                  </p>
                  <div className="mt-3">
                    <a 
                      href="https://api.together.ai" 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Sign Up at Together AI
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setIsFreeCreditsModalOpen(false)}
                  className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Fullscreen Lightbox Modal */}
        {zoomedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            >
              <div className="absolute -top-12 right-0 flex items-center gap-3 text-white">
                <button
                  onClick={() => handleDownload(zoomedImage, prompt)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setZoomedImage(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img 
                src={zoomedImage} 
                alt="High-Res Inspection" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

