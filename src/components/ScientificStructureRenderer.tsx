import React from 'react';
import { DiagramConcept } from '../types';
import {
  AnimalCellDiagram,
  PlantCellDiagram,
  BonyFishDiagram,
  HumanHeartDiagram,
  HydrocarbonsDiagram,
  BohrAtomDiagram
} from './ScientificDiagrams';
import {
  NeuronDiagram,
  HumanBrainDiagram,
  HumanEyeDiagram,
  NephronDiagram,
  MitochondrionDiagram,
  ChloroplastDiagram,
  BacterialCellDiagram,
  DNADoubleHelixDiagram,
  HumanLungsRespiratoryDiagram,
  HumanStomachDigestiveDiagram,
  SkinCrossSectionDiagram,
  HumanEarDiagram,
  FlowerAnatomyDiagram,
  BacteriophageDiagram,
  VolcanoCrossSectionDiagram,
  EuglenaDiagram,
  HumanSpermDiagram,
  AmoebaDiagram,
  ParameciumDiagram,
  DynamicCustomSvgDiagram
} from './BiologicalScientificDiagrams';
import { AgamaLizardDiagram } from './AgamaLizardDiagram';

interface ScientificStructureRendererProps {
  concept: DiagramConcept;
  isPaperMode: boolean;
  activePinId?: string | null;
  renderMode?: '3d' | '2d' | 'paper';
}

/**
 * Universal Textbook & Real-Life Scientific Structure Renderer
 * Routes every biological, anatomical, chemical, and physical concept to its
 * high-resolution, textbook-accurate vector model in both Paper (B&W) and 3D/2D (multi-colour) formats.
 */
