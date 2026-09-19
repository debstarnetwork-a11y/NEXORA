import { useState } from 'react';
import { 
  Trash2, 
  Image as ImageIcon, 
  MessageSquare, 
  PenTool, 
  ExternalLink, 
  X, 
  Bot, 
  User, 
  ArrowRight,
  Presentation,
  BarChart3,
  Microscope,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store';
import { SavedChat, SlideDeck, InfographicData, DiagramConcept } from '../types';
import { PortalExitButton } from '../components/PortalExitButton';

type Tab = 'chats' | 'slides' | 'infographics' | 'diagrams' | 'images' | 'prompts';

export function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [selectedChat, setSelectedChat] = useState<SavedChat | null>(null);
  const { 
    savedChats, 
    savedImages, 
    savedPrompts, 
    savedSlideDecks,
    savedInfographics,
    savedDiagrams,
    deleteChat, 
    deleteImage, 
    deletePrompt, 
    deleteSlideDeck,
    deleteInfographic,
    deleteDiagram,
    loadChat,
    sendToResearch,
    setCurrentView 
  } = useAppStore();

  const handleOpenInResearch = (chat: SavedChat) => {
    loadChat(chat.messages);
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <PortalExitButton portalName="Projects" />
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-slate-500 mt-1">Your saved research chats, PowerPoint decks, infographics, labelled diagrams, and prompts</p>
        </div>
      </div>

      <div className="flex gap-2.5 mb-8 flex-wrap">
        {[
          { id: 'chats', label: 'Chats', icon: MessageSquare, count: savedChats.length },
          { id: 'slides', label: 'Slide Decks', icon: Presentation, count: savedSlideDecks.length },
          { id: 'infographics', label: 'Infographics', icon: BarChart3, count: savedInfographics.length },
          { id: 'diagrams', label: 'Draw & Label', icon: Microscope, count: savedDiagrams.length },
          { id: 'images', label: 'Images', icon: ImageIcon, count: savedImages.length },
          { id: 'prompts', label: 'Prompts', icon: PenTool, count: savedPrompts.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedChats.map(chat => (
              <div key={chat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                      <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-2">{chat.title}</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(chat.timestamp).toLocaleString()} • {chat.messages.length} messages
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteChat(chat.id)} 
                      className="text-slate-400 hover:text-red-500 p-2 bg-slate-50 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Delete saved chat"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-xl line-clamp-3 leading-relaxed mb-4">
                    {chat.messages.find(m => m.role === 'user')?.content || chat.messages[chat.messages.length - 1]?.content || 'Empty chat'}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => handleOpenInResearch(chat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-950 transition-colors shadow-sm"
                  >
                    <span>Load into Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setSelectedChat(chat)}
                    className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Preview Log
                  </button>
                </div>
              </div>
            ))}
            {savedChats.length === 0 && <EmptyState icon={MessageSquare} text="No saved research chats yet. Save a chat from AI Research to see it here." />}
          </div>
        )}

        {/* Slide Decks Tab */}
        {activeTab === 'slides' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSlideDecks.map(deck => (
              <div key={deck.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200">
                      {deck.slides.length} Slides
                    </span>
                    <button 
                      onClick={() => deleteSlideDeck(deck.id)} 
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">{deck.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{deck.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      let outline = `# Presentation Deck: ${deck.title}\n\n${deck.description}\n\n`;
                      deck.slides.forEach((s, idx) => {
                        outline += `### Slide ${idx + 1}: ${s.title}\n${s.bullets.map(b => `- ${b}`).join('\n')}\n\n`;
                      });
                      sendToResearch(outline, deck.title);
                    }}
                    className="flex-1 py-2 px-3 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-950 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send to AI Research</span>
                  </button>
                </div>
              </div>
            ))}
            {savedSlideDecks.length === 0 && <EmptyState icon={Presentation} text="No saved PowerPoint slide decks yet. Create one in PowerPoint Studio!" />}
          </div>
        )}

        {/* Infographics Tab */}
        {activeTab === 'infographics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedInfographics.map(info => (
              <div key={info.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {info.sections.length} Colored Sections
                    </span>
                    <button 
                      onClick={() => deleteInfographic(info.id)} 
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">{info.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{info.subtitle || info.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      let text = `# Infographic Breakdown: ${info.title}\n\n${info.summary}\n\n`;
                      info.sections.forEach(s => {
                        text += `### ${s.title}\n${s.description}\n\n`;
                      });
                      sendToResearch(text, info.title);
                    }}
                    className="flex-1 py-2 px-3 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-950 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send to AI Research</span>
                  </button>
                </div>
              </div>
            ))}
            {savedInfographics.length === 0 && <EmptyState icon={BarChart3} text="No saved Infographics yet. Create one in Infographic Studio!" />}
          </div>
        )}

        {/* Diagrams Tab */}
        {activeTab === 'diagrams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDiagrams.map(diag => (
              <div key={diag.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                      {diag.pins.length} Labelled Pins
                    </span>
                    <button 
                      onClick={() => deleteDiagram(diag.id)} 
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">{diag.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{diag.subtitle || diag.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      let text = `# Anatomical Analysis: ${diag.title}\n\n${diag.description}\n\n`;
                      diag.pins.forEach(p => {
                        text += `### ${p.number}. ${p.name} (${p.category})\nFunction: ${p.functionSummary}\nNotes: ${p.detailedNotes}\n\n`;
                      });
                      sendToResearch(text, diag.title);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Send to AI Research</span>
                  </button>
                </div>
              </div>
            ))}
            {savedDiagrams.length === 0 && <EmptyState icon={Microscope} text="No saved labelled diagrams yet. Create one in Draw & Label!" />}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedImages.map(img => (
              <div key={img.id} className="group relative bg-white p-2 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative">
                  {img.url && img.url.trim() !== '' ? (
                    <img src={img.url} alt={img.prompt || 'Saved image'} className="w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm p-4 text-center line-clamp-4">{img.prompt}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteImage(img.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {savedImages.length === 0 && <EmptyState icon={ImageIcon} text="No saved images yet" />}
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedPrompts.map(prompt => (
              <div key={prompt.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{prompt.title}</h3>
                  <button onClick={() => deletePrompt(prompt.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                  {prompt.content}
                </p>
                <div className="text-xs text-slate-400 mt-4">
                  {new Date(prompt.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
            {savedPrompts.length === 0 && <EmptyState icon={PenTool} text="No saved prompts yet" />}
          </div>
        )}
      </div>

      {/* Chat Preview Modal */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedChat.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(selectedChat.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    handleOpenInResearch(selectedChat);
                    setSelectedChat(null);
                  }}
                  className="px-3 py-1.5 bg-purple-900 text-white rounded-lg text-xs font-bold hover:bg-purple-950 transition-colors"
                >
                  Load into Assistant
                </button>
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {selectedChat.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-purple-900 text-amber-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-purple-900 text-white rounded-tr-none border-purple-900'
                      : 'bg-white text-slate-800 rounded-tl-none border-slate-200 shadow-sm custom-markdown'
                  }`}>
                    {msg.role === 'user' ? msg.content : <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400">
      <Icon className="w-16 h-16 mb-4 opacity-20" />
      <p className="text-lg font-medium">{text}</p>
    </div>
  );
}
