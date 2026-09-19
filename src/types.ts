export type View = 
  | 'research'
  | 'workspace'
  | 'image'
  | 'slides'
  | 'infographic'
  | 'draw-label'
  | 'prompt-builder'
  | 'prompt-library'
  | 'projects'
  | 'settings';

export interface WorkspacePage {
  id: string;
  title: string;
  content: string; // Rich HTML or structured markdown
  createdAt: number;
  updatedAt: number;
  pageNumber?: number;
}

export interface WorkspaceUploadedDoc {
  id: string;
  name: string;
  type: string;
  sizeFormatted: string;
  text: string;
  preview: string;
  timestamp: number;
  rawBase64?: string;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  role: 'teacher' | 'researcher' | 'student' | 'academic';
  category: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  pages: WorkspacePage[];
  activePageIndex: number;
  uploadedDocuments: WorkspaceUploadedDoc[];
}

export interface ChatAttachment {
  type: 'diagram' | 'infographic' | 'slide-deck' | 'image';
  title: string;
  diagramData?: DiagramConcept;
  infographicData?: InfographicData;
  slideDeckData?: SlideDeck;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: ChatAttachment;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'title' | 'bullet-points' | 'two-column' | 'quote' | 'stat-highlight' | 'conclusion';
  bullets: string[];
  statValue?: string;
  statLabel?: string;
  leftContent?: string[];
  rightContent?: string[];
  notes?: string;
  accentColor?: string;
  customBg?: string;
  customBgGradient?: string;
  customTitleColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  customFontFamily?: string;
  customTitleFontSize?: number;
  customBodyFontSize?: number;
}

export interface SlideDeck {
  id: string;
  topic: string;
  title: string;
  description: string;
  theme: 'royal-purple' | 'academic-navy' | 'emerald-forest' | 'sunset-amber' | 'slate-minimal' | 'cyber-dark' | 'burgundy-crimson' | 'ocean-cyan' | 'warm-ivory' | 'clean-white';
  slides: SlideItem[];
  createdAt: number;
  fontFamily?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  customBg?: string;
  customBgGradient?: string;
  backgroundType?: 'theme' | 'solid' | 'gradient';
}

export interface InfographicSection {
  id: string;
  title: string;
  description: string;
  color: string;
  iconName?: string;
  badge?: string;
  metrics?: { label: string; value: string; progress?: number }[];
  points?: string[];
  illustrationType?: 'methane-2d' | 'methane-3d' | 'water-2d' | 'water-3d' | 'ethane-2d' | 'propane-2d' | 'hydrocarbon-paper';
}

export interface InfographicData {
  id: string;
  topic: string;
  title: string;
  subtitle: string;
  summary: string;
  palette: 'vibrant-spectrum' | 'emerald-teal' | 'royal-gold' | 'cyber-neon' | 'warm-sunset';
  style: 'pillar-cards' | 'step-process' | 'comparison-matrix' | 'bento-grid' | 'timeline-roadmap';
  sections: InfographicSection[];
  conclusion: string;
  timestamp: number;
}

export interface LabelPin {
  id: string;
  number: number;
  name: string;
  x: number; // percentage 0-100 on canvas
  y: number; // percentage 0-100 on canvas
  color: string;
  category: string;
  functionSummary: string;
  detailedNotes: string;
}

export interface ChemicalMetadata {
  formula: string; // e.g., 'CH₄' or 'H₂O'
  iupacName: string; // e.g., 'Methane' or 'Oxidane / Water'
  molarMass: string; // e.g., '16.04 g/mol' or '18.015 g/mol'
  geometry: string; // e.g., 'Tetrahedral (AX₄)' or 'Bent / V-Shaped (AX₂E₂)'
  bondAngle: string; // e.g., '109.5°' or '104.5°'
  bondLength: string; // e.g., '1.09 Å (109 pm)' or '0.96 Å (96 pm)'
  hybridization: string; // e.g., 'sp³'
  dipoleMoment: string; // e.g., '0 D (Non-polar)' or '1.85 D (Highly Polar)'
  lewisStructure?: string; // 2D text or diagram descriptor
}

export interface DiagramConcept {
  id: string;
  title: string;
  category: 'Biology & Cells' | 'Human Anatomy' | 'Botany & Ecology' | 'Physics & Chemistry' | 'Organic Chemistry' | 'Earth & Space';
  subtitle: string;
  description: string;
  diagramType: 
    | 'agama-lizard'
    | 'animal-cell' 
    | 'plant-cell' 
    | 'bony-fish' 
    | 'human-heart' 
    | 'human-brain' 
    | 'neuron' 
    | 'human-eye'
    | 'nephron-kidney'
    | 'mitochondria'
    | 'chloroplast'
    | 'bacterial-cell'
    | 'dna-helix'
    | 'lungs-respiratory'
    | 'stomach-digestive'
    | 'skin-anatomy'
    | 'human-ear'
    | 'flower-anatomy'
    | 'bacteriophage'
    | 'volcano' 
    | 'methane-molecule' 
    | 'water-molecule' 
    | 'hydrocarbon-alkanes' 
    | 'chemical-substance' 
    | 'bohr-atom' 
    | 'custom-concept'
    | (string & {});
  renderMode?: '3d' | '2d' | 'paper';
  domain?: 'biological' | 'chemical' | 'physical' | 'general';
  customSvgCode?: string;
  chemicalData?: ChemicalMetadata;
  pins: LabelPin[];
  colorTheme: string;
  funFact?: string;
  timestamp: number;
}

export type ImageEditMode = 
  | 'scene_change' 
  | 'background_change' 
  | 'posture_change' 
  | 'face_revamp' 
  | 'custom_edit';

export interface CharacterAnalysis {
  ethnicityAndComplexion: string;
  attireDescription: string;
  facialFeatures: string;
  hairStyle: string;
  strictPreservationPrompt: string;
  negativePromptExclusions: string;
  ageAndGender?: string;
  subjectBiometricPrompt?: string;
}

export interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  quality: string;
  model: string;
  style: string;
  timestamp: number;
  referenceImageUrl?: string;
  editMode?: ImageEditMode;
  faceLock?: boolean;
  isUpscaled?: boolean;
  complexionLock?: string;
  attireLock?: string;
  lockComplexion?: boolean;
  lockAttire?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}
