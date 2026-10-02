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
    eyeDescription?: string;
    expressionDescription?: string;
    strictPreservationPrompt?: string;
    styleModifier?: string;
  }
): Promise<string> {
  const ready = await ensurePuterReady();
  if (!ready || !window.puter?.ai?.txt2img) {
    throw new Error('Image generation service is initializing. Please wait a moment and try again.');
  }

  const rawUserPrompt = prompt.trim();
  if (options?.referenceImage) {
    throw new Error('Reference image editing requires a supported photo transformation model.');
  }

  const promptLower = rawUserPrompt.toLowerCase();
  const promptParts: string[] = [rawUserPrompt];

  // Complexion precision reinforcement
  if (/\b(very fair|extremely fair|pale|porcelain|ivory|alabaster|light fair|fair skin|fair complexion)\b/i.test(promptLower)) {
    promptParts.push('luminous very fair pale porcelain alabaster skin complexion, clear bright porcelain skin tone');
  } else if (/\b(dark|ebony|deep brown|black skin|dark-skinned|dark complexion)\b/i.test(promptLower)) {
    promptParts.push('radiant rich dark melanin skin complexion, deep brown glowing skin tone');
  } else if (/\b(olive|tan|tanned|bronze|bronzed|golden|wheatish)\b/i.test(promptLower)) {
    promptParts.push('warm golden olive tanned bronze skin complexion, sun-kissed glowing warm skin tone');
  }

  if (options?.styleModifier) {
    const cleanMod = options.styleModifier.replace(/^,\s*/, '').trim();
    if (cleanMod && !rawUserPrompt.toLowerCase().includes(cleanMod.toLowerCase())) {
      promptParts.push(cleanMod);
    }
  }

  // Add clarity and contrast reinforcement to prevent faint or blurry output
  promptParts.push('rich contrast, sharp focus, 8k resolution, crisp natural lighting');

  const enhancedPrompt = promptParts.filter(Boolean).join(', ');

  const requestedModel = options?.model || 'black-forest-labs/flux-schnell';
  const puterQuality = options?.quality?.includes('4K') || options?.quality?.includes('2K') ? '2k' : '1k';
  
  const puterOptions: Record<string, any> = {
    quality: puterQuality
  };

  if (requestedModel && requestedModel !== 'default') {
    puterOptions.model = requestedModel;
  }

  try {
    const result = await window.puter.ai.txt2img(enhancedPrompt, puterOptions);
    return extractImageSrc(result);
  } catch (primaryErr: any) {
    console.warn(`Primary generation attempt with model ${requestedModel} failed, retrying...`, primaryErr);
    
    // Fallback 1: Try GPT-Image-2
    if (requestedModel !== 'openai/gpt-image-2') {
      try {
        const fbOptions: Record<string, any> = { model: 'openai/gpt-image-2', quality: '1k' };
        const fallbackResult = await window.puter.ai.txt2img(enhancedPrompt, fbOptions);
        return extractImageSrc(fallbackResult);
      } catch (fbErr) {
        console.warn('Alternative model failed:', fbErr);
      }
    }

    // Fallback 2: Default model
    try {
      const defOptions: Record<string, any> = {};
      const defaultResult = await window.puter.ai.txt2img(enhancedPrompt, defOptions);
      return extractImageSrc(defaultResult);
    } catch (finalErr: any) {
      throw new Error(`Generation failed: ${finalErr?.message || primaryErr?.message || 'Please try again.'}`);
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

  try {
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
  } catch (err: any) {
    // If a premium/restricted model like Claude, Grok, Kimi, or GPT-4o failed (e.g. not found, auth required), fallback to gpt-4o-mini
    if (model.includes('claude') || model.includes('gpt-4o') || model.includes('grok') || model.includes('moonshot') || model.includes('kimi')) {
      console.warn(`Puter model ${model} failed, attempting fallback to gpt-4o-mini:`, err);
      try {
        const fbResponse = await window.puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
        if (typeof fbResponse === 'string') return fbResponse;
        if (fbResponse?.message?.content) {
          if (typeof fbResponse.message.content === 'string') return fbResponse.message.content;
          if (Array.isArray(fbResponse.message.content)) {
            return fbResponse.message.content.map((c: any) => c.text || '').join('\n');
          }
        }
        if (fbResponse?.text) return fbResponse.text;
      } catch (fbErr) {
        console.warn('Puter fallback to gpt-4o-mini also failed:', fbErr);
      }
    }
    throw err;
  }
}
