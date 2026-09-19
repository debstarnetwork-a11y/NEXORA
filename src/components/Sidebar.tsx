import { 
  MessageSquare, 
  Image as ImageIcon, 
  Library, 
  PenTool, 
  FolderOpen, 
  Settings,
  FolderKanban,
  Mic,
  MicOff,
  Presentation,
  BarChart3,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store';
import { View } from '../types';
import { useSpeech } from '../hooks/useSpeech';

const NAV_ITEMS: { id: View; label: string; icon: any }[] = [
  { id: 'research', label: 'AI Research', icon: MessageSquare },
  { id: 'workspace', label: 'Workspace', icon: FolderKanban },
  { id: 'slides', label: 'PowerPoint Studio', icon: Presentation },
  { id: 'infographic', label: 'Infographic Studio', icon: BarChart3 },
  { id: 'draw-label', label: 'Draw & Label', icon: Microscope },
  { id: 'image', label: 'Image Studio', icon: ImageIcon },
  { id: 'prompt-builder', label: 'Prompt Builder', icon: PenTool },
  { id: 'prompt-library', label: 'Prompt Library', icon: Library },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const currentView = useAppStore((state) => state.currentView);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const { isListening, startListening, stopListening, isSupported } = useSpeech();

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        const lower = text.toLowerCase();
        if (lower.includes('research')) setCurrentView('research');
        else if (lower.includes('workspace') || lower.includes('document') || lower.includes('notes')) setCurrentView('workspace');
        else if (lower.includes('powerpoint') || lower.includes('slide')) setCurrentView('slides');
        else if (lower.includes('infographic') || lower.includes('chart')) setCurrentView('infographic');
        else if (lower.includes('draw') || lower.includes('label') || lower.includes('anatomy') || lower.includes('cell')) setCurrentView('draw-label');
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
    <aside 
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 z-20 relative transition-all duration-300 ease-in-out`}
    >
      {/* Sidebar Header */}
      <div className={`p-4 ${sidebarCollapsed ? 'px-2' : 'p-6'} transition-all`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900 dark:bg-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
              <div className="w-5 h-5 border-2 border-amber-400 dark:border-amber-300 rounded-sm rotate-45"></div>
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold tracking-tight text-purple-900 dark:text-purple-300 truncate">
                NEXORA
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isSupported && !sidebarCollapsed && (
              <button 
                onClick={handleVoiceCommand}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-purple-900 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title={isListening ? "Listening for view name..." : "Voice navigation (e.g. 'Go to Draw & Label')"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Toggle Collapse/Expand Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-purple-900 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar (Shift + Space)" : "Minimize sidebar to maximize structure space"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-amber-500" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-4'} space-y-1.5 overflow-y-auto pb-4`}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } rounded-xl text-left transition-all cursor-pointer group relative ${
                isActive 
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 font-bold border-r-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors shrink-0 ${
                  isActive ? 'text-purple-900 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!sidebarCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer Plan Badge / Collapse Helper */}
      <div className={`mt-auto ${sidebarCollapsed ? 'p-2 text-center' : 'p-4'}`}>
        {!sidebarCollapsed ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/70 transition-colors flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace</p>
              <p className="text-xs text-purple-900 dark:text-purple-300 font-bold">NEXORA Kit</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 text-slate-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors cursor-pointer"
              title="Minimize sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
