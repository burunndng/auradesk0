import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function DisclaimerBanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative bg-rose-950/40 border border-rose-800/50 rounded-lg p-3 mb-4 overflow-hidden"
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Atmospheric rose border pulse — communicates importance without alarm */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(251, 113, 133, 0)' }}
          animate={{
            boxShadow: [
              'inset 0 0 0 1px rgba(251, 113, 133, 0)',
              'inset 0 0 0 1px rgba(251, 113, 133, 0.35)',
              'inset 0 0 0 1px rgba(251, 113, 133, 0)',
            ],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
      )}
      <p className="text-xs text-rose-300 leading-relaxed relative z-10">
        <strong>Disclaimer:</strong> This tool is for self-exploration and personal development, not therapy or medical treatment.
        If you are in crisis, contact the{' '}
        <strong>988 Suicide & Crisis Lifeline</strong> (call or text 988) or your local emergency services immediately.
      </p>
    </motion.div>
  );
}
