import { puterChat, isPuterLoaded } from './puter';

/**
 * Intelligent AI Prompt Enhancer
 * Elevates raw user descriptions into studio-grade photographic and visual prompts
 * using multi-engine AI (Gemini 2.5 Flash / GPT-4o-mini) with an instant rule-based fallback.
 */
export async function enhancePromptWithAI(rawPrompt: string, style?: string): Promise<string> {
  const cleanInput = rawPrompt.trim();
  if (!cleanInput) return '';

  const systemInstruction = 
    `You are a master AI art director and prompt engineer. ` +
    `Expand the following idea into a single cohesive, visually stunning prompt. ` +
    `Include precise camera lens, realistic lighting, material textures, depth of field, and atmosphere. ` +
    (style && style !== 'Nexora Vision Pro' ? `Incorporate the aesthetic style of ${style}. ` : '') +
    `Rules: The prompt MUST describe a SINGLE unified image with ONE cohesive scene or character. NEVER create a split screen, two-in-one, side-by-side, comparison, before-and-after, or multi-panel image. Maximum 60 words. Output ONLY the expanded prompt text. Do NOT add quotation marks, commentary, or intros.`;

  // 1. Try server-side Gemini 2.5 Flash
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${systemInstruction}\n\nSubject Idea: "${cleanInput}"`
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && typeof data.text === 'string' && data.text.trim().length > 10) {
        return sanitizeEnhancedPrompt(data.text.trim());
      }
    }
  } catch (geminiErr) {
    console.warn('Server prompt enhancement failed, trying secondary engine:', geminiErr);
  }

  // 2. Try client-side Puter.js AI (GPT-4o-mini)
  if (isPuterLoaded()) {
    try {
      const puterRes = await puterChat(
        `${systemInstruction}\n\nSubject Idea: "${cleanInput}"`,
        'gpt-4o-mini'
      );
      if (puterRes && puterRes.trim().length > 10) {
        return sanitizeEnhancedPrompt(puterRes.trim());
      }
    } catch (puterErr) {
      console.warn('Client-side AI prompt enhancement failed:', puterErr);
    }
  }

  // 3. Fallback: Rule-based photographic expansion
  return heuristicPromptEnhance(cleanInput, style);
}

function sanitizeEnhancedPrompt(text: string): string {
  let cleaned = text
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^(Prompt|Output|Enhanced Prompt|Result):\s*/i, '')
    .replace(/\n+/g, ' ')
    .trim();
  return cleaned;
}

function heuristicPromptEnhance(input: string, style?: string): string {
  const lower = input.toLowerCase();

  let categoryAdditions = 'masterpiece photograph, 8k uhd, razor-sharp focus, natural lighting, crisp textures';

  if (style === 'Nexora Pixar 3D') {
    categoryAdditions = 'single unified character frame, iconic Disney Pixar 3D animation style, adorable expressive character modeling, soft subsurface scattering, large soulful eyes, smooth 3D CGI rendering, charming lighting, RenderMan quality, vibrant rich palette, no split screen, no side by side';
  } else if (style === 'Nexora Hand-Sketch') {
    categoryAdditions = 'single unified frame, authentic hand-drawn graphite pencil sketch, delicate charcoal shading, fine cross-hatching line art, textured vintage sketchbook paper grain, artist pencil drawing illustration, hand-sketched masterpiece, no split screen, no side by side';
  } else if (style === 'Nexora Watercolor Artistry') {
    categoryAdditions = 'single unified frame, ethereal watercolor painting, fluid translucent color washes, wet-on-wet paint bleeds, visible rough cold-press watercolor paper texture, delicate ink linework accents, fine art watercolor illustration, no split screen, no side by side';
  } else if (style === 'Nexora Cyberpunk Neon') {
    categoryAdditions = 'single unified frame, futuristic cyberpunk aesthetic, high-tech neon lighting, glowing holographic reflections, rain-slicked dark cyber metropolis, vivid magenta and cyan backlight, detailed futuristic cyber gear, cinematic atmosphere, no split screen, no side by side';
  } else if (style === 'Nexora Oil Painting Masterpiece') {
    categoryAdditions = 'single unified frame, classical oil painting on canvas, thick impasto palette knife textures, rich buttery paint strokes, Rembrandt chiaroscuro lighting, deep luminous colors, museum fine art masterpiece, no split screen, no side by side';
  } else if (style === 'Nexora Claymation') {
    categoryAdditions = 'single unified frame, handcrafted claymation aesthetic, tactile plasticine clay character modeling, charming stop-motion animation look, studio macro lighting, subtle artisan clay fingerprint textures, miniature diorama setting, no split screen, no side by side';
  } else if (style === 'Nexora 3D Papercraft') {
    categoryAdditions = 'single unified frame, intricate layered papercraft art, 3D folded origami sculpture, delicate multi-layered paper cutouts, depth shadowbox lighting, clean geometric paper folds, tactile craft paper textures, no split screen, no side by side';
  } else if (style === 'Nexora Architectural Concept') {
    categoryAdditions = 'single unified frame, clean modernist architectural visualization, precise structural lines, warm natural ambient daylight, minimalist spatial composition, photorealistic building materials and glass reflections, no split screen, no side by side';
  } else if (style === 'Nexora Film Noir') {
    categoryAdditions = 'single unified frame, 1940s classic film noir cinema, dramatic black and white chiaroscuro lighting, deep mysterious shadows, smoky atmospheric mood, vintage 35mm film grain, moody composition, no split screen, no side by side';
  } else if (style === 'Nexora Polaroid') {
    categoryAdditions = 'single unified frame, vintage polaroid 600 instant photo, soft flash illumination, authentic analog color grading, warm faded tones, subtle chemical light leaks, nostalgic film grain, no split screen, no side by side';
  } else if (style === 'Nexora Animate Cartoon') {
    categoryAdditions = 'single character, single frame, vibrant animated cartoon illustration, playful character design, crisp clean outlines, expressive dynamic poses, smooth cel shading, colorful animated movie style, no split screen, no side by side';
  } else if (style === 'Nexora Stick Cartoon') {
    categoryAdditions = 'single isolated character, single unified frame, minimalist stick cartoon drawing, simple black stick figure line art, clean expressive doodle illustration, solid plain white background, humorous hand-drawn comic style, no real photo, no split screen, no side by side comparison, no collage';
  } else if (style === 'Nexora Vision Lite') {
    categoryAdditions = 'single unified frame, clean and crisp digital rendering, natural balanced daylight, sharp lines, light uncluttered composition, smooth textures, no split screen, no side by side';
  } else if (style === 'Nexora Anime High-Res') {
    categoryAdditions = 'single unified frame, Makoto Shinkai anime aesthetic, high-resolution anime art, lush detailed backgrounds, gorgeous sky and cloud lighting, clean anime cel shading, vibrant colors, no split screen, no side by side';
  } else if (/person|woman|man|girl|boy|portrait|face|model|actor|eyes/i.test(lower)) {
    categoryAdditions = 'medium format 85mm portrait, f/1.4 aperture, natural catchlights, authentic skin texture and micro-details, subtle subsurface scattering, soft studio fill lighting';
  } else if (/car|vehicle|motorcycle|supercar|truck/i.test(lower)) {
    categoryAdditions = 'sleek automotive photography, dramatic rim lighting, polished metallic reflections, wet asphalt, 35mm lens, high contrast, commercial advertisement grading';
  } else if (/landscape|mountain|ocean|beach|forest|sunset|nature|sky/i.test(lower)) {
    categoryAdditions = 'majestic wide-angle landscape, golden hour volumetric sunlight, mist drifting through layers, vivid atmospheric depth, Hasselblad clarity, 16mm lens';
  } else if (/room|interior|house|architecture|kitchen|bedroom/i.test(lower)) {
    categoryAdditions = 'architectural digest interior photography, warm ambient illumination, balanced perspective, clean lines, tactile materials, natural daylight pouring through large windows';
  } else if (/robot|cyberpunk|sci-fi|futuristic|space|alien/i.test(lower)) {
    categoryAdditions = 'cinematic science-fiction movie still, anamorphic lens flare, holographic neon reflections, intricate mechanical seams, atmospheric fog, 8k render';
  }

  const base = input.replace(/,\s*(masterpiece|8k|sharp focus|ultra-detailed|photorealistic).*$/i, '');
  return `${base}, ${categoryAdditions}`;
}
