export type View = 
  | 'research'
  | 'image'
  | 'prompt-builder'
  | 'prompt-library'
  | 'projects'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  quality: string;
  model: string;
  style: string;
  timestamp: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}
