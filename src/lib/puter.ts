// Puter.js AI Integration Helper
// Provides free, client-side AI Chat and Text-to-Image without API keys or credit cards.

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
  }
): Promise<string> {
  const ready = await ensurePuterReady();
  if (!ready || !window.puter?.ai?.txt2img) {
    throw new Error('Puter.js is not loaded yet. Please check your internet connection and refresh.');
  }

  // Anti-deformation and sharpness enhancement
  let enhancedPrompt = prompt.trim();
  if (options?.antiDeformation !== false) {
    if (!enhancedPrompt.toLowerCase().includes('sharp') && !enhancedPrompt.toLowerCase().includes('detailed')) {
      enhancedPrompt += ', 8k resolution, ultra-sharp focus, symmetrical facial features, anatomically correct hands and fingers, highly detailed textures, master photography, crystal clear';
    }
  }

  const requestedModel = options?.model || 'black-forest-labs/flux-schnell';
  const puterQuality = options?.quality === '4K' || options?.quality === '2K' ? '2k' : '1k';
  
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
    console.warn(`Puter txt2img failed with model ${requestedModel}, attempting high-definition fallback...`, primaryErr);
    
    // Fallback 1: Try GPT-Image-2 if FLUX had an issue
    if (requestedModel !== 'openai/gpt-image-2') {
      try {
        const fallbackResult = await window.puter.ai.txt2img(enhancedPrompt, { model: 'openai/gpt-image-2', quality: '1k' });
        return extractImageSrc(fallbackResult);
      } catch (fbErr) {
        console.warn('Fallback to gpt-image-2 failed:', fbErr);
      }
    }

    // Fallback 2: Try default Puter model with anti-deformation prompt
    try {
      const defaultResult = await window.puter.ai.txt2img(enhancedPrompt, {});
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
