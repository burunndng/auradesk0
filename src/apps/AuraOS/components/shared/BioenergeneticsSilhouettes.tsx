/**
 * SVG Silhouette components for bioenergetics practice poses
 * Simple, clear human shapes showing key body positions
 */

import React from 'react';

interface SilhouetteProps {
  size?: number;
  className?: string;
}

// Standing Meditation: Feet hip-width, knees soft, grounded, earth energy rising
export const StandingMeditationSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-breathe ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head */}
    <circle cx="60" cy="25" r="12" />
    {/* Neck/shoulders */}
    <line x1="60" y1="37" x2="60" y2="55" strokeWidth="8" strokeLinecap="round" />
    {/* Shoulder hint */}
    <line x1="38" y1="50" x2="82" y2="50" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
    {/* Arms at sides — curved paths */}
    <path d="M 43 52 Q 38 72 34 92" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M 77 52 Q 82 72 86 92" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    {/* Torso */}
    <line x1="60" y1="55" x2="60" y2="110" strokeWidth="10" strokeLinecap="round" />
    {/* Hip hint */}
    <line x1="46" y1="110" x2="74" y2="110" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
    {/* Legs hip-width apart */}
    <line x1="48" y1="110" x2="42" y2="175" strokeWidth="7" strokeLinecap="round" />
    <line x1="72" y1="110" x2="78" y2="175" strokeWidth="7" strokeLinecap="round" />
    {/* Feet */}
    <ellipse cx="42" cy="178" rx="6" ry="4" />
    <ellipse cx="78" cy="178" rx="6" ry="4" />

    {/* ENERGY: Earth energy rising (grounding) */}
    <g opacity="0.6">
      <path d="M 42 180 Q 45 160 48 140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,2" />
      <path d="M 78 180 Q 75 160 72 140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,2" />
    </g>
  </svg>
);

// Heel Drops: On balls of feet, heels up, discharge energy downward
export const HeelDropsSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-bounce ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head */}
    <circle cx="60" cy="25" r="12" />
    {/* Shoulders/upper body */}
    <line x1="60" y1="37" x2="60" y2="60" strokeWidth="10" strokeLinecap="round" />
    {/* Arms raised slightly for balance */}
    <line x1="45" y1="50" x2="25" y2="65" strokeWidth="6" strokeLinecap="round" />
    <line x1="75" y1="50" x2="95" y2="65" strokeWidth="6" strokeLinecap="round" />
    {/* Torso */}
    <line x1="60" y1="60" x2="60" y2="115" strokeWidth="10" strokeLinecap="round" />
    {/* Legs engaged */}
    <line x1="50" y1="115" x2="48" y2="165" strokeWidth="7" strokeLinecap="round" />
    <line x1="70" y1="115" x2="72" y2="165" strokeWidth="7" strokeLinecap="round" />
    {/* Feet on balls - heels UP */}
    <path d="M 42 165 Q 45 155 48 165" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M 68 165 Q 70 155 72 165" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

    {/* ENERGY: Impact/discharge downward */}
    <g opacity="0.6">
      <line x1="48" y1="170" x2="45" y2="180" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="170" x2="50" y2="180" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="170" x2="70" y2="180" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="170" x2="65" y2="180" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

// Forward Bend: Bending forward, knees soft, energy releasing downward
export const ForwardBendSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-bounce ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head hanging down */}
    <circle cx="60" cy="85" r="10" />
    {/* Neck */}
    <line x1="60" y1="95" x2="60" y2="108" strokeWidth="8" strokeLinecap="round" />
    {/* Spine curved forward */}
    <path d="M 60 108 Q 65 130 60 155" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
    {/* Arms hanging down */}
    <line x1="50" y1="115" x2="35" y2="150" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="115" x2="85" y2="150" strokeWidth="6" strokeLinecap="round" />
    {/* Legs with soft knees */}
    <line x1="48" y1="155" x2="45" y2="178" strokeWidth="7" strokeLinecap="round" />
    <line x1="72" y1="155" x2="75" y2="178" strokeWidth="7" strokeLinecap="round" />
    {/* Feet */}
    <ellipse cx="45" cy="180" rx="6" ry="4" />
    <ellipse cx="75" cy="180" rx="6" ry="4" />

    {/* ENERGY: Release flowing down spine and out */}
    <g opacity="0.5">
      <path d="M 60 130 Q 55 145 52 160" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
      <path d="M 60 130 Q 65 145 68 160" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
    </g>
  </svg>
);

