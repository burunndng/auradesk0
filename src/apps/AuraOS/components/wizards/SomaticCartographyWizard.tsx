/**
 * SomaticCartographyWizard.tsx
 * Body module tool — longitudinal somatic pattern tracking.
 * Accent: emerald | localStorage: aura-draft-somatic-cartography-*, aura-somaticBodyMapHistory
 *
 * Internal screen router (not a linear WizardFrame flow):
 *   HOME → CHECKIN / INQUIRY / JOURNAL / SETTINGS / GROUNDING / SUPPORT
 *   HOME ← ONBOARDING (first-time only, when no SafetyProfile exists)
 */

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import {
  EngramArchiveIcon,
  SenseMandalaIcon,
  InquiryVortexIcon,
  PatternMandalaIcon,
  ResonanceFieldIcon,
  AstralCompassIcon,
  DyadBridgeIcon,
} from '../visualizations/SacredGeometryIcons';
import type {
  SomaticScreen,
  SafetyProfile,
  BodyMapHistoryEntry,
  CheckInDraft,
  InquiryDraft,
  PostSessionState,
} from './somatic-cartography/types';
import {
  SAFETY_PROFILE_KEY,
  HISTORY_KEY,
  CHECKIN_DRAFT_KEY,
  INQUIRY_DRAFT_KEY,
  ADVERSE_STATES,
  ADVERSE_TRIGGER_COUNT,
  ADVERSE_WINDOW_COUNT,
  DISMISS_PAUSE_THRESHOLD,
  MAX_HISTORY_ENTRIES,
  INQUIRY_COOLDOWN_MS,
} from './somatic-cartography/constants';

// Lazy-load sub-flows to keep initial bundle small
const OnboardingFlow = lazy(() => import('./somatic-cartography/OnboardingFlow'));
const CheckInFlow = lazy(() => import('./somatic-cartography/CheckInFlow'));
const InquiryFlow = lazy(() => import('./somatic-cartography/InquiryFlow'));
const PatternJournal = lazy(() => import('./somatic-cartography/PatternJournal'));
const GroundingPractice = lazy(() => import('./somatic-cartography/GroundingPractice'));

// ---------------------------------------------------------------------------
// Storage helpers (direct localStorage reads — no hook needed at this level)
// ---------------------------------------------------------------------------

function readSafetyProfile(): SafetyProfile | null {
  try {
    const raw = localStorage.getItem(SAFETY_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SafetyProfile) : null;
  } catch {
    return null;
  }
}

function writeSafetyProfile(profile: SafetyProfile): void {
  localStorage.setItem(SAFETY_PROFILE_KEY, JSON.stringify(profile));
}

function readHistory(): BodyMapHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as BodyMapHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function readInquiryDraft(): InquiryDraft | null {
  try {
    const raw = localStorage.getItem(INQUIRY_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as InquiryDraft) : null;
  } catch {
    return null;
  }
}

function clearInquiryDraft(): void {
  localStorage.removeItem(INQUIRY_DRAFT_KEY);
}

// ---------------------------------------------------------------------------
// Safety monitoring
// ---------------------------------------------------------------------------

export function checkAdversePattern(
  profile: SafetyProfile
): 'ok' | 'warn' | 'pause' {
  if (profile.accessLevel === 'inquiry_paused') return 'pause';
  if (profile.inquiryDismissCount >= DISMISS_PAUSE_THRESHOLD) return 'pause';
  const recent = profile.adverseSessionFlags.slice(-ADVERSE_WINDOW_COUNT);
  const adverseCount = recent.filter((f) => ADVERSE_STATES.includes(f)).length;
  if (adverseCount >= ADVERSE_TRIGGER_COUNT) return 'warn';
  return 'ok';
}

