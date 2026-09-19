import React, { useState, useRef, useEffect } from 'react';
import { 
  Presentation, 
  Upload, 
  Sparkles, 
  FileText, 
  Download, 
  Play, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Layers, 
  Palette, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Check, 
  Loader2,
  Bookmark,
  Share2,
  Copy,
  LayoutGrid,
  FileCheck,
  AlertCircle,
  HelpCircle,
  FileDown,
  FileCode,
  ExternalLink,
  Globe,
  Pause,
  MonitorPlay,
  Tv,
  Info,
  RefreshCw,
  X,
  Edit3,
  ArrowUp,
  ArrowDown,
  Paintbrush,
  Type,
  Undo2
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { useAppStore } from '../store';
import { SlideDeck, SlideItem } from '../types';
import { puterChat } from '../lib/puter';
import { extractTextFromPdf, synthesizeSlidesFromDocument, ExtractedDocument } from '../lib/pdfExtractor';
import { PortalExitButton } from '../components/PortalExitButton';

const PRESET_DECKS: SlideDeck[] = [
  {
    id: 'preset-chem-1',
    topic: 'Molecular Geometry: Methane (CH₄) & Water (H₂O)',
    title: 'Molecular Structures & VSEPR Theory',
    description: 'A rigorous presentation on chemical formulas, 3D wedge-and-dash stereochemistry, bond angles (109.5° vs 104.5°), and electronic dipole moments.',
    theme: 'academic-navy',
    createdAt: Date.now() - 1800000,
    slides: [
      {
        id: 'cs1',
        title: 'Molecular Geometry & VSEPR Principles',
        subtitle: 'From 2D Lewis Formulas to 3D Stereochemical Space',
        layout: 'title',
        bullets: [
          'Valence Shell Electron Pair Repulsion (VSEPR) governs 3D spatial conformation',
          'Comparison of idealized tetrahedral (CH₄) vs lone-pair compressed bent (H₂O) geometries',
          'Standardized IUPAC nomenclature, hybrid orbitals (sp³), and bond dipole vectors'
        ],
        notes: 'Introduce students to spatial orbital hybridization and the impact of non-bonding lone pair electron domains on bond angles.',
        accentColor: '#38BDF8'
      },
      {
        id: 'cs2',
        title: 'Methane (CH₄): Perfect Tetrahedral Symmetry',
        subtitle: 'Formula: CH₄ | IUPAC: Methane | Molar Mass: 16.043 g/mol | Geometry: AX₄',
        layout: 'two-column',
        leftContent: [
          '2D Lewis Structure: Central carbon bonded symmetrically to four hydrogens: H — C(H)(H) — H',
          'Hybridization: Carbon exhibits sp³ hybridization with four equivalent σ-bonds',
          'Bond Angle: 109.5° (109° 28\') tetrahedral angle with zero steric distortion',
          'Bond Length: 1.09 Å (109 pm) with 413 kJ/mol C—H dissociation energy'
        ],
        rightContent: [
          '3D Wedge-and-Dash Notation: Two in-plane bonds (lines), one forward bond (solid wedge), one backward bond (dashed wedge)',
          'Point Group Symmetry: High-order Td symmetry prevents permanent electric polarization',
          'Net Dipole Moment (μ): 0.00 D (non-polar molecule due to vector cancellation)',
          'Physical State: Non-polar gas at standard temperature and pressure'
        ],
        bullets: [],
        notes: 'Demonstrate how the tetrahedral pyramid symmetry cancels out individual C-H bond dipole moments, yielding a zero net dipole.',
        accentColor: '#38BDF8'
      },
      {
        id: 'cs3',
        title: 'Water (H₂O): Bent Geometry & Extreme Polarity',
        subtitle: 'Formula: H₂O | IUPAC: Oxidane | Molar Mass: 18.015 g/mol | Geometry: AX₂E₂',
        layout: 'two-column',
        leftContent: [
          '2D Lewis Dot Formula: H — O — H with 2 bonding pairs (4 e⁻) and 2 unshared lone pairs (4 e⁻)',
          'Steric Number: 4 (tetrahedral electron-domain geometry, bent molecular geometry)',
          'Bond Angle Compression: 104.5° (compressed from 109.5° due to lone pair-lone pair repulsion)',
          'Bond Length: 0.958 Å (95.8 pm) O—H covalent distance'
        ],
        rightContent: [
          'Partial Charges: Oxygen center carries 2δ⁻ charge; hydrogens carry δ⁺ charges',
          'Net Dipole Moment (μ): 1.85 Debye directed along the C2 symmetry axis toward oxygen',
          'Hydrogen Bonding: Forms 4 hydrogen bonds per molecule in ice lattice',
          'Anomalous Properties: High dielectric constant (78.4), surface tension, and heat capacity'
        ],
        bullets: [],
        notes: 'Highlight the lone pair repulsion hierarchy: Lone Pair-Lone Pair > Lone Pair-Bonding Pair > Bonding Pair-Bonding Pair, which compresses the H-O-H angle to 104.5°.',
        accentColor: '#10B981'
      },
      {
        id: 'cs4',
        title: 'Tetrahedral vs Bent: Quantitative Comparison',
        subtitle: 'Direct thermodynamic, structural, and electronic contrast',
        layout: 'stat-highlight',
        statValue: '109.5° vs 104.5°',
        statLabel: 'Bond angle difference caused by non-bonding electron cloud repulsion',
        bullets: [
          'Methane (CH₄): Zero dipole (μ = 0.00 D), boiling point -161.5 °C, weak London dispersion forces',
          'Water (H₂O): Strong dipole (μ = 1.85 D), boiling point +100.0 °C, strong hydrogen bonding network',
          'Both utilize central sp³ hybridized orbitals, demonstrating the power of VSEPR predictions'
        ],
        notes: 'Reinforce how atomic-scale electron geometries directly dictate macroscopic physical constants such as boiling points and solvent behaviors.',
        accentColor: '#F59E0B'
      },
      {
        id: 'cs5',
        title: 'Summary & Pedagogical Applications',
        subtitle: 'Mastery of chemical structure drawing and stereochemistry',
        layout: 'conclusion',
        bullets: [
          'Always draw both 2D Lewis dot structures and 3D stereochemical wedge-and-dash projections',
          'Include quantitative metrics: molecular formula, molar mass, bond angles, and dipole vectors',
          'VSEPR models accurately bridge subatomic quantum mechanics to observable macroscopic chemistry'
        ],
        notes: 'Wrap up by encouraging students to utilize NEXORA Draw & Label and Presentation Studio for comprehensive chemical diagramming.',
        accentColor: '#8B5CF6'
      }
    ]
  },
  {
    id: 'preset-1',
    topic: 'Cellular Biology & Eukaryotic Organelles',
    title: 'Cellular Biology & Organelles',
    description: 'A comprehensive visual presentation covering animal and plant cell structures and bioenergetics.',
    theme: 'emerald-forest',
    createdAt: Date.now() - 3600000,
    slides: [
      {
        id: 's1',
        title: 'Cellular Architecture & Eukaryotic Life',
        subtitle: 'Structural organization, energy transduction, and organelle function',
        layout: 'title',
        bullets: ['Overview of compartmentalized eukaryotic cells', 'Evolutionary origin of mitochondria and chloroplasts', 'Membrane-bound metabolic hubs'],
        notes: 'Introduce the paradigm of cellular compartmentalization and how it enabled complex multicellular life.',
        accentColor: '#059669'
      },
      {
        id: 's2',
        title: 'The Nucleus: Genomic Control Hub',
        subtitle: 'Chromatin organization and transcription regulation',
        layout: 'two-column',
        leftContent: [
          'Double-membrane nuclear envelope with nuclear pores',
          'Nucleolus: Primary site for rRNA synthesis and ribosome subunit assembly',
          'Chromatin architecture regulates spatial gene accessibility'
        ],
        rightContent: [
          'Nuclear lamina provides mechanical structural integrity',
          'Active transport via importins and exportins',
          'Epigenetic modifications dictate cellular differentiation'
        ],
        bullets: [],
        notes: 'Emphasize the role of nuclear pores in regulating RNA export and protein import.',
        accentColor: '#10B981'
      },
      {
        id: 's3',
        title: 'Bioenergetics: Mitochondria & ATP Synthesis',
        subtitle: 'Chemiosmotic coupling across the inner mitochondrial membrane',
        layout: 'stat-highlight',
        statValue: '30-32 ATP',
        statLabel: 'Produced per oxidized glucose molecule via oxidative phosphorylation',
        bullets: [
          'Outer membrane contains voltage-dependent porin channels',
          'Inner mitochondrial membrane forms densely folded cristae',
          'Proton motive force drives ATP synthase rotor complex'
        ],
        notes: 'Walk through the electron transport chain complexes (I-IV) and the F1-Fo ATP synthase rotation.',
        accentColor: '#F59E0B'
      },
      {
        id: 's4',
        title: 'Endomembrane Traffic: ER to Golgi Complex',
        subtitle: 'Protein folding, post-translational glycosylation, and sorting',
        layout: 'bullet-points',
        bullets: [
          'Rough ER: Co-translational translocation and chaperone-assisted folding',
          'Smooth ER: Lipid biosynthesis, calcium ion storage, and detoxification',
          'Golgi Cisternae: Sequential carbohydrate modification (cis -> medial -> trans)',
          'Clathrin and COP vesicle budding directs targeted cargo dispatch'
        ],
        notes: 'Explain how signal recognition particles (SRP) guide nascent polypeptides into the ER lumen.',
        accentColor: '#3B82F6'
      },
      {
        id: 's5',
        title: 'Synthesis & Pedagogical Takeaways',
        subtitle: 'Integrated cellular homeostasis and future research directions',
        layout: 'conclusion',
        bullets: [
          'Cellular function emerges from coordinated inter-organellar contact sites',
          'Organelle dysfunction underlies neurodegenerative and metabolic diseases',
          'Advances in super-resolution cryo-EM continue to unveil dynamic sub-cellular machinery'
        ],
        notes: 'Conclude by linking fundamental cell biology to contemporary therapeutic interventions in oncology and mitochondria-targeted drugs.',
        accentColor: '#8B5CF6'
      }
    ]
  }
];

export function PresentationStudio() {
  const { language, sendToResearch, saveSlideDeck } = useAppStore();
  
  const [topicInput, setTopicInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('Academic & Research');
  const [slideCount, setSlideCount] = useState<number>(6);
  const [theme, setTheme] = useState<SlideDeck['theme']>('royal-purple');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  // Document upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState<string>('');
  const [rawFileDataUri, setRawFileDataUri] = useState<string | null>(null);
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [extractedDocInfo, setExtractedDocInfo] = useState<ExtractedDocument | null>(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  
  // Active Deck State
  const [currentDeck, setCurrentDeck] = useState<SlideDeck>(PRESET_DECKS[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [showOfficeGuideModal, setShowOfficeGuideModal] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // PowerPoint Studio Editor & Custom Styling State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editorTab, setEditorTab] = useState<'content' | 'typography' | 'colors' | 'background'>('content');
  const [applyScope, setApplyScope] = useState<'slide' | 'deck'>('slide');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 4000);
  };

  // Resolve effective styling for a slide with deck fallbacks
  const getEffectiveSlideStyles = (slide?: SlideItem, deck?: SlideDeck) => {
    const d = deck || currentDeck;
    const s = slide || (d.slides[activeSlideIndex] || d.slides[0]);

    const themeColors: Record<SlideDeck['theme'], { bg: string; title: string; text: string; accent: string; bgClass: string }> = {
      'royal-purple': { bg: '1E1B4B', title: '#FDE047', text: '#E0E7FF', accent: '#C084FC', bgClass: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white' },
      'academic-navy': { bg: '0F172A', title: '#38BDF8', text: '#E2E8F0', accent: '#818CF8', bgClass: 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white' },
      'emerald-forest': { bg: '064E3B', title: '#A7F3D0', text: '#ECFDF5', accent: '#34D399', bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white' },
      'sunset-amber': { bg: '451A03', title: '#FDE68A', text: '#FFFBEB', accent: '#F59E0B', bgClass: 'bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 text-white' },
      'slate-minimal': { bg: 'F8FAFC', title: '#0F172A', text: '#334155', accent: '#6366F1', bgClass: 'bg-slate-50 text-slate-900 border border-slate-200' },
      'cyber-dark': { bg: '090D16', title: '#38BDF8', text: '#E2E8F0', accent: '#A855F7', bgClass: 'bg-gradient-to-br from-[#090D16] via-[#150D2A] to-[#0A0F1D] text-white' },
      'burgundy-crimson': { bg: '350A10', title: '#FECDD3', text: '#FFF1F2', accent: '#FB7185', bgClass: 'bg-gradient-to-br from-[#350A10] via-[#4C0519] to-[#1E0508] text-white' },
      'ocean-cyan': { bg: '032B44', title: '#67E8F9', text: '#E0F2FE', accent: '#38BDF8', bgClass: 'bg-gradient-to-br from-[#032B44] via-[#075985] to-[#021A29] text-white' },
      'warm-ivory': { bg: 'FFFDF5', title: '#292524', text: '#44403C', accent: '#D97706', bgClass: 'bg-[#FFFDF5] text-stone-900 border border-amber-200/60' },
      'clean-white': { bg: 'FFFFFF', title: '#0F172A', text: '#334155', accent: '#2563EB', bgClass: 'bg-white text-slate-900 border border-slate-200' },
    };

    const defaultTheme = themeColors[d?.theme] || themeColors['royal-purple'];

    const customBg = s?.customBg || d?.customBg;
    const customBgGradient = s?.customBgGradient || d?.customBgGradient;
    const customFont = s?.customFontFamily || d?.fontFamily || 'Calibri';
    const titleSize = Number(s?.customTitleFontSize || d?.titleFontSize || 28);
    const bodySize = Number(s?.customBodyFontSize || d?.bodyFontSize || 15);
    const titleColor = s?.customTitleColor || d?.titleColor || defaultTheme.title;
    const textColor = s?.customTextColor || d?.textColor || defaultTheme.text;
    const accentColor = s?.customAccentColor || d?.accentColor || defaultTheme.accent;

    let backgroundStyle: React.CSSProperties = {};
    if (customBgGradient) {
      backgroundStyle.background = customBgGradient;
    } else if (customBg) {
      backgroundStyle.backgroundColor = customBg.startsWith('#') ? customBg : `#${customBg}`;
    }

    const fontMap: Record<string, string> = {
      'Calibri': 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif',
      'Arial': 'Arial, Helvetica, "Nimbus Sans L", sans-serif',
      'Georgia': 'Georgia, Cambria, "Times New Roman", Times, serif',
      'Garamond': 'Garamond, "EB Garamond", "Baskerville", serif',
      'Trebuchet MS': '"Trebuchet MS", "Lucida Grande", "Lucida Sans", sans-serif',
      'Verdana': 'Verdana, Geneva, sans-serif',
      'Courier New': '"Courier New", Courier, monospace',
      'Montserrat': 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
      'Playfair Display': '"Playfair Display", Didot, Georgia, serif',
      'Impact': 'Impact, Haettenschweiler, "Franklin Gothic Bold", sans-serif',
    };

    const fontFamilyCss = fontMap[customFont] || fontMap['Calibri'];

    return {
      defaultTheme,
      customBg,
      customBgGradient,
      customFont,
      fontFamilyCss,
      titleSize,
      bodySize,
      titleColor,
      textColor,
      accentColor,
      backgroundStyle,
      isCustomBg: Boolean(customBg || customBgGradient),
      bgClass: (customBg || customBgGradient) ? '' : defaultTheme.bgClass
    };
  };

  // Update active slide data
  const updateActiveSlide = (fields: Partial<SlideItem>) => {
    setCurrentDeck(prev => {
      const updatedSlides = [...prev.slides];
      if (updatedSlides[activeSlideIndex]) {
        updatedSlides[activeSlideIndex] = {
          ...updatedSlides[activeSlideIndex],
          ...fields
        };
      }
      return { ...prev, slides: updatedSlides };
    });
  };

  // Update styling (respects applyScope: current slide vs whole deck)
  const updateStyling = (fields: {
    fontFamily?: string;
    titleFontSize?: number;
    bodyFontSize?: number;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    customBg?: string;
    customBgGradient?: string;
    theme?: SlideDeck['theme'];
  }) => {
    setCurrentDeck(prev => {
      if (applyScope === 'deck') {
        return {
          ...prev,
          theme: fields.theme !== undefined ? fields.theme : prev.theme,
          fontFamily: fields.fontFamily !== undefined ? fields.fontFamily : prev.fontFamily,
          titleFontSize: fields.titleFontSize !== undefined ? fields.titleFontSize : prev.titleFontSize,
          bodyFontSize: fields.bodyFontSize !== undefined ? fields.bodyFontSize : prev.bodyFontSize,
          titleColor: fields.titleColor !== undefined ? fields.titleColor : prev.titleColor,
          textColor: fields.textColor !== undefined ? fields.textColor : prev.textColor,
          accentColor: fields.accentColor !== undefined ? fields.accentColor : prev.accentColor,
          customBg: fields.customBg !== undefined ? fields.customBg : prev.customBg,
          customBgGradient: fields.customBgGradient !== undefined ? fields.customBgGradient : prev.customBgGradient,
        };
      } else {
        const updatedSlides = [...prev.slides];
        if (updatedSlides[activeSlideIndex]) {
          updatedSlides[activeSlideIndex] = {
            ...updatedSlides[activeSlideIndex],
            customFontFamily: fields.fontFamily !== undefined ? fields.fontFamily : updatedSlides[activeSlideIndex].customFontFamily,
            customTitleFontSize: fields.titleFontSize !== undefined ? fields.titleFontSize : updatedSlides[activeSlideIndex].customTitleFontSize,
            customBodyFontSize: fields.bodyFontSize !== undefined ? fields.bodyFontSize : updatedSlides[activeSlideIndex].customBodyFontSize,
            customTitleColor: fields.titleColor !== undefined ? fields.titleColor : updatedSlides[activeSlideIndex].customTitleColor,
            customTextColor: fields.textColor !== undefined ? fields.textColor : updatedSlides[activeSlideIndex].customTextColor,
            customAccentColor: fields.accentColor !== undefined ? fields.accentColor : updatedSlides[activeSlideIndex].customAccentColor,
            customBg: fields.customBg !== undefined ? fields.customBg : updatedSlides[activeSlideIndex].customBg,
            customBgGradient: fields.customBgGradient !== undefined ? fields.customBgGradient : updatedSlides[activeSlideIndex].customBgGradient,
          };
        }
        return { ...prev, slides: updatedSlides };
      }
    });
  };

  // Reset custom styling back to theme defaults
  const resetCustomStyling = () => {
    setCurrentDeck(prev => {
      if (applyScope === 'deck') {
        return {
          ...prev,
          fontFamily: undefined,
          titleFontSize: undefined,
          bodyFontSize: undefined,
          titleColor: undefined,
          textColor: undefined,
          accentColor: undefined,
          customBg: undefined,
          customBgGradient: undefined,
          slides: prev.slides.map(s => ({
            ...s,
            customFontFamily: undefined,
            customTitleFontSize: undefined,
            customBodyFontSize: undefined,
            customTitleColor: undefined,
            customTextColor: undefined,
            customAccentColor: undefined,
            customBg: undefined,
            customBgGradient: undefined,
          }))
        };
      } else {
        const updatedSlides = [...prev.slides];
        if (updatedSlides[activeSlideIndex]) {
          updatedSlides[activeSlideIndex] = {
            ...updatedSlides[activeSlideIndex],
            customFontFamily: undefined,
            customTitleFontSize: undefined,
            customBodyFontSize: undefined,
            customTitleColor: undefined,
            customTextColor: undefined,
            customAccentColor: undefined,
            customBg: undefined,
            customBgGradient: undefined,
          };
        }
        return { ...prev, slides: updatedSlides };
      }
    });
    showToast(applyScope === 'deck' ? 'Reset presentation styling to theme defaults' : `Reset Slide ${activeSlideIndex + 1} styling to theme defaults`);
  };

  // Slide management: Add new slide
  const handleAddNewSlide = () => {
    const newSlide: SlideItem = {
      id: `s_${Date.now()}`,
      title: 'New Presentation Slide',
      subtitle: 'Key concepts, methodology, and empirical evidence',
      layout: 'bullet-points',
      bullets: [
        'Primary analytical finding or pedagogical principle',
        'Experimental mechanism and supporting validation data',
        'Synthesis and direct translational application'
      ],
      notes: 'Speaker notes: Elaborate on the primary concept and engage audience questions.',
      accentColor: '#8B5CF6'
    };
    setCurrentDeck(prev => {
      const updatedSlides = [...prev.slides];
      updatedSlides.splice(activeSlideIndex + 1, 0, newSlide);
      return { ...prev, slides: updatedSlides };
    });
    setActiveSlideIndex(prev => prev + 1);
    showToast('✨ Added new slide!');
  };

  // Slide management: Duplicate slide
  const handleDuplicateSlide = () => {
    setCurrentDeck(prev => {
      const sourceSlide = prev.slides[activeSlideIndex];
      if (!sourceSlide) return prev;
      const duplicatedSlide: SlideItem = {
        ...JSON.parse(JSON.stringify(sourceSlide)),
        id: `s_${Date.now()}`,
        title: `${sourceSlide.title} (Copy)`
      };
      const updatedSlides = [...prev.slides];
      updatedSlides.splice(activeSlideIndex + 1, 0, duplicatedSlide);
      return { ...prev, slides: updatedSlides };
    });
    setActiveSlideIndex(prev => prev + 1);
    showToast('📋 Duplicated slide!');
  };

  // Slide management: Delete slide
  const handleDeleteSlide = () => {
    if (currentDeck.slides.length <= 1) {
      showToast('⚠️ A slide deck must contain at least one slide.');
      return;
    }
    setCurrentDeck(prev => {
      const updatedSlides = prev.slides.filter((_, idx) => idx !== activeSlideIndex);
      return { ...prev, slides: updatedSlides };
    });
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
    showToast('🗑️ Deleted slide');
  };

  // Slide management: Reorder slide
  const handleMoveSlide = (direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? activeSlideIndex - 1 : activeSlideIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentDeck.slides.length) return;

    setCurrentDeck(prev => {
      const updatedSlides = [...prev.slides];
      const [moved] = updatedSlides.splice(activeSlideIndex, 1);
      updatedSlides.splice(targetIndex, 0, moved);
      return { ...prev, slides: updatedSlides };
    });
    setActiveSlideIndex(targetIndex);
  };

  // Explicit Save to Projects
  const handleSaveToProjects = () => {
    saveSlideDeck(currentDeck);
    showToast('💾 Saved presentation to Projects!');
  };

  // Keyboard Navigation for In-Browser Presentation Mode
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setActiveSlideIndex(prev => (prev < currentDeck.slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        setActiveSlideIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPresentationMode(false);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowPresenterNotes(prev => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, currentDeck.slides.length]);

  // Auto-play timer for presentation mode
  useEffect(() => {
    if (!isPresentationMode || !isPlayingAuto) return;
    const interval = setInterval(() => {
      setActiveSlideIndex(prev => {
        if (prev < currentDeck.slides.length - 1) return prev + 1;
        return 0; // loop back to first slide
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPresentationMode, isPlayingAuto, currentDeck.slides.length]);

  /**
   * Safe JSON parser for AI generated slide decks
   */
  const safeParsePresentationJson = (rawText: string): any => {
    if (!rawText) return null;
    try {
      // Direct parse
      return JSON.parse(rawText);
    } catch {
      // Try stripping markdown blocks
      try {
        const cleaned = rawText
          .replace(/```(?:json)?/gi, '')
          .replace(/```/g, '')
          .trim();
        return JSON.parse(cleaned);
      } catch {
        // Try extracting innermost JSON object {...}
        try {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            return JSON.parse(match[0]);
          }
        } catch (innerErr) {
          console.warn('JSON regex parsing failed:', innerErr);
        }
      }
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsExtractingDoc(true);
    setExtractedDocInfo(null);
    showToast(`Reading and extracting content from "${file.name}"...`);
    
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Read Data URI for backend if needed
        const reader = new FileReader();
        reader.onload = (event) => {
          setRawFileDataUri(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Extract clean text and pages
        const extracted = await extractTextFromPdf(file);
        setExtractedDocInfo(extracted);
        setUploadedFileText(extracted.text);

        if (!topicInput.trim()) {
          const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTopicInput(`Presentation on: ${suggestedTitle}`);
        }

        showToast(`Successfully parsed PDF! Extracted ${extracted.pageCount} page(s) and ${extracted.totalCharacters.toLocaleString()} characters.`);
      } else {
        // Text, Markdown, CSV, DOCX
        const text = await file.text();
        const docInfo: ExtractedDocument = {
          name: file.name,
          totalCharacters: text.length,
          pageCount: 1,
          text: text,
          pages: [{ pageNumber: 1, text }],
          headings: [],
          summaryPreview: text.slice(0, 300) + (text.length > 300 ? '...' : '')
        };
        setExtractedDocInfo(docInfo);
        setUploadedFileText(text);

        if (!topicInput.trim()) {
          const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTopicInput(`Presentation on: ${suggestedTitle}`);
        }

        showToast(`Extracted ${text.length.toLocaleString()} characters from "${file.name}". Ready to convert!`);
      }
    } catch (err: any) {
      console.error('File extraction error:', err);
      // Fallback text read
      try {
        const text = await file.text();
        setUploadedFileText(text);
        showToast(`Loaded "${file.name}". Ready to generate slides.`);
      } catch {
        showToast(`Loaded "${file.name}". Ready to generate slides.`);
      }
    } finally {
      setIsExtractingDoc(false);
      // Reset input value so user can re-upload same file if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const generateSlides = async () => {
    if (!topicInput.trim() && !uploadedFileText && !uploadedFileName) {
      showToast('Please enter a presentation topic or upload a PDF / document.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing document structure & key takeaways...');
    setStatusToast('Synthesizing structured PowerPoint slide deck...');

    const promptText = `
You are an expert Presentation Architect and PowerPoint Specialist.
Generate a structured, professional slide deck based on the following input:

Topic/Context: ${topicInput || 'Convert the attached document into a comprehensive slide presentation'}
Target Audience: ${targetAudience}
Requested Number of Slides: ${slideCount}
Language / Dialect: ${language || 'English (US)'}

${uploadedFileText ? `DOCUMENT CONTEXT / EXTRACTED CONTENT:\n${uploadedFileText.slice(0, 15000)}` : ''}

CRITICAL REQUIREMENT: You MUST respond ONLY with a valid, clean JSON object (no markdown fences, no extra text before or after). The JSON must adhere strictly to this schema:

{
  "title": "Title of the Presentation",
  "description": "Short 1-2 sentence executive summary of the presentation",
  "theme": "${theme}",
  "slides": [
    {
      "id": "s1",
      "title": "Slide Title",
      "subtitle": "Optional Subtitle or focus area",
      "layout": "title" | "bullet-points" | "two-column" | "stat-highlight" | "conclusion",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "statValue": "e.g. 87% or 3.5x (only if layout is stat-highlight)",
      "statLabel": "e.g. Growth in efficiency or key outcome",
      "leftContent": ["Left column point 1", "Left column point 2 (only if two-column)"],
      "rightContent": ["Right column point 1", "Right column point 2 (only if two-column)"],
      "notes": "Detailed presenter speaking notes explaining this slide in academic/professional depth",
      "accentColor": "#6366F1"
    }
  ]
}
`;

    try {
      let parsedData: any = null;

      // Tier 1: Try dedicated backend PowerPoint generation API
      setGenerationStep('Formatting executive slides & data visualizers...');
      try {
        const res = await fetch('/api/presentation-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topicInput || uploadedFileName || 'Presentation',
            docText: uploadedFileText,
            targetAudience,
            slideCount,
            theme,
            language: language || 'English (US)',
            fileData: rawFileDataUri
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.json) {
            parsedData = safeParsePresentationJson(data.json);
          }
        }
      } catch (backendErr) {
        console.warn('Backend presentation generator returned error, trying client AI tier:', backendErr);
      }

      // Tier 2: Try client Puter AI if Tier 1 did not produce valid JSON
      if (!parsedData || !Array.isArray(parsedData.slides) || parsedData.slides.length === 0) {
        setGenerationStep('Synthesizing presentation with client AI...');
        try {
          const rawAiText = await puterChat(promptText, 'gpt-4o-mini');
          parsedData = safeParsePresentationJson(rawAiText);
        } catch (puterErr) {
          console.warn('Client Puter AI slide synthesis error, using local document synthesizer:', puterErr);
        }
      }

      // Tier 3: Deterministic Local Document Synthesizer (100% Guaranteed Success)
      if (!parsedData || !Array.isArray(parsedData.slides) || parsedData.slides.length === 0) {
        setGenerationStep('Applying structural document synthesis engine...');
        parsedData = synthesizeSlidesFromDocument(
          uploadedFileText || topicInput,
          uploadedFileName || 'Document',
          topicInput,
          theme,
          slideCount
        );
      }

      // Final Assembly of the Deck
      const newDeck: SlideDeck = {
        id: Date.now().toString(),
        topic: topicInput || uploadedFileName || 'Presentation',
        title: parsedData.title || topicInput || (uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : 'PowerPoint Presentation'),
        description: parsedData.description || 'Generated with NEXORA PowerPoint Studio',
        theme: theme,
        slides: Array.isArray(parsedData.slides) && parsedData.slides.length > 0 
          ? parsedData.slides.map((s: any, idx: number) => ({
              id: s.id || `s${idx + 1}`,
              title: s.title || `Slide ${idx + 1}`,
              subtitle: s.subtitle || undefined,
              layout: s.layout || (idx === 0 ? 'title' : idx === parsedData.slides.length - 1 ? 'conclusion' : 'bullet-points'),
              bullets: Array.isArray(s.bullets) ? s.bullets : [],
              statValue: s.statValue,
              statLabel: s.statLabel,
              leftContent: s.leftContent,
              rightContent: s.rightContent,
              notes: s.notes || 'Presenter speaking notes for this slide.',
              accentColor: s.accentColor || '#6366F1'
            }))
          : PRESET_DECKS[0].slides,
        createdAt: Date.now()
      };

      setCurrentDeck(newDeck);
      setActiveSlideIndex(0);
      saveSlideDeck(newDeck);
      showToast(`🎉 Successfully created ${newDeck.slides.length}-slide PowerPoint presentation!`);
    } catch (err: any) {
      console.error('Slide generation error:', err);
      // Failsafe local synthesis
      const fallbackDeck = synthesizeSlidesFromDocument(
        uploadedFileText || topicInput,
        uploadedFileName || 'Document',
        topicInput,
        theme,
        slideCount
      );
      const newDeck: SlideDeck = {
        id: Date.now().toString(),
        topic: topicInput || uploadedFileName || 'Presentation',
        title: fallbackDeck.title,
        description: fallbackDeck.description,
        theme: theme,
        slides: fallbackDeck.slides,
        createdAt: Date.now()
      };
      setCurrentDeck(newDeck);
      setActiveSlideIndex(0);
      saveSlideDeck(newDeck);
      showToast(`Created ${newDeck.slides.length} slides from document!`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  /**
   * Cleans color hex values ensuring no '#' and valid 6-char hex
   */
  const cleanColor = (hex: string | undefined, fallback = 'FFFFFF'): string => {
    if (!hex) return fallback;
    const cleaned = hex.replace(/^#/, '').trim();
    return cleaned.length === 6 ? cleaned : fallback;
  };

  /**
   * Export fully compliant OpenXML Microsoft PowerPoint (.pptx) file
   */
  const handleExportPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      showToast('Compiling 100% compliant Microsoft PowerPoint (.pptx)...');

      const sanitizedFilename = (currentDeck.title || 'Presentation')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
        .slice(0, 40) || 'presentation';

      let blob: Blob | null = null;

      // Tier 1: Try server-side compiler endpoint (guarantees proper HTTP headers & no blob revocation timeouts)
      try {
        const res = await fetch('/api/export-pptx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deck: currentDeck })
        });
        if (res.ok) {
          blob = await res.blob();
        }
      } catch (e) {
        console.warn('Server PPTX compilation error, using sanitized client compiler:', e);
      }

      // Tier 2: Sanitized Client-side compiler with JSZip post-processor
      if (!blob) {
        const pres = new pptxgen();
        pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches standard widescreen
        pres.author = 'NEXORA Academic AI Studio';
        pres.company = 'NEXORA Scientific';
        pres.title = currentDeck.title || 'PowerPoint Presentation';
        pres.subject = currentDeck.description || 'Generated Slide Deck';

        const themeColors: Record<SlideDeck['theme'], { bg: string; title: string; text: string; accent: string }> = {
          'royal-purple': { bg: '1E1B4B', title: 'FDE047', text: 'E0E7FF', accent: 'C084FC' },
          'academic-navy': { bg: '0F172A', title: '38BDF8', text: 'E2E8F0', accent: '818CF8' },
          'emerald-forest': { bg: '064E3B', title: 'A7F3D0', text: 'ECFDF5', accent: '34D399' },
          'sunset-amber': { bg: '451A03', title: 'FDE68A', text: 'FFFBEB', accent: 'F59E0B' },
          'slate-minimal': { bg: 'F8FAFC', title: '0F172A', text: '334155', accent: '6366F1' },
          'cyber-dark': { bg: '090D16', title: '38BDF8', text: 'E2E8F0', accent: 'A855F7' },
          'burgundy-crimson': { bg: '350A10', title: 'FECDD3', text: 'FFF1F2', accent: 'FB7185' },
          'ocean-cyan': { bg: '032B44', title: '67E8F9', text: 'E0F2FE', accent: '38BDF8' },
          'warm-ivory': { bg: 'FFFDF5', title: '292524', text: '44403C', accent: 'D97706' },
          'clean-white': { bg: 'FFFFFF', title: '0F172A', text: '334155', accent: '2563EB' }
        };

        const c = themeColors[currentDeck.theme] || themeColors['royal-purple'];

        currentDeck.slides.forEach((slideData, idx) => {
          const slide = pres.addSlide();
          const eff = getEffectiveSlideStyles(slideData, currentDeck);

          const effBg = slideData.customBg || currentDeck.customBg || c.bg;
          const effFont = eff.customFont || 'Calibri';
          const effTitleSize = eff.titleSize;
          const effBodySize = eff.bodySize;
          const effTitleColor = eff.titleColor;
          const effTextColor = eff.textColor;
          const effAccentColor = eff.accentColor;

          slide.background = { color: cleanColor(effBg) };

          // Slide Header Title
          slide.addText(slideData.title || `Slide ${idx + 1}`, {
            x: 0.8,
            y: 0.5,
            w: 11.7,
            h: 0.85,
            fontSize: effTitleSize,
            bold: true,
            color: cleanColor(effTitleColor),
            fontFace: effFont,
            valign: 'top'
          });

          // Subtitle
          if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
              x: 0.8,
              y: 1.35,
              w: 11.7,
              h: 0.45,
              fontSize: Math.max(11, effBodySize - 1),
              italic: true,
              color: cleanColor(effAccentColor),
              fontFace: effFont,
              valign: 'top'
            });
          }

          // Layouts - Avoid breakLine: true inside bullet array items to prevent OOXML XML validation failures
          if (slideData.layout === 'two-column') {
            const leftItems = (slideData.leftContent || []).filter(Boolean).map(text => ({
              text: String(text).replace(/^[•\-\*]\s*/, ''),
              options: {
                bullet: true,
                fontSize: effBodySize,
                color: cleanColor(effTextColor),
                paraSpaceAfter: 8,
                fontFace: effFont
              }
            }));
            const rightItems = (slideData.rightContent || []).filter(Boolean).map(text => ({
              text: String(text).replace(/^[•\-\*]\s*/, ''),
              options: {
                bullet: true,
                fontSize: effBodySize,
                color: cleanColor(effTextColor),
                paraSpaceAfter: 8,
                fontFace: effFont
              }
            }));

            if (leftItems.length > 0) {
              slide.addText(leftItems, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, valign: 'top' });
            }
            if (rightItems.length > 0) {
              slide.addText(rightItems, { x: 6.8, y: 2.0, w: 5.6, h: 4.5, valign: 'top' });
            }
          } else if (slideData.layout === 'stat-highlight') {
            if (slideData.statValue) {
              slide.addText(String(slideData.statValue), {
                x: 0.8,
                y: 2.2,
                w: 4.8,
                h: 1.4,
                fontSize: Math.max(36, effTitleSize + 16),
                bold: true,
                color: cleanColor(effTitleColor),
                fontFace: effFont,
                align: 'center',
                valign: 'middle'
              });
              if (slideData.statLabel) {
                slide.addText(String(slideData.statLabel), {
                  x: 0.8,
                  y: 3.7,
                  w: 4.8,
                  h: 1.0,
                  fontSize: Math.max(11, effBodySize - 2),
                  italic: true,
                  color: cleanColor(effAccentColor),
                  fontFace: effFont,
                  align: 'center',
                  valign: 'top'
                });
              }
            }
            const bullets = (slideData.bullets || []).filter(Boolean).map(text => ({
              text: String(text).replace(/^[•\-\*]\s*/, ''),
              options: {
                bullet: true,
                fontSize: effBodySize,
                color: cleanColor(effTextColor),
                paraSpaceAfter: 8,
                fontFace: effFont
              }
            }));
            if (bullets.length > 0) {
              slide.addText(bullets, { x: 6.0, y: 2.0, w: 6.5, h: 4.5, valign: 'top' });
            }
          } else {
            const bullets = (slideData.bullets || []).filter(Boolean).map(text => ({
              text: String(text).replace(/^[•\-\*]\s*/, ''),
              options: {
                bullet: true,
                fontSize: effBodySize,
                color: cleanColor(effTextColor),
                paraSpaceAfter: 10,
                fontFace: effFont
              }
            }));
            if (bullets.length > 0) {
              slide.addText(bullets, { x: 0.8, y: 2.0, w: 11.7, h: 4.5, valign: 'top' });
            }
          }

          // Footer
          slide.addText(`${currentDeck.title} | NEXORA Studio`, {
            x: 0.8,
            y: 6.8,
            w: 11.7,
            h: 0.4,
            fontSize: 10,
            color: cleanColor(c.accent),
            fontFace: 'Calibri'
          });
        });

        const rawBuffer = await pres.write({ outputType: 'uint8array' }) as Uint8Array;
        // Fix empty name attributes for Microsoft Office compatibility
        const zip = await JSZip.loadAsync(rawBuffer);
        for (const [filename, file] of Object.entries(zip.files)) {
          if (filename.endsWith('.xml') && !file.dir) {
            const xml = await file.async('string');
            if (xml.includes('name=""')) {
              zip.file(filename, xml.replace(/name=""/g, 'name="Object"'));
            }
          }
        }
        blob = await zip.generateAsync({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        });
      }

      // Safe download with 60-second retention
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${sanitizedFilename}.pptx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 60000);

      showToast('✅ Clean PowerPoint (.pptx) downloaded! 100% compatible with Office & Web.');
    } catch (err: any) {
      console.error('PPTX export error:', err);
      showToast('Error exporting PPTX: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingPPTX(false);
    }
  };

  /**
   * Generates a self-contained, standalone interactive presentation HTML file
   */
  const generateStandaloneHtmlPresentation = (deck: SlideDeck): string => {
    const slidesJson = JSON.stringify(deck.slides);
    const deckTitle = (deck.title || 'PowerPoint Presentation').replace(/"/g, '&quot;');
    const theme = deck.theme || 'royal-purple';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deckTitle} - In-Browser Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #09090b;
      color: #f4f4f5;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .toolbar {
      height: 54px;
      background: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      z-index: 20;
    }
    .title { font-weight: 700; font-size: 0.95rem; color: #fbbf24; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px; }
    .controls { display: flex; align-items: center; gap: 8px; }
    button {
      background: #27272a;
      color: #f4f4f5;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    button:hover { background: #3f3f46; border-color: #52525b; }
    button.primary { background: #581c87; border-color: #7e22ce; color: #fff; }
    button.primary:hover { background: #6b21a8; }
    .stage-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
    }
    .slide-aspect {
      width: 100%;
      max-width: 1200px;
      aspect-ratio: 16 / 9;
      max-height: calc(100vh - 140px);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      padding: 3rem 4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }
    /* Themes */
    .theme-royal-purple { background: linear-gradient(135deg, #1e1b4b, #2e1065, #0f172a); color: #f8fafc; }
    .theme-royal-purple .accent-title { color: #fde047; }
    .theme-royal-purple .accent-text { color: #c084fc; }
    .theme-academic-navy { background: linear-gradient(135deg, #0f172a, #1e293b, #020617); color: #f8fafc; }
    .theme-academic-navy .accent-title { color: #38bdf8; }
    .theme-academic-navy .accent-text { color: #818cf8; }
    .theme-emerald-forest { background: linear-gradient(135deg, #064e3b, #065f46, #022c22); color: #ecfdf5; }
    .theme-emerald-forest .accent-title { color: #a7f3d0; }
    .theme-emerald-forest .accent-text { color: #34d399; }
    .theme-sunset-amber { background: linear-gradient(135deg, #451a03, #78350f, #1c1917); color: #fffbeb; }
    .theme-sunset-amber .accent-title { color: #fde68a; }
    .theme-sunset-amber .accent-text { color: #f59e0b; }
    .theme-slate-minimal { background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; }
    .theme-slate-minimal .accent-title { color: #0f172a; }
    .theme-slate-minimal .accent-text { color: #6366f1; }
    .theme-cyber-dark { background: linear-gradient(135deg, #090d16, #150d2a, #0a0f1d); color: #e2e8f0; }
    .theme-cyber-dark .accent-title { color: #38bdf8; }
    .theme-cyber-dark .accent-text { color: #a855f7; }
    .theme-burgundy-crimson { background: linear-gradient(135deg, #350a10, #4c0519, #1e0508); color: #fff1f2; }
    .theme-burgundy-crimson .accent-title { color: #fecdd3; }
    .theme-burgundy-crimson .accent-text { color: #fb7185; }
    .theme-ocean-cyan { background: linear-gradient(135deg, #032b44, #075985, #021a29); color: #e0f2fe; }
    .theme-ocean-cyan .accent-title { color: #67e8f9; }
    .theme-ocean-cyan .accent-text { color: #38bdf8; }
    .theme-warm-ivory { background: #fffdf5; color: #44403c; border: 1px solid #fde68a; }
    .theme-warm-ivory .accent-title { color: #292524; }
    .theme-warm-ivory .accent-text { color: #d97706; }
    .theme-clean-white { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; }
    .theme-clean-white .accent-title { color: #0f172a; }
    .theme-clean-white .accent-text { color: #2563eb; }
    
    .slide-header h1 { font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; }
    .slide-header p { font-size: 1.05rem; opacity: 0.85; font-style: italic; }
    .slide-body { margin: auto 0; font-size: 1.15rem; line-height: 1.6; }
    .bullets { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
    .bullets li { display: flex; align-items: flex-start; gap: 0.75rem; }
    .bullet-dot { color: #fbbf24; font-weight: bold; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .col-box { background: rgba(255,255,255,0.06); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .stat-layout { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; align-items: center; }
    .stat-num { font-size: 3.8rem; font-weight: 900; font-family: monospace; color: #fde047; }
    .slide-footer { font-size: 0.8rem; opacity: 0.6; display: flex; justify-content: space-between; }
    
    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(24, 24, 27, 0.7);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.4rem;
      user-select: none;
      transition: all 0.2s;
    }
    .nav-arrow:hover { background: #581c87; }
    .nav-arrow.left { left: 2rem; }
    .nav-arrow.right { right: 2rem; }
    
    .bottom-bar {
      height: 56px;
      background: #18181b;
      border-top: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }
    .notes-drawer {
      position: absolute;
      bottom: 65px;
      left: 1.5rem;
      right: 1.5rem;
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      max-height: 140px;
      overflow-y: auto;
      font-size: 0.9rem;
      line-height: 1.5;
      display: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .notes-drawer.open { display: block; }
  </style>
</head>
<body class="theme-${theme}">
  <div class="toolbar">
    <div class="title">${deckTitle}</div>
    <div class="controls">
      <span id="slideIndicator" style="font-size: 0.85rem; font-weight: 600; color: #a1a1aa; margin-right: 8px;">Slide 1 of 1</span>
      <button onclick="toggleNotes()">📝 Speaker Notes [N]</button>
      <button onclick="toggleAutoPlay()" id="playBtn">▶ Auto-Play</button>
      <button onclick="toggleFullScreen()">⛶ Fullscreen [F]</button>
      <button onclick="window.print()">🖨 Print</button>
    </div>
  </div>

  <div class="stage-container">
    <button class="nav-arrow left" onclick="prevSlide()">❮</button>
    <div class="slide-aspect" id="slideStage"></div>
    <button class="nav-arrow right" onclick="nextSlide()">❯</button>
    <div class="notes-drawer" id="notesDrawer"></div>
  </div>

  <div class="bottom-bar">
    <div style="font-size: 0.78rem; color: #71717a;">Use ◄ ► Arrow keys or Spacebar to navigate • [F] Fullscreen • [N] Notes</div>
    <div class="controls">
      <button onclick="prevSlide()">◄ Prev</button>
      <button class="primary" onclick="nextSlide()">Next ►</button>
    </div>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIdx = 0;
    let autoPlayTimer = null;

    function renderSlide() {
      const s = slides[currentIdx] || slides[0];
      const stage = document.getElementById('slideStage');
      const indicator = document.getElementById('slideIndicator');
      const notes = document.getElementById('notesDrawer');

      indicator.innerText = 'Slide ' + (currentIdx + 1) + ' of ' + slides.length;
      notes.innerHTML = '<strong>Presenter Notes:</strong> ' + (s.notes || 'No notes for this slide.');

      // Apply dynamic background overrides
      if (s.customBgGradient) {
        stage.style.background = s.customBgGradient;
      } else if (s.customBg) {
        stage.style.background = s.customBg.startsWith('#') ? s.customBg : '#' + s.customBg;
      } else {
        stage.style.background = '';
      }

      // Apply dynamic font override
      if (s.customFontFamily) {
        stage.style.fontFamily = s.customFontFamily;
      } else {
        stage.style.fontFamily = '';
      }

      const titleStyle = [
        s.customTitleColor ? 'color:' + s.customTitleColor : '',
        s.customTitleFontSize ? 'font-size:' + s.customTitleFontSize + 'px' : ''
      ].filter(Boolean).join(';');

      const subtitleStyle = [
        s.customAccentColor ? 'color:' + s.customAccentColor : '',
        s.customBodyFontSize ? 'font-size:' + (s.customBodyFontSize - 1) + 'px' : ''
      ].filter(Boolean).join(';');

      const bodyStyle = [
        s.customTextColor ? 'color:' + s.customTextColor : '',
        s.customBodyFontSize ? 'font-size:' + s.customBodyFontSize + 'px' : ''
      ].filter(Boolean).join(';');

      let bodyHtml = '';
      if (s.layout === 'two-column') {
        const left = (s.leftContent || []).map(b => '<li><span class="bullet-dot" style="' + (s.customAccentColor ? 'color:' + s.customAccentColor : '') + '">•</span> <span style="' + bodyStyle + '">' + b + '</span></li>').join('');
        const right = (s.rightContent || []).map(b => '<li><span class="bullet-dot" style="' + (s.customAccentColor ? 'color:' + s.customAccentColor : '') + '">•</span> <span style="' + bodyStyle + '">' + b + '</span></li>').join('');
        bodyHtml = '<div class="two-col"><div class="col-box"><ul class="bullets">' + left + '</ul></div><div class="col-box"><ul class="bullets">' + right + '</ul></div></div>';
      } else if (s.layout === 'stat-highlight') {
        const bullets = (s.bullets || []).map(b => '<li><span class="bullet-dot" style="' + (s.customAccentColor ? 'color:' + s.customAccentColor : '') + '">✦</span> <span style="' + bodyStyle + '">' + b + '</span></li>').join('');
        bodyHtml = '<div class="stat-layout"><div style="text-align:center;"><div class="stat-num" style="' + titleStyle + '">' + (s.statValue || '') + '</div><div style="font-size:0.9rem;opacity:0.8;' + subtitleStyle + '">' + (s.statLabel || '') + '</div></div><div><ul class="bullets">' + bullets + '</ul></div></div>';
      } else {
        const bullets = (s.bullets || []).map(b => '<li><span class="bullet-dot" style="' + (s.customAccentColor ? 'color:' + s.customAccentColor : '') + '">▸</span> <span style="' + bodyStyle + '">' + b + '</span></li>').join('');
        bodyHtml = '<ul class="bullets">' + bullets + '</ul>';
      }

      stage.innerHTML = 
        '<div class="slide-header">' +
          '<div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.7;margin-bottom:6px;">${deckTitle.replace(/'/g, "\\'")}</div>' +
          '<h1 class="accent-title" style="' + titleStyle + '">' + (s.title || '') + '</h1>' +
          (s.subtitle ? '<p class="accent-text" style="' + subtitleStyle + '">' + s.subtitle + '</p>' : '') +
        '</div>' +
        '<div class="slide-body">' + bodyHtml + '</div>' +
        '<div class="slide-footer">' +
          '<span>${deckTitle.replace(/'/g, "\\'")}</span>' +
          '<span>Slide ' + (currentIdx + 1) + ' / ' + slides.length + '</span>' +
        '</div>';
    }

    function nextSlide() {
      if (currentIdx < slides.length - 1) { currentIdx++; renderSlide(); }
    }
    function prevSlide() {
      if (currentIdx > 0) { currentIdx--; renderSlide(); }
    }
    function toggleNotes() {
      document.getElementById('notesDrawer').classList.toggle('open');
    }
    function toggleFullScreen() {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); }
      else { document.exitFullscreen(); }
    }
    function toggleAutoPlay() {
      const btn = document.getElementById('playBtn');
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
        btn.innerText = '▶ Auto-Play';
      } else {
        btn.innerText = '⏸ Pause';
        autoPlayTimer = setInterval(() => {
          if (currentIdx < slides.length - 1) { nextSlide(); } else { currentIdx = 0; renderSlide(); }
        }, 5000);
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { nextSlide(); }
      else if (e.key === 'ArrowLeft' || e.key === 'Backspace') { prevSlide(); }
      else if (e.key.toLowerCase() === 'f') { toggleFullScreen(); }
      else if (e.key.toLowerCase() === 'n') { toggleNotes(); }
      else if (e.key === 'Escape') {
        const notes = document.getElementById('notesDrawer');
        if (notes.classList.contains('open')) notes.classList.remove('open');
      }
    });

    renderSlide();
  </script>
</body>
</html>`;
  };

  /**
   * Opens the presentation in a brand-new browser tab with full presentation controls
   */
  const handleOpenInNewTab = () => {
    try {
      const html = generateStandaloneHtmlPresentation(currentDeck);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        // Popups might be blocked in iframe
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      showToast('🚀 Opened Slide Deck in new browser tab!');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      console.error('Open in new tab error:', err);
      showToast('Could not open new tab: ' + err.message);
    }
  };

  /**
   * Export Presentation as Standalone HTML File (.html)
   */
  const handleExportHTML = () => {
    try {
      const html = generateStandaloneHtmlPresentation(currentDeck);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedFilename = (currentDeck.title || 'Presentation')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toLowerCase()
        .slice(0, 35);
      a.download = `${sanitizedFilename}_presentation.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      showToast('✅ HTML Presentation (.html) downloaded! Double-click to open in any web browser.');
    } catch (err: any) {
      console.error('Export HTML error:', err);
      showToast('Error exporting HTML: ' + err.message);
    }
  };

  /**
   * Export Presentation as a 16:9 PDF Slide Deck
   */
  const handleExportPDF = () => {
    try {
      showToast('Generating 16:9 PDF Slide Deck...');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 167] // 16:9 ratio
      });

      currentDeck.slides.forEach((s, idx) => {
        if (idx > 0) doc.addPage([297, 167], 'landscape');

        // Theme background
        if (currentDeck.theme === 'academic-navy') {
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 297, 167, 'F');
          doc.setTextColor(56, 189, 248);
        } else if (currentDeck.theme === 'emerald-forest') {
          doc.setFillColor(6, 78, 59);
          doc.rect(0, 0, 297, 167, 'F');
          doc.setTextColor(167, 243, 208);
        } else if (currentDeck.theme === 'sunset-amber') {
          doc.setFillColor(69, 26, 3);
          doc.rect(0, 0, 297, 167, 'F');
          doc.setTextColor(253, 230, 138);
        } else if (currentDeck.theme === 'slate-minimal') {
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 297, 167, 'F');
          doc.setTextColor(15, 23, 42);
        } else {
          // Royal purple
          doc.setFillColor(30, 27, 75);
          doc.rect(0, 0, 297, 167, 'F');
          doc.setTextColor(253, 224, 71);
        }

        // Title
        doc.setFontSize(22);
        doc.text(s.title || `Slide ${idx + 1}`, 20, 25);

        // Subtitle
        if (s.subtitle) {
          doc.setFontSize(12);
          if (currentDeck.theme === 'slate-minimal') {
            doc.setTextColor(99, 102, 241);
          } else {
            doc.setTextColor(192, 132, 252);
          }
          doc.text(s.subtitle, 20, 35);
        }

        // Bullets / Content
        doc.setFontSize(12);
        if (currentDeck.theme === 'slate-minimal') {
          doc.setTextColor(51, 65, 85);
        } else {
          doc.setTextColor(224, 231, 255);
        }

        let yPos = 48;
        if (s.layout === 'two-column') {
          (s.leftContent || []).forEach(b => {
            const split = doc.splitTextToSize(`• ${b}`, 120);
            doc.text(split, 20, yPos);
            yPos += split.length * 7 + 3;
          });
          let rightY = 48;
          (s.rightContent || []).forEach(b => {
            const split = doc.splitTextToSize(`• ${b}`, 120);
            doc.text(split, 150, rightY);
            rightY += split.length * 7 + 3;
          });
        } else if (s.layout === 'stat-highlight') {
          if (s.statValue) {
            doc.setFontSize(36);
            doc.text(s.statValue, 20, 65);
            doc.setFontSize(12);
            if (s.statLabel) {
              const splitLabel = doc.splitTextToSize(s.statLabel, 100);
              doc.text(splitLabel, 20, 78);
            }
          }
          let statY = 48;
          (s.bullets || []).forEach(b => {
            const split = doc.splitTextToSize(`• ${b}`, 130);
            doc.text(split, 140, statY);
            statY += split.length * 7 + 3;
          });
        } else {
          (s.bullets || []).forEach(b => {
            const split = doc.splitTextToSize(`• ${b}`, 250);
            doc.text(split, 20, yPos);
            yPos += split.length * 7 + 4;
          });
        }

        // Footer
        doc.setFontSize(9);
        doc.text(`${currentDeck.title} | Slide ${idx + 1} of ${currentDeck.slides.length}`, 20, 160);
      });

      const sanitizedFilename = (currentDeck.title || 'Presentation')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .slice(0, 35);

      doc.save(`${sanitizedFilename}_slides.pdf`);
      showToast('✅ Slide Deck PDF exported successfully!');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('Error exporting PDF: ' + (err.message || 'Unknown error'));
    }
  };

  /**
   * Export Presentation as Markdown Document (.md)
   */
  const handleExportMarkdown = () => {
    let md = `# ${currentDeck.title}\n\n> ${currentDeck.description}\n\n`;

    currentDeck.slides.forEach((s, idx) => {
      md += `## Slide ${idx + 1}: ${s.title}\n`;
      if (s.subtitle) md += `*${s.subtitle}*\n\n`;

      if (s.statValue) {
        md += `**Key Metric:** ${s.statValue} — ${s.statLabel || ''}\n\n`;
      }

      if (s.leftContent && s.leftContent.length > 0) {
        md += `### Column 1\n`;
        s.leftContent.forEach(b => { md += `- ${b}\n`; });
        md += `\n`;
      }
      if (s.rightContent && s.rightContent.length > 0) {
        md += `### Column 2\n`;
        s.rightContent.forEach(b => { md += `- ${b}\n`; });
        md += `\n`;
      }
      if (s.bullets && s.bullets.length > 0) {
        s.bullets.forEach(b => { md += `- ${b}\n`; });
        md += `\n`;
      }
      if (s.notes) {
        md += `> **Presenter Notes:** ${s.notes}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedFilename = (currentDeck.title || 'Presentation').replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 35);
    a.download = `${sanitizedFilename}_outline.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    showToast('✅ Markdown Outline (.md) exported!');
  };

  const handleMoveToResearch = () => {
    let researchDocument = `${currentDeck.description}\n\n`;

    currentDeck.slides.forEach((s, idx) => {
      researchDocument += `Slide ${idx + 1}: ${s.title}\n`;
      if (s.subtitle) researchDocument += `${s.subtitle}\n\n`;
      
      if (s.leftContent && s.leftContent.length > 0) {
        s.leftContent.forEach(b => { researchDocument += `- ${b}\n`; });
      }
      if (s.rightContent && s.rightContent.length > 0) {
        s.rightContent.forEach(b => { researchDocument += `- ${b}\n`; });
      }
      if (s.bullets && s.bullets.length > 0) {
        s.bullets.forEach(b => { researchDocument += `- ${b}\n`; });
      }
      if (s.statValue) {
        researchDocument += `Metric: ${s.statValue} (${s.statLabel || ''})\n`;
      }
      if (s.notes) {
        researchDocument += `Notes: ${s.notes}\n`;
      }
      researchDocument += `\n---\n\n`;
    });

    sendToResearch(researchDocument, currentDeck.title, {
      type: 'slide-deck',
      title: currentDeck.title,
      slideDeckData: currentDeck
    });
  };

  const currentSlide = currentDeck.slides[activeSlideIndex] || currentDeck.slides[0];
  const currentStyles = getEffectiveSlideStyles(currentSlide, currentDeck);

  const getThemeClass = (t: SlideDeck['theme']) => {
    switch (t) {
      case 'royal-purple':
        return 'bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white';
      case 'academic-navy':
        return 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white';
      case 'emerald-forest':
        return 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white';
      case 'sunset-amber':
        return 'bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 text-white';
      case 'slate-minimal':
        return 'bg-slate-50 text-slate-900 border border-slate-200';
      case 'cyber-dark':
        return 'bg-gradient-to-br from-[#090D16] via-[#150D2A] to-[#0A0F1D] text-white';
      case 'burgundy-crimson':
        return 'bg-gradient-to-br from-[#350A10] via-[#4C0519] to-[#1E0508] text-white';
      case 'ocean-cyan':
        return 'bg-gradient-to-br from-[#032B44] via-[#075985] to-[#021A29] text-white';
      case 'warm-ivory':
        return 'bg-[#FFFDF5] text-stone-900 border border-amber-200/60';
      case 'clean-white':
        return 'bg-white text-slate-900 border border-slate-200';
      default:
        return 'bg-purple-950 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <PortalExitButton portalName="Slides Studio" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-900 text-amber-400 rounded-xl shadow-md">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PowerPoint Slides Creator</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Generate, customize, and export presentation decks from prompts or uploaded documents</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveToProjects}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Save this customized presentation to Projects"
          >
            <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Save Deck</span>
          </button>

          <button 
            onClick={() => setIsPresentationMode(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ring-2 ring-purple-500/20"
            title="Present full-screen directly in your browser with keyboard navigation"
          >
            <MonitorPlay className="w-4 h-4 text-amber-300" />
            <span>Present in Browser</span>
          </button>

          <button 
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            title="Open complete presentation in a new standalone browser tab"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            <span>New Tab</span>
          </button>

          <button 
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            title="Download offline HTML presentation (.html) that opens in any browser"
          >
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>HTML Slides</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            title="Export as high-resolution 16:9 PDF Slides"
          >
            <FileDown className="w-4 h-4 text-purple-900 dark:text-purple-400" />
            <span>PDF</span>
          </button>

          <button 
            onClick={handleExportPPTX}
            disabled={isExportingPPTX}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-purple-900/30 disabled:opacity-50"
            title="Download standard Microsoft PowerPoint .pptx presentation (100% Office compatible)"
          >
            {isExportingPPTX ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-amber-400" />
            )}
            <span>{isExportingPPTX ? 'Compiling PPTX...' : 'Export .PPTX'}</span>
          </button>

          <button 
            onClick={() => setShowOfficeGuideModal(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Office & Web presentation opening guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusToast && (
        <div className="mb-4 p-3 bg-purple-900 text-amber-300 border border-purple-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{statusToast}</span>
          <button onClick={() => setStatusToast(null)} className="text-white hover:text-amber-400">✕</button>
        </div>
      )}

      {/* Creator Input Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Prompt & Document Upload */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Describe Topic or Convert Uploaded Document
                </label>
                {uploadedFileName && (
                  <span className="text-[11px] font-semibold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                    PDF / Doc Attached
                  </span>
                )}
              </div>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Structure and function of the eukaryotic cell membrane with lipid bilayer, transport proteins, and receptor signaling..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 outline-none resize-none transition-all"
              />
            </div>

            {/* Document / PDF Upload Strip with Rich Feedback */}
            <div 
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const syntheticEvent = {
                    target: { files: e.dataTransfer.files }
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileUpload(syntheticEvent);
                }
              }}
              className={`p-3.5 bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed rounded-xl transition-all ${
                uploadedFileName 
                  ? 'border-emerald-400/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-900/50 dark:hover:border-purple-500/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt,.md,.doc,.docx,.csv" 
                className="hidden" 
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtractingDoc}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors shadow-sm shrink-0 cursor-pointer"
                  >
                    {isExtractingDoc ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-900 dark:text-purple-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-purple-900 dark:text-purple-400" />
                    )}
                    <span>{isExtractingDoc ? 'Parsing Document...' : 'Upload PDF / Document'}</span>
                  </button>

                  <div className="text-xs text-slate-500 min-w-0">
                    {isExtractingDoc ? (
                      <span className="font-semibold text-purple-900 dark:text-purple-400 flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting text, pages & structure...
                      </span>
                    ) : uploadedFileName ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> {uploadedFileName}
                        </span>
                        {extractedDocInfo && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {extractedDocInfo.pageCount} page{extractedDocInfo.pageCount > 1 ? 's' : ''} • {extractedDocInfo.totalCharacters.toLocaleString()} chars
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>Drag & drop or click to upload PDF research paper, notes, or report</span>
                    )}
                  </div>
                </div>

                {uploadedFileName && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {extractedDocInfo && (
                      <button
                        type="button"
                        onClick={() => setShowDocPreview(!showDocPreview)}
                        className="text-xs text-purple-900 dark:text-purple-300 hover:underline px-1.5 py-1 font-semibold"
                      >
                        {showDocPreview ? 'Hide Text' : 'Preview Text'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setUploadedFileText('');
                        setRawFileDataUri(null);
                        setExtractedDocInfo(null);
                        setShowDocPreview(false);
                      }}
                      className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Collapsible Document Preview */}
              {showDocPreview && extractedDocInfo && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 max-h-40 overflow-y-auto space-y-1.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Extracted Content Preview:</div>
                  <p className="whitespace-pre-line font-mono text-[11px] leading-relaxed opacity-90">
                    {extractedDocInfo.text.slice(0, 1000)}
                    {extractedDocInfo.text.length > 1000 ? '...\n[Document truncated for preview - full content will be synthesized into slides]' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Controls & Generate Button */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Slide Count</label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value={4}>4 Slides (Brief)</option>
                    <option value={6}>6 Slides (Standard)</option>
                    <option value={8}>8 Slides (Detailed)</option>
                    <option value={10}>10 Slides (Deep Dive)</option>
                    <option value={12}>12 Slides (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      const newT = e.target.value as SlideDeck['theme'];
                      setTheme(newT);
                      setCurrentDeck(prev => ({ ...prev, theme: newT }));
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="royal-purple">Royal Purple & Gold</option>
                    <option value="academic-navy">Academic Navy</option>
                    <option value="emerald-forest">Emerald Bio</option>
                    <option value="sunset-amber">Sunset Amber</option>
                    <option value="slate-minimal">Slate Minimal Light</option>
                    <option value="cyber-dark">Cyber Dark Matrix</option>
                    <option value="burgundy-crimson">Burgundy Crimson</option>
                    <option value="ocean-cyan">Ocean Deep Cyan</option>
                    <option value="warm-ivory">Warm Ivory Editorial</option>
                    <option value="clean-white">Clean Modern White</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="Academic & Research">Academic & Research (Rigorous)</option>
                  <option value="Undergraduate Students">Undergraduate Students</option>
                  <option value="Executive & Professional">Executive & Professional</option>
                  <option value="General Public">General Public (Accessible)</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateSlides}
              disabled={isGenerating || isExtractingDoc}
              className="w-full py-3 px-4 bg-purple-900 hover:bg-purple-950 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Converting to PowerPoint...</span>
                  </div>
                  {generationStep && (
                    <span className="text-[10px] text-purple-200 opacity-90 font-normal">
                      {generationStep}
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{uploadedFileName ? 'Convert PDF to PowerPoint Deck' : 'Generate PowerPoint Slides'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Deck Stage & Toolbar */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Stage Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate max-w-[200px]">
              {currentDeck.title}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
              {currentSlide?.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-purple-900 text-white border-purple-800 hover:bg-purple-950 shadow-sm'
              }`}
              title="Open full editor to change font style, font size, colors, text, and slide backgrounds"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Close Editor' : 'Edit Slide & Style'}</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
              className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 text-purple-900 dark:text-purple-300' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
              title="Toggle Overview Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              title={isFullscreen ? "Exit Fullscreen Presentation" : "Full Screen Slide Show"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PowerPoint Studio Customizer & Slide Editor Panel */}
        {isEditMode && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-lg p-5 space-y-4 animate-fadeIn">
            {/* Editor Top Bar: Scope & Slide Operations */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Apply Changes To:</span>
                <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setApplyScope('slide')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      applyScope === 'slide'
                        ? 'bg-purple-900 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Active Slide ({activeSlideIndex + 1})
                  </button>
                  <button
                    onClick={() => setApplyScope('deck')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      applyScope === 'deck'
                        ? 'bg-purple-900 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Entire Presentation (All Slides)
                  </button>
                </div>
              </div>

              {/* Slide management buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleAddNewSlide}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  title="Add a new slide after current slide"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Slide</span>
                </button>
                <button
                  onClick={handleDuplicateSlide}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                  title="Duplicate current slide"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => handleMoveSlide('up')}
                  disabled={activeSlideIndex === 0}
                  className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-200 transition-colors"
                  title="Move slide earlier in deck"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveSlide('down')}
                  disabled={activeSlideIndex === currentDeck.slides.length - 1}
                  className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-200 transition-colors"
                  title="Move slide later in deck"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteSlide}
                  disabled={currentDeck.slides.length <= 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-rose-100 transition-colors"
                  title="Delete this slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={resetCustomStyling}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                  title="Reset custom styling to theme defaults"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Reset Style</span>
                </button>
              </div>
            </div>

            {/* Editor Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                onClick={() => setEditorTab('content')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === 'content'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Slide Content</span>
              </button>
              <button
                onClick={() => setEditorTab('typography')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === 'typography'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Fonts & Sizes</span>
              </button>
              <button
                onClick={() => setEditorTab('colors')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === 'colors'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Slide Colors</span>
              </button>
              <button
                onClick={() => setEditorTab('background')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === 'background'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Background & Themes</span>
              </button>
            </div>

            {/* TAB 1: SLIDE CONTENT */}
            {editorTab === 'content' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      value={currentSlide?.title || ''}
                      onChange={(e) => updateActiveSlide({ title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter slide title..."
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Slide Layout
                    </label>
                    <select
                      value={currentSlide?.layout || 'bullet-points'}
                      onChange={(e) => updateActiveSlide({ layout: e.target.value as SlideItem['layout'] })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="bullet-points">Standard Bullet Points</option>
                      <option value="two-column">Two Columns (Comparative)</option>
                      <option value="stat-highlight">Large Stat Highlight Metric</option>
                      <option value="title">Title & Big Focus</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Slide Subtitle
                  </label>
                  <input
                    type="text"
                    value={currentSlide?.subtitle || ''}
                    onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter slide subtitle or pedagogical context..."
                  />
                </div>

                {/* Layout-Specific Content Fields */}
                {currentSlide?.layout === 'two-column' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column Items */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Left Column Points</span>
                        <button
                          onClick={() => {
                            const arr = [...(currentSlide.leftContent || []), 'New key point'];
                            updateActiveSlide({ leftContent: arr });
                          }}
                          className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>
                      {(currentSlide.leftContent || []).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{pIdx + 1}.</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const arr = [...(currentSlide.leftContent || [])];
                              arr[pIdx] = e.target.value;
                              updateActiveSlide({ leftContent: arr });
                            }}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100"
                          />
                          <button
                            onClick={() => {
                              const arr = (currentSlide.leftContent || []).filter((_, idx) => idx !== pIdx);
                              updateActiveSlide({ leftContent: arr });
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Right Column Items */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Right Column Points</span>
                        <button
                          onClick={() => {
                            const arr = [...(currentSlide.rightContent || []), 'New key point'];
                            updateActiveSlide({ rightContent: arr });
                          }}
                          className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>
                      {(currentSlide.rightContent || []).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{pIdx + 1}.</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const arr = [...(currentSlide.rightContent || [])];
                              arr[pIdx] = e.target.value;
                              updateActiveSlide({ rightContent: arr });
                            }}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100"
                          />
                          <button
                            onClick={() => {
                              const arr = (currentSlide.rightContent || []).filter((_, idx) => idx !== pIdx);
                              updateActiveSlide({ rightContent: arr });
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : currentSlide?.layout === 'stat-highlight' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Highlight Metric / Stat Value
                        </label>
                        <input
                          type="text"
                          value={currentSlide?.statValue || ''}
                          onChange={(e) => updateActiveSlide({ statValue: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                          placeholder="e.g. 98.4% or 30-32 ATP"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Metric Label / Description
                        </label>
                        <input
                          type="text"
                          value={currentSlide?.statLabel || ''}
                          onChange={(e) => updateActiveSlide({ statLabel: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                          placeholder="e.g. Net metabolic yield per glucose molecule"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Supporting Findings</span>
                        <button
                          onClick={() => {
                            const arr = [...(currentSlide.bullets || []), 'New supporting finding'];
                            updateActiveSlide({ bullets: arr });
                          }}
                          className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Point
                        </button>
                      </div>
                      {(currentSlide.bullets || []).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{pIdx + 1}.</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const arr = [...(currentSlide.bullets || [])];
                              arr[pIdx] = e.target.value;
                              updateActiveSlide({ bullets: arr });
                            }}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100"
                          />
                          <button
                            onClick={() => {
                              const arr = (currentSlide.bullets || []).filter((_, idx) => idx !== pIdx);
                              updateActiveSlide({ bullets: arr });
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Slide Bullet Points</span>
                      <button
                        onClick={() => {
                          const arr = [...(currentSlide.bullets || []), 'New presentation finding'];
                          updateActiveSlide({ bullets: arr });
                        }}
                        className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet Point
                      </button>
                    </div>
                    {(currentSlide?.bullets || []).map((point, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{pIdx + 1}.</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const arr = [...(currentSlide.bullets || [])];
                            arr[pIdx] = e.target.value;
                            updateActiveSlide({ bullets: arr });
                          }}
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100"
                        />
                        <button
                          onClick={() => {
                            const arr = (currentSlide.bullets || []).filter((_, idx) => idx !== pIdx);
                            updateActiveSlide({ bullets: arr });
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Presenter Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Presenter Speaking Notes (Hidden during presentation mode)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide?.notes || ''}
                    onChange={(e) => updateActiveSlide({ notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter speaking cues, research citations, or talking points..."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY & FONT SIZES */}
            {editorTab === 'typography' && (
              <div className="space-y-4">
                {/* Font Family Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Font Style Family
                    </label>
                    <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-bold">
                      Current: {currentStyles.customFont}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { name: 'Poppins', category: 'Modern Geometric' },
                      { name: 'Calibri', category: 'Standard Office' },
                      { name: 'Arial', category: 'Modern Clean' },
                      { name: 'Georgia', category: 'Classic Serif' },
                      { name: 'Garamond', category: 'Academic Book' },
                      { name: 'Trebuchet MS', category: 'Punchy Sans' },
                      { name: 'Verdana', category: 'High Legibility' },
                      { name: 'Courier New', category: 'Technical Code' },
                      { name: 'Montserrat', category: 'Geometric Sans' },
                      { name: 'Playfair Display', category: 'Editorial Luxury' },
                      { name: 'Impact', category: 'Heavy Display' }
                    ].map((f) => (
                      <button
                        key={f.name}
                        onClick={() => updateStyling({ fontFamily: f.name })}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          currentStyles.customFont === f.name
                            ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                        }`}
                      >
                        <div className="text-xs font-bold" style={{ fontFamily: f.name }}>{f.name}</div>
                        <div className="text-[10px] opacity-70">{f.category}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Sizes: Title and Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Title Font Size */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Title Font Size</span>
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">
                        {currentStyles.titleSize} pt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStyling({ titleFontSize: Math.max(16, currentStyles.titleSize - 2) })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                      >
                        -2 pt
                      </button>
                      <input
                        type="range"
                        min={18}
                        max={48}
                        step={2}
                        value={currentStyles.titleSize}
                        onChange={(e) => updateStyling({ titleFontSize: Number(e.target.value) })}
                        className="flex-1 accent-purple-600"
                      />
                      <button
                        onClick={() => updateStyling({ titleFontSize: Math.min(52, currentStyles.titleSize + 2) })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                      >
                        +2 pt
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {[22, 26, 28, 32, 36, 42].map(sz => (
                        <button
                          key={sz}
                          onClick={() => updateStyling({ titleFontSize: sz })}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                            currentStyles.titleSize === sz
                              ? 'bg-purple-900 text-white border-purple-900'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sz}pt
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body & Bullet Font Size */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Body & Bullets Font Size</span>
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">
                        {currentStyles.bodySize} pt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStyling({ bodyFontSize: Math.max(10, currentStyles.bodySize - 1) })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                      >
                        -1 pt
                      </button>
                      <input
                        type="range"
                        min={11}
                        max={24}
                        step={1}
                        value={currentStyles.bodySize}
                        onChange={(e) => updateStyling({ bodyFontSize: Number(e.target.value) })}
                        className="flex-1 accent-purple-600"
                      />
                      <button
                        onClick={() => updateStyling({ bodyFontSize: Math.min(26, currentStyles.bodySize + 1) })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                      >
                        +1 pt
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {[12, 14, 15, 16, 18, 20].map(sz => (
                        <button
                          key={sz}
                          onClick={() => updateStyling({ bodyFontSize: sz })}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                            currentStyles.bodySize === sz
                              ? 'bg-purple-900 text-white border-purple-900'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sz}pt
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SLIDE COLORS */}
            {editorTab === 'colors' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Title Color */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Title Color</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: currentStyles.titleColor }} />
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">{currentStyles.titleColor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyles.titleColor.startsWith('#') ? currentStyles.titleColor : `#${currentStyles.titleColor}`}
                        onChange={(e) => updateStyling({ titleColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentStyles.titleColor}
                        onChange={(e) => updateStyling({ titleColor: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        placeholder="#HEX"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {['#FDE047', '#38BDF8', '#34D399', '#FB7185', '#C084FC', '#F59E0B', '#FFFFFF', '#0F172A'].map((col) => (
                        <button
                          key={col}
                          onClick={() => updateStyling({ titleColor: col })}
                          className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Text Color */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Body & Bullets Text</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: currentStyles.textColor }} />
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">{currentStyles.textColor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyles.textColor.startsWith('#') ? currentStyles.textColor : `#${currentStyles.textColor}`}
                        onChange={(e) => updateStyling({ textColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentStyles.textColor}
                        onChange={(e) => updateStyling({ textColor: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        placeholder="#HEX"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {['#F8FAFC', '#E0E7FF', '#ECFDF5', '#FFFBEB', '#E2E8F0', '#64748B', '#1E293B', '#000000'].map((col) => (
                        <button
                          key={col}
                          onClick={() => updateStyling({ textColor: col })}
                          className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Accent & Subtitle Color */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Accent & Subtitle</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: currentStyles.accentColor }} />
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">{currentStyles.accentColor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyles.accentColor.startsWith('#') ? currentStyles.accentColor : `#${currentStyles.accentColor}`}
                        onChange={(e) => updateStyling({ accentColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentStyles.accentColor}
                        onChange={(e) => updateStyling({ accentColor: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        placeholder="#HEX"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {['#C084FC', '#38BDF8', '#34D399', '#F59E0B', '#FB7185', '#6366F1', '#94A3B8', '#D97706'].map((col) => (
                        <button
                          key={col}
                          onClick={() => updateStyling({ accentColor: col })}
                          className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BACKGROUND & THEMES */}
            {editorTab === 'background' && (
              <div className="space-y-4">
                {/* 10 Master Deck Themes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Curated Studio Themes
                    </label>
                    <span className="text-xs text-purple-700 dark:text-purple-400 font-bold">
                      Current: {currentDeck.theme}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'royal-purple', name: 'Royal Purple', desc: 'Purple & Gold', bg: 'bg-purple-950 text-amber-300' },
                      { id: 'academic-navy', name: 'Academic Navy', desc: 'Navy & Cyan', bg: 'bg-slate-900 text-sky-300' },
                      { id: 'emerald-forest', name: 'Emerald Bio', desc: 'Emerald & Mint', bg: 'bg-emerald-950 text-emerald-300' },
                      { id: 'sunset-amber', name: 'Sunset Amber', desc: 'Amber & Rose', bg: 'bg-amber-950 text-amber-300' },
                      { id: 'slate-minimal', name: 'Slate Light', desc: 'Slate Minimal', bg: 'bg-slate-100 text-slate-800' },
                      { id: 'cyber-dark', name: 'Cyber Matrix', desc: 'OLED Neon', bg: 'bg-black text-cyan-400' },
                      { id: 'burgundy-crimson', name: 'Burgundy Crimson', desc: 'Crimson Rose', bg: 'bg-rose-950 text-rose-300' },
                      { id: 'ocean-cyan', name: 'Ocean Cyan', desc: 'Deep Sea Blue', bg: 'bg-sky-950 text-cyan-300' },
                      { id: 'warm-ivory', name: 'Warm Ivory', desc: 'Editorial Serif', bg: 'bg-amber-50 text-stone-900' },
                      { id: 'clean-white', name: 'Clean White', desc: 'Modern High Contrast', bg: 'bg-white text-blue-600' }
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          updateStyling({ 
                            theme: th.id as SlideDeck['theme'],
                            customBg: undefined,
                            customBgGradient: undefined
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          currentDeck.theme === th.id && !currentStyles.isCustomBg
                            ? 'ring-2 ring-purple-600 border-purple-600 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'
                        }`}
                      >
                        <div className={`w-full h-4 rounded mb-1.5 ${th.bg}`} />
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{th.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{th.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Solid Background Color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Solid Background</span>
                      <button
                        onClick={() => updateStyling({ customBg: undefined, customBgGradient: undefined })}
                        className="text-[11px] text-purple-700 dark:text-purple-400 hover:underline"
                      >
                        Use Theme Default
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyles.customBg ? (currentStyles.customBg.startsWith('#') ? currentStyles.customBg : `#${currentStyles.customBg}`) : '#1E1B4B'}
                        onChange={(e) => updateStyling({ customBg: e.target.value, customBgGradient: undefined })}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentStyles.customBg || ''}
                        onChange={(e) => updateStyling({ customBg: e.target.value, customBgGradient: undefined })}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        placeholder="e.g. #090D16 or #FFFFFF"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {['#090D16', '#18181B', '#0F172A', '#064E3B', '#350A10', '#1E293B', '#F8FAFC', '#FFFDF5', '#000000'].map((col) => (
                        <button
                          key={col}
                          onClick={() => updateStyling({ customBg: col, customBgGradient: undefined })}
                          className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Curated Gradients */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Designer Slide Gradients</span>
                      <span className="text-[11px] text-slate-500">8 Curated</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'Twilight', grad: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)' },
                        { name: 'Matrix', grad: 'linear-gradient(135deg, #090D16 0%, #1E1035 100%)' },
                        { name: 'Emerald', grad: 'linear-gradient(135deg, #022C22 0%, #065F46 100%)' },
                        { name: 'Blaze', grad: 'linear-gradient(135deg, #431407 0%, #9A3412 100%)' },
                        { name: 'Abyss', grad: 'linear-gradient(135deg, #082F49 0%, #0369A1 100%)' },
                        { name: 'Velvet', grad: 'linear-gradient(135deg, #350A10 0%, #7F1D1D 100%)' },
                        { name: 'Slate', grad: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' },
                        { name: 'Parchment', grad: 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 100%)' }
                      ].map((g) => (
                        <button
                          key={g.name}
                          onClick={() => updateStyling({ customBgGradient: g.grad, customBg: undefined })}
                          className={`h-9 rounded-lg border transition-all hover:scale-105 ${
                            currentStyles.customBgGradient === g.grad
                              ? 'ring-2 ring-purple-600 border-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                          style={{ background: g.grad }}
                          title={g.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Single Interactive Slide Stage */}
        {viewMode === 'single' && (
          <div 
            className={`relative w-full rounded-2xl p-8 sm:p-12 shadow-xl transition-all aspect-[16/9] min-h-[380px] flex flex-col justify-between overflow-hidden ${currentStyles.bgClass} ${isFullscreen ? 'fixed inset-4 z-50 rounded-3xl m-auto max-w-6xl max-h-[90vh]' : ''}`}
            style={{
              ...currentStyles.backgroundStyle,
              fontFamily: currentStyles.fontFamilyCss
            }}
          >
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="text-xs font-bold tracking-widest uppercase opacity-75"
                  style={{ color: currentStyles.accentColor }}
                >
                  {currentDeck.title}
                </span>
                <span 
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                  style={{ 
                    borderColor: `${currentStyles.accentColor}40`, 
                    color: currentStyles.accentColor,
                    backgroundColor: `${currentStyles.accentColor}15`
                  }}
                >
                  Slide {activeSlideIndex + 1} of {currentDeck.slides.length}
                </span>
              </div>

              <h2 
                className="font-extrabold tracking-tight mb-2"
                style={{ 
                  color: currentStyles.titleColor,
                  fontSize: `${currentStyles.titleSize * 1.15}px`,
                  lineHeight: 1.2
                }}
              >
                {currentSlide?.title}
              </h2>
              {currentSlide?.subtitle && (
                <p 
                  className="italic font-medium"
                  style={{ 
                    color: currentStyles.accentColor,
                    fontSize: `${Math.max(13, currentStyles.bodySize - 1)}px`
                  }}
                >
                  {currentSlide?.subtitle}
                </p>
              )}
            </div>

            {/* Slide Content Body Based on Layout */}
            <div className="my-auto py-4">
              {currentSlide?.layout === 'two-column' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                    <h4 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: currentStyles.accentColor }}
                    >
                      Primary Analysis
                    </h4>
                    <ul className="space-y-2">
                      {(currentSlide.leftContent || []).map((item, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-2"
                          style={{ 
                            color: currentStyles.textColor,
                            fontSize: `${currentStyles.bodySize}px`
                          }}
                        >
                          <span style={{ color: currentStyles.accentColor }} className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                    <h4 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: currentStyles.accentColor }}
                    >
                      Nuances & Implications
                    </h4>
                    <ul className="space-y-2">
                      {(currentSlide.rightContent || []).map((item, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-2"
                          style={{ 
                            color: currentStyles.textColor,
                            fontSize: `${currentStyles.bodySize}px`
                          }}
                        >
                          <span style={{ color: currentStyles.accentColor }} className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : currentSlide?.layout === 'stat-highlight' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                    <div 
                      className="font-black mb-2 font-mono"
                      style={{ 
                        color: currentStyles.titleColor,
                        fontSize: `${Math.max(40, currentStyles.titleSize * 1.6)}px`
                      }}
                    >
                      {currentSlide.statValue}
                    </div>
                    <div 
                      className="text-xs sm:text-sm font-semibold opacity-90"
                      style={{ color: currentStyles.accentColor }}
                    >
                      {currentSlide.statLabel}
                    </div>
                  </div>
                  <div className="md:col-span-7 space-y-3">
                    <ul className="space-y-2.5">
                      {(currentSlide.bullets || []).map((b, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-2.5"
                          style={{ 
                            color: currentStyles.textColor,
                            fontSize: `${currentStyles.bodySize}px`
                          }}
                        >
                          <span style={{ color: currentStyles.accentColor }} className="font-bold mt-1">✦</span>
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : currentSlide?.layout === 'title' && currentDeck.id === 'preset-chem-1' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                   <div className="space-y-3">
                    <ul className="space-y-3">
                      {(currentSlide?.bullets || []).map((bullet, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-3"
                          style={{ 
                            color: currentStyles.textColor,
                            fontSize: `${currentStyles.bodySize}px`
                          }}
                        >
                          <span style={{ color: currentStyles.accentColor }} className="font-bold text-lg leading-none mt-1">▸</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                   </div>
                   <div className="flex flex-col gap-6 items-center justify-center p-6 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl">
                     {/* Sticker Form / 2D Lewis */}
                     <div className="flex flex-col items-center bg-white text-black p-4 rounded-xl shadow-lg border border-slate-200 w-full max-w-[250px]">
                        <span className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide">Sticker Form</span>
                        <svg viewBox="0 0 120 120" className="w-24 h-24">
                          <text x="60" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="#000">C</text>
                          <text x="60" y="24" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="#000">H</text>
                          <text x="60" y="108" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="#000">H</text>
                          <text x="18" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="#000">H</text>
                          <text x="102" y="66" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fill="#000">H</text>
                          <line x1="60" y1="32" x2="60" y2="44" stroke="#000" strokeWidth="2" />
                          <line x1="60" y1="74" x2="60" y2="86" stroke="#000" strokeWidth="2" />
                          <line x1="32" y1="58" x2="44" y2="58" stroke="#000" strokeWidth="2" />
                          <line x1="76" y1="58" x2="88" y2="58" stroke="#000" strokeWidth="2" />
                        </svg>
                     </div>
                     {/* 3D Ball & Stick */}
                     <div className="flex flex-col items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-700 w-full max-w-[250px]">
                        <span className="font-bold text-slate-300 text-sm mb-2 uppercase tracking-wide">3D Form</span>
                        <svg viewBox="0 0 120 120" className="w-24 h-24">
                          {/* Bonds */}
                          <line x1="60" y1="60" x2="25" y2="25" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                          <line x1="60" y1="60" x2="95" y2="25" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                          <line x1="60" y1="60" x2="25" y2="95" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                          <line x1="60" y1="60" x2="95" y2="95" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                          
                          {/* Hydrogens */}
                          <circle cx="25" cy="25" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                          <text x="25" y="30" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
                          
                          <circle cx="95" cy="25" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                          <text x="95" y="30" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>

                          <circle cx="25" cy="95" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                          <text x="25" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>

                          <circle cx="95" cy="95" r="14" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1" />
                          <text x="95" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>

                          {/* Carbon */}
                          <circle cx="60" cy="60" r="18" fill="#EF4444" stroke="#FEE2E2" strokeWidth="1.5" />
                          <text x="60" y="66" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">C</text>
                        </svg>
                     </div>
                   </div>
                 </div>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  <ul className="space-y-3">
                    {(currentSlide?.bullets || []).map((bullet, i) => (
                      <li 
                        key={i} 
                        className="flex items-start gap-3"
                        style={{ 
                          color: currentStyles.textColor,
                          fontSize: `${currentStyles.bodySize}px`
                        }}
                      >
                        <span style={{ color: currentStyles.accentColor }} className="font-bold text-lg leading-none mt-1">▸</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div 
              className="flex items-center justify-between pt-4 border-t text-xs opacity-70"
              style={{ borderColor: `${currentStyles.textColor}25`, color: currentStyles.textColor }}
            >
              <span>{currentDeck.title}</span>
              <span>Slide {activeSlideIndex + 1} of {currentDeck.slides.length}</span>
            </div>
          </div>
        )}

        {/* View Mode: Overview Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDeck.slides.map((s, idx) => (
              <div 
                key={s.id}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setViewMode('single');
                }}
                className={`p-5 rounded-2xl cursor-pointer border transition-all hover:scale-[1.02] ${
                  activeSlideIndex === idx 
                    ? 'ring-2 ring-purple-900 border-purple-500 shadow-md' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 line-clamp-1">{s.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{s.subtitle || s.bullets[0]}</p>
              </div>
            ))}
          </div>
        )}

        {/* Slide Carousel Navigator & Presenter Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Thumbnails Navigator */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <button
              onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 overflow-x-auto py-1 px-2 max-w-md">
              {currentDeck.slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 h-7 rounded-lg text-xs font-semibold transition-all shrink-0 max-w-[120px] truncate ${
                    activeSlideIndex === idx 
                      ? 'bg-purple-900 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title={s.title}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveSlideIndex(Math.min(currentDeck.slides.length - 1, activeSlideIndex + 1))}
              disabled={activeSlideIndex === currentDeck.slides.length - 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Presenter Notes Box */}
          <div className="lg:col-span-5 bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Presenter Speaking Notes</span>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed line-clamp-3">
              {currentSlide?.notes || 'No notes added for this slide. Use the speaker notes when presenting.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN IN-BROWSER PRESENTATION MODE (Zero Installation Required)      */}
      {/* ========================================================================= */}
      {isPresentationMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none animate-fadeIn">
          {/* Top Control Bar */}
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-900 rounded-lg text-amber-400">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-md">{currentDeck.title}</h3>
                <span className="text-xs text-amber-400 font-medium">In-Browser Presentation Mode</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                Slide {activeSlideIndex + 1} of {currentDeck.slides.length}
              </span>

              <button
                onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showPresenterNotes
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Presenter Speaking Notes [N]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes [N]</span>
              </button>

              <button
                onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isPlayingAuto
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Auto Advance (5s per slide)"
              >
                {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAuto ? 'Auto Playing' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.().catch(() => {});
                  } else {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                title="Toggle Native Browser Fullscreen [F]"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen [F]</span>
              </button>

              <button
                onClick={() => setIsPresentationMode(false)}
                className="p-1.5 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg border border-rose-700/50 transition-all cursor-pointer ml-2"
                title="Exit Presentation [Esc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Presentation Slide Canvas Stage */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
            {/* Left Nav Arrow */}
            <button
              onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-purple-900 border border-slate-700 hover:border-purple-600 text-white flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer z-10 shadow-2xl"
              title="Previous Slide (Left Arrow / Backspace)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={() => setActiveSlideIndex(prev => Math.min(currentDeck.slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === currentDeck.slides.length - 1}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-purple-900 border border-slate-700 hover:border-purple-600 text-white flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer z-10 shadow-2xl"
              title="Next Slide (Right Arrow / Spacebar / Enter)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 16:9 Responsive Slide Frame */}
            <div 
              className={`w-full max-w-5xl aspect-video rounded-2xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between border border-white/10 relative transition-all ${currentStyles.bgClass}`}
              style={{
                ...currentStyles.backgroundStyle,
                fontFamily: currentStyles.fontFamilyCss
              }}
            >
              {/* Slide Header */}
              <div>
                <div 
                  className="text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: currentStyles.accentColor }}
                >
                  {currentDeck.title}
                </div>
                <h1 
                  className="font-extrabold tracking-tight mb-2 leading-tight"
                  style={{ 
                    color: currentStyles.titleColor,
                    fontSize: `${currentStyles.titleSize * 1.15}px`
                  }}
                >
                  {currentSlide.title}
                </h1>
                {currentSlide.subtitle && (
                  <p 
                    className="font-light italic"
                    style={{ 
                      color: currentStyles.accentColor,
                      fontSize: `${Math.max(13, currentStyles.bodySize - 1)}px`
                    }}
                  >
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Slide Body Layout */}
              <div className="my-auto py-4">
                {currentSlide.layout === 'two-column' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 space-y-3">
                      {(currentSlide.leftContent || []).map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: currentStyles.accentColor }} />
                          <span 
                            className="leading-relaxed"
                            style={{ color: currentStyles.textColor, fontSize: `${currentStyles.bodySize}px` }}
                          >
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 space-y-3">
                      {(currentSlide.rightContent || []).map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: currentStyles.accentColor }} />
                          <span 
                            className="leading-relaxed"
                            style={{ color: currentStyles.textColor, fontSize: `${currentStyles.bodySize}px` }}
                          >
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : currentSlide.layout === 'stat-highlight' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
                    <div className="sm:col-span-4 text-center bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div 
                        className="font-black tracking-tight"
                        style={{ 
                          color: currentStyles.titleColor,
                          fontSize: `${Math.max(40, currentStyles.titleSize * 1.6)}px`
                        }}
                      >
                        {currentSlide.statValue || '—'}
                      </div>
                      <div 
                        className="text-xs sm:text-sm mt-2 font-medium"
                        style={{ color: currentStyles.accentColor }}
                      >
                        {currentSlide.statLabel || ''}
                      </div>
                    </div>
                    <div className="sm:col-span-8 space-y-3">
                      {(currentSlide.bullets || []).map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: currentStyles.accentColor }} />
                          <span 
                            className="leading-relaxed"
                            style={{ color: currentStyles.textColor, fontSize: `${currentStyles.bodySize}px` }}
                          >
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-3xl">
                    {(currentSlide.bullets || []).map((bullet, i) => (
                      <div key={i} className="flex items-start gap-3.5">
                        <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: currentStyles.accentColor }} />
                        <span 
                          className="leading-relaxed"
                          style={{ color: currentStyles.textColor, fontSize: `${currentStyles.bodySize}px` }}
                        >
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div 
                className="flex items-center justify-between text-xs border-t pt-3 opacity-70"
                style={{ borderColor: `${currentStyles.textColor}25`, color: currentStyles.textColor }}
              >
                <span>{currentDeck.title}</span>
                <span>Slide {activeSlideIndex + 1} of {currentDeck.slides.length}</span>
              </div>
            </div>

            {/* Presenter Notes Drawer in Fullscreen Mode */}
            {showPresenterNotes && (
              <div className="absolute bottom-6 left-12 right-12 bg-slate-900/95 border border-amber-500/40 rounded-xl p-4 shadow-2xl text-amber-200 text-xs sm:text-sm backdrop-blur-md max-h-32 overflow-y-auto">
                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Speaker Notes:</span>
                </div>
                <p className="leading-relaxed">
                  {currentSlide.notes || 'No presenter notes specified for this slide.'}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Bar Hints */}
          <div className="h-10 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span>◄ ► Arrow Keys or Space to advance</span>
              <span>• [N] Toggle Notes</span>
              <span>• [F] Fullscreen</span>
              <span>• [Esc] Exit</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveSlideIndex(prev => Math.min(currentDeck.slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === currentDeck.slides.length - 1}
                className="px-2 py-0.5 rounded bg-purple-900 hover:bg-purple-800 disabled:opacity-30 text-white cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICE & WEB POWERPOINT COMPATIBILITY GUIDE MODAL                         */}
      {/* ========================================================================= */}
      {showOfficeGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  How to Open & Present Your Slides
                </h3>
              </div>
              <button
                onClick={() => setShowOfficeGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {/* Option 1: Microsoft Office Desktop */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-purple-900 dark:text-purple-400 mb-1 flex items-center gap-1.5">
                  <span>1. Microsoft PowerPoint on Windows / Mac</span>
                </div>
                <p className="mb-2">
                  When opening files downloaded from the internet, Windows Office often displays a yellow <strong>"Protected View"</strong> banner. Click <strong>"Enable Editing"</strong> to proceed.
                </p>
                <div className="text-[11px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 p-2.5 rounded-lg text-amber-900 dark:text-amber-200">
                  <strong>Windows Unblock Tip:</strong> If PowerPoint displays an access error: right-click your downloaded <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.pptx</code> file &gt; select <strong>Properties</strong> &gt; at the bottom check <strong>"Unblock"</strong> &gt; click <strong>Apply</strong>.
                </div>
              </div>

              {/* Option 2: PowerPoint Web & Google Slides */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-blue-600 dark:text-blue-400 mb-1">
                  2. PowerPoint for the Web &amp; Google Slides (Free Online)
                </div>
                <p className="mb-2">
                  You can upload your downloaded <code className="text-purple-600 dark:text-purple-300">.pptx</code> directly to PowerPoint Web or Google Slides without needing desktop software installed.
                </p>
                <div className="flex gap-2 mt-2">
                  <a
                    href="https://office.com/launch/powerpoint"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Open PowerPoint Web
                  </a>
                  <a
                    href="https://slides.new"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Open Google Slides
                  </a>
                </div>
              </div>

              {/* Option 3: In-Browser Direct Presentation */}
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/40">
                <div className="font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                  <MonitorPlay className="w-4 h-4 text-purple-600" />
                  <span>3. Instant In-Browser Presentation (Zero Software Needed)</span>
                </div>
                <p className="text-purple-900/90 dark:text-purple-200/90 mb-3">
                  Click <strong>"Present in Browser"</strong> or <strong>"New Tab"</strong> right from the toolbar to display your widescreen presentation with full keyboard arrows, speaker notes, and auto-play immediately!
                </p>
                <button
                  onClick={() => {
                    setShowOfficeGuideModal(false);
                    setIsPresentationMode(true);
                  }}
                  className="w-full py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Start Browser Presentation Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