// The Bow: Arching backward, chest open, energy expanding outward
export const TheBowSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-pulse-expand ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head tilted back */}
    <circle cx="60" cy="30" r="12" />
    {/* Neck */}
    <line x1="60" y1="42" x2="60" y2="50" strokeWidth="8" strokeLinecap="round" />
    {/* Spine ARCHED backward */}
    <path d="M 60 50 Q 50 80 60 115" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    {/* Fists on lower back */}
    <circle cx="45" cy="95" r="5" />
    <circle cx="75" cy="95" r="5" />
    {/* Elbows pushed back */}
    <line x1="45" y1="100" x2="30" y2="85" strokeWidth="6" strokeLinecap="round" />
    <line x1="75" y1="100" x2="90" y2="85" strokeWidth="6" strokeLinecap="round" />
    {/* Chest OPEN/extended */}
    <ellipse cx="60" cy="70" rx="20" ry="15" fill="none" stroke="currentColor" strokeWidth="2" />
    {/* Legs with soft knees, hips forward */}
    <line x1="48" y1="115" x2="45" y2="175" strokeWidth="7" strokeLinecap="round" />
    <line x1="72" y1="115" x2="75" y2="175" strokeWidth="7" strokeLinecap="round" />
    {/* Feet */}
    <ellipse cx="45" cy="178" rx="6" ry="4" />
    <ellipse cx="75" cy="178" rx="6" ry="4" />

    {/* ENERGY: Expansion from chest outward & upward */}
    <g opacity="0.6">
      <path d="M 50 70 L 35 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 70 70 L 85 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 70 L 40 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 70 70 L 80 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

// Connected Breathing: Abstract central channel with chakra energy centers
export const ConnectedBreathingSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-breathe ${className}`}>
    {/* Central nadi/channel */}
    <line x1="60" y1="10" x2="60" y2="170" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

    {/* 7 Chakra points */}
    <circle cx="60" cy="20" r="6" opacity="0.8" /> {/* Crown */}
    <circle cx="60" cy="40" r="7" opacity="0.8" /> {/* Third Eye */}
    <circle cx="60" cy="60" r="7" opacity="0.8" /> {/* Throat */}
    <circle cx="60" cy="80" r="8" opacity="0.9" /> {/* Heart */}
    <circle cx="60" cy="105" r="7" opacity="0.8" /> {/* Solar Plexus */}
    <circle cx="60" cy="130" r="7" opacity="0.8" /> {/* Sacral */}
    <circle cx="60" cy="155" r="6" opacity="0.8" /> {/* Root */}

    {/* Energy spirals around channel */}
    <path d="M 50 40 Q 45 50 50 60 Q 55 70 50 80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <path d="M 70 50 Q 75 60 70 70 Q 65 80 70 90" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <path d="M 55 110 Q 50 120 55 130" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <path d="M 65 110 Q 70 120 65 130" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
  </svg>
);

// Extended Exhalation: Abstract calm, flowing, parasympathetic waves
export const ExtendedExhalationSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-breathe ${className}`}>
    {/* Concentric calming waves (like ripples) */}
    <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />

    {/* Flowing breath curves (exhale patterns) */}
    <path d="M 20 80 Q 40 75 60 80 Q 80 85 100 80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <path d="M 15 110 Q 40 105 60 110 Q 80 115 105 110" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <path d="M 25 140 Q 45 135 60 140 Q 75 145 95 140" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />

    {/* Belly/core symbol */}
    <ellipse cx="60" cy="70" rx="12" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" strokeDasharray="3,3" />
  </svg>
);

