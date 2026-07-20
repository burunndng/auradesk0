import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContraindicationScreenProps {
  onProceed: () => void;
  onCancel: () => void;
  practiceName: string;
}

export default function ContraindicationScreen({
  onProceed,
  onCancel,
  practiceName
}: ContraindicationScreenProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showWarning, setShowWarning] = useState(false);

  const contraindications = [
    {
      id: 'cardiac',
      label: 'I do NOT have cardiovascular disease or uncontrolled high blood pressure',
      description: 'Heart conditions, hypertension on medications, or arrhythmias'
    },
    {
      id: 'epilepsy',
      label: 'I do NOT have epilepsy or a history of seizures',
      description: 'Seizure disorders or epilepsy diagnoses'
    },
    {
      id: 'asthma',
      label: 'I do NOT have severe asthma or respiratory disease',
      description: 'Uncontrolled asthma that can be triggered by fast breathing'
    },
    {
      id: 'psychosis',
      label: 'I am NOT experiencing active psychosis or mania',
      description: 'Current untreated psychotic episodes or manic states'
    },
    {
      id: 'pregnancy',
      label: 'I am NOT currently pregnant',
      description: 'Pregnancy without medical clearance'
    },
    {
      id: 'panic',
      label: 'I do NOT have unmanaged panic disorder or dissociative disorders',
      description: 'Untreated panic or dissociative conditions that could be destabilized'
    },
    {
      id: 'understanding',
      label: 'I understand this is an advanced, high-intensity practice',
      description: 'This requires months of prior grounding practice experience'
    },
    {
      id: 'support',
      label: 'I have support available (therapist, trusted friend, or will practice during day)',
      description: 'It\'s recommended to have someone available nearby, especially first session'
    }
  ];

  const allChecked = contraindications.every(item => checkedItems[item.id]);

  const handleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setShowWarning(false);
  };

  const handleProceed = () => {
    if (!allChecked) {
      setShowWarning(true);
      return;
    }
    onProceed();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-stone-950 border border-amber-700/40 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-950 border-b border-amber-700/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-serif text-amber-50">
              Safety Requirements: {practiceName}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-amber-50 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-amber-950/20 border border-amber-700/30 rounded-lg p-4">
            <p className="text-sm text-amber-100">
              <strong>Holotropic Spiral Breathing</strong> is an advanced, high-intensity practice that involves
              controlled hyperventilation and non-ordinary states of consciousness. It carries specific contraindications
              and risks for certain medical conditions. Please review carefully before proceeding.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="text-amber-50 font-serif text-sm font-semibold">
              Please confirm all of the following:
            </h3>

            {contraindications.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-stone-900/50 transition"
              >
                <input
                  type="checkbox"
                  checked={checkedItems[item.id] || false}
                  onChange={() => handleCheck(item.id)}
                  className="mt-1 w-4 h-4 rounded border-stone-400 text-amber-600 focus:ring-amber-600"
                  aria-label={item.label}
                />
                <div className="flex-1">
                  <div className="text-sm text-amber-50 font-medium">{item.label}</div>
                  <div className="text-xs text-stone-400 mt-1">{item.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Warning */}
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/40 border border-red-700/50 rounded-lg p-4"
            >
              <p className="text-red-200 text-sm">
                <strong>Please review all items above.</strong> You must confirm all safety requirements before proceeding.
              </p>
            </motion.div>
          )}

          {/* Additional Safety Info */}
          <div className="bg-stone-900/50 border border-stone-700/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-50 text-sm font-semibold">Additional Safety Recommendations:</h4>
            <ul className="text-xs text-stone-300 space-y-2 list-disc list-inside">
              <li>Have a support person nearby, especially for your first session</li>
              <li>Never exceed 60 minutes alone</li>
              <li>Music is integral—use provided playlists</li>
              <li>Have water nearby and access to bathroom</li>
              <li>Practice during daylight if possible</li>
              <li>Allow 1-2 hours for full integration afterward</li>
              <li>Maximum once every 2 weeks (monthly ideal)</li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="bg-stone-900/30 border border-stone-700/20 rounded-lg p-4">
            <p className="text-xs text-stone-400 mb-3">
              If you have significant trauma history or unresolved PTSD, consider working with a trauma-informed therapist before this practice.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-stone-950 border-t border-amber-700/30 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-stone-600 text-stone-300 hover:bg-stone-900 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!allChecked}
            className={`px-6 py-2 rounded font-medium text-sm transition flex items-center gap-2 ${
              allChecked
                ? 'bg-amber-700 text-amber-50 hover:bg-amber-600'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }`}
          >
            {allChecked ? 'Begin Practice' : 'Complete All Confirmations'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
