import React from 'react';

export interface DiagramProps {
  isPaperMode: boolean;
  activePinId?: string | null;
  renderMode?: '3d' | '2d' | 'paper';
  hideFlagellum?: boolean;
}

/**
 * High-Resolution Multipolar Neuron Diagram
 * Modeled on classic neuroscience textbooks (soma, dendrites, axon hillock, myelin sheath, Schwann cells, Nodes of Ranvier, axon terminals)
 */
export const NeuronDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="neuron-diagram-group" transform="translate(-180, 0)">
      {/* 1. Radiating Dendrites branching from Soma */}
      <g id="neuron-dendrites">
        {/* Upper Dendritic Tree */}
        <path
          d="M -40 -35 Q -90 -75 -130 -90 M -90 -75 Q -115 -115 -145 -125 M -130 -90 Q -160 -85 -180 -105 M -90 -75 Q -75 -110 -85 -140"
          stroke={isPaperMode ? '#000000' : '#818CF8'}
          strokeWidth={isPaperMode ? 2.5 : 3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Leftward Dendritic Tree */}
        <path
          d="M -55 -10 Q -110 -25 -155 -15 M -110 -25 Q -140 -50 -175 -55 M -155 -15 Q -185 -10 -205 -25 M -155 -15 Q -180 15 -200 25"
          stroke={isPaperMode ? '#000000' : '#818CF8'}
          strokeWidth={isPaperMode ? 2.5 : 3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Lower Dendritic Tree */}
        <path
          d="M -40 25 Q -95 65 -135 85 M -95 65 Q -120 100 -150 115 M -135 85 Q -165 95 -185 120 M -95 65 Q -80 105 -90 135"
          stroke={isPaperMode ? '#000000' : '#818CF8'}
          strokeWidth={isPaperMode ? 2.5 : 3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Dendritic Spines (minute projections) */}
        {!isPaperMode && (
          <g opacity="0.6">
            <circle cx="-130" cy="-90" r="2.5" fill="#C7D2FE" />
            <circle cx="-145" cy="-125" r="2" fill="#C7D2FE" />
            <circle cx="-175" cy="-55" r="2" fill="#C7D2FE" />
            <circle cx="-150" cy="115" r="2.5" fill="#C7D2FE" />
          </g>
        )}
      </g>

      {/* 2. Soma (Cell Body / Perikaryon) */}
      <path
        d="M -15 -35 
           C -35 -40 -55 -25 -55 0 
           C -55 25 -35 38 -15 32 
           C 5 28 15 15 25 8 
           C 20 -15 5 -28 -15 -35 Z"
        fill={isPaperMode ? '#FFFFFF' : '#4F46E5'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#A5B4FC'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* Nissl Bodies (Rough ER clumps in Soma) */}
      <g opacity={isPaperMode ? 0.4 : 0.7}>
        <circle cx="-32" cy="-15" r="2" fill={isPaperMode ? '#000000' : '#E0E7FF'} />
        <circle cx="-42" cy="-5" r="2.5" fill={isPaperMode ? '#000000' : '#E0E7FF'} />
        <circle cx="-38" cy="10" r="2" fill={isPaperMode ? '#000000' : '#E0E7FF'} />
        <circle cx="-25" cy="18" r="2.5" fill={isPaperMode ? '#000000' : '#E0E7FF'} />
      </g>

      {/* Nucleus & Prominent Nucleolus */}
      <circle
        cx="-28"
        cy="0"
        r="14"
        fill={isPaperMode ? '#F1F5F9' : '#312E81'}
        stroke={isPaperMode ? '#000000' : '#C7D2FE'}
        strokeWidth={isPaperMode ? 1.75 : 2}
      />
      <circle
        cx="-26"
        cy="-2"
        r="5"
        fill={isPaperMode ? '#000000' : '#FDE047'}
      />

      {/* 3. Axon Hillock (Conical origin of axon) */}
      <path
        d="M 15 -8 L 40 -4 L 40 4 L 15 8 Z"
        fill={isPaperMode ? '#FFFFFF' : '#6366F1'}
        stroke={isPaperMode ? '#000000' : '#A5B4FC'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />

      {/* 4. Long Central Axon Wire */}
      <line
        x1="25"
        y1="0"
        x2="280"
        y2="0"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
      />

      {/* 5. Myelin Sheath Segments (Schwann Cells) with Nodes of Ranvier */}
      {[
        { x: 50, w: 42 },
        { x: 105, w: 42 },
        { x: 160, w: 42 },
        { x: 215, w: 42 }
      ].map((seg, idx) => (
        <g key={`myelin-seg-${idx}`} transform={`translate(${seg.x}, 0)`}>
          {/* Myelin Oval Sheath */}
          <rect
            x={0}
            y={-14}
            width={seg.w}
            height={28}
            rx={9}
            fill={isPaperMode ? '#FFFFFF' : '#0284C7'}
            fillOpacity={isPaperMode ? 1 : 0.85}
            stroke={isPaperMode ? '#000000' : '#7DD3FC'}
            strokeWidth={isPaperMode ? 2 : 2.5}
          />
          {/* Schwann Cell Nucleus */}
          <ellipse
            cx={seg.w / 2}
            cy={-6}
            rx={5}
            ry={3}
            fill={isPaperMode ? '#000000' : '#F59E0B'}
          />
          {/* Concentric Lamellar Line inside Myelin */}
          <line
            x1={6}
            y1={4}
            x2={seg.w - 6}
            y2={4}
            stroke={isPaperMode ? '#94A3B8' : '#38BDF8'}
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        </g>
      ))}

      {/* Nodes of Ranvier Gaps (explicit markers) */}
      {[92, 147, 202, 257].map((nx, i) => (
        <g key={`node-${i}`} transform={`translate(${nx}, 0)`}>
          <line y1={-10} y2={10} stroke={isPaperMode ? '#000000' : '#F43F5E'} strokeWidth={isPaperMode ? 1.5 : 2} strokeDasharray="2 2" />
        </g>
      ))}

      {/* 6. Axon Terminal Arborization (Telodendria & Synaptic Boutons) */}
      <g id="axon-terminals" transform="translate(265, 0)">
        {/* Terminal Branch 1 */}
        <path
          d="M 0 0 Q 30 -25 55 -40"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          fill="none"
        />
        <circle cx="58" cy="-42" r="5" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={1.75} />

        {/* Terminal Branch 2 */}
        <path
          d="M 0 0 Q 35 -10 65 -15"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          fill="none"
        />
        <circle cx="68" cy="-15" r="5" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={1.75} />

        {/* Terminal Branch 3 */}
        <path
          d="M 0 0 Q 35 10 65 15"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          fill="none"
        />
        <circle cx="68" cy="15" r="5" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={1.75} />

        {/* Terminal Branch 4 */}
        <path
          d="M 0 0 Q 30 25 55 40"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          fill="none"
        />
        <circle cx="58" cy="42" r="5" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={1.75} />
      </g>

      {/* Impulse Direction Arrow (Action Potential Propagation) */}
      <g transform="translate(130, -32)">
        <line x1="-30" y1="0" x2="30" y2="0" stroke={isPaperMode ? '#000000' : '#FBBF24'} strokeWidth={2} markerEnd="url(#arrow-generic)" />
        <polygon points="32,0 24,-4 24,4" fill={isPaperMode ? '#000000' : '#FBBF24'} />
        <text x="0" y="-6" fill={isPaperMode ? '#334155' : '#FDE68A'} fontSize="9" fontWeight="bold" textAnchor="middle">
          Action Potential Flow
        </text>
      </g>
    </g>
  );
};

/**
 * High-Resolution Sagittal Human Brain Diagram
 * Modeled on neuroanatomy cross-sections (cerebrum with gyri/sulci, corpus callosum, thalamus, cerebellum with arbor vitae, pons, medulla)
 */
export const HumanBrainDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-brain-group" transform="translate(0, -10)">
      {/* 1. Convoluted Cerebral Cortex (Gyri & Sulci Contours) */}
      <path
        d="M -180 40 
           C -190 -20 -160 -90 -110 -130 
           C -60 -170 30 -175 100 -140 
           C 160 -110 185 -50 185 20 
           C 185 60 160 85 130 90 
           C 105 95 90 70 65 65 
           C 40 60 20 85 -20 85 
           C -70 85 -100 95 -130 90 
           C -160 85 -175 65 -180 40 Z"
        fill={isPaperMode ? '#FFFFFF' : '#831843'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#F472B6'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
      />

      {/* Intricate Gyri / Sulci Folds & Creases */}
      <g stroke={isPaperMode ? '#000000' : '#FBCFE8'} strokeWidth={isPaperMode ? 1.75 : 2} fill="none" strokeLinecap="round">
        {/* Frontal Lobe Creases (Left) */}
        <path d="M -140 -20 C -120 -30 -100 -10 -80 -25 C -60 -40 -50 -20 -30 -30" />
        <path d="M -160 10 C -135 0 -115 20 -85 10 C -65 0 -45 15 -25 5" />
        <path d="M -120 -70 C -95 -80 -80 -55 -55 -70 C -35 -85 -15 -65 10 -75" />
        <path d="M -80 -120 C -55 -135 -35 -110 -10 -125 C 15 -140 40 -115 65 -125" />

        {/* Parietal & Occipital Creases (Top & Right) */}
        <path d="M 10 -145 C 35 -130 55 -145 80 -125 C 105 -105 130 -115 150 -90" />
        <path d="M -10 -95 C 15 -110 35 -90 60 -105 C 85 -120 110 -95 135 -90" />
        <path d="M 40 -60 C 70 -75 95 -50 125 -65 C 145 -75 165 -45 170 -20" />
        <path d="M 60 -15 C 90 -30 115 -5 145 -20 C 160 -10 175 10 165 35" />

        {/* Temporal Lobe Creases */}
        <path d="M -90 50 C -60 40 -35 55 -5 45 C 25 35 50 50 80 40" />
        <path d="M -130 55 C -105 70 -75 60 -45 70" />
      </g>

      {/* 2. Corpus Callosum (Broad C-shaped White Matter Tract) */}
      <path
        d="M -60 -5 
           C -50 -45 10 -55 60 -35 
           C 75 -30 85 -15 80 0 
           C 75 12 55 5 45 -10 
           C 10 -25 -30 -20 -45 5 
           C -50 12 -58 10 -60 -5 Z"
        fill={isPaperMode ? '#F1F5F9' : '#E0E7FF'}
        stroke={isPaperMode ? '#000000' : '#FFFFFF'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 3. Thalamus & Hypothalamus (Central Relay Station) */}
      <ellipse
        cx="10"
        cy="12"
        rx="22"
        ry="15"
        fill={isPaperMode ? '#FFFFFF' : '#6366F1'}
        stroke={isPaperMode ? '#000000' : '#A5B4FC'}
        strokeWidth={isPaperMode ? 1.75 : 2}
      />
      {/* Hypothalamus triangular downward region */}
      <polygon
        points="-5,24 15,24 5,38"
        fill={isPaperMode ? '#FFFFFF' : '#4338CA'}
        stroke={isPaperMode ? '#000000' : '#818CF8'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />
      {/* Pituitary Gland */}
      <circle
        cx="6"
        cy="45"
        r="6"
        fill={isPaperMode ? '#000000' : '#F43F5E'}
        stroke={isPaperMode ? '#000000' : '#FDA4AF'}
        strokeWidth={1.5}
      />

      {/* 4. Cerebellum (Little Brain) with Folia / Arbor Vitae tree */}
      <g id="cerebellum" transform="translate(105, 95)">
        <path
          d="M -30 -30 
             C 10 -45 55 -25 65 10 
             C 75 40 45 70 0 65 
             C -35 60 -55 35 -50 0 
             C -45 -20 -35 -25 -30 -30 Z"
          fill={isPaperMode ? '#FFFFFF' : '#047857'}
          fillOpacity={isPaperMode ? 1 : 0.85}
          stroke={isPaperMode ? '#000000' : '#34D399'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Arbor Vitae (Tree of Life white matter branches) */}
        <path
          d="M -35 15 Q -10 10 15 5 M -10 10 Q 5 -15 25 -25 M 0 10 Q 20 20 40 30 M 15 5 Q 35 0 50 -10 M 20 20 Q 35 45 45 55"
          stroke={isPaperMode ? '#000000' : '#D1FAE5'}
          strokeWidth={isPaperMode ? 1.75 : 2}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 5. Brainstem (Pons, Medulla Oblongata & Spinal Cord) */}
      <g id="brainstem" transform="translate(25, 45)">
        {/* Pons (Bulging anterior bridge) */}
        <path
          d="M -15 0 C -28 15 -25 35 -15 45 L 12 45 L 12 0 Z"
          fill={isPaperMode ? '#FFFFFF' : '#0284C7'}
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Medulla Oblongata (Tapering cone) */}
        <path
          d="M -15 45 C -18 65 -15 85 -10 105 L 10 105 L 12 45 Z"
          fill={isPaperMode ? '#FFFFFF' : '#0369A1'}
          stroke={isPaperMode ? '#000000' : '#7DD3FC'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Spinal Cord descending */}
        <rect
          x="-9"
          y="105"
          width="18"
          height="35"
          fill={isPaperMode ? '#F8FAFC' : '#075985'}
          stroke={isPaperMode ? '#000000' : '#BAE6FD'}
          strokeWidth={isPaperMode ? 1.75 : 2}
        />
      </g>
    </g>
  );
};

/**
 * High-Resolution Horizontal Section of the Human Eye
 * Modeled on ophthalmology textbooks (cornea, sclera, iris, pupil, biconvex lens, ciliary body, retina, fovea, optic nerve)
 */
export const HumanEyeDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-eye-group" transform="translate(-15, 0)">
      {/* 1. Outer Tough Sclera (White of Eye) */}
      <circle
        cx="0"
        cy="0"
        r="140"
        fill={isPaperMode ? '#FFFFFF' : '#0F172A'}
        stroke={isPaperMode ? '#000000' : '#E2E8F0'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* 2. Vascular Choroid Layer (Middle Tunic) */}
      <circle
        cx="0"
        cy="0"
        r="133"
        fill="none"
        stroke={isPaperMode ? '#475569' : '#DC2626'}
        strokeWidth={isPaperMode ? 2 : 3}
      />

      {/* 3. Sensory Retina Layer (Inner Tunic, Golden-Amber) */}
      <path
        d="M -115 -65 A 126 126 0 1 1 -115 65"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#F59E0B'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
      />

      {/* Fovea Centralis (High-acuity pit in Macula) */}
      <g transform="translate(126, 5)">
        <path d="M 0 -8 C -4 -4 -4 4 0 8" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={3} fill="none" />
        <circle cx="-3" cy="0" r="3" fill={isPaperMode ? '#000000' : '#FCD34D'} />
      </g>

      {/* 4. Optic Nerve Bundle & Optic Disc (Blind Spot at Posterior Pole) */}
      <g id="optic-nerve" transform="translate(132, 25)">
        <path
          d="M 0 -12 C 30 -10 60 5 95 10 L 95 35 C 60 30 30 15 0 12 Z"
          fill={isPaperMode ? '#FFFFFF' : '#E2E8F0'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Central Retinal Artery and Vein passing through nerve */}
        <line x1="2" y1="0" x2="95" y2="22" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={2} />
        <line x1="2" y1="3" x2="95" y2="25" stroke={isPaperMode ? '#475569' : '#3B82F6'} strokeWidth={1.5} />
      </g>

      {/* 5. Clear Bulging Cornea (Anterior Optical Window) */}
      <path
        d="M -112 -84 C -165 -50 -185 0 -165 50 C -150 75 -112 84 -112 84"
        fill={isPaperMode ? '#F8FAFC' : '#38BDF8'}
        fillOpacity={isPaperMode ? 0.3 : 0.25}
        stroke={isPaperMode ? '#000000' : '#0EA5E9'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* Anterior Chamber Fluid (Aqueous Humor) */}
      <path
        d="M -112 -84 C -155 -40 -155 40 -112 84 Z"
        fill={isPaperMode ? '#FFFFFF' : '#0284C7'}
        fillOpacity={isPaperMode ? 0.1 : 0.15}
      />

      {/* 6. Colored Iris and Pupillary Aperture */}
      {/* Upper Iris Wing */}
      <path
        d="M -110 -78 L -90 -22 L -95 -20 L -115 -74 Z"
        fill={isPaperMode ? '#000000' : '#059669'}
        stroke={isPaperMode ? '#000000' : '#34D399'}
        strokeWidth={1.5}
      />
      {/* Lower Iris Wing */}
      <path
        d="M -110 78 L -90 22 L -95 20 L -115 74 Z"
        fill={isPaperMode ? '#000000' : '#059669'}
        stroke={isPaperMode ? '#000000' : '#34D399'}
        strokeWidth={1.5}
      />

      {/* 7. Ciliary Body & Suspensory Zonules of Zinn */}
      {/* Upper Ciliary Body */}
      <polygon
        points="-112,-84 -90,-80 -95,-65 -116,-72"
        fill={isPaperMode ? '#000000' : '#D97706'}
        stroke={isPaperMode ? '#000000' : '#FBBF24'}
      />
      {/* Upper Zonular Fibers (Fine suspensory lines to lens) */}
      <line x1="-92" y1="-66" x2="-80" y2="-45" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1.5} strokeDasharray="3 1" />
      <line x1="-96" y1="-68" x2="-84" y2="-45" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1.5} strokeDasharray="3 1" />

      {/* Lower Ciliary Body */}
      <polygon
        points="-112,84 -90,80 -95,65 -116,72"
        fill={isPaperMode ? '#000000' : '#D97706'}
        stroke={isPaperMode ? '#000000' : '#FBBF24'}
      />
      {/* Lower Zonular Fibers */}
      <line x1="-92" y1="66" x2="-80" y2="45" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1.5} strokeDasharray="3 1" />
      <line x1="-96" y1="68" x2="-84" y2="45" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1.5} strokeDasharray="3 1" />

      {/* 8. Biconvex Crystalline Lens */}
      <path
        d="M -80 -48 
           C -95 -20 -95 20 -80 48 
           C -65 20 -65 -20 -80 -48 Z"
        fill={isPaperMode ? '#FFFFFF' : '#A78BFA'}
        fillOpacity={isPaperMode ? 0.9 : 0.75}
        stroke={isPaperMode ? '#000000' : '#E0E7FF'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* Concentric Lens Cortex & Nucleus Lines */}
      <path
        d="M -80 -32 C -88 -12 -88 12 -80 32 C -72 12 -72 -12 -80 -32 Z"
        fill="none"
        stroke={isPaperMode ? '#94A3B8' : '#C4B5FD'}
        strokeWidth={1}
        strokeDasharray="3 2"
      />

      {/* 9. Large Vitreous Chamber (Gelatinous Vitreous Humor) */}
      <text
        x="20"
        y="5"
        fill={isPaperMode ? '#64748B' : '#94A3B8'}
        fontSize="12"
        fontFamily="sans-serif"
        fontStyle="italic"
        textAnchor="middle"
        opacity="0.8"
      >
        Vitreous Body (Humor)
      </text>

      {/* Visual Axis Line (Dashed Ray passing from cornea through pupil & fovea) */}
      <line
        x1="-180"
        y1="0"
        x2="135"
        y2="5"
        stroke={isPaperMode ? '#CBD5E1' : '#F43F5E'}
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity="0.6"
      />
    </g>
  );
};

/**
 * High-Resolution Nephron & Renal Corpuscle Diagram
 * Modeled on physiology textbooks (Bowman's capsule, glomerulus, afferent/efferent arterioles, proximal convoluted tubule, loop of Henle, distal tubule, collecting duct)
 */
export const NephronDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="nephron-diagram-group" transform="translate(-100, -30)">
      {/* 1. Glomerulus & Bowman's Double-Walled Capsule */}
      <g id="renal-corpuscle" transform="translate(-50, -40)">
        {/* Bowman's Capsule Cup Outer Parietal Layer */}
        <path
          d="M -30 -35 C 20 -55 65 -20 65 25 C 65 70 15 95 -30 75"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#10B981'}
          strokeWidth={isPaperMode ? 3 : 4}
        />
        {/* Bowman's Urinary Space (Capsular space) */}
        <circle cx="15" cy="20" r="38" fill={isPaperMode ? '#FFFFFF' : '#047857'} fillOpacity={isPaperMode ? 1 : 0.25} />

        {/* Dense Glomerular Capillary Knot (Tuft) */}
        <path
          d="M -5 -5 Q 15 -25 35 -10 Q 45 15 25 30 Q 5 40 10 15 Q -10 25 5 -5 Q 25 0 35 25"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={isPaperMode ? 4 : 5.5}
          strokeLinecap="round"
        />

        {/* Afferent Arteriole (Wide in-flow) */}
        <path d="M -70 5 Q -45 5 -15 8" stroke={isPaperMode ? '#000000' : '#DC2626'} strokeWidth={isPaperMode ? 4 : 6} fill="none" />
        <polygon points="-40,4 -48,0 -48,8" fill={isPaperMode ? '#000000' : '#FFFFFF'} />

        {/* Efferent Arteriole (Narrow out-flow) */}
        <path d="M -15 32 Q -45 35 -70 35" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 2.5 : 3.5} fill="none" />
        <polygon points="-50,35 -42,32 -42,38" fill={isPaperMode ? '#000000' : '#FFFFFF'} />
      </g>

      {/* 2. Proximal Convoluted Tubule (PCT - Intricately coiled) */}
      <path
        d="M -20 35 
           Q 20 55 50 25 
           Q 80 -5 110 30 
           Q 130 65 100 95 
           Q 70 115 50 145"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#F59E0B'}
        strokeWidth={isPaperMode ? 7 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner lumen line for PCT */}
      <path
        d="M -20 35 Q 20 55 50 25 Q 80 -5 110 30 Q 130 65 100 95 Q 70 115 50 145"
        fill="none"
        stroke={isPaperMode ? '#FFFFFF' : '#FEF3C7'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
      />

      {/* 3. Loop of Henle (Descending Thin Limb & Ascending Thick Limb) */}
      {/* Descending Thin Limb */}
      <path
        d="M 50 145 L 50 240 Q 50 270 75 270 Q 100 270 100 240"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#06B6D4'}
        strokeWidth={isPaperMode ? 4 : 5}
      />
      {/* Hairpin Bend Turn */}
      <circle cx="75" cy="270" r="4" fill={isPaperMode ? '#000000' : '#22D3EE'} />

      {/* Ascending Thick Limb (Active Na+/K+/2Cl- transport) */}
      <path
        d="M 100 240 L 100 120 Q 100 80 130 65"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#0284C7'}
        strokeWidth={isPaperMode ? 6.5 : 8}
      />
      <path
        d="M 100 240 L 100 120 Q 100 80 130 65"
        fill="none"
        stroke={isPaperMode ? '#FFFFFF' : '#BAE6FD'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 4. Distal Convoluted Tubule (DCT) */}
      <path
        d="M 130 65 
           Q 160 50 180 80 
           Q 200 110 230 85 
           Q 250 65 275 75"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#8B5CF6'}
        strokeWidth={isPaperMode ? 6.5 : 8}
        strokeLinecap="round"
      />
      <path
        d="M 130 65 Q 160 50 180 80 Q 200 110 230 85 Q 250 65 275 75"
        fill="none"
        stroke={isPaperMode ? '#FFFFFF' : '#EDE9FE'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 5. Collecting Duct (Straight vertical conduit receiving multiple nephrons) */}
      <g id="collecting-duct" transform="translate(275, 0)">
        <path
          d="M 0 -30 L 0 270"
          stroke={isPaperMode ? '#000000' : '#EC4899'}
          strokeWidth={isPaperMode ? 9 : 12}
          strokeLinecap="square"
        />
        <path
          d="M 0 -30 L 0 270"
          stroke={isPaperMode ? '#FFFFFF' : '#FDF2F8'}
          strokeWidth={isPaperMode ? 3 : 4}
        />
        {/* Tributary branches from other nephrons */}
        <line x1="-20" y1="15" x2="0" y2="25" stroke={isPaperMode ? '#000000' : '#EC4899'} strokeWidth={isPaperMode ? 5 : 6} />
        <line x1="-20" y1="130" x2="0" y2="140" stroke={isPaperMode ? '#000000' : '#EC4899'} strokeWidth={isPaperMode ? 5 : 6} />
        <line x1="20" y1="90" x2="0" y2="100" stroke={isPaperMode ? '#000000' : '#EC4899'} strokeWidth={isPaperMode ? 5 : 6} />
      </g>

      {/* Cortico-Medullary Boundary Line (Cortex above, Medulla below) */}
      <line
        x1="-100"
        y1="135"
        x2="310"
        y2="135"
        stroke={isPaperMode ? '#94A3B8' : '#475569'}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text x="-90" y="128" fill={isPaperMode ? '#475569' : '#94A3B8'} fontSize="10" fontWeight="bold">Renal Cortex</text>
      <text x="-90" y="148" fill={isPaperMode ? '#475569' : '#94A3B8'} fontSize="10" fontWeight="bold">Renal Medulla</text>
    </g>
  );
};