export const ScientificStructureRenderer: React.FC<ScientificStructureRendererProps> = ({
  concept,
  isPaperMode,
  activePinId,
  renderMode
}) => {
  const effectiveRenderMode: '3d' | '2d' | 'paper' = isPaperMode 
    ? 'paper' 
    : (renderMode || concept.renderMode || '3d');

  const type = (concept.diagramType || '').toLowerCase();
  const title = (concept.title || '').toLowerCase();
  const desc = (concept.description || '').toLowerCase();
  const textCorpus = `${type} ${title} ${desc}`;

  // 1. Agama Lizard (Rainbow Rock Agama - Agama agama)
  if (type === 'agama-lizard' || /\b(agama|lizard|reptile|sauropsid|squamata|agamidae)\b/.test(textCorpus)) {
    return <AgamaLizardDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 2. Eukaryotic Animal Cell
  if (type === 'animal-cell' || /\banimal\s*cell\b/.test(textCorpus)) {
    return <AnimalCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 3. Eukaryotic Plant Cell
  if (type === 'plant-cell' || /\bplant\s*cell\b/.test(textCorpus)) {
    return <PlantCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 4. Bony Fish Anatomical Morphology
  if (type === 'bony-fish' || /\b(bony\s*fish|fish\s*anatomy|osteichthyes|operculum)\b/.test(textCorpus)) {
    return <BonyFishDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 5. Human Heart Cardiovascular
  if (type === 'human-heart' || /\b(heart|cardiac|myocardium|ventricle|atrium|aorta)\b/.test(textCorpus)) {
    return <HumanHeartDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 6. Multipolar Motor Neuron
  if (type === 'neuron' || /\b(neuron|nerve\s*cell|axon|dendrite|myelin|schwann)\b/.test(textCorpus)) {
    return <NeuronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 7. Human Brain Anatomical Lobes
  if (type === 'human-brain' || /\b(brain|cerebrum|cerebellum|brainstem|frontal\s*lobe)\b/.test(textCorpus)) {
    return <HumanBrainDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 8. Human Eye Sensory Apparatus
  if (type === 'human-eye' || /\b(eye|retina|cornea|iris|pupil|fovea|optic\s*nerve|lens)\b/.test(textCorpus)) {
    return <HumanEyeDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 9. Nephron / Renal Glomerulus
  if (type === 'nephron-kidney' || /\b(nephron|glomerulus|bowman|kidney|renal|loop\s*of\s*henle)\b/.test(textCorpus)) {
    return <NephronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 10. Mitochondrion Ultrastructure
  if (type === 'mitochondria' || /\b(mitochondri|cristae|atp\s*synthase|matrix)\b/.test(textCorpus)) {
    return <MitochondrionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 11. Chloroplast Photosynthetic Machinery
  if (type === 'chloroplast' || /\b(chloroplast|grana|thylakoid|stroma|photosynthe)\b/.test(textCorpus)) {
    return <ChloroplastDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 12. Bacterial Cell (Prokaryote)
  if (type === 'bacterial-cell' || /\b(bacteri|prokaryot|nucleoid|flagell|peptidoglycan)\b/.test(textCorpus)) {
    return <BacterialCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 13. DNA Double Helix Molecular Architecture
  if (type === 'dna-helix' || /\b(dna|double\s*helix|watson\s*crick|nucleotide|base\s*pair)\b/.test(textCorpus)) {
    return <DNADoubleHelixDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 14. Lungs & Respiratory Branching Tree
  if (type === 'lungs-respiratory' || /\b(lung|respirat|trachea|bronch|alveol|pulmonary)\b/.test(textCorpus)) {
    return <HumanLungsRespiratoryDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 15. Human Stomach & Digestive Glands
  if (type === 'stomach-digestive' || /\b(stomach|gastric|digest|rugae|pylor|fundus)\b/.test(textCorpus)) {
    return <HumanStomachDigestiveDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 16. Skin Integumentary Layers
  if (type === 'skin-anatomy' || /\b(skin|epidermis|dermis|hypodermis|hair\s*follicle|integument)\b/.test(textCorpus)) {
    return <SkinCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 17. Human Ear Auditory Apparatus
  if (type === 'human-ear' || /\b(ear|pinna|cochlea|tympanic|ossicle|eardrum|auditory)\b/.test(textCorpus)) {
    return <HumanEarDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 18. Flower Angiosperm Reproductive Anatomy
  if (type === 'flower-anatomy' || /\b(flower|angiosperm|petal|stamen|anther|carpel|pistil|stigma|ovary)\b/.test(textCorpus)) {
    return <FlowerAnatomyDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 19. T4 Bacteriophage Complex
  if (type === 'bacteriophage' || /\b(phage|bacteriophage|capsid|t4\s*virus|tail\s*fiber)\b/.test(textCorpus)) {
    return <BacteriophageDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 20. Stratovolcano Subterranean Magma Chamber
  if (type === 'volcano' || /\b(volcano|magma|lava|crater|conduit|caldera|eruption)\b/.test(textCorpus)) {
    return <VolcanoCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 21. Euglena Viridis / Gracilis Flagellated Protist
  if (type === 'euglena' || type === 'euglena-protist' || /\b(euglena|euglenoid|euglenophyta|euglena\s*gracilis|euglena\s*viridis|mastigophora|flagellate\s*protist)\b/.test(textCorpus)) {
    return <EuglenaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // High-Resolution Human Sperm (Spermatozoon / Male Gamete)
  if (type === 'human-sperm' || /\b(sperm|spermatozo|spermatozoon|male\s*gamete|acrosome|axoneme|spermatid)\b/.test(textCorpus)) {
    return <HumanSpermDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 22. Amoeba Proteus Sarcodina / Rhizopod
  if (type === 'amoeba' || type === 'amoeba-proteus' || /\b(amoeba|ameba|amoeba\s*proteus|pseudopod|lobopod|sarcodina|rhizopod)\b/.test(textCorpus)) {
    return <AmoebaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 23. Paramecium Caudatum Ciliated Protist
  if (type === 'paramecium' || type === 'paramecium-caudatum' || /\b(parameci|paramecium|paramecium\s*caudatum|ciliate|ciliophora)\b/.test(textCorpus)) {
    return <ParameciumDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 24. Alkanes & Saturated Hydrocarbons
  if (type === 'hydrocarbon-alkanes' || /\b(alkane|hydrocarbon|ethane|propane)\b/.test(textCorpus)) {
    return <HydrocarbonsDiagram isPaperMode={isPaperMode} />;
  }

  // 21. Methane Molecule (CH₄)
  if (type === 'methane-molecule' || /\bmethane\b/.test(textCorpus)) {
    return (
      <g id="methane-structure-renderer" transform="translate(0, 0)">
        {isPaperMode ? (
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
              <rect x="-110" y="-100" width="220" height="200" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
              <text x="0" y="-75" fill="#0F172A" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3D Tetrahedral Projection</text>
              <line x1="0" y1="-15" x2="0" y2="-65" stroke="#000000" strokeWidth="3" />
              <line x1="-15" y1="10" x2="-65" y2="45" stroke="#000000" strokeWidth="3" />
              <polygon points="0,0 45,35 60,25" fill="#000000" />
              <line x1="15" y1="-10" x2="60" y2="-35" stroke="#000000" strokeWidth="3" strokeDasharray="4 3" />
              <text x="0" y="8" fill="#000000" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
              <text x="0" y="-72" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
              <text x="-78" y="55" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
              <text x="75" y="42" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
              <text x="72" y="-38" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
              <text x="0" y="80" fill="#334155" fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">109.5° Tetrahedral Angle</text>
            </g>
          </g>
        ) : (
          <g transform="translate(0, 0)">
            <line x1="0" y1="0" x2="-110" y2="-110" stroke="#64748B" strokeWidth="10" strokeLinecap="round" />
            <line x1="0" y1="0" x2="110" y2="-110" stroke="#64748B" strokeWidth="10" strokeLinecap="round" />
            <line x1="0" y1="0" x2="-110" y2="110" stroke="#64748B" strokeWidth="10" strokeLinecap="round" />
            <line x1="0" y1="0" x2="110" y2="110" stroke="#64748B" strokeWidth="10" strokeLinecap="round" />
            {[-110, 110].flatMap(x => [-110, 110].map(y => ({ x, y }))).map((pos, idx) => (
              <g key={`methane-h-${idx}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r="30" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="3" />
                <text y="9" fontSize="24" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
              </g>
            ))}
            <circle r="44" fill="#EF4444" stroke="#FEE2E2" strokeWidth="4" />
            <text y="12" fontSize="36" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">C</text>
          </g>
        )}
      </g>
    );
  }

  // 22. Water Molecule (H₂O)
  if (type === 'water-molecule' || /\b(water\s*molecule|h2o)\b/.test(textCorpus)) {
    return (
      <g id="water-structure-renderer" transform="translate(0, 0)">
        {isPaperMode ? (
          <g transform="translate(0, 20)">
            <rect x="-180" y="-100" width="360" height="200" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
            <text x="0" y="-75" fill="#0F172A" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Lewis Dot & Covalent Bond Structure</text>
            <line x1="-15" y1="-10" x2="-90" y2="40" stroke="#000000" strokeWidth="3" />
            <line x1="15" y1="-10" x2="90" y2="40" stroke="#000000" strokeWidth="3" />
            <text x="0" y="8" fill="#000000" fontSize="32" fontWeight="bold" fontFamily="monospace" textAnchor="middle">O</text>
            <text x="-105" y="52" fill="#000000" fontSize="22" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
            <text x="105" y="52" fill="#000000" fontSize="22" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
            <circle cx="-12" cy="-28" r="3" fill="#000000" /><circle cx="-5" cy="-35" r="3" fill="#000000" />
            <circle cx="12" cy="-28" r="3" fill="#000000" /><circle cx="5" cy="-35" r="3" fill="#000000" />
            <path d="M -45 20 Q 0 45 45 20" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <text x="0" y="42" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle">104.5°</text>
            <text x="0" y="78" fill="#334155" fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">2 Lone Pairs • Net Dipole μ = 1.85 D</text>
          </g>
        ) : (
          <g transform="translate(0, 0)">
            <line x1="0" y1="-40" x2="-110" y2="100" stroke="#64748B" strokeWidth="12" strokeLinecap="round" />
            <line x1="0" y1="-40" x2="110" y2="100" stroke="#64748B" strokeWidth="12" strokeLinecap="round" />
            <g transform="translate(-110, 100)">
              <circle r="36" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="3" />
              <text y="10" fontSize="28" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
            </g>
            <g transform="translate(110, 100)">
              <circle r="36" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="3" />
              <text y="10" fontSize="28" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">H</text>
            </g>
            <g transform="translate(0, -40)">
              <circle r="52" fill="#EF4444" stroke="#FEE2E2" strokeWidth="4" />
              <text y="14" fontSize="42" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#FFF">O</text>
            </g>
            <path d="M -45 35 Q 0 65 45 35" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="4 2" fill="none" />
            <text x="0" y="58" fill="#FDE68A" fontSize="13" fontWeight="bold" textAnchor="middle">104.5°</text>
          </g>
        )}
      </g>
    );
  }

  // 23. Rutherford-Bohr Quantized Atom
  if (type === 'bohr-atom' || /\b(bohr|rutherford|electron\s*orbital|quantum\s*shell)\b/.test(textCorpus)) {
    return <BohrAtomDiagram isPaperMode={isPaperMode} />;
  }

  // 24. AI-Generated Dynamic Custom SVG (If customSvgCode is present in concept)
  if (concept.customSvgCode && concept.customSvgCode.trim().length > 0) {
    return <DynamicCustomSvgDiagram svgCode={concept.customSvgCode} isPaperMode={isPaperMode} />;
  }

  // 25. Default Authentic Scientific Cross-Section Schematic (Rich, anatomical fallback instead of blank concentric circles)
  return (
    <g id="authentic-scientific-schematic" transform="translate(0, 0)">
      {/* Outer Specimen Capsule / Membrane Boundary */}
      <path
        d="M -180 -100 
           C -90 -130 90 -130 180 -100 
           C 220 -40 220 60 180 110 
           C 90 140 -90 140 -180 110 
           C -220 60 -220 -40 -180 -100 Z"
        fill={isPaperMode ? '#FFFFFF' : '#0F172A'}
        fillOpacity={isPaperMode ? 1 : 0.9}
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />
      {/* Internal Cytoplasmic / Matrix Stroma */}
      <path
        d="M -160 -85 
           C -80 -110 80 -110 160 -85 
           C 195 -35 195 50 160 95 
           C 80 120 -80 120 -160 95 
           C -195 50 -195 -35 -160 -85 Z"
        fill={isPaperMode ? '#F8FAFC' : '#1E293B'}
        fillOpacity={isPaperMode ? 1 : 0.6}
        stroke={isPaperMode ? '#475569' : '#0EA5E9'}
        strokeWidth={isPaperMode ? 1.5 : 1.5}
        strokeDasharray="5 3"
      />
      {/* Central Nuclear / Catalytic Core */}
      <ellipse
        cx="0"
        cy="0"
        rx="55"
        ry="42"
        fill={isPaperMode ? '#E2E8F0' : '#312E81'}
        stroke={isPaperMode ? '#000000' : '#818CF8'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      <circle cx="-5" cy="-2" r="18" fill={isPaperMode ? '#CBD5E1' : '#4338CA'} stroke={isPaperMode ? '#000000' : '#A78BFA'} strokeWidth={1.5} />
      {/* Organelle / Structural Compartment 1 (Left Lateral) */}
      <path
        d="M -115 -45 C -85 -55 -65 -35 -75 -15 C -85 5 -125 5 -135 -15 C -145 -35 -130 -45 -115 -45 Z"
        fill={isPaperMode ? '#FFFFFF' : '#065F46'}
        stroke={isPaperMode ? '#000000' : '#10B981'}
        strokeWidth={1.75}
      />
      {/* Organelle / Structural Compartment 2 (Right Lateral Reticulum) */}
      <path
        d="M 75 -25 Q 115 -40 135 -10 Q 145 25 115 40 Q 85 30 75 -25"
        fill={isPaperMode ? '#FFFFFF' : '#831843'}
        stroke={isPaperMode ? '#000000' : '#F43F5E'}
        strokeWidth={1.75}
      />
      {/* Scientific Measurement Calipers / Scale Grid Lines */}
      <line x1="-190" y1="130" x2="190" y2="130" stroke={isPaperMode ? '#64748B' : '#475569'} strokeWidth={1} strokeDasharray="4 2" />
      <text x="0" y="145" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="10" fontFamily="monospace" textAnchor="middle">
        Morphological Cross-Sectional Plane • Real-Life Structural Scale
      </text>
    </g>
  );
};
