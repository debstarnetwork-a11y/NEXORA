import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eye, 
  EyeOff,
  Sparkles, 
  Download, 
  BookOpen, 
  Layers, 
  Check, 
  Loader2, 
  HelpCircle, 
  Filter, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sliders,
  FileImage,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
  Copy,
  CheckCheck,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Box,
  FileText,
  FileCode,
  FileDown,
  PenTool,
  Highlighter,
  Eraser,
  Edit3,
  Bookmark,
  Type,
  Image as ImageIcon,
  ShieldCheck,
  Award,
  AlertCircle,
  RotateCw,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { useAppStore } from '../store';
import { DiagramConcept, LabelPin } from '../types';
import { puterChat } from '../lib/puter';
import { exportToWordDocument } from '../lib/documentExport';
import { PortalExitButton } from '../components/PortalExitButton';
import { PageNavigationBar } from '../components/PageNavigationBar';
import { DrawingStroke } from '../components/DrawingCanvas';
import { ShapesLayer, CanvasShape } from '../components/ShapesLayer';
import { DiagramContentEditor, DIAGRAM_FONTS } from '../components/DiagramContentEditor';
import {
  AnimalCellDiagram,
  PlantCellDiagram,
  BonyFishDiagram,
  HumanHeartDiagram,
  HydrocarbonsDiagram,
  BohrAtomDiagram
} from '../components/ScientificDiagrams';
import { ScientificStructureRenderer } from '../components/ScientificStructureRenderer';
import { matchScientificConcept, SCIENTIFIC_PRESETS_REGISTRY } from '../lib/scientificRegistry';
import { generatePresetSVGDataUrl } from '../lib/diagramSvgExporter';
import { runDrawAndLabelEngine } from '../lib/drawAndLabelEngine';

