import { useState } from 'react';
import { Trash2, Image as ImageIcon, MessageSquare, PenTool } from 'lucide-react';
import { useAppStore } from '../store';

type Tab = 'chats' | 'images' | 'prompts';

export function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const { savedChats, savedImages, savedPrompts, deleteChat, deleteImage, deletePrompt } = useAppStore();

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h2>
        <p className="text-slate-500 mt-1">Your saved research, generated images, and custom prompts</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[
          { id: 'images', label: 'Images', icon: ImageIcon, count: savedImages.length },
          { id: 'prompts', label: 'Prompts', icon: PenTool, count: savedPrompts.length },
          { id: 'chats', label: 'Chats', icon: MessageSquare, count: savedChats.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'images' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedImages.map(img => (
              <div key={img.id} className="group relative bg-white p-2 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative">
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm p-4 text-center line-clamp-4">{img.prompt}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteImage(img.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {savedImages.length === 0 && <EmptyState icon={ImageIcon} text="No saved images yet" />}
          </div>
        )}

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

        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedChats.map(chat => (
              <div key={chat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{chat.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(chat.timestamp).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteChat(chat.id)} className="text-slate-400 hover:text-red-500 p-2 bg-slate-50 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-xl line-clamp-3">
                  {chat.messages[chat.messages.length - 1]?.content || 'Empty chat'}
                </div>
                <button className="mt-4 text-purple-900 font-medium text-sm hover:underline">
                  View Full Chat
                </button>
              </div>
            ))}
            {savedChats.length === 0 && <EmptyState icon={MessageSquare} text="No saved research chats yet" />}
          </div>
        )}
      </div>
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
