import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Download, 
  BookOpen, 
  Layers, 
  Palette, 
  Check, 
  Loader2, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Target, 
  Compass, 
  Activity,
  Maximize2,
  Share2,
  Copy,
  LayoutGrid,
  Edit3,
  Bookmark,
  FileDown,
  FileText
} from 'lucide-react';
import { useAppStore } from '../store';
import { InfographicData, InfographicSection } from '../types';
import { puterChat } from '../lib/puter';
import { PortalExitButton } from '../components/PortalExitButton';
import { PageNavigationBar } from '../components/PageNavigationBar';
import { DrawingCanvas, DrawingStroke } from '../components/DrawingCanvas';
import { ShapesLayer, CanvasShape } from '../components/ShapesLayer';
import { InfographicContentEditor, AVAILABLE_FONTS } from '../components/InfographicContentEditor';

const PRESET_INFOGRAPHICS: InfographicData[] = [
  {
    id: 'info-hydrocarbons',
    topic: 'Saturated Hydrocarbons: Alkanes (Ethane & Propane)',
    title: 'Saturated Hydrocarbons & Alkane Series',
    subtitle: 'Single covalent bonds (C—C & C—H) in carbon chains',
    summary: 'Saturated hydrocarbons are hydrocarbons consisting of carbon chains with single bonds between them, in which carbon joins with another carbon by a single covalent bond, e.g., alkanes ( like ethane C 2 H 6, propane C 3 H 8 )',
    palette: 'emerald-teal',
    style: 'pillar-cards',
    timestamp: Date.now() - 500000,
    conclusion: 'Because carbon forms four single sigma bonds with sp³ tetrahedral angles (109.5°), saturated hydrocarbons possess high chemical stability and undergo substitution rather than addition reactions.',
    sections: [
      {
        id: 'sec-hc1',
        title: 'Ethane (C₂H₆)',
        description: 'Two carbons joined by a single covalent bond (C—C) with six C—H single bonds.',
        color: '#10B981',
        badge: 'C₂H₆',
        illustrationType: 'ethane-2d',
        metrics: [
          { label: 'C—C Bond', value: '1.54 Å' },
          { label: 'Angle', value: '109.5°' }
        ]
      },
      {
        id: 'sec-hc2',
        title: 'Propane (C₃H₈)',
        description: 'Three carbons in a single-bonded chain (C—C—C) surrounded by eight hydrogens.',
        color: '#3B82F6',
        badge: 'C₃H₈',
        illustrationType: 'propane-2d',
        metrics: [
          { label: 'C—C Bond', value: '1.54 Å' },
          { label: 'State', value: 'Gas' }
        ]
      },
      {
        id: 'sec-hc3',
        title: 'Methane (CH₄)',
        description: 'Simplest alkane with one central carbon bonded to four hydrogens.',
        color: '#F59E0B',
        badge: 'CH₄',
        illustrationType: 'methane-2d',
        metrics: [
          { label: 'Dipole', value: '0.00 D' },
          { label: 'Geometry', value: 'Tetrahedral' }
        ]
      },
      {
        id: 'sec-hc4',
        title: 'Single Covalent Bonds',
        description: 'Strong sigma (σ) bonds with free conformational rotation around C—C axes.',
        color: '#8B5CF6',
        badge: 'sp³ Hybrid',
        illustrationType: 'hydrocarbon-paper',
        metrics: [
          { label: 'Hybridization', value: 'sp³' },
          { label: 'Bond Energy', value: '347 kJ/mol' }
        ]
      }
    ]
  },
  {
    id: 'info-chem-1',
    topic: 'Molecular Geometry: Methane (CH₄) vs Water (H₂O)',
    title: 'Molecular Geometries & VSEPR Theory',
    subtitle: 'Analyzing textbook structural formulas, stereochemistry, and bond angles',
    summary: 'A direct comparison of the sp³ hybridized structural symmetries of Methane (AX₄) and Water (AX₂E₂).',
    palette: 'emerald-teal',
    style: 'pillar-cards',
    timestamp: Date.now() - 1000000,
    conclusion: 'While both utilize sp³ hybridization, non-bonding electron lone pairs on oxygen compress the bond angles from 109.5° down to 104.5°, directly altering polarity and macroscopic properties.',
    sections: [
      {
        id: 'sec-c1',
        title: 'Methane: 2D Lewis Sticker Form',
        description: 'Symmetrical tetrahedral projection on a 2D plane.',
        color: '#10B981',
        badge: 'Non-Polar',
        illustrationType: 'methane-2d',
        metrics: [
          { label: 'Net Dipole', value: '0.00 D' },
          { label: 'Angle', value: '109.5°' }
        ]
      },
      {
        id: 'sec-c2',
        title: 'Methane: 3D Ball & Stick',
        description: 'Perfect Td point-group symmetry in 3-dimensional space.',
        color: '#38BDF8',
        badge: 'Tetrahedral',
        illustrationType: 'methane-3d',
        metrics: [
          { label: 'Hybridization', value: 'sp³' },
          { label: 'C-H Bond', value: '1.09 Å' }
        ]
      },
      {
        id: 'sec-c3',
        title: 'Water: 2D Lewis Sticker Form',
        description: 'Two bonding pairs and two non-bonding lone pairs (4 e⁻).',
        color: '#F59E0B',
        badge: 'Polar',
        illustrationType: 'water-2d',
        metrics: [
          { label: 'Net Dipole', value: '1.85 D' },
          { label: 'Angle', value: '104.5°' }
        ]
      },
      {
        id: 'sec-c4',
        title: 'Water: 3D Ball & Stick',
        description: 'Bent (V-shaped) geometry leading to strong molecular dipole.',
        color: '#EC4899',
        badge: 'Bent (AX₂E₂)',
        illustrationType: 'water-3d',
        metrics: [
          { label: 'Hybridization', value: 'sp³' },
          { label: 'O-H Bond', value: '0.96 Å' }
        ]
      }
    ]
  },
  {
    id: 'info-1',
    topic: 'CRISPR-Cas9 Gene Editing: Complete Mechanism & Clinical Horizons',
    title: 'CRISPR-Cas9 Precision Genome Editing',
    subtitle: 'Molecular mechanisms, double-strand break repair, and therapeutic applications',
    summary: 'A multi-dimensional breakdown of RNA-guided endonuclease targeting, PAM recognition, non-homologous end joining (NHEJ), and homology-directed repair (HDR).',
    palette: 'vibrant-spectrum',
    style: 'pillar-cards',
    timestamp: Date.now() - 7200000,
    conclusion: 'CRISPR-Cas9 transforms fundamental genetics by enabling targeted nucleotide ablation and insertion with unprecedented specificity and clinical translation potential.',
    sections: [
      {
        id: 'sec-1',
        title: 'Guide RNA (sgRNA) Design & Recognition',
        description: 'Synthetic 20-nucleotide single guide RNA designed to match the targeted genomic loci with high sequence complementarity.',
        color: '#6366F1', // Indigo
        badge: 'Stage 01',
        metrics: [
          { label: 'Target Specificity', value: '99.4%', progress: 99 },
          { label: 'sgRNA Length', value: '20 nt', progress: 80 }
        ],
        points: [
          'Pre-designed tracrRNA-crRNA fusion chimera',
          'Identifies unique genomic target sequences without cross-hybridization'
        ]
      },
      {
        id: 'sec-2',
        title: 'PAM Site Interrogation (NGG Motif)',
        description: 'Cas9 protein scans the duplex DNA for the 5-NGG-3 Protospacer Adjacent Motif before strand unwinding can occur.',
        color: '#EC4899', // Pink
        badge: 'Stage 02',
        metrics: [
          { label: 'PAM Proximity', value: '3-4 bp', progress: 85 },
          { label: 'Unwinding Speed', value: '<50 ms', progress: 92 }
        ],
        points: [
          'Direct contact by Cas9 C-terminal domain',
          'Failure to bind PAM completely aborts double-strand cleavage'
        ]
      },
      {
        id: 'sec-3',
        title: 'R-Loop Formation & Dual Catalytic Cleavage',
        description: 'RuvC and HNH endonuclease domains execute coordinated single-strand cuts 3 base pairs upstream of the PAM sequence.',
        color: '#F59E0B', // Amber
        badge: 'Stage 03',
        metrics: [
          { label: 'Endonuclease Cut', value: 'Double Strand', progress: 100 },
          { label: 'Cleavage Cleanness', value: 'Blunt End', progress: 95 }
        ],
        points: [
          'HNH domain cleaves the complementary DNA strand',
          'RuvC domain cleaves the non-complementary strand creating a blunt DSB'
        ]
      },
      {
        id: 'sec-4',
        title: 'Cellular Repair Pathways: NHEJ vs HDR',
        description: 'Host machinery repairs the lesion via error-prone Non-Homologous End Joining (knockout) or precise Homology-Directed Repair (knock-in).',
        color: '#10B981', // Emerald
        badge: 'Stage 04',
        metrics: [
          { label: 'NHEJ Frequency', value: '70-85%', progress: 85 },
          { label: 'HDR with Donor', value: '15-30%', progress: 30 }
        ],
        points: [
          'NHEJ introduces insertion/deletion (indel) frameshift mutations',
          'HDR utilizes exogenous repair templates for precise gene correction'
        ]
      }
    ]
  }
];

