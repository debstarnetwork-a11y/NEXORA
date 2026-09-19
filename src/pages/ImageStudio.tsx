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
  HelpCircle,
  Database,
  ShieldCheck,
  Upload,
  Maximize2,
  Mic
} from 'lucide-react';
import { useAppStore } from '../store';
import { ImageHistoryItem, ImageEditMode, CharacterAnalysis } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { insertSupabaseImageHistory, fetchSupabaseImageHistory, isSupabaseConfigured } from '../lib/supabase';
import { puterGenerateImage } from '../lib/puter';
import { enhancePromptWithAI } from '../lib/promptEnhancer';
import { upscaleImage } from '../lib/upscaler';
import { VoicePromptButton } from '../components/VoicePromptButton';
import { ImageEditControls } from '../components/ImageEditControls';
import { PortalExitButton } from '../components/PortalExitButton';
import { 
  loadHistoryFromStorage, 
  persistHistoryToStorage, 
  deleteHistoryItemFromStorage, 
  clearAllHistoryFromStorage 
} from '../lib/imageStorage';

const DEFAULT_NEGATIVE_PROMPT = 'split screen, side by side, two in one, comparison, before and after, diptych, triptych, collage, grid, multiple panels, dual image, split view, multiple angles, photo grid, collage frame, border divider, two people comparison, blurry, out of focus, low quality, deformed hands, extra fingers, missing fingers, mutated hands, bad anatomy, bad eyes, crossed eyes, disfigured, distorted face, low resolution, ugly, artifacts, watermark';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITIES = ['1K (High-Definition)', '2K (Ultra-Sharp)', '4K (Maximum Crisp)'];
const MODELS = [
  { label: 'Gemini 3.1 Flash Image', value: 'gemini-3.1-flash-image' },
  { label: 'Gemini 3 Pro Image', value: 'gemini-3-pro-image' },
  { label: 'FLUX.1 Schnell (Ultra-Sharp)', value: 'puter-flux' },
  { label: 'GPT-Image 2 (Photorealistic)', value: 'puter-gpt-image' },
  { label: 'FLUX.1 High-Definition (Serverless)', value: 'pollinations-flux' },
  { label: 'FLUX.1 Schnell (Together AI)', value: 'together-flux' },
  { label: 'FLUX.1 Schnell (Hugging Face)', value: 'huggingface-flux' },
  { label: 'FLUX.1 [dev] (Replicate)', value: 'replicate-flux-dev' },
  { label: 'AI Vision General', value: 'puter-image' }
];

const STYLES = [
  { label: 'Nexora Vision Pro (Photorealistic Masterpiece)', value: 'Nexora Vision Pro' },
  { label: 'Nexora Pixar 3D (Disney Pixar 3D Animation)', value: 'Nexora Pixar 3D' },
  { label: 'Nexora Hand-Sketch (Pencil & Charcoal Sketchbook)', value: 'Nexora Hand-Sketch' },
  { label: 'Nexora Studio XL (Hasselblad Studio 100MP)', value: 'Nexora Studio XL' },
  { label: 'Nexora Cinematic (35mm Anamorphic Film)', value: 'Nexora Cinematic' },
  { label: 'Nexora Watercolor Artistry (Fluid Pigment & Paper)', value: 'Nexora Watercolor Artistry' },
  { label: 'Nexora Cyberpunk Neon (Futuristic Sci-Fi Glow)', value: 'Nexora Cyberpunk Neon' },
  { label: 'Nexora Oil Painting Masterpiece (Impasto Canvas)', value: 'Nexora Oil Painting Masterpiece' },
  { label: 'Nexora Claymation (Tactile Stop-Motion Clay)', value: 'Nexora Claymation' },
  { label: 'Nexora 3D Papercraft (Layered Origami Sculpture)', value: 'Nexora 3D Papercraft' },
  { label: 'Nexora Architectural Concept (Modernist Structure)', value: 'Nexora Architectural Concept' },
  { label: 'Nexora Film Noir (Vintage Dramatic Shadows)', value: 'Nexora Film Noir' },
  { label: 'Nexora Polaroid (Retro Instant Film Grain)', value: 'Nexora Polaroid' },
  { label: 'Nexora Animate Cartoon (Vibrant 2D/3D Animation)', value: 'Nexora Animate Cartoon' },
  { label: 'Nexora Stick Cartoon (Minimalist Line Doodle)', value: 'Nexora Stick Cartoon' },
  { label: 'Nexora Digital Art (Sharp Concept Illustration)', value: 'Nexora Digital Art' },
  { label: 'Nexora Anime High-Res (Makoto Shinkai Crisp)', value: 'Nexora Anime High-Res' },
  { label: 'Nexora Vision Fast (Crisp Dynamic)', value: 'Nexora Vision Fast' },
  { label: 'Nexora Vision Lite (Clean Fast Rendering)', value: 'Nexora Vision Lite' }
];

