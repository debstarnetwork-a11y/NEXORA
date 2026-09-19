import React from 'react';

export interface DiagramProps {
  isPaperMode: boolean;
  activePinId?: string | null;
  renderMode?: '3d' | '2d' | 'paper';
}

/**
 * High-Resolution Eukaryotic Animal Cell Diagram
 * Modeled directly on the textbook reference images (Animal cell 04.jpg and Animal cell.png)
 */
export const AnimalCellDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const is3D = !isPaperMode && renderMode === '3d';
  const is2D = !isPaperMode && renderMode === '2d';

  return (
    <g id="animal-cell-group" transform="translate(0, 0)">
      {/* 3D Spatial Environment vs 2D Orthographic Environment */}
      {is3D && (
        <g id="animal-cell-3d-env">
          <ellipse cx="0" cy="165" rx="190" ry="22" fill="#020617" fillOpacity="0.4" />
          {/* 3D Spatial Axis Widget */}
          <g transform="translate(-240, 130)">
            <rect x="-8" y="-42" width="85" height="52" rx="6" fill="#0F172A" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
            <line x1="12" y1="-5" x2="58" y2="-5" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="-2" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            <line x1="12" y1="-5" x2="12" y2="-35" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <text x="9" y="-37" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>
            <line x1="12" y1="-5" x2="-2" y2="7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <text x="-8" y="14" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
            <text x="32" y="-20" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">3D Depth</text>
          </g>
        </g>
      )}

      {is2D && (
        <g id="animal-cell-2d-env" opacity="0.85">
          <line x1="-250" y1="160" x2="250" y2="160" stroke="#475569" strokeWidth="1.5" />
          <line x1="-250" y1="-140" x2="-250" y2="160" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="250" y1="-140" x2="250" y2="160" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          {/* Scale Bar */}
          <g transform="translate(130, 150)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="50" y1="-3" x2="50" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="14" fill="#F8FAFC" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Scale: 20 µm</text>
          </g>
          <text x="-240" y="-120" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Plane: Midsagittal Section</text>
        </g>
      )}


      {/* Outer Cell (Plasma) Membrane with authentic Pinocytotic Vesicle indentation */}
      <path
        d="M -15 -136 
           C -8 -124 -14 -112 0 -112 
           C 14 -112 8 -124 15 -136 
           C 85 -142 165 -115 195 -45 
           C 220 25 210 95 165 140 
           C 115 185 25 180 -55 170 
           C -135 155 -195 110 -205 35 
           C -215 -45 -165 -115 -85 -136 
           C -60 -140 -35 -140 -15 -136 Z"
        fill={isPaperMode ? '#FFFFFF' : '#042F2E'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#10B981'}
        strokeWidth={isPaperMode ? 3 : 4}
      />

      {/* Inner Plasma Membrane Line (Double Lipid Bilayer / Cortex) */}
      <path
        d="M -15 -130 
           C -8 -120 -12 -110 0 -110 
           C 12 -110 8 -120 15 -130 
           C 80 -135 155 -108 185 -42 
           C 208 22 198 88 156 132 
           C 110 174 25 170 -50 160 
           C -126 146 -184 102 -194 32 
           C -203 -42 -156 -108 -80 -130 Z"
        fill={isPaperMode ? '#FAFAFA' : '#064E3B'}
        fillOpacity={isPaperMode ? 1 : 0.5}
        stroke={isPaperMode ? '#334155' : '#14B8A6'}
        strokeWidth={isPaperMode ? 1.5 : 2}
        strokeDasharray={isPaperMode ? '4 2' : undefined}
      />

      {/* Pinocytotic Vesicle Detail */}
      <g id="pinocytotic-vesicle">
        <path
          d="M -16 -136 C -10 -122 -16 -108 0 -108 C 16 -108 10 -122 16 -136"
          fill={isPaperMode ? '#FFFFFF' : '#0F766E'}
          stroke={isPaperMode ? '#000000' : '#2DD4BF'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Detaching Endocytic Vesicles */}
        <circle cx="0" cy="-94" r="5" fill={isPaperMode ? '#FFFFFF' : '#2DD4BF'} stroke={isPaperMode ? '#000000' : '#14B8A6'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <circle cx="-12" cy="-86" r="3.5" fill={isPaperMode ? '#FFFFFF' : '#2DD4BF'} stroke={isPaperMode ? '#000000' : '#14B8A6'} strokeWidth={isPaperMode ? 1.5 : 1.5} />
      </g>

      {/* Cytoplasm Stippled Texture */}
      {isPaperMode && (
        <g opacity="0.4">
          {[
            [-140, -40], [-120, 20], [-80, -90], [120, -80], [140, 20], [110, 90],
            [-40, 130], [50, 130], [-130, 80], [80, -30], [-70, -30], [60, 40]
          ].map(([sx, sy], i) => (
            <circle key={`stipple-${i}`} cx={sx} cy={sy} r="1.2" fill="#000000" />
          ))}
        </g>
      )}

      {/* Mitochondria with folded Cristae Partitions */}
      {/* Mitochondrion 1: Upper Right */}
      <g id="mitochondria-1" transform="translate(115, -75) rotate(32)">
        <rect x="-30" y="-15" width="60" height="30" rx="15" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} fillOpacity={isPaperMode ? 1 : 0.6} stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <path d="M -20 0 L -12 -10 L -4 10 L 4 -10 L 12 10 L 20 0" fill="none" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={isPaperMode ? 1.75 : 2} strokeLinecap="round" />
      </g>

      {/* Mitochondrion 2: Lower Right */}
      <g id="mitochondria-2" transform="translate(100, 70) rotate(-25)">
        <rect x="-28" y="-14" width="56" height="28" rx="14" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} fillOpacity={isPaperMode ? 1 : 0.6} stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <path d="M -18 0 L -10 -9 L -2 9 L 6 -9 L 14 0" fill="none" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={isPaperMode ? 1.75 : 2} strokeLinecap="round" />
      </g>

      {/* Mitochondrion 3: Bottom Left */}
      <g id="mitochondria-3" transform="translate(-10, 125) rotate(8)">
        <rect x="-26" y="-13" width="52" height="26" rx="13" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} fillOpacity={isPaperMode ? 1 : 0.6} stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <path d="M -16 0 L -8 -8 L 0 8 L 8 -8 L 16 0" fill="none" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={isPaperMode ? 1.75 : 2} strokeLinecap="round" />
      </g>

      {/* Golgi Apparatus (Curved Cisternae Stack with Secretory Vesicles) */}
      <g id="golgi-apparatus" transform="translate(90, -10)">
        <path d="M -15 -40 Q 25 -52 60 -30" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3.5 : 5} strokeLinecap="round" fill="none" />
        <path d="M -20 -28 Q 20 -40 55 -18" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3.5 : 5} strokeLinecap="round" fill="none" />
        <path d="M -15 -16 Q 15 -28 50 -6" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3.5 : 5} strokeLinecap="round" fill="none" />
        <path d="M -10 -4 Q 10 -16 45 6" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" fill="none" />

        {/* Budding Golgi Vesicles */}
        <circle cx="68" cy="-24" r="5" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <circle cx="76" cy="-12" r="4" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <circle cx="58" cy="12" r="4.5" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <circle cx="65" cy="24" r="3.5" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 1.5 : 2} />
      </g>

      {/* Rough Endoplasmic Reticulum (RER) Studded with Ribosomes */}
      <g id="rough-er" transform="translate(0, 0)">
        {/* Cisternae folds wrapping the nucleus on left */}
        <path d="M -60 -45 C -115 -65 -130 -15 -100 20 C -70 55 -55 75 -15 80" stroke={isPaperMode ? '#000000' : '#3B82F6'} strokeWidth={isPaperMode ? 3 : 5} strokeLinecap="round" fill="none" />
        <path d="M -65 -30 C -125 -45 -140 0 -110 35 C -80 70 -45 88 5 95" stroke={isPaperMode ? '#000000' : '#3B82F6'} strokeWidth={isPaperMode ? 3 : 5} strokeLinecap="round" fill="none" />
        <path d="M -75 -15 C -135 -25 -145 20 -120 50 C -95 80 -35 100 20 105" stroke={isPaperMode ? '#000000' : '#3B82F6'} strokeWidth={isPaperMode ? 2.5 : 4} strokeLinecap="round" fill="none" />

        {/* Studded Ribosomes on RER */}
        {[
          [-75, -45], [-95, -40], [-115, -25], [-125, -5], [-120, 15], [-105, 35], [-85, 55], [-65, 70], [-35, 78],
          [-85, -20], [-110, -10], [-130, 10], [-115, 30], [-95, 50], [-70, 68], [-45, 84], [-10, 92], [10, 95]
        ].map(([rx, ry], idx) => (
          <circle key={`rer-ribo-${idx}`} cx={rx} cy={ry} r={isPaperMode ? 2 : 2.5} fill={isPaperMode ? '#000000' : '#93C5FD'} />
        ))}
      </g>

      {/* Smooth Endoplasmic Reticulum (SER) without Ribosomes */}
      <g id="smooth-er">
        <path d="M -135 45 C -165 35 -175 75 -145 85 C -125 92 -150 120 -120 125" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 2.5 : 4} strokeLinecap="round" fill="none" />
        <path d="M -148 62 C -170 80 -140 105 -155 120" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 2 : 3} strokeLinecap="round" fill="none" />
      </g>

      {/* Centrosome & Centrioles (Microtubule Organizing Center) */}
      <g id="centrioles" transform="translate(-15, -70)">
        {/* Centriole 1: Horizontal cylinder barrel of 9 triplet microtubules */}
        <g transform="rotate(20)">
          <rect x="-14" y="-5" width="28" height="10" rx="2" fill={isPaperMode ? '#FFFFFF' : '#EC4899'} stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={isPaperMode ? 1.5 : 2} />
          <line x1="-14" y1="-2" x2="14" y2="-2" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1" />
          <line x1="-14" y1="2" x2="14" y2="2" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1" />
        </g>
        {/* Centriole 2: Perpendicular vertical cylinder barrel */}
        <g transform="translate(10, 8) rotate(-70)">
          <rect x="-14" y="-5" width="28" height="10" rx="2" fill={isPaperMode ? '#FFFFFF' : '#EC4899'} stroke={isPaperMode ? '#000000' : '#F472B6'} strokeWidth={isPaperMode ? 1.5 : 2} />
          <line x1="-14" y1="-2" x2="14" y2="-2" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1" />
          <line x1="-14" y1="2" x2="14" y2="2" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1" />
        </g>
        {/* Radiating Microtubules aster fibers */}
        <line x1="-15" y1="-10" x2="-35" y2="-25" stroke={isPaperMode ? '#475569' : '#F472B6'} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="0" y1="-15" x2="5" y2="-40" stroke={isPaperMode ? '#475569' : '#F472B6'} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="20" y1="-5" x2="40" y2="-18" stroke={isPaperMode ? '#475569' : '#F472B6'} strokeWidth="1" strokeDasharray="3 2" />
      </g>

      {/* Lysosomes & Peroxisomes */}
      <g id="lysosomes">
        {/* Lysosome 1 (Lower Left) */}
        <g transform="translate(-115, 5)">
          <circle cx="0" cy="0" r="14" fill={isPaperMode ? '#FFFFFF' : '#10B981'} fillOpacity={isPaperMode ? 1 : 0.65} stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth={isPaperMode ? 2 : 2.5} />
          <circle cx="-4" cy="-4" r="2" fill={isPaperMode ? '#000000' : '#FFFFFF'} />
          <circle cx="3" cy="2" r="2.5" fill={isPaperMode ? '#000000' : '#FFFFFF'} />
          <circle cx="-1" cy="6" r="1.8" fill={isPaperMode ? '#000000' : '#FFFFFF'} />
        </g>
        {/* Peroxisome (Upper Left) */}
        <g transform="translate(-80, -85)">
          <circle cx="0" cy="0" r="11" fill={isPaperMode ? '#FFFFFF' : '#10B981'} fillOpacity={isPaperMode ? 1 : 0.65} stroke={isPaperMode ? '#000000' : '#34D399'} strokeWidth={isPaperMode ? 1.75 : 2} />
          <rect x="-3" y="-3" width="6" height="6" fill={isPaperMode ? '#000000' : '#FFFFFF'} />
        </g>
      </g>

      {/* Microtubules Linear Filaments */}
      <g id="microtubules">
        <line x1="-120" y1="90" x2="-80" y2="160" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <line x1="-105" y1="85" x2="-65" y2="155" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 1.5 : 2} />
        <line x1="45" y1="90" x2="105" y2="135" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 1.5 : 2} />
      </g>

      {/* Free Cytoplasmic Ribosomes */}
      <g id="free-ribosomes">
        {[
          [35, -95], [50, -85], [75, -95], [-45, -95], [-35, 105], [50, 110], [70, 95],
          [-145, -60], [-155, -20], [-165, 15], [140, -15], [160, 45], [140, 115]
        ].map(([fx, fy], i) => (
          <circle key={`free-ribo-${i}`} cx={fx} cy={fy} r={isPaperMode ? 1.75 : 2} fill={isPaperMode ? '#000000' : '#FBBF24'} />
        ))}
      </g>

      {/* Prominent Central Nucleus with Nuclear Envelope, Pores, and Nucleolus */}
      <g id="nucleus" transform="translate(10, 0)">
        {/* Outer Nuclear Envelope */}
        <circle cx="0" cy="0" r="58" fill={isPaperMode ? '#FFFFFF' : '#312E81'} fillOpacity={isPaperMode ? 1 : 0.85} stroke={isPaperMode ? '#000000' : '#6366F1'} strokeWidth={isPaperMode ? 3 : 3.5} />
        {/* Inner Nuclear Membrane */}
        <circle cx="0" cy="0" r="52" fill={isPaperMode ? '#FAFAFA' : '#1E1B4B'} fillOpacity={isPaperMode ? 1 : 0.95} stroke={isPaperMode ? '#334155' : '#818CF8'} strokeWidth={isPaperMode ? 1.5 : 1.5} strokeDasharray={isPaperMode ? '4 3' : undefined} />

        {/* Nuclear Pore notches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const px = Math.cos(rad) * 55;
          const py = Math.sin(rad) * 55;
          return (
            <circle key={`pore-${idx}`} cx={px} cy={py} r="2.5" fill={isPaperMode ? '#000000' : '#C7D2FE'} />
          );
        })}

        {/* Chromatin Threads */}
        <path d="M -30 -15 Q -10 -35 15 -25 Q 35 -15 25 15 Q 15 35 -15 25" fill="none" stroke={isPaperMode ? '#94A3B8' : '#818CF8'} strokeWidth="1" strokeDasharray="3 2" />

        {/* Dense Nucleolus */}
        <circle cx="12" cy="-6" r="18" fill={isPaperMode ? '#000000' : '#8B5CF6'} stroke={isPaperMode ? '#000000' : '#C084FC'} strokeWidth={isPaperMode ? 0 : 2} />
      </g>


    </g>
  );
};