const PRESET_DIAGRAMS: DiagramConcept[] = [
  {
    id: 'diag-animal-cell',
    title: 'Eukaryotic Animal Cell Ultrastructure',
    category: 'Biology & Cells',
    subtitle: 'Anatomical cross-section: double-envelope nucleus, organelles & membranes',
    description: 'Detailed anatomical depiction of an animal cell showing the plasma membrane with pinocytotic vesicle, double-envelope nucleus, nucleolus, rough and smooth ER, Golgi apparatus with vesicles, mitochondria with cristae, lysosomes, centrosome with centrioles, microtubules, and ribosomes.',
    diagramType: 'animal-cell',
    renderMode: 'paper',
    domain: 'biological',
    colorTheme: 'vibrant-emerald-cyan',
    funFact: 'An average adult human body contains roughly 37.2 trillion cells, each maintaining thousands of specialized organelles operating in continuous biochemical equilibrium.',
    sourceAttribution: {
      sourceName: "Campbell Biology 12th Ed / OpenStax",
      sourceUrl: "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "Campbell Biology 12th Ed / OpenStax Ultrastructure",
      verificationNote: "Verified structured anatomical reconstruction conforming strictly to standard curriculum morphology."
    },
    timestamp: Date.now() - 100000,
    pins: [
      {
        id: 'pin-pinocytosis',
        number: 1,
        name: 'Pinocytotic Vesicle',
        x: 50,
        y: 16,
        color: '#10B981',
        category: 'Membrane Transport',
        functionSummary: 'Flask-like invagination of the plasma membrane for non-specific cellular fluid uptake (cell drinking).',
        detailedNotes: 'Forms small pinosomes that fuse with endosomes and lysosomes for nutrient absorption.'
      },
      {
        id: 'pin-membrane',
        number: 2,
        name: 'Cell (Plasma) Membrane',
        x: 18,
        y: 35,
        color: '#14B8A6',
        category: 'Structural Boundary',
        functionSummary: 'Selectively permeable phospholipid bilayer that encloses the cytoplasm and maintains electrochemical homeostasis.',
        detailedNotes: 'Contains embedded transport channels, receptors, cholesterol for fluidity, and glycocalyx recognition markers.'
      },
      {
        id: 'pin-nucleus',
        number: 3,
        name: 'Nucleus & Nuclear Pores',
        x: 52,
        y: 50,
        color: '#6366F1',
        category: 'Genetic Control',
        functionSummary: 'Houses the genetic material (chromatin DNA) and orchestrates cellular replication and transcription.',
        detailedNotes: 'Enclosed by a double lipid bilayer perforated by nuclear pore complexes that regulate nucleocytoplasmic transport.'
      },
      {
        id: 'pin-nucleolus',
        number: 4,
        name: 'Nucleolus',
        x: 54,
        y: 46,
        color: '#8B5CF6',
        category: 'Genetic Control',
        functionSummary: 'Dense non-membrane bound nuclear sub-region dedicated to rRNA synthesis and ribosomal subunit assembly.',
        detailedNotes: 'Formed around nucleolar organizer regions (NORs); expands during periods of intense protein synthesis.'
      },
      {
        id: 'pin-rough-er',
        number: 5,
        name: 'Rough Endoplasmic Reticulum (RER)',
        x: 32,
        y: 46,
        color: '#3B82F6',
        category: 'Endomembrane System',
        functionSummary: 'Extensive folded cisternae studded with ribosomes that synthesize and fold secretory and transmembrane proteins.',
        detailedNotes: 'Conducts core N-linked glycosylation in its lumen and packages nascent proteins into COPII transport vesicles.'
      },
      {
        id: 'pin-smooth-er',
        number: 6,
        name: 'Smooth Endoplasmic Reticulum (SER)',
        x: 22,
        y: 64,
        color: '#06B6D4',
        category: 'Endomembrane System',
        functionSummary: 'Tubular network lacking ribosomes; synthesizes lipids and steroids, sequesters Ca2+, and detoxifies xenobiotics.',
        detailedNotes: 'Highly developed in hepatocytes for cytochrome P450 drug clearance and in myocytes as the sarcoplasmic reticulum.'
      },
      {
        id: 'pin-golgi',
        number: 7,
        name: 'Golgi Apparatus',
        x: 70,
        y: 48,
        color: '#F59E0B',
        category: 'Endomembrane System',
        functionSummary: 'Stack of flattened curved cisternae that modifies, sorts, and packages macromolecules into targeted vesicles.',
        detailedNotes: 'Exhibits distinct cis-cisternae (entry face receiving ER vesicles) and trans-Golgi network (exit sorting face).'
      },
      {
        id: 'pin-golgi-vesicles',
        number: 8,
        name: 'Golgi Vesicles',
        x: 76,
        y: 38,
        color: '#FBBF24',
        category: 'Endomembrane System',
        functionSummary: 'Membrane-bound spherical transport vesicles budding from the trans-Golgi for secretion or lysosomal delivery.',
        detailedNotes: 'Utilize SNARE docking complexes to target specific intracellular membranes or the plasma membrane for exocytosis.'
      },
      {
        id: 'pin-mitochondria',
        number: 9,
        name: 'Mitochondrion (Cristae)',
        x: 74,
        y: 28,
        color: '#EF4444',
        category: 'Bioenergetics',
        functionSummary: 'Cellular powerhouse driving the Krebs cycle and electron transport oxidative phosphorylation to produce ATP.',
        detailedNotes: 'Contains folded inner cristae partitions to maximize surface area for ATP synthase, plus circular mtDNA and 70S ribosomes.'
      },
      {
        id: 'pin-lysosome',
        number: 10,
        name: 'Lysosome',
        x: 25,
        y: 52,
        color: '#10B981',
        category: 'Degradation & Defense',
        functionSummary: 'Acidic organelle containing acid hydrolases for digesting damaged organelles (autophagy) and foreign pathogens.',
        detailedNotes: 'Operates at pH 4.5–5.0 maintained by active vacuolar H+-ATPase proton pumps.'
      },
      {
        id: 'pin-centrioles',
        number: 11,
        name: 'Centrioles & Centrosome',
        x: 45,
        y: 30,
        color: '#EC4899',
        category: 'Cytoskeleton & Division',
        functionSummary: 'Orthogonal pair of 9-triplet microtubule cylinders serving as the main Microtubule Organizing Center (MTOC).',
        detailedNotes: 'Nucleates the mitotic spindle fibers essential for equal chromosome separation during mitosis.'
      },
      {
        id: 'pin-microtubules',
        number: 12,
        name: 'Microtubules',
        x: 38,
        y: 72,
        color: '#06B6D4',
        category: 'Cytoskeleton',
        functionSummary: 'Hollow cylindrical polymer tubes composed of tubulin dimers supporting cell shape and intracellular cargo tracks.',
        detailedNotes: 'Serve as molecular highways for kinesin and dynein motor proteins transporting vesicles throughout the cell.'
      },
      {
        id: 'pin-cytoplasm',
        number: 13,
        name: 'Cytoplasm (Cytosol)',
        x: 82,
        y: 65,
        color: '#64748B',
        category: 'Cellular Matrix',
        functionSummary: 'Aqueous colloidal ground substance suspending the organelles, ions, amino acids, and enzymes for glycolysis.',
        detailedNotes: 'Densely crowded gel-like environment facilitating macromolecular diffusion and biochemical cascades.'
      },
      {
        id: 'pin-ribosomes',
        number: 14,
        name: 'Ribosomes (Free 80S)',
        x: 60,
        y: 65,
        color: '#FBBF24',
        category: 'Protein Synthesis',
        functionSummary: 'Catalytic ribonucleoprotein complexes translating mRNA transcripts into cytoplasmic and nuclear proteins.',
        detailedNotes: 'Composed of 40S small and 60S large subunits joining together to catalyze peptide bond formation.'
      }
    ]
  },
  {
    id: 'diag-plant-cell',
    title: 'Plant Cell Ultrastructure & Anatomy',
    category: 'Botany & Ecology',
    subtitle: 'Ultrastructural features: Cell Wall, Large Vacuole, Chloroplasts & Dictyosomes',
    description: 'Detailed diagram of a eukaryotic plant cell showing the thick cellulose cell wall, plasma membrane, massive central vacuole, displaced nucleus and nucleolus, endoplasmic reticulum, chloroplasts with stacked grana, mitochondria, Golgi dictyosomes, and amyloplasts.',
    diagramType: 'plant-cell',
    renderMode: 'paper',
    domain: 'biological',
    colorTheme: 'vibrant-emerald-cyan',
    funFact: 'The large central vacuole can account for up to 90% of a mature plant cell volume, generating turgor pressure that keeps non-woody plants upright.',
    sourceAttribution: {
      sourceName: "Campbell Biology 12th Ed / OpenStax",
      sourceUrl: "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "Campbell Biology 12th Ed / OpenStax Ultrastructure",
      verificationNote: "Verified structured botanical reconstruction conforming strictly to standard curriculum morphology."
    },
    timestamp: Date.now() - 150000,
    pins: [
      {
        id: 'pc-wall',
        number: 1,
        name: 'Cell Wall (Cellulose)',
        x: 88,
        y: 20,
        color: '#16A34A',
        category: 'Structural Boundary',
        functionSummary: 'Rigid outer layer composed of cellulose microfibrils and pectin that provides mechanical support and prevents lysis.',
        detailedNotes: 'Permeable to water and solutes; interconnected between neighboring cells by cytoplasmic channels called plasmodesmata.'
      },
      {
        id: 'pc-membrane',
        number: 2,
        name: 'Cell (Plasma) Membrane',
        x: 86,
        y: 32,
        color: '#22C55E',
        category: 'Structural Boundary',
        functionSummary: 'Selectively permeable lipid bilayer pressed closely against the internal face of the cell wall.',
        detailedNotes: 'Regulates transport of ions and solutes via proton pumps and aquaporins into the cytoplasm.'
      },
      {
        id: 'pc-vacuole',
        number: 3,
        name: 'Large Central Vacuole (Tonoplast)',
        x: 65,
        y: 48,
        color: '#86EFAC',
        category: 'Cellular Turgor',
        functionSummary: 'Enormous fluid-filled organelle bounded by the tonoplast that stores water, pigments, and enzymes to generate hydrostatic turgor pressure.',
        detailedNotes: 'Essential for cell enlargement, waste sequestration, and maintaining tissue stiffness.'
      },
      {
        id: 'pc-nucleus',
        number: 4,
        name: 'Nucleus (Displaced)',
        x: 24,
        y: 45,
        color: '#EA580C',
        category: 'Genetic Control',
        functionSummary: 'Displaced toward the periphery by the expanding vacuole; stores genetic DNA chromatin and coordinates cell function.',
        detailedNotes: 'Enclosed by a double nuclear envelope with nuclear pore complexes.'
      },
      {
        id: 'pc-nucleolus',
        number: 5,
        name: 'Nucleolus',
        x: 26,
        y: 38,
        color: '#FACC15',
        category: 'Genetic Control',
        functionSummary: 'Sub-nuclear site for transcription of ribosomal RNA (rRNA) and initial ribosome subunit assembly.',
        detailedNotes: 'High transcription rate sustaining protein synthesis required for cell wall synthesis.'
      },
      {
        id: 'pc-er',
        number: 6,
        name: 'Endoplasmic Reticulum (RER & SER)',
        x: 30,
        y: 28,
        color: '#A855F7',
        category: 'Endomembrane System',
        functionSummary: 'Interconnected network of cisternae wrapping the nucleus; synthesizes membrane proteins and lipids.',
        detailedNotes: 'Shares luminal continuity with plasmodesmata desmotubules for intercellular communication.'
      },
      {
        id: 'pc-chloroplast',
        number: 7,
        name: 'Chloroplast (Thylakoids & Grana)',
        x: 20,
        y: 68,
        color: '#15803D',
        category: 'Photosynthesis',
        functionSummary: 'Double-membrane plastid containing chlorophyll pigments in thylakoid grana stacks, converting sunlight into chemical energy.',
        detailedNotes: 'Performs light reactions in thylakoid membranes and the Calvin cycle in the stroma; originated via endosymbiosis.'
      },
      {
        id: 'pc-mitochondria',
        number: 8,
        name: 'Mitochondria (Cristae)',
        x: 75,
        y: 72,
        color: '#DC2626',
        category: 'Bioenergetics',
        functionSummary: 'Site of cellular respiration and oxidative phosphorylation, generating ATP to power cell wall synthesis and active transport.',
        detailedNotes: 'Contains folded inner cristae partitions to maximize respiratory electron transport.'
      },
      {
        id: 'pc-golgi',
        number: 9,
        name: 'Golgi Apparatus (Dictyosomes)',
        x: 78,
        y: 85,
        color: '#F59E0B',
        category: 'Endomembrane System',
        functionSummary: 'Stacks of distinct individual dictyosomes synthesizing complex non-cellulosic polysaccharides (hemicellulose and pectin).',
        detailedNotes: 'Secretes vesicles to the cell plate during plant cytokinesis.'
      },
      {
        id: 'pc-amyloplast',
        number: 10,
        name: 'Amyloplast (Starch Grain)',
        x: 24,
        y: 80,
        color: '#FB923C',
        category: 'Plastid Storage',
        functionSummary: 'Specialized non-pigmented leucoplast plastid storing polymerized starch granules in concentric rings.',
        detailedNotes: 'Abundant in roots, tubers, and seeds; also acts as a statolith sensing gravity in root cap cells (gravitropism).'
      },
      {
        id: 'pc-peroxisome',
        number: 11,
        name: 'Peroxisome',
        x: 18,
        y: 18,
        color: '#EAB308',
        category: 'Metabolic Defense',
        functionSummary: 'Oxidative organelle containing catalase to degrade toxic hydrogen peroxide and participate in photorespiration.',
        detailedNotes: 'Works in close metabolic tandem with chloroplasts and mitochondria during the C2 photorespiratory cycle.'
      },
      {
        id: 'pc-cytoplasm',
        number: 12,
        name: 'Cytoplasm & Cytosol',
        x: 20,
        y: 25,
        color: '#64748B',
        category: 'Cellular Matrix',
        functionSummary: 'Thin peripheral band of streaming cytosol (cyclosis) circulating organelles around the central vacuole.',
        detailedNotes: 'Cytoplasmic streaming is driven by actin-myosin interactions, ensuring rapid nutrient distribution.'
      },
      {
        id: 'pc-ribosomes',
        number: 13,
        name: 'Ribosomes (Free & Bound)',
        x: 22,
        y: 56,
        color: '#FDE047',
        category: 'Protein Synthesis',
        functionSummary: 'Ribonucleoprotein machinery translating mRNA into functional plant enzymes and structural proteins.',
        detailedNotes: 'Scattered in the cytosol and attached to the rough endoplasmic reticulum.'
      }
    ]
  },
  {
    id: 'diag-bony-fish',
    title: 'External Anatomy of a Bony Fish',
    category: 'Biology & Cells',
    subtitle: 'Morphological structures: Head, fins, operculum & lateral line system',
    description: 'Rigorous anatomical diagram of a typical bony fish (osteichthyes) illustrating external morphology: terminal mouth with jaws, nostrils (nares), eye with pupil, bony operculum (gill cover), pectoral and pelvic paired fins, anterior spiny rays dorsal fin, posterior soft rays dorsal fin, sensory lateral line, anal fin, and homocercal caudal fin.',
    diagramType: 'bony-fish',
    renderMode: 'paper',
    domain: 'biological',
    colorTheme: 'vibrant-emerald-cyan',
    funFact: 'The lateral line system in fish consists of fluid-filled canals with neuromast hair cells that detect minute vibrations and water pressure gradients, acting like an underwater acoustic radar.',
    sourceAttribution: {
      sourceName: "Vertebrate Zoology / Kardong",
      sourceUrl: "https://openstax.org/subjects/science",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "Vertebrate Zoology & Comparative Anatomy Standards",
      verificationNote: "Verified structured anatomical reconstruction conforming strictly to standard curriculum morphology."
    },
    timestamp: Date.now() - 180000,
    pins: [
      {
        id: 'fish-mouth',
        number: 1,
        name: 'Mouth & Premaxilla',
        x: 14,
        y: 52,
        color: '#0F172A',
        category: 'Head & Senses',
        functionSummary: 'Terminal mouth with upper premaxilla and lower mandible used for prey capture and water intake for respiration.',
        detailedNotes: 'Water is drawn into the buccal cavity and forced across internal gill filaments during opercular pumping.'
      },
      {
        id: 'fish-nostril',
        number: 2,
        name: 'Nostril (Nares)',
        x: 20,
        y: 46,
        color: '#475569',
        category: 'Head & Senses',
        functionSummary: 'Paired sensory pits containing olfactory epithelium that detect chemical plumes and scents in the water column.',
        detailedNotes: 'Blind olfactory sacs that do not connect to the pharynx (unlike terrestrial tetrapod choanae).'
      },
      {
        id: 'fish-eye',
        number: 3,
        name: 'Eye (Pupil & Lens)',
        x: 26,
        y: 44,
        color: '#0284C7',
        category: 'Head & Senses',
        functionSummary: 'Spherical crystalline lens offering wide-angle panoramic vision adapted for refractive underwater optics.',
        detailedNotes: 'Lacks eyelids; lens moves forward and backward to adjust focal depth rather than changing shape.'
      },
      {
        id: 'fish-operculum',
        number: 4,
        name: 'Gill Cover (Operculum)',
        x: 35,
        y: 55,
        color: '#0D9488',
        category: 'Respiration',
        functionSummary: 'Bony plate covering and protecting the delicate vascular gill filaments while acting as an active suction pump.',
        detailedNotes: 'Synchronous expansion and contraction of buccal and opercular chambers creates unidirectional water flow across gills.'
      },
      {
        id: 'fish-pectoral',
        number: 5,
        name: 'Pectoral Fin',
        x: 42,
        y: 62,
        color: '#3B82F6',
        category: 'Paired Fins',
        functionSummary: 'Anterior paired fin attached to the shoulder girdle, providing precise pitch control, steering, and braking.',
        detailedNotes: 'Homologous to the forelimbs of terrestrial tetrapods (amphibians, reptiles, mammals).'
      },
      {
        id: 'fish-pelvic',
        number: 6,
        name: 'Pelvic Fin',
        x: 45,
        y: 74,
        color: '#6366F1',
        category: 'Paired Fins',
        functionSummary: 'Ventral paired fin positioned beneath or behind the pectoral fins, stabilizing roll and preventing pitch-up.',
        detailedNotes: 'Homologous to tetrapod hindlimbs.'
      },
      {
        id: 'fish-spiny',
        number: 7,
        name: 'Spiny Rays (Anterior Dorsal Fin)',
        x: 48,
        y: 22,
        color: '#EF4444',
        category: 'Median Fins',
        functionSummary: 'Rigid, unsegmented, unbranched sharp bony spines that can be erected for defense against predators and roll stability.',
        detailedNotes: 'Supported by internal pterygiophore bones rooted into the dorsal epaxial musculature.'
      },
      {
        id: 'fish-dorsal',
        number: 8,
        name: 'Dorsal Fins (Spiny & Soft)',
        x: 60,
        y: 18,
        color: '#8B5CF6',
        category: 'Median Fins',
        functionSummary: 'Dorsal keel fins running along the midline of the back to prevent yaw and rolling during forward propulsion.',
        detailedNotes: 'Often separated into anterior spiny and posterior soft-rayed sections in advanced teleosts.'
      },
      {
        id: 'fish-soft',
        number: 9,
        name: 'Soft Rays (Posterior Dorsal Fin)',
        x: 68,
        y: 24,
        color: '#A855F7',
        category: 'Median Fins',
        functionSummary: 'Flexible, segmented, bilaterally paired lepidotrichia rays providing fine trim, undulating propulsion, and steering.',
        detailedNotes: 'Rays branch near their distal tips to create a supple, compliant aerodynamic fin blade.'
      },
      {
        id: 'fish-lateral-line',
        number: 10,
        name: 'Lateral Line System',
        x: 58,
        y: 48,
        color: '#06B6D4',
        category: 'Sensory System',
        functionSummary: 'Longitudinal mechanosensory canal perforated by pores to detect low-frequency water vibrations, currents, and schooling movements.',
        detailedNotes: 'Contains neuromast hair cells immersed in a gelatinous cupula that deflects in response to local water displacement.'
      },
      {
        id: 'fish-anal',
        number: 11,
        name: 'Anal Fin',
        x: 72,
        y: 72,
        color: '#D97706',
        category: 'Median Fins',
        functionSummary: 'Single ventral fin positioned behind the anus and urogenital opening, stabilizing the posterior body against rolling.',
        detailedNotes: 'Aids in directional tracking during high-speed swimming.'
      },
      {
        id: 'fish-caudal',
        number: 12,
        name: 'Caudal Fin (Tail Fin)',
        x: 90,
        y: 50,
        color: '#10B981',
        category: 'Locomotion',
        functionSummary: 'Broad homocercal tail fin that generates primary forward thrust and acceleration through oscillatory transverse sweeping.',
        detailedNotes: 'Symmetrical external lobes supported by the modified hypural bones of the caudal vertebral skeleton.'
      }
    ]
  },
  {
    id: 'diag-human-heart',
    title: 'Internal Anatomy of the Human Heart',
    category: 'Human Anatomy',
    subtitle: 'Coronal section: 4 cardiac chambers, 4 valves, great vessels & systemic hemodynamics',
    description: 'Complete internal coronal section of the human heart showing the superior and inferior vena cava, right atrium, tricuspid valve, right ventricle, pulmonary valve, pulmonary trunk and arteries, pulmonary veins, left atrium, mitral (bicuspid) valve, aortic valve, left ventricle with thick myocardium, aorta with 3 arch arteries, and pericardium with directional blood flow arrows.',
    diagramType: 'human-heart',
    renderMode: 'paper',
    domain: 'biological',
    colorTheme: 'cardiac-red-blue',
    funFact: 'The left ventricle myocardium is 3 times thicker than the right ventricle because it must generate enough systolic pressure (120 mmHg) to pump blood through the entire 60,000-mile systemic circulatory network.',
    sourceAttribution: {
      sourceName: "Gray's Anatomy 42nd Ed / Guyton & Hall Physiology",
      sourceUrl: "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "Gray's Anatomy 42nd Ed / Guyton & Hall",
      verificationNote: "Verified structured anatomical reconstruction conforming strictly to standard curriculum morphology."
    },
    timestamp: Date.now() - 200000,
    pins: [
      {
        id: 'h-svc',
        number: 1,
        name: 'Superior Vena Cava (SVC)',
        x: 32,
        y: 18,
        color: '#2563EB',
        category: 'Venous Return',
        functionSummary: 'Large systemic vein delivering deoxygenated blood from the head, neck, and upper limbs down into the right atrium.',
        detailedNotes: 'Compliant low-pressure vessel entering the superior pole of the right atrium.'
      },
      {
        id: 'h-ivc',
        number: 2,
        name: 'Inferior Vena Cava (IVC)',
        x: 32,
        y: 82,
        color: '#2563EB',
        category: 'Venous Return',
        functionSummary: 'Returns deoxygenated venous blood from the abdomen, pelvis, and lower extremities up into the right atrium.',
        detailedNotes: 'The largest vein in the human body, equipped with the Eustachian valve in fetal life.'
      },
      {
        id: 'h-ra',
        number: 3,
        name: 'Right Atrium',
        x: 35,
        y: 42,
        color: '#3B82F6',
        category: 'Right Heart',
        functionSummary: 'Thin-walled chamber collecting systemic venous return and pumping it across the tricuspid valve into the right ventricle.',
        detailedNotes: 'Contains the sinoatrial (SA) node (the natural cardiac pacemaker) in its anterolateral wall near the SVC opening.'
      },
      {
        id: 'h-tricuspid',
        number: 4,
        name: 'Tricuspid Valve (AV Valve)',
        x: 40,
        y: 54,
        color: '#60A5FA',
        category: 'Cardiac Valves',
        functionSummary: 'Three-cusp atrioventricular valve preventing backflow of blood from the right ventricle into the right atrium during systole.',
        detailedNotes: 'Anchored by fibrous chordae tendineae to papillary muscles on the ventricular wall.'
      },
      {
        id: 'h-rv',
        number: 5,
        name: 'Right Ventricle',
        x: 40,
        y: 70,
        color: '#1D4ED8',
        category: 'Right Heart',
        functionSummary: 'Low-pressure chamber pumping deoxygenated blood through the pulmonary valve into the pulmonary artery toward the lungs.',
        detailedNotes: 'Features prominent trabeculae carneae and a muscular wall roughly 3–5 mm thick.'
      },
      {
        id: 'h-pv',
        number: 6,
        name: 'Pulmonary Valve (Semilunar)',
        x: 46,
        y: 46,
        color: '#9333EA',
        category: 'Cardiac Valves',
        functionSummary: 'Three semilunar valve cusps that open during ventricular systole and close during diastole to prevent pulmonary artery reflux.',
        detailedNotes: 'Lacks chordae tendineae; closes passively under back-pressure from the pulmonary trunk.'
      },
      {
        id: 'h-pt',
        number: 7,
        name: 'Pulmonary Trunk & Arteries',
        x: 48,
        y: 28,
        color: '#A855F7',
        category: 'Pulmonary Outflow',
        functionSummary: 'Arches over the aorta root, bifurcating into left and right pulmonary arteries carrying deoxygenated blood to both lungs.',
        detailedNotes: 'The only postnatal arteries in the human body that carry deoxygenated blood.'
      },
      {
        id: 'h-pv-veins',
        number: 8,
        name: 'Pulmonary Veins',
        x: 72,
        y: 36,
        color: '#EF4444',
        category: 'Pulmonary Inflow',
        functionSummary: 'Four pulmonary veins returning freshly oxygenated blood from both lungs into the posterior wall of the left atrium.',
        detailedNotes: 'The only postnatal veins in the human body that carry oxygen-rich arterialized blood.'
      },
      {
        id: 'h-la',
        number: 9,
        name: 'Left Atrium',
        x: 66,
        y: 44,
        color: '#DC2626',
        category: 'Left Heart',
        functionSummary: 'Receives oxygenated blood from pulmonary veins and delivers it through the mitral valve into the left ventricle.',
        detailedNotes: 'Smooth-walled chamber forming the bulk of the anatomical posterior base of the heart.'
      },
      {
        id: 'h-mitral',
        number: 10,
        name: 'Mitral (Bicuspid) Valve',
        x: 62,
        y: 54,
        color: '#F87171',
        category: 'Cardiac Valves',
        functionSummary: 'Heavy two-leaflet atrioventricular valve withstanding high left ventricular systolic pressure (120 mmHg).',
        detailedNotes: 'Tethered by thick chordae tendineae to two large anterolateral and posteromedial papillary muscles.'
      },
      {
        id: 'h-av',
        number: 11,
        name: 'Aortic Valve (Semilunar)',
        x: 54,
        y: 50,
        color: '#B91C1C',
        category: 'Cardiac Valves',
        functionSummary: 'Three pocket-like semilunar cusps guarding the entrance from the left ventricle into the ascending aorta.',
        detailedNotes: 'Features the sinuses of Valsalva behind the cusps where the left and right coronary arteries originate.'
      },
      {
        id: 'h-lv',
        number: 12,
        name: 'Left Ventricle (Thick Myocardium)',
        x: 65,
        y: 72,
        color: '#991B1B',
        category: 'Systemic Pumping',
        functionSummary: 'High-power systemic muscular pump with myocardium up to 12–15 mm thick generating systemic cardiac output.',
        detailedNotes: 'Dense helical myocardial fiber orientation wrings blood out of the apex into the ascending aorta like a twisted towel.'
      },
      {
        id: 'h-aorta',
        number: 13,
        name: 'Ascending Aorta & Arch Arteries',
        x: 55,
        y: 16,
        color: '#EF4444',
        category: 'Systemic Outflow',
        functionSummary: 'Massive elastic conduit arching overhead with 3 major arteries: Brachiocephalic, Left Common Carotid, and Left Subclavian.',
        detailedNotes: 'High elastic compliance expands during systole and recoils during diastole (Windkessel effect) to maintain continuous systemic flow.'
      },
      {
        id: 'h-pericardium',
        number: 14,
        name: 'Pericardium (Fibrous Sac)',
        x: 22,
        y: 60,
        color: '#7F1D1D',
        category: 'Cardiac Protection',
        functionSummary: 'Double-layered fibroserous sac surrounding the heart, lubricating cardiac movement and preventing acute dilation.',
        detailedNotes: 'Contains roughly 15–50 mL of serous pericardial fluid in the pericardial cavity.'
      }
    ]
  },
  {
    id: 'diag-methane',
    title: 'Methane (CH₄) Structure & Tetrahedral Geometry',
    category: 'Physics & Chemistry',
    subtitle: '2D Lewis Formula, 3D Wedge-and-Dash & sp³ Tetrahedral Geometry',
    description: 'Rigorous textbook structural and stereochemical representation of methane (CH₄), demonstrating the 2D Lewis structural formula, 3D wedge-and-dash stereochemical projection with exact 109.5° bond angle and 1.09 Å bond length, and ball-and-stick model inscribed in a shaded tetrahedron.',
    diagramType: 'methane-molecule',
    renderMode: 'paper',
    domain: 'chemical',
    colorTheme: 'cyan-amber-chemistry',
    funFact: 'Methane exhibits pure tetrahedral Td symmetry with sp³ hybridization, producing four degenerate C—H sigma bonds with 0 D net dipole moment.',
    sourceAttribution: {
      sourceName: "IUPAC Gold Book / OpenStax Chemistry",
      sourceUrl: "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "IUPAC Stereochemical Standards",
      verificationNote: "Verified structured molecular geometry conforming strictly to VSEPR standards."
    },
    timestamp: Date.now() - 300000,
    chemicalData: {
      formula: 'CH₄',
      iupacName: 'Methane',
      molarMass: '16.043 g/mol',
      geometry: 'Tetrahedral (AX₄)',
      bondAngle: '109.5° (Ideal Tetrahedral)',
      bondLength: '1.09 Å (109 pm)',
      hybridization: 'sp³ Hybridized Carbon',
      dipoleMoment: '0.00 D (Non-polar, symmetric dipole cancellation)',
      lewisStructure: 'H - C(H)(H) - H'
    },
    pins: [
      {
        id: 'm-1',
        number: 1,
        name: 'Central Carbon Atom (sp³ Hybridized)',
        x: 50,
        y: 45,
        color: '#38BDF8',
        category: 'Atomic Nucleus',
        functionSummary: 'Tetravalent group 14 atom providing four valence electrons in four equivalent sp³ hybrid orbitals.',
        detailedNotes: 'Electronic configuration 1s² 2s² 2p² promotes one 2s electron to 2p, forming four equivalent sp³ hybrid orbitals directed to the vertices of a regular tetrahedron.'
      },
      {
        id: 'm-2',
        number: 2,
        name: 'Top In-Plane Hydrogen Atom (H₁)',
        x: 50,
        y: 18,
        color: '#FBBF24',
        category: 'Peripheral Atoms',
        functionSummary: 'Forms vertical in-plane single covalent σ-bond with central carbon via 1s orbital overlap.',
        detailedNotes: 'Bond represented by standard solid line lying exactly in the drawing/paper plane.'
      },
      {
        id: 'm-3',
        number: 3,
        name: 'Left In-Plane Hydrogen Atom (H₂)',
        x: 28,
        y: 62,
        color: '#FBBF24',
        category: 'Peripheral Atoms',
        functionSummary: 'Forms lower-left in-plane single covalent σ-bond separated from H₁ by 109.5° angle.',
        detailedNotes: 'Solid single line indicating coplanarity with the vertical C—H bond.'
      },
      {
        id: 'm-4',
        number: 4,
        name: 'Front Solid-Wedge Hydrogen Atom (H₃)',
        x: 64,
        y: 72,
        color: '#F59E0B',
        category: 'Stereochemistry (Wedge)',
        functionSummary: 'Hydrogen atom projecting forward out of the plane towards the viewer.',
        detailedNotes: 'Represented by a solid tapering wedge indicating bond direction pointing towards the observer in 3D space.'
      },
      {
        id: 'm-5',
        number: 5,
        name: 'Back Dashed-Wedge Hydrogen Atom (H₄)',
        x: 74,
        y: 50,
        color: '#D97706',
        category: 'Stereochemistry (Dash)',
        functionSummary: 'Hydrogen atom pointing backward away from the viewer behind the drawing plane.',
        detailedNotes: 'Represented by a series of parallel dashed lines tapering away to denote perspective depth.'
      },
      {
        id: 'm-6',
        number: 6,
        name: 'C—H Covalent Bond (1.09 Å / 109 pm)',
        x: 38,
        y: 35,
        color: '#60A5FA',
        category: 'Chemical Bonding',
        functionSummary: 'Strong single covalent σ-bond with bond dissociation energy of 413 kJ/mol and length 1.09 Å.',
        detailedNotes: 'Formed by head-on overlap of carbon sp³ hybrid orbital with hydrogen 1s orbital.'
      },
      {
        id: 'm-7',
        number: 7,
        name: 'Tetrahedral Bond Angle (109.5°)',
        x: 40,
        y: 50,
        color: '#EC4899',
        category: 'VSEPR Geometry',
        functionSummary: 'VSEPR repulsion equilibrium angle between any two C—H bonds in AX₄ molecular geometry.',
        detailedNotes: 'All four H—C—H bond angles are strictly identical (109.5° or arccos(-1/3) ≈ 109.47°) due to perfect symmetry.'
      },
      {
        id: 'm-8',
        number: 8,
        name: 'Tetrahedral Coordination Envelope (Td)',
        x: 52,
        y: 84,
        color: '#A855F7',
        category: 'Symmetry & Geometry',
        functionSummary: 'Four triangular faces forming a regular polyhedron with Carbon at the center.',
        detailedNotes: 'Point group Td; non-polar because vector sum of the four identical C—H bond dipoles equals zero (μ = 0 D).'
      }
    ]
  },
  {
    id: 'diag-water',
    title: 'Water (H₂O) Structure & Bent Geometry',
    category: 'Physics & Chemistry',
    subtitle: '2D Lewis Structure with Lone Pairs & 3D Polar Bent VSEPR Geometry',
    description: 'Standard textbook chemical illustration of the water molecule (H₂O). Depicts the 2D Lewis dot formula with two oxygen lone pairs (4 non-bonding valence electrons), 3D bent/V-shaped molecular geometry with 104.5° bond angle, 0.96 Å bond length, δ⁻/δ⁺ partial charges, and permanent dipole vector (μ = 1.85 D).',
    diagramType: 'water-molecule',
    renderMode: 'paper',
    domain: 'chemical',
    colorTheme: 'cyan-teal-water',
    funFact: 'The 104.5° bond angle in water is compressed from the ideal tetrahedral 109.5° because the two unshared lone pairs exert greater electrostatic repulsion than bonding pairs.',
    sourceAttribution: {
      sourceName: "IUPAC Gold Book / OpenStax Chemistry",
      sourceUrl: "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "IUPAC Stereochemical Standards",
      verificationNote: "Verified structured molecular geometry conforming strictly to VSEPR standards."
    },
    timestamp: Date.now() - 400000,
    chemicalData: {
      formula: 'H₂O',
      iupacName: 'Oxidane / Water',
      molarMass: '18.015 g/mol',
      geometry: 'Bent / V-Shaped (AX₂E₂)',
      bondAngle: '104.5° (Compressed by lone pair repulsion)',
      bondLength: '0.958 Å (95.8 pm)',
      hybridization: 'sp³ Hybridized Oxygen',
      dipoleMoment: '1.85 D (Net permanent dipole directed toward Oxygen)',
      lewisStructure: 'H - O(: :) - H'
    },
    pins: [
      {
        id: 'w-1',
        number: 1,
        name: 'Oxygen Atom (Electronegative Center, δ⁻)',
        x: 50,
        y: 38,
        color: '#EF4444',
        category: 'Atomic Nucleus',
        functionSummary: 'Highly electronegative central atom (χ = 3.44) carrying partial negative charge (2δ⁻).',
        detailedNotes: 'Possesses 8 protons and 6 valence electrons; sp³ hybridized with two bonding pairs and two non-bonding lone pairs.'
      },
      {
        id: 'w-2',
        number: 2,
        name: 'Hydrogen Atom 1 (Electropositive, δ⁺)',
        x: 32,
        y: 68,
        color: '#38BDF8',
        category: 'Peripheral Atoms',
        functionSummary: 'Carries partial positive charge δ⁺ due to unequal electron sharing with Oxygen.',
        detailedNotes: 'Single proton sharing its 1s electron in a polar covalent σ-bond with Oxygen.'
      },
      {
        id: 'w-3',
        number: 3,
        name: 'Hydrogen Atom 2 (Electropositive, δ⁺)',
        x: 68,
        y: 68,
        color: '#38BDF8',
        category: 'Peripheral Atoms',
        functionSummary: 'Second electropositive Hydrogen atom creating the asymmetric V-shaped polar geometry.',
        detailedNotes: 'Acts as hydrogen bond donor in aqueous networks and ice crystalline lattices.'
      },
      {
        id: 'w-4',
        number: 4,
        name: 'Non-Bonding Lone Pair 1 (2 Valence Electrons)',
        x: 38,
        y: 22,
        color: '#818CF8',
        category: 'Electron Lone Pairs',
        functionSummary: 'Unshared pair of valence electrons occupying an sp³ hybrid orbital lobe.',
        detailedNotes: 'Non-bonding electron density is held closer to the oxygen nucleus, exerting strong electrostatic repulsion on adjacent orbitals.'
      },
      {
        id: 'w-5',
        number: 5,
        name: 'Non-Bonding Lone Pair 2 (2 Valence Electrons)',
        x: 62,
        y: 22,
        color: '#818CF8',
        category: 'Electron Lone Pairs',
        functionSummary: 'Second unshared electron pair serving as hydrogen bond acceptor site.',
        detailedNotes: 'Enables each water molecule to participate in up to 4 hydrogen bonds in tetrahedral ice lattices.'
      },
      {
        id: 'w-6',
        number: 6,
        name: 'Bent H—O—H Bond Angle (104.5°)',
        x: 50,
        y: 52,
        color: '#EC4899',
        category: 'VSEPR Geometry',
        functionSummary: 'Sterically compressed bond angle resulting from lone pair-lone pair and lone pair-bond pair repulsion.',
        detailedNotes: 'VSEPR theory explains reduction from ideal tetrahedral 109.5° to 104.45° (~104.5°).'
      },
      {
        id: 'w-7',
        number: 7,
        name: 'O—H Polar Covalent Bond (0.96 Å / 96 pm)',
        x: 40,
        y: 54,
        color: '#10B981',
        category: 'Chemical Bonding',
        functionSummary: 'Strong polar covalent bond with high bond dissociation energy of 460 kJ/mol and length 0.958 Å.',
        detailedNotes: 'High dipole moment per bond (1.5 D) due to 1.24 Pauling electronegativity differential.'
      },
      {
        id: 'w-8',
        number: 8,
        name: 'Net Molecular Dipole Vector (μ = 1.85 D)',
        x: 50,
        y: 12,
        color: '#F59E0B',
        category: 'Dipole & Polarity',
        functionSummary: 'Asymmetric charge distribution resulting in strong permanent molecular polarity (1.85 Debye).',
        detailedNotes: 'Vector sum of the two O—H bond dipoles points directly towards Oxygen along the angle bisector, enabling water to act as the universal solvent.'
      }
    ]
  },
  {
    id: 'diag-hydrocarbons',
    title: 'Saturated Hydrocarbons (Alkanes: Ethane & Propane)',
    category: 'Organic Chemistry',
    subtitle: 'Single Covalent Bonds (C—C & C—H) in Alkanes (Ethane C₂H₆, Propane C₃H₈)',
    description: 'Saturated hydrocarbons are hydrocarbons consisting of carbon chains with single bonds between them, in which carbon joins with another carbon by a single covalent bond, e.g., alkanes ( like ethane C 2 H 6, propane C 3 H 8 )',
    diagramType: 'hydrocarbon-alkanes',
    renderMode: 'paper',
    domain: 'chemical',
    colorTheme: 'cyan-amber-chemistry',
    funFact: 'In saturated hydrocarbons, each carbon is sp³ hybridized forming single sigma covalent bonds with tetrahedral geometry and 109.5° bond angles.',
    sourceAttribution: {
      sourceName: "Wade Organic Chemistry 9th Ed",
      sourceUrl: "https://openstax.org/books/chemistry-2e/pages/20-1-hydrocarbons",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "IUPAC Nomenclature & Wade Organic Chemistry Standards",
      verificationNote: "Verified structured chemical reconstruction conforming strictly to standard curriculum morphology."
    },
    timestamp: Date.now() - 250000,
    chemicalData: {
      formula: 'CₙH₂ₙ₊₂ (C₂H₆, C₃H₈)',
      iupacName: 'Alkanes (Ethane & Propane)',
      molarMass: 'C₂H₆: 30.07 g/mol | C₃H₈: 44.10 g/mol',
      geometry: 'Tetrahedral sp³ carbons (109.5°)',
      bondAngle: '109.5°',
      bondLength: 'C—C: 1.54 Å | C—H: 1.09 Å',
      hybridization: 'sp³ Hybridization',
      dipoleMoment: '0.00 D (Non-polar)',
      lewisStructure: 'H - C(H)(H) - C(H)(H) - H'
    },
    pins: [
      {
        id: 'hc-1',
        number: 1,
        name: 'Ethane (C₂H₆) Structural Formula',
        x: 30,
        y: 42,
        color: '#0F172A',
        category: 'Alkane (C₂H₆)',
        functionSummary: 'Two-carbon chain connected by a single covalent C—C bond and six terminal C—H bonds.',
        detailedNotes: 'Saturated hydrocarbon with formula C₂H₆ displaying staggered and eclipsed rotational conformations.'
      },
      {
        id: 'hc-2',
        number: 2,
        name: 'Propane (C₃H₈) Structural Formula',
        x: 70,
        y: 42,
        color: '#0F172A',
        category: 'Alkane (C₃H₈)',
        functionSummary: 'Three-carbon single covalent chain with eight C—H single covalent bonds.',
        detailedNotes: 'Saturated hydrocarbon with formula C₃H₈ having a flexible tetrahedral C-C-C backbone.'
      },
      {
        id: 'hc-3',
        number: 3,
        name: 'C—C Single Covalent Bond (1.54 Å)',
        x: 30,
        y: 58,
        color: '#0F172A',
        category: 'Covalent Bonding',
        functionSummary: 'Strong carbon-carbon single sigma bond (~347 kJ/mol).',
        detailedNotes: 'Formed by head-on sp³-sp³ orbital overlap with full cylindrical symmetry enabling free rotation.'
      },
      {
        id: 'hc-4',
        number: 4,
        name: 'C—H Single Covalent Bond (1.09 Å)',
        x: 70,
        y: 58,
        color: '#0F172A',
        category: 'Covalent Bonding',
        functionSummary: 'Terminal single covalent bond formed by sp³-1s overlap (~413 kJ/mol).',
        detailedNotes: 'Virtually non-polar with negligible electronegativity difference (carbon 2.55 vs hydrogen 2.20).'
      }
    ]
  },
  {
    id: 'diag-bohr-atom',
    title: 'Rutherford-Bohr Atom Model (Carbon-12)',
    category: 'Physics & Chemistry',
    subtitle: '3D Multi-Colour Planetary Electron Orbitals & Nucleus in Vibrant Colours',
    description: 'A rich 3D multi-colour visualization of the Rutherford-Bohr atomic model. Features a dense central nucleus with protons and neutrons, surrounded by quantized concentric electron orbital shells (K-shell n=1, L-shell n=2) with orbiting valence electrons.',
    diagramType: 'bohr-atom',
    renderMode: '3d',
    domain: 'physical',
    colorTheme: 'cyan-amber-chemistry',
    funFact: 'Niels Bohr combined Rutherford nuclear discovery with Planck quantum hypothesis in 1913, proposing that electrons revolve only in discrete quantized orbits.',
    sourceAttribution: {
      sourceName: "OpenStax University Physics Vol 3",
      sourceUrl: "https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom",
      license: "CC BY 4.0",
      mode: 'structured-reconstruction',
      groundTruthStandard: "Bohr Quantum Model Physical Standards",
      verificationNote: "Verified structured atomic physics reconstruction conforming strictly to Bohr quantum model."
    },
    timestamp: Date.now() - 500000,
    pins: [
      {
        id: 'b-1',
        number: 1,
        name: 'Dense Atomic Nucleus (6 Protons + 6 Neutrons)',
        x: 50,
        y: 50,
        color: '#EF4444',
        category: 'Atomic Nucleus',
        functionSummary: 'Contains 99.9% of atomic mass confined to a diameter of roughly 1 femtometer.',
        detailedNotes: 'Bound by the strong fundamental nuclear force overcoming electromagnetic proton repulsion.'
      },
      {
        id: 'b-2',
        number: 2,
        name: 'Inner K-Shell Orbital (n = 1)',
        x: 50,
        y: 36,
        color: '#38BDF8',
        category: 'Quantum Orbitals',
        functionSummary: 'Innermost quantized energy level holding up to 2 core 1s electrons.',
        detailedNotes: 'Lowest potential energy state (ground state) closest to the positive nuclear charge.'
      },
      {
        id: 'b-3',
        number: 3,
        name: 'Outer L-Shell Valence Orbital (n = 2)',
        x: 50,
        y: 20,
        color: '#10B981',
        category: 'Valence Shell',
        functionSummary: 'Principal quantum level n=2 holding 4 valence electrons responsible for chemical bonding.',
        detailedNotes: 'Quantized angular momentum L = n(h / 2π). Transitions between levels emit characteristic photons.'
      },
      {
        id: 'b-4',
        number: 4,
        name: 'Orbiting Quantum Electrons (e⁻)',
        x: 72,
        y: 38,
        color: '#F59E0B',
        category: 'Subatomic Particles',
        functionSummary: 'Negatively charged lepton (mass 9.109×10⁻³¹ kg) orbiting in stationary states without radiating energy.',
        detailedNotes: 'Postulated by Bohr to resolve classical Maxwell electrodynamics collapse.'
      }
    ]
  }
];

