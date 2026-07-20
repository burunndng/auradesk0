import React from 'react';
import { motion } from 'framer-motion';

export type FilterOption = 'all' | 'mind' | 'shadow' | 'body' | 'spirit';

interface FilterButtonsProps {
  active: FilterOption;
  onSelect: (option: FilterOption) => void;
}

const filterOptions: { id: FilterOption; label: string; color: string }[] = [
  { id: 'all', label: 'All Tools', color: 'slate' },
  { id: 'mind', label: 'Mind', color: 'teal' },
  { id: 'shadow', label: 'Shadow', color: 'purple' },
  { id: 'body', label: 'Body', color: 'emerald' },
  { id: 'spirit', label: 'Spirit', color: 'amber' }
];

const colorClasses = {
  slate: {
    active: 'bg-slate-500/30 text-slate-100 border-slate-400/50',
    inactive: 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:border-slate-600'
  },
  teal: {
    active: 'bg-teal-500/30 text-teal-100 border-teal-400/50',
    inactive: 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:border-teal-600'
  },
  purple: {
    active: 'bg-purple-500/30 text-purple-100 border-purple-400/50',
    inactive: 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:border-purple-600'
  },
  emerald: {
    active: 'bg-emerald-500/30 text-emerald-100 border-emerald-400/50',
    inactive: 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:border-emerald-600'
  },
  amber: {
    active: 'bg-amber-500/30 text-amber-100 border-amber-400/50',
    inactive: 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:border-amber-600'
  }
};

export default function FilterButtons({ active, onSelect }: FilterButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-6">
      {filterOptions.map(option => {
        const isActive = active === option.id;
        const colorKey = option.color as keyof typeof colorClasses;
        const classes = isActive
          ? colorClasses[colorKey].active
          : colorClasses[colorKey].inactive;

        return (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm border transition-all duration-300 ${classes}`}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
