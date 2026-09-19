import { useState } from 'react';
import { useAppStore } from '../store';
import { Moon, Sun, Globe, User, Info, Mail, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PortalExitButton } from '../components/PortalExitButton';

export function Settings() {
  const { theme, setTheme, user, logout, language, setLanguage } = useAppStore();
  const [legalDoc, setLegalDoc] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleOpenLegal = (doc: string) => {
    setLegalDoc(doc);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#F1F5F9] dark:bg-slate-900 transition-colors duration-200">
      <div className="flex items-center gap-4 mb-8">
        <PortalExitButton portalName="Settings" />
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your NEXORA preferences and integrations</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Account Settings */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 rounded-lg">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Profile</h3>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</h4>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email || 'No email provided'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>
        
        {/* Appearance */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 rounded-lg">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'light' ? 'border-purple-900 bg-purple-50/50 dark:bg-purple-900/20 dark:border-purple-500' : 'border-slate-100 hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-purple-900 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`font-semibold ${theme === 'light' ? 'text-purple-950 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>Light Theme</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'dark' ? 'border-purple-900 bg-purple-50/50 dark:bg-purple-900/20 dark:border-purple-500' : 'border-slate-100 hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-900 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-purple-950 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>Dark Theme</span>
            </button>
          </div>
        </section>

        {/* Language & Region */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Language & Region</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Control system language, dialect, and AI output spelling</p>
            </div>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Language & English Dialect
              </label>
              <select 
                value={language || 'English (US)'}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 outline-none transition-colors"
              >
                <option value="English (US)">English (US) — American Spelling</option>
                <option value="English (UK)">English (UK) — British Spelling</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Japanese">Japanese (日本語)</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Active Output Dialect: {language || 'English (US)'}
              </div>
              <p>
                {language === 'English (UK)' 
                  ? 'The AI is configured to respond exclusively in UK (British) English: colour, behaviour, analyse, programme, centre, defence, prioritisation, etc.'
                  : language === 'English (US)'
                  ? 'The AI is configured to respond in US (American) English: color, behavior, analyze, program, center, defense, prioritization, etc.'
                  : `The AI is configured to respond in ${language}.`}
              </p>
            </div>
          </div>
        </section>

        {/* About App */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Info className="w-64 h-64 text-slate-900 dark:text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">About NEXORA</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
              NEXORA is a next-generation AI creative studio tailored for artists, developers, and researchers. With an advanced multimodal engine, NEXORA seamlessly blends voice, vision, and deep analytical processing.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleOpenLegal('Terms of Service')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleOpenLegal('Privacy Policy')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </section>

      </div>

      <AnimatePresence>
        {legalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{legalDoc}</h2>
                <button
                  onClick={() => setLegalDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert prose-slate max-w-none">
                  {legalDoc === 'Terms of Service' ? (
                    <>
                      <h3>1. Acceptance of Terms</h3>
                      <p>By accessing and using NEXORA, you accept and agree to be bound by the terms and provision of this agreement. To prevent abuse, NEXORA restricts accounts to one per device.</p>
                      <h3>2. Use License</h3>
                      <p>Permission is granted to temporarily use the materials on NEXORA for personal, non-commercial transitory viewing only.</p>
                      <h3>3. User Conduct</h3>
                      <p>You agree not to use the service to generate harmful, illegal, or inappropriate content.</p>
                      <h3>4. Account Restrictions</h3>
                      <p>NEXORA strictly enforces a one-account-per-device policy to maintain platform integrity and prevent abuse.</p>
                    </>
                  ) : (
                    <>
                      <h3>1. Information Collection</h3>
                      <p>We collect information you provide directly to us, such as when you create an account, or when you interact with the NEXORA studio.</p>
                      <h3>2. Use of Information</h3>
                      <p>We use the information we collect to provide, maintain, and improve our services, as well as to personalize your experience.</p>
                      <h3>3. Device Fingerprinting</h3>
                      <p>To enforce our Terms of Service (specifically the one-device-one-account policy), we use secure local storage markers to identify returning devices.</p>
                      <h3>4. Data Security</h3>
                      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing.</p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button
                  onClick={() => setLegalDoc(null)}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
