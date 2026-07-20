import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { X, ChevronRight, ChevronLeft, Save, Loader2, ArrowRight, BookOpen, Target, Info, Star, Eye, Compass, Sunrise, Flame } from 'lucide-react';
import { IntegratedInsight } from '../../types.ts';
import { StorageManager } from '../../.claude/lib/storageManager';
import { MeditationPractice } from '../../data/meditationPractices.ts';
import {
  assessmentQuestions,
  sectionOrder,
  sectionDescriptions,
  getQuestionsBySection,
  Question,
  UserProfile
} from '../../data/meditationAssessment.ts';
import meditationRecommender, { RecommendationReport } from '../../services/meditationRecommender.ts';
import MeditationIntroductionScreens from '../shared/MeditationIntroductionScreens';

interface MeditationWizardProps {
  onClose: () => void;
  onSessionSave?: (session: any) => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

type WizardStep = 'welcome' | 'assessment' | 'results' | 'practice-details';

// ─── Step metadata ─────────────────────────────────────────────────────────────

const SECTION_ICONS = [Compass, Target, Eye, Sunrise, Flame];

const STEP_META = [
  { label: 'Welcome', icon: Compass, desc: 'Set your intention for practice' },
  { label: 'Discovery', icon: Eye, desc: 'Explore your inner landscape' },
  { label: 'Recommendations', icon: Star, desc: 'Your personalised matches' },
  { label: 'Deep Dive', icon: BookOpen, desc: 'Full practice exploration' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</p>;
}

function StepRail({ current, steps }: { current: number; steps: typeof STEP_META }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {steps.map((meta, i) => {
        const Icon = meta.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-amber-500/10 border border-amber-500/20' : done ? 'opacity-60' : 'opacity-30'}`}>
            <div className={`shrink-0 ${active ? 'text-amber-400' : done ? 'text-amber-600' : 'text-stone-600'}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold font-serif truncate ${active ? 'text-amber-300' : done ? 'text-stone-400' : 'text-stone-600'}`}>
                {meta.label}
              </p>
              {active && <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{meta.desc}</p>}
            </div>
            {done && <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-amber-600" />}
          </div>
        );
      })}
    </div>
  );
}

export default function MeditationWizard({ onClose, onSessionSave, insightContext, markInsightAsAddressed }: MeditationWizardProps) {
  const { recordWizardSession } = useSubscription();
  const [step, setStep] = useState<WizardStep>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [recommendations, setRecommendations] = useState<RecommendationReport | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<MeditationPractice | null>(null);
  const [showIntroScreens, setShowIntroScreens] = useState(false);
  const [meditationPractices, setMeditationPractices] = useState<any>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [clarityBefore, setClarityBefore] = useState(50);
  const [clarityAfter, setClarityAfter] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('../../data/meditationPractices.ts').then(module => {
      setMeditationPractices(module.default || []);
      setIsDataLoading(false);
    }).catch(err => {
      console.error('[MeditationWizard] Failed to load meditation data:', err);
      setIsDataLoading(false);
    });
  }, []);

  // Scroll to top on step/section change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step, currentSectionIndex]);

  const questionsBySection = getQuestionsBySection();
  const currentSection = sectionOrder[currentSectionIndex];
  const currentQuestions = questionsBySection[currentSection] || [];

  const isSectionComplete = () => {
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentSectionIndex < sectionOrder.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      generateRecommendations();
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const generateRecommendations = () => {
    if (isDataLoading || meditationPractices.length === 0) return;

    const userProfile: UserProfile = {
      background: {
        cultural: answers['cultural-background'],
        spiritualOpenness: answers['spiritual-openness'],
        previousExperience: answers['previous-experience']
      },
      goals: {
        primary: answers['primary-goals'],
        motivations: [answers['motivation-type']]
      },
      personality: {
        learningStyle: answers['learning-style'],
        structurePreference: answers['structure-preference'],
        temperament: answers['temperament']
      },
      practical: {
        timeAvailable: answers['time-available'],
        retreatWillingness: answers['retreat-willingness'],
        locationAccess: answers['teacher-access']
      },
      priorities: {
        evidenceBased: answers['evidence-importance'],
        traditionalAuthenticity: answers['tradition-importance'],
        quickResults: answers['patience-level'] === 'immediate' || answers['patience-level'] === 'need-results' ? 10 : 5,
        spiritualDepth: answers['quick-vs-deep'] === 'deep-transformation' ? 10 : 5
      }
    };

    const report = meditationRecommender.generateReport(meditationPractices, userProfile);
    setRecommendations(report);
    saveMinimalSession(report);
    setStep('results');
  };

  const saveMinimalSession = (report: RecommendationReport) => {
    const sessionId = `meditation-${Date.now()}`;
    const session = {
      id: sessionId,
      date: new Date().toISOString(),
      completed: true,
      linkedInsightId: insightContext?.id,
      selectedMeditation: { name: report.topRecommendation.practice.name },
    };

    void recordWizardSession();

    if (onSessionSave) {
      onSessionSave(session);
    } else {
      try {
        const existing = (StorageManager.getUntyped('meditationWizardSessions') || []) as any[];
        StorageManager.setUntyped('meditationWizardSessions', [...existing, session]);
        if (session.linkedInsightId && markInsightAsAddressed) {
          markInsightAsAddressed(session.linkedInsightId, 'Meditation Finder', sessionId);
        }
      } catch (error) {
        console.error('[MeditationWizard] Failed to save session:', error);
      }
    }
  };

  // ─── Get current step index for sidebar ───────────────────────────────────────
  const getStepIndex = (): number => {
    if (step === 'welcome') return 0;
    if (step === 'assessment') return 1;
    if (step === 'results') return 2;
    if (step === 'practice-details') return 3;
    return 0;
  };

  // ─── Render question ─────────────────────────────────────────────────────────

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    if (question.type === 'multiple-choice') {
      return (
        <div className="space-y-2">
          {question.options?.map(option => {
            const active = answer === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${active
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-stone-900/60 border-stone-700/40 text-stone-300 hover:border-stone-600'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.text}</span>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (question.type === 'multi-select') {
      const selectedValues = answer || [];
      return (
        <div className="space-y-2">
          {question.options?.map(option => {
            const isSelected = selectedValues.includes(option.value);
            const canSelect = !question.maxSelections || selectedValues.length < question.maxSelections || isSelected;
            return (
              <button
                key={option.value}
                onClick={() => {
                  if (!canSelect && !isSelected) return;
                  const newValues = isSelected
                    ? selectedValues.filter((v: any) => v !== option.value)
                    : [...selectedValues, option.value];
                  handleAnswer(question.id, newValues);
                }}
                disabled={!canSelect && !isSelected}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${isSelected
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : canSelect
                    ? 'bg-stone-900/60 border-stone-700/40 text-stone-300 hover:border-stone-600'
                    : 'bg-stone-900/40 border-stone-700/20 text-stone-600 cursor-not-allowed opacity-40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.text}</span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </div>
              </button>
            );
          })}
          {question.maxSelections && (
            <p className="text-xs text-stone-500 mt-1">
              <span className="font-mono text-amber-400">{selectedValues.length}</span> of {question.maxSelections} selected
            </p>
          )}
        </div>
      );
    }

    if (question.type === 'scale') {
      const val = answer || Math.floor(((question.scaleMax || 10) - (question.scaleMin || 1)) / 2) + (question.scaleMin || 1);
      return (
        <div className="space-y-3">
          <input
            type="range"
            min={question.scaleMin}
            max={question.scaleMax}
            value={val}
            onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
            className="w-full h-1.5 bg-stone-800 rounded-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500">{question.scaleLabels?.[0]}</span>
            <span className="text-xl font-mono font-bold text-amber-400">{val}</span>
            <span className="text-stone-500">{question.scaleLabels?.[1]}</span>
          </div>
        </div>
      );
    }

    if (question.type === 'yes-no') {
      return (
        <div className="flex gap-3">
          {(['yes', 'no'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(question.id, opt)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${answer === opt
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
                }`}
            >
              {opt === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  // ─── Step renderers ──────────────────────────────────────────────────────────

  const renderWelcome = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-block text-amber-400/60 mb-3">
          <Compass size={44} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Finding Your Practice</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Every contemplative tradition offers a different doorway into presence. This assessment maps your goals, temperament, and circumstances to the practice most likely to meet you where you are.
        </p>
      </div>

      {/* Bookend metric */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs text-stone-400">How clear are you about what practice suits you?</label>
          <span className="text-xl font-mono font-bold text-amber-400">{clarityBefore}%</span>
        </div>
        <input type="range" min={0} max={100} value={clarityBefore} onChange={e => setClarityBefore(Number(e.target.value))}
          className="w-full h-2 bg-stone-800 rounded-full accent-amber-500 cursor-pointer" />
        <div className="flex justify-between text-[10px] text-stone-600 mt-1">
          <span>Completely uncertain</span><span>Very clear</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BookOpen, label: '12 Practice Styles', desc: 'Samatha to MBSR, across major traditions', color: 'text-indigo-400' },
          { icon: Target, label: 'Personalised Matching', desc: 'Considers goals, personality, and lifestyle', color: 'text-amber-400' },
          { icon: Eye, label: 'Evidence-Based', desc: 'Research-backed with scientific studies', color: 'text-indigo-400' },
          { icon: Sunrise, label: '5-Minute Assessment', desc: 'Quick questionnaire for deep results', color: 'text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
            <item.icon className={`${item.color} mb-2`} size={20} />
            <h3 className="text-sm font-semibold text-stone-100 mb-1">{item.label}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Info about intro screens */}
      <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Not sure what meditation styles exist?{' '}
            <button onClick={() => setShowIntroScreens(true)} className="text-indigo-400 hover:text-indigo-300 underline transition-colors">
              Explore the meditation landscape first
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const SectionIcon = SECTION_ICONS[currentSectionIndex] || Eye;
    return (
      <div className="space-y-6">
        {/* Section header */}
        <div className="text-center mb-4">
          <div className="inline-block text-amber-400/60 mb-2">
            <SectionIcon size={40} />
          </div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">{currentSection}</h2>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            {sectionDescriptions[currentSection]}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Section {currentSectionIndex + 1} of {sectionOrder.length}</span>
          <div className="flex gap-1 flex-1">
            {sectionOrder.map((_, i) => (
              <div key={i} className={`h-0.5 flex-1 rounded-full transition-all ${i <= currentSectionIndex ? 'bg-amber-500' : 'bg-stone-800'}`} />
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentQuestions.map(question => (
            <div key={question.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-200 leading-relaxed">{question.text}</h3>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!recommendations) return null;
    const { topRecommendation, alternatives, hybridApproach } = recommendations;
    const clarityDelta = clarityAfter - clarityBefore;

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="inline-block text-amber-400/60 mb-2"><Star size={44} /></div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Practice Map</h2>
          <p className="text-xs font-mono text-amber-500/60 mt-1">
            Clarity: {clarityBefore}% → {clarityAfter}%{' '}
            {clarityDelta > 0 && <span className="text-emerald-400">(+{clarityDelta})</span>}
          </p>
        </div>

        {/* Bookend metric re-measure */}
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-stone-400">Now — how clear are you about what practice suits you?</label>
            <span className="text-xl font-mono font-bold text-amber-400">{clarityAfter}%</span>
          </div>
          <input type="range" min={0} max={100} value={clarityAfter} onChange={e => setClarityAfter(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-800 rounded-full accent-amber-500 cursor-pointer" />
        </div>

        {/* Radar Chart */}
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4 flex flex-col items-center">
          <SectionLabel>Match Profile</SectionLabel>
          <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56">
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <polygon key={r} points={[0, 1, 2, 3].map((i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                return `${100 + Math.cos(angle) * 80 * r},${100 + Math.sin(angle) * 80 * r}`;
              }).join(' ')} fill="none" stroke="#44403c" strokeWidth="0.5" />
            ))}
            {[0, 1, 2, 3].map((i) => {
              const angle = (Math.PI / 2) * i - Math.PI / 2;
              return <line key={i} x1="100" y1="100" x2={100 + Math.cos(angle) * 80} y2={100 + Math.sin(angle) * 80} stroke="#44403c" strokeWidth="0.5" />;
            })}
            <polygon
              points={(() => {
                const values = [
                  topRecommendation.score.breakdown.goalAlignment,
                  topRecommendation.score.breakdown.personalityFit,
                  topRecommendation.score.breakdown.practicalFit,
                  topRecommendation.score.breakdown.culturalAlignment,
                ];
                return values.map((v, i) => {
                  const angle = (Math.PI / 2) * i - Math.PI / 2;
                  return `${100 + Math.cos(angle) * 80 * v},${100 + Math.sin(angle) * 80 * v}`;
                }).join(' ');
              })()}
              fill="rgba(129, 140, 248, 0.12)" stroke="#818cf8" strokeWidth="2"
            />
            {[
              topRecommendation.score.breakdown.goalAlignment,
              topRecommendation.score.breakdown.personalityFit,
              topRecommendation.score.breakdown.practicalFit,
              topRecommendation.score.breakdown.culturalAlignment,
            ].map((v, i) => {
              const angle = (Math.PI / 2) * i - Math.PI / 2;
              return <circle key={i} cx={100 + Math.cos(angle) * 80 * v} cy={100 + Math.sin(angle) * 80 * v} r="3" fill="#818cf8" />;
            })}
            {['Goal', 'Personality', 'Practical', 'Cultural'].map((label, i) => {
              const angle = (Math.PI / 2) * i - Math.PI / 2;
              return (
                <text key={label} x={100 + Math.cos(angle) * 95} y={100 + Math.sin(angle) * 95}
                  textAnchor="middle" dominantBaseline="central" className="text-[9px] fill-stone-500 font-medium">
                  {label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Top Recommendation — Artifact Card */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/15 rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Top Recommendation</p>
            <h3 className="text-xl font-serif font-light text-stone-100">{topRecommendation.practice.name}</h3>
            <p className="text-sm text-stone-300 leading-relaxed mt-2">{topRecommendation.practice.overview.description}</p>
          </div>

          <div className="h-px bg-stone-800" />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Why This Practice</p>
            <p className="text-sm text-stone-300 leading-relaxed">{topRecommendation.why}</p>
          </div>

          <div className="h-px bg-stone-800" />

          {/* Score breakdown */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Goal', value: topRecommendation.score.breakdown.goalAlignment },
              { label: 'Personality', value: topRecommendation.score.breakdown.personalityFit },
              { label: 'Practical', value: topRecommendation.score.breakdown.practicalFit },
              { label: 'Cultural', value: topRecommendation.score.breakdown.culturalAlignment },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-mono font-bold text-amber-400">{Math.round(m.value * 100)}%</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Next steps */}
          {topRecommendation.nextSteps.length > 0 && (
            <>
              <div className="h-px bg-stone-800" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-2">First Steps</p>
                <div className="space-y-2">
                  {topRecommendation.nextSteps.map((step, i) => (
                    <div key={i} className="text-sm text-stone-300 flex items-start gap-2">
                      <span className="text-amber-400 font-mono font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => { setSelectedPractice(topRecommendation.practice); setStep('practice-details'); }}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-900/20"
          >
            View Full Practice Details
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="space-y-3">
            <SectionLabel>Alternative Practices</SectionLabel>
            {alternatives.map((alt, i) => (
              <div key={i} className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-stone-100">{alt.practice.name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">{Math.round(alt.score.overallScore * 100)}%</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{alt.why}</p>
                <button
                  onClick={() => { setSelectedPractice(alt.practice); setStep('practice-details'); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  Explore this practice <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hybrid approach */}
        {hybridApproach && (
          <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/60 mb-2">Hybrid Approach</p>
            <p className="text-sm text-stone-300 leading-relaxed">{hybridApproach.description}</p>
            <p className="text-xs text-stone-500 italic mt-2">{hybridApproach.schedule}</p>
          </div>
        )}

        {/* Insight line */}
        <div className="bg-stone-900/60 border border-stone-700/30 rounded-xl p-4 text-center">
          <p className="text-base font-serif text-amber-300">"The practice that finds you is the one that meets resistance with curiosity."</p>
        </div>

        {/* Meta-awareness footnote */}
        <div className="text-center py-2">
          <p className="text-xs text-stone-600 italic">"Recommending the 'right' practice is itself a practice in being wrong gracefully."</p>
        </div>

        {/* Retry */}
        <div className="text-center">
          <button
            onClick={() => { setStep('welcome'); setCurrentSectionIndex(0); setAnswers({}); setRecommendations(null); setClarityBefore(50); setClarityAfter(50); }}
            className="text-xs text-stone-500 hover:text-amber-400 underline transition-colors"
          >
            Start over with new assessment
          </button>
        </div>
      </div>
    );
  };

  const renderPracticeDetails = () => {
    if (!selectedPractice) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="inline-block text-amber-400/60 mb-2"><BookOpen size={40} /></div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">{selectedPractice.name}</h2>
          <p className="text-xs text-stone-500">{selectedPractice.tradition}</p>
        </div>

        {/* Overview */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/15 rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Overview</p>
            <p className="text-sm text-stone-300 leading-relaxed">{selectedPractice.overview.description}</p>
          </div>
          <div className="h-px bg-stone-800" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Philosophy</p>
            <p className="text-sm text-stone-300 leading-relaxed">{selectedPractice.overview.philosophy}</p>
          </div>
        </div>

        {/* Goals */}
        <div>
          <SectionLabel>Goals</SectionLabel>
          <div className="space-y-2">
            {selectedPractice.overview.goals.map((goal, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-stone-300">
                <Target size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <SectionLabel>How to Practice</SectionLabel>
          <p className="text-sm text-stone-400 mb-3 leading-relaxed">{selectedPractice.practice.coreTechnique}</p>
          <div className="space-y-2">
            {selectedPractice.practice.instructions.map((instruction, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-stone-300">
                <span className="bg-amber-500/15 text-amber-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold">{i + 1}</span>
                <span className="leading-relaxed">{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Research Benefits */}
        <div>
          <SectionLabel>Research-Backed Benefits</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { label: 'Cognitive', data: selectedPractice.research.benefits.cognitive, color: 'indigo' },
              { label: 'Emotional', data: selectedPractice.research.benefits.emotional, color: 'amber' },
              { label: 'Physical', data: selectedPractice.research.benefits.physical, color: 'indigo' },
            ] as const).map((cat, i) => (
              <div key={i} className={`bg-stone-900/40 border border-stone-700/30 rounded-xl p-3`}>
                <h4 className={`text-xs font-semibold mb-2 ${cat.color === 'indigo' ? 'text-indigo-400' : 'text-amber-400'}`}>{cat.label}</h4>
                <ul className="space-y-1">
                  {cat.data.map((benefit, j) => (
                    <li key={j} className="text-xs text-stone-400 leading-relaxed">• {benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Books */}
        <div>
          <SectionLabel>Recommended Reading</SectionLabel>
          <div className="space-y-2">
            {selectedPractice.resources.books.slice(0, 3).map((book, i) => (
              <div key={i} className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3">
                <p className="text-sm font-semibold text-stone-200">{book.title}</p>
                <p className="text-xs text-stone-500">by {book.author}</p>
                {book.level && <p className="text-[10px] text-stone-600 mt-0.5">{book.level}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionLabel>Strengths</SectionLabel>
            <ul className="space-y-1">
              {selectedPractice.considerations.pros.map((pro, i) => (
                <li key={i} className="text-xs text-stone-300 flex gap-2"><span className="text-emerald-400 shrink-0">✓</span>{pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>Considerations</SectionLabel>
            <ul className="space-y-1">
              {selectedPractice.considerations.cons.map((con, i) => (
                <li key={i} className="text-xs text-stone-300 flex gap-2"><span className="text-amber-400 shrink-0">◆</span>{con}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Who it's for */}
        <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/60 mb-2">Who Is This For</p>
          <p className="text-sm text-stone-300 leading-relaxed">{selectedPractice.considerations.whoItsFor}</p>
        </div>
      </div>
    );
  };

  // ─── Navigation helpers ──────────────────────────────────────────────────────

  const canAdvance = () => {
    if (step === 'welcome') return true;
    if (step === 'assessment') return isSectionComplete() && !isDataLoading;
    return false;
  };

  const getButtonLabel = () => {
    if (step === 'welcome') return 'Begin Assessment';
    if (step === 'assessment') {
      if (currentSectionIndex === sectionOrder.length - 1) return 'Generate Recommendations';
      return 'Continue';
    }
    if (step === 'results') return 'Close';
    if (step === 'practice-details') return 'Close';
    return 'Continue';
  };

  const handleMainNext = () => {
    if (step === 'welcome') {
      setStep('assessment');
    } else if (step === 'assessment') {
      handleNext();
    } else {
      onClose();
    }
  };

  const handleMainBack = () => {
    if (step === 'assessment' && currentSectionIndex > 0) {
      handleBack();
    } else if (step === 'assessment' && currentSectionIndex === 0) {
      setStep('welcome');
    } else if (step === 'results') {
      // Can't go back from results to assessment logically
    } else if (step === 'practice-details') {
      setStep('results');
    }
  };

  const showBack = () => {
    if (step === 'welcome') return false;
    if (step === 'results') return false;
    return true;
  };

  // ─── Sidebar marginalia ──────────────────────────────────────────────────────

  const renderMarginalia = () => {
    const items: { label: string; value: string }[] = [];
    if (clarityBefore > 0) items.push({ label: 'Clarity (before)', value: `${clarityBefore}%` });
    if (answers['primary-goals']?.length) items.push({ label: 'Goals', value: Array.isArray(answers['primary-goals']) ? answers['primary-goals'].join(', ') : answers['primary-goals'] });
    if (answers['temperament']) items.push({ label: 'Temperament', value: answers['temperament'] });
    if (answers['time-available']) items.push({ label: 'Time', value: answers['time-available'] });
    if (recommendations) {
      items.push({ label: 'Top match', value: recommendations.topRecommendation.practice.name });
      if (clarityAfter !== clarityBefore) items.push({ label: 'Clarity (after)', value: `${clarityAfter}%` });
    }
    if (items.length === 0) return null;

    return (
      <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-2">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">{item.label}</p>
            <p className="text-xs text-amber-400/80 truncate">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {showIntroScreens && (
        <MeditationIntroductionScreens onClose={() => setShowIntroScreens(false)} />
      )}
      <div className="fixed inset-0 z-50 flex items-stretch bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-500/4 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-800/5 blur-[80px] rounded-full" />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-amber-500/70"><Compass size={20} /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Spirit Practice</span>
            </div>
            <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">Meditation<br />Practice Finder</h1>
          </div>

          <StepRail current={getStepIndex()} steps={STEP_META} />
          {renderMarginalia()}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="text-amber-500/60">
                {React.createElement(STEP_META[getStepIndex()].icon, { size: 16 })}
              </div>
              <span className="text-xs text-stone-400 font-serif">{STEP_META[getStepIndex()].label}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-stone-500">Step {getStepIndex() + 1} of {STEP_META.length}</span>
              <div className="flex gap-1">
                {STEP_META.map((_, i) => (
                  <div key={i} className={`h-0.5 w-6 rounded-full transition-all ${i <= getStepIndex() ? 'bg-amber-500' : 'bg-stone-800'}`} />
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-all" aria-label="Close">
              <X size={18} />
            </button>
          </header>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-5 py-8">
              {step === 'welcome' && renderWelcome()}
              {step === 'assessment' && renderAssessment()}
              {step === 'results' && renderResults()}
              {step === 'practice-details' && renderPracticeDetails()}
            </div>
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-stone-800/60 px-5 py-3 flex items-center justify-between bg-stone-950/80">
            <button
              onClick={handleMainBack}
              disabled={!showBack()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step === 'results' || step === 'practice-details' ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-900/30"
              >
                <Save size={16} /> Done
              </button>
            ) : (
              <button
                onClick={handleMainNext}
                disabled={!canAdvance()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
              >
                {getButtonLabel()}
                <ChevronRight size={16} />
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}
