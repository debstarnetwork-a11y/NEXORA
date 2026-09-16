import { useAppStore } from '../store';
import { Moon, Sun, Globe, Key, ShieldCheck, Zap, Database, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function Settings() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your NEXORA preferences and integrations</p>
      </div>

      <div className="space-y-8">
        
        {/* Supabase Cloud Database */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Supabase Cloud Database</h3>
                <p className="text-xs text-slate-500">PostgreSQL Cloud Persistence for Images, Chats & Prompts</p>
              </div>
            </div>

            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Connected to Supabase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Awaiting API Credentials
              </span>
            )}
          </div>

          {isSupabaseConfigured ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
              <p className="text-sm font-medium text-emerald-900">
                Your application is successfully linked to your Supabase PostgreSQL database!
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Images generated in the studio, project gallery items, research chats, and custom prompts are automatically synchronized across devices and sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                Now that you have successfully executed the SQL script in your Supabase SQL Editor, link your app in two quick steps:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Copy Supabase API Keys</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In your Supabase Dashboard, go to <strong>Project Settings &gt; API</strong>. Copy the <strong>Project URL</strong> and <strong>anon (public)</strong> key.
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2.5"
                  >
                    Open Supabase Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Add to AI Studio Secrets</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add the following two entries in <strong>Settings &gt; Secrets</strong>:
                  </p>
                  <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    <div><strong>VITE_SUPABASE_URL</strong></div>
                    <div><strong>VITE_SUPABASE_ANON_KEY</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* Appearance */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 text-purple-900 rounded-lg">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Appearance</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'light' ? 'border-purple-900 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-purple-900' : 'text-slate-400'}`} />
              <span className={`font-semibold ${theme === 'light' ? 'text-purple-950' : 'text-slate-600'}`}>Light Theme</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all opacity-50 cursor-not-allowed ${
                theme === 'dark' ? 'border-purple-900 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-900' : 'text-slate-400'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-purple-950' : 'text-slate-600'}`}>Dark Theme (Soon)</span>
            </button>
          </div>
        </section>

        {/* Language & Region */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 text-purple-900 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Language & Region</h3>
          </div>
          
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Display Language</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 outline-none">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>
        </section>

        {/* API & Integrations */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">API Key Management</h3>
            </div>
            
            <p className="text-slate-600 mb-6 max-w-2xl leading-relaxed">
              Your API keys are managed securely on the server side to prevent exposure in the browser. 
              Configure your keys in the AI Studio Settings &gt; Secrets panel.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-900">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Google Gemini API</h4>
                    <p className="text-sm text-slate-500">Provides Text & Image AI Models</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Secured on Server
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <span className="font-bold font-serif">O</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">OpenAI API</h4>
                    <p className="text-sm text-slate-500">Not configured</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