const getStylePromptModifier = (styleName: string, antiDef: boolean = true): string => {
  switch (styleName) {
    case 'Nexora Vision Pro':
      return ', single unified frame, photorealistic masterpiece, 8k uhd, razor-sharp focus, symmetrical facial features, accurate anatomy, natural skin pores, cinematic volumetric lighting, no split screen, no side by side';
    case 'Nexora Pixar 3D':
      return ', single unified character frame, iconic Disney Pixar 3D animation style, adorable expressive character design, soft subsurface skin scattering, large soulful expressive eyes, smooth 3D CGI rendering, charming lighting, RenderMan quality, vibrant rich color palette, no split screen, no side by side, no comparison';
    case 'Nexora Hand-Sketch':
      return ', single unified frame, authentic hand-drawn graphite pencil sketch, delicate charcoal shading, fine cross-hatching line art, textured vintage sketchbook paper grain, artist pencil drawing illustration, hand-sketched masterpiece, no split screen, no side by side';
    case 'Nexora Watercolor Artistry':
      return ', single unified frame, ethereal watercolor painting, fluid translucent color washes, wet-on-wet paint bleeds, visible rough cold-press watercolor paper texture, delicate ink linework accents, fine art watercolor illustration, no split screen, no side by side';
    case 'Nexora Cyberpunk Neon':
      return ', single unified frame, futuristic cyberpunk aesthetic, high-tech neon lighting, glowing holographic reflections, rain-slicked dark cyber metropolis, vivid magenta and cyan backlight, detailed futuristic cyber gear, cinematic atmosphere, no split screen, no side by side';
    case 'Nexora Oil Painting Masterpiece':
      return ', single unified frame, classical oil painting on canvas, thick impasto palette knife textures, rich buttery paint strokes, Rembrandt chiaroscuro lighting, deep luminous colors, museum fine art masterpiece, no split screen, no side by side';
    case 'Nexora Claymation':
      return ', single unified frame, handcrafted claymation aesthetic, tactile plasticine clay character modeling, charming stop-motion animation look, studio macro lighting, subtle artisan clay fingerprint textures, miniature diorama setting, no split screen, no side by side';
    case 'Nexora 3D Papercraft':
      return ', single unified frame, intricate layered papercraft art, 3D folded origami sculpture, delicate multi-layered paper cutouts, depth shadowbox lighting, clean geometric paper folds, tactile craft paper textures, no split screen, no side by side';
    case 'Nexora Architectural Concept':
      return ', single unified frame, clean modernist architectural visualization, precise structural lines, warm natural ambient daylight, minimalist spatial composition, photorealistic building materials and glass reflections, no split screen, no side by side';
    case 'Nexora Studio XL':
      return ', single unified frame, professional studio photography, medium format 100MP camera, sharp focal plane, perfect lighting, crisp textures, ultra-detailed, no split screen, no side by side';
    case 'Nexora Cinematic':
      return ', single unified frame, 35mm anamorphic movie still, cinematic film grading, crystal clear focal point, 8k resolution, photorealism, high dynamic range, no split screen, no side by side';
    case 'Nexora Film Noir':
      return ', single unified frame, classic 1940s film noir style, dramatic black and white chiaroscuro lighting, deep mysterious shadows, moody venetian blind highlights, vintage 35mm monochrome film grain, atmospheric cinematic composition, no split screen, no side by side';
    case 'Nexora Polaroid':
      return ', single unified frame, vintage polaroid 600 instant photograph, authentic analog color grading, soft flash illumination, warm faded nostalgic tones, subtle chemical light leak, 1980s retro snapshot aesthetic, no split screen, no side by side';
    case 'Nexora Animate Cartoon':
      return ', single character, single unified image, vibrant animated cartoon style, playful whimsical character illustration, crisp clean outlines, expressive dynamic poses, smooth cel shading, colorful animated feature film aesthetic, no split screen, no side by side, no comparison, no collage';
    case 'Nexora Stick Cartoon':
      return ', single isolated character, single unified frame, pure minimalist stick figure cartoon drawing, simple black stick figure line art, clean expressive doodle illustration, solid plain white background, humorous hand-drawn comic style, uncluttered vector lines, single panel only, no real photograph, no side by side comparison, no split screen, no two images, no collage';
    case 'Nexora Digital Art':
      return ', single unified frame, high-end digital concept art, sharp detailed lines, vibrant atmospheric lighting, intricate details, trending on artstation, no split screen, no side by side';
    case 'Nexora Anime High-Res':
      return ', single unified frame, Makoto Shinkai anime aesthetic, high-resolution modern anime illustration, lush detailed backgrounds, gorgeous sky and cloud lighting, clean anime cel shading, vibrant colors, no split screen, no side by side';
    case 'Nexora Vision Fast':
      return ', single unified frame, highly detailed, sharp focus, dynamic composition, 8k resolution, clear lighting, no split screen, no side by side';
    case 'Nexora Vision Lite':
      return ', single unified frame, clean and crisp digital rendering, natural balanced daylight, sharp lines, light uncluttered composition, smooth textures, no split screen, no side by side';
    default:
      if (antiDef) {
        return ', single unified frame, ultra-sharp focus, pristine 8k resolution, symmetrical face, clear eyes, anatomically correct hands and fingers, highly detailed texture, professional photography, no split screen, no side by side';
      }
      return ', single unified frame, no split screen, no side by side';
  }
};

