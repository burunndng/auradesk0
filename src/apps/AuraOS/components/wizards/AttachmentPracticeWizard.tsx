/**
 * AttachmentPracticeWizard.tsx
 *
 * Shadow module wizard for attachment style assessment and relational moment practice.
 * First-session: 10-item ECR-R assessment -> psychoeducation -> practice flow.
 * Returning sessions: Relational moment -> chain analysis -> somatic check -> experiment.
 *
 * Module: Shadow (purple accent)
 * mindToolType: 'Attachment Practice'
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { z } from 'zod';
import { X } from 'lucide-react';
import PhenomenologicalReportInput, {
  PhenomenologicalReport,
} from '../shared/PhenomenologicalReportInput';
import { callGrokThenAIJson } from '../../services/aiService';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import type { IntegratedInsight, CrisisLevel } from '../../types';

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-attachment-practice';
const HISTORY_KEY = 'aura-attachmentPracticeHistory';
const PROFILE_KEY = 'aura-attachmentProfile';
const HISTORY_CAP = 75;

// ---------------------------------------------------------------------------
// Attachment types
// ---------------------------------------------------------------------------
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganised';

export interface AttachmentProfile {
  anxietyScore: number;   // 0-1
  avoidanceScore: number; // 0-1
  primaryStyle: AttachmentStyle;
  dateAssessed: string;
}

// ---------------------------------------------------------------------------
// Zod schemas for AI responses
// ---------------------------------------------------------------------------
const AttachmentPsychoeducationSchema = z.object({
  headline: z.string(),
  styleDescription: z.string(),
  coreWound: z.string(),
  activationCues: z.array(z.string()),
  healingEdge: z.string(),
  microPractice: z.string(),
});
type AttachmentPsychoeducation = z.infer<typeof AttachmentPsychoeducationSchema>;

const RelationalMomentSchema = z.object({
  trigger: z.string(),
  internalNarrative: z.string(),
  attachmentBid: z.string(),
  protectiveStrategy: z.string(),
});
type RelationalMomentAnalysis = z.infer<typeof RelationalMomentSchema>;

const BehavioralExperimentSchema = z.object({
  hypothesis: z.string(),
  experiment: z.string(),
  safetyBehaviourToSuspend: z.string(),
  reflection: z.string(),
  anchorPhrase: z.string(),
});
type BehavioralExperiment = z.infer<typeof BehavioralExperimentSchema>;

// ---------------------------------------------------------------------------
// ECR-R 10-item questionnaire (Q1-5 = anxiety subscale, Q6-10 = avoidance)
// ---------------------------------------------------------------------------
const ECR_R_ITEMS: { id: number; text: string }[] = [
  { id: 1, text: 'I worry about being abandoned by the people I am close to.' },
  { id: 2, text: 'I need a lot of reassurance that I am loved by my partner.' },
  { id: 3, text: 'I find that my partner does not want to get as close as I would like.' },
  { id: 4, text: 'I worry a lot about my relationships.' },
  { id: 5, text: 'When my partner is out of sight, I worry that they might become interested in someone else.' },
  { id: 6, text: 'I prefer not to share my feelings with others.' },
  { id: 7, text: 'I find it difficult to allow myself to depend on romantic partners.' },
  { id: 8, text: 'I am not very comfortable having others depend on me.' },
  { id: 9, text: 'I prefer to not be too close to romantic partners.' },
  { id: 10, text: 'I get uncomfortable when a romantic partner wants to be very close.' },
];

const LIKERT_LABELS: Record<number, string> = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
function scoreECR(responses: Record<number, number>): AttachmentProfile {
  const anxietyRaw = [1, 2, 3, 4, 5].reduce((sum, id) => sum + (responses[id] ?? 3), 0);
  const avoidanceRaw = [6, 7, 8, 9, 10].reduce((sum, id) => sum + (responses[id] ?? 3), 0);
  const anxietyScore = anxietyRaw / 25;
  const avoidanceScore = avoidanceRaw / 25;

  let primaryStyle: AttachmentStyle;
  if (anxietyScore < 0.5 && avoidanceScore < 0.5) {
    primaryStyle = 'secure';
  } else if (anxietyScore >= 0.5 && avoidanceScore < 0.5) {
    primaryStyle = 'anxious';
  } else if (anxietyScore < 0.5 && avoidanceScore >= 0.5) {
    primaryStyle = 'avoidant';
  } else {
    primaryStyle = 'disorganised';
  }

  return {
    anxietyScore,
    avoidanceScore,
    primaryStyle,
    dateAssessed: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// AI functions
// ---------------------------------------------------------------------------
async function generateAttachmentPsychoeducation(
  profile: AttachmentProfile
): Promise<AttachmentPsychoeducation> {
  const prompt = `You are an attachment-informed therapist. Return ONLY valid JSON matching this schema.

Attachment profile:
- Primary style: ${profile.primaryStyle}
- Anxiety score: ${(profile.anxietyScore * 100).toFixed(0)}%
- Avoidance score: ${(profile.avoidanceScore * 100).toFixed(0)}%

Return JSON:
{
  "headline": "brief empathic headline for this attachment style (max 12 words)",
  "styleDescription": "2-3 sentences describing lived experience of this style",
  "coreWound": "the underlying relational wound in one sentence",
  "activationCues": ["3-4 specific triggers that activate this style"],
  "healingEdge": "what growth looks like for this person (1-2 sentences)",
  "microPractice": "one concrete 60-second somatic practice for right now"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  return callGrokThenAIJson<AttachmentPsychoeducation>(
    'AttachmentPsychoeducation',
    prompt,
    'qwen-fallback-default',
    AttachmentPsychoeducationSchema
  );
}

async function analyzeRelationalMoment(
  profile: AttachmentProfile,
  moment: string
): Promise<RelationalMomentAnalysis> {
  const prompt = `You are an attachment therapist conducting a micro-analysis. Return ONLY valid JSON.

User attachment style: ${profile.primaryStyle} (anxiety: ${(profile.anxietyScore * 100).toFixed(0)}%, avoidance: ${(profile.avoidanceScore * 100).toFixed(0)}%)

Relational moment described by user:
"${moment}"

Analyse this moment through an attachment lens and return JSON:
{
  "trigger": "what activated the attachment system (one sentence)",
  "internalNarrative": "the internal story or belief that arose (one sentence)",
  "attachmentBid": "what the person was really seeking from the other (one sentence)",
  "protectiveStrategy": "the defensive behaviour used to manage the threat (one sentence)"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  return callGrokThenAIJson<RelationalMomentAnalysis>(
    'AttachmentRelationalMoment',
    prompt,
    'qwen-fallback-default',
    RelationalMomentSchema
  );
}

async function generateExperiment(context: {
  profile: AttachmentProfile;
  moment: string;
  analysis: RelationalMomentAnalysis;
  somaticReport: PhenomenologicalReport;
}): Promise<BehavioralExperiment> {
  const prompt = `You are an attachment-informed CBT therapist. Return ONLY valid JSON.

User attachment style: ${context.profile.primaryStyle}
Relational moment: "${context.moment}"
Trigger: ${context.analysis.trigger}
Internal narrative: ${context.analysis.internalNarrative}
Protective strategy: ${context.analysis.protectiveStrategy}
Body sensation: ${context.somaticReport.bodySensation} (${context.somaticReport.bodyLocation})
Emotion: ${context.somaticReport.emotion}

Design a small behavioural experiment for the coming week:
{
  "hypothesis": "if I try X, then Y might happen differently (one sentence)",
  "experiment": "specific, concrete action for the next 7 days (2-3 sentences)",
  "safetyBehaviourToSuspend": "one protective strategy to deliberately pause during the experiment",
  "reflection": "a reflection question to journal about after the experiment",
  "anchorPhrase": "a short self-compassionate phrase to use when activated (max 10 words)"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  return callGrokThenAIJson<BehavioralExperiment>(
    'AttachmentExperiment',
    prompt,
    'qwen-fallback-default',
    BehavioralExperimentSchema
  );
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadProfile(): AttachmentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttachmentProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: AttachmentProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function appendHistory(record: object): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: object[] = raw ? JSON.parse(raw) : [];
    history.push(record);
    if (history.length > HISTORY_CAP) history.splice(0, history.length - HISTORY_CAP);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Isolated text input (INP perf)
// ---------------------------------------------------------------------------
const IsolatedTextarea = memo(function IsolatedTextarea({
  value,
  onChange,
  placeholder,
  label,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
      />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Step sub-components
// ---------------------------------------------------------------------------

// Step: Introduction (first-session only)
function StepIntroduction() {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <DyadBridgeIcon size={56} color="currentColor" className="text-purple-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-purple-300">
          Attachment Practice
        </h2>
        <p className="text-sm text-slate-400">Shadow Module — 6-step guided practice</p>
      </div>

      <div className="bg-slate-900/60 border border-purple-900/40 rounded-xl p-4 space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          Attachment theory tells us that our earliest relationships with caregivers create
          internal working models — templates that shape how we connect, seek closeness, and
          manage relational threat throughout life.
        </p>
        <p>
          This wizard has two phases. Today you will complete a brief assessment to reveal your
          attachment style. Then, in every subsequent session, you will bring a real relational
          moment and work through it with AI guidance.
        </p>
        <p>
          The goal is not to fix you — it is to help you see your patterns with curiosity and
          compassion so they lose their automatic grip.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
        {[
          { label: 'Secure', desc: 'Comfortable with closeness' },
          { label: 'Anxious', desc: 'Fear of abandonment' },
          { label: 'Avoidant', desc: 'Discomfort with dependence' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-2 space-y-1">
            <p className="font-medium text-purple-300">{s.label}</p>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step: ECR-R Assessment
function StepAssessment({
  responses,
  onResponseChange,
}: {
  responses: Record<number, number>;
  onResponseChange: (id: number, value: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-slate-100">
          Attachment Style Assessment
        </h3>
        <p className="text-xs text-slate-400">
          Rate each statement 1 (Strongly Disagree) to 5 (Strongly Agree) based on your typical
          experience in close relationships.
        </p>
      </div>

      <div className="space-y-5">
        {ECR_R_ITEMS.map((item) => (
          <div key={item.id} className="space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed">
              <span className="text-purple-400 font-medium">{item.id}.</span> {item.text}
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => onResponseChange(item.id, val)}
                  className={`flex-1 min-w-[2.5rem] min-h-[44px] rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                    responses[item.id] === val
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-purple-600'
                  }`}
                  title={LIKERT_LABELS[val]}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step: AI Psychoeducation (post-assessment)
function StepPsychoeducation({
  profile,
  psychoed,
}: {
  profile: AttachmentProfile;
  psychoed: AttachmentPsychoeducation;
}) {
  const styleColors: Record<AttachmentStyle, string> = {
    secure: 'text-emerald-300',
    anxious: 'text-amber-300',
    avoidant: 'text-purple-300',
    disorganised: 'text-rose-300',
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Your attachment profile</p>
        <h3 className={`text-xl sm:text-2xl font-serif capitalize ${styleColors[profile.primaryStyle]}`}>
          {profile.primaryStyle} Attachment
        </h3>
        <p className="text-sm text-slate-300 italic">{psychoed.headline}</p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Anxiety', value: profile.anxietyScore },
          { label: 'Avoidance', value: profile.avoidanceScore },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
            <p className="text-xs text-slate-400">{label}</p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-300">{Math.round(value * 100)}%</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {[
        { title: 'Lived Experience', body: psychoed.styleDescription },
        { title: 'Core Wound', body: psychoed.coreWound },
        { title: 'Healing Edge', body: psychoed.healingEdge },
      ].map(({ title, body }) => (
        <div key={title} className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-4 space-y-1">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{title}</p>
          <p className="text-sm text-slate-200 leading-relaxed">{body}</p>
        </div>
      ))}

      {/* Activation cues */}
      <div className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Activation Cues</p>
        <ul className="space-y-1">
          {psychoed.activationCues.map((cue, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-200">
              <span className="text-purple-500 mt-0.5">-</span>
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Micro practice */}
      <div className="bg-purple-950/40 border border-purple-700/40 rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">60-Second Practice</p>
        <p className="text-sm text-slate-200 leading-relaxed">{psychoed.microPractice}</p>
      </div>
    </div>
  );
}

