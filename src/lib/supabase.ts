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
// Image History Operations
// ==========================================

export async function fetchSupabaseImageHistory(): Promise<ImageHistoryItem[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('image_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching image history from Supabase:', error.message);
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
    console.error('Supabase fetchImageHistory failed:', err);
    return [];
  }
}

export async function insertSupabaseImageHistory(item: ImageHistoryItem): Promise<boolean> {
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
      console.error('Error inserting image history into Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase insertImageHistory failed:', err);
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

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      url: row.url,
      prompt: row.prompt,
      timestamp: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.error('Supabase fetchSavedImages failed:', err);
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
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase insertSavedImage failed:', err);
    return false;
  }
}

export async function deleteSupabaseSavedImage(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('saved_images').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase deleteSavedImage failed:', err);
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

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      messages: row.messages || [],
      timestamp: new Date(row.updated_at || row.created_at).getTime()
    }));
  } catch (err) {
    console.error('Supabase fetchSavedChats failed:', err);
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
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase insertSavedChat failed:', err);
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

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      timestamp: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.error('Supabase fetchSavedPrompts failed:', err);
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
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase insertSavedPrompt failed:', err);
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

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content
    }));
  } catch (err) {
    console.error('Supabase fetchPromptTemplates failed:', err);
    return [];
  }
}