/**
 * High-Resolution Mitochondrion Ultrastructure Diagram
 * Modeled on cell biology textbooks (outer membrane, intermembrane space, inner membrane folded into cristae, matrix, circular mtDNA, ribosomes, ATP synthase)
 */
export const MitochondrionDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="mitochondria-ultrastructure" transform="translate(0, 0)">
      {/* 1. Smooth Outer Membrane Capsule */}
      <rect
        x="-220"
        y="-120"
        width="440"
        height="240"
        rx="120"
        fill={isPaperMode ? '#FFFFFF' : '#991B1B'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#EF4444'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* Intermembrane Space (Gap between outer and inner membrane) */}
      <rect
        x="-210"
        y="-110"
        width="420"
        height="220"
        rx="110"
        fill={isPaperMode ? '#FAFAFA' : '#7F1D1D'}
        stroke={isPaperMode ? '#64748B' : '#F87171'}
        strokeWidth={isPaperMode ? 1.5 : 2}
        strokeDasharray={isPaperMode ? '4 2' : undefined}
      />

      {/* 2. Inner Mitochondrial Membrane Deep Cristae Shelf Folds */}
      <g stroke={isPaperMode ? '#000000' : '#FBBF24'} strokeWidth={isPaperMode ? 3 : 4} fill={isPaperMode ? '#FFFFFF' : '#B45309'} strokeLinecap="round" strokeLinejoin="round">
        {/* Top Cristae Finger Projections reaching downward into matrix */}
        <path d="M -150 -108 L -150 -40 Q -150 -25 -140 -25 Q -130 -25 -130 -40 L -130 -108" />
        <path d="M -80 -110 L -80 -20 Q -80 0 -70 0 Q -60 0 -60 -20 L -60 -110" />
        <path d="M -10 -110 L -10 -15 Q -10 5 0 5 Q 10 5 10 -15 L 10 -110" />
        <path d="M 60 -110 L 60 -20 Q 60 0 70 0 Q 80 0 80 -20 L 80 -110" />
        <path d="M 130 -108 L 130 -35 Q 130 -20 140 -20 Q 150 -20 150 -35 L 150 -108" />

        {/* Bottom Cristae Finger Projections reaching upward into matrix */}
        <path d="M -110 108 L -110 30 Q -110 15 -100 15 Q -90 15 -90 30 L -90 108" />
        <path d="M -40 110 L -40 15 Q -40 -5 -30 -5 Q -20 -5 -20 15 L -20 110" />
        <path d="M 30 110 L 30 10 Q 30 -10 40 -10 Q 50 -10 50 10 L 50 110" />
        <path d="M 100 108 L 100 25 Q 100 10 110 10 Q 120 10 120 25 L 120 108" />
      </g>

      {/* 3. Mitochondrial Matrix (Central Enzyme-Rich Space) */}
      {/* Matrix Granules (Calcium deposits) */}
      <circle cx="-160" cy="15" r="5" fill={isPaperMode ? '#000000' : '#1E293B'} />
      <circle cx="160" cy="-10" r="5" fill={isPaperMode ? '#000000' : '#1E293B'} />
      <circle cx="-45" cy="-45" r="4.5" fill={isPaperMode ? '#000000' : '#1E293B'} />
      <circle cx="95" cy="55" r="4.5" fill={isPaperMode ? '#000000' : '#1E293B'} />

      {/* 4. Circular Mitochondrial DNA (mtDNA Loop) */}
      <path
        d="M -170 55 Q -145 35 -135 55 Q -125 75 -150 70 Q -175 75 -170 55 Z"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      <path
        d="M 140 45 Q 165 25 175 45 Q 185 65 160 60 Q 135 65 140 45 Z"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 5. 70S Mitochondrial Ribosomes */}
      {[
        [-130, 0], [-70, 45], [-35, -75], [5, 45], [45, -70], [105, -50], [130, 20]
      ].map(([rx, ry], idx) => (
        <circle key={`mt-ribo-${idx}`} cx={rx} cy={ry} r="2.5" fill={isPaperMode ? '#000000' : '#F43F5E'} />
      ))}

      {/* 6. ATP Synthase F0-F1 Particles (Mushroom knobs on cristae inner membrane) */}
      {!isPaperMode && (
        <g fill="#10B981">
          <circle cx="-153" cy="-42" r="2.5" />
          <circle cx="-127" cy="-42" r="2.5" />
          <circle cx="-83" cy="-22" r="2.5" />
          <circle cx="-57" cy="-22" r="2.5" />
          <circle cx="3" cy="7" r="2.5" />
          <circle cx="73" cy="-2" r="2.5" />
        </g>
      )}
    </g>
  );
};

/**
 * High-Resolution Chloroplast Ultrastructure Diagram
 * Modeled on botany textbooks (outer/inner envelope, stroma, thylakoids, stacked grana, stroma lamellae, starch grain)
 */
export const ChloroplastDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="chloroplast-ultrastructure" transform="translate(0, 0)">
      {/* 1. Double Membrane Envelope */}
      {/* Outer Membrane */}
      <ellipse
        cx="0"
        cy="0"
        rx="220"
        ry="130"
        fill={isPaperMode ? '#FFFFFF' : '#064E3B'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#10B981'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />
      {/* Inner Membrane */}
      <ellipse
        cx="0"
        cy="0"
        rx="210"
        ry="120"
        fill={isPaperMode ? '#FAFAFA' : '#047857'}
        fillOpacity={isPaperMode ? 1 : 0.4}
        stroke={isPaperMode ? '#334155' : '#34D399'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />

      {/* Intermembrane Space text or annotation */}

      {/* 2. Stroma Fluid Matrix */}

      {/* Starch Granule (Storage carbohydrate) */}
      <ellipse
        cx="140"
        cy="-50"
        rx="28"
        ry="16"
        transform="rotate(15, 140, -50)"
        fill={isPaperMode ? '#F1F5F9' : '#FEF3C7'}
        stroke={isPaperMode ? '#000000' : '#F59E0B'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Plastoglobules (Lipid droplets) */}
      <circle cx="120" cy="55" r="6" fill={isPaperMode ? '#000000' : '#D97706'} />
      <circle cx="140" cy="65" r="4.5" fill={isPaperMode ? '#000000' : '#D97706'} />

      {/* 3. Grana Columns (Stacks of Disc-like Thylakoids) */}
      {[
        { x: -140, y: -20, discs: 5 },
        { x: -60, y: -10, discs: 6 },
        { x: 20, y: 0, discs: 6 },
        { x: 100, y: 10, discs: 4 }
      ].map((granum, gIdx) => (
        <g key={`granum-${gIdx}`} transform={`translate(${granum.x}, ${granum.y})`}>
          {Array.from({ length: granum.discs }).map((_, dIdx) => {
            const dy = (dIdx - granum.discs / 2) * 14;
            return (
              <ellipse
                key={`disc-${dIdx}`}
                cx="0"
                cy={dy}
                rx="24"
                ry="6.5"
                fill={isPaperMode ? '#FFFFFF' : '#059669'}
                stroke={isPaperMode ? '#000000' : '#A7F3D0'}
                strokeWidth={isPaperMode ? 1.75 : 2}
              />
            );
          })}
        </g>
      ))}

      {/* 4. Stroma Lamellae / Frets (Tubular bridges connecting grana stacks) */}
      <g stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none">
        {/* Bridge 1: Granum 1 to Granum 2 */}
        <line x1="-116" y1="-20" x2="-84" y2="-15" />
        <line x1="-116" y1="-6" x2="-84" y2="0" />

        {/* Bridge 2: Granum 2 to Granum 3 */}
        <line x1="-36" y1="-10" x2="-4" y2="-5" />
        <line x1="-36" y1="12" x2="-4" y2="16" />

        {/* Bridge 3: Granum 3 to Granum 4 */}
        <line x1="44" y1="-5" x2="76" y2="2" />
        <line x1="44" y1="18" x2="76" y2="22" />
      </g>

      {/* Chloroplast Circular DNA (cpDNA) */}
      <path
        d="M -150 55 Q -130 45 -120 60 Q -110 75 -135 70 Q -155 75 -150 55 Z"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
    </g>
  );
};

/**
 * High-Resolution Bacterial Cell / Prokaryote Diagram
 * Modeled on microbiology textbooks (capsule, cell wall, plasma membrane, circular nucleoid DNA, ribosomes, plasmid, rotary flagellum, pili)
 */
export const BacterialCellDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="bacterial-cell-group" transform="translate(40, 0)">
      {/* 1. Rotary Helical Flagellum (Motor at Left Pole) */}
      <g id="flagellum">
        {/* Basal Body Motor embedded in wall */}
        <rect x="-172" y="-5" width="10" height="10" rx="3" fill={isPaperMode ? '#000000' : '#EF4444'} />
        {/* Sinusoidal Helical Wave Filament */}
        <path
          d="M -172 0 Q -210 -40 -250 0 Q -290 40 -330 0 Q -370 -40 -410 0"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 3.5 : 4.5}
          strokeLinecap="round"
        />
      </g>

      {/* 2. Three-Layer Envelope: Capsule -> Cell Wall -> Plasma Membrane */}
      {/* Outer Glycocalyx Capsule (Slime layer) */}
      <rect
        x="-165"
        y="-90"
        width="270"
        height="180"
        rx="80"
        fill={isPaperMode ? '#FFFFFF' : '#064E3B'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#10B981'}
        strokeWidth={isPaperMode ? 3.5 : 4.5}
      />

      {/* Peptidoglycan Cell Wall (Middle rigid box) */}
      <rect
        x="-155"
        y="-80"
        width="250"
        height="160"
        rx="70"
        fill={isPaperMode ? '#FAFAFA' : '#047857'}
        fillOpacity={isPaperMode ? 1 : 0.6}
        stroke={isPaperMode ? '#334155' : '#34D399'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Inner Plasma Membrane */}
      <rect
        x="-145"
        y="-70"
        width="230"
        height="140"
        rx="60"
        fill={isPaperMode ? '#F8FAFC' : '#065F46'}
        fillOpacity={isPaperMode ? 1 : 0.4}
        stroke={isPaperMode ? '#475569' : '#6EE7B7'}
        strokeWidth={isPaperMode ? 1.5 : 2}
        strokeDasharray={isPaperMode ? '4 2' : undefined}
      />

      {/* 3. Mesosome (Infolding of plasma membrane) */}
      <path
        d="M -60 -70 Q -50 -50 -40 -70"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#6EE7B7'}
        strokeWidth={2}
      />

      {/* 4. Nucleoid Region (Tangled, Unbounded Circular Chromosomal DNA) */}
      <path
        d="M -90 -20 
           C -70 -50 -40 -10 -20 -35 
           C 0 -60 30 -25 50 -40 
           C 65 -15 45 15 35 35 
           C 15 50 -10 20 -35 40 
           C -60 55 -80 30 -70 10 
           C -65 -5 -100 0 -90 -20 Z"
        fill={isPaperMode ? 'none' : '#FEF08A'}
        fillOpacity={0.15}
        stroke={isPaperMode ? '#000000' : '#EAB308'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
        strokeLinecap="round"
      />

      {/* 5. Plasmids (Extrachromosomal DNA Rings) */}
      <circle cx="-100" cy="35" r="9" fill="none" stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 2 : 2.5} />
      <circle cx="60" cy="-25" r="11" fill="none" stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 2 : 2.5} />

      {/* 6. Bacterial Ribosomes (70S particles) */}
      {[
        [-110, -35], [-120, 10], [-55, -45], [0, 40], [20, -50], [55, 30], [80, 5]
      ].map(([bx, by], idx) => (
        <circle key={`bac-ribo-${idx}`} cx={bx} cy={by} r="2.5" fill={isPaperMode ? '#000000' : '#EF4444'} />
      ))}

      {/* 7. Pili / Fimbriae (Hair-like attachment projections all around capsule) */}
      <g stroke={isPaperMode ? '#000000' : '#A7F3D0'} strokeWidth={isPaperMode ? 1.75 : 2} strokeLinecap="round">
        {/* Top Pili */}
        <line x1="-120" y1="-90" x2="-130" y2="-112" />
        <line x1="-80" y1="-90" x2="-80" y2="-114" />
        <line x1="-40" y1="-90" x2="-45" y2="-115" />
        <line x1="0" y1="-90" x2="0" y2="-115" />
        <line x1="40" y1="-90" x2="45" y2="-114" />

        {/* Bottom Pili */}
        <line x1="-120" y1="90" x2="-130" y2="112" />
        <line x1="-80" y1="90" x2="-80" y2="114" />
        <line x1="-40" y1="90" x2="-45" y2="115" />
        <line x1="0" y1="90" x2="0" y2="115" />
        <line x1="40" y1="90" x2="45" y2="114" />

        {/* Right Pole Pili (Sex Pilus - longer conduit) */}
        <line x1="105" y1="-20" x2="145" y2="-30" strokeWidth={isPaperMode ? 2.5 : 3} />
        <line x1="105" y1="15" x2="135" y2="25" />
      </g>
    </g>
  );
};

/**
 * High-Resolution DNA Double Helix Diagram
 * Modeled on genetics textbooks (sugar-phosphate backbones, major/minor grooves, paired base rungs with hydrogen bonds)
 */
