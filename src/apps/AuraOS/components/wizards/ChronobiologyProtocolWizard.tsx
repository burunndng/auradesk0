/**
 * ChronobiologyProtocolWizard.tsx
 * Body/Mind module wizard — maps user energy/focus rhythms over 5 days (min 3), identifies biological windows, audits schedule mismatches, and redesigns weekly schedule.
 * Accent: emerald | localStorage: aura-draft-chronobiology, aura-chronobiologyHistory
 * mindToolType: 'Chronobiology Protocol'
 */

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChronobiologyDraft, DailyEnergyLog, BiologicalWindow, ScheduledActivity, MismatchFinding, IntegratedInsight } from '../../types';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { callInceptionMercuryJson, callGrokThenAIJson } from '../../services/ai/aiCore';
import {
  chronobiologyWindowsSchema,
  chronobiologyMismatchSchema,
  chronobiologyOutputSchema,
} from '../../services/ai/wizardSchemas';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DRAFT_KEY = 'aura-draft-chronobiology';
const HISTORY_KEY = 'aura-chronobiologyHistory';
const TOTAL_STEPS = 8;

interface ChronobiologyHistoryEntry {
  id: string;
  date: string;
  sessionNumber: number;
  dailyLogs: DailyEnergyLog[];
  biologicalWindows: BiologicalWindow[];
  chronobiologySummary: string;
  architectureType: string;
  linkedInsightId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readHistory(): ChronobiologyHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChronobiologyHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: ChronobiologyHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-75)));
  } catch {
    // storage quota — non-critical
  }
}

// ---------------------------------------------------------------------------
// Isolated textarea (prevents INP lag)
// ---------------------------------------------------------------------------

interface IsolatedTextareaProps {
  placeholder: string;
  onCommit: (value: string) => void;
  initialValue?: string;
  rows?: number;
}

const IsolatedTextarea: React.FC<IsolatedTextareaProps> = React.memo(
  ({ placeholder, onCommit, initialValue = '', rows = 3 }) => {
    const [localValue, setLocalValue] = useState(initialValue);

    const handleBlur = useCallback(() => {
      onCommit(localValue);
    }, [localValue, onCommit]);

    return (
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-colors"
        style={{ minHeight: '44px' }}
      />
    );
  }
);

