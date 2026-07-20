import React, { useState, memo } from 'react';

export interface PhenomenologicalReport {
  bodySensation: string;
  bodyLocation: string;
  emotion: string;
  imagery: string;
  thought: string;
  hardToSense: boolean;
}

interface PhenomenologicalReportInputProps {
  onSubmit: (report: PhenomenologicalReport) => void;
  compact?: boolean;
  bodyOnly?: boolean;
  initialData?: Partial<PhenomenologicalReport>;
}

// Isolated text input sub-components for INP performance
const IsolatedTextarea = memo(({
  value,
  onChange,
  placeholder,
  label,
  rows = 3
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  rows?: number;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs sm:text-sm font-medium text-slate-300">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
    />
  </div>
));

IsolatedTextarea.displayName = 'IsolatedTextarea';

const IsolatedInput = memo(({
  value,
  onChange,
  placeholder,
  label
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs sm:text-sm font-medium text-slate-300">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
    />
  </div>
));

IsolatedInput.displayName = 'IsolatedInput';

export default function PhenomenologicalReportInput({
  onSubmit,
  compact = false,
  bodyOnly = false,
  initialData = {}
}: PhenomenologicalReportInputProps) {
  const [bodySensation, setBodySensation] = useState(initialData.bodySensation || '');
  const [bodyLocation, setBodyLocation] = useState(initialData.bodyLocation || 'chest');
  const [emotion, setEmotion] = useState(initialData.emotion || '');
  const [imagery, setImagery] = useState(initialData.imagery || '');
  const [thought, setThought] = useState(initialData.thought || '');
  const [hardToSense, setHardToSense] = useState(initialData.hardToSense || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bodySensation,
      bodyLocation,
      emotion,
      imagery,
      thought,
      hardToSense
    });
  };

  const bodyLocations = [
    { value: 'chest', label: 'Chest' },
    { value: 'belly', label: 'Belly' },
    { value: 'throat', label: 'Throat' },
    { value: 'head', label: 'Head' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'back', label: 'Back' },
    { value: 'hands', label: 'Hands' },
    { value: 'legs', label: 'Legs' },
    { value: 'whole-body', label: 'Whole Body' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Body Sensation + Location (can be 2-column on desktop) */}
      <div className={compact ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <IsolatedTextarea
          value={bodySensation}
          onChange={setBodySensation}
          placeholder="e.g., tingling, tightness, warmth, heaviness..."
          label="Body Sensation"
          rows={compact ? 2 : 3}
        />

        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-medium text-slate-300">
            Body Location
          </label>
          <select
            value={bodyLocation}
            onChange={(e) => setBodyLocation(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors min-h-[44px]"
          >
            {bodyLocations.map(loc => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full-width fields (only if not bodyOnly mode) */}
      {!bodyOnly && (
        <>
          <IsolatedInput
            value={emotion}
            onChange={setEmotion}
            placeholder="e.g., anxiety, sadness, joy, anger..."
            label="Emotion"
          />

          <IsolatedTextarea
            value={imagery}
            onChange={setImagery}
            placeholder="Any visual imagery, colors, or mental images..."
            label="Imagery"
            rows={compact ? 2 : 3}
          />

          <IsolatedTextarea
            value={thought}
            onChange={setThought}
            placeholder="What thoughts are present?..."
            label="Thought"
            rows={compact ? 2 : 3}
          />
        </>
      )}

      {/* Hard to Sense Checkbox */}
      <div className="flex items-center gap-3 min-h-[44px]">
        <input
          type="checkbox"
          id="hardToSense"
          checked={hardToSense}
          onChange={(e) => setHardToSense(e.target.checked)}
          className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer"
        />
        <label
          htmlFor="hardToSense"
          className="text-sm text-slate-300 cursor-pointer select-none"
        >
          I'm finding it hard to sense anything
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        Continue
      </button>
    </form>
  );
}
