import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  Layers, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  BookOpen, 
  GraduationCap, 
  Microscope, 
  Users, 
  Search, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Table, 
  Image as ImageIcon, 
  FileDown, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  FileCode, 
  Printer, 
  Eye, 
  Edit, 
  ChevronUp,
  FileCheck,
  SplitSquareVertical,
  Maximize2,
  Minimize2,
  RefreshCw,
  FolderPlus,
  StickyNote,
  Send,
  Loader2,
  Info,
  BarChart3
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store';
import { WorkspaceProject, WorkspacePage, WorkspaceUploadedDoc, DiagramConcept, InfographicData } from '../types';
import { SCIENTIFIC_PRESETS_REGISTRY } from '../lib/scientificRegistry';
import { 
  exportToWordDocument, 
  exportToPdfDocument, 
  exportToMarkdown, 
  exportToText, 
  parseContentToSections 
} from '../lib/documentExport';
import { parseUploadedFile, UploadedDocumentPayload } from '../lib/documentImporter';
import { puterChat } from '../lib/puter';

const SCIENTIFIC_LIBRARY_ITEMS: DiagramConcept[] = Object.entries(SCIENTIFIC_PRESETS_REGISTRY).map(([key, item]) => ({
  id: `preset-${key}`,
  title: item.title,
  category: item.category,
  subtitle: item.subtitle,
  description: item.description,
  diagramType: item.diagramType as any,
  renderMode: item.defaultRenderMode,
  domain: item.domain,
  colorTheme: item.defaultRenderMode === 'paper' ? 'paper-black-white' : 'vibrant-anatomical',
  funFact: item.funFact,
  timestamp: Date.now(),
  pins: item.pins
}));

type EditorViewMode = 'edit' | 'preview' | 'split' | 'word-page';

export const workspaceMarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-7 mb-3 tracking-tight border-b-2 border-purple-900/20 dark:border-purple-400/20 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg sm:text-xl font-bold text-purple-950 dark:text-purple-300 mt-5 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-1.5">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="my-2.5 text-slate-800 dark:text-slate-200 leading-relaxed text-[15px]">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-slate-950 dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-800 dark:text-slate-200">
      {children}
    </em>
  ),
  table: ({ children }: any) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800">
      <table className="w-full text-left border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-purple-900 text-white dark:bg-purple-950 dark:text-amber-300 font-bold border-b border-purple-950">
      {children}
    </thead>
  ),
  th: ({ children }: any) => (
    <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider border border-purple-800/40 text-white dark:text-amber-300 whitespace-nowrap bg-purple-900 dark:bg-purple-950">
      {children}
    </th>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-normal">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-purple-50/50 dark:hover:bg-slate-700/50 even:bg-slate-50/70 dark:even:bg-slate-800/50 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }: any) => (
    <td className="py-3 px-4 text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 align-top leading-normal">
      {children}
    </td>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside my-3 space-y-1.5 text-slate-800 dark:text-slate-200 text-[15px] pl-5">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside my-3 space-y-1.5 text-slate-800 dark:text-slate-200 text-[15px] pl-5">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed my-0.5">
      {children}
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-purple-800 dark:border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 px-5 py-3.5 my-4 rounded-r-xl italic text-slate-700 dark:text-slate-300 shadow-2xs">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-slate-200 dark:border-slate-700" />
  ),
  code: ({ children }: any) => (
    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-800 dark:text-purple-300 font-mono text-xs border border-slate-200 dark:border-slate-700">
      {children}
    </code>
  ),
  img: ({ src, alt, ...props }: any) => {
    if (!src || typeof src !== 'string' || src.trim() === '') return null;
    return (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-xl my-3 shadow-xs border border-slate-200 dark:border-slate-700"
        {...props}
      />
    );
  }
};

