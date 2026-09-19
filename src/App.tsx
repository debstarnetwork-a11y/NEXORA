/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AIResearch } from './pages/AIResearch';
import { PresentationStudio } from './pages/PresentationStudio';
import { InfographicStudio } from './pages/InfographicStudio';
import { DrawAndLabel } from './pages/DrawAndLabel';
import { ImageStudio } from './pages/ImageStudio';
import { PromptBuilder } from './pages/PromptBuilder';
import { PromptLibrary } from './pages/PromptLibrary';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { Workspace } from './pages/Workspace';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const currentView = useAppStore((state) => state.currentView);
  const theme = useAppStore((state) => state.theme);
  const user = useAppStore((state) => state.user);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'research': return <AIResearch />;
      case 'workspace': return <Workspace />;
      case 'slides': return <PresentationStudio />;
      case 'infographic': return <InfographicStudio />;
      case 'draw-label': return <ErrorBoundary fallbackTitle="Draw and Label Studio"><DrawAndLabel /></ErrorBoundary>;
      case 'image': return <ImageStudio />;
      case 'prompt-builder': return <PromptBuilder />;
      case 'prompt-library': return <PromptLibrary />;
      case 'projects': return <Projects />;
      case 'settings': return <Settings />;
      default: return <AIResearch />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-200">
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