export const DNADoubleHelixDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="dna-helix-group" transform="translate(0, 0)">
      {/* Vertical DNA Strand with alternating twists */}
      {[-160, -80, 0, 80, 160].map((baseY, i) => {
        const isCross = i % 2 === 1;
        return (
          <g key={`dna-segment-${i}`} transform={`translate(0, ${baseY})`}>
            {/* Horizontal Base Pair Rungs */}
            {[-25, -12, 0, 12, 25].map((offY, rIdx) => {
              const span = Math.cos(((offY + 25) / 50) * Math.PI) * (isCross ? 15 : 75);
              return (
                <g key={`rung-${rIdx}`} transform={`translate(0, ${offY})`}>
                  {/* Left Base (e.g. Adenine / Guanine) */}
                  <line
                    x1={-span}
                    y1="0"
                    x2="0"
                    y2="0"
                    stroke={isPaperMode ? '#000000' : rIdx % 2 === 0 ? '#3B82F6' : '#10B981'}
                    strokeWidth={isPaperMode ? 2.5 : 4}
                  />
                  {/* Hydrogen Bonds (Dots in middle) */}
                  <circle cx="0" cy="0" r="1.5" fill={isPaperMode ? '#94A3B8' : '#FFFFFF'} />
                  {/* Right Base (e.g. Thymine / Cytosine) */}
                  <line
                    x1="0"
                    y1="0"
                    x2={span}
                    y2="0"
                    stroke={isPaperMode ? '#000000' : rIdx % 2 === 0 ? '#EF4444' : '#F59E0B'}
                    strokeWidth={isPaperMode ? 2.5 : 4}
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Two Continuous Helical Sugar-Phosphate Backbones */}
      {/* Backbone Strand 1 (5' to 3') */}
      <path
        d="M -75 -190 
           C -75 -130 75 -110 75 -50 
           C 75 10 -75 30 -75 90 
           C -75 150 75 170 75 230"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#818CF8'}
        strokeWidth={isPaperMode ? 4 : 6}
        strokeLinecap="round"
      />
      {/* Backbone Strand 2 (3' to 5' Antiparallel) */}
      <path
        d="M 75 -190 
           C 75 -130 -75 -110 -75 -50 
           C -75 10 75 30 75 90 
           C 75 150 -75 170 -75 230"
        fill="none"
        stroke={isPaperMode ? '#334155' : '#C084FC'}
        strokeWidth={isPaperMode ? 4 : 6}
        strokeLinecap="round"
      />

      {/* Terminal Notations */}
      <text x="-95" y="-195" fill={isPaperMode ? '#000000' : '#818CF8'} fontSize="11" fontWeight="bold">5'</text>
      <text x="85" y="-195" fill={isPaperMode ? '#000000' : '#C084FC'} fontSize="11" fontWeight="bold">3'</text>
      <text x="-95" y="240" fill={isPaperMode ? '#000000' : '#818CF8'} fontSize="11" fontWeight="bold">3'</text>
      <text x="85" y="240" fill={isPaperMode ? '#000000' : '#C084FC'} fontSize="11" fontWeight="bold">5'</text>

      {/* Groove Callouts */}
      <text x="95" y="20" fill={isPaperMode ? '#475569' : '#38BDF8'} fontSize="10" fontWeight="bold">Major Groove</text>
      <text x="95" y="-80" fill={isPaperMode ? '#475569' : '#38BDF8'} fontSize="10" fontWeight="bold">Minor Groove</text>
    </g>
  );
};

/**
 * High-Resolution Respiratory Tree & Human Lungs Diagram
 * Modeled on pulmonology textbooks (larynx, trachea with cartilage rings, primary bronchi, bronchioles, alveoli cluster)
 */
export const HumanLungsRespiratoryDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-lungs-group" transform="translate(0, -20)">
      {/* 1. Trachea with Horizontal C-shaped Cartilaginous Rings */}
      <g id="trachea" transform="translate(0, -110)">
        <rect
          x="-16"
          y="0"
          width="32"
          height="80"
          fill={isPaperMode ? '#FFFFFF' : '#0284C7'}
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Cartilage Rings */}
        {[10, 22, 34, 46, 58, 70].map((ry) => (
          <path
            key={`ring-${ry}`}
            d={`M -16 ${ry} C -8 ${ry + 3} 8 ${ry + 3} 16 ${ry}`}
            stroke={isPaperMode ? '#000000' : '#BAE6FD'}
            strokeWidth={isPaperMode ? 2 : 2.5}
            fill="none"
          />
        ))}
      </g>

      {/* Carina (Bifurcation into Left and Right Bronchi) */}
      <g stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 6 : 8} fill="none" strokeLinecap="round">
        <path d="M 0 -30 L -45 5" />
        <path d="M 0 -30 L 45 5" />
      </g>

      {/* 2. Left Lung (Two Lobes with Cardiac Notch) */}
      <path
        d="M 35 -15 
           C 65 -45 140 -40 165 30 
           C 185 90 170 160 130 175 
           C 90 185 55 175 40 165 
           C 25 130 20 85 45 60 
           C 55 45 45 10 35 -15 Z"
        fill={isPaperMode ? '#FFFFFF' : '#BE185D'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#F472B6'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 3. Right Lung (Three Lobes: Superior, Middle, Inferior) */}
      <path
        d="M -35 -15 
           C -65 -45 -140 -40 -165 30 
           C -185 90 -170 160 -130 175 
           C -90 185 -45 175 -35 150 
           C -25 90 -20 20 -35 -15 Z"
        fill={isPaperMode ? '#FFFFFF' : '#BE185D'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#F472B6'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* Fissures separating right lung lobes */}
      <path d="M -160 50 L -70 80" stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={isPaperMode ? 1.75 : 2} fill="none" />
      <path d="M -150 115 L -60 125" stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={isPaperMode ? 1.75 : 2} fill="none" />

      {/* 4. Branching Bronchial Tree inside Lungs */}
      <g stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={isPaperMode ? 2 : 2.5} fill="none" strokeLinecap="round">
        {/* Right Bronchial Branches */}
        <path d="M -45 5 Q -75 25 -105 45 M -75 25 Q -105 15 -135 15 M -75 25 Q -85 65 -115 85" />
        <path d="M -105 45 Q -120 75 -135 110 M -115 85 Q -125 130 -140 145" />

        {/* Left Bronchial Branches */}
        <path d="M 45 5 Q 75 25 105 45 M 75 25 Q 105 15 135 15 M 75 25 Q 85 65 115 85" />
        <path d="M 105 45 Q 120 75 135 110 M 115 85 Q 125 130 140 145" />
      </g>

      {/* 5. Alveolar Cluster Magnification Inset */}
      <g transform="translate(145, 110)">
        <circle cx="20" cy="20" r="32" fill={isPaperMode ? '#FFFFFF' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* Alveolar grape-like sacs */}
        <circle cx="12" cy="12" r="10" fill={isPaperMode ? '#FFFFFF' : '#FDA4AF'} stroke={isPaperMode ? '#000000' : '#F43F5E'} strokeWidth={1.5} />
        <circle cx="28" cy="12" r="9" fill={isPaperMode ? '#FFFFFF' : '#FDA4AF'} stroke={isPaperMode ? '#000000' : '#F43F5E'} strokeWidth={1.5} />
        <circle cx="20" cy="26" r="11" fill={isPaperMode ? '#FFFFFF' : '#FDA4AF'} stroke={isPaperMode ? '#000000' : '#F43F5E'} strokeWidth={1.5} />
        <text x="20" y="44" fill={isPaperMode ? '#000000' : '#7DD3FC'} fontSize="8" fontWeight="bold" textAnchor="middle">Alveoli</text>
      </g>

      {/* 6. Muscular Diaphragm Dome underneath lungs */}
      <path
        d="M -190 195 Q 0 160 190 195"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#E11D48'}
        strokeWidth={isPaperMode ? 4 : 5}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * High-Resolution Full Human Digestive System Diagram (Gastrointestinal Tract & Accessory Organs)
 * Modeled on authoritative medical anatomy atlases (Netter / Gray's Anatomy):
 * - Head & neck with Oral cavity, Tongue, Teeth, Pharynx, and Salivary Glands (Parotid, Submandibular).
 * - Esophagus tube descending past diaphragm into abdominal cavity.
 * - J-shaped Stomach with Cardia, Fundus, Body, Gastric Rugae folds, and Pylorus.
 * - Multi-lobed Liver (Right & Left lobes, Falciform ligament) with pear-shaped Gallbladder and Bile Ducts.
 * - C-shaped Duodenum with nestled Pancreas (Head, Body, Tail, and Main Pancreatic Duct).
 * - Highly folded loops of Small Intestine (Jejunum & Ileum) with plicae circulares.
 * - Large Intestine / Colon (Cecum, Vermiform Appendix, Ascending, Transverse, Descending, Sigmoid Colon, Rectum, and Anal Canal).
 */
export const HumanDigestiveSystemDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-digestive-system-group" transform="translate(0, -10)">
      {/* 0. Subtle Anatomical Torso & Head Silhouette Backdrop */}
      <path
        d="M -50 -255 C -30 -265 30 -265 50 -255 C 65 -245 75 -230 75 -210 C 75 -190 60 -175 45 -165 L 45 -150 C 70 -140 120 -115 135 -70 C 145 -30 145 70 140 160 C 135 220 120 250 100 270 L -100 270 C -120 250 -135 220 -140 160 C -145 70 -145 -30 -135 -70 C -120 -115 -70 -140 -45 -150 L -45 -165 C -60 -175 -75 -190 -75 -210 C -75 -230 -65 -245 -50 -255 Z"
        fill={isPaperMode ? '#F8FAFC' : '#0F172A'}
        fillOpacity={isPaperMode ? 0.3 : 0.45}
        stroke={isPaperMode ? '#CBD5E1' : '#334155'}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />

      {/* Diaphragm Muscle Line */}
      <path
        d="M -115 -65 Q 0 -90 115 -65"
        stroke={isPaperMode ? '#64748B' : '#64748B'}
        strokeWidth={2}
        strokeDasharray="4 3"
        fill="none"
      />

      {/* 1. Head & Oral Cavity Structures */}
      {/* Oral Cavity Chamber */}
      <path
        d="M -25 -225 C -15 -240 20 -240 32 -225 C 38 -215 32 -200 15 -195 C -10 -190 -22 -210 -25 -225 Z"
        fill={isPaperMode ? '#E2E8F0' : '#FDA4AF'}
        stroke={isPaperMode ? '#000000' : '#E11D48'}
        strokeWidth={2}
      />
      {/* Tongue */}
      <path
        d="M -15 -205 Q 5 -202 20 -210 Q 5 -196 -15 -205 Z"
        fill={isPaperMode ? '#94A3B8' : '#FB7185'}
        stroke={isPaperMode ? '#000000' : '#BE185D'}
        strokeWidth={1.5}
      />
      {/* Teeth Row */}
      <rect x="-10" y="-228" width="22" height="4" rx="1.5" fill={isPaperMode ? '#FFFFFF' : '#FFFFFF'} stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1} />
      <rect x="-10" y="-216" width="22" height="4" rx="1.5" fill={isPaperMode ? '#FFFFFF' : '#FFFFFF'} stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={1} />

      {/* Parotid Salivary Gland (Right pre-auricular) */}
      <ellipse
        cx="44"
        cy="-218"
        rx="10"
        ry="13"
        fill={isPaperMode ? '#E2E8F0' : '#FBBF24'}
        stroke={isPaperMode ? '#000000' : '#D97706'}
        strokeWidth={1.75}
      />
      {/* Parotid Stensen's Duct */}
      <path d="M 36 -218 L 16 -218" stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth={1.5} strokeDasharray="2 2" fill="none" />

      {/* Submandibular & Sublingual Glands */}
      <ellipse
        cx="20"
        cy="-194"
        rx="8"
        ry="6"
        fill={isPaperMode ? '#E2E8F0' : '#F59E0B'}
        stroke={isPaperMode ? '#000000' : '#B45309'}
        strokeWidth={1.5}
      />

      {/* Pharynx (Muscular funnel) */}
      <path
        d="M -8 -195 L 12 -195 L 10 -165 L -6 -165 Z"
        fill={isPaperMode ? '#CBD5E1' : '#F43F5E'}
        stroke={isPaperMode ? '#000000' : '#BE185D'}
        strokeWidth={2}
      />

      {/* 2. Esophagus (Muscular peristaltic food tube) */}
      <path
        d="M -6 -165 L 10 -165 L 8 -65 L -8 -65 Z"
        fill={isPaperMode ? '#E2E8F0' : '#FB7185'}
        stroke={isPaperMode ? '#000000' : '#E11D48'}
        strokeWidth={2}
      />
      {/* Esophageal Peristaltic Bands */}
      {[-150, -130, -110, -90, -75].map((yB, bIdx) => (
        <line key={`eso-band-${bIdx}`} x1="-6" y1={yB} x2="9" y2={yB} stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={1.2} />
      ))}

      {/* Lower Esophageal (Cardiac) Sphincter */}
      <ellipse cx="0" cy="-64" rx="9" ry="3.5" fill="none" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} strokeDasharray="3 2" />

      {/* 3. Multi-Lobed Liver (Right & Left Lobes) - Left quadrant of anatomical figure */}
      <g id="liver-organ">
        {/* Right & Left Liver Mass */}
        <path
          d="M -92 -60 C -40 -72 5 -60 12 -45 C 16 -30 10 -5 -10 12 C -28 24 -70 20 -95 0 C -112 -15 -110 -45 -92 -60 Z"
          fill={isPaperMode ? '#475569' : '#991B1B'}
          fillOpacity={isPaperMode ? 1 : 0.92}
          stroke={isPaperMode ? '#000000' : '#7F1D1D'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Falciform Ligament dividing lobes */}
        <path
          d="M -45 -67 C -42 -40 -40 -15 -36 15"
          stroke={isPaperMode ? '#FFFFFF' : '#FECACA'}
          strokeWidth={1.75}
          fill="none"
        />

        {/* Gallbladder (Pear-shaped green reservoir beneath liver) */}
        <path
          d="M -36 -2 C -42 10 -40 22 -30 25 C -22 27 -20 16 -24 3 Z"
          fill={isPaperMode ? '#15803D' : '#22C55E'}
          stroke={isPaperMode ? '#000000' : '#14532D'}
          strokeWidth={2}
        />
        {/* Cystic & Common Bile Duct leading into duodenum */}
        <path
          d="M -26 12 C -18 16 -12 25 -10 38"
          stroke={isPaperMode ? '#000000' : '#16A34A'}
          strokeWidth={2.5}
          fill="none"
        />
      </g>

      {/* 4. Stomach (J-shaped digestive organ with Rugae folds) */}
      <g id="stomach-organ">
        <path
          d="M 2 -64 C 18 -68 62 -65 78 -40 C 92 -15 95 25 78 52 C 60 78 20 80 -4 65 C -22 52 -24 36 -12 24 C -2 14 12 12 18 -10 C 22 -30 12 -55 2 -64 Z"
          fill={isPaperMode ? '#E2E8F0' : '#BE123C'}
          fillOpacity={isPaperMode ? 1 : 0.95}
          stroke={isPaperMode ? '#000000' : '#E11D48'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Internal Gastric Rugae Mucosal Folds */}
        <g stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.85}>
          <path d="M 52 -35 Q 65 0 54 35 Q 40 60 22 68" />
          <path d="M 34 -25 Q 42 10 32 45 Q 18 64 0 60" />
          <path d="M 20 -15 Q 22 15 10 40" />
        </g>
        {/* Pyloric Sphincter Valve at exit */}
        <ellipse cx="-16" cy="30" rx="5" ry="8" fill="none" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />
      </g>

      {/* 5. Pancreas (Golden glandular organ behind stomach) */}
      <g id="pancreas-organ">
        <path
          d="M -18 32 C -5 26 28 22 55 18 C 65 16 68 24 55 28 C 30 36 -2 42 -16 44 C -22 45 -24 38 -18 32 Z"
          fill={isPaperMode ? '#CBD5E1' : '#FBBF24'}
          fillOpacity={isPaperMode ? 1 : 0.95}
          stroke={isPaperMode ? '#000000' : '#D97706'}
          strokeWidth={2}
        />
        {/* Main Pancreatic Duct (Wirsung) */}
        <path
          d="M 50 21 C 28 28 5 33 -14 36"
          stroke={isPaperMode ? '#000000' : '#FFFFFF'}
          strokeWidth={1.5}
          strokeDasharray="3 2"
          fill="none"
        />
      </g>

      {/* 6. Duodenum (C-shaped beginning of Small Intestine) */}
      <path
        d="M -18 30 C -34 32 -38 52 -30 68 C -20 84 0 88 12 88"
        stroke={isPaperMode ? '#000000' : '#F97316'}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M -18 30 C -34 32 -38 52 -30 68 C -20 84 0 88 12 88"
        stroke={isPaperMode ? '#FFFFFF' : '#FFEDD5'}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />

      {/* 7. Small Intestine (Jejunum & Ileum - Highly Convoluted Loops) */}
      <g id="small-intestine-loops">
        {/* Primary background bed */}
        <rect x="-56" y="90" width="112" height="74" rx="20" fill={isPaperMode ? '#E2E8F0' : '#FED7AA'} stroke={isPaperMode ? '#000000' : '#F97316'} strokeWidth={2} />
        {/* Detailed undulating serpentine loops */}
        <g stroke={isPaperMode ? '#000000' : '#EA580C'} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -40 100 Q -20 92 0 100 Q 20 108 40 100" />
          <path d="M 40 100 Q 48 112 36 120 Q 15 112 -10 120 Q -35 128 -42 118" />
          <path d="M -42 118 Q -46 132 -30 138 Q 0 130 32 138 Q 44 142 38 152" />
          <path d="M 38 152 Q 20 158 -5 152 Q -30 148 -40 156" />
        </g>
        {/* Circular folds (Plicae Circulares stipples) */}
        {!isPaperMode && (
          <g fill="#F97316" opacity="0.6">
            {[-30, -10, 10, 30].map(xP => (
              <circle key={`plicae-1-${xP}`} cx={xP} cy="100" r="1.5" />
            ))}
            {[-25, 0, 25].map(xP => (
              <circle key={`plicae-2-${xP}`} cx={xP} cy="120" r="1.5" />
            ))}
            {[-20, 5, 25].map(xP => (
              <circle key={`plicae-3-${xP}`} cx={xP} cy="140" r="1.5" />
            ))}
          </g>
        )}
      </g>

      {/* 8. Large Intestine / Colon (Framing the abdominal cavity) */}
      <g id="large-intestine-colon">
        {/* Cecum & Vermiform Appendix (Bottom Right of Patient = Left on diagram) */}
        {/* Cecum Pouch */}
        <path
          d="M -62 140 C -78 140 -82 165 -68 178 C -58 186 -50 175 -52 155 Z"
          fill={isPaperMode ? '#CBD5E1' : '#B45309'}
          stroke={isPaperMode ? '#000000' : '#78350F'}
          strokeWidth={2.5}
        />
        {/* Vermiform Appendix (Finger-like worm extension) */}
        <path
          d="M -70 175 C -78 185 -85 200 -76 205 C -70 208 -66 195 -68 185"
          stroke={isPaperMode ? '#000000' : '#DC2626'}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />

        {/* Ascending Colon (Upward right side of patient = left on viewer) */}
        <path
          d="M -66 150 L -66 75"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
        />
        {/* Hepatic (Right Colic) Flexure Curve */}
        <path
          d="M -66 82 C -66 60 -45 58 -30 58"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
        />

        {/* Transverse Colon (Arching across upper abdomen) */}
        <path
          d="M -35 58 C 0 65 35 62 60 58"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
        />

        {/* Splenic (Left Colic) Flexure Curve */}
        <path
          d="M 55 58 C 72 58 72 75 72 90"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
        />

        {/* Descending Colon (Downward left side of patient = right on viewer) */}
        <path
          d="M 72 85 L 72 160"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
        />

        {/* Sigmoid Colon (S-shaped curve into pelvis) */}
        <path
          d="M 72 155 C 72 180 35 185 20 195 C 10 202 5 210 5 220"
          stroke={isPaperMode ? '#94A3B8' : '#D97706'}
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />

        {/* Rectum (Straight pelvic terminal pouch) */}
        <path
          d="M 5 218 L 5 248"
          stroke={isPaperMode ? '#64748B' : '#B45309'}
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />

        {/* Anal Canal & External Sphincter */}
        <ellipse cx="5" cy="254" rx="7" ry="4" fill={isPaperMode ? '#000000' : '#78350F'} stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />

        {/* Haustra (Colon Sacculations / pouches) Outer Contours */}
        <g stroke={isPaperMode ? '#000000' : '#78350F'} strokeWidth={1.5} fill="none">
          {/* Ascending haustra notches */}
          {[135, 115, 95, 75].map((yN, nIdx) => (
            <path key={`haustra-asc-${nIdx}`} d={`M -75 ${yN} Q -66 ${yN - 4} -57 ${yN}`} />
          ))}
          {/* Transverse haustra notches */}
          {[-25, -5, 15, 35, 50].map((xN, nIdx) => (
            <path key={`haustra-tr-${nIdx}`} d={`M ${xN} 50 Q ${xN + 4} 60 ${xN} 68`} />
          ))}
          {/* Descending haustra notches */}
          {[95, 115, 135, 155].map((yN, nIdx) => (
            <path key={`haustra-desc-${nIdx}`} d={`M 63 ${yN} Q 72 ${yN - 4} 81 ${yN}`} />
          ))}
        </g>

        {/* Taenia Coli (Longitudinal muscle band along colon) */}
        <path
          d="M -66 150 L -66 75 C -66 60 -45 58 -30 58 C 0 65 35 62 60 58 C 72 58 72 75 72 90 L 72 160 C 72 180 35 185 20 195"
          stroke={isPaperMode ? '#000000' : '#FDE68A'}
          strokeWidth={1.5}
          fill="none"
        />
      </g>
    </g>
  );
};

/**
 * High-Resolution Stomach & Gastric Anatomy Diagram
 * Modeled on gastroenterology textbooks (esophagus, cardiac sphincter, fundus, body, rugae folds, pyloric antrum, pylorus, duodenum)
 */
export const HumanStomachDigestiveDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="stomach-anatomy-group" transform="translate(-10, -10)">
      {/* 1. Esophagus Tube entering stomach */}
      <path
        d="M -70 -130 L -70 -70 L -45 -70 L -45 -130"
        fill={isPaperMode ? '#FFFFFF' : '#E11D48'}
        stroke={isPaperMode ? '#000000' : '#FB7185'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />
      {/* Lower Esophageal (Cardiac) Sphincter ring */}
      <ellipse cx="-57" cy="-70" rx="14" ry="5" fill="none" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} strokeDasharray="3 2" />

      {/* 2. J-Shaped Stomach Wall (Greater and Lesser Curvatures) */}
      <path
        d="M -45 -70 
           C -20 -115 65 -115 85 -70 
           C 105 -25 125 45 105 110 
           C 85 165 -15 175 -85 140 
           C -135 115 -145 70 -125 20 
           C -110 -15 -60 -10 -45 -30 
           C -35 -45 -40 -60 -45 -70 Z"
        fill={isPaperMode ? '#FFFFFF' : '#9F1239'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#FB7185'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* 3. Prominent Interior Gastric Rugae Mucosal Folds (Wavy folds inside stomach body) */}
      <g stroke={isPaperMode ? '#000000' : '#FECDD3'} strokeWidth={isPaperMode ? 2 : 2.5} fill="none" strokeLinecap="round">
        <path d="M 50 -60 Q 60 -10 40 40 Q 20 90 35 130" />
        <path d="M 20 -40 Q 30 0 10 50 Q -10 100 0 135" />
        <path d="M -10 -20 Q 0 20 -20 60 Q -40 100 -35 130" />
        <path d="M -40 10 Q -30 40 -50 70 Q -70 100 -70 120" />
      </g>

      {/* 4. Pyloric Antrum and Pyloric Sphincter Valve */}
      <g id="pylorus" transform="translate(-105, 55)">
        <ellipse cx="0" cy="0" rx="8" ry="16" fill={isPaperMode ? '#F1F5F9' : '#F43F5E'} stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />
      </g>

      {/* 5. C-shaped Duodenum (Beginning of Small Intestine) */}
      <path
        d="M -105 40 
           C -155 35 -180 80 -160 125 
           C -140 160 -80 170 -60 170"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#F59E0B'}
        strokeWidth={isPaperMode ? 6 : 8}
      />
    </g>
  );
};

/**
 * High-Resolution Skin Cross-Section (Integumentary System)
 * Modeled on histology textbooks (epidermis, dermis, hypodermis, hair follicle, sebaceous gland, sweat gland, arrector pili, sensory nerve)
 */
export const SkinCrossSectionDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="skin-cross-section-group" transform="translate(0, 0)">
      {/* 1. Three Main Tissue Blocks */}
      {/* Subcutaneous Hypodermis (Adipose tissue) */}
      <rect
        x="-220"
        y="60"
        width="440"
        height="90"
        fill={isPaperMode ? '#FFFFFF' : '#78350F'}
        fillOpacity={isPaperMode ? 1 : 0.8}
        stroke={isPaperMode ? '#000000' : '#F59E0B'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      {/* Fat Lobules in Hypodermis */}
      {!isPaperMode && (
        <g fill="#FDE68A" opacity="0.4">
          <circle cx="-160" cy="95" r="14" />
          <circle cx="-135" cy="115" r="12" />
          <circle cx="-100" cy="90" r="15" />
          <circle cx="80" cy="100" r="16" />
          <circle cx="115" cy="115" r="13" />
          <circle cx="150" cy="95" r="14" />
        </g>
      )}

      {/* Dermis (Dense irregular connective tissue with blood vessels) */}
      <rect
        x="-220"
        y="-60"
        width="440"
        height="120"
        fill={isPaperMode ? '#FFFFFF' : '#831843'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#F472B6'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Epidermis (Stratified squamous epithelium with undulating dermal papillae) */}
      <path
        d="M -220 -60 
           Q -200 -70 -180 -60 Q -160 -70 -140 -60 Q -120 -70 -100 -60 
           Q -80 -70 -60 -60 Q -40 -70 -20 -60 Q 0 -70 20 -60 
           Q 40 -70 60 -60 Q 80 -70 100 -60 Q 120 -70 140 -60 
           Q 160 -70 180 -60 Q 200 -70 220 -60 
           L 220 -100 L -220 -100 Z"
        fill={isPaperMode ? '#F1F5F9' : '#BE185D'}
        stroke={isPaperMode ? '#000000' : '#FDA4AF'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* Stratum Corneum (Keratinized top boundary) */}
      <line x1="-220" y1="-100" x2="220" y2="-100" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={3} />

      {/* 2. Deep Hair Follicle with Shaft & Root Bulb */}
      <g id="hair-follicle" transform="translate(-40, 0)">
        {/* Hair Shaft projecting outward through skin */}
        <line x1="0" y1="-140" x2="35" y2="75" stroke={isPaperMode ? '#000000' : '#1E293B'} strokeWidth={isPaperMode ? 4 : 5} />
        {/* Hair Follicle Sheath */}
        <path
          d="M -10 -85 L 20 65 Q 35 95 50 65 L 20 -85 Z"
          fill={isPaperMode ? '#FFFFFF' : '#047857'}
          stroke={isPaperMode ? '#000000' : '#34D399'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Hair Bulb & Dermal Papilla at base */}
        <circle cx="35" cy="75" r="14" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={2} />

        {/* Sebaceous Oil Gland (Multilobed gland attached to follicle) */}
        <path
          d="M 12 -20 C -15 -35 -20 0 10 5 Z"
          fill={isPaperMode ? '#FFFFFF' : '#F59E0B'}
          stroke={isPaperMode ? '#000000' : '#FDE68A'}
          strokeWidth={isPaperMode ? 1.75 : 2}
        />

        {/* Arrector Pili Smooth Muscle (Pulls hair upright for goosebumps) */}
        <path
          d="M 15 15 Q -25 0 -60 -45"
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={isPaperMode ? 3 : 4}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 3. Coiled Eccrine Sweat Gland */}
      <g id="sweat-gland" transform="translate(120, 0)">
        {/* Coiled Tubular Body in Deep Dermis */}
        <path
          d="M 0 50 Q 15 40 10 65 Q 25 75 0 80 Q -20 70 -5 55 Q -25 45 0 50"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#06B6D4'}
          strokeWidth={isPaperMode ? 3 : 4}
        />
        {/* Long Excretory Duct to Surface Pore */}
        <path
          d="M 0 50 Q -10 10 5 -20 Q -5 -50 0 -100"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
      </g>

      {/* 4. Sensory Pacinian / Meissner Tactile Corpuscle */}
      <g transform="translate(-140, 25)">
        <ellipse cx="0" cy="0" rx="14" ry="20" fill={isPaperMode ? '#FFFFFF' : '#8B5CF6'} stroke={isPaperMode ? '#000000' : '#C4B5FD'} strokeWidth={2} />
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="none" stroke={isPaperMode ? '#94A3B8' : '#EDE9FE'} strokeWidth={1.5} />
        <line x1="0" y1="20" x2="0" y2="60" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={1.5} />
      </g>
    </g>
  );
};

/**
 * High-Resolution Human Ear Anatomy Diagram
 * Modeled on otolaryngology textbooks (pinna, ear canal, tympanic membrane, malleus, incus, stapes, cochlea, semicircular canals)
 */
