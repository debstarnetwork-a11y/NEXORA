import { createClient } from '@supabase/supabase-js';
import { ImageHistoryItem, SavedChat, SavedImage, SavedPrompt, PromptTemplate } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// Image History Operations (Server Proxy + Fallback)
// ==========================================

export async function fetchSupabaseImageHistory(): Promise<ImageHistoryItem[]> {
  // First attempt: Server-side proxy to bypass browser CORS, iframe restrictions, and adblockers
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const res = await fetch('/api/supabase/image-history?limit=25', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.items)) {
        return data.items;
      }
    }
  } catch (proxyErr) {
    // Non-fatal, will try client fallback or return empty array
    console.warn('Server Supabase history proxy unavailable:', proxyErr);
  }

  // Fallback: Direct client supabase if configured
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('image_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      console.warn('Notice fetching image history from Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      imageUrl: row.image_url,
      prompt: row.prompt,
      negativePrompt: row.negative_prompt || undefined,
      aspectRatio: row.aspect_ratio || '1:1',
      quality: row.quality || '1K',
      model: row.model,
      style: row.style,
      timestamp: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.warn('Supabase fetchImageHistory notice:', err);
    return [];
  }
}

export async function insertSupabaseImageHistory(item: ImageHistoryItem): Promise<boolean> {
  // First attempt: Server-side proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const res = await fetch('/api/supabase/image-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return true;
      }
    }
  } catch (proxyErr) {
    console.warn('Server Supabase history insert proxy unavailable:', proxyErr);
  }

  // Fallback: Direct client supabase if configured
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('image_history').insert({
      image_url: item.imageUrl,
      prompt: item.prompt,
      negative_prompt: item.negativePrompt || null,
      aspect_ratio: item.aspectRatio,
      quality: item.quality,
      model: item.model,
      style: item.style
    });

    if (error) {
      console.warn('Notice inserting image history into Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertImageHistory notice:', err);
    return false;
  }
}

// ==========================================
// Saved Images / Project Library
// ==========================================

export async function fetchSupabaseSavedImages(): Promise<SavedImage[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('saved_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSavedImages notice:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      url: row.url,
      prompt: row.prompt,
      timestamp: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.warn('Supabase fetchSavedImages notice:', err);
    return [];
  }
}

export async function insertSupabaseSavedImage(image: SavedImage): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('saved_images').insert({
      url: image.url,
      prompt: image.prompt
    });
    if (error) {
      console.warn('Supabase insertSavedImage notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertSavedImage notice:', err);
    return false;
  }
}

export async function deleteSupabaseSavedImage(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('saved_images').delete().eq('id', id);
    if (error) {
      console.warn('Supabase deleteSavedImage notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteSavedImage notice:', err);
    return false;
  }
}

// ==========================================
// Saved Research Chats
// ==========================================

export async function fetchSupabaseSavedChats(): Promise<SavedChat[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('saved_chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSavedChats notice:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      messages: row.messages || [],
      timestamp: new Date(row.updated_at || row.created_at).getTime()
    }));
  } catch (err) {
    console.warn('Supabase fetchSavedChats notice:', err);
    return [];
  }
}

export async function insertSupabaseSavedChat(chat: SavedChat): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('saved_chats').insert({
      title: chat.title,
      messages: chat.messages
    });
    if (error) {
      console.warn('Supabase insertSavedChat notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertSavedChat notice:', err);
    return false;
  }
}

// ==========================================
// Saved Prompts
// ==========================================

export async function fetchSupabaseSavedPrompts(): Promise<SavedPrompt[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('saved_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSavedPrompts notice:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      timestamp: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.warn('Supabase fetchSavedPrompts notice:', err);
    return [];
  }
}

export async function insertSupabaseSavedPrompt(prompt: SavedPrompt): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('saved_prompts').insert({
      title: prompt.title,
      content: prompt.content
    });
    if (error) {
      console.warn('Supabase insertSavedPrompt notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertSavedPrompt notice:', err);
    return false;
  }
}

// ==========================================
// Curated Prompt Templates
// ==========================================

export async function fetchSupabasePromptTemplates(): Promise<PromptTemplate[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchPromptTemplates notice:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content
    }));
  } catch (err) {
    console.warn('Supabase fetchPromptTemplates notice:', err);
    return [];
  }
}
