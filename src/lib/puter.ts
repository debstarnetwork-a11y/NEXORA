// Puter.js AI Integration Helper
// Client-side AI Chat and Text-to-Image execution helper.

export function isPuterLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.puter?.ai);
}

export async function ensurePuterReady(): Promise<boolean> {
  if (isPuterLoaded()) return true;

  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (isPuterLoaded()) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts > 30) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

export async function puterGenerateImage(
  prompt: string,
  options?: {
    model?: string;
    aspectRatio?: string;
    quality?: string;
    antiDeformation?: boolean;
    referenceImage?: string | null;
    editMode?: string | null;
    faceLock?: boolean;
    lockComplexion?: boolean;
    complexionLock?: string;
    lockAttire?: boolean;
    attireLock?: string;
    facialFeatures?: string;
    hairStyle?: string;
    strictPreservationPrompt?: string;
    styleModifier?: string;
  }
): Promise<string> {
  const ready = await ensurePuterReady();
  if (!ready || !window.puter?.ai?.txt2img) {
    throw new Error('Puter.js is not loaded yet. Please check your internet connection and refresh.');
  }

  const rawUserPrompt = prompt.trim();
  const promptParts: string[] = [];

  // Subject preservation with authentic skin tone, facial features, and attire
  if (options?.referenceImage) {
    let subjectHeader = '';
    if (options.strictPreservationPrompt?.trim()) {
      subjectHeader = options.strictPreservationPrompt.trim();
    } else {
      const subjectTraits: string[] = [];
      const comp = (options.complexionLock || '').trim();
      const isPlaceholderComp = !comp || comp.length < 15 || comp.toLowerCase().includes('maintain exact') || comp.toLowerCase().includes('reference photo');
      if (options.lockComplexion !== false && !isPlaceholderComp) {
        subjectTraits.push(comp);
      }
      if (options.facialFeatures?.trim()) {
        subjectTraits.push(options.facialFeatures.trim());
      }
      if (options.hairStyle?.trim()) {
        subjectTraits.push(options.hairStyle.trim());
      }
      const att = (options.attireLock || '').trim();
      const isPlaceholderAtt = !att || att.length < 15 || att.toLowerCase().includes('maintain 100%') || att.toLowerCase().includes('reference image');
      if (options.lockAttire !== false && !isPlaceholderAtt) {
        subjectTraits.push(`wearing ${att}`);
      }

      if (subjectTraits.length > 0) {
        subjectHeader = `Ultra-detailed portrait of the exact same subject: ${subjectTraits.join(', ')}`;
      } else {
        subjectHeader = 'Ultra-detailed authentic portrait preserving the exact same person, facial likeness, bone structure, and skin tone from reference image';
      }
    }

    promptParts.push(subjectHeader);

    let actionPhrase = '';
    if (options.editMode === 'scene_change') {
      actionPhrase = `in a new environment: ${rawUserPrompt}`;
    } else if (options.editMode === 'background_change') {
      actionPhrase = `placed seamlessly in new background setting: ${rawUserPrompt}`;
    } else if (options.editMode === 'posture_change') {
      actionPhrase = `posing naturally: ${rawUserPrompt}`;
    } else if (options.editMode === 'face_revamp') {
      actionPhrase = `ultra-high definition facial clarity restoration, razor-sharp focus, natural skin pores: ${rawUserPrompt}`;
    } else {
      actionPhrase = rawUserPrompt;
    }
    promptParts.push(actionPhrase);
  } else {
    promptParts.push(rawUserPrompt);
  }

  if (options?.styleModifier) {
    promptParts.push(options.styleModifier.replace(/^,\s*/, ''));
  }

  const isStylizedArt = /stick\s*cartoon|stick\s*figure|cartoon|doodle|line\s*art|sketch|drawing|vector\s*art|pixar|anime|claymation|origami|papercraft|watercolor|oil\s*painting|hand-sketch/i.test(`${rawUserPrompt} ${options?.styleModifier || ''}`);

  if (options?.antiDeformation !== false) {
    if (isStylizedArt) {
      promptParts.push('clean crisp artistic craftsmanship, award-winning illustration, pristine details, solid unified composition, single unified frame, no split screen');
    } else {
      promptParts.push('photorealistic masterpiece, 8k uhd, razor-sharp focus, symmetrical facial features, anatomically correct hands, natural skin pores, single unified frame, no split screen');
    }
  } else {
    promptParts.push('single frame, single image, no split screen');
  }

  const enhancedPrompt = promptParts.filter(Boolean).join(', ');

  const requestedModel = options?.model || 'black-forest-labs/flux-schnell';
  const puterQuality = options?.quality === '4K' || options?.quality === '2K' ? '2k' : '1k';
  
  const puterOptions: Record<string, any> = {
    quality: puterQuality
  };

  if (requestedModel && requestedModel !== 'default') {
    puterOptions.model = requestedModel;
  }

  // Pass reference image to Puter for true image-to-image conditioning
  if (options?.referenceImage) {
    puterOptions.input_image = options.referenceImage;
    puterOptions.input_images = [options.referenceImage];
  }

  try {
    const result = await window.puter.ai.txt2img(enhancedPrompt, puterOptions);
    return extractImageSrc(result);
  } catch (primaryErr: any) {
    console.warn(`Puter txt2img failed with model ${requestedModel}, attempting fallback...`, primaryErr);
    
    // Fallback 1: Try GPT-Image-2 if FLUX or another model had an issue
    if (requestedModel !== 'openai/gpt-image-2') {
      try {
        const fbOptions: Record<string, any> = { model: 'openai/gpt-image-2', quality: '1k' };
        if (options?.referenceImage) {
          fbOptions.input_image = options.referenceImage;
          fbOptions.input_images = [options.referenceImage];
        }
        const fallbackResult = await window.puter.ai.txt2img(enhancedPrompt, fbOptions);
        return extractImageSrc(fallbackResult);
      } catch (fbErr) {
        console.warn('Fallback to gpt-image-2 failed:', fbErr);
      }
    }

    // Fallback 2: Try default Puter model
    try {
      const defOptions: Record<string, any> = {};
      if (options?.referenceImage) {
        defOptions.input_image = options.referenceImage;
        defOptions.input_images = [options.referenceImage];
      }
      const defaultResult = await window.puter.ai.txt2img(enhancedPrompt, defOptions);
      return extractImageSrc(defaultResult);
    } catch (finalErr: any) {
      throw new Error(`Puter image generation failed: ${finalErr?.message || primaryErr?.message || 'Unknown error'}`);
    }
  }
}

function extractImageSrc(result: any): string {
  if (result instanceof HTMLImageElement) {
    return result.src;
  }

  if (result && typeof result === 'object') {
    if (result.src) return result.src;
    if (result.url) return result.url;
    if (result.image) return result.image;
    if (result.data) return `data:image/jpeg;base64,${result.data}`;
  }

  if (typeof result === 'string') {
    return result;
  }

  throw new Error('Could not extract valid image source from Puter.js response.');
}

export async function puterChat(
  prompt: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const ready = await ensurePuterReady();
  if (!ready || !window.puter?.ai?.chat) {
    throw new Error('Puter.js AI is not loaded yet. Please check your internet connection.');
  }

  const response = await window.puter.ai.chat(prompt, { model });

  if (typeof response === 'string') {
    return response;
  }

  if (response?.message?.content) {
    if (typeof response.message.content === 'string') {
      return response.message.content;
    }
    if (Array.isArray(response.message.content)) {
      return response.message.content.map((c: any) => c.text || '').join('\n');
    }
  }

  if (response?.text) {
    return response.text;
  }

  return JSON.stringify(response);
}