IsolatedTextarea.displayName = 'IsolatedTextarea';

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function WizardLoadingFallback({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-400">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Daily Energy Logger (realtime mode)
// ---------------------------------------------------------------------------

interface DailyEnergyCardProps {
  dayNum: number;
  totalLogged: number;
  onSaveDay: (log: DailyEnergyLog) => void;
  onContinue: () => void;
  onEstimateMissedDay: () => void;
}

const DailyEnergyCard: React.FC<DailyEnergyCardProps> = ({
  dayNum,
  totalLogged,
  onSaveDay,
  onContinue,
  onEstimateMissedDay,
}) => {
  const [morning, setMorning] = useState({ clarity: 3, energy: 3, note: '' });
  const [midday, setMidday] = useState({ clarity: 3, energy: 3, note: '' });
  const [afternoon, setAfternoon] = useState({ clarity: 3, energy: 3, note: '' });
  const [evening, setEvening] = useState({ clarity: 3, energy: 3, note: '' });
  const [sleepHours, setSleepHours] = useState(7);
  const [anomalyNote, setAnomalyNote] = useState('');

  const handleSave = () => {
    const log: DailyEnergyLog = {
      day: dayNum,
      date: new Date().toISOString().split('T')[0],
      morning: { cognitiveClarity: morning.clarity, physicalEnergy: morning.energy, note: morning.note || undefined },
      midday: { cognitiveClarity: midday.clarity, physicalEnergy: midday.energy, note: midday.note || undefined },
      afternoon: { cognitiveClarity: afternoon.clarity, physicalEnergy: afternoon.energy, note: afternoon.note || undefined },
      evening: { cognitiveClarity: evening.clarity, physicalEnergy: evening.energy, note: evening.note || undefined },
      sleepHours: sleepHours || undefined,
      anomalyNote: anomalyNote || undefined,
      isEstimate: false,
    };
    onSaveDay(log);
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-slate-300">
        <p className="text-sm">Day {dayNum} of 5</p>
        <p className="text-xs text-slate-500">{totalLogged} days logged so far</p>
      </div>

      {/* Time window sliders */}
      {[
        { label: 'Morning', state: morning, setState: setMorning },
        { label: 'Midday', state: midday, setState: setMidday },
        { label: 'Afternoon', state: afternoon, setState: setAfternoon },
        { label: 'Evening', state: evening, setState: setEvening },
      ].map(({ label, state, setState }) => (
        <div key={label} className="space-y-2 p-3 sm:p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-emerald-400">{label}</span>
            <span className="text-xs text-slate-500">Clarity: {state.clarity} | Energy: {state.energy}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Cognitive Clarity (1–5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={state.clarity}
                onChange={(e) => setState({ ...state, clarity: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Physical Energy (1–5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={state.energy}
                onChange={(e) => setState({ ...state, energy: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
            <input
              type="text"
              placeholder="Optional note (e.g., had coffee at 10am)"
              value={state.note}
              onChange={(e) => setState({ ...state, note: e.target.value })}
              maxLength={80}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
            />
          </div>
        </div>
      ))}

      {/* Sleep & anomaly */}
      <div className="space-y-3 p-3 sm:p-4 bg-slate-800 rounded-lg">
        <div>
          <label className="text-sm text-slate-300 block mb-2">Sleep hours last night</label>
          <input
            type="number"
            min="3"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300 block mb-2">Any anomalies? (optional)</label>
          <textarea
            placeholder="e.g., Was stressed, skipped lunch, had an argument"
            value={anomalyNote}
            onChange={(e) => setAnomalyNote(e.target.value)}
            maxLength={150}
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 resize-none transition-colors"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleSave}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 sm:py-2.5 rounded-lg text-sm min-h-[44px] transition"
        >
          Save Today's Log
        </button>
        {totalLogged >= 3 && (
          <button
            onClick={onContinue}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium py-2 sm:py-2.5 rounded-lg text-sm min-h-[44px] transition"
          >
            Continue Wizard →
          </button>
        )}
      </div>
      {totalLogged > 0 && (
        <button
          onClick={onEstimateMissedDay}
          className="w-full text-emerald-400 hover:text-emerald-300 text-xs py-2 min-h-[44px] transition"
        >
          Estimate a missed day
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step label map
// ---------------------------------------------------------------------------

const STEP_LABELS = [
  'Baseline Check',
  'Energy Logging',
  'Peak Windows',
  'Priority Audit',
  'Mismatch Report',
  'Schedule Redesign',
  'Environmental Protocol',
  'Output',
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ChronobiologyProtocolWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChronobiologyProtocolWizard: React.FC<ChronobiologyProtocolWizardProps> = ({ isOpen, onClose }) => {
  const [sessionHistory, setSessionHistory] = useState<ChronobiologyHistoryEntry[]>(readHistory);
  const sessionNumber = sessionHistory.length + 1;

  const initialDraft: ChronobiologyDraft = {
    sessionId: `chronobiology-${uuidv4()}`,
    phase: 'orientation',
    step: 0,
    loggingMode: 'realtime',
    isDisruptedBaseline: false,
    dailyLogs: [],
    biologicalWindows: [],
    activities: [],
    mismatches: [],
    primaryLeveragePoint: '',
    peakCognitiveProtection: '',
    peakCognitiveDerailer: '',
    physicalWindowProtection: '',
    physicalWindowDerailer: '',
    redesignedScheduleNotes: '',
    chronobiologySummary: '',
    architectureType: '',
  };

  const [draft, updateDraft] = useWizardDraft<ChronobiologyDraft>(DRAFT_KEY, initialDraft);
  const { integratedInsights, setIntegratedInsights } = useInsightsContext();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [estimationDay, setEstimationDay] = useState<number | null>(null);

  // Early return AFTER hooks (React Rules of Hooks compliance)
  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const canGoBack = draft.step > 0 && draft.step < TOTAL_STEPS - 1;

  const handleBack = () => {
    if (canGoBack) updateDraft({ step: draft.step - 1 });
  };

  const nextButtonText = (): string => {
    if (draft.step === 0) return draft.loggingMode === 'realtime' ? 'Start Logging' : 'Log All 5 Days';
    if (draft.phase === 'logging') return 'Continue Wizard →';
    if (draft.step === 2) return 'Confirm Windows';
    if (draft.step === 3) return 'List Your Activities';
    if (draft.step === 4) return 'Analyse Mismatches';
    if (draft.step === 5) return 'Design Schedule';
    if (draft.step === 6) return 'Review Protocol';
    if (draft.step === 7) return 'Complete';
    return 'Next';
  };

  const handleNext = async () => {
    setError(null);

    // Orientation → logging
    if (draft.step === 0) {
      if (draft.loggingMode === 'realtime') {
        // Will stay on step 0, phase becomes 'logging'
        updateDraft({ phase: 'logging', step: 1 });
      } else {
        // Retrospective mode: show full logging grid (stub for now, move to step 1)
        updateDraft({ phase: 'logging', step: 1 });
      }
      return;
    }

    // Phase 'logging' when >= 3 days: proceed to analysis
    if (draft.phase === 'logging' && draft.step === 1) {
      if (draft.dailyLogs.length < 3) {
        setError('Please log at least 3 days before continuing.');
        return;
      }
      // Move to analysis phase
      updateDraft({ phase: 'analysis', step: 2 });
      return;
    }

    // Step 2 (Windows) → Step 3
    if (draft.step === 2) {
      await handleGenerateWindows();
      return;
    }

    // Step 3 (Activities) → Step 4
    if (draft.step === 3) {
      if (draft.activities.length === 0) {
        setError('Please add at least one activity before continuing.');
        return;
      }
      await handleAnalyseMismatches();
      return;
    }

    // Step 4 (Mismatch) → Step 5
    if (draft.step === 4) {
      updateDraft({ step: 5 });
      return;
    }

    // Step 5 (Schedule) → Step 6
    if (draft.step === 5) {
      if (!draft.redesignedScheduleNotes.trim()) {
        setError('Please describe your schedule redesign before continuing.');
        return;
      }
      updateDraft({ step: 6 });
      return;
    }

    // Step 6 (Environmental Protocol) → Step 7
    if (draft.step === 6) {
      if (!draft.peakCognitiveProtection.trim() || !draft.peakCognitiveDerailer.trim()) {
        setError('Please fill in both peak-cognitive window protections and derailers.');
        return;
      }
      updateDraft({ step: 7 });
      return;
    }

    // Step 7 (Output) → Complete
    if (draft.step === 7) {
      await handleComplete();
      return;
    }
  };

  // ---------------------------------------------------------------------------
  // AI functions
  // ---------------------------------------------------------------------------

  const handleGenerateWindows = async () => {
    setIsLoading(true);
    setLoadingMessage('Identifying your biological windows...');
    setError(null);

    const logSummary = draft.dailyLogs
      .map(
        (l) =>
          `Day ${l.day}: Morning clarity=${l.morning.cognitiveClarity}/5 energy=${l.morning.physicalEnergy}/5, Midday clarity=${l.midday.cognitiveClarity}/5 energy=${l.midday.physicalEnergy}/5, Afternoon clarity=${l.afternoon.cognitiveClarity}/5 energy=${l.afternoon.physicalEnergy}/5, Evening clarity=${l.evening.cognitiveClarity}/5 energy=${l.evening.physicalEnergy}/5, Sleep=${l.sleepHours || '?'}hrs`
      )
      .join('\n');

    const prompt = `You are a circadian rhythm expert analyzing chronobiological patterns from a ${draft.dailyLogs.length}-day energy log.

User's baseline is ${draft.isDisruptedBaseline ? 'DISRUPTED (recently shifted schedule, travel, illness)' : 'NORMAL (stable routine)'}.

Energy log data:
${logSummary}

Identify exactly 6 biological windows (time ranges, e.g., "6-9am", "2-4pm") covering the full day:
1. peak-cognitive (highest cognitive clarity, lowest physical energy)
2. secondary-cognitive (good clarity, sustainable for detail work)
3. physical (highest physical energy)
4. social-relational (balanced energy, best for collaboration)
5. low-demand (recovery time, routine/administrative tasks)
6. creative-associative (moderate cognitive + physical, good for innovation)

For each window, provide: timeRange (e.g., "9am-12pm"), confidenceLevel (high/medium/low based on data consistency), evidenceSummary (1 sentence explaining why).

Return ONLY valid JSON (no markdown, no explanation):
{
  "windows": [
    {"windowType": "peak-cognitive", "timeRange": "6:30am-8:30am", "confidenceLevel": "high", "evidenceSummary": "Consistent 5 cognitive clarity across all mornings with 7-8 hours sleep."},
    ...
  ],
  "dataQualityWarnings": ["list of warnings, if any — e.g., 'Only ${draft.dailyLogs.length} days logged; recommend 5 for stability'"]
}`;

    try {
      const result = await callGrokThenAIJson(
        'chronobiology-windows',
        prompt,
        undefined,
        chronobiologyWindowsSchema
      );

      const windows: BiologicalWindow[] = result.windows.map((w: any) => ({
        windowType: w.windowType,
        timeRange: w.timeRange,
        confidenceLevel: w.confidenceLevel,
        evidenceSummary: w.evidenceSummary,
        userConfirmed: false,
      }));

      updateDraft({ step: 2, biologicalWindows: windows });
    } catch (err) {
      console.error('[ChronobiologyWizard] Window generation failed:', err);
      setError('Failed to analyze windows. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyseMismatches = async () => {
    setIsLoading(true);
    setLoadingMessage('Analysing schedule mismatches...');
    setError(null);

    const windowSummary = draft.biologicalWindows
      .map((w) => `${w.windowType}: ${w.timeRange}`)
      .join('; ');

    const activitiesSummary = draft.activities
      .map((a) => `${a.name} (requires: ${a.requiredState}, is-fixed: ${a.isFixed})`)
      .join('; ');

    const prompt = `You are analyzing schedule-to-biology alignment.

Identified biological windows: ${windowSummary}

User's regular activities:
${activitiesSummary}

For each activity, determine: is it currently aligned with the user's biological window for that activity type?
- "aligned": Currently scheduled during the user's best window for that type of work
- "mismatched": Currently scheduled during a non-optimal window
- "unscheduled": User didn't specify when this happens (needs scheduling)

Provide 2-3 key leverage points for schedule redesign.

Return ONLY valid JSON (no markdown):
{
  "findings": [
    {"activity": "Deep work on reports", "status": "mismatched", "explanation": "Scheduled 2-4pm but user's peak-cognitive is 6:30-8:30am", "suggestedWindow": "6:30-8:30am"}
  ],
  "primaryLeveragePoint": "Move deep cognitive work to 6:30-8:30am window. This single shift unlocks 2+ hours of peak clarity daily."
}`;

    try {
      const result = await callGrokThenAIJson(
        'chronobiology-mismatch',
        prompt,
        undefined,
        chronobiologyMismatchSchema
      );

      const mismatches: MismatchFinding[] = result.findings.map((f: any) => ({
        activity: f.activity,
        status: f.status,
        explanation: f.explanation,
        suggestedWindow: f.suggestedWindow,
      }));

      updateDraft({
        step: 4,
        mismatches,
        primaryLeveragePoint: result.primaryLeveragePoint,
      });
    } catch (err) {
      console.error('[ChronobiologyWizard] Mismatch analysis failed:', err);
      setError('Failed to analyze mismatches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating your chronobiology summary...');
    setError(null);

    const windowSummary = draft.biologicalWindows
      .map((w) => `${w.windowType}: ${w.timeRange}`)
      .join('; ');

    const prompt = `You are synthesizing a chronobiology protocol session into a brief insight.

Biological windows identified: ${windowSummary}

Primary leverage point: ${draft.primaryLeveragePoint}

User's redesigned schedule notes: ${draft.redesignedScheduleNotes}

Peak-cognitive window protection strategy: ${draft.peakCognitiveProtection}
Peak-cognitive window derailer (what to avoid): ${draft.peakCognitiveDerailer}
Physical window protection strategy: ${draft.physicalWindowProtection}
Physical window derailer: ${draft.physicalWindowDerailer}

Generate a 1-paragraph summary of the user's biological architecture and a 2-3 word label for their chronotype (e.g., "Early Chronotype Optimizer", "Biphasic Energy Manager").

Return ONLY valid JSON (no markdown):
{
  "chronobiologySummary": "3-4 sentences describing the user's energy architecture and key recommendations",
  "architectureType": "2-3 word label for their chronotype"
}`;

    try {
      const result = await callGrokThenAIJson(
        'chronobiology-output',
        prompt,
        undefined,
        chronobiologyOutputSchema
      );

      // Create insight
      const insight: IntegratedInsight = {
        id: `insight-chronobiology-${draft.sessionId}`,
        mindToolType: 'Chronobiology Protocol',
        mindToolSessionId: draft.sessionId,
        mindToolName: 'Chronobiology Protocol',
        dateCreated: new Date().toISOString(),
        status: 'pending',
        detectedPattern: result.architectureType,
        suggestedNextSteps: [
          {
            practiceId: 'chronobiology-schedule-redesign',
            practiceName: 'Schedule Redesign',
            rationale: draft.primaryLeveragePoint,
          },
        ],
        confidenceScore: draft.dailyLogs.length >= 5 ? 0.85 : 0.65,
        mindToolReport: result.chronobiologySummary,
        mindToolShortSummary: `${result.architectureType} — ${draft.biologicalWindows[0]?.timeRange || 'custom'} peak window`,
        suggestedShadowWork: [],
      };

      setIntegratedInsights([insight, ...integratedInsights]);

      // Persist to history
      const historyEntry: ChronobiologyHistoryEntry = {
        id: draft.sessionId,
        date: new Date().toISOString(),
        sessionNumber,
        dailyLogs: draft.dailyLogs,
        biologicalWindows: draft.biologicalWindows,
        chronobiologySummary: result.chronobiologySummary,
        architectureType: result.architectureType,
        linkedInsightId: insight.id,
      };

      const newHistory = [...sessionHistory, historyEntry];
      setSessionHistory(newHistory);
      writeHistory(newHistory);

      updateDraft({ step: TOTAL_STEPS - 1, completionDate: new Date().toISOString() });
    } catch (err) {
      console.error('[ChronobiologyWizard] Completion failed:', err);
      setError('Failed to generate summary. Your session data has been saved.');
      updateDraft({ step: TOTAL_STEPS - 1 });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Daily logging
  // ---------------------------------------------------------------------------

  const handleSaveDay = (log: DailyEnergyLog) => {
    const newLogs = [...draft.dailyLogs];
    const existingIndex = newLogs.findIndex((l) => l.day === log.day);
    if (existingIndex >= 0) {
      newLogs[existingIndex] = log;
    } else {
      newLogs.push(log);
    }
    newLogs.sort((a, b) => a.day - b.day);
    updateDraft({ dailyLogs: newLogs });
  };

  const handleEstimateMissedDay = () => {
    const nextDay = Math.max(...draft.dailyLogs.map((l) => l.day), 0) + 1;
    if (nextDay <= 5) {
      setEstimationDay(nextDay);
    }
  };

  const handleAddActivityRow = () => {
    updateDraft({
      activities: [
        ...draft.activities,
        { name: '', requiredState: 'peak-cognitive', currentWindows: [], isFixed: false },
      ],
    });
  };

  const handleUpdateActivity = (idx: number, field: string, value: any) => {
    const updated = [...draft.activities];
    updated[idx] = { ...updated[idx], [field]: value };
    updateDraft({ activities: updated });
  };

  const handleRemoveActivity = (idx: number) => {
    updateDraft({ activities: draft.activities.filter((_, i) => i !== idx) });
  };

  // ---------------------------------------------------------------------------
  // Close
  // ---------------------------------------------------------------------------

  const handleClose = () => {
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Render by step
  // ---------------------------------------------------------------------------

  const renderContent = () => {
    // Realtime and Retrospective logging phase
    if (draft.phase === 'logging' && draft.step === 1) {
      const nextDayNum = draft.dailyLogs.length + 1;
      const showContinueBtn = draft.dailyLogs.length >= 3;

      if (estimationDay) {
        return (
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-emerald-300">Estimate Day {estimationDay}</h3>
            <p className="text-sm text-slate-400">Recall your energy patterns and estimate this day's logs.</p>
            <DailyEnergyCard
              dayNum={estimationDay}
              totalLogged={draft.dailyLogs.length}
              onSaveDay={(log) => {
                handleSaveDay(log);
                setEstimationDay(null);
              }}
              onContinue={() => { }} // Not used in estimation mode
              onEstimateMissedDay={() => {
                const nextEst = estimationDay + 1;
                if (nextEst <= 5) setEstimationDay(nextEst);
              }}
            />
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-serif text-lg text-emerald-300">
              {draft.loggingMode === 'retrospective' ? 'Retrospective Energy Logging' : 'Real-Time Energy Logging'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {showContinueBtn && draft.dailyLogs.length > 0
                ? `${draft.dailyLogs.length} days logged. Minimum of 3 met — ready to continue.`
                : `Log at least 3 days to identify patterns (5 recommended).`}
            </p>
          </div>
          <DailyEnergyCard
            dayNum={nextDayNum}
            totalLogged={draft.dailyLogs.length}
            onSaveDay={handleSaveDay}
            onContinue={() => updateDraft({ phase: 'analysis', step: 2 })}
            onEstimateMissedDay={handleEstimateMissedDay}
          />
        </div>
      );
    }

    // Step 0: Orientation
    if (draft.step === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-lg text-emerald-300 mb-3">Chronobiology Protocol</h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
              This wizard maps your biological rhythms — your peak cognitive windows, physical energy cycles, and recovery periods — over 3–5 days. You'll then audit your current schedule against these windows and redesign it for maximum alignment with your natural energy architecture.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-slate-300 mb-2 block">Is your baseline disrupted?</span>
              <input
                type="checkbox"
                checked={draft.isDisruptedBaseline}
                onChange={(e) => updateDraft({ isDisruptedBaseline: e.target.checked })}
                className="w-4 h-4 min-h-[44px]"
              />
              <span className="text-xs text-slate-400 ml-2">(e.g., recent time zone shift, irregular sleep)</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-slate-300 mb-2 block">How will you log your energy?</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="loggingMode"
                    value="realtime"
                    checked={draft.loggingMode === 'realtime'}
                    onChange={() => updateDraft({ loggingMode: 'realtime' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">
                    Real-time logging (fill in each day as it happens)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="loggingMode"
                    value="retrospective"
                    checked={draft.loggingMode === 'retrospective'}
                    onChange={() => updateDraft({ loggingMode: 'retrospective' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">
                    Retrospective logging (recall the past 3–5 days)
                  </span>
                </label>
              </div>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            Minimum viable: 3 days (results less reliable). Recommended: 5 days for stable patterns.
          </p>
        </div>
      );
    }

    // Step 2: Biological Windows
    if (draft.step === 2) {
      return (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-emerald-300">Your Biological Windows</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
            These 6 windows represent distinct energy states identified from your {draft.dailyLogs.length}-day log.
            {draft.dailyLogs.length < 5 && (
              <span className="block mt-2 text-xs text-amber-400">
                ⚠ Results less reliable with {draft.dailyLogs.length} days. Recommend 5.
              </span>
            )}
          </p>

          <div className="space-y-4">
            {draft.biologicalWindows.map((w, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-stone-950/70 border border-emerald-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-emerald-400 text-sm capitalize">
                      {w.windowType.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">{w.timeRange}</p>
                    <p className="text-xs text-slate-500 mt-1">{w.evidenceSummary}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 capitalize min-h-[24px] flex items-center">
                    {w.confidenceLevel}
                  </span>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer text-xs min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={w.userConfirmed}
                    onChange={(e) => {
                      const updated = [...draft.biologicalWindows];
                      updated[idx].userConfirmed = e.target.checked;
                      updateDraft({ biologicalWindows: updated });
                    }}
                    className="w-3 h-3"
                  />
                  <span className="text-slate-400">Confirmed — this matches my experience</span>
                </label>
                {w.userConfirmed && (
                  <input
                    type="text"
                    placeholder="Adjusted time range (e.g., 7-9am)"
                    defaultValue={w.userAdjustedRange || ''}
                    onBlur={(e) => {
                      const updated = [...draft.biologicalWindows];
                      updated[idx].userAdjustedRange = e.target.value;
                      updateDraft({ biologicalWindows: updated });
                    }}
                    className="w-full mt-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Step 3: Activities
    if (draft.step === 3) {
      return (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-emerald-300">Your Regular Activities</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
            List your regular recurring activities and the biological state they require.
          </p>

          <div className="space-y-4">
            {draft.activities.map((a, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-slate-800 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="Activity (e.g., Deep work, Meetings, Exercise)"
                  defaultValue={a.name}
                  onBlur={(e) => handleUpdateActivity(idx, 'name', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
                />
                <select
                  value={a.requiredState}
                  onChange={(e) => handleUpdateActivity(idx, 'requiredState', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors min-h-[44px]"
                >
                  <option value="peak-cognitive">Peak Cognitive</option>
                  <option value="secondary-cognitive">Secondary Cognitive</option>
                  <option value="physical">Physical</option>
                  <option value="social-relational">Social/Relational</option>
                  <option value="low-demand">Low Demand</option>
                  <option value="creative-associative">Creative/Associative</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer text-xs min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={a.isFixed}
                    onChange={(e) => handleUpdateActivity(idx, 'isFixed', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-slate-400">Fixed time (can't move)</span>
                </label>
                <button
                  onClick={() => handleRemoveActivity(idx)}
                  className="text-xs text-red-400 hover:text-red-300 transition min-h-[44px] flex items-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddActivityRow}
            className="w-full py-2 sm:py-2.5 border border-slate-700 rounded-lg text-sm text-emerald-400 hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center"
          >
            + Add Activity
          </button>
        </div>
      );
    }

    // Step 4: Mismatch Report
    if (draft.step === 4) {
      return (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-emerald-300">Schedule Audit Results</h3>

          {draft.mismatches.length > 0 && (
            <div className="space-y-3">
              {draft.mismatches.map((m, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-stone-950/70 border border-emerald-900/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-slate-200 text-sm">{m.activity}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded capitalize ${m.status === 'aligned'
                        ? 'bg-emerald-900 text-emerald-200'
                        : m.status === 'mismatched'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-amber-900 text-amber-200'
                        }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{m.explanation}</p>
                  {m.suggestedWindow && (
                    <p className="text-xs text-emerald-300 mt-2">Suggestion: {m.suggestedWindow}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {draft.primaryLeveragePoint && (
            <div className="p-4 bg-emerald-950 border border-emerald-700 rounded-lg">
              <p className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wide">Primary Leverage Point</p>
              <p className="text-sm text-emerald-100 leading-relaxed">{draft.primaryLeveragePoint}</p>
            </div>
          )}
        </div>
      );
    }

    // Step 5: Schedule Redesign
    if (draft.step === 5) {
      return (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-emerald-300">Redesigned Weekly Schedule</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
            Describe your new schedule architecture — which activities move to which biological windows?
          </p>

          <IsolatedTextarea
            placeholder="E.g., Move deep work to 6:30-8:30am peak window. Meetings now 10am-12pm secondary-cognitive. Exercise 5-6pm physical window. Emails/admin during low-demand evening window..."
            onCommit={(value) => updateDraft({ redesignedScheduleNotes: value })}
            initialValue={draft.redesignedScheduleNotes}
            rows={5}
          />
        </div>
      );
    }

    // Step 6: Environmental Protocol
    if (draft.step === 6) {
      return (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-emerald-300">Environmental Protocol</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
            For your two most important windows, describe what protects them and what derails them.
          </p>

          {/* Peak Cognitive */}
          <div className="p-3 sm:p-4 bg-stone-950/70 border border-emerald-900/20 rounded-lg space-y-3">
            <p className="font-medium text-emerald-400 text-sm">Peak-Cognitive Window</p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">What protects this window?</label>
              <input
                type="text"
                maxLength={100}
                placeholder="E.g., No notifications, 30-min buffer before, strong coffee"
                defaultValue={draft.peakCognitiveProtection}
                onBlur={(e) => updateDraft({ peakCognitiveProtection: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">What most commonly derails it?</label>
              <input
                type="text"
                maxLength={100}
                placeholder="E.g., Slack messages, unexpected meetings, low sleep"
                defaultValue={draft.peakCognitiveDerailer}
                onBlur={(e) => updateDraft({ peakCognitiveDerailer: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
              />
            </div>
          </div>

          {/* Physical */}
          <div className="p-3 sm:p-4 bg-stone-950/70 border border-emerald-900/20 rounded-lg space-y-3">
            <p className="font-medium text-emerald-400 text-sm">Physical Window</p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">What protects this window?</label>
              <input
                type="text"
                maxLength={100}
                placeholder="E.g., Gym membership, accountability partner, proper nutrition"
                defaultValue={draft.physicalWindowProtection}
                onBlur={(e) => updateDraft({ physicalWindowProtection: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">What most commonly derails it?</label>
              <input
                type="text"
                maxLength={100}
                placeholder="E.g., Work overruns, fatigue, bad weather"
                defaultValue={draft.physicalWindowDerailer}
                onBlur={(e) => updateDraft({ physicalWindowDerailer: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
              />
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Completion / Output
    if (draft.step === TOTAL_STEPS - 1) {
      return (
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-emerald-300">Your Chronobiology Protocol</h3>

          {draft.chronobiologySummary && (
            <div className="p-4 bg-stone-950/70 border border-emerald-900/20 rounded-lg">
              <p className="text-sm text-slate-300 leading-relaxed">{draft.chronobiologySummary}</p>
            </div>
          )}

          {draft.architectureType && (
            <div className="text-center p-4 bg-emerald-950 border border-emerald-700 rounded-lg">
              <p className="text-xs font-medium text-emerald-400 uppercase mb-1 tracking-wide">Your Chronotype</p>
              <p className="font-serif text-lg text-emerald-300">{draft.architectureType}</p>
            </div>
          )}

          {draft.biologicalWindows.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Biological Windows</p>
              <div className="space-y-2">
                {draft.biologicalWindows.map((w, idx) => (
                  <div key={idx} className="text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium capitalize">{w.windowType.replace('-', ' ')}</span> —{' '}
                    {w.userAdjustedRange || w.timeRange}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 text-center mt-4">
            ✓ Insight saved to your Intelligence Hub. Return to this wizard anytime to adjust windows or schedule.
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <WizardFrame
      title="Chronobiology Protocol"
      currentStep={draft.step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      showBackButton={canGoBack}
      nextButtonText={nextButtonText()}
      accentColor="emerald"
      onClose={handleClose}
      onBack={handleBack}
      onNext={handleNext}
    >
      {error && (
        <div className="mb-4 p-3 bg-purple-950/60 border border-purple-700 rounded-lg">
          <p className="text-sm text-purple-200">{error}</p>
        </div>
      )}

      {isLoading ? <WizardLoadingFallback message={loadingMessage} /> : renderContent()}
    </WizardFrame>
  );
};

export default ChronobiologyProtocolWizard;