export function Workspace() {
  const {
    workspaceProjects,
    activeProjectId,
    createWorkspaceProject,
    updateWorkspaceProject,
    deleteWorkspaceProject,
    setActiveProjectId,
    addPageToProject,
    updateProjectPage,
    deleteProjectPage,
    reorderProjectPages,
    addUploadedDocToProject,
    deleteUploadedDocFromProject,
    savedDiagrams,
    savedInfographics,
    setCurrentView
  } = useAppStore();

  // Active Project & Page Resolution
  const activeProject = workspaceProjects.find(p => p.id === activeProjectId) || workspaceProjects[0];
  const activePageIndex = activeProject ? Math.max(0, Math.min(activeProject.activePageIndex || 0, activeProject.pages.length - 1)) : 0;
  const activePage: WorkspacePage | undefined = activeProject?.pages[activePageIndex];

  // UI States
  const [editorMode, setEditorMode] = useState<EditorViewMode>('word-page');
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [isContinuousView, setIsContinuousView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'teacher' | 'researcher' | 'student' | 'academic'>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showImportDiagramModal, setShowImportDiagramModal] = useState(false);
  const [diagramModalTargetPage, setDiagramModalTargetPage] = useState<number>(0);
  const [diagramModalTab, setDiagramModalTab] = useState<'library' | 'saved'>('library');
  const [diagramModalSearch, setDiagramModalSearch] = useState<string>('');
  const [diagramModalCategory, setDiagramModalCategory] = useState<string>('All');

  const [showImportInfographicModal, setShowImportInfographicModal] = useState(false);
  const [infographicModalTargetPage, setInfographicModalTargetPage] = useState<number>(0);
  const [infographicModalTab, setInfographicModalTab] = useState<'presets' | 'saved'>('presets');
  const [infographicModalSearch, setInfographicModalSearch] = useState<string>('');
  const [showInsertTableModal, setShowInsertTableModal] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Table modal state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // New Project Form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectRole, setNewProjectRole] = useState<'teacher' | 'researcher' | 'student' | 'academic'>('researcher');
  const [newProjectCategory, setNewProjectCategory] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Editor Ref & History
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quickTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Sync active project if null
  useEffect(() => {
    if (!activeProjectId && workspaceProjects.length > 0) {
      setActiveProjectId(workspaceProjects[0].id);
    }
  }, [activeProjectId, workspaceProjects, setActiveProjectId]);

  // Handle Text Content Change for Active Page
  const handleContentChange = (newText: string) => {
    if (!activeProject || !activePage) return;
    updateProjectPage(activeProject.id, activePageIndex, { content: newText });
  };

  // Handle Page Title Change
  const handlePageTitleChange = (newTitle: string) => {
    if (!activeProject || !activePage) return;
    updateProjectPage(activeProject.id, activePageIndex, { title: newTitle });
  };

  // Text formatting insertion helper
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = 'text') => {
    if (!activePage || !activeProject) return;
    
    const targetRef = textareaRef.current || quickTextareaRef.current;
    if (targetRef) {
      const el = targetRef;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const currentVal = activePage.content;
      const selectedText = currentVal.substring(start, end) || placeholder;
      const replacement = `${prefix}${selectedText}${suffix}`;
      const newContent = currentVal.substring(0, start) + replacement + currentVal.substring(end);
      
      updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 10);
    } else {
      // In Word view mode without textarea active
      const newContent = activePage.content + `\n\n${prefix}${placeholder}${suffix}\n`;
      updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
      showToast(`Formatted element added to page!`, 'success');
    }
  };

  // Insert Table
  const handleInsertTable = () => {
    let tableMd = '\n\n| ' + Array.from({ length: tableCols }, (_, i) => `Header ${i + 1}`).join(' | ') + ' |\n';
    tableMd += '| ' + Array.from({ length: tableCols }, () => '---').join(' | ') + ' |\n';
    for (let r = 0; r < tableRows; r++) {
      tableMd += '| ' + Array.from({ length: tableCols }, (_, c) => `Row ${r + 1} Col ${c + 1}`).join(' | ') + ' |\n';
    }
    tableMd += '\n';

    if (activePage && activeProject) {
      updateProjectPage(activeProject.id, activePageIndex, { 
        content: activePage.content + tableMd 
      });
      showToast('Inserted customizable table into document', 'success');
      setShowInsertTableModal(false);
    }
  };

  // Universal Document Upload Handler
  const handleUniversalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProject) return;

    setIsUploadingDoc(true);
    showToast(`Parsing ${files.length} document(s)...`, 'info');

    try {
      for (let i = 0; i < files.length; i++) {
        const parsed: UploadedDocumentPayload = await parseUploadedFile(files[i]);
        const newDoc: WorkspaceUploadedDoc = {
          id: `doc-${Date.now()}-${i}`,
          name: parsed.name,
          type: parsed.type,
          sizeFormatted: parsed.sizeFormatted,
          text: parsed.text,
          preview: parsed.preview,
          timestamp: Date.now(),
          rawBase64: parsed.rawBase64
        };

        addUploadedDocToProject(activeProject.id, newDoc);

        // Optionally insert summary into current page if empty or user wants
        if (!activePage?.content.trim()) {
          updateProjectPage(activeProject.id, activePageIndex, {
            content: `## ${parsed.name}\n*Document imported on ${new Date().toLocaleDateString()} (${parsed.type.toUpperCase()})*\n\n---\n\n${parsed.text}`
          });
        }
      }
      showToast(`Successfully imported ${files.length} document(s) to workspace!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error parsing uploaded document', 'error');
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Export Active Page or Whole Project
  const handleExport = async (format: 'word' | 'pdf' | 'markdown' | 'text', scope: 'page' | 'project' = 'page') => {
    if (!activeProject || !activePage) return;

    let exportTitle = activeProject.title;
    let exportContent = '';

    if (scope === 'page') {
      exportTitle = `${activeProject.title} - ${activePage.title}`;
      exportContent = `# ${activePage.title}\n\n${activePage.content}`;
    } else {
      exportTitle = activeProject.title;
      exportContent = `# ${activeProject.title}\n*Role: ${activeProject.role.toUpperCase()} | Category: ${activeProject.category}*\n\n${activeProject.description}\n\n---\n\n` +
        activeProject.pages.map((p, idx) => `## Page ${idx + 1}: ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    }

    const payload = {
      title: exportTitle,
      subtitle: `${activeProject.category} • Prepared by ${activeProject.role}`,
      author: 'NEXORA Academic Workspace',
      category: activeProject.category,
      filename: exportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rawText: exportContent,
      sections: parseContentToSections(exportContent)
    };

    try {
      if (format === 'word') {
        showToast('Generating Microsoft Word (.docx) document...', 'info');
        await exportToWordDocument(payload);
        showToast('Microsoft Word document (.docx) exported!', 'success');
      } else if (format === 'pdf') {
        showToast('Generating publication PDF...', 'info');
        exportToPdfDocument(payload);
        showToast('PDF document exported successfully!', 'success');
      } else if (format === 'markdown') {
        exportToMarkdown(payload);
        showToast('Markdown file exported!', 'success');
      } else if (format === 'text') {
        exportToText(payload);
        showToast('Plain text file exported!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to export document. Please check console.', 'error');
    }
  };

  // AI Assistant in Workspace
  const handleAIAssist = async () => {
    if (!aiPrompt.trim() || !activeProject || !activePage) return;

    setIsAiGenerating(true);
    showToast('NEXORA is drafting your academic content...', 'info');

    try {
      const promptDirective = `You are an elite Academic and Research Co-Author assisting a ${activeProject.role} in project "${activeProject.title}" (Category: ${activeProject.category}).
Current Document Title: "${activePage.title}"
Current Page Content Context:
"""
${activePage.content.slice(0, 3000)}
"""

User Request:
${aiPrompt}

Directive: Provide high-caliber, publication-grade academic text with clear standalone markdown headings (e.g. ## Heading), rigorous analytical depth, data tables where applicable, and structured paragraphs.`;

      let generated = '';
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptDirective, tone: 'academic' })
        });
        const data = await res.json();
        if (res.ok && data.text) {
          generated = data.text;
        } else {
          throw new Error('Fallback to Puter');
        }
      } catch {
        generated = await puterChat(promptDirective, 'gpt-4o-mini');
      }

      if (generated) {
        updateProjectPage(activeProject.id, activePageIndex, {
          content: activePage.content + `\n\n---\n\n### AI Synthesis: ${aiPrompt}\n\n${generated}`
        });
        showToast('Academic synthesis generated and appended!', 'success');
        setAiPrompt('');
        setShowAIDialog(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate AI content', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Create Project
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProj = createWorkspaceProject({
      title: newProjectTitle.trim(),
      role: newProjectRole,
      category: newProjectCategory.trim() || 'General Academic Research',
      description: newProjectDesc.trim() || 'Comprehensive academic research project and manuscript workspace.',
      pages: [
        {
          id: `page-${Date.now()}-1`,
          title: '1. Abstract & Executive Summary',
          content: `## ${newProjectTitle.trim()}\n*Author: NEXORA Scholar | Role: ${newProjectRole.toUpperCase()}*\n\n### 1. Abstract & Research Scope\nIntroduce the core hypotheses, empirical context, and methodological objectives here...\n\n### 2. Primary Objectives\n- Objective 1: Systematic literature analysis\n- Objective 2: Experimental validation & anatomical structure synthesis\n- Objective 3: Comparative data reporting\n`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `page-${Date.now()}-2`,
          title: '2. Literature Review & Methodology',
          content: `### 2. Literature Review & Theoretical Framework\nSynthesize pertinent literature, citations, and analytical frameworks here...\n\n### 3. Empirical Methodology & Experimental Setup\nDetail the experimental protocols, materials, observational matrices, and diagnostic criteria.\n`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    });

    setNewProjectTitle('');
    setNewProjectCategory('');
    setNewProjectDesc('');
    setShowNewProjectModal(false);
    showToast(`Created project "${newProj.title}" with 2 starter pages!`, 'success');
  };

  // Filtered Projects
  const filteredProjects = workspaceProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || p.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toast Notification */}
      {notificationToast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold transition-all transform duration-300 ${
          notificationToast.type === 'success' ? 'bg-emerald-600 text-white' :
          notificationToast.type === 'info' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <FileCheck className="w-4 h-4" />
          <span>{notificationToast.message}</span>
        </div>
      )}

      {/* Top Workspace Navigation Bar */}
      <header className="h-16 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-900 dark:bg-purple-800 text-amber-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                {activeProject ? activeProject.title : 'Academic Research Workspace'}
              </h1>
              {activeProject && (
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {activeProject.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
              {activeProject ? `${activeProject.category} • ${activeProject.pages.length} Pages • ${activeProject.uploadedDocuments.length} Attached Docs` : 'Comprehensive writing & research suite'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Portal Switcher: Draw & Label + Infographic Studio */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-slate-600/60">
            <button
              onClick={() => setCurrentView('draw-label')}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Transition to Draw & Label Studio (Euglena, Cells, Anatomy, Chemical Structures)"
            >
              <Microscope className="w-3.5 h-3.5 text-amber-300" />
              <span>Draw & Label Portal</span>
            </button>
            <button
              onClick={() => setCurrentView('infographic')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Transition to Infographic Studio (Visual comparative pillars & diagrams)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-200" />
              <span>Infographic Portal</span>
            </button>
          </div>

          {/* Universal Document Upload */}
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleUniversalUpload}
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.tsv,.json,.xml,.tex,.html,.js,.ts,.py,image/*" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingDoc}
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Upload any file format (PDF, DOCX, TXT, CSV, JSON, Images) to include in research"
          >
            {isUploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="hidden md:inline">Upload Docs</span>
          </button>

          {/* AI Co-Author */}
          <button
            onClick={() => setShowAIDialog(true)}
            className="px-3 py-2 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Prompt AI Co-Author to draft or expand research sections"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">AI Co-Author</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-amber-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Export Current Page
              </div>
              <button 
                onClick={() => handleExport('word', 'page')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 flex items-center gap-2 font-medium"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Word Document (.docx)</span>
              </button>
              <button 
                onClick={() => handleExport('pdf', 'page')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 flex items-center gap-2 font-medium"
              >
                <FileDown className="w-4 h-4 text-rose-600" />
                <span>Publication PDF (.pdf)</span>
              </button>
              <button 
                onClick={() => handleExport('markdown', 'page')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
              >
                <FileCode className="w-4 h-4 text-slate-600" />
                <span>Markdown (.md)</span>
              </button>
              
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1.5" />
              
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Export Full Project ({activeProject?.pages.length || 0} Pages)
              </div>
              <button 
                onClick={() => handleExport('word', 'project')}
                className="w-full px-3 py-2 text-left text-xs text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 flex items-center gap-2 font-bold"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Complete Project (.docx)</span>
              </button>
              <button 
                onClick={() => handleExport('pdf', 'project')}
                className="w-full px-3 py-2 text-left text-xs text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 flex items-center gap-2 font-bold"
              >
                <FileDown className="w-4 h-4 text-purple-600" />
                <span>Complete Project (.pdf)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Writing Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Projects Explorer & Pages Manager */}
        <aside className="w-72 md:w-80 bg-white dark:bg-slate-800/90 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 overflow-hidden">
          
          {/* Projects Switcher Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FolderKanban className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <span>Workspaces & Projects</span>
              </div>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="p-1 px-2 text-[11px] font-bold bg-purple-900 text-amber-400 hover:bg-purple-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                title="Create New Project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {(['all', 'teacher', 'researcher', 'student', 'academic'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-2 py-0.5 rounded-full capitalize whitespace-nowrap transition-colors font-semibold ${
                    selectedRoleFilter === role 
                      ? 'bg-purple-900 text-white dark:bg-purple-700' 
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List Carousel/Accordion */}
          <div className="max-h-48 overflow-y-auto border-b border-slate-100 dark:border-slate-700 p-2 space-y-1">
            {filteredProjects.map(proj => {
              const isActive = proj.id === activeProject?.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setActiveProjectId(proj.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border text-left flex items-start justify-between group ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold truncate">{proj.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-400">
                      <span className="font-semibold uppercase text-purple-600 dark:text-purple-400">{proj.role}</span>
                      <span>•</span>
                      <span>{proj.pages.length} pages</span>
                    </div>
                  </div>

                  {workspaceProjects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.title}"?`)) {
                          deleteWorkspaceProject(proj.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unlimited Pages List for Active Project */}
          {activeProject && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Document Pages ({activeProject.pages.length})</span>
                </div>
                <button
                  onClick={() => addPageToProject(activeProject.id)}
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Add unlimited new page to project"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Page</span>
                </button>
              </div>

              {/* Pages Scroll List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {activeProject.pages.map((pg, idx) => {
                  const isCurrent = idx === activePageIndex;
                  return (
                    <div
                      key={pg.id}
                      onClick={() => updateWorkspaceProject(activeProject.id, { activePageIndex: idx })}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs truncate">{pg.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeProject.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProjectPage(activeProject.id, idx);
                            }}
                            className="p-1 hover:text-rose-600 text-slate-400 rounded"
                            title="Delete page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attached Universal Documents Explorer */}
              {activeProject.uploadedDocuments.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 max-h-36 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Attached Docs ({activeProject.uploadedDocuments.length})</span>
                  </div>
                  <div className="space-y-1">
                    {activeProject.uploadedDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="px-1 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-[9px] font-bold uppercase">
                            {doc.type}
                          </span>
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (activePage) {
                                updateProjectPage(activeProject.id, activePageIndex, {
                                  content: activePage.content + `\n\n---\n\n### Document Data: ${doc.name}\n\n${doc.text}`
                                });
                                showToast(`Inserted ${doc.name} into document!`, 'success');
                              }
                            }}
                            className="p-1 hover:text-indigo-600 text-slate-400"
                            title="Insert document text into page"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteUploadedDocFromProject(activeProject.id, doc.id)}
                            className="p-1 hover:text-rose-600 text-slate-400"
                            title="Remove attached doc"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Center & Right: Document Editor, Word Formatting Toolbar, & View Panes */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-100/70 dark:bg-slate-900 overflow-hidden">
          
          {/* Word Formatting Toolbar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 px-4 flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0">
            {/* Left Formatting Group */}
            <div className="flex items-center flex-wrap gap-1">
              {/* Heading Levels */}
              <button
                onClick={() => insertFormatting('# ', '', 'Heading 1')}
                className="p-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Heading 1 (Main Section Title)"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('## ', '', 'Heading 2')}
                className="p-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Heading 2 (Sub-section)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('### ', '', 'Heading 3')}
                className="p-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Heading 3 (Sub-heading)"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Bold, Italic, Underline, Strikethrough */}
              <button
                onClick={() => insertFormatting('**', '**', 'bold text')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*', 'italic text')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~', 'strikethrough text')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Lists & Quotes */}
              <button
                onClick={() => insertFormatting('- ', '', 'Bullet item')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Bulleted List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('> ', '', 'Academic citation or quote')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Blockquote / Citation"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Insert Table */}
              <button
                onClick={() => setShowInsertTableModal(true)}
                className="p-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                title="Insert Academic Data Table"
              >
                <Table className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">Table</span>
              </button>

              {/* Insert Draw & Label Diagram */}
              <button
                onClick={() => setShowImportDiagramModal(true)}
                className="p-1.5 px-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-lg flex items-center gap-1"
                title="Import Draw & Label Diagram Content with Anatomical Labels"
              >
                <Microscope className="w-4 h-4 text-purple-600" />
                <span className="hidden lg:inline">Draw & Label</span>
              </button>

              {/* Insert Infographic */}
              <button
                onClick={() => setShowImportInfographicModal(true)}
                className="p-1.5 px-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                title="Import Infographic and Statistical Charts"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="hidden lg:inline">Infographic</span>
              </button>
            </div>

            {/* Right View Modes (Edit, Preview, Split, Word Paper Mode) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button
                onClick={() => setEditorMode('edit')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  editorMode === 'edit' ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Markdown / Raw Code Editor"
              >
                <Edit className="w-3.5 h-3.5 inline mr-1" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setEditorMode('split')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  editorMode === 'split' ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Side-by-side Edit and Live Academic Preview"
              >
                <SplitSquareVertical className="w-3.5 h-3.5 inline mr-1" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  editorMode === 'preview' ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Formatted Reading View"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setEditorMode('word-page')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  editorMode === 'word-page' ? 'bg-purple-900 text-amber-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Realistic Word Paper Document View"
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                <span>Word Doc</span>
              </button>
            </div>
          </div>

          {/* Page Title Header Bar */}
          {activePage && (
            <div className="bg-white dark:bg-slate-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Page Title:</span>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handlePageTitleChange(e.target.value)}
                  placeholder="Enter Page Title..."
                  className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:ring-0 p-0 w-full"
                />
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Last modified: {new Date(activePage.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Editor Workspace Canvas depending on View Mode */}
          <div className="flex-1 flex overflow-hidden">
            {activePage ? (
              <>
                {/* Edit Textarea Pane */}
                {(editorMode === 'edit' || editorMode === 'split') && (
                  <div className={`h-full flex flex-col ${editorMode === 'split' ? 'w-1/2 border-r border-slate-200 dark:border-slate-700' : 'w-full'}`}>
                    <textarea
                      ref={textareaRef}
                      value={activePage.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Start drafting your research project, lesson notes, or manuscript here. Supports full Markdown, Headings, Tables, LaTeX formulas, and imported Draw & Label diagrams..."
                      className="flex-1 w-full p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none border-none overflow-y-auto"
                      spellCheck="false"
                    />
                  </div>
                )}

                {/* Live Formatted Academic Preview Pane */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className={`h-full overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 ${editorMode === 'split' ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-full">
                      <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        <Markdown remarkPlugins={[remarkGfm]} components={workspaceMarkdownComponents}>
                          {activePage.content}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Microsoft Word Document Paper Layout Mode */}
                {editorMode === 'word-page' && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/90 dark:bg-slate-950 flex flex-col items-center">
                    {/* Top Document Paper Controls Bar */}
                    <div className="w-full max-w-4xl mb-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-900 dark:text-amber-400 font-bold">Word Document Canvas</span>
                        <span className="text-slate-400">•</span>
                        <span>Page {activePageIndex + 1} of {activeProject.pages.length}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsContinuousView(!isContinuousView)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                            isContinuousView 
                              ? 'bg-purple-900 text-amber-300 border-purple-900' 
                              : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                          }`}
                          title="View all document pages sequentially"
                        >
                          {isContinuousView ? 'Single Page View' : 'Continuous View (All Pages)'}
                        </button>
                        <button
                          onClick={() => setIsQuickEditing(!isQuickEditing)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                            isQuickEditing 
                              ? 'bg-amber-500 text-purple-950 border-amber-500 font-bold' 
                              : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                          }`}
                          title="Toggle inline quick text editor on paper"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{isQuickEditing ? 'Done Editing' : 'Edit Text on Page'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Continuous Multi-Page View vs Single Page View */}
                    {isContinuousView ? (
                      <div className="w-full max-w-4xl space-y-8 pb-16">
                        {activeProject.pages.map((pg, pIdx) => (
                          <div 
                            key={pg.id}
                            className="w-full min-h-[900px] h-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8 sm:p-14 shadow-xl rounded-xl border border-slate-300 dark:border-slate-700 font-sans leading-relaxed relative flex flex-col justify-between"
                          >
                            <div>
                              {/* Word Header */}
                              <div className="flex justify-between items-center text-[11px] text-slate-400 font-sans uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                                <span className="font-bold text-purple-900 dark:text-purple-400">{activeProject.title}</span>
                                <span>{activeProject.category}</span>
                              </div>

                              {/* Document Page Title */}
                              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
                                {pg.title}
                              </h1>
                              <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-6">
                                Academic Unit: {activeProject.role.toUpperCase()} • Section {pIdx + 1}
                              </div>
                              <div className="h-0.5 w-full bg-purple-900/40 dark:bg-purple-400/40 mb-8" />

                              {/* Formatted Page Content */}
                              <div className="text-slate-800 dark:text-slate-200 font-sans text-[15px] leading-relaxed">
                                <Markdown remarkPlugins={[remarkGfm]} components={workspaceMarkdownComponents}>
                                  {pg.content}
                                </Markdown>
                              </div>
                            </div>

                            {/* Word Footer */}
                            <div className="mt-16 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                              <span>NEXORA ACADEMIC RESEARCH WORKSPACE</span>
                              <span>Page {pIdx + 1} of {activeProject.pages.length}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Single Sheet Simulated Word Page (Expands smoothly with content, never cuts off) */
                      <div className="w-full max-w-4xl min-h-[1100px] h-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8 sm:p-14 shadow-2xl rounded-xl border border-slate-300 dark:border-slate-700 font-sans leading-relaxed relative flex flex-col justify-between mb-16">
                        <div>
                          {/* Word Header */}
                          <div className="flex justify-between items-center text-[11px] text-slate-400 font-sans uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                            <span className="font-bold text-purple-900 dark:text-purple-400 truncate max-w-sm">{activeProject?.title || 'ACADEMIC RESEARCH MANUSCRIPT'}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>

                          {/* Document Title */}
                          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
                            {activePage.title}
                          </h1>
                          <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-6">
                            Prepared for: {activeProject?.role.toUpperCase()} • Field: {activeProject?.category}
                          </div>
                          <div className="h-0.5 w-full bg-purple-900/40 dark:bg-purple-400/40 mb-8" />

                          {/* In-Place Quick Editor or Visual Markdown */}
                          {isQuickEditing ? (
                            <div className="space-y-3">
                              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                                <span>Editing Page Text Directly. Click "Done Editing" when finished.</span>
                                <button
                                  onClick={() => setIsQuickEditing(false)}
                                  className="px-2.5 py-1 bg-purple-900 text-amber-400 rounded-md font-bold hover:bg-purple-800"
                                >
                                  Done
                                </button>
                              </div>
                              <textarea
                                ref={quickTextareaRef}
                                value={activePage.content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                rows={24}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-900 resize-y"
                              />
                            </div>
                          ) : (
                            /* Formatted Content with Clean Custom Typography & Tables */
                            <div className="text-slate-800 dark:text-slate-200 font-sans text-[15px] leading-relaxed">
                              <Markdown remarkPlugins={[remarkGfm]} components={workspaceMarkdownComponents}>
                                {activePage.content}
                              </Markdown>
                            </div>
                          )}
                        </div>

                        {/* Word Page Footer & Page Navigation Controls */}
                        <div className="mt-16 pt-6 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                disabled={activePageIndex === 0}
                                onClick={() => updateWorkspaceProject(activeProject.id, { activePageIndex: activePageIndex - 1 })}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                              >
                                ← Previous Page
                              </button>
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Page {activePageIndex + 1} of {activeProject.pages.length}
                              </span>
                              <button
                                disabled={activePageIndex === activeProject.pages.length - 1}
                                onClick={() => updateWorkspaceProject(activeProject.id, { activePageIndex: activePageIndex + 1 })}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                              >
                                Next Page →
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => addPageToProject(activeProject.id)}
                                className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 text-purple-900 dark:text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add New Page</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                            <span>NEXORA ACADEMIC RESEARCH WORKSPACE</span>
                            <span>{activeProject.category} • {activeProject.role.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                <FolderKanban className="w-12 h-12 mb-3 text-purple-900/40" />
                <p className="text-sm font-semibold">Select or create a page to begin editing</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: Create New Project */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-900 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Research Project</h3>
              </div>
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Investigation of Mitochondrial Electron Transport Chain"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Role
                  </label>
                  <select
                    value={newProjectRole}
                    onChange={(e) => setNewProjectRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-900 capitalize"
                  >
                    <option value="researcher">Researcher</option>
                    <option value="teacher">Teacher / Instructor</option>
                    <option value="student">Student</option>
                    <option value="academic">Academic Author</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Field / Category
                  </label>
                  <input
                    type="text"
                    value={newProjectCategory}
                    onChange={(e) => setNewProjectCategory(e.target.value)}
                    placeholder="e.g. Molecular Biology"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scope / Research Objectives
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Summarize the core research aims, class curriculum objectives, or thesis question..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm h-20 focus:ring-2 focus:ring-purple-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-900 text-amber-400 hover:bg-purple-800 rounded-xl shadow-md transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Insert Table */}
      {showInsertTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Insert Academic Data Table</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInsertTableModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertTable}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Draw & Label Diagram Content */}
      {showImportDiagramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-900 dark:bg-purple-700 text-amber-300 flex items-center justify-center shadow-xs">
                  <Microscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Draw & Label Diagram</h3>
                  <p className="text-[11px] text-slate-400">Import biological, anatomical, and chemical structures with verified labels into a specific document page</p>
                </div>
              </div>
              <button onClick={() => setShowImportDiagramModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold">✕</button>
            </div>

            {/* Target Page Selector & Draw Button Bar */}
            {activeProject && (
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200">Target Page:</span>
                  <select
                    value={diagramModalTargetPage}
                    onChange={(e) => setDiagramModalTargetPage(Number(e.target.value))}
                    className="bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-purple-900 dark:text-purple-200 outline-none shadow-xs"
                  >
                    {activeProject.pages.map((p, idx) => (
                      <option key={p.id} value={idx}>
                        Page {idx + 1}: {p.title.slice(0, 30)}
                      </option>
                    ))}
                    <option value={activeProject.pages.length}>
                      + Create as New Page ({activeProject.pages.length + 1})
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowImportDiagramModal(false);
                    setCurrentView('draw-label');
                  }}
                  className="px-3 py-1.5 bg-purple-900 text-amber-300 hover:bg-purple-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open Draw & Label Studio</span>
                </button>
              </div>
            )}

            {/* Tabs & Search Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button
                  onClick={() => setDiagramModalTab('library')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    diagramModalTab === 'library'
                      ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Scientific Library ({SCIENTIFIC_LIBRARY_ITEMS.length})
                </button>
                <button
                  onClick={() => setDiagramModalTab('saved')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    diagramModalTab === 'saved'
                      ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  My Saved Diagrams ({savedDiagrams.length})
                </button>
              </div>

              {diagramModalTab === 'library' && (
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={diagramModalSearch}
                    onChange={(e) => setDiagramModalSearch(e.target.value)}
                    placeholder="Search Euglena, Amoeba, Cell..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
              {diagramModalTab === 'library' ? (
                SCIENTIFIC_LIBRARY_ITEMS
                  .filter(diag => {
                    if (!diagramModalSearch.trim()) return true;
                    const q = diagramModalSearch.toLowerCase();
                    return diag.title.toLowerCase().includes(q) || diag.category.toLowerCase().includes(q) || diag.description.toLowerCase().includes(q);
                  })
                  .map(diag => (
                    <div
                      key={diag.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{diag.title}</h4>
                          <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-[10px] font-bold shrink-0">
                            {diag.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{diag.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{diag.pins.length} anatomical labels</span>
                          <span>•</span>
                          <span>Domain: {diag.domain}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const pinRows = diag.pins.map(p => `| **#${p.number}** | **${p.name}** | ${p.category} | ${p.functionSummary || p.detailedNotes || 'Key anatomical structure'} |`).join('\n');
                          const md = `\n\n### Scientific Anatomical Figure: ${diag.title}\n` +
                            `*Category: ${diag.category} • ${diag.pins.length} Verified Anatomical Structures*\n\n` +
                            `> ${diag.description || 'Detailed scientific anatomical visualization with structural labels.'}\n\n` +
                            (diag.funFact ? `> **Key Scientific Insight:** ${diag.funFact}\n\n` : '') +
                            `#### Anatomical & Structural Pins\n\n` +
                            `| Pin # | Anatomical Structure | Morphological Category | Physiological Function |\n` +
                            `|---|---|---|---|\n` +
                            pinRows + '\n\n';

                          if (activeProject) {
                            if (diagramModalTargetPage >= activeProject.pages.length) {
                              // Create as new page
                              const newPageNumber = activeProject.pages.length + 1;
                              const newPage: WorkspacePage = {
                                id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                                title: `${diag.title}`,
                                content: `# ${diag.title}\n\n${md}`,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                                pageNumber: newPageNumber
                              };
                              const updatedPages = [...activeProject.pages, newPage];
                              updateWorkspaceProject(activeProject.id, {
                                pages: updatedPages,
                                activePageIndex: updatedPages.length - 1
                              });
                              showToast(`Created new Page ${newPageNumber} with "${diag.title}"!`, 'success');
                            } else {
                              const targetPage = activeProject.pages[diagramModalTargetPage];
                              if (targetPage) {
                                updateProjectPage(activeProject.id, diagramModalTargetPage, {
                                  content: targetPage.content + md
                                });
                                updateWorkspaceProject(activeProject.id, { activePageIndex: diagramModalTargetPage });
                                showToast(`Imported "${diag.title}" into Page ${diagramModalTargetPage + 1}!`, 'success');
                              }
                            }
                            setShowImportDiagramModal(false);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-purple-900 text-amber-300 hover:bg-purple-800 rounded-lg shadow-xs shrink-0 cursor-pointer"
                      >
                        Insert into Page {diagramModalTargetPage >= (activeProject?.pages.length || 0) ? `(New)` : diagramModalTargetPage + 1}
                      </button>
                    </div>
                  ))
              ) : (
                savedDiagrams.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-xs mb-2">No saved user diagrams yet.</p>
                    <button
                      onClick={() => {
                        setShowImportDiagramModal(false);
                        setCurrentView('draw-label');
                      }}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 underline"
                    >
                      Open Draw & Label Studio to draw & save custom structures
                    </button>
                  </div>
                ) : (
                  savedDiagrams.map(diag => (
                    <div
                      key={diag.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{diag.title}</h4>
                        <p className="text-[11px] text-slate-400">{diag.category} • {diag.pins.length} anatomical labels</p>
                      </div>
                      <button
                        onClick={() => {
                          const pinRows = diag.pins.map(p => `| **#${p.number}** | **${p.name}** | ${p.category} | ${p.functionSummary || p.detailedNotes || 'Key anatomical structure'} |`).join('\n');
                          const md = `\n\n### Scientific Anatomical Figure: ${diag.title}\n` +
                            `*Category: ${diag.category}*\n\n` +
                            `> ${diag.description || 'Detailed scientific anatomical visualization with structural labels.'}\n\n` +
                            `| Pin # | Anatomical Structure | Morphological Category | Physiological Function |\n` +
                            `|---|---|---|---|\n` +
                            pinRows + '\n\n';

                          if (activeProject) {
                            if (diagramModalTargetPage >= activeProject.pages.length) {
                              const newPage: WorkspacePage = {
                                id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                                title: `${diag.title}`,
                                content: `# ${diag.title}\n\n${md}`,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                                pageNumber: activeProject.pages.length + 1
                              };
                              const updatedPages = [...activeProject.pages, newPage];
                              updateWorkspaceProject(activeProject.id, {
                                pages: updatedPages,
                                activePageIndex: updatedPages.length - 1
                              });
                              showToast(`Created new Page with "${diag.title}"!`, 'success');
                            } else {
                              const targetPage = activeProject.pages[diagramModalTargetPage];
                              if (targetPage) {
                                updateProjectPage(activeProject.id, diagramModalTargetPage, {
                                  content: targetPage.content + md
                                });
                                updateWorkspaceProject(activeProject.id, { activePageIndex: diagramModalTargetPage });
                                showToast(`Imported "${diag.title}" into Page ${diagramModalTargetPage + 1}!`, 'success');
                              }
                            }
                            setShowImportDiagramModal(false);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-purple-900 text-amber-400 hover:bg-purple-800 rounded-lg shadow-xs shrink-0 cursor-pointer"
                      >
                        Insert into Page {diagramModalTargetPage >= (activeProject?.pages.length || 0) ? `(New)` : diagramModalTargetPage + 1}
                      </button>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowImportDiagramModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Infographic Content */}
      {showImportInfographicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Infographic Content</h3>
                  <p className="text-[11px] text-slate-400">Import structured visual infographics, comparative tables, and data pillars into your document</p>
                </div>
              </div>
              <button onClick={() => setShowImportInfographicModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold">✕</button>
            </div>

            {/* Target Page Selector & Launch Studio */}
            {activeProject && (
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Target Page:</span>
                  <select
                    value={infographicModalTargetPage}
                    onChange={(e) => setInfographicModalTargetPage(Number(e.target.value))}
                    className="bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-900 dark:text-indigo-200 outline-none shadow-xs"
                  >
                    {activeProject.pages.map((p, idx) => (
                      <option key={p.id} value={idx}>
                        Page {idx + 1}: {p.title.slice(0, 30)}
                      </option>
                    ))}
                    <option value={activeProject.pages.length}>
                      + Create as New Page ({activeProject.pages.length + 1})
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowImportInfographicModal(false);
                    setCurrentView('infographic');
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Open Infographic Studio</span>
                </button>
              </div>
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
              {savedInfographics.length === 0 ? (
                <div className="space-y-2">
                  {/* Preset Infographic Card 1 */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Saturated Hydrocarbons & Alkane Series</h4>
                      <p className="text-[11px] text-slate-400">Single covalent bonds (C—C & C—H) in ethane, propane, and methane</p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">4 Pillar Sections • Saturated Hydrocarbons</span>
                    </div>
                    <button
                      onClick={() => {
                        const md = `\n\n### Infographic Summary: Saturated Hydrocarbons & Alkane Series\n` +
                          `*Single covalent bonds (C—C & C—H) in carbon chains*\n\n` +
                          `> Saturated hydrocarbons are hydrocarbons consisting of carbon chains with single bonds between them, in which carbon joins with another carbon by a single covalent bond, e.g., alkanes (like ethane C2H6, propane C3H8).\n\n` +
                          `#### Section 1: Ethane (C₂H₆)\nTwo carbons joined by a single covalent bond (C—C) with six C—H single bonds.\n- **C—C Bond:** 1.54 Å\n- **Angle:** 109.5°\n\n` +
                          `#### Section 2: Propane (C₃H₈)\nThree carbons in a single-bonded chain (C—C—C) surrounded by eight hydrogens.\n- **C—C Bond:** 1.54 Å\n- **State:** Gas\n\n` +
                          `#### Section 3: Methane (CH₄)\nSimplest alkane with one central carbon bonded to four hydrogens.\n- **Dipole:** 0.00 D\n- **Geometry:** Tetrahedral\n\n` +
                          `#### Section 4: Single Covalent Bonds\nStrong sigma (σ) bonds with free conformational rotation around C—C axes.\n- **Hybridization:** sp³\n- **Bond Energy:** 347 kJ/mol\n\n` +
                          `**Conclusion:** Because carbon forms four single sigma bonds with sp³ tetrahedral angles (109.5°), saturated hydrocarbons possess high chemical stability and undergo substitution rather than addition reactions.\n\n`;

                        if (activeProject) {
                          if (infographicModalTargetPage >= activeProject.pages.length) {
                            const newPage: WorkspacePage = {
                              id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                              title: `Saturated Hydrocarbons & Alkanes`,
                              content: `# Saturated Hydrocarbons\n\n${md}`,
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                              pageNumber: activeProject.pages.length + 1
                            };
                            const updatedPages = [...activeProject.pages, newPage];
                            updateWorkspaceProject(activeProject.id, {
                              pages: updatedPages,
                              activePageIndex: updatedPages.length - 1
                            });
                            showToast(`Created new Page with Hydrocarbons Infographic!`, 'success');
                          } else {
                            const targetPage = activeProject.pages[infographicModalTargetPage];
                            if (targetPage) {
                              updateProjectPage(activeProject.id, infographicModalTargetPage, {
                                content: targetPage.content + md
                              });
                              updateWorkspaceProject(activeProject.id, { activePageIndex: infographicModalTargetPage });
                              showToast(`Imported infographic into Page ${infographicModalTargetPage + 1}!`, 'success');
                            }
                          }
                          setShowImportInfographicModal(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs shrink-0 cursor-pointer"
                    >
                      Insert into Page {infographicModalTargetPage >= (activeProject?.pages.length || 0) ? `(New)` : infographicModalTargetPage + 1}
                    </button>
                  </div>

                  {/* Preset Infographic Card 2 */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Molecular Geometries & VSEPR Theory</h4>
                      <p className="text-[11px] text-slate-400">Comparing sp³ hybridized structural symmetries of Methane (AX₄) vs Water (AX₂E₂)</p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Comparison Matrix • Stereochemistry</span>
                    </div>
                    <button
                      onClick={() => {
                        const md = `\n\n### Infographic Summary: Molecular Geometries & VSEPR Theory\n` +
                          `*Analyzing textbook structural formulas, stereochemistry, and bond angles*\n\n` +
                          `> A direct comparison of the sp³ hybridized structural symmetries of Methane (AX₄) and Water (AX₂E₂).\n\n` +
                          `#### Section 1: Methane (CH₄)\nSymmetrical tetrahedral projection on a 2D plane.\n- **Net Dipole:** 0.00 D\n- **Angle:** 109.5°\n\n` +
                          `#### Section 2: Water (H₂O)\nBent molecular geometry with two non-bonding lone pairs repelling bond pairs.\n- **Net Dipole:** 1.85 D\n- **Angle:** 104.5°\n\n` +
                          `**Conclusion:** While both utilize sp³ hybridization, non-bonding electron lone pairs on oxygen compress the bond angles from 109.5° down to 104.5°, directly altering polarity and macroscopic properties.\n\n`;

                        if (activeProject) {
                          if (infographicModalTargetPage >= activeProject.pages.length) {
                            const newPage: WorkspacePage = {
                              id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                              title: `Molecular Geometries & VSEPR`,
                              content: `# Molecular Geometries\n\n${md}`,
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                              pageNumber: activeProject.pages.length + 1
                            };
                            const updatedPages = [...activeProject.pages, newPage];
                            updateWorkspaceProject(activeProject.id, {
                              pages: updatedPages,
                              activePageIndex: updatedPages.length - 1
                            });
                            showToast(`Created new Page with VSEPR Infographic!`, 'success');
                          } else {
                            const targetPage = activeProject.pages[infographicModalTargetPage];
                            if (targetPage) {
                              updateProjectPage(activeProject.id, infographicModalTargetPage, {
                                content: targetPage.content + md
                              });
                              updateWorkspaceProject(activeProject.id, { activePageIndex: infographicModalTargetPage });
                              showToast(`Imported infographic into Page ${infographicModalTargetPage + 1}!`, 'success');
                            }
                          }
                          setShowImportInfographicModal(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs shrink-0 cursor-pointer"
                    >
                      Insert into Page {infographicModalTargetPage >= (activeProject?.pages.length || 0) ? `(New)` : infographicModalTargetPage + 1}
                    </button>
                  </div>
                </div>
              ) : (
                savedInfographics.map(info => (
                  <div
                    key={info.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{info.title}</h4>
                      <p className="text-[11px] text-slate-400">{info.sections?.length || 0} visual sections</p>
                    </div>
                    <button
                      onClick={() => {
                        let secMd = '';
                        info.sections.forEach((sec, idx) => {
                          secMd += `\n#### Section ${idx + 1}: ${sec.title}\n${sec.description}\n`;
                          if (sec.metrics && sec.metrics.length > 0) {
                            secMd += sec.metrics.map(m => `- **${m.label}:** ${m.value}`).join('\n') + '\n';
                          }
                          if (sec.points && sec.points.length > 0) {
                            secMd += sec.points.map(p => `- ${p}`).join('\n') + '\n';
                          }
                        });

                        const md = `\n\n### Infographic Summary: ${info.title}\n` +
                          `*Style: ${info.style} • Palette: ${info.palette}*\n\n` +
                          `> ${info.summary}\n\n` +
                          secMd +
                          (info.conclusion ? `\n**Conclusion:** ${info.conclusion}\n\n` : '');

                        if (activeProject) {
                          if (infographicModalTargetPage >= activeProject.pages.length) {
                            const newPage: WorkspacePage = {
                              id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                              title: `${info.title}`,
                              content: `# ${info.title}\n\n${md}`,
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                              pageNumber: activeProject.pages.length + 1
                            };
                            const updatedPages = [...activeProject.pages, newPage];
                            updateWorkspaceProject(activeProject.id, {
                              pages: updatedPages,
                              activePageIndex: updatedPages.length - 1
                            });
                            showToast(`Created new Page with "${info.title}"!`, 'success');
                          } else {
                            const targetPage = activeProject.pages[infographicModalTargetPage];
                            if (targetPage) {
                              updateProjectPage(activeProject.id, infographicModalTargetPage, {
                                content: targetPage.content + md
                              });
                              updateWorkspaceProject(activeProject.id, { activePageIndex: infographicModalTargetPage });
                              showToast(`Imported infographic into Page ${infographicModalTargetPage + 1}!`, 'success');
                            }
                          }
                          setShowImportInfographicModal(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs shrink-0 cursor-pointer"
                    >
                      Insert into Page {infographicModalTargetPage >= (activeProject?.pages.length || 0) ? `(New)` : infographicModalTargetPage + 1}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowImportInfographicModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Co-Author Dialog */}
      {showAIDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Academic Co-Author</h3>
              </div>
              <button onClick={() => setShowAIDialog(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Direct NEXORA to draft extensive research paragraphs, synthesize attached documents, create lesson plans, or formulate hypotheses.
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Draft a 4-paragraph comprehensive literature review comparing prokaryotic and eukaryotic ribosomal translation mechanisms with citations..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm h-28 focus:ring-2 focus:ring-purple-900 resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAIDialog(false)}
                className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAIAssist}
                disabled={!aiPrompt.trim() || isAiGenerating}
                className="px-5 py-2 text-xs font-bold bg-purple-900 text-amber-400 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-md flex items-center gap-2"
              >
                {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isAiGenerating ? 'Drafting...' : 'Generate Content'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
