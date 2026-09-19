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
  WorkspaceUploadedDoc
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

      // Academic & Research Workspace Data
      workspaceProjects: [
        {
          id: 'proj-teacher-cell-biology',
          title: 'Grade 11 Biology: Animal & Plant Cell Ultrastructure & Comparative Cytology',
          role: 'teacher',
          category: 'Cytology & Cell Biology',
          description: 'Comprehensive curriculum lecture notes, prokaryotic vs eukaryotic comparative matrix, organelle distribution tables, and student lab practicum.',
          createdAt: Date.now() - 86400000 * 3,
          updatedAt: Date.now() - 3600000 * 2,
          activePageIndex: 0,
          uploadedDocuments: [],
          pages: [
            {
              id: 'page-1',
              title: '1. Curriculum Objectives & Cell Theory Overview',
              content: `# Grade 11 Biology: Cellular Ultrastructure & Comparative Cytology

**Instructor:** Senior Biology Faculty • **Course Unit:** Cellular Biology & Cytology  
**Grade Level:** Advanced Secondary & Introductory College

---

## 1. Educational Objectives & Standards
By the completion of this instructional module, students will demonstrate mastery in:
- Distinguishing structural differences between prokaryotic and eukaryotic internal organization.
- Explaining the evolutionary roles of double-membrane organelles (*mitochondria* and *chloroplasts*).
- Formulating structure-function relationships for the endomembrane protein transport pathway (Rough ER ➔ Transport Vesicles ➔ Golgi Apparatus ➔ Secretory Exocytosis).

> *"The cell is not merely a bag of enzymes, but a highly coordinated metropolis with distinct metabolic districts, active transport corridors, and genomic command centers."*

## 2. Fundamental Cell Theory
1. **All living organisms** are composed of one or more cells.
2. **The cell is the basic structural and functional unit** of all living organisms.
3. **All cells arise from pre-existing cells** through the process of cellular division (*Omnis cellula e cellula*).

## 3. Major Cellular Classifications
Life is organized into two primary structural domains:
- **Prokaryotes (Bacteria & Archaea)**: Unicellular organisms lacking a membrane-enclosed nucleus or internal membrane-bound compartments.
- **Eukaryotes (Protists, Fungi, Plants, Animals)**: Complex organisms featuring compartmentalized cytosolic organelles and a true nucleus enclosed by a double membrane.`,
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
        }
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
      
      deleteChat: (id) => set((state) => ({ savedChats: state.savedChats.filter((c) => c.id !== id) })),
      deleteImage: (id) => set((state) => ({ savedImages: state.savedImages.filter((i) => i.id !== id) })),
      deletePrompt: (id) => set((state) => ({ savedPrompts: state.savedPrompts.filter((p) => p.id !== id) })),
      deleteSlideDeck: (id) => set((state) => ({ savedSlideDecks: state.savedSlideDecks.filter((d) => d.id !== id) })),
      deleteInfographic: (id) => set((state) => ({ savedInfographics: state.savedInfographics.filter((i) => i.id !== id) })),
      deleteDiagram: (id) => set((state) => ({ savedDiagrams: state.savedDiagrams.filter((d) => d.id !== id) })),
      
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

