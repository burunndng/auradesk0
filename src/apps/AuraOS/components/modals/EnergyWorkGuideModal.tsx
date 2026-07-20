import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface EnergyWorkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnergyWorkGuideModal({ isOpen, onClose }: EnergyWorkGuideModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll when modal opens
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-800 border border-slate-700/80 rounded-lg shadow-2xl max-w-md w-full max-h-[70vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/80 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Energy Work Guide</h2>
            <p className="text-xs text-slate-400 mt-0.5">Techniques for vital energy cultivation</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-purple-300 font-semibold mb-2">Available Practices</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Bioenergetic Grounding
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Microcosmic Orbit
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Chakra Balancing
              </li>
            </ul>
          </div>

          <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/30">
             <h3 className="text-amber-300 font-semibold mb-2">Under Development</h3>
             <p className="text-sm text-slate-300">
               Interactive guided sessions for these practices are currently being built. 
               Check back soon for the full experience.
             </p>
          </div>
          
          <div className="flex justify-end">
             <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors">
               Close
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
