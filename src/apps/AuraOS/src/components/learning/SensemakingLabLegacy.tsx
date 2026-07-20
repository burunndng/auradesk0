import React, { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Trash2, Upload, Brain, Loader, Search, X } from 'lucide-react';
import { getIntelligentGuidance } from '../../../services/intelligenceHub';
import type { IntelligenceContext } from '../../../types';
import { colors, spacing } from '../../../theme';
import { StorageManager } from '../../../.claude/lib/storageManager';

// NOTE: This is intentionally self-contained and uses localStorage keys:
// - aura-sensemaking-lab-draft
// - aura-sensemaking-lab-sessions
// - aura-sensemaking-lab-insights (cached AI insights)

export type SensemakingLabDraft = {
  rawQuestion: string;
  focalQuestion: string;
  whatChanged: string;
  nextAction: string;
  falsifier: string;
  updatedAt: number;
};

export type SensemakingLabSession = {
  id: string;
  createdAt: number;
  draft: SensemakingLabDraft;
};

export type SensemakingLabInsight = {
  focalQuestion: string;
  guidance: string;
  confidence: number;
  cachedAt: number;
};

const DRAFT_KEY = 'aura-sensemaking-lab-draft';
const SESSIONS_KEY = 'aura-sensemaking-lab-sessions';
const INSIGHTS_KEY = 'aura-sensemaking-lab-insights';
const INSIGHT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function safeJsonParse<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyDraft = (): SensemakingLabDraft => ({
  rawQuestion: '',
  focalQuestion: '',
  whatChanged: '',
  nextAction: '',
  falsifier: '',
  updatedAt: Date.now(),
});

/**
 * Sensemaking Lab Enhanced
 * - Question Refinery
 *   - rawQuestion (textarea)
 *   - focalQuestion (input) defaults to rawQuestion until user edits it
 * - AI Insights via Intelligence Hub
 * - Integration Note fields: whatChanged, nextAction, falsifier
 * - localStorage persistence
 * - Lens Picker: Eight Zones, IFS, 3-2-1, Perspective Shifter wizards
 * - Enhanced session management with view/delete capabilities
 */