// Sound + Movement: Abstract vibration and sound waves radiating
export const SoundMovementSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-vibrate ${className}`}>
    {/* Source point (mouth/throat) */}
    <circle cx="60" cy="30" r="5" fill="currentColor" opacity="0.8" />

    {/* Concentric sound waves expanding outward */}
    <circle cx="60" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    <circle cx="60" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    <circle cx="60" cy="30" r="32" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />

    {/* Frequency/vibration lines radiating downward */}
    <path d="M 50 50 L 48 80" stroke="currentColor" strokeWidth="2" opacity="0.7" strokeDasharray="2,2" />
    <path d="M 60 48 L 60 85" stroke="currentColor" strokeWidth="2.5" opacity="0.8" strokeDasharray="2,2" />
    <path d="M 70 50 L 72 80" stroke="currentColor" strokeWidth="2" opacity="0.7" strokeDasharray="2,2" />

    {/* Body grounding (legs) */}
    <line x1="55" y1="90" x2="50" y2="160" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    <line x1="65" y1="90" x2="70" y2="160" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Pelvic Rocking: Abstract pelvic energy and creative/sexual chakra
export const PelvicRockingSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-bounce ${className}`}>
    {/* Pelvic bone structure (abstract) */}
    <ellipse cx="60" cy="70" rx="30" ry="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />

    {/* Sacral chakra center */}
    <circle cx="60" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
    <circle cx="60" cy="70" r="6" fill="currentColor" opacity="0.6" />

    {/* Spiral/creative energy swirling */}
    <path d="M 60 60 Q 68 65 70 75 Q 68 85 60 88 Q 52 85 50 75 Q 52 65 60 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />

    {/* Movement indicators (rocking motion) */}
    <path d="M 45 90 Q 60 95 75 90" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" strokeDasharray="3,2" />
    <path d="M 40 110 Q 60 115 80 110" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeDasharray="3,2" />

    {/* Grounding legs */}
    <line x1="50" y1="100" x2="45" y2="160" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
    <line x1="70" y1="100" x2="75" y2="160" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
  </svg>
);

