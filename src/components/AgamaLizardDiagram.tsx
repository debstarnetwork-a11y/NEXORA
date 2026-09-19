import React from 'react';

interface DiagramProps {
  isPaperMode: boolean;
  activePinId?: string | null;
  renderMode?: '3d' | '2d' | 'paper';
}

/**
 * Authentic Zoology Textbook & Real-Life Model:
 * Agama Lizard (Agama agama - Rainbow Rock Agama)
 * Displays distinctive morphology:
 * - Flame orange/coral cranial head with pointed snout, nares, eye with movable lids, circular tympanum, and gular throat fold
 * - Mid-dorsal nuchal and trunk spine crest
 * - Keeled keratinized epidermal scales on dorsoventrally flattened trunk (metallic cobalt blue in male)
 * - Pentadactyl forelimbs and powerful hindlimbs with sharp recurved claws (digit IV elongated)
 * - Transverse cloacal slit / vent
 * - Extremely long tapering tail banded in deep indigo and vibrant flame orange
 * 
 * Thoroughly differentiates:
 * - 3D Multi-Colour: Volumetric muscular shading, light-falloff gradients, specular keeled scale highlights, 
 *   foreground/background limb depth parallax, 3D cast ground shadow, and 3D spatial orientation axes [X,Y,Z].
 * - 2D Multi-Colour: Orthographic lateral morphological schematic with anatomical region divisions (Cephalic, Cervical, 
 *   Thoraco-Abdominal, Caudal), 2D Cartesian reference grid [X,Y], and metric scale bar (10 cm).
 * - B&W Paper Sheet: High-precision monochrome stippled zoological ink drafting on notebook paper.
 */