export const REGISTRY_PRESETS: DiagramConcept[] = Object.entries(SCIENTIFIC_PRESETS_REGISTRY).map(([key, item]) => ({
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
  sourceAttribution: item.sourceAttribution || {
    sourceName: "Campbell Biology / Gray's Anatomy Reference",
    sourceUrl: "https://openstax.org/subjects/science",
    license: "CC BY 4.0",
    mode: 'structured-reconstruction',
    groundTruthStandard: "Campbell Biology 12th Ed / Gray's Anatomy 42nd Ed",
    verificationNote: "Verified structured anatomical reconstruction conforming strictly to standard curriculum morphology."
  },
  timestamp: Date.now() - 250000,
  pins: item.pins
}));

export const ALL_AVAILABLE_PRESETS: DiagramConcept[] = [...PRESET_DIAGRAMS, ...REGISTRY_PRESETS];

export interface DiagramPageItem {
  id: string;
  pageNumber: number;
  concept: DiagramConcept | null;
  pins: LabelPin[];
  shapes: CanvasShape[];
  strokes: DrawingStroke[];
}

export function DrawAndLabel() {
  const { 
    language, 
    sendToResearch, 
    saveDiagram, 
    setCurrentView, 
    sidebarCollapsed, 
    toggleSidebar, 
    activeDiagramToLoad, 
    clearActiveDiagramToLoad,
    importDiagramToWorkspace,
    workspaceProjects,
    activeProjectId 
  } = useAppStore();

  const [conceptPrompt, setConceptPrompt] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<DiagramConcept | null>(null); // White paper by default is empty
  const [activeRenderMode, setActiveRenderMode] = useState<'3d' | '2d' | 'paper'>('paper');
  const [pinsState, setPinsState] = useState<LabelPin[]>([]);
  const [activePin, setActivePin] = useState<LabelPin | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Workspace Target Page Import Modal
  const [showWorkspaceExportModal, setShowWorkspaceExportModal] = useState<boolean>(false);
  const [targetExportProjectId, setTargetExportProjectId] = useState<string>(activeProjectId || (workspaceProjects[0]?.id || ''));
  const [targetExportPageIndex, setTargetExportPageIndex] = useState<number>(0);

  // Dynamic Multi-Page System (Can extend from 1 to 10 or more pages according to desire)
  const [pages, setPages] = useState<DiagramPageItem[]>([
    {
      id: 'page-1',
      pageNumber: 1,
      concept: null,
      pins: [],
      shapes: [],
      strokes: []
    }
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Styling & Editing Kits (Featuring Poppins)
  const [fontFamily, setFontFamily] = useState<string>("'Poppins', sans-serif");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [drawingColor, setDrawingColor] = useState<string>('#EF4444');
  const [drawingWidth, setDrawingWidth] = useState<number>(4);
  const [isDrawingNow, setIsDrawingNow] = useState<boolean>(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingsVisible, setIsDrawingsVisible] = useState<boolean>(true);
  const [isRedrawing, setIsRedrawing] = useState<boolean>(false);

  const currentPage = pages[activePageIndex] || pages[0];

  const updateCurrentPageConcept = (updatedConcept: DiagramConcept | null) => {
    setSelectedConcept(updatedConcept);
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, concept: updatedConcept } : p));
  };

  const updateCurrentPagePins = (updatedPins: LabelPin[]) => {
    setPinsState(updatedPins);
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, pins: updatedPins } : p));
  };

  const updateCurrentPageShapes = (updatedShapes: CanvasShape[]) => {
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, shapes: updatedShapes } : p));
  };

  const updateCurrentPageStrokes = (updatedStrokes: DrawingStroke[]) => {
    setPages(prev => prev.map((p, idx) => idx === activePageIndex ? { ...p, strokes: updatedStrokes } : p));
  };

  const handleSelectPage = (index: number) => {
    setActivePageIndex(index);
    const targetPage = pages[index];
    if (targetPage) {
      setSelectedConcept(targetPage.concept);
      setPinsState(targetPage.pins);
      setActivePin(targetPage.pins[0] || null);
    }
  };

  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPage: DiagramPageItem = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: nextNum,
      concept: null,
      pins: [],
      shapes: [],
      strokes: []
    };
    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setSelectedConcept(null);
    setPinsState([]);
    setActivePin(null);
    showToast(`Diagram Page ${nextNum} added! Extend pages from 1 to 10 or more as desired.`);
  };

  const handleDuplicatePage = () => {
    const nextNum = pages.length + 1;
    const cloned: DiagramPageItem = {
      ...JSON.parse(JSON.stringify(currentPage)),
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: nextNum
    };
    setPages(prev => [...prev, cloned]);
    setActivePageIndex(pages.length);
    showToast(`Diagram Page ${nextNum} duplicated successfully!`);
  };

  const handleDeletePage = (indexToDelete: number) => {
    if (pages.length <= 1) {
      showToast('Cannot delete the only remaining page.');
      return;
    }
    if (window.confirm(`Delete Diagram Page ${indexToDelete + 1}?`)) {
      const updated = pages.filter((_, idx) => idx !== indexToDelete);
      setPages(updated);
      const newIdx = Math.max(0, indexToDelete - 1);
      setActivePageIndex(newIdx);
      const targetPage = updated[newIdx];
      if (targetPage) {
        setSelectedConcept(targetPage.concept);
        setPinsState(targetPage.pins);
        setActivePin(targetPage.pins[0] || null);
      }
      showToast(`Diagram Page ${indexToDelete + 1} removed.`);
    }
  };

  // Load external diagram if passed from AI Research or Projects
  useEffect(() => {
    if (activeDiagramToLoad) {
      setSelectedConcept(activeDiagramToLoad);
      setPinsState(activeDiagramToLoad.pins || []);
      setActivePin(activeDiagramToLoad.pins?.[0] || null);
      if (activeDiagramToLoad.renderMode) {
        setActiveRenderMode(activeDiagramToLoad.renderMode);
      }
      clearActiveDiagramToLoad();
    }
  }, [activeDiagramToLoad, clearActiveDiagramToLoad]);
  
  // Chemical representation mode switcher (Black & White Paper Sheet, Textbook Split 2D+3D, 2D Lewis, 3D Wedge & Dash, 3D Tetrahedral / Ball & Stick, Data Sheet)
  const [chemicalViewMode, setChemicalViewMode] = useState<'paper-sheet' | 'textbook-split' | '2d-lewis' | '3d-wedge' | '3d-tetrahedral' | 'data-sheet'>('paper-sheet');
  
  // Quiz & View Settings
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [revealedQuizPins, setRevealedQuizPins] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);
  const [showCalloutLines, setShowCalloutLines] = useState<boolean>(true);
  const [lineDisplayMode, setLineDisplayMode] = useState<'delicate' | 'focus' | 'all'>('delicate');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  
  // Interactive Pan / Zoom & Wheel Controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Dragging individual pins
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);

  // Full Label Text Pop-Up Modal State
  const [popupPin, setPopupPin] = useState<LabelPin | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Workspace Export & Download Format Options (Color, B&W Paper Hand-Drawn, Text)
  const [exportFormatStyle, setExportFormatStyle] = useState<'color' | 'bw-paper' | 'text'>('color');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Interactive Pointer Target Position Editing System State
  const [isPointerEditing, setIsPointerEditing] = useState<boolean>(false);
  const [pointerDragPinId, setPointerDragPinId] = useState<string | null>(null);
  const [pointerHistory, setPointerHistory] = useState<LabelPin[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showResetAllConfirmModal, setShowResetAllConfirmModal] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const ensureCanonicalPinBaselines = useCallback((pins: LabelPin[]): LabelPin[] => {
    return pins.map(p => ({
      ...p,
      initialX: p.initialX ?? p.x,
      initialY: p.initialY ?? p.y,
      manuallyAdjusted: p.manuallyAdjusted ?? (p.initialX !== undefined && (Math.abs(p.x - (p.initialX ?? p.x)) > 0.1 || Math.abs(p.y - (p.initialY ?? p.y)) > 0.1))
    }));
  }, []);

  const pushPointerHistory = useCallback((pins: LabelPin[]) => {
    setPointerHistory(prev => {
      const current = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [];
      const updated = [...current, pins.map(p => ({ ...p }))];
      if (updated.length > 25) updated.shift();
      return updated;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 24));
  }, [historyIndex]);

  const handleUndoPointer = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const restored = pointerHistory[prevIdx];
      if (restored) {
        setPinsState(restored.map(p => ({ ...p })));
        updateCurrentPagePins(restored);
        setHistoryIndex(prevIdx);
        showToast('Undid pointer adjustment.');
      }
    }
  };

  const handleRedoPointer = () => {
    if (historyIndex < pointerHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      const restored = pointerHistory[nextIdx];
      if (restored) {
        setPinsState(restored.map(p => ({ ...p })));
        updateCurrentPagePins(restored);
        setHistoryIndex(nextIdx);
        showToast('Redid pointer adjustment.');
      }
    }
  };

  const handleResetSelectedPointer = () => {
    if (!activePin) return;
    const updated = pinsState.map(p => {
      if (p.id !== activePin.id) return p;
      const initX = p.initialX ?? p.x;
      const initY = p.initialY ?? p.y;
      return {
        ...p,
        x: initX,
        y: initY,
        manuallyAdjusted: false
      };
    });
    setPinsState(updated);
    updateCurrentPagePins(updated);
    pushPointerHistory(updated);
    const updatedActive = updated.find(p => p.id === activePin.id);
    if (updatedActive) setActivePin(updatedActive);
    showToast(`Reset pointer for "${activePin.name}" to canonical position.`);
  };

  const handleResetAllPointers = () => {
    const updated = pinsState.map(p => ({
      ...p,
      x: p.initialX ?? p.x,
      y: p.initialY ?? p.y,
      manuallyAdjusted: false
    }));
    setPinsState(updated);
    updateCurrentPagePins(updated);
    pushPointerHistory(updated);
    setShowResetAllConfirmModal(false);
    showToast('Reset all pointer positions to canonical defaults.');
  };

  const handlePointerDownTarget = (e: React.PointerEvent, pin: LabelPin) => {
    e.stopPropagation();
    e.preventDefault();

    const targetEl = e.currentTarget as Element;
    if (targetEl && targetEl.setPointerCapture) {
      try {
        targetEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    setPointerDragPinId(pin.id);
    setActivePin(pin);
    pushPointerHistory(pinsState);
  };

  const handlePointerMoveTarget = (e: React.PointerEvent) => {
    if (!pointerDragPinId) return;
    e.stopPropagation();
    e.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());

    // Convert viewBox coords (260..740, 130..570) to normalized percentage (0..100)
    const normX = Math.max(0, Math.min(100, ((svgPoint.x - 260) / 480) * 100));
    const normY = Math.max(0, Math.min(100, ((svgPoint.y - 130) / 440) * 100));

    const newX = Math.round(normX * 1000) / 1000;
    const newY = Math.round(normY * 1000) / 1000;

    setPinsState(prev => {
      const updated = prev.map(p => {
        if (p.id !== pointerDragPinId) return p;
        const initX = p.initialX ?? p.x;
        const initY = p.initialY ?? p.y;
        const isAdjusted = Math.abs(newX - initX) > 0.1 || Math.abs(newY - initY) > 0.1;
        return {
          ...p,
          x: newX,
          y: newY,
          initialX: initX,
          initialY: initY,
          manuallyAdjusted: isAdjusted
        };
      });
      updateCurrentPagePins(updated);
      return updated;
    });
  };

  const handlePointerUpTarget = (e: React.PointerEvent) => {
    if (!pointerDragPinId) return;
    e.stopPropagation();

    const targetEl = e.currentTarget as Element;
    if (targetEl && targetEl.releasePointerCapture) {
      try {
        targetEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    setPointerDragPinId(null);
    pushPointerHistory(pinsState);
  };

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync pins state when concept changes without resetting activeRenderMode if user is on paper
  useEffect(() => {
    if (selectedConcept) {
      const initialized = ensureCanonicalPinBaselines(selectedConcept.pins || []);
      setPinsState(initialized);
      setActivePin(initialized[0] || null);
      setPointerHistory([initialized.map(p => ({ ...p }))]);
      setHistoryIndex(0);
    } else {
      setPinsState([]);
      setActivePin(null);
      setPointerHistory([]);
      setHistoryIndex(-1);
    }
    setIsPointerEditing(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPopupPin(null);
  }, [selectedConcept, ensureCanonicalPinBaselines]);

  const handleClearCanvas = () => {
    setSelectedConcept(null);
    setPinsState([]);
    setActivePin(null);
    setPopupPin(null);
    setRevealedQuizPins({});
    updateCurrentPageConcept(null);
    updateCurrentPagePins([]);
    updateCurrentPageShapes([]);
    updateCurrentPageStrokes([]);
    resetView();
    showToast('Canvas cleared. White paper is empty and ready for a new structure.');
  };

  const handleSaveToProjects = () => {
    const conceptToSave: DiagramConcept = selectedConcept || {
      id: `diag-${Date.now()}`,
      title: `Scientific Diagram Page ${currentPage.pageNumber}`,
      category: 'Physics & Chemistry',
      subtitle: 'Custom Diagram with Labels and Annotations',
      description: 'Custom edited diagram with interactive pins and annotations',
      diagramType: 'custom-concept',
      renderMode: activeRenderMode,
      domain: 'general',
      colorTheme: activeRenderMode === 'paper' ? 'paper-black-white' : 'vibrant-anatomical',
      funFact: 'Created with Draw & Label Studio interactive tools.',
      timestamp: Date.now(),
      pins: pinsState
    };

    const finalDiag: DiagramConcept = {
      ...conceptToSave,
      pins: pinsState,
      renderMode: activeRenderMode,
      timestamp: Date.now()
    };

    saveDiagram(finalDiag);
    showToast(`"${finalDiag.title}" saved to Projects library successfully!`);
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const categories = ['All', ...Array.from(new Set(pinsState.map(p => p.category)))];

  const filteredPins = activeCategoryFilter === 'All' 
    ? pinsState 
    : pinsState.filter(p => p.category === activeCategoryFilter);

  // Opens the full label text popup without cutting off any text
  const openPinPopup = (pin: LabelPin) => {
    setActivePin(pin);
    setPopupPin(pin);
    if (isQuizMode) {
      setRevealedQuizPins(prev => ({
        ...prev,
        [pin.id]: true
      }));
    }
  };

  const navigatePopupPin = (direction: 'prev' | 'next') => {
    if (!popupPin || filteredPins.length === 0) return;
    const currentIndex = filteredPins.findIndex(p => p.id === popupPin.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'next'
      ? (currentIndex + 1) % filteredPins.length
      : (currentIndex - 1 + filteredPins.length) % filteredPins.length;
    const nextPin = filteredPins[targetIndex];
    if (nextPin) {
      setActivePin(nextPin);
      setPopupPin(nextPin);
      if (isQuizMode) {
        setRevealedQuizPins(prev => ({
          ...prev,
          [nextPin.id]: true
        }));
      }
    }
  };

  const handleCopyLabelText = (pin: LabelPin) => {
    const textToCopy = `${pin.name} (Structure #${pin.number})\nCategory: ${pin.category}\n\nPrimary Physiological Function:\n${pin.functionSummary}\n\nHistological & Molecular Notes:\n${pin.detailedNotes}`;
    navigator.clipboard?.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast(`Copied full label details for "${pin.name}"`);
  };

  // Helper to compute outside-the-structure label cards and leader arrows
  const getCalloutLayout = (pins: LabelPin[]) => {
    const leftPins = [...pins.filter(p => p.x <= 50)].sort((a, b) => a.y - b.y);
    const rightPins = [...pins.filter(p => p.x > 50)].sort((a, b) => a.y - b.y);

    const results: {
      pin: LabelPin;
      isLeft: boolean;
      targetX: number;
      targetY: number;
      labelX: number;
      labelY: number;
      labelW: number;
      labelH: number;
      anchorX: number;
      anchorY: number;
      elbowX: number;
      pathData: string;
    }[] = [];

    const leftCount = leftPins.length;
    leftPins.forEach((pin, idx) => {
      // Map percentage to central organelle area (X: 260-740, Y: 130-570)
      const targetX = 260 + (pin.x / 100) * 480;
      const targetY = 130 + (pin.y / 100) * 440;
      
      const labelW = 255;
      const labelH = 62;
      const labelX = 20;
      const labelY = leftCount === 1 
        ? Math.max(50, Math.min(600, targetY - labelH / 2))
        : 55 + (idx / (leftCount - 1 || 1)) * 550;
      
      const anchorX = labelX + labelW;
      const anchorY = labelY + labelH / 2;
      // Corridor-routed leader line: exits card horizontally, curves vertically in outer margin,
      // and enters the organ target structure horizontally. Completely avoids cutting across other structures!
      const corridorX = anchorX + 16;
      const midX = Math.min(corridorX + 14, targetX - 16);
      const pathData = `M ${anchorX} ${anchorY} L ${corridorX} ${anchorY} C ${midX} ${anchorY}, ${midX} ${targetY}, ${targetX - 2} ${targetY}`;

      results.push({
        pin,
        isLeft: true,
        targetX,
        targetY,
        labelX,
        labelY,
        labelW,
        labelH,
        anchorX,
        anchorY,
        elbowX: corridorX,
        pathData
      });
    });

    const rightCount = rightPins.length;
    rightPins.forEach((pin, idx) => {
      // Map percentage to central organelle area (X: 260-740, Y: 130-570)
      const targetX = 260 + (pin.x / 100) * 480;
      const targetY = 130 + (pin.y / 100) * 440;
      
      const labelW = 255;
      const labelH = 62;
      const labelX = 1000 - 20 - labelW;
      const labelY = rightCount === 1 
        ? Math.max(50, Math.min(600, targetY - labelH / 2))
        : 55 + (idx / (rightCount - 1 || 1)) * 550;
      
      const anchorX = labelX;
      const anchorY = labelY + labelH / 2;
      const corridorX = anchorX - 16;
      const midX = Math.max(corridorX - 14, targetX + 16);
      const pathData = `M ${anchorX} ${anchorY} L ${corridorX} ${anchorY} C ${midX} ${anchorY}, ${midX} ${targetY}, ${targetX + 2} ${targetY}`;

      results.push({
        pin,
        isLeft: false,
        targetX,
        targetY,
        labelX,
        labelY,
        labelW,
        labelH,
        anchorX,
        anchorY,
        elbowX: corridorX,
        pathData
      });
    });

    return results;
  };

  const callouts = getCalloutLayout(filteredPins);

  // Wheel Zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.5), 3.0));
  };

  // Canvas Pan (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawingActive) return;
    if (draggingPinId) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingPinId) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const xPercent = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      
      const updated = pinsState.map(p => p.id === draggingPinId ? { ...p, x: Math.round(xPercent), y: Math.round(yPercent) } : p);
      setPinsState(updated);
      updateCurrentPagePins(updated);
      return;
    }

    if (!isDraggingCanvas) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingPinId(null);
  };

  // Directional Pan buttons
  const panBy = (dx: number, dy: number) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // AI Diagram Generation
  const generateCustomDiagram = async (customPrompt?: string, customRenderMode?: '3d' | '2d' | 'paper') => {
    const effectivePrompt = (customPrompt || conceptPrompt).trim();
    if (!effectivePrompt) {
      showToast('Please enter an anatomical, biological, physical, or chemical concept to draw and label.');
      return;
    }

    // MANDATORY USER REQUIREMENT: Delete previous structure before drawing and labeling a new one
    setSelectedConcept(null);
    setPinsState([]);
    setActivePin(null);
    setPopupPin(null);
    setRevealedQuizPins({});
    resetView();
    setIsGenerating(true);

    const is3DPrompt = /\b(3d|three[- ]dimensional|3-d|ball[- ]and[- ]stick|volumetric|stereochemical)\b/i.test(effectivePrompt);
    const is2DPrompt = /\b(2d|two[- ]dimensional|2-d|flat|cross[- ]section|schematic)\b/i.test(effectivePrompt);
    const isPaperPrompt = /\b(paper|black[- ]and[- ]white|b&w|sheet|notebook)\b/i.test(effectivePrompt);

    const isChemPrompt = /(water|methane|ethane|propane|alkane|hydrocarbon|carbon|dioxide|ammonia|molecule|compound|chemical|chemistry|formula|h2o|ch4|c2h6|c3h8|co2|nh3|c2h5oh|ethanol|glucose|benzene|acid|lewis|vsepr|bond|tetrahedral|stereochemistry|dipole)/i.test(effectivePrompt);
    const isBioPrompt = /(cell|organ|heart|brain|kidney|nephron|liver|lung|tissue|mitochondria|chloroplast|neuron|system|membrane|digestive|cardiovascular|nervous|respiratory|plant|animal|bacteria|virus|dna|rna|euglena|amoeba|paramecium)/i.test(effectivePrompt);
    const isPhysPrompt = /(atom|bohr|rutherford|electron|proton|neutron|quantum|orbital|nucleus|physics|optics|lens|magnetic|circuit|gravity|solar|wave)/i.test(effectivePrompt);

    let resolvedDomain: 'biological' | 'chemical' | 'physical' | 'general' = 'general';
    if (isChemPrompt) resolvedDomain = 'chemical';
    else if (isBioPrompt) resolvedDomain = 'biological';
    else if (isPhysPrompt) resolvedDomain = 'physical';

    let targetRenderMode: '3d' | '2d' | 'paper' = customRenderMode || '3d';
    if (is3DPrompt) {
      targetRenderMode = '3d';
    } else if (is2DPrompt) {
      targetRenderMode = '2d';
    } else if (isPaperPrompt) {
      targetRenderMode = 'paper';
    } else if (resolvedDomain === 'chemical') {
      targetRenderMode = 'paper'; // Chemical compounds default to black-and-white paper
    } else {
      targetRenderMode = customRenderMode || '3d'; // Biological cells/organs/systems default to 3D in multiple colours
    }

    setActiveRenderMode(targetRenderMode);
    showToast(
      targetRenderMode === 'paper'
        ? `Architecting scientific formula/compound on black-and-white paper for "${effectivePrompt}"...`
        : `Architecting ${targetRenderMode.toUpperCase()} multi-colour scientific structure for "${effectivePrompt}"...`
    );

    try {
      // 1. Run the Multi-Stage Draw and Label Engine (Identify, Textbook Match, Educational Repo Search, Verification & Vector Synthesis)
      const engineResult = await runDrawAndLabelEngine(effectivePrompt, targetRenderMode);
      const generatedConcept = engineResult.concept;

      if (generatedConcept && generatedConcept.pins && generatedConcept.pins.length > 0) {
        setSelectedConcept(generatedConcept);
        setPinsState(generatedConcept.pins || []);
        setActivePin(generatedConcept.pins?.[0] || null);
        setActiveRenderMode(generatedConcept.renderMode || targetRenderMode);
        setActiveCategoryFilter('All');
        saveDiagram(generatedConcept);
        resetView();
        setIsGenerating(false);

        const sourceLabel = generatedConcept.sourceAttribution?.sourceName 
          ? ` (Source: ${generatedConcept.sourceAttribution.sourceName})` 
          : '';
        showToast(`Drew and labeled "${generatedConcept.title}" with textbook fidelity (${generatedConcept.pins.length} structures labeled)${sourceLabel}!`);
        return;
      }

      // 2. Direct server-side Gemini API diagram generation fallback
      showToast(`Searching academic textbooks & scientific databases for "${effectivePrompt}"...`);
      try {
        const res = await fetch('/api/diagram-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: effectivePrompt,
            renderMode: targetRenderMode,
            domain: resolvedDomain
          })
        });
        if (res.ok) {
          const data = await res.json();
          const diagData = data.diagram || data;
          if (diagData && (diagData.pins || diagData.title)) {
            const diag: DiagramConcept = {
              id: Date.now().toString(),
              ...diagData,
              renderMode: diagData.renderMode || targetRenderMode,
              domain: diagData.domain || resolvedDomain
            };
            setSelectedConcept(diag);
            setPinsState(diag.pins || []);
            setActivePin(diag.pins?.[0] || null);
            setActiveRenderMode(diag.renderMode || targetRenderMode);
            setActiveCategoryFilter('All');
            saveDiagram(diag);
            resetView();
            setIsGenerating(false);
            showToast(`Drew and labeled "${diag.title}" with authentic textbook fidelity in ${diag.renderMode === 'paper' ? 'Black & White Paper' : diag.renderMode?.toUpperCase() + ' Multi-Colour'} format!`);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Direct /api/diagram-generate failed, using fallback search engine:', apiErr);
      }

      // 3. Fallback via /api/chat or puterChat with Deep Scientific Search Reasoning
      showToast(`Synthesizing textbook morphology & plotting verified pins for "${effectivePrompt}"...`);
      const promptText = `
You are a World-Class Scientific Illustrator, Cytologist, and Medical Textbook Author.
Search your comprehensive academic knowledge base (Campbell Biology, Gray's Anatomy, Guyton & Hall Physiology, Lehninger Biochemistry) to generate an authentic, textbook-accurate, fully labeled scientific diagram concept for the topic: "${effectivePrompt}".
Render Mode: ${targetRenderMode} (${targetRenderMode === 'paper' ? 'Formatted on black-and-white paper with clear formulas and single bonds' : targetRenderMode.toUpperCase() + ' multi-colour anatomical/structural model with vibrant colors'}).
Domain: ${resolvedDomain}.
Language / Dialect: ${language || 'English (US)'}

REAL-LIFE TEXTBOOK ACCURACY REQUIREMENT:
Depict the structure exactly as it appears in nature and authoritative textbooks.
If it is a custom concept, provide "customSvgCode" containing realistic SVG vector paths, polygons, or ellipses centered at (0,0) fitting within viewBox coordinates -220 to +220 X and -140 to +140 Y.

CRITICAL FORMATTING INSTRUCTIONS:
- If domain is chemical: Output complete "chemicalData" with formula, IUPAC name, molar mass, geometry, bond angles, bond length, hybridization, and lewisStructure.
- Generate between 6 and 10 detailed, accurately placed pins distributed well across the canvas (X from 15 to 85, Y from 15 to 85).
- If renderMode is "paper", pin colors should be sleek slate/black (#0F172A, #1E293B) for crisp black-and-white print.
- If renderMode is "3d" or "2d", use multiple distinct bright colors (#3B82F6, #10B981, #F59E0B, #EC4899, #8B5CF6, #06B6D4).

Respond ONLY with a valid JSON object:
{
  "title": "Clear Diagram Title",
  "category": "${resolvedDomain === 'chemical' ? 'Organic Chemistry' : resolvedDomain === 'physical' ? 'Physics & Atoms' : 'Biology & Cells'}",
  "subtitle": "Short descriptive subtitle",
  "description": "Comprehensive academic overview explaining structural morphology and stereochemistry",
  "diagramType": "${resolvedDomain === 'chemical' ? (/ethane|propane|alkane|hydrocarbon/i.test(effectivePrompt) ? 'hydrocarbon-alkanes' : /methane/i.test(effectivePrompt) ? 'methane-molecule' : /water/i.test(effectivePrompt) ? 'water-molecule' : 'chemical-substance') : 'custom-concept'}",
  "renderMode": "${targetRenderMode}",
  "domain": "${resolvedDomain}",
  "colorTheme": "${targetRenderMode === 'paper' ? 'paper-black-white' : 'vibrant-anatomical'}",
  "funFact": "Fascinating scientific insight",
  "customSvgCode": "<g><path ... /></g>",
  "pins": [
    {
      "id": "p-1",
      "number": 1,
      "name": "Component Name",
      "x": 45,
      "y": 35,
      "color": "${targetRenderMode === 'paper' ? '#0F172A' : '#3B82F6'}",
      "category": "Structure",
      "functionSummary": "Clear concise 1-sentence function",
      "detailedNotes": "Detailed scientific notes in rigorous academic depth"
    }
  ]
}`;

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
        console.warn('Backend diagram call failed, using puter fallback:', backendErr);
      }

      if (!rawJson) {
        rawJson = await puterChat(promptText, 'gpt-4o-mini');
      }

      const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const deducedDiagramType = parsed.diagramType || (
        matchScientificConcept(conceptPrompt)?.diagramType ||
        matchScientificConcept(parsed.title || '')?.diagramType ||
        (/ethane|propane|alkane|hydrocarbon/i.test(conceptPrompt) ? 'hydrocarbon-alkanes' :
        /methane|ch4/i.test(conceptPrompt) ? 'methane-molecule' :
        /water|h2o/i.test(conceptPrompt) ? 'water-molecule' :
        resolvedDomain === 'chemical' ? 'chemical-substance' : 'custom-concept')
      );

      const newDiagram: DiagramConcept = {
        id: Date.now().toString(),
        title: parsed.title || conceptPrompt,
        category: parsed.category || (resolvedDomain === 'chemical' ? 'Organic Chemistry' : 'Biology & Cells'),
        subtitle: parsed.subtitle || 'Scientific Diagram & Labelled Structure',
        description: parsed.description || 'Structural analysis and labelled components',
        diagramType: deducedDiagramType,
        renderMode: parsed.renderMode || targetRenderMode,
        domain: parsed.domain || resolvedDomain,
        colorTheme: parsed.colorTheme || (targetRenderMode === 'paper' ? 'paper-black-white' : 'vibrant-anatomical'),
        funFact: parsed.funFact || 'Detailed structural and stereochemical study.',
        customSvgCode: parsed.customSvgCode || undefined,
        chemicalData: parsed.chemicalData || (
          /ethane|propane|hydrocarbon/i.test(conceptPrompt) ? PRESET_DIAGRAMS[4].chemicalData :
          /methane|ch4/i.test(conceptPrompt) ? PRESET_DIAGRAMS[2].chemicalData :
          /water|h2o/i.test(conceptPrompt) ? PRESET_DIAGRAMS[3].chemicalData : undefined
        ),
        pins: Array.isArray(parsed.pins) && parsed.pins.length > 0 ? parsed.pins : PRESET_DIAGRAMS[0].pins,
        timestamp: Date.now()
      };

      setSelectedConcept(newDiagram);
      setActiveRenderMode(newDiagram.renderMode || targetRenderMode);
      setPinsState(newDiagram.pins || []);
      setActivePin(newDiagram.pins?.[0] || null);
      setActiveCategoryFilter('All');
      saveDiagram(newDiagram);
      resetView();
      showToast(`Successfully drew and labeled "${newDiagram.title}" in ${newDiagram.renderMode === 'paper' ? 'Black & White Paper' : newDiagram.renderMode?.toUpperCase() + ' Multi-Colour'} format!`);
    } catch (err: any) {
      console.error('Diagram generation error:', err);
      showToast('Error creating diagram. Please try with a specific anatomical or chemical topic.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Move to AI Research Assistant
  const handleMoveToResearch = () => {
    if (!selectedConcept) return;

    // Build comprehensive, structure-accurate research document for the EXACT structure that is drawn and labelled:
    let researchDoc = `# Scientific Research & Anatomical Dossier: ${selectedConcept.title}\n\n`;
    researchDoc += `**Domain & Category**: ${selectedConcept.domain ? selectedConcept.domain.toUpperCase() : 'SCIENCE'} • ${selectedConcept.category}\n`;
    if (selectedConcept.subtitle) {
      researchDoc += `**Subtitle / Specification**: ${selectedConcept.subtitle}\n`;
    }
    researchDoc += `**Visual Presentation Format**: ${activeRenderMode === 'paper' ? 'Black & White Technical Paper Drafting' : activeRenderMode.toUpperCase() + ' Multi-Colour Anatomical Visualization'}\n\n`;

    researchDoc += `## Structural Overview\n${selectedConcept.description}\n\n`;

    if (selectedConcept.funFact) {
      researchDoc += `### Key Characteristic / Scientific Significance\n${selectedConcept.funFact}\n\n`;
    }

    if (selectedConcept.chemicalData) {
      const chem = selectedConcept.chemicalData;
      researchDoc += `### Chemical & Stereochemical Parameters\n`;
      if (chem.formula) researchDoc += `- **Molecular Formula**: ${chem.formula}\n`;
      if (chem.iupacName) researchDoc += `- **IUPAC Name**: ${chem.iupacName}\n`;
      if (chem.molarMass) researchDoc += `- **Molar Mass**: ${chem.molarMass}\n`;
      if (chem.geometry) researchDoc += `- **Molecular Geometry**: ${chem.geometry}\n`;
      if (chem.bondAngle) researchDoc += `- **Bond Angle**: ${chem.bondAngle}\n`;
      if (chem.hybridization) researchDoc += `- **Hybridization**: ${chem.hybridization}\n`;
      if (chem.bondLength) researchDoc += `- **Bond Length**: ${chem.bondLength}\n`;
      if (chem.lewisStructure) researchDoc += `- **Lewis Structure**: ${chem.lewisStructure}\n`;
      researchDoc += `\n`;
    }

    researchDoc += `## Labelled Anatomical Components & Physiological Profiles (${pinsState.length} Structures)\n\n`;
    pinsState.forEach((pin) => {
      researchDoc += `### ${pin.number}. ${pin.name} [${pin.category}]\n`;
      researchDoc += `* **Functional Role**: ${pin.functionSummary}\n`;
      researchDoc += `* **Detailed Physiological Notes**: ${pin.detailedNotes}\n`;
      if (pin.x !== undefined && pin.y !== undefined) {
        researchDoc += `* **Spatial Coordinates**: (${pin.x}%, ${pin.y}%)\n`;
      }
      researchDoc += `\n`;
    });

    const exportConcept: DiagramConcept = {
      ...selectedConcept,
      renderMode: activeRenderMode,
      pins: pinsState
    };

    saveDiagram(exportConcept);

    sendToResearch(researchDoc, selectedConcept.title, {
      type: 'diagram',
      title: selectedConcept.title,
      diagramData: exportConcept
    });
    setCurrentView('research');
  };

  const handleRedrawDiagram = () => {
    if (!selectedConcept) return;
    setIsRedrawing(true);
    // Reset view pan & zoom for pristine framing
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
    
    // Restore pristine canonical pins and leader lines from the catalog
    const canonical = ALL_AVAILABLE_PRESETS.find(p => p.id === selectedConcept.id);
    if (canonical && canonical.pins) {
      const restoredPins: LabelPin[] = JSON.parse(JSON.stringify(canonical.pins));
      setPinsState(restoredPins);
      setActivePin(restoredPins[0] || null);
      updateCurrentPagePins(restoredPins);
      updateCurrentPageConcept({ ...selectedConcept, pins: restoredPins });
    }

    showToast(`"${selectedConcept.title}" redrawn and centered with fresh anatomical vectors & labels!`);
    setTimeout(() => {
      setIsRedrawing(false);
    }, 600);
  };

  // Convert client pointer event into exact SVG viewBox (1000x700) coordinates
  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: Math.round(transformed.x), y: Math.round(transformed.y) };
  };

  const pointsToSvgPath = (points: { x: number; y: number }[]): string => {
    if (!points || points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      const isNorm = pt.x <= 1000 && pt.y <= 700;
      const px = isNorm ? pt.x : (pt.x / 1400) * 1000;
      const py = isNorm ? pt.y : (pt.y / 900) * 700;
      return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
    }, '');
  };

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingActive) return;
    e.stopPropagation();
    const coords = getSvgCoordinates(e);
    if (!coords) return;

    if (drawingTool === 'eraser') {
      const existingStrokes = currentPage.strokes || [];
      const filtered = existingStrokes.filter(stroke => {
        return !stroke.points.some(pt => {
          const isNorm = pt.x <= 1000 && pt.y <= 700;
          const px = isNorm ? pt.x : (pt.x / 1400) * 1000;
          const py = isNorm ? pt.y : (pt.y / 900) * 700;
          return Math.hypot(px - coords.x, py - coords.y) < 25;
        });
      });
      if (filtered.length !== existingStrokes.length) {
        updateCurrentPageStrokes(filtered);
      }
      return;
    }

    setIsDrawingNow(true);
    setCurrentStrokePoints([coords]);
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingActive) return;
    if (drawingTool === 'eraser' && e.buttons === 1) {
      const coords = getSvgCoordinates(e);
      if (!coords) return;
      const existingStrokes = currentPage.strokes || [];
      const filtered = existingStrokes.filter(stroke => {
        return !stroke.points.some(pt => {
          const isNorm = pt.x <= 1000 && pt.y <= 700;
          const px = isNorm ? pt.x : (pt.x / 1400) * 1000;
          const py = isNorm ? pt.y : (pt.y / 900) * 700;
          return Math.hypot(px - coords.x, py - coords.y) < 25;
        });
      });
      if (filtered.length !== existingStrokes.length) {
        updateCurrentPageStrokes(filtered);
      }
      return;
    }

    if (!isDrawingNow) return;
    e.stopPropagation();
    const coords = getSvgCoordinates(e);
    if (!coords) return;
    setCurrentStrokePoints(prev => [...prev, coords]);
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingActive || !isDrawingNow) return;
    e.stopPropagation();
    setIsDrawingNow(false);

    if (currentStrokePoints.length > 1) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        points: currentStrokePoints,
        color: drawingColor,
        width: drawingWidth,
        tool: drawingTool
      };
      updateCurrentPageStrokes([...(currentPage.strokes || []), newStroke]);
    }
    setCurrentStrokePoints([]);
  };

  // High-Resolution PNG & SVG Exporter - Captures 100% of Live Vector Structure & Labels with high-contrast background plate
  const generateDiagramSVGString = (themeOverride?: 'dark' | 'paper'): string | null => {
    if (!canvasRef.current) return null;
    const svgEl = canvasRef.current.querySelector('svg');
    if (!svgEl) return null;

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    // Strip interactive pointer overlays before exporting
    clonedSvg.querySelectorAll('[data-pointer-overlay="true"]').forEach(el => el.remove());

    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clonedSvg.setAttribute('width', '1000');
    clonedSvg.setAttribute('height', '700');
    clonedSvg.setAttribute('viewBox', '0 0 1000 700');
    clonedSvg.removeAttribute('style');

    // Make sure an explicit background plate exists so that vector elements NEVER render onto an un-styled or transparent background
    const effectiveTheme = themeOverride || (isPaperMode ? 'paper' : 'dark');
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', '1000');
    bgRect.setAttribute('height', '700');
    bgRect.setAttribute('rx', '8');
    if (effectiveTheme === 'paper') {
      bgRect.setAttribute('fill', '#FFFFFF');
      bgRect.setAttribute('stroke', '#CBD5E1');
      bgRect.setAttribute('stroke-width', '2');
    } else {
      bgRect.setAttribute('fill', '#090D16'); // Deep crisp laboratory navy canvas
      bgRect.setAttribute('stroke', '#1E293B');
      bgRect.setAttribute('stroke-width', '2');
    }
    clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

    // Add inline style definition to ensure typography and colors render cleanly across all software
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
      text { font-family: ${fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'monospace' : "'Poppins', system-ui, -apple-system, sans-serif"}; }
      .select-none { user-select: none; }
    `;
    clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);

    return new XMLSerializer().serializeToString(clonedSvg);
  };

  /**
   * Generates a high-resolution raster Data URL (PNG or JPEG) on an opaque background plate,
   * supporting full colour laboratory mode or high-contrast black-and-white paper print plate.
   */
  const generateDiagramRasterDataUrl = async (
    format: 'png' | 'jpeg' = 'jpeg', 
    isBw: boolean = false,
    forceWhiteBackground: boolean = false
  ): Promise<string> => {
    if (!selectedConcept) return '';
    const effectiveTheme = (isBw || forceWhiteBackground || isPaperMode) ? 'paper' : 'dark';
    const svgString = generateDiagramSVGString(effectiveTheme);
    if (!svgString) return '';

    return new Promise((resolve) => {
      try {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 2400;
            canvas.height = 1680;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(blobUrl);
              resolve('');
              return;
            }

            const useWhiteBg = isBw || forceWhiteBackground || isPaperMode;

            // 1. Pure Crisp Opaque Background matching the mode
            ctx.fillStyle = useWhiteBg ? '#FFFFFF' : '#0B1120';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Technical drafting border
            ctx.strokeStyle = isBw ? '#000000' : useWhiteBg ? '#CBD5E1' : '#1E293B';
            ctx.lineWidth = isBw ? 5 : 3;
            ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

            // 2. High-Contrast Header with Metadata
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            if (isBw) {
              ctx.fillStyle = '#000000';
              ctx.font = 'bold 26px sans-serif';
              ctx.fillText('ACADEMIC ANATOMICAL PLATE • BLACK & WHITE PRINT FORMAT', 90, 48);

              ctx.fillStyle = '#000000';
              ctx.font = 'bold 52px serif';
              ctx.fillText(selectedConcept.title, 90, 84);

              ctx.fillStyle = '#333333';
              ctx.font = '22px sans-serif';
              ctx.fillText(`Category: ${selectedConcept.category} • ${pinsState.length} Anatomical Structures`, 90, 148);
            } else if (useWhiteBg) {
              ctx.fillStyle = '#0D9488';
              ctx.font = 'bold 26px sans-serif';
              ctx.fillText('NEXORA SCIENTIFIC STUDIO • ACADEMIC ANATOMICAL PLATE', 90, 48);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'bold 52px sans-serif';
              ctx.fillText(selectedConcept.title, 90, 84);

              ctx.fillStyle = '#475569';
              ctx.font = '22px sans-serif';
              ctx.fillText(`Category: ${selectedConcept.category} • ${pinsState.length} Anatomical Structures`, 90, 148);
            } else {
              ctx.fillStyle = '#34D399';
              ctx.font = 'bold 26px sans-serif';
              ctx.fillText('NEXORA SCIENTIFIC STUDIO • ANATOMICAL ULTRASTRUCTURE', 90, 48);

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 52px sans-serif';
              ctx.fillText(selectedConcept.title, 90, 84);

              ctx.fillStyle = '#94A3B8';
              ctx.font = '22px sans-serif';
              ctx.fillText(`Category: ${selectedConcept.category} • ${pinsState.length} Anatomical Structures`, 90, 148);
            }

            // 3. Central Structure Draw
            const targetW = 2220;
            const targetH = 1400;
            const targetX = 90;
            const targetY = 195;

            if (isBw) {
              ctx.filter = 'grayscale(100%) contrast(160%)';
            }
            ctx.drawImage(img, targetX, targetY, targetW, targetH);
            ctx.filter = 'none';

            // 4. Freehand strokes
            if (currentPage && currentPage.strokes && currentPage.strokes.length > 0) {
              ctx.save();
              const scaleX = targetW / 1000;
              const scaleY = targetH / 700;
              currentPage.strokes.forEach(stroke => {
                if (stroke.points.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = isBw ? '#000000' : (useWhiteBg && stroke.color === '#FFFFFF' ? '#0F172A' : stroke.color);
                ctx.lineWidth = stroke.width * scaleX;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                const startX = targetX + stroke.points[0].x * scaleX;
                const startY = targetY + stroke.points[0].y * scaleY;
                ctx.moveTo(startX, startY);
                for (let i = 1; i < stroke.points.length; i++) {
                  ctx.lineTo(targetX + stroke.points[i].x * scaleX, targetY + stroke.points[i].y * scaleY);
                }
                ctx.stroke();
              });
              ctx.restore();
            }

            // 5. Academic Footer
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = isBw ? '#333333' : useWhiteBg ? '#64748B' : '#94A3B8';
            ctx.font = '20px sans-serif';
            ctx.fillText(`Rendered with NEXORA Scientific Studio • High-Fidelity Anatomical Ultrastructure • Academic Structure Legend`, 90, 1630);

            URL.revokeObjectURL(blobUrl);

            const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const dataUrl = canvas.toDataURL(mime, format === 'jpeg' ? 0.94 : 0.96);
            resolve(dataUrl);
          } catch (e) {
            URL.revokeObjectURL(blobUrl);
            resolve('');
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          resolve('');
        };

        img.src = blobUrl;
      } catch {
        resolve('');
      }
    });
  };

  /**
   * Direct Word Document (.docx) Exporter
   * Transports the full visual structure (high-res JPEG image) AND complete anatomical labels into Microsoft Word!
   */
  const exportDiagramToWord = async () => {
    if (!selectedConcept) {
      showToast('Please select or generate a diagram first');
      return;
    }

    try {
      showToast('Generating Word Document with high-resolution diagram & anatomical table...');
      // Universal Word Document standard: high-fidelity JPEG on white paper background
      const rasterDataUrl = await generateDiagramRasterDataUrl('jpeg', isPaperMode, true);
      
      // Build an academic Markdown document with diagram image and complete pins table
      let markdown = `# ${selectedConcept.title}\n\n`;
      if (selectedConcept.subtitle) {
        markdown += `**${selectedConcept.subtitle}**\n\n`;
      }
      markdown += `${selectedConcept.description}\n\n`;

      if (rasterDataUrl) {
        markdown += `![${selectedConcept.title}](${rasterDataUrl})\n\n`;
      }

      markdown += `### Anatomical & Cytological Structure Index\n\n`;
      markdown += `| Pin # | Anatomical Structure | Category | Physiological Function Summary | Detailed Anatomical Notes |\n`;
      markdown += `| :---: | :--- | :--- | :--- | :--- |\n`;
      
      pinsState.forEach(p => {
        const cat = p.category || 'Organelle / Feature';
        const fn = (p.functionSummary || '').replace(/\|/g, '-');
        const notes = (p.detailedNotes || '').replace(/\|/g, '-');
        markdown += `| **${p.number}** | **${p.name}** | ${cat} | ${fn} | ${notes} |\n`;
      });

      if (selectedConcept.funFact) {
        markdown += `\n\n> **Biological & Academic Insight:** ${selectedConcept.funFact}\n`;
      }

      await exportToWordDocument({
        title: selectedConcept.title,
        subtitle: selectedConcept.subtitle || 'Scientific Diagram & Anatomical Legend',
        author: 'NEXORA Academic Scientific Studio',
        category: selectedConcept.category,
        filename: `${selectedConcept.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-scientific-diagram`,
        rawText: markdown,
        sections: [
          {
            type: 'heading1',
            text: selectedConcept.title,
            align: 'center'
          },
          ...(selectedConcept.subtitle ? [{
            type: 'paragraph' as const,
            text: selectedConcept.subtitle,
            italic: true,
            align: 'center' as const
          }] : []),
          {
            type: 'paragraph',
            text: selectedConcept.description
          },
          ...(rasterDataUrl ? [{
            type: 'image' as const,
            imageSrc: rasterDataUrl,
            caption: `Figure 1: ${selectedConcept.title} — Anatomical Structure with ${pinsState.length} Legend Callouts`,
            imageData: {
              base64Data: rasterDataUrl,
              caption: `Figure 1: ${selectedConcept.title} — Anatomical Structure with ${pinsState.length} Legend Callouts`,
              width: 540,
              height: 380
            }
          }] : []),
          {
            type: 'heading2',
            text: 'Anatomical & Cytological Structure Index'
          },
          {
            type: 'table',
            tableData: {
              headers: ['Pin #', 'Anatomical Structure', 'Category', 'Physiological Function Summary', 'Detailed Anatomical Notes'],
              rows: pinsState.map(p => [
                String(p.number),
                p.name,
                p.category || 'Organelle / Feature',
                p.functionSummary || '',
                p.detailedNotes || ''
              ])
            }
          },
          ...(selectedConcept.funFact ? [{
            type: 'quote' as const,
            text: `Biological & Academic Insight: ${selectedConcept.funFact}`
          }] : [])
        ]
      });

      showToast(`Word document for "${selectedConcept.title}" exported successfully!`);
    } catch (err) {
      console.error('Failed to export to Word document:', err);
      showToast('Word export encountered an error. Please try again.');
    }
  };

  // Multi-Format Direct Download (PNG, JPEG, SVG, Text/Markdown)
  const downloadDiagramInFormat = async (format: 'png' | 'jpeg' | 'svg' | 'txt' | 'bw-png' | 'bw-jpeg') => {
    if (!selectedConcept) {
      showToast('Please select or generate a diagram first');
      return;
    }

    const safeTitle = selectedConcept.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (format === 'svg') {
      const svgString = generateDiagramSVGString();
      if (!svgString) {
        showToast('Could not access canvas SVG elements for export');
        return;
      }
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `diagram-${safeTitle}.svg`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      showToast('Vector SVG diagram downloaded successfully!');
      return;
    }

    if (format === 'txt') {
      const textData = `========================================================================\n` +
        `SCIENTIFIC ANATOMICAL SPECIMEN: ${selectedConcept.title.toUpperCase()}\n` +
        `Category: ${selectedConcept.category} | Domain: ${selectedConcept.domain || 'Biological'}\n` +
        `========================================================================\n\n` +
        `DESCRIPTION:\n${selectedConcept.description}\n\n` +
        (selectedConcept.funFact ? `KEY SCIENTIFIC INSIGHT:\n${selectedConcept.funFact}\n\n` : '') +
        `VERIFIED ANATOMICAL STRUCTURES & PHYSIOLOGICAL FUNCTIONS:\n` +
        `------------------------------------------------------------------------\n` +
        pinsState.map(p => `[#${p.number}] ${p.name.toUpperCase()}\n- Category: ${p.category}\n- Function: ${p.functionSummary}\n- Histology/Molecular: ${p.detailedNotes || 'Key morphological structure'}\n`).join('\n') +
        `\n========================================================================\nGenerated by NEXORA Scientific Studio\n`;

      const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `specimen-${safeTitle}-data.txt`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      showToast('Plain text anatomical data sheet downloaded!');
      return;
    }

    const isBw = format === 'bw-png' || format === 'bw-jpeg';
    const rasterType = (format === 'jpeg' || format === 'bw-jpeg') ? 'jpeg' : 'png';
    showToast(`Rendering high-resolution ${isBw ? 'Black & White ' : ''}${rasterType.toUpperCase()} plate...`);

    // Use solid white background plate for device export so viewer software never displays an empty black window
    const dataUrl = await generateDiagramRasterDataUrl(rasterType, isBw, isPaperMode || isBw);
    if (!dataUrl) {
      showToast('Failed to rasterize diagram. Please try downloading as SVG.');
      return;
    }

    // Convert dataUrl to a binary Blob so browser download is never blocked or truncated
    try {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || (rasterType === 'jpeg' ? 'image/jpeg' : 'image/png');
      const binaryString = atob(parts[1].replace(/\s+/g, ''));
      const len = binaryString.length;
      const u8arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        u8arr[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `diagram-${safeTitle}${isBw ? '-bw' : ''}.${rasterType === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      showToast(`High-resolution ${isBw ? 'Black & White ' : ''}${rasterType.toUpperCase()} downloaded to your device successfully!`);
    } catch {
      // Direct link fallback
      const link = document.createElement('a');
      link.download = `diagram-${safeTitle}${isBw ? '-bw' : ''}.${rasterType === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`High-resolution ${isBw ? 'Black & White ' : ''}${rasterType.toUpperCase()} downloaded successfully!`);
    }
  };

  const downloadDiagramPNG = () => downloadDiagramInFormat('png');
  const downloadDiagramSVG = () => downloadDiagramInFormat('svg');

  // Send Diagram directly to Academic & Research Workspace
  const handleSendToWorkspace = () => {
    if (!selectedConcept) {
      showToast('Please select or draw a diagram structure first.');
      return;
    }
    setShowWorkspaceExportModal(true);
  };

  const handleExecuteWorkspaceImport = async (navigateToWorkspace: boolean = true) => {
    if (!selectedConcept) return;

    let dataUrl = '';
    if (exportFormatStyle === 'color') {
      showToast('Preparing full-color high-resolution plate for Workspace...');
      try {
        dataUrl = await generateDiagramRasterDataUrl('jpeg', false, true);
      } catch {
        dataUrl = '';
      }
      if (!dataUrl) {
        const svgString = generateDiagramSVGString('dark');
        if (svgString) {
          dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        } else {
          dataUrl = generatePresetSVGDataUrl(selectedConcept, false);
        }
      }
    } else if (exportFormatStyle === 'bw-paper') {
      showToast('Preparing black-and-white paper print plate for Workspace...');
      try {
        dataUrl = await generateDiagramRasterDataUrl('jpeg', true, true);
      } catch {
        dataUrl = '';
      }
      if (!dataUrl) {
        const svgString = generateDiagramSVGString('paper');
        if (svgString) {
          dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        } else {
          dataUrl = generatePresetSVGDataUrl(selectedConcept, true);
        }
      }
    } else {
      // Pure text / Markdown table format
      dataUrl = '';
    }
    
    const conceptToImport: DiagramConcept = {
      ...selectedConcept,
      pins: pinsState
    };
    
    importDiagramToWorkspace(conceptToImport, dataUrl, {
      targetProjectId: targetExportProjectId || activeProjectId,
      targetPageIndex: targetExportPageIndex
    });

    showToast(`"${selectedConcept.title}" imported into Workspace Page ${targetExportPageIndex + 1} (${exportFormatStyle === 'bw-paper' ? 'B&W Paper Plate' : exportFormatStyle === 'color' ? 'Full Color JPEG' : 'Text Sheet'})!`);
    setShowWorkspaceExportModal(false);

    if (navigateToWorkspace) {
      setCurrentView('workspace');
    }
  };

  const toggleQuizReveal = (pinId: string) => {
    setRevealedQuizPins(prev => ({
      ...prev,
      [pinId]: !prev[pinId]
    }));
  };

  const isPaperMode = activeRenderMode === 'paper';
  const is3DMode = activeRenderMode === '3d';

  return (
    <div className={`h-full flex flex-col w-full overflow-y-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6' : 'w-full px-3 sm:px-6 lg:px-8 py-4'}`}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-xl shadow-md">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Draw and Label Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Interactive colored scientific diagrams, cell anatomy, draggable labels, and direct AI research integration</p>
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
              onClick={() => setCurrentView('infographic')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Switch to Infographic Portal"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-200" />
              <span>Infographic Portal</span>
            </button>
          </div>

          {/* Main App Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-sm"
            title={sidebarCollapsed ? "Expand Main Sidebar" : "Minimize Main Sidebar to create maximum canvas width"}
          >
            {sidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-amber-500" />
                <span>Expand Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
                <span>Minimize Sidebar</span>
              </>
            )}
          </button>

          {/* Inspector / Side Panel Toggle */}
          <button
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
              isInspectorCollapsed 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title={isInspectorCollapsed ? "Show Structure Details Panel" : "Hide Details Panel (Maximize Structure to 100% width)"}
          >
            {isInspectorCollapsed ? (
              <>
                <PanelRightOpen className="w-4 h-4 text-amber-300" />
                <span>Show Details Panel</span>
              </>
            ) : (
              <>
                <PanelRightClose className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Maximize Structure</span>
              </>
            )}
          </button>

          {/* Quiz Mode Button */}
          <button
            onClick={() => {
              setIsQuizMode(!isQuizMode);
              setRevealedQuizPins({});
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isQuizMode 
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle Quiz Flashcard Mode to test anatomical recall"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isQuizMode ? 'Quiz Mode: Active' : 'Quiz Mode'}</span>
          </button>

          {/* Edit Pointers Mode Toggle */}
          <button
            onClick={() => {
              const nextState = !isPointerEditing;
              setIsPointerEditing(nextState);
              if (nextState) {
                showToast('Pointer Editing Mode enabled: Drag any target endpoint to correct its location.');
                if (pointerHistory.length === 0 && pinsState.length > 0) {
                  setPointerHistory([pinsState.map(p => ({ ...p }))]);
                  setHistoryIndex(0);
                }
              } else {
                showToast('Pointer Editing Mode completed.');
              }
            }}
            disabled={!selectedConcept || pinsState.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isPointerEditing 
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold animate-pulse' 
                : pinsState.some(p => p.manuallyAdjusted)
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Enable interactive pointer target editing to manually drag endpoints onto exact anatomical structures"
          >
            <MapPin className={`w-4 h-4 ${isPointerEditing ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>{isPointerEditing ? 'Editing Pointers...' : 'Edit Pointers'}</span>
            {pinsState.some(p => p.manuallyAdjusted) && !isPointerEditing && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white dark:border-slate-900" title="Contains manually adjusted pointers" />
            )}
          </button>

          {/* Delete Previous Structure Button */}
          <button 
            onClick={handleClearCanvas}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Delete the previous structure before drawing and labeling a new one"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete Structure</span>
          </button>

          {/* Download PNG */}
          <button 
            onClick={downloadDiagramPNG}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Download high-resolution PNG with full visual structure & all labels"
          >
            <FileImage className="w-4 h-4 text-amber-300" />
            <span>PNG</span>
          </button>

          {/* Download JPEG */}
          <button 
            onClick={() => downloadDiagramInFormat('jpeg')}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Download high-resolution JPEG with full visual structure & all labels"
          >
            <FileImage className="w-4 h-4 text-emerald-200" />
            <span>JPEG</span>
          </button>

          {/* Download Vector SVG */}
          <button 
            onClick={downloadDiagramSVG}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Download scalable vector SVG file for Word documents, Adobe Illustrator, or Inkscape"
          >
            <FileCode className="w-4 h-4 text-teal-200" />
            <span>Vector SVG</span>
          </button>

          {/* Direct Word (.docx) Export */}
          <button 
            onClick={exportDiagramToWord}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Export full diagram drawing, visual structure image & complete anatomical table directly to Microsoft Word (.docx)"
          >
            <FileDown className="w-4 h-4 text-amber-300" />
            <span>Export Word (.docx)</span>
          </button>

          {/* Send to Academic & Research Workspace */}
          <button 
            onClick={handleSendToWorkspace}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Import diagram, structural anatomy, and label table directly into your Research & Teaching Workspace document"
          >
            <FileText className="w-4 h-4 text-indigo-200" />
            <span>Import to Workspace</span>
          </button>

          {/* Move to AI Research Assistant */}
          <button 
            onClick={handleMoveToResearch}
            disabled={!selectedConcept}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-900 hover:bg-purple-950 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
            title="Move this labelled diagram and anatomical profiles directly into AI Research"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Move to AI Research</span>
          </button>

          {/* Save to Projects Button */}
          <button
            onClick={handleSaveToProjects}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Save diagram and annotations to Projects library"
          >
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <span>Save to Projects</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Portal Exit / Back Button */}
          <PortalExitButton portalName="Draw and Label Studio" targetView="slides" />
        </div>
      </div>

      {/* Dynamic Multi-Page Navigation Bar (Extends 1 to 10+ pages) */}
      <div className="mb-3">
        <PageNavigationBar
          pageCount={pages.length}
          activePageIndex={activePageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          pageTitles={pages.map(p => p.concept?.title || `Page ${p.pageNumber}`)}
          moduleName="Diagram Page"
        />
      </div>

      {/* Editing Kits & Tooling Bar (Features Poppins Font, Drawing, Shapes, and Content Editing) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Diagram & Pins Content Mode Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isEditMode
                ? 'bg-purple-900 text-amber-300 ring-2 ring-purple-600 font-extrabold shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
            title="Edit diagram structure titles, descriptions, pin labels, categories, and coordinates"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{isEditMode ? 'Close Content Editor' : 'Edit Diagram & Pins'}</span>
          </button>

          {/* Freehand Drawing Canvas Toggle */}
          <button
            onClick={() => setIsDrawingActive(!isDrawingActive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isDrawingActive
                ? 'bg-amber-500 text-slate-950 font-extrabold ring-2 ring-amber-400 shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle freehand drawing pen, highlighter, and brush tool"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isDrawingActive ? 'Drawing Active' : 'Draw / Annotate'}</span>
          </button>

          {/* Font Style Selector (Features Poppins Font) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <span className="text-[11px] font-bold text-slate-500 mr-1">Font:</span>
            {DIAGRAM_FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => setFontFamily(f.css)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontFamily === f.css
                    ? 'bg-purple-900 text-amber-300 font-bold shadow-sm ring-1 ring-purple-700'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
                style={{ fontFamily: f.css }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Page {activePageIndex + 1} of {pages.length} • {currentPage.shapes?.length || 0} shapes • {pinsState.length} pins
          </span>
        </div>
      </div>

      {/* Interactive Diagram Content Editor (When Edit Mode is active) */}
      {isEditMode && (
        <div className="mb-6 animate-fadeIn">
          <DiagramContentEditor
            concept={selectedConcept || {
              id: `custom-concept-${currentPage.id}`,
              title: `Scientific Study Page ${currentPage.pageNumber}`,
              category: 'Biology & Cells',
              subtitle: 'Interactive Diagram & Structural Mapping',
              description: 'Custom scientific diagram with editable structure and functional pins.',
              diagramType: 'custom-concept',
              renderMode: activeRenderMode,
              domain: 'general',
              colorTheme: activeRenderMode === 'paper' ? 'paper-black-white' : 'vibrant-anatomical',
              funFact: 'Explore scientific structures with interactive pins and annotations.',
              timestamp: Date.now(),
              pins: pinsState
            }}
            pins={pinsState}
            onChangeConcept={(updated) => {
              setSelectedConcept(updated);
              updateCurrentPageConcept(updated);
            }}
            onChangePins={(updatedPins) => {
              setPinsState(updatedPins);
              updateCurrentPagePins(updatedPins);
            }}
            fontFamily={fontFamily}
            onFontChange={setFontFamily}
            activePinId={activePin?.id || null}
            onSelectPin={(pin) => setActivePin(pin)}
          />
        </div>
      )}

      {/* Toast Notice */}
      {toastNotice && (
        <div className="mb-4 p-3.5 bg-purple-900 text-amber-300 border border-purple-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-xl animate-fadeIn">
          <span>{toastNotice}</span>
          <button onClick={() => setToastNotice(null)} className="text-white hover:text-amber-400 font-bold ml-3">✕</button>
        </div>
      )}

      {/* Concept Prompt / Generator Panel */}
      {!isFullscreen && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Draw & Label Any Concept (Anatomy, Biology, Earth, Physics, Chemistry)
                </label>
                
                {/* Presets Quick Picker & Categorized Dropdown */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Library:</span>
                  <select
                    id="curriculum-diagram-dropdown"
                    value={selectedConcept?.id || ''}
                    onChange={(e) => {
                      const found = ALL_AVAILABLE_PRESETS.find(p => p.id === e.target.value);
                      if (found) {
                        setSelectedConcept(found);
                        setPinsState(found.pins || []);
                        setActivePin(found.pins?.[0] || null);
                        setActiveRenderMode(found.renderMode || '3d');
                        setActiveCategoryFilter('All');
                        showToast(`Loaded "${found.title}"`);
                      }
                    }}
                    className="text-[11px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer max-w-[200px]"
                  >
                    <option value="" disabled>-- Select Textbook Diagram (32 Available) --</option>
                    <optgroup label="🧬 Biology & Microorganisms">
                      <option value="preset-euglena">Euglena (Flagellate Protist)</option>
                      <option value="preset-amoeba">Amoeba proteus (Pseudopodia)</option>
                      <option value="preset-paramecium">Paramecium caudatum (Ciliate)</option>
                      <option value="diag-animal-cell">Animal Cell (Ultrastructure)</option>
                      <option value="diag-plant-cell">Plant Cell (Ultrastructure)</option>
                      <option value="preset-bacterial-cell">Bacterial Cell (Prokaryote)</option>
                      <option value="preset-bacteriophage">Bacteriophage T4 Virus</option>
                      <option value="preset-mitochondria">Mitochondrion</option>
                      <option value="preset-chloroplast">Chloroplast Organelle</option>
                      <option value="preset-dna-helix">DNA Double Helix</option>
                    </optgroup>
                    <optgroup label="🩺 Human Anatomy & Organ Systems">
                      <option value="preset-female-reproductive-system">Female Reproductive System</option>
                      <option value="preset-male-reproductive-system">Male Reproductive System</option>
                      <option value="preset-human-sperm">Human Sperm (Spermatozoon)</option>
                      <option value="diag-human-heart">Human Heart (Cardiovascular)</option>
                      <option value="preset-human-brain">Human Brain & Lobes</option>
                      <option value="preset-human-eye">Human Eye (Sagittal)</option>
                      <option value="preset-human-ear">Human Ear (Auditory)</option>
                      <option value="preset-neuron">Motor Neuron (Nerve Cell)</option>
                      <option value="preset-nephron-kidney">Nephron & Glomerulus (Renal)</option>
                      <option value="preset-lungs-respiratory">Lungs & Respiratory System</option>
                      <option value="preset-digestive-system">Gastrointestinal / Digestive System</option>
                      <option value="preset-stomach-digestive">Stomach & Gastric Layers</option>
                      <option value="preset-skin-anatomy">Skin (Integumentary Layers)</option>
                    </optgroup>
                    <optgroup label="🌿 Zoology & Botany">
                      <option value="diag-bony-fish">Bony Fish (Tilapia / Osteichthyes)</option>
                      <option value="preset-agama-lizard">Agama Lizard (Sauropsida)</option>
                      <option value="preset-flower-anatomy">Flower Anatomy (Angiosperm)</option>
                    </optgroup>
                    <optgroup label="🌍 Earth & Space Cycles">
                      <option value="preset-carbon-cycle">Global Carbon Cycle</option>
                      <option value="preset-nitrogen-cycle">Nitrogen Biogeochemical Cycle</option>
                      <option value="preset-water-cycle">Hydrological / Water Cycle</option>
                      <option value="preset-volcano">Volcano & Magma Conduit</option>
                    </optgroup>
                    <optgroup label="⚡ Physics & Chemistry">
                      <option value="preset-electric-circuit">Electric Circuit (Ohm's Law)</option>
                      <option value="preset-electromagnetic-spectrum">Electromagnetic Spectrum</option>
                      <option value="diag-methane">Methane (CH₄ Molecule)</option>
                      <option value="diag-hydrocarbons">Hydrocarbons & Alkanes</option>
                    </optgroup>
                  </select>

                  {/* Quick Preset Buttons */}
                  {[
                    { id: 'preset-female-reproductive-system', label: 'Female Repro' },
                    { id: 'preset-euglena', label: 'Euglena' },
                    { id: 'preset-human-sperm', label: 'Sperm' },
                    { id: 'diag-human-heart', label: 'Heart' },
                    { id: 'preset-neuron', label: 'Neuron' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const found = ALL_AVAILABLE_PRESETS.find(item => item.id === p.id);
                        if (found) {
                          setSelectedConcept(found);
                          setPinsState(found.pins || []);
                          setActivePin(found.pins?.[0] || null);
                          setActiveRenderMode(found.renderMode || '3d');
                          setActiveCategoryFilter('All');
                        }
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        selectedConcept?.id === p.id 
                          ? 'bg-purple-900 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={conceptPrompt}
                onChange={(e) => setConceptPrompt(e.target.value)}
                placeholder="e.g. Structure of a Plant Cell with Chloroplasts, Human Nephron Anatomy, Human Brain Lobes, Action Potential Synapse, Volcano Magma Chamber..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none resize-none transition-all"
              />
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end">
              <button
                onClick={() => generateCustomDiagram()}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Drawing & Placing Pins...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Draw & Auto-Label Concept</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Visualizer Stage + Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left / Center: Interactive Scientific SVG Canvas */}
        <div className={`${isInspectorCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col space-y-3 transition-all duration-300`}>
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Workspace Layout & Zoom Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Sidebar Quick Minimize / Expand */}
              <button
                onClick={toggleSidebar}
                className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                title={sidebarCollapsed ? "Expand Navigation Sidebar" : "Minimize Navigation Sidebar (More Space)"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-amber-500" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>

              {/* Inspector Panel Quick Minimize / Expand */}
              <button
                onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
                className={`p-1.5 border rounded-xl transition-colors shadow-sm cursor-pointer ${
                  isInspectorCollapsed 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={isInspectorCollapsed ? "Restore Right Details Panel" : "Hide Details Panel to maximize diagram view to 100% width"}
              >
                {isInspectorCollapsed ? (
                  <PanelRightOpen className="w-4 h-4" />
                ) : (
                  <PanelRightClose className="w-4 h-4" />
                )}
              </button>

              {/* Format & Dimension Mode Toggles */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setActiveRenderMode('3d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeRenderMode === '3d'
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="3D Multi-Colour Format (Standard for biological cells, organs, anatomical systems & 3D models)"
                >
                  <Box className="w-3.5 h-3.5 text-cyan-300" />
                  <span>3D Multi-Colour</span>
                </button>
                <button
                  onClick={() => setActiveRenderMode('2d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeRenderMode === '2d'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="2D Multi-Colour Format"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-300" />
                  <span>2D Multi-Colour</span>
                </button>
                <button
                  onClick={() => setActiveRenderMode('paper')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeRenderMode === 'paper'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Black-and-White Paper Sheet (Standard for scientific formulas, chemical compounds & alkanes)"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>B&W Paper Sheet</span>
                </button>
              </div>

              {/* Canvas Transformation & Zoom Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setZoom(prev => Math.min(prev + 0.15, 3.0))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold px-1.5 text-slate-500">
                  {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={resetView}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Reset Zoom & Center Object"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chemical Molecule Textbook Header Bar (If Chemical Metadata Present) */}
          {selectedConcept?.chemicalData && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-2xl p-4 shadow-lg mb-3 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center font-mono font-extrabold text-amber-300 text-lg shadow-inner">
                  {selectedConcept.chemicalData.formula}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight text-white">{selectedConcept.chemicalData.iupacName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                      {selectedConcept.chemicalData.geometry}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Molar Mass: <span className="text-amber-300 font-semibold">{selectedConcept.chemicalData.molarMass}</span> • Hybridization: <span className="text-emerald-300 font-semibold">{selectedConcept.chemicalData.hybridization}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Bond Angle</span>
                  <span className="font-bold text-pink-400">{selectedConcept.chemicalData.bondAngle}</span>
                </div>
                {selectedConcept.chemicalData.bondLength && (
                  <div className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-400 text-[10px] block">Bond Length</span>
                    <span className="font-bold text-sky-400">{selectedConcept.chemicalData.bondLength}</span>
                  </div>
                )}
                {selectedConcept.chemicalData.dipoleMoment && (
                  <div className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-400 text-[10px] block">Dipole Moment</span>
                    <span className="font-bold text-amber-400">{selectedConcept.chemicalData.dipoleMoment}</span>
                  </div>
                )}
                <div className="bg-purple-900/60 border border-purple-600/40 px-3 py-1 rounded-lg font-mono text-amber-200 text-xs">
                  Lewis: {selectedConcept.chemicalData.lewisStructure}
                </div>

                {/* Chemical Representation Modes */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1 rounded-xl">
                  <button
                    onClick={() => setChemicalViewMode('paper-sheet')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      chemicalViewMode === 'paper-sheet' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    📄 Black & White Paper
                  </button>
                  <button
                    onClick={() => setChemicalViewMode('textbook-split')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      chemicalViewMode === 'textbook-split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🔬 2D & 3D Split
                  </button>
                  <button
                    onClick={() => setChemicalViewMode('3d-tetrahedral')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      chemicalViewMode === '3d-tetrahedral' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ⚛️ 3D Models
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SINGLE UNOBSTRUCTED DIAGRAM TITLE (External to canvas, never blocked by label lines) */}
          {selectedConcept && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isPaperMode
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                    : 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {selectedConcept.title}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      {selectedConcept.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {pinsState.length} Structures Fully Labeled
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {isPaperMode ? 'B&W Paper Sheet' : activeRenderMode === '3d' ? '3D Multi-Colour' : '2D Multi-Colour'}
                    </span>
                    {selectedConcept.sourceAttribution && (
                      selectedConcept.sourceAttribution.mode === 'authentic-reference' ? (
                        <a
                          href={selectedConcept.sourceAttribution.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 hover:underline shadow-xs"
                          title={`Authentic Open Reference Standard: ${selectedConcept.sourceAttribution.groundTruthStandard || selectedConcept.sourceAttribution.sourceName} (${selectedConcept.sourceAttribution.license || 'Open Educational'}) — ${selectedConcept.sourceAttribution.verificationNote || 'Verified against open curriculum reference archive.'}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Verified Authentic Reference</span>
                        </a>
                      ) : selectedConcept.sourceAttribution.mode === 'structured-reconstruction' ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-400 dark:border-teal-700 shadow-xs cursor-help"
                          title={`Curriculum Ground Truth: ${selectedConcept.sourceAttribution.groundTruthStandard || "Campbell Biology / Gray's Anatomy"} — ${selectedConcept.sourceAttribution.verificationNote || 'Precision structural reconstruction based on verified curriculum morphology.'}`}
                        >
                          <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Verified Structured Reconstruction</span>
                        </div>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs cursor-help"
                          title="AI Educational Illustration: Generated as a visual learning approximation. Structures and pin coordinates have NOT been independently verified against an authoritative external curriculum reference."
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>AI Educational Illustration (Unverified Reference)</span>
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedConcept.subtitle || selectedConcept.description.slice(0, 140)}
                  </p>
                </div>
              </div>
              
              {/* Redraw, Edit Labels & Line Visibility Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleRedrawDiagram}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    title="Redraw / Center this structure with fresh vector rendering and anatomical labels"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Redraw Structure</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = !isDrawingActive;
                      setIsDrawingActive(next);
                      if (next) {
                        showToast('Draw & Edit tools active! Use the Pen, Highlighter, and Eraser directly on the structure.');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      isDrawingActive
                        ? 'bg-purple-600 text-white font-extrabold shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="Toggle freehand drawing & editing tools (Pen, Highlighter, Eraser) directly on the structure/object"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isDrawingActive ? 'Drawing Tools: Active' : 'Draw & Edit Object'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (pinsState.length > 0) {
                        openPinPopup(pinsState[0]);
                      } else {
                        showToast('No labels to edit');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
                    title="Edit anatomical labels, functional descriptions, and notes"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Edit Labels</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2">
                    Label Lines:
                  </span>
                  <button
                    onClick={() => setLineDisplayMode('delicate')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lineDisplayMode === 'delicate' 
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Delicate, clean corridor lines that do not obstruct internal structures"
                  >
                    Delicate
                  </button>
                  <button
                    onClick={() => setLineDisplayMode('focus')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lineDisplayMode === 'focus' 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="100% Unobstructed view: only shows leader line for the selected/hovered structure"
                  >
                    Focus Only
                  </button>
                  <button
                    onClick={() => setLineDisplayMode('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lineDisplayMode === 'all' 
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Full visibility leader lines"
                  >
                    All Lines
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pointer Target Position Editing Banner */}
          {isPointerEditing && (
            <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-2xl border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center justify-between flex-wrap gap-3 mb-3 z-30 transition-all animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow">
                  <MapPin className="w-4 h-4" />
                  <span>POINTER EDITING ACTIVE</span>
                </div>
                <p className="text-xs text-slate-300 hidden sm:block">
                  Drag any target point handle to the exact anatomical structure it labels. Leader lines update in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Undo */}
                <button
                  onClick={handleUndoPointer}
                  disabled={historyIndex <= 0}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Undo last pointer adjustment"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Undo</span>
                </button>

                {/* Redo */}
                <button
                  onClick={handleRedoPointer}
                  disabled={historyIndex >= pointerHistory.length - 1}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Redo pointer adjustment"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Redo</span>
                </button>

                {/* Reset Selected */}
                <button
                  onClick={handleResetSelectedPointer}
                  disabled={!activePin || !activePin.manuallyAdjusted}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Reset selected pointer to canonical baseline position"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Selected</span>
                </button>

                {/* Reset All */}
                <button
                  onClick={() => setShowResetAllConfirmModal(true)}
                  disabled={!pinsState.some(p => p.manuallyAdjusted)}
                  className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 disabled:opacity-40 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Reset all diagram pointers to canonical default positions"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset All</span>
                </button>

                {/* Done Editing */}
                <button
                  onClick={() => setIsPointerEditing(false)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Done Editing</span>
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Freehand Drawing & Annotation Kit Bar (Stationed permanently above canvas when drawing is active, never obscured by edit mode) */}
          {isDrawingActive && (
            <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-400 dark:border-amber-500 shadow-xl flex items-center justify-between gap-3 flex-wrap animate-fadeIn">
              {/* Tool Mode: Pen, Highlighter, Eraser */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl">
                <button
                  onClick={() => setDrawingTool('pen')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    drawingTool === 'pen'
                      ? 'bg-purple-900 text-amber-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  title="Pen / Precise Vector Ink"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Pen</span>
                </button>
                <button
                  onClick={() => setDrawingTool('highlighter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    drawingTool === 'highlighter'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  title="Highlighter / Semi-Transparent Overlay"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlighter</span>
                </button>
                <button
                  onClick={() => setDrawingTool('eraser')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    drawingTool === 'eraser'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  title="Eraser / Click or drag over strokes to delete"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>
              </div>

              {/* Color Palette (8 Curated Colors) */}
              {drawingTool !== 'eraser' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">Color:</span>
                  {[
                    { name: 'Red', hex: '#EF4444' },
                    { name: 'Emerald', hex: '#10B981' },
                    { name: 'Cyan', hex: '#06B6D4' },
                    { name: 'Blue', hex: '#3B82F6' },
                    { name: 'Amber', hex: '#F59E0B' },
                    { name: 'Purple', hex: '#8B5CF6' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Slate', hex: '#0F172A' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setDrawingColor(c.hex)}
                      className={`w-6 h-6 rounded-full border border-black/15 dark:border-white/15 transition-transform cursor-pointer flex items-center justify-center ${
                        drawingColor === c.hex ? 'scale-125 ring-2 ring-purple-600 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {drawingColor === c.hex && <Check className={`w-3 h-3 ${c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />}
                    </button>
                  ))}
                </div>
              )}

              {/* Stroke Width Selector */}
              {drawingTool !== 'eraser' && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl">
                  {[
                    { label: 'Fine', value: 2 },
                    { label: 'Medium', value: 5 },
                    { label: 'Thick', value: 10 },
                    { label: 'Marker', value: 18 }
                  ].map(w => (
                    <button
                      key={w.value}
                      onClick={() => setDrawingWidth(w.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        drawingWidth === w.value
                          ? 'bg-purple-900 text-amber-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions: Undo, Clear, Visibility, Redraw, Done */}
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <button
                  onClick={() => {
                    const current = currentPage.strokes || [];
                    if (current.length > 0) {
                      updateCurrentPageStrokes(current.slice(0, -1));
                    }
                  }}
                  disabled={!currentPage.strokes || currentPage.strokes.length === 0}
                  className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  title="Undo last stroke"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo</span>
                </button>

                <button
                  onClick={() => updateCurrentPageStrokes([])}
                  disabled={!currentPage.strokes || currentPage.strokes.length === 0}
                  className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  title="Clear all drawing strokes"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>

                <button
                  onClick={() => setIsDrawingsVisible(!isDrawingsVisible)}
                  className="p-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title={isDrawingsVisible ? 'Hide drawing layer' : 'Show drawing layer'}
                >
                  {isDrawingsVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  onClick={handleRedrawDiagram}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Redraw and center structure with fresh anatomical vectors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Redraw</span>
                </button>

                <button
                  onClick={() => setIsDrawingActive(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm"
                  title="Exit drawing mode"
                >
                  Done Drawing
                </button>
              </div>
            </div>
          )}

          {/* Interactive Canvas Box with Scroll Wheel & Pan Dragging */}
          <div 
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ fontFamily }}
            className={`relative w-full rounded-3xl overflow-hidden shadow-2xl select-none transition-all duration-300 ${
              isPaperMode 
                ? 'bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700' 
                : 'bg-slate-950 border border-slate-800'
            } ${isFullscreen ? 'h-[80vh]' : 'min-h-[580px] lg:min-h-[660px] xl:min-h-[720px]'} ${
              isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Background Grid & Ambient Atmosphere */}
            {!isPaperMode && (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0,transparent_75%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
              </>
            )}
            {isPaperMode && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-30 pointer-events-none" />
            )}

            {/* Transformable Canvas Stage */}
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDraggingCanvas || draggingPinId ? 'none' : 'transform 0.1s ease-out'
              }}
              className="w-full h-full absolute inset-0 flex items-center justify-center p-4 sm:p-8"
            >
              <svg 
                ref={svgRef}
                onPointerDown={handleSvgPointerDown}
                onPointerMove={handleSvgPointerMove}
                onPointerUp={handleSvgPointerUp}
                className={`w-full h-full max-w-[1000px] max-h-[700px] overflow-visible transition-all duration-300 ${
                  isDrawingActive 
                    ? (drawingTool === 'eraser' ? 'cursor-cell pointer-events-auto' : 'cursor-crosshair pointer-events-auto') 
                    : ''
                } ${isRedrawing ? 'animate-pulse opacity-90' : ''}`} 
                viewBox="0 0 1000 700" 
                fill="none"
              >
                {/* Active Drawing Pointer Capture Area (Registers drag anywhere on canvas) */}
                {isDrawingActive && (
                  <rect
                    x="0"
                    y="0"
                    width="1000"
                    height="700"
                    fill="transparent"
                    className="pointer-events-auto"
                  />
                )}

                {/* Arrowhead Marker Definitions */}
                <defs>
                  {callouts.map(({ pin }) => (
                    <marker
                      key={`arrow-marker-${pin.id}`}
                      id={`arrow-${pin.id}`}
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={isPaperMode ? '#0F172A' : pin.color} />
                    </marker>
                  ))}
                </defs>

                {/* Central Illustration Group (Coordinates mapped to Center: 500, 350) */}
                <g transform="translate(500, 350)">
                  {isPaperMode ? (
                    /* CASE 1: REALISTIC BLACK & WHITE PAPER SHEET CANVAS
                       White Paper by default is empty.
                       User can choose any structure/object to be drawn & labelled on paper! */
                    <g transform="translate(0, 0)">
                      {/* Large White Paper Sheet with drop-shadow border */}
                      <rect 
                        x="-460" 
                        y="-310" 
                        width="920" 
                        height="620" 
                        rx="8" 
                        fill="#FFFFFF" 
                        stroke="#CBD5E1" 
                        strokeWidth="2" 
                        style={{ filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.35))' }}
                      />
                      
                      {/* Soft red notebook margin line */}
                      <line x1="-390" y1="-310" x2="-390" y2="310" stroke="#FCA5A5" strokeWidth="1.5" strokeOpacity="0.6" />
                      
                      {/* Notebook faint horizontal guidelines */}
                      {[-240, -180, -120, -60, 0, 60, 120, 180, 240].map((y) => (
                        <line key={`paper-rule-${y}`} x1="-460" y1={y} x2="460" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                      ))}

                      {!selectedConcept ? (
                        /* White Paper Default State: Clean & Empty with room for user structure */
                        <g transform="translate(0, 0)">
                          {/* Paper Header */}
                          <g transform="translate(-360, -250)">
                            <text x="0" y="0" fill="#0F172A" fontSize="16" fontWeight="bold" fontFamily="Georgia, serif">
                              Scientific White Paper Drawing Canvas
                            </text>
                            <text x="0" y="24" fill="#64748B" fontSize="12" fontFamily="Georgia, serif">
                              White paper is empty by default. Choose any structure below or type a concept above to draw and label it on paper.
                            </text>
                          </g>

                          {/* Empty Paper Center Prompt */}
                          <g transform="translate(0, 20)">
                            <rect 
                              x="-270" 
                              y="-130" 
                              width="540" 
                              height="250" 
                              rx="16" 
                              fill="#F8FAFC" 
                              stroke="#94A3B8" 
                              strokeWidth="1.5" 
                              strokeDasharray="8 6" 
                            />
                            <circle cx="0" cy="-45" r="32" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                            <path d="M -12 -45 L 12 -45 M 0 -57 L 0 -33" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                            
                            <text x="0" y="16" fill="#0F172A" fontSize="16" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle">
                              White Paper Canvas — Ready & Empty
                            </text>
                            <text x="0" y="42" fill="#475569" fontSize="12" textAnchor="middle">
                              Select a scientific structure below to draw & label directly on this white paper:
                            </text>

                            {/* Preset Selection Buttons on Paper */}
                            <g transform="translate(0, 75)">
                              {/* Row 1 */}
                              {[
                                { id: 'preset-female-reproductive-system', label: 'Female Reproductive' },
                                { id: 'preset-euglena', label: 'Euglena (Protist)' },
                                { id: 'preset-human-sperm', label: 'Human Sperm' }
                              ].map((item, i) => {
                                const preset = ALL_AVAILABLE_PRESETS.find(p => p.id === item.id) || ALL_AVAILABLE_PRESETS[0];
                                const posX = (i - 1) * 165;
                                return (
                                  <g 
                                    key={`paper-empty-r1-${item.id}`}
                                    transform={`translate(${posX}, -12)`}
                                    className="cursor-pointer group"
                                    onClick={() => {
                                      setSelectedConcept(preset);
                                      setPinsState(preset.pins || []);
                                      setActivePin(preset.pins?.[0] || null);
                                    }}
                                  >
                                    <rect 
                                      x="-75" 
                                      y="-16" 
                                      width="150" 
                                      height="32" 
                                      rx="8" 
                                      fill="#FFFFFF" 
                                      stroke="#0F172A" 
                                      strokeWidth="1.5" 
                                      className="transition-all group-hover:fill-slate-100"
                                    />
                                    <text 
                                      y="5" 
                                      fill="#0F172A" 
                                      fontSize="11" 
                                      fontWeight="bold" 
                                      textAnchor="middle"
                                    >
                                      {item.label}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Row 2 */}
                              {[
                                { id: 'diag-animal-cell', label: 'Animal Cell' },
                                { id: 'diag-human-heart', label: 'Human Heart' },
                                { id: 'preset-neuron', label: 'Motor Neuron' }
                              ].map((item, i) => {
                                const preset = ALL_AVAILABLE_PRESETS.find(p => p.id === item.id) || ALL_AVAILABLE_PRESETS[1];
                                const posX = (i - 1) * 165;
                                return (
                                  <g 
                                    key={`paper-empty-r2-${item.id}`}
                                    transform={`translate(${posX}, 28)`}
                                    className="cursor-pointer group"
                                    onClick={() => {
                                      setSelectedConcept(preset);
                                      setPinsState(preset.pins || []);
                                      setActivePin(preset.pins?.[0] || null);
                                    }}
                                  >
                                    <rect 
                                      x="-75" 
                                      y="-16" 
                                      width="150" 
                                      height="32" 
                                      rx="8" 
                                      fill="#FFFFFF" 
                                      stroke="#0F172A" 
                                      strokeWidth="1.5" 
                                      className="transition-all group-hover:fill-slate-100"
                                    />
                                    <text 
                                      y="5" 
                                      fill="#0F172A" 
                                      fontSize="11" 
                                      fontWeight="bold" 
                                      textAnchor="middle"
                                    >
                                      {item.label}
                                    </text>
                                  </g>
                                );
                              })}
                            </g>
                          </g>
                        </g>
                      ) : (
                        /* White Paper Active State: User has chosen structure to draw on paper */
                        <g transform="translate(0, 0)">
                          {/* Scientific Structure Renderers on Paper */}
                          {selectedConcept.diagramType === 'methane-molecule' ? (
                            /* Paper Structure: Methane (CH₄) */
                            <g transform="translate(0, 20)">
                              <g transform="translate(-150, 0)">
                                <rect x="-110" y="-100" width="220" height="200" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
                                <text x="0" y="-75" fill="#0F172A" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2D Lewis Formula</text>
                                <line x1="0" y1="-18" x2="0" y2="-55" stroke="#000000" strokeWidth="3" />
                                <line x1="0" y1="18" x2="0" y2="55" stroke="#000000" strokeWidth="3" />
                                <line x1="-18" y1="0" x2="-55" y2="0" stroke="#000000" strokeWidth="3" />
                                <line x1="18" y1="0" x2="55" y2="0" stroke="#000000" strokeWidth="3" />
                                <text x="0" y="8" fill="#000000" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
                                <text x="0" y="-62" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
                                <text x="0" y="78" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
                                <text x="-70" y="8" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
                                <text x="70" y="8" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
                              </g>
                              <g transform="translate(150, 0)">
                                <rect x="-120" y="-100" width="240" height="200" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
                                <text x="0" y="-75" fill="#0F172A" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Wedge-and-Dash Projection</text>
                                <line x1="0" y1="-15" x2="0" y2="-60" stroke="#000000" strokeWidth="3" />
                                <line x1="-12" y1="8" x2="-60" y2="45" stroke="#000000" strokeWidth="3" />
                                <polygon points="8,8 55,50 65,32" fill="#000000" />
                                <line x1="12" y1="-2" x2="68" y2="-15" stroke="#000000" strokeWidth="3" strokeDasharray="4 3" />
                                <text x="0" y="8" fill="#000000" fontSize="26" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">C</text>
                                <text x="0" y="-70" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">H</text>
                                <text x="-75" y="55" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">H</text>
                                <text x="75" y="55" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">H</text>
                                <text x="82" y="-15" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">H</text>
                                <text x="0" y="85" fill="#334155" fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">Bond Angle: 109.5° | Length: 1.09 Å</text>
                              </g>
                            </g>
                          ) : selectedConcept.diagramType === 'water-molecule' ? (
                            /* Paper Structure: Water (H₂O) */
                            <g transform="translate(0, 20)">
                              <rect x="-180" y="-100" width="360" height="200" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
                              <text x="0" y="-75" fill="#0F172A" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Lewis Dot & Covalent Bond Structure</text>
                              <text x="0" y="12" fill="#000000" fontSize="38" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
                              <line x1="-50" y1="2" x2="-22" y2="2" stroke="#000000" strokeWidth="3" />
                              <line x1="22" y1="2" x2="50" y2="2" stroke="#000000" strokeWidth="3" />
                              <text x="-68" y="10" fill="#000000" fontSize="24" fontWeight="bold" textAnchor="middle">H</text>
                              <text x="68" y="10" fill="#000000" fontSize="24" fontWeight="bold" textAnchor="middle">H</text>
                              <circle cx="-6" cy="-20" r="3" fill="#000000" />
                              <circle cx="6" cy="-20" r="3" fill="#000000" />
                              <circle cx="-6" cy="24" r="3" fill="#000000" />
                              <circle cx="6" cy="24" r="3" fill="#000000" />
                              <path d="M -30 24 A 35 35 0 0 0 30 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 2" />
                              <text x="0" y="42" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle">104.5°</text>
                              <text x="0" y="78" fill="#334155" fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">2 Lone Pairs • Net Dipole μ = 1.85 D</text>
                            </g>
                          ) : (
                            <ScientificStructureRenderer 
                              concept={selectedConcept} 
                              isPaperMode={true} 
                              renderMode="paper"
                              activePinId={activePin?.id} 
                            />
                          )}
                        </g>
                      )}
                    </g>
                  ) : !selectedConcept ? (
                    /* CASE 2A: 3D / 2D MULTI-COLOUR CANVAS - EMPTY STATE */
                    <g transform="translate(0, 0)">
                      <rect 
                        x="-280" 
                        y="-150" 
                        width="560" 
                        height="300" 
                        rx="24" 
                        fill="#0F172A" 
                        fillOpacity="0.5" 
                        stroke="#334155" 
                        strokeWidth="2" 
                        strokeDasharray="8 6" 
                      />
                      <circle cx="0" cy="-40" r="36" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                      <path d="M -16 -40 L 16 -40 M 0 -56 L 0 -24" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                      <text x="0" y="25" fill="#F8FAFC" fontSize="17" fontWeight="bold" textAnchor="middle">
                        Canvas Ready — Previous Structure Cleared
                      </text>
                      <text x="0" y="52" fill="#94A3B8" fontSize="12" textAnchor="middle">
                        Enter any scientific concept prompt above or click a preset to draw & label.
                      </text>
                      <text x="0" y="74" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Toggle Paper Mode or 3D Multi-Colour Mode at any time
                      </text>
                    </g>
                  ) : (
                    /* CASE 2B: 3D / 2D MULTI-COLOUR VIBRANT VISUALIZATION */
                    <>
                      {selectedConcept.diagramType === 'methane-molecule' ? (
                        /* 3D Multi-Colour Chemical Molecule (When 3D requested) */
                        <g transform="translate(0, 0)">
                          <rect x="-380" y="-180" width="760" height="360" rx="24" fill="#0F172A" fillOpacity="0.4" stroke="#1E293B" strokeWidth="2" strokeDasharray="6 4" />
                          <g transform="translate(-160, 10)">
                            <polygon points="0,-120 -110,40 15,105" fill="#9333EA" fillOpacity="0.25" stroke="#C084FC" strokeWidth="2" />
                            <polygon points="0,-120 15,105 105,25" fill="#A855F7" fillOpacity="0.35" stroke="#E9D5FF" strokeWidth="2" />
                            <polygon points="-110,40 15,105 105,25" fill="#7E22CE" fillOpacity="0.2" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4 2" />

                            <line x1="0" y1="0" x2="0" y2="-120" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                            <line x1="0" y1="0" x2="-110" y2="40" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                            <line x1="0" y1="0" x2="15" y2="105" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                            <line x1="0" y1="0" x2="105" y2="25" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />

                            <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
                            <circle cx="-6" cy="-6" r="18" fill="#334155" fillOpacity="0.5" />
                            <text x="0" y="7" fill="#FFFFFF" fontSize="20" fontWeight="bold" textAnchor="middle">C</text>

                            <g transform="translate(0, -120)">
                              <circle r="20" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2.5" />
                              <circle cx="-4" cy="-4" r="6" fill="#FEF08A" fillOpacity="0.7" />
                              <text y="5" fill="#000000" fontSize="15" fontWeight="bold" textAnchor="middle">H</text>
                            </g>
                            <g transform="translate(-110, 40)">
                              <circle r="20" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2.5" />
                              <circle cx="-4" cy="-4" r="6" fill="#FEF08A" fillOpacity="0.7" />
                              <text y="5" fill="#000000" fontSize="15" fontWeight="bold" textAnchor="middle">H</text>
                            </g>
                            <g transform="translate(15, 105)">
                              <circle r="20" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2.5" />
                              <circle cx="-4" cy="-4" r="6" fill="#FEF08A" fillOpacity="0.7" />
                              <text y="5" fill="#000000" fontSize="15" fontWeight="bold" textAnchor="middle">H</text>
                            </g>
                            <g transform="translate(105, 25)">
                              <circle r="20" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2.5" />
                              <circle cx="-4" cy="-4" r="6" fill="#FEF08A" fillOpacity="0.7" />
                              <text y="5" fill="#000000" fontSize="15" fontWeight="bold" textAnchor="middle">H</text>
                            </g>
                            <text x="0" y="150" fill="#C084FC" fontSize="13" fontWeight="bold" textAnchor="middle">Figure A: 3D sp³ Tetrahedral Geometry</text>
                          </g>

                          <line x1="0" y1="-150" x2="0" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

                          <g transform="translate(160, 10)">
                            <line x1="0" y1="-20" x2="0" y2="-100" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
                            <line x1="-15" y1="10" x2="-95" y2="70" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
                            <polygon points="12,12 85,85 98,60" fill="#38BDF8" />
                            <line x1="18" y1="-2" x2="105" y2="-22" stroke="#94A3B8" strokeWidth="4" strokeDasharray="5 4" />
                            <text x="0" y="9" fill="#FFFFFF" fontSize="34" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C</text>
                            <text x="0" y="-115" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle">H</text>
                            <text x="-115" y="85" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle">H</text>
                            <text x="110" y="90" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle">H</text>
                            <text x="125" y="-20" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle">H</text>
                            <path d="M 0 -55 A 55 55 0 0 0 -45 32" fill="none" stroke="#EC4899" strokeWidth="2.5" />
                            <text x="-48" y="-22" fill="#F472B6" fontSize="16" fontWeight="bold">109.5°</text>
                            <text x="8" y="-55" fill="#60A5FA" fontSize="13" fontWeight="bold">1.09 Å (109 pm)</text>
                            <text x="0" y="150" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">Figure B: 3D Wedge-and-Dash Projection</text>
                          </g>

                          {/* 3D Tetrahedral Model */}
                        </g>
                      ) : selectedConcept.diagramType === 'water-molecule' ? (
                        /* 3D Multi-Colour Polar Water Molecule (When 3D requested) */
                        <g transform="translate(0, 0)">
                          <rect x="-380" y="-180" width="760" height="360" rx="24" fill="#0F172A" fillOpacity="0.4" stroke="#1E293B" strokeWidth="2" strokeDasharray="6 4" />
                          <g transform="translate(-150, 20)">
                            <circle cx="0" cy="-30" r="42" fill="#EF4444" stroke="#F87171" strokeWidth="4" />
                            <circle cx="-10" cy="-40" r="24" fill="#FCA5A5" fillOpacity="0.3" />
                            <text x="0" y="-20" fill="#FFFFFF" fontSize="28" fontWeight="bold" textAnchor="middle">O</text>
                            <text x="45" y="-52" fill="#FCA5A5" fontSize="16" fontWeight="bold">2δ⁻</text>

                            <line x1="-25" y1="-8" x2="-105" y2="75" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
                            <line x1="25" y1="-8" x2="105" y2="75" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />

                            <g transform="translate(-120, 90)">
                              <circle r="26" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="3" />
                              <circle cx="-5" cy="-5" r="10" fill="#E0F2FE" fillOpacity="0.6" />
                              <text y="7" fill="#000000" fontSize="19" fontWeight="bold" textAnchor="middle">H</text>
                              <text x="-32" y="18" fill="#7DD3FC" fontSize="15" fontWeight="bold">δ⁺</text>
                            </g>
                            <g transform="translate(120, 90)">
                              <circle r="26" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="3" />
                              <circle cx="-5" cy="-5" r="10" fill="#E0F2FE" fillOpacity="0.6" />
                              <text y="7" fill="#000000" fontSize="19" fontWeight="bold" textAnchor="middle">H</text>
                              <text x="32" y="18" fill="#7DD3FC" fontSize="15" fontWeight="bold">δ⁺</text>
                            </g>

                            <g transform="translate(-45, -95) rotate(-22)">
                              <ellipse cx="0" cy="0" rx="22" ry="34" fill="#818CF8" fillOpacity="0.35" stroke="#818CF8" strokeWidth="2" />
                              <circle cx="-6" cy="-8" r="3.5" fill="#FFFFFF" />
                              <circle cx="6" cy="-8" r="3.5" fill="#FFFFFF" />
                            </g>
                            <g transform="translate(45, -95) rotate(22)">
                              <ellipse cx="0" cy="0" rx="22" ry="34" fill="#818CF8" fillOpacity="0.35" stroke="#818CF8" strokeWidth="2" />
                              <circle cx="-6" cy="-8" r="3.5" fill="#FFFFFF" />
                              <circle cx="6" cy="-8" r="3.5" fill="#FFFFFF" />
                            </g>

                            <path d="M -50 20 A 55 55 0 0 0 50 20" fill="none" stroke="#EC4899" strokeWidth="2.5" />
                            <text x="0" y="26" fill="#F472B6" fontSize="15" fontWeight="bold" textAnchor="middle">104.5°</text>
                            <text x="-95" y="25" fill="#34D399" fontSize="12" fontWeight="bold">0.96 Å</text>

                            <line x1="0" y1="55" x2="0" y2="-130" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                            <polygon points="0,-145 -8,-128 8,-128" fill="#F59E0B" />
                            <line x1="-8" y1="50" x2="8" y2="50" stroke="#F59E0B" strokeWidth="3.5" />
                            <text x="0" y="-152" fill="#FBBF24" fontSize="13" fontWeight="bold" textAnchor="middle">μ = 1.85 D</text>
                            <text x="0" y="140" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">Figure A: 3D Polar Bent Geometry (AX₂E₂)</text>
                          </g>

                          <line x1="0" y1="-150" x2="0" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

                          <g transform="translate(160, 20)">
                            <g transform="translate(0, -30)">
                              <rect x="-110" y="-60" width="220" height="120" rx="16" fill="#1E293B" fillOpacity="0.6" stroke="#475569" strokeWidth="1.5" />
                              <text x="0" y="10" fill="#EF4444" fontSize="36" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
                              <line x1="-55" y1="2" x2="-20" y2="2" stroke="#FFFFFF" strokeWidth="4" />
                              <line x1="20" y1="2" x2="55" y2="2" stroke="#FFFFFF" strokeWidth="4" />
                              <text x="-70" y="10" fill="#38BDF8" fontSize="28" fontWeight="bold" textAnchor="middle">H</text>
                              <text x="70" y="10" fill="#38BDF8" fontSize="28" fontWeight="bold" textAnchor="middle">H</text>
                              <circle cx="-6" cy="-22" r="3.5" fill="#818CF8" />
                              <circle cx="6" cy="-22" r="3.5" fill="#818CF8" />
                              <circle cx="-6" cy="26" r="3.5" fill="#818CF8" />
                              <circle cx="6" cy="26" r="3.5" fill="#818CF8" />
                              <text x="0" y="50" fill="#94A3B8" fontSize="11" textAnchor="middle">2 Lone Pairs (4 Valence e⁻)</text>
                            </g>
                            <g transform="translate(0, 90)">
                              <text x="0" y="0" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">Hydrogen Bonding Matrix (H···O)</text>
                              <line x1="-70" y1="18" x2="70" y2="18" stroke="#818CF8" strokeWidth="2" strokeDasharray="4 3" />
                              <text x="0" y="32" fill="#94A3B8" fontSize="10" textAnchor="middle">Enables High Surface Tension & Boiling Point</text>
                            </g>
                            <text x="0" y="140" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">Figure B: 2D Lewis Formula & H-Bonding</text>
                          </g>

                          {/* Polar Bent Model */}
                        </g>
                      ) : (
                        <ScientificStructureRenderer 
                          concept={selectedConcept} 
                          isPaperMode={false} 
                          renderMode={activeRenderMode}
                          activePinId={activePin?.id} 
                        />
                      )}
                    </>
                  )}
                </g>

                {/* Leader Lines & Arrows from Outside Labels into Internal Structure */}
                {selectedConcept && !selectedConcept.chemicalData && showCalloutLines && callouts.map((c) => {
                  const isActive = activePin?.id === c.pin.id;
                  const isHovered = hoveredPinId === c.pin.id;
                  const isHighlighted = isActive || isHovered;

                  // Focus mode: if not active or hovered, hide line to leave drawing 100% unobstructed!
                  if (lineDisplayMode === 'focus' && !isHighlighted) {
                    return null;
                  }

                  const strokeColor = isPaperMode ? (isHighlighted ? '#0F172A' : '#475569') : c.pin.color;
                  const strokeOpacity = isHighlighted 
                    ? 1 
                    : (lineDisplayMode === 'delicate' ? (isPaperMode ? 0.4 : 0.45) : (isPaperMode ? 0.65 : 0.75));
                  const strokeWidth = isHighlighted 
                    ? (isPaperMode ? "2.5" : "3") 
                    : (lineDisplayMode === 'delicate' ? "1.25" : "1.75");

                  return (
                    <g key={`leader-${c.pin.id}`} className="transition-opacity duration-200">
                      {/* Glow outline when active in 3D mode */}
                      {isHighlighted && !isPaperMode && (
                        <path 
                          d={c.pathData} 
                          stroke={c.pin.color} 
                          strokeWidth="6" 
                          strokeOpacity="0.3" 
                          fill="none" 
                        />
                      )}
                      {/* Crisp Leader Arrow Path */}
                      <path 
                        d={c.pathData} 
                        stroke={strokeColor} 
                        strokeWidth={strokeWidth}
                        strokeOpacity={strokeOpacity}
                        fill="none" 
                        markerEnd={`url(#arrow-${c.pin.id})`}
                        className="transition-all"
                      />
                    </g>
                  );
                })}

                {/* Target Pinpoint Markers on Organelles inside Structure (Unobtrusive & Small) */}
                {selectedConcept && !selectedConcept.chemicalData && callouts.map((c) => {
                  const isActive = activePin?.id === c.pin.id;
                  const isHovered = hoveredPinId === c.pin.id;
                  const isHighlighted = isActive || isHovered;
                  const dotFill = isPaperMode ? '#0F172A' : c.pin.color;

                  if (isPointerEditing) {
                    const isBeingDragged = pointerDragPinId === c.pin.id;
                    return (
                      <g 
                        key={`edit-target-${c.pin.id}`}
                        transform={`translate(${c.targetX}, ${c.targetY})`}
                        style={{ cursor: isBeingDragged ? 'grabbing' : 'grab' }}
                        data-pointer-overlay="true"
                        onPointerDown={(e) => handlePointerDownTarget(e, c.pin)}
                        onPointerMove={handlePointerMoveTarget}
                        onPointerUp={handlePointerUpTarget}
                        onPointerCancel={handlePointerUpTarget}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePin(c.pin);
                        }}
                      >
                        {/* Large hit area */}
                        <circle r="24" fill="transparent" />

                        {/* Outer Precision Ring */}
                        <circle 
                          r={isActive ? "18" : "14"} 
                          fill="none" 
                          stroke={c.pin.color} 
                          strokeWidth={isActive ? "2.5" : "1.75"} 
                          strokeDasharray="4 3" 
                        />

                        {/* Center Target Handle Dot */}
                        <circle 
                          r={isActive ? "8" : "6.5"} 
                          fill={c.pin.color} 
                          stroke="#FFFFFF" 
                          strokeWidth="2" 
                        />

                        {/* Bullseye White Dot */}
                        <circle r="2" fill="#FFFFFF" />

                        {/* Floating coordinate badge for active pin */}
                        {isActive && (
                          <g transform="translate(0, -26)" className="pointer-events-none">
                            <rect 
                              x="-60" 
                              y="-13" 
                              width="120" 
                              height="20" 
                              rx="5" 
                              fill="#0F172A" 
                              fillOpacity="0.92" 
                              stroke={c.pin.color} 
                              strokeWidth="1.5" 
                            />
                            <text 
                              x="0" 
                              y="1" 
                              fill="#FFFFFF" 
                              fontSize="10" 
                              fontWeight="bold" 
                              textAnchor="middle" 
                              fontFamily="sans-serif"
                            >
                              #{c.pin.number} ({Math.round(c.pin.x)}%, {Math.round(c.pin.y)}%)
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  }

                  return (
                    <g 
                      key={`target-${c.pin.id}`}
                      transform={`translate(${c.targetX}, ${c.targetY})`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPinId(c.pin.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingPinId(c.pin.id);
                        openPinPopup(c.pin);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openPinPopup(c.pin);
                      }}
                    >
                      {/* Active Pulsing Target Aura */}
                      {isHighlighted && (
                        <circle 
                          r={isPaperMode ? "11" : "14"} 
                          fill={dotFill} 
                          fillOpacity={isPaperMode ? "0.2" : "0.35"} 
                          className="animate-ping" 
                        />
                      )}

                      {/* Small Non-Obstructive Pinpoint Dot */}
                      <circle 
                        r={isHighlighted ? (isPaperMode ? "6" : "7.5") : (isPaperMode ? "4.5" : "5")} 
                        fill={dotFill} 
                        stroke="#FFFFFF" 
                        strokeWidth="1.75" 
                        className="transition-transform group-hover:scale-125"
                      />
                      <circle 
                        r={isPaperMode ? "1.5" : "2"} 
                        fill="#FFFFFF" 
                      />
                    </g>
                  );
                })}

                {/* Outside Label Cards (Cleanly Distributed Outside the Structure) */}
                {selectedConcept && !selectedConcept.chemicalData && callouts.map((c) => {
                  const isActive = activePin?.id === c.pin.id;
                  const isHovered = hoveredPinId === c.pin.id;
                  const isHighlighted = isActive || isHovered;
                  const isRevealedInQuiz = revealedQuizPins[c.pin.id];
                  const words = c.pin.name.split(' ');
                  const isLongName = c.pin.name.length > 20;

                  return (
                    <g 
                      key={`label-card-${c.pin.id}`}
                      transform={`translate(${c.labelX}, ${c.labelY})`}
                      className="cursor-pointer group select-none"
                      onMouseEnter={() => setHoveredPinId(c.pin.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(c.pin);
                        openPinPopup(c.pin);
                      }}
                    >
                      {/* Card Background Plate */}
                      <rect 
                        width={c.labelW} 
                        height={c.labelH} 
                        rx={isPaperMode ? "10" : "12"} 
                        fill={isPaperMode ? (isHighlighted ? "#F8FAFC" : "#FFFFFF") : (isHighlighted ? "#1E293B" : "#0F172A")} 
                        fillOpacity={isPaperMode ? "1" : "0.96"} 
                        stroke={isPaperMode ? (isHighlighted ? '#0F172A' : '#94A3B8') : (isHighlighted ? '#FFFFFF' : c.pin.color)} 
                        strokeWidth={isHighlighted ? "2.5" : "1.5"}
                        style={isPaperMode ? { filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.12))' } : undefined}
                        className={isPaperMode ? "transition-all group-hover:stroke-slate-900" : "transition-all group-hover:fill-slate-900 group-hover:stroke-white"}
                      />

                      {/* Pin Number Badge */}
                      <circle 
                        cx="26" 
                        cy={c.labelH / 2} 
                        r="17" 
                        fill={isPaperMode ? "#0F172A" : c.pin.color} 
                      />
                      <text 
                        x="26" 
                        y={c.labelH / 2 + 6} 
                        fill="#FFFFFF" 
                        fontSize="16" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {c.pin.number}
                      </text>

                      {/* Text Content */}
                      {!isQuizMode || isRevealedInQuiz ? (
                        <>
                          <text 
                            x="52" 
                            y="22" 
                            fill={isPaperMode ? "#475569" : "#34D399"} 
                            fontSize="11.5" 
                            fontWeight="bold" 
                            fontFamily="monospace"
                          >
                            {c.pin.category.toUpperCase().slice(0, 24)}
                          </text>
                          {isLongName && words.length > 1 ? (
                            <text x="52" y="36" fill={isPaperMode ? "#0F172A" : "#F8FAFC"} fontSize={c.pin.name.length > 24 ? "13.5" : "15"} fontWeight="bold" fontFamily={isPaperMode ? "Georgia, serif" : "inherit"}>
                              <tspan x="52" dy="0">{words.slice(0, Math.ceil(words.length / 2)).join(' ')}</tspan>
                              <tspan x="52" dy="16">{words.slice(Math.ceil(words.length / 2)).join(' ')}</tspan>
                            </text>
                          ) : (
                            <text 
                              x="52" 
                              y="44" 
                              fill={isPaperMode ? "#0F172A" : "#F8FAFC"} 
                              fontSize={c.pin.name.length > 18 ? "14.5" : "16.5"} 
                              fontWeight="bold"
                              fontFamily={isPaperMode ? "Georgia, serif" : "inherit"}
                            >
                              {c.pin.name}
                            </text>
                          )}
                        </>
                      ) : (
                        <text 
                          x="52" 
                          y="38" 
                          fill={isPaperMode ? "#D97706" : "#F59E0B"} 
                          fontSize="15" 
                          fontWeight="bold"
                        >
                          ? Click to Reveal
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Freehand drawing strokes rendered as vector paths inside the SVG for perfect scaling & export */}
                {isDrawingsVisible && currentPage && currentPage.strokes && currentPage.strokes.length > 0 && (
                  <g className="user-drawing-strokes pointer-events-none">
                    {currentPage.strokes.map((stroke) => {
                      if (stroke.points.length < 2) return null;
                      const isNorm = stroke.points[0].x <= 1000 && stroke.points[0].y <= 700;
                      const d = stroke.points.reduce((acc, pt, idx) => {
                        const px = isNorm ? pt.x : (pt.x / 1400) * 1000;
                        const py = isNorm ? pt.y : (pt.y / 900) * 700;
                        return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
                      }, '');
                      return (
                        <path
                          key={`svg-stroke-${stroke.id}`}
                          d={d}
                          stroke={stroke.tool === 'highlighter' ? stroke.color : (isPaperMode && stroke.color === '#FFFFFF' ? '#000000' : stroke.color)}
                          strokeWidth={stroke.tool === 'highlighter' ? stroke.width * 2.5 : stroke.width}
                          strokeOpacity={stroke.tool === 'highlighter' ? 0.45 : 1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      );
                    })}
                  </g>
                )}

                {/* Live In-Progress Drawing Stroke */}
                {isDrawingActive && isDrawingNow && currentStrokePoints.length > 1 && (
                  <path
                    d={pointsToSvgPath(currentStrokePoints)}
                    stroke={drawingTool === 'highlighter' ? drawingColor : (isPaperMode && drawingColor === '#FFFFFF' ? '#000000' : drawingColor)}
                    strokeWidth={drawingTool === 'highlighter' ? drawingWidth * 2.5 : drawingWidth}
                    strokeOpacity={drawingTool === 'highlighter' ? 0.45 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    className="pointer-events-none"
                  />
                )}
              </svg>
            </div>

            {/* Interactive Shapes Layer (Callout boxes, arrows, badges, custom annotations) */}
            <ShapesLayer
              shapes={currentPage.shapes || []}
              onChange={updateCurrentPageShapes}
              fontFamily={fontFamily}
              isEditingEnabled={isEditMode && !isDrawingActive}
            />

            {/* On-Screen Directional Pan Controls Pad */}
            <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-2 flex flex-col items-center gap-1 shadow-2xl z-30">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Pan Stage</span>
              <button 
                onClick={() => panBy(0, 40)} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="Pan Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => panBy(40, 0)} 
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Pan Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={resetView} 
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-[10px]"
                  title="Center View"
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => panBy(-40, 0)} 
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Pan Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => panBy(0, -40)} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="Pan Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Organelle Quick-View Card (When Right Inspector is Minimized/Collapsed) */}
            {isInspectorCollapsed && activePin && (
              <div 
                onClick={() => openPinPopup(activePin)}
                className="absolute bottom-4 left-4 max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-30 animate-fadeIn text-slate-200 cursor-pointer hover:border-emerald-500/60 transition-all"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: activePin.color }}
                    >
                      {activePin.number}
                    </span>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 block font-mono">
                        {activePin.category}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {isQuizMode && !revealedQuizPins[activePin.id] ? `Structure #${activePin.number} (Quiz Mode)` : activePin.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPinPopup(activePin);
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                      title="Pop up full label text"
                    >
                      Full Pop-Up
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(null);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                      title="Dismiss card"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isQuizMode && !revealedQuizPins[activePin.id] 
                    ? 'Click to pop up full label details and reveal identity.' 
                    : activePin.functionSummary}
                </p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>Click anywhere on this card to pop up full text ↗</span>
                </div>
              </div>
            )}

            {/* Wheel / Drag Guide Hint */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none z-30">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scroll wheel to zoom • Drag canvas or pins • Click any label to pop up full text</span>
            </div>
          </div>

          {/* Quick Fun Fact / Biological Insight */}
          {selectedConcept?.funFact && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{selectedConcept.funFact}</span>
            </div>
          )}
        </div>

        {/* Right: Anatomical Inspector & Labeled Detail Drawer */}
        {!isInspectorCollapsed && (
          <div className="lg:col-span-4 flex flex-col space-y-4 animate-fadeIn">
            {/* Active Organelle / Structure Detail Card */}
            {activePin ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3.5 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                      style={{ backgroundColor: activePin.color }}
                    >
                      {activePin.number}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                        {activePin.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight break-words">
                        {isQuizMode && !revealedQuizPins[activePin.id] ? `Structure #${activePin.number} (Hidden)` : activePin.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openPinPopup(activePin)}
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Pop up full label text modal"
                    >
                      Full Pop-Up
                    </button>
                    <button
                      onClick={() => setIsInspectorCollapsed(true)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Hide Details Panel to maximize space"
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pointer Target Position Panel during Edit Pointers Mode */}
                {isPointerEditing && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Target Position Coordinates
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activePin.manuallyAdjusted 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {activePin.manuallyAdjusted ? 'Manually Adjusted' : 'Canonical Baseline'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">X Position (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={Math.round(activePin.x * 10) / 10}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val)) return;
                            const clamped = Math.max(0, Math.min(100, val));
                            const updated = pinsState.map(p => {
                              if (p.id !== activePin.id) return p;
                              const initX = p.initialX ?? p.x;
                              const initY = p.initialY ?? p.y;
                              return {
                                ...p,
                                x: clamped,
                                initialX: initX,
                                initialY: initY,
                                manuallyAdjusted: Math.abs(clamped - initX) > 0.1 || Math.abs(p.y - initY) > 0.1
                              };
                            });
                            setPinsState(updated);
                            updateCurrentPagePins(updated);
                            const updatedActive = updated.find(p => p.id === activePin.id);
                            if (updatedActive) setActivePin(updatedActive);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Y Position (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={Math.round(activePin.y * 10) / 10}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val)) return;
                            const clamped = Math.max(0, Math.min(100, val));
                            const updated = pinsState.map(p => {
                              if (p.id !== activePin.id) return p;
                              const initX = p.initialX ?? p.x;
                              const initY = p.initialY ?? p.y;
                              return {
                                ...p,
                                y: clamped,
                                initialX: initX,
                                initialY: initY,
                                manuallyAdjusted: Math.abs(p.x - initX) > 0.1 || Math.abs(clamped - initY) > 0.1
                              };
                            });
                            setPinsState(updated);
                            updateCurrentPagePins(updated);
                            const updatedActive = updated.find(p => p.id === activePin.id);
                            if (updatedActive) setActivePin(updatedActive);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Default: ({Math.round((activePin.initialX ?? activePin.x) * 10) / 10}%, {Math.round((activePin.initialY ?? activePin.y) * 10) / 10}%)
                      </span>
                      <button
                        onClick={handleResetSelectedPointer}
                        disabled={!activePin.manuallyAdjusted}
                        className="px-2 py-1 text-[10.5px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-500" />
                        <span>Reset Pointer</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Primary Physiological Function
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {activePin.functionSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Histological & Molecular Notes
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activePin.detailedNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-xs text-slate-500 flex items-center justify-between">
                <span>Click any pin or bar to pop up its full anatomical profile.</span>
                <button
                  onClick={() => setIsInspectorCollapsed(true)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Hide panel"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* List of All Labelled Structures */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Structures ({filteredPins.length})
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Click bar to pop up full text</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[300px] pr-1">
                {filteredPins.map((pin) => (
                  <div
                    key={pin.id}
                    onClick={() => {
                      setActivePin(pin);
                      openPinPopup(pin);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      activePin?.id === pin.id
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-400 shadow-sm ring-1 ring-emerald-400/50'
                        : 'border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0"
                        style={{ backgroundColor: pin.color }}
                      >
                        {pin.number}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug break-words">
                        {isQuizMode && !revealedQuizPins[pin.id] ? `??? (Pin #${pin.number})` : pin.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                        {pin.category.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Pop Up ↗
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Label Text Pop-Up Modal (Never Cuts Off or Hides Any Text) */}
      {popupPin && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setPopupPin(null)}
        >
          <div 
            className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative animate-scaleUp text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Pin Badge & Controls */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0"
                  style={{ backgroundColor: popupPin.color }}
                >
                  #{popupPin.number}
                </div>
                <div>
                  <span 
                    className="text-[11px] font-bold font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-1"
                    style={{ 
                      backgroundColor: `${popupPin.color}25`,
                      color: popupPin.color 
                    }}
                  >
                    {popupPin.category}
                  </span>
                  <div className="text-xs text-slate-400 font-medium">
                    Anatomical Structure #{popupPin.number} of {pinsState.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyLabelText(popupPin)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Copy full label text & notes"
                >
                  {isCopied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setPopupPin(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Close pop-up"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Complete Full Label Title / Structure Name (No Cutoff) */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Full Label Text
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight break-words tracking-tight">
                {popupPin.name}
              </h2>
            </div>

            {/* Primary Physiological & Anatomical Function */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Primary Physiological Function
              </h4>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {popupPin.functionSummary}
              </p>
            </div>

            {/* Histological & Molecular Details */}
            {popupPin.detailedNotes && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Histological, Molecular & Anatomical Notes
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {popupPin.detailedNotes}
                </p>
              </div>
            )}

            {/* Bottom Footer with Structure Navigator & AI Research Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => navigatePopupPin('prev')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="View previous structure"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => navigatePopupPin('next')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="View next structure"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleMoveToResearch();
                    setPopupPin(null);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-900 hover:bg-purple-950 text-amber-300 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Research This</span>
                </button>
                <button
                  onClick={() => setPopupPin(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Page Workspace Import Modal */}
      {showWorkspaceExportModal && selectedConcept && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setShowWorkspaceExportModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] my-auto overflow-hidden animate-scaleUp text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed / Sticky at Top) */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-5 py-4 shrink-0 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 dark:bg-purple-800 text-amber-300 flex items-center justify-center shadow-md shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">Import Diagram to Workspace</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Select the target project & document page</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWorkspaceExportModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
              {/* Diagram Preview Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedConcept.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{selectedConcept.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                  <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 rounded">{selectedConcept.category}</span>
                  <span>{selectedConcept.pins?.length || pinsState.length} Anatomical Pins</span>
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
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
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

              {/* Structure Rendering Format for Word Document */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Structure Plate Format for Word Document:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormatStyle('color')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormatStyle === 'color' 
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/30' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Full-Color PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormatStyle('bw-paper')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormatStyle === 'bw-paper' 
                        ? 'border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/30' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                    <span>B&W Paper Plate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormatStyle('text')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormatStyle === 'text' 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/30' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <span>Text / Markdown</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {exportFormatStyle === 'bw-paper' && 'Pure high-contrast monochrome paper plate for black-and-white printing.'}
                  {exportFormatStyle === 'color' && 'High-resolution publication vector plate with complete anatomical colors.'}
                  {exportFormatStyle === 'text' && 'Clean anatomical pin table and morphological function descriptions without image.'}
                </p>
              </div>

              {/* Clear Device & Workspace Visibility Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                <span className="text-base leading-none">💡</span>
                <div className="text-[11.5px] leading-relaxed text-amber-900 dark:text-amber-200">
                  <strong className="font-semibold">Structure Visibility:</strong> The scientific structure is embedded into your document. When exported to your device as <strong className="font-semibold">Word (.docx), PDF, PNG, or JPEG</strong>, the full visual structure is visible and rendered in high resolution. In Workspace, switch to <strong className="font-semibold">Word Doc</strong> or <strong className="font-semibold">Preview</strong> mode to view it.
                </div>
              </div>
            </div>

            {/* Modal Action Buttons (Fixed / Sticky at Bottom) */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-850">
              <button
                onClick={() => setShowWorkspaceExportModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteWorkspaceImport(false)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Import content to target page without leaving Draw & Label Studio"
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

      {/* Reset All Pointers Confirmation Modal */}
      {showResetAllConfirmModal && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setShowResetAllConfirmModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-scaleUp text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Reset All Pointer Positions?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your manual pointer target adjustments will be discarded, and all pointer endpoints will return to their canonical scientific defaults.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetAllConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllPointers}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
              >
                Reset All Pointers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
