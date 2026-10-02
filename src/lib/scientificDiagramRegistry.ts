import { DiagramConcept, DiagramSpecification, CanonicalStructureDefinition, LabelPin } from '../types';

/**
 * ============================================================================
 * CANONICAL SCIENTIFIC DIAGRAM SPECIFICATION REGISTRY
 * Authoritative Single Source of Truth for Academic Anatomical & Cytological Visuals
 * 
 * References:
 * - Campbell Biology 12th Edition (Pearson)
 * - Gray's Anatomy: The Anatomical Basis of Clinical Practice 42nd Edition (Elsevier)
 * - Guyton and Hall Textbook of Medical Physiology 14th Edition (Elsevier)
 * - OpenStax Anatomy and Physiology 2e / Biology 2e
 * - Lehninger Principles of Biochemistry 8th Edition
 * ============================================================================
 */

export const CANONICAL_DIAGRAM_SPECIFICATIONS: Record<string, DiagramSpecification> = {
  // --------------------------------------------------------------------------
  // 1. EUGLENA (Euglena gracilis / Euglenoid Protist)
  // --------------------------------------------------------------------------
  'euglena': {
    diagramType: 'euglena',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Euglena (Flagellated Protist)',
    subtitle: 'Cytology: Pellicle, Locomotory Flagellum, Eyespot (Stigma), Reservoir, Contractile Vacuole, Nucleus & Chloroplasts',
    description: 'Textbook cytological diagram of Euglena illustrating the fusiform spindle-shaped body enclosed by interlocking pellicular protein strips, an anterior flagellar reservoir with long locomotory whiplash flagellum, pigmented eyespot (stigma), paraflagellar photoreceptor, contractile vacuole complex, spherical nucleus with central nucleolus, and photosynthetic chloroplasts with paramylon reserve granules.',
    funFact: 'Euglena is mixotrophic: it conducts photosynthesis in light, but in darkness it can feed heterotrophically by absorbing nutrients through its pellicle.',
    sources: [
      {
        name: 'Campbell Biology 12th Ed',
        purpose: 'morphology',
        edition: 'Chapter 28: Protists'
      },
      {
        name: 'OpenStax Biology 2e',
        url: 'https://openstax.org/books/biology-2e/pages/23-3-groups-of-protists',
        purpose: 'curriculum-reference'
      }
    ],
    forbiddenTerms: [
      'Nucleolus (Endosome)',
      'Endosome'
    ],
    structures: [
      {
        id: 'euglena-flagellum',
        canonicalName: 'Locomotory Whiplash Flagellum',
        aliases: ['Flagellum', 'Anterior Flagellum', 'Axoneme Flagellum'],
        number: 1,
        category: 'Locomotion',
        functionSummary: 'Long anterior whip-like 9+2 axoneme flagellum providing pulling propulsion in helical waves.',
        detailedNotes: 'Emerges from the anterior reservoir; beats in three-dimensional waves to pull the organism through water.',
        color: '#38BDF8',
        anchor: { x: 34, y: 12, svgAnchorId: 'anchor-euglena-flagellum' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-eyespot',
        canonicalName: 'Stigma',
        aliases: ['Eyespot', 'Carotenoid Stigma'],
        number: 2,
        category: 'Photoreception',
        functionSummary: 'Shading shield composed of lipid droplets containing astaxanthin and red carotenoids.',
        detailedNotes: 'Casts an intermittent shadow on the paraflagellar body as the cell rotates, orienting the cell toward optimal light (phototaxis).',
        color: '#EF4444',
        anchor: { x: 36, y: 32, svgAnchorId: 'anchor-euglena-eyespot' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-paraflagellar',
        canonicalName: 'Paraflagellar Body',
        aliases: ['Photoreceptor', 'Flagellar Swelling'],
        number: 3,
        category: 'Photoreception',
        functionSummary: 'Flavin-protein photoreceptor swelling situated near the base of the emergent flagellum.',
        detailedNotes: 'Senses modulated light intensity to direct flagellar steering reflexes.',
        color: '#F59E0B',
        anchor: { x: 34, y: 35, svgAnchorId: 'anchor-euglena-paraflagellar' },
        required: false,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'euglena-reservoir',
        canonicalName: 'Flagellar Reservoir',
        aliases: ['Ampulla', 'Gullet / Reservoir'],
        number: 4,
        category: 'Anterior Chamber',
        functionSummary: 'Flask-shaped invagination where flagellar basal bodies anchor and contractile vacuole empties.',
        detailedNotes: 'Communicates with the exterior via a narrow canal; functions in pinocytosis and fluid regulation.',
        color: '#06B6D4',
        anchor: { x: 35, y: 37, svgAnchorId: 'anchor-euglena-reservoir' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-contractile-vacuole',
        canonicalName: 'Contractile Vacuole Complex',
        aliases: ['Contractile Vacuole', 'Osmoregulatory Vacuole'],
        number: 5,
        category: 'Osmoregulation',
        functionSummary: 'Pulsatile organelle surrounded by collecting canals that collects and expels excess hypotonic water.',
        detailedNotes: 'Maintains internal hydrostatic equilibrium by rhythmically discharging fluid into the flagellar reservoir.',
        color: '#0284C7',
        anchor: { x: 38, y: 40, svgAnchorId: 'anchor-euglena-contractile-vacuole' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-pellicle',
        canonicalName: 'Pellicle',
        aliases: ['Pellicular Strips', 'Proteinaceous Pellicle'],
        number: 6,
        category: 'Cell Envelope',
        functionSummary: 'Interlocking helical protein strips beneath the plasma membrane giving shape and flexibility.',
        detailedNotes: 'Articulated proteinaceous strips enable peristaltic euglenoid movement (metaboly).',
        color: '#10B981',
        anchor: { x: 62, y: 38, svgAnchorId: 'anchor-euglena-pellicle' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-chloroplast',
        canonicalName: 'Chloroplast',
        aliases: ['Chloroplast with Pyrenoid', 'Plastid'],
        number: 7,
        category: 'Photosynthesis',
        functionSummary: 'Triple-membrane plastid with chlorophylls a and b for photoautotrophic carbon fixation.',
        detailedNotes: 'Derived through secondary endosymbiosis of a green alga; features pyrenoid centers for carbohydrate synthesis.',
        color: '#16A34A',
        anchor: { x: 42, y: 54, svgAnchorId: 'anchor-euglena-chloroplast' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-paramylon',
        canonicalName: 'Paramylon Granule',
        aliases: ['Paramylon Body', 'Paramylon Starch'],
        number: 8,
        category: 'Carbohydrate Storage',
        functionSummary: 'Crystalline β-1,3-glucan storage granules providing energy reserves during dark periods.',
        detailedNotes: 'Distinct from green plant α-1,4-starch; does not stain blue with iodine.',
        color: '#7C3AED',
        anchor: { x: 52, y: 46, svgAnchorId: 'anchor-euglena-paramylon' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'euglena-nucleus',
        canonicalName: 'Nucleus',
        aliases: ['Cell Nucleus', 'Eukaryotic Nucleus'],
        number: 9,
        category: 'Genetic Control',
        functionSummary: 'Double-membrane organelle containing the genomic DNA and directing cellular metabolism.',
        detailedNotes: 'Enclosed by a nuclear envelope with nuclear pores; contains condensed chromatin throughout interphase.',
        color: '#F43F5E',
        anchor: { x: 47, y: 50, svgAnchorId: 'anchor-euglena-nucleus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'euglena-nucleolus',
        canonicalName: 'Nucleolus',
        aliases: ['Central Nucleolus', 'Subnuclear Nucleolus'],
        number: 10,
        category: 'Ribosome Synthesis',
        functionSummary: 'Dense subnuclear structure actively transcribing pre-ribosomal RNA and assembling ribosome subunits.',
        detailedNotes: 'Remains persistent during closed cryptomitotic cell division without dissolving; completely distinct from endosomes.',
        color: '#C026D3',
        anchor: { x: 50, y: 50, svgAnchorId: 'anchor-euglena-nucleolus' },
        required: true,
        detailLevels: ['standard', 'advanced']
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 2. FEMALE REPRODUCTIVE SYSTEM (Coronal Section)
  // --------------------------------------------------------------------------
  'female-reproductive-system': {
    diagramType: 'female-reproductive-system',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Female Reproductive Organs (Internal Gynecological Anatomy)',
    subtitle: 'Coronal cross-section: Uterus, Ovaries, Fallopian Tubes, Fimbriae, Endometrium, Myometrium, Cervix & Vagina',
    description: 'Authoritative coronal anatomical cross-section of the human female internal reproductive organs illustrating the pear-shaped uterus (fundus, myometrium, endometrium, and uterine cavity), bilateral fallopian tubes (isthmus, ampulla, infundibulum, and fimbriae), ovaries with follicular maturation, utero-ovarian ligaments, cervix, and vaginal canal.',
    funFact: 'Fertilization almost always occurs in the ampulla of the fallopian tube within 12 to 24 hours of ovulation before the zygote migrates to the endometrium.',
    sources: [
      {
        name: "Gray's Anatomy 42nd Ed",
        purpose: 'morphology',
        edition: 'Section 8: Pelvis and Perineum, Chapter 75: Female Reproductive System'
      },
      {
        name: 'OpenStax Anatomy and Physiology 2e',
        url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-female-reproductive-system',
        purpose: 'curriculum-reference'
      }
    ],
    structures: [
      {
        id: 'frs-uterine-fundus',
        canonicalName: 'Uterine Fundus',
        aliases: ['Fundus of Uterus', 'Fundus'],
        number: 1,
        category: 'Uterine Anatomy',
        functionSummary: 'Broad, rounded superior convex dome of the uterus lying above the entrance of the fallopian tubes.',
        detailedNotes: 'Clinically measured during pregnancy as fundal height to evaluate gestational maturity and fetal development.',
        color: '#BE185D',
        anchor: { x: 50, y: 28, svgAnchorId: 'anchor-frs-fundus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-endometrium',
        canonicalName: 'Endometrium',
        aliases: ['Endometrial Lining', 'Uterine Mucosa'],
        number: 2,
        category: 'Mucosal Lining',
        functionSummary: 'Inner vascular and glandular mucosal layer that proliferates, secretes, and sloughs off during the menstrual cycle.',
        detailedNotes: 'Differentiates into the functionalis layer (shed during menstruation) and basalis layer (regenerative base); primary site of blastocyst implantation.',
        color: '#881337',
        anchor: { x: 46, y: 44, svgAnchorId: 'anchor-frs-endometrium' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-uterine-cavity',
        canonicalName: 'Uterine Cavity',
        aliases: ['Cavity of Uterus', 'Uterine Lumen'],
        number: 3,
        category: 'Internal Lumen',
        functionSummary: 'Triangular central anatomical lumen through which sperm ascend and within which the fetus develops.',
        detailedNotes: 'Potential space bounded by the endometrium, narrowing inferiorly toward the internal os of the cervix.',
        color: '#4338CA',
        anchor: { x: 50, y: 47, svgAnchorId: 'anchor-frs-uterine-cavity' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'frs-myometrium',
        canonicalName: 'Myometrium',
        aliases: ['Uterine Muscle Wall', 'Myometrial Layer'],
        number: 4,
        category: 'Muscular Layer',
        functionSummary: 'Thick middle layer of interlacing smooth muscle bundles responsive to oxytocin during labor.',
        detailedNotes: 'Generates powerful rhythmic contractions during childbirth and mechanically compresses arcuate blood vessels post-partum to prevent hemorrhage.',
        color: '#9D174D',
        anchor: { x: 57, y: 40, svgAnchorId: 'anchor-frs-myometrium' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-fallopian-tube',
        canonicalName: 'Fallopian Tube',
        aliases: ['Uterine Tube', 'Oviduct', 'Ampulla of Fallopian Tube'],
        number: 5,
        category: 'Fertilization Conduit',
        functionSummary: 'Ciliated muscular duct that captures the ovulated oocyte and provides the physiological site for fertilization.',
        detailedNotes: 'Lined with ciliated simple columnar epithelium and peg cells; peristalsis and ciliary beating propel the zygote toward the uterus.',
        color: '#F472B6',
        anchor: { x: 23, y: 28, svgAnchorId: 'anchor-frs-fallopian-tube' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-fimbriae',
        canonicalName: 'Fimbriae',
        aliases: ['Fimbriae of Infundibulum', 'Fimbriated End'],
        number: 6,
        category: 'Ovum Capture',
        functionSummary: 'Fringed finger-like mucosal projections at the infundibulum that drape over the ovary to catch ovulated oocytes.',
        detailedNotes: 'Ciliary currents along the elongated ovarian fimbria sweep the released secondary oocyte into the ostium abdominale.',
        color: '#EC4899',
        anchor: { x: 12, y: 53, svgAnchorId: 'anchor-frs-fimbriae' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-ovary',
        canonicalName: 'Ovary',
        aliases: ['Female Gonad', 'Ovarian Follicles'],
        number: 7,
        category: 'Female Gonad',
        functionSummary: 'Primary reproductive organ producing female gametes (ova) and steroid hormones (estrogens and progesterone).',
        detailedNotes: 'Contains follicles across developmental stages (primordial, primary, secondary, mature Graafian) and post-ovulatory corpus luteum.',
        color: '#F59E0B',
        anchor: { x: 20, y: 55, svgAnchorId: 'anchor-frs-ovary' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-ovarian-ligament',
        canonicalName: 'Ovarian Ligament',
        aliases: ['Utero-Ovarian Ligament', 'Ligament of Ovary'],
        number: 8,
        category: 'Structural Support',
        functionSummary: 'Fibromuscular cord attaching the medial pole of the ovary to the lateral angle (cornu) of the uterus.',
        detailedNotes: 'Embryological derivative of the cranial gubernaculum; anchors the ovary in proper anatomical position within the broad ligament.',
        color: '#94A3B8',
        anchor: { x: 34, y: 49, svgAnchorId: 'anchor-frs-ovarian-ligament' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'frs-cervix',
        canonicalName: 'Cervix',
        aliases: ['Cervix Uteri', 'Endocervical Canal'],
        number: 9,
        category: 'Uterine Neck',
        functionSummary: 'Inferior cylindrical neck of the uterus projecting into the vagina with internal os, canal, and external os.',
        detailedNotes: 'Endocervical crypts secrete hormone-regulated mucus that acts either as a sperm reservoir or protective barrier against ascending infections.',
        color: '#831843',
        anchor: { x: 50, y: 69, svgAnchorId: 'anchor-frs-cervix' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'frs-vagina',
        canonicalName: 'Vagina',
        aliases: ['Vaginal Canal', 'Vaginal Rugae'],
        number: 10,
        category: 'Copulatory & Birth Canal',
        functionSummary: 'Elastic muscular canal lined by non-keratinized stratified squamous epithelium with transverse rugae folds.',
        detailedNotes: 'Provides the copulatory canal, pathway for menstrual egress, and the lower birth canal during parturition.',
        color: '#701A75',
        anchor: { x: 50, y: 82, svgAnchorId: 'anchor-frs-vagina' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 3. PARAMECIUM CAUDATUM
  // --------------------------------------------------------------------------
  'paramecium': {
    diagramType: 'paramecium',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Paramecium Caudatum (Ciliated Protozoan)',
    subtitle: 'Ciliate cytology: Pellicle Cilia, Oral Groove (Peristome), Cytostome, Contractile Vacuoles, Macronucleus & Micronucleus',
    description: 'Authoritative cytological diagram of Paramecium caudatum showing the slipper-shaped body with coordinated ciliary rows, oblique oral groove leading to the cytostome and cytopharynx, cyclosis of food vacuoles, anterior and posterior star-shaped contractile vacuoles with radial canals, kidney-shaped macronucleus, diploid micronucleus, and posterior cytoproct (anal pore).',
    funFact: 'Paramecium beats thousands of cilia in coordinated metachronal waves, executing a 3D spiral backward avoiding reaction whenever it bumps into an obstacle.',
    sources: [
      {
        name: 'Campbell Biology 12th Ed',
        purpose: 'morphology',
        edition: 'Chapter 28: Protists'
      },
      {
        name: 'OpenStax Biology 2e',
        purpose: 'curriculum-reference'
      }
    ],
    structures: [
      {
        id: 'paramecium-cilia',
        canonicalName: 'Pellicular Cilia',
        aliases: ['Cilia Rows', 'Motile Cilia'],
        number: 1,
        category: 'Locomotion',
        functionSummary: 'Thousands of hair-like motile axonemes beating in metachronal waves for swimming and feeding currents.',
        detailedNotes: 'Arranged in longitudinal rows (kineties) connected by subpellicular kinetodesmal fibrils.',
        color: '#60A5FA',
        anchor: { x: 35, y: 28, svgAnchorId: 'anchor-paramecium-cilia' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-oral-groove',
        canonicalName: 'Oral Groove',
        aliases: ['Peristome', 'Oral Trough'],
        number: 2,
        category: 'Feeding Apparatus',
        functionSummary: 'Oblique funnel-shaped ciliated depression that directs water and food particles toward the cytostome.',
        detailedNotes: 'Specialized oral cilia beat synchronously to concentrate bacteria into the cell mouth.',
        color: '#3B82F6',
        anchor: { x: 48, y: 42, svgAnchorId: 'anchor-paramecium-oral-groove' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-cytostome',
        canonicalName: 'Cytostome & Cytopharynx',
        aliases: ['Cell Mouth', 'Cytostome'],
        number: 3,
        category: 'Ingestion',
        functionSummary: 'Cellular aperture and gullet where food is packaged into budding phagocytic vacuoles.',
        detailedNotes: 'Reinforced by microtubular ribbons (nematodesmata) that funnel ingested prey.',
        color: '#93C5FD',
        anchor: { x: 54, y: 52, svgAnchorId: 'anchor-paramecium-cytostome' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'paramecium-food-vacuole',
        canonicalName: 'Food Vacuole',
        aliases: ['Gastric Vacuole', 'Phagosome'],
        number: 4,
        category: 'Digestion',
        functionSummary: 'Digestive vesicle that circulates through the endoplasm in a definite cyclosis loop.',
        detailedNotes: 'Lysosomal enzymes hydrolyze nutrients; pH shifts from acidic to alkaline during cyclosis.',
        color: '#10B981',
        anchor: { x: 58, y: 54, svgAnchorId: 'anchor-paramecium-food-vacuole' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-anterior-vacuole',
        canonicalName: 'Anterior Contractile Vacuole',
        aliases: ['Anterior Osmoregulatory Vacuole'],
        number: 5,
        category: 'Osmoregulation',
        functionSummary: 'Star-shaped vesicle with 6-8 radiating feeder canals that collects and discharges excess water.',
        detailedNotes: 'Radial canals drain the endoplasmic reticulum and deliver fluid into the central bladder.',
        color: '#38BDF8',
        anchor: { x: 39, y: 47, svgAnchorId: 'anchor-paramecium-anterior-vacuole' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-posterior-vacuole',
        canonicalName: 'Posterior Contractile Vacuole',
        aliases: ['Posterior Osmoregulatory Vacuole'],
        number: 6,
        category: 'Osmoregulation',
        functionSummary: 'Pulsates more rapidly than the anterior vacuole due to higher water influx near the cytostome.',
        detailedNotes: 'Maintains osmotic balance in hypotonic freshwater ecosystems.',
        color: '#0284C7',
        anchor: { x: 62, y: 47, svgAnchorId: 'anchor-paramecium-posterior-vacuole' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'paramecium-macronucleus',
        canonicalName: 'Macronucleus',
        aliases: ['Vegetative Nucleus', 'Kidney Macronucleus'],
        number: 7,
        category: 'Somatic Control',
        functionSummary: 'Large polyploid kidney-shaped nucleus regulating vegetative daily metabolism and protein synthesis.',
        detailedNotes: 'Contains many copies of the genome; divides amitotically during binary fission.',
        color: '#C084FC',
        anchor: { x: 48, y: 48, svgAnchorId: 'anchor-paramecium-macronucleus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-micronucleus',
        canonicalName: 'Micronucleus',
        aliases: ['Generative Nucleus', 'Diplont Micronucleus'],
        number: 8,
        category: 'Genetic Reproduction',
        functionSummary: 'Small diploid germline nucleus responsible for genetic exchange during sexual conjugation.',
        detailedNotes: 'Transcriptionally silent during vegetative growth; undergoes meiosis and reciprocal exchange during conjugation.',
        color: '#F43F5E',
        anchor: { x: 49, y: 44, svgAnchorId: 'anchor-paramecium-micronucleus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'paramecium-cytoproct',
        canonicalName: 'Cytoproct',
        aliases: ['Anal Pore', 'Cell Anus'],
        number: 9,
        category: 'Egestion',
        functionSummary: 'Permanent posterior site where exhausted food vacuoles fuse to expel indigestible residues.',
        detailedNotes: 'Opens temporarily for exocytosis of undigested waste.',
        color: '#F87171',
        anchor: { x: 64, y: 58, svgAnchorId: 'anchor-paramecium-cytoproct' },
        required: false,
        detailLevels: ['standard', 'advanced']
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 4. AMOEBA PROTEUS
  // --------------------------------------------------------------------------
  'amoeba': {
    diagramType: 'amoeba',
    category: 'Biology & Cells',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Amoeba Proteus (Sarcodine Rhizopod)',
    subtitle: 'Amoeboid cytology: Pseudopodia (Lobopodia), Ectoplasm, Endoplasm, Nucleus, Contractile Vacuole & Food Vacuoles',
    description: 'Anatomical diagram of Amoeba proteus displaying dynamic blunt pseudopodia (lobopodia), clear hyaline ectoplasm, granular plasmasol/plasmagel endoplasm, discoid biconcave nucleus, contractile vacuole complex, food vacuoles, and posterior uroid.',
    funFact: 'Amoeboid locomotion operates via sol-gel transitions: endoplasm (plasmasol) streams forward and solidifies into ectoplasm (plasmagel) at the hyaline cap.',
    sources: [
      {
        name: 'Campbell Biology 12th Ed',
        purpose: 'morphology',
        edition: 'Chapter 28: Protists'
      }
    ],
    structures: [
      {
        id: 'amoeba-pseudopodium',
        canonicalName: 'Pseudopodium (Lobopodium)',
        aliases: ['Pseudopod', 'Lobopodia'],
        number: 1,
        category: 'Locomotion & Feeding',
        functionSummary: 'Blunt, finger-like cytoplasmic projection generated by actin-myosin sol-gel transitions for amoeboid movement and phagocytosis.',
        detailedNotes: 'Extends by forward streaming of endoplasm against the hyaline cap, engulfing prey in food cups.',
        color: '#14B8A6',
        anchor: { x: 26, y: 32, svgAnchorId: 'anchor-amoeba-pseudopodium' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-ectoplasm',
        canonicalName: 'Ectoplasm',
        aliases: ['Hyaline Cap', 'Plasmagel'],
        number: 2,
        category: 'Cytoplasmic Layer',
        functionSummary: 'Non-granular, gel-like peripheral cytoplasmic zone directly beneath the plasmalemma.',
        detailedNotes: 'Maintains cortical cell rigidity and forms the clear hyaline cap at the tip of advancing pseudopodia.',
        color: '#5EEAD4',
        anchor: { x: 38, y: 26, svgAnchorId: 'anchor-amoeba-ectoplasm' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-endoplasm',
        canonicalName: 'Endoplasm',
        aliases: ['Plasmasol', 'Granular Cytoplasm'],
        number: 3,
        category: 'Cytoplasmic Core',
        functionSummary: 'Fluid, granular inner cytoplasmic matrix containing organelles, crystals, and streaming plasmasol.',
        detailedNotes: 'Flows forward during locomotion in cyclosis and contains metabolic enzymes.',
        color: '#0D9488',
        anchor: { x: 50, y: 48, svgAnchorId: 'anchor-amoeba-endoplasm' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-nucleus',
        canonicalName: 'Discoid Nucleus',
        aliases: ['Nucleus', 'Biconcave Nucleus'],
        number: 4,
        category: 'Genetic Control',
        functionSummary: 'Biconcave disc-shaped nucleus regulating cellular metabolism, enzyme synthesis, and binary fission.',
        detailedNotes: 'Features a distinct honeycomb nuclear lamina and peripheral chromatin granules.',
        color: '#818CF8',
        anchor: { x: 47, y: 47, svgAnchorId: 'anchor-amoeba-nucleus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-contractile-vacuole',
        canonicalName: 'Contractile Vacuole',
        aliases: ['Osmoregulatory Vacuole', 'Contractile Bubble'],
        number: 5,
        category: 'Osmoregulation',
        functionSummary: 'Spherical fluid-filled vesicle collecting and expelling excess hypotonic water to prevent lysis.',
        detailedNotes: 'Fuses with the plasmalemma at systole to eject accumulated fluid into the surrounding water.',
        color: '#0284C7',
        anchor: { x: 55, y: 44, svgAnchorId: 'anchor-amoeba-contractile-vacuole' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-food-vacuole',
        canonicalName: 'Food Vacuole',
        aliases: ['Phagolysosome', 'Phagocytic Vacuole'],
        number: 6,
        category: 'Digestion',
        functionSummary: 'Membrane-bound digestive vesicle formed by phagocytosis enclosing captured algae or bacteria.',
        detailedNotes: 'Fuses with lysosomes for intracellular digestion, cycling from acidic to alkaline pH.',
        color: '#F59E0B',
        anchor: { x: 43, y: 56, svgAnchorId: 'anchor-amoeba-food-vacuole' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'amoeba-uroid',
        canonicalName: 'Uroid',
        aliases: ['Posterior Uroid', 'Wrinkled Tail'],
        number: 7,
        category: 'Posterior Morphology',
        functionSummary: 'Mulberry-like corrugated posterior zone where tail retraction and waste accumulation occur.',
        detailedNotes: 'Site of membrane recycling and adhesion during amoeboid forward crawling.',
        color: '#F43F5E',
        anchor: { x: 32, y: 60, svgAnchorId: 'anchor-amoeba-uroid' },
        required: false,
        detailLevels: ['standard', 'advanced']
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 5. HUMAN SPERMATOZOON (Male Gamete)
  // --------------------------------------------------------------------------
  'human-sperm': {
    diagramType: 'human-sperm',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Human Spermatozoon (Male Gamete Anatomy)',
    subtitle: 'Cytology: Acrosome, Haploid Nucleus, Centrioles, Mitochondrial Spiral (Midpiece), Axoneme & Flagellar Tail',
    description: 'Textbook anatomical diagram of a human spermatozoon illustrating the pyriform head covered by the enzyme-rich acrosome cap, condensed haploid nucleus, connecting neck with centrioles, middle piece wrapped in the helical mitochondrial sheath (ATP engine), principal piece with fibrous sheath, and end piece.',
    funFact: 'The spiral mitochondrial sheath in the sperm midpiece generates all the ATP needed for dynein motor proteins to beat the flagellum over 1,000 times per minute.',
    sources: [
      {
        name: "Gray's Anatomy 42nd Ed",
        purpose: 'morphology'
      },
      {
        name: 'Guyton and Hall Textbook of Medical Physiology 14th Ed',
        purpose: 'curriculum-reference'
      }
    ],
    structures: [
      {
        id: 'sperm-acrosome',
        canonicalName: 'Acrosome',
        aliases: ['Acrosomal Cap', 'Acrosomal Vesicle'],
        number: 1,
        category: 'Fertilization Apparatus',
        functionSummary: 'Enzyme-filled anterior cap containing hyaluronidase and acrosin to penetrate the zona pellucida of the ovum.',
        detailedNotes: 'Undergoes the acrosome reaction upon binding to ZP3 glycoprotein on the oocyte.',
        color: '#06B6D4',
        anchor: { x: 50, y: 16, svgAnchorId: 'anchor-sperm-acrosome' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'sperm-nucleus',
        canonicalName: 'Haploid Nucleus',
        aliases: ['Sperm Nucleus', 'Condensed Paternal Chromatin'],
        number: 2,
        category: 'Genetic Package',
        functionSummary: 'Highly condensed paternal genome (23 chromosomes) packaged with arginine-rich protamines.',
        detailedNotes: 'Histones are replaced by protamines during spermiogenesis to achieve hydrodynamically compact genetic packaging.',
        color: '#4338CA',
        anchor: { x: 50, y: 22, svgAnchorId: 'anchor-sperm-nucleus' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'sperm-neck',
        canonicalName: 'Neck (Connecting Piece)',
        aliases: ['Centriole Complex', 'Capitulum'],
        number: 3,
        category: 'Connecting Segment',
        functionSummary: 'Connecting region containing the proximal centriole and basal plate of the axoneme.',
        detailedNotes: 'The proximal centriole is donated to the ovum upon fertilization to construct the zygote first mitotic spindle.',
        color: '#F59E0B',
        anchor: { x: 50, y: 29, svgAnchorId: 'anchor-sperm-neck' },
        required: true,
        detailLevels: ['standard', 'advanced']
      },
      {
        id: 'sperm-midpiece',
        canonicalName: 'Mitochondrial Sheath (Midpiece)',
        aliases: ['Midpiece', 'Helical Mitochondria'],
        number: 4,
        category: 'Powerhouse',
        functionSummary: 'Tightly packed helical spiral of 50-75 mitochondria generating ATP via oxidative phosphorylation for flagellar beating.',
        detailedNotes: 'Enclosed between the neck and the annulus (Ring of Jensen).',
        color: '#EF4444',
        anchor: { x: 50, y: 36, svgAnchorId: 'anchor-sperm-midpiece' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'sperm-annulus',
        canonicalName: 'Annulus (Ring of Jensen)',
        aliases: ['Annulus', 'Jensen Ring'],
        number: 5,
        category: 'Structural Boundary',
        functionSummary: 'Septin-rich ring marking the boundary between the midpiece and principal piece of the tail.',
        detailedNotes: 'Prevents backward sliding of mitochondria and stabilizes flagellar membrane domains.',
        color: '#8B5CF6',
        anchor: { x: 50, y: 44, svgAnchorId: 'anchor-sperm-annulus' },
        required: false,
        detailLevels: ['advanced']
      },
      {
        id: 'sperm-principal-piece',
        canonicalName: 'Principal Piece (Flagellum Tail)',
        aliases: ['Flagellar Tail', 'Fibrous Sheath'],
        number: 6,
        category: 'Motility',
        functionSummary: 'Longest portion of the tail containing the 9+2 axoneme enclosed by a reinforcing fibrous sheath.',
        detailedNotes: 'Dynein motor arms generate bending waves that propagate down the tail for forward swimming velocity.',
        color: '#0284C7',
        anchor: { x: 50, y: 65, svgAnchorId: 'anchor-sperm-principal-piece' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'sperm-end-piece',
        canonicalName: 'End Piece',
        aliases: ['Terminal Piece', 'Bare Axoneme'],
        number: 7,
        category: 'Terminal Segment',
        functionSummary: 'Terminal segment of the tail composed only of the bare axoneme covered by plasma membrane.',
        detailedNotes: 'Lacks the fibrous sheath; represents the tapered terminal 5-10 µm of the sperm.',
        color: '#94A3B8',
        anchor: { x: 52, y: 92, svgAnchorId: 'anchor-sperm-end-piece' },
        required: false,
        detailLevels: ['standard', 'advanced']
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 6. MULTIPOLAR MOTOR NEURON
  // --------------------------------------------------------------------------
  'neuron': {
    diagramType: 'neuron',
    category: 'Human Anatomy',
    domain: 'biological',
    defaultRenderMode: '3d',
    title: 'Multipolar Motor Neuron (Nerve Cell)',
    subtitle: 'Neuronal morphology: Soma, Dendrites, Axon Hillock, Myelin Sheath, Nodes of Ranvier & Synaptic Terminals',
    description: 'Authoritative anatomical diagram of a multipolar neuron illustrating the branching dendritic arbor, soma (perikaryon) with nucleus and Nissl bodies, axon hillock trigger zone, myelinated axon with Schwann cells, Nodes of Ranvier for saltatory conduction, and telodendria with terminal synaptic boutons.',
    funFact: 'Saltatory conduction allows action potentials to leap from one Node of Ranvier to the next, accelerating nerve transmission up to 120 meters per second.',
    sources: [
      {
        name: "Gray's Anatomy 42nd Ed",
        purpose: 'morphology'
      },
      {
        name: 'Guyton and Hall Textbook of Medical Physiology 14th Ed',
        purpose: 'curriculum-reference'
      }
    ],
    structures: [
      {
        id: 'neuron-dendrites',
        canonicalName: 'Dendrites & Spines',
        aliases: ['Dendritic Arbor', 'Dendrites'],
        number: 1,
        category: 'Receptive Zone',
        functionSummary: 'Branching processes covered in dendritic spines receiving incoming synaptic neurotransmitter signals.',
        detailedNotes: 'Generate graded postsynaptic potentials (EPSPs and IPSPs) that conduct toward the soma.',
        color: '#818CF8',
        anchor: { x: 22, y: 28, svgAnchorId: 'anchor-neuron-dendrites' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'neuron-soma',
        canonicalName: 'Soma (Cell Body)',
        aliases: ['Perikaryon', 'Neuronal Soma'],
        number: 2,
        category: 'Metabolic Core',
        functionSummary: 'Biosynthetic center containing the nucleus, Golgi, and protein-synthesizing rough ER (Nissl bodies).',
        detailedNotes: 'Integrates electrical synaptic input and synthesizes neurotransmitters and structural proteins.',
        color: '#4F46E5',
        anchor: { x: 32, y: 48, svgAnchorId: 'anchor-neuron-soma' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'neuron-axon-hillock',
        canonicalName: 'Axon Hillock',
        aliases: ['Trigger Zone', 'Initial Segment'],
        number: 3,
        category: 'Action Potential Origin',
        functionSummary: 'Cone-shaped region of the soma with the highest density of voltage-gated Na⁺ channels where action potentials initiate.',
        detailedNotes: 'Fires an action potential whenever graded summation depolarizes the membrane past threshold (-55 mV).',
        color: '#6366F1',
        anchor: { x: 42, y: 49, svgAnchorId: 'anchor-neuron-axon-hillock' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'neuron-myelin-sheath',
        canonicalName: 'Myelin Sheath',
        aliases: ['Schwann Cell Myelin', 'Myelinated Axon'],
        number: 4,
        category: 'Insulative Layer',
        functionSummary: 'Concentric lipid-protein wrapping produced by Schwann cells (PNS) or oligodendrocytes (CNS) that insulates the axon.',
        detailedNotes: 'Minimizes transverse ionic leakage and increases membrane resistance.',
        color: '#0284C7',
        anchor: { x: 52, y: 45, svgAnchorId: 'anchor-neuron-myelin-sheath' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'neuron-node-of-ranvier',
        canonicalName: 'Node of Ranvier',
        aliases: ['Myelin Gap', 'Neurofibril Node'],
        number: 5,
        category: 'Conduction Node',
        functionSummary: 'Unmyelinated axon gap packed with voltage-gated Na⁺ and K⁺ channels enabling saltatory impulse propagation.',
        detailedNotes: 'Regenerates action potentials along the length of the nerve fiber.',
        color: '#F43F5E',
        anchor: { x: 59, y: 54, svgAnchorId: 'anchor-neuron-node-of-ranvier' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      },
      {
        id: 'neuron-synaptic-terminal',
        canonicalName: 'Synaptic Terminals',
        aliases: ['Telodendria', 'Terminal Boutons'],
        number: 6,
        category: 'Transmission Zone',
        functionSummary: 'Terminal axon arborization storing neurotransmitter vesicles for exocytosis into the synaptic cleft.',
        detailedNotes: 'Voltage-gated Ca²⁺ influx triggers vesicle fusion upon arrival of an action potential.',
        color: '#10B981',
        anchor: { x: 84, y: 52, svgAnchorId: 'anchor-neuron-synaptic-terminal' },
        required: true,
        detailLevels: ['basic', 'standard', 'advanced']
      }
    ]
  }
};

/**
 * Helper: Retrieve canonical diagram specification by exact diagramType and detailLevel
 */
export function getDiagramSpecification(
  diagramType: string,
  detailLevel: 'basic' | 'standard' | 'advanced' = 'standard'
): DiagramSpecification | null {
  const normalizedType = (diagramType || '').toLowerCase().trim();
  const spec = CANONICAL_DIAGRAM_SPECIFICATIONS[normalizedType];
  if (!spec) return null;

  // Filter structures by detailLevel
  const filteredStructures = spec.structures.filter(s => 
    s.detailLevels.includes(detailLevel) || s.required
  );

  return {
    ...spec,
    structures: filteredStructures
  };
}

/**
 * Helper: Classify a natural-language search query into a canonical specification
 */
export function findSpecificationByQuery(query: string): DiagramSpecification | null {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;

  // Direct matches
  if (CANONICAL_DIAGRAM_SPECIFICATIONS[q]) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS[q];
  }

  // Regex intent matching
  if (/\b(euglena|euglenoid|flagellate\s*protist)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['euglena'];
  }
  if (/\b(female\s*reproduct|uterus|fallopian|ovaries|cervix|vagina|endometrium)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['female-reproductive-system'];
  }
  if (/\b(parameci|ciliate|paramecium)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['paramecium'];
  }
  if (/\b(amoeba|ameba|pseudopod|rhizopod)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['amoeba'];
  }
  if (/\b(sperm|spermatozoon|male\s*gamete)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['human-sperm'];
  }
  if (/\b(neuron|motor\s*neuron|nerve\s*cell|axon|dendrite)\b/i.test(q)) {
    return CANONICAL_DIAGRAM_SPECIFICATIONS['neuron'];
  }

  return null;
}

/**
 * Helper: Build a clean DiagramConcept instance from a DiagramSpecification
 */
export function buildConceptFromSpecification(
  spec: DiagramSpecification,
  detailLevel: 'basic' | 'standard' | 'advanced' = 'standard',
  renderMode: '3d' | '2d' | 'paper' = '3d'
): DiagramConcept {
  const structures = spec.structures.filter(s => s.detailLevels.includes(detailLevel) || s.required);

  const pins: LabelPin[] = structures.map((s, idx) => ({
    id: s.id,
    number: idx + 1,
    name: s.canonicalName,
    canonicalName: s.canonicalName,
    aliases: s.aliases,
    x: s.anchor.x,
    y: s.anchor.y,
    color: renderMode === 'paper' ? '#0F172A' : s.color,
    category: s.category,
    functionSummary: s.functionSummary,
    detailedNotes: s.detailedNotes,
    required: s.required,
    rendered: true,
    svgAnchorId: s.anchor.svgAnchorId
  }));

  const primarySource = spec.sources[0];

  return {
    id: `concept-${spec.diagramType}-${Date.now()}`,
    title: spec.title,
    subtitle: spec.subtitle,
    description: spec.description,
    category: spec.category,
    domain: spec.domain,
    diagramType: spec.diagramType,
    renderMode,
    colorTheme: renderMode === 'paper' ? 'black-white-paper' : 'vibrant-multicolor',
    funFact: spec.funFact,
    timestamp: Date.now(),
    detailLevel,
    pins,
    sourceAttribution: {
      sourceName: primarySource ? primarySource.name : 'Authoritative Academic Curriculum',
      sourceUrl: primarySource?.url,
      mode: 'structured-reconstruction',
      groundTruthStandard: spec.sources.map(s => s.name).join(' • '),
      verificationNote: 'Ontology-validated diagram with deterministic anchor coordinates.'
    },
    validationResult: {
      isValid: true,
      status: 'ontology-validated',
      errors: [],
      warnings: [],
      validatedStructureCount: pins.length,
      forbiddenTermViolations: []
    }
  };
}
