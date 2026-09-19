import { useState } from 'react';
import { Search, Copy, Heart, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import { PromptTemplate } from '../types';
import { PortalExitButton } from '../components/PortalExitButton';

const CATEGORIES = [
  'All', 'Product Photography', 'YouTube Thumbnails', 'Movie Posters', 
  "Children's Story Illustrations", 'Realistic Portraits', 'Logos', 
  'Anime', 'Fantasy Art', 'Cinematic Scenes'
];

const TEMPLATES: PromptTemplate[] = [
  {
    id: '1',
    title: 'Minimalist Perfume Bottle',
    category: 'Product Photography',
    content: 'Commercial product photography of a sleek glass perfume bottle, minimalist white pedestal, dramatic studio lighting, sharp focus, 8k resolution, macro photography.'
  },
  {
    id: '2',
    title: 'Epic Sci-Fi Movie Poster',
    category: 'Movie Posters',
    content: 'Cinematic movie poster, lone astronaut facing a massive alien monolith, glowing neon runes, swirling cosmic clouds, deep space background, highly detailed, dramatic lighting, bold composition.'
  },
  {
    id: '3',
    title: 'Whimsical Bear in Forest',
    category: "Children's Story Illustrations",
    content: 'Cute illustration for children\'s book, fluffy brown bear wearing a red scarf holding a lantern in a magical glowing forest, soft watercolor style, warm lighting, pastel colors, enchanting.'
  },
  {
    id: '4',
    title: 'Cyberpunk Anime Protagonist',
    category: 'Anime',
    content: 'High-quality anime style, cyberpunk city street at night, neon lights reflecting on wet pavement, young protagonist with glowing augmented eyes, dynamic pose, Studio Ghibli meets Akira.'
  },
  {
    id: '5',
    title: 'Modern Tech Startup Logo',
    category: 'Logos',
    content: 'Clean modern minimalist logo design for a tech startup, geometric shape, abstract letter N, gradient blue and purple colors, vector art, flat design, white background.'
  }
];

export function PromptLibrary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { savePrompt } = useAppStore();

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const handleSaveToProjects = (template: PromptTemplate) => {
    savePrompt({
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      timestamp: Date.now()
    });
    alert('Saved to Projects!');
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <PortalExitButton portalName="Prompt Library" />
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Prompt Library</h2>
            <p className="text-slate-500 mt-1">Discover and use curated AI prompts</p>
          </div>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-700 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-900 border border-purple-100 text-xs font-semibold rounded-lg mb-2">
                  {template.category}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{template.title}</h3>
              </div>
              <button 
                onClick={() => toggleFavorite(template.id)}
                className="p-2 -mt-1 -mr-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-5 h-5 ${favorites.includes(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              "{template.content}"
            </p>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => copyToClipboard(template.content)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => handleSaveToProjects(template)}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No templates found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