export const AgamaLizardDiagram: React.FC<DiagramProps> = ({ isPaperMode, renderMode = '3d', activePinId }) => {
  const is3D = !isPaperMode && renderMode === '3d';
  const is2D = !isPaperMode && renderMode === '2d';

  return (
    <g id="agama-lizard-diagram" transform="translate(0, 0)">
      {/* SVG Defs for 3D Shading, Gradients, and Patterns */}
      <defs>
        {/* 3D Volumetric Head Gradient (Flame Orange to Coral) */}
        <radialGradient id="agama-head-gradient" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>

        {/* 3D Volumetric Trunk Gradient (Cobalt Blue to Midnight Indigo) */}
        <linearGradient id="agama-trunk-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="25%" stopColor="#0284C7" />
          <stop offset="65%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </linearGradient>

        {/* 3D Metallic Scale Specular Gradient */}
        <linearGradient id="agama-dorsal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="20%" stopColor="#0284C7" />
          <stop offset="70%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* 3D Forelimb Foreground Gradient */}
        <linearGradient id="agama-limb-fore" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* 3D Limb Background Shadowed Gradient */}
        <linearGradient id="agama-limb-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="60%" stopColor="#0C4A6E" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* 3D Tail Proximal Dark Band */}
        <linearGradient id="agama-tail-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0C4A6E" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* 3D Tail Distal Flame Band */}
        <linearGradient id="agama-tail-flame" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* 2D Flat Color Swatches */}
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodOpacity="0.35" floodColor="#000000" />
        </filter>
      </defs>

      {/* ============================================================ */}
      {/* 1. MODE-SPECIFIC BACKGROUND ENVIRONMENT & REFERENCE SYSTEMS */}
      {/* ============================================================ */}

      {/* 3D MODE: Volumetric Ground Shadow & 3D Spatial Depth Axes */}
      {is3D && (
        <g id="agama-3d-environment">
          {/* Ground Contact Cast Shadow */}
          <ellipse cx="0" cy="118" rx="270" ry="24" fill="#020617" fillOpacity="0.45" filter="url(#soft-shadow)" />
          <ellipse cx="-190" cy="112" rx="60" ry="14" fill="#020617" fillOpacity="0.3" />
          <ellipse cx="140" cy="120" rx="110" ry="16" fill="#020617" fillOpacity="0.35" />

          {/* 3D Spatial Depth Orientation Axes (Bottom Left Corner) */}
          <g transform="translate(-320, 110)">
            <rect x="-10" y="-45" width="90" height="55" rx="6" fill="#0F172A" fillOpacity="0.75" stroke="#334155" strokeWidth="1" />
            <line x1="15" y1="-5" x2="65" y2="-5" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="69" y="-2" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            <line x1="15" y1="-5" x2="15" y2="-38" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <text x="12" y="-40" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>
            <line x1="15" y1="-5" x2="-2" y2="8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <text x="-8" y="15" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
            <text x="35" y="-22" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">3D Spatial</text>
          </g>
        </g>
      )}

      {/* 2D MODE: Orthographic Cartesian Grid, Regional Demarcations & Metric Scale Bar */}
      {is2D && (
        <g id="agama-2d-schematic-guides" opacity="0.85">
          {/* 2D Coordinate Grid lines */}
          <line x1="-340" y1="110" x2="340" y2="110" stroke="#475569" strokeWidth="1.5" />
          <line x1="-340" y1="-120" x2="-340" y2="110" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="340" y1="-120" x2="340" y2="110" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Morphological Region Partition Dividers */}
          {/* Cephalic Region (Head) Boundary */}
          <line x1="-160" y1="-110" x2="-160" y2="110" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <rect x="-260" y="-125" width="90" height="18" rx="4" fill="#0F172A" stroke="#F97316" strokeWidth="1" />
          <text x="-215" y="-113" fill="#F97316" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">I. CEPHALIC</text>

          {/* Cervical & Trunk Boundary */}
          <line x1="80" y1="-110" x2="80" y2="110" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <rect x="-60" y="-125" width="120" height="18" rx="4" fill="#0F172A" stroke="#0284C7" strokeWidth="1" />
          <text x="0" y="-113" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">II. THORACO-ABDOMINAL</text>

          {/* Caudal (Tail) Region */}
          <rect x="150" y="-125" width="100" height="18" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
          <text x="200" y="-113" fill="#F59E0B" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">III. CAUDAL (TAIL)</text>

          {/* Anatomical Scale Bar: 10 cm Standard */}
          <g transform="translate(180, 100)">
            <line x1="0" y1="0" x2="120" y2="0" stroke="#FFFFFF" strokeWidth="3" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="60" y1="-4" x2="60" y2="4" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="120" y1="-6" x2="120" y2="6" stroke="#FFFFFF" strokeWidth="2" />
            <text x="60" y="16" fill="#F8FAFC" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">10 cm Scale</text>
          </g>
        </g>
      )}

      {/* PAPER MODE: Metric Ruler & Dissection Scale */}
      {isPaperMode && (
        <g id="agama-paper-scale" transform="translate(180, 105)">
          <line x1="0" y1="0" x2="120" y2="0" stroke="#000000" strokeWidth="2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#000000" strokeWidth="2" />
          <line x1="60" y1="-3" x2="60" y2="3" stroke="#000000" strokeWidth="1.5" />
          <line x1="120" y1="-5" x2="120" y2="5" stroke="#000000" strokeWidth="2" />
          <text x="60" y="14" fill="#000000" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Scale: 10 cm</text>
        </g>
      )}

      {/* ============================================================ */}
      {/* 2. RECESSED BACKGROUND LIMBS (PARALLAX DEPTH IN 3D)          */}
      {/* ============================================================ */}

      {/* Background Left Forelimb (Pectoral) */}
      <g id="agama-limb-back-fore" transform="translate(-140, 20)">
        {/* Upper Arm & Forearm in background shadow */}
        <path
          d="M -10 -5 C -15 20 -20 45 -22 65 C -22 75 -24 82 -25 88"
          fill="none"
          stroke={isPaperMode ? '#000000' : is3D ? 'url(#agama-limb-back)' : '#0369A1'}
          strokeWidth={isPaperMode ? 7 : is3D ? 9 : 8}
          strokeLinecap="round"
          strokeDasharray={isPaperMode ? 'none' : undefined}
          opacity={is3D ? 0.65 : 0.85}
        />
        {/* Background Claws */}
        <path
          d="M -25 88 L -34 94 M -25 88 L -28 97 M -25 88 L -20 98"
          stroke={isPaperMode ? '#000000' : '#075985'}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
      </g>

      {/* Background Left Hindlimb (Pelvic) */}
      <g id="agama-limb-back-hind" transform="translate(65, 30)">
        {/* Thigh (Femur) and Crus */}
        <path
          d="M 5 -10 C 25 15 45 40 48 70 C 50 82 52 90 55 96"
          fill="none"
          stroke={isPaperMode ? '#000000' : is3D ? 'url(#agama-limb-back)' : '#0369A1'}
          strokeWidth={isPaperMode ? 10 : is3D ? 12 : 10}
          strokeLinecap="round"
          opacity={is3D ? 0.6 : 0.85}
        />
        {/* Background digits */}
        <path
          d="M 55 96 L 68 104 M 55 96 L 62 108 M 55 96 L 50 108"
          stroke={isPaperMode ? '#000000' : '#075985'}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.65}
        />
      </g>

      {/* ============================================================ */}
      {/* 3. LONG TAPERING CAUDAL REGION (TAIL)                        */}
      {/* ============================================================ */}
      <g id="agama-tail">
        {/* Proximal Dark Indigo Segment */}
        <path
          d="M 80 28 
             C 120 22 170 12 215 5 
             C 215 17 165 36 80 44 Z"
          fill={isPaperMode ? '#FFFFFF' : is3D ? 'url(#agama-tail-dark)' : '#0C4A6E'}
          stroke={isPaperMode ? '#000000' : '#0284C7'}
          strokeWidth={isPaperMode ? 2.5 : 2}
        />

        {/* Distal Brilliant Flame Orange / Yellow Segment (Banded) */}
        <path
          d="M 215 5 
             C 255 -2 295 -12 325 -25 
             C 335 -30 338 -34 340 -36 
             C 337 -34 330 -26 315 -18 
             C 285 -2 245 10 215 17 Z"
          fill={isPaperMode ? '#F8FAFC' : is3D ? 'url(#agama-tail-flame)' : '#EA580C'}
          stroke={isPaperMode ? '#000000' : '#F97316'}
          strokeWidth={isPaperMode ? 2 : 2}
        />

        {/* Caudal Scale Whorls & Segment Rings */}
        {[100, 125, 150, 175, 200, 230, 260, 290, 315].map((tx, idx) => {
          const ty1 = 20 - (tx - 80) * 0.16;
          const ty2 = 38 - (tx - 80) * 0.19;
          return (
            <line
              key={`tail-whorl-${idx}`}
              x1={tx}
              y1={ty1}
              x2={tx - 4}
              y2={ty2}
              stroke={isPaperMode ? '#475569' : tx < 215 ? '#0284C7' : '#FB923C'}
              strokeWidth={1.5}
              strokeDasharray={isPaperMode ? '2 1' : undefined}
            />
          );
        })}
      </g>

      {/* ============================================================ */}
      {/* 4. MAIN TRUNK / BODY WITH KEELED EPIDERMAL SCALES           */}
      {/* ============================================================ */}
      <g id="agama-trunk">
        {/* Muscular, Dorsoventrally Flattened Body Outline */}
        <path
          d="M -155 0 
             C -110 -25 -40 -32 20 -28 
             C 55 -25 75 5 85 28 
             C 75 48 40 55 -20 54 
             C -80 52 -135 40 -155 18 
             C -162 10 -162 2 -155 0 Z"
          fill={isPaperMode ? '#FFFFFF' : is3D ? 'url(#agama-trunk-gradient)' : '#0284C7'}
          stroke={isPaperMode ? '#000000' : '#0369A1'}
          strokeWidth={isPaperMode ? 3 : is3D ? 3.5 : 2.5}
          filter={is3D ? 'url(#soft-shadow)' : undefined}
        />

        {/* 3D Longitudinal Dorsal Keeled Ridge Highlight */}
        {is3D && (
          <path
            d="M -145 -6 C -90 -22 -30 -24 30 -20 C 60 -15 75 5 80 20"
            fill="none"
            stroke="#7DD3FC"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}

        {/* Keeled Epidermal Scale Textures across Dorsum */}
        <g id="agama-scales-texture" opacity={isPaperMode ? 0.6 : 0.45}>
          {/* Row 1 */}
          {[-120, -95, -70, -45, -20, 5, 30, 55].map((sx, i) => (
            <path
              key={`scale-r1-${i}`}
              d={`M ${sx} -10 L ${sx + 8} -14 L ${sx + 16} -10 L ${sx + 8} -6 Z`}
              fill={isPaperMode ? '#FFFFFF' : '#38BDF8'}
              stroke={isPaperMode ? '#000000' : '#0C4A6E'}
              strokeWidth={1}
            />
          ))}
          {/* Row 2 */}
          {[-130, -105, -80, -55, -30, -5, 20, 45, 70].map((sx, i) => (
            <path
              key={`scale-r2-${i}`}
              d={`M ${sx} 8 L ${sx + 9} 4 L ${sx + 18} 8 L ${sx + 9} 12 Z`}
              fill={isPaperMode ? '#FFFFFF' : '#38BDF8'}
              stroke={isPaperMode ? '#000000' : '#0C4A6E'}
              strokeWidth={1}
            />
          ))}
          {/* Row 3 */}
          {[-110, -85, -60, -35, -10, 15, 40].map((sx, i) => (
            <path
              key={`scale-r3-${i}`}
              d={`M ${sx} 26 L ${sx + 8} 22 L ${sx + 16} 26 L ${sx + 8} 30 Z`}
              fill={isPaperMode ? '#FFFFFF' : '#38BDF8'}
              stroke={isPaperMode ? '#000000' : '#0C4A6E'}
              strokeWidth={1}
            />
          ))}
        </g>

        {/* 2D Cut / Histological Plane Accent */}
        {is2D && (
          <g id="agama-2d-axial-markers">
            <line x1="-155" y1="12" x2="85" y2="28" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="-35" cy="18" r="3" fill="#FBBF24" />
            <text x="-35" y="32" fill="#FDE68A" fontSize="8" fontFamily="monospace" textAnchor="middle">Mid-Dorsal Axis</text>
          </g>
        )}
      </g>

      {/* ============================================================ */}
      {/* 5. NUCHAL & DORSAL SPINE CREST                              */}
      {/* ============================================================ */}
      <g id="agama-dorsal-crest">
        {/* Mid-Dorsal Erect Spines running along Vertebral Line */}
        {[-165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((cx, idx) => {
          const cy = -18 - Math.sin((cx + 165) / 240 * Math.PI) * 14;
          const h = 8 + (idx < 5 ? 5 : (17 - idx) * 0.4); // Nuchal spines larger
          return (
            <polygon
              key={`spine-${idx}`}
              points={`${cx},${cy} ${cx + 4},${cy - h} ${cx + 7},${cy + 1}`}
              fill={isPaperMode ? '#000000' : is3D ? '#F97316' : '#EA580C'}
              stroke={isPaperMode ? '#000000' : '#C2410C'}
              strokeWidth={1.2}
            />
          );
        })}
      </g>

      {/* ============================================================ */}
      {/* 6. TRIANGULAR CRANIAL HEAD (FLAME ORANGE / CORAL)          */}
      {/* ============================================================ */}
      <g id="agama-head">
        {/* Cranium & Snout Contour */}
        <path
          d="M -155 0 
             C -175 -8 -205 -18 -240 -15 
             C -268 -12 -282 2 -290 12 
             C -295 18 -292 24 -280 28 
             C -255 35 -225 44 -195 45 
             C -175 45 -160 30 -155 18 Z"
          fill={isPaperMode ? '#FFFFFF' : is3D ? 'url(#agama-head-gradient)' : '#EA580C'}
          stroke={isPaperMode ? '#000000' : '#C2410C'}
          strokeWidth={isPaperMode ? 3 : 3.5}
          filter={is3D ? 'url(#soft-shadow)' : undefined}
        />

        {/* Mouth Cleft (Oral Commissure) */}
        <path
          d="M -290 14 C -270 16 -245 18 -215 18"
          fill="none"
          stroke={isPaperMode ? '#000000' : '#7C2D12'}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* External Nares (Nostril) */}
        <g id="agama-nostril" transform="translate(-275, 4)">
          <ellipse cx="0" cy="0" rx="3.5" ry="2.2" fill="#000000" />
          <path d="M -3 3 Q 0 5 4 2" stroke={isPaperMode ? '#000000' : '#FED7AA'} strokeWidth="1" fill="none" />
        </g>

        {/* Lateral Eye with Movable Eyelids */}
        <g id="agama-eye" transform="translate(-235, -2)">
          {/* Orbital Socket Depression */}
          <ellipse cx="0" cy="0" rx="14" ry="11" fill={isPaperMode ? '#E2E8F0' : '#9A3412'} stroke={isPaperMode ? '#000000' : '#7C2D12'} strokeWidth={1.5} />
          {/* Eyeball Sclera / Iris */}
          <circle cx="0" cy="0" r="8" fill={isPaperMode ? '#FFFFFF' : '#F59E0B'} stroke={isPaperMode ? '#000000' : '#78350F'} strokeWidth={1} />
          {/* Round Pupil */}
          <circle cx="0" cy="0" r="4.5" fill="#000000" />
          {/* Specular 3D Reflection */}
          {!isPaperMode && <circle cx="-2" cy="-2" r="1.8" fill="#FFFFFF" />}
          {/* Upper Eyelid Crease */}
          <path d="M -13 -3 C -6 -11 6 -11 13 -3" fill="none" stroke={isPaperMode ? '#000000' : '#FED7AA'} strokeWidth={2} />
          {/* Lower Eyelid Crease */}
          <path d="M -12 2 C -5 9 5 9 12 2" fill="none" stroke={isPaperMode ? '#000000' : '#7C2D12'} strokeWidth={1.5} />
        </g>

        {/* Tympanum (Tympanic Membrane / Ear Drum) */}
        <g id="agama-tympanum" transform="translate(-188, 6)">
          <circle
            cx="0"
            cy="0"
            r="8.5"
            fill={isPaperMode ? '#CBD5E1' : '#451A03'}
            stroke={isPaperMode ? '#000000' : '#9A3412'}
            strokeWidth={2}
          />
          <ellipse cx="0" cy="0" rx="6" ry="6" fill={isPaperMode ? '#F1F5F9' : '#1E1B4B'} stroke={isPaperMode ? '#475569' : '#000000'} strokeWidth={1} />
        </g>

        {/* Gular Fold & Throat Dewlap (Under Chin) */}
        <g id="agama-gular-fold">
          <path
            d="M -260 28 C -240 45 -215 52 -180 48"
            fill="none"
            stroke={isPaperMode ? '#000000' : '#9A3412'}
            strokeWidth={isPaperMode ? 2.5 : 3}
          />
          {/* Longitudinal Fold Lines */}
          <path d="M -245 34 Q -220 44 -195 42" fill="none" stroke={isPaperMode ? '#475569' : '#C2410C'} strokeWidth={1.5} strokeDasharray="3 2" />
          <path d="M -230 38 Q -210 48 -190 44" fill="none" stroke={isPaperMode ? '#475569' : '#C2410C'} strokeWidth={1.5} strokeDasharray="3 2" />
        </g>

        {/* Cephalic Epidermal Shields / Plate Grooves */}
        <g opacity="0.35">
          <path d="M -260 -4 L -250 8 M -240 -10 L -228 2 M -215 -12 L -205 0" stroke={isPaperMode ? '#000000' : '#FFFFFF'} strokeWidth="1.2" />
        </g>
      </g>

      {/* ============================================================ */}
      {/* 7. CLOACAL APERTURE (VENT) & FEMORAL PORES                   */}
      {/* ============================================================ */}
      <g id="agama-cloaca-vent" transform="translate(68, 48)">
        {/* Transverse Cloacal Slit */}
        <path d="M -10 0 C 0 4 10 4 20 0" fill="none" stroke={isPaperMode ? '#000000' : '#0369A1'} strokeWidth={2.5} strokeLinecap="round" />
        
        {/* Row of Femoral Pores along thigh base */}
        {[-8, -2, 4, 10, 16].map((fx, i) => (
          <circle key={`pore-${i}`} cx={fx} cy={-8} r="1.5" fill={isPaperMode ? '#000000' : '#FBBF24'} stroke="#000" strokeWidth="0.5" />
        ))}
      </g>

      {/* ============================================================ */}
      {/* 8. FOREGROUND PENTADACTYL LIMBS WITH RECURVED CLAWS          */}
      {/* ============================================================ */}

      {/* Foreground Right Forelimb (Pectoral Limb) */}
      <g id="agama-limb-fore-right" transform="translate(-115, 30)">
        {/* Brachium (Upper arm) -> Antebrachium (Forearm) */}
        <path
          d="M -15 0 
             C -25 22 -35 48 -35 70 
             C -35 84 -38 90 -45 98 
             C -36 100 -24 92 -20 80 
             C -15 62 -5 32 0 0 Z"
          fill={isPaperMode ? '#FFFFFF' : is3D ? 'url(#agama-limb-fore)' : '#0284C7'}
          stroke={isPaperMode ? '#000000' : '#0369A1'}
          strokeWidth={isPaperMode ? 2.5 : 3}
          filter={is3D ? 'url(#soft-shadow)' : undefined}
        />

        {/* Manus with 5 Clawed Digits */}
        <g id="agama-fore-digits" transform="translate(-45, 98)">
          {/* Digit I */}
          <path d="M 0 0 L -12 6 L -16 5" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3" strokeLinecap="round" />
          <path d="M -16 5 L -20 8" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" />
          {/* Digit II */}
          <path d="M 2 2 L -8 15 L -12 17" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3" strokeLinecap="round" />
          <path d="M -12 17 L -15 22" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" />
          {/* Digit III */}
          <path d="M 5 3 L 2 20 L 0 24" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3" strokeLinecap="round" />
          <path d="M 0 24 L -1 30" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" />
          {/* Digit IV (Longest digit) */}
          <path d="M 7 2 L 14 20 L 16 26" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3" strokeLinecap="round" />
          <path d="M 16 26 L 19 33" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" />
          {/* Digit V */}
          <path d="M 9 0 L 20 12 L 24 15" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 24 15 L 28 18" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>

      {/* Foreground Right Hindlimb (Pelvic Limb - Muscular & Powerful) */}
      <g id="agama-limb-hind-right" transform="translate(45, 36)">
        {/* Muscular Thigh (Femur) and Shank (Crus) */}
        <path
          d="M -10 -5 
             C 10 15 20 40 18 65 
             C 16 80 10 92 4 102 
             C 14 104 28 92 32 78 
             C 38 55 35 25 15 -10 Z"
          fill={isPaperMode ? '#FFFFFF' : is3D ? 'url(#agama-limb-fore)' : '#0284C7'}
          stroke={isPaperMode ? '#000000' : '#0369A1'}
          strokeWidth={isPaperMode ? 2.5 : 3.5}
          filter={is3D ? 'url(#soft-shadow)' : undefined}
        />

        {/* Pes (Foot) with 5 Clawed Digits - Digit IV characteristically elongated */}
        <g id="agama-hind-digits" transform="translate(4, 102)">
          {/* Digit I */}
          <path d="M 0 0 L -14 4 L -18 2" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -18 2 L -23 5" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Digit II */}
          <path d="M 2 2 L -10 14 L -14 16" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -14 16 L -18 22" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Digit III */}
          <path d="M 5 3 L 0 22 L -2 26" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -2 26 L -4 33" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Digit IV (Greatly Elongated in Agamids) */}
          <path d="M 8 2 L 18 24 L 22 32" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="4" strokeLinecap="round" />
          <path d="M 22 32 L 26 40" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Digit V */}
          <path d="M 11 0 L 26 14 L 32 18" stroke={isPaperMode ? '#000000' : '#0284C7'} strokeWidth="3" strokeLinecap="round" />
          <path d="M 32 18 L 37 22" stroke={isPaperMode ? '#000000' : '#F8FAFC'} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>


    </g>
  );
};
