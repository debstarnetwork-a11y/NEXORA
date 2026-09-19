import React from 'react';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  FilePlus, 
  Sparkles 
} from 'lucide-react';

interface PageNavigationBarProps {
  pageCount: number;
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage?: () => void;
  onDeletePage?: (index: number) => void;
  pageTitles?: string[];
  moduleName?: string; // 'Infographic' | 'Diagram'
}

export function PageNavigationBar({
  pageCount,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  pageTitles = [],
  moduleName = 'Page'
}: PageNavigationBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-wrap my-3 text-xs">
      {/* Left: Page Counter & Prev / Next Arrows */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-bold rounded-xl border border-purple-200 dark:border-purple-800">
          <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>
            {moduleName} {activePageIndex + 1} of {pageCount}
          </span>
        </div>

        <button
          onClick={() => onSelectPage(Math.max(0, activePageIndex - 1))}
          disabled={activePageIndex === 0}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectPage(Math.min(pageCount - 1, activePageIndex + 1))}
          disabled={activePageIndex === pageCount - 1}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Horizontal Page Tabs (Extended up to 10 or more) */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50vw] py-1">
        {Array.from({ length: pageCount }).map((_, idx) => {
          const isActive = idx === activePageIndex;
          const customTitle = pageTitles[idx] || `${moduleName} ${idx + 1}`;

          return (
            <button
              key={idx}
              onClick={() => onSelectPage(idx)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                isActive
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/20 scale-105'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={`Switch to ${customTitle}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-slate-400'}`} />
              <span className="max-w-[120px] truncate">{customTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Page Extension Actions (+ Add Page, Duplicate, Delete) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAddPage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          title="Add a new page (extend from 1 to 10 or more pages as desired)"
        >
          <Plus className="w-3.5 h-3.5 text-amber-300" />
          <span>Add Page ({pageCount + 1})</span>
        </button>

        {onDuplicatePage && (
          <button
            onClick={onDuplicatePage}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Duplicate current page contents and layout"
          >
            <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </button>
        )}

        {onDeletePage && (
          <button
            onClick={() => onDeletePage(activePageIndex)}
            disabled={pageCount <= 1}
            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title={pageCount <= 1 ? "Cannot delete the only page" : "Delete this page"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