export const HumanEarDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-ear-group" transform="translate(-40, 0)">
      {/* 1. Outer Ear (Pinna / Auricle) */}
      <path
        d="M -160 -110 
           C -220 -90 -230 30 -195 85 
           C -175 120 -145 130 -140 100 
           C -135 80 -150 70 -160 50 
           C -175 20 -160 -50 -130 -60 
           C -110 -65 -115 -85 -140 -100 Z"
        fill={isPaperMode ? '#FFFFFF' : '#BE185D'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#FB7185'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 2. External Acoustic Meatus (Ear Canal) */}
      <path
        d="M -130 -40 C -80 -45 -50 -35 -20 -35 L -20 5 C -50 5 -80 -5 -130 -10 Z"
        fill={isPaperMode ? '#FFFFFF' : '#475569'}
        stroke={isPaperMode ? '#000000' : '#94A3B8'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* 3. Tympanic Membrane (Eardrum) */}
      <line
        x1="-20"
        y1="-42"
        x2="-10"
        y2="12"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 3.5 : 4.5}
      />

      {/* 4. Middle Ear Cavity & Auditory Ossicles (Hammer, Anvil, Stirrup) */}
      {/* Malleus (Hammer) */}
      <line x1="-15" y1="-20" x2="5" y2="-35" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" />
      {/* Incus (Anvil) */}
      <path d="M 5 -35 L 25 -30 L 20 -15 Z" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#FDE68A'} strokeWidth={1.5} />
      {/* Stapes (Stirrup sitting on Oval Window) */}
      <path d="M 20 -15 L 38 -18 L 38 -10 Z" fill="none" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={2.5} />

      {/* Eustachian Tube (Auditory tube descending to pharynx) */}
      <path d="M 10 20 L 40 75" stroke={isPaperMode ? '#000000' : '#E2E8F0'} strokeWidth={isPaperMode ? 3 : 4} fill="none" />

      {/* 5. Inner Ear (Bony Labyrinth: Cochlea & Semicircular Canals) */}
      {/* Semicircular Canals (Three orthogonal balance loops) */}
      <g stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 3 : 4} fill="none">
        {/* Superior Canal Loop */}
        <path d="M 45 -25 C 45 -70 85 -70 85 -25" />
        {/* Posterior Canal Loop */}
        <path d="M 85 -25 C 115 -25 115 15 85 15" />
        {/* Lateral Horizontal Canal Loop */}
        <path d="M 50 -10 C 80 -10 80 15 50 15" />
      </g>

      {/* Cochlea (Fluid-filled snail-shell spiral) */}
      <g id="cochlea" transform="translate(65, 30)">
        <path
          d="M 0 0 
             A 22 22 0 1 1 20 -10 
             A 14 14 0 1 1 15 -22 
             A 8 8 0 1 1 12 -28"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#06B6D4'}
          strokeWidth={isPaperMode ? 5 : 7}
          strokeLinecap="round"
        />
      </g>

      {/* Vestibulocochlear Nerve (CN VIII) passing to brainstem */}
      <path
        d="M 90 20 Q 140 15 190 20"
        stroke={isPaperMode ? '#000000' : '#FDE047'}
        strokeWidth={isPaperMode ? 4 : 5.5}
        fill="none"
      />
    </g>
  );
};

/**
 * High-Resolution Angiosperm Flower Reproductive Anatomy
 * Modeled on botany textbooks (pedicel, receptacle, sepal, petal, stamen: filament + anther, carpel/pistil: stigma, style, ovary with ovules)
 */
export const FlowerAnatomyDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="flower-anatomy-group" transform="translate(0, 10)">
      {/* 1. Stem (Pedicel) and Receptacle */}
      <path d="M 0 170 L 0 100" stroke={isPaperMode ? '#000000' : '#15803D'} strokeWidth={isPaperMode ? 6 : 8} strokeLinecap="round" />
      {/* Swollen Receptacle base */}
      <path
        d="M -35 100 C -35 70 35 70 35 100 Z"
        fill={isPaperMode ? '#FFFFFF' : '#16A34A'}
        stroke={isPaperMode ? '#000000' : '#4ADE80'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* 2. Green Calyx Sepals */}
      <path d="M -35 90 C -75 75 -95 50 -100 25 C -75 55 -45 70 -25 85 Z" fill={isPaperMode ? '#FFFFFF' : '#15803D'} stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={2} />
      <path d="M 35 90 C 75 75 95 50 100 25 C 75 55 45 70 25 85 Z" fill={isPaperMode ? '#FFFFFF' : '#15803D'} stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={2} />

      {/* 3. Vibrant Petals (Corolla) */}
      {/* Left Petal */}
      <path
        d="M -25 80 C -120 50 -160 -50 -120 -110 C -70 -70 -40 -10 -15 40 Z"
        fill={isPaperMode ? '#FFFFFF' : '#E11D48'}
        fillOpacity={isPaperMode ? 1 : 0.8}
        stroke={isPaperMode ? '#000000' : '#FB7185'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />
      {/* Right Petal */}
      <path
        d="M 25 80 C 120 50 160 -50 120 -110 C 70 -70 40 -10 15 40 Z"
        fill={isPaperMode ? '#FFFFFF' : '#E11D48'}
        fillOpacity={isPaperMode ? 1 : 0.8}
        stroke={isPaperMode ? '#000000' : '#FB7185'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 4. Central Female Carpel / Pistil (Stigma, Style, Ovary) */}
      {/* Swollen Ovary at base */}
      <path
        d="M -25 75 C -30 35 -15 15 -10 5 L 10 5 C 15 15 30 35 25 75 Z"
        fill={isPaperMode ? '#FFFFFF' : '#F59E0B'}
        stroke={isPaperMode ? '#000000' : '#FDE68A'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />
      {/* Ovules inside Ovary Chamber */}
      <circle cx="-8" cy="45" r="6" fill={isPaperMode ? '#000000' : '#FEF3C7'} stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth={1.5} />
      <circle cx="8" cy="45" r="6" fill={isPaperMode ? '#000000' : '#FEF3C7'} stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth={1.5} />

      {/* Style Neck */}
      <path d="M -7 5 L -7 -70 L 7 -70 L 7 5 Z" fill={isPaperMode ? '#FFFFFF' : '#84CC16'} stroke={isPaperMode ? '#000000' : '#BEF264'} strokeWidth={isPaperMode ? 2 : 2.5} />

      {/* Sticky Lobed Stigma at top */}
      <path
        d="M -16 -75 C -16 -90 0 -90 0 -75 C 0 -90 16 -90 16 -75 Z"
        fill={isPaperMode ? '#000000' : '#65A30D'}
        stroke={isPaperMode ? '#000000' : '#A3E635'}
        strokeWidth={2}
      />

      {/* 5. Male Stamens (Filament stalk + Bilobed Pollen Anther) */}
      {/* Left Stamen */}
      <path d="M -18 70 Q -65 10 -55 -60" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" />
      <ellipse cx="-55" cy="-65" rx="9" ry="6" fill={isPaperMode ? '#000000' : '#EAB308'} stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth={1.5} />

      {/* Right Stamen */}
      <path d="M 18 70 Q 65 10 55 -60" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" />
      <ellipse cx="55" cy="-65" rx="9" ry="6" fill={isPaperMode ? '#000000' : '#EAB308'} stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth={1.5} />
    </g>
  );
};

/**
 * High-Resolution T4 Bacteriophage Virus Diagram
 * Modeled on virology textbooks (icosahedral capsid head, packaged DNA, collar, contractile tail sheath, baseplate, tail fibers)
 */
export const BacteriophageDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="bacteriophage-group" transform="translate(0, -10)">
      {/* 1. Icosahedral Capsid Head (Facetted polygon enclosing genome) */}
      <polygon
        points="0,-160 55,-130 55,-60 0,-30 -55,-60 -55,-130"
        fill={isPaperMode ? '#FFFFFF' : '#4F46E5'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#818CF8'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />
      {/* Inner facet crease lines */}
      <line x1="0" y1="-160" x2="0" y2="-30" stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={isPaperMode ? 1.75 : 2} />
      <line x1="-55" y1="-130" x2="0" y2="-95" stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={isPaperMode ? 1.75 : 2} />
      <line x1="55" y1="-130" x2="0" y2="-95" stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={isPaperMode ? 1.75 : 2} />
      <line x1="-55" y1="-60" x2="0" y2="-95" stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={isPaperMode ? 1.75 : 2} />
      <line x1="55" y1="-60" x2="0" y2="-95" stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={isPaperMode ? 1.75 : 2} />

      {/* Packaged Viral DNA Strand inside Capsid */}
      <path
        d="M -25 -115 Q 0 -130 20 -115 Q 30 -90 0 -80 Q -30 -70 15 -50"
        fill="none"
        stroke={isPaperMode ? '#000000' : '#F43F5E'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 2. Collar Neck with Whisker appendages */}
      <rect x="-18" y="-30" width="36" height="10" rx="3" fill={isPaperMode ? '#000000' : '#4338CA'} stroke={isPaperMode ? '#000000' : '#C7D2FE'} strokeWidth={1.5} />

      {/* 3. Contractile Tail Sheath (Ribbed cylindrical sleeve) */}
      <rect x="-14" y="-20" width="28" height="85" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2.5 : 3} />
      {/* Sheath Striations (Annular rings) */}
      {[-10, 0, 10, 20, 30, 40, 50].map((sy) => (
        <line key={`sheath-${sy}`} x1="-14" y1={sy} x2="14" y2={sy} stroke={isPaperMode ? '#000000' : '#BAE6FD'} strokeWidth={1.75} />
      ))}

      {/* 4. Hexagonal Baseplate with Spikes */}
      <polygon points="-24,65 24,65 30,75 -30,75" fill={isPaperMode ? '#000000' : '#0369A1'} stroke={isPaperMode ? '#000000' : '#7DD3FC'} strokeWidth={2} />
      <line x1="-15" y1="75" x2="-15" y2="82" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />
      <line x1="0" y1="75" x2="0" y2="84" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />
      <line x1="15" y1="75" x2="15" y2="82" stroke={isPaperMode ? '#000000' : '#FDE047'} strokeWidth={2} />

      {/* 5. Jointed Tail Fibers (Spider legs for bacterial host adsorption) */}
      <g stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" strokeLinecap="round">
        {/* Left Fiber 1 */}
        <path d="M -24 70 Q -65 75 -90 120 L -120 150" />
        {/* Left Fiber 2 */}
        <path d="M -20 72 Q -50 90 -75 135 L -85 160" />
        {/* Right Fiber 1 */}
        <path d="M 24 70 Q 65 75 90 120 L 120 150" />
        {/* Right Fiber 2 */}
        <path d="M 20 72 Q 50 90 75 135 L 85 160" />
      </g>
    </g>
  );
};

/**
 * High-Resolution Volcano Cross-Section Diagram
 * Modeled on geology textbooks (magma chamber, main vent, conduit, sill, dike, crater, ash cloud, lava strata layers)
 */
export const VolcanoCrossSectionDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="volcano-cross-section-group" transform="translate(0, 0)">
      {/* 1. Underlying Sedimentary Rock Strata Beds */}
      <g stroke={isPaperMode ? '#000000' : '#475569'} strokeWidth={1}>
        <rect x="-240" y="80" width="480" height="35" fill={isPaperMode ? '#F8FAFC' : '#334155'} />
        <rect x="-240" y="115" width="480" height="35" fill={isPaperMode ? '#F1F5F9' : '#1E293B'} />
        <rect x="-240" y="150" width="480" height="40" fill={isPaperMode ? '#E2E8F0' : '#0F172A'} />
      </g>

      {/* 2. Composite Stratovolcano Mountain Slopes (Alternating lava & tephra beds) */}
      <polygon
        points="-230,80 -60,-65 60,-65 230,80"
        fill={isPaperMode ? '#FFFFFF' : '#78350F'}
        stroke={isPaperMode ? '#000000' : '#B45309'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 3. Magma Chamber (Subterranean molten pluton) */}
      <ellipse
        cx="0"
        cy="150"
        rx="95"
        ry="35"
        fill={isPaperMode ? '#000000' : '#DC2626'}
        stroke={isPaperMode ? '#000000' : '#F87171'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* 4. Central Conduit (Main Pipe) */}
      <path
        d="M -15 150 L -15 -60 L 15 -60 L 15 150 Z"
        fill={isPaperMode ? '#000000' : '#EF4444'}
        stroke={isPaperMode ? '#000000' : '#FCA5A5'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Lateral Intrusions: Horizontal Sill & Vertical Dike */}
      {/* Horizontal Sill spreading into strata */}
      <path d="M 15 100 L 120 100 L 120 112 L 15 112 Z" fill={isPaperMode ? '#000000' : '#EA580C'} />
      {/* Branch Pipe / Secondary Conduit */}
      <path d="M 15 25 L 110 -15" stroke={isPaperMode ? '#000000' : '#EA580C'} strokeWidth={isPaperMode ? 5 : 7} fill="none" />
      {/* Parasitic Cone on Flank */}
      <polygon points="90,-10 115,-30 140,-10" fill={isPaperMode ? '#FFFFFF' : '#92400E'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={2} />

      {/* 5. Summit Crater and Eruptive Column Plume (Ash cloud & volcanic bombs) */}
      <ellipse cx="0" cy="-65" rx="25" ry="8" fill={isPaperMode ? '#F1F5F9' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={2} />

      {/* Explosive Ash Cloud Plume */}
      <path
        d="M -20 -70 
           C -45 -95 -80 -105 -75 -135 
           C -70 -165 -30 -185 0 -180 
           C 30 -185 70 -165 75 -135 
           C 80 -105 45 -95 20 -70 Z"
        fill={isPaperMode ? '#F1F5F9' : '#64748B'}
        fillOpacity={isPaperMode ? 0.7 : 0.85}
        stroke={isPaperMode ? '#000000' : '#CBD5E1'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* Lava Flows cascading down flanks */}
      <path d="M -25 -65 Q -65 -20 -95 40" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 4 : 5} fill="none" />
      <path d="M 25 -65 Q 65 -20 85 20" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 4 : 5} fill="none" />
    </g>
  );
};

/**
 * 21. High-Resolution Euglena Viridis / Gracilis Diagram
 * Authentically modeled on authoritative cytology reference diagrams (Science Facts / Campbell Biology / Modern Cytology):
 * - Spindle-shaped fusiform body with anterior reservoir/cytostome at the TOP and tapered pointed apex at the posterior base.
 * - Outer Pellicle & Plasma Membrane in biological green with pellicular helical striations.
 * - Prominent, long whip-like locomotory Flagellum emerging from the anterior reservoir and sweeping upwards and outwards with undulating waves and mastigoneme hairlets.
 * - Short non-emergent second flagellum and basal bodies (blepharoplasts) inside the reservoir.
 * - Photoreceptor (Paraflagellar body) & red carotenoid Eyespot (Stigma) at the anterior reservoir.
 * - Pulsatile Contractile Vacuole with star-like radiating collecting canals.
 * - Prominent circular rose-pink Nucleus with dense central magenta Nucleolus.
 * - Rough & Smooth Endoplasmic Reticulum, stacked Golgi cisternae, Lysosomes, and Ribosomes.
 * - Lobed Chloroplasts with pyrenoids, dark purple Paramylon reserve grains, and Mitochondria with cristae.
 */
