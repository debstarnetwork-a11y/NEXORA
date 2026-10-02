import { useState, useEffect, useMemo, useRef, MouseEvent } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Save, 
  Wand2, 
  Loader2, 
  Sparkles, 
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
  Upload
} from 'lucide-react';
import { useAppStore } from '../store';
import { ImageHistoryItem, ImageEditMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { insertSupabaseImageHistory, fetchSupabaseImageHistory, isSupabaseConfigured } from '../lib/supabase';
import { puterGenerateImage } from '../lib/puter';
import { upscaleImage } from '../lib/upscaler';
import { VoicePromptButton } from '../components/VoicePromptButton';
import { PortalExitButton } from '../components/PortalExitButton';
import { 
  loadHistoryFromStorage, 
  persistHistoryToStorage, 
  deleteHistoryItemFromStorage, 
  clearAllHistoryFromStorage 
} from '../lib/imageStorage';

const DEFAULT_NEGATIVE_PROMPT = 'closed eyes, squinting, squinting eyes, half-closed eyes, shut eyes, blinking, sleepy eyes, distorted eyes, asymmetrical eyes, droopy eyelids, cross-eyed, sunglasses, sun glare squint, unnatural smile, forced expression, altered facial features, face drift, wrong face, different person, blurry background, blurry face, out of focus background, artificial haze, soft focus, split screen, side by side, two in one, comparison, before and after, diptych, triptych, collage, grid, multiple panels, dual image, split view, multiple angles, picture in picture, photo within photo, inset photo, framed photo of person, image inside image, second photo, duplicate person, clone, twin, two people, extra person, second person, multiple people, multiple depictions of person, deformed hands, extra fingers, missing fingers, mutated hands, bad anatomy, bad eyes, disfigured, distorted face, low resolution, ugly, artifacts, watermark';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITIES = ['1K', '2K', '4K'];

const MODELS = [
  { label: 'FLUX.1 Schnell', value: 'puter-flux' },
  { label: 'GPT-Image 2', value: 'puter-gpt-image' },
  { label: 'Gemini 3.1 Flash Image', value: 'gemini-3.1-flash-image' },
  { label: 'Gemini 3 Pro Image', value: 'gemini-3-pro-image' },
  { label: 'FLUX.1 High-Definition', value: 'pollinations-flux' },
  { label: 'FLUX.1 Dev', value: 'replicate-flux-dev' },
  { label: 'Magic Hour Studio', value: 'magic-hour' },
  { label: 'General Vision', value: 'puter-image' }
];

const EDIT_PHOTO_MODELS = [
  { label: 'Gemini 3.1 Flash Image', value: 'gemini-3.1-flash-image' },
  { label: 'Gemini 3 Pro Image', value: 'gemini-3-pro-image' },
  { label: 'FLUX.1 Dev', value: 'replicate-flux-dev' },
  { label: 'Magic Hour Editor', value: 'magic-hour' }
];

const REFERENCE_CAPABLE_MODELS = [
  'gemini-3.1-flash-image',
  'gemini-3-pro-image',
  'replicate-flux-dev',
  'magic-hour'
];

const STYLES = [
  { label: 'Nexora Photorealistic', value: 'Nexora Photorealistic' },
  { label: 'Nexora Studio Portrait', value: 'Nexora Studio Portrait' },
  { label: 'Nexora Cinematic Film', value: 'Nexora Cinematic Film' },
  { label: 'Nexora 3D Animation', value: 'Nexora 3D Animation' },
  { label: 'Nexora Sticker Cartoon', value: 'Nexora Sticker Cartoon' },
  { label: 'Nexora Hand-Drawn Sketch', value: 'Nexora Hand-Drawn Sketch' },
  { label: 'Nexora Watercolor Painting', value: 'Nexora Watercolor Painting' },
  { label: 'Nexora Cyberpunk Neon', value: 'Nexora Cyberpunk Neon' },
  { label: 'Nexora Classical Oil Painting', value: 'Nexora Classical Oil Painting' },
  { label: 'Nexora Claymation Art', value: 'Nexora Claymation Art' },
  { label: 'Nexora Layered Papercraft', value: 'Nexora Layered Papercraft' },
  { label: 'Nexora Architectural Concept', value: 'Nexora Architectural Concept' },
  { label: 'Nexora Film Noir Monochrome', value: 'Nexora Film Noir Monochrome' },
  { label: 'Nexora Retro Polaroid', value: 'Nexora Retro Polaroid' },
  { label: 'Nexora Animated Illustration', value: 'Nexora Animated Illustration' },
  { label: 'Nexora Minimalist Line Art', value: 'Nexora Minimalist Line Art' },
  { label: 'Nexora Digital Concept Art', value: 'Nexora Digital Concept Art' },
  { label: 'Nexora Anime High-Res', value: 'Nexora Anime High-Res' },
  { label: 'Nexora Natural Daylight', value: 'Nexora Natural Daylight' }
];

const getStylePromptModifier = (styleName: string): string => {
  switch (styleName) {
    case 'Photorealistic':
    case 'Nexora Photorealistic':
    case 'Nexora Vision Pro':
      return ', high resolution photograph, natural lighting, sharp focus';
    case 'Studio Portrait':
    case 'Nexora Studio Portrait':
    case 'Nexora Studio XL':
      return ', professional studio portrait lighting, medium format camera, crisp focus';
    case 'Cinematic Film':
    case 'Nexora Cinematic Film':
    case 'Nexora Cinematic':
      return ', 35mm film still, cinematic anamorphic lighting, fine film grain';
    case '3D Animation':
    case 'Nexora 3D Animation':
    case 'Nexora Pixar 3D':
      return ', 3D character animation aesthetic, smooth subsurface rendering, vibrant lighting';
    case 'Sticker Cartoon':
    case 'Nexora Sticker Cartoon':
    case 'Nexora Stick Cartoon':
      return ', cute die-cut vector sticker cartoon, thick white outline border, vibrant flat colors, smooth cel shading, playful character design, isolated sticker graphic on clean background';
    case 'Hand-Drawn Sketch':
    case 'Nexora Hand-Drawn Sketch':
    case 'Nexora Hand-Sketch':
      return ', authentic graphite pencil sketch, delicate shading, textured sketchbook paper';
    case 'Watercolor Painting':
    case 'Nexora Watercolor Painting':
    case 'Nexora Watercolor Artistry':
      return ', watercolor illustration, fluid translucent pigment washes, cold-press paper texture';
    case 'Cyberpunk Neon':
    case 'Nexora Cyberpunk Neon':
      return ', cyberpunk aesthetic, neon lighting, dark city backdrop, high contrast';
    case 'Classical Oil Painting':
    case 'Nexora Classical Oil Painting':
    case 'Nexora Oil Painting Masterpiece':
      return ', fine oil painting on canvas, subtle impasto texture, museum lighting';
    case 'Claymation Art':
    case 'Nexora Claymation Art':
    case 'Nexora Claymation':
      return ', handcrafted plasticine clay modeling, tactile stop-motion animation aesthetic';
    case 'Layered Papercraft':
    case 'Nexora Layered Papercraft':
    case 'Nexora 3D Papercraft':
      return ', layered paper sculpture, clean geometric paper cutouts, soft depth shadows';
    case 'Architectural Concept':
    case 'Nexora Architectural Concept':
      return ', modern architectural rendering, clean structural lines, natural daylight';
    case 'Film Noir Monochrome':
    case 'Nexora Film Noir Monochrome':
    case 'Nexora Film Noir':
      return ', classic monochrome film noir photography, dramatic high-contrast chiaroscuro shadows';
    case 'Retro Polaroid':
    case 'Nexora Retro Polaroid':
    case 'Nexora Polaroid':
      return ', vintage instant film snapshot, warm nostalgic tones, authentic soft flash';
    case 'Animated Illustration':
    case 'Nexora Animated Illustration':
    case 'Nexora Animate Cartoon':
      return ', vibrant 2D animated illustration, clean linework, expressive cel shading';
    case 'Minimalist Line Art':
    case 'Nexora Minimalist Line Art':
      return ', minimalist line art drawing, clean black outlines on plain background';
    case 'Digital Concept Art':
    case 'Nexora Digital Concept Art':
    case 'Nexora Digital Art':
      return ', digital concept artwork, detailed composition, atmospheric lighting';
    case 'Anime High-Res':
    case 'Nexora Anime High-Res':
      return ', high-resolution anime illustration, clean line art, luminous sky and cloud lighting';
    case 'Natural Daylight':
    case 'Nexora Natural Daylight':
    case 'Nexora Vision Lite':
    case 'Nexora Vision Fast':
      return ', natural balanced daylight, crisp details, clean composition';
    default:
      return ', high resolution, sharp focus';
  }
};

export function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('1K');
  const [model, setModel] = useState('puter-flux');
  const [style, setStyle] = useState('Nexora Photorealistic');
  const [antiDeformation] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Mode: Create Image ('text2img') vs Edit Photo ('img2img')
  const [generationMode, setGenerationMode] = useState<'text2img' | 'img2img'>('text2img');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<ImageEditMode>('background_change');
  const [faceLock, setFaceLock] = useState(true);
  const [lockComplexion, setLockComplexion] = useState(true);
  const [lockHairstyle, setLockHairstyle] = useState(true);
  const [lockAttire, setLockAttire] = useState(true);
  const [isUpscaling, setIsUpscaling] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // History State
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
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

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('Image size is too large. Please select an image under 20MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setReferenceImage(result);
        setGenerationMode('img2img');
        if (!EDIT_PHOTO_MODELS.some(m => m.value === model)) {
          setModel('magic-hour');
        }
        showToast('Reference photo loaded.');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file.');
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

  const handleLoadForEdit = (imageUrl: string, initialPrompt?: string) => {
    setReferenceImage(imageUrl);
    setGenerationMode('img2img');
    setModel('magic-hour');
    setActiveTab('studio');
    setFaceLock(true);
    setLockComplexion(true);
    setLockHairstyle(true);
    setLockAttire(true);
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt);
    }
    showToast('Loaded photo into Edit Photo mode.');
  };

  const handleTriggerUpscale = async (factor: 2 | 4, mode: 'balanced' | 'face_revamp' | 'ultra_sharp') => {
    const targetImage = referenceImage || generatedImage;
    if (!targetImage) {
      showToast('Please upload or select an image to upscale.');
      return;
    }
    setIsUpscaling(true);
    try {
      showToast(`Upscaling image ${factor}X...`);
      const result = await upscaleImage(targetImage, { factor, mode });

      const upscaledItem: ImageHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        imageUrl: result.dataUrl,
        prompt: prompt ? `[${factor}X Upscaled] ${prompt}` : `[${factor}X Upscaled Image]`,
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
      showToast(`Successfully upscaled to ${result.upscaledWidth}×${result.upscaledHeight}!`);
    } catch (err: any) {
      console.error('Upscale error:', err);
      showToast(`Upscaling failed: ${err.message}`);
    } finally {
      setIsUpscaling(false);
    }
  };

  // Persist updated history asynchronously to IndexedDB
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
    if (generationMode === 'img2img' && !referenceImage) {
      setError('Please upload a reference image to edit.');
      return;
    }

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
    const isReferenceMode = generationMode === 'img2img' && Boolean(referenceImage);

    const tryGenerate = async (targetModel: string): Promise<string> => {
      if (targetModel.startsWith('puter-')) {
        if (isReferenceMode) {
          throw new Error('Please select a supported photo editing model.');
        }
        let puterModel = 'black-forest-labs/flux-schnell';
        if (targetModel === 'puter-flux') puterModel = 'black-forest-labs/flux-schnell';
        else if (targetModel === 'puter-gpt-image') puterModel = 'black-forest-labs/flux-schnell';

        const styleModifier = getStylePromptModifier(currentStyle);

        return await puterGenerateImage(currentPrompt, {
          model: puterModel,
          aspectRatio: currentAspectRatio,
          quality: currentQuality,
          styleModifier
        });
      } else {
        const promptLower = currentPrompt.toLowerCase();

        const isUserModifyingComplexion = 
          lockComplexion === false ||
          /\b(complexion|skin|skin tone|skin color|tan|tanned|tanning|pale|fair|fairer|dark|darker|dark-skinned|light-skinned|ebony|bronze|bronzed|olive|brown|black skin|white skin|lighter skin|darker skin|melanin|glow|complexioned|sun-kissed|wheatish)\b/i.test(promptLower);
        const effectiveLockComplexion = isUserModifyingComplexion ? false : lockComplexion;

        const isUserModifyingAttire = editMode === 'custom_edit' || 
          lockAttire === false ||
          /\b(wear|wearing|dressed|dress|clothe|clothes|clothing|attire|apparel|outfit|suit|tuxedo|blazer|jacket|coat|hoodie|sweater|cardigan|shirt|t-shirt|tee|top|polo|blouse|pants|jeans|trousers|shorts|skirt|garb|uniform|costume|robe|gown|vest|tie|swimsuit|swimwear|color of clothes|clothes color|clothing color|attire color)\b/i.test(promptLower) ||
          (/\b(red|blue|green|yellow|black|white|purple|orange|pink|brown|grey|gray|navy|beige|crimson|maroon|scarlet|violet|indigo|gold|silver|dark|light|bright)\b/i.test(promptLower) && /\b(clothe|clothes|clothing|outfit|attire|shirt|dress|suit|wear|jacket|top|pants|coat|sweater|hoodie)\b/i.test(promptLower));
        const effectiveLockAttire = isUserModifyingAttire ? false : lockAttire;

        const isUserModifyingHair = 
          lockHairstyle === false ||
          /\b(hair|hairstyle|haircut|blonde|brunette|bald|braids|ponytail|bangs|curls|curly|straight hair|shaved|wig|hairdo|redhead)\b/i.test(promptLower);
        const effectiveLockHairstyle = isUserModifyingHair ? false : lockHairstyle;

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: currentPrompt, 
            negativePrompt: currentNegativePrompt || (antiDeformation ? DEFAULT_NEGATIVE_PROMPT : ''), 
            aspectRatio: currentAspectRatio, 
            quality: currentQuality, 
            model: targetModel, 
            style: currentStyle,
            antiDeformation: antiDeformation,
            referenceImage: isReferenceMode ? referenceImage : null,
            editMode: isReferenceMode ? editMode : null,
            faceLock: faceLock,
            lockComplexion: effectiveLockComplexion,
            lockHairstyle: effectiveLockHairstyle,
            lockAttire: effectiveLockAttire
          })
        });

        const responseStatus = response.status;
        const responseText = await response.text();

        let data: any = null;
        try {
          data = JSON.parse(responseText);
        } catch {
          if (!response.ok) {
            throw new Error(`Generation failed (HTTP ${responseStatus}).`);
          }
          throw new Error(`Server returned invalid response (HTTP ${responseStatus}).`);
        }

        if (response.ok && data && typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
          if (data.warning) setWarning(data.warning);
          return data.imageUrl;
        }

        const errorMessage = data?.error || `Image generation failed (HTTP ${responseStatus}).`;
        throw new Error(errorMessage);
      }
    };

    try {
      let executionChain: string[] = [];

      if (isReferenceMode) {
        const isCurrentRefCapable = REFERENCE_CAPABLE_MODELS.includes(currentModel);
        const primaryRefModel = isCurrentRefCapable ? currentModel : 'magic-hour';
        executionChain = [primaryRefModel, ...REFERENCE_CAPABLE_MODELS.filter(m => m !== primaryRefModel)];
      } else {
        executionChain = [currentModel, ...['puter-flux', 'puter-gpt-image', 'gemini-3.1-flash-image', 'gemini-3-pro-image', 'magic-hour', 'pollinations-flux'].filter(m => m !== currentModel)];
      }

      let finalImageUrl = '';
      let usedModel = currentModel;
      let lastError: any = null;

      for (let i = 0; i < executionChain.length; i++) {
        const candidateModel = executionChain[i];
        try {
          finalImageUrl = await tryGenerate(candidateModel);
          if (finalImageUrl) {
            usedModel = candidateModel;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || err || '');
          const isQuota = /quota|429|resource_exhausted/i.test(errMsg);

          if (isQuota) {
            if (isReferenceMode) {
              const remainingCandidates = executionChain.slice(i + 1);
              if (remainingCandidates.length === 0) {
                break;
              }
            }
          }
        }
      }

      if (!finalImageUrl) {
        if (isReferenceMode) {
          throw lastError || new Error('Photo transformation could not be completed with the current reference photo. Please try again.');
        }
        throw lastError || new Error('Image generation could not be completed right now. Please try again.');
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
          style: isReferenceMode ? 'Photo Edit' : currentStyle,
          timestamp: Date.now(),
          referenceImageUrl: isReferenceMode ? (referenceImage || undefined) : undefined,
          editMode: isReferenceMode ? editMode : undefined,
          faceLock: isReferenceMode ? faceLock : undefined,
          lockComplexion: isReferenceMode ? lockComplexion : undefined,
          lockAttire: isReferenceMode ? lockAttire : undefined
        };

        const img = new Image();
        const onFinish = () => {
          setGeneratedImage(finalImageUrl);
          setActiveHistoryItem(newHistoryItem);
          setIsImageLoading(false);
          setIsGenerating(false);

          persistHistory([newHistoryItem, ...history.filter(h => h.id !== newHistoryItem.id)].slice(0, 50));
          
          if (isSupabaseConfigured) {
            insertSupabaseImageHistory(newHistoryItem).catch((e) => {
              console.warn('Failed to sync image to Supabase:', e);
            });
          }

          showToast(isReferenceMode ? 'Edited photo saved to history!' : 'Image generated and saved to history!');
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
      a.download = `image-studio-${Date.now()}.png`;
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
      a.download = `image-studio-${Date.now()}.png`;
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
    setModel(item.model || 'gemini-3.1-flash-image');
    if (item.style) setStyle(item.style);
    if (item.referenceImageUrl) {
      setReferenceImage(item.referenceImageUrl);
      setGenerationMode('img2img');
    } else {
      setGenerationMode('text2img');
    }
    setGeneratedImage(item.imageUrl);
    setActiveHistoryItem(item);
    setActiveTab('studio');
    showToast('Restored settings to Studio!');
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
    const found = [...MODELS, ...EDIT_PHOTO_MODELS].find(m => m.value === modelVal);
    if (found) {
      if (modelVal === 'puter-image') return 'General Vision';
      if (modelVal === 'pollinations-flux') return 'FLUX.1 HD';
      if (modelVal === 'huggingface-flux') return 'FLUX.1 Ultra';
      if (modelVal === 'together-flux') return 'FLUX.1 Schnell';
      return found.label;
    }
    return modelVal;
  };

  const EDIT_AREAS: { id: ImageEditMode; label: string }[] = [
    { id: 'background_change', label: 'Background' },
    { id: 'scene_change', label: 'Scene' },
    { id: 'posture_change', label: 'Pose' },
    { id: 'custom_edit', label: 'Clothing' },
    { id: 'face_revamp', label: 'Other' }
  ];

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
              Create new images or edit existing photos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            {/* Controls Left Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-5">

                  {/* Mode: [ Create Image ] [ Edit Photo ] */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          setGenerationMode('text2img');
                          if (!MODELS.some(m => m.value === model)) {
                            setModel('gemini-3.1-flash-image');
                          }
                        }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          generationMode === 'text2img'
                            ? 'bg-white text-purple-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Wand2 className="w-4 h-4 text-purple-700" />
                        Create Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGenerationMode('img2img');
                          if (!EDIT_PHOTO_MODELS.some(m => m.value === model)) {
                            setModel('magic-hour');
                          }
                        }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          generationMode === 'img2img'
                            ? 'bg-white text-purple-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4 text-purple-700" />
                        Edit Photo
                      </button>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* EDIT PHOTO MODE                                  */}
                  {/* ================================================= */}
                  {generationMode === 'img2img' ? (
                    <div className="space-y-5 pt-1">
                      {/* Reference Image */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Reference Image
                        </label>
                        {!referenceImage ? (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                              isDragging
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-slate-300 hover:border-purple-400 bg-slate-50 hover:bg-white'
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                              accept="image/*"
                              className="hidden"
                            />
                            <div className="w-10 h-10 mx-auto rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                              Upload photo to edit
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Drag and drop or click to upload (PNG, JPG, WebP)
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative shrink-0">
                                <img
                                  src={referenceImage}
                                  alt="Reference"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800">
                                  Reference photo loaded
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors"
                                  >
                                    Change Photo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReferenceImage(null);
                                      showToast('Reference image removed.');
                                    }}
                                    className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    Remove
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
                              <div className="hidden sm:flex flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={isUpscaling}
                                  onClick={() => handleTriggerUpscale(2, 'balanced')}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition-all disabled:opacity-50"
                                  title="Upscale image 2X resolution"
                                >
                                  {isUpscaling ? 'Upscaling...' : 'Upscale 2X'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* What do you want to change? */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            What do you want to change?
                          </label>
                          <VoicePromptButton
                            onTranscript={(spokenText, mode) => {
                              if (mode === 'replace') setPrompt(spokenText);
                              else setPrompt((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                            }}
                            onNotice={showToast}
                            disabled={isGenerating || isImageLoading}
                          />
                        </div>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe the change (e.g. change background to a modern office, walk on beach, standing naturally)..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none resize-none h-28 text-sm leading-relaxed"
                        />
                      </div>

                      {/* Preserve */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Preserve
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <input
                              type="checkbox"
                              checked={faceLock}
                              onChange={(e) => setFaceLock(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-slate-700">Person</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <input
                              type="checkbox"
                              checked={lockComplexion}
                              onChange={(e) => setLockComplexion(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-slate-700">Skin tone</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <input
                              type="checkbox"
                              checked={lockHairstyle}
                              onChange={(e) => setLockHairstyle(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-slate-700">Hairstyle</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <input
                              type="checkbox"
                              checked={lockAttire}
                              onChange={(e) => setLockAttire(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-slate-700">Clothing</span>
                          </label>
                        </div>
                      </div>

                      {/* Edit area */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Edit area
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {EDIT_AREAS.map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => {
                                setEditMode(area.id);
                                if (area.id === 'custom_edit') {
                                  setLockAttire(false);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                editMode === area.id
                                  ? 'bg-purple-900 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {area.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Model
                        </label>
                        <select 
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                        >
                          {EDIT_PHOTO_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>

                      {/* Output (Aspect Ratio & Quality) */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Output
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Aspect Ratio</label>
                            <select 
                              value={aspectRatio}
                              onChange={(e) => setAspectRatio(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                            >
                              {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Quality</label>
                            <select 
                              value={quality}
                              onChange={(e) => setQuality(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                            >
                              {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || !referenceImage || isGenerating || isImageLoading}
                        className={`w-full font-semibold rounded-xl py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          (isGenerating || isImageLoading)
                            ? 'bg-purple-500 text-white cursor-wait animate-pulse'
                            : 'bg-purple-900 hover:bg-purple-800 text-white disabled:opacity-50 disabled:hover:bg-purple-900 disabled:cursor-not-allowed'
                        }`}
                      >
                        {(isGenerating || isImageLoading) ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Transforming Photo...</span>
                          </>
                        ) : (
                          <>
                            <SlidersHorizontal className="w-5 h-5" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* ================================================= */
                    /* CREATE IMAGE MODE                                */
                    /* ================================================= */
                    <div className="space-y-5 pt-1">
                      {/* Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Prompt
                          </label>
                          <VoicePromptButton
                            onTranscript={(spokenText, mode) => {
                              if (mode === 'replace') setPrompt(spokenText);
                              else setPrompt((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                            }}
                            onNotice={showToast}
                            disabled={isGenerating || isImageLoading}
                          />
                        </div>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe the image you want to create in vivid detail..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none resize-none h-28 text-sm leading-relaxed"
                        />
                      </div>

                      {/* Negative Prompt */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Negative Prompt <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          placeholder="What to exclude (e.g., blurry, bad hands, distortion)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-xs"
                        />
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Model
                        </label>
                        <select 
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                        >
                          {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>

                      {/* Style */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Style
                        </label>
                        <select 
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none text-sm"
                        >
                          {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>

                        {/* Quick Style Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none text-xs">
                          <span className="text-[11px] font-medium text-slate-400 shrink-0">Suggestions:</span>
                          {[
                            { label: 'Photorealistic', val: 'Nexora Photorealistic' },
                            { label: 'Studio Portrait', val: 'Nexora Studio Portrait' },
                            { label: 'Sticker Cartoon', val: 'Nexora Sticker Cartoon' },
                            { label: 'Cinematic', val: 'Nexora Cinematic Film' },
                            { label: '3D Animation', val: 'Nexora 3D Animation' },
                            { label: 'Sketch', val: 'Nexora Hand-Drawn Sketch' },
                            { label: 'Watercolor', val: 'Nexora Watercolor Painting' },
                            { label: 'Anime', val: 'Nexora Anime High-Res' },
                            { label: 'Oil Painting', val: 'Nexora Classical Oil Painting' },
                          ].map((chip) => (
                            <button
                              key={chip.val}
                              type="button"
                              onClick={() => {
                                setStyle(chip.val);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                                style === chip.val
                                  ? 'bg-purple-900 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Aspect Ratio & Quality */}
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

                      {/* Generate Button */}
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating || isImageLoading}
                        className={`w-full font-semibold rounded-xl py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          (isGenerating || isImageLoading)
                            ? 'bg-purple-500 text-white cursor-wait animate-pulse'
                            : 'bg-purple-900 hover:bg-purple-800 text-white disabled:opacity-50 disabled:hover:bg-purple-900 disabled:cursor-not-allowed'
                        }`}
                      >
                        {(isGenerating || isImageLoading) ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating Image...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Right Panel */}
            <div className="lg:col-span-7 flex flex-col h-[540px] lg:h-auto">
              <div className="flex-1 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 shadow-xs relative flex items-center justify-center overflow-hidden group">
                
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
                      className="px-2.5 py-1 bg-purple-50 text-purple-900 font-semibold rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reuse
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
                        {generationMode === 'img2img' ? 'Editing Photo...' : 'Generating Image...'}
                      </h3>
                      <p className="text-slate-500 max-w-sm text-sm">
                        {generationMode === 'img2img' ? 'Applying edits to reference photo...' : `Rendering composition with ${style}...`}
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
                          className="px-3.5 py-3 bg-purple-900 text-white shadow-lg text-xs font-bold rounded-xl hover:bg-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Edit Photo"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Edit Photo</span>
                        </button>
                        <button 
                          onClick={() => setZoomedImage(generatedImage)}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors cursor-pointer"
                          title="Inspect Full Size"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => copyPromptText(prompt, 'preview')}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors cursor-pointer"
                          title="Copy Prompt"
                        >
                          {copiedId === 'preview' ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleDownload(generatedImage, prompt)}
                          className="p-3 bg-white/90 backdrop-blur border border-white/20 shadow-lg text-slate-700 rounded-xl hover:bg-white hover:text-purple-900 transition-colors cursor-pointer"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleSaveToProjects(prompt, generatedImage)}
                          className="p-3 bg-purple-900 shadow-lg shadow-purple-900/30 text-white rounded-xl hover:bg-purple-800 transition-colors cursor-pointer"
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
                      <p className="font-semibold text-slate-700 text-lg">Canvas Ready</p>
                      <p className="text-slate-400 text-sm mt-1 max-w-xs text-center">
                        {generationMode === 'img2img'
                          ? 'Upload a photo, describe your desired changes, and click Generate.'
                          : 'Enter your prompt and click Generate to create an image.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer"
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
                            title="Edit this photo"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Generation History Yet</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Generated images and edited photos will appear here.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
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
                No history entries matched &quot;<span className="text-slate-700 font-medium">{searchQuery}</span>&quot;.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={() => handleLoadForEdit(item.imageUrl, item.prompt)}
                        className="p-2.5 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-colors shadow-md cursor-pointer"
                        title="Edit Photo"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedImage(item.imageUrl);
                          setActiveHistoryItem(item);
                          setActiveTab('studio');
                        }}
                        className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-purple-50 hover:text-purple-900 transition-colors shadow-md cursor-pointer"
                        title="View on Canvas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreHistoryItem(item)}
                        className="p-2.5 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-colors shadow-md cursor-pointer"
                        title="Load settings"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(item.imageUrl, item.prompt)}
                        className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-purple-50 hover:text-purple-900 transition-colors shadow-md cursor-pointer"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-2.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-colors shadow-md cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {item.style}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-slate-800 text-sm font-medium line-clamp-3 leading-relaxed">
                          &quot;{item.prompt}&quot;
                        </p>
                      </div>

                      {item.negativePrompt && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-1 italic">
                          <span className="font-semibold text-slate-500">Excluded:</span> {item.negativePrompt}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 w-fit mb-4 font-mono truncate max-w-full">
                        {getModelShortLabel(item.model)}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleLoadForEdit(item.imageUrl, item.prompt)}
                        className="py-2 px-2.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        title="Edit Photo"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Edit Photo
                      </button>

                      <button
                        onClick={() => handleRestoreHistoryItem(item)}
                        className="flex-1 py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reuse
                      </button>

                      <button
                        onClick={() => copyPromptText(item.prompt, item.id)}
                        className="p-2 border border-slate-200 text-slate-600 hover:text-purple-900 hover:border-purple-300 rounded-xl transition-colors cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleSaveToProjects(item.prompt, item.imageUrl)}
                        className="p-2 border border-slate-200 text-slate-600 hover:text-purple-900 hover:border-purple-300 rounded-xl transition-colors cursor-pointer"
                        title="Save to Projects"
                      >
                        <Save className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors cursor-pointer"
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
                This will delete all {history.length} saved generations from your browser's local storage. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllHistory}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Yes, Clear All
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
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit Photo"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Edit Photo
                </button>
                <button
                  onClick={() => handleDownload(zoomedImage, prompt)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setZoomedImage(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {zoomedImage && zoomedImage.trim() !== '' ? (
                <img 
                  src={zoomedImage} 
                  alt="High-Res View" 
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
