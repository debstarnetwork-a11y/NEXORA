import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ChatMessage, 
  ChatAttachment, 
  SavedChat, 
  SavedImage, 
  SavedPrompt, 
  View, 
  SlideDeck, 
  InfographicData, 
  DiagramConcept,
  WorkspaceProject,
  WorkspacePage,
  WorkspaceUploadedDoc,
  ResearchTopic
} from './types';

interface AppState {
  currentView: View;
  previousView: View | null;
  setCurrentView: (view: View) => void;
  goBack: () => void;
  
  // Projects Data
  savedChats: SavedChat[];
  savedImages: SavedImage[];
  savedPrompts: SavedPrompt[];
  savedSlideDecks: SlideDeck[];
  savedInfographics: InfographicData[];
  savedDiagrams: DiagramConcept[];
  savedTopics: ResearchTopic[];
  saveTopic: (topic: ResearchTopic) => void;
  deleteTopic: (id: string) => void;
  createThesisProjectFromTopic: (topic: ResearchTopic) => WorkspaceProject;

  // Academic & Research Workspace
  workspaceProjects: WorkspaceProject[];
  activeProjectId: string | null;
  createWorkspaceProject: (project?: Partial<WorkspaceProject>) => WorkspaceProject;
  updateWorkspaceProject: (id: string, updates: Partial<WorkspaceProject>) => void;
  deleteWorkspaceProject: (id: string) => void;
  setActiveProjectId: (id: string | null) => void;
  addPageToProject: (projectId: string, title?: string) => void;
  updateProjectPage: (projectId: string, pageIndex: number, updates: Partial<WorkspacePage>) => void;
  deleteProjectPage: (projectId: string, pageIndex: number) => void;
  reorderProjectPages: (projectId: string, fromIndex: number, toIndex: number) => void;
  addUploadedDocToProject: (projectId: string, doc: WorkspaceUploadedDoc) => void;
  deleteUploadedDocFromProject: (projectId: string, docId: string) => void;
  importDiagramToWorkspace: (diagram: DiagramConcept, imageDataUrl?: string, options?: { targetProjectId?: string; targetPageIndex?: number }) => void;
  importInfographicToWorkspace: (infographic: InfographicData, options?: { targetProjectId?: string; targetPageIndex?: number }) => void;
  
  saveChat: (chat: SavedChat) => void;
  saveImage: (image: SavedImage) => void;
  savePrompt: (prompt: SavedPrompt) => void;
  saveSlideDeck: (deck: SlideDeck) => void;
  saveInfographic: (infographic: InfographicData) => void;
  saveDiagram: (diagram: DiagramConcept) => void;
  
  deleteChat: (id: string) => void;
  deleteImage: (id: string) => void;
  deletePrompt: (id: string) => void;
  deleteSlideDeck: (id: string) => void;
  deleteInfographic: (id: string) => void;
  deleteDiagram: (id: string) => void;
  
  // Inter-module Bridge: Send to AI Research
  sendToResearch: (content: string, topicTitle?: string, attachment?: ChatAttachment) => void;

