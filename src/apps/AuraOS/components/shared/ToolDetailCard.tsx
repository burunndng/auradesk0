import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Tool, Module, colorMap } from '../../data/toolsData';
import { getIconComponent } from '../../.claude/lib/iconMap';

interface ToolDetailCardProps {
  tool: Tool | null;
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (wizardId: string) => void;
}

export default function ToolDetailCard({
  tool,
  module,
  isOpen,
  onClose,
  onLaunch
}: ToolDetailCardProps) {
  if (!tool || !module) return null;

  const colors = colorMap[module.color];
  const borderColor = {
    teal: 'border-l-teal-500',
    purple: 'border-l-purple-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500'
  }[module.color];

  const handleLaunch = () => {
    onLaunch(tool.wizardId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border-2 border-l-4 p-6 bg-slate-900 ${colors.border} ${borderColor} shadow-2xl`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`${colors.text} p-2 rounded-lg bg-slate-800/50`}>
                  {React.createElement(getIconComponent(tool.iconName) || 'div', { size: 24 })}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100 leading-tight">
                    {tool.name}
                  </h3>
                  <p className={`text-xs ${colors.text} font-semibold mt-1`}>
                    {module.label}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="space-y-5">
              {/* What */}
              <div>
                <p className="font-semibold text-slate-100 text-sm uppercase tracking-wide mb-2">
                  What
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* When to Use */}
              <div>
                <p className="font-semibold text-slate-100 text-sm uppercase tracking-wide mb-2">
                  When to use
                </p>
                <ul className="space-y-2">
                  {tool.whenToUse.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-300">
                      <span className={`${colors.text} flex-shrink-0 mt-1`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Time estimate
                  </p>
                  <p className="font-semibold text-slate-100 text-sm">
                    {tool.timeEstimate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Depth level
                  </p>
                  <p className={`font-semibold text-sm ${colors.text}`}>
                    {tool.depth}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunch}
              className={`w-full mt-7 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${colors.ctaButton} shadow-lg`}
            >
              <span>Start Exploration</span>
              <span className="text-lg">→</span>
            </motion.button>

            {/* Description footer */}
            <p className="text-xs text-slate-500 text-center mt-4">
              {module.description}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