// NEW: Belly Bowl Awakening - Supine, hand on belly, visceral activation
export const BellyBowlSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-breathe ${className}`}>
    {/* Head resting */}
    <circle cx="60" cy="35" r="10" opacity="0.7" />
    {/* Spine flat (supine) */}
    <line x1="60" y1="45" x2="60" y2="110" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
    {/* Arms at sides, one hand on belly */}
    <line x1="50" y1="55" x2="35" y2="60" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="70" x2="65" y2="85" strokeWidth="6" strokeLinecap="round" />
    {/* Hand on belly (prominent) */}
    <circle cx="60" cy="80" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    {/* Belly bowl (core area) */}
    <ellipse cx="60" cy="85" rx="18" ry="14" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
    {/* Knees bent, feet flat */}
    <line x1="48" y1="110" x2="45" y2="140" strokeWidth="6" strokeLinecap="round" />
    <line x1="72" y1="110" x2="75" y2="140" strokeWidth="6" strokeLinecap="round" />
    {/* Feet flat on floor */}
    <ellipse cx="45" cy="142" rx="7" ry="4" opacity="0.6" />
    <ellipse cx="75" cy="142" rx="7" ry="4" opacity="0.6" />
    {/* Visceral energy (internal warmth/glow) */}
    <g opacity="0.5">
      <circle cx="60" cy="85" r="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="60" cy="85" r="26" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
    </g>
  </svg>
);

// NEW: Jaw Release & Expression - Seated, jaw open, sound waves
export const JawReleaseSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-bounce ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head straight */}
    <circle cx="60" cy="30" r="12" />
    {/* Neck */}
    <line x1="60" y1="42" x2="60" y2="55" strokeWidth="8" strokeLinecap="round" />
    {/* Hands cupping jaw (showing massage/release) */}
    <path d="M 45 45 Q 40 50 45 60" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M 75 45 Q 80 50 75 60" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Jaw OPEN (emphasized) */}
    <path d="M 50 35 Q 60 50 70 35" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Sound waves emanating from mouth */}
    <circle cx="60" cy="45" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    <circle cx="60" cy="45" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    {/* Body seated */}
    <line x1="60" y1="60" x2="60" y2="110" strokeWidth="9" strokeLinecap="round" opacity="0.6" />
    {/* Legs seated */}
    <line x1="50" y1="110" x2="48" y2="160" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="110" x2="72" y2="160" strokeWidth="6" strokeLinecap="round" />
    {/* Feet */}
    <ellipse cx="48" cy="162" rx="6" ry="4" opacity="0.5" />
    <ellipse cx="72" cy="162" rx="6" ry="4" opacity="0.5" />
  </svg>
);

// NEW: Throat Opening Ritual - Standing, arms raised, neck exposed, throat activation
export const ThroatOpeningSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-pulse-expand ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head tilted back (slight) */}
    <circle cx="60" cy="28" r="11" />
    {/* Neck EXPOSED & prominent */}
    <line x1="55" y1="39" x2="55" y2="60" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
    <line x1="65" y1="39" x2="65" y2="60" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
    {/* Throat chakra activation point */}
    <circle cx="60" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
    {/* Arms raised in V-shape */}
    <line x1="50" y1="65" x2="35" y2="35" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="65" x2="85" y2="35" strokeWidth="6" strokeLinecap="round" />
    {/* Chest open */}
    <ellipse cx="60" cy="75" rx="22" ry="16" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    {/* Torso */}
    <line x1="60" y1="90" x2="60" y2="120" strokeWidth="9" strokeLinecap="round" opacity="0.6" />
    {/* Standing legs */}
    <line x1="50" y1="120" x2="48" y2="170" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="120" x2="72" y2="170" strokeWidth="6" strokeLinecap="round" />
    {/* Feet grounded */}
    <ellipse cx="48" cy="172" rx="6" ry="4" />
    <ellipse cx="72" cy="172" rx="6" ry="4" />
    {/* Vibration waves from throat */}
    <g opacity="0.6">
      <path d="M 55 50 L 50 45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 65 50 L 70 45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 55 55 L 48 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 65 55 L 72 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// NEW: Eye Liberation Practice - Seated, emphasizing eyes and gaze
export const EyeLiberationSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-breathe ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head (larger to emphasize eyes) */}
    <circle cx="60" cy="35" r="14" />
    {/* EYES - prominent and forward */}
    <circle cx="50" cy="32" r="4" fill="currentColor" opacity="0.9" />
    <circle cx="70" cy="32" r="4" fill="currentColor" opacity="0.9" />
    {/* Eye gaze lines (tracking/movement) */}
    <line x1="50" y1="32" x2="40" y2="28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="70" y1="32" x2="80" y2="28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="50" y1="32" x2="48" y2="42" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="70" y1="32" x2="72" y2="42" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    {/* Neck */}
    <line x1="60" y1="49" x2="60" y2="65" strokeWidth="7" strokeLinecap="round" opacity="0.6" />
    {/* Seated body */}
    <line x1="60" y1="65" x2="60" y2="115" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
    {/* Arms at sides */}
    <line x1="50" y1="70" x2="35" y2="90" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    <line x1="70" y1="70" x2="85" y2="90" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    {/* Seated legs */}
    <line x1="50" y1="115" x2="48" y2="160" strokeWidth="6" strokeLinecap="round" />
    <line x1="70" y1="115" x2="72" y2="160" strokeWidth="6" strokeLinecap="round" />
    {/* Feet */}
    <ellipse cx="48" cy="162" rx="6" ry="4" />
    <ellipse cx="72" cy="162" rx="6" ry="4" />
    {/* Perception/seeing field around eyes */}
    <g opacity="0.4">
      <circle cx="60" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    </g>
  </svg>
);

// NEW: Holotropic Spiral Breathing - Supine, spiral energy, altered state
export const HolotropicSpiralSilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-pulse-expand ${className}`}>
    {/* Head resting */}
    <circle cx="60" cy="35" r="11" opacity="0.7" />
    {/* Body supine (relaxed) */}
    <line x1="60" y1="46" x2="60" y2="120" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
    {/* Arms spread palms up (receptive) */}
    <line x1="50" y1="65" x2="30" y2="70" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    <line x1="70" y1="65" x2="90" y2="70" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    {/* Legs extended */}
    <line x1="55" y1="120" x2="50" y2="170" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
    <line x1="65" y1="120" x2="70" y2="170" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
    {/* SPIRAL energy ascending from body center */}
    <g opacity="0.7">
      <path d="M 60 80 Q 65 75 68 70 Q 70 65 67 60 Q 64 58 60 60" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M 60 95 Q 68 85 72 75 Q 75 65 70 55 Q 65 50 58 55" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M 60 110 Q 72 95 78 80 Q 82 70 75 55 Q 68 48 55 55" fill="none" stroke="currentColor" strokeWidth="2" />
    </g>
    {/* Aura/field around body */}
    <g opacity="0.4">
      <ellipse cx="60" cy="80" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    </g>
  </svg>
);