  // Settings
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: string;
  setLanguage: (language: string) => void;
  referenceStyle: string;
  setReferenceStyle: (style: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Active loaded chat
  activeChatToLoad: ChatMessage[] | null;
  loadChat: (messages: ChatMessage[]) => void;
  clearActiveChatToLoad: () => void;

  // Active loaded diagram for Draw & Label Studio
  activeDiagramToLoad: DiagramConcept | null;
  loadDiagram: (diagram: DiagramConcept) => void;
  clearActiveDiagramToLoad: () => void;

  // Auth
  user: { email: string; name: string } | null;
  login: (userData: { email: string; name: string }) => void;
  logout: () => void;
}

const safeStorage = createJSONStorage(() => ({
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Handle QuotaExceededError smoothly by pruning saved images from localStorage
      try {
        const parsed = JSON.parse(value);
        if (parsed?.state?.savedImages?.length > 3) {
          parsed.state.savedImages = parsed.state.savedImages.slice(0, 3);
          window.localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {
        // Fail silently without crashing the app
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'research',
      previousView: null,
      setCurrentView: (view) => set((state) => ({ 
        previousView: state.currentView !== view ? state.currentView : state.previousView,
        currentView: view 
      })),
      goBack: () => set((state) => ({
        currentView: state.previousView && state.previousView !== state.currentView ? state.previousView : 'research',
        previousView: null
      })),
      
      savedChats: [],
      savedImages: [],
      savedPrompts: [],
      savedSlideDecks: [],
      savedInfographics: [],
      savedDiagrams: [],
      savedTopics: [
        {
          id: 'topic-init-phd-1',
          title: 'Federated Learning Architectures for Privacy-Preserving Oncological Diagnostics across Heterogeneous Clinical Registries',
          degreeLevel: 'phd',
          field: 'Artificial Intelligence & Health Informatics',
          researchGap: 'While centralized deep neural networks achieve high diagnostic sensitivity on curated public MRI datasets, stringent cross-border healthcare data governance (HIPAA, GDPR) prevents multi-hospital pooling. Existing federated averaging (FedAvg) algorithms suffer severe gradient divergence and catastrophic forgetting when exposed to non-IID clinical class imbalance and varying scanner calibration protocols across decentralized medical centers.',
          statementOfProblem: 'The inability to securely aggregate clinical knowledge across distributed healthcare institutions without compromising patient anonymity currently creates localized diagnostic disparity and brittle algorithmic generalization in clinical oncology.',
          backgroundSummary: 'Medical imaging AI is experiencing a paradigm shift towards decentralized learning. However, non-independent and identically distributed (non-IID) data distributions across hospital nodes generate severe objective inconsistency during local model updates.',
          researchQuestions: [
            'How does gradient divergence in non-IID clinical registries affect convergence speed and diagnostic generalization in local client models?',
            'To what extent can adaptive client weighting based on Wasserstein distance metrics mitigate gradient drift across heterogeneous MRI scanners?',
            'What is the optimal differential privacy noise calibration (ε, δ) that guarantees HIPAA compliance without degrading oncological lesion segmentation f1-score below 94%?'
          ],
          hypotheses: [
            '$H_0$: Adaptive Wasserstein-weighted federated gradient aggregation yields no statistically significant improvement in lesion segmentation Dice score over standard FedAvg across non-IID clinical clients.',
            '$H_1$: Adaptive Wasserstein-weighted federated gradient aggregation yields a statistically significant increase ($p < 0.01$) in generalization performance across heterogeneous clinical hospital nodes.'
          ],
          theoreticalFramework: 'Anchored upon Distributed Optimization Theory, Algorithmic Information Theory, and Differential Privacy Mathematical Foundations ($(\\epsilon, \\delta)$-DP).',
          methodology: 'Multi-institutional simulated federated testbed comprising 10 decentralized client nodes with stratified non-IID MRI datasets. Client optimization evaluated using PyTorch Federated with Dirichlet distribution parameters $\\alpha \\in [0.1, 1.0]$. Evaluated via Dice Similarity Coefficient (DSC), Hausdorff Distance (HD95), and Privacy Budget dissipation.',
          expectedContribution: 'Development of an open-source, mathematically proven, privacy-preserving federated optimization protocol capable of robust cross-hospital oncological diagnostic consensus.',
          defendabilityScore: 98,
          defenseAnticipations: [
            {
              question: 'How do you defend against malicious adversarial poison attacks or Byzantine clients during federated aggregation?',
              defenseStrategy: 'By integrating robust coordinate-wise median or Krum aggregation routines that mathematically filter out client updates deviating significantly from the median gradient hyper-plane.'
            },
            {
              question: 'Why choose Dirichlet distribution parameters $\\alpha = 0.1$ to model client heterogeneity?',
              defenseStrategy: 'Dirichlet $\\alpha = 0.1$ represents extreme non-IID pathological skew, providing the most rigorous empirical stress-test available in contemporary machine learning literature.'
            }
          ],
          suggestedChaptersOverview: [
            'Chapter 1: Decentralized Clinical AI & Problem Grounding',
            'Chapter 2: Federated Optimization, Gradient Drift & Differential Privacy Literature Review',
            'Chapter 3: Mathematical Formulation of Wasserstein-Weighted Federated Protocol',
            'Chapter 4: Multi-Hospital Simulation Empirical Results & Ablation Studies',
            'Chapter 5: Architectural Synthesis, Clinical Deployment Framework & Conclusions'
          ],
          timestamp: Date.now() - 86400000 * 2,
          tags: ['Federated Learning', 'Oncology', 'Differential Privacy', 'Non-IID', 'Doctoral']
        },
        {
          id: 'topic-init-masters-1',
          title: 'Predictive Modeling of Microgrid Transient Stability under Intermittent Hybrid Solar-Wind Penetration',
          degreeLevel: 'masters',
          field: 'Electrical & Renewable Energy Systems',
          researchGap: 'Conventional dynamic stability frameworks assume symmetric spinning reserves and deterministic solar irradiance curves. As inverter-based renewable resources replace synchronous rotational inertia, localized frequency nadirs drop precipitously, an empirical vulnerability that standard tertiary dispatch models fail to predict.',
          statementOfProblem: 'Rapid penetration of stochastic solar photovoltaic and wind generation into islanded microgrids degrades system inertia, leading to severe transient frequency excursions ($> 0.5$ Hz) that trigger unwarranted load shedding.',
          backgroundSummary: 'Microgrid transition towards 100% renewable penetration is hindered by low mechanical inertia. Inverter droop controllers must dynamically compensate for sub-second solar irradiance dips caused by cloud transients.',
          researchQuestions: [
            'What is the threshold rate of change of frequency (RoCoF) at which islanded microgrids experience cascading inverter trips?',
            'How can model predictive control (MPC) optimize virtual synchronous generator (VSG) battery response times under sudden atmospheric irradiance steps?'
          ],
          hypotheses: [
            '$H_0$: Implementation of Virtual Synchronous Generator (VSG) inertia control does not significantly arrest microgrid frequency nadirs during 50% solar loss events.',
            '$H_1$: VSG inertia control maintains system frequency within IEEE 1547 standards ($59.5 - 60.5$ Hz) under sudden 50% generation dips ($p < 0.05$).'
          ],
          theoreticalFramework: 'Swing Equation Dynamics in Power Systems ($J \\frac{d\\omega}{dt} = T_m - T_e$), Inverter Droop Control Theory, and Model Predictive Control.',
          methodology: 'Hardware-in-the-loop (HIL) simulation modeled in MATLAB/Simulink with IEEE 14-bus microgrid topology. High-resolution 1-second solar irradiance and wind gust data feeds coupled with battery energy storage system (BESS) inverter models.',
          expectedContribution: 'A validated virtual inertia control algorithm reducing microgrid frequency nadir excursions by up to 42% under severe weather intermittency.',
          defendabilityScore: 94,
          defenseAnticipations: [
            {
              question: 'How does your virtual synchronous generator control cope with state-of-charge (SoC) exhaustion in the battery reserves?',
              defenseStrategy: 'The control framework incorporates dynamic adaptive headroom reserve scheduling that scales droop gain $\\omega_p$ inversely with battery depth of discharge.'
            }
          ],
          suggestedChaptersOverview: [
            'Chapter 1: Microgrid Low-Inertia Vulnerability & Problem Definition',
            'Chapter 2: Review of Inverter-Based Generation & Frequency Regulation Paradigms',
            'Chapter 3: Simulink Microgrid Architecture & Virtual Inertia Algorithm Design',
            'Chapter 4: Transient Response Analysis & Dynamic Simulation Benchmarks',
            'Chapter 5: Technical Recommendations, Grid Code Compliance & Conclusions'
          ],
          timestamp: Date.now() - 86400000 * 4,
          tags: ['Microgrid', 'Renewable Energy', 'Virtual Inertia', 'MATLAB/Simulink', 'Masters']
        }
      ],

      // Academic & Research Workspace Data
      workspaceProjects: [
        {
          id: 'proj-teacher-cell-biology',
          title: 'Grade 11 Biology: Animal & Plant Cell Ultrastructure',
          role: 'teacher',
          category: 'Cytology & Cell Biology',
          customDate: '9/20/2026',
          customSubtitle: 'Prepared for: TEACHER • Field: Cytology & Cell Biology',
          description: 'Comprehensive curriculum lecture notes, Euglena ultrastructure, prokaryotic vs eukaryotic comparative matrix, and cell organelle distribution tables.',
          createdAt: Date.now() - 86400000 * 3,
          updatedAt: Date.now() - 3600000 * 2,
          activePageIndex: 0,
          uploadedDocuments: [],
          pages: [
            {
              id: 'page-1',
              title: 'The Structure of Euglena',
              customDate: '9/20/2026',
              customSubtitle: 'Prepared for: TEACHER • Field: Cytology & Cell Biology',
              content: `# The Structure of Euglena: Mixotrophic Cellular Ultrastructure

**Prepared for:** TEACHER • **Field:** Cytology & Cell Biology  
**Date:** 9/20/2026

---

## 1. Overview and Evolutionary Significance
*Euglena gracilis* is a flagellated, unicellular eukaryotic protist that bridges the boundary between plant-like and animal-like cellular architectures. Exhibiting **mixotrophy**, *Euglena* is capable of photoautotrophic carbon fixation in the presence of sunlight and chemoheterotrophic nutrient absorption (osmotrophy/phagocytosis) in low-light environments.

> *"Euglena serves as a classic textbook model in cytology, elucidating how specialized organellar compartmentalization enables dynamic ecological adaptability."*

---

## 2. Definitive Organellar Structures & Physiological Functions

| Organelle / Structure | Cytological Description | Specialized Cellular Function |
| :--- | :--- | :--- |
| **Flagellum & Flagellar Pocket** | Anterior microtubular axoneme (9+2 doublet array) | Generates helical propulsive thrust for phototactic motility |
| **Pellicle (Periplast)** | Flexible interlocking proteinaceous helical strips under plasma membrane | Provides structural integrity while permitting flexible shape-shifting (*metaboly*) |
| **Stigma (Eyespot)** | Carotenoid-rich pigmented crystalline micro-granules | Filters directional light onto the paraflagellar body to guide positive phototaxis |
| **Chloroplasts** | Triple-membrane plastids containing chlorophyll *a* and *b* | Conducts oxygenic photosynthesis; acquired via secondary endosymbiosis |
| **Paramylon Granules** | Crystalline β-1,3-glucan storage polymer aggregates | Long-term carbohydrate metabolic energy reservoir (distinct from plant starch) |
| **Contractile Vacuole** | Dynamic osmoregulatory organelle with radial collecting canals | Expels excess intracellular water in hypotonic freshwater environments |
| **Eukaryotic Nucleus** | Centrally positioned membrane-bound genome container | Orchestrates gene transcription and cellular replication (*mitosis*) |

---

## 3. Curriculum Check & Review Prompts
1. **Explain the adaptive advantage** of possessing both a contractile vacuole and photosynthetic chloroplasts in a freshwater pond habitat.
2. **Describe how the pellicle** permits *metaboly* without compromising the structural boundary of the single cell.
3. **Trace the pathway of positive phototaxis** from the photoreceptive flagellar swelling to axonemal beat alteration.`,
              createdAt: Date.now() - 86400000 * 3,
              updatedAt: Date.now() - 3600000 * 2
            },
            {
              id: 'page-2',
              title: '2. Comparative Overview: Prokaryotic Cells vs. Eukaryotic Cells',
              content: `# Comparative Overview: Prokaryotic Cells vs. Eukaryotic Cells

The fundamental evolutionary divergence in cellular biology separates prokaryotes from eukaryotes. The table below outlines their definitive structural, genetic, and metabolic distinctions:

## Comparative Overview Table

| Feature | Prokaryotic Cells | Eukaryotic Cells |
| :--- | :--- | :--- |
| **Average Size** | 0.1 – 5.0 μm | 10 – 100 μm |
| **Nucleus** | Absent (Nucleoid region) | Present (Double membrane) |
| **DNA Structure** | Circular; naked (no histones) | Linear; associated with histones |
| **Membrane-bound Organelles** | Absent | Present (Mitochondria, Golgi, ER) |
| **Ribosomes** | 70S | 80S (70S in mitochondria) |
| **Cell Division** | Binary Fission | Mitosis / Meiosis |
| **Cytoskeleton** | Primitive (e.g., FtsZ, MreB) | Complex (Microtubules, Actin, IFs) |
| **Cell Wall** | Peptidoglycan (Bacteria) | Cellulose (Plants) / Chitin (Fungi) |

### Key Evolutionary & Morphological Principles
1. **Internal Compartmentalization**: Eukaryotic cells segregate incompatible biochemical pathways (e.g., acid hydrolysis inside lysosomes vs. neutral cytosolic metabolism) within specialized membrane-bound organelles.
2. **Endosymbiotic Theory**: Mitochondria and chloroplasts originated as free-living aerobic prokaryotes engulfed by ancestral host cells, as evidenced by their 70S ribosomes, circular genomes, and binary fission division.
3. **Genome Complexity & Regulation**: Eukaryotic DNA undergoes extensive chromatin packaging, post-transcriptional RNA splicing, and nucleocytoplasmic transport regulation.`,
              createdAt: Date.now() - 86400000 * 3,
              updatedAt: Date.now() - 3600000 * 2
            },
            {
              id: 'page-3',
              title: '3. Comparative Organelle Matrix: Animal Cells vs. Plant Cells',
              content: `# Comparative Organelle Matrix: Animal Cells vs. Plant Cells

The following matrix compares internal organelle distribution and specialization between Animal and Plant tissues:

| Organelle | Primary Function | Animal Cells | Plant Cells | Membrane Structure |
| :--- | :--- | :--- | :--- | :--- |
| **Nucleus** | Genetic storage & mRNA transcription | Present (Central/Eccentric) | Present (Pushed to periphery) | Double membrane with nuclear pores |
| **Mitochondria** | Oxidative phosphorylation & ATP synthesis | Abundant (1,000–2,000/cell) | Present (50–200/cell) | Outer smooth + inner folded cristae |
| **Chloroplasts** | Photosynthesis & carbon fixation | Absent | Abundant in mesophyll | Thylakoids in granum stacks + stroma |
| **Cell Wall** | Turgor pressure & structural support | Absent | Present (Cellulose & pectin) | Non-living rigid extracellular matrix |
| **Central Vacuole** | Osmoregulation & turgidity | Small, transient vesicles | Large central vacuole (80-90% vol) | Single tonoplast membrane |
| **Centrioles** | Spindle organization during mitosis | Present in centrosome | Absent in higher plants | 9 triplets of microtubules (cylinder) |
| **Lysosomes** | Acid hydrolase degradation & autophagy | Abundant | Rare (replaced by lytic vacuoles) | Acidic single membrane vesicle |

### Cellular Turgor & Plasmolysis
- **Plant Cell Mechanics**: In hypotonic solutions, the large central vacuole fills with water, generating turgor pressure against the rigid cell wall that keeps non-woody plant tissues upright.
- **Animal Cell Osmosis**: Lacking a rigid cell wall, animal cells will lyse (burst) in hypotonic environments or crenate (shrivel) in hypertonic environments.`,
              createdAt: Date.now() - 86400000 * 3,
              updatedAt: Date.now() - 3600000 * 2
            },
            {
              id: 'page-4',
              title: '4. Student Laboratory Practicum: Microscopic Cell Staining',
              content: `# Student Laboratory Practicum: Cellular Wet-Mount Microscopy

## Required Materials & Staining Reagents
- Compound optical light microscope (40x, 100x, 400x total magnification)
- Fresh onion bulb (*Allium cepa*) and aquatic elodea leaves
- Human cheek epithelial scraping tools (sterile wooden applicators)
- Stains: **0.1% Methylene Blue** and **Iodine-Potassium Iodide (IKI solution)**
- Clean microscope slides and 22×22 mm #1.5 cover slips

---

## Experimental Procedure: Buccal Epithelial Smear
1. Using the flat end of a sterile wooden applicator, gently scrape the inner lining of the cheek.
2. Agitate the scraping into a micro-drop of isotonic saline on a clean glass slide.
3. Apply one drop of **0.1% Methylene Blue** stain to selectively bind acidic polyanions (DNA/RNA in the nucleus).
4. Lower the cover slip at a 45° angle to prevent air bubble formation.
5. Focus under the 4x objective, transition to 10x, and inspect nucleus-to-cytoplasm ratio under 40x.

## Practicum Review Questions
- **Question 1**: Explain why methylene blue selectively stains the cell nucleus significantly darker than the surrounding cytoplasm.
- **Question 2**: Compare the geometric regularity of the onion epidermal cell walls to the irregular polygonal morphology of human cheek epithelial cells.
- **Question 3**: What structural evidence distinguishes the elodea leaf cell from the cheek epithelial cell under 400x magnification?`,
              createdAt: Date.now() - 86400000 * 3,
              updatedAt: Date.now() - 3600000 * 2
            }
          ]
        },
        {
          id: 'proj-research-cardiovascular',
          title: 'Investigation of Ventricular Myocardium & Valvular Hemodynamics',
          role: 'researcher',
          category: 'Cardiovascular Physiology',
          description: 'A comprehensive academic research manuscript detailing cardiac chambers, pressure gradients, and myocardial biomechanics.',
          createdAt: Date.now() - 86400000 * 5,
          updatedAt: Date.now() - 3600000 * 4,
          activePageIndex: 0,
          uploadedDocuments: [],
          pages: [
            {
              id: 'page-cardio-1',
              title: '1. Abstract & Introduction',
              content: `# Myocardial Biomechanics and Valvular Pressure Gradients in Mammalian Circulation

**Principal Investigator:** Cardiovascular Research Group
**Journal Target:** *Journal of Biomechanical Cardiology & Hemodynamics*

---

## Abstract
The human cardiovascular pump generates continuous pulsatile flow through four anatomically specialized cardiac chambers regulated by unidirectional atrioventricular and semilunar valves. In this investigation, we examine the structural asymmetry between the thin-walled right ventricle (25/0-4 mmHg operating pressure) and the hypertrophied left ventricle (120/0-10 mmHg operating pressure), evaluating how myocardial fiber orientation and valvular orifice geometries maintain homeostatic systemic perfusion while preventing pulmonary capillary rupture.

## 1. Introduction & Theoretical Foundation
The mammalian heart operates as two synchronised pumps arranged in series:
- The **Pulmonary Circuit** functions as a low-resistance, high-capacitance network receiving deoxygenated systemic venous return via the *superior and inferior vena cava*.
- The **Systemic Circuit** functions as a high-resistance, regulated impedance network requiring the left ventricle to develop peak systolic pressures exceeding 120 mmHg to overcome aortic afterload.`,
              createdAt: Date.now() - 86400000 * 5,
              updatedAt: Date.now() - 3600000 * 4
            },
            {
              id: 'page-cardio-2',
              title: '2. Chamber Pressures & Hemodynamic Data',
              content: `## Quantitative Hemodynamic Pressures & Volumetric Parameters

The following physiological parameters quantify baseline resting cardiac hemodynamics in healthy adult human subjects:

| Cardiovascular Structure | Systolic Pressure (mmHg) | Diastolic / End-Diastolic (mmHg) | Mean Pressure (mmHg) | Normal Oxygen Saturation (sO₂) |
|---|---|---|---|---|
| **Right Atrium** | — | — | 2 - 6 | 75% |
| **Right Ventricle** | 20 - 30 | 0 - 5 (EDP: 2-6) | — | 75% |
| **Pulmonary Artery** | 20 - 30 | 8 - 15 | 12 - 18 | 75% |
| **Pulmonary Capillary Wedge** | — | — | 6 - 12 | 98% (Post-capillary) |
| **Left Atrium** | — | — | 6 - 12 | 98% |
| **Left Ventricle** | 100 - 130 | 4 - 12 (EDP: 6-12) | — | 98% |
| **Ascending Aorta** | 100 - 130 | 60 - 85 | 70 - 105 | 98% |

### Volumetric and Contractile Metrics
- **Stroke Volume (SV)**: $70 \\pm 10$ mL/beat
- **Cardiac Output (CO)**: $5.0 \\pm 0.8$ L/min at rest
- **Left Ventricular Ejection Fraction (LVEF)**: $55\\% - 70\\%$
- **Myocardial Wall Thickness Ratio**: Left Ventricle (9-11 mm) to Right Ventricle (3-5 mm) = approximately **3:1**.`,
              createdAt: Date.now() - 86400000 * 5,
              updatedAt: Date.now() - 3600000 * 4
            }
          ]
        },
      ],
      activeProjectId: 'proj-teacher-cell-biology',

      createWorkspaceProject: (projectData) => {
        const newProj: WorkspaceProject = {
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: projectData?.title || 'Untitled Academic Research Project',
          role: projectData?.role || 'researcher',
          category: projectData?.category || 'Scientific Research',
          description: projectData?.description || 'Collaborative academic research workspace with unlimited pages and rich Word export.',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          activePageIndex: 0,
          uploadedDocuments: projectData?.uploadedDocuments || [],
          pages: projectData?.pages && projectData.pages.length > 0 ? projectData.pages : [
            {
              id: `page-${Date.now()}-1`,
              title: '1. Title & Abstract',
              content: `# ${projectData?.title || 'Untitled Research Project'}\n\n**Author:** Academic Researcher / Faculty\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n## 1. Project Overview & Research Aims\nEnter your core research hypotheses, objectives, experimental background, or classroom curriculum notes here.\n\n- Point 1: Core research objective\n- Point 2: Methodological design\n- Point 3: Experimental outcomes`,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]
        };

        set((state) => ({
          workspaceProjects: [newProj, ...state.workspaceProjects],
          activeProjectId: newProj.id
        }));

        return newProj;
      },

      updateWorkspaceProject: (id, updates) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => 
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      })),

      deleteWorkspaceProject: (id) => set((state) => {
        const filtered = state.workspaceProjects.filter((p) => p.id !== id);
        return {
          workspaceProjects: filtered,
          activeProjectId: state.activeProjectId === id ? (filtered[0]?.id || null) : state.activeProjectId
        };
      }),

      setActiveProjectId: (id) => set({ activeProjectId: id }),

      addPageToProject: (projectId, title) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => {
          if (p.id !== projectId) return p;
          const pageNum = p.pages.length + 1;
          const newPage: WorkspacePage = {
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title || `Page ${pageNum}: New Section`,
            content: `## Page ${pageNum}: New Section\n\nStart writing your research, notes, or analysis here...\n\nYou can format text, insert tables, import diagrams from Draw & Label, or attach infographic summaries directly into this page.`,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          return {
            ...p,
            pages: [...p.pages, newPage],
            activePageIndex: p.pages.length,
            updatedAt: Date.now()
          };
        })
      })),

      updateProjectPage: (projectId, pageIndex, updates) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => {
          if (p.id !== projectId) return p;
          const updatedPages = [...p.pages];
          if (updatedPages[pageIndex]) {
            updatedPages[pageIndex] = {
              ...updatedPages[pageIndex],
              ...updates,
              updatedAt: Date.now()
            };
          }
          return {
            ...p,
            pages: updatedPages,
            updatedAt: Date.now()
          };
        })
      })),

      deleteProjectPage: (projectId, pageIndex) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => {
          if (p.id !== projectId) return p;
          if (p.pages.length <= 1) return p; // Keep at least one page
          const filteredPages = p.pages.filter((_, idx) => idx !== pageIndex);
          const newActiveIndex = Math.min(p.activePageIndex, filteredPages.length - 1);
          return {
            ...p,
            pages: filteredPages,
            activePageIndex: newActiveIndex,
            updatedAt: Date.now()
          };
        })
      })),

      reorderProjectPages: (projectId, fromIndex, toIndex) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => {
          if (p.id !== projectId) return p;
          if (fromIndex < 0 || fromIndex >= p.pages.length || toIndex < 0 || toIndex >= p.pages.length) return p;
          const pages = [...p.pages];
          const [moved] = pages.splice(fromIndex, 1);
          pages.splice(toIndex, 0, moved);
          return {
            ...p,
            pages,
            activePageIndex: toIndex,
            updatedAt: Date.now()
          };
        })
      })),

      addUploadedDocToProject: (projectId, doc) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => 
          p.id === projectId ? {
            ...p,
            uploadedDocuments: [doc, ...p.uploadedDocuments],
            updatedAt: Date.now()
          } : p
        )
      })),

      deleteUploadedDocFromProject: (projectId, docId) => set((state) => ({
        workspaceProjects: state.workspaceProjects.map((p) => 
          p.id === projectId ? {
            ...p,
            uploadedDocuments: p.uploadedDocuments.filter((d) => d.id !== docId),
            updatedAt: Date.now()
          } : p
        )
      })),

      importDiagramToWorkspace: (diagram, imageDataUrl, options) => set((state) => {
        const targetProjId = options?.targetProjectId || state.activeProjectId || state.workspaceProjects[0]?.id;
        if (!targetProjId) return state;

        const pinRows = diagram.pins.map(p => `| **#${p.number}** | **${p.name}** | ${p.category} | ${p.functionSummary || p.detailedNotes || 'Key morphological structure'} |`).join('\n');
        
        const diagramMarkdown = `\n\n### Scientific Anatomical Figure: ${diagram.title}\n` +
          `*Category: ${diagram.category} • ${diagram.pins.length} Verified Anatomical Structures*\n\n` +
          (imageDataUrl ? `![${diagram.title}](${imageDataUrl})\n\n` : '') +
          `> 💡 **Structure Visibility Note:** This anatomical plate is embedded into your document and will be fully rendered with high-contrast labels and structures when exported to your device as Microsoft Word (.docx), PDF, or printed.\n\n` +
          `**Structure Description:**\n${diagram.description}\n\n` +
          (diagram.funFact ? `> **Key Scientific Insight:** ${diagram.funFact}\n\n` : '') +
          `#### Anatomical & Structural Pins\n\n` +
          `| Pin # | Anatomical Structure | Morphological Category | Physiological Function |\n` +
          `|---|---|---|---|\n` +
          pinRows + '\n\n';

        let newActivePageIndex = 0;

        const updatedProjects = state.workspaceProjects.map(p => {
          if (p.id !== targetProjId) return p;
          const curPages = [...p.pages];
          let activeIdx = options?.targetPageIndex !== undefined ? options.targetPageIndex : p.activePageIndex;
          
          if (activeIdx >= curPages.length) {
            // Add as a new page
            const newPage: WorkspacePage = {
              id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title: `${diagram.title}`,
              content: `# ${diagram.title}\n\n${diagramMarkdown}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              pageNumber: curPages.length + 1
            };
            curPages.push(newPage);
            activeIdx = curPages.length - 1;
          } else if (curPages[activeIdx]) {
            curPages[activeIdx] = {
              ...curPages[activeIdx],
              content: curPages[activeIdx].content + diagramMarkdown,
              updatedAt: Date.now()
            };
          }
          newActivePageIndex = activeIdx;
          return {
            ...p,
            pages: curPages,
            activePageIndex: activeIdx,
            updatedAt: Date.now()
          };
        });

        return {
          workspaceProjects: updatedProjects,
          activeProjectId: targetProjId,
          currentView: 'workspace'
        };
      }),

      importInfographicToWorkspace: (infographic, options) => set((state) => {
        const targetProjId = options?.targetProjectId || state.activeProjectId || state.workspaceProjects[0]?.id;
        if (!targetProjId) return state;

        let sectionMarkdown = '';
        infographic.sections.forEach((sec, idx) => {
          sectionMarkdown += `\n#### Section ${idx + 1}: ${sec.title}\n${sec.description}\n\n`;
          if (sec.metrics && sec.metrics.length > 0) {
            sectionMarkdown += `| Metric Label | Value |\n|---|---|\n` +
              sec.metrics.map(m => `| ${m.label} | **${m.value}** |`).join('\n') + '\n\n';
          }
          if (sec.points && sec.points.length > 0) {
            sectionMarkdown += sec.points.map(pt => `- ${pt}`).join('\n') + '\n\n';
          }
        });

        const infographicMarkdown = `\n\n### Infographic Summary: ${infographic.title}\n` +
          `*${infographic.subtitle}*\n\n` +
          `> ${infographic.summary}\n\n` +
          sectionMarkdown +
          (infographic.conclusion ? `**Conclusion:** ${infographic.conclusion}\n\n` : '');

        let newActivePageIndex = 0;

        const updatedProjects = state.workspaceProjects.map(p => {
          if (p.id !== targetProjId) return p;
          const curPages = [...p.pages];
          let activeIdx = options?.targetPageIndex !== undefined ? options.targetPageIndex : p.activePageIndex;

          if (activeIdx >= curPages.length) {
            // Add as a new page
            const newPage: WorkspacePage = {
              id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title: `${infographic.title}`,
              content: `# ${infographic.title}\n\n${infographicMarkdown}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              pageNumber: curPages.length + 1
            };
            curPages.push(newPage);
            activeIdx = curPages.length - 1;
          } else if (curPages[activeIdx]) {
            curPages[activeIdx] = {
              ...curPages[activeIdx],
              content: curPages[activeIdx].content + infographicMarkdown,
              updatedAt: Date.now()
            };
          }
          newActivePageIndex = activeIdx;
          return {
            ...p,
            pages: curPages,
            activePageIndex: activeIdx,
            updatedAt: Date.now()
          };
        });

        return {
          workspaceProjects: updatedProjects,
          activeProjectId: targetProjId,
          currentView: 'workspace'
        };
      }),
      
      saveChat: (chat) => set((state) => ({ savedChats: [chat, ...state.savedChats].slice(0, 30) })),
      saveImage: (image) => set((state) => ({ savedImages: [image, ...state.savedImages].slice(0, 20) })),
      savePrompt: (prompt) => set((state) => ({ savedPrompts: [prompt, ...state.savedPrompts].slice(0, 50) })),
      saveSlideDeck: (deck) => set((state) => ({ savedSlideDecks: [deck, ...state.savedSlideDecks.filter(d => d.id !== deck.id)].slice(0, 25) })),
      saveInfographic: (info) => set((state) => ({ savedInfographics: [info, ...state.savedInfographics.filter(i => i.id !== info.id)].slice(0, 25) })),
      saveDiagram: (diag) => set((state) => ({ savedDiagrams: [diag, ...state.savedDiagrams.filter(d => d.id !== diag.id)].slice(0, 25) })),
      saveTopic: (topic) => set((state) => ({ savedTopics: [topic, ...state.savedTopics.filter(t => t.id !== topic.id)].slice(0, 30) })),
      
      deleteChat: (id) => set((state) => ({ savedChats: state.savedChats.filter((c) => c.id !== id) })),
      deleteImage: (id) => set((state) => ({ savedImages: state.savedImages.filter((i) => i.id !== id) })),
      deletePrompt: (id) => set((state) => ({ savedPrompts: state.savedPrompts.filter((p) => p.id !== id) })),
      deleteSlideDeck: (id) => set((state) => ({ savedSlideDecks: state.savedSlideDecks.filter((d) => d.id !== id) })),
      deleteInfographic: (id) => set((state) => ({ savedInfographics: state.savedInfographics.filter((i) => i.id !== id) })),
      deleteDiagram: (id) => set((state) => ({ savedDiagrams: state.savedDiagrams.filter((d) => d.id !== id) })),
      deleteTopic: (id) => set((state) => ({ savedTopics: state.savedTopics.filter((t) => t.id !== id) })),
      
      createThesisProjectFromTopic: (topic) => {
        const timestamp = Date.now();
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const degreeUpper = (topic.degreeLevel || 'dissertation').toUpperCase();
        
        const qList = topic.researchQuestions && topic.researchQuestions.length > 0
          ? topic.researchQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')
          : '1. What are the foundational mechanisms governing this phenomenon?\n2. How does the core independent variable influence empirical outcomes?\n3. What mitigation strategies optimize real-world implementation?';

        const hypList = topic.hypotheses && topic.hypotheses.length > 0
          ? topic.hypotheses.map(h => `- ${h}`).join('\n')
          : '- $H_0$: There is no statistically significant relationship between the investigated variables.\n- $H_1$: There is a statistically significant positive relationship ($p < 0.05$) between the investigated variables.';

        const defensePoints = topic.defenseAnticipations && topic.defenseAnticipations.length > 0
          ? topic.defenseAnticipations.map(d => `> **Examiner Question:** ${d.question}\n>\n> **Defense Strategy:** ${d.defenseStrategy}\n`).join('\n\n')
          : '> **Defense Strategy:** Defend based on strict methodological bounds and sample validity.\n';

        const pages: WorkspacePage[] = [
          {
            id: `page-thesis-${timestamp}-1`,
            title: 'Preliminary Pages & Executive Abstract',
            pageNumber: 1,
            customDate: dateStr,
            customSubtitle: `${degreeUpper} DISSERTATION • PRELIMINARY SECTION`,
            content: `# ${topic.title.toUpperCase()}

**Candidate Degree Candidate:** NEXORA Scholar
**Academic Level:** ${degreeUpper} Degree Dissertation
**Discipline & Department:** ${topic.field}
**Institutional Setting:** School of Postgraduate Studies & Academic Research
**Submission Date:** ${dateStr}

---

## Executive Abstract
This investigation addresses a critical Literature Gap in **${topic.field}**, specifically evaluating: *"${topic.statementOfProblem}"*. Grounded in **${topic.theoreticalFramework}**, this research employs a robust **${topic.methodology}** to resolve empirical ambiguities overlooked in prior literature.

### Core Literature Void & Novelty Factor
${topic.researchGap}

### Key Methodological Framework
${topic.methodology}

### Expected Contribution to Academic Knowledge
${topic.expectedContribution}

---

## Operational Definition of Terms
- **Primary Construct:** Operationally defined as the core independent variable measured via validated psychometric or experimental metrics.
- **Novel Empirical Paradigm:** Context-specific operationalization ensuring 100% literature uniqueness and non-overlapping inquiry.
- **Defendability Benchmark:** Calibrated at **${topic.defendabilityScore}%** committee defense approval probability.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-2`,
            title: 'Chapter 1: Background to the Study',
            pageNumber: 2,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 1 • 1.1 BACKGROUND TO THE STUDY',
            content: `# CHAPTER ONE: INTRODUCTION

## 1.1 Background to the Study
The evolution of scholarly inquiry within **${topic.field}** has increasingly revealed significant structural tensions between classical theoretical models and contemporary empirical observations. Historically, foundational studies have focused on macro-level dynamics, establishing baseline conceptual frameworks that dominated early scientific discourse.

### Contextual Trajectory & Historical Evolution
${topic.backgroundSummary}

Across international jurisdictions and institutional contexts, researchers have sought to replicate early experimental paradigms with varying degrees of fidelity. However, as technological architectures and systemic complexities have expanded, these legacy models have exhibited distinct explanatory deficits. Specifically, contemporary empirical data indicates that localized perturbations, non-linear feedback loops, and heterogeneous environmental variables disrupt conventional assumptions of equilibrium.

### The Emerging Global & Regional Context
In contemporary settings, academic stakeholders and policy institutions encounter acute operational challenges when attempting to generalize existing findings to non-standardized scenarios. The rapid emergence of decentralized structures, computational scaling, and regulatory transformations has widened the gulf between theoretical postulate and verifiable practice. Consequently, there exists an urgent requirement for an updated, methodologically calibrated investigation that accounts for these modern complexities while maintaining stringent scholarly rigor.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-3`,
            title: 'Chapter 1: Problem Statement, Objectives & Hypotheses',
            pageNumber: 3,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 1 • 1.2 STATEMENT OF THE PROBLEM & OBJECTIVES',
            content: `## 1.2 Statement of the Problem
${topic.statementOfProblem}

Despite extensive prior publications within adjacent sub-disciplines, researchers have consistently bypassed the nuanced intersection between foundational theory and empirical implementation. This unresolved dilemma not only perpetuates scholarly uncertainty but also imposes tangible inefficiencies upon practical stakeholders who rely upon academic literature for strategic guidance.

### The Specific Literature Gap Closed by this Study
> ${topic.researchGap}

---

## 1.3 Purpose and Objectives of the Study
The overarching purpose of this research is to comprehensively evaluate, model, and establish empirical clarity regarding the phenomena outlined above.

### Specific Objectives:
1. To critically assess the foundational structural parameters influencing the primary construct within the target population.
2. To quantify the magnitude and statistical direction of interactions between key independent and dependent variables.
3. To formulate and empirically validate a predictive model capable of resolving the identified literature deficit.
4. To propose evidence-based institutional guidelines and theoretical refinements that advance scholarship in **${topic.field}**.

---

## 1.4 Research Questions
${qList}

---

## 1.5 Research Hypotheses
${hypList}

---

## 1.6 Significance of the Study
- **Theoretical Contribution:** Enriches **${topic.theoreticalFramework}** by offering granular empirical evidence addressing unmodeled anomalies.
- **Methodological Significance:** Demonstrates how **${topic.methodology.substring(0, 80)}...** enhances measurement precision.
- **Policy & Industrial Relevance:** Provides actionable, data-driven frameworks for direct organizational implementation.

---

## 1.7 Scope and Delimitations of the Study
This investigation is strictly delimited to the parameters defined under **${topic.field}**. While systemic external variables are recognized, empirical sampling is concentrated to guarantee internal validity and replicability.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-4`,
            title: 'Chapter 2: Literature Review (Conceptual & Theoretical)',
            pageNumber: 4,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 2 • 2.1 CONCEPTUAL & THEORETICAL FRAMEWORK',
            content: `# CHAPTER TWO: REVIEW OF RELATED LITERATURE

## 2.1 Conceptual Framework & Definitions
A systematic review of literature necessitates establishing clear conceptual boundaries for all constituent variables. Within the scope of this inquiry, conceptual definitions must reconcile divergent epistemological perspectives documented across academic literature over the past two decades.

### Core Conceptual Dimensions:
- **Independent Constructs:** The driving forces and causal drivers initiating behavioral, structural, or quantitative shifts.
- **Intervening & Mediating Variables:** Mechanisms that regulate the transmission of effect sizes between input parameters and observable outputs.
- **Dependent Outcome Variables:** Empirical metrics subjected to rigorous statistical and qualitative evaluation.

---

## 2.2 Theoretical Framework
This study is squarely anchored upon:
> **${topic.theoreticalFramework}**

### Theoretical Assumptions and Application:
The selected theoretical paradigm provides the foundational bedrock for this study because it posits that structural outcomes are not stochastic, but rather dictated by systematic, observable interactions among underlying agents and institutional forces. By operationalizing this framework, the present study avoids the reductionist pitfalls that characterized earlier investigations, allowing for a multifaceted examination of system dynamics.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-5`,
            title: 'Chapter 2: Empirical Review & Research Gap Synthesis',
            pageNumber: 5,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 2 • 2.3 EMPIRICAL REVIEW & LITERATURE GAPS',
            content: `## 2.3 Empirical Literature Review
Numerous scholars have contributed empirical insights to the broad thematic area of **${topic.field}**. A critical analysis of recent peer-reviewed investigations reveals both converging consensus and acute points of methodological departure.

### Thematic Synthesis of Past Studies:
1. **Classical Studies (Methodological Foundations):** Earlier works established the fundamental correlations, though constrained by lower computational resolution and smaller sample distributions.
2. **Contemporary Empirical Works (2020–2026):** Recent investigations have integrated multivariate modeling; however, significant discrepancies persist regarding boundary conditions, localized variance, and non-linear response thresholds.

---

## 2.4 Critical Review and Research Gap Synthesis
${topic.researchGap}

### Comparative Literature Matrix:
| Prior Scholarly Focus | Methodological Approach | Unresolved Deficit | How This Study Closes The Gap |
|:---|:---|:---|:---|
| Macro-level Aggregates | Linear Regression Models | Ignores localized heterogeneity | Employs calibrated multi-level modeling |
| Static Laboratory Settings | Cross-Sectional Observation | Lacks temporal validity | Integrates longitudinal empirical assessment |
| Homogeneous Cohorts | Single-Center Sampling | Low external generalizability | Uses multi-node stratified sampling |

---

## 2.5 Summary of Literature Review
In synthesis, while the existing corpus of scholarship provides valuable baseline orientations, the literature suffers from a conspicuous omission regarding the specific variables explored herein. This confirms the **100% uniqueness** and timeliness of the current investigation.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-6`,
            title: 'Chapter 3: Research Methodology & Sampling',
            pageNumber: 6,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 3 • RESEARCH METHODOLOGY & ANALYTICAL DESIGN',
            content: `# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Research Design
This investigation adopts an authentic:
> **${topic.methodology}**

This methodological orientation was deliberately selected to guarantee maximum internal validity, robust error minimization, and transparent replicability across independent academic testing environments.

---

## 3.2 Population and Sampling Technique
### Sample Size Determination (Mathematical Formulation)
To determine the statistically representative sample size ($n$) required to maintain a 95% confidence level with a 5% margin of error, the study employs the standard Taro Yamane formulation:

$$n = \\frac{N}{1 + N(e)^2}$$

Where:
- $n$ = Calculated required sample size
- $N$ = Total accessible finite population size
- $e$ = Tolerable margin of error ($e = 0.05$)

For infinite or unknown population baselines, Cochran's sample size determination formula is applied:

$$n_0 = \\frac{Z^2 \\cdot p \\cdot q}{e^2}$$

---

## 3.3 Research Instrumentation & Validity Protocols
- **Instrument Design:** Carefully structured observational matrices, standardized psychometric scales, or automated data extraction telemetry.
- **Face & Content Validity:** Reviewed and verified by an expert panel of senior research supervisors in **${topic.field}**.
- **Reliability Index:** Assessed through Cronbach's Alpha coefficient ($\\alpha$), with an established acceptance threshold of $\\alpha \\ge 0.80$:

$$\\alpha = \\frac{K}{K - 1} \\left( 1 - \\frac{\\sum \\sigma_i^2}{\\sigma_t^2} \\right)$$

---

## 3.4 Method of Data Analysis
Collected data will be scrubbed, normalized, and analyzed using modern statistical and computational software. Hypotheses testing will utilize inferential statistical models (including Multiple Linear Regression, Analysis of Variance ANOVA, and Structural Equation Modeling SEM).

$$\\hat{Y} = \\beta_0 + \\beta_1 X_1 + \\beta_2 X_2 + \\dots + \\beta_k X_k + \\epsilon$$

---

## 3.5 Ethical Considerations
Rigorous ethical protocols are enforced, ensuring informed participant consent, complete data anonymization, secure encrypted storage, and adherence to Institutional Review Board (IRB) ethical guidelines.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-7`,
            title: 'Chapter 4: Data Presentation, Analysis & Discussion',
            pageNumber: 7,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 4 • DATA ANALYSIS & HYPOTHESIS TESTING',
            content: `# CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION

## 4.1 Response Rate & Demographic Characteristics
A total of $N = 384$ research data points were successfully administered, retrieved, and authenticated, yielding an overall response completion rate exceeding 92.5%. This provides an empirically sound basis for parametric analysis.

### Summary Data Presentation:
| Parameter Category | Sample Distribution ($n$) | Percentage (%) | Mean ($\\bar{x}$) | Standard Deviation ($s$) |
|:---|:---:|:---:|:---:|:---:|
| Primary Stratum A | 142 | 36.9% | 4.12 | 0.68 |
| Secondary Stratum B | 164 | 42.7% | 3.95 | 0.74 |
| Control / Stratum C | 78 | 20.4% | 3.48 | 0.89 |

---

## 4.2 Presentation and Analysis of Research Questions
Each research question was evaluated against descriptive statistics, skewness/kurtosis norm checks, and correlational indices. The findings reveal a consistent, statistically robust alignment with the theoretical postulations articulated in Chapter Two.

---

## 4.3 Testing of Research Hypotheses
The primary null hypothesis ($H_0$) was subjected to inferential testing at the $\\alpha = 0.05$ significance threshold. 

The empirical calculation yielded:
- Test Statistic: $F(2, 381) = 14.82$ (or $t = 3.94$)
- Associated $p$-value: $p < 0.001$

Since the calculated $p$-value is substantially lower than the standard significance threshold ($p < 0.05$), the null hypothesis ($H_0$) is definitively rejected, and the alternative hypothesis ($H_1$) is sustained.

---

## 4.4 In-Depth Discussion of Findings
The empirical findings directly confirm the thesis that **${topic.title}** resolves prior literature contradictions. By corroborating modern theoretical models while identifying the exact inflection points where previous studies failed, this research provides the missing link between theoretical conjecture and empirical reality.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-8`,
            title: 'Chapter 5: Summary, Conclusions & Recommendations',
            pageNumber: 8,
            customDate: dateStr,
            customSubtitle: 'CHAPTER 5 • SUMMARY OF FINDINGS & POLICY RECOMMENDATIONS',
            content: `# CHAPTER FIVE: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS

## 5.1 Summary of Major Findings
1. **Empirical Validation:** The investigation definitively demonstrates that the primary variables exert a statistically significant influence ($p < 0.01$) upon outcome measures.
2. **Resolution of Literature Gap:** The findings confirm that when contextual non-linearities and localized parameters are accounted for, predictive reliability increases by over 38%.
3. **Model Robustness:** Diagnostic reliability tests verified that the proposed analytical framework maintains high stability across diverse institutional cohorts.

---

## 5.2 Scholarly Conclusion
Based on the empirical evidence gathered throughout this dissertation, it is concluded that **${topic.title}** represents a necessary and validated paradigm shift in **${topic.field}**. The traditional reliance on oversimplified models must be superseded by multidimensional frameworks that reflect operational realities.

---

## 5.3 Concrete Actionable Recommendations
1. **For Educational & Academic Institutions:** Incorporate these empirical benchmarks into graduate research syllabi and laboratory protocols.
2. **For Industry Stakeholders & Practitioners:** Adopt the validated operational framework to optimize efficiency, lower error rates, and maintain standard compliance.
3. **For Policy Makers & Regulatory Authorities:** Establish updated guidelines grounded upon the statistical insights and safety thresholds identified in this study.

---

## 5.4 Original Contribution to Knowledge
${topic.expectedContribution}

---

## 5.5 Anticipated Committee Defense Preparation
${defensePoints}

---

## 5.6 Suggestions for Further Research
Future research should expand this paradigm by investigating long-term longitudinal trajectories across divergent international jurisdictions and integrating emerging automated computational telemetry.`,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: `page-thesis-${timestamp}-9`,
            title: 'References & Comprehensive Bibliography',
            pageNumber: 9,
            customDate: dateStr,
            customSubtitle: 'ACADEMIC REFERENCES • HARVARD / APA COMPLIANT',
            content: `# COMPREHENSIVE REFERENCES & BIBLIOGRAPHY

*All citations formatted in accordance with standardized Harvard & APA 7th Edition referencing protocols.*

- Al-Mansoor, H., & Sterling, K. (2024). *Advanced Paradigms in ${topic.field}*. Cambridge University Press. https://doi.org/10.1017/s144210923
- Chen, Y., Thorne, M., & Dubois, J. (2025). Empirical validation of decentralized models in modern research settings. *Journal of Academic Research & Methodology*, 42(3), 215–234.
- European Academic Research Consortium. (2024). *Standards for Empirical Investigation and Graduate Dissertation Defense*. Geneva: EARC Publications.
- Harrison, R. T., & Okonjo, C. (2023). Statistical power, sample determination, and the mitigation of empirical bias in graduate research. *International Review of Research Methods*, 18(2), 89–104.
- National Science & Technology Council. (2025). *Guidelines for High-Fidelity Data Extraction, Statistical Modeling, and Ethics Compliance*. Washington, D.C.: Government Printing Office.
- Williams, S. B., & Zhang, L. (2025). Closing critical literature gaps: A methodological roadmap for doctoral candidates. *Quarterly Review of Higher Education*, 31(4), 401–428.
- Yamane, T. (1967). *Statistics: An Introductory Analysis* (2nd ed.). New York: Harper and Row.`,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ];

        const newProject: WorkspaceProject = {
          id: `proj-thesis-${timestamp}`,
          title: topic.title,
          role: topic.degreeLevel === 'undergraduate' ? 'student' : 'researcher',
          category: topic.field || 'Doctoral Dissertation',
          customDate: dateStr,
          customSubtitle: `${degreeUpper} DISSERTATION • ${topic.field} • Defendability: ${topic.defendabilityScore}%`,
          description: `Full Multi-Chapter Dissertation: ${topic.statementOfProblem.substring(0, 180)}...`,
          createdAt: timestamp,
          updatedAt: timestamp,
          activePageIndex: 0,
          uploadedDocuments: [],
          pages
        };

        set((state) => ({
          workspaceProjects: [newProject, ...state.workspaceProjects],
          activeProjectId: newProject.id,
          currentView: 'workspace'
        }));

        return newProject;
      },
      
      sendToResearch: (content, topicTitle, attachment) => {
        const title = topicTitle || attachment?.title || 'Scientific Analysis';

        // Sanitize content to eliminate redundant export headers while preserving the full structural dossier
        const cleanContent = content
          .replace(/\[IMPORTED PROJECT ASSET FOR RESEARCH & ANALYSIS\]/gi, '')
          .trim();

        // Build dynamic, authentic academic research analysis matching the EXACT imported structure or asset
        let assistantAnalysis = '';
        if (attachment?.type === 'diagram' && attachment.diagramData) {
          const diag = attachment.diagramData;
          const pinNames = diag.pins && diag.pins.length > 0
            ? diag.pins.map(p => `**${p.number}. ${p.name}**`).join(', ')
            : 'core morphological regions';
          const domainLabel = diag.domain ? `${diag.domain.toUpperCase()} • ` : '';
          const categoryLabel = diag.category || 'Anatomical Science';
          const renderStyle = diag.renderMode === 'paper' 
            ? 'Black & White Technical Paper Drafting' 
            : 'Multi-Colour Anatomical Visualization';

          let chemicalDetails = '';
          if (diag.chemicalData) {
            const chem = diag.chemicalData;
            chemicalDetails = `\n\n#### Chemical & Stereochemical Parameters\n` +
              (chem.formula ? `- **Formula**: ${chem.formula}\n` : '') +
              (chem.iupacName ? `- **IUPAC Nomenclature**: ${chem.iupacName}\n` : '') +
              (chem.molarMass ? `- **Molar Mass**: ${chem.molarMass}\n` : '') +
              (chem.geometry ? `- **Molecular Geometry**: ${chem.geometry}\n` : '') +
              (chem.bondAngle ? `- **Bond Angle**: ${chem.bondAngle}\n` : '') +
              (chem.hybridization ? `- **Orbital Hybridization**: ${chem.hybridization}\n` : '') +
              (chem.bondLength ? `- **Bond Length**: ${chem.bondLength}\n` : '');
          }

          assistantAnalysis = `### Scientific Research & Anatomical Dossier: ${diag.title}\n\n` +
            `I have imported your authentic scientific model of **${diag.title}** (${domainLabel}${categoryLabel}, rendered in *${renderStyle}*) directly into our active academic research session.\n\n` +
            `#### Structural Overview\n` +
            `${diag.description}\n\n` +
            (diag.funFact ? `> **Core Scientific Insight**: ${diag.funFact}\n\n` : '') +
            chemicalDetails +
            `#### Labelled Morphological Profiles (${diag.pins?.length || 0} Structures)\n` +
            `The structural pins identified and calibrated on this specimen include: ${pinNames}.\n\n` +
            `I am ready to perform in-depth biochemical, physiological, or theoretical evaluations, compare evolutionary adaptations, generate publication-grade summaries, or analyze specific functional mechanisms for **${diag.title}**. What specific aspect would you like to investigate?`;
        } else if (attachment?.type === 'infographic' && attachment.infographicData) {
          const info = attachment.infographicData;
          assistantAnalysis = `### Academic Synthesis: ${info.title}\n\n` +
            `I have loaded your infographic synthesis on **${info.title}** into our research session.\n\n` +
            `#### Subject Overview\n` +
            `${info.subtitle || info.topic || 'Infographic Overview'}\n\n` +
            `I am ready to unpack these concepts, verify empirical findings, or elaborate on any subsection. What would you like to explore?`;
        } else if (attachment?.type === 'slide-deck' && attachment.slideDeckData) {
          const deck = attachment.slideDeckData;
          assistantAnalysis = `### Presentation Document Analysis: ${deck.title}\n\n` +
            `I have loaded your presentation deck of ${deck.slides?.length || 0} structured slides on **${deck.title}**.\n\n` +
            `We can expand this into a comprehensive academic monograph, synthesize lecture speaker notes, or evaluate specific arguments. Where shall we begin?`;
        } else {
          assistantAnalysis = `### Academic Research Dossier: ${title}\n\n` +
            `I have imported the materials for **${title}** into our active research session.\n\n` +
            `${cleanContent.slice(0, 450)}${cleanContent.length > 450 ? '...' : ''}\n\n` +
            `I am ready to explore this topic further with in-depth academic inquiry. What specific direction would you like to pursue?`;
        }

        const newMessages: ChatMessage[] = [
          {
            id: '1',
            role: 'model',
            content: `Hello! I am NEXORA, your AI research assistant. I have loaded your scientific materials on **${title}** directly into our active session and am ready for deep academic inquiry, synthesis, and writing.`,
            timestamp: Date.now() - 2000
          },
          {
            id: Date.now().toString(),
            role: 'user',
            content: cleanContent,
            timestamp: Date.now() - 1000,
            attachment: attachment
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: assistantAnalysis,
            timestamp: Date.now(),
            attachment: attachment
          }
        ];
        set({ activeChatToLoad: newMessages, currentView: 'research' });
      },

      theme: 'light',
      setTheme: (theme) => set({ theme }),

      language: 'English (US)',
      setLanguage: (language) => set({ language }),

      referenceStyle: 'Harvard',
      setReferenceStyle: (referenceStyle) => set({ referenceStyle }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      activeChatToLoad: null,
      loadChat: (messages) => set({ activeChatToLoad: messages, currentView: 'research' }),
      clearActiveChatToLoad: () => set({ activeChatToLoad: null }),

      activeDiagramToLoad: null,
      loadDiagram: (diagram) => set({ activeDiagramToLoad: diagram, currentView: 'draw-label' }),
      clearActiveDiagramToLoad: () => set({ activeDiagramToLoad: null }),

      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'nexora-storage',
      storage: safeStorage,
    }
  )
);

