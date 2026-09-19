import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useAppStore } from '../store';
import { View } from '../types';

interface PortalExitButtonProps {
  portalName?: string;
  targetView?: View;
  className?: string;
  variant?: 'standard' | 'compact';
}

export function PortalExitButton({ 
  portalName, 
  targetView = 'research', 
  className = '',
  variant = 'standard'
}: PortalExitButtonProps) {
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const goBack = useAppStore((state) => state.goBack);

  const handleExit = () => {
    if (goBack) {
      goBack();
    } else {
      setCurrentView(targetView);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleExit}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer group shrink-0 ${className}`}
        title={portalName ? `Exit ${portalName} & return to AI Research` : 'Exit portal & return to AI Research'}
        aria-label="Exit or cancel back to previous screen"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        <span>Exit</span>
        <X className="w-3 h-3 text-slate-400 group-hover:text-rose-500 transition-colors ml-0.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleExit}
      className={`inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer group shrink-0 ${className}`}
      title={portalName ? `Exit ${portalName} & return to AI Research` : 'Exit portal & return to AI Research'}
      aria-label="Exit or cancel back to previous screen"
    >
      <div className="flex items-center gap-1">
        <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back / Exit</span>
      </div>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/40 transition-colors">
        <X className="w-3 h-3" />
      </span>
    </button>
  );
}
