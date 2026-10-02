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
  HumanDigestiveSystemDiagram,
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
  FemaleReproductiveSystemDiagram,
  CarbonCycleDiagram,
  NitrogenCycleDiagram,
  MaleReproductiveSystemDiagram,
  WaterCycleDiagram,
  ElectricCircuitDiagram,
  ElectromagneticSpectrumDiagram,
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

  const type = (concept.diagramType || '').toLowerCase().trim();
  const title = (concept.title || '').toLowerCase().trim();
  const titleAndType = `${type} ${title}`;

  // =========================================================================
  // STAGE 1: DIRECT EXACT DIAGRAM-TYPE DISPATCH TABLE (Highest Priority)
  // Ensures that when a specific diagramType is assigned, it NEVER misroutes!
  // =========================================================================

  // 1. Protozoa & Microorganisms
  if (type === 'paramecium' || type === 'paramecium-caudatum') {
    return <ParameciumDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'amoeba' || type === 'amoeba-proteus') {
    return <AmoebaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'euglena' || type === 'euglena-protist' || type === 'euglena-gracilis' || type === 'euglena-viridis') {
    return <EuglenaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'bacterial-cell' || type === 'bacteria' || type === 'prokaryote') {
    return <BacterialCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'bacteriophage' || type === 't4-phage') {
    return <BacteriophageDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 2. Reproductive & Gamete Anatomy
  if (type === 'female-reproductive-system' || type === 'female-reproductive' || type === 'female-reproductive-organs') {
    return <FemaleReproductiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'male-reproductive-system' || type === 'male-reproductive' || type === 'male-reproductive-organs') {
    return <MaleReproductiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'human-sperm' || type === 'sperm' || type === 'spermatozoon') {
    return <HumanSpermDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 3. Human Organ Systems
  if (type === 'human-heart' || type === 'heart') {
    return <HumanHeartDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'neuron' || type === 'motor-neuron' || type === 'nerve-cell') {
    return <NeuronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'human-brain' || type === 'brain') {
    return <HumanBrainDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'human-eye' || type === 'eye') {
    return <HumanEyeDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'human-ear' || type === 'ear') {
    return <HumanEarDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'nephron-kidney' || type === 'nephron' || type === 'kidney') {
    return <NephronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'lungs-respiratory' || type === 'lungs' || type === 'respiratory-system') {
    return <HumanLungsRespiratoryDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'digestive-system' || type === 'human-digestive-system' || type === 'digestive' || type === 'gastrointestinal') {
    return <HumanDigestiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'stomach-digestive' || type === 'stomach') {
    return <HumanStomachDigestiveDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'skin-anatomy' || type === 'skin-cross-section' || type === 'skin') {
    return <SkinCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 4. Cellular Biology & Organelles
  if (type === 'animal-cell') {
    return <AnimalCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'plant-cell') {
    return <PlantCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'mitochondria' || type === 'mitochondrion') {
    return <MitochondrionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'chloroplast') {
    return <ChloroplastDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'dna-helix' || type === 'dna') {
    return <DNADoubleHelixDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 5. Zoology & Botany
  if (type === 'bony-fish' || type === 'fish') {
    return <BonyFishDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'agama-lizard' || type === 'lizard') {
    return <AgamaLizardDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'flower-anatomy' || type === 'flower') {
    return <FlowerAnatomyDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 6. Earth & Physical Cycles / Physics / Chemistry
  if (type === 'carbon-cycle' || type === 'global-carbon-cycle') {
    return <CarbonCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'nitrogen-cycle') {
    return <NitrogenCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'water-cycle' || type === 'hydrological-cycle') {
    return <WaterCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'volcano') {
    return <VolcanoCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'electric-circuit' || type === 'circuit') {
    return <ElectricCircuitDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'electromagnetic-spectrum' || type === 'em-spectrum') {
    return <ElectromagneticSpectrumDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (type === 'hydrocarbon-alkanes' || type === 'hydrocarbons') {
    return <HydrocarbonsDiagram isPaperMode={isPaperMode} />;
  }
  if (type === 'bohr-atom' || type === 'atom') {
    return <BohrAtomDiagram isPaperMode={isPaperMode} />;
  }

  // =========================================================================
  // STAGE 2: PRECISE TITLE MATCHING (For user custom queries or fallback titles)
  // We match ONLY against the title and type keywords, NOT generic paragraphs!
  // =========================================================================

  // 1. Paramecium & Ciliates
  if (/\b(parameci|paramecium|ciliate|ciliophora)\b/i.test(titleAndType)) {
    return <ParameciumDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 2. Amoeba & Sarcodines
  if (/\b(amoeba|ameba|pseudopod|sarcodina|rhizopod)\b/i.test(titleAndType)) {
    return <AmoebaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 3. Euglena & Flagellates
  if (/\b(euglena|euglenoid|euglenophyta|flagellate\s*protist)\b/i.test(titleAndType)) {
    return <EuglenaDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 4. Female Reproductive System
  if (/\b(female\s*reproductive|uterus|womb|fallopian|oviduct|fimbriae|endometrium|myometrium|cervix|vagina|ovaries|ovary|graafian\s*follicle)\b/i.test(titleAndType)) {
    return <FemaleReproductiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 5. Male Reproductive System
  if (/\b(male\s*reproductive|testis|testes|vas\s*deferens|scrotum|prostate|seminal\s*vesicle|epididymis)\b/i.test(titleAndType)) {
    return <MaleReproductiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 6. Human Sperm
  if (/\b(sperm|spermatozoon|spermatozoa|sperm\s*cell|male\s*gamete|acrosome|spermatid|spermiogenesis)\b/i.test(titleAndType)) {
    return <HumanSpermDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 7. Human Heart
  if (/\b(heart|cardiac|myocardium|ventricle|atrium|aorta|cardiovascular)\b/i.test(titleAndType)) {
    return <HumanHeartDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 8. Motor Neuron
  if (/\b(neuron|nerve\s*cell|axon|dendrite|myelin|schwann|synapse)\b/i.test(titleAndType)) {
    return <NeuronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 9. Human Brain
  if (/\b(brain|cerebrum|cerebellum|brainstem|frontal\s*lobe|cortex)\b/i.test(titleAndType)) {
    return <HumanBrainDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 10. Human Eye
  if (/\b(eye|retina|cornea|iris|pupil|fovea|optic\s*nerve|lens|sclera)\b/i.test(titleAndType)) {
    return <HumanEyeDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 11. Human Ear
  if (/\b(ear|pinna|cochlea|tympanic|ossicle|eardrum|auditory)\b/i.test(titleAndType)) {
    return <HumanEarDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 12. Nephron & Kidney
  if (/\b(nephron|glomerulus|bowman|kidney|renal|loop\s*of\s*henle)\b/i.test(titleAndType)) {
    return <NephronDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 13. Lungs & Respiratory
  if (/\b(lung|respirat|trachea|bronch|alveol|pulmonary|pleura)\b/i.test(titleAndType)) {
    return <HumanLungsRespiratoryDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 14. Digestive System & Stomach
  if (/\b(stomach|gastric|rugae|pylor)\b/i.test(titleAndType)) {
    return <HumanStomachDigestiveDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(digestive|alimentary|gastrointestinal|gut\s*anatomy|colon|intestine)\b/i.test(titleAndType)) {
    return <HumanDigestiveSystemDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 15. Skin / Integumentary (Strict match on title/type only!)
  if (/\b(skin\s*cross|skin\s*layer|human\s*skin|skin\s*anatomy|integument|epidermis\s*and\s*dermis|hair\s*follicle\s*structure)\b/i.test(titleAndType)) {
    return <SkinCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 16. Animal & Plant Cells & Organelles
  if (/\banimal\s*cell\b/i.test(titleAndType)) {
    return <AnimalCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\bplant\s*cell\b/i.test(titleAndType)) {
    return <PlantCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(mitochondri|cristae|matrix)\b/i.test(titleAndType)) {
    return <MitochondrionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(chloroplast|grana|thylakoid|stroma)\b/i.test(titleAndType)) {
    return <ChloroplastDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(dna|double\s*helix|watson\s*crick)\b/i.test(titleAndType)) {
    return <DNADoubleHelixDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(bacteri|prokaryot|nucleoid)\b/i.test(titleAndType)) {
    return <BacterialCellDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(phage|bacteriophage|capsid)\b/i.test(titleAndType)) {
    return <BacteriophageDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 17. Animals & Plants
  if (/\b(bony\s*fish|fish\s*anatomy|osteichthyes|operculum)\b/i.test(titleAndType)) {
    return <BonyFishDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(agama|lizard|reptile|sauropsid)\b/i.test(titleAndType)) {
    return <AgamaLizardDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(flower|angiosperm|petal|stamen|carpel|pistil|anther)\b/i.test(titleAndType)) {
    return <FlowerAnatomyDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }

  // 18. Physical Cycles & Forces
  if (/\b(carbon\s*cycle|biogeochemical\s*carbon)\b/i.test(titleAndType)) {
    return <CarbonCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(nitrogen\s*cycle|nitrogen\s*fixation)\b/i.test(titleAndType)) {
    return <NitrogenCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(water\s*cycle|hydrologic\s*cycle|hydrological\s*cycle)\b/i.test(titleAndType)) {
    return <WaterCycleDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(volcano|magma|crater|conduit)\b/i.test(titleAndType)) {
    return <VolcanoCrossSectionDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(electric\s*circuit|circuit\s*diagram|ohms?\s*law|schematic\s*circuit)\b/i.test(titleAndType)) {
    return <ElectricCircuitDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(electromagnetic\s*spectrum|em\s*spectrum|light\s*spectrum)\b/i.test(titleAndType)) {
    return <ElectromagneticSpectrumDiagram isPaperMode={isPaperMode} renderMode={effectiveRenderMode} activePinId={activePinId} />;
  }
  if (/\b(alkane|hydrocarbon|ethane|propane)\b/i.test(titleAndType)) {
    return <HydrocarbonsDiagram isPaperMode={isPaperMode} />;
  }

  // Methane Molecule (CH₄)
  if (type === 'methane-molecule' || /\bmethane\b/i.test(titleAndType)) {
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

  // Water Molecule (H₂O)
  if (type === 'water-molecule' || /\b(water\s*molecule|h2o)\b/i.test(titleAndType)) {
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

  // Rutherford-Bohr Quantized Atom
  if (type === 'bohr-atom' || /\b(bohr|rutherford|electron\s*orbital|quantum\s*shell)\b/i.test(titleAndType)) {
    return <BohrAtomDiagram isPaperMode={isPaperMode} />;
  }

  // =========================================================================
  // STAGE 3: DYNAMIC AI-GENERATED CUSTOM SVG CODE
  // =========================================================================
  if (concept.customSvgCode && concept.customSvgCode.trim().length > 0) {
    return <DynamicCustomSvgDiagram svgCode={concept.customSvgCode} isPaperMode={isPaperMode} />;
  }

  // =========================================================================
  // STAGE 4: DEFAULT SCIENTIFIC SCHEMATIC (Graceful, high-contrast fallback)
  // =========================================================================
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
