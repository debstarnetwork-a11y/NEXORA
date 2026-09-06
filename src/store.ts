import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, SavedChat, SavedImage, SavedPrompt, View } from './types';

interface AppState {
  currentView: View;
  setCurrentView: (view: View) => void;
  
  // Projects Data
  savedChats: SavedChat[];
  savedImages: SavedImage[];
  savedPrompts: SavedPrompt[];
  
  saveChat: (chat: SavedChat) => void;
  saveImage: (image: SavedImage) => void;
  savePrompt: (prompt: SavedPrompt) => void;
  
  deleteChat: (id: string) => void;
  deleteImage: (id: string) => void;
  deletePrompt: (id: string) => void;
  
  // Settings
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'research',
      setCurrentView: (view) => set({ currentView: view }),
      
      savedChats: [],
      savedImages: [],
      savedPrompts: [],
      
      saveChat: (chat) => set((state) => ({ savedChats: [chat, ...state.savedChats] })),
      saveImage: (image) => set((state) => ({ savedImages: [image, ...state.savedImages] })),
      savePrompt: (prompt) => set((state) => ({ savedPrompts: [prompt, ...state.savedPrompts] })),
      
      deleteChat: (id) => set((state) => ({ savedChats: state.savedChats.filter((c) => c.id !== id) })),
      deleteImage: (id) => set((state) => ({ savedImages: state.savedImages.filter((i) => i.id !== id) })),
      deletePrompt: (id) => set((state) => ({ savedPrompts: state.savedPrompts.filter((p) => p.id !== id) })),
      
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'nexora-storage',
    }
  )
);