/**
 * High-Resolution Plant Cell Diagram
 * Modeled directly on the textbook reference images (Plant 01.jpg and Plant cell 02.jpg)
 */
export const PlantCellDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const is3D = !isPaperMode && renderMode === '3d';
  const is2D = !isPaperMode && renderMode === '2d';

  return (
    <g id="plant-cell-group" transform="translate(0, 0)">
      {/* 3D vs 2D Environment */}
      {is3D && (
        <g id="plant-cell-3d-env">
          <ellipse cx="0" cy="170" rx="210" ry="24" fill="#020617" fillOpacity="0.4" />
          <g transform="translate(-250, 135)">
            <rect x="-8" y="-42" width="85" height="52" rx="6" fill="#0F172A" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
            <line x1="12" y1="-5" x2="58" y2="-5" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="-2" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            <line x1="12" y1="-5" x2="12" y2="-35" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <text x="9" y="-37" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>
            <line x1="12" y1="-5" x2="-2" y2="7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <text x="-8" y="14" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
            <text x="32" y="-20" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">3D Polyhedron</text>
          </g>
        </g>
      )}

      {is2D && (
        <g id="plant-cell-2d-env" opacity="0.85">
          <line x1="-260" y1="165" x2="260" y2="165" stroke="#475569" strokeWidth="1.5" />
          <g transform="translate(140, 155)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="50" y1="-3" x2="50" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="14" fill="#F8FAFC" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Scale: 50 µm</text>
          </g>
          <text x="-240" y="-125" fill="#22C55E" fontSize="9" fontWeight="bold" fontFamily="monospace">Plane: Transverse Cell Wall Section</text>
        </g>
      )}


      {/* Outer Rigid Cell Wall (Rectangular with rounded corners) */}
      <rect
        x="-195"
        y="-145"
        width="390"
        height="290"
        rx="36"
        ry="36"
        fill={isPaperMode ? '#FFFFFF' : '#14532D'}
        fillOpacity={isPaperMode ? 1 : 0.85}
        stroke={isPaperMode ? '#000000' : '#16A34A'}
        strokeWidth={isPaperMode ? 4 : 8}
      />

      {/* Middle Lamella & Primary Cell Wall Line */}
      <rect
        x="-185"
        y="-135"
        width="370"
        height="270"
        rx="30"
        ry="30"
        fill={isPaperMode ? '#FAFAFA' : '#166534'}
        fillOpacity={isPaperMode ? 1 : 0.7}
        stroke={isPaperMode ? '#000000' : '#22C55E'}
        strokeWidth={isPaperMode ? 2 : 3}
      />

      {/* Inner Cell (Plasma) Membrane pressed against wall */}
      <rect
        x="-175"
        y="-125"
        width="350"
        height="250"
        rx="24"
        ry="24"
        fill={isPaperMode ? '#FFFFFF' : '#052E16'}
        fillOpacity={isPaperMode ? 1 : 0.9}
        stroke={isPaperMode ? '#334155' : '#4ADE80'}
        strokeWidth={isPaperMode ? 1.5 : 2}
      />

      {/* Large Central Vacuole (Dominating 65% of the Cell Volume) */}
      <g id="central-vacuole">
        <path
          d="M 10 -95 
             C 95 -95 135 -40 140 10 
             C 145 75 125 105 70 108 
             C 10 110 -25 90 -45 50 
             C -65 10 -40 -40 -15 -80 
             C -5 -92 0 -95 10 -95 Z"
          fill={isPaperMode ? '#FFFFFF' : '#15803D'}
          fillOpacity={isPaperMode ? 1 : 0.35}
          stroke={isPaperMode ? '#000000' : '#86EFAC'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Vacuolar Cytoplasmic Fluid Strands */}
        <path d="M 20 -40 L 40 10" stroke={isPaperMode ? '#000000' : '#BBF7D0'} strokeWidth={isPaperMode ? 1.5 : 2} strokeLinecap="round" />
        <path d="M 28 -30 L 48 20" stroke={isPaperMode ? '#000000' : '#BBF7D0'} strokeWidth={isPaperMode ? 1.5 : 2} strokeLinecap="round" />
        <path d="M -15 25 L -5 65" stroke={isPaperMode ? '#000000' : '#BBF7D0'} strokeWidth={isPaperMode ? 1.5 : 2} strokeLinecap="round" />
      </g>

      {/* Displaced Nucleus (Pushed to the Upper-Left by the Central Vacuole) */}
      <g id="plant-nucleus" transform="translate(-105, -35)">
        {/* Outer Nuclear Envelope */}
        <circle cx="0" cy="0" r="44" fill={isPaperMode ? '#FFFFFF' : '#C2410C'} fillOpacity={isPaperMode ? 1 : 0.8} stroke={isPaperMode ? '#000000' : '#FB923C'} strokeWidth={isPaperMode ? 2.5 : 3} />
        {/* Inner Nuclear Membrane */}
        <circle cx="0" cy="0" r="39" fill={isPaperMode ? '#FAFAFA' : '#9A3412'} fillOpacity={isPaperMode ? 1 : 0.9} stroke={isPaperMode ? '#334155' : '#FDBA74'} strokeWidth={isPaperMode ? 1.5 : 1.5} strokeDasharray={isPaperMode ? '3 2' : undefined} />
        {/* Nucleolus */}
        <circle cx="6" cy="-4" r="14" fill={isPaperMode ? '#000000' : '#FACC15'} stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth={isPaperMode ? 0 : 2} />
      </g>

      {/* Endoplasmic Reticulum Wrapping the Displaced Nucleus */}
      <g id="plant-er" transform="translate(-105, -35)">
        <path d="M -25 -48 Q 0 -62 30 -50" stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 3.5 : 4.5} strokeLinecap="round" fill="none" />
        <path d="M -35 -56 Q 0 -72 40 -58" stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 3.5 : 4.5} strokeLinecap="round" fill="none" />
        <path d="M -42 -64 Q 0 -82 50 -66" stroke={isPaperMode ? '#000000' : '#A855F7'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" fill="none" />
        {/* Ribosome Dots on RER */}
        {[-30, -15, 0, 15, 30].map((rx, i) => (
          <circle key={`plant-rer-${i}`} cx={rx} cy={-62} r={isPaperMode ? 1.75 : 2.5} fill={isPaperMode ? '#000000' : '#E9D5FF'} />
        ))}
      </g>

      {/* Chloroplasts with stacked Thylakoid Grana Discs (Unique to Plant Cell) */}
      {/* Chloroplast 1: Upper Right */}
      <g id="chloroplast-1" transform="translate(100, -85) rotate(-15)">
        <ellipse cx="0" cy="0" rx="26" ry="15" fill={isPaperMode ? '#FFFFFF' : '#15803D'} stroke={isPaperMode ? '#000000' : '#22C55E'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-16" y1="-5" x2="16" y2="-5" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-18" y1="0" x2="18" y2="0" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-16" y1="5" x2="16" y2="5" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* Chloroplast 2: Lower Left */}
      <g id="chloroplast-2" transform="translate(-130, 45) rotate(25)">
        <ellipse cx="0" cy="0" rx="26" ry="15" fill={isPaperMode ? '#FFFFFF' : '#15803D'} stroke={isPaperMode ? '#000000' : '#22C55E'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-16" y1="-5" x2="16" y2="-5" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-18" y1="0" x2="18" y2="0" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-16" y1="5" x2="16" y2="5" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* Chloroplast 3: Lower Right */}
      <g id="chloroplast-3" transform="translate(115, 60) rotate(40)">
        <ellipse cx="0" cy="0" rx="24" ry="14" fill={isPaperMode ? '#FFFFFF' : '#15803D'} stroke={isPaperMode ? '#000000' : '#22C55E'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-14" y1="-4" x2="14" y2="-4" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-16" y1="1" x2="16" y2="1" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
        <line x1="-14" y1="6" x2="14" y2="6" stroke={isPaperMode ? '#000000' : '#86EFAC'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* Mitochondria with Cristae */}
      <g id="plant-mitochondria-1" transform="translate(60, -70) rotate(-45)">
        <rect x="-24" y="-12" width="48" height="24" rx="12" fill={isPaperMode ? '#FFFFFF' : '#DC2626'} fillOpacity={isPaperMode ? 1 : 0.7} stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={isPaperMode ? 2 : 2} />
        <path d="M -16 0 L -8 -7 L 0 7 L 8 -7 L 16 0" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={isPaperMode ? 1.75 : 2} fill="none" />
      </g>
      <g id="plant-mitochondria-2" transform="translate(-70, 85) rotate(15)">
        <rect x="-24" y="-12" width="48" height="24" rx="12" fill={isPaperMode ? '#FFFFFF' : '#DC2626'} fillOpacity={isPaperMode ? 1 : 0.7} stroke={isPaperMode ? '#000000' : '#F87171'} strokeWidth={isPaperMode ? 2 : 2} />
        <path d="M -16 0 L -8 -7 L 0 7 L 8 -7 L 16 0" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth={isPaperMode ? 1.75 : 2} fill="none" />
      </g>

      {/* Golgi Apparatus (Dictyosomes) */}
      <g id="plant-golgi" transform="translate(65, 75)">
        <path d="M -15 -18 Q 10 -26 35 -12" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" fill="none" />
        <path d="M -18 -8 Q 8 -16 32 -2" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" fill="none" />
        <path d="M -14 2 Q 5 -6 28 8" stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth={isPaperMode ? 3 : 4} strokeLinecap="round" fill="none" />
        <circle cx="42" cy="-8" r="3.5" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth="1.5" />
        <circle cx="36" cy="14" r="3" fill={isPaperMode ? '#FFFFFF' : '#FBBF24'} stroke={isPaperMode ? '#000000' : '#F59E0B'} strokeWidth="1.5" />
      </g>

      {/* Amyloplast (Starch Storage with concentric rings) */}
      <g id="amyloplast" transform="translate(-130, 95)">
        <ellipse cx="0" cy="0" rx="18" ry="12" fill={isPaperMode ? '#FFFFFF' : '#EA580C'} fillOpacity={isPaperMode ? 1 : 0.7} stroke={isPaperMode ? '#000000' : '#FB923C'} strokeWidth={isPaperMode ? 2 : 2} />
        <ellipse cx="-2" cy="0" rx="12" ry="7" fill="none" stroke={isPaperMode ? '#000000' : '#FFEDD5'} strokeWidth="1.5" />
        <ellipse cx="-3" cy="0" rx="6" ry="3" fill="none" stroke={isPaperMode ? '#000000' : '#FFEDD5'} strokeWidth="1.2" />
      </g>

      {/* Peroxisome */}
      <g id="plant-peroxisome" transform="translate(-145, -95)">
        <circle cx="0" cy="0" r="10" fill={isPaperMode ? '#FFFFFF' : '#FACC15'} stroke={isPaperMode ? '#000000' : '#EAB308'} strokeWidth={isPaperMode ? 2 : 2} />
        <rect x="-3" y="-3" width="6" height="6" fill={isPaperMode ? '#000000' : '#CA8A04'} />
      </g>

      {/* Ribosomes */}
      <g id="plant-ribosomes">
        {[
          [-150, -60], [-155, -20], [-80, -95], [20, -110], [50, -110],
          [130, -35], [145, 10], [135, 95], [-140, 65], [-95, 110]
        ].map(([px, py], idx) => (
          <circle key={`plant-ribo-${idx}`} cx={px} cy={py} r={isPaperMode ? 1.75 : 2} fill={isPaperMode ? '#000000' : '#FDE047'} />
        ))}
      </g>


    </g>
  );
};

/**
 * High-Resolution Bony Fish Diagram (External Anatomy)
 * Modeled directly on the textbook reference image (fish.jpg)
 */
export const BonyFishDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const is3D = !isPaperMode && renderMode === '3d';
  const is2D = !isPaperMode && renderMode === '2d';

  return (
    <g id="bony-fish-group" transform="translate(0, 0)">
      {/* 3D vs 2D Environment */}
      {is3D && (
        <g id="fish-3d-env">
          <ellipse cx="0" cy="115" rx="220" ry="20" fill="#020617" fillOpacity="0.4" />
          <g transform="translate(-250, 110)">
            <rect x="-8" y="-42" width="85" height="52" rx="6" fill="#0F172A" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
            <line x1="12" y1="-5" x2="58" y2="-5" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="-2" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            <line x1="12" y1="-5" x2="12" y2="-35" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <text x="9" y="-37" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>
            <line x1="12" y1="-5" x2="-2" y2="7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <text x="-8" y="14" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
            <text x="32" y="-20" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">3D Aquatic</text>
          </g>
        </g>
      )}

      {is2D && (
        <g id="fish-2d-env" opacity="0.85">
          <line x1="-260" y1="110" x2="260" y2="110" stroke="#475569" strokeWidth="1.5" />
          {/* Regional Demarcations */}
          <line x1="-70" y1="-120" x2="-70" y2="110" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="100" y1="-120" x2="100" y2="110" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <text x="-140" y="-125" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">I. Head / Gills</text>
          <text x="15" y="-125" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">II. Trunk</text>
          <text x="150" y="-125" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">III. Tail</text>

          <g transform="translate(140, 95)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="50" y1="-3" x2="50" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="14" fill="#F8FAFC" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Scale: 25 cm</text>
          </g>
        </g>
      )}


      {/* Caudal Fin (Tail Fin with Ray Striations) */}
      <g id="caudal-fin">
        <path
          d="M 160 12 
             C 185 2 205 -35 245 -70 
             C 255 -55 240 -15 225 5 
             C 240 25 255 65 245 80 
             C 205 45 185 18 160 16 Z"
          fill={isPaperMode ? '#FFFFFF' : '#334155'}
          stroke={isPaperMode ? '#000000' : '#64748B'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Ray Lines in Tail */}
        {[-55, -40, -25, -10, 0, 10, 25, 40, 55, 68].map((ty, i) => (
          <path
            key={`tail-ray-${i}`}
            d={`M 175 14 C 195 ${ty * 0.4} 215 ${ty * 0.8} 240 ${ty}`}
            stroke={isPaperMode ? '#000000' : '#94A3B8'}
            strokeWidth={isPaperMode ? 1.25 : 1.5}
            fill="none"
          />
        ))}
      </g>

      {/* Anal Fin (Ventral ray fin) */}
      <g id="anal-fin">
        <path
          d="M 35 48 C 55 65 95 75 115 58 C 105 44 80 40 50 42 Z"
          fill={isPaperMode ? '#FFFFFF' : '#475569'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {[50, 65, 80, 95, 108].map((rx, idx) => (
          <line
            key={`anal-ray-${idx}`}
            x1={rx}
            y1={44}
            x2={rx + 5}
            y2={68}
            stroke={isPaperMode ? '#000000' : '#CBD5E1'}
            strokeWidth={isPaperMode ? 1.25 : 1.5}
          />
        ))}
      </g>

      {/* Pelvic Fin (Paired Ventral Fin) */}
      <g id="pelvic-fin">
        <path
          d="M -75 48 C -65 75 -45 92 -35 84 C -42 62 -55 50 -68 48 Z"
          fill={isPaperMode ? '#FFFFFF' : '#475569'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {[-65, -58, -50, -42].map((px, idx) => (
          <line
            key={`pelvic-ray-${idx}`}
            x1={px}
            y1={50}
            x2={px + 12}
            y2={80}
            stroke={isPaperMode ? '#000000' : '#CBD5E1'}
            strokeWidth={isPaperMode ? 1.25 : 1.5}
          />
        ))}
      </g>

      {/* Anterior Dorsal Fin (Spiny Rays) */}
      <g id="spiny-dorsal-fin">
        <path
          d="M -85 -55 
             L -75 -95 L -65 -60 
             L -55 -102 L -45 -65 
             L -35 -105 L -25 -68 
             L -15 -102 L -5 -70 
             L 5 -95 L 12 -72 Z"
          fill={isPaperMode ? '#FFFFFF' : '#334155'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
          strokeLinejoin="round"
        />
        {/* Spiny Rays Spines */}
        {[-75, -55, -35, -15, 5].map((sx, idx) => (
          <line
            key={`spine-${idx}`}
            x1={sx}
            y1={-58}
            x2={sx}
            y2={idx === 2 ? -105 : -98}
            stroke={isPaperMode ? '#000000' : '#F8FAFC'}
            strokeWidth={isPaperMode ? 2 : 2.5}
          />
        ))}
      </g>

      {/* Posterior Dorsal Fin (Soft Rays) */}
      <g id="soft-dorsal-fin">
        <path
          d="M 15 -70 C 35 -110 85 -115 125 -70 C 105 -55 60 -52 15 -68 Z"
          fill={isPaperMode ? '#FFFFFF' : '#334155'}
          stroke={isPaperMode ? '#000000' : '#94A3B8'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {[28, 42, 58, 74, 90, 105, 118].map((srx, idx) => (
          <line
            key={`soft-ray-${idx}`}
            x1={srx}
            y1={-65}
            x2={srx - 5}
            y2={-102}
            stroke={isPaperMode ? '#000000' : '#CBD5E1'}
            strokeWidth={isPaperMode ? 1.25 : 1.5}
          />
        ))}
      </g>

      {/* Main Fish Body Trunk & Head Outline */}
      <path
        d="M -235 15 
           C -220 -8 -190 -35 -145 -55 
           C -85 -72 20 -72 110 -58 
           C 145 -48 165 -15 170 12 
           C 165 25 145 42 110 46 
           C 40 54 -30 52 -105 48 
           C -175 42 -220 28 -235 15 Z"
        fill={isPaperMode ? '#FFFFFF' : '#1E293B'}
        stroke={isPaperMode ? '#000000' : '#94A3B8'}
        strokeWidth={isPaperMode ? 3 : 3.5}
      />

      {/* Mouth & Jaws Detail */}
      <g id="fish-mouth">
        {/* Upper Lip / Premaxilla */}
        <path d="M -242 12 Q -228 5 -215 8" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" />
        {/* Lower Mandible Jawline */}
        <path d="M -240 18 Q -222 28 -195 24" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth={isPaperMode ? 2.5 : 3} fill="none" />
        <line x1="-242" y1="12" x2="-222" y2="18" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth={isPaperMode ? 2 : 2.5} />
      </g>

      {/* Nostril (Nares) */}
      <circle cx="-212" cy="-6" r="2.5" fill={isPaperMode ? '#000000' : '#CBD5E1'} />
      <circle cx="-206" cy="-8" r="2" fill={isPaperMode ? '#000000' : '#CBD5E1'} />

      {/* Eye with dark pupil & specular glint ring */}
      <g id="fish-eye" transform="translate(-188, -14)">
        <circle cx="0" cy="0" r="14" fill={isPaperMode ? '#FFFFFF' : '#0F172A'} stroke={isPaperMode ? '#000000' : '#CBD5E1'} strokeWidth={isPaperMode ? 2.5 : 3} />
        <circle cx="0" cy="0" r="8" fill={isPaperMode ? '#000000' : '#F8FAFC'} />
        <circle cx="-3" cy="-3" r="3" fill="#FFFFFF" />
      </g>

      {/* Gill Cover (Operculum) Bony Flap */}
      <g id="operculum">
        <path
          d="M -160 -45 
             C -130 -22 -125 10 -150 38 
             C -160 42 -170 30 -165 10"
          stroke={isPaperMode ? '#000000' : '#E2E8F0'}
          strokeWidth={isPaperMode ? 2.5 : 3}
          fill="none"
        />
        <path
          d="M -175 -35 C -150 -15 -148 15 -170 28"
          stroke={isPaperMode ? '#475569' : '#94A3B8'}
          strokeWidth={isPaperMode ? 1.5 : 2}
          fill="none"
        />
      </g>

      {/* Pectoral Fin with fan rays */}
      <g id="pectoral-fin">
        <path
          d="M -132 -2 C -105 -5 -65 12 -70 32 C -85 36 -115 28 -128 15 Z"
          fill={isPaperMode ? '#FFFFFF' : '#0F172A'}
          stroke={isPaperMode ? '#000000' : '#CBD5E1'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Dense fine rays */}
        {[-120, -110, -100, -90, -80].map((rx, idx) => (
          <line
            key={`pec-ray-${idx}`}
            x1={rx}
            y1={5}
            x2={rx + 22}
            y2={22}
            stroke={isPaperMode ? '#000000' : '#94A3B8'}
            strokeWidth={isPaperMode ? 1.25 : 1.5}
          />
        ))}
      </g>

      {/* Lateral Line (Sensory curve running the length of the body) */}
      <path
        d="M -130 -8 
           C -65 -18 35 -6 115 12 
           C 135 16 150 18 165 14"
        stroke={isPaperMode ? '#000000' : '#38BDF8'}
        strokeWidth={isPaperMode ? 1.75 : 2}
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Authentic Scales & Dorsal Stippling Shading (from fish.jpg) */}
      {isPaperMode && (
        <g opacity="0.45">
          {[
            [-120, -38], [-105, -42], [-90, -48], [-70, -52], [-50, -50], [-30, -48],
            [-10, -45], [10, -42], [30, -38], [50, -32], [70, -25], [90, -18],
            [110, -10], [130, -2], [145, 6], [-100, -25], [-80, -30], [-60, -32],
            [-40, -30], [-20, -26], [0, -22], [20, -18], [40, -12], [60, -6],
            [80, 2], [100, 8], [120, 15], [-70, -12], [-50, -14], [-30, -12]
          ].map(([dx, dy], idx) => (
            <circle key={`scale-dot-${idx}`} cx={dx} cy={dy} r="1" fill="#000000" />
          ))}
        </g>
      )}


    </g>
  );
};

/**
 * High-Resolution Human Heart Internal Coronal Section Diagram
 * Modeled directly on the textbook reference image (Heart 02.jpg)
 */
export const HumanHeartDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d' }) => {
  const is3D = !isPaperMode && renderMode === '3d';
  const is2D = !isPaperMode && renderMode === '2d';

  return (
    <g id="human-heart-group" transform="translate(0, 0)">
      {/* 3D vs 2D Environment */}
      {is3D && (
        <g id="heart-3d-env">
          <ellipse cx="0" cy="180" rx="170" ry="22" fill="#020617" fillOpacity="0.4" />
          <g transform="translate(-240, 130)">
            <rect x="-8" y="-42" width="85" height="52" rx="6" fill="#0F172A" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
            <line x1="12" y1="-5" x2="58" y2="-5" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="-2" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            <line x1="12" y1="-5" x2="12" y2="-35" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <text x="9" y="-37" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>
            <line x1="12" y1="-5" x2="-2" y2="7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <text x="-8" y="14" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
            <text x="32" y="-20" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">3D Coronal</text>
          </g>
        </g>
      )}

      {is2D && (
        <g id="heart-2d-env" opacity="0.85">
          <line x1="-240" y1="175" x2="240" y2="175" stroke="#475569" strokeWidth="1.5" />
          <g transform="translate(130, 160)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="50" y1="-3" x2="50" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="14" fill="#F8FAFC" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Scale: 5 cm</text>
          </g>
          <text x="-230" y="-140" fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="monospace">Plane: Coronal Section (Anterior View)</text>
        </g>
      )}


      {/* Outer Pericardium Layer Framing the Heart */}
      <path
        d="M -145 -40 
           C -155 40 -125 120 0 170 
           C 125 120 155 40 145 -40 
           C 135 -90 65 -130 0 -130 
           C -65 -130 -135 -90 -145 -40 Z"
        fill={isPaperMode ? '#FFFFFF' : '#450A0A'}
        fillOpacity={isPaperMode ? 1 : 0.8}
        stroke={isPaperMode ? '#000000' : '#DC2626'}
        strokeWidth={isPaperMode ? 3.5 : 4}
      />

      {/* Superior Vena Cava (SVC) - Blue vessel on upper left */}
      <g id="superior-vena-cava">
        <path
          d="M -115 -160 L -115 -50 L -80 -50 L -80 -160 Z"
          fill={isPaperMode ? '#FFFFFF' : '#2563EB'}
          stroke={isPaperMode ? '#000000' : '#60A5FA'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Downward Blood Flow Arrow */}
        <path d="M -98 -135 L -98 -85 M -104 -95 L -98 -85 L -92 -95" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Inferior Vena Cava (IVC) - Lower blue vessel */}
      <g id="inferior-vena-cava">
        <path
          d="M -115 80 L -115 160 L -80 160 L -80 80 Z"
          fill={isPaperMode ? '#FFFFFF' : '#2563EB'}
          stroke={isPaperMode ? '#000000' : '#60A5FA'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Upward Blood Flow Arrow */}
        <path d="M -98 145 L -98 95 M -104 105 L -98 95 L -92 105" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Ascending Aorta, Aortic Arch, and 3 Branch Arteries */}
      <g id="aorta-arch">
        {/* Main Arch Curving Overhead */}
        <path
          d="M -18 -40 
             C -20 -150 75 -150 75 -35 
             L 50 -35 
             C 50 -120 -2 -120 0 -40 Z"
          fill={isPaperMode ? '#FFFFFF' : '#DC2626'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />

        {/* 1. Brachiocephalic Trunk */}
        <path d="M 0 -130 L -5 -175 L 12 -175 L 15 -130 Z" fill={isPaperMode ? '#FFFFFF' : '#DC2626'} stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* 2. Left Common Carotid Artery */}
        <path d="M 22 -135 L 22 -178 L 36 -178 L 36 -135 Z" fill={isPaperMode ? '#FFFFFF' : '#DC2626'} stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 2 : 2.5} />
        {/* 3. Left Subclavian Artery */}
        <path d="M 45 -130 L 48 -172 L 62 -172 L 56 -130 Z" fill={isPaperMode ? '#FFFFFF' : '#DC2626'} stroke={isPaperMode ? '#000000' : '#EF4444'} strokeWidth={isPaperMode ? 2 : 2.5} />

        {/* Upward Blood Flow Arrows in Aorta */}
        <path d="M 12 -70 L 12 -100 M 7 -92 L 12 -100 L 17 -92" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Pulmonary Trunk & Left/Right Pulmonary Arteries (Crossing under aorta) */}
      <g id="pulmonary-arteries">
        {/* Main Trunk Emerging from RV */}
        <path
          d="M -30 -30 
             C -30 -90 15 -90 35 -70 
             L 50 -85 
             C 25 -110 -45 -110 -45 -30 Z"
          fill={isPaperMode ? '#FFFFFF' : '#9333EA'}
          stroke={isPaperMode ? '#000000' : '#C084FC'}
          strokeWidth={isPaperMode ? 2.5 : 3}
        />
        {/* Branch to Left Lung */}
        <path d="M 35 -70 L 95 -75 L 95 -55 L 45 -55 Z" fill={isPaperMode ? '#FFFFFF' : '#9333EA'} stroke={isPaperMode ? '#000000' : '#C084FC'} strokeWidth={isPaperMode ? 2 : 2} />
        {/* Branch to Right Lung */}
        <path d="M -45 -60 L -120 -65 L -120 -85 L -45 -80 Z" fill={isPaperMode ? '#FFFFFF' : '#9333EA'} stroke={isPaperMode ? '#000000' : '#C084FC'} strokeWidth={isPaperMode ? 2 : 2} />
      </g>

      {/* Pulmonary Veins (Entering Left Atrium) */}
      <g id="pulmonary-veins">
        <rect x="75" y="-35" width="45" height="18" rx="4" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} stroke={isPaperMode ? '#000000' : '#FCA5A5'} strokeWidth={isPaperMode ? 2 : 2} />
        <rect x="75" y="-12" width="45" height="18" rx="4" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} stroke={isPaperMode ? '#000000' : '#FCA5A5'} strokeWidth={isPaperMode ? 2 : 2} />
      </g>

      {/* Right Atrium Internal Chamber (Blue) */}
      <g id="right-atrium">
        <path
          d="M -120 -40 
             C -130 10 -90 25 -55 25 
             C -55 -15 -80 -40 -120 -40 Z"
          fill={isPaperMode ? '#FAFAFA' : '#1E40AF'}
          stroke={isPaperMode ? '#000000' : '#3B82F6'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Downward Blood Flow Arrow */}
        <path d="M -85 -15 L -85 10 M -90 2 L -85 10 L -80 2" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Tricuspid Valve (Between Right Atrium and Right Ventricle) */}
      <g id="tricuspid-valve">
        <path d="M -65 24 Q -55 35 -50 48" stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth="2.5" fill="none" />
        <path d="M -75 24 Q -70 36 -65 48" stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth="2.5" fill="none" />
        {/* Chordae Tendineae Strings */}
        <line x1="-50" y1="48" x2="-45" y2="70" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.25" />
        <line x1="-65" y1="48" x2="-60" y2="70" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.25" />
      </g>

      {/* Right Ventricle Chamber (Low Resistance Pumping) */}
      <g id="right-ventricle">
        <path
          d="M -105 28 
             C -110 75 -70 120 -20 135 
             C -20 70 -20 30 -50 25 
             C -75 25 -95 28 -105 28 Z"
          fill={isPaperMode ? '#FFFFFF' : '#1D4ED8'}
          fillOpacity={isPaperMode ? 1 : 0.8}
          stroke={isPaperMode ? '#000000' : '#60A5FA'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Flow Arrow Curling Upward toward Pulmonary Trunk */}
        <path d="M -65 95 Q -40 70 -35 20 M -42 28 L -35 20 L -30 30" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Interventricular Septum (Thick Muscular Divider) */}
      <path
        d="M -20 25 
           C -20 75 -20 125 -15 142 
           C 5 142 10 75 10 25 Z"
        fill={isPaperMode ? '#F1F5F9' : '#991B1B'}
        stroke={isPaperMode ? '#000000' : '#F87171'}
        strokeWidth={isPaperMode ? 2.5 : 2.5}
      />

      {/* Left Atrium Internal Chamber (Receives oxygenated blood) */}
      <g id="left-atrium">
        <path
          d="M 25 -35 
             C 50 -35 85 -20 85 15 
             C 55 15 35 15 20 10 Z"
          fill={isPaperMode ? '#FAFAFA' : '#991B1B'}
          stroke={isPaperMode ? '#000000' : '#EF4444'}
          strokeWidth={isPaperMode ? 2 : 2.5}
        />
        {/* Downward Flow Arrow */}
        <path d="M 52 -10 L 52 12 M 46 4 L 52 12 L 58 4" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Mitral (Bicuspid) Valve */}
      <g id="mitral-valve">
        <path d="M 35 12 Q 42 25 45 38" stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth="2.5" fill="none" />
        <path d="M 55 12 Q 52 25 48 38" stroke={isPaperMode ? '#000000' : '#FEF08A'} strokeWidth="2.5" fill="none" />
        {/* Chordae Tendineae */}
        <line x1="45" y1="38" x2="48" y2="65" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.25" />
        <line x1="48" y1="38" x2="55" y2="65" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.25" />
      </g>

      {/* Left Ventricle Chamber with Thick Systemic Myocardium */}
      <g id="left-ventricle">
        <path
          d="M 12 25 
             C 12 75 8 125 0 152 
             C 45 140 90 95 95 20 
             C 65 20 35 25 12 25 Z"
          fill={isPaperMode ? '#FFFFFF' : '#B91C1C'}
          fillOpacity={isPaperMode ? 1 : 0.9}
          stroke={isPaperMode ? '#000000' : '#F87171'}
          strokeWidth={isPaperMode ? 3 : 3.5}
        />
        {/* Extra Thick Outer Myocardium Line */}
        <path
          d="M 95 20 C 90 95 45 140 0 152"
          stroke={isPaperMode ? '#000000' : '#7F1D1D'}
          strokeWidth={isPaperMode ? 6 : 8}
          fill="none"
        />
        {/* Upward Hemodynamic Flow Arrow into Aorta */}
        <path d="M 50 115 Q 25 65 15 -15 M 10 -6 L 15 -15 L 22 -8" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>


    </g>
  );
};

