/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppStore } from './store';
import { Sidebar } from './components/Sidebar';
import { AIResearch } from './pages/AIResearch';
import { ImageStudio } from './pages/ImageStudio';
import { PromptBuilder } from './pages/PromptBuilder';
import { PromptLibrary } from './pages/PromptLibrary';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'research': return <AIResearch />;
      case 'image': return <ImageStudio />;
      case 'prompt-builder': return <PromptBuilder />;
      case 'prompt-library': return <PromptLibrary />;
      case 'projects': return <Projects />;
      case 'settings': return <Settings />;
      default: return <AIResearch />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