export function recordAdverseFlag(
  profile: SafetyProfile,
  state: PostSessionState
): SafetyProfile {
  if (!ADVERSE_STATES.includes(state)) return profile;
  const updated: SafetyProfile = {
    ...profile,
    adverseSessionFlags: [...profile.adverseSessionFlags, state],
  };
  return updated;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SomaticCartographyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SomaticCartographyWizard({
  isOpen,
  onClose,
  userId,
}: SomaticCartographyWizardProps) {
  const [screen, setScreen] = useState<SomaticScreen>('HOME');
  const [safetyProfile, setSafetyProfile] = useState<SafetyProfile | null>(null);
  const [history, setHistory] = useState<BodyMapHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeInquiryFromBackground, setResumeInquiryFromBackground] = useState(false);

  // Draft persistence
  const [, updateDraft] = useWizardDraft<{ screen: SomaticScreen }>(
    'aura-draft-somatic-cartography',
    { screen: 'HOME' }
  );

  // Sync current screen to draft on changes
  useEffect(() => {
    updateDraft({ screen });
  }, [screen]);

  // On mount: read profile + history + check for mid-session inquiry
  useEffect(() => {
    const profile = readSafetyProfile();
    const hist = readHistory();
    setHistory(hist);

    if (!profile) {
      // First time: go to onboarding
      setSafetyProfile(null);
      setScreen('ONBOARDING');
    } else {
      setSafetyProfile(profile);
      // Check for in-progress inquiry with active offline timer
      const inquiryDraft = readInquiryDraft();
      if (inquiryDraft?.offlineStartAt && !inquiryDraft.offlineReturnAt) {
        // Timer was running when app closed — resume inquiry
        setResumeInquiryFromBackground(true);
        setScreen('INQUIRY');
      } else {
        setScreen('HOME');
      }
    }
    setLoading(false);
  }, []);

  // Sync safety profile to state and localStorage
  const updateSafetyProfile = useCallback(
    (updates: Partial<SafetyProfile>) => {
      setSafetyProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updates };
        writeSafetyProfile(next);
        return next;
      });
    },
    []
  );

  // Called when check-in completes
  const handleCheckInComplete = useCallback(
    (entry: BodyMapHistoryEntry) => {
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
      // Update adverse flags if needed
      if (entry.postSessionState && safetyProfile) {
        const updated = recordAdverseFlag(safetyProfile, entry.postSessionState);
        if (updated !== safetyProfile) {
          updateSafetyProfile({ adverseSessionFlags: updated.adverseSessionFlags });
        }
      }
      setScreen('HOME');
    },
    [safetyProfile, updateSafetyProfile]
  );

  // Called when inquiry completes
  const handleInquiryComplete = useCallback(
    (postState: PostSessionState | undefined, lastInquiryAt: string) => {
      if (postState && safetyProfile) {
        const updated = recordAdverseFlag(safetyProfile, postState);
        updateSafetyProfile({
          adverseSessionFlags: updated.adverseSessionFlags,
          lastInquiryAt,
        });
      } else {
        updateSafetyProfile({ lastInquiryAt });
      }
      clearInquiryDraft();
      setResumeInquiryFromBackground(false);
      setScreen('HOME');
    },
    [safetyProfile, updateSafetyProfile]
  );

  // Onboarding complete — profile is created for first time
  const handleOnboardingComplete = useCallback(
    (profile: SafetyProfile) => {
      writeSafetyProfile(profile);
      setSafetyProfile(profile);
      setScreen('HOME');
    },
    []
  );

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col overflow-hidden">
      {/* Global header — only shown on HOME, JOURNAL, SETTINGS; sub-flows manage their own headers */}
      {(screen === 'HOME' || screen === 'JOURNAL' || screen === 'SETTINGS' || screen === 'GROUNDING' || screen === 'SUPPORT') && (
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400">
              <EngramArchiveIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Body · Somatic</p>
              <h1 className="text-base font-serif text-neutral-100 leading-tight">Somatic Cartography</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
      )}

      {/* Screen content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="w-5 h-5 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          }
        >
          {screen === 'ONBOARDING' && (
            <OnboardingFlow
              userId={userId}
              onComplete={handleOnboardingComplete}
            />
          )}

          {screen === 'HOME' && safetyProfile && (
            <HomeScreen
              profile={safetyProfile}
              history={history}
              onStartCheckIn={() => setScreen('CHECKIN')}
              onStartInquiry={() => setScreen('INQUIRY')}
              onOpenJournal={() => setScreen('JOURNAL')}
              onOpenGrounding={() => setScreen('GROUNDING')}
              onOpenSupport={() => setScreen('SUPPORT')}
              onOpenSettings={() => setScreen('SETTINGS')}
            />
          )}

          {screen === 'CHECKIN' && safetyProfile && (
            <CheckInFlow
              userId={userId}
              safetyProfile={safetyProfile}
              history={history}
              onComplete={handleCheckInComplete}
              onBack={() => setScreen('HOME')}
            />
          )}

          {screen === 'INQUIRY' && safetyProfile && (
            <InquiryFlow
              userId={userId}
              safetyProfile={safetyProfile}
              history={history}
              resumeFromBackground={resumeInquiryFromBackground}
              onComplete={handleInquiryComplete}
              onUpdateProfile={updateSafetyProfile}
              onBack={() => {
                clearInquiryDraft();
                setResumeInquiryFromBackground(false);
                setScreen('HOME');
              }}
            />
          )}

          {screen === 'JOURNAL' && (
            <PatternJournal
              history={history}
              onBack={() => setScreen('HOME')}
            />
          )}

          {screen === 'GROUNDING' && (
            <GroundingPractice onBack={() => setScreen('HOME')} />
          )}

          {screen === 'SUPPORT' && (
            <SupportScreen onBack={() => setScreen('HOME')} />
          )}

          {screen === 'SETTINGS' && safetyProfile && (
            <SettingsScreen
              profile={safetyProfile}
              onUpdateProfile={updateSafetyProfile}
              onBack={() => setScreen('HOME')}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen (inline — no separate file needed)
// ---------------------------------------------------------------------------

interface HomeScreenProps {
  profile: SafetyProfile;
  history: BodyMapHistoryEntry[];
  onStartCheckIn: () => void;
  onStartInquiry: () => void;
  onOpenJournal: () => void;
  onOpenGrounding: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
}

function HomeScreen({
  profile,
  history,
  onStartCheckIn,
  onStartInquiry,
  onOpenJournal,
  onOpenGrounding,
  onOpenSupport,
  onOpenSettings,
}: HomeScreenProps) {
  const totalCheckIns = history.length;
  const last7 = history.filter(
    (e) => Date.now() - new Date(e.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  // Top zone from last 30 days
  const last30 = history.filter(
    (e) => Date.now() - new Date(e.completedAt).getTime() < 30 * 24 * 60 * 60 * 1000
  );
  const zoneFreq: Record<string, number> = {};
  last30.forEach((e) => e.marks.forEach((m) => {
    zoneFreq[m.zone] = (zoneFreq[m.zone] || 0) + 1;
  }));
  const topZoneEntry = Object.entries(zoneFreq).sort((a, b) => b[1] - a[1])[0];

  // Pacing check
  const inquiryAvailable = !profile.lastInquiryAt ||
    Date.now() - new Date(profile.lastInquiryAt).getTime() >= 48 * 60 * 60 * 1000;
  const inquiryPaused = profile.accessLevel === 'inquiry_paused';

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-8">
      {/* Practice summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total check-ins', value: totalCheckIns },
          { label: 'This week', value: last7.length },
          { label: 'Zones tracked', value: Object.keys(zoneFreq).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-serif text-emerald-400">{value}</p>
            <p className="text-[11px] font-mono text-neutral-500 mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Top pattern (only if data exists) */}
      {topZoneEntry && (
        <div className="bg-neutral-900/40 border border-emerald-500/10 rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/70 mb-1">Pattern this month</p>
          <p className="text-neutral-200 text-sm">
            <span className="text-emerald-300 font-medium">{topZoneEntry[0].replace(/_/g, ' ')}</span>
            {' '}appeared {topZoneEntry[1]} time{topZoneEntry[1] !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Primary CTA: Check-in */}
      <div className="space-y-3">
        <button
          onClick={onStartCheckIn}
          className="w-full group flex items-center gap-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 text-left"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
            <SenseMandalaIcon size={22} />
          </div>
          <div>
            <p className="text-neutral-100 font-serif text-lg leading-tight">Add to Body Map</p>
            <p className="text-neutral-500 text-sm mt-0.5">Track today's sensations · ~2 min</p>
          </div>
        </button>

        {/* Inquiry CTA */}
        {!inquiryPaused ? (
          <button
            onClick={onStartInquiry}
            disabled={!inquiryAvailable}
            className="w-full group flex items-center gap-4 bg-neutral-900/50 hover:bg-neutral-900/70 disabled:opacity-40 border border-neutral-800 hover:border-neutral-700 disabled:hover:border-neutral-800 rounded-2xl p-5 transition-all duration-200 text-left disabled:cursor-default"
          >
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400/70 flex-shrink-0">
              <InquiryVortexIcon size={22} />
            </div>
            <div>
              <p className="text-neutral-200 font-serif text-lg leading-tight">Begin Inquiry</p>
              <p className="text-neutral-500 text-sm mt-0.5">
                {inquiryAvailable
                  ? 'Explore a zone through felt-sensing · ~10 min'
                  : 'Integration rest period — available in 48 hours'}
              </p>
            </div>
          </button>
        ) : (
          <div className="bg-neutral-900/40 border border-amber-500/15 rounded-2xl p-5">
            <p className="text-neutral-300 font-serif text-base leading-tight">Inquiry is paused</p>
            <p className="text-neutral-500 text-sm mt-1">
              Recent sessions have been leaving you unsettled. Check-ins are still available.
            </p>
          </div>
        )}
      </div>

      {/* Secondary nav row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Patterns', icon: <PatternMandalaIcon size={18} />, action: onOpenJournal },
          { label: 'Grounding', icon: <ResonanceFieldIcon size={18} />, action: onOpenGrounding },
          { label: 'Settings', icon: <AstralCompassIcon size={18} />, action: onOpenSettings },
        ].map(({ label, icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-200"
          >
            <span className="text-emerald-400/70">{icon}</span>
            <span className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">{label}</span>
          </button>
        ))}
      </div>

      {/* Support link */}
      <div className="text-center">
        <button
          onClick={onOpenSupport}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <DyadBridgeIcon size={14} />
          <span>Find support resources</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SupportScreen (inline)
// ---------------------------------------------------------------------------

function SupportScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <h2 className="text-2xl font-serif text-neutral-100">Find Support</h2>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">When this might be the right time</p>
        <ul className="space-y-2 text-sm text-neutral-300">
          {[
            'You feel flooded or overwhelmed during or after a session',
            'Body-related material brings up strong emotional waves',
            'You notice recurring dissociation or disconnection',
            'You want to go deeper than this tool can hold',
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Crisis support</p>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>
            <span className="text-neutral-400">US Crisis Line: </span>
            <strong className="text-neutral-100">988</strong> (call or text)
          </li>
          <li>
            <span className="text-neutral-400">Crisis Text Line: </span>
            Text <strong className="text-neutral-100">HOME to 741741</strong>
          </li>
        </ul>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Find a somatic therapist</p>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>Psychology Today therapist directory (filter: somatic)</li>
          <li>Somatic Experiencing International — traumahealing.org</li>
          <li>USABP.org — body psychotherapy directory</li>
        </ul>
        <p className="text-xs text-neutral-600 mt-2">If you're already in therapy, bring your Somatic Cartography pattern journal to a session as context.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingsScreen (inline)
// ---------------------------------------------------------------------------

interface SettingsScreenProps {
  profile: SafetyProfile;
  onUpdateProfile: (updates: Partial<SafetyProfile>) => void;
  onBack: () => void;
}

function SettingsScreen({ profile, onUpdateProfile, onBack }: SettingsScreenProps) {
  const silhouetteOptions: Array<{ value: SafetyProfile['silhouettePreference']; label: string; description: string }> = [
    { value: 'front_back', label: 'Front & Back', description: 'Toggle between front and back body views' },
    { value: 'front_only', label: 'Front Only', description: 'Single front-view body map' },
    { value: 'text_list', label: 'Text List', description: 'Zone names as a text list — no body image' },
  ];

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <h2 className="text-2xl font-serif text-neutral-100">Settings</h2>

      {/* Silhouette preference */}
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Body map display</p>
        <div className="space-y-2">
          {silhouetteOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateProfile({ silhouettePreference: opt.value })}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left ${
                profile.silhouettePreference === opt.value
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-neutral-100'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                profile.silhouettePreference === opt.value
                  ? 'border-emerald-400 bg-emerald-400'
                  : 'border-neutral-600'
              }`} />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI toggle */}
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Pattern observations</p>
        <button
          onClick={() => onUpdateProfile({ aiEnabled: !profile.aiEnabled })}
          className="w-full flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
        >
          <div>
            <p className="text-sm text-neutral-200">AI pattern observations</p>
            <p className="text-xs text-neutral-500 mt-0.5">Frequency, word patterns, timing — no interpretation</p>
          </div>
          <div className={`w-10 h-6 rounded-full border transition-colors ${
            profile.aiEnabled ? 'bg-emerald-500/30 border-emerald-500/40' : 'bg-neutral-800 border-neutral-700'
          }`}>
            <div className={`w-4 h-4 rounded-full m-0.5 transition-all ${
              profile.aiEnabled ? 'bg-emerald-400 translate-x-4' : 'bg-neutral-600 translate-x-0'
            }`} />
          </div>
        </button>
      </div>

      {/* Data privacy note */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">Data & Privacy</p>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Your journal entries and body map data are stored on your device and optionally synced to your account.
          This content is never used for AI model training. You can delete all Somatic Cartography data from your
          account settings at any time.
        </p>
      </div>

      {/* Access level display */}
      {profile.accessLevel === 'inquiry_paused' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-amber-300 font-medium">Inquiry is currently paused</p>
          <p className="text-xs text-neutral-400 mt-1">
            Take some time with check-ins and grounding practice. Inquiry will resume when you're ready.
          </p>
          <button
            onClick={() => onUpdateProfile({ accessLevel: 'standard', inquiryDismissCount: 0 })}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
          >
            Resume inquiry access
          </button>
        </div>
      )}
    </div>
  );
}