/**
 * High-Resolution Saturated Hydrocarbons Diagram (Ethane & Propane single covalent bonds)
 */
export const HydrocarbonsDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="hydrocarbons-group" transform="translate(0, 0)">
      {/* Ethane (C2H6) Structure */}
      <g transform="translate(-160, 20)">
        <rect x="-110" y="-120" width="220" height="235" rx="8" fill={isPaperMode ? '#FAFAFA' : '#1E293B'} stroke={isPaperMode ? '#CBD5E1' : '#334155'} strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="0" y="-90" fill={isPaperMode ? '#0F172A' : '#F8FAFC'} fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          Ethane (C₂H₆)
        </text>

        {/* C—C single bond */}
        <line x1="-28" y1="0" x2="28" y2="0" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 3.5 : 4} />
        
        {/* Left Carbon C—H bonds */}
        <line x1="-35" y1="-18" x2="-35" y2="-55" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />
        <line x1="-35" y1="18" x2="-35" y2="55" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />
        <line x1="-55" y1="0" x2="-85" y2="0" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />

        {/* Right Carbon C—H bonds */}
        <line x1="35" y1="-18" x2="35" y2="-55" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />
        <line x1="35" y1="18" x2="35" y2="55" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />
        <line x1="55" y1="0" x2="85" y2="0" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 3 : 3} />

        {/* Atom labels */}
        <text x="-35" y="8" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
        <text x="35" y="8" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>

        <text x="-35" y="-62" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
        <text x="-35" y="76" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
        <text x="-95" y="8" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>

        <text x="35" y="-62" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
        <text x="35" y="76" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
        <text x="95" y="8" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>

        <text x="0" y="98" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">
          Single C—C Bond Length: 1.54 Å
        </text>
      </g>

      {/* Propane (C3H8) Structure */}
      <g transform="translate(160, 20)">
        <rect x="-135" y="-120" width="270" height="235" rx="8" fill={isPaperMode ? '#FAFAFA' : '#1E293B'} stroke={isPaperMode ? '#CBD5E1' : '#334155'} strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="0" y="-90" fill={isPaperMode ? '#0F172A' : '#F8FAFC'} fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          Propane (C₃H₈)
        </text>

        {/* C—C—C chain bonds */}
        <line x1="-62" y1="0" x2="-22" y2="0" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 3.5 : 4} />
        <line x1="22" y1="0" x2="62" y2="0" stroke={isPaperMode ? '#000000' : '#38BDF8'} strokeWidth={isPaperMode ? 3.5 : 4} />

        {/* Carbon atoms */}
        <text x="-70" y="8" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="24" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
        <text x="0" y="8" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="24" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
        <text x="70" y="8" fill={isPaperMode ? '#000000' : '#38BDF8'} fontSize="24" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>

        {/* C-H bonds and hydrogens */}
        {[-70, 0, 70].map((cx, i) => (
          <g key={`propane-c-${i}`}>
            <line x1={cx} y1="-16" x2={cx} y2="-52" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 2.5 : 3} />
            <line x1={cx} y1="16" x2={cx} y2="52" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 2.5 : 3} />
            <text x={cx} y="-58" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="18" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
            <text x={cx} y="72" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="18" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
          </g>
        ))}
        {/* Terminal hydrogens */}
        <line x1="-85" y1="0" x2="-112" y2="0" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 2.5 : 3} />
        <line x1="85" y1="0" x2="112" y2="0" stroke={isPaperMode ? '#000000' : '#94A3B8'} strokeWidth={isPaperMode ? 2.5 : 3} />
        <text x="-122" y="7" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="18" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
        <text x="122" y="7" fill={isPaperMode ? '#000000' : '#F1F5F9'} fontSize="18" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>

        <text x="0" y="98" fill={isPaperMode ? '#334155' : '#94A3B8'} fontSize="11" fontFamily="Georgia, serif" textAnchor="middle">
          Saturated Alkanes: Single σ-bonds only
        </text>
      </g>
    </g>
  );
};

