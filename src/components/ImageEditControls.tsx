import React, { useRef, useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Maximize2, 
  Image as ImageIcon, 
  Layers, 
  UserCheck, 
  Compass, 
  Check, 
  Sliders,
  ChevronRight,
  ZoomIn,
  Shirt,
  User,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { ImageEditMode, CharacterAnalysis } from '../types';
import { VoicePromptButton } from './VoicePromptButton';

interface ImageEditControlsProps {
  referenceImage: string | null;
  onReferenceImageChange: (image: string | null) => void;
  editMode: ImageEditMode;
  onEditModeChange: (mode: ImageEditMode) => void;
  faceLock: boolean;
  onFaceLockChange: (locked: boolean) => void;
  lockComplexion: boolean;
  onLockComplexionChange: (locked: boolean) => void;
  complexionText: string;
  onComplexionTextChange: (text: string) => void;
  lockAttire: boolean;
  onLockAttireChange: (locked: boolean) => void;
  attireText: string;
  onAttireTextChange: (text: string) => void;
  onPromptSelect: (promptText: string) => void;
  onTriggerUpscale: (factor: 2 | 4, mode: 'balanced' | 'face_revamp' | 'ultra_sharp') => void;
  isUpscaling: boolean;
  onNotice?: (message: string) => void;
  onAnalysisComplete?: (data: CharacterAnalysis) => void;
}

export function ImageEditControls({
  referenceImage,
  onReferenceImageChange,
  editMode,
  onEditModeChange,
  faceLock,
  onFaceLockChange,
  lockComplexion,
  onLockComplexionChange,
  complexionText,
  onComplexionTextChange,
  lockAttire,
  onLockAttireChange,
  attireText,
  onAttireTextChange,
  onPromptSelect,
  onTriggerUpscale,
  isUpscaling,
  onNotice,
  onAnalysisComplete,
}: ImageEditControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCustomizingLocks, setIsCustomizingLocks] = useState(false);
  const [analyzedProfile, setAnalyzedProfile] = useState<CharacterAnalysis | null>(null);
  const lastAnalyzedImageRef = useRef<string | null>(null);

  // Trigger Gemini Vision forensic analysis on uploaded reference image
  useEffect(() => {
    if (!referenceImage) {
      lastAnalyzedImageRef.current = null;
      setAnalyzedProfile(null);
      return;
    }

    if (referenceImage === lastAnalyzedImageRef.current) return;
    lastAnalyzedImageRef.current = referenceImage;

    let isSubscribed = true;
    setIsAnalyzing(true);

    fetch('/api/analyze-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: referenceImage })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Analysis request failed');
        return res.json();
      })
      .then((data: CharacterAnalysis) => {
        if (!isSubscribed) return;
        setAnalyzedProfile(data);
        if (data.ethnicityAndComplexion) {
          onComplexionTextChange(data.ethnicityAndComplexion);
        }
        if (data.attireDescription) {
          onAttireTextChange(data.attireDescription);
        }
        onAnalysisComplete?.(data);
        onNotice?.(`Biometric likeness locked: ${data.ethnicityAndComplexion ? data.ethnicityAndComplexion.slice(0, 45) : 'Subject identified'}... Ready for authentic transformation!`);
      })
      .catch((err) => {
        console.warn('Vision character analysis fallback:', err);
      })
      .finally(() => {
        if (isSubscribed) setIsAnalyzing(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [referenceImage]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotice?.('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      onNotice?.('Image size is too large. Please select an image under 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onReferenceImageChange(result);
        onNotice?.('Source image loaded! Analyzing complexion & attire with Vision AI...');
      }
    };
    reader.onerror = () => {
      onNotice?.('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Quick preset templates for rapid user exploration
  const PRESETS: Record<ImageEditMode, { label: string; prompt: string }[]> = {
    scene_change: [
      { label: 'Cyberpunk Rain', prompt: 'Walking in a bustling futuristic cyberpunk city illuminated by neon signs with soft rainy street reflections, moody atmospheric volumetric lighting' },
      { label: 'Golden Hour Beach', prompt: 'Standing along a serene tropical beach shoreline during golden hour sunset, warm ocean breeze, soft horizon glow, cinematic movie still' },
      { label: 'Cozy Paris Cafe', prompt: 'Seated outdoors at a charming Parisian cafe street terrace with warm autumn sunlight, cobblestone sidewalk, and coffee cup on table' },
      { label: 'Snow Blizzard', prompt: 'In a winter wonderland alpine mountain during a crisp snowfall, wearing a warm parka, soft pine trees and snowy peaks in background' }
    ],
    background_change: [
      { label: 'Modern Luxury Loft', prompt: 'Inside a contemporary high-ceiling penthouse loft with floor-to-ceiling windows, modern designer furniture, and soft ambient natural light' },
      { label: 'Clean Studio Backdrop', prompt: 'In a high-end photography studio against a seamless soft neutral grey gradient backdrop with professional dual softbox lighting' },
      { label: 'Lush Botanical Garden', prompt: 'Surrounded by lush exotic green tropical plants and monstera leaves in a sunlit glasshouse conservatory' },
      { label: 'Night Cityscape Bokeh', prompt: 'Against an out-of-focus nighttime metropolitan skyline with glowing bokeh streetlights and cinematic depth of field' }
    ],
    posture_change: [
      { label: 'Arms Crossed Heroic', prompt: 'Standing in a confident, authoritative posture with arms crossed, facing forward with a composed and self-assured expression' },
      { label: 'Walking Forward', prompt: 'Walking naturally forward toward the camera in mid-stride, casual relaxed posture, one hand in pocket' },
      { label: 'Seated at Desk', prompt: 'Seated comfortably at a sleek wooden executive desk with hands resting gently on the tabletop' },
      { label: 'Looking Over Shoulder', prompt: 'Turned three-quarters away, glancing back over the shoulder with a captivating cinematic head turn' }
    ],
    face_revamp: [
      { label: 'High-Res Face Revamp', prompt: 'Sharpen eye reflection clarity, restore crisp iris details, smooth skin micro-textures naturally, 8k resolution master photography' },
      { label: 'Studio Glamour Lighting', prompt: 'Professional studio portrait beauty lighting, soft key light highlighting cheekbones, clean sharp hair definition' },
      { label: 'Monochrome Editorial', prompt: 'Classic black and white fine art editorial portrait, razor-sharp focus on the eyes, rich velvety contrast' }
    ],
    custom_edit: [
      { label: 'Oil Painting Style', prompt: 'Rendered in rich classical oil painting style with visible textured brushstrokes and dramatic chiaroscuro' },
      { label: 'Graphic Anime Cel', prompt: 'Stylized modern anime character art with vibrant colors, clean outlines, and Makoto Shinkai sky lighting' }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone / Active Reference Card */}
      {!referenceImage ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-600 bg-purple-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-purple-400 bg-slate-50/70 hover:bg-white'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Upload Image for Editing & Upscaling
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Drag & drop or click to upload (JPG, PNG, WebP). Change scenes, posture & backgrounds while locking character face.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              🛡️ Complexion & Attire Lock
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Face Identity Lock
            </span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              2X / 4X Upscale
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-purple-50/40 border border-purple-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Source Reference Active
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2.5 py-1 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  onReferenceImageChange(null);
                  onNotice?.('Reference image removed.');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove source image"
              >
                <X className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative shrink-0 shadow-sm group">
              {referenceImage && referenceImage.trim() !== '' ? (
                <img
                  src={referenceImage}
                  alt="Source reference"
                  className="w-full h-full object-cover"
                />
              ) : null}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-purple-950/60 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  Ready for Image-to-Image & Upscaling
                </p>
                {isAnalyzing && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 animate-pulse">
                    Vision Scanning...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complexion & attire guardian is automatically protecting your subject
              </p>

              {/* Instant Upscale Shortcuts */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={isUpscaling}
                  onClick={() => onTriggerUpscale(2, 'face_revamp')}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Upscale 2X resolution with face clarity revamp"
                >
                  <Maximize2 className="w-3 h-3 text-purple-700" />
                  Upscale 2X HD
                </button>
                <button
                  type="button"
                  disabled={isUpscaling}
                  onClick={() => onTriggerUpscale(4, 'ultra_sharp')}
                  className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Upscale 4X resolution (Super-Resolution 4K)"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Upscale 4X Ultra-HD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTER & ATTIRE IDENTITY GUARDIAN */}
      {referenceImage && (
        <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-purple-50/40 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  Character & Attire Guardian
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    ANTI-WHITEWASH ACTIVE
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Guarantees subject complexion and exact attire remain unchanged
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomizingLocks(!isCustomizingLocks)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg hover:bg-emerald-100/80 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isCustomizingLocks ? 'Hide Details' : 'Fine-Tune'}
            </button>
          </div>

          {/* Biometric Analysis Status / Identity Guarantee */}
          {isAnalyzing ? (
            <div className="flex items-center gap-2.5 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-bold block">Extracting Biometric Likeness...</span>
                <span className="text-[11px] text-amber-800 block">Analyzing facial geometry, skin tone, hair, and clothing with Vision AI...</span>
              </div>
            </div>
          ) : analyzedProfile ? (
            <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Biometric Likeness & Identity Locked
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  High Fidelity
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-900">
                <div className="truncate"><span className="font-semibold text-emerald-950">Tone:</span> {analyzedProfile.ethnicityAndComplexion || 'Authentic complexion'}</div>
                <div className="truncate"><span className="font-semibold text-emerald-950">Hair:</span> {analyzedProfile.hairStyle || 'Natural style'}</div>
                <div className="truncate"><span className="font-semibold text-emerald-950">Face:</span> {analyzedProfile.facialFeatures || 'Distinctive face'}</div>
                <div className="truncate"><span className="font-semibold text-emerald-950">Attire:</span> {analyzedProfile.attireDescription || 'Reference clothes'}</div>
              </div>
            </div>
          ) : null}

          {/* Complexion & Skin Tone Lock Card */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  Skin Tone & Complexion Lock
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Universal Match
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !lockComplexion;
                  onLockComplexionChange(next);
                  onNotice?.(next ? 'Complexion lock active.' : 'Complexion lock disabled.');
                }}
                className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                  lockComplexion ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
                title={lockComplexion ? 'Complexion locked: will preserve exact skin tone' : 'Complexion unlocked'}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white block absolute top-0.75 transition-transform shadow-xs ${
                  lockComplexion ? 'left-4.5' : 'left-0.75'
                }`} />
              </button>
            </div>

            {lockComplexion && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={complexionText}
                    onChange={(e) => onComplexionTextChange(e.target.value)}
                    placeholder="e.g. Maintain exact skin tone, natural undertones, and facial structure from reference photo"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <VoicePromptButton
                    onTranscript={(spokenText, mode) => {
                      if (mode === 'replace') {
                        onComplexionTextChange(spokenText);
                      } else {
                        onComplexionTextChange(complexionText ? `${complexionText}, ${spokenText}` : spokenText);
                      }
                    }}
                    onNotice={onNotice}
                    placeholder="Describe complexion or skin tone..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-medium">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (analyzedProfile?.ethnicityAndComplexion) {
                        onComplexionTextChange(analyzedProfile.ethnicityAndComplexion);
                      } else {
                        onComplexionTextChange('Warm natural skin tone with authentic undertones and facial structure');
                      }
                    }}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-medium border border-emerald-200 transition-colors"
                  >
                    Match Reference (Analyzed)
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplexionTextChange('Warm golden caramel skin tone with natural undertones and authentic facial features')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Warm Caramel
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplexionTextChange('Deep rich bronze skin with warm undertones and natural facial features')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Deep Bronze
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplexionTextChange('Fair porcelain complexion with natural warm undertones and authentic facial features')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Fair / Porcelain
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplexionTextChange('Warm olive skin tone with natural undertones and authentic facial features')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Warm Olive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attire & Outfit Lock Card */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  Attire & Outfit Lock
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Same Exact Clothes
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !lockAttire;
                  onLockAttireChange(next);
                  onNotice?.(next ? 'Attire lock active: clothes will remain identical.' : 'Attire lock disabled.');
                }}
                className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                  lockAttire ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
                title={lockAttire ? 'Attire locked: outfit will not change' : 'Attire unlocked'}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white block absolute top-0.75 transition-transform shadow-xs ${
                  lockAttire ? 'left-4.5' : 'left-0.75'
                }`} />
              </button>
            </div>

            {lockAttire && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={attireText}
                    onChange={(e) => onAttireTextChange(e.target.value)}
                    placeholder="e.g. Keep exact outfit, fabrics, colors, neckline, and collar completely identical to reference image"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <VoicePromptButton
                    onTranscript={(spokenText, mode) => {
                      if (mode === 'replace') {
                        onAttireTextChange(spokenText);
                      } else {
                        onAttireTextChange(attireText ? `${attireText}, ${spokenText}` : spokenText);
                      }
                    }}
                    onNotice={onNotice}
                    placeholder="Describe attire or clothing changes..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-medium">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (analyzedProfile?.attireDescription) {
                        onAttireTextChange(analyzedProfile.attireDescription);
                      } else {
                        onAttireTextChange('Maintain 100% exact identical attire, garments, fabric colors, and outfit from reference image without alteration');
                      }
                    }}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-medium border border-emerald-200 transition-colors"
                  >
                    Keep Exact Outfit (Analyzed)
                  </button>
                  <button
                    type="button"
                    onClick={() => onAttireTextChange('Identical casual top, pants/jeans, exact colors, fabric, and styling from reference photo')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Casual Outfit
                  </button>
                  <button
                    type="button"
                    onClick={() => onAttireTextChange('Identical tailored suit jacket and blouse, same buttons, collar and color from reference photo')}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-medium border border-slate-200 transition-colors"
                  >
                    Tailored Blazer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Facial Likeness Lock */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-950">
                Facial Identity & Likeness Lock
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !faceLock;
                onFaceLockChange(next);
                onNotice?.(next ? 'Face likeness locked.' : 'Face likeness unlocked.');
              }}
              className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                faceLock ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
              title={faceLock ? 'Face locked: facial identity will not change' : 'Face unlocked'}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white block absolute top-0.75 transition-transform shadow-xs ${
                faceLock ? 'left-4.5' : 'left-0.75'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Editing Modes Tabs */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Editing Goal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onEditModeChange('background_change')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              editMode === 'background_change'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-700" />
            Background
          </button>
          <button
            type="button"
            onClick={() => onEditModeChange('scene_change')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              editMode === 'scene_change'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-700" />
            Scene & Mood
          </button>
          <button
            type="button"
            onClick={() => onEditModeChange('posture_change')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              editMode === 'posture_change'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            Body Posture
          </button>
          <button
            type="button"
            onClick={() => onEditModeChange('face_revamp')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              editMode === 'face_revamp'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5 text-purple-700" />
            Face Revamp
          </button>
        </div>
      </div>

      {/* Preset Suggestions for the Active Edit Mode */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">
            Quick {editMode.replace('_', ' ')} Inspirations:
          </span>
          <span className="text-[11px] text-slate-400">Click to apply to prompt</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS[editMode]?.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onPromptSelect(p.prompt)}
              className="text-xs px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 font-medium rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs transition-colors flex items-center gap-1"
            >
              <span>{p.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