export interface InfographicPageItem {
  id: string;
  pageNumber: number;
  data: InfographicData;
  shapes: CanvasShape[];
  strokes: DrawingStroke[];
}

export function InfographicStudio() {
  const { 
    language, 
    sendToResearch, 
    saveInfographic, 
    setCurrentView,
    importInfographicToWorkspace,
    workspaceProjects,
    activeProjectId
  } = useAppStore();

  const [topicInput, setTopicInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<InfographicData['style']>('pillar-cards');
  const [selectedPalette, setSelectedPalette] = useState<InfographicData['palette']>('vibrant-spectrum');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target Page Workspace Modal State
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [targetExportProjectId, setTargetExportProjectId] = useState<string>(activeProjectId || (workspaceProjects[0]?.id || ''));
  const [targetExportPageIndex, setTargetExportPageIndex] = useState<number>(0);

  // Multi-page System: Can extend from 1 to 10 or more pages as user desires!
  const [pages, setPages] = useState<InfographicPageItem[]>([
    {
      id: 'page-1',
      pageNumber: 1,
      data: PRESET_INFOGRAPHICS[0],
      shapes: [],
      strokes: []
    }
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Styling & Editing Kits
  const [fontFamily, setFontFamily] = useState<string>("'Poppins', sans-serif");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);

  const currentPage = pages[activePageIndex] || pages[0];
  const currentInfographic = currentPage.data;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateCurrentPageData = (updatedData: InfographicData) => {
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, data: updatedData } : p));
  };

  const updateCurrentPageShapes = (updatedShapes: CanvasShape[]) => {
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, shapes: updatedShapes } : p));
  };

  const updateCurrentPageStrokes = (updatedStrokes: DrawingStroke[]) => {
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, strokes: updatedStrokes } : p));
  };

  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPage: InfographicPageItem = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: nextNum,
      data: {
        id: `info_${Date.now()}`,
        topic: `Infographic Topic Page ${nextNum}`,
        title: `Visual Breakdown: Page ${nextNum}`,
        subtitle: `Explaining key facets and sub-processes`,
        summary: `Structured overview of stage dynamics and interconnected components for topic exploration.`,
        palette: selectedPalette,
        style: selectedStyle,
        sections: [
          {
            id: `sec_${Date.now()}_1`,
            title: `Primary Phase: Section 1`,
            badge: `Stage 01`,
            description: `Core fundamental principle governing this segment.`,
            color: '#6366F1',
            points: ['Primary observation rule', 'Observable behavioral pattern'],
            metrics: [{ label: 'Significance', value: 'High' }]
          },
          {
            id: `sec_${Date.now()}_2`,
            title: `Secondary Phase: Section 2`,
            badge: `Stage 02`,
            description: `Follow-up sequence and downstream characteristics.`,
            color: '#10B981',
            points: ['Catalytic feedback loop', 'Measured efficiency outcome'],
            metrics: [{ label: 'Efficiency', value: '94%' }]
          }
        ],
        conclusion: `Final synthesis of Page ${nextNum} observations and essential conceptual takeaways.`,
        timestamp: Date.now()
      },
      shapes: [],
      strokes: []
    };

    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
    showToast(`Page ${nextNum} added! Pages can be extended from 1 to 10 or more.`);
  };

  const handleDuplicatePage = () => {
    const nextNum = pages.length + 1;
    const cloned: InfographicPageItem = {
      ...JSON.parse(JSON.stringify(currentPage)),
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: nextNum,
      data: {
        ...JSON.parse(JSON.stringify(currentPage.data)),
        id: `info_${Date.now()}`,
        title: `${currentPage.data.title} (Page ${nextNum})`
      }
    };
    setPages(prev => [...prev, cloned]);
    setActivePageIndex(pages.length);
    showToast(`Page ${nextNum} duplicated successfully!`);
  };

  const handleDeletePage = (indexToDelete: number) => {
    if (pages.length <= 1) {
      showToast('Cannot delete the only remaining page.');
      return;
    }
    if (window.confirm(`Delete Infographic Page ${indexToDelete + 1}?`)) {
      const updated = pages.filter((_, idx) => idx !== indexToDelete);
      setPages(updated);
      setActivePageIndex(Math.max(0, indexToDelete - 1));
      showToast(`Page ${indexToDelete + 1} removed.`);
    }
  };

  const generateInfographic = async () => {
    if (!topicInput.trim()) {
      showToast('Please enter a concept or topic to break down into an infographic.');
      return;
    }

    setIsGenerating(true);
    setToastMessage('AI is architecting colorful structured infographic components...');

    const promptText = `
You are an expert Data Visualizer and Educational Infographic Designer.
Deconstruct the following complex topic or concept into an intuitive, vibrant, and beautifully simplified multi-stage infographic.

Topic/Concept: ${topicInput}
Visual Structure Style: ${selectedStyle}
Color Palette Motif: ${selectedPalette}
Language / Dialect: ${language || 'English (US)'}

CRITICAL REQUIREMENT: Respond ONLY with a valid JSON object matching this schema exactly (no code blocks, no other text):

{
  "title": "Clear Catchy Title of the Infographic",
  "subtitle": "Short descriptive subtitle highlighting the core principle",
  "summary": "2-sentence executive breakdown of how this concept functions",
  "palette": "${selectedPalette}",
  "style": "${selectedStyle}",
  "conclusion": "Final synthesis or key takeaway summarizing why this concept matters",
  "sections": [
    {
      "id": "sec-1",
      "title": "Section / Stage 1 Title",
      "description": "Clear, informative explanation of this aspect or stage",
      "color": "#6366F1", // Provide distinct vibrant hex colors for each section (e.g. #6366F1, #EC4899, #F59E0B, #10B981, #3B82F6, #8B5CF6)
      "badge": "01",
      "metrics": [
        { "label": "Key Metric/Aspect", "value": "95%", "progress": 95 },
        { "label": "Secondary Factor", "value": "High", "progress": 80 }
      ],
      "points": ["Granular point 1", "Granular point 2"]
    }
  ]
}
`;

    try {
      let rawJson = '';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            tone: 'Academic',
            language: language || 'English (US)'
          })
        });
        if (res.ok) {
          const data = await res.json();
          rawJson = data.text || '';
        }
      } catch (backendErr) {
        console.warn('Backend generation failed, using puter AI fallback:', backendErr);
      }

      if (!rawJson) {
        rawJson = await puterChat(promptText, 'gpt-4o-mini');
      }

      const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const newInfo: InfographicData = {
        id: Date.now().toString(),
        topic: topicInput,
        title: parsed.title || topicInput,
        subtitle: parsed.subtitle || 'Simplified Concept Breakdown',
        summary: parsed.summary || 'Comprehensive visual deconstruction',
        palette: selectedPalette,
        style: selectedStyle,
        sections: Array.isArray(parsed.sections) ? parsed.sections : PRESET_INFOGRAPHICS[0].sections,
        conclusion: parsed.conclusion || 'Key summary of findings and concepts.',
        timestamp: Date.now()
      };

      updateCurrentPageData(newInfo);
      saveInfographic(newInfo);
      showToast(`Infographic generated with ${newInfo.sections.length} color-coded sections!`);
    } catch (err: any) {
      console.error('Infographic generation error:', err);
      showToast('Error generating infographic. Please try again with a specific concept.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoveToResearch = () => {
    const isOrganicChem = /hydrocarbon|alkane|methane|ethane|propane|chemical/i.test(currentInfographic.title + ' ' + currentInfographic.topic);

    let researchDoc = isOrganicChem
      ? `Saturated Hydrocarbons: Saturated hydrocarbons are hydrocarbons consisting of carbon chains with single bonds between them, in which carbon joins with another carbon by a single covalent bond, e.g., alkanes ( like ethane C 2 H 6, propane C 3 H 8 )

\`\`\`
      H   H
      |   |
  H - C - C - H
      |   |
      H   H
  (Ethane, C₂H₆)

      H   H   H
      |   |   |
  H - C - C - C - H
      |   |   |
      H   H   H
  (Propane, C₃H₈)

      H
      |
  H - C - H
      |
      H
  (Methane, CH₄)
\`\`\`

${currentInfographic.summary}\n\n`
      : `${currentInfographic.summary}\n\n`;

    currentInfographic.sections.forEach((sec, idx) => {
      researchDoc += `${idx + 1}. ${sec.title} (${sec.badge || 'Section'}): ${sec.description}\n`;
      
      if (sec.metrics && sec.metrics.length > 0) {
        sec.metrics.forEach(m => {
          researchDoc += `- ${m.label}: ${m.value}\n`;
        });
      }

      if (sec.points && sec.points.length > 0) {
        sec.points.forEach(p => {
          researchDoc += `- ${p}\n`;
        });
      }

      researchDoc += `\n`;
    });

    if (currentInfographic.conclusion) {
      researchDoc += `${currentInfographic.conclusion}\n`;
    }

    sendToResearch(researchDoc, currentInfographic.title, {
      type: 'infographic',
      title: currentInfographic.title,
      infographicData: currentInfographic
    });
  };

  const handleExecuteWorkspaceImport = (navigateToWorkspace: boolean = true) => {
    if (!currentInfographic) return;

    importInfographicToWorkspace(currentInfographic, {
      targetProjectId: targetExportProjectId || activeProjectId,
      targetPageIndex: targetExportPageIndex
    });

    showToast(`"${currentInfographic.title}" imported into Workspace Page ${targetExportPageIndex + 1}!`);
    setShowWorkspaceModal(false);

    if (navigateToWorkspace) {
      setCurrentView('workspace');
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-36 overflow-y-auto scroll-smooth">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <PortalExitButton portalName="Infographic Studio" />
          <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-purple-600 text-white rounded-xl shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Infographic Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Break down and simplify complex concepts with rich, vibrant multi-color visual infographics</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Cross-Portal Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentView('workspace')}
              className="px-2.5 py-1.5 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Switch to Word Workspace"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word Workspace</span>
            </button>
            <button
              onClick={() => setCurrentView('draw-label')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Switch to Draw & Label Studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Draw & Label Portal</span>
            </button>
          </div>

          <button 
            onClick={() => setShowWorkspaceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Import infographic layout, cards, and analytical metrics directly into Word Workspace page"
          >
            <FileText className="w-4 h-4 text-indigo-200" />
            <span>Import to Workspace</span>
          </button>

          <button 
            onClick={() => {
              saveInfographic(currentInfographic);
              showToast('Saved infographic to Projects!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-purple-600" />
            <span>Save to Projects</span>
          </button>
          <button 
            onClick={handleMoveToResearch}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-all shadow-sm cursor-pointer"
            title="Import this infographic data and structural analysis directly into AI Research"
          >
            <BookOpen className="w-4 h-4" />
            <span>Move to AI Research</span>
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-purple-900 text-amber-300 border border-purple-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-amber-400">✕</button>
        </div>
      )}

      {/* Controls & Prompt Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Concept to Present & Simplify in Infographic Format
            </label>
            <textarea
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. How Photosynthesis works (Light reactions vs Calvin Cycle), The Quantum Zeno Effect, Nitrogen Cycle in Agriculture, or Transformers in Large Language Models..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 outline-none resize-none transition-all"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Visual Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as InfographicData['style'])}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="pillar-cards">Pillar Matrix</option>
                  <option value="step-process">Step Process Flow</option>
                  <option value="bento-grid">Bento Modular Grid</option>
                  <option value="comparison-matrix">Comparison Matrix</option>
                  <option value="timeline-roadmap">Timeline Roadmap</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Color Palette</label>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value as InfographicData['palette'])}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="vibrant-spectrum">Vibrant Spectrum</option>
                  <option value="emerald-teal">Emerald Bio-Teal</option>
                  <option value="royal-gold">Royal Purple & Gold</option>
                  <option value="cyber-neon">Cyber Neon Dark</option>
                  <option value="warm-sunset">Warm Sunset Coral</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateInfographic}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing Infographic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate Multi-Color Infographic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Page Navigation Bar (Can extend 1 to 10+ pages) */}
      <div className="mb-6">
        <PageNavigationBar
          pageCount={pages.length}
          activePageIndex={activePageIndex}
          onSelectPage={setActivePageIndex}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          pageTitles={pages.map(p => p.data.title)}
          moduleName="Infographic Page"
        />
      </div>

      {/* Editing Toolbar & Font Switcher (Featuring Poppins) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Content Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isEditMode 
                ? 'bg-purple-900 text-white shadow-purple-900/20' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span>{isEditMode ? 'Editing Mode Active' : 'Edit Infographic Content'}</span>
          </button>

          {/* Toggle Freehand Drawing Kit */}
          <button
            onClick={() => setIsDrawingActive(!isDrawingActive)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isDrawingActive 
                ? 'bg-pink-600 text-white shadow-pink-600/20' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isDrawingActive ? 'Drawing Kit Enabled' : 'Freehand Drawing Tool'}</span>
          </button>
        </div>

        {/* Font Style Selection (Poppins Default & Supported) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Font:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {AVAILABLE_FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => setFontFamily(f.css)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontFamily === f.css
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                style={{ fontFamily: f.css }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editable Content Panel when Edit Mode is active */}
      {isEditMode && (
        <InfographicContentEditor
          infographic={currentInfographic}
          onChange={updateCurrentPageData}
          fontFamily={fontFamily}
          onFontChange={setFontFamily}
        />
      )}

      {/* Main Infographic Canvas / Visual Display */}
      <div 
        id="infographic-canvas-container"
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative min-h-[600px] pb-10"
        style={{ fontFamily }}
      >
        {/* Interactive Shapes Layer */}
        <ShapesLayer
          shapes={currentPage.shapes}
          onChange={updateCurrentPageShapes}
          fontFamily={fontFamily}
          isEditingEnabled={isEditMode}
        />

        {/* Freehand Drawing Canvas */}
        <DrawingCanvas
          strokes={currentPage.strokes}
          onChange={updateCurrentPageStrokes}
          isDrawingActive={isDrawingActive}
          onToggleDrawing={setIsDrawingActive}
        />
        {/* Infographic Banner & Hero Concept */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span>Comprehensive Concept Infographic</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {currentInfographic.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            {currentInfographic.subtitle}
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentInfographic.summary}
          </div>
        </div>

        {/* Dynamic Multi-Color Section Rendering */}
        {selectedStyle === 'step-process' ? (
          /* Step-by-Step Flow Line */
          <div className="space-y-4">
            {currentInfographic.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className="flex flex-col sm:flex-row items-stretch gap-4 p-5 rounded-2xl border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: `${sec.color}0D`, 
                  borderColor: `${sec.color}40` 
                }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shrink-0 shadow-md"
                  style={{ backgroundColor: sec.color }}
                >
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">Step</span>
                  <span className="text-lg leading-none">{idx + 1}</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                    <span 
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: sec.color }}
                    >
                      {sec.badge || `Stage 0${idx + 1}`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.description}
                  </p>

                  {sec.points && sec.points.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {sec.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span style={{ color: sec.color }} className="font-bold">•</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : selectedStyle === 'bento-grid' ? (
          /* Bento Modular Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentInfographic.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-lg transition-all ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
                style={{ 
                  backgroundColor: `${sec.color}0A`, 
                  borderColor: `${sec.color}35` 
                }}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white shadow-sm"
                      style={{ backgroundColor: sec.color }}
                    >
                      {sec.badge || `Module 0${idx + 1}`}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: sec.color }}>
                      #{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {sec.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.description}
                  </p>
                </div>

                {sec.metrics && sec.metrics.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
                    {sec.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{m.label}</span>
                          <span style={{ color: sec.color }}>{m.value}</span>
                        </div>
                        {typeof m.progress === 'number' && (
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${m.progress}%`, backgroundColor: sec.color }} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Default: Multi-Column Pillar Cards with Rich Color Highlights */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentInfographic.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className="rounded-3xl p-6 border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ 
                  backgroundColor: `${sec.color}08`, 
                  borderColor: `${sec.color}35` 
                }}
              >
                {/* Top Accent Strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: sec.color }}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center pt-2">
                    <span 
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: sec.color }}
                    >
                      {sec.badge || `0${idx + 1}`}
                    </span>
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${sec.color}25`, color: sec.color }}
                    >
                      ✦
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {sec.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.description}
                  </p>

                  {sec.points && sec.points.length > 0 && (
                    <ul className="space-y-1.5 pt-2">
                      {sec.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span style={{ color: sec.color }} className="font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* SVG Illustration Injection */}
                {sec.illustrationType && (
                  <div className="mt-4 flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {sec.illustrationType === 'methane-2d' && (
                      <svg viewBox="0 0 120 120" className="w-24 h-24">
                        <text x="60" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">C</text>
                        <text x="60" y="24" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <text x="60" y="108" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <text x="18" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <text x="102" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <line x1="60" y1="32" x2="60" y2="44" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="74" x2="60" y2="86" stroke="currentColor" strokeWidth="2" />
                        <line x1="32" y1="58" x2="44" y2="58" stroke="currentColor" strokeWidth="2" />
                        <line x1="76" y1="58" x2="88" y2="58" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    {sec.illustrationType === 'methane-3d' && (
                      <svg viewBox="0 0 120 120" className="w-24 h-24">
                        <line x1="60" y1="60" x2="25" y2="25" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        <line x1="60" y1="60" x2="95" y2="25" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        <line x1="60" y1="60" x2="25" y2="95" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        <line x1="60" y1="60" x2="95" y2="95" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        
                        <circle cx="25" cy="25" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="25" y="30" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        <circle cx="95" cy="25" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="95" y="30" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        <circle cx="25" cy="95" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="25" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        <circle cx="95" cy="95" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="95" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        
                        <circle cx="60" cy="60" r="18" fill="#EF4444" stroke="#FEE2E2" strokeWidth="1.5" />
                        <text x="60" y="66" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">C</text>
                      </svg>
                    )}
                    {sec.illustrationType === 'water-2d' && (
                      <svg viewBox="0 0 120 120" className="w-24 h-24">
                        <text x="60" y="66" fontSize="28" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">O</text>
                        <text x="20" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <text x="100" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="currentColor">H</text>
                        <line x1="32" y1="58" x2="44" y2="58" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="76" y1="58" x2="88" y2="58" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="53" cy="34" r="2.5" fill="currentColor" />
                        <circle cx="67" cy="34" r="2.5" fill="currentColor" />
                        <circle cx="53" cy="82" r="2.5" fill="currentColor" />
                        <circle cx="67" cy="82" r="2.5" fill="currentColor" />
                      </svg>
                    )}
                    {sec.illustrationType === 'water-3d' && (
                      <svg viewBox="0 0 120 120" className="w-24 h-24">
                        <line x1="60" y1="40" x2="25" y2="85" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        <line x1="60" y1="40" x2="95" y2="85" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                        
                        <circle cx="25" cy="85" r="16" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="25" y="91" fontSize="14" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        <circle cx="95" cy="85" r="16" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                        <text x="95" y="91" fontSize="14" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                        
                        <circle cx="60" cy="40" r="22" fill="#EF4444" stroke="#FEE2E2" strokeWidth="2" />
                        <text x="60" y="48" fontSize="18" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">O</text>
                      </svg>
                    )}
                    {sec.illustrationType === 'ethane-2d' && (
                      <svg viewBox="0 0 160 100" className="w-28 h-20 text-slate-800 dark:text-slate-100">
                        <line x1="62" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="30" y1="50" x2="48" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="112" y1="50" x2="130" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="55" y1="26" x2="55" y2="38" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="55" y1="62" x2="55" y2="74" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="105" y1="26" x2="105" y2="38" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="105" y1="62" x2="105" y2="74" stroke="currentColor" strokeWidth="2.5" />
                        <text x="55" y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
                        <text x="105" y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
                        <text x="20" y="56" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="140" y="56" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="55" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="55" y="90" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="105" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="105" y="90" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                      </svg>
                    )}
                    {sec.illustrationType === 'propane-2d' && (
                      <svg viewBox="0 0 200 100" className="w-36 h-20 text-slate-800 dark:text-slate-100">
                        <line x1="50" y1="50" x2="78" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="94" y1="50" x2="122" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="22" y1="50" x2="36" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="136" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="43" y1="26" x2="43" y2="38" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="43" y1="62" x2="43" y2="74" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="86" y1="26" x2="86" y2="38" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="86" y1="62" x2="86" y2="74" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="129" y1="26" x2="129" y2="38" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="129" y1="62" x2="129" y2="74" stroke="currentColor" strokeWidth="2.5" />
                        <text x="43" y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
                        <text x="86" y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
                        <text x="129" y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
                        <text x="12" y="56" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="160" y="56" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="43" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="43" y="90" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="86" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="86" y="90" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="129" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                        <text x="129" y="90" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">H</text>
                      </svg>
                    )}
                    {sec.illustrationType === 'hydrocarbon-paper' && (
                      <div className="w-full py-1 text-center font-serif text-[11px] text-slate-800 dark:text-slate-200">
                        <span className="font-bold">CₙH₂ₙ₊₂</span>
                        <div className="font-mono text-[10px] mt-0.5 opacity-90">H—C(H)₂—C(H)₂—H</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metrics Bottom Box */}
                {sec.metrics && sec.metrics.length > 0 && (
                  <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    {sec.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{m.label}</span>
                        <span className="text-xs font-extrabold" style={{ color: sec.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Conclusion Footer Banner */}
        {currentInfographic.conclusion && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Final Takeaway & Significance</span>
              <p className="text-sm font-medium leading-relaxed text-slate-200">
                {currentInfographic.conclusion}
              </p>
            </div>
            <button
              onClick={handleMoveToResearch}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition-colors shadow-md"
            >
              Analyze in AI Research
            </button>
          </div>
        )}
      </div>

      {/* Safe bottom spacer ensuring no bottom blocks or cards are clipped */}
      <div className="h-20 w-full shrink-0" aria-hidden="true" />

      {/* Target Page Workspace Import Modal */}
      {showWorkspaceModal && currentInfographic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 dark:bg-purple-800 text-amber-300 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Infographic to Workspace</h3>
                  <p className="text-xs text-slate-400">Select target project and document page</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWorkspaceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Infographic Preview Summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{currentInfographic.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{currentInfographic.subtitle || currentInfographic.summary}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 rounded">{currentInfographic.sections.length} Infographic Sections</span>
                <span className="capitalize">{currentInfographic.style.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Project Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Workspace Project:</label>
              <select
                value={targetExportProjectId || activeProjectId}
                onChange={(e) => {
                  setTargetExportProjectId(e.target.value);
                  setTargetExportPageIndex(0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-600"
              >
                {workspaceProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} ({proj.pages.length} Pages)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Page Selection */}
            {(() => {
              const currentProj = workspaceProjects.find(p => p.id === (targetExportProjectId || activeProjectId)) || workspaceProjects[0];
              return (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Document Page:</label>
                  <select
                    value={targetExportPageIndex}
                    onChange={(e) => setTargetExportPageIndex(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-600"
                  >
                    {currentProj?.pages.map((p, idx) => (
                      <option key={p.id} value={idx}>
                        Page {idx + 1}: {p.title}
                      </option>
                    ))}
                    <option value={currentProj?.pages.length || 0}>
                      + Insert into New Page (Page {(currentProj?.pages.length || 0) + 1})
                    </option>
                  </select>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteWorkspaceImport(false)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Import content into document without switching views"
              >
                Import (Stay Here)
              </button>
              <button
                onClick={() => handleExecuteWorkspaceImport(true)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Import & Open Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