// Step: Relational moment description
function StepRelationalMoment({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-slate-100">
          Describe a Relational Moment
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Think of a recent interaction — a conversation, a silence, a text left on read — where
          you noticed your attachment system activate. Describe it in as much detail as you can.
          What happened? Who was involved? What did you feel?
        </p>
      </div>

      <IsolatedTextarea
        value={value}
        onChange={onChange}
        placeholder="e.g. Last night my partner came home late without texting. I felt a wave of dread and started scanning their face for signs they were pulling away..."
        label="The relational moment"
        rows={6}
      />

      <p className="text-xs text-slate-500 italic">
        Be as specific as possible — the more detail, the richer the analysis.
      </p>
    </div>
  );
}

// Step: Response chain analysis visualised as 4 connected boxes
function StepChainAnalysis({
  analysis,
}: {
  analysis: RelationalMomentAnalysis;
}) {
  const boxes = [
    { label: 'Trigger', value: analysis.trigger, color: 'border-amber-700/50 bg-amber-950/20' },
    { label: 'Internal Narrative', value: analysis.internalNarrative, color: 'border-purple-700/50 bg-purple-950/20' },
    { label: 'Attachment Bid', value: analysis.attachmentBid, color: 'border-purple-700/50 bg-purple-950/20' },
    { label: 'Protective Strategy', value: analysis.protectiveStrategy, color: 'border-rose-700/50 bg-rose-950/20' },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-slate-100">
          Attachment Response Chain
        </h3>
        <p className="text-xs text-slate-400">
          Your moment has been analysed through an attachment lens. Each box shows one link in
          the chain from trigger to protective strategy.
        </p>
      </div>

      <div className="space-y-2">
        {boxes.map((box, i) => (
          <div key={box.label} className="flex items-stretch gap-2">
            {/* Connector line + number */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-purple-600/40 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                {i + 1}
              </div>
              {i < boxes.length - 1 && (
                <div className="w-px flex-1 bg-purple-800/30 mt-1" />
              )}
            </div>

            {/* Box */}
            <div className={`flex-1 border rounded-xl p-3 mb-2 ${box.color}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {box.label}
              </p>
              <p className="text-sm text-slate-100 leading-relaxed">{box.value}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 italic text-center">
        Notice what arises as you read each step. There is no right or wrong reaction.
      </p>
    </div>
  );
}

// Step: Experiment design
function StepExperiment({
  experiment,
}: {
  experiment: BehavioralExperiment;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-serif text-slate-100">
          Your Behavioural Experiment
        </h3>
        <p className="text-xs text-slate-400">
          A small, safe experiment to try over the next 7 days.
        </p>
      </div>

      {[
        { label: 'Hypothesis', value: experiment.hypothesis, accent: 'text-purple-300' },
        { label: 'The Experiment', value: experiment.experiment, accent: 'text-purple-300' },
        { label: 'Safety Behaviour to Suspend', value: experiment.safetyBehaviourToSuspend, accent: 'text-amber-300' },
        { label: 'Reflection Question', value: experiment.reflection, accent: 'text-purple-300' },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-4 space-y-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>{label}</p>
          <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
        </div>
      ))}

      {/* Anchor phrase */}
      <div className="bg-purple-950/50 border border-purple-600/40 rounded-xl p-4 text-center space-y-1">
        <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold">Anchor Phrase</p>
        <p className="text-base font-serif text-purple-200 italic">"{experiment.anchorPhrase}"</p>
        <p className="text-xs text-slate-500">Repeat when your attachment system activates.</p>
      </div>
    </div>
  );
}

// Step: Completion
function StepCompletion({
  profile,
  insight,
  isFirstSession,
}: {
  profile: AttachmentProfile;
  insight: IntegratedInsight | null;
  isFirstSession: boolean;
}) {
  return (
    <div className="space-y-5 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/40 border border-purple-600/40 flex items-center justify-center">
        <span className="text-3xl">-</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-serif text-purple-300">
          {isFirstSession ? 'Profile Created' : 'Session Complete'}
        </h3>
        <p className="text-sm text-slate-300">
          {isFirstSession
            ? 'Your attachment profile has been saved. Return any time to work with a relational moment.'
            : 'Your session has been saved. Your experiment awaits in the week ahead.'}
        </p>
      </div>

      <div className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-4 text-left space-y-2">
        <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Session saved to</p>
        <ul className="text-xs text-slate-400 space-y-0.5">
          <li>- Intelligence Hub (pattern tracking)</li>
          <li>- Session history (up to {HISTORY_CAP} sessions)</li>
          <li>- Attachment profile (permanent)</li>
        </ul>
      </div>

      {insight && (
        <div className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-4 text-left space-y-1">
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Detected pattern</p>
          <p className="text-sm text-slate-200">{insight.detectedPattern}</p>
        </div>
      )}

      <p className="text-xs text-slate-500 italic">
        Your {profile.primaryStyle} attachment style is a map, not a destiny.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface AttachmentPracticeWizardProps {
  onClose: () => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------
export default function AttachmentPracticeWizard({
  onClose,
  insightContext,
  markInsightAsAddressed,
}: AttachmentPracticeWizardProps) {
  // ---- Mode detection ----
  const [attachmentProfile, setAttachmentProfile] = useState<AttachmentProfile | null>(
    () => loadProfile()
  );
  const isFirstSession = attachmentProfile === null;

  // ---- Step management ----
  // First session: 1=Intro, 2=Assessment, 3=Psychoed, 4=Moment, 5=Chain, 6=Somatic, 7=Experiment, 8=Complete
  // Practice:                                          1=Moment, 2=Chain,  3=Somatic, 4=Experiment, 5=Complete
  const FIRST_TOTAL = 8;
  const PRACTICE_TOTAL = 5;
  const totalSteps = isFirstSession ? FIRST_TOTAL : PRACTICE_TOTAL;

  const [step, setStep] = useState(1);

  // ---- Assessment state ----
  const [ecrResponses, setEcrResponses] = useState<Record<number, number>>({});

  // ---- AI content state ----
  const [psychoed, setPsychoed] = useState<AttachmentPsychoeducation | null>(null);
  const [relationalMoment, setRelationalMoment] = useState('');
  const [momentAnalysis, setMomentAnalysis] = useState<RelationalMomentAnalysis | null>(null);
  const [somaticReport, setSomaticReport] = useState<PhenomenologicalReport | null>(null);
  const [experiment, setExperiment] = useState<BehavioralExperiment | null>(null);
  const [finalInsight, setFinalInsight] = useState<IntegratedInsight | null>(null);

  // ---- UI state ----
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [sessionId] = useState(() => `attachment-${Date.now()}`);

  // ---- Insights context ----
  const { setIntegratedInsights } = useInsightsContext();

  // ---- Draft persistence ----
  const [, updateDraft] = useWizardDraft(DRAFT_KEY, {
    step: 1,
    ecrResponses: {} as Record<number, number>,
    relationalMoment: '',
  });

  useEffect(() => {
    updateDraft({ step, ecrResponses, relationalMoment });
  }, [step, ecrResponses, relationalMoment, updateDraft]);

  // ---- Crisis detection on relational moment ----
  useEffect(() => {
    if (relationalMoment.length > 20) {
      const level = detectCrisisLevel(relationalMoment);
      setCrisisLevel(level);
    }
  }, [relationalMoment]);

  // ---- Helpers ----
  const handleEcrResponse = useCallback((id: number, value: number) => {
    setEcrResponses((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Determine step label for WizardFrame
  function getStepLabel(): string {
    if (isFirstSession) {
      const labels = [
        'Introduction',
        'Assessment',
        'Your Profile',
        'Relational Moment',
        'Chain Analysis',
        'Somatic Check',
        'Experiment',
        'Complete',
      ];
      return labels[step - 1] ?? '';
    }
    const labels = [
      'Relational Moment',
      'Chain Analysis',
      'Somatic Check',
      'Experiment',
      'Complete',
    ];
    return labels[step - 1] ?? '';
  }

  // ---- Navigation ----
  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleNext = async () => {
    setError(null);

    // --- First session flow ---
    if (isFirstSession) {
      // Step 2 -> 3: Score assessment, generate psychoed
      if (step === 2) {
        const answered = Object.keys(ecrResponses).length;
        if (answered < ECR_R_ITEMS.length) {
          setError(`Please answer all ${ECR_R_ITEMS.length} items before continuing.`);
          return;
        }
        setIsLoading(true);
        try {
          const profile = scoreECR(ecrResponses);
          setAttachmentProfile(profile);
          saveProfile(profile);
          const psychoedResult = await generateAttachmentPsychoeducation(profile);
          setPsychoed(psychoedResult);
          setStep(3);
        } catch (e) {
          setError('Failed to generate your profile. Please try again.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Step 4 -> 5: Analyse relational moment
      if (step === 4) {
        if (!relationalMoment.trim() || relationalMoment.trim().length < 30) {
          setError('Please describe the moment in at least 30 characters.');
          return;
        }
        if (!attachmentProfile) return;
        setIsLoading(true);
        try {
          const analysis = await analyzeRelationalMoment(attachmentProfile, relationalMoment);
          setMomentAnalysis(analysis);
          setStep(5);
        } catch (e) {
          setError('Failed to analyse the moment. Please try again.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Step 6 (somatic) is handled by PhenomenologicalReportInput's own submit
      // Step 7 -> 8: Generate experiment + insight, save
      if (step === 7) {
        if (!attachmentProfile || !momentAnalysis || !somaticReport) {
          const missingItems = [
            !attachmentProfile && 'profile',
            !momentAnalysis && 'analysis',
            !somaticReport && 'somatic report',
          ].filter(Boolean);
          setError(`Missing data: ${missingItems.join(', ')}`);
          return;
        }
        setIsLoading(true);
        try {
          const exp = await generateExperiment({
            profile: attachmentProfile,
            moment: relationalMoment,
            analysis: momentAnalysis,
            somaticReport,
          });
          setExperiment(exp);

          const insight = await generateInsightFromSession({
            wizardType: 'Attachment Practice',
            sessionId,
            sessionName: `Attachment Practice — ${attachmentProfile.primaryStyle}`,
            sessionReport: `Attachment style: ${attachmentProfile.primaryStyle} (anxiety: ${(attachmentProfile.anxietyScore * 100).toFixed(0)}%, avoidance: ${(attachmentProfile.avoidanceScore * 100).toFixed(0)}%)\n\nRelational moment: ${relationalMoment}\n\nTrigger: ${momentAnalysis.trigger}\nInternal narrative: ${momentAnalysis.internalNarrative}\nAttachment bid: ${momentAnalysis.attachmentBid}\nProtective strategy: ${momentAnalysis.protectiveStrategy}\n\nExperiment: ${exp.experiment}\nAnchor phrase: ${exp.anchorPhrase}`,
            sessionSummary: `${attachmentProfile.primaryStyle} attachment pattern explored. Experiment: ${exp.experiment.slice(0, 100)}`,
            userId: '',
            availablePractices: [],
            dataContext: {
              totalSessions: 1,
              sessionsInLastWeek: 1,
              existingInsights: 0,
            },
          });
          setFinalInsight(insight);

          // Persist insight
          setIntegratedInsights((prev) => [insight, ...prev]);

          // History
          appendHistory({
            sessionId,
            date: new Date().toISOString(),
            style: attachmentProfile.primaryStyle,
            moment: relationalMoment.slice(0, 120),
            detectedPattern: insight.detectedPattern,
            linkedInsightId: insightContext?.id,
          });

          // Mark insight as addressed
          if (insightContext?.id && markInsightAsAddressed) {
            markInsightAsAddressed(insightContext.id, 'Attachment Practice', sessionId);
          }

          // Clear draft
          localStorage.removeItem(DRAFT_KEY);

          setStep(8);
        } catch (e) {
          setError('Failed to generate experiment. Please try again.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Default: advance step
      setStep((s) => s + 1);
      return;
    }

    // --- Practice session flow ---
    // Step 1 -> 2: Analyse relational moment
    if (step === 1) {
      if (!relationalMoment.trim() || relationalMoment.trim().length < 30) {
        setError('Please describe the moment in at least 30 characters.');
        return;
      }
      if (!attachmentProfile) return;
      setIsLoading(true);
      try {
        const analysis = await analyzeRelationalMoment(attachmentProfile, relationalMoment);
        setMomentAnalysis(analysis);
        setStep(2);
      } catch (e) {
        setError('Failed to analyse the moment. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 3 (somatic) handled by PhenomenologicalReportInput
    // Step 4 -> 5: Generate experiment + insight
    if (step === 4) {
      if (!attachmentProfile || !momentAnalysis || !somaticReport) {
        const missingItems = [
          !attachmentProfile && 'profile',
          !momentAnalysis && 'analysis',
          !somaticReport && 'somatic report',
        ].filter(Boolean);
        setError(`Missing data: ${missingItems.join(', ')}`);
        return;
      }
      setIsLoading(true);
      try {
        const exp = await generateExperiment({
          profile: attachmentProfile,
          moment: relationalMoment,
          analysis: momentAnalysis,
          somaticReport,
        });
        setExperiment(exp);

        const insight = await generateInsightFromSession({
          wizardType: 'Attachment Practice',
          sessionId,
          sessionName: `Attachment Practice — ${attachmentProfile.primaryStyle}`,
          sessionReport: `Attachment style: ${attachmentProfile.primaryStyle} (anxiety: ${(attachmentProfile.anxietyScore * 100).toFixed(0)}%, avoidance: ${(attachmentProfile.avoidanceScore * 100).toFixed(0)}%)\n\nRelational moment: ${relationalMoment}\n\nTrigger: ${momentAnalysis.trigger}\nInternal narrative: ${momentAnalysis.internalNarrative}\nAttachment bid: ${momentAnalysis.attachmentBid}\nProtective strategy: ${momentAnalysis.protectiveStrategy}\n\nExperiment: ${exp.experiment}\nAnchor phrase: ${exp.anchorPhrase}`,
          sessionSummary: `${attachmentProfile.primaryStyle} attachment pattern explored. Experiment: ${exp.experiment.slice(0, 100)}`,
          userId: '',
          availablePractices: [],
          dataContext: {
            totalSessions: 1,
            sessionsInLastWeek: 1,
            existingInsights: 0,
          },
        });
        setFinalInsight(insight);

        setIntegratedInsights((prev) => [insight, ...prev]);

        appendHistory({
          sessionId,
          date: new Date().toISOString(),
          style: attachmentProfile.primaryStyle,
          moment: relationalMoment.slice(0, 120),
          detectedPattern: insight.detectedPattern,
          linkedInsightId: insightContext?.id,
        });

        if (insightContext?.id && markInsightAsAddressed) {
          markInsightAsAddressed(insightContext.id, 'Attachment Practice', sessionId);
        }

        localStorage.removeItem(DRAFT_KEY);
        setStep(5);
      } catch (e) {
        setError('Failed to generate experiment. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Default: advance
    setStep((s) => s + 1);
  };

  // ---- Somatic submit (called from PhenomenologicalReportInput) ----
  const handleSomaticSubmit = (report: PhenomenologicalReport) => {
    setSomaticReport(report);
    setStep((s) => s + 1);
  };

  // ---- Determine next button text ----
  function getNextLabel(): string {
    if (isFirstSession) {
      if (step === 2) return isLoading ? 'Scoring...' : 'See My Profile';
      if (step === 4) return isLoading ? 'Analysing...' : 'Analyse Moment';
      if (step === 7) return isLoading ? 'Generating...' : 'Generate Experiment';
      if (step === 8) return 'Close';
    } else {
      if (step === 1) return isLoading ? 'Analysing...' : 'Analyse Moment';
      if (step === 4) return isLoading ? 'Generating...' : 'Generate Experiment';
      if (step === 5) return 'Close';
    }
    return 'Next';
  }

  // Close on final step instead of advancing
  const handleNextOrClose = () => {
    const isFinal = isFirstSession ? step === 8 : step === 5;
    if (isFinal) {
      onClose();
      return;
    }
    handleNext();
  };

  // ---- Somatic step indices ----
  const somaticStep = isFirstSession ? 6 : 3;
  const isSomaticStep = step === somaticStep;

  // ---- Render current step content ----
  function renderStep() {
    if (isFirstSession) {
      switch (step) {
        case 1:
          return <StepIntroduction />;
        case 2:
          return (
            <StepAssessment
              responses={ecrResponses}
              onResponseChange={handleEcrResponse}
            />
          );
        case 3:
          return attachmentProfile && psychoed ? (
            <StepPsychoeducation profile={attachmentProfile} psychoed={psychoed} />
          ) : null;
        case 4:
          return (
            <StepRelationalMoment value={relationalMoment} onChange={setRelationalMoment} />
          );
        case 5:
          return momentAnalysis ? (
            <StepChainAnalysis analysis={momentAnalysis} />
          ) : null;
        case 6:
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-serif text-slate-100">Somatic Check</h3>
                <p className="text-xs text-slate-400">
                  Pause and turn your attention inward. What is alive in your body right now as
                  you hold this relational moment?
                </p>
              </div>
              <PhenomenologicalReportInput
                onSubmit={handleSomaticSubmit}
                compact
              />
            </div>
          );
        case 7:
          return experiment ? (
            <StepExperiment experiment={experiment} />
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-serif text-slate-100">Ready to Experiment</h3>
                <p className="text-xs text-slate-400">
                  Aura will now design a small behavioural experiment based on everything
                  you have shared. Press "Generate Experiment" to continue.
                </p>
              </div>
              {somaticReport && (
                <div className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-3 text-sm text-slate-300">
                  <p className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wider">
                    Somatic data captured
                  </p>
                  <p>{somaticReport.bodySensation} — {somaticReport.emotion}</p>
                </div>
              )}
            </div>
          );
        case 8:
          return (
            <StepCompletion
              profile={attachmentProfile!}
              insight={finalInsight}
              isFirstSession
            />
          );
        default:
          return null;
      }
    }

    // Practice session
    switch (step) {
      case 1:
        return (
          <StepRelationalMoment value={relationalMoment} onChange={setRelationalMoment} />
        );
      case 2:
        return momentAnalysis ? (
          <StepChainAnalysis analysis={momentAnalysis} />
        ) : null;
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif text-slate-100">Somatic Check</h3>
              <p className="text-xs text-slate-400">
                Pause and turn your attention inward. What is alive in your body right now as
                you hold this relational moment?
              </p>
            </div>
            <PhenomenologicalReportInput
              onSubmit={handleSomaticSubmit}
              compact
            />
          </div>
        );
      case 4:
        return experiment ? (
          <StepExperiment experiment={experiment} />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif text-slate-100">Ready to Experiment</h3>
              <p className="text-xs text-slate-400">
                Press "Generate Experiment" to design your weekly practice.
              </p>
            </div>
            {somaticReport && (
              <div className="bg-slate-900/60 border border-purple-900/30 rounded-xl p-3 text-sm text-slate-300">
                <p className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wider">
                  Somatic data captured
                </p>
                <p>{somaticReport.bodySensation} — {somaticReport.emotion}</p>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <StepCompletion
            profile={attachmentProfile!}
            insight={finalInsight}
            isFirstSession={false}
          />
        );
      default:
        return null;
    }
  }

  // ---- Returning user profile banner ----
  const profileBanner = !isFirstSession && attachmentProfile ? (
    <div className="px-4 py-2 bg-purple-950/40 border-b border-purple-900/30 flex items-center gap-2 text-xs text-purple-300">
      <span className="font-medium capitalize">{attachmentProfile.primaryStyle}</span>
      <span className="text-slate-500">attachment</span>
      <span className="ml-auto text-slate-500">
        Anxiety {Math.round(attachmentProfile.anxietyScore * 100)}%
        {' | '}
        Avoidance {Math.round(attachmentProfile.avoidanceScore * 100)}%
      </span>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col" style={{ height: '100dvh' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DyadBridgeIcon size={28} className="text-purple-400" />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                Attachment Practice
                {!isFirstSession && attachmentProfile
                  ? ` — ${attachmentProfile.primaryStyle.charAt(0).toUpperCase() + attachmentProfile.primaryStyle.slice(1)}`
                  : ''}
              </h1>
              <p className="text-[11px] text-stone-500 leading-none mt-0.5">{getStepLabel()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-purple-500' : 'bg-stone-800'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-stone-600 mt-1">Step {step} of {totalSteps}</p>
        </div>

        {/* Returning user profile banner */}
        {profileBanner}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          {/* Crisis banner */}
          {crisisLevel !== 'none' && (
            <SafetyBanner crisisLevel={crisisLevel} />
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-700/50 rounded-lg px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {/* Step content */}
          {renderStep()}

          {/* On somatic step, note that PhenomenologicalReportInput handles submit */}
          {isSomaticStep && (
            <p className="text-xs text-slate-500 italic text-center">
              Complete the somatic report above to continue.
            </p>
          )}
        </div>
      </div>

      {/* Bottom nav footer */}
      <div className="border-t border-stone-800/60 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Save Draft */}
          {step > 1 && step < totalSteps ? (
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Save Draft & Exit
            </button>
          ) : (
            <div />
          )}

          {/* Right: Back + Next */}
          <div className="flex items-center gap-3">
            {step > 1 && !isSomaticStep && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-stone-700/60 text-stone-400 hover:text-stone-200 hover:border-stone-600 text-sm font-medium transition-all min-h-[44px] disabled:opacity-40"
              >
                Back
              </button>
            )}
            {!isSomaticStep && (
              <button
                onClick={handleNextOrClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-wait text-white text-sm font-medium transition-all min-h-[44px] shadow-lg shadow-purple-900/30"
              >
                {getNextLabel()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
