export type View = 
  | 'research'
  | 'topic-ideator'
  | 'workspace'
  | 'image'
  | 'slides'
  | 'infographic'
  | 'draw-label'
  | 'prompt-builder'
  | 'prompt-library'
  | 'projects'
  | 'settings';

export interface ResearchTopic {
  id: string;
  title: string;
  degreeLevel: 'undergraduate' | 'masters' | 'phd' | string;
  field: string;
  researchGap: string;
  statementOfProblem: string;
  backgroundSummary: string;
  researchQuestions: string[];
  hypotheses?: string[];
  theoreticalFramework: string;
  methodology: string;
  expectedContribution: string;
  defendabilityScore: number;
  defenseAnticipations: { question: string; defenseStrategy: string }[];
  suggestedChaptersOverview?: string[];
  timestamp: number;
  tags?: string[];
}

export interface WorkspacePage {
  id: string;
  title: string;
  content: string; // Rich HTML or structured markdown
  createdAt: number;
  updatedAt: number;
  pageNumber?: number;
  customDate?: string;
  customSubtitle?: string;
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
  role: 'teacher' | 'researcher' | 'student' | 'academic' | string;
  category: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  pages: WorkspacePage[];
  activePageIndex: number;
  uploadedDocuments: WorkspaceUploadedDoc[];
  customDate?: string;
  customSubtitle?: string;
  researchMode?: ResearchGenerationMode;
  evidenceSources?: ResearchSource[];
  integrityMetrics?: ResearchIntegrityMetrics;
  latestAuditResult?: PreSubmissionAuditResult;
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

export interface CanonicalStructureDefinition {
  id: string; // Unique immutable identifier (e.g. 'euglena-nucleolus', 'frs-uterine-fundus')
  canonicalName: string; // Authoritative academic standard name
  aliases?: string[]; // Accepted academic synonyms
  number: number; // 1-based sequential display number
  category: string; // Functional anatomical category
  functionSummary: string; // Concise standard function
  detailedNotes: string; // Pedagogical in-depth explanation
  color: string; // Semantic color code
  anchor: {
    x: number; // 0..100 percentage X coordinate mapped precisely to geometry
    y: number; // 0..100 percentage Y coordinate mapped precisely to geometry
    svgAnchorId?: string; // Optional element ID reference inside the SVG (e.g. 'anchor-euglena-nucleolus')
  };
  required: boolean; // Must be present in diagram
  detailLevels: ('basic' | 'standard' | 'advanced')[];
}

export interface DiagramSourceReference {
  name: string;
  url?: string;
  purpose: 'terminology' | 'morphology' | 'curriculum-reference' | 'citation';
  license?: string;
  edition?: string;
}

export interface DiagramSpecification {
  diagramType: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'Biology & Cells' | 'Human Anatomy' | 'Botany & Ecology' | 'Physics & Chemistry' | 'Organic Chemistry' | 'Earth & Space';
  domain: 'biological' | 'anatomical' | 'chemical' | 'physical' | 'geological' | 'mechanical';
  defaultRenderMode: '3d' | '2d' | 'paper';
  funFact?: string;
  viewBox?: string;
  sources: DiagramSourceReference[];
  structures: CanonicalStructureDefinition[];
  forbiddenTerms?: string[]; // Strict validation regression list (e.g. ['Nucleolus (Endosome)', 'Endosome'])
}

export type ValidationStatus = 
  | 'draft'
  | 'ontology-validated'
  | 'render-validated'
  | 'expert-reviewed'
  | 'custom-unverified';

export interface DiagramValidationResult {
  isValid: boolean;
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
  validatedStructureCount: number;
  forbiddenTermViolations: string[];
}

export interface LabelPin {
  id: string;
  number: number;
  name: string;
  canonicalName?: string;
  aliases?: string[];
  x: number; // percentage 0-100 on canvas
  y: number; // percentage 0-100 on canvas
  color: string;
  category: string;
  functionSummary: string;
  detailedNotes: string;
  required?: boolean;
  rendered?: boolean;
  svgAnchorId?: string;
  initialX?: number; // percentage 0-100 canonical baseline
  initialY?: number; // percentage 0-100 canonical baseline
  manuallyAdjusted?: boolean;
  anchorMode?: 'canonical' | 'generated' | 'manual';
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

export type DiagramMode = 
  | 'authentic-reference'        // Mode 1: Authentic educational diagram from verified open archive (Wikimedia Commons / OpenStax)
  | 'structured-reconstruction'  // Mode 2: Reconstructed responsive SVG based strictly on authoritative ground truths (Gray's / Campbell / OpenStax)
  | 'ai-illustration';           // Mode 3: AI-generated educational illustration (explicitly marked as unverified reference)

export interface DiagramSourceAttribution {
  sourceName: string; // e.g., 'Wikimedia Commons Open Educational Archive', 'OpenStax Science', 'Gray\'s Anatomy & Campbell Biology Reference'
  sourceUrl?: string; // e.g., 'https://commons.wikimedia.org/wiki/File:...'
  license?: string; // e.g., 'CC BY-SA 4.0', 'Public Domain', 'Academic Open Use'
  author?: string; // e.g., 'LadyofHats', 'OpenStax Anatomy', 'Academic Scientific Studio'
  mode: DiagramMode;
  groundTruthStandard?: string; // e.g. "Gray's Anatomy 42nd Ed / OpenStax A&P", "Campbell Biology 12th Ed"
  verificationNote?: string;
  educationalLevel?: 'Elementary' | 'Secondary / High School' | 'Undergraduate / College' | 'Advanced Medical / Postgrad';
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
    | 'electric-circuit'
    | 'electromagnetic-spectrum'
    | 'euglena'
    | 'human-sperm'
    | 'female-reproductive-system'
    | 'male-reproductive-system'
    | 'carbon-cycle'
    | 'nitrogen-cycle'
    | 'water-cycle'
    | 'amoeba'
    | 'paramecium'
    | 'methane-molecule' 
    | 'water-molecule' 
    | 'hydrocarbon-alkanes' 
    | 'chemical-substance' 
    | 'bohr-atom' 
    | 'custom-concept'
    | (string & {});
  renderMode?: '3d' | '2d' | 'paper';
  domain?: 'biological' | 'anatomical' | 'chemical' | 'physical' | 'geological' | 'mechanical' | 'general';
  customSvgCode?: string;
  imageUrl?: string;
  chemicalData?: ChemicalMetadata;
  pins: LabelPin[];
  colorTheme: string;
  funFact?: string;
  timestamp: number;
  sourceAttribution?: DiagramSourceAttribution;
  isAiGeneratedFallback?: boolean;
  detailLevel?: 'basic' | 'standard' | 'advanced';
  validationResult?: DiagramValidationResult;
}

export type ImageEditMode = 
  | 'scene_change' 
  | 'background_change' 
  | 'posture_change' 
  | 'face_revamp' 
  | 'custom_edit';

export type ReferenceFidelityMode = 'high' | 'balanced' | 'creative';

export interface InternalEditPlan {
  referenceId?: string;
  fidelityMode: ReferenceFidelityMode;
  editType: 'background_change' | 'scene_change' | 'posture_change' | 'face_revamp' | 'custom_edit';
  preserve: {
    identity: boolean;
    faceStructure: boolean;
    skinTone: boolean;
    hairStyle: boolean;
    attire: boolean;
    bodyProportions: boolean;
    photographicDetail: boolean;
  };
  modifications: {
    background?: string;
    location?: string;
    lighting?: string;
    pose?: string;
    framing?: string;
    additions?: string;
    attireChanges?: string;
  };
  style: {
    name: string;
    isStylized: boolean;
  };
  output: {
    aspectRatio: string;
    quality: string;
    blurBackground: boolean;
  };
}

export interface CharacterAnalysis {
  ethnicityAndComplexion: string;
  attireDescription: string;
  facialFeatures: string;
  hairStyle: string;
  eyeDescription?: string;
  expressionDescription?: string;
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
  fidelityMode?: ReferenceFidelityMode;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}

// ============================================================================
// ACADEMIC RESEARCH INTEGRITY, EVIDENCE MATRIX & AUDIT TYPES
// ============================================================================

export type ClaimClassification = 
  | 'VERIFIED_FACT'              // Directly supported by a reliable retrieved source
  | 'VERIFIED_NUMERICAL_CLAIM'   // Numerical statement whose exact value has been located and verified in source
  | 'SOURCE_SYNTHESIS'           // Conclusion produced by combining findings from multiple sources
  | 'INTERPRETATION'             // Analytical interpretation made from available evidence
  | 'RESEARCH_HYPOTHESIS'        // Proposition proposed by the research rather than established
  | 'UNVERIFIED_CLAIM'           // Adequate source evidence has not been established
  | 'CONTESTED_CONFLICTING';     // Sources materially disagree or provide different findings

export type VerificationStatus = 
  | 'verified' 
  | 'qualified' 
  | 'indirect' 
  | 'conflicting' 
  | 'unverified' 
  | 'unsupported';

export interface ResearchClaim {
  id: string;
  claim: string;
  claim_type: ClaimClassification;
  source_id?: string;
  source_title?: string;
  authors?: string;
  publication_year?: number;
  evidence_location?: string;
  verification_status: VerificationStatus;
  confidence: number; // 0 to 1
  domain: string;
  isNumerical?: boolean;
  numericalValue?: string;
  verifiedNumericalValue?: string;
  domainTransfer?: boolean;
  notes?: string;
  suggestedFix?: string;
}

export type PublicationVenueType = 
  | 'Journal' 
  | 'Conference' 
  | 'Preprint' 
  | 'Institutional Report' 
  | 'Book' 
  | 'Standard/Regulation';

export type EvidenceStrength = 
  | 'Empirical Gold Standard' 
  | 'Strong Empirical' 
  | 'Moderate' 
  | 'Secondary/Review';

export interface ResearchSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi?: string;
  url?: string;
  peerReviewed: boolean;
  primarySource: boolean;
  publicationType: PublicationVenueType;
  researchDomain: string; // e.g., 'Differential Privacy Theory', 'Higher Education', 'Machine Learning'
  populationStudied?: string;
  dataset?: string;
  method?: string;
  privacyMechanism?: string;
  fairnessMetric?: string;
  keyFindings: string;
  verifiedNumericalFindings?: { metric: string; value: string; context: string }[];
  evidenceStrength: EvidenceStrength;
  directRelevanceToTopic: 'Direct' | 'Indirect / Transferable';
  limitations?: string;
  verificationStatus: 'Verified' | 'Source Inaccessible' | 'Metadata Conflict' | 'Conflicting Evidence' | 'Unverified';
  accessDate?: string;
}

export interface EvidenceMatrixRow {
  sourceId: string;
  source: string;
  year: number;
  authors: string;
  domain: string;
  population: string;
  dataset: string;
  method: string;
  privacyMechanism: string;
  fairnessMetric: string;
  keyFinding: string;
  numericalFinding: string;
  evidenceStrength: EvidenceStrength;
  directOrIndirect: 'Direct' | 'Indirect / Transferable';
  limitations: string;
  verificationStatus: string;
}

export interface ResearchIntegrityMetrics {
  sourcesRetrieved: number;
  sourcesSelected: number;
  primarySources: number;
  peerReviewedSources: number;
  claimsAnalysed: number;
  claimsVerified: number;
  numericalClaimsVerified: number;
  claimsRequiringQualification: number;
  unsupportedClaimsRemoved: number;
  conflictingFindings: number;
  directEvidenceCount: number;
  indirectEvidenceCount: number;
  researchGapsIdentified: number;
  integrityScore: number; // 0 to 100
}

export interface IntegrityAuditCheckItem {
  id: string;
  title: string;
  category: 'Citations' | 'Numerical' | 'Domain Transfer' | 'Methodology & Alignment' | 'Causal & Tone' | 'Frameworks';
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: string[];
  recommendation?: string;
}

export interface PreSubmissionAuditResult {
  passed: boolean;
  overallScore: number;
  checks: IntegrityAuditCheckItem[];
  claims: ResearchClaim[];
  flawedNumericalClaims: { claimed: string; expected: string; source: string; recommendation: string }[];
  domainTransferIssues: { text: string; sourceDomain: string; targetDomain: string; recommendation: string }[];
  causalLanguageWarnings: { phrase: string; context: string; recommendation: string }[];
  inflatedLanguageViolations: { phrase: string; replacement: string }[];
  titleAlignment: { title: string; issues: string[]; recommendedTitle?: string; matchesMethodology: boolean };
  researchGapValidation: { type: 'EMPIRICALLY_ESTABLISHED' | 'POSSIBLE_SUGGESTED'; description: string; evidence: string; valid: boolean };
  fairnessMetricJustification: { metric: string; justified: boolean; missingAspects: string[] }[];
}

export type ResearchGenerationMode = 'VERIFIED_RESEARCH' | 'EXPLORATORY_RESEARCH';
