import React, { useState, useEffect, memo } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { culturalShadowSchema, type CulturalShadowAnalysis } from '../../services/ai/wizardSchemas';
import { practices } from '../../constants';
import { CulturalShadowSession } from '../../types';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { useWizardDraft } from '../../hooks/useWizardDraft';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: CulturalShadowSession) => void;
  draft?: CulturalShadowSession | null;
  insightContext?: any;
  markInsightAsAddressed: (insightId: string, toolType: string, sessionId: string) => void;
  userId: string;
}

const STEPS = [
  'Introduction',
  'Lineage',
  'Beliefs',
  'Collective Shadow',
  'Personal Intersection',
  'Analysis',
  'Results',
  'Complete'
];

const LINEAGE_OPTIONS = [
  'Cultural origin / country of origin',
  'Class background / economic status',
  'Religion / spiritual tradition',
  'Generational trauma / historical pain',
  'Immigrant / migration experience',
  'Minority / majority status'
];

const COLLECTIVE_SHADOW_OPTIONS = [
  'What does culture repress / deny?',
  'What does culture project outward?',
  'Who/what does culture scapegoat?',
  'What "bootstrap" myths exist?',
  'What emotions are forbidden?'
];

const SUCCESS_WORTH_OPTIONS = [
  'Financial security = worth',
  'Hard work = moral virtue',
  'Status symbols = achievement',
  'Productivity = value',
  'Competition = success'
];

const EMOTIONS_BODY_OPTIONS = [
  'Emotions = weakness',
  'Body = shameful',
  'Expressing feelings = dangerous',
  'Strength = stoicism',
  'Vulnerability = failure'
];

const RELATIONSHIPS_FAMILY_OPTIONS = [
  'Duty over desire',
  'Loyalty = self-sacrifice',
  'Family obligation first',
  'Harmony = conflict avoidance',
  'Obligation = love'
];

const newSession = (): CulturalShadowSession => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString(),
  lineageNotes: '',
  inheritedBeliefsNotes: '',
  collectiveShadowNotes: '',
  personalShadowNotes: '',
  currentStep: 0,
});