// NEW: Conscious Intensity Protocol - Standing wide stance, powerful, grounded
export const ConsciousIntensitySilhouette: React.FC<SilhouetteProps> = ({ size = 120, className = '' }) => (
  <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 120 180" strokeLinejoin="round" className={`fill-current stroke-current animate-vibrate ${className}`}>
    {/* Ambient aura */}
    <circle cx="60" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    {/* Head alert */}
    <circle cx="60" cy="25" r="11" />
    {/* Neck strong */}
    <line x1="60" y1="36" x2="60" y2="50" strokeWidth="8" strokeLinecap="round" />
    {/* Torso engaged */}
    <line x1="60" y1="50" x2="60" y2="110" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
    {/* Arms dynamic (one fist, one open) */}
    <line x1="50" y1="60" x2="35" y2="50" strokeWidth="6" strokeLinecap="round" /> {/* Fist left */}
    <circle cx="35" cy="48" r="5" fill="currentColor" opacity="0.8" />
    <line x1="70" y1="60" x2="85" y2="75" strokeWidth="6" strokeLinecap="round" opacity="0.6" /> {/* Open right */}
    {/* WIDE WARRIOR STANCE - legs spread wide */}
    <line x1="48" y1="110" x2="35" y2="170" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
    <line x1="72" y1="110" x2="85" y2="170" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
    {/* Feet grounded, wide */}
    <ellipse cx="35" cy="172" rx="8" ry="4" />
    <ellipse cx="85" cy="172" rx="8" ry="4" />
    {/* Power/tremor lines (vibration) */}
    <g opacity="0.6" strokeDasharray="2,2">
      <line x1="50" y1="70" x2="50" y2="100" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="65" x2="60" y2="105" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="70" x2="70" y2="100" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// Mapping of practice IDs to silhouette components
export const silhouetteMap: Record<string, React.FC<SilhouetteProps>> = {
  'standing-meditation': StandingMeditationSilhouette,
  'heel-drops': HeelDropsSilhouette,
  'forward-bend': ForwardBendSilhouette,
  'the-bow': TheBowSilhouette,
  'pelvic-rocking': PelvicRockingSilhouette,
  'connected-breathing': ConnectedBreathingSilhouette,
  'extended-exhalation': ExtendedExhalationSilhouette,
  'sound-movement': SoundMovementSilhouette,
  // NEW practices (6 advanced)
  'belly-bowl-awakening': BellyBowlSilhouette,
  'jaw-release-expression': JawReleaseSilhouette,
  'throat-opening-ritual': ThroatOpeningSilhouette,
  'eye-liberation-practice': EyeLiberationSilhouette,
  'holotropic-spiral-breathing': HolotropicSpiralSilhouette,
  'conscious-intensity-protocol': ConsciousIntensitySilhouette,
};

/**
 * Get silhouette component by practice ID
 */
export function getSilhouetteComponent(practiceId: string): React.FC<SilhouetteProps> {
  return silhouetteMap[practiceId] || StandingMeditationSilhouette;
}