export default function SensemakingLab(props: {
  // We keep props optional/minimal so the component is easy to wire into existing tab router.
  // If the host has wizard launchers, pass them in; otherwise we fall back to custom events.
  onLaunchEightZonesWizard?: (opts?: { prefill?: unknown }) => void;
  onLaunchIFSWizard?: () => void;
  onLaunchThreeTwoOneWizard?: () => void;
  onLaunchPerspectiveShifterWizard?: () => void;
}) {
  const [hasEditedFocal, setHasEditedFocal] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<SensemakingLabInsight | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [draft, setDraft] = useState<SensemakingLabDraft>(() => {
    const saved = safeJsonParse<SensemakingLabDraft>(StorageManager.getUntyped(DRAFT_KEY));
    return saved ?? emptyDraft();
  });

  const [sessions, setSessions] = useState<SensemakingLabSession[]>(() => {
    const saved = (safeJsonParse<SensemakingLabSession[]>(StorageManager.getUntyped(SESSIONS_KEY))) ?? [];
    return saved.sort((a, b) => b.createdAt - a.createdAt);
  });

  // Persist draft
  useEffect(() => {
    StorageManager.setUntyped(DRAFT_KEY, draft);
  }, [draft]);

  // Persist sessions
  useEffect(() => {
    StorageManager.setUntyped(SESSIONS_KEY, sessions);
  }, [sessions]);

  // Load cached AI insight on mount
  useEffect(() => {
    const cached = safeJsonParse<SensemakingLabInsight>(StorageManager.getUntyped(INSIGHTS_KEY));
    if (cached && cached.focalQuestion === draft.focalQuestion) {
      const age = Date.now() - cached.cachedAt;
      if (age < INSIGHT_CACHE_DURATION) {
        setAiInsight(cached);
      }
    }
  }, [draft.focalQuestion]);

  // Keep focalQuestion defaulting to rawQuestion until user edits focalQuestion manually.
  useEffect(() => {
    if (!hasEditedFocal) {
      setDraft((d) => ({ ...d, focalQuestion: d.rawQuestion, updatedAt: Date.now() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.rawQuestion]);

  const update = (patch: Partial<SensemakingLabDraft>) => {
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));
  };

  const resetDraft = () => {
    setHasEditedFocal(false);
    setAiInsight(null);
    setInsightError(null);
    setDraft(emptyDraft());
  };

  const isValidSession = () => {
    return draft.focalQuestion.trim().length > 0 || draft.rawQuestion.trim().length > 0;
  };

  const saveSession = () => {
    if (!isValidSession()) {
      alert('Please enter at least a question before saving.');
      return;
    }

    const next: SensemakingLabSession = {
      id: nowId(),
      createdAt: Date.now(),
      draft,
    };
    const updated = [next, ...sessions];
    setSessions(updated);
    StorageManager.setUntyped(SESSIONS_KEY, updated);

    // Reset draft after saving
    resetDraft();
  };

  const deleteSession = (id: string) => {
    if (!confirm('Delete this session?')) return;
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    StorageManager.setUntyped(SESSIONS_KEY, updated);
  };

  const loadSession = (session: SensemakingLabSession) => {
    setDraft({ ...session.draft, updatedAt: Date.now() });
    setHasEditedFocal(true);
    setExpandedSessionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAiInsight = async () => {
    if (!draft.focalQuestion.trim()) {
      setInsightError('Please enter a focal question first.');
      return;
    }

    setIsLoadingInsight(true);
    setInsightError(null);

    try {
      // Build minimal context for Intelligence Hub
      const context: IntelligenceContext = {
        currentPracticeStack: [],
        practiceNotes: {},
        completionHistory: [],
        wizardSessions: [],
        integratedInsights: [],
        pendingPatterns: [],
        primaryChallenges: [draft.focalQuestion],
      };

      const guidance = await getIntelligentGuidance('sensemaking-lab-user', context);

      const insight: SensemakingLabInsight = {
        focalQuestion: draft.focalQuestion,
        guidance: guidance.synthesis || guidance.primaryFocus || 'No specific guidance available.',
        confidence: 0.5, // Default medium confidence for question-only context
        cachedAt: Date.now(),
      };

      setAiInsight(insight);
      localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insight));
    } catch (error) {
      setInsightError(error instanceof Error ? error.message : 'Failed to get AI insight');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const launchEightZones = () => {
    if (props.onLaunchEightZonesWizard) {
      props.onLaunchEightZonesWizard({ prefill: undefined });
      return;
    }
    window.dispatchEvent(
      new CustomEvent('aura:launch-eight-zones-wizard', {
        detail: { prefill: undefined },
      })
    );
  };

  const launchIFS = () => {
    if (props.onLaunchIFSWizard) {
      props.onLaunchIFSWizard();
      return;
    }
    window.dispatchEvent(new CustomEvent('aura:launch-ifs-wizard'));
  };

  const launchThreeTwoOne = () => {
    if (props.onLaunchThreeTwoOneWizard) {
      props.onLaunchThreeTwoOneWizard();
      return;
    }
    window.dispatchEvent(new CustomEvent('aura:launch-321-wizard'));
  };

  const launchPerspectiveShifter = () => {
    if (props.onLaunchPerspectiveShifterWizard) {
      props.onLaunchPerspectiveShifterWizard();
      return;
    }
    window.dispatchEvent(new CustomEvent('aura:launch-perspective-shifter-wizard'));
  };

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.draft.focalQuestion.toLowerCase().includes(query) ||
        s.draft.rawQuestion.toLowerCase().includes(query) ||
        s.draft.whatChanged.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const charCount = (text: string, max: number) => {
    const len = text.length;
    const color = len > max * 0.9 ? '#f59e0b' : len > max * 0.7 ? '#3b82f6' : '#64748b';
    return (
      <span style={{ fontSize: 11, color, marginLeft: 8 }}>
        {len} / {max}
      </span>
    );
  };

  return (
    <div style={{
      padding: 'clamp(12px, 3vw, 24px)',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.lg,
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: spacing.sm }}>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          <button
            onClick={saveSession}
            type="button"
            disabled={!isValidSession()}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.modules.mind.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: isValidSession() ? 'pointer' : 'not-allowed',
              opacity: isValidSession() ? 1 : 0.5,
            }}
          >
            Save session
          </button>
          <button
            onClick={resetDraft}
            type="button"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.neutral[700],
              color: colors.neutral[100],
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset draft
          </button>
        </div>
      </div>

      {/* Educational Introduction */}
      <section style={{
        border: `1px solid ${colors.modules.mind.border}`,
        borderRadius: 12,
        padding: spacing.lg,
        backgroundColor: colors.modules.mind.bg,
      }}>
        <div style={{ fontWeight: 700, marginBottom: spacing.md, fontSize: 18, color: colors.neutral[100], display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Brain size={20} style={{ color: colors.modules.mind.text }} />
          What is Sensemaking?
        </div>
        <div style={{ fontSize: 14, color: colors.neutral[300], lineHeight: 1.7, marginBottom: spacing.md }}>
          <strong style={{ color: colors.modules.mind.text }}>Sensemaking</strong> is the deliberate process of turning ambiguity into actionable understanding. Unlike passive thinking, sensemaking is <em>active inquiry</em>—it transforms messy, confusing situations into clear questions and testable insights.
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: spacing.md,
          marginTop: spacing.md,
        }}>
          <div style={{
            padding: spacing.md,
            backgroundColor: colors.neutral[900],
            borderRadius: 8,
            border: `1px solid ${colors.neutral[700]}`,
          }}>
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 6, fontSize: 13 }}>
              When to Use It
            </div>
            <ul style={{ fontSize: 13, color: colors.neutral[400], margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Facing a complex decision</li>
              <li>Feeling stuck or confused</li>
              <li>Multiple perspectives conflict</li>
              <li>Need to clarify what matters</li>
            </ul>
          </div>
          <div style={{
            padding: spacing.md,
            backgroundColor: colors.neutral[900],
            borderRadius: 8,
            border: `1px solid ${colors.neutral[700]}`,
          }}>
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 6, fontSize: 13 }}>
              The Process
            </div>
            <ol style={{ fontSize: 13, color: colors.neutral[400], margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Express the messy question</li>
              <li>Refine to a focal inquiry</li>
              <li>Explore through multiple lenses</li>
              <li>Integrate insights into action</li>
            </ol>
          </div>
          <div style={{
            padding: spacing.md,
            backgroundColor: colors.neutral[900],
            borderRadius: 8,
            border: `1px solid ${colors.neutral[700]}`,
          }}>
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 6, fontSize: 13 }}>
              Example Questions
            </div>
            <ul style={{ fontSize: 13, color: colors.neutral[400], margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
              <li>"Why do I feel resistance?"</li>
              <li>"What's really at stake here?"</li>
              <li>"Which perspective am I missing?"</li>
              <li>"What would disprove this?"</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Question Refinery */}
      <section style={{
        border: `1px solid ${colors.neutral[700]}`,
        borderRadius: 12,
        padding: spacing.lg,
        backgroundColor: colors.neutral[900],
      }}>
        <div style={{ fontWeight: 700, marginBottom: spacing.sm, fontSize: 18, color: colors.neutral[100] }}>
          Step 1: Question Refinery
        </div>
        <div style={{
          fontSize: 13,
          color: colors.neutral[500],
          marginBottom: spacing.md,
          padding: spacing.sm,
          backgroundColor: colors.neutral[800],
          borderRadius: 6,
          borderLeft: `3px solid ${colors.modules.mind.border}`,
        }}>
          <strong>Tip:</strong> Start messy. Your first attempt doesn't need to be perfect—that's what refinement is for. Good questions emerge through iteration.
        </div>

        <label style={{
          display: 'block',
          fontSize: 13,
          color: colors.neutral[400],
          marginBottom: spacing.sm,
          fontWeight: 500,
        }}>
          Raw question <span style={{ color: colors.neutral[600] }}>(the messy version)</span>
        </label>
        <textarea
          value={draft.rawQuestion}
          onChange={(e) => update({ rawQuestion: e.target.value })}
          placeholder="Example: 'I feel stuck in my career but don't know if I should stay or leave...'"
          maxLength={500}
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            padding: spacing.md,
            backgroundColor: colors.neutral[800],
            border: `1px solid ${colors.neutral[600]}`,
            borderRadius: 8,
            color: colors.neutral[100],
            fontFamily: 'inherit',
          }}
        />
        {charCount(draft.rawQuestion, 500)}

        <div style={{ height: spacing.lg }} />

        <label style={{
          display: 'block',
          fontSize: 13,
          color: colors.neutral[400],
          marginBottom: spacing.sm,
          fontWeight: 500,
        }}>
          Focal question <span style={{ color: colors.neutral[600] }}>(what you actually want to answer)</span>
        </label>
        <input
          value={draft.focalQuestion}
          onChange={(e) => {
            setHasEditedFocal(true);
            update({ focalQuestion: e.target.value });
          }}
          placeholder="Example: 'What criteria would help me decide between staying and leaving?'"
          maxLength={200}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: spacing.md,
            backgroundColor: colors.neutral[800],
            border: `1px solid ${colors.neutral[600]}`,
            borderRadius: 8,
            color: colors.neutral[100],
            fontFamily: 'inherit',
          }}
        />
        {charCount(draft.focalQuestion, 200)}
        <div style={{
          marginTop: spacing.sm,
          fontSize: 12,
          color: colors.neutral[500],
          padding: spacing.sm,
          backgroundColor: colors.neutral[800],
          borderRadius: 6,
          borderLeft: `3px solid ${colors.modules.mind.border}`,
        }}>
          <strong>Refinement Tip:</strong> A good focal question is specific, answerable, and opens inquiry rather than demanding a yes/no. Try asking "What...?" or "How...?" instead of "Should I...?"
        </div>

        {/* AI Insight Button */}
        {draft.focalQuestion.trim() && (
          <div style={{ marginTop: spacing.lg }}>
            <button
              onClick={getAiInsight}
              disabled={isLoadingInsight}
              type="button"
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: colors.modules.mind.bg,
                border: `1px solid ${colors.modules.mind.border}`,
                color: colors.modules.mind.text,
                borderRadius: 8,
                fontWeight: 600,
                cursor: isLoadingInsight ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              {isLoadingInsight ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={16} />
                  Get AI Insights
                </>
              )}
            </button>
            {insightError && (
              <div style={{
                marginTop: spacing.sm,
                padding: spacing.md,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#fca5a5',
                fontSize: 13,
              }}>
                {insightError}
              </div>
            )}
            {aiInsight && aiInsight.focalQuestion === draft.focalQuestion && (
              <div style={{
                marginTop: spacing.md,
                padding: spacing.lg,
                backgroundColor: colors.modules.mind.bg,
                border: `1px solid ${colors.modules.mind.border}`,
                borderRadius: 8,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                }}>
                  <Lightbulb size={18} style={{ color: colors.modules.mind.text }} />
                  <span style={{ fontWeight: 600, color: colors.neutral[100] }}>
                    AI Insight
                  </span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    backgroundColor: aiInsight.confidence > 0.7
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)',
                    color: aiInsight.confidence > 0.7 ? '#6ee7b7' : '#fbbf24',
                    borderRadius: 4,
                  }}>
                    {Math.round(aiInsight.confidence * 100)}% confidence
                  </span>
                </div>
                <div style={{ color: colors.neutral[300], lineHeight: 1.6 }}>
                  {aiInsight.guidance}
                </div>
                <div style={{
                  marginTop: spacing.sm,
                  fontSize: 11,
                  color: colors.neutral[500],
                }}>
                  Cached {Math.round((Date.now() - aiInsight.cachedAt) / 1000 / 60)} minutes ago
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Integration Note */}
      <section style={{
        border: `1px solid ${colors.neutral[700]}`,
        borderRadius: 12,
        padding: spacing.lg,
        backgroundColor: colors.neutral[900],
      }}>
        <div style={{ fontWeight: 700, marginBottom: spacing.sm, fontSize: 18, color: colors.neutral[100] }}>
          Step 2: Integration Note
        </div>
        <div style={{
          fontSize: 13,
          color: colors.neutral[500],
          marginBottom: spacing.md,
          padding: spacing.sm,
          backgroundColor: colors.neutral[800],
          borderRadius: 6,
          borderLeft: `3px solid ${colors.modules.mind.border}`,
        }}>
          <strong>Purpose:</strong> Sensemaking isn't complete until it changes how you act. These fields help you integrate insights into your life by tracking shifts, next steps, and reality checks.
        </div>

        <label style={{ display: 'block', fontSize: 13, color: colors.neutral[400], marginBottom: spacing.sm, fontWeight: 500 }}>
          What changed? <span style={{ color: colors.neutral[600] }}>(new perspectives, shifts in understanding)</span>
        </label>
        <textarea
          value={draft.whatChanged}
          onChange={(e) => update({ whatChanged: e.target.value })}
          placeholder="Example: 'I realized I'm not stuck in my career—I'm stuck in a binary. There are more options than just stay/leave.'"
          maxLength={500}
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            padding: spacing.md,
            backgroundColor: colors.neutral[800],
            border: `1px solid ${colors.neutral[600]}`,
            borderRadius: 8,
            color: colors.neutral[100],
            fontFamily: 'inherit',
          }}
        />
        {charCount(draft.whatChanged, 500)}

        <div style={{ height: spacing.md }} />

        <label style={{ display: 'block', fontSize: 13, color: colors.neutral[400], marginBottom: spacing.sm, fontWeight: 500 }}>
          Next action <span style={{ color: colors.neutral[600] }}>(concrete step you can take)</span>
        </label>
        <textarea
          value={draft.nextAction}
          onChange={(e) => update({ nextAction: e.target.value })}
          placeholder="Example: 'Interview 3 people who changed careers in their 40s to understand what worked for them.'"
          maxLength={300}
          rows={2}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            padding: spacing.md,
            backgroundColor: colors.neutral[800],
            border: `1px solid ${colors.neutral[600]}`,
            borderRadius: 8,
            color: colors.neutral[100],
            fontFamily: 'inherit',
          }}
        />
        {charCount(draft.nextAction, 300)}

        <div style={{ height: spacing.md }} />

        <label style={{ display: 'block', fontSize: 13, color: colors.neutral[400], marginBottom: spacing.sm, fontWeight: 500 }}>
          Falsifier <span style={{ color: colors.neutral[600] }}>(what would prove this wrong?)</span>
        </label>
        <div style={{
          fontSize: 12,
          color: colors.neutral[500],
          marginBottom: spacing.sm,
          padding: spacing.sm,
          backgroundColor: colors.neutral[800],
          borderRadius: 6,
          borderLeft: `3px solid ${colors.modules.mind.border}`,
        }}>
          <strong>Science Tip:</strong> Karl Popper taught us that the best way to test an idea is to ask: "What evidence would prove me wrong?" This prevents confirmation bias and keeps you honest.
        </div>
        <textarea
          value={draft.falsifier}
          onChange={(e) => update({ falsifier: e.target.value })}
          placeholder="Example: 'If I talk to 5 career changers and they all say they regret it, that would challenge my assumption that change is good.'"
          maxLength={300}
          rows={2}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            padding: spacing.md,
            backgroundColor: colors.neutral[800],
            border: `1px solid ${colors.neutral[600]}`,
            borderRadius: 8,
            color: colors.neutral[100],
            fontFamily: 'inherit',
          }}
        />
        {charCount(draft.falsifier, 300)}
      </section>

      {/* Lens Picker */}
      <section style={{
        border: `1px solid ${colors.neutral[700]}`,
        borderRadius: 12,
        padding: spacing.lg,
        backgroundColor: colors.neutral[900],
      }}>
        <div style={{ fontWeight: 700, marginBottom: spacing.sm, fontSize: 18, color: colors.neutral[100] }}>
          Step 3: Lens Picker
        </div>
        <div style={{
          fontSize: 13,
          color: colors.neutral[500],
          marginBottom: spacing.md,
          padding: spacing.sm,
          backgroundColor: colors.neutral[800],
          borderRadius: 6,
          borderLeft: `3px solid ${colors.modules.mind.border}`,
        }}>
          <strong>Why Multiple Lenses?</strong> Complex questions require multiple perspectives. Each lens below reveals different aspects of your situation. Use 2-3 lenses to get a more complete picture—like viewing a sculpture from different angles.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: spacing.md,
        }}>
          {/* Eight Zones */}
          <div
            role="button"
            tabIndex={0}
            onClick={launchEightZones}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') launchEightZones();
            }}
            style={{
              border: `1px solid ${colors.neutral[600]}`,
              borderRadius: 10,
              padding: spacing.md,
              cursor: 'pointer',
              backgroundColor: colors.neutral[800],
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.modules.mind.border;
              e.currentTarget.style.backgroundColor = colors.modules.mind.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.neutral[600];
              e.currentTarget.style.backgroundColor = colors.neutral[800];
            }}
          >
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 4 }}>
              Eight Zones (AQAL)
            </div>
            <div style={{ fontSize: 12, color: colors.neutral[400], lineHeight: 1.5 }}>
              Multi-perspective analysis across interior/exterior and individual/collective dimensions
            </div>
            <div style={{
              fontSize: 11,
              color: colors.modules.mind.text,
              marginTop: spacing.sm,
              fontStyle: 'italic',
            }}>
              Best for: Seeing blind spots, complex situations
            </div>
          </div>

          {/* IFS */}
          <div
            role="button"
            tabIndex={0}
            onClick={launchIFS}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') launchIFS();
            }}
            style={{
              border: `1px solid ${colors.neutral[600]}`,
              borderRadius: 10,
              padding: spacing.md,
              cursor: 'pointer',
              backgroundColor: colors.neutral[800],
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.modules.shadow.border;
              e.currentTarget.style.backgroundColor = colors.modules.shadow.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.neutral[600];
              e.currentTarget.style.backgroundColor = colors.neutral[800];
            }}
          >
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 4 }}>
              Internal Family Systems
            </div>
            <div style={{ fontSize: 12, color: colors.neutral[400], lineHeight: 1.5 }}>
              Dialogue with internal parts (the voices in your head aren't enemies—they're protectors)
            </div>
            <div style={{
              fontSize: 11,
              color: colors.modules.shadow.text,
              marginTop: spacing.sm,
              fontStyle: 'italic',
            }}>
              Best for: Inner conflict, self-sabotage
            </div>
          </div>

          {/* 3-2-1 */}
          <div
            role="button"
            tabIndex={0}
            onClick={launchThreeTwoOne}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') launchThreeTwoOne();
            }}
            style={{
              border: `1px solid ${colors.neutral[600]}`,
              borderRadius: 10,
              padding: spacing.md,
              cursor: 'pointer',
              backgroundColor: colors.neutral[800],
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.modules.shadow.border;
              e.currentTarget.style.backgroundColor = colors.modules.shadow.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.neutral[600];
              e.currentTarget.style.backgroundColor = colors.neutral[800];
            }}
          >
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 4 }}>
              3-2-1 Shadow Process
            </div>
            <div style={{ fontSize: 12, color: colors.neutral[400], lineHeight: 1.5 }}>
              Face it, talk to it, become it—integrate what you've been avoiding or projecting
            </div>
            <div style={{
              fontSize: 11,
              color: colors.modules.shadow.text,
              marginTop: spacing.sm,
              fontStyle: 'italic',
            }}>
              Best for: Strong reactions, triggers, projections
            </div>
          </div>

          {/* Perspective Shifter */}
          <div
            role="button"
            tabIndex={0}
            onClick={launchPerspectiveShifter}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') launchPerspectiveShifter();
            }}
            style={{
              border: `1px solid ${colors.neutral[600]}`,
              borderRadius: 10,
              padding: spacing.md,
              cursor: 'pointer',
              backgroundColor: colors.neutral[800],
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.modules.mind.border;
              e.currentTarget.style.backgroundColor = colors.modules.mind.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.neutral[600];
              e.currentTarget.style.backgroundColor = colors.neutral[800];
            }}
          >
            <div style={{ fontWeight: 600, color: colors.neutral[100], marginBottom: 4 }}>
              Perspective Shifter
            </div>
            <div style={{ fontSize: 12, color: colors.neutral[400], lineHeight: 1.5 }}>
              View your situation from multiple angles (stakeholders, time horizons, value systems)
            </div>
            <div style={{
              fontSize: 11,
              color: colors.modules.mind.text,
              marginTop: spacing.sm,
              fontStyle: 'italic',
            }}>
              Best for: Decisions, conflicts, stuck thinking
            </div>
          </div>
        </div>
      </section>

      {/* Recent sessions */}
      <section style={{
        border: `1px solid ${colors.neutral[700]}`,
        borderRadius: 12,
        padding: spacing.lg,
        backgroundColor: colors.neutral[900],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: colors.neutral[100] }}>
            Saved Sessions ({sessions.length})
          </div>
          {sessions.length > 0 && (
            <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: 300, minWidth: 0 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: spacing.md,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.neutral[500],
                }}
              />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: `${spacing.sm} ${spacing.sm} ${spacing.sm} 36px`,
                  backgroundColor: colors.neutral[800],
                  border: `1px solid ${colors.neutral[600]}`,
                  borderRadius: 8,
                  color: colors.neutral[100],
                  fontSize: 13,
                }}
              />
              {searchQuery && (
                <X
                  size={16}
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.neutral[500],
                    cursor: 'pointer',
                  }}
                />
              )}
            </div>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <div style={{ fontSize: 13, color: colors.neutral[500], textAlign: 'center', padding: spacing.xl }}>
            {searchQuery ? 'No sessions match your search.' : 'No saved sessions yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                style={{
                  border: `1px solid ${colors.neutral[700]}`,
                  borderRadius: 10,
                  padding: spacing.md,
                  backgroundColor: colors.neutral[800],
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: spacing.md,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: colors.neutral[500], marginBottom: 4 }}>
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: colors.neutral[100],
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedSessionId(expandedSessionId === s.id ? null : s.id)}
                    >
                      {s.draft.focalQuestion || s.draft.rawQuestion || 'Untitled'}
                    </div>

                    {expandedSessionId === s.id && (
                      <div style={{
                        marginTop: spacing.md,
                        padding: spacing.md,
                        backgroundColor: colors.neutral[900],
                        borderRadius: 8,
                        fontSize: 13,
                        color: colors.neutral[300],
                      }}>
                        {s.draft.rawQuestion && s.draft.rawQuestion !== s.draft.focalQuestion && (
                          <div style={{ marginBottom: spacing.sm }}>
                            <div style={{ color: colors.neutral[500], fontSize: 11, marginBottom: 2 }}>
                              Raw question:
                            </div>
                            <div>{s.draft.rawQuestion}</div>
                          </div>
                        )}
                        {s.draft.whatChanged && (
                          <div style={{ marginBottom: spacing.sm }}>
                            <div style={{ color: colors.neutral[500], fontSize: 11, marginBottom: 2 }}>
                              What changed:
                            </div>
                            <div>{s.draft.whatChanged}</div>
                          </div>
                        )}
                        {s.draft.nextAction && (
                          <div style={{ marginBottom: spacing.sm }}>
                            <div style={{ color: colors.neutral[500], fontSize: 11, marginBottom: 2 }}>
                              Next action:
                            </div>
                            <div>{s.draft.nextAction}</div>
                          </div>
                        )}
                        {s.draft.falsifier && (
                          <div>
                            <div style={{ color: colors.neutral[500], fontSize: 11, marginBottom: 2 }}>
                              Falsifier:
                            </div>
                            <div>{s.draft.falsifier}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: spacing.sm, flexShrink: 0 }}>
                    <button
                      onClick={() => loadSession(s)}
                      type="button"
                      title="Load this session into draft"
                      style={{
                        padding: spacing.sm,
                        backgroundColor: colors.modules.mind.bg,
                        border: `1px solid ${colors.modules.mind.border}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Upload size={16} style={{ color: colors.modules.mind.text }} />
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      type="button"
                      title="Delete this session"
                      style={{
                        padding: spacing.sm,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={16} style={{ color: '#fca5a5' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