export function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('1K (High-Definition)');
  const [model, setModel] = useState('gemini-3.1-flash-image');
  const [style, setStyle] = useState('Nexora Vision Pro');
  const [antiDeformation, setAntiDeformation] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Image-to-Image, Editing, Face Lock & Upscaling State
  const [generationMode, setGenerationMode] = useState<'text2img' | 'img2img'>('text2img');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<ImageEditMode>('background_change');
  const [faceLock, setFaceLock] = useState(true);
  const [lockComplexion, setLockComplexion] = useState(true);
  const [complexionText, setComplexionText] = useState('Maintain exact skin tone, natural undertones, and facial structure from reference photo');
  const [lockAttire, setLockAttire] = useState(true);
  const [attireText, setAttireText] = useState('Maintain 100% exact identical attire, garments, fabric colors, and outfit from reference image without alteration');
  const [characterProfile, setCharacterProfile] = useState<CharacterAnalysis | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);

  // IndexedDB Image History State (unlimited quota, no 5MB localStorage crashes)
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHistoryItem, setActiveHistoryItem] = useState<ImageHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const { saveImage } = useAppStore();

  useEffect(() => {
    if (referenceImage && model.startsWith('gemini')) {
      setModel('puter-flux');
      setWarning('Switched to FLUX.1 model because Gemini does not support Image-to-Image editing.');
    }
  }, [referenceImage, model]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const handleLoadForEdit = (imageUrl: string, initialPrompt?: string) => {
    setReferenceImage(imageUrl);
    setGenerationMode('img2img');
    setActiveTab('studio');
    setFaceLock(true);
    setLockComplexion(true);
    setLockAttire(true);
    setCharacterProfile(null);
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt);
    }
    showToast('Loaded into Edit Studio! Locking biometric facial features & attire...');
  };

  const handleTriggerUpscale = async (factor: 2 | 4, mode: 'balanced' | 'face_revamp' | 'ultra_sharp') => {
    const targetImage = referenceImage || generatedImage;
    if (!targetImage) {
      showToast('Please upload or select an image to upscale.');
      return;
    }
    setIsUpscaling(true);
    try {
      showToast(`Upscaling image ${factor}X with ${mode === 'face_revamp' ? 'Face Clarity Revamp' : 'Super-Resolution'}...`);
      const result = await upscaleImage(targetImage, { factor, mode });

      const upscaledItem: ImageHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        imageUrl: result.dataUrl,
        prompt: prompt ? `[${factor}X Upscaled & Face Revamped] ${prompt}` : `[${factor}X Super-Resolution Upscaled Image]`,
        aspectRatio: `${result.upscaledWidth}:${result.upscaledHeight}`,
        quality: factor === 4 ? '4K (Maximum Crisp)' : '2K (Ultra-Sharp)',
        model: 'Nexora Super-Resolution Engine',
        style: 'Ultra-HD Revamp',
        timestamp: Date.now(),
        referenceImageUrl: targetImage,
        isUpscaled: true
      };

      setGeneratedImage(result.dataUrl);
      setActiveHistoryItem(upscaledItem);
      persistHistory([upscaledItem, ...history.filter(h => h.id !== upscaledItem.id)].slice(0, 50));
      showToast(`Successfully upscaled to ${result.upscaledWidth}×${result.upscaledHeight} in ${result.durationMs}ms!`);
    } catch (err: any) {
      console.error('Upscale error:', err);
      showToast(`Upscaling failed: ${err.message}`);
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancingPrompt) {
      showToast('Type a prompt description first to enhance it!');
      return;
    }
    setIsEnhancingPrompt(true);
    try {
      showToast('Enhancing prompt with cinematic composition and lighting...');
      const enhanced = await enhancePromptWithAI(prompt, style);
      if (enhanced) {
        setPrompt(enhanced);
        showToast('Prompt expanded with studio-grade details!');
      }
    } catch (err) {
      console.warn('Enhancement failed:', err);
      // Fallback manual enhancement
      const base = prompt.trim().replace(/,\s*(masterpiece|8k|sharp focus|ultra-detailed|photorealistic).*$/i, '');
      setPrompt(`${base}, masterpiece photograph, 8k resolution, razor-sharp focus, symmetrical clear eyes, anatomically correct hands, cinematic lighting, crisp details`);
      showToast('Prompt upgraded with high-detail filters!');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Persist updated history asynchronously to IndexedDB (safe from quota errors)
  const persistHistory = (updatedHistory: ImageHistoryItem[]) => {
    setHistory(updatedHistory);
    persistHistoryToStorage(updatedHistory).catch((err) => {
      console.warn('Failed to persist history to local storage:', err);
    });
  };

  // Load history from IndexedDB and sync from Supabase on component mount
  useEffect(() => {
    loadHistoryFromStorage().then((storedItems) => {
      if (storedItems && storedItems.length > 0) {
        setHistory(storedItems);
      }
    }).catch((err) => {
      console.warn('Initial history load warning:', err);
    });

    if (isSupabaseConfigured) {
      fetchSupabaseImageHistory().then((cloudItems) => {
        if (cloudItems && cloudItems.length > 0) {
          setHistory((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const toAdd = cloudItems.filter((c) => !existingIds.has(c.id));
            if (toAdd.length === 0) return prev;
            const merged = [...toAdd, ...prev].slice(0, 100);
            persistHistoryToStorage(merged);
            return merged;
          });
        }
      }).catch((err) => {
        console.warn('Supabase cloud history load notice:', err);
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

    // Ensure biometric identity analysis is available before starting generation
    let activeProfile = characterProfile;
    if (referenceImage && (!activeProfile || !activeProfile.strictPreservationPrompt)) {
      showToast('Locking character biometric identity & facial features...');
      try {
        const res = await fetch('/api/analyze-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: referenceImage })
        });
        if (res.ok) {
          const profile = await res.json();
          setCharacterProfile(profile);
          activeProfile = profile;
          if (profile.ethnicityAndComplexion && (!complexionText || complexionText.includes('Maintain exact'))) {
            setComplexionText(profile.ethnicityAndComplexion);
          }
          if (profile.attireDescription && (!attireText || attireText.includes('Maintain 100%'))) {
            setAttireText(profile.attireDescription);
          }
        }
      } catch (err) {
        console.warn('Pre-generation biometric scan error:', err);
      }
    }

    const tryGenerate = async (targetModel: string): Promise<string> => {
      const resolvedComplexion = (lockComplexion && activeProfile?.ethnicityAndComplexion && (!complexionText || complexionText.includes('Maintain exact')))
        ? activeProfile.ethnicityAndComplexion
        : complexionText;

      const resolvedAttire = (lockAttire && activeProfile?.attireDescription && (!attireText || attireText.includes('Maintain 100%')))
        ? activeProfile.attireDescription
        : attireText;

      if (targetModel.startsWith('puter-')) {
        let puterModel = 'black-forest-labs/flux-schnell';
        if (targetModel === 'puter-flux') puterModel = 'black-forest-labs/flux-schnell';
        else if (targetModel === 'puter-gpt-image') puterModel = 'black-forest-labs/flux-schnell';

        const styleModifier = getStylePromptModifier(currentStyle, antiDeformation);

        return await puterGenerateImage(currentPrompt, {
          model: puterModel,
          aspectRatio: currentAspectRatio,
          quality: currentQuality,
          antiDeformation: antiDeformation,
          referenceImage: referenceImage || null,
          editMode: referenceImage ? editMode : null,
          faceLock: faceLock,
          lockComplexion: lockComplexion,
          complexionLock: resolvedComplexion,
          lockAttire: lockAttire,
          attireLock: resolvedAttire,
          facialFeatures: activeProfile?.facialFeatures,
          hairStyle: activeProfile?.hairStyle,
          strictPreservationPrompt: activeProfile?.strictPreservationPrompt,
          styleModifier
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
            model: targetModel, 
            style: currentStyle,
            antiDeformation: antiDeformation,
            referenceImage: referenceImage || null,
            editMode: referenceImage ? editMode : null,
            faceLock: faceLock,
            lockComplexion: lockComplexion,
            complexionLock: resolvedComplexion,
            lockAttire: lockAttire,
            attireLock: resolvedAttire,
            facialFeatures: activeProfile?.facialFeatures,
            hairStyle: activeProfile?.hairStyle,
            strictPreservationPrompt: activeProfile?.strictPreservationPrompt
          })
        });

        const data = await response.json();
        if (response.ok && data.imageUrl) {
          if (data.warning) setWarning(data.warning);
          return data.imageUrl;
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      }
    };

    try {
      // Build priority fallback chain based on selected model
      const reliableEngines = referenceImage
        ? ['puter-flux', 'pollinations-flux', 'pollinations-turbo', 'puter-gpt-image']
        : ['puter-flux', 'pollinations-flux', 'pollinations-turbo', 'puter-gpt-image'];
      const executionChain = [currentModel, ...reliableEngines.filter(m => m !== currentModel)];

      let finalImageUrl = '';
      let usedModel = currentModel;
      let lastError: any = null;

      for (let i = 0; i < executionChain.length; i++) {
        const candidateModel = executionChain[i];
        try {
          if (i > 0) {
            showToast(`Connecting to backup engine (${getModelShortLabel(candidateModel)})...`);
          }
          finalImageUrl = await tryGenerate(candidateModel);
          if (finalImageUrl) {
            usedModel = candidateModel;
            if (i > 0) {
              setWarning(`Switched to backup engine (${getModelShortLabel(candidateModel)}) to fulfill request.`);
            }
            break;
          }
        } catch (err: any) {
          console.warn(`Engine ${candidateModel} failed:`, err);
          lastError = err;
        }
      }

      if (!finalImageUrl) {
        throw lastError || new Error('All image engines are currently busy. Please try again in a moment.');
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
          model: usedModel,
          style: currentStyle,
          timestamp: Date.now(),
          referenceImageUrl: referenceImage || undefined,
          editMode: referenceImage ? editMode : undefined,
          faceLock: referenceImage ? faceLock : undefined,
          lockComplexion: referenceImage ? lockComplexion : undefined,
          complexionLock: referenceImage && lockComplexion ? complexionText : undefined,
          lockAttire: referenceImage ? lockAttire : undefined,
          attireLock: referenceImage && lockAttire ? attireText : undefined
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
        if (finalImageUrl && finalImageUrl.trim() !== '') {
          img.src = finalImageUrl;
        } else {
          onFinish();
        }
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
      showToast('Preparing download...');
      
      let downloadUrl = imageUrl;
      let isObjectUrl = false;
      
      if (!imageUrl.startsWith('data:')) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        downloadUrl = window.URL.createObjectURL(blob);
        isObjectUrl = true;
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nexora-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (isObjectUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
      showToast('Image download started');
    } catch (e) {
      console.error('Failed to download directly:', e);
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `nexora-${Date.now()}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
    deleteHistoryItemFromStorage(id);
    if (activeHistoryItem?.id === id) {
      setActiveHistoryItem(null);
    }
    showToast('Removed from history');
  };

  const handleClearAllHistory = () => {
    persistHistory([]);
    clearAllHistoryFromStorage();
    setActiveHistoryItem(null);
    setIsClearModalOpen(false);
    showToast('Generation history cleared');
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
      if (modelVal === 'puter-image') return 'AI Vision General';
      if (modelVal === 'pollinations-flux') return 'FLUX.1 HD';
      if (modelVal === 'pollinations-turbo') return 'SDXL Turbo';
      if (modelVal === 'huggingface-flux') return 'FLUX.1 (HF)';
      if (modelVal === 'together-flux') return 'FLUX.1 (Together)';
      if (modelVal.startsWith('gemini')) return found.label.replace(/\s*\(.*\)/, '');
      return found.label.split(' - ')[0];
    }
    return modelVal;
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <PortalExitButton portalName="Image Studio" />
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Image Studio
            </h2>
            <p className="text-slate-500 mt-1">
              Create high-fidelity visuals • Prompts and results automatically saved locally
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

                  {/* Mode Selector: Text-to-Image vs Edit / Img2Img & Upscale */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('text2img')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        generationMode === 'text2img' && !referenceImage
                          ? 'bg-white text-purple-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5 text-purple-700" />
                      Text to Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('img2img')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        generationMode === 'img2img' || referenceImage
                          ? 'bg-white text-purple-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
                      Edit & Upscale (Img2Img)
                      {referenceImage && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </button>
                  </div>

                  {/* Dedicated Image-to-Image, Editing & Upscaling Panel */}
                  {(generationMode === 'img2img' || referenceImage) && (
                    <ImageEditControls
                      referenceImage={referenceImage}
                      onReferenceImageChange={setReferenceImage}
                      editMode={editMode}
                      onEditModeChange={setEditMode}
                      faceLock={faceLock}
                      onFaceLockChange={setFaceLock}
                      lockComplexion={lockComplexion}
                      onLockComplexionChange={setLockComplexion}
                      complexionText={complexionText}
                      onComplexionTextChange={setComplexionText}
                      lockAttire={lockAttire}
                      onLockAttireChange={setLockAttire}
                      attireText={attireText}
                      onAttireTextChange={setAttireText}
                      onPromptSelect={(presetPrompt) => setPrompt(presetPrompt)}
                      onTriggerUpscale={handleTriggerUpscale}
                      isUpscaling={isUpscaling}
                      onNotice={showToast}
                      onAnalysisComplete={setCharacterProfile}
                    />
                  )}
                  
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

                  {referenceImage && model.startsWith('gemini') && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">
                        Gemini models do not support structural Image-to-Image editing. It will generate a new image based on your prompt, ignoring the visual structure of your reference image. To preserve the character or scene layout, please select <span className="font-bold text-amber-900">FLUX.1 Schnell (Ultra-Sharp)</span> or <span className="font-bold text-amber-900">FLUX.1 [dev] (Replicate)</span> instead.
                      </span>
                    </div>
                  )}

                  {/* Quick Style Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">Popular:</span>
                    {[
                      { label: '🌟 Pixar 3D', val: 'Nexora Pixar 3D' },
                      { label: '✏️ Hand-Sketch', val: 'Nexora Hand-Sketch' },
                      { label: '💧 Watercolor', val: 'Nexora Watercolor Artistry' },
                      { label: '⚡ Cyberpunk', val: 'Nexora Cyberpunk Neon' },
                      { label: '🎨 Oil Painting', val: 'Nexora Oil Painting Masterpiece' },
                      { label: '🧱 Claymation', val: 'Nexora Claymation' },
                      { label: '📐 Architecture', val: 'Nexora Architectural Concept' },
                      { label: '📸 Vision Pro', val: 'Nexora Vision Pro' },
                      { label: '🎬 Cinematic', val: 'Nexora Cinematic' },
                      { label: '🌸 Anime', val: 'Nexora Anime High-Res' },
                    ].map((chip) => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => {
                          setStyle(chip.val);
                          showToast(`Style set to: ${chip.val}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium text-[11px] shrink-0 transition-all cursor-pointer ${
                          style === chip.val
                            ? 'bg-purple-900 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        {referenceImage ? 'Editing Instructions & Desired Changes' : 'Prompt'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        {/* Voice Prompt Dictation with live transcription */}
                        <VoicePromptButton
                          onTranscript={(spokenText, mode) => {
                            if (mode === 'replace') {
                              setPrompt(spokenText);
                            } else {
                              setPrompt((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                            }
                          }}
                          onNotice={showToast}
                          disabled={isGenerating || isImageLoading}
                        />

                        <button 
                          type="button"
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancingPrompt || isGenerating}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 border border-purple-200/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                          title="Expand prompt with professional lighting, camera lens, and photographic details"
                        >
                          {isEnhancingPrompt ? (
                            <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          )}
                          {isEnhancingPrompt ? 'Enhancing...' : 'AI Enhance'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsTipsModalOpen(true)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-1"
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
                        {referenceImage ? 'Transforming & Editing...' : 'Generating & Saving...'}
                      </>
                    ) : (
                      <>
                        {referenceImage ? <SlidersHorizontal className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                        {referenceImage 
                          ? (editMode === 'scene_change' ? 'Transform Scene (Face Locked)'
                            : editMode === 'background_change' ? 'Change Background (Face Locked)'
                            : editMode === 'posture_change' ? 'Change Posture (Face Locked)'
                            : editMode === 'face_revamp' ? 'Revamp & Sharpen Face'
                            : 'Transform Image (Face Locked)')
                          : 'Generate Image'
                        }
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
                  ) : (generatedImage && generatedImage.trim() !== '') ? (
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
                          onClick={() => handleLoadForEdit(generatedImage, prompt)}
                          className="px-3.5 py-3 bg-purple-900 text-white shadow-lg text-xs font-bold rounded-xl hover:bg-purple-800 transition-colors flex items-center gap-1.5"
                          title="Edit Image: Change scene, background, posture or upscale while locking face"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Edit & Upscale</span>
                        </button>
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
                                  showToast('Switched to FLUX.1 Schnell (Ultra-Sharp)');
                                }}
                                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Try FLUX.1 Schnell
                              </button>
                            )}

                            {model !== 'puter-gpt-image' && (
                              <button
                                onClick={() => {
                                  setModel('puter-gpt-image');
                                  setError(null);
                                  showToast('Switched to GPT-Image 2 (Photorealistic)');
                                }}
                                className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                Try GPT-Image 2
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

                            {model !== 'huggingface-flux' && (
                              <button
                                onClick={() => {
                                  setModel('huggingface-flux');
                                  setError(null);
                                  showToast('Switched to FLUX.1 Schnell (Hugging Face)');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                              >
                                Try Hugging Face
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
                        {item.imageUrl && item.imageUrl.trim() !== '' ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.prompt} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadForEdit(item.imageUrl, item.prompt);
                            }}
                            title="Edit & Upscale this image"
                            className="p-1.5 bg-purple-900 text-white rounded-md hover:bg-purple-800 transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
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
                    {item.imageUrl && item.imageUrl.trim() !== '' ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.prompt} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}
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
                        onClick={() => handleLoadForEdit(item.imageUrl, item.prompt)}
                        className="p-2.5 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-colors shadow-md"
                        title="Edit & Upscale image in Studio"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
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

                      {/* Locks indicators */}
                      {(item.lockComplexion || item.lockAttire || item.faceLock) && (
                        <div className="flex flex-wrap items-center gap-1 mb-2.5">
                          {item.lockComplexion && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              🛡️ Complexion Locked
                            </span>
                          )}
                          {item.lockAttire && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              👗 Attire Preserved
                            </span>
                          )}
                          {item.faceLock && (
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              👤 Face Locked
                            </span>
                          )}
                        </div>
                      )}

                      {/* Model badge */}
                      <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 w-fit mb-4 font-mono truncate max-w-full">
                        {getModelShortLabel(item.model)}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleLoadForEdit(item.imageUrl, item.prompt)}
                        className="py-2 px-2.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        title="Edit scenes, background, posture or upscale this image"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Edit & Upscale
                      </button>

                      <button
                        onClick={() => handleRestoreHistoryItem(item)}
                        className="flex-1 py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reuse
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

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
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
                  onClick={() => {
                    handleLoadForEdit(zoomedImage, prompt);
                    setZoomedImage(null);
                  }}
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Edit & Upscale"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Edit & Upscale
                </button>
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

              {zoomedImage && zoomedImage.trim() !== '' ? (
                <img 
                  src={zoomedImage} 
                  alt="High-Res Inspection" 
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" 
                />
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