const CulturalShadowExcavator = memo(({
  isOpen,
  onClose,
  onSaveSession,
  draft,
  insightContext,
  markInsightAsAddressed,
  userId
}: Props) => {
  const { setIntegratedInsights } = useInsightsContext();

  // Auto-save draft
  const [session, updateDraft] = useWizardDraft<CulturalShadowSession>('cultural-shadow', draft ?? newSession());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setSession = (updater: CulturalShadowSession | ((prev: CulturalShadowSession) => CulturalShadowSession)) => {
    const newSession = typeof updater === 'function' ? updater(session) : updater;
    updateDraft(newSession);
  };

  if (!isOpen) return null;

  const buildPrompt = (): string => {
    const formatList = (notes: string, title: string, emptyText: string) => {
      const items = notes.split('|||').filter(item => item.trim());
      const list = items.length > 0 ? items.map(item => `- ${item}`).join('\n') : emptyText;
      return `${title} (${items.length} selected):\n${list}`;
    };

    const personalAwareness = parseInt(session.personalShadowNotes) || 5;
    const awarenessText = personalAwareness <= 3
      ? "Little awareness - patterns feel invisible"
      : personalAwareness <= 6
        ? "Moderate awareness - some patterns visible"
        : "High awareness - clear pattern recognition";

    return `You are a depth psychologist and cultural analyst specializing in collective shadow work.

${formatList(session.lineageNotes, 'Cultural Lineage', 'No lineage selections made')}

${formatList(session.inheritedBeliefsNotes, 'Inherited Beliefs', 'No belief selections made')}

${formatList(session.collectiveShadowNotes, 'Collective Shadow Reflections', 'No shadow pattern selections made')}

Personal-Cultural Shadow Intersection:
Awareness level: ${personalAwareness}/10 - ${awarenessText}

Analyze this user's relationship to their cultural conditioning:
1. What are the dominant narratives their culture tells about success, worth, relationships, emotions, the body?
2. What patterns do they scapegoat or blame on "outsiders"?
3. What collective defenses (denial, projection, dissociation) does their culture employ?
4. How does the user's personal shadow align with and echo their culture's shadow?
5. What altitude/worldview (Spiral Dynamics) estimate fits them?
6. What specific liberation moves could help them transcend this conditioning?

Output ONLY valid JSON (2 objects):
{
  "collectiveShadowThemes": ["theme 1", "theme 2"],
  "personalAlignment": "description of how user mirrors cultural shadow",
  "inheritedBeliefs": ["belief 1", "belief 2"],
  "altitudeEstimate": "amber|orange|green|teal|turquoise",
  "liberationMoves": [{"pattern": "scarcity identity", "practice": "Golden Shadow on abundance"}],
  "recommendedWizard": "321|golden-shadow|kegan|contemplative-inquiry"
}`;
  };

  const handleAnalyze = async () => {
    if (!session.lineageNotes.trim() && !session.inheritedBeliefsNotes.trim() && !session.collectiveShadowNotes.trim() && !session.personalShadowNotes.trim()) {
      setError('Please fill in at least one section');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await callGrokThenAIJson('CulturalShadowExcavator', buildPrompt(), undefined, culturalShadowSchema);
      setSession(s => ({
        ...s,
        shadowAnalysis: result,
        currentStep: 7
      }));
      setIsLoading(false);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      onSaveSession(session);
      if (insightContext) {
        markInsightAsAddressed(insightContext.id, 'Cultural Shadow Excavator', session.id);
      }
      const insight = await generateInsightFromSession({
        wizardType: 'Cultural Shadow Excavator',
        sessionId: session.id,
        sessionName: 'Cultural Shadow Excavator',
        sessionReport: JSON.stringify({
          shadowAnalysis: session.shadowAnalysis,
        }),
        sessionSummary: session.shadowAnalysis?.personalAlignment ?? 'Cultural shadow excavated',
        userId,
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
        availablePractices: Object.values(practices).flatMap(category =>
          Array.isArray(category) ? category.map(p => ({ id: p.id, name: p.name })) : []
        ),
      });
      setIntegratedInsights(prev => [insight, ...prev]);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WizardFrame
      title="Cultural Shadow Excavator"
      totalSteps={STEPS.length}
      currentStep={session.currentStep}
      onClose={onClose}
      onNext={() => {
        if (session.currentStep === 5) {
          handleAnalyze();
        } else {
          setSession(s => ({ ...s, currentStep: Math.min(s.currentStep + 1, STEPS.length - 1) }));
        }
      }}
      onBack={() => setSession(s => ({ ...s, currentStep: Math.max(s.currentStep - 1, 0) }))}
      isLoading={isLoading}
    >
      {error && (
        <div className="mb-4 p-3 bg-purple-900/40 border border-purple-700/50 rounded text-purple-300 text-sm">
          {error}
        </div>
      )}

      {/* Step 0: Intro */}
      {session.currentStep === 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-700/50 rounded-lg p-6">
            <h3 className="text-lg font-serif font-bold text-purple-300 mb-3">Lower-Left (LL) Quadrant: Cultural Shadow Excavation</h3>
            <p className="text-purple-200 mb-3">Cultural shadow is the hardest to see because it feels like <em>reality</em>, not a perspective. It's the conditioning you absorbed without choosing it.</p>
            <p className="text-purple-200 mb-3"><strong>What you'll excavate:</strong></p>
            <ul className="text-purple-200 space-y-1 ml-4 list-disc mb-3">
              <li>Inherited beliefs from your lineage (culture, class, religion, history)</li>
              <li>What your culture represses (collective shadow)</li>
              <li>How your personal shadow mirrors your culture's shadow</li>
              <li>Your altitude/worldview (Spiral Dynamics)</li>
              <li>Specific moves to transcend cultural conditioning</li>
            </ul>
            <p className="text-purple-400 text-sm italic mb-2">⚠️ Safety note: This work can surface discomfort, grief, or anger as you recognize patterns you've been carrying.</p>
          </div>
        </div>
      )}

      {/* Step 1: Lineage */}
      {session.currentStep === 1 && (
        <div className="space-y-4">
          <div className="bg-stone-900/50 border border-purple-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-3">Cultural Lineage</h4>
            <p className="text-sm text-stone-300 mb-4">Select aspects of your lineage that shaped you:</p>
            <div className="space-y-3">
              {LINEAGE_OPTIONS.map((option, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-900/20">
                  <input
                    type="checkbox"
                    checked={session.lineageNotes.includes(option)}
                    onChange={(e) => {
                      let notes = session.lineageNotes.split('|||').filter(n => n.trim());
                      if (e.target.checked) {
                        notes.push(option);
                      } else {
                        notes = notes.filter(n => n !== option);
                      }
                      setSession(s => ({ ...s, lineageNotes: notes.join('|||') }));
                    }}
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  <span className="text-stone-300 text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Inherited Beliefs */}
      {session.currentStep === 2 && (
        <div className="space-y-4">
          <div className="bg-stone-900/50 border border-purple-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-3">Inherited Beliefs</h4>
            <p className="text-sm text-stone-300 mb-4">Select what your culture taught you about each domain:</p>

            {/* Success & Worth */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-purple-300 block mb-2">Success & Worth</label>
              <div className="flex flex-wrap gap-2">
                {SUCCESS_WORTH_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      const notes = session.inheritedBeliefsNotes.split('|||').filter(n => n.trim());
                      if (notes.includes(option)) {
                        notes.splice(notes.indexOf(option), 1);
                      } else {
                        notes.push(option);
                      }
                      setSession(s => ({ ...s, inheritedBeliefsNotes: notes.join('|||') }));
                    }}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition min-h-[44px] ${
                      session.inheritedBeliefsNotes.includes(option)
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-700/40 text-stone-300 hover:bg-stone-600/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotions & The Body */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-purple-300 block mb-2">Emotions & The Body</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS_BODY_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      const notes = session.inheritedBeliefsNotes.split('|||').filter(n => n.trim());
                      if (notes.includes(option)) {
                        notes.splice(notes.indexOf(option), 1);
                      } else {
                        notes.push(option);
                      }
                      setSession(s => ({ ...s, inheritedBeliefsNotes: notes.join('|||') }));
                    }}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition min-h-[44px] ${
                      session.inheritedBeliefsNotes.includes(option)
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-700/40 text-stone-300 hover:bg-stone-600/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationships & Family */}
            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-2">Relationships & Family</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS_FAMILY_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      const notes = session.inheritedBeliefsNotes.split('|||').filter(n => n.trim());
                      if (notes.includes(option)) {
                        notes.splice(notes.indexOf(option), 1);
                      } else {
                        notes.push(option);
                      }
                      setSession(s => ({ ...s, inheritedBeliefsNotes: notes.join('|||') }));
                    }}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition min-h-[44px] ${
                      session.inheritedBeliefsNotes.includes(option)
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-700/40 text-stone-300 hover:bg-stone-600/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Collective Shadow */}
      {session.currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-stone-900/50 border border-purple-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-3">Collective Shadow</h4>
            <p className="text-sm text-stone-300 mb-4">Select shadow patterns your culture exhibits:</p>
            <div className="flex flex-wrap gap-2">
              {COLLECTIVE_SHADOW_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    const notes = session.collectiveShadowNotes.split('|||').filter(n => n.trim());
                    if (notes.includes(option)) {
                      notes.splice(notes.indexOf(option), 1);
                    } else {
                      notes.push(option);
                    }
                    setSession(s => ({ ...s, collectiveShadowNotes: notes.join('|||') }));
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition min-h-[44px] ${
                    session.collectiveShadowNotes.includes(option)
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-700/40 text-stone-300 hover:bg-stone-600/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Personal Intersection */}
      {session.currentStep === 4 && (
        <div className="space-y-4">
          <div className="bg-stone-900/50 border border-purple-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-3">Personal-Cultural Intersection</h4>
            <p className="text-sm text-stone-300 mb-4">How much do you see these cultural patterns operating in yourself?</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-stone-300">Awareness of Cultural Patterns</label>
                  <span className="text-lg font-bold text-purple-300">{parseInt(session.personalShadowNotes) || 5}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={parseInt(session.personalShadowNotes) || 5}
                  onChange={(e) => setSession(s => ({ ...s, personalShadowNotes: e.target.value }))}
                  className="w-full accent-purple-600"
                />
                <p className="text-xs text-stone-400 mt-2">
                  {(parseInt(session.personalShadowNotes) || 5) <= 3 ? "Little awareness - patterns feel invisible"
                  : (parseInt(session.personalShadowNotes) || 5) <= 6 ? "Moderate awareness - some patterns visible"
                  : "High awareness - clear pattern recognition"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Analysis Loading */}
      {session.currentStep === 5 && (
        <div className="text-center py-8">
          <p className="text-stone-300 mb-4">Excavating cultural shadow...</p>
          <div className="animate-spin h-8 w-8 border-4 border-purple-400/40 border-t-purple-600 rounded-full mx-auto"></div>
        </div>
      )}

      {/* Step 6: Analysis Results */}
      {session.currentStep === 7 && session.shadowAnalysis && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-2">Collective Shadow Themes</h4>
            <ul className="text-purple-200 space-y-1 ml-3 list-disc">
              {session.shadowAnalysis.collectiveShadowThemes.map((theme, idx) => (
                <li key={idx}>{theme}</li>
              ))}
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-stone-200 mb-2">Your Personal Alignment</h4>
            <p className="text-stone-300 text-sm">{session.shadowAnalysis.personalAlignment}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-300 mb-2">Worldview (Altitude)</h4>
            <p className="text-indigo-200 capitalize font-bold text-lg">{session.shadowAnalysis.altitudeEstimate}</p>
            <p className="text-indigo-400 text-xs mt-1">Spiral Dynamics stage: Your current meaning-making altitude</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-amber-300 mb-2">Liberation Moves</h4>
            <div className="space-y-2">
              {session.shadowAnalysis.liberationMoves.map((move, idx) => (
                <div key={idx} className="bg-stone-900/50 border border-amber-700/30 rounded p-2">
                  <p className="text-xs font-semibold text-amber-400">{move.pattern}</p>
                  <p className="text-sm text-stone-300">{move.practice}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
            <p className="text-sm text-purple-200"><strong>Recommended next step:</strong> {
              session.shadowAnalysis.recommendedWizard === '321' ? '3-2-1 Process' :
              session.shadowAnalysis.recommendedWizard === 'golden-shadow' ? 'Golden Shadow Reclamation' :
              session.shadowAnalysis.recommendedWizard === 'kegan' ? 'Kegan Assessment' :
              'Contemplative Inquiry'
            } to deepen this work.</p>
          </div>
        </div>
      )}

      {/* Step 8: Complete */}
      {session.currentStep === 8 && (
        <div className="text-center py-8 space-y-4">
          <div className="text-4xl">🔍</div>
          <p className="text-lg font-serif font-bold text-purple-300">Cultural shadow excavated</p>
          <p className="text-stone-300">You've named the conditioning you inherited. Seeing it clearly is the first step to transcending it. The next work is integrating these shadow materials into a more whole, liberated self.</p>
          <button
            onClick={handleComplete}
            disabled={isSaving}
            className={`mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? 'Saving...' : 'Save & Complete'}
          </button>
        </div>
      )}
    </WizardFrame>
  );
});

CulturalShadowExcavator.displayName = 'CulturalShadowExcavator';
export default CulturalShadowExcavator;