/**
 * High-Resolution Rutherford-Bohr Atomic Model
 */
export const BohrAtomDiagram: React.FC<DiagramProps> = ({ isPaperMode }) => {
  return (
    <g id="bohr-atom-group" transform="translate(0, 20)">
      {/* Concentric Electron Orbital Shells */}
      <circle cx="0" cy="0" r="50" stroke={isPaperMode ? '#000000' : '#06B6D4'} strokeWidth={isPaperMode ? 1.75 : 2.5} strokeDasharray="5 3" fill="none" />
      <circle cx="0" cy="0" r="95" stroke={isPaperMode ? '#000000' : '#10B981'} strokeWidth={isPaperMode ? 1.75 : 2.5} strokeDasharray="5 3" fill="none" />
      <circle cx="0" cy="0" r="140" stroke={isPaperMode ? '#000000' : '#8B5CF6'} strokeWidth={isPaperMode ? 1.75 : 2.5} strokeDasharray="5 3" fill="none" />

      {/* Nucleus Cluster (Protons + Neutrons) */}
      <circle cx="0" cy="0" r="22" fill={isPaperMode ? '#FFFFFF' : '#EF4444'} stroke={isPaperMode ? '#000000' : '#FCA5A5'} strokeWidth={isPaperMode ? 2.5 : 3} />
      <text x="0" y="5" fill={isPaperMode ? '#000000' : '#FFFFFF'} fontSize="11" fontWeight="bold" textAnchor="middle">6p⁺ 6n⁰</text>

      {/* K-shell (n=1) Electrons */}
      <circle cx="0" cy="-50" r="5" fill={isPaperMode ? '#000000' : '#38BDF8'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />
      <circle cx="0" cy="50" r="5" fill={isPaperMode ? '#000000' : '#38BDF8'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />

      {/* L-shell (n=2) Electrons */}
      <circle cx="-95" cy="0" r="5" fill={isPaperMode ? '#000000' : '#34D399'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />
      <circle cx="95" cy="0" r="5" fill={isPaperMode ? '#000000' : '#34D399'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />
      <circle cx="0" cy="-95" r="5" fill={isPaperMode ? '#000000' : '#34D399'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />
      <circle cx="0" cy="95" r="5" fill={isPaperMode ? '#000000' : '#34D399'} stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.5" />

      {/* Shell Labels */}
      <text x="54" y="-52" fill={isPaperMode ? '#334155' : '#38BDF8'} fontSize="11" fontWeight="bold" fontFamily="monospace">K (n=1)</text>
      <text x="98" y="-4" fill={isPaperMode ? '#334155' : '#34D399'} fontSize="11" fontWeight="bold" fontFamily="monospace">L (n=2)</text>
      <text x="144" y="-4" fill={isPaperMode ? '#334155' : '#A78BFA'} fontSize="11" fontWeight="bold" fontFamily="monospace">M (n=3)</text>
    </g>
  );
};