export const EuglenaDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="euglena-diagram-group" transform="translate(0, 0)">
      {/* 1. Emergent Long Whiplash Flagellum (Extending from basal body inside anterior reservoir, through cytostome aperture, sweeping high and gracefully across the left canvas) */}
      <g id="euglena-flagellum">
        {/* Glow / Outer contrast boundary for 100% visibility in both dark mode & paper print */}
        <path
          d="M 16 -115 C 14 -138 12 -158 8 -178 C 0 -215 -25 -255 -75 -275 C -135 -295 -195 -265 -225 -205 C -250 -145 -235 -70 -190 -8 C -145 50 -90 92 -38 118 C -15 130 5 130 18 118"
          stroke={isPaperMode ? '#000000' : '#042F1A'}
          strokeWidth={isPaperMode ? 8 : 9.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Primary vibrant flagellar axoneme (9+2 microtubule core) */}
        <path
          d="M 16 -115 C 14 -138 12 -158 8 -178 C 0 -215 -25 -255 -75 -275 C -135 -295 -195 -265 -225 -205 C -250 -145 -235 -70 -190 -8 C -145 50 -90 92 -38 118 C -15 130 5 130 18 118"
          stroke={isPaperMode ? '#000000' : '#10B981'}
          strokeWidth={isPaperMode ? 4.5 : 5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* High-visibility inner luminescent core filament */}
        {!isPaperMode ? (
          <path
            d="M 16 -115 C 14 -138 12 -158 8 -178 C 0 -215 -25 -255 -75 -275 C -135 -295 -195 -265 -225 -205 C -250 -145 -235 -70 -190 -8 C -145 50 -90 92 -38 118 C -15 130 5 130 18 118"
            stroke="#6EE7B7"
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 16 -115 C 14 -138 12 -158 8 -178 C 0 -215 -25 -255 -75 -275 C -135 -295 -195 -265 -225 -205 C -250 -145 -235 -70 -190 -8 C -145 50 -90 92 -38 118 C -15 130 5 130 18 118"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Lateral Mastigoneme Hairlet filaments along the undulating curve */}
        <g stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth={isPaperMode ? 1.5 : 1.75} opacity={isPaperMode ? 0.8 : 0.85}>
          {[
            { x1: -25, y1: -230, x2: -35, y2: -246 },
            { x1: -55, y1: -258, x2: -65, y2: -276 },
            { x1: -90, y1: -275, x2: -102, y2: -294 },
            { x1: -130, y1: -280, x2: -145, y2: -298 },
            { x1: -168, y1: -268, x2: -185, y2: -282 },
            { x1: -202, y1: -238, x2: -222, y2: -248 },
            { x1: -224, y1: -195, x2: -245, y2: -200 },
            { x1: -230, y1: -150, x2: -252, y2: -150 },
            { x1: -220, y1: -105, x2: -242, y2: -100 },
            { x1: -198, y1: -60, x2: -218, y2: -52 },
            { x1: -168, y1: -20, x2: -186, y2: -8 },
            { x1: -132, y1: 18, x2: -148, y2: 32 },
            { x1: -92, y1: 58, x2: -106, y2: 74 },
            { x1: -54, y1: 94, x2: -66, y2: 112 }
          ].map((m, mIdx) => (
            <line key={`mastigoneme-${mIdx}`} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} />
          ))}
        </g>
      </g>

      {/* 2. Main Fusiform Cell Body: Rounded anterior lobes with gullet at top, tapering to posterior apex */}
      {/* Outer Pellicle Envelope */}
      <path
        d="M 0 220 
           C -24 185 -48 135 -58 75 
           C -68 10 -62 -65 -48 -115 
           C -38 -145 -24 -170 -12 -176 
           C -2 -180 6 -172 8 -155 
           C 10 -138 18 -138 20 -155 
           C 22 -172 28 -178 36 -172 
           C 48 -160 54 -135 60 -105 
           C 72 -50 70 10 58 70 
           C 42 135 20 185 0 220 Z"
        fill={isPaperMode ? '#F8FAFC' : '#86EFAC'}
        fillOpacity={isPaperMode ? 1 : 0.94}
        stroke={isPaperMode ? '#000000' : '#166534'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* Plasma Membrane (Concentric Inner Boundary) */}
      <path
        d="M 0 212 
           C -20 178 -42 130 -52 72 
           C -60 10 -55 -62 -42 -110 
           C -32 -138 -18 -160 -8 -166 
           C 0 -170 6 -163 8 -148 
           C 10 -134 18 -134 20 -148 
           C 22 -163 26 -168 32 -163 
           C 42 -152 48 -128 54 -100 
           C 65 -48 64 12 52 70 
           C 38 132 18 180 0 212 Z"
        fill={isPaperMode ? '#F1F5F9' : '#BBF7D0'}
        fillOpacity={isPaperMode ? 1 : 0.88}
        stroke={isPaperMode ? '#475569' : '#22C55E'}
        strokeWidth={isPaperMode ? 1.5 : 1.75}
      />

      {/* Pellicular Helical Striations (Faint diagonal interlocking protein strips) */}
      <g opacity={isPaperMode ? 0.35 : 0.3}>
        {[-140, -110, -70, -30, 10, 50, 90, 130, 170].map((yOff, sIdx) => (
          <path
            key={`pellicle-strip-${sIdx}`}
            d={`M -50 ${yOff - 20} Q 0 ${yOff - 10} 50 ${yOff + 15}`}
            stroke={isPaperMode ? '#000000' : '#15803D'}
            strokeWidth={1.2}
            strokeDasharray="4 3"
            fill="none"
          />
        ))}
      </g>

      {/* 3. Anterior Cytostome (Gullet) & Flask-Shaped Reservoir (Ampulla) at the Apex */}
      <path
        d="M 6 -155 C 2 -145 4 -125 12 -115 C 20 -105 28 -108 32 -120 C 36 -132 34 -148 24 -155 Z"
        fill={isPaperMode ? '#CBD5E1' : '#DCFCE7'}
        fillOpacity={isPaperMode ? 1 : 0.95}
        stroke={isPaperMode ? '#000000' : '#16A34A'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Basal Blepharoplasts / Kinetosomes at floor of reservoir */}
      <circle cx="16" cy="-115" r="3" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
      <circle cx="26" cy="-115" r="2.5" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />

      {/* Short non-emergent second flagellum root inside reservoir */}
      <path
        d="M 26 -115 C 24 -123 25 -131 26 -137"
        stroke={isPaperMode ? '#000000' : '#15803D'}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />

      {/* Main flagellum intra-reservoir root connecting basal body to cytostome */}
      <path
        d="M 16 -115 C 15 -128 14 -142 12 -155"
        stroke={isPaperMode ? '#000000' : '#15803D'}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Photoreceptor / Paraflagellar Body (Amber swelling on flagellar root) */}
      <ellipse
        cx="14"
        cy="-126"
        rx="4"
        ry="5"
        transform="rotate(15, 14, -126)"
        fill={isPaperMode ? '#000000' : '#EA580C'}
        stroke={isPaperMode ? '#000000' : '#FED7AA'}
        strokeWidth={1.25}
      />

      {/* 5. Eyespot / Stigma (Red carotenoid pigment granules on wall of reservoir) */}
      <g id="euglena-eyespot" transform="translate(4, -120)">
        <ellipse cx="0" cy="0" rx="7" ry="10" fill={isPaperMode ? '#000000' : '#DC2626'} stroke={isPaperMode ? '#000000' : '#FCA5A5'} strokeWidth={1} />
        {!isPaperMode ? (
          <g fill="#EF4444">
            <circle cx="-2" cy="-3" r="1.8" />
            <circle cx="1.5" cy="-2" r="1.6" />
            <circle cx="-1" cy="1.5" r="2" />
            <circle cx="2" cy="3" r="1.5" />
            <circle cx="-2" cy="4" r="1.3" />
          </g>
        ) : (
          <g fill="#FFFFFF">
            <circle cx="-2" cy="-3" r="1.3" />
            <circle cx="1.5" cy="-2" r="1.1" />
            <circle cx="-1" cy="1.5" r="1.3" />
            <circle cx="2" cy="3" r="1.1" />
          </g>
        )}
      </g>

      {/* 6. Osmoregulatory Contractile Vacuole with Star-Like Collecting Canals */}
      <g id="euglena-contractile-vacuole" transform="translate(-24, -100)">
        {/* Radiating star canaliculi ampullae */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, cIdx) => (
          <line
            key={`canal-${cIdx}`}
            x1="0"
            y1="0"
            x2={Math.cos((angle * Math.PI) / 180) * 15}
            y2={Math.sin((angle * Math.PI) / 180) * 15}
            stroke={isPaperMode ? '#000000' : '#38BDF8'}
            strokeWidth={isPaperMode ? 1.5 : 1.75}
            strokeLinecap="round"
          />
        ))}
        {/* Central contractile vacuole vesicle */}
        <circle
          cx="0"
          cy="0"
          r="9.5"
          fill={isPaperMode ? '#FFFFFF' : '#E0F2FE'}
          stroke={isPaperMode ? '#000000' : '#0284C7'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {!isPaperMode && (
          <circle cx="-2.5" cy="-2.5" r="2.5" fill="#FFFFFF" fillOpacity={0.7} />
        )}
      </g>

      {/* 7. Chloroplasts (Lobed emerald green plastids with central purple paramylon cores) */}
      {[
        { x: -32, y: -60, rot: -20, scale: 0.95 },
        { x: 32, y: -60, rot: 20, scale: 0.95 },
        { x: -40, y: -10, rot: -15, scale: 1.05 },
        { x: 40, y: -10, rot: 15, scale: 1.05 },
        { x: -35, y: 55, rot: -25, scale: 1.0 },
        { x: 35, y: 55, rot: 25, scale: 1.0 },
        { x: -25, y: 110, rot: -15, scale: 0.9 },
        { x: 25, y: 110, rot: 15, scale: 0.9 },
        { x: 0, y: 165, rot: 5, scale: 0.85 }
      ].map((cp, cIdx) => (
        <g key={`chloroplast-${cIdx}`} transform={`translate(${cp.x}, ${cp.y}) rotate(${cp.rot}) scale(${cp.scale})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="20"
            ry="11"
            fill={isPaperMode ? '#334155' : '#16A34A'}
            stroke={isPaperMode ? '#000000' : '#14532D'}
            strokeWidth={isPaperMode ? 1.5 : 2}
          />
          {/* Internal thylakoid bands */}
          <path d="M -13 -3 Q 0 -5 13 -3" stroke={isPaperMode ? '#FFFFFF' : '#86EFAC'} strokeWidth={1} fill="none" opacity={0.6} />
          <path d="M -13 3 Q 0 5 13 3" stroke={isPaperMode ? '#FFFFFF' : '#86EFAC'} strokeWidth={1} fill="none" opacity={0.6} />
          {/* Central Paramylon / Pyrenoid Center (Purple) */}
          <circle
            cx="0"
            cy="0"
            r="4.5"
            fill={isPaperMode ? '#FFFFFF' : '#7C3AED'}
            stroke={isPaperMode ? '#000000' : '#581C87'}
            strokeWidth={1.2}
          />
          <circle
            cx="0"
            cy="0"
            r="2"
            fill={isPaperMode ? '#000000' : '#4C1D95'}
          />
        </g>
      ))}

      {/* 8. Central Rose-Pink Nucleus with Dense Spherical Nucleolus */}
      <g id="euglena-nucleus" transform="translate(0, 0)">
        {/* Double-membrane nuclear envelope */}
        <circle
          cx="0"
          cy="0"
          r="34"
          fill={isPaperMode ? '#E2E8F0' : '#FDA4AF'}
          fillOpacity={isPaperMode ? 1 : 0.9}
          stroke={isPaperMode ? '#000000' : '#E11D48'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Nuclear chromatin stipples */}
        <g opacity={isPaperMode ? 0.4 : 0.6}>
          {[-18, -10, 0, 10, 18].map((xP, i) => (
            <circle key={`chromatin-${i}`} cx={xP} cy={((i % 2) ? -10 : 10)} r={1.5} fill={isPaperMode ? '#000000' : '#9F1239'} />
          ))}
        </g>
        {/* Dense central spherical Nucleolus (rRNA synthesis site) */}
        <circle
          cx="0"
          cy="0"
          r="14"
          fill={isPaperMode ? '#000000' : '#D946EF'}
          stroke={isPaperMode ? '#000000' : '#A21CAF'}
          strokeWidth={isPaperMode ? 1.5 : 2}
        />
        {!isPaperMode && (
          <circle cx="-3" cy="-3" r="3.5" fill="#F0ABFC" fillOpacity={0.7} />
        )}
      </g>

      {/* 9. Distinct Paramylon Reserve Granules (Crystalline β-1,3-glucan carbohydrate storage) */}
      {[
        { x: -14, y: -26, rx: 8, ry: 5, rot: 10 },
        { x: 26, y: -26, rx: 8, ry: 5, rot: -20 },
        { x: -12, y: 52, rx: 8, ry: 5, rot: 35 },
        { x: 18, y: 48, rx: 7, ry: 4.5, rot: -15 },
        { x: -16, y: 130, rx: 6.5, ry: 4, rot: 25 },
        { x: 16, y: 135, rx: 6.5, ry: 4, rot: -30 }
      ].map((pm, pIdx) => (
        <g key={`paramylon-grain-${pIdx}`} transform={`translate(${pm.x}, ${pm.y}) rotate(${pm.rot})`}>
          <ellipse
            cx="0"
            cy="0"
            rx={pm.rx}
            ry={pm.ry}
            fill={isPaperMode ? '#000000' : '#6B21A8'}
            stroke={isPaperMode ? '#000000' : '#C084FC'}
            strokeWidth={1.5}
          />
          {!isPaperMode && (
            <ellipse cx="-1.5" cy="-1" rx={pm.rx * 0.45} ry={pm.ry * 0.45} fill="#F3E8FF" fillOpacity={0.75} />
          )}
        </g>
      ))}

      {/* 10. Granular Cytoplasm (Ground cytosol matrix) */}
      <g opacity={isPaperMode ? 0.25 : 0.4} fill={isPaperMode ? '#000000' : '#14532D'}>
        <circle cx="-20" cy="-40" r="1.5" />
        <circle cx="20" cy="-40" r="1.5" />
        <circle cx="-25" cy="20" r="1.5" />
        <circle cx="22" cy="25" r="1.5" />
        <circle cx="-8" cy="80" r="1.5" />
        <circle cx="10" cy="85" r="1.5" />
        <circle cx="0" cy="140" r="1.5" />
      </g>
    </g>
  );
};

/**
 * High-Resolution Human Sperm (Spermatozoon / Male Gamete) Diagram
 * Modeled on classic reproductive biology and cytology textbooks (Bloom & Fawcett, Junqueira, Campbell):
 * - Head: Pyriform head, Acrosome cap covering anterior 2/3 with hyaluronidase/acrosin, condensed haploid nucleus (n=23) packaged with protamines, post-acrosomal sheath, plasma membrane envelope.
 * - Neck (Connecting piece): Articulating capitulum plate, transverse proximal centriole (donated to ovum for 1st mitotic spindle), distal centriole (axonemal basal body).
 * - Middle Piece (Midpiece / Pars Intermedia): Helical mitochondrial sheath (50-75 mitochondria wrapped spirally producing ATP for flagellar propulsion), 9 outer dense fibers (ODFs), central 9+2 axoneme.
 * - Annulus (Ring of Jensen): Septin-rich boundary ring locking mitochondria to midpiece.
 * - Principal Piece (Pars Principalis): Fibrous sheath with longitudinal columns and transverse semicircular ribs surrounding the 9+2 microtubule axoneme (dynein motors).
 * - End Piece (Pars Terminalis): Tapered terminal tip with bare axonemal microtubules.
 */
export const HumanSpermDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="human-sperm-diagram-group" transform="translate(0, 0)">
      {/* 1. PRINCIPAL PIECE & END PIECE TAIL WAVE */}
      {/* Glow aura in 3D mode */}
      {!isPaperMode && (
        <path
          d="M 0 -22 
             C 6 25 18 70 8 115 
             C -4 165 -22 205 -8 245 
             C 6 280 20 305 12 330"
          stroke="#38BDF8"
          strokeWidth="16"
          strokeOpacity="0.25"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Main Flagellar Tail / Fibrous Sheath (Principal piece from y = -22 down to y = 230) */}
      <path
        d="M 0 -22 
           C 6 25 18 70 8 115 
           C -4 165 -22 205 -8 245 
           C 6 280 20 305 12 330"
        stroke={isPaperMode ? '#000000' : '#0284C7'}
        strokeWidth={isPaperMode ? 6 : 7}
        strokeLinecap="round"
        fill="none"
      />

      {/* 9+2 Axoneme Central Microtubular Core inside tail */}
      <path
        d="M 0 -22 
           C 6 25 18 70 8 115 
           C -4 165 -22 205 -8 245 
           C 6 280 20 305 12 330"
        stroke={isPaperMode ? '#FFFFFF' : '#BAE6FD'}
        strokeWidth={isPaperMode ? 2.5 : 3}
        strokeLinecap="round"
        fill="none"
      />

      {/* Fibrous Sheath Transverse Ribbing Rings */}
      <g opacity={isPaperMode ? 0.7 : 0.85}>
        {[
          { y: 0, w: 10 }, { y: 20, w: 9 }, { y: 40, w: 9 }, { y: 60, w: 8.5 },
          { y: 80, w: 8 }, { y: 100, w: 7.5 }, { y: 120, w: 7 }, { y: 140, w: 6.5 },
          { y: 160, w: 6 }, { y: 180, w: 5.5 }, { y: 200, w: 5 }, { y: 220, w: 4.5 }
        ].map((rib, rIdx) => (
          <line
            key={`sperm-rib-${rIdx}`}
            x1={-rib.w / 2}
            y1={rib.y}
            x2={rib.w / 2}
            y2={rib.y}
            stroke={isPaperMode ? '#000000' : '#0369A1'}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* End Piece (Terminal bare axoneme segment) */}
      <path
        d="M -8 245 C 6 280 20 305 12 330"
        stroke={isPaperMode ? '#475569' : '#94A3B8'}
        strokeWidth={isPaperMode ? 2.5 : 3}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="330" r={isPaperMode ? 2 : 2.5} fill={isPaperMode ? '#000000' : '#64748B'} />

      {/* 2. MIDDLE PIECE (MIDPIECE / PARS INTERMEDIA) with Helical Mitochondrial Sheath */}
      {/* Midpiece Outer Column Body */}
      <rect
        x="-9"
        y="-90"
        width="18"
        height="68"
        rx="5"
        fill={isPaperMode ? '#FFFFFF' : '#FEF2F2'}
        stroke={isPaperMode ? '#000000' : '#DC2626'}
        strokeWidth={isPaperMode ? 2.5 : 3}
      />

      {/* Central Axoneme Running Through Midpiece */}
      <line
        x1="0"
        y1="-90"
        x2="0"
        y2="-22"
        stroke={isPaperMode ? '#94A3B8' : '#3B82F6'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Helical Mitochondrial Rings / Coils (Nebenkern Spiral generating ATP) */}
      {[-84, -74, -64, -54, -44, -34].map((my, mIdx) => (
        <g key={`mito-ring-${mIdx}`}>
          <ellipse
            cx="0"
            cy={my}
            rx="8.5"
            ry="4"
            fill={isPaperMode ? '#F1F5F9' : '#EF4444'}
            stroke={isPaperMode ? '#000000' : '#B91C1C'}
            strokeWidth={isPaperMode ? 1.5 : 2}
          />
          {!isPaperMode && (
            <ellipse cx="0" cy={my - 1} rx="6" ry="2" fill="#F87171" opacity="0.8" />
          )}
          {isPaperMode && (
            <line x1="-5" y1={my} x2="5" y2={my} stroke="#000000" strokeWidth="1" strokeDasharray="1 1" />
          )}
        </g>
      ))}

      {/* Annulus (Ring of Jensen) marking posterior boundary of midpiece */}
      <g id="sperm-annulus">
        <rect
          x="-11"
          y="-25"
          width="22"
          height="6"
          rx="3"
          fill={isPaperMode ? '#000000' : '#8B5CF6'}
          stroke={isPaperMode ? '#000000' : '#6D28D9'}
          strokeWidth={1.5}
        />
        {!isPaperMode && <rect x="-8" y="-24" width="16" height="2" rx="1" fill="#C4B5FD" />}
      </g>

      {/* 3. NECK (CONNECTING PIECE & CENTRIOLES) */}
      <g id="sperm-neck">
        {/* Capitulum Articulation Plate */}
        <path
          d="M -11 -98 L 11 -98 L 9 -90 L -9 -90 Z"
          fill={isPaperMode ? '#E2E8F0' : '#F59E0B'}
          stroke={isPaperMode ? '#000000' : '#B45309'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Proximal Centriole (Transverse barrel oriented horizontally) */}
        <rect
          x="-6"
          y="-96"
          width="12"
          height="4.5"
          rx="1.5"
          fill={isPaperMode ? '#000000' : '#EAB308'}
          stroke={isPaperMode ? '#000000' : '#78350F'}
          strokeWidth={1}
        />
        {/* Distal Centriole / Basal Body (Vertical) */}
        <rect
          x="-2.5"
          y="-91"
          width="5"
          height="7"
          rx="1"
          fill={isPaperMode ? '#475569' : '#D97706'}
          stroke={isPaperMode ? '#000000' : '#92400E'}
          strokeWidth={1}
        />
      </g>

      {/* 4. SPERM HEAD (CAPUT) */}
      {/* Plasma Membrane Outline (Entire head boundary) */}
      <path
        d="M 0 -195 
           C 22 -195 28 -165 26 -135 
           C 24 -112 18 -98 12 -98 
           L -12 -98 
           C -18 -98 -24 -112 -26 -135 
           C -28 -165 -22 -195 0 -195 Z"
        fill={isPaperMode ? '#FFFFFF' : '#EEF2FF'}
        stroke={isPaperMode ? '#000000' : '#312E81'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* Post-Acrosomal Sheath / Lamina (Posterior 1/3 of head) */}
      <path
        d="M -24 -135 
           C -22 -114 -16 -100 -11 -99 
           L 11 -99 
           C 16 -100 22 -114 24 -135 
           C 15 -132 -15 -132 -24 -135 Z"
        fill={isPaperMode ? '#F1F5F9' : '#C7D2FE'}
        stroke={isPaperMode ? '#000000' : '#6366F1'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />

      {/* Condensed Haploid Nucleus (Paternal Chromatin, 23 chromosomes with protamines) */}
      <path
        d="M 0 -182 
           C 16 -182 20 -155 18 -130 
           C 16 -108 12 -100 8 -100 
           L -8 -100 
           C -12 -100 -16 -108 -18 -130 
           C -20 -155 -16 -182 0 -182 Z"
        fill={isPaperMode ? '#E2E8F0' : '#4338CA'}
        stroke={isPaperMode ? '#000000' : '#1E1B4B'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Nuclear Chromatin Granules / Protamine Dense Stippling */}
      <g opacity={isPaperMode ? 0.6 : 0.4} fill={isPaperMode ? '#000000' : '#E0E7FF'}>
        <circle cx="-6" cy="-160" r="1.5" />
        <circle cx="6" cy="-158" r="1.5" />
        <circle cx="-10" cy="-140" r="1.5" />
        <circle cx="0" cy="-145" r="1.5" />
        <circle cx="9" cy="-138" r="1.5" />
        <circle cx="-5" cy="-122" r="1.5" />
        <circle cx="5" cy="-120" r="1.5" />
      </g>

      {/* Acrosome (Acrosomal Cap covering anterior 2/3 with hyaluronidase & acrosin) */}
      <path
        d="M 0 -195 
           C 22 -195 28 -165 25 -135 
           C 14 -138 -14 -138 -25 -135 
           C -28 -165 -22 -195 0 -195 Z"
        fill={isPaperMode ? '#FFFFFF' : '#06B6D4'}
        fillOpacity={isPaperMode ? 1 : 0.88}
        stroke={isPaperMode ? '#000000' : '#0891B2'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* Inner and Outer Acrosomal Membranes */}
      <path
        d="M 0 -190 
           C 18 -190 23 -162 20 -137 
           C 12 -140 -12 -140 -20 -137 
           C -23 -162 -18 -190 0 -190 Z"
        fill={isPaperMode ? '#F8FAFC' : '#67E8F9'}
        fillOpacity={isPaperMode ? 1 : 0.6}
        stroke={isPaperMode ? '#000000' : '#0E7490'}
        strokeWidth={isPaperMode ? 1.25 : 1.5}
        strokeDasharray={isPaperMode ? '3 2' : 'none'}
      />

      {/* Acrosomal Hydrolytic Enzyme Matrix (Hyaluronidase & Acrosin droplets) */}
      <g opacity={isPaperMode ? 0.7 : 0.85} fill={isPaperMode ? '#000000' : '#CFFAFE'}>
        <circle cx="-8" cy="-175" r="1.5" />
        <circle cx="0" cy="-180" r="1.8" />
        <circle cx="8" cy="-176" r="1.5" />
        <circle cx="-12" cy="-160" r="1.6" />
        <circle cx="-3" cy="-165" r="1.5" />
        <circle cx="6" cy="-162" r="1.7" />
        <circle cx="12" cy="-158" r="1.5" />
        <circle cx="-8" cy="-148" r="1.5" />
        <circle cx="0" cy="-150" r="1.6" />
        <circle cx="8" cy="-146" r="1.5" />
      </g>
    </g>
  );
};

/**
 * 22. High-Resolution Amoeba Proteus Diagram
 * Modeled on classic protozoology textbooks:
 * Asymmetric pseudopodia (lobopodia), clear hyaline cap/ectoplasm, granular endoplasm
 * (plasmasol & plasmagel), disk-shaped biconcave nucleus, contractile vacuole with feeder canals,
 * food vacuoles in digestion, and posterior uroid.
 */
export const AmoebaDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="amoeba-diagram-group" transform="translate(0, 0)">
      {/* 1. Main Irregular Body (Plasmalemma Boundary with Lobopodia) */}
      <path
        d="M -150 -40 
           C -190 -80 -160 -120 -110 -110 
           C -70 -100 -50 -130 10 -130 
           C 70 -130 110 -90 140 -105 
           C 180 -125 210 -70 190 -30 
           C 175 0 210 50 180 90 
           C 150 125 100 110 60 130 
           C 10 150 -50 130 -90 120 
           C -140 110 -170 130 -195 90 
           C -220 50 -190 0 -175 -20 
           C -160 -40 -120 0 -150 -40 Z"
        fill={isPaperMode ? '#FFFFFF' : '#0F766E'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#14B8A6'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 2. Hyaline Cap (Clear Ectoplasmic Zone at tips of pseudopodia) */}
      <path
        d="M 10 -130 C 50 -130 80 -105 140 -105 C 170 -120 195 -80 180 -40"
        stroke={isPaperMode ? '#94A3B8' : '#5EEAD4'}
        strokeWidth={isPaperMode ? 2 : 4}
        strokeOpacity={0.6}
        fill="none"
      />
      <path
        d="M -195 90 C -160 115 -100 105 -70 120"
        stroke={isPaperMode ? '#94A3B8' : '#5EEAD4'}
        strokeWidth={isPaperMode ? 2 : 4}
        strokeOpacity={0.6}
        fill="none"
      />

      {/* 3. Granular Endoplasm Zone (Plasmagel / Plasmasol) */}
      <path
        d="M -120 -30 
           C -145 -70 -90 -90 0 -95 
           C 70 -95 120 -70 140 -20 
           C 155 30 140 70 80 85 
           C 20 100 -40 90 -80 80 
           C -130 70 -150 30 -135 -10 Z"
        fill={isPaperMode ? '#F8FAFC' : '#115E59'}
        fillOpacity={isPaperMode ? 1 : 0.55}
        stroke={isPaperMode ? '#64748B' : '#0D9488'}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* Endoplasmic Granules / Mitochondria */}
      <g opacity={isPaperMode ? 0.35 : 0.5}>
        {[-80, -40, 0, 40, 80, -60, -20, 30, 70, -100, 100].map((x, i) => (
          <circle key={`amoeba-gr-${i}`} cx={x} cy={(i % 3 - 1) * 35} r={2 + (i % 2)} fill={isPaperMode ? '#000000' : '#CCFBF1'} />
        ))}
      </g>

      {/* 4. Nucleus (Biconcave disc with chromatin beads) */}
      <g transform="translate(-30, -15)">
        <ellipse cx="0" cy="0" rx="24" ry="20" fill={isPaperMode ? '#E2E8F0' : '#4338CA'} stroke={isPaperMode ? '#000000' : '#818CF8'} strokeWidth={isPaperMode ? 2.5 : 3} />
        <ellipse cx="0" cy="0" rx="14" ry="11" fill={isPaperMode ? '#CBD5E1' : '#6366F1'} stroke={isPaperMode ? '#000000' : '#A5B4FC'} strokeWidth={1.5} />
        <circle cx="-4" cy="-3" r="3.5" fill={isPaperMode ? '#000000' : '#E0E7FF'} />
      </g>

      {/* 5. Contractile Vacuole (Clear spherical osmoregulatory vesicle) */}
      <g transform="translate(45, -30)">
        <circle cx="0" cy="0" r="22" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2.5 : 3} />
        {!isPaperMode && <circle cx="-6" cy="-6" r="7" fill="#E0F2FE" fillOpacity={0.6} />}
      </g>

      {/* 6. Food Vacuoles (Ingested paramecia/diatoms in various stages of digestion) */}
      <g transform="translate(-75, 35)">
        <circle cx="0" cy="0" r="16" fill={isPaperMode ? '#F1F5F9' : '#854D0E'} stroke={isPaperMode ? '#000000' : '#FACC15'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <path d="M -6 -4 L 6 4 M -6 4 L 6 -4" stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth={2} />
      </g>
      <g transform="translate(60, 40)">
        <circle cx="0" cy="0" r="14" fill={isPaperMode ? '#F1F5F9' : '#15803D'} stroke={isPaperMode ? '#000000' : '#4ADE80'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <circle cx="0" cy="0" r="5" fill={isPaperMode ? '#000000' : '#BBF7D0'} />
      </g>

      {/* 7. Uroid (Wrinkled Posterior End) */}
      <path
        d="M -180 50 Q -210 65 -195 90 Q -180 75 -165 85"
        stroke={isPaperMode ? '#000000' : '#14B8A6'}
        strokeWidth={isPaperMode ? 2 : 3}
        fill="none"
      />
    </g>
  );
};

/**
 * 23. High-Resolution Paramecium Caudatum Diagram
 * Modeled on classic ciliate anatomy textbooks:
 * Slipper-shaped pellicle covered in ciliary rows, trichocysts, oral groove (peristome),
 * cytostome (cell mouth), cytopharynx, forming food vacuoles, kidney-shaped macronucleus,
 * spherical micronucleus, anterior & posterior star-shaped contractile vacuoles with radial canals,
 * and anal pore (cytoproct).
 */
export const ParameciumDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="paramecium-diagram-group" transform="translate(0, 0)">
      {/* 1. Peripheral Cilia Border (Hundreds of fine hair-like motile projections) */}
      <g opacity={isPaperMode ? 0.6 : 0.75}>
        {Array.from({ length: 48 }).map((_, i) => {
          const ang = (i / 48) * Math.PI * 2;
          const x1 = Math.cos(ang) * (ang > Math.PI / 2 && ang < Math.PI * 1.5 ? 180 : 160);
          const y1 = Math.sin(ang) * 75;
          const x2 = x1 + Math.cos(ang) * 16;
          const y2 = y1 + Math.sin(ang) * 16;
          return (
            <line
              key={`cilia-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isPaperMode ? '#000000' : '#60A5FA'}
              strokeWidth={isPaperMode ? 1.5 : 2}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* 2. Slipper-Shaped Pellicle Boundary */}
      <path
        d="M -170 -15 
           C -175 -55 -100 -75 -10 -75 
           C 80 -75 160 -50 175 -5 
           C 185 25 150 70 80 75 
           C 0 80 -90 70 -140 50 
           C -175 35 -170 10 -170 -15 Z"
        fill={isPaperMode ? '#FFFFFF' : '#1E3A8A'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#3B82F6'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* 3. Oral Groove (Peristome), Cytostome & Cytopharynx */}
      {/* Oblique depression leading into cytostome */}
      <path
        d="M -80 -72 
           C -40 -45 0 -25 35 -10 
           C 50 -2 55 15 40 28 
           C 25 38 0 25 -25 10 Z"
        fill={isPaperMode ? '#E2E8F0' : '#0F172A'}
        fillOpacity={isPaperMode ? 1 : 0.9}
        stroke={isPaperMode ? '#000000' : '#93C5FD'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      {/* Cytostome (Cell Mouth) & Cytopharynx Funnel */}
      <ellipse cx="40" cy="12" rx="12" ry="8" fill={isPaperMode ? '#CBD5E1' : '#1D4ED8'} stroke={isPaperMode ? '#000000' : '#BFDBFE'} strokeWidth={1.5} />

      {/* 4. Forming Food Vacuoles budding off cytopharynx */}
      <g transform="translate(60, 22)">
        <circle cx="0" cy="0" r="10" fill={isPaperMode ? '#F1F5F9' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#FDE68A'} strokeWidth={1.5} />
      </g>
      <g transform="translate(100, 15)">
        <circle cx="0" cy="0" r="12" fill={isPaperMode ? '#F1F5F9' : '#10B981'} stroke={isPaperMode ? '#000000' : '#6EE7B7'} strokeWidth={1.5} />
      </g>
      <g transform="translate(-60, 25)">
        <circle cx="0" cy="0" r="11" fill={isPaperMode ? '#F1F5F9' : '#EC4899'} stroke={isPaperMode ? '#000000' : '#FBCFE8'} strokeWidth={1.5} />
      </g>

      {/* 5. Star-Shaped Anterior Contractile Vacuole Complex */}
      <g transform="translate(-110, -10)">
        {/* Radiating canals */}
        {[0, 60, 120, 180, 240, 300].map((ang, i) => (
          <path
            key={`ant-can-${i}`}
            d={`M 0 0 L ${Math.cos((ang * Math.PI) / 180) * 22} ${Math.sin((ang * Math.PI) / 180) * 22}`}
            stroke={isPaperMode ? '#000000' : '#38BDF8'}
            strokeWidth={isPaperMode ? 2 : 2.5}
            strokeLinecap="round"
          />
        ))}
        <circle cx="0" cy="0" r="9" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#E0F2FE'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* 6. Star-Shaped Posterior Contractile Vacuole Complex */}
      <g transform="translate(115, -10)">
        {/* Radiating canals */}
        {[0, 60, 120, 180, 240, 300].map((ang, i) => (
          <path
            key={`post-can-${i}`}
            d={`M 0 0 L ${Math.cos((ang * Math.PI) / 180) * 22} ${Math.sin((ang * Math.PI) / 180) * 22}`}
            stroke={isPaperMode ? '#000000' : '#38BDF8'}
            strokeWidth={isPaperMode ? 2 : 2.5}
            strokeLinecap="round"
          />
        ))}
        <circle cx="0" cy="0" r="9" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#E0F2FE'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* 7. Kidney-Shaped Macronucleus & Spherical Micronucleus */}
      <g transform="translate(-15, -12)">
        {/* Large Kidney-shaped Macronucleus (Vegetative metabolic control) */}
        <path
          d="M -22 -16 
             C -32 0 -22 18 0 18 
             C 18 18 25 5 18 -10 
             C 12 -20 -8 -22 -22 -16 Z"
          fill={isPaperMode ? '#E2E8F0' : '#581C87'}
          stroke={isPaperMode ? '#000000' : '#C084FC'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Small Spherical Micronucleus nestled in depression (Reproductive control) */}
        <circle cx="-5" cy="-18" r="6" fill={isPaperMode ? '#000000' : '#F43F5E'} stroke={isPaperMode ? '#000000' : '#FECDD3'} strokeWidth={1.5} />
      </g>

      {/* 8. Anal Pore (Cytoproct) for Waste Excretion */}
      <path d="M 120 48 L 135 55" stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

/**
 * 24. High-Resolution Female Reproductive System Diagram (Coronal / Frontal Anatomical Section)
 * Authoritative anatomical model based on Gray's Anatomy & OpenStax Anatomy & Physiology:
 * - Pear-shaped Uterus: Rounded superior Fundus dome above tubal junctions, Corpus (body), and Isthmus
 * - Distinct Uterine Layers: Outer Perimetrium (serosa), thick middle Myometrium with muscular bundles, and inner vascular Endometrium lining the triangular Uterine Cavity
 * - Distinct Lumen: Central triangular Uterine Cavity (internal lumen space)
 * - Bilateral Fallopian Tubes (Oviducts): Narrow Isthmus, sweeping dilated Ampulla (physiological site of fertilization), and Infundibulum
 * - Feathered Fimbriae draping around the ovaries with the elongated Ovarian Fimbria
 * - True Almond-Shaped Ovaries: Cortex depicting follicular development (primordial, primary, Graafian follicle with oocyte, and Corpus Luteum)
 * - True Utero-Ovarian Ligaments: Distinct fibromuscular cords connecting medial pole of ovary to lateral uterine cornu
 * - Cervix: Internal Os, Endocervical Canal with palmate folds, External Os, and Cervical Fornices
 * - Vagina: Muscular birth canal with transverse Vaginal Rugae folds
 */
export const FemaleReproductiveSystemDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="female-reproductive-diagram-group" transform="translate(0, 10)">
      {/* 1. Peritoneal Broad Ligament Drape & Pelvic Wall Contour */}
      <path
        d="M -235 -10 
           C -175 -60 -115 -70 -55 -70 
           L 55 -70 
           C 115 -70 175 -60 235 -10 
           C 215 65 145 105 0 105 
           C -145 105 -215 65 -235 -10 Z"
        fill={isPaperMode ? '#F8FAFC' : '#475569'}
        fillOpacity={isPaperMode ? 0.45 : 0.18}
        stroke={isPaperMode ? '#CBD5E1' : '#64748B'}
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      {/* 2. Suspensory Ligaments of the Ovary (Infundibulopelvic Ligaments with Ovarian Vessels) */}
      <path
        d="M -245 -45 C -215 -40 -195 -15 -180 5"
        stroke={isPaperMode ? '#94A3B8' : '#93C5FD'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
        strokeDasharray="3 2"
        fill="none"
      />
      <path
        d="M 245 -45 C 215 -40 195 -15 180 5"
        stroke={isPaperMode ? '#94A3B8' : '#93C5FD'}
        strokeWidth={isPaperMode ? 2.5 : 3.5}
        strokeDasharray="3 2"
        fill="none"
      />

      {/* 3. Fallopian Tubes (Uterine Tubes / Oviducts) - Bilateral sweeping muscular conduits */}
      {/* Left Fallopian Tube: Isthmus -> Ampulla -> Infundibulum */}
      <g id="left-fallopian-tube">
        {/* Outer muscular wall */}
        <path
          id="anchor-frs-fallopian-tube"
          d="M -48 -60 
             C -90 -95 -145 -95 -185 -70 
             C -210 -50 -220 -20 -205 10"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#DB2777'}
          strokeWidth={isPaperMode ? 8.5 : 11}
          strokeLinecap="round"
        />
        {/* Inner mucosal lumen */}
        <path
          d="M -48 -60 
             C -90 -95 -145 -95 -185 -70 
             C -210 -50 -220 -20 -205 10"
          fill="none"
          stroke={isPaperMode ? '#FFFFFF' : '#FCE7F3'}
          strokeWidth={isPaperMode ? 3.5 : 4.5}
          strokeLinecap="round"
        />
      </g>

      {/* Right Fallopian Tube: Isthmus -> Ampulla -> Infundibulum */}
      <g id="right-fallopian-tube">
        {/* Outer muscular wall */}
        <path
          d="M 48 -60 
             C 90 -95 145 -95 185 -70 
             C 210 -50 220 -20 205 10"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#DB2777'}
          strokeWidth={isPaperMode ? 8.5 : 11}
          strokeLinecap="round"
        />
        {/* Inner mucosal lumen */}
        <path
          d="M 48 -60 
             C 90 -95 145 -95 185 -70 
             C 210 -50 220 -20 205 10"
          fill="none"
          stroke={isPaperMode ? '#FFFFFF' : '#FCE7F3'}
          strokeWidth={isPaperMode ? 3.5 : 4.5}
          strokeLinecap="round"
        />
      </g>

      {/* 4. Infundibulum & Feathered Fimbriae surrounding the Ovaries */}
      {/* Left Fimbriae */}
      <g id="left-fimbriae" transform="translate(-205, 10)">
        <g id="anchor-frs-fimbriae">
          <path d="M 0 0 C -12 12 -18 28 -12 40 M 0 0 C -6 18 0 32 8 40 M 0 0 C 10 14 18 26 22 35 M 0 0 C 15 8 28 14 32 24" stroke={isPaperMode ? '#000000' : '#E11D48'} strokeWidth={isPaperMode ? 2 : 2.5} fill="none" strokeLinecap="round" />
          {/* Elongated Ovarian Fimbria touching upper ovarian pole */}
          <path d="M 10 14 C 20 20 28 25 35 22" stroke={isPaperMode ? '#000000' : '#BE123C'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* Right Fimbriae */}
      <g id="right-fimbriae" transform="translate(205, 10)">
        <path d="M 0 0 C 12 12 18 28 12 40 M 0 0 C 6 18 0 32 -8 40 M 0 0 C -10 14 -18 26 -22 35 M 0 0 C -15 8 -28 14 -32 24" stroke={isPaperMode ? '#000000' : '#E11D48'} strokeWidth={isPaperMode ? 2 : 2.5} fill="none" strokeLinecap="round" />
        {/* Elongated Ovarian Fimbria touching upper ovarian pole */}
        <path d="M -10 14 C -20 20 -28 25 -35 22" stroke={isPaperMode ? '#000000' : '#BE123C'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" strokeLinecap="round" />
      </g>

      {/* 5. Utero-Ovarian Ligament (Distinct fibromuscular bands attaching ovary to uterine cornu) */}
      {/* Left Ovarian Ligament */}
      <g id="left-ovarian-ligament-group">
        <path
          d="M -48 -38 C -85 -28 -120 -8 -140 22"
          stroke={isPaperMode ? '#000000' : '#FDA4AF'}
          strokeWidth={isPaperMode ? 4 : 5.5}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M -48 -38 C -85 -28 -120 -8 -140 22"
          stroke={isPaperMode ? '#FFFFFF' : '#FB7185'}
          strokeWidth={isPaperMode ? 1.5 : 2}
          strokeLinecap="round"
          fill="none"
        />
      </g>
      {/* Right Ovarian Ligament */}
      <g id="right-ovarian-ligament-group">
        <path
          id="anchor-frs-ovarian-ligament"
          d="M 48 -38 C 85 -28 120 -8 140 22"
          stroke={isPaperMode ? '#000000' : '#FDA4AF'}
          strokeWidth={isPaperMode ? 4 : 5.5}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 48 -38 C 85 -28 120 -8 140 22"
          stroke={isPaperMode ? '#FFFFFF' : '#FB7185'}
          strokeWidth={isPaperMode ? 1.5 : 2}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* 6. True Almond-Shaped Ovaries (Cross-Section showing follicular maturation & Corpus Luteum) */}
      {/* Left Ovary */}
      <g id="left-ovary" transform="translate(-165, 25)">
        <ellipse cx="0" cy="0" rx="28" ry="20" fill={isPaperMode ? '#FFFFFF' : '#FEF3C7'} stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* Primordial & Primary Follicles */}
        <circle cx="-14" cy="-5" r="3" fill={isPaperMode ? '#E2E8F0' : '#FDE047'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
        <circle cx="-6" cy="-10" r="4" fill={isPaperMode ? '#E2E8F0' : '#FDE047'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
        {/* Secondary Growing Antral Follicle */}
        <circle cx="2" cy="-6" r="6" fill={isPaperMode ? '#CBD5E1' : '#FDE68A'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1.2} />
        <circle cx="2" cy="-6" r="2" fill={isPaperMode ? '#000000' : '#EF4444'} />
        {/* Mature Graafian Follicle with large fluid Antrum and Oocyte */}
        <circle cx="10" cy="3" r="8.5" fill={isPaperMode ? '#CBD5E1' : '#FEF08A'} stroke={isPaperMode ? '#000000' : '#92400E'} strokeWidth={1.5} />
        <circle cx="10" cy="3" r="2.8" fill={isPaperMode ? '#000000' : '#DC2626'} />
        {/* Corpus Luteum (Yellow endocrine body) */}
        <path d="M -8 7 C -4 14 4 14 9 8 C 5 5 -3 5 -8 7 Z" fill={isPaperMode ? '#94A3B8' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1.2} />
      </g>

      {/* Right Ovary */}
      <g id="right-ovary" transform="translate(165, 25)">
        <g id="anchor-frs-ovary">
          <ellipse cx="0" cy="0" rx="28" ry="20" fill={isPaperMode ? '#FFFFFF' : '#FEF3C7'} stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth={isPaperMode ? 2 : 2.5} />
          {/* Follicles */}
          <circle cx="14" cy="-5" r="3" fill={isPaperMode ? '#E2E8F0' : '#FDE047'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
          <circle cx="6" cy="-10" r="4" fill={isPaperMode ? '#E2E8F0' : '#FDE047'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
          <circle cx="-2" cy="-6" r="6" fill={isPaperMode ? '#CBD5E1' : '#FDE68A'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1.2} />
          <circle cx="-2" cy="-6" r="2" fill={isPaperMode ? '#000000' : '#EF4444'} />
          {/* Mature Graafian Follicle */}
          <circle cx="-10" cy="3" r="8.5" fill={isPaperMode ? '#CBD5E1' : '#FEF08A'} stroke={isPaperMode ? '#000000' : '#92400E'} strokeWidth={1.5} />
          <circle cx="-10" cy="3" r="2.8" fill={isPaperMode ? '#000000' : '#DC2626'} />
          {/* Corpus Luteum */}
          <path d="M 8 7 C 4 14 -4 14 -9 8 C -5 5 3 5 8 7 Z" fill={isPaperMode ? '#94A3B8' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1.2} />
        </g>
      </g>

      {/* 7. Uterus External Muscular Wall & Myometrium (Convex Fundus + Corpus + Isthmus) */}
      {/* Outer Serosa / Perimetrium & Thick Myometrium */}
      <path
        id="anchor-frs-fundus"
        d="M -52 -55 
           C -32 -88 32 -88 52 -55 
           C 70 -35 60 15 32 70 
           C 26 84 22 98 20 115 
           L -20 115 
           C -22 98 -26 84 -32 70 
           C -60 15 -70 -35 -52 -55 Z"
        fill={isPaperMode ? '#FFFFFF' : '#9D174D'}
        stroke={isPaperMode ? '#000000' : '#831843'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* Myometrial Interlacing Smooth Muscle Texture & Anchor */}
      <g id="anchor-frs-myometrium">
        {!isPaperMode && (
          <g opacity="0.4">
            <path d="M -44 -48 C -20 -72 20 -72 44 -48" stroke="#FCE7F3" strokeWidth="2.5" fill="none" />
            <path d="M -40 -20 C -20 -38 20 -38 40 -20" stroke="#FCE7F3" strokeWidth="2.5" fill="none" />
            <path d="M -30 15 C -15 2 15 2 30 15" stroke="#FCE7F3" strokeWidth="2" fill="none" />
            <path d="M -24 50 C -12 38 12 38 24 50" stroke="#FCE7F3" strokeWidth="2" fill="none" />
          </g>
        )}
      </g>

      {/* 8. Endometrium Layer (Deep Crimson Vascular Mucosal Lining) */}
      <path
        id="anchor-frs-endometrium"
        d="M -35 -40 
           C -18 -58 18 -58 35 -40 
           C 40 -25 28 25 15 68 
           L -15 68 
           C -28 25 -40 -25 -35 -40 Z"
        fill={isPaperMode ? '#E2E8F0' : '#881337'}
        stroke={isPaperMode ? '#000000' : '#E11D48'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* 9. Uterine Cavity (Triangular Internal Lumen Space) */}
      <path
        id="anchor-frs-uterine-cavity"
        d="M -22 -36 
           C -10 -46 10 -46 22 -36 
           C 24 -22 14 25 7 62 
           L -7 62 
           C -14 25 -24 -22 -22 -36 Z"
        fill={isPaperMode ? '#F8FAFC' : '#1E1B4B'}
        stroke={isPaperMode ? '#000000' : '#FDA4AF'}
        strokeWidth={isPaperMode ? 1.5 : 1.75}
      />

      {/* 10. Cervix & Endocervical Canal */}
      <g id="cervix-group" transform="translate(0, 85)">
        <g id="anchor-frs-cervix">
          {/* Cervical Muscular Walls */}
          <path
            d="M -26 -15 L -22 28 L 22 28 L 26 -15 Z"
            fill={isPaperMode ? '#FFFFFF' : '#831843'}
            stroke={isPaperMode ? '#000000' : '#701A75'}
            strokeWidth={isPaperMode ? 2 : 2.5}
          />
          {/* Endocervical Canal Spindle */}
          <path
            d="M 0 -17 C -4 0 -4 12 0 26 C 4 12 4 0 0 -17 Z"
            fill={isPaperMode ? '#E2E8F0' : '#FCE7F3'}
            stroke={isPaperMode ? '#000000' : '#FB7185'}
            strokeWidth={1.5}
          />
          {/* Internal Os constriction point (opening into uterine cavity) */}
          <circle cx="0" cy="-16" r="3.5" fill={isPaperMode ? '#000000' : '#F43F5E'} />
          {/* External Os opening into vaginal vault */}
          <circle cx="0" cy="25" r="3.5" fill={isPaperMode ? '#000000' : '#F43F5E'} />
          {/* Cervical Fornices (Lateral vaginal recesses flanking the protruding cervix) */}
          <path d="M -30 20 C -26 10 -23 15 -22 28" stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M 30 20 C 26 10 23 15 22 28" stroke={isPaperMode ? '#000000' : '#FDA4AF'} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* 11. Vagina & Vaginal Rugae Ridges */}
      <g id="vagina-group" transform="translate(0, 138)">
        <g id="anchor-frs-vagina">
          {/* Vaginal Distensible Muscular Canal */}
          <path
            d="M -30 -22 L -32 45 C -20 52 20 52 32 45 L 30 -22 Z"
            fill={isPaperMode ? '#F1F5F9' : '#500724'}
            stroke={isPaperMode ? '#000000' : '#701A75'}
            strokeWidth={isPaperMode ? 2.5 : 3}
          />
          {/* Transverse Vaginal Rugae Mucosal Ridges */}
          <path d="M -20 -8 Q 0 0 20 -8" stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={1.75} fill="none" />
          <path d="M -22 10 Q 0 18 22 10" stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={1.75} fill="none" />
          <path d="M -22 28 Q 0 36 22 28" stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={1.75} fill="none" />
          <line x1="0" y1="-22" x2="0" y2="45" stroke={isPaperMode ? '#000000' : '#FBCFE8'} strokeWidth={1.5} strokeDasharray="3 2" />
        </g>
      </g>
    </g>
  );
};

/**
 * 25. High-Resolution Global Carbon Cycle Diagram (Biogeochemical Flows & Sinks)
 * Textbook-accurate representation based on Campbell Biology & Earth Systems Science:
 * - Upper Troposphere: Atmospheric CO₂ Reservoir (420+ ppm)
 * - Terrestrial Ecosystem: Forest canopy absorbing CO₂ via Photosynthesis
 * - Respiration: Plant respiration & Animal respiration (grazing fauna) releasing CO₂
 * - Soil Dynamics: Microbial decomposition of organic leaf litter & detritus
 * - Geological Strata: Subterranean fossil fuels (coal, oil, natural gas) forming deep carbon sinks
 * - Anthropogenic Emissions: Power station & vehicle combustion releasing fossil carbon
 * - Oceanic Sink: Air-sea gas dissolution, marine phytoplankton photosynthesis, and seafloor carbonate sedimentation
 */
export const CarbonCycleDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="carbon-cycle-diagram-group" transform="translate(0, 0)">
      {/* 1. Sky & Atmosphere Area */}
      <rect x="-250" y="-150" width="500" height="90" rx="6" fill={isPaperMode ? '#FFFFFF' : '#0F172A'} stroke={isPaperMode ? '#CBD5E1' : '#1E293B'} strokeWidth={1} />
      {/* Atmospheric CO2 Reservoir Box */}
      <g transform="translate(0, -105)">
        <rect x="-120" y="-22" width="240" height="44" rx="8" fill={isPaperMode ? '#F8FAFC' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <text x="0" y="-2" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">ATMOSPHERIC CO₂ POOL</text>
        <text x="0" y="14" fill={isPaperMode ? '#475569' : '#94A3B8'} fontSize="10" fontFamily="system-ui, sans-serif" textAnchor="middle">~850 Gigatons Carbon • Global Carbon Reservoir</text>
      </g>

      {/* 2. Terrestrial Landscape (Left & Center) & Ocean Basin (Right) */}
      {/* Land Hills & Ground */}
      <path
        d="M -250 40 Q -170 -10 -90 30 Q -10 60 70 40 L 70 150 L -250 150 Z"
        fill={isPaperMode ? '#FFFFFF' : '#064E3B'}
        stroke={isPaperMode ? '#000000' : '#059669'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      {/* Subterranean Geological Strata / Bedrock */}
      <path
        d="M -250 90 L 70 90 L 70 150 L -250 150 Z"
        fill={isPaperMode ? '#F1F5F9' : '#1F2937'}
        stroke={isPaperMode ? '#000000' : '#4B5563'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />
      {/* Ocean Basin (Right) */}
      <path
        d="M 70 40 C 90 40 100 65 120 70 L 250 70 L 250 150 L 70 150 Z"
        fill={isPaperMode ? '#F8FAFC' : '#0C4A6E'}
        stroke={isPaperMode ? '#000000' : '#0284C7'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />
      {/* Ocean Water Surface Waves */}
      <path d="M 120 70 Q 150 66 180 70 Q 215 74 250 70" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={2} fill="none" />

      {/* 3. Forest Vegetation (Photosynthesis Sink) */}
      <g transform="translate(-180, 0)">
        {/* Tree 1 Trunk & Foliage */}
        <rect x="-4" y="0" width="8" height="28" fill={isPaperMode ? '#000000' : '#78350F'} />
        <ellipse cx="0" cy="-10" rx="20" ry="18" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* Tree 2 */}
        <g transform="translate(30, 8)">
          <rect x="-3" y="0" width="6" height="24" fill={isPaperMode ? '#000000' : '#78350F'} />
          <ellipse cx="0" cy="-8" rx="16" ry="15" fill={isPaperMode ? '#FFFFFF' : '#059669'} stroke={isPaperMode ? '#000000' : '#10B981'} strokeWidth={isPaperMode ? 1.75 : 2} />
        </g>
      </g>

      {/* 4. Terrestrial Fauna (Animal Respiration) */}
      <g transform="translate(-105, 26)">
        {/* Grazing Herbivore silhouette */}
        <ellipse cx="0" cy="0" rx="14" ry="9" fill={isPaperMode ? '#000000' : '#D97706'} />
        <circle cx="12" cy="-6" r="6" fill={isPaperMode ? '#000000' : '#D97706'} />
        <line x1="-8" y1="8" x2="-8" y2="18" stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="2.5" />
        <line x1="-3" y1="8" x2="-3" y2="18" stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="2.5" />
        <line x1="6" y1="8" x2="6" y2="18" stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="2.5" />
        <line x1="10" y1="8" x2="10" y2="18" stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="2.5" />
      </g>

      {/* 5. Soil Microbial Decomposition */}
      <g transform="translate(-130, 68)">
        <ellipse cx="0" cy="0" rx="22" ry="8" fill={isPaperMode ? '#E2E8F0' : '#374151'} stroke={isPaperMode ? '#000000' : '#9CA3AF'} strokeWidth={1} strokeDasharray="3 2" />
        <text x="0" y="3" fill={isPaperMode ? '#000000' : '#D1D5DB'} fontSize="8" fontWeight="bold" textAnchor="middle">Decomposers & Soil Microbes</text>
      </g>

      {/* 6. Subterranean Fossil Fuel Strata (Deep Carbon Sink) */}
      <g transform="translate(-140, 118)">
        <rect x="-40" y="-12" width="80" height="24" rx="4" fill={isPaperMode ? '#000000' : '#111827'} stroke={isPaperMode ? '#000000' : '#6B7280'} strokeWidth={1.5} />
        <text x="0" y="4" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">FOSSIL FUELS (Coal/Oil/Gas)</text>
      </g>

      {/* 7. Industrial Factory & Emissions (Combustion Source) */}
      <g transform="translate(10, 18)">
        {/* Factory building */}
        <polygon points="-25,25 -25,-2 -8,-2 -8,6 10,-2 10,6 28,-2 28,25" fill={isPaperMode ? '#FFFFFF' : '#475569'} stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 2 : 2} />
        {/* Smoke stacks */}
        <rect x="-22" y="-16" width="6" height="14" fill={isPaperMode ? '#000000' : '#64748B'} />
        <rect x="-12" y="-20" width="7" height="18" fill={isPaperMode ? '#000000' : '#64748B'} />
        {/* Smoke plumes */}
        <circle cx="-18" cy="-24" r="5" fill={isPaperMode ? '#CBD5E1' : '#94A3B8'} opacity="0.8" />
        <circle cx="-14" cy="-32" r="7" fill={isPaperMode ? '#CBD5E1' : '#CBD5E1'} opacity="0.7" />
        <circle cx="-8" cy="-42" r="9" fill={isPaperMode ? '#E2E8F0' : '#E2E8F0'} opacity="0.6" />
      </g>

      {/* 8. Oceanic Marine Carbon & Carbonate Sedimentation */}
      <g transform="translate(180, 105)">
        {/* Marine Phytoplankton */}
        <circle cx="-25" cy="-15" r="4" fill={isPaperMode ? '#000000' : '#10B981'} />
        <circle cx="-15" cy="-20" r="3" fill={isPaperMode ? '#000000' : '#10B981'} />
        {/* Marine Organism (Fish) */}
        <polygon points="10,-10 25,-16 25,-4" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        <circle cx="5" cy="-10" r="7" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        {/* Carbonate / Limestone Sediment on Seafloor */}
        <rect x="-45" y="25" width="90" height="14" rx="3" fill={isPaperMode ? '#E2E8F0' : '#0369A1'} stroke={isPaperMode ? '#000000' : '#7DD3FC'} strokeWidth={1} />
        <text x="0" y="35" fill={isPaperMode ? '#000000' : '#E0F2FE'} fontSize="8" fontWeight="bold" textAnchor="middle">CaCO₃ Limestone Sediments</text>
      </g>

      {/* 9. Biogeochemical Flow Arrows (Photosynthesis, Respiration, Combustion, Ocean Uptake) */}
      {/* Downward Photosynthesis Arrow */}
      <g transform="translate(-160, -45)">
        <path d="M 0 -20 L 0 15" stroke={isPaperMode ? '#000000' : '#10B981'} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />
        <polygon points="0,22 -6,12 6,12" fill={isPaperMode ? '#000000' : '#10B981'} />
        <text x="-12" y="2" fill={isPaperMode ? '#000000' : '#10B981'} fontSize="9" fontWeight="bold" textAnchor="end">Photosynthesis (-120 Gt/yr)</text>
      </g>

      {/* Upward Respiration Arrow */}
      <g transform="translate(-95, -35)">
        <path d="M 0 20 L 0 -15" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 2.5 : 3} strokeLinecap="round" />
        <polygon points="0,-22 -5,-12 5,-12" fill={isPaperMode ? '#000000' : '#F59E0B'} />
        <text x="10" y="2" fill={isPaperMode ? '#000000' : '#F59E0B'} fontSize="8.5" fontWeight="bold">Respiration (+118 Gt/yr)</text>
      </g>

      {/* Upward Industrial Combustion Arrow */}
      <g transform="translate(0, -45)">
        <path d="M 0 18 L 0 -18" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />
        <polygon points="0,-24 -6,-14 6,-14" fill={isPaperMode ? '#000000' : '#EF4444'} />
        <text x="10" y="-2" fill={isPaperMode ? '#000000' : '#EF4444'} fontSize="9" fontWeight="bold">Combustion (+10 Gt/yr)</text>
      </g>

      {/* Bilateral Oceanic Gas Exchange */}
      <g transform="translate(160, -25)">
        <path d="M -12 25 L -12 -10" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={2} />
        <polygon points="-12,-15 -16,-7 -8,-7" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        <path d="M 12 -10 L 12 25" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth={2} />
        <polygon points="12,30 8,22 16,22" fill={isPaperMode ? '#000000' : '#0284C7'} />
        <text x="0" y="6" fill={isPaperMode ? '#000000' : '#7DD3FC'} fontSize="8.5" fontWeight="bold" textAnchor="middle">Air-Sea Gas Exchange</text>
      </g>
    </g>
  );
};

/**
 * 26. High-Resolution Biogeochemical Nitrogen Cycle Diagram
 * - Atmospheric N₂ Pool (78% of air)
 * - Biological Nitrogen Fixation (Rhizobium in legume root nodules & Azotobacter)
 * - Industrial / Lightning Nitrogen Fixation
 * - Ammonification (Saprophytic decomposers breaking organic matter into NH₄⁺)
 * - Nitrification step 1: Nitrosomonas converting NH₄⁺ into Nitrites (NO₂⁻)
 * - Nitrification step 2: Nitrobacter converting NO₂⁻ into Nitrates (NO₃⁻)
 * - Plant Root Assimilation of Nitrates
 * - Denitrification (Pseudomonas returning N₂ gas to atmosphere under anaerobic conditions)
 */
export const NitrogenCycleDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="nitrogen-cycle-diagram-group" transform="translate(0, 0)">
      {/* Sky & Atmospheric N2 Reservoir */}
      <rect x="-240" y="-140" width="480" height="70" rx="6" fill={isPaperMode ? '#FFFFFF' : '#0F172A'} stroke={isPaperMode ? '#CBD5E1' : '#1E293B'} strokeWidth={1} />
      <g transform="translate(0, -105)">
        <rect x="-130" y="-20" width="260" height="40" rx="8" fill={isPaperMode ? '#F8FAFC' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#818CF8'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <text x="0" y="-2" fill={isPaperMode ? '#000000' : '#818CF8'} fontSize="13" fontWeight="bold" textAnchor="middle">ATMOSPHERIC NITROGEN (N₂) POOL</text>
        <text x="0" y="13" fill={isPaperMode ? '#475569' : '#C7D2FE'} fontSize="9.5" textAnchor="middle">78% Atmospheric Volume • Inert Triple Covalent Bond (N≡N)</text>
      </g>

      {/* Soil Horizon & Subsurface Profile */}
      <path d="M -240 -10 L 240 -10 L 240 145 L -240 145 Z" fill={isPaperMode ? '#F8FAFC' : '#1C1917'} stroke={isPaperMode ? '#000000' : '#44403C'} strokeWidth={isPaperMode ? 2 : 2} />

      {/* Legume Plant with Root Nodules (Nitrogen Fixation) */}
      <g transform="translate(-160, -10)">
        {/* Plant Shoots & Leaves */}
        <line x1="0" y1="0" x2="0" y2="-45" stroke={isPaperMode ? '#000000' : '#10B981'} strokeWidth="3.5" />
        <ellipse cx="-12" cy="-35" rx="12" ry="7" fill={isPaperMode ? '#FFFFFF' : '#34D399'} stroke={isPaperMode ? '#000000' : '#059669'} strokeWidth="1.5" />
        <ellipse cx="12" cy="-40" rx="12" ry="7" fill={isPaperMode ? '#FFFFFF' : '#34D399'} stroke={isPaperMode ? '#000000' : '#059669'} strokeWidth="1.5" />
        {/* Root System */}
        <path d="M 0 0 Q -15 35 -30 65 M 0 0 Q 15 35 25 70 M 0 0 L 0 85 M -15 35 L -35 45 M 15 35 L 35 50" stroke={isPaperMode ? '#000000' : '#D97706'} strokeWidth="2" fill="none" />
        {/* Rhizobium Root Nodules */}
        <circle cx="-15" cy="35" r="5" fill={isPaperMode ? '#CBD5E1' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="1.5" />
        <circle cx="-25" cy="55" r="4.5" fill={isPaperMode ? '#CBD5E1' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="1.5" />
        <circle cx="15" cy="40" r="5" fill={isPaperMode ? '#CBD5E1' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="1.5" />
        <circle cx="22" cy="60" r="4" fill={isPaperMode ? '#CBD5E1' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth="1.5" />
      </g>

      {/* Decomposers & Ammonification Node */}
      <g transform="translate(-60, 45)">
        <rect x="-45" y="-18" width="90" height="36" rx="6" fill={isPaperMode ? '#FFFFFF' : '#292524'} stroke={isPaperMode ? '#000000' : '#A8A29E'} strokeWidth="1.5" />
        <text x="0" y="-3" fill={isPaperMode ? '#000000' : '#E7E5E4'} fontSize="9" fontWeight="bold" textAnchor="middle">Decomposition</text>
        <text x="0" y="11" fill={isPaperMode ? '#000000' : '#FBBF24'} fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">NH₄⁺ (Ammonium)</text>
      </g>

      {/* Nitrification: Nitrites (NO2-) Node */}
      <g transform="translate(60, 45)">
        <rect x="-45" y="-18" width="90" height="36" rx="6" fill={isPaperMode ? '#FFFFFF' : '#1E1B4B'} stroke={isPaperMode ? '#000000' : '#818CF8'} strokeWidth="1.5" />
        <text x="0" y="-3" fill={isPaperMode ? '#000000' : '#C7D2FE'} fontSize="8.5" fontWeight="bold" textAnchor="middle">Nitrosomonas</text>
        <text x="0" y="11" fill={isPaperMode ? '#000000' : '#A5B4FC'} fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">NO₂⁻ (Nitrites)</text>
      </g>

      {/* Nitrification: Nitrates (NO3-) Node (Assimilation & Denitrification hub) */}
      <g transform="translate(60, 110)">
        <rect x="-45" y="-18" width="90" height="36" rx="6" fill={isPaperMode ? '#FFFFFF' : '#064E3B'} stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth="1.5" />
        <text x="0" y="-3" fill={isPaperMode ? '#000000' : '#A7F3D0'} fontSize="8.5" fontWeight="bold" textAnchor="middle">Nitrobacter</text>
        <text x="0" y="11" fill={isPaperMode ? '#000000' : '#6EE7B7'} fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">NO₃⁻ (Nitrates)</text>
      </g>

      {/* Denitrification Arrow returning to Atmosphere (Right side) */}
      <g transform="translate(170, 40)">
        <path d="M 0 60 L 0 -95" stroke={isPaperMode ? '#000000' : '#F43F5E'} strokeWidth={isPaperMode ? 2.5 : 3} strokeDasharray="5 3" />
        <polygon points="0,-102 -5,-92 5,-92" fill={isPaperMode ? '#000000' : '#F43F5E'} />
        <text x="12" y="-15" fill={isPaperMode ? '#000000' : '#FB7185'} fontSize="9" fontWeight="bold">Denitrification</text>
        <text x="12" y="-2" fill={isPaperMode ? '#475569' : '#FDA4AF'} fontSize="8">(Pseudomonas)</text>
      </g>

      {/* Nitrogen Fixation Downward Flow (Left side) */}
      <g transform="translate(-200, -40)">
        <path d="M 40 -30 L 0 25" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2.5 : 3} />
        <polygon points="0,32 -8,22 2,20" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        <text x="-10" y="-5" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="9" fontWeight="bold" textAnchor="end">N₂ Fixation</text>
      </g>

      {/* Conversion Arrows */}
      <line x1="-15" y1="45" x2="15" y2="45" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="60" y1="63" x2="60" y2="92" stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth="2.5" />
    </g>
  );
};

/**
 * 27. High-Resolution Male Reproductive System Diagram (Sagittal & Coronal Cross-Section)
 * Textbook-accurate representation based on Gray's Anatomy:
 * - Testis with Seminiferous Tubules & Tunica Albuginea
 * - Epididymis (Head, Body, Tail)
 * - Vas Deferens / Ductus Deferens
 * - Seminal Vesicle
 * - Prostate Gland & Prostatic Urethra
 * - Bulbourethral (Cowper's) Gland
 * - Urinary Bladder
 * - Corpus Cavernosum & Corpus Spongiosum
 * - Glans Penis & Urethral Meatus
 * - Scrotum & Spermatic Cord
 */
export const MaleReproductiveSystemDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="male-reproductive-diagram-group" transform="translate(-10, 0)">
      {/* 1. Urinary Bladder (Anterosuperior) */}
      <g transform="translate(0, -60)">
        <path
          d="M -35 -20 C -20 -45 20 -45 35 -20 C 45 10 30 30 0 35 C -30 30 -45 10 -35 -20 Z"
          fill={isPaperMode ? '#FFFFFF' : '#F59E0B'}
          fillOpacity={isPaperMode ? 1 : 0.85}
          stroke={isPaperMode ? '#000000' : '#D97706'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        <text x="0" y="5" fill={isPaperMode ? '#000000' : '#78350F'} fontSize="9" fontWeight="bold" textAnchor="middle">Urinary Bladder</text>
      </g>

      {/* 2. Prostate Gland (Surrounding Prostatic Urethra directly below bladder) */}
      <g transform="translate(0, -10)">
        <ellipse cx="0" cy="0" rx="28" ry="18" fill={isPaperMode ? '#E2E8F0' : '#8B5CF6'} stroke={isPaperMode ? '#000000' : '#A78BFA'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="0" y1="-18" x2="0" y2="18" stroke={isPaperMode ? '#000000' : '#EDE9FE'} strokeWidth={3} />
      </g>

      {/* 3. Seminal Vesicles (Posterosuperior to prostate) */}
      <g transform="translate(32, -35)">
        <path d="M 0 0 C 15 -10 28 5 22 20 C 18 30 5 25 0 15 Z" fill={isPaperMode ? '#FFFFFF' : '#EC4899'} stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={isPaperMode ? 1.75 : 2} />
        <path d="M 6 4 Q 14 10 12 18" stroke={isPaperMode ? '#000000' : '#FBCFE8'} strokeWidth={1.5} fill="none" />
      </g>

      {/* 4. Bulbourethral (Cowper's) Gland */}
      <g transform="translate(15, 18)">
        <circle cx="0" cy="0" r="5.5" fill={isPaperMode ? '#CBD5E1' : '#06B6D4'} stroke={isPaperMode ? '#000000' : '#22D3EE'} strokeWidth={1.5} />
      </g>

      {/* 5. Vas Deferens (Long sweeping duct looping around bladder into prostate) */}
      <path
        d="M -115 110 C -125 50 -105 -20 -70 -65 C -45 -95 10 -95 35 -60 C 45 -40 38 -20 15 -10"
        stroke={isPaperMode ? '#000000' : '#3B82F6'}
        strokeWidth={isPaperMode ? 3.5 : 4}
        fill="none"
        strokeLinecap="round"
      />

      {/* 6. Scrotum & Testis */}
      <g transform="translate(-120, 115)">
        {/* Scrotal sac */}
        <ellipse cx="0" cy="5" rx="34" ry="40" fill={isPaperMode ? '#F8FAFC' : '#334155'} stroke={isPaperMode ? '#000000' : '#64748B'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* Testis (with seminiferous tubules) */}
        <ellipse cx="2" cy="5" rx="22" ry="28" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* Coiled seminiferous tubule striations */}
        <path d="M -8 -10 Q 2 -15 8 -8 Q 12 0 4 8 Q -6 15 2 20" stroke={isPaperMode ? '#000000' : '#E0F2FE'} strokeWidth={1.5} fill="none" />
        {/* Epididymis (Crescent structure capping the testis) */}
        <path
          d="M -16 -18 C -5 -32 20 -28 22 -10 C 24 10 20 28 8 34"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#10B981'}
          strokeWidth={isPaperMode ? 5.5 : 6.5}
          strokeLinecap="round"
        />
      </g>

      {/* 7. Penis (Shaft, Erectile Tissues & Glans) */}
      <g transform="translate(0, 30)">
        {/* Shaft / Corpora Cavernosa & Spongiosum */}
        <path
          d="M -15 0 L -18 90 C -18 105 18 105 18 90 L 15 0 Z"
          fill={isPaperMode ? '#FFFFFF' : '#BE185D'}
          stroke={isPaperMode ? '#000000' : '#E11D48'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Spongy Urethra running down the center */}
        <line x1="0" y1="0" x2="0" y2="92" stroke={isPaperMode ? '#000000' : '#FCE7F3'} strokeWidth={2.5} />
        {/* Glans Penis (Acorn-shaped head) */}
        <path
          d="M -22 90 C -22 118 0 130 0 130 C 0 130 22 118 22 90 Z"
          fill={isPaperMode ? '#E2E8F0' : '#F43F5E'}
          stroke={isPaperMode ? '#000000' : '#FDA4AF'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* External Urethral Orifice (Meatus) */}
        <line x1="0" y1="120" x2="0" y2="128" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={2} />
      </g>
    </g>
  );
};

/**
 * 28. High-Resolution Hydrological / Water Cycle Diagram
 * - Solar Radiation driving evaporation
 * - Ocean & Lake Evaporation
 * - Plant Evapotranspiration
 * - Cloud Condensation
 * - Precipitation (Rain & Snow over mountains)
 * - Surface Runoff & Infiltration / Groundwater Table
 */
export const WaterCycleDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="water-cycle-diagram-group" transform="translate(0, 0)">
      {/* Sun (Upper Left Energy Driver) */}
      <g transform="translate(-180, -100)">
        <circle cx="0" cy="0" r="22" fill={isPaperMode ? '#FFFFFF' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#FBBF24'} strokeWidth={isPaperMode ? 2 : 3} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
          <line
            key={`sun-ray-${i}`}
            x1={Math.cos((ang * Math.PI) / 180) * 28}
            y1={Math.sin((ang * Math.PI) / 180) * 28}
            x2={Math.cos((ang * Math.PI) / 180) * 38}
            y2={Math.sin((ang * Math.PI) / 180) * 38}
            stroke={isPaperMode ? '#000000' : '#F59E0B'}
            strokeWidth={2}
          />
        ))}
      </g>

      {/* Condensation Clouds (Upper Center & Right) */}
      <g transform="translate(0, -95)">
        <path
          d="M -40 10 C -55 10 -60 -5 -45 -15 C -45 -30 -20 -35 -5 -25 C 10 -35 35 -30 35 -15 C 50 -5 45 10 30 10 Z"
          fill={isPaperMode ? '#FFFFFF' : '#CBD5E1'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        <text x="-5" y="-5" fill={isPaperMode ? '#000000' : '#334155'} fontSize="9" fontWeight="bold" textAnchor="middle">Condensation</text>
      </g>

      {/* Mountain & Land Terrain */}
      <polygon points="-50,-10 60,140 -240,140" fill={isPaperMode ? '#F1F5F9' : '#374151'} stroke={isPaperMode ? '#000000' : '#6B7280'} strokeWidth={isPaperMode ? 2 : 2} />
      {/* Snow cap */}
      <polygon points="-50,-10 -25,25 -45,35 -65,20" fill={isPaperMode ? '#FFFFFF' : '#F8FAFC'} stroke={isPaperMode ? '#000000' : '#E2E8F0'} strokeWidth={1.5} />

      {/* Precipitation Rain drops */}
      <g transform="translate(20, -50)">
        {[0, 15, 30, -15].map((x, i) => (
          <line key={`rain-${i}`} x1={x} y1={0} x2={x - 8} y2={22} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={2} strokeDasharray="3 3" />
        ))}
        <text x="5" y="40" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="9" fontWeight="bold">Precipitation</text>
      </g>

      {/* Ocean Reservoir (Right) */}
      <path d="M 60 70 C 90 70 120 75 240 75 L 240 140 L 60 140 Z" fill={isPaperMode ? '#FFFFFF' : '#0284C7'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 2 : 2.5} />

      {/* Evaporation Waves & Arrows */}
      <g transform="translate(160, 45)">
        <path d="M -15 15 Q -5 0 -15 -15" stroke={isPaperMode ? '#000000' : '#60A5FA'} strokeWidth={2.5} fill="none" />
        <polygon points="-15,-20 -20,-10 -10,-10" fill={isPaperMode ? '#000000' : '#60A5FA'} />
        <path d="M 15 15 Q 25 0 15 -15" stroke={isPaperMode ? '#000000' : '#60A5FA'} strokeWidth={2.5} fill="none" />
        <polygon points="15,-20 10,-10 20,-10" fill={isPaperMode ? '#000000' : '#60A5FA'} />
        <text x="0" y="2" fill={isPaperMode ? '#000000' : '#DBEAFE'} fontSize="9" fontWeight="bold" textAnchor="middle">Evaporation</text>
      </g>

      {/* Transpiration from Vegetation */}
      <g transform="translate(-110, 60)">
        <ellipse cx="0" cy="0" rx="16" ry="14" fill={isPaperMode ? '#FFFFFF' : '#10B981'} stroke={isPaperMode ? '#000000' : '#059669'} strokeWidth={1.5} />
        <path d="M 0 -15 Q 8 -28 0 -40" stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth={2} fill="none" />
        <polygon points="0,-45 -4,-37 4,-37" fill={isPaperMode ? '#000000' : '#34D399'} />
        <text x="18" y="-25" fill={isPaperMode ? '#000000' : '#34D399'} fontSize="8" fontWeight="bold">Transpiration</text>
      </g>

      {/* Runoff & Infiltration */}
      <path d="M -10 50 Q 40 85 80 85" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={3} fill="none" />
      <text x="35" y="105" fill={isPaperMode ? '#000000' : '#93C5FD'} fontSize="8.5" fontWeight="bold">Runoff & Infiltration</text>
    </g>
  );
};

/**
 * 29. High-Resolution Electric Circuit Diagram
 * Modeled on standard physics and electrical engineering schematics:
 * - DC Chemical Cell / Battery Voltage Source (Long positive, short thick negative)
 * - Single-Pole Knife Switch (Contact terminals and hinged arm)
 * - Fixed Linear Resistor (With color bands or zig-zag / IEC standard rectangular body)
 * - Series DC Ammeter (Galvanometer dial needle and "A" symbol)
 * - Parallel High-Impedance DC Voltmeter ("V" symbol across load)
 * - Incandescent Light Bulb (Filament loop inside glass bulb)
 * - Conventional Current arrows (Positive to Negative) and Electron Drift markers
 */
export const ElectricCircuitDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const isColor = !isPaperMode;
  const wireColor = isPaperMode ? '#000000' : '#38BDF8';
  const componentBg = isPaperMode ? '#FFFFFF' : '#0F172A';
  const accentColor = isPaperMode ? '#0F172A' : '#F59E0B';

  return (
    <g id="electric-circuit-group" transform="translate(0, 0)">
      {/* 1. Main Circuit Loop Wires */}
      {/* Top Wire */}
      <line x1="-180" y1="-90" x2="180" y2="-90" stroke={wireColor} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />
      {/* Right Wire */}
      <line x1="180" y1="-90" x2="180" y2="90" stroke={wireColor} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />
      {/* Bottom Wire */}
      <line x1="180" y1="90" x2="-180" y2="90" stroke={wireColor} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />
      {/* Left Wire */}
      <line x1="-180" y1="90" x2="-180" y2="-90" stroke={wireColor} strokeWidth={isPaperMode ? 3 : 3.5} strokeLinecap="round" />

      {/* 2. DC Voltage Cell / Battery (Left Vertical Branch) */}
      <g id="circuit-battery" transform="translate(-180, 0)">
        <rect x="-24" y="-35" width="48" height="70" fill={componentBg} stroke="none" />
        {/* Long Positive Plate (+) */}
        <line x1="-20" y1="-20" x2="20" y2="-20" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 3.5 : 4.5} strokeLinecap="round" />
        {/* Short Thick Negative Plate (-) */}
        <line x1="-10" y1="-10" x2="10" y2="-10" stroke={isPaperMode ? '#000000' : '#3B82F6'} strokeWidth={isPaperMode ? 6 : 7} strokeLinecap="round" />
        {/* Second Cell (Battery Pair) */}
        <line x1="-20" y1="10" x2="20" y2="10" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 3.5 : 4.5} strokeLinecap="round" />
        <line x1="-10" y1="20" x2="10" y2="20" stroke={isPaperMode ? '#000000' : '#3B82F6'} strokeWidth={isPaperMode ? 6 : 7} strokeLinecap="round" />
        {/* Terminals Connecting Wires */}
        <line x1="0" y1="-35" x2="0" y2="-20" stroke={wireColor} strokeWidth={3} />
        <line x1="0" y1="20" x2="0" y2="35" stroke={wireColor} strokeWidth={3} />
        {/* Polarity Symbols */}
        <text x="26" y="-16" fill={isPaperMode ? '#000000' : '#EF4444'} fontSize="14" fontWeight="bold" fontFamily="monospace">+</text>
        <text x="26" y="24" fill={isPaperMode ? '#000000' : '#3B82F6'} fontSize="16" fontWeight="bold" fontFamily="monospace">-</text>
        <text x="-48" y="5" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="10" fontWeight="bold" textAnchor="middle">Battery (12V)</text>
      </g>

      {/* 3. Switch / Key (Top Horizontal Branch - Left) */}
      <g id="circuit-switch" transform="translate(-70, -90)">
        <rect x="-35" y="-18" width="70" height="36" fill={componentBg} stroke="none" />
        {/* Terminal Contacts */}
        <circle cx="-20" cy="0" r="4.5" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#FEF3C7'} strokeWidth={1.5} />
        <circle cx="20" cy="0" r="4.5" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#FEF3C7'} strokeWidth={1.5} />
        {/* Switch Lever (Closed/Active position with slight angle for realism) */}
        <line x1="-18" y1="-2" x2="18" y2="-12" stroke={isPaperMode ? '#000000' : '#10B981'} strokeWidth={3.5} strokeLinecap="round" />
        <text x="0" y="-22" fill={isPaperMode ? '#000000' : '#34D399'} fontSize="10" fontWeight="bold" textAnchor="middle">Switch (Closed)</text>
      </g>

      {/* 4. Series DC Ammeter (Top Horizontal Branch - Right) */}
      <g id="circuit-ammeter" transform="translate(65, -90)">
        <rect x="-25" y="-25" width="50" height="50" fill={componentBg} stroke="none" />
        <circle cx="0" cy="0" r="20" fill={isPaperMode ? '#FFFFFF' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={2.5} />
        <text x="0" y="7" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="18" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">A</text>
        <text x="0" y="-28" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="9.5" fontWeight="bold" textAnchor="middle">Ammeter (Series)</text>
      </g>

      {/* 5. Fixed Resistor (Right Vertical Branch) */}
      <g id="circuit-resistor" transform="translate(180, 0)">
        <rect x="-24" y="-35" width="48" height="70" fill={componentBg} stroke="none" />
        {/* Resistor Rectangular Body (IEC Standard) */}
        <rect x="-14" y="-28" width="28" height="56" rx="3" fill={isPaperMode ? '#FFFFFF' : '#334155'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={2.5} />
        {/* Color Bands (Brown, Black, Red, Gold = 1 kΩ) */}
        {isColor && (
          <g>
            <rect x="-14" y="-20" width="28" height="4" fill="#92400E" />
            <rect x="-14" y="-10" width="28" height="4" fill="#000000" />
            <rect x="-14" y="0" width="28" height="4" fill="#EF4444" />
            <rect x="-14" y="14" width="28" height="4" fill="#FBBF24" />
          </g>
        )}
        <text x="44" y="5" fill={isPaperMode ? '#000000' : '#FBBF24'} fontSize="10" fontWeight="bold" textAnchor="start">Resistor (R = 100 Ω)</text>
      </g>

      {/* 6. Parallel High-Impedance Voltmeter across Resistor */}
      <g id="circuit-voltmeter" transform="translate(180, 0)">
        {/* Voltmeter jumper wires connected in parallel */}
        <path d="M 0 -45 L 80 -45 L 80 -25" fill="none" stroke={wireColor} strokeWidth={2} strokeDasharray={isPaperMode ? '4 2' : undefined} />
        <path d="M 0 45 L 80 45 L 80 25" fill="none" stroke={wireColor} strokeWidth={2} strokeDasharray={isPaperMode ? '4 2' : undefined} />
        {/* Tap Node Dots */}
        <circle cx="0" cy="-45" r="3.5" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        <circle cx="0" cy="45" r="3.5" fill={isPaperMode ? '#000000' : '#38BDF8'} />
        {/* Voltmeter Meter Dial */}
        <g transform="translate(80, 0)">
          <circle cx="0" cy="0" r="18" fill={isPaperMode ? '#FFFFFF' : '#1E293B'} stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={2.5} />
          <text x="0" y="6" fill={isPaperMode ? '#000000' : '#C084FC'} fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">V</text>
          <text x="24" y="4" fill={isPaperMode ? '#334155' : '#C084FC'} fontSize="9" fontWeight="bold" textAnchor="start">Voltmeter (Parallel)</text>
        </g>
      </g>

      {/* 7. Incandescent Lamp / Light Bulb (Bottom Horizontal Branch) */}
      <g id="circuit-lamp" transform="translate(0, 90)">
        <rect x="-30" y="-28" width="60" height="56" fill={componentBg} stroke="none" />
        {/* Bulb Glass Circle */}
        <circle cx="0" cy="0" r="22" fill={isPaperMode ? '#FFFFFF' : '#FEF3C7'} fillOpacity={isPaperMode ? 1 : 0.25} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={2.5} />
        {/* Internal Cross / Filament Symbol (IEC/IEEE) */}
        <line x1="-12" y1="-12" x2="12" y2="12" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={2.5} strokeLinecap="round" />
        <line x1="12" y1="-12" x2="-12" y2="12" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={2.5} strokeLinecap="round" />
        {/* Glowing Halo in Color Mode */}
        {isColor && (
          <circle cx="0" cy="0" r="28" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        )}
        <text x="0" y="38" fill={isPaperMode ? '#000000' : '#FBBF24'} fontSize="10" fontWeight="bold" textAnchor="middle">Load: Incandescent Lamp</text>
      </g>

      {/* 8. Direction of Conventional Current vs Electron Flow */}
      <g id="circuit-current-vectors">
        {/* Top Wire Conventional Current (Left to Right: + to -) */}
        <g transform="translate(-130, -90)">
          <polygon points="10,-6 18,0 10,6" fill={isPaperMode ? '#000000' : '#EF4444'} />
          <text x="0" y="-10" fill={isPaperMode ? '#000000' : '#EF4444'} fontSize="8.5" fontWeight="bold">I (Current: + → -)</text>
        </g>
        {/* Bottom Wire Conventional Current (Right to Left) */}
        <g transform="translate(-100, 90)">
          <polygon points="-10,-6 -18,0 -10,6" fill={isPaperMode ? '#000000' : '#EF4444'} />
        </g>
        {/* Electron Flow Annotation */}
        <g transform="translate(0, -108)">
          <text x="0" y="0" fill={isPaperMode ? '#475569' : '#38BDF8'} fontSize="8" fontFamily="monospace" textAnchor="middle">
            e⁻ Electron Drift (Negative Terminal → Positive Terminal)
          </text>
        </g>
      </g>
    </g>
  );
};

/**
 * 30. High-Resolution Electromagnetic Spectrum Diagram
 * Modeled on standard physics and optics reference charts:
 * - Radio Waves (Long wavelength, low frequency, e.g. AM/FM, TV)
 * - Microwaves (Radar, Satellite, WiFi)
 * - Infrared Radiation (Thermal imaging, heat lamps)
 * - Visible Light Spectrum (Expanded ROYGBIV Rainbow prism 400nm - 700nm)
 * - Ultraviolet Radiation (Sunlight UV-A, UV-B, UV-C)
 * - X-Rays (Diagnostic medical radiography)
 * - Gamma Rays (High-energy nuclear decay, cosmic rays)
 * - Continuous sinusoidal wave displaying wave compression from long λ to short λ
 * - Quantitative frequency (Hz), wavelength (m), and photon energy (eV) scales
 */
export const ElectromagneticSpectrumDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const isColor = !isPaperMode;

  const bands = [
    { name: 'Radio Waves', lambda: '10³ m', freq: '10⁴ Hz', energy: '10⁻¹⁰ eV', x: -185, w: 62, color: '#3B82F6', icon: '📡' },
    { name: 'Microwaves', lambda: '10⁻² m', freq: '10⁸ Hz', energy: '10⁻⁶ eV', x: -123, w: 60, color: '#06B6D4', icon: '📶' },
    { name: 'Infrared (IR)', lambda: '10⁻⁵ m', freq: '10¹² Hz', energy: '10⁻² eV', x: -63, w: 60, color: '#10B981', icon: '🔥' },
    { name: 'Visible Light', lambda: '0.5 µm', freq: '10¹⁵ Hz', energy: '2 eV', x: -3, w: 66, color: '#F59E0B', icon: '🌈' },
    { name: 'Ultraviolet', lambda: '10⁻⁸ m', freq: '10¹⁶ Hz', energy: '10² eV', x: 63, w: 60, color: '#8B5CF6', icon: '☀️' },
    { name: 'X-Rays', lambda: '10⁻¹⁰ m', freq: '10¹⁸ Hz', energy: '10⁴ eV', x: 123, w: 60, color: '#EC4899', icon: '🩻' },
    { name: 'Gamma Rays', lambda: '10⁻¹² m', freq: '10²⁰ Hz', energy: '10⁶ eV', x: 183, w: 60, color: '#EF4444', icon: '☢️' }
  ];

  return (
    <g id="em-spectrum-group" transform="translate(0, 0)">
      {/* 1. Header Gradient Bands Container */}
      <g id="spectrum-bands" transform="translate(0, -75)">
        <rect x="-220" y="-30" width="440" height="60" rx="6" fill={isPaperMode ? '#FFFFFF' : '#0F172A'} stroke={isPaperMode ? '#000000' : '#334155'} strokeWidth={2} />

        {bands.map((b, i) => (
          <g key={`band-${i}`} transform={`translate(${b.x}, 0)`}>
            <rect
              x={-b.w / 2}
              y="-28"
              width={b.w}
              height="56"
              fill={isPaperMode ? (i % 2 === 0 ? '#F8FAFC' : '#E2E8F0') : b.color}
              fillOpacity={isPaperMode ? 1 : 0.22}
              stroke={isPaperMode ? '#000000' : b.color}
              strokeWidth={1}
            />
            <text x="0" y="-8" fill={isPaperMode ? '#000000' : '#FFFFFF'} fontSize="8.5" fontWeight="bold" textAnchor="middle">
              {b.name}
            </text>
            <text x="0" y="8" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="7.5" fontFamily="monospace" textAnchor="middle">
              λ: {b.lambda}
            </text>
            <text x="0" y="20" fill={isPaperMode ? '#475569' : '#CBD5E1'} fontSize="7" fontFamily="monospace" textAnchor="middle">
              f: {b.freq}
            </text>
          </g>
        ))}
      </g>

      {/* 2. Expanded Visible Spectrum Rainbow Prism Beam (ROYGBIV: 700nm Red to 400nm Violet) */}
      <g id="visible-spectrum-expansion" transform="translate(0, 0)">
        {/* Expansion Leader Lines from Visible band down to Prism block */}
        <polygon points="-3,-45 3,-45 110, -5 -110, -5" fill={isPaperMode ? '#F1F5F9' : '#1E293B'} fillOpacity={isPaperMode ? 0.7 : 0.4} stroke={isPaperMode ? '#94A3B8' : '#475569'} strokeWidth={1} strokeDasharray="3 2" />

        {/* Visible Light Rainbow Strip */}
        <g transform="translate(0, 8)">
          <rect x="-140" y="-14" width="280" height="28" rx="4" fill={isPaperMode ? '#FFFFFF' : '#0F172A'} stroke={isPaperMode ? '#000000' : '#E2E8F0'} strokeWidth={1.5} />
          {/* ROYGBIV color cells */}
          {[
            { label: 'Red (700nm)', col: '#EF4444', x: -100, w: 40 },
            { label: 'Orange (620nm)', col: '#F97316', x: -60, w: 40 },
            { label: 'Yellow (580nm)', col: '#EAB308', x: -20, w: 40 },
            { label: 'Green (530nm)', col: '#10B981', x: 20, w: 40 },
            { label: 'Blue (470nm)', col: '#06B6D4', x: 60, w: 40 },
            { label: 'Violet (400nm)', col: '#8B5CF6', x: 100, w: 40 }
          ].map((c, idx) => (
            <g key={`vis-${idx}`} transform={`translate(${c.x}, 0)`}>
              <rect x={-c.w / 2} y="-12" width={c.w} height="24" fill={isPaperMode ? '#FFFFFF' : c.col} fillOpacity={isPaperMode ? 1 : 0.85} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={0.75} />
              <text x="0" y="4" fill={isPaperMode ? '#000000' : '#FFFFFF'} fontSize="7.5" fontWeight="bold" textAnchor="middle">
                {c.label.split(' ')[0]}
              </text>
            </g>
          ))}
          <text x="0" y="24" fill={isPaperMode ? '#000000' : '#FDE68A'} fontSize="9" fontWeight="bold" textAnchor="middle">
            Expanded Visible Spectrum (ROYGBIV: 700 nm → 400 nm)
          </text>
        </g>
      </g>

      {/* 3. Continuous Sinusoidal Transverse Electromagnetic Wave */}
      {/* Shows increasing frequency (decreasing wavelength) from left to right */}
      <g id="sinusoidal-em-wave" transform="translate(0, 75)">
        <rect x="-220" y="-30" width="440" height="60" rx="6" fill={isPaperMode ? '#FFFFFF' : '#090D16'} stroke={isPaperMode ? '#000000' : '#1E293B'} strokeWidth={1.5} />
        {/* Baseline Center Axis */}
        <line x1="-210" y1="0" x2="210" y2="0" stroke={isPaperMode ? '#94A3B8' : '#334155'} strokeWidth={1} strokeDasharray="3 3" />

        {/* Dynamic Transverse Sine Wave Path with progressive spatial frequency compression */}
        <path
          d="M -210 0 
             Q -185 -22 -160 0 Q -135 22 -110 0 
             Q -90 -22 -70 0 Q -50 22 -30 0 
             Q -15 -22 0 0 Q 15 22 30 0 
             Q 42 -22 55 0 Q 68 22 80 0 
             Q 90 -22 100 0 Q 110 22 120 0 
             Q 128 -22 136 0 Q 144 22 152 0 
             Q 158 -22 165 0 Q 172 22 178 0 
             Q 184 -22 190 0 Q 196 22 202 0 Q 206 -22 210 0"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#38BDF8'}
          strokeWidth={isPaperMode ? 2.5 : 3}
          strokeLinecap="round"
        />

        {/* Wavelength λ dimension markers */}
        <g transform="translate(-160, -24)">
          <line x1="-25" y1="0" x2="25" y2="0" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={1.5} />
          <text x="0" y="-4" fill={isPaperMode ? '#000000' : '#F59E0B'} fontSize="8" fontWeight="bold" textAnchor="middle">Long Wavelength (λ)</text>
        </g>
        <g transform="translate(160, -24)">
          <line x1="-12" y1="0" x2="12" y2="0" stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={1.5} />
          <text x="0" y="-4" fill={isPaperMode ? '#000000' : '#EF4444'} fontSize="8" fontWeight="bold" textAnchor="middle">Short λ (High E)</text>
        </g>
      </g>

      {/* 4. Energy & Frequency Directional Arrows */}
      <g id="spectrum-energy-gradient" transform="translate(0, 122)">
        {/* Left-to-Right: Increasing Frequency (f) and Photon Energy (E = hf) */}
        <line x1="-210" y1="0" x2="210" y2="0" stroke={isPaperMode ? '#000000' : '#EC4899'} strokeWidth={2} strokeLinecap="round" />
        <polygon points="210,-4 218,0 210,4" fill={isPaperMode ? '#000000' : '#EC4899'} />
        <text x="0" y="-5" fill={isPaperMode ? '#000000' : '#F472B6'} fontSize="9" fontWeight="bold" textAnchor="middle">
          Increasing Photon Energy (E = hν) & Frequency (Hz) ────►
        </text>
        <text x="0" y="11" fill={isPaperMode ? '#475569' : '#94A3B8'} fontSize="8" textAnchor="middle">
          ◄──── Increasing Wavelength (λ in meters)
        </text>
      </g>
    </g>
  );
};

/**
 * Dynamic Custom SVG Diagram
 * Safely parses and renders customized SVG paths generated by AI for any arbitrary biological/scientific structure
 */
export const DynamicCustomSvgDiagram: React.FC<{ svgCode: string; isPaperMode: boolean }> = ({ svgCode, isPaperMode }) => {
  // Clean up any outer <svg> wrapper or extract inner tags to prevent malformed SVG nesting
  const sanitizedMarkup = React.useMemo(() => {
    if (!svgCode || typeof svgCode !== 'string') return '';
    let cleaned = svgCode.trim();
    // If wrapped in ```xml or ```svg markdown fences, remove them
    cleaned = cleaned.replace(/^```(xml|svg|html)?/i, '').replace(/```$/i, '').trim();
    // If outer <svg> tag is present, extract its children
    const svgMatch = cleaned.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (svgMatch && svgMatch[1]) {
      cleaned = svgMatch[1];
    }
    return cleaned;
  }, [svgCode]);

  return (
    <g 
      id="dynamic-custom-svg-container"
      className={isPaperMode ? 'filter contrast-125' : ''}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
    />
  );
};

