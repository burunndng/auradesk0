import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Module, colorMap } from '../../data/toolsData';
import { iconComponentMap } from '../../.claude/lib/iconMap';
import {
  TesseractIcon,
  ResonatorIcon,
  CelestialRoseIcon,
  ThirdEyeIcon
} from '../visualizations/SacredGeometryIcons';
import OrbitingIcons from './OrbitingIcons';

interface ModuleCircleProps {
  module: Module;
  isExpanded: boolean;
  onExpand: () => void;
}

// Sacred geometry icons for modules - matched to module essence
const moduleIconMap: Record<string, React.ReactNode> = {
  // Tesseract: 4D thinking, abstract consciousness, complexity
  mind: <TesseractIcon size={48} color="currentColor" />,
  // Resonator: Inner vibration, harmonic integration, resonance
  shadow: <ResonatorIcon size={48} color="currentColor" />,
  // Celestial Rose: Cycles, wholeness, cosmic order, embodiment
  body: <CelestialRoseIcon size={48} color="currentColor" />,
  // Third Eye: Inner vision, transcendence, spiritual awakening
  spirit: <ThirdEyeIcon size={48} color="currentColor" />
};

export default function ModuleCircle({
  module,
  isExpanded,
  onExpand
}: ModuleCircleProps) {
  const colors = colorMap[module.color];

  return (
    <motion.button
      onClick={onExpand}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group relative w-full aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer overflow-hidden ${colors.bg} ${
        isExpanded ? colors.borderActive : colors.border
      }`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent pointer-events-none" />

      {/* Module Icon - Sacred Geometry */}
      <div className={`relative z-10 ${colors.text} group-hover:${colors.textHover} transition-colors duration-300 flex items-center justify-center`}>
        {moduleIconMap[module.id]}
      </div>

      {/* Label + Count */}
      <div className="relative z-10 text-center">
        <h3 className="font-bold text-slate-100 text-lg leading-tight">
          {module.label}
        </h3>
        <p className={`text-sm ${colors.text} font-semibold mt-1`}>
          {module.count} tools
        </p>
      </div>

      {/* Expand indicator */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mt-2"
      >
        <ChevronDown size={20} className={`${colors.text} group-hover:${colors.textHover}`} />
      </motion.div>

      {/* Orbiting Icons on Hover */}
      <OrbitingIcons
        tools={module.tools.slice(0, 5)}
        color={module.color}
        radius={70}
      />
    </motion.button>
  );
}
