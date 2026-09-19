import { DiagramConcept, LabelPin } from '../types';

export interface ScientificPresetConfig {
  diagramType: string;
  category: DiagramConcept['category'];
  domain: DiagramConcept['domain'];
  defaultRenderMode: '3d' | '2d' | 'paper';
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  pins: LabelPin[];
}

export const SCIENTIFIC_PRESETS_REGISTRY: Record<string, ScientificPresetConfig> = {
  'neuron': {
    diagramType: 'neuron',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Multipolar Motor Neuron (Nerve Cell)',
    subtitle: 'Neuronal morphology: Soma, dendrites, axon hillock, myelin sheath & synaptic boutons',
    description: 'Textbook anatomical diagram of a multipolar neuron illustrating receptive dendritic arbor, perikaryon (soma) with Nissl bodies and nucleus, axon hillock trigger zone, long axon wrapped in Schwann cell myelin sheaths, Nodes of Ranvier for saltatory conduction, and telodendria with terminal synaptic buttons.',
    funFact: 'Action potentials jump from one Node of Ranvier to the next in saltatory conduction, boosting nerve impulse speeds up to 120 meters per second (over 260 mph).',
    pins: [
      {
        id: 'p-neuron-1',
        number: 1,
        name: 'Dendrites & Spines',
        x: 22,
        y: 28,
        color: '#818CF8',
        category: 'Receptive Zone',
        functionSummary: 'Branching tree receiving incoming synaptic chemical signals from other neurons.',
        detailedNotes: 'Dendrites provide an expansive surface area covered in dendritic spines that form postsynaptic densities for chemical neurotransmission.'
      },
      {
        id: 'p-neuron-2',
        number: 2,
        name: 'Soma (Cell Body / Perikaryon)',
        x: 32,
        y: 48,
        color: '#4F46E5',
        category: 'Metabolic Core',
        functionSummary: 'Biosynthetic hub containing the nucleus, Golgi, and protein-synthesizing Nissl granules.',
        detailedNotes: 'Integrates incoming graded potentials from dendrites to determine whether to trigger an all-or-none action potential.'
      },
      {
        id: 'p-neuron-3',
        number: 3,
        name: 'Axon Hillock (Trigger Zone)',
        x: 42,
        y: 49,
        color: '#6366F1',
        category: 'Action Potential Origin',
        functionSummary: 'High-density voltage-gated Na⁺ channel zone where nerve impulses are initiated.',
        detailedNotes: 'If summation of EPSPs and IPSPs depolarizes the axon hillock membrane past the -55 mV threshold, an action potential fires.'
      },
      {
        id: 'p-neuron-4',
        number: 4,
        name: 'Myelin Sheath (Schwann Cell)',
        x: 52,
        y: 45,
        color: '#0284C7',
        category: 'Insulative Layer',
        functionSummary: 'Multilayered lipid-protein wrapping that insulates the axon and minimizes ion leakage.',
        detailedNotes: 'Formed by Schwann cells in the peripheral nervous system (PNS) and oligodendrocytes in the central nervous system (CNS).'
      },
      {
        id: 'p-neuron-5',
        number: 5,
        name: 'Node of Ranvier',
        x: 59,
        y: 54,
        color: '#F43F5E',
        category: 'Conduction Node',
        functionSummary: 'Unmyelinated gap rich in Na⁺ channels enabling rapid saltatory conduction.',
        detailedNotes: 'Allows regenerative ionic exchange so the action potential maintains amplitude as it travels down long distances.'
      },
      {
        id: 'p-neuron-6',
        number: 6,
        name: 'Axon Terminal Boutons',
        x: 78,
        y: 44,
        color: '#10B981',
        category: 'Transmitter Release',
        functionSummary: 'Swollen bulbous tips containing neurotransmitter vesicles for chemical synapse signaling.',
        detailedNotes: 'Depolarization opens voltage-gated Ca²⁺ channels, triggering exocytosis of neurotransmitters (e.g., acetylcholine, glutamate) into the synaptic cleft.'
      }
    ]
  },

  'human-sperm': {
    diagramType: 'human-sperm',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Sperm (Spermatozoon / Male Gamete)',
    subtitle: 'Cytology & Motility: Acrosome cap, haploid nucleus, neck centrioles, mitochondrial sheath, 9+2 axoneme, principal piece & end piece',
    description: 'High-resolution anatomical cross-section and ultrastructure of the human spermatozoon (sperm cell) depicting the flattened oval Head (acrosomal cap with hydrolytic enzymes hyaluronidase/acrosin, haploid nucleus with highly condensed protamine-bound paternal chromatin, and post-acrosomal lamina), Neck (connecting piece with proximal centriole and distal basal body), Middle Piece (dense helical mitochondrial sheath producing ATP via oxidative phosphorylation and outer dense fibers), Annulus (Ring of Jensen), Principal Piece (fibrous sheath with longitudinal columns and ribs surrounding the 9+2 microtubule axoneme), and End Piece (tapered terminal axoneme).',
    funFact: 'A human sperm travels at roughly 1 to 4 millimeters per minute; its mitochondrial sheath in the middle piece generates massive amounts of ATP to drive the dynein-motor sliding of the 9+2 axoneme for over 48 hours in the female reproductive tract.',
    pins: [
      {
        id: 'p-sperm-acrosome',
        number: 1,
        name: 'Acrosome (Acrosomal Cap)',
        x: 50,
        y: 16,
        color: '#06B6D4',
        category: 'Fertilization Enzymes',
        functionSummary: 'Enzyme-filled anterior vesicle containing hyaluronidase and acrosin that digest the ovum’s corona radiata and zona pellucida during the acrosome reaction.',
        detailedNotes: 'Derived from Golgi cisternae during spermiogenesis; covers the anterior 2/3 of the sperm nucleus.'
      },
      {
        id: 'p-sperm-nucleus',
        number: 2,
        name: 'Haploid Nucleus (Condensed Chromatin)',
        x: 50,
        y: 25,
        color: '#6366F1',
        category: 'Genetic Material',
        functionSummary: 'Extremely dense haploid chromatin core containing 23 chromosomes (22 autosomes + X or Y) tightly packaged with basic protamine proteins.',
        detailedNotes: 'Protamines replace histones during spermiogenesis to achieve near-crystalline genetic condensation and aerodynamic hydrodynamic efficiency.'
      },
      {
        id: 'p-sperm-plasma-membrane',
        number: 3,
        name: 'Plasma Membrane',
        x: 58,
        y: 22,
        color: '#10B981',
        category: 'Cell Envelope',
        functionSummary: 'Phospholipid bilayer enriched with polyunsaturated fatty acids and receptors (e.g., Izumo1) essential for sperm-egg membrane fusion.',
        detailedNotes: 'Undergoes capacitation within the female reproductive tract, shedding decapacitation factors to prime the sperm for the acrosome reaction.'
      },
      {
        id: 'p-sperm-post-acrosomal',
        number: 4,
        name: 'Post-Acrosomal Sheath',
        x: 52,
        y: 31,
        color: '#8B5CF6',
        category: 'Head Base',
        functionSummary: 'Dense sub-membranous protein layer covering the posterior third of the sperm head between the acrosome and neck.',
        detailedNotes: 'Contains perinuclear theca proteins including post-acrosomal sheath WW domain-binding protein (PAWP) involved in egg activation.'
      },
      {
        id: 'p-sperm-neck',
        number: 5,
        name: 'Neck (Connecting Piece / Capitulum)',
        x: 50,
        y: 36,
        color: '#F59E0B',
        category: 'Structural Junction',
        functionSummary: 'Articulating collar containing striated segmented columns and the capitulum that firmly anchors the sperm head to the flagellar tail.',
        detailedNotes: 'Acts as the flexible hinge transmitting mechanical torque while safeguarding the sperm head from bending detachment.'
      },
      {
        id: 'p-sperm-proximal-centriole',
        number: 6,
        name: 'Proximal Centriole',
        x: 46,
        y: 37,
        color: '#EAB308',
        category: 'Mitotic Template',
        functionSummary: 'Perpendicular 9-triplet microtubular barrel donated to the fertilized ovum to establish the zygote’s first mitotic spindle.',
        detailedNotes: 'The egg lacks a functional centriole; paternal inheritance of the proximal centriole is mandatory for embryonic cleavage division.'
      },
      {
        id: 'p-sperm-mitochondria',
        number: 7,
        name: 'Mitochondrial Sheath (Nebenkern)',
        x: 54,
        y: 45,
        color: '#EF4444',
        category: 'Bioenergetics / ATP',
        functionSummary: 'Helical arrangement of 50–75 tightly packed mitochondria spiraling around the axoneme to power flagellar beating with ATP.',
        detailedNotes: 'Specialized for high-rate oxidative phosphorylation; maternal mitochondria are marked with ubiquitin upon fertilization and destroyed.'
      },
      {
        id: 'p-sperm-middle-piece',
        number: 8,
        name: 'Middle Piece (Midpiece / Pars Intermedia)',
        x: 45,
        y: 45,
        color: '#F97316',
        category: 'Flagellar Engine',
        functionSummary: 'Segment of flagellum between neck and annulus (approx 5-7 µm long) housing the mitochondrial sheath and 9 outer dense fibers.',
        detailedNotes: 'Primary metabolic powerhouse generating kinetic energy for sustained progressive motility.'
      },
      {
        id: 'p-sperm-annulus',
        number: 9,
        name: 'Annulus (Ring of Jensen)',
        x: 50,
        y: 53,
        color: '#9333EA',
        category: 'Structural Boundary',
        functionSummary: 'Septin-rich fibrous ring marking the junction between the middle piece and principal piece.',
        detailedNotes: 'Prevents mitochondria from slipping down into the tail and acts as a diffusion barrier restricting membrane protein domains.'
      },
      {
        id: 'p-sperm-axoneme',
        number: 10,
        name: 'Axoneme (9+2 Microtubule Core)',
        x: 48,
        y: 63,
        color: '#3B82F6',
        category: 'Motor Core',
        functionSummary: 'Central contractile engine composed of 9 peripheral doublet microtubules with ATP-powered dynein arms around 2 central singlets.',
        detailedNotes: 'Dynein arms generate ATP-dependent microtubule sliding, which is converted into planar and helical sinusoidal flagellar waves.'
      },
      {
        id: 'p-sperm-fibrous-sheath',
        number: 11,
        name: 'Fibrous Sheath (Principal Piece)',
        x: 54,
        y: 72,
        color: '#0284C7',
        category: 'Flagellar Support',
        functionSummary: 'Cytoskeletal cylinder of 2 longitudinal columns connected by transverse semicircular ribs surrounding the axoneme in the principal piece.',
        detailedNotes: 'Provides mechanical stiffness, anchors glycolytic enzymes (e.g., GAPD-S) for local tail ATP generation, and confines flagellar bend planes.'
      },
      {
        id: 'p-sperm-end-piece',
        number: 12,
        name: 'End Piece (Terminal Segment)',
        x: 50,
        y: 92,
        color: '#64748B',
        category: 'Tail Tip',
        functionSummary: 'Terminal 5 µm tip of the tail where the fibrous sheath terminates, leaving bare axonemal microtubules enclosed in plasma membrane.',
        detailedNotes: 'Tapers to disorganized microtubule singlets; marks the hydrodynamic trailing edge of the sperm.'
      }
    ]
  },

  'human-brain': {
    diagramType: 'human-brain',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Brain Sagittal Section & Lobes',
    subtitle: 'Gross neuroanatomy: Cerebral cortex, corpus callosum, thalamus, cerebellum & brainstem',
    description: 'Anatomical cross-section of the human brain illustrating the convoluted cerebrum with sulci and gyri (frontal, parietal, occipital, temporal lobes), the C-shaped corpus callosum white matter tract, diencephalon (thalamus, hypothalamus, pituitary gland), cerebellum with arbor vitae, and the brainstem (pons and medulla oblongata).',
    funFact: 'Although the brain accounts for only about 2% of total body mass, it consumes roughly 20% of the body’s total glucose and oxygen supply.',
    pins: [
      {
        id: 'p-brain-1',
        number: 1,
        name: 'Cerebral Cortex (Gyri & Sulci)',
        x: 35,
        y: 24,
        color: '#F472B6',
        category: 'Higher Cognition',
        functionSummary: 'Heavily folded gray matter responsible for consciousness, language, reasoning, and sensory processing.',
        detailedNotes: 'Folded into ridges (gyri) and grooves (sulci) to fit roughly 16 billion neocortical neurons into the cranial cavity.'
      },
      {
        id: 'p-brain-2',
        number: 2,
        name: 'Corpus Callosum',
        x: 52,
        y: 43,
        color: '#E0E7FF',
        category: 'Interhemispheric Pathway',
        functionSummary: 'Large commissural nerve tract containing over 200 million axons bridging left and right hemispheres.',
        detailedNotes: 'Enables real-time bilateral integration, allowing motor, sensory, and cognitive information to synchronize between hemispheres.'
      },
      {
        id: 'p-brain-3',
        number: 3,
        name: 'Thalamus & Hypothalamus',
        x: 51,
        y: 53,
        color: '#6366F1',
        category: 'Relay & Homeostasis',
        functionSummary: 'Sensory relay hub (thalamus) and master autonomic/endocrine regulator (hypothalamus).',
        detailedNotes: 'Controls core physiological homeostasis including circadian rhythms, hunger, thirst, body temperature, and pituitary hormone secretion.'
      },
      {
        id: 'p-brain-4',
        number: 4,
        name: 'Cerebellum (Arbor Vitae)',
        x: 64,
        y: 68,
        color: '#34D399',
        category: 'Motor Coordination',
        functionSummary: 'Calculates precision timing, postural equilibrium, and smooth voluntary motor execution.',
        detailedNotes: 'Contains more than 50% of the entire brain’s neurons densely packed into Purkinje and granule cell cerebellar layers.'
      },
      {
        id: 'p-brain-5',
        number: 5,
        name: 'Brainstem (Pons & Medulla)',
        x: 53,
        y: 72,
        color: '#38BDF8',
        category: 'Vital Functions',
        functionSummary: 'Coordinates involuntary vegetative reflexes including cardiac rhythm, respiration, and blood pressure.',
        detailedNotes: 'Ascending and descending nerve tracts pass through here, and decussation of motor pyramids causes contralateral motor control.'
      }
    ]
  },

  'human-eye': {
    diagramType: 'human-eye',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Anatomy of the Human Eye (Horizontal Section)',
    subtitle: 'Optical & sensory architecture: Cornea, iris, lens, ciliary body, retina & fovea centralis',
    description: 'Detailed textbook cross-section of the human eye showing the outer fibrous tunic (cornea and sclera), middle vascular tunic (choroid, ciliary body, zonules, and iris with pupil aperture), crystalline biconvex lens, gelatinous vitreous humor, multilayer sensory retina with macula lutea / fovea centralis, and the optic nerve blind spot.',
    funFact: 'The fovea centralis contains zero blue (S) cones and virtually zero blood vessels, allowing unhindered direct light focus onto densely packed red and green cone photoreceptors.',
    pins: [
      {
        id: 'p-eye-1',
        number: 1,
        name: 'Cornea',
        x: 28,
        y: 48,
        color: '#0EA5E9',
        category: 'Refractive Surface',
        functionSummary: 'Avascular transparent dome contributing roughly two-thirds of the eye’s total optical power (~40–44 diopters).',
        detailedNotes: 'Refracts incoming light rays toward the pupil while protecting internal intraocular chambers.'
      },
      {
        id: 'p-eye-2',
        number: 2,
        name: 'Iris & Pupil',
        x: 36,
        y: 39,
        color: '#059669',
        category: 'Aperture Control',
        functionSummary: 'Pigmented muscular diaphragm that regulates light intake by dilating or constricting the pupil.',
        detailedNotes: 'Controlled by the pupillary sphincter (parasympathetic) and pupillary dilator (sympathetic) muscles.'
      },
      {
        id: 'p-eye-3',
        number: 3,
        name: 'Crystalline Lens',
        x: 41,
        y: 48,
        color: '#A78BFA',
        category: 'Accommodation',
        functionSummary: 'Flexible biconvex protein optic that shifts focal curvature for near and far vision.',
        detailedNotes: 'Changes radius of curvature via ciliary muscle contraction relaxing suspensory zonule tension.'
      },
      {
        id: 'p-eye-4',
        number: 4,
        name: 'Retina (Sensory Tunic)',
        x: 65,
        y: 28,
        color: '#F59E0B',
        category: 'Phototransduction',
        functionSummary: 'Inner neurosensory layer packed with ~120 million rods and ~6 million cones converting photons into electrical signals.',
        detailedNotes: 'Photopigments (rhodopsin and photopsins) trigger hyperpolarizing cascades passed through bipolar and retinal ganglion cells.'
      },
      {
        id: 'p-eye-5',
        number: 5,
        name: 'Fovea Centralis',
        x: 67,
        y: 50,
        color: '#EF4444',
        category: 'High-Acuity Vision',
        functionSummary: 'Avascular central retinal pit providing the highest spatial resolution and color acuity in the visual field.',
        detailedNotes: 'Has an exclusive 1:1 ratio between cone photoreceptors and midget ganglion cells.'
      },
      {
        id: 'p-eye-6',
        number: 6,
        name: 'Optic Nerve (CN II)',
        x: 74,
        y: 56,
        color: '#94A3B8',
        category: 'Neural Transmission',
        functionSummary: 'Myelinated bundle of over 1.2 million retinal ganglion cell axons relaying visual signals to the visual cortex.',
        detailedNotes: 'Exits at the optic disc, where absence of photoreceptors creates the physiological blind spot.'
      }
    ]
  },

  'nephron-kidney': {
    diagramType: 'nephron-kidney',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Renal Nephron Ultrastructure & Tubules',
    subtitle: 'Microscopic functional unit: Bowman’s capsule, glomerulus, PCT, loop of Henle, DCT & collecting duct',
    description: 'Comprehensive physiological diagram of a mammalian juxtamedullary/cortical nephron illustrating ultrafiltration at the glomerular capillary knot, Bowman’s space, massive solute reabsorption along the proximal convoluted tubule (PCT), countercurrent multiplication in the thin descending and thick ascending limbs of Henle, fine-tuning in the distal tubule (DCT), and the collecting duct.',
    funFact: 'Both kidneys together filter roughly 180 liters of fluid from human blood plasma every single day, reabsorbing over 99% of it so only about 1.5 liters becomes urine.',
    pins: [
      {
        id: 'p-nephron-1',
        number: 1,
        name: 'Glomerulus & Afferent Arteriole',
        x: 37,
        y: 28,
        color: '#EF4444',
        category: 'High-Pressure Filtration',
        functionSummary: 'Fenestrated capillary network where hydrostatic pressure forces plasma filtrate into Bowman’s space.',
        detailedNotes: 'Podocyte pedicels and glomerular basement membrane form a selective molecular filtration slit barrier.'
      },
      {
        id: 'p-nephron-2',
        number: 2,
        name: 'Bowman’s Capsule',
        x: 43,
        y: 24,
        color: '#10B981',
        category: 'Filtrate Collection',
        functionSummary: 'Double-walled epithelial cup that funnels raw glomerular filtrate directly into the proximal tubule.',
        detailedNotes: 'Composed of an outer parietal simple squamous layer and an inner visceral layer of specialized podocytes.'
      },
      {
        id: 'p-nephron-3',
        number: 3,
        name: 'Proximal Convoluted Tubule (PCT)',
        x: 52,
        y: 35,
        color: '#F59E0B',
        category: 'Bulk Reabsorption',
        functionSummary: 'Reabsorbs ~65–70% of filtered water, Na⁺, Cl⁻, and 100% of filtered glucose and amino acids.',
        detailedNotes: 'Lined with simple cuboidal epithelial cells possessing a prominent brush border of dense apical microvilli.'
      },
      {
        id: 'p-nephron-4',
        number: 4,
        name: 'Loop of Henle (Hairpin Countercurrent)',
        x: 52,
        y: 65,
        color: '#06B6D4',
        category: 'Osmotic Gradient',
        functionSummary: 'Generates a hypertonic medullary interstitial gradient for urine concentration.',
        detailedNotes: 'The descending thin limb is water-permeable; the thick ascending limb actively pumps Na⁺/K⁺/2Cl⁻ into the interstitium.'
      },
      {
        id: 'p-nephron-5',
        number: 5,
        name: 'Distal Convoluted Tubule (DCT)',
        x: 64,
        y: 38,
        color: '#8B5CF6',
        category: 'Electrolyte Regulation',
        functionSummary: 'Fine-tunes sodium, potassium, calcium, and pH balance under aldosterone and parathyroid hormone control.',
        detailedNotes: 'Contains the macula densa cells of the juxtaglomerular apparatus that sense tubular NaCl levels.'
      },
      {
        id: 'p-nephron-6',
        number: 6,
        name: 'Collecting Duct',
        x: 72,
        y: 52,
        color: '#EC4899',
        category: 'Water Conservation',
        functionSummary: 'Transports urine through the hyperosmolar medulla; regulated by ADH (antidiuretic hormone / vasopressin).',
        detailedNotes: 'Inserts aquaporin-2 water channels into apical membranes to produce concentrated or dilute urine depending on hydration.'
      }
    ]
  },

  'mitochondria': {
    diagramType: 'mitochondria',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Mitochondrion Ultrastructure & Membranes',
    subtitle: 'Powerhouse of the cell: Outer membrane, cristae folds, matrix, mtDNA & ATP synthase',
    description: 'High-resolution cutaway diagram of a eukaryotic mitochondrion showing the smooth outer membrane with porins, intermembrane space, deeply folded inner membrane forming shelf-like cristae, dense matrix with circular mitochondrial DNA (mtDNA), 70S ribosomes, matrix granules, and ATP synthase complexes.',
    funFact: 'Because mitochondria contain their own circular DNA and 70S ribosomes inherited strictly matrilineally, endosymbiotic theory proves they evolved from engulfed aerobic alpha-proteobacteria ~1.5 billion years ago.',
    pins: [
      {
        id: 'p-mito-1',
        number: 1,
        name: 'Outer Membrane (Porin Channels)',
        x: 24,
        y: 40,
        color: '#EF4444',
        category: 'Permeability Boundary',
        functionSummary: 'Smooth lipid bilayer enclosing the organelle; permeable to small molecules (<5 kDa) via porin proteins.',
        detailedNotes: 'Maintains organellar integrity and contains enzymes involved in mitochondrial lipid synthesis.'
      },
      {
        id: 'p-mito-2',
        number: 2,
        name: 'Inner Membrane Cristae',
        x: 42,
        y: 35,
        color: '#FBBF24',
        category: 'Electron Transport Chain',
        functionSummary: 'Extensively invaginated shelf folds containing respiratory complexes I–IV and ATP synthase.',
        detailedNotes: 'Rich in cardiolipin phospholipid, virtually impermeable to ions to maintain the proton electrochemical gradient.'
      },
      {
        id: 'p-mito-3',
        number: 3,
        name: 'Mitochondrial Matrix',
        x: 50,
        y: 55,
        color: '#B45309',
        category: 'Metabolic Engine',
        functionSummary: 'Dense gel containing Krebs (Citric Acid) cycle enzymes, pyruvate dehydrogenase, and beta-oxidation enzymes.',
        detailedNotes: 'Produces NADH and FADH₂ reducing equivalents that feed high-energy electrons into the respiratory chain.'
      },
      {
        id: 'p-mito-4',
        number: 4,
        name: 'Circular Mitochondrial DNA (mtDNA)',
        x: 35,
        y: 62,
        color: '#38BDF8',
        category: 'Genetic Material',
        functionSummary: 'Closed-circular double-stranded genome encoding 13 core oxidative phosphorylation polypeptides, 22 tRNAs, and 2 rRNAs.',
        detailedNotes: 'Replicates independently within the matrix and is inherited almost exclusively through maternal lineage.'
      },
      {
        id: 'p-mito-5',
        number: 5,
        name: 'ATP Synthase (F₀F₁ Complex)',
        x: 58,
        y: 42,
        color: '#10B981',
        category: 'Chemiosmotic Turbine',
        functionSummary: 'Molecular rotary motor using proton influx from intermembrane space to phosphorylate ADP into ATP.',
        detailedNotes: 'Generates approximately 30–32 moles of ATP per mole of fully oxidized glucose through chemiosmotic coupling.'
      }
    ]
  },

  'chloroplast': {
    diagramType: 'chloroplast',
    category: 'Botany & Ecology',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Chloroplast Ultrastructure & Photosynthesis',
    subtitle: 'Plant organelle: Envelope membranes, stroma, thylakoids, grana stacks & lamellae',
    description: 'Detailed anatomical diagram of a photosynthetic plant chloroplast illustrating the double-membrane envelope, aqueous stroma matrix with Calvin cycle enzymes, disc-shaped thylakoids stacked into grana columns, interconnecting stroma lamellae, starch grains, and circular plastid DNA.',
    funFact: 'A single square millimeter of a typical green leaf contains approximately 500,000 chloroplasts, capturing sunlight to power global primary biomass production.',
    pins: [
      {
        id: 'p-chloro-1',
        number: 1,
        name: 'Double-Membrane Envelope',
        x: 22,
        y: 45,
        color: '#10B981',
        category: 'Boundary Membrane',
        functionSummary: 'Protective outer and inner membranes controlling metabolic transport between cytoplasm and stroma.',
        detailedNotes: 'Reflects endosymbiotic origins from ancient photosynthetic cyanobacteria engulfed by eukaryotic cells.'
      },
      {
        id: 'p-chloro-2',
        number: 2,
        name: 'Stroma Matrix',
        x: 45,
        y: 35,
        color: '#047857',
        category: 'Dark Reactions (Calvin Cycle)',
        functionSummary: 'Fluid-filled compartment holding RuBisCO and enzymes for carbon fixation into triose phosphates.',
        detailedNotes: 'Also suspends circular chloroplast DNA (cpDNA), 70S ribosomes, and temporary starch granule reserves.'
      },
      {
        id: 'p-chloro-3',
        number: 3,
        name: 'Thylakoid Membrane & Granum',
        x: 42,
        y: 52,
        color: '#A7F3D0',
        category: 'Light-Harvesting Complex',
        functionSummary: 'Stacks of flattened membranous sacs housing chlorophyll a/b, Photosystems I & II, and ATP synthase.',
        detailedNotes: 'Drives light-dependent water photolysis (H₂O → 2H⁺ + 2e⁻ + ½O₂) and generates NADPH and ATP across the lumen.'
      },
      {
        id: 'p-chloro-4',
        number: 4,
        name: 'Stroma Lamellae (Frets)',
        x: 54,
        y: 48,
        color: '#6EE7B7',
        category: 'Thylakoid Interconnect',
        functionSummary: 'Unstacked tubular membranes connecting distinct grana stacks, primarily enriched in Photosystem I.',
        detailedNotes: 'Facilitates cyclic photophosphorylation and allows rapid diffusion of plastocyanin and mobile electron carriers.'
      },
      {
        id: 'p-chloro-5',
        number: 5,
        name: 'Starch Granule',
        x: 65,
        y: 38,
        color: '#F59E0B',
        category: 'Energy Storage',
        functionSummary: 'Semi-crystalline amylose and amylopectin carbohydrate granules stored during active photosynthetic daylight.',
        detailedNotes: 'Mobilized into sucrose at night to sustain plant cellular respiration and phloem translocation.'
      }
    ]
  },

  'bacterial-cell': {
    diagramType: 'bacterial-cell',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Bacterial Cell (Prokaryotic Ultrastructure)',
    subtitle: 'Bacterial anatomy: Capsule, peptidoglycan wall, circular nucleoid, plasmids, flagellum & pili',
    description: 'Rigorous microbiological diagram of a bacterium showing the three-layered cell envelope (capsule/slime layer, peptidoglycan cell wall, inner plasma membrane), uncompartmentalized cytoplasm with 70S polyribosomes, tangled circular chromosomal nucleoid DNA, independent plasmid rings, rotary motor flagellum, and attachment pili/fimbriae.',
    funFact: 'The bacterial flagellum is one of nature’s only true rotary engines, spinning at up to 100,000 RPM powered by a proton motive force flowing through basal MotA/MotB stator proteins.',
    pins: [
      {
        id: 'p-bac-1',
        number: 1,
        name: 'Rotary Helical Flagellum',
        x: 18,
        y: 50,
        color: '#38BDF8',
        category: 'Motility Apparatus',
        functionSummary: 'Rigid helical protein filament that spins clockwise or counter-clockwise to drive chemotactic swimming.',
        detailedNotes: 'Anchored into the cell envelope by a basal body composed of MS, P, and L rings driven by transmembrane ion gradients.'
      },
      {
        id: 'p-bac-2',
        number: 2,
        name: 'Capsule & Peptidoglycan Cell Wall',
        x: 38,
        y: 35,
        color: '#10B981',
        category: 'Protective Envelope',
        functionSummary: 'Rigid mesh of alternating NAG and NAM glycan chains cross-linked by peptide bridges; resists osmotic lysis.',
        detailedNotes: 'The outermost polysaccharide capsule protects pathogenic bacteria from host phagocytosis and desiccation.'
      },
      {
        id: 'p-bac-3',
        number: 3,
        name: 'Nucleoid (Circular Chromosome)',
        x: 52,
        y: 48,
        color: '#EAB308',
        category: 'Bacterial Genome',
        functionSummary: 'Tangled, membrane-less region holding the single, circular double-stranded bacterial chromosome.',
        detailedNotes: 'Supercoiled by DNA gyrase and compacted by nucleoid-associated proteins (NAPs) without true eukaryotic histones.'
      },
      {
        id: 'p-bac-4',
        number: 4,
        name: 'Plasmids (Extrachromosomal DNA)',
        x: 44,
        y: 58,
        color: '#A855F7',
        category: 'Accessory Genes',
        functionSummary: 'Small circular self-replicating DNA rings carrying auxiliary traits such as antibiotic resistance (R-factors).',
        detailedNotes: 'Can be rapidly transmitted horizontally between bacteria via conjugation through specialized sex pili.'
      },
      {
        id: 'p-bac-5',
        number: 5,
        name: 'Pili & Fimbriae',
        x: 62,
        y: 28,
        color: '#A7F3D0',
        category: 'Adhesion & Conjugation',
        functionSummary: 'Hair-like pilin protein fibers that anchor bacteria to host tissues, surfaces, and other bacteria.',
        detailedNotes: 'Essential virulence factor for biofilm formation and mediating horizontal gene transfer during bacterial mating.'
      }
    ]
  },

  'dna-helix': {
    diagramType: 'dna-helix',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'DNA Double Helix Molecular Architecture',
    subtitle: 'B-DNA structure: Antiparallel sugar-phosphate backbones, major/minor grooves & base pairs',
    description: 'Textbook molecular diagram of the Watson-Crick B-DNA double helix showing antiparallel 5’-to-3’ and 3’-to-5’ deoxyribose-phosphate backbones, major and minor helical grooves, and complementary nitrogenous base pairs (Adenine-Thymine double hydrogen bonds, Guanine-Cytosine triple hydrogen bonds).',
    funFact: 'If the DNA molecules in all 37 trillion cells of a single human body were uncoiled and placed end-to-end, they would stretch roughly 67 billion miles—over 700 times the distance from the Earth to the Sun.',
    pins: [
      {
        id: 'p-dna-1',
        number: 1,
        name: 'Antiparallel Sugar-Phosphate Backbone',
        x: 42,
        y: 30,
        color: '#818CF8',
        category: 'Structural Framework',
        functionSummary: 'Alternating phosphodiester linkages connecting 3’ and 5’ carbon positions of adjacent 2’-deoxyribose rings.',
        detailedNotes: 'The two paired strands run in opposite directional polarity (5’-to-3’ antiparallel to 3’-to-5’), stabilizing the right-handed helix.'
      },
      {
        id: 'p-dna-2',
        number: 2,
        name: 'Complementary Base Pairs & Hydrogen Bonds',
        x: 50,
        y: 48,
        color: '#3B82F6',
        category: 'Genetic Coding Core',
        functionSummary: 'Planar nitrogenous purine-pyrimidine pairs stacked at 0.34 nm intervals perpendicular to the helical axis.',
        detailedNotes: 'Adenine pairs specifically with Thymine via 2 hydrogen bonds; Guanine pairs with Cytosine via 3 hydrogen bonds.'
      },
      {
        id: 'p-dna-3',
        number: 3,
        name: 'Major Groove',
        x: 58,
        y: 52,
        color: '#38BDF8',
        category: 'Protein Recognition',
        functionSummary: 'Wide helical indentation (~2.2 nm) exposing rich chemical patterns for sequence-specific transcription factor binding.',
        detailedNotes: 'Provides unambiguous hydrogen-bond donor and acceptor signatures that regulatory proteins read without unzipping the helix.'
      },
      {
        id: 'p-dna-4',
        number: 4,
        name: 'Minor Groove',
        x: 58,
        y: 38,
        color: '#38BDF8',
        category: 'Helical Indentation',
        functionSummary: 'Narrow helical furrow (~1.2 nm) between glycosidic bonds, targeted by architectural chromatin proteins.',
        detailedNotes: 'Often contacted by non-specific DNA-binding domains and minor-groove binding therapeutic antibiotics (e.g., netropsin).'
      }
    ]
  },

  'lungs-respiratory': {
    diagramType: 'lungs-respiratory',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Respiratory System & Bronchial Tree',
    subtitle: 'Pulmonary anatomy: Trachea, cartilage rings, primary bronchi, bronchioles & alveoli',
    description: 'Anatomical diagram of the human respiratory tract illustrating the trachea supported by C-shaped hyaline cartilage rings, carina bifurcation into left and right primary bronchi, lobar branching into secondary and tertiary bronchioles, microscopic alveolar sac clusters surrounded by capillaries, and the muscular diaphragm.',
    funFact: 'The total internal surface area provided by all 300 to 500 million microscopic alveoli across both adult lungs spans roughly 70 to 100 square meters—about the size of half a tennis court.',
    pins: [
      {
        id: 'p-lung-1',
        number: 1,
        name: 'Trachea & Cartilaginous Rings',
        x: 50,
        y: 28,
        color: '#38BDF8',
        category: 'Conducting Airway',
        functionSummary: 'Flexible windpipe lined with pseudostratified ciliated epithelium and supported by 16–20 C-shaped hyaline cartilage rings.',
        detailedNotes: 'Prevents airway collapse during negative intrathoracic pressure; the posterior open trachealis muscle allows esophageal expansion.'
      },
      {
        id: 'p-lung-2',
        number: 2,
        name: 'Primary Bronchi & Carina',
        x: 44,
        y: 44,
        color: '#38BDF8',
        category: 'Bronchial Bifurcation',
        functionSummary: 'Division of trachea at carina into right and left mainstem bronchi entering lung hila.',
        detailedNotes: 'The right primary bronchus is wider, shorter, and more vertically oriented than the left, making foreign body aspiration more common on the right.'
      },
      {
        id: 'p-lung-3',
        number: 3,
        name: 'Right Lung (3 Lobes)',
        x: 36,
        y: 56,
        color: '#F472B6',
        category: 'Gas Exchange Organ',
        functionSummary: 'Divided into superior, middle, and inferior lobes by horizontal and oblique fissures.',
        detailedNotes: 'Larger and heavier than the left lung because the cardiac apex tilts toward the left hemithorax.'
      },
      {
        id: 'p-lung-4',
        number: 4,
        name: 'Left Lung (Cardiac Notch)',
        x: 64,
        y: 56,
        color: '#F472B6',
        category: 'Gas Exchange Organ',
        functionSummary: 'Divided into superior and inferior lobes by an oblique fissure; features a medial cardiac notch indentation.',
        detailedNotes: 'Contains the lingula, an anatomical homologue of the right middle lobe.'
      },
      {
        id: 'p-lung-5',
        number: 5,
        name: 'Alveolar Sac Cluster',
        x: 74,
        y: 68,
        color: '#FDA4AF',
        category: 'Hematogas Interface',
        functionSummary: 'Microscopic thin-walled air sacs where O₂ diffuses across the respiratory membrane into pulmonary capillaries.',
        detailedNotes: 'Type I alveolar cells provide ultra-thin gas diffusion surfaces; Type II alveolar cells secrete pulmonary surfactant to prevent atelectasis.'
      },
      {
        id: 'p-lung-6',
        number: 6,
        name: 'Diaphragm Muscle',
        x: 50,
        y: 78,
        color: '#E11D48',
        category: 'Primary Respiratory Muscle',
        functionSummary: 'Dome-shaped skeletal muscle innervated by the phrenic nerve; contracts downward to expand thoracic volume during inhalation.',
        detailedNotes: 'Generates subatmospheric intrathoracic pressure (-4 to -8 mmHg) drawing atmospheric air into the lungs.'
      }
    ]
  },

  'stomach-digestive': {
    diagramType: 'stomach-digestive',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Stomach Gross Anatomy & Mucosa',
    subtitle: 'Gastric architecture: Cardia, fundus, body, rugae mucosal folds, pyloric sphincter & duodenum',
    description: 'Clinical anatomical diagram of the human stomach illustrating the J-shaped organ with lower esophageal sphincter (cardia), domed fundus, expansive body, wavy longitudinal gastric rugae folds for volumetric expansion, pyloric antrum, muscular pyloric sphincter valve, and transition into the C-shaped duodenum.',
    funFact: 'The stomach lining secretes hydrochloric acid so potent (pH 1.5–2.0) it could dissolve metal, but an alkaline bicarbonate-rich mucous barrier protects the gastric wall from digesting itself.',
    pins: [
      {
        id: 'p-stom-1',
        number: 1,
        name: 'Esophagus & Cardiac Sphincter',
        x: 44,
        y: 30,
        color: '#FB7185',
        category: 'Gastroesophageal Inflow',
        functionSummary: 'Lower esophageal physiological sphincter valve preventing acidic gastric reflux into the esophagus.',
        detailedNotes: 'Junction marked by the Z-line, where stratified squamous esophageal epithelium transitions into columnar gastric mucosa.'
      },
      {
        id: 'p-stom-2',
        number: 2,
        name: 'Gastric Fundus',
        x: 58,
        y: 32,
        color: '#9F1239',
        category: 'Superior Dome',
        functionSummary: 'Curved upper dome of the stomach that accommodates swallowed gas and stores undigested food for up to an hour.',
        detailedNotes: 'Located immediately beneath the left dome of the diaphragm, visible as the gastric air bubble on upright chest radiographs.'
      },
      {
        id: 'p-stom-3',
        number: 3,
        name: 'Gastric Rugae (Mucosal Folds)',
        x: 54,
        y: 52,
        color: '#FECDD3',
        category: 'Volume Accommodation',
        functionSummary: 'Prominent longitudinal folds of mucosa and submucosa that unwrinkle to expand gastric volume up to 1.5–2.0 liters.',
        detailedNotes: 'Punctured by millions of microscopic gastric pits lined with parietal (HCl / intrinsic factor) and chief (pepsinogen) cells.'
      },
      {
        id: 'p-stom-4',
        number: 4,
        name: 'Pyloric Sphincter Valve',
        x: 39,
        y: 56,
        color: '#FDE047',
        category: 'Regulated Gastric Emptying',
        functionSummary: 'Thick ring of smooth circular muscle controlling chyme passage into the duodenum in 3 mL spurts.',
        detailedNotes: 'Prevents premature dumping of acidic chyme and retro-duodenal reflux of bile into the stomach.'
      },
      {
        id: 'p-stom-5',
        number: 5,
        name: 'Duodenum (Small Intestine)',
        x: 32,
        y: 65,
        color: '#F59E0B',
        category: 'Digestive Absorption',
        functionSummary: 'C-shaped proximal small intestine receiving bile from the gallbladder and digestive enzymes from the pancreas.',
        detailedNotes: 'Brunner’s glands secrete copious alkaline mucous to neutralize gastric acid before enzymatic digestion proceeds.'
      }
    ]
  },

  'skin-anatomy': {
    diagramType: 'skin-anatomy',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Skin Cross-Section (Integumentary System)',
    subtitle: 'Cutaneous layers: Stratified epidermis, vascular dermis, adipose hypodermis, hair follicle & glands',
    description: 'Detailed histology diagram of human thin/thick skin illustrating the keratinized stratified squamous epidermis, interlocking dermal papillae, dense collagenous dermis with capillary loops, subcutaneous adipose hypodermis, hair follicle with bulb, sebaceous gland, arrector pili muscle, and coiled sweat gland.',
    funFact: 'Skin is the human body’s largest organ, weighing approximately 8 to 10 pounds (16% of total body weight) and shedding roughly 30,000 to 40,000 dead epidermal cells every single minute.',
    pins: [
      {
        id: 'p-skin-1',
        number: 1,
        name: 'Epidermis & Stratum Corneum',
        x: 32,
        y: 35,
        color: '#FDA4AF',
        category: 'Barrier Layer',
        functionSummary: 'Avascular stratified squamous epithelium topped by dead, anucleate keratinized squames providing a waterproof barrier.',
        detailedNotes: 'Continuously regenerated from proliferative stem cells in the basal layer (stratum basale) containing protective melanocytes.'
      },
      {
        id: 'p-skin-2',
        number: 2,
        name: 'Dermis (Papillary & Reticular)',
        x: 32,
        y: 50,
        color: '#F472B6',
        category: 'Structural Support',
        functionSummary: 'Vascular connective tissue matrix rich in type I/III collagen, elastin fibers, nerve endings, and cutaneous capillaries.',
        detailedNotes: 'Dermal papillae ridges form unique epidermal friction ridges that create personal fingerprints (dermatoglyphs).'
      },
      {
        id: 'p-skin-3',
        number: 3,
        name: 'Hair Follicle & Root Bulb',
        x: 48,
        y: 60,
        color: '#34D399',
        category: 'Hair Organ',
        functionSummary: 'Down-growth of the epidermis enclosing the hair root and vascular dermal papilla providing nutrients for hair growth.',
        detailedNotes: 'Surrounded by sensory nerve root plexuses that detect tactile displacement of the external hair shaft.'
      },
      {
        id: 'p-skin-4',
        number: 4,
        name: 'Sebaceous Gland',
        x: 44,
        y: 46,
        color: '#FDE68A',
        category: 'Holocrine Secretion',
        functionSummary: 'Multilobed gland connected to follicle that secretes oily sebum to lubricate and waterproof hair and skin.',
        detailedNotes: 'Possesses mild bacteriostatic properties; androgen surges during puberty can cause sebum plugging leading to acne vulgaris.'
      },
      {
        id: 'p-skin-5',
        number: 5,
        name: 'Arrector Pili Muscle',
        x: 40,
        y: 52,
        color: '#EF4444',
        category: 'Thermoregulatory Smooth Muscle',
        functionSummary: 'Involuntary smooth muscle ribbon connecting hair follicle to dermal papillary layer.',
        detailedNotes: 'Stimulated by sympathetic nerves during cold or fright, pulling hair perpendicular and dimpling the skin (cutis anserina / goosebumps).'
      },
      {
        id: 'p-skin-6',
        number: 6,
        name: 'Eccrine Sweat Gland',
        x: 62,
        y: 58,
        color: '#38BDF8',
        category: 'Thermoregulatory Cooling',
        functionSummary: 'Coiled tubular gland in deep dermis discharging hypotonic sweat directly to skin surface pores for evaporative heat loss.',
        detailedNotes: 'Innervated by sympathetic cholinergic fibers; secretes water, NaCl, urea, and antimicrobial peptides (dermcidin).'
      },
      {
        id: 'p-skin-7',
        number: 7,
        name: 'Subcutaneous Hypodermis',
        x: 50,
        y: 72,
        color: '#F59E0B',
        category: 'Adipose Cushion',
        functionSummary: 'Subcutaneous layer of loose connective tissue and lobules of adipocytes anchoring skin to underlying fascia.',
        detailedNotes: 'Functions as thermal insulation, shock absorption for trauma protection, and a major long-term metabolic energy reserve.'
      }
    ]
  },

  'human-ear': {
    diagramType: 'human-ear',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Anatomy of the Human Ear (Hearing & Balance)',
    subtitle: 'Auditory apparatus: Pinna, ear canal, tympanic membrane, ossicles, cochlea & canals',
    description: 'Comprehensive otological cross-section illustrating the external ear (pinna, acoustic meatus), middle ear cavity (tympanic membrane eardrum, auditory ossicles: malleus hammer, incus anvil, stapes stirrup, Eustachian tube), and the fluid-filled inner ear labyrinth (snail-shaped cochlea with organ of Corti, three orthogonal semicircular canals, and vestibulocochlear nerve CN VIII).',
    funFact: 'The three auditory ossicles in your middle ear (malleus, incus, and stapes) are the smallest bones in the entire human skeleton—the stapes measures barely 3 millimeters across.',
    pins: [
      {
        id: 'p-ear-1',
        number: 1,
        name: 'Pinna (Auricle)',
        x: 28,
        y: 38,
        color: '#FB7185',
        category: 'Sound Funnel',
        functionSummary: 'External elastic cartilage flap that collects sound waves and directs acoustic energy into the ear canal.',
        detailedNotes: 'Curvatures (helix, antihelix, concha) impart subtle spectral frequency modifications assisting vertical sound localization.'
      },
      {
        id: 'p-ear-2',
        number: 2,
        name: 'External Acoustic Meatus (Ear Canal)',
        x: 39,
        y: 48,
        color: '#94A3B8',
        category: 'Acoustic Tube',
        functionSummary: 'S-shaped ~2.5 cm canal lined with ceruminous glands producing protective earwax (cerumen).',
        detailedNotes: 'Acts as an acoustic resonator amplifying human speech frequencies around 2–4 kHz.'
      },
      {
        id: 'p-ear-3',
        number: 3,
        name: 'Tympanic Membrane (Eardrum)',
        x: 48,
        y: 50,
        color: '#38BDF8',
        category: 'Vibratory Diaphragm',
        functionSummary: 'Thin, translucent trilaminar membrane vibrating in response to alternating sound pressure waves.',
        detailedNotes: 'Transfers acoustic aerial vibrations into mechanical oscillations delivered to the handle of the malleus.'
      },
      {
        id: 'p-ear-4',
        number: 4,
        name: 'Auditory Ossicles (Malleus, Incus, Stapes)',
        x: 53,
        y: 46,
        color: '#F59E0B',
        category: 'Impedance Matcher',
        functionSummary: 'Three tiny articulated bones magnifying vibratory force by ~22-fold from air to inner ear fluid.',
        detailedNotes: 'The footplate of the stapes rocks against the oval window membrane, launching fluid pressure waves into the perilymph.'
      },
      {
        id: 'p-ear-5',
        number: 5,
        name: 'Cochlea (Organ of Corti)',
        x: 60,
        y: 58,
        color: '#06B6D4',
        category: 'Frequency Analyzer',
        functionSummary: 'Spiral 2.5-turn bony canal housing the basilar membrane that transduces fluid waves into neural impulses.',
        detailedNotes: 'Tonotopically mapped: high-frequency pitches stimulate the stiff basal turn; low-frequency bass tones stimulate the floppy apical helicotrema.'
      },
      {
        id: 'p-ear-6',
        number: 6,
        name: 'Semicircular Canals & Vestibular Nerve',
        x: 62,
        y: 42,
        color: '#A855F7',
        category: 'Dynamic Equilibrium',
        functionSummary: 'Three orthogonal fluid-filled loops detecting rotational head movements in three spatial planes.',
        detailedNotes: 'Endolymph inertia bends stereocilia inside ampullary cristae cupulae, signaling through vestibular nerve fibers to coordinate balance.'
      }
    ]
  },

  'flower-anatomy': {
    diagramType: 'flower-anatomy',
    category: 'Botany & Ecology',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Angiosperm Flower Reproductive Anatomy',
    subtitle: 'Floral morphology: Sepals, petals, stamen (filament & anther), carpel (stigma, style, ovary & ovules)',
    description: 'Detailed botanical cross-section of an ideal angiosperm flower illustrating the four floral whorls: protective green calyx (sepals), vibrant insect-attracting corolla (petals), male androecium (stamen with filament and pollen-bearing anther), and central female gynoecium (carpel/pistil with receptive stigma, style, and swollen ovary containing ovules with embryo sacs).',
    funFact: 'Angiosperm flowers undergo a unique "double fertilization": one sperm fertilizes the egg to form the 2n embryo, while a second sperm fuses with two polar nuclei to form the 3n endosperm nutritional reserve.',
    pins: [
      {
        id: 'p-fl-1',
        number: 1,
        name: 'Petals (Corolla)',
        x: 35,
        y: 32,
        color: '#FB7185',
        category: 'Pollinator Attraction',
        functionSummary: 'Vibrant, pigmented floral leaves often bearing ultraviolet nectar guides to direct insect and bird pollinators.',
        detailedNotes: 'Produce aromatic essential oils and frame reproductive organs while shielding them from adverse environmental conditions.'
      },
      {
        id: 'p-fl-2',
        number: 2,
        name: 'Sepals (Calyx)',
        x: 36,
        y: 60,
        color: '#15803D',
        category: 'Bud Protection',
        functionSummary: 'Outermost green photosynthetic leaf-like whorl enclosing and protecting the delicate floral bud prior to anthesis.',
        detailedNotes: 'May be persistent in fruit development (e.g., the leafy crown on strawberries or tomatoes).'
      },
      {
        id: 'p-fl-3',
        number: 3,
        name: 'Stamen (Anther & Filament)',
        x: 44,
        y: 42,
        color: '#FDE047',
        category: 'Male Reproductive Unit',
        functionSummary: 'Slender filament stalk supporting a bilobed anther containing microsporangia that produce haploid pollen grains.',
        detailedNotes: 'Dehisces along longitudinal slits when pollen matures to coat foraging insects or disseminate via wind.'
      },
      {
        id: 'p-fl-4',
        number: 4,
        name: 'Stigma & Style',
        x: 50,
        y: 38,
        color: '#84CC16',
        category: 'Female Pollen Receptor',
        functionSummary: 'Sticky glandular receptive surface (stigma) atop a neck (style) through which pollen tubes germinate downward.',
        detailedNotes: 'Secretes sugars and glycoproteins that promote compatible pollen germination while enzymatically blocking self-incompatible grains.'
      },
      {
        id: 'p-fl-5',
        number: 5,
        name: 'Ovary & Ovules',
        x: 50,
        y: 56,
        color: '#F59E0B',
        category: 'Female Gametophyte / Seed Origin',
        functionSummary: 'Swollen basal chamber housing ovules; after fertilization, ovules become seeds and the ovary ripens into fruit.',
        detailedNotes: 'Each ovule contains an eight-nucleate megagametophyte (embryo sac) awaiting double fertilization.'
      }
    ]
  },

  'bacteriophage': {
    diagramType: 'bacteriophage',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'T4 Bacteriophage Virus (Complex Phage)',
    subtitle: 'Viral morphology: Icosahedral capsid head, packaged DNA, collar, contractile tail sheath & fibers',
    description: 'Textbook structural diagram of a T-even (T4) bacteriophage virus showing the icosahedral capsid head packaging linear double-stranded DNA, collar neck, contractile tail sheath surrounding a central hollow needle core, hexagonal baseplate, and articulated spider-like tail fibers that recognize bacterial LPS outer membrane receptors.',
    funFact: 'Bacteriophages are the most abundant biological entities on Planet Earth—there are roughly 10³¹ individual phages in the biosphere, outnumbering all other organisms combined.',
    pins: [
      {
        id: 'p-phage-1',
        number: 1,
        name: 'Icosahedral Capsid Head',
        x: 50,
        y: 26,
        color: '#818CF8',
        category: 'Genome Enclosure',
        functionSummary: 'Crystalline 20-faceted protein shell enclosing and pressurizing the viral double-stranded DNA genome.',
        detailedNotes: 'Assembled from major capsid protein gp23; DNA is packaged under ~50 atmospheres of internal mechanical pressure.'
      },
      {
        id: 'p-phage-2',
        number: 2,
        name: 'Packaged Viral DNA Genome',
        x: 50,
        y: 35,
        color: '#F43F5E',
        category: 'Infectious Genetic Material',
        functionSummary: 'Linear double-stranded DNA molecule containing ~169 kilobase pairs encoding over 289 viral proteins.',
        detailedNotes: 'Contains modified hydroxymethylcytosine (HMC) bases rather than normal cytosine to evade bacterial restriction enzymes.'
      },
      {
        id: 'p-phage-3',
        number: 3,
        name: 'Contractile Tail Sheath',
        x: 50,
        y: 50,
        color: '#38BDF8',
        category: 'Molecular Syringe',
        functionSummary: 'Helical sleeve that contracts upon host binding, plunging the rigid inner core tube through the bacterial cell wall.',
        detailedNotes: 'ATP-independent conformational rearrangement contracts the sheath to 60% of its resting length, injecting the viral DNA.'
      },
      {
        id: 'p-phage-4',
        number: 4,
        name: 'Hexagonal Baseplate & Spikes',
        x: 50,
        y: 62,
        color: '#0369A1',
        category: 'Trigger Mechanism',
        functionSummary: 'Multi-protein disc holding tail pins that puncture outer peptidoglycan layers to initiate sheath contraction.',
        detailedNotes: 'Acts as a mechanical sensor, transitioning from a dome to a flat star conformation when tail fibers anchor firmly.'
      },
      {
        id: 'p-phage-5',
        number: 5,
        name: 'Jointed Tail Fibers',
        x: 35,
        y: 72,
        color: '#38BDF8',
        category: 'Host Adsorption',
        functionSummary: 'Long hinged protein legs that recognize and bind specific outer membrane receptors on host bacteria (e.g. E. coli OmpC / LPS).',
        detailedNotes: 'Allow initial reversible tethering before the baseplate binds irreversibly for genome injection.'
      }
    ]
  },

  'volcano': {
    diagramType: 'volcano',
    category: 'Earth & Space',
    domain: 'physical',
    defaultRenderMode: '3d',
    title: 'Stratovolcano Cross-Section (Composite Cone)',
    subtitle: 'Volcanology: Magma chamber, central conduit, sills, dikes, crater & eruptive column',
    description: 'Detailed geological cross-section of a composite cone stratovolcano illustrating the subterranean magma chamber, primary vertical conduit pipe, lateral magma sill and vertical dike intrusions, parasitic flank cone, summit crater, explosive ash cloud plume, and alternating layers of solidified lava and tephra.',
    funFact: 'Superheated pyroclastic flows billowing down a stratovolcano can hurtle at speeds exceeding 400 miles per hour, with internal gas temperatures reaching scorching heights over 1,000°C (1,800°F).',
    pins: [
      {
        id: 'p-vol-1',
        number: 1,
        name: 'Magma Chamber',
        x: 50,
        y: 78,
        color: '#DC2626',
        category: 'Subterranean Molten Reservoir',
        functionSummary: 'Large pool of pressurized liquid rock beneath Earth’s crust that feeds volcanic eruptions.',
        detailedNotes: 'Accumulates gas-rich silicarich magma until dissolved volatile gas pressure exceeds lithostatic rock strength.'
      },
      {
        id: 'p-vol-2',
        number: 2,
        name: 'Central Conduit (Main Vent Pipe)',
        x: 50,
        y: 52,
        color: '#EF4444',
        category: 'Primary Magma Pathway',
        functionSummary: 'Vertical pipe through which magma ascends from the subterranean reservoir to the surface.',
        detailedNotes: 'Decompression as magma rises triggers violent exsolution of dissolved water vapor and sulfur dioxide gases.'
      },
      {
        id: 'p-vol-3',
        number: 3,
        name: 'Sill & Dike Intrusions',
        x: 58,
        y: 68,
        color: '#EA580C',
        category: 'Igneous Sheet Intrusions',
        functionSummary: 'Sheet intrusions of magma that fracture horizontally between rock strata (sills) or vertically across layers (dikes).',
        detailedNotes: 'May feed secondary parasitic cones on the volcanic flank or solidify deep underground into igneous intrusive rocks.'
      },
      {
        id: 'p-vol-4',
        number: 4,
        name: 'Summit Crater & Lava Flows',
        x: 50,
        y: 40,
        color: '#B45309',
        category: 'Eruptive Vent',
        functionSummary: 'Circular depression at the peak formed by explosive blasting and thermal collapse around the vent opening.',
        detailedNotes: 'Effusive phases produce viscous andesitic or dacitic blocky lava flows that build the steep composite cone slopes.'
      },
      {
        id: 'p-vol-5',
        number: 5,
        name: 'Eruptive Plume (Ash & Tephra Cloud)',
        x: 50,
        y: 22,
        color: '#64748B',
        category: 'Atmospheric Dispersion',
        functionSummary: 'Towering buoyant column of pulverized volcanic rock fragments, microscopic glass shards, and volcanic gases.',
        detailedNotes: 'Can reach stratospheric altitudes of 20–40 km, generating volcanic lightning and disrupting global climate.'
      }
    ]
  },

  'agama-lizard': {
    diagramType: 'agama-lizard',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Agama Lizard (Agama agama) External Morphology',
    subtitle: 'Zoological morphology: Cranial head, nares, eye, tympanum, gular fold, dorsal crest, keeled scales, pentadactyl limbs & tail',
    description: 'Textbook anatomical diagram of the Rainbow Rock Agama (Agama agama), illustrating external features: triangular cranial head with movable eyelids and tympanic membrane, distensible gular throat fold, mid-dorsal vertebral spine crest, keeled keratinized epidermal scales, pentadactyl clawed forelimbs and hindlimbs (with elongated 4th digit), cloacal vent, and long tapering tail banded in deep indigo and flame orange.',
    funFact: 'Male Rainbow Agamas exhibit dramatic physiological thermoregulation: basking under bright sunlight transforms their head into brilliant flame-orange and body into radiant cobalt-blue to signal territorial dominance, yet they fade to mottled brown at night or when startled.',
    pins: [
      {
        id: 'p-agama-1',
        number: 1,
        name: 'Triangular Cranial Head',
        x: 24,
        y: 47,
        color: '#EA580C',
        category: 'Cranial Region',
        functionSummary: 'Flattened triangular head with strong jaw musculature adapted for capturing insects and aggressive territorial head-bobbing.',
        detailedNotes: 'Displays brilliant flame-orange/coral coloration in dominant breeding males during daytime territory defense.'
      },
      {
        id: 'p-agama-2',
        number: 2,
        name: 'External Nares (Nostril)',
        x: 22.5,
        y: 50.5,
        color: '#F97316',
        category: 'Sensory System',
        functionSummary: 'Paired anterior snout apertures for pulmonary respiration and chemical scent detection via the vomeronasal organ.',
        detailedNotes: 'Allows air intake while the mouth remains closed; directs olfactory molecules to Jacobson\'s organ in the palate.'
      },
      {
        id: 'p-agama-3',
        number: 3,
        name: 'Lateral Eye & Movable Eyelids',
        x: 26.5,
        y: 49.5,
        color: '#F59E0B',
        category: 'Sensory System',
        functionSummary: 'Keen panoramic visual organ equipped with movable upper/lower eyelids and a protective nictitating membrane.',
        detailedNotes: 'Features round diurnal pupils and cone-rich retinas providing accurate stereoscopic depth perception during prey strikes.'
      },
      {
        id: 'p-agama-4',
        number: 4,
        name: 'Tympanum (Ear Drum / Tympanic Membrane)',
        x: 31.2,
        y: 50.8,
        color: '#8B5CF6',
        category: 'Auditory System',
        functionSummary: 'Superficial circular membrane situated behind the eye that transmits sound vibrations to the middle ear columella.',
        detailedNotes: 'Lacks an external pinna; sound waves vibrate the tympanum and are relayed across the single columella auris bone into the inner ear.'
      },
      {
        id: 'p-agama-5',
        number: 5,
        name: 'Gular Throat Fold & Dewlap',
        x: 27.5,
        y: 56.5,
        color: '#EF4444',
        category: 'Integument & Signaling',
        functionSummary: 'Distensible transverse cutaneous skin fold beneath the throat used in aggressive territorial posturing and courtship.',
        detailedNotes: 'Supported by the hyoid apparatus; extended during territorial push-up displays to intimidate rival males.'
      },
      {
        id: 'p-agama-6',
        number: 6,
        name: 'Nuchal & Dorsal Spine Crest',
        x: 44.0,
        y: 44.5,
        color: '#FB923C',
        category: 'Epidermal Appendages',
        functionSummary: 'Longitudinal row of erect, pointed epidermal spines along the mid-dorsal vertebral line.',
        detailedNotes: 'Larger along the nuchal (neck) zone; enhances apparent body height and profile during defensive lateral displays.'
      },
      {
        id: 'p-agama-7',
        number: 7,
        name: 'Keeled Keratinized Epidermal Scales',
        x: 48.0,
        y: 52.5,
        color: '#0284C7',
        category: 'Integumentary System',
        functionSummary: 'Overlapping waterproof keratinized scales with central longitudinal ridges preventing cutaneous dessication.',
        detailedNotes: 'Rich in beta-keratin; contains dermal chromatophores (melanophores, erythrophores, iridophores) responsible for physiological color changes.'
      },
      {
        id: 'p-agama-8',
        number: 8,
        name: 'Pentadactyl Forelimb (Pectoral Limb)',
        x: 38.5,
        y: 64.0,
        color: '#0284C7',
        category: 'Locomotor Appendages',
        functionSummary: 'Five-toed anterior limb equipped with sharp recurved claws for grasping rock surfaces and climbing trees.',
        detailedNotes: 'Consists of brachium (humerus), antebrachium (radius and ulna), carpus, and five clawed digits terminating in keratinous sheaths.'
      },
      {
        id: 'p-agama-9',
        number: 9,
        name: 'Muscular Hindlimb & Elongated 4th Digit',
        x: 54.5,
        y: 64.5,
        color: '#0369A1',
        category: 'Locomotor Appendages',
        functionSummary: 'Powerful pelvic limb adapted for explosive sprints; digit IV is characteristically elongated for rock grip.',
        detailedNotes: 'Extensive femoral and calf musculature allows rapid acceleration across horizontal ground and vertical stone walls.'
      },
      {
        id: 'p-agama-10',
        number: 10,
        name: 'Cloacal Aperture (Vent) & Femoral Pores',
        x: 57.0,
        y: 56.8,
        color: '#10B981',
        category: 'Urogenital System',
        functionSummary: 'Transverse slit for excretion and reproduction; accompanied by lipid-secreting femoral scent pores on the thigh.',
        detailedNotes: 'Common chamber receiving fecal waste, uric acid crystals (water conservation), and gametes during internal fertilization.'
      },
      {
        id: 'p-agama-11',
        number: 11,
        name: 'Long Tapering Banded Tail',
        x: 76.0,
        y: 49.0,
        color: '#EA580C',
        category: 'Caudal Region',
        functionSummary: 'Long cylindrical balancing organ banded in deep indigo and flame orange; acts as a counterweight during high-speed running.',
        detailedNotes: 'Exceeds body length by 1.5 to 2 times. Unlike geckos, agamids have limited caudal autotomy and cannot regenerate broken tails perfectly.'
      }
    ]
  },

  'animal-cell': {
    diagramType: 'animal-cell',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Eukaryotic Animal Cell Ultrastructure',
    subtitle: 'Anatomical cross-section: double-envelope nucleus, organelles & membranes',
    description: 'Detailed anatomical depiction of an animal cell showing the plasma membrane with pinocytotic vesicle, double-envelope nucleus, nucleolus, rough and smooth ER, Golgi apparatus with vesicles, mitochondria with cristae, lysosomes, centrosome with centrioles, microtubules, and ribosomes.',
    funFact: 'An average adult human body contains roughly 37.2 trillion cells, each maintaining thousands of specialized organelles operating in continuous biochemical equilibrium.',
    pins: [
      {
        id: 'p-ac-1',
        number: 1,
        name: 'Pinocytotic Vesicle',
        x: 50,
        y: 16,
        color: '#10B981',
        category: 'Membrane Transport',
        functionSummary: 'Flask-like invagination of the plasma membrane for non-specific cellular fluid uptake.',
        detailedNotes: 'Forms small pinosomes that fuse with endosomes and lysosomes for nutrient absorption.'
      },
      {
        id: 'p-ac-2',
        number: 2,
        name: 'Cell (Plasma) Membrane',
        x: 18,
        y: 35,
        color: '#14B8A6',
        category: 'Structural Boundary',
        functionSummary: 'Selectively permeable phospholipid bilayer that encloses cytoplasm.',
        detailedNotes: 'Contains embedded transport channels, receptors, and cholesterol for fluidity.'
      },
      {
        id: 'p-ac-3',
        number: 3,
        name: 'Nucleus & Chromatin',
        x: 52,
        y: 50,
        color: '#6366F1',
        category: 'Genetic Control',
        functionSummary: 'Houses genetic material and orchestrates transcription and replication.',
        detailedNotes: 'Enclosed by double lipid bilayer perforated by nuclear pore complexes.'
      },
      {
        id: 'p-ac-4',
        number: 4,
        name: 'Mitochondria (Cristae)',
        x: 62,
        y: 38,
        color: '#EF4444',
        category: 'Bioenergetics',
        functionSummary: 'Synthesizes ATP via oxidative phosphorylation and citric acid cycle.',
        detailedNotes: 'Folded inner cristae dramatically increase surface area for electron transport chain complexes.'
      }
    ]
  },

  'plant-cell': {
    diagramType: 'plant-cell',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Eukaryotic Plant Cell Ultrastructure',
    subtitle: 'Photosynthetic morphology: Cellulose wall, central vacuole & chloroplasts',
    description: 'Textbook plant cell diagram detailing rigid cellulose primary and secondary walls, plasma membrane, large central turgor vacuole, chloroplasts with thylakoid grana, nucleus, and plasmodesmata.',
    funFact: 'The central vacuole can occupy up to 90% of a mature plant cell\'s volume, exerting turgor pressure that keeps non-woody plants upright.',
    pins: [
      {
        id: 'p-pc-1',
        number: 1,
        name: 'Cellulose Cell Wall',
        x: 20,
        y: 30,
        color: '#10B981',
        category: 'Structural Boundary',
        functionSummary: 'Rigid protective outer envelope composed of cellulose microfibrils.',
        detailedNotes: 'Withstands internal turgor pressure and prevents osmotic lysis in hypotonic environments.'
      },
      {
        id: 'p-pc-2',
        number: 2,
        name: 'Large Central Vacuole',
        x: 55,
        y: 52,
        color: '#0284C7',
        category: 'Osmoregulation',
        functionSummary: 'Expansive fluid-filled organelle bounded by the tonoplast membrane.',
        detailedNotes: 'Stores cell sap, enzymes, pigments, and ions while generating mechanical turgor pressure.'
      },
      {
        id: 'p-pc-3',
        number: 3,
        name: 'Chloroplasts (Grana & Stroma)',
        x: 32,
        y: 42,
        color: '#15803D',
        category: 'Photosynthesis',
        functionSummary: 'Double-membrane plastids that capture light energy to produce glucose.',
        detailedNotes: 'Contains chlorophyll in thylakoid stacks (grana) for light reactions and stroma for the Calvin cycle.'
      }
    ]
  },

  'bony-fish': {
    diagramType: 'bony-fish',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Bony Fish (Osteichthyes) External Morphology',
    subtitle: 'Aquatic anatomy: Operculum, lateral line, ctenoid scales & homocercal fin',
    description: 'Detailed anatomical model of a freshwater bony fish (tilapia/perch) demonstrating diagnostic features: terminal mouth, nostril, eyes, protective operculum, paired pectoral and pelvic fins, spiny and soft dorsal fins, anal fin, homocercal caudal fin, and mechanosensory lateral line system.',
    funFact: 'The operculum functions as an active bellows pump, allowing teleost fish to pass oxygen-rich water over their gills even while remaining completely stationary.',
    pins: [
      {
        id: 'p-bf-1',
        number: 1,
        name: 'Operculum (Gill Cover)',
        x: 35,
        y: 46,
        color: '#06B6D4',
        category: 'Respiratory System',
        functionSummary: 'Protective bony flap that covers and ventilates the delicate gill filaments.',
        detailedNotes: 'Cooperates with the mouth cavity in two-phase suction pumping to drive continuous water flow across the gills.'
      },
      {
        id: 'p-bf-2',
        number: 2,
        name: 'Lateral Line System',
        x: 58,
        y: 48,
        color: '#3B82F6',
        category: 'Sensory System',
        functionSummary: 'Longitudinal mechanoreceptive canal detecting low-frequency water vibrations and pressure waves.',
        detailedNotes: 'Features cupula-covered neuromast hair cells facilitating schooling behavior and obstacle avoidance in murky water.'
      },
      {
        id: 'p-bf-3',
        number: 3,
        name: 'Caudal Fin (Homocercal Tail)',
        x: 90,
        y: 50,
        color: '#F59E0B',
        category: 'Locomotion',
        functionSummary: 'Symmetrical tail fin providing forward thrust and directional propulsion.',
        detailedNotes: 'Oscillated by powerful lateral myotome muscle blocks to produce high-velocity swimming bursts.'
      }
    ]
  },

  'human-heart': {
    diagramType: 'human-heart',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Internal Anatomy of the Human Heart',
    subtitle: 'Coronal section: 4 cardiac chambers, 4 valves, great vessels & systemic hemodynamics',
    description: 'Complete internal coronal section of the human heart showing the superior and inferior vena cava, right atrium, tricuspid valve, right ventricle, pulmonary valve, pulmonary trunk and arteries, pulmonary veins, left atrium, mitral (bicuspid) valve, aortic valve, left ventricle with thick myocardium, aorta with 3 arch arteries, and pericardium with directional blood flow arrows.',
    funFact: 'The human heart beats approximately 100,000 times per day, pumping roughly 2,000 gallons (7,570 liters) of oxygenated blood through 60,000 miles of blood vessels.',
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
      }
    ]
  },

  'euglena': {
    diagramType: 'euglena',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Euglena Viridis / Gracilis (Flagellated Protist)',
    subtitle: 'Cytology: Pellicle, Whiplash flagellum, stigma eyespot, reservoir, contractile vacuole, nucleus & chloroplasts',
    description: 'Authoritative cytological diagram of Euglena illustrating fusiform spindle-shaped body enclosed by helical pellicular protein strips, anterior flask-shaped reservoir (ampulla) and cytostome, long emergent locomotory flagellum with photoreceptor swelling, red carotenoid eyespot (stigma), osmoregulatory contractile vacuole with radiating collecting canals, prominent rose-pink nucleus with central magenta nucleolus (endosome), rough and smooth endoplasmic reticulum, Golgi apparatus, mitochondria with cristae, lysosomes, ribosomes, lobed chloroplasts with pyrenoids for autotrophy, and dark purple paramylon starch storage bodies for heterotrophy.',
    funFact: 'Euglena is a textbook mixotroph: it performs photosynthesis in light using chloroplasts, but in prolonged darkness, it sheds pigments and feeds heterotrophically by absorbing dissolved nutrients through its pellicle.',
    pins: [
      {
        id: 'p-eug-cytoplasm',
        number: 1,
        name: 'Cytoplasm',
        x: 50,
        y: 66,
        color: '#16A34A',
        category: 'Cellular Matrix',
        functionSummary: 'Fluid ground substance (cytosol) containing metabolic enzymes and suspending all organelles.',
        detailedNotes: 'Divides into an outer gel-like ectoplasm beneath the pellicle and an inner sol-like granular endoplasm.'
      },
      {
        id: 'p-eug-chloroplast',
        number: 2,
        name: 'Chloroplast',
        x: 41,
        y: 53,
        color: '#22C55E',
        category: 'Photosynthesis',
        functionSummary: 'Emerald-green plastids carrying chlorophylls a & b that capture light energy to synthesize glucose.',
        detailedNotes: 'Derived through secondary endosymbiosis of a green alga; features three enclosing membranes and central pyrenoid caps.'
      },
      {
        id: 'p-eug-nucleolus',
        number: 3,
        name: 'Nucleolus (Endosome)',
        x: 49,
        y: 53,
        color: '#C026D3',
        category: 'Ribosome Synthesis',
        functionSummary: 'Dense persistent endosome producing ribosomal RNA (rRNA) and assembling ribosome subunits.',
        detailedNotes: 'Remains intact during closed cryptomitotic cell division, elongating and constricting without dissolving.'
      },
      {
        id: 'p-eug-nucleus',
        number: 4,
        name: 'Nucleus',
        x: 49,
        y: 53,
        color: '#F43F5E',
        category: 'Genetic Control',
        functionSummary: 'Spherical double-membrane bounded organelle governing all metabolic activity and genetic reproduction.',
        detailedNotes: 'Enclosed by a double nuclear membrane with nuclear pores, containing linear chromosomes and granular chromatin.'
      },
      {
        id: 'p-eug-mitochondria',
        number: 5,
        name: 'Mitochondria',
        x: 43,
        y: 35,
        color: '#EF4444',
        category: 'Bioenergetics',
        functionSummary: 'Powerhouse organelles generating ATP through aerobic cellular respiration and oxidative phosphorylation.',
        detailedNotes: 'Possesses discoid mitochondrial cristae characteristic of discicristate excavate protists.'
      },
      {
        id: 'p-eug-ribosomes',
        number: 6,
        name: 'Ribosomes',
        x: 46,
        y: 34,
        color: '#1E293B',
        category: 'Protein Synthesis',
        functionSummary: 'Dense 80S ribonucleoprotein particles translating mRNA transcripts into polypeptide chains.',
        detailedNotes: 'Found free in the cytosol as well as membrane-bound on the rough endoplasmic reticulum.'
      },
      {
        id: 'p-eug-golgi',
        number: 7,
        name: 'Golgi Apparatus',
        x: 47,
        y: 46,
        color: '#EC4899',
        category: 'Protein Processing',
        functionSummary: 'Curved stacks of membrane-bound cisternae that modify, sort, and package glycoproteins into secretory vesicles.',
        detailedNotes: 'Buds transport vesicles delivering proteins to the pellicle, reservoir, and lysosomes.'
      },
      {
        id: 'p-eug-reservoir',
        number: 8,
        name: 'Reservoir (Ampulla)',
        x: 50,
        y: 31,
        color: '#0284C7',
        category: 'Anterior Chamber',
        functionSummary: 'Flask-shaped anterior invagination anchoring flagella and receiving osmoregulatory discharge.',
        detailedNotes: 'Opens to the exterior via the cytostome aperture; does not participate in phagotrophic ingestion in autotrophic euglenids.'
      },
      {
        id: 'p-eug-eyespot',
        number: 9,
        name: 'Eyespot (Stigma)',
        x: 46,
        y: 28,
        color: '#DC2626',
        category: 'Photoreception Shield',
        functionSummary: 'Crimson carotenoid pigment shield shading the photoreceptor for directional phototaxis.',
        detailedNotes: 'Consists of lipid droplets rich in astaxanthin and beta-carotene that cast an optical shadow as the cell rotates.'
      },
      {
        id: 'p-eug-flagellum',
        number: 10,
        name: 'Whiplash Locomotory Flagellum',
        x: 26,
        y: 16,
        color: '#22C55E',
        category: 'Locomotion',
        functionSummary: 'Long whiplike emergent axoneme beating in sinusoidal waves to pull Euglena through water.',
        detailedNotes: 'Features a classic 9+2 microtubular axoneme reinforced by a paraxial rod and fine mastigoneme hairs.'
      },
      {
        id: 'p-eug-pellicle',
        number: 11,
        name: 'Pellicle',
        x: 62,
        y: 48,
        color: '#166534',
        category: 'Cell Envelope',
        functionSummary: 'Flexible proteinaceous layer beneath plasma membrane allowing euglenoid movement (metaboly).',
        detailedNotes: 'Composed of interlocking overlapping protein strips connected by articulated gliding ridges.'
      },
      {
        id: 'p-eug-plasma-membrane',
        number: 12,
        name: 'Plasma Membrane',
        x: 61,
        y: 51,
        color: '#15803D',
        category: 'Cell Boundary',
        functionSummary: 'Selectively permeable lipid bilayer controlling ion fluxes and nutrient exchange.',
        detailedNotes: 'Forms the outer fluid-mosaic envelope intimately fused with the underlying pellicular strips.'
      },
      {
        id: 'p-eug-paramylon',
        number: 13,
        name: 'Paramylon',
        x: 48,
        y: 61,
        color: '#7C3AED',
        category: 'Carbohydrate Storage',
        functionSummary: 'Refractile crystalline reserve granules composed of unbranched β-1,3-glucan polymer.',
        detailedNotes: 'Enables survival in prolonged dark environments without degrading chlorophyll reserves.'
      },
      {
        id: 'p-eug-smooth-er',
        number: 14,
        name: 'Smooth Endoplasmic Reticulum',
        x: 55,
        y: 53,
        color: '#F59E0B',
        category: 'Lipid Synthesis',
        functionSummary: 'Tubular membranous network synthesizing lipids, phospholipids, and steroid derivatives.',
        detailedNotes: 'Lacks ribosome granules; involved in intracellular calcium regulation and detoxification.'
      },
      {
        id: 'p-eug-rough-er',
        number: 15,
        name: 'Rough Endoplasmic Reticulum',
        x: 54,
        y: 53,
        color: '#D97706',
        category: 'Protein Processing',
        functionSummary: 'Flattened cisternae studded with ribosomes for synthesizing membrane and secretory proteins.',
        detailedNotes: 'Directly continuous with the outer nuclear membrane envelope.'
      },
      {
        id: 'p-eug-lysosomes',
        number: 16,
        name: 'Lysosomes',
        x: 53,
        y: 60,
        color: '#9333EA',
        category: 'Intracellular Digestion',
        functionSummary: 'Hydrolytic enzyme-filled vesicles degrading worn-out organelles (autophagy) and macromolecules.',
        detailedNotes: 'Maintains an acidic luminal pH (~4.5–5.0) for optimal acid hydrolase activity.'
      },
      {
        id: 'p-eug-contractile-vacuole',
        number: 17,
        name: 'Contractile Vacuole',
        x: 55,
        y: 29,
        color: '#0284C7',
        category: 'Osmoregulation',
        functionSummary: 'Pulsatile spherical vesicle with star-like radiating collecting canals that expels excess water.',
        detailedNotes: 'Prevents osmotic lysis in hypotonic freshwater habitats by discharging fluid cyclically into the reservoir.'
      },
      {
        id: 'p-eug-photoreceptor',
        number: 18,
        name: 'Photoreceptor (Paraflagellar Body)',
        x: 48,
        y: 26,
        color: '#EA580C',
        category: 'Light Sensor',
        functionSummary: 'Light-sensitive crystalline swelling at the base of the long flagellum inside the reservoir.',
        detailedNotes: 'Contains flavin chromophores that transduce photon signals into flagellar wave modulation for positive phototaxis.'
      }
    ]
  },

  'amoeba': {
    diagramType: 'amoeba',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Amoeba Proteus (Sarcodina / Rhizopod)',
    subtitle: 'Amoeboid morphology: Pseudopodia, hyaline cap, endoplasm, contractile vacuole & nucleus',
    description: 'Textbook anatomical diagram of Amoeba proteus showing asymmetrical lobopodia, clear outer hyaline ectoplasm, inner granular endoplasm (plasmasol and plasmagel), biconcave disc-shaped nucleus, water-regulating contractile vacuole, food vacuoles undergoing holozoic digestion, and posterior wrinkled uroid.',
    funFact: 'Amoeba moves through amoeboid motion by cycling its internal cytoplasm from a semi-solid gel (plasmagel) to a fluid sol (plasmasol) driven by actin and myosin microfilaments.',
    pins: [
      {
        id: 'p-amo-1',
        number: 1,
        name: 'Lobopodium (Pseudopodium)',
        x: 28,
        y: 35,
        color: '#14B8A6',
        category: 'Locomotion & Feeding',
        functionSummary: 'Blunt, finger-like cytoplasmic projection used for amoeboid creeping and phagocytosis.',
        detailedNotes: 'Formed by the forward streaming of plasmasol through the gelled ectoplasmic tube, capped by a clear hyaline ectoplasm.'
      },
      {
        id: 'p-amo-2',
        number: 2,
        name: 'Hyaline Cap & Ectoplasm',
        x: 62,
        y: 28,
        color: '#5EEAD4',
        category: 'Cell Boundary',
        functionSummary: 'Non-granular, gelated outer cytoplasmic layer providing structural boundary.',
        detailedNotes: 'Lacks cell organelles; plays an essential role in initiating new pseudopodial extensions.'
      },
      {
        id: 'p-amo-3',
        number: 3,
        name: 'Granular Endoplasm (Plasmasol & Plasmagel)',
        x: 50,
        y: 50,
        color: '#0D9488',
        category: 'Cytoplasm Core',
        functionSummary: 'Dense inner fluid containing all organelles, glycogen granules, and enzymes.',
        detailedNotes: 'Divides into an outer viscous plasmagel and an inner flowing plasmasol that drives locomotion.'
      },
      {
        id: 'p-amo-4',
        number: 4,
        name: 'Biconcave Disk Nucleus',
        x: 47,
        y: 47,
        color: '#818CF8',
        category: 'Genetic Control',
        functionSummary: 'Spherical/discoid eukaryotic nucleus directing cellular metabolism and binary fission.',
        detailedNotes: 'Contains a honeycomb-like nuclear lamina and numerous peripheral chromatin granules (heterochromatin).'
      },
      {
        id: 'p-amo-5',
        number: 5,
        name: 'Contractile Vacuole Complex',
        x: 55,
        y: 44,
        color: '#0284C7',
        category: 'Osmoregulation',
        functionSummary: 'Clear fluid-filled vesicle collecting and expelling excess hypotonic water.',
        detailedNotes: 'Maintains osmotic equilibrium in freshwater environments by pulsing periodically to release water at the plasmalemma.'
      },
      {
        id: 'p-amo-6',
        number: 6,
        name: 'Food Vacuoles (Phagolysosomes)',
        x: 43,
        y: 56,
        color: '#F59E0B',
        category: 'Digestion',
        functionSummary: 'Membrane-bound vesicles enclosing captured food (algae/bacteria) for enzymatic breakdown.',
        detailedNotes: 'Formed via phagocytosis; fuses with lysosomes where pH changes from acidic to alkaline during digestion.'
      },
      {
        id: 'p-amo-7',
        number: 7,
        name: 'Uroid (Posterior Wrinkled End)',
        x: 32,
        y: 60,
        color: '#F43F5E',
        category: 'Morphology',
        functionSummary: 'Mulberry-like corrugated posterior zone where tail retraction occurs.',
        detailedNotes: 'Accumulates membrane fragments and undigested waste prior to egestion.'
      }
    ]
  },

  'paramecium': {
    diagramType: 'paramecium',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Paramecium Caudatum (Ciliated Protozoan)',
    subtitle: 'Ciliate cytology: Oral groove, cilia, cytostome, contractile vacuoles, macronucleus & micronucleus',
    description: 'Textbook anatomical diagram of Paramecium caudatum showing slipper-shaped body coated in rhythmic ciliary rows, oblique oral groove (peristome) leading to cytostome and cytopharynx, forming food vacuoles, anterior and posterior star-shaped contractile vacuoles with radial canals, polyploid kidney-shaped macronucleus, diploid micronucleus, and anal pore (cytoproct).',
    funFact: 'Paramecium coordinates thousands of cilia in metachronal waves, swimming backward and spiraling away when it hits an obstacle—a famous escape reflex called the "avoiding reaction".',
    pins: [
      {
        id: 'p-par-1',
        number: 1,
        name: 'Pellicular Cilia Rows',
        x: 35,
        y: 28,
        color: '#60A5FA',
        category: 'Locomotion',
        functionSummary: 'Thousands of hair-like motile cilia beating in metachronal waves for rapid swimming.',
        detailedNotes: 'Each cilium arises from a basal body (kinetosome) connected in longitudinal rows (kineties) beneath the pellicle.'
      },
      {
        id: 'p-par-2',
        number: 2,
        name: 'Oral Groove (Peristome)',
        x: 48,
        y: 42,
        color: '#3B82F6',
        category: 'Feeding Apparatus',
        functionSummary: 'Oblique funnel-shaped depression guiding water currents and food particles inward.',
        detailedNotes: 'Cilia lining the oral groove beat strongly to concentrate bacteria and direct them into the cytostome.'
      },
      {
        id: 'p-par-3',
        number: 3,
        name: 'Cytostome (Cell Mouth) & Cytopharynx',
        x: 54,
        y: 52,
        color: '#93C5FD',
        category: 'Ingestion',
        functionSummary: 'Cellular aperture where food is packaged into budding phagocytic food vacuoles.',
        detailedNotes: 'The cytopharynx is reinforced with specialized microtubular ribbons (nematodesmata) that funnel food inward.'
      },
      {
        id: 'p-par-4',
        number: 4,
        name: 'Food Vacuoles in Cyclosis',
        x: 58,
        y: 54,
        color: '#10B981',
        category: 'Digestion',
        functionSummary: 'Vesicles circulating along a defined cytoplasmic path (cyclosis) during digestion.',
        detailedNotes: 'Move in a counter-clockwise loop throughout the endoplasm while lysosomal enzymes digest nutrients.'
      },
      {
        id: 'p-par-5',
        number: 5,
        name: 'Anterior Star Contractile Vacuole',
        x: 39,
        y: 47,
        color: '#38BDF8',
        category: 'Osmoregulation',
        functionSummary: 'Osmoregulatory vesicle surrounded by 6–8 radiating radial feeder canals.',
        detailedNotes: 'Radial canals collect fluid from endoplasmic reticulum and deliver it into the main reservoir for systolic discharge.'
      },
      {
        id: 'p-par-6',
        number: 6,
        name: 'Posterior Star Contractile Vacuole',
        x: 62,
        y: 47,
        color: '#0284C7',
        category: 'Osmoregulation',
        functionSummary: 'Pulsates more frequently than the anterior vacuole due to higher water intake near the cytopharynx.',
        detailedNotes: 'Maintains ionic balance in freshwater habitats by pumping out hypotonic water.'
      },
      {
        id: 'p-par-7',
        number: 7,
        name: 'Kidney-Shaped Macronucleus',
        x: 48,
        y: 48,
        color: '#C084FC',
        category: 'Somatic Control',
        functionSummary: 'Large polyploid nucleus governing daily vegetative cellular metabolism and RNA synthesis.',
        detailedNotes: 'Contains hundreds of copies of transcribed genes; divides amitotically during binary fission.'
      },
      {
        id: 'p-par-8',
        number: 8,
        name: 'Spherical Micronucleus',
        x: 49,
        y: 44,
        color: '#F43F5E',
        category: 'Genetic Reproduction',
        functionSummary: 'Small diploid germline nucleus responsible for sexual genetic exchange (conjugation).',
        detailedNotes: 'Silent during vegetative growth but undergoes meiosis and reciprocal exchange during sexual conjugation.'
      },
      {
        id: 'p-par-9',
        number: 9,
        name: 'Cytoproct (Anal Pore)',
        x: 64,
        y: 58,
        color: '#F87171',
        category: 'Egestion',
        functionSummary: 'Fixed posterior site on the pellicle where undigested food vacuole residues are expelled.',
        detailedNotes: 'Opens temporarily when an exhausted food vacuole fuses with the pellicular membrane for exocytosis.'
      }
    ]
  }
};

