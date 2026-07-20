/**
 * AXIS Activity Picker
 * Radio group for selecting activity type
 *
 * Design: stone-950 base
 */

import React from 'react';
import { MessageSquare, BookOpen, Users, Swords, Flower2, Sparkles } from 'lucide-react';
import type { AXISActivityType } from '../../../../types';

interface AXISActivityPickerProps {
  onSelect: (activity: AXISActivityType) => void;
  selectedValue?: AXISActivityType | null;
}

const ACTIVITIES: Array<{ value: AXISActivityType; label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  {
    value: 'ai-conversation',
    label: 'Have an AI conversation',
    description: 'ChatGPT, Claude, or other AI chat',
    icon: MessageSquare,
  },
  {
    value: 'journal',
    label: 'Journal / write',
    description: 'Free writing or structured journaling',
    icon: BookOpen,
  },
  {
    value: 'therapy',
    label: 'Therapy / coaching session',
    description: 'With a professional or mentor',
    icon: Users,
  },
  {
    value: 'difficult-conversation',
    label: 'Difficult conversation',
    description: 'A challenging interpersonal exchange',
    icon: Swords,
  },
  {
    value: 'meditation',
    label: 'Meditation / contemplation',
    description: 'Sitting practice or walking meditation',
    icon: Flower2,
  },
  {
    value: 'other',
    label: 'Something else',
    description: 'Any reflective experience',
    icon: Sparkles,
  },
];

export default function AXISActivityPicker({ onSelect, selectedValue }: AXISActivityPickerProps) {
  return (
    <div className="space-y-2">
      {ACTIVITIES.map((activity) => {
        const Icon = activity.icon;
        const isSelected = selectedValue === activity.value;
        return (
          <button
            key={activity.value}
            onClick={() => onSelect(activity.value)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${isSelected
                ? 'bg-amber-500/10 border-amber-500/30 text-stone-100'
                : 'bg-stone-900/40 border-stone-700/30 text-stone-300 hover:border-stone-600 hover:bg-stone-900/60'
              }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={16} className={isSelected ? 'text-amber-400' : 'text-stone-500'} />
              <div>
                <p className="text-sm font-medium">{activity.label}</p>
                <p className={`text-xs ${isSelected ? 'text-amber-300/70' : 'text-stone-500'}`}>
                  {activity.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
