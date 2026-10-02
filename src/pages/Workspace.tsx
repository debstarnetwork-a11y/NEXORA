import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  BarChart3,
  Highlighter,
  Baseline,
  Type,
  CaseSensitive,
  Palette,
  Calendar,
  ListTree,
  BookMarked,
  Split,
  ArrowRight,
  Bot,
  Cpu,
  FilePlus,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Wand2,
  AlertTriangle
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { useAppStore } from '../store';
import { WorkspaceProject, WorkspacePage, WorkspaceUploadedDoc, DiagramConcept, InfographicData } from '../types';
import { SCIENTIFIC_PRESETS_REGISTRY } from '../lib/scientificRegistry';
import { generatePresetSVGDataUrl } from '../lib/diagramSvgExporter';
import { 
  exportToWordDocument, 
  exportToPdfDocument, 
  exportToMarkdown, 
  exportToText, 
  parseContentToSections 
} from '../lib/documentExport';
import { parseUploadedFile, UploadedDocumentPayload } from '../lib/documentImporter';
import { puterChat } from '../lib/puter';
import { EvidenceMatrixView } from '../components/EvidenceMatrixView';
import { ClaimAuditModal } from '../components/ClaimAuditModal';
import { PreSubmissionAuditModal } from '../components/PreSubmissionAuditModal';
import { SentenceExtensionModal } from '../components/SentenceExtensionModal';
import { detectIncompleteSentenceOrParagraph } from '../lib/sentenceExtensionEngine';
import { ResearchClaim } from '../types';
import { CANONICAL_RESEARCH_SOURCES } from '../lib/researchEvidenceRegistry';
import { extractClaimsFromText } from '../lib/researchIntegrityEngine';

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
  p: ({ children, align, style, className }: any) => {
    const isSpecialAlign = align === 'center' || align === 'right';
    const alignClass = align === 'center' ? 'text-center indent-0' : align === 'right' ? 'text-right indent-0' : align === 'justify' ? 'text-justify' : '';
    const hasIndentClass = className?.includes('indent-');
    const indentStyle = isSpecialAlign || hasIndentClass ? '' : 'indent-6 sm:indent-8';
    return (
      <p style={style} className={`my-3 text-slate-800 dark:text-slate-200 leading-relaxed text-[15.5px] ${alignClass} ${indentStyle} ${className || ''}`}>
        {children}
      </p>
    );
  },
  div: ({ children, align, style, className }: any) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : align === 'justify' ? 'text-justify' : '';
    return (
      <div style={style} className={`my-2 ${alignClass} ${className || ''}`}>
        {children}
      </div>
    );
  },
  span: ({ children, style, className }: any) => (
    <span style={style} className={className}>
      {children}
    </span>
  ),
  mark: ({ children, style, className }: any) => (
    <mark style={style} className={`px-1 py-0.5 rounded font-medium ${className || ''}`}>
      {children}
    </mark>
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
      <figure className="my-5 p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-750 shadow-sm">
        <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800">
          <img
            src={src}
            alt={alt || 'Scientific Figure'}
            className="w-full h-auto object-contain max-h-[580px] transition-transform duration-300 hover:scale-[1.01]"
            loading="lazy"
            {...props}
          />
        </div>
        <figcaption className="mt-2.5 px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            📊 {alt || 'Scientific Anatomical Plate'}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ 100% High-Resolution Vector/Raster (Visible on exported Word doc & device)
          </span>
        </figcaption>
      </figure>
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
    setCurrentView,
    referenceStyle
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

  // Thesis Chapter Builder States
  const [showChapterBuilderModal, setShowChapterBuilderModal] = useState(false);
  const [chapterBuilderTopic, setChapterBuilderTopic] = useState('');
  const [chapterBuilderDegree, setChapterBuilderDegree] = useState<'undergraduate' | 'masters' | 'phd'>('masters');
  const [chapterBuilderField, setChapterBuilderField] = useState('');
  const [chapterBuilderChapter, setChapterBuilderChapter] = useState<string>('1');
  const [chapterBuilderNotes, setChapterBuilderNotes] = useState('');
  const [isChapterGenerating, setIsChapterGenerating] = useState(false);
  const [chapterGenStep, setChapterGenStep] = useState('');

  // Visible AI Model Engine Selector in Workspace
  const [chatEngine, setChatEngine] = useState<string>('gemini-flash');

  // Subheading Academic Extender States
  const [showSubheadingExtenderModal, setShowSubheadingExtenderModal] = useState(false);
  const [selectedSubheading, setSelectedSubheading] = useState('');
  const [customSubheadingInput, setCustomSubheadingInput] = useState('');
  const [subheadingExpansionDepth, setSubheadingExpansionDepth] = useState<'standard' | 'multi-page-deep' | 'exhaustive'>('multi-page-deep');
  const [subheadingCustomNotes, setSubheadingCustomNotes] = useState('');
  const [subheadingAutoNewPage, setSubheadingAutoNewPage] = useState(false);
  const [isSubheadingExpanding, setIsSubheadingExpanding] = useState(false);

  // Cross-Chapter AI Memory & Synthesis States
  const [isGeneratingTOC, setIsGeneratingTOC] = useState(false);
  const [isSynthesizingReferences, setIsSynthesizingReferences] = useState(false);
  const [isConsolidatingThesis, setIsConsolidatingThesis] = useState(false);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [consolidatedThesisText, setConsolidatedThesisText] = useState('');

  // Direct Word & PDF Export Dropdowns
  const [showWordExportDropdown, setShowWordExportDropdown] = useState(false);
  const [showPdfExportDropdown, setShowPdfExportDropdown] = useState(false);
  const wordExportRef = useRef<HTMLDivElement>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);

  // Research Integrity & Verification States
  const [showEvidenceMatrixModal, setShowEvidenceMatrixModal] = useState(false);
  const [showClaimAuditModal, setShowClaimAuditModal] = useState(false);
  const [showPreSubmissionAuditModal, setShowPreSubmissionAuditModal] = useState(false);
  const [activeAuditedClaims, setActiveAuditedClaims] = useState<ResearchClaim[]>([]);

  // Sentence & Paragraph Extension States
  const [showSentenceExtensionModal, setShowSentenceExtensionModal] = useState(false);
  const [sentenceExtensionPrefill, setSentenceExtensionPrefill] = useState('');

  // Automatic Detection of Abruptly Cut-off Sentences or Paragraphs
  const incompleteDetection = useMemo(() => {
    return detectIncompleteSentenceOrParagraph(activePage?.content || '');
  }, [activePage?.content]);

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (wordExportRef.current && !wordExportRef.current.contains(e.target as Node)) {
        setShowWordExportDropdown(false);
      }
      if (pdfExportRef.current && !pdfExportRef.current.contains(e.target as Node)) {
        setShowPdfExportDropdown(false);
      }
    }
    if (isExportMenuOpen || showWordExportDropdown || showPdfExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen, showWordExportDropdown, showPdfExportDropdown]);

  // Table modal state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Word Document Formatting Toolbar States
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showCasePicker, setShowCasePicker] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('12pt');
  const [currentTextColor, setCurrentTextColor] = useState('#0F172A');
  const [currentBgColor, setCurrentBgColor] = useState('#FEF08A');

  // New Project Form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectRole, setNewProjectRole] = useState<'teacher' | 'researcher' | 'student' | 'academic'>('researcher');
  const [newProjectCategory, setNewProjectCategory] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Document Header Editing State (Project Title, Date, Page Title, Prepared for / Field Subtitle)
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState<boolean>(false);
  const [isInlineHeaderEditing, setIsInlineHeaderEditing] = useState<boolean>(false);
  const [headerForm, setHeaderForm] = useState({
    projectTitle: '',
    date: '',
    pageTitle: '',
    role: '',
    category: '',
    customSubtitle: '',
    focusField: '' as 'projectTitle' | 'date' | 'pageTitle' | 'subtitle' | ''
  });

  const getEffectiveDate = (page?: WorkspacePage, project?: WorkspaceProject) => {
    return page?.customDate || project?.customDate || new Date().toLocaleDateString();
  };

  const getEffectiveSubtitle = (page?: WorkspacePage, project?: WorkspaceProject) => {
    if (page?.customSubtitle && page.customSubtitle.trim()) return page.customSubtitle;
    if (project?.customSubtitle && project.customSubtitle.trim()) return project.customSubtitle;
    const roleText = project?.role ? String(project.role).toUpperCase() : 'TEACHER';
    const fieldText = project?.category || 'Cytology & Cell Biology';
    return `Prepared for: ${roleText} • Field: ${fieldText}`;
  };

  const openHeaderModal = (focusField: 'projectTitle' | 'date' | 'pageTitle' | 'subtitle' | '' = '') => {
    if (!activeProject || !activePage) return;
    setHeaderForm({
      projectTitle: activeProject.title || '',
      date: getEffectiveDate(activePage, activeProject),
      pageTitle: activePage.title || '',
      role: activeProject.role || 'teacher',
      category: activeProject.category || '',
      customSubtitle: getEffectiveSubtitle(activePage, activeProject),
      focusField
    });
    setIsHeaderModalOpen(true);
  };

  const handleStartInlineHeaderEditing = () => {
    if (!activeProject || !activePage) return;
    setHeaderForm({
      projectTitle: activeProject.title || '',
      date: getEffectiveDate(activePage, activeProject),
      pageTitle: activePage.title || '',
      role: activeProject.role || 'teacher',
      category: activeProject.category || '',
      customSubtitle: getEffectiveSubtitle(activePage, activeProject),
      focusField: ''
    });
    setIsInlineHeaderEditing(true);
  };

  const handleSaveHeaderForm = () => {
    if (!activeProject || !activePage) return;
    
    const newProjectTitle = headerForm.projectTitle.trim() || activeProject.title;
    const newPageTitle = headerForm.pageTitle.trim() || activePage.title;
    const newDate = headerForm.date.trim() || new Date().toLocaleDateString();
    const newRole = headerForm.role.trim() || activeProject.role;
    const newCategory = headerForm.category.trim() || activeProject.category;
    const newSubtitle = headerForm.customSubtitle.trim() || `Prepared for: ${newRole.toUpperCase()} • Field: ${newCategory}`;

    // Update active project
    updateWorkspaceProject(activeProject.id, {
      title: newProjectTitle,
      role: newRole as any,
      category: newCategory,
      customDate: newDate,
      customSubtitle: newSubtitle
    });

    // Update active page
    updateProjectPage(activeProject.id, activePageIndex, {
      title: newPageTitle,
      customDate: newDate,
      customSubtitle: newSubtitle
    });

    setIsHeaderModalOpen(false);
    setIsInlineHeaderEditing(false);
    showToast('Document header & metadata saved successfully!', 'success');
  };

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

  // Word Document Formatting Helpers
  const applyFontSize = (sizePt: string) => {
    setCurrentFontSize(sizePt);
    insertFormatting(`<span style="font-size: ${sizePt}">`, '</span>', 'Text');
    setShowFontSizePicker(false);
  };

  const applyTextColor = (hex: string) => {
    setCurrentTextColor(hex);
    insertFormatting(`<span style="color: ${hex}">`, '</span>', 'Colored Text');
    setShowColorPicker(false);
  };

  const applyBackgroundColor = (hex: string) => {
    setCurrentBgColor(hex);
    if (hex === 'transparent') {
      insertFormatting('<span>', '</span>', 'Text');
    } else {
      insertFormatting(`<mark style="background-color: ${hex}; color: #0F172A">`, '</mark>', 'Highlighted Text');
    }
    setShowBgColorPicker(false);
  };

  const applyTextCase = (caseType: 'upper' | 'lower' | 'title' | 'sentence') => {
    setShowCasePicker(false);
    if (!activePage || !activeProject) return;
    const targetRef = textareaRef.current || quickTextareaRef.current;
    if (targetRef) {
      const el = targetRef;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const currentVal = activePage.content;
      const selectedText = currentVal.substring(start, end);
      if (!selectedText) {
        showToast('Select text first to change case (Aa)', 'info');
        return;
      }
      let transformed = selectedText;
      if (caseType === 'upper') {
        transformed = selectedText.toUpperCase();
      } else if (caseType === 'lower') {
        transformed = selectedText.toLowerCase();
      } else if (caseType === 'title') {
        transformed = selectedText.replace(/\b[a-z]/gi, char => char.toUpperCase());
      } else if (caseType === 'sentence') {
        transformed = selectedText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
      }
      const newContent = currentVal.substring(0, start) + transformed + currentVal.substring(end);
      updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
      }, 10);
      showToast(`Applied ${caseType} case!`, 'success');
    } else {
      showToast('Select text in editor to apply case change', 'info');
    }
  };

  const applyAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!activePage || !activeProject) return;
    const targetRef = textareaRef.current || quickTextareaRef.current;
    if (targetRef) {
      const el = targetRef;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const currentVal = activePage.content;
      const selectedText = currentVal.substring(start, end) || 'Aligned Paragraph Content';
      
      const replacement = `\n\n<div align="${align}">\n\n${selectedText}\n\n</div>\n\n`;
      const newContent = currentVal.substring(0, start) + replacement + currentVal.substring(end);
      
      updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + replacement.length);
      }, 10);
      showToast(`Aligned text to ${align}!`, 'success');
    } else {
      insertFormatting(`\n\n<div align="${align}">\n\n`, '\n\n</div>\n\n', 'Aligned Paragraph Content');
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

    setExportingFormat(format);
    setIsExportMenuOpen(false);

    let exportTitle = activeProject.title;
    let exportContent = '';

    if (scope === 'page') {
      exportTitle = `${activeProject.title} - ${activePage.title}`;
      exportContent = `# ${activePage.title}\n\n*${getEffectiveSubtitle(activePage, activeProject)}*\n\n${activePage.content}`;
    } else {
      exportTitle = activeProject.title;
      exportContent = `# ${activeProject.title}\n*${getEffectiveSubtitle(activePage, activeProject)}*\n\n${activeProject.description}\n\n---\n\n` +
        activeProject.pages.map((p, idx) => `## Page ${idx + 1}: ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    }

    const payload = {
      title: exportTitle,
      subtitle: getEffectiveSubtitle(activePage, activeProject),
      author: '',
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
        await exportToPdfDocument(payload);
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
    } finally {
      setExportingFormat(null);
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

Directive: Provide high-caliber, publication-grade academic text with clear standalone markdown headings (e.g. ## Heading), rigorous analytical depth, data tables where applicable, and structured paragraphs.
MANDATORY: Every scientific formula, chemical reaction equation, physical law, and mathematical derivation MUST be correctly written using standard LaTeX ($...$ for inline formulas, $$...$$ for standalone display equations).`;

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

  // Dedicated Thesis & Dissertation Chapter Generator
  const handleGenerateThesisChapter = async () => {
    if (!activeProject) return;
    const topicToUse = chapterBuilderTopic.trim() || activeProject.title;
    const fieldToUse = chapterBuilderField.trim() || activeProject.category || 'Academic Research';

    setIsChapterGenerating(true);
    setChapterGenStep('Analyzing dissertation scope & committee standards...');

    try {
      if (chapterBuilderChapter === 'all') {
        // Scaffolding Full 5-Chapter Project
        setChapterGenStep('Synthesizing Chapter 1: Introduction, Problem Statement & Hypotheses...');
        let ch1Content = '';
        try {
          const res1 = await fetch('/api/generate-thesis-chapter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topicToUse,
              chapterNumber: 1,
              degreeLevel: chapterBuilderDegree,
              field: fieldToUse,
              referenceStyle: referenceStyle || 'Harvard',
              customNotes: chapterBuilderNotes
            })
          });
          const d1 = await res1.json();
          if (res1.ok && d1?.content) ch1Content = d1.content;
        } catch {}

        if (!ch1Content) {
          const p1 = `Draft an exhaustive, multi-page Chapter 1 for a ${chapterBuilderDegree.toUpperCase()} thesis on "${topicToUse}" in ${fieldToUse}. Include Background to the Study (multi-page), Statement of Problem, Research Questions, Hypotheses ($H_0, H_1$), Significance, Scope, and Definitions.`;
          ch1Content = await puterChat(p1, 'gpt-4o-mini');
        }

        setChapterGenStep('Synthesizing Chapter 2: Literature Review, Theoretical Framework & Gap Matrix...');
        let ch2Content = '';
        try {
          const res2 = await fetch('/api/generate-thesis-chapter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topicToUse,
              chapterNumber: 2,
              degreeLevel: chapterBuilderDegree,
              field: fieldToUse,
              referenceStyle: referenceStyle || 'Harvard',
              customNotes: chapterBuilderNotes
            })
          });
          const d2 = await res2.json();
          if (res2.ok && d2?.content) ch2Content = d2.content;
        } catch {}

        if (!ch2Content) {
          const p2 = `Draft an exhaustive, multi-page Chapter 2 Literature Review for a ${chapterBuilderDegree.toUpperCase()} thesis on "${topicToUse}". Include Conceptual Framework, 2-3 Theories, 8+ Empirical Studies (2020-2026), and a Literature Gap Matrix.`;
          ch2Content = await puterChat(p2, 'gpt-4o-mini');
        }

        setChapterGenStep('Synthesizing Chapter 3: Research Methodology & Analytical Framework...');
        let ch3Content = '';
        try {
          const res3 = await fetch('/api/generate-thesis-chapter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topicToUse,
              chapterNumber: 3,
              degreeLevel: chapterBuilderDegree,
              field: fieldToUse,
              referenceStyle: referenceStyle || 'Harvard',
              customNotes: chapterBuilderNotes
            })
          });
          const d3 = await res3.json();
          if (res3.ok && d3?.content) ch3Content = d3.content;
        } catch {}

        if (!ch3Content) {
          const p3 = `Draft an exhaustive, multi-page Chapter 3 Research Methodology for a ${chapterBuilderDegree.toUpperCase()} thesis on "${topicToUse}". Include Research Design, Population, Sample Size Formula (Taro Yamane / Cochran in LaTeX), Sampling, Reliability (Cronbach's alpha), and Data Analysis Model.`;
          ch3Content = await puterChat(p3, 'gpt-4o-mini');
        }

        const timestamp = Date.now();
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const newPages: WorkspacePage[] = [
          {
            id: `page-${timestamp}-ch1`,
            title: 'Chapter 1: Introduction & Problem Background',
            content: ch1Content,
            pageNumber: activeProject.pages.length + 1,
            customDate: dateStr,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-${timestamp}-ch2`,
            title: 'Chapter 2: Literature Review & Gap Synthesis',
            content: ch2Content,
            pageNumber: activeProject.pages.length + 2,
            customDate: dateStr,
            createdAt: timestamp + 1,
            updatedAt: timestamp + 1
          },
          {
            id: `page-${timestamp}-ch3`,
            title: 'Chapter 3: Research Methodology & Sampling',
            content: ch3Content,
            pageNumber: activeProject.pages.length + 3,
            customDate: dateStr,
            createdAt: timestamp + 2,
            updatedAt: timestamp + 2
          }
        ];

        updateWorkspaceProject(activeProject.id, {
          title: topicToUse,
          category: fieldToUse,
          pages: [...activeProject.pages, ...newPages],
          activePageIndex: activeProject.pages.length
        });

        showToast(`Successfully scaffolded 3 comprehensive thesis chapters!`, 'success');
        setShowChapterBuilderModal(false);
      } else {
        const chNum = parseInt(chapterBuilderChapter) || 1;
        setChapterGenStep(`Drafting comprehensive multi-page Chapter ${chNum} with citations & formulas...`);

        let chapterContent = '';
        try {
          const res = await fetch('/api/generate-thesis-chapter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topicToUse,
              chapterNumber: chNum,
              degreeLevel: chapterBuilderDegree,
              field: fieldToUse,
              referenceStyle: referenceStyle || 'Harvard',
              customNotes: chapterBuilderNotes
            })
          });
          const data = await res.json();
          if (res.ok && data?.content) {
            chapterContent = data.content;
          } else {
            throw new Error('API fallback');
          }
        } catch {
          const prompt = `You are a distinguished university thesis supervisor. Draft an EXHAUSTIVE, MULTI-PAGE Chapter ${chNum} for a ${chapterBuilderDegree.toUpperCase()} thesis on "${topicToUse}" in the field of "${fieldToUse}".
MANDATORY SUBHEADING & PARAGRAPH ARCHITECTURE:
- STRICT BAN ON SUBHEADING PROLIFERATION: You must NOT proliferate subheadings without substantial content or text under each subheading. Never create shallow, fragmented subheadings followed by only 1, 2, or 3 brief paragraphs or bullet points.
- EVERY SUBHEADING MUST CONTAIN MORE THAN 3 OR 4 PARAGRAPHS: Under every single subheading (## ${chNum}.1, ## ${chNum}.2, etc.), provide at least 4 to 6+ rich, exhaustive, coherent paragraphs.
- DEMARCATED BY INDENTATIONS: Separate every paragraph clearly with double line breaks formatted for academic reading with first-line indentations.
- Include verified academic citations (${referenceStyle || 'Harvard'}), LaTeX mathematical formulas, and empirical discussion.`;
          chapterContent = await puterChat(prompt, 'gpt-4o-mini');
        }

        if (chapterContent) {
          const chapterNames: Record<number, string> = {
            1: 'Chapter 1: Introduction & Background to the Study',
            2: 'Chapter 2: Literature Review & Theoretical Framework',
            3: 'Chapter 3: Research Methodology & Sampling Architecture',
            4: 'Chapter 4: Data Presentation, Analysis & Discussion',
            5: 'Chapter 5: Summary, Conclusions & Recommendations'
          };
          const pageTitle = chapterNames[chNum] || `Chapter ${chNum}`;
          const timestamp = Date.now();
          const newPage: WorkspacePage = {
            id: `page-${timestamp}-ch${chNum}`,
            title: pageTitle,
            content: chapterContent,
            pageNumber: activeProject.pages.length + 1,
            customDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            createdAt: timestamp,
            updatedAt: timestamp
          };

          updateWorkspaceProject(activeProject.id, {
            pages: [...activeProject.pages, newPage],
            activePageIndex: activeProject.pages.length
          });

          showToast(`Generated multi-page ${pageTitle} (${chapterContent.split(/\s+/).length} words)!`, 'success');
          setShowChapterBuilderModal(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to draft chapter. Please retry.', 'error');
    } finally {
      setIsChapterGenerating(false);
      setChapterGenStep('');
    }
  };

  // Intelligent Chapter Page Extension with Distinct Continuation Naming
  const handleExtendChapterPage = (customInitialContent?: string) => {
    if (!activeProject || !activePage) return;

    const currentTitle = activePage.title.trim();
    // Check if title already ends with (Part X) or (Continuation X)
    const partMatch = currentTitle.match(/^(.*?)(?:\s*[\(\[]?(?:Part|Continuation|Continued)\s*(\d+)[\)\]]?)$/i);
    let baseTitle = currentTitle;
    let nextPart = 2;

    if (partMatch) {
      baseTitle = partMatch[1].trim();
      nextPart = parseInt(partMatch[2], 10) + 1;
    } else {
      // Find how many pages already exist starting with this base title
      const existingMatchingParts = activeProject.pages.filter(p => 
        p.title.toLowerCase().startsWith(baseTitle.toLowerCase())
      );
      if (existingMatchingParts.length > 1) {
        nextPart = existingMatchingParts.length + 1;
      }
    }

    const newPageTitle = `${baseTitle} (Part ${nextPart})`;
    const initialContent = customInitialContent || `## ${baseTitle} (Continued - Part ${nextPart})\n\n*Continued from Part ${nextPart - 1}*\n\n---\n\n### Continued Subheading\n\nContinue writing in-depth empirical literature, theoretical models, or statistical procedures here...`;

    const timestamp = Date.now();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const newPage: WorkspacePage = {
      id: `page-${timestamp}-part${nextPart}`,
      title: newPageTitle,
      content: initialContent,
      pageNumber: activeProject.pages.length + 1,
      customDate: dateStr,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Insert right after current active page index for contiguous chapter reading
    const updatedPages = [...activeProject.pages];
    updatedPages.splice(activePageIndex + 1, 0, newPage);

    updateWorkspaceProject(activeProject.id, {
      pages: updatedPages,
      activePageIndex: activePageIndex + 1
    });

    showToast(`Created chapter extension: "${newPageTitle}"`, 'success');
  };

  // Subheading Academic Extender
  const handleExpandSubheading = async () => {
    if (!activeProject || !activePage) return;
    const targetSubheading = customSubheadingInput.trim() || selectedSubheading.trim();
    if (!targetSubheading) {
      showToast('Please select or specify a subheading to expand', 'info');
      return;
    }

    setIsSubheadingExpanding(true);
    try {
      let expandedContent = '';

      if (chatEngine === 'gemini-flash') {
        const res = await fetch('/api/expand-subheading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: activeProject.title,
            chapterTitle: activePage.title,
            subheading: targetSubheading,
            existingContext: activePage.content,
            expansionDepth: subheadingExpansionDepth,
            referenceStyle: referenceStyle || 'Harvard',
            customNotes: subheadingCustomNotes
          })
        });
        const data = await res.json();
        if (res.ok && data?.content) {
          expandedContent = data.content;
        } else {
          throw new Error(data?.error || 'Failed via Gemini API');
        }
      } else {
        // Fallback to chosen Puter model
        const modelKey = chatEngine.replace('puter-', '');
        const depthDirective = subheadingExpansionDepth === 'exhaustive' ? '1,500 - 2,500 words across 4-6 pages' :
          subheadingExpansionDepth === 'multi-page-deep' ? '1,000 - 1,800 words across 3-4 pages' : '600 - 1,000 words across 2 pages';
        const prompt = `You are a Senior University Thesis Supervisor. Expand the subheading "${targetSubheading}" within the thesis chapter "${activePage.title}" on the topic "${activeProject.title}".
Target length: ${depthDirective}.
Reference Style: ${referenceStyle || 'Harvard'}.
Custom Focus: "${subheadingCustomNotes}".

MANDATORY SCHOLARLY SUBHEADING EXPANSION DIRECTIVES:
1. NO SUBHEADING PROLIFERATION: Do not fragment this section into shallow subheadings. Keep the focus cohesive under this single subheading.
2. EVERY SUBHEADING MUST CONTAIN MORE THAN 3 OR 4 SUBSTANTIAL PARAGRAPHS: You MUST produce at least 4 to 8 expansive, rigorous, literature-grounded paragraphs under this subheading.
3. DEMARCATED BY INDENTATIONS: Every paragraph must be distinctly separated with double line breaks and structured for academic reading with first-line paragraph indentation.
4. Ground all arguments in verified peer-reviewed studies (2020-2026), LaTeX equations ($...$, $$...$$), and comparative empirical tables where appropriate.

Return clean Markdown starting with:
### ${targetSubheading}`;
        expandedContent = await puterChat(prompt, modelKey === 'claude-3-5' ? 'claude-3-5-sonnet' : modelKey === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o-mini');
      }

      if (expandedContent) {
        if (subheadingAutoNewPage) {
          handleExtendChapterPage(`## ${activePage.title.replace(/\s*\(Part\s*\d+\)/i, '')} (Continued)\n\n*Extended Subheading Focus: ${targetSubheading}*\n\n---\n\n${expandedContent}`);
        } else {
          // Check if the subheading already exists in the content
          const escaped = targetSubheading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regexHeading = new RegExp(`(#{1,4}\\s*${escaped}[\\s\\S]*?)(?=\\n#{1,3}\\s+|$)`, 'i');
          let newContent = activePage.content;

          if (regexHeading.test(newContent)) {
            newContent = newContent.replace(regexHeading, `${expandedContent}\n\n`);
          } else {
            newContent = `${newContent.trim()}\n\n---\n\n${expandedContent}`;
          }

          updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
          showToast(`Expanded subheading "${targetSubheading}" (${expandedContent.split(/\s+/).filter(Boolean).length} words)!`, 'success');
        }

        setShowSubheadingExtenderModal(false);
        setCustomSubheadingInput('');
        setSubheadingCustomNotes('');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error expanding subheading. Please retry.', 'error');
    } finally {
      setIsSubheadingExpanding(false);
    }
  };

  // Cross-Chapter Automatic Table of Contents Synthesizer
  const handleGenerateTableOfContents = async () => {
    if (!activeProject) return;
    setIsGeneratingTOC(true);
    showToast('Analyzing all chapters & synthesizing academic Table of Contents...', 'info');

    try {
      const res = await fetch('/api/generate-table-of-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeProject.title,
          pages: activeProject.pages,
          degreeLevel: 'masters'
        })
      });
      const data = await res.json();
      if (res.ok && data?.tableOfContents) {
        const tocContent = data.tableOfContents;
        const existingTOCIndex = activeProject.pages.findIndex(p => 
          p.title.toLowerCase().includes('table of contents') || p.title.toLowerCase().includes('contents')
        );

        const timestamp = Date.now();
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        if (existingTOCIndex >= 0) {
          updateProjectPage(activeProject.id, existingTOCIndex, { content: tocContent });
          updateWorkspaceProject(activeProject.id, { activePageIndex: existingTOCIndex });
          showToast('Updated existing Table of Contents page!', 'success');
        } else {
          // Insert after Page 1 (Title / Preliminary Abstract)
          const newTocPage: WorkspacePage = {
            id: `page-${timestamp}-toc`,
            title: 'Table of Contents',
            content: tocContent,
            pageNumber: 2,
            customDate: dateStr,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          const updatedPages = [...activeProject.pages];
          updatedPages.splice(1, 0, newTocPage);

          updateWorkspaceProject(activeProject.id, {
            pages: updatedPages,
            activePageIndex: 1
          });
          showToast('Created official Table of Contents page as Page 2!', 'success');
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate Table of Contents.', 'error');
    } finally {
      setIsGeneratingTOC(false);
    }
  };

  // Master References Synthesizer from All In-Text Citations
  const handleSynthesizeMasterReferences = async () => {
    if (!activeProject) return;
    setIsSynthesizingReferences(true);
    showToast('Scanning all chapters for in-text citations & compiling Master References...', 'info');

    try {
      const res = await fetch('/api/synthesize-master-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeProject.title,
          pages: activeProject.pages,
          referenceStyle: referenceStyle || 'Harvard'
        })
      });
      const data = await res.json();
      if (res.ok && data?.references) {
        const refContent = data.references;
        const existingRefIndex = activeProject.pages.findIndex(p => 
          p.title.toLowerCase().includes('references') || p.title.toLowerCase().includes('bibliography')
        );

        const timestamp = Date.now();
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        if (existingRefIndex >= 0) {
          updateProjectPage(activeProject.id, existingRefIndex, { content: refContent });
          updateWorkspaceProject(activeProject.id, { activePageIndex: existingRefIndex });
          showToast('Updated Master References page with all in-text citations!', 'success');
        } else {
          // Append as concluding page
          const newRefPage: WorkspacePage = {
            id: `page-${timestamp}-references`,
            title: 'Master References & Bibliography',
            content: refContent,
            pageNumber: activeProject.pages.length + 1,
            customDate: dateStr,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          updateWorkspaceProject(activeProject.id, {
            pages: [...activeProject.pages, newRefPage],
            activePageIndex: activeProject.pages.length
          });
          showToast('Compiled Master References page at end of thesis!', 'success');
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to compile master references.', 'error');
    } finally {
      setIsSynthesizingReferences(false);
    }
  };

  // Consolidate and Unify All Chapters into One Cohesive Manuscript
  const handleConsolidateThesis = async () => {
    if (!activeProject) return;
    setIsConsolidatingThesis(true);
    showToast('Reading all chapters into memory and unifying manuscript...', 'info');

    try {
      const res = await fetch('/api/consolidate-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeProject.title,
          pages: activeProject.pages,
          degreeLevel: 'masters',
          referenceStyle: referenceStyle || 'Harvard'
        })
      });
      const data = await res.json();
      if (res.ok && data?.consolidatedText) {
        setConsolidatedThesisText(data.consolidatedText);
        setShowConsolidateModal(true);
        showToast('Successfully consolidated entire thesis into one manuscript!', 'success');
      } else {
        // Fallback: concatenate directly
        const rawConsolidated = `# ${activeProject.title}\n\n*${activeProject.category} | ${activeProject.role.toUpperCase()}*\n\n---\n\n` +
          activeProject.pages.map((p, idx) => `## Page ${idx + 1}: ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
        setConsolidatedThesisText(rawConsolidated);
        setShowConsolidateModal(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Consolidation encountered error; prepared raw manuscript.', 'info');
      const rawConsolidated = `# ${activeProject.title}\n\n*${activeProject.category} | ${activeProject.role.toUpperCase()}*\n\n---\n\n` +
        activeProject.pages.map((p, idx) => `## Page ${idx + 1}: ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
      setConsolidatedThesisText(rawConsolidated);
      setShowConsolidateModal(true);
    } finally {
      setIsConsolidatingThesis(false);
    }
  };

  // Create Project
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      showToast('Please provide a project title', 'error');
      return;
    }

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

    // Ensure the new project is immediately visible and active regardless of previous filters
    setSelectedRoleFilter('all');
    setSearchQuery('');
    setActiveProjectId(newProj.id);
    updateWorkspaceProject(newProj.id, { activePageIndex: 0 });

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
      <header className="min-h-16 py-2 px-4 sm:px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-900 dark:bg-purple-800 text-amber-400 flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                {activeProject ? activeProject.title : 'Academic Research Workspace'}
              </h1>
              {activeProject && (
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shrink-0">
                  {activeProject.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
              {activeProject ? `${activeProject.category} • ${activeProject.pages.length} Pages • ${activeProject.uploadedDocuments.length} Attached Docs` : 'Comprehensive writing & research suite'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons - Unblocked, Responsive & Direct Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          {/* Thesis Chapter Builder - Always Visible and Prominent */}
          <button
            onClick={() => {
              if (activeProject) {
                setChapterBuilderTopic(activeProject.title);
                setChapterBuilderField(activeProject.category || '');
              }
              setShowChapterBuilderModal(true);
            }}
            className="px-3 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/20 transition-all cursor-pointer shrink-0"
            title="Draft or scaffold multi-page dissertation chapters (Chapter 1, 2, 3, 4, 5)"
          >
            <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="whitespace-nowrap">Chapter Builder</span>
          </button>

          {/* AI Academic Co-Author Button - Prominently Displayed & Fully Visible */}
          <button
            onClick={() => setShowAIDialog(true)}
            className="px-3 py-2 bg-gradient-to-r from-amber-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-purple-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            title="Prompt AI Academic Co-Author to draft, expand, or synthesize research sections"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="whitespace-nowrap">AI Academic Co-Author</span>
          </button>

          {/* Sentence & Paragraph Extension Button - Anti-Cutoff Tool */}
          <button
            onClick={() => {
              if (incompleteDetection.isIncomplete && incompleteDetection.lastParagraph) {
                setSentenceExtensionPrefill(incompleteDetection.lastParagraph);
              } else if (activePage?.content) {
                const paras = activePage.content.trim().split(/\n\s*\n/);
                setSentenceExtensionPrefill(paras[paras.length - 1] || '');
              }
              setShowSentenceExtensionModal(true);
            }}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600/15 to-teal-600/15 hover:from-emerald-600/25 hover:to-teal-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            title="Extend or complete abruptly cut-off sentences and paragraphs"
          >
            <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Extend Sentence / Paragraph</span>
          </button>

          {/* Direct Word (.docx) Export Button with Scope Dropdown */}
          <div className="relative shrink-0" ref={wordExportRef}>
            <div className="inline-flex rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={() => handleExport('word', 'page')}
                disabled={!!exportingFormat}
                className="px-2.5 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Direct 1-Click Export Current Page to Word (.docx)"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Word (.docx)</span>
                <span className="sm:hidden">Word</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowWordExportDropdown(prev => !prev); }}
                className="px-1.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs flex items-center cursor-pointer border-l border-blue-500"
                title="Word Export Options (Current Page or Full Dissertation)"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showWordExportDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-850 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Microsoft Word (.docx)
                </div>
                <button
                  onClick={() => { handleExport('word', 'page'); setShowWordExportDropdown(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Export Current Page (.docx)</span>
                </button>
                <button
                  onClick={() => { handleExport('word', 'project'); setShowWordExportDropdown(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 font-bold flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Export Full Dissertation ({activeProject?.pages.length || 0} Pages)</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct PDF Export Button with Scope Dropdown */}
          <div className="relative shrink-0" ref={pdfExportRef}>
            <div className="inline-flex rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={() => handleExport('pdf', 'page')}
                disabled={!!exportingFormat}
                className="px-2.5 sm:px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Direct 1-Click Export Current Page to PDF (.pdf)"
              >
                <FileDown className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPdfExportDropdown(prev => !prev); }}
                className="px-1.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs flex items-center cursor-pointer border-l border-rose-500"
                title="PDF Export Options (Current Page or Full Dissertation)"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showPdfExportDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-850 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Publication PDF (.pdf)
                </div>
                <button
                  onClick={() => { handleExport('pdf', 'page'); setShowPdfExportDropdown(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <span>Export Current Page (.pdf)</span>
                </button>
                <button
                  onClick={() => { handleExport('pdf', 'project'); setShowPdfExportDropdown(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-900 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-bold flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <span>Export Full Dissertation ({activeProject?.pages.length || 0} Pages)</span>
                </button>
              </div>
            )}
          </div>

          {/* More Actions Dropdown */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(prev => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              title="More workspace tools & export formats"
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visual Studios & Upload
                </div>
                <button
                  onClick={() => { setCurrentView('draw-label'); setIsExportMenuOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Microscope className="w-4 h-4 text-emerald-600" />
                  <span>Draw & Label Studio Portal</span>
                </button>
                <button
                  onClick={() => { setCurrentView('infographic'); setIsExportMenuOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-pink-600" />
                  <span>Infographic Studio Portal</span>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); setIsExportMenuOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Upload Documents & Datasets</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1.5" />

                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alternative Exports
                </div>
                <button 
                  onClick={() => handleExport('markdown', 'page')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-slate-600" />
                  <span>Export Markdown (.md)</span>
                </button>
                <button 
                  onClick={() => handleExport('text', 'page')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Export Plain Text (.txt)</span>
                </button>
              </div>
            )}
          </div>

          {/* New Project Primary Header Button */}
          <button
            onClick={() => {
              setNewProjectTitle('');
              setNewProjectCategory('');
              setNewProjectDesc('');
              setShowNewProjectModal(true);
            }}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Create New Project"
          >
            <FolderPlus className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Writing Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Hidden Universal Document Upload Input */}
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleUniversalUpload}
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.tsv,.json,.xml,.tex,.html,.js,.ts,.py,image/*" 
          />
        </div>
      </header>

      {/* Academic Thesis Navigation & Cross-Chapter Synthesis Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-2xs">
        {/* Left: Visible AI Model Selector + Subheading Extender + Chapter Continuation */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 shadow-2xs">
            <Bot className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
            <span className="font-semibold text-slate-500 text-[11px] hidden sm:inline">Model:</span>
            <select
              value={chatEngine}
              onChange={(e) => setChatEngine(e.target.value)}
              className="bg-transparent font-bold text-purple-900 dark:text-purple-300 focus:outline-none cursor-pointer text-xs"
              title="Select model for subheading expansion and thesis writing"
            >
              <option value="gemini-flash">Gemini 2.5 Flash</option>
              <option value="puter-gpt-4o-mini">GPT-4o-mini</option>
              <option value="puter-claude-3-5">Claude 3.5 Sonnet</option>
              <option value="puter-grok">Grok 2</option>
              <option value="puter-deepseek">DeepSeek Chat</option>
              <option value="puter-kimi">Kimi Chat</option>
            </select>
          </div>

          {/* AI Academic Co-Author in Ribbon */}
          <button
            onClick={() => setShowAIDialog(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-purple-500/25 text-amber-800 dark:text-amber-300 font-bold rounded-xl flex items-center gap-1.5 border border-amber-500/40 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Launch AI Academic Co-Author dialog to draft sections or synthesize content"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>AI Academic Co-Author</span>
          </button>

          {/* Extend Subheading Button */}
          <button
            onClick={() => {
              const headings = (activePage?.content || '').match(/^#{2,4}\s+(.+)$/gm) || [];
              if (headings.length > 0) {
                const firstHeading = headings[0].replace(/^#{2,4}\s+/, '').trim();
                setSelectedSubheading(firstHeading);
              }
              setShowSubheadingExtenderModal(true);
            }}
            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/70 dark:hover:bg-purple-900/80 text-purple-900 dark:text-purple-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
            title="Expand or extend any specific subheading within this chapter with empirical citations and formulas"
          >
            <Type className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Extend Subheading</span>
          </button>

          {/* Extend Chapter to Continuation Page (Part 2, Part 3) */}
          <button
            onClick={() => handleExtendChapterPage()}
            className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-900 dark:text-indigo-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
            title="Extend this chapter to an unambiguously titled continuation page (e.g. Chapter 2: Literature Review (Part 2))"
          >
            <FilePlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Extend Chapter (Continuation Page)</span>
          </button>
        </div>

        {/* Right: Cross-Chapter AI Memory Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Table of Contents Synthesizer */}
          <button
            onClick={handleGenerateTableOfContents}
            disabled={isGeneratingTOC}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Scan all chapters and build an authoritative Table of Contents with dot leaders and page numbering"
          >
            {isGeneratingTOC ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <ListTree className="w-3.5 h-3.5 text-purple-600" />}
            <span>{isGeneratingTOC ? 'Generating TOC...' : 'Auto Table of Contents'}</span>
          </button>

          {/* Master References Synthesizer */}
          <button
            onClick={handleSynthesizeMasterReferences}
            disabled={isSynthesizingReferences}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Scan every in-text citation across all chapters and compile verified Master References list"
          >
            {isSynthesizingReferences ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <BookMarked className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSynthesizingReferences ? 'Compiling Refs...' : 'Compile References'}</span>
          </button>

          {/* Consolidate All Chapters */}
          <button
            onClick={handleConsolidateThesis}
            disabled={isConsolidatingThesis}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 text-purple-900 dark:text-purple-300 font-bold rounded-xl flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Harmonize and unify all chapters into one complete dissertation manuscript"
          >
            {isConsolidatingThesis ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Layers className="w-3.5 h-3.5 text-purple-600" />}
            <span>{isConsolidatingThesis ? 'Unifying...' : 'Consolidate Thesis'}</span>
          </button>

          {/* Interactive Evidence Matrix */}
          <button
            onClick={() => setShowEvidenceMatrixModal(true)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Inspect peer-reviewed evidence matrix and insert comparative tables into chapter"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Evidence Matrix</span>
          </button>

          {/* Audit Active Chapter Claims */}
          <button
            onClick={() => {
              if (!activePage) return;
              const claims = extractClaimsFromText(activePage.content, activeProject?.category || "Higher Education");
              setActiveAuditedClaims(claims);
              setShowClaimAuditModal(true);
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs"
            title="Audit substantive claims, numerical assertions, and citations in this chapter"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Claims</span>
          </button>

          {/* 17-Point Pre-Submission Audit */}
          <button
            onClick={() => setShowPreSubmissionAuditModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Run 17-point pre-submission academic integrity audit on dissertation before export"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pre-Submission Audit</span>
          </button>
        </div>
      </div>

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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExtendChapterPage()}
                    className="px-2 py-1 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Extend active chapter to sequential Part 2 / Continuation page"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">Extend</span>
                  </button>
                  <button
                    onClick={() => addPageToProject(activeProject.id)}
                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add blank new page to project"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Pages Scroll List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {activeProject.pages.map((pg, idx) => {
                  const isCurrent = idx === activePageIndex;
                  const partMatch = pg.title.match(/Part\s*(\d+)/i);
                  const isTOC = pg.title.toLowerCase().includes('table of contents') || pg.title.toLowerCase().includes('contents');
                  const isRef = pg.title.toLowerCase().includes('references') || pg.title.toLowerCase().includes('bibliography');

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
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs truncate">{pg.title}</span>
                        {partMatch && (
                          <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-[9px] font-bold uppercase shrink-0">
                            Pt {partMatch[1]}
                          </span>
                        )}
                        {isTOC && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[9px] font-bold uppercase shrink-0">
                            TOC
                          </span>
                        )}
                        {isRef && (
                          <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded text-[9px] font-bold uppercase shrink-0">
                            Refs
                          </span>
                        )}
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

              {/* Font Size Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFontSizePicker(!showFontSizePicker);
                    setShowColorPicker(false);
                    setShowBgColorPicker(false);
                    setShowCasePicker(false);
                  }}
                  className="p-1 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  title="Font Size"
                >
                  <Type className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                  <span>{currentFontSize}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showFontSizePicker && (
                  <div className="absolute top-full left-0 mt-1 w-24 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 max-h-48 overflow-y-auto">
                    {['9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '36pt'].map(sz => (
                      <button
                        key={sz}
                        onClick={() => applyFontSize(sz)}
                        className={`w-full px-3 py-1 text-left text-xs hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center justify-between ${
                          currentFontSize === sz ? 'font-bold text-purple-900 dark:text-purple-300 bg-purple-50/50' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{sz}</span>
                        {currentFontSize === sz && <Check className="w-3 h-3 text-purple-700" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Color Picker */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowFontSizePicker(false);
                    setShowBgColorPicker(false);
                    setShowCasePicker(false);
                  }}
                  className="p-1 px-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  title="Text Color"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black leading-none">A</span>
                    <span className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: currentTextColor }} />
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-44">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Text Color</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'Black', hex: '#0F172A' },
                        { name: 'Slate', hex: '#475569' },
                        { name: 'Red', hex: '#DC2626' },
                        { name: 'Amber', hex: '#D97706' },
                        { name: 'Green', hex: '#059669' },
                        { name: 'Blue', hex: '#2563EB' },
                        { name: 'Purple', hex: '#7C3AED' },
                        { name: 'Rose', hex: '#E11D48' }
                      ].map(c => (
                        <button
                          key={c.hex}
                          onClick={() => applyTextColor(c.hex)}
                          className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-xs"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {currentTextColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Background Color (Text Highlight) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowBgColorPicker(!showBgColorPicker);
                    setShowFontSizePicker(false);
                    setShowColorPicker(false);
                    setShowCasePicker(false);
                  }}
                  className="p-1 px-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  title="Text Background / Highlight Color"
                >
                  <Highlighter className="w-4 h-4 text-amber-500" />
                  <span className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: currentBgColor }} />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showBgColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-44">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Highlight Color</div>
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {[
                        { name: 'Yellow', hex: '#FEF08A' },
                        { name: 'Green', hex: '#BBF7D0' },
                        { name: 'Cyan', hex: '#BAE6FD' },
                        { name: 'Pink', hex: '#FBCFE8' },
                        { name: 'Orange', hex: '#FED7AA' },
                        { name: 'Purple', hex: '#E9D5FF' }
                      ].map(c => (
                        <button
                          key={c.hex}
                          onClick={() => applyBackgroundColor(c.hex)}
                          className="w-10 h-7 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {currentBgColor === c.hex && <Check className="w-3 h-3 text-slate-800" />}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => applyBackgroundColor('transparent')}
                      className="w-full py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-center border border-dashed border-slate-300 dark:border-slate-600"
                    >
                      No Color
                    </button>
                  </div>
                )}
              </div>

              {/* Case (Aa) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCasePicker(!showCasePicker);
                    setShowFontSizePicker(false);
                    setShowColorPicker(false);
                    setShowBgColorPicker(false);
                  }}
                  className="p-1 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  title="Change Case (Aa)"
                >
                  <span className="font-serif font-black text-purple-900 dark:text-purple-300">Aa</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showCasePicker && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <button
                      onClick={() => applyTextCase('sentence')}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    >
                      Sentence case.
                    </button>
                    <button
                      onClick={() => applyTextCase('lower')}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    >
                      lowercase
                    </button>
                    <button
                      onClick={() => applyTextCase('upper')}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-bold"
                    >
                      UPPERCASE
                    </button>
                    <button
                      onClick={() => applyTextCase('title')}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    >
                      Capitalize Each Word
                    </button>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Text Alignment Group */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => applyAlignment('left')}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded"
                  title="Align Left (Ctrl+L)"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyAlignment('center')}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded"
                  title="Center (Ctrl+E)"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyAlignment('right')}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded"
                  title="Align Right (Ctrl+R)"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyAlignment('justify')}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded"
                  title="Justify (Ctrl+J)"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

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

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* AI Co-Author Quick Tool */}
              <button
                onClick={() => setShowAIDialog(true)}
                className="p-1.5 px-2.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="AI Academic Co-Author: Draft, expand, or synthesize research"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">AI Co-Author</span>
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

          {/* Page Title Header Bar with Word Count and Auto-Pagination Extension */}
          {activePage && (() => {
            const currentPageWords = (activePage.content || '').trim().split(/\s+/).filter(Boolean).length;
            const isContinuationPage = /Part\s*\d+|Continued/i.test(activePage.title);
            const isPageFull = currentPageWords >= 750;

            return (
              <>
                <div className="bg-white dark:bg-slate-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Page Title:</span>
                    <input
                      type="text"
                      value={activePage.title}
                      onChange={(e) => handlePageTitleChange(e.target.value)}
                      placeholder="Enter Page Title..."
                      className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:ring-0 p-0 w-full"
                    />
                    {isContinuationPage && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold rounded text-[10px] shrink-0 uppercase tracking-wider">
                        Continuation
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-semibold text-[11px]">
                      {currentPageWords} words
                    </span>
                    {activePage.content.includes('![') && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Visual Structure Embedded
                      </span>
                    )}
                    <span className="text-slate-400 font-medium hidden md:inline">
                      {new Date(activePage.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Chapter Continuation Distinct Alert */}
                {isContinuationPage && (
                  <div className="bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800/50 px-6 py-1.5 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>
                        <strong>Sequential Chapter Continuation:</strong> This page continues the research flow without duplicate chapter headers.
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                      Part of sequential manuscript
                    </span>
                  </div>
                )}

                {/* Auto-Pagination / Page Filled Alert */}
                {isPageFull && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800/50 px-6 py-2 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <FilePlus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>
                        <strong>Standard Manuscript Page Filled:</strong> This page has reached <strong>{currentPageWords} words</strong>. Automatically extend to a new blank page with sequential numbering?
                      </span>
                    </div>
                    <button
                      onClick={() => handleExtendChapterPage()}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-3"
                      title="Create a new continuation page for this chapter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Extend to New Page</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          {/* Banner notification when in Edit mode with embedded diagram */}
          {activePage && editorMode === 'edit' && activePage.content.includes('![') && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-6 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span><strong>Visual Diagram Structure Active:</strong> You are currently in raw text edit mode. Switch to <strong>Word Doc</strong> or <strong>Preview</strong> mode (top right) to view the rendered visual structure plate.</span>
              </div>
              <button
                onClick={() => setEditorMode('word-page')}
                className="px-2.5 py-1 bg-purple-900 text-amber-300 font-bold rounded-lg text-xs hover:bg-purple-800 transition-colors cursor-pointer shrink-0 ml-3"
              >
                Switch to Word Doc View
              </button>
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
                        <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, [rehypeKatex, { output: 'html' }]]} components={workspaceMarkdownComponents}>
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
                    <div className="w-full max-w-4xl mb-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-900 dark:text-amber-400 font-bold">Word Document Canvas</span>
                        <span className="text-slate-400">•</span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-mono rounded font-bold" title="Current Page Number">{activePageIndex + 1}</span>
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

                    {/* Incomplete Sentence / Truncated Paragraph Detected Banner */}
                    {incompleteDetection.isIncomplete && (
                      <div className="w-full max-w-4xl mb-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold">Incomplete Sentence or Paragraph Detected: </span>
                            <span className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded truncate">
                              "{incompleteDetection.trailingSnippet}"
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSentenceExtensionPrefill(incompleteDetection.lastParagraph);
                              setShowSentenceExtensionModal(true);
                            }}
                            className="px-3 py-1 bg-purple-900 hover:bg-purple-950 dark:bg-purple-800 dark:hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            title="Open Sentence & Paragraph Extension Studio"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Extend & Complete</span>
                          </button>
                        </div>
                      </div>
                    )}

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
                                <div 
                                  onClick={() => openHeaderModal('projectTitle')}
                                  className="group/cpt flex items-center gap-1.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/60 px-1.5 py-0.5 -ml-1.5 rounded transition-all"
                                  title="Click to edit Project Title"
                                >
                                  <span className="font-bold text-purple-900 dark:text-purple-400 truncate max-w-sm">{activeProject.title}</span>
                                  <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/cpt:opacity-100 transition-opacity" />
                                </div>
                                <div 
                                  onClick={() => openHeaderModal('date')}
                                  className="group/cdt flex items-center gap-1.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/60 px-1.5 py-0.5 -mr-1.5 rounded transition-all"
                                  title="Click to edit Document Date"
                                >
                                  <span>{getEffectiveDate(pg, activeProject)}</span>
                                  <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/cdt:opacity-100 transition-opacity" />
                                </div>
                              </div>

                              {/* Document Page Title */}
                              <div 
                                onClick={() => openHeaderModal('pageTitle')}
                                className="group/cpageT flex items-start gap-2 cursor-pointer hover:bg-purple-50/70 dark:hover:bg-slate-700/40 p-1 -ml-1 rounded-xl transition-all mb-2 max-w-full"
                                title="Click to edit Document Page Title"
                              >
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                                  {pg.title}
                                </h1>
                                <Edit3 className="w-4 h-4 text-purple-600 mt-2 opacity-0 group-hover/cpageT:opacity-100 transition-opacity flex-shrink-0" />
                              </div>

                              {/* Subtitle */}
                              <div 
                                onClick={() => openHeaderModal('subtitle')}
                                className="group/csub flex items-center gap-1.5 cursor-pointer hover:bg-purple-50/70 dark:hover:bg-slate-700/40 px-1.5 py-1 -ml-1.5 rounded-lg transition-all mb-6 text-xs text-slate-500 dark:text-slate-400 italic"
                                title="Click to edit Prepared for Audience and Field metadata"
                              >
                                <span>{getEffectiveSubtitle(pg, activeProject)}</span>
                                <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/csub:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                              <div className="h-0.5 w-full bg-purple-900/40 dark:bg-purple-400/40 mb-8" />

                              {/* Formatted Page Content */}
                              <div className="text-slate-800 dark:text-slate-200 font-sans text-[15px] leading-relaxed">
                                <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, [rehypeKatex, { output: 'html' }]]} components={workspaceMarkdownComponents}>
                                  {pg.content}
                                </Markdown>
                              </div>
                            </div>

                            {/* Word Footer - Clean Automatic Page Number */}
                            <div className="mt-16 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                              <span>{activeProject.title ? activeProject.title.toUpperCase() : 'ACADEMIC RESEARCH MANUSCRIPT'}</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs font-mono">{pIdx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Single Sheet Simulated Word Page (Expands smoothly with content, never cuts off) */
                      <div className="w-full max-w-4xl min-h-[1100px] h-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8 sm:p-14 shadow-2xl rounded-xl border border-slate-300 dark:border-slate-700 font-sans leading-relaxed relative flex flex-col justify-between mb-16">
                        <div>
                          {/* Word Header Action Bar */}
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span>Manuscript Header Details</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isInlineHeaderEditing) {
                                    setIsInlineHeaderEditing(false);
                                  } else {
                                    handleStartInlineHeaderEditing();
                                  }
                                }}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                  isInlineHeaderEditing
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700/70 dark:hover:bg-slate-700 dark:text-slate-200'
                                }`}
                                title="Toggle inline quick-edit for all 4 header elements directly on page"
                              >
                                <Edit className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>{isInlineHeaderEditing ? 'Close Quick Edit' : 'Quick Edit Header'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openHeaderModal()}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Open full dialog to customize manuscript title, date, page title, and attribution subtitle"
                              >
                                <Edit3 className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                                <span>Edit Header Info</span>
                              </button>
                            </div>
                          </div>

                          {/* If inline editing is active */}
                          {isInlineHeaderEditing ? (
                            <div className="p-3.5 mb-6 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-700/70 shadow-sm space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300 pb-1 border-b border-purple-200 dark:border-purple-800/60">
                                <span className="flex items-center gap-1.5">
                                  <Edit3 className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                                  <span>Editing Manuscript Header Elements</span>
                                </span>
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                                  Updates project title, document date, page title & subtitle
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 mb-1">
                                    1. Project / Manuscript Title
                                  </label>
                                  <input
                                    type="text"
                                    value={headerForm.projectTitle}
                                    onChange={(e) => setHeaderForm(prev => ({ ...prev, projectTitle: e.target.value }))}
                                    placeholder="e.g. Grade 11 Biology: Animal & Plant Cell Ultrastructure"
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider focus:ring-2 focus:ring-purple-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                    2. Document Date
                                  </label>
                                  <input
                                    type="text"
                                    value={headerForm.date}
                                    onChange={(e) => setHeaderForm(prev => ({ ...prev, date: e.target.value }))}
                                    placeholder="e.g. 9/20/2026"
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                  3. Document / Page Title
                                </label>
                                <input
                                  type="text"
                                  value={headerForm.pageTitle}
                                  onChange={(e) => setHeaderForm(prev => ({ ...prev, pageTitle: e.target.value }))}
                                  placeholder="e.g. The Structure of Euglena"
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-lg text-base font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                  4. Prepared for / Field Subtitle
                                </label>
                                <input
                                  type="text"
                                  value={headerForm.customSubtitle}
                                  onChange={(e) => setHeaderForm(prev => ({ ...prev, customSubtitle: e.target.value }))}
                                  placeholder="e.g. Prepared for: TEACHER • Field: Cytology & Cell Biology"
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs italic text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setIsInlineHeaderEditing(false)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openHeaderModal()}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-300 transition-colors cursor-pointer"
                                >
                                  Advanced Dialog...
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveHeaderForm}
                                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-purple-900 hover:bg-purple-800 text-amber-300 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save Header</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Word Header: 1. Project Title & 2. Date */}
                              <div className="flex justify-between items-center text-[11px] text-slate-400 font-sans uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
                                <div
                                  onClick={() => openHeaderModal('projectTitle')}
                                  className="group/pt flex items-center gap-1.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/60 px-1.5 py-0.5 -ml-1.5 rounded transition-all"
                                  title="Click to edit Manuscript / Project Title"
                                >
                                  <span className="font-bold text-purple-900 dark:text-purple-400 truncate max-w-sm">
                                    {activeProject?.title || 'ACADEMIC RESEARCH MANUSCRIPT'}
                                  </span>
                                  <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/pt:opacity-100 transition-opacity" />
                                </div>
                                <div
                                  onClick={() => openHeaderModal('date')}
                                  className="group/dt flex items-center gap-1.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/60 px-1.5 py-0.5 -mr-1.5 rounded transition-all"
                                  title="Click to edit Document Date"
                                >
                                  <span>{getEffectiveDate(activePage, activeProject)}</span>
                                  <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/dt:opacity-100 transition-opacity" />
                                </div>
                              </div>

                              {/* 3. Document Title */}
                              <div
                                onClick={() => openHeaderModal('pageTitle')}
                                className="group/pageT cursor-pointer hover:bg-purple-50/70 dark:hover:bg-slate-700/40 p-1 -ml-1 rounded-xl transition-all mb-2 inline-flex items-start gap-2 max-w-full"
                                title="Click to edit Document Page Title"
                              >
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                                  {activePage.title}
                                </h1>
                                <Edit3 className="w-4 h-4 text-purple-600 mt-2 opacity-0 group-hover/pageT:opacity-100 transition-opacity flex-shrink-0" />
                              </div>

                              {/* 4. Subtitle (Prepared for: TEACHER • Field: Cytology & Cell Biology) */}
                              <div
                                onClick={() => openHeaderModal('subtitle')}
                                className="group/subT cursor-pointer hover:bg-purple-50/70 dark:hover:bg-slate-700/40 px-1.5 py-1 -ml-1.5 rounded-lg transition-all mb-6 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 italic"
                                title="Click to edit Prepared for Audience and Field metadata"
                              >
                                <span>{getEffectiveSubtitle(activePage, activeProject)}</span>
                                <Edit3 className="w-3 h-3 text-purple-500 opacity-0 group-hover/subT:opacity-100 transition-opacity flex-shrink-0" />
                              </div>

                              <div className="h-0.5 w-full bg-purple-900/40 dark:bg-purple-400/40 mb-8" />
                            </>
                          )}

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
                              <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, [rehypeKatex, { output: 'html' }]]} components={workspaceMarkdownComponents}>
                                {activePage.content}
                              </Markdown>
                            </div>
                          )}
                        </div>

                        {/* Word Page Automatic Footer */}
                        <div className="mt-16 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                          <span>{activeProject.title ? activeProject.title.toUpperCase() : 'ACADEMIC RESEARCH MANUSCRIPT'}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs font-mono">{activePageIndex + 1}</span>
                        </div>

                        {/* Word Page Navigation Controls */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                disabled={activePageIndex === 0}
                                onClick={() => updateWorkspaceProject(activeProject.id, { activePageIndex: activePageIndex - 1 })}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                              >
                                ← Previous Page
                              </button>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-700/60 rounded">
                                {activePageIndex + 1}
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
              {/* Quick Template Starters */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quick Starter Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { title: 'Cytological Ultrastructure & Organelles', cat: 'Cell Biology', role: 'researcher' as const, desc: 'High-fidelity examination of cellular morphology, flagellar locomotion, and metabolic organelle partitioning.' },
                    { title: 'Organic Synthesis & Reaction Mechanisms', cat: 'Chemistry', role: 'academic' as const, desc: 'Detailed stoichiometric pathways, molecular conformations, and nucleophilic substitution mechanisms.' },
                    { title: 'Cardiovascular Hemodynamics & Anatomy', cat: 'Human Physiology', role: 'teacher' as const, desc: 'Anatomical mapping of ventricular architecture, cardiac conduction cycles, and vascular pressures.' },
                    { title: 'Ecosystem Dynamics & Bioenergetics', cat: 'Ecology', role: 'student' as const, desc: 'Trophic level energy transfer, carbon flux models, and population equilibrium studies.' }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setNewProjectTitle(tpl.title);
                        setNewProjectCategory(tpl.cat);
                        setNewProjectRole(tpl.role);
                        setNewProjectDesc(tpl.desc);
                      }}
                      className="px-2 py-1 text-xs rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                    >
                      {tpl.cat}
                    </button>
                  ))}
                </div>
              </div>

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
                          const svgDataUrl = generatePresetSVGDataUrl(diag, false);
                          const md = `\n\n### Scientific Anatomical Figure: ${diag.title}\n` +
                            `*Category: ${diag.category} • ${diag.pins.length} Verified Anatomical Structures*\n\n` +
                            (svgDataUrl ? `![Scientific Anatomical Figure: ${diag.title}](${svgDataUrl})\n\n` : '') +
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
                              showToast(`Created new Page ${newPageNumber} with "${diag.title}" and visual ultrastructure!`, 'success');
                            } else {
                              const targetPage = activeProject.pages[diagramModalTargetPage];
                              if (targetPage) {
                                updateProjectPage(activeProject.id, diagramModalTargetPage, {
                                  content: targetPage.content + md
                                });
                                updateWorkspaceProject(activeProject.id, { activePageIndex: diagramModalTargetPage });
                                showToast(`Imported "${diag.title}" with visual ultrastructure into Page ${diagramModalTargetPage + 1}!`, 'success');
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
                          const svgDataUrl = generatePresetSVGDataUrl(diag, false);
                          const md = `\n\n### Scientific Anatomical Figure: ${diag.title}\n` +
                            `*Category: ${diag.category}*\n\n` +
                            (svgDataUrl ? `![Scientific Anatomical Figure: ${diag.title}](${svgDataUrl})\n\n` : '') +
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
                              showToast(`Created new Page with "${diag.title}" and visual ultrastructure!`, 'success');
                            } else {
                              const targetPage = activeProject.pages[diagramModalTargetPage];
                              if (targetPage) {
                                updateProjectPage(activeProject.id, diagramModalTargetPage, {
                                  content: targetPage.content + md
                                });
                                updateWorkspaceProject(activeProject.id, { activePageIndex: diagramModalTargetPage });
                                showToast(`Imported "${diag.title}" with visual ultrastructure into Page ${diagramModalTargetPage + 1}!`, 'success');
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

      {/* Modal: Thesis & Dissertation Chapter Builder */}
      {showChapterBuilderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 flex items-center justify-center text-amber-300 shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Thesis & Dissertation Chapter Builder
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-300">
                      Multi-Page Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generates publication-grade, fully referenced dissertation chapters with LaTeX formulas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChapterBuilderModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Degree Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Academic Degree Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'undergraduate', label: 'Undergraduate (B.Sc / B.A.)' },
                    { id: 'masters', label: 'Master\'s (M.Sc / MBA)' },
                    { id: 'phd', label: 'Doctoral (Ph.D. / D.Sc)' }
                  ].map((deg) => (
                    <button
                      key={deg.id}
                      type="button"
                      onClick={() => setChapterBuilderDegree(deg.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                        chapterBuilderDegree === deg.id
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-600 text-purple-900 dark:text-purple-300 ring-1 ring-purple-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {deg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Research Topic / Working Title
                </label>
                <input
                  type="text"
                  value={chapterBuilderTopic}
                  onChange={(e) => setChapterBuilderTopic(e.target.value)}
                  placeholder="e.g. Empirical Evaluation of Deep Convolutional Networks in Pediatric Pulmonary Diagnostics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-900"
                />
              </div>

              {/* Discipline / Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Academic Discipline / Department
                </label>
                <input
                  type="text"
                  value={chapterBuilderField}
                  onChange={(e) => setChapterBuilderField(e.target.value)}
                  placeholder="e.g. Biomedical Informatics, Applied Economics, Environmental Engineering"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-900"
                />
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Chapter to Generate
                </label>
                <select
                  value={chapterBuilderChapter}
                  onChange={(e) => setChapterBuilderChapter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-900 cursor-pointer"
                >
                  <option value="1">Chapter 1: Introduction (Background, Problem Statement, Hypotheses, Scope, Definitions)</option>
                  <option value="2">Chapter 2: Literature Review (Conceptual, Theoretical & Empirical Synthesis, Gap Matrix)</option>
                  <option value="3">Chapter 3: Research Methodology (Design, Sampling, Taro Yamane/Cochran formula, Reliability, Models)</option>
                  <option value="4">Chapter 4: Results, Data Analysis & Discussion (Statistical tables, hypothesis testing)</option>
                  <option value="5">Chapter 5: Summary, Conclusions & Recommendations</option>
                  <option value="all">🚀 Full Scaffold (Chapters 1, 2, and 3 across dedicated project pages)</option>
                </select>
              </div>

              {/* Specific Context Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Specific Focus or Context Parameters (Optional)
                </label>
                <textarea
                  value={chapterBuilderNotes}
                  onChange={(e) => setChapterBuilderNotes(e.target.value)}
                  placeholder="e.g. Focus on hospitals in developing nations, sample size N=384, employ multiple linear regression and Cronbach's alpha benchmark 0.70..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-900 resize-none h-18"
                />
              </div>

              {/* Real-time Status */}
              {isChapterGenerating && chapterGenStep && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 text-purple-700 dark:text-purple-400 animate-spin shrink-0" />
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                    {chapterGenStep}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowChapterBuilderModal(false)}
                disabled={isChapterGenerating}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateThesisChapter}
                disabled={isChapterGenerating || !chapterBuilderTopic.trim()}
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-900 to-indigo-700 hover:from-purple-800 hover:to-indigo-600 text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChapterGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Synthesizing Multi-Page Chapter...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    <span>Draft Multi-Page Chapter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Document Header & Metadata */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-900 dark:text-purple-300">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Document Header & Metadata</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize manuscript title, date, page title, and attribution subtitle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Field 1: Manuscript / Project Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>1. Manuscript / Project Title</span>
                </label>
                <input
                  type="text"
                  value={headerForm.projectTitle}
                  onChange={(e) => setHeaderForm(prev => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="e.g. Grade 11 Biology: Animal & Plant Cell Ultrastructure"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wide focus:ring-2 focus:ring-purple-500 outline-none"
                  autoFocus={headerForm.focusField === 'projectTitle'}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Header text on top of manuscript sheets & exported Word documents.
                </p>
              </div>

              {/* Field 2: Document Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>2. Document Date</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toLocaleDateString();
                      setHeaderForm(prev => ({ ...prev, date: today }));
                    }}
                    className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Use Today's Date</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerForm.date}
                    onChange={(e) => setHeaderForm(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. 9/20/2026"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus={headerForm.focusField === 'date'}
                  />
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        const parts = e.target.value.split('-');
                        if (parts.length === 3) {
                          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          setHeaderForm(prev => ({ ...prev, date: d.toLocaleDateString() }));
                        }
                      }
                    }}
                    className="px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="Pick date from calendar"
                  />
                </div>
              </div>

              {/* Field 3: Document / Page Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>3. Document / Page Title</span>
                </label>
                <input
                  type="text"
                  value={headerForm.pageTitle}
                  onChange={(e) => setHeaderForm(prev => ({ ...prev, pageTitle: e.target.value }))}
                  placeholder="e.g. The Structure of Euglena"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  autoFocus={headerForm.focusField === 'pageTitle'}
                />
              </div>

              {/* Field 4: Subtitle - Role / Audience & Field / Subject */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>4. Prepared For & Academic Field Metadata</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const r = headerForm.role || 'TEACHER';
                      const f = headerForm.category || 'Cytology & Cell Biology';
                      setHeaderForm(prev => ({
                        ...prev,
                        customSubtitle: `Prepared for: ${r.toUpperCase()} • Field: ${f}`
                      }));
                    }}
                    className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Reset to "Prepared for..." Format
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Audience / Role
                    </span>
                    <input
                      type="text"
                      value={headerForm.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHeaderForm(prev => ({
                          ...prev,
                          role: val,
                          customSubtitle: `Prepared for: ${val.toUpperCase()} • Field: ${prev.category || 'Cytology & Cell Biology'}`
                        }));
                      }}
                      placeholder="e.g. TEACHER or Researcher"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Subject / Field
                    </span>
                    <input
                      type="text"
                      value={headerForm.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHeaderForm(prev => ({
                          ...prev,
                          category: val,
                          customSubtitle: `Prepared for: ${(prev.role || 'TEACHER').toUpperCase()} • Field: ${val}`
                        }));
                      }}
                      placeholder="e.g. Cytology & Cell Biology"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Complete Custom Subtitle String (Editable directly)
                  </span>
                  <input
                    type="text"
                    value={headerForm.customSubtitle}
                    onChange={(e) => setHeaderForm(prev => ({ ...prev, customSubtitle: e.target.value }))}
                    placeholder="e.g. Prepared for: TEACHER • Field: Cytology & Cell Biology"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs italic text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus={headerForm.focusField === 'subtitle'}
                  />
                </div>
              </div>

              {/* Real-Time Live Preview of the Document Header */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-2">
                  Live Word Manuscript Header Preview:
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-purple-900 dark:text-purple-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                    <span className="truncate max-w-xs">{headerForm.projectTitle || 'PROJECT TITLE'}</span>
                    <span className="text-slate-500 dark:text-slate-400">{headerForm.date || '9/20/2026'}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-0.5">
                    {headerForm.pageTitle || 'Page Title'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-2">
                    {headerForm.customSubtitle || 'Prepared for: TEACHER • Field: Cytology & Cell Biology'}
                  </p>
                  <div className="h-0.5 w-full bg-purple-900/40 dark:bg-purple-400/40" />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHeaderForm}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Subheading Extender & Expander */}
      {showSubheadingExtenderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 flex items-center justify-center text-amber-300 shadow-sm">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Subheading Academic Extender
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-300">
                      In-Depth Synthesis
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Expand any subheading into comprehensive, multi-paragraph scholarly text with citations and formulas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubheadingExtenderModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Existing Subheading or Custom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Subheading in Current Chapter
                </label>
                {(() => {
                  const detectedHeadings = (activePage?.content || '')
                    .match(/^#{1,4}\s+(.+)$/gm)
                    ?.map(h => h.replace(/^#{1,4}\s+/, '').trim()) || [];

                  return (
                    <div className="space-y-2">
                      {detectedHeadings.length > 0 && (
                        <select
                          value={selectedSubheading}
                          onChange={(e) => setSelectedSubheading(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-900 cursor-pointer"
                        >
                          <option value="">-- Choose detected subheading from page --</option>
                          {detectedHeadings.map((hd, i) => (
                            <option key={i} value={hd}>{hd}</option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={selectedSubheading}
                        onChange={(e) => setSelectedSubheading(e.target.value)}
                        placeholder="Or enter/edit custom subheading (e.g. Empirical Review of Micro-finance Impact on SME Liquidity)"
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-900"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Model Engine Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Engine Model
                </label>
                <select
                  value={chatEngine}
                  onChange={(e) => setChatEngine(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-300 focus:ring-2 focus:ring-purple-900 cursor-pointer"
                >
                  <option value="gemini-flash">Gemini 2.5 Flash</option>
                  <option value="puter-gpt-4o-mini">GPT-4o-mini</option>
                  <option value="puter-claude-3-5">Claude 3.5 Sonnet</option>
                  <option value="puter-grok">Grok 2</option>
                  <option value="puter-deepseek">DeepSeek Chat</option>
                  <option value="puter-kimi">Kimi Chat</option>
                </select>
              </div>

              {/* Expansion Target Depth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Expansion Depth & Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard Depth', desc: '~600-1,000 words' },
                    { id: 'multi-page-deep', label: 'Multi-Page Deep', desc: '~1,200-1,800 words' },
                    { id: 'exhaustive', label: 'Exhaustive Treatise', desc: '~2,000+ words' }
                  ].map((dp) => (
                    <button
                      key={dp.id}
                      type="button"
                      onClick={() => setSubheadingExpansionDepth(dp.id as any)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        subheadingExpansionDepth === dp.id
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-600 text-purple-900 dark:text-purple-300 ring-1 ring-purple-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{dp.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{dp.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Guidance / Citations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Specific Scholar Focus, Authors, or Context (Optional)
                </label>
                <textarea
                  value={subheadingCustomNotes}
                  onChange={(e) => setSubheadingCustomNotes(e.target.value)}
                  placeholder="e.g. Compare findings from Smith et al. (2023) and Zhao & Patel (2024); include mathematical modeling equations and tabular synthesis..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-900 resize-none h-18"
                />
              </div>

              {/* Destination Mode */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Auto-Create Sequential Continuation Page
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Creates a distinct "(Part X)" page so chapter titles never duplicate
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={subheadingAutoNewPage}
                  onChange={(e) => setSubheadingAutoNewPage(e.target.checked)}
                  className="w-4 h-4 text-purple-900 rounded focus:ring-purple-900 cursor-pointer"
                />
              </div>

              {/* Status */}
              {isSubheadingExpanding && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 text-purple-700 dark:text-purple-400 animate-spin shrink-0" />
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                    Drafting scholarly expansion for &ldquo;{selectedSubheading}&rdquo;...
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSubheadingExtenderModal(false)}
                disabled={isSubheadingExpanding}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExpandSubheading}
                disabled={isSubheadingExpanding || !selectedSubheading.trim()}
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-900 to-indigo-700 hover:from-purple-800 hover:to-indigo-600 text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubheadingExpanding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Expanding Subheading...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Synthesize & Insert Expansion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Consolidated Dissertation Manuscript */}
      {showConsolidateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 flex items-center justify-center text-amber-300 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Consolidated Thesis Manuscript
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-300">
                      Unified Master Document
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    All {activeProject?.pages.length || 0} chapters, preliminary pages, and master references harmonized into a single scholarly work.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConsolidateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Box */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {consolidatedThesisText}
            </div>

            {/* Export and Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(consolidatedThesisText);
                    showToast('Manuscript copied to clipboard!', 'success');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Manuscript</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeProject) {
                      const newPage = {
                        id: `page-${Date.now()}`,
                        title: `Complete Dissertation: ${activeProject.title}`,
                        content: consolidatedThesisText,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                      };
                      const updatedPages = [...activeProject.pages, newPage];
                      updateWorkspaceProject(activeProject.id, {
                        pages: updatedPages,
                        activePageIndex: updatedPages.length - 1
                      });
                      setShowConsolidateModal(false);
                      showToast('Added Consolidated Manuscript as new Master Page!', 'success');
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 rounded-xl flex items-center gap-1.5 cursor-pointer border border-purple-200 dark:border-purple-800"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Add as Master Page</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport('word', 'project')}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Master Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('pdf', 'project')}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Master PDF (.pdf)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Evidence Matrix Modal */}
      <EvidenceMatrixView
        isOpen={showEvidenceMatrixModal}
        onClose={() => setShowEvidenceMatrixModal(false)}
        onInsertIntoManuscript={(tableMarkdown) => {
          if (!activeProject || !activePage) return;
          const updatedContent = `${activePage.content}\n\n### Empirical Evidence Matrix\n\n${tableMarkdown}\n`;
          updateProjectPage(activeProject.id, activePageIndex, { content: updatedContent });
          showToast('Evidence Matrix inserted into active page!', 'success');
        }}
      />

      {/* Claim Audit Modal */}
      <ClaimAuditModal
        isOpen={showClaimAuditModal}
        onClose={() => setShowClaimAuditModal(false)}
        claims={activeAuditedClaims}
        currentText={activePage?.content || ''}
        onApplyFixesToText={(fixedText) => {
          if (!activeProject || !activePage) return;
          updateProjectPage(activeProject.id, activePageIndex, { content: fixedText });
          const reclaims = extractClaimsFromText(fixedText, activeProject?.category || "Higher Education");
          setActiveAuditedClaims(reclaims);
          showToast('Applied recommended scholarly qualifications to active page!', 'success');
        }}
      />

      {/* 18-Point Pre-Submission Audit Modal */}
      <PreSubmissionAuditModal
        isOpen={showPreSubmissionAuditModal}
        onClose={() => setShowPreSubmissionAuditModal(false)}
        title={activeProject?.title || "Academic Dissertation"}
        content={activeProject?.pages.map(p => `## ${p.title}\n\n${p.content}`).join('\n\n---\n\n') || activePage?.content || ''}
        projectPages={activeProject?.pages}
        onApplyResolvedContent={(resolvedContent, resolvedTitle, updatedPages) => {
          if (!activeProject) return;
          if (updatedPages && updatedPages.length > 0) {
            const newPages = activeProject.pages.map((page, idx) => {
              const matched = updatedPages[idx];
              return matched ? { ...page, content: matched.content, title: matched.title || page.title } : page;
            });
            updateWorkspaceProject(activeProject.id, {
              title: resolvedTitle || activeProject.title,
              pages: newPages
            });
          } else if (activePage) {
            updateProjectPage(activeProject.id, activePageIndex, { content: resolvedContent });
            if (resolvedTitle && resolvedTitle !== activeProject.title) {
              updateWorkspaceProject(activeProject.id, { title: resolvedTitle });
            }
          }
          showToast('Pre-submission audit issues resolved successfully! Manuscript updated.', 'success');
        }}
      />

      {/* Sentence & Paragraph Extension Modal (Anti-Cutoff Engine) */}
      <SentenceExtensionModal
        isOpen={showSentenceExtensionModal}
        onClose={() => setShowSentenceExtensionModal(false)}
        activePageContent={activePage?.content || ''}
        projectTopic={activeProject?.title}
        initialIncompleteText={sentenceExtensionPrefill}
        onApplyExtension={(newContent) => {
          if (!activeProject || !activePage) return;
          updateProjectPage(activeProject.id, activePageIndex, { content: newContent });
          showToast('Applied sentence & paragraph extension to manuscript!', 'success');
        }}
      />
    </div>
  );
}