/**
 * Intelligent classifier that checks whether a user concept prompt matches any known
 * real-life, textbook-accurate scientific model.
 */
export function matchScientificConcept(query: string): ScientificPresetConfig | null {
  const q = query.toLowerCase();

  // 1. Human Sperm / Spermatozoon / Male Gamete (HIGH PRIORITY)
  if (/\b(sperm|spermatozoon|spermatozoa|sperm\s*cell|male\s*gamete|sperm\s*head|acrosome|sperm\s*flagellum|sperm\s*anatomy|sperm\s*structure|spermiogenesis|spermato|spermatocele)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['human-sperm'];
  }

  // 2. Euglena (HIGH PRIORITY)
  if (/\b(euglena|euglenoid|euglenophyta|euglena\s*gracilis|euglena\s*viridis|mastigophora|flagellate\s*protist)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['euglena'];
  }

  // 2. Amoeba & Sarcodines (HIGH PRIORITY)
  if (/\b(amoeba|ameba|amoeba\s*proteus|pseudopod|lobopod|sarcodina|rhizopod)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['amoeba'];
  }

  // 3. Paramecium & Ciliates (HIGH PRIORITY)
  if (/\b(parameci|paramecium|paramecium\s*caudatum|ciliate|ciliophora)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['paramecium'];
  }

  // 4. Agama Lizard & Reptiles
  if (/\b(agama|lizard|reptile|sauropsid|squamata|agamidae|agama\s*agama|rainbow\s*agama|rock\s*agama)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['agama-lizard'];
  }

  // 5. Animal Cell
  if (/\b(animal\s*cell|eukaryotic\s*cell|cell\s*ultrastructure|plasma\s*membrane)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['animal-cell'];
  }

  // 6. Plant Cell
  if (/\b(plant\s*cell|photosynthetic\s*cell|cellulose\s*wall|tonoplast)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['plant-cell'];
  }

  // 7. Bony Fish
  if (/\b(bony\s*fish|fish|tilapia|perch|osteichthyes|operculum|lateral\s*line)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['bony-fish'];
  }

  // 8. Human Heart
  if (/\b(heart|cardiac|myocardium|ventricle|atrium|aorta|cardiovascular)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['human-heart'];
  }

  // 9. Neuron
  if (/\b(neuron|nerve\s*cell|motor\s*neuron|dendrite|axon|synap|myelin|schwann)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['neuron'];
  }

  // 10. Human Brain
  if (/\b(brain|cerebrum|cerebellum|cortex|corpus\s*callosum|thalamus|brainstem|pons|medulla|frontal\s*lobe)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['human-brain'];
  }

  // 11. Human Eye
  if (/\b(eye|cornea|retina|pupil|iris|lens|fovea|optic\s*nerve|sclera|vision)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['human-eye'];
  }

  // 12. Nephron / Kidney
  if (/\b(nephron|kidney|glomerulus|bowman|renal|henle|loop\s*of\s*henle|convoluted\s*tubule|collecting\s*duct)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['nephron-kidney'];
  }

  // 13. Mitochondria
  if (/\b(mitochondri|cristae|matrix|atp\s*synthase|powerhouse\s*of\s*the\s*cell)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['mitochondria'];
  }

  // 14. Chloroplast
  if (/\b(chloroplast|grana|granum|thylakoid|stroma|photosynthe)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['chloroplast'];
  }

  // 15. Bacterial Cell / Prokaryote
  if (/\b(bacteri|prokaryot|flagell|nucleoid|peptidoglycan|e\.?\s*coli|bacill|coccus)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['bacterial-cell'];
  }

  // 16. DNA Double Helix
  if (/\b(dna|double\s*helix|deoxyribo|nucleic\s*acid|watson\s*crick|adenine|thymine|base\s*pair)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['dna-helix'];
  }

  // 17. Lungs / Respiratory System
  if (/\b(lung|respirat|trachea|bronch|alveol|diaphragm|pulmonary|pleura)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['lungs-respiratory'];
  }

  // 18. Stomach / Digestive System
  if (/\b(stomach|gastric|digest|rugae|pylorus|pyloric|fundus|duodenum|esophagus)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['stomach-digestive'];
  }

  // 19. Skin Cross Section
  if (/\b(skin|epidermis|dermis|hypodermis|hair\s*follicle|integument|sweat\s*gland|sebaceous)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['skin-anatomy'];
  }

  // 20. Human Ear
  if (/\b(ear|pinna|cochlea|eardrum|tympanic|ossicle|malleus|incus|stapes|hearing|auditory)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['human-ear'];
  }

  // 21. Flower Anatomy
  if (/\b(flower|angiosperm|petal|sepal|stamen|anther|carpel|pistil|stigma|ovary|ovule|pollination)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['flower-anatomy'];
  }

  // 22. Bacteriophage
  if (/\b(phage|bacteriophage|capsid|t4\s*virus|virus\s*structure|tail\s*fiber)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['bacteriophage'];
  }

  // 23. Volcano
  if (/\b(volcano|magma|lava|crater|conduit|ash\s*cloud|stratovolcano|vent)\b/i.test(q)) {
    return SCIENTIFIC_PRESETS_REGISTRY['volcano'];
  }

  return null;
}
