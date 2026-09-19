import React from 'react';

export interface DiagramProps {
  isPaperMode: boolean;
  activePinId?: string | null;
  renderMode?: '3d' | '2d' | 'paper';
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
 * Authentically modeled on authoritative cytology reference diagrams (Science Facts / Modern Biology):
 * - Vertical fusiform spindle body with tapered posterior apex and invaginated anterior cytostome/reservoir.
 * - Outer Pellicle & Plasma Membrane in biological green.
 * - Long emergent whiplash flagellum with sinusoidal wave loop springing from basal body.
 * - Photoreceptor (Paraflagellar body) & red carotenoid Eyespot (Stigma).
 * - Pulsatile Contractile Vacuole with star-like radiating collecting canals.
 * - Prominent circular rose-pink Nucleus with dense central magenta Nucleolus.
 * - Rough & Smooth Endoplasmic Reticulum, stacked Golgi cisternae, Lysosomes, and Ribosomes.
 * - Lobed Chloroplasts with pyrenoids, dark purple Paramylon reserve grains, and Mitochondria with cristae.
 */
export const EuglenaDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="euglena-diagram-group" transform="translate(0, 0)">
      {/* 1. Main Fusiform Cell Body: Pellicle (Outer layer) & Plasma Membrane */}
      {/* Standard Textbook Morphology: Bilobed Anterior End with Reservoir at the TOP, pointed posterior tail at the BOTTOM */}
      <path
        d="M 0 160 
           C -20 135 -48 90 -62 30 
           C -74 -15 -70 -65 -50 -105 
           C -40 -125 -25 -135 -15 -135 
           C -6 -135 -2 -125 0 -115 
           C 2 -125 8 -135 18 -135 
           C 28 -135 40 -120 48 -98 
           C 64 -55 68 -5 56 40 
           C 44 95 18 138 0 160 Z"
        fill={isPaperMode ? '#F8FAFC' : '#86EFAC'}
        fillOpacity={isPaperMode ? 1 : 0.9}
        stroke={isPaperMode ? '#000000' : '#166534'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* Plasma Membrane (Underlying inner border) */}
      <path
        d="M 0 152 
           C -18 128 -44 84 -58 26 
           C -69 -16 -66 -62 -47 -100 
           C -38 -118 -25 -127 -16 -127 
           C -8 -127 -3 -118 0 -108 
           C 3 -118 9 -127 17 -127 
           C 26 -127 36 -113 43 -93 
           C 57 -51 61 -3 50 38 
           C 39 90 16 132 0 152 Z"
        fill={isPaperMode ? '#F1F5F9' : '#BBF7D0'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#475569' : '#22C55E'}
        strokeWidth={isPaperMode ? 1.5 : 1.75}
      />

      {/* Pellicular Helical Striations (Delicate fine helical protein strips) */}
      <g opacity={isPaperMode ? 0.35 : 0.35}>
        {[-95, -65, -30, 5, 40, 75, 110].map((yOff, sIdx) => (
          <path
            key={`pellicle-strip-${sIdx}`}
            d={`M -52 ${yOff + 15} Q 0 ${yOff - 10} 52 ${yOff - 25}`}
            stroke={isPaperMode ? '#000000' : '#15803D'}
            strokeWidth={1.25}
            strokeDasharray="4 3"
            fill="none"
          />
        ))}
      </g>

      {/* 2. Anterior Cytostome Gullet & Flask-Shaped Reservoir (Ampulla) at the TOP */}
      <path
        d="M -6 -130 
           C -4 -115 -6 -102 -12 -85 
           C -18 -68 -2 -58 0 -58 
           C 4 -58 18 -68 12 -85 
           C 6 -102 4 -115 6 -130 Z"
        fill={isPaperMode ? '#CBD5E1' : '#DCFCE7'}
        fillOpacity={isPaperMode ? 1 : 0.95}
        stroke={isPaperMode ? '#000000' : '#166534'}
        strokeWidth={isPaperMode ? 2 : 2.5}
      />

      {/* Basal Blepharoplasts / Kinetosomes at floor of reservoir */}
      <circle cx="-5" cy="-88" r="3.5" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />
      <circle cx="2" cy="-88" r="3" fill={isPaperMode ? '#000000' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#B45309'} strokeWidth={1} />

      {/* Short non-emergent accessory flagellum inside reservoir */}
      <path
        d="M 2 -88 C 4 -80 2 -72 0 -66"
        stroke={isPaperMode ? '#000000' : '#15803D'}
        strokeWidth={isPaperMode ? 2.5 : 2.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Flagellum Internal Root inside reservoir connecting basal body directly to cytostome */}
      <path
        d="M -5 -88 C -8 -100 -8 -114 -6 -128"
        stroke={isPaperMode ? '#000000' : '#15803D'}
        strokeWidth={isPaperMode ? 4 : 4.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* 3. Photoreceptor / Paraflagellar Body (Amber swelling on flagellar root) */}
      <ellipse
        cx="-7"
        cy="-105"
        rx="4.5"
        ry="6"
        transform="rotate(15, -7, -105)"
        fill={isPaperMode ? '#000000' : '#EA580C'}
        stroke={isPaperMode ? '#000000' : '#FED7AA'}
        strokeWidth={1.25}
      />

      {/* 4. Eyespot / Stigma (Cluster of bright red carotenoid granules on left of reservoir) */}
      <g id="euglena-eyespot" transform="translate(-20, -98)">
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={isPaperMode ? '#000000' : '#DC2626'} stroke={isPaperMode ? '#000000' : '#FCA5A5'} strokeWidth={1} />
        {!isPaperMode ? (
          <g fill="#EF4444">
            <circle cx="-2.5" cy="-3.5" r="2" />
            <circle cx="1.5" cy="-2.5" r="1.8" />
            <circle cx="-1.5" cy="1.5" r="2.2" />
            <circle cx="2.5" cy="3" r="1.6" />
            <circle cx="-2.5" cy="4.5" r="1.5" />
          </g>
        ) : (
          <g fill="#FFFFFF">
            <circle cx="-2.5" cy="-3.5" r="1.5" />
            <circle cx="1.5" cy="-2.5" r="1.3" />
            <circle cx="-1.5" cy="1.5" r="1.5" />
            <circle cx="2.5" cy="3" r="1.2" />
          </g>
        )}
      </g>

      {/* 5. Pulsatile Osmoregulatory Contractile Vacuole with Star-Like Collecting Canals */}
      <g id="euglena-contractile-vacuole" transform="translate(22, -92)">
        {/* Radiating collecting canals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, cIdx) => (
          <line
            key={`canal-${cIdx}`}
            x1="0"
            y1="0"
            x2={Math.cos((angle * Math.PI) / 180) * 16}
            y2={Math.sin((angle * Math.PI) / 180) * 16}
            stroke={isPaperMode ? '#000000' : '#38BDF8'}
            strokeWidth={isPaperMode ? 1.5 : 1.75}
            strokeLinecap="round"
          />
        ))}
        {/* Central circular contractile vacuole vesicle */}
        <circle
          cx="0"
          cy="0"
          r="10.5"
          fill={isPaperMode ? '#FFFFFF' : '#E0F2FE'}
          stroke={isPaperMode ? '#000000' : '#0284C7'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {!isPaperMode && (
          <circle cx="-3" cy="-3" r="3" fill="#FFFFFF" fillOpacity={0.7} />
        )}
      </g>

      {/* 6. Lobed Ribbon Chloroplasts (Radiating through cytoplasm) */}
      {[
        { x: -35, y: -45, rot: -30, scale: 0.95 },
        { x: 38, y: -42, rot: 25, scale: 0.95 },
        { x: -44, y: 15, rot: -15, scale: 1.05 },
        { x: 42, y: 22, rot: 20, scale: 1.05 },
        { x: -32, y: 75, rot: -35, scale: 0.9 },
        { x: 34, y: 78, rot: 35, scale: 0.9 },
        { x: 0, y: 115, rot: 5, scale: 0.85 }
      ].map((cp, cIdx) => (
        <g key={`chloroplast-lobe-${cIdx}`} transform={`translate(${cp.x}, ${cp.y}) rotate(${cp.rot}) scale(${cp.scale})`}>
          {/* Main chloroplast body */}
          <ellipse
            cx="0"
            cy="0"
            rx="20"
            ry="11"
            fill={isPaperMode ? '#334155' : '#16A34A'}
            stroke={isPaperMode ? '#000000' : '#14532D'}
            strokeWidth={isPaperMode ? 1.5 : 2}
          />
          {/* Thylakoid lamellae bands */}
          <path d="M -13 -3 Q 0 -5 13 -3" stroke={isPaperMode ? '#FFFFFF' : '#86EFAC'} strokeWidth={1} fill="none" opacity={0.6} />
          <path d="M -13 3 Q 0 5 13 3" stroke={isPaperMode ? '#FFFFFF' : '#86EFAC'} strokeWidth={1} fill="none" opacity={0.6} />
          {/* Central Pyrenoid (Proteinaceous core with paramylon cap) */}
          <circle
            cx="0"
            cy="0"
            r="4.5"
            fill={isPaperMode ? '#FFFFFF' : '#BBF7D0'}
            stroke={isPaperMode ? '#000000' : '#15803D'}
            strokeWidth={1.2}
          />
          <circle
            cx="0"
            cy="0"
            r="2"
            fill={isPaperMode ? '#000000' : '#166534'}
          />
        </g>
      ))}

      {/* 7. Centrally Located Spherical Nucleus with Dense Nucleolus */}
      <g id="euglena-nucleus" transform="translate(-4, 15)">
        {/* Nuclear envelope (Double membrane with nuclear pores) */}
        <circle
          cx="0"
          cy="0"
          r="28"
          fill={isPaperMode ? '#E2E8F0' : '#FDA4AF'}
          fillOpacity={isPaperMode ? 1 : 0.85}
          stroke={isPaperMode ? '#000000' : '#E11D48'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Chromatin granules / strands */}
        <g opacity={isPaperMode ? 0.4 : 0.6}>
          {[-16, -9, 0, 10, 18].map((xP, i) => (
            <circle key={`chromatin-${i}`} cx={xP} cy={((i % 2) ? -8 : 8)} r={1.5} fill={isPaperMode ? '#000000' : '#9F1239'} />
          ))}
        </g>
        {/* Dense central Endosome / Nucleolus */}
        <circle
          cx="0"
          cy="0"
          r="10.5"
          fill={isPaperMode ? '#000000' : '#C026D3'}
          stroke={isPaperMode ? '#000000' : '#701A75'}
          strokeWidth={isPaperMode ? 1.5 : 2}
        />
        {!isPaperMode && (
          <circle cx="-3" cy="-3" r="3" fill="#F0ABFC" fillOpacity={0.7} />
        )}
      </g>

      {/* 8. Endoplasmic Reticulum (Rough ER with ribosomes & Smooth ER tubules) */}
      <g id="euglena-er" transform="translate(18, 12)">
        <path
          d="M 8 -18 C 14 -12 18 -6 16 2 C 14 10 18 18 22 24"
          stroke={isPaperMode ? '#000000' : '#D97706'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          fill="none"
        />
        <path
          d="M 12 -14 C 18 -8 22 -2 20 6 C 18 14 22 20 26 26"
          stroke={isPaperMode ? '#000000' : '#F59E0B'}
          strokeWidth={isPaperMode ? 1.5 : 1.75}
          fill="none"
        />
        {/* Ribosomes attached to RER */}
        {!isPaperMode && (
          <g fill="#78350F">
            <circle cx="10" cy="-14" r="1.3" />
            <circle cx="15" cy="-7" r="1.3" />
            <circle cx="18" cy="1" r="1.3" />
            <circle cx="16" cy="9" r="1.3" />
            <circle cx="21" cy="18" r="1.3" />
          </g>
        )}
      </g>

      {/* 9. Stacked Golgi Dictyosome Cisternae */}
      <g id="euglena-golgi" transform="translate(-16, -18) rotate(15)">
        <path d="M -16 -6 C -8 -9 8 -9 16 -6" stroke={isPaperMode ? '#000000' : '#EC4899'} strokeWidth={isPaperMode ? 2.5 : 3} strokeLinecap="round" fill="none" />
        <path d="M -14 -1 C -7 -4 7 -4 14 -1" stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={isPaperMode ? 2.5 : 3} strokeLinecap="round" fill="none" />
        <path d="M -12 4 C -6 1 6 1 12 4" stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={isPaperMode ? 2 : 2.5} strokeLinecap="round" fill="none" />
        {/* Secretory vesicles budding off Golgi */}
        <circle cx="-17" cy="-7" r="2" fill={isPaperMode ? '#000000' : '#FBCFE8'} />
        <circle cx="17" cy="-5" r="2.2" fill={isPaperMode ? '#000000' : '#FBCFE8'} />
        <circle cx="14" cy="2" r="1.8" fill={isPaperMode ? '#000000' : '#FBCFE8'} />
      </g>

      {/* 10. Mitochondria with Folded Cristae */}
      {/* Upper-left mitochondrion */}
      <g id="mitochondria-1" transform="translate(-32, -68) rotate(25)">
        <rect
          x="-9"
          y="-5.5"
          width="18"
          height="11"
          rx="5.5"
          fill={isPaperMode ? '#1E293B' : '#DC2626'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={1.5}
        />
        <path d="M -5 -2.5 L -3 2.5 L 0 -2.5 L 3 2.5 L 5 -2.5" stroke={isPaperMode ? '#FFFFFF' : '#FDE047'} strokeWidth={1.2} fill="none" />
      </g>

      {/* Upper-right mitochondrion */}
      <g id="mitochondria-2" transform="translate(34, -64) rotate(-20)">
        <rect
          x="-9"
          y="-5.5"
          width="18"
          height="11"
          rx="5.5"
          fill={isPaperMode ? '#1E293B' : '#DC2626'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={1.5}
        />
        <path d="M -5 -2.5 L -3 2.5 L 0 -2.5 L 3 2.5 L 5 -2.5" stroke={isPaperMode ? '#FFFFFF' : '#FDE047'} strokeWidth={1.2} fill="none" />
      </g>

      {/* Lower-left mitochondrion */}
      <g id="mitochondria-3" transform="translate(-36, 52) rotate(-15)">
        <rect
          x="-9"
          y="-5.5"
          width="18"
          height="11"
          rx="5.5"
          fill={isPaperMode ? '#1E293B' : '#DC2626'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={1.5}
        />
        <path d="M -5 -2.5 L -3 2.5 L 0 -2.5 L 3 2.5 L 5 -2.5" stroke={isPaperMode ? '#FFFFFF' : '#FDE047'} strokeWidth={1.2} fill="none" />
      </g>

      {/* Lower-right mitochondrion */}
      <g id="mitochondria-4" transform="translate(35, 58) rotate(30)">
        <rect
          x="-8"
          y="-5"
          width="16"
          height="10"
          rx="5"
          fill={isPaperMode ? '#1E293B' : '#DC2626'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={1.5}
        />
        <path d="M -4 -2 L -2 2 L 0 -2 L 2 2 L 4 -2" stroke={isPaperMode ? '#FFFFFF' : '#FDE047'} strokeWidth={1.2} fill="none" />
      </g>

      {/* 11. Paramylon Reserve Granules (Dark violet/purple oval carbohydrate storage grains) */}
      {[
        { x: 2, y: -30, rx: 7, ry: 4.5, rot: 10 },
        { x: 38, y: -10, rx: 7, ry: 4.5, rot: -20 },
        { x: -10, y: 48, rx: 7, ry: 4.5, rot: 35 },
        { x: 6, y: 70, rx: 6, ry: 4, rot: -15 },
        { x: -26, y: 92, rx: 5.5, ry: 3.5, rot: 25 },
        { x: 28, y: 98, rx: 5.5, ry: 3.5, rot: -30 }
      ].map((pm, pIdx) => (
        <g key={`paramylon-grain-${pIdx}`} transform={`translate(${pm.x}, ${pm.y}) rotate(${pm.rot})`}>
          <ellipse
            cx="0"
            cy="0"
            rx={pm.rx}
            ry={pm.ry}
            fill={isPaperMode ? '#000000' : '#581C87'}
            stroke={isPaperMode ? '#000000' : '#C084FC'}
            strokeWidth={1}
          />
          {!isPaperMode && (
            <ellipse cx="-1.5" cy="-1" rx={pm.rx * 0.4} ry={pm.ry * 0.4} fill="#E9D5FF" fillOpacity={0.7} />
          )}
        </g>
      ))}

      {/* 12. Lysosomes (Small purple circular vesicles) */}
      <g id="lysosomes">
        <circle cx="16" cy="42" r="3.5" fill={isPaperMode ? '#000000' : '#9333EA'} stroke={isPaperMode ? '#000000' : '#F3E8FF'} strokeWidth={1} />
        <circle cx="-22" cy="62" r="3.5" fill={isPaperMode ? '#000000' : '#9333EA'} stroke={isPaperMode ? '#000000' : '#F3E8FF'} strokeWidth={1} />
        <circle cx="26" cy="-2" r="3" fill={isPaperMode ? '#000000' : '#9333EA'} stroke={isPaperMode ? '#000000' : '#F3E8FF'} strokeWidth={1} />
      </g>

      {/* 13. Free Ribosomes (Scattered dark stipples in cytoplasm) */}
      <g id="free-ribosomes" fill={isPaperMode ? '#000000' : '#1E293B'} opacity={isPaperMode ? 0.5 : 0.7}>
        <circle cx="-16" cy="-70" r="1.3" />
        <circle cx="18" cy="-68" r="1.3" />
        <circle cx="-35" cy="-25" r="1.3" />
        <circle cx="-20" cy="-35" r="1.3" />
        <circle cx="-40" cy="18" r="1.3" />
        <circle cx="-30" cy="40" r="1.3" />
        <circle cx="2" cy="46" r="1.3" />
        <circle cx="20" cy="58" r="1.3" />
        <circle cx="-4" cy="78" r="1.3" />
      </g>

      {/* 14. PROMINENT LONG EMERGENT LOCOMOTORY WHIPLASH FLAGELLUM (Attached directly to Basal Body at floor of Reservoir) */}
      {/* Originates at basal body (-5, -88), passes continuously through cytostome (-6, -128), and sweeps forward into an undulating sinusoidal locomotory wave */}
      <g id="euglena-flagellum-on-top">
        {/* Contrast outline stroke ensuring 100% visibility on white, paper, or dark backgrounds */}
        <path
          d="M -5 -88 
             C -8 -104 -8 -118 -6 -128 
             C -25 -165 -65 -205 -125 -225 
             C -175 -242 -215 -246 -240 -238 
             C -265 -230 -288 -200 -282 -155 
             C -276 -115 -248 -85 -268 -45"
          stroke={isPaperMode ? '#000000' : '#052E16'}
          strokeWidth={isPaperMode ? 6 : 8.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Main Axonemal Shaft (9+2 Microtubule Core) */}
        <path
          d="M -5 -88 
             C -8 -104 -8 -118 -6 -128 
             C -25 -165 -65 -205 -125 -225 
             C -175 -242 -215 -246 -240 -238 
             C -265 -230 -288 -200 -282 -155 
             C -276 -115 -248 -85 -268 -45"
          stroke={isPaperMode ? '#000000' : '#22C55E'}
          strokeWidth={isPaperMode ? 5 : 5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner Paraxial Rod / Axoneme Core Highlight */}
        <path
          d="M -5 -88 
             C -8 -104 -8 -118 -6 -128 
             C -25 -165 -65 -205 -125 -225 
             C -175 -242 -215 -246 -240 -238 
             C -265 -230 -288 -200 -282 -155 
             C -276 -115 -248 -85 -268 -45"
          stroke={isPaperMode ? '#FFFFFF' : '#86EFAC'}
          strokeWidth={isPaperMode ? 1.75 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Microscopic Mastigoneme Hair Filaments along the Locomotive Wave */}
        <g opacity={isPaperMode ? 0.8 : 0.9}>
          {[
            { x: -50, y: -195, dx: -3, dy: -8 },
            { x: -85, y: -215, dx: -5, dy: -8 },
            { x: -125, y: -228, dx: -6, dy: -7 },
            { x: -165, y: -242, dx: -5, dy: -7 },
            { x: -205, y: -246, dx: -4, dy: -7 },
            { x: -240, y: -238, dx: -7, dy: -4 },
            { x: -268, y: -215, dx: -8, dy: -2 },
            { x: -282, y: -180, dx: -8, dy: 1 },
            { x: -280, y: -140, dx: -8, dy: 4 },
            { x: -265, y: -100, dx: -7, dy: 6 },
            { x: -255, y: -65, dx: -6, dy: 6 }
          ].map((hair, hIdx) => (
            <line
              key={`mastigoneme-${hIdx}`}
              x1={hair.x}
              y1={hair.y}
              x2={hair.x + hair.dx}
              y2={hair.y + hair.dy}
              stroke={isPaperMode ? '#000000' : '#15803D'}
              strokeWidth={isPaperMode ? 1.5 : 1.75}
              strokeLinecap="round"
            />
          ))}
        </g>
        {/* Terminal tapered whiplash tip */}
        <circle cx="-268" cy="-45" r={isPaperMode ? 3.5 : 4} fill={isPaperMode ? '#000000' : '#15803D'} />
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
 * Dynamic Custom SVG Diagram
 * Safely renders customized SVG paths generated by the AI for any arbitrary biological/scientific structure
 */
export const DynamicCustomSvgDiagram: React.FC<{ svgCode: string; isPaperMode: boolean }> = ({ svgCode, isPaperMode }) => {
  return (
    <g 
      id="dynamic-custom-svg-container"
      className={isPaperMode ? 'filter contrast-125' : ''}
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
};
