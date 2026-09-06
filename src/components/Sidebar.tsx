import { 
  MessageSquare, 
  Image as ImageIcon, 
  Library, 
  PenTool, 
  FolderOpen, 
  Settings,
  Mic,
  MicOff
} from 'lucide-react';
import { useAppStore } from '../store';
import { View } from '../types';
import { useSpeech } from '../hooks/useSpeech';

const NAV_ITEMS: { id: View; label: string; icon: any }[] = [
  { id: 'research', label: 'AI Research', icon: MessageSquare },
  { id: 'image', label: 'Image Studio', icon: ImageIcon },
  { id: 'prompt-builder', label: 'Prompt Builder', icon: PenTool },
  { id: 'prompt-library', label: 'Prompt Library', icon: Library },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentView, setCurrentView } = useAppStore();
  const { isListening, startListening, stopListening, isSupported } = useSpeech();

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        const lower = text.toLowerCase();
        if (lower.includes('research')) setCurrentView('research');
        else if (lower.includes('image')) setCurrentView('image');
        else if (lower.includes('prompt builder') || lower.includes('build')) setCurrentView('prompt-builder');
        else if (lower.includes('prompt library') || lower.includes('library')) setCurrentView('prompt-library');
        else if (lower.includes('project')) setCurrentView('projects');
        else if (lower.includes('setting')) setCurrentView('settings');
        
        // Ensure microphone stops after the command is processed
        stopListening();
      });
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 relative">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <div className="w-5 h-5 border-2 border-amber-400 rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-purple-900">NEXORA</h1>
          </div>
          {isSupported && (
            <button 
              onClick={handleVoiceCommand}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-purple-900 hover:bg-slate-50'}`}
              title={isListening ? "Listening for view name..." : "Voice navigation (e.g. 'Go to Image Studio')"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer group ${
                isActive 
                  ? 'bg-purple-100 text-purple-900 font-medium border-r-2 border-amber-500 rounded-r-none' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-purple-900' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Plan</p>
          <p className="text-sm text-purple-900 mb-3 font-semibold">NEXORA Pro</p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-amber-500 rounded-full" />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">124 / 200 generations</p>
        </div>
      </div>
    </aside>
  );
}
