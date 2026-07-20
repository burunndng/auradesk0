import React, { useState, useEffect, useRef } from 'react';
import { CoherenceAuditSession, CoherenceAuditMessage, IntegratedInsight } from '../../types.ts';
import { X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { CelticContinuumIcon, DharmaLotusIcon } from '../../components/visualizations/SacredGeometryIcons';
import * as aiService from '../../services/aiService.ts';
import { supabase } from '../../services/supabaseClient.ts';

interface CoherenceAuditWizardProps {
  onClose: () => void;
  onSave: (session: CoherenceAuditSession) => void;
  draft?: CoherenceAuditSession;
  setDraft?: (s: CoherenceAuditSession) => void;
  userId?: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (id: string, type: string, sessionId: string) => void;
}

const INITIAL_MESSAGE = `What do you most value in life? What matters most to you?`;

export default function CoherenceAuditWizard({
  onClose,
  onSave,
  draft,
  setDraft,
  userId,
  insightContext,
  markInsightAsAddressed,
}: CoherenceAuditWizardProps) {
  const [session, setSession] = useState<CoherenceAuditSession>(
    draft || {
      id: `coherence-audit-${Date.now()}`,
      wizardType: 'Coherence Audit',
      date: new Date().toISOString(),
      userId: userId || '',
      sessionData: {},
      startedAt: new Date(),
      conversation: [{ role: 'bot', text: INITIAL_MESSAGE, timestamp: new Date().toISOString() }],
      espousedValues: [],
      behavioralFindings: [],
      loyaltyObjects: [],
      linkedInsightId: insightContext?.id,
    }
  );

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBehavioralPanel, setShowBehavioralPanel] = useState(false);
  const [aiSuggestsAnalysis, setAiSuggestsAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.conversation]);

  useEffect(() => {
    if (draft) setSession(draft);
  }, [draft]);

  // Auto-save draft whenever session changes
  useEffect(() => {
    if (setDraft) {
      setDraft(session);
    }
  }, [session, setDraft]);

  useEffect(() => {
    if (session.espousedValues.length >= 2 && !session.behavioralFindings.length && userId) {
      fetchBehavioralFindings();
    }
  }, [session.espousedValues, userId]);

  // Count user turns (messages with role 'user')
  const userTurnCount = session.conversation.filter((m) => m.role === 'user').length;

  const addMessage = (role: 'user' | 'bot', text: string) => {
    const message: CoherenceAuditMessage = {
      role,
      text,
      timestamp: new Date().toISOString(),
    };
    setSession((prev) => ({
      ...prev,
      conversation: [...prev.conversation, message],
    }));
  };

  /** Case-insensitive check for value existence */
  const hasValue = (value: string) =>
    session.espousedValues.some((v) => v.toLowerCase() === value.toLowerCase());

  /** Remove a value from the list (user correction) */
  const removeValue = (valueToRemove: string) => {
    setSession((prev) => ({
      ...prev,
      espousedValues: prev.espousedValues.filter((v) => v !== valueToRemove),
    }));
  };

  const fetchBehavioralFindings = async () => {
    if (!userId) return;

    // Guard against anonymous users
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(userId)) {
      setSession((prev) => ({
        ...prev,
        behavioralFindings: ['(Anonymous user: session history not available)'],
      }));
      return;
    }

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('wizard_sessions')
        .select('type, completed_at, created_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Extract behavioral patterns from session types
      const findings: string[] = [];
      const typeCounts: Record<string, number> = {};

      data?.forEach((s) => {
        if (s.type) {
          typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
        }
      });

      Object.entries(typeCounts).forEach(([type, count]) => {
        findings.push(`${count} session(s) in ${type}`);
      });

      if (findings.length === 0) {
        findings.push('Few sessions in the last 30 days — consider what this says about your current commitments');
      }

      setSession((prev) => ({
        ...prev,
        behavioralFindings: findings,
      }));
    } catch (error) {
      console.error('[CoherenceAudit] fetchBehavioralFindings error:', error);
      setSession((prev) => ({
        ...prev,
        behavioralFindings: ['(Unable to load session history)'],
      }));
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage('user', userMessage);
    setInputText('');
    setIsThinking(true);

    try {
      // Truncate conversation context to last 14 messages to prevent prompt bloat
      const recentConversation = session.conversation.slice(-14);
      const conversationContext = recentConversation
        .map((m) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`)
        .join('\n\n');

      const response = await aiService.getCoherenceAuditResponse(
        conversationContext,
        userMessage,
        session.espousedValues,
        session.behavioralFindings,
        userTurnCount + 1 // +1 because addMessage hasn't flushed to state yet
      );

      addMessage('bot', response.message);

      // Extract new values (array now, with case-insensitive dedup)
      if (response.extractedValues && response.extractedValues.length > 0) {
        const newValues = response.extractedValues.filter((v) => v && !hasValue(v));
        if (newValues.length > 0) {
          setSession((prev) => ({
            ...prev,
            espousedValues: [...prev.espousedValues, ...newValues],
          }));
        }
      }

      // Track AI's analysis readiness signal
      if (response.shouldOfferAnalysis) {
        setAiSuggestsAnalysis(true);
      }
    } catch (error) {
      console.error('[CoherenceAudit] handleSend error:', error);
      addMessage('bot', 'I encountered an error. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleAnalyze = async () => {
    if (session.espousedValues.length < 3) {
      addMessage('bot', 'I need at least 3 values from you before I can analyze the coherence. Tell me more about what matters to you.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await aiService.analyzeCoherenceAudit(
        session.espousedValues,
        session.behavioralFindings,
        session.conversation
      );

      const loyaltyObjects = analysis.espousedVsOperativeGaps.map((g) => g.gap).filter((g) => g);

      setSession((prev) => ({
        ...prev,
        coherenceAnalysis: analysis,
        loyaltyObjects,
        completedAt: new Date(),
      }));

      addMessage(
        'bot',
        `Analysis complete. ${analysis.loyaltyReframe} Click "Finish & Save" to save this insight.`
      );
    } catch (error) {
      console.error('[CoherenceAudit] handleAnalyze error:', error);
      addMessage('bot', 'I encountered an error during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinish = () => {
    if (session.linkedInsightId && markInsightAsAddressed) {
      markInsightAsAddressed(session.linkedInsightId, 'Coherence Audit', session.id);
    }
    onSave(session);
  };

  // Analysis is available when:
  // 1. AI has signaled readiness (shouldOfferAnalysis), OR
  // 2. User has enough material (3+ values AND 7+ turns) as a deterministic fallback
  const canAnalyze =
    aiSuggestsAnalysis ||
    (session.espousedValues.length >= 3 && userTurnCount >= 7);
  const isComplete = !!session.coherenceAnalysis;

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 animate-in fade-in duration-300">
      <div className="bg-stone-950 rounded-2xl border border-stone-800 w-full max-w-2xl h-[85dvh] flex flex-col shadow-2xl relative overflow-hidden">

        {/* Subtle ambient glow top/left */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800/80 bg-stone-950/80 z-10">
          <div>
            <h1 className="text-xl font-medium font-serif text-stone-100 flex items-center gap-3">
              <CelticContinuumIcon size={24} color="rgb(217, 119, 6)" />
              <span className="tracking-wide">Coherence Audit</span>
            </h1>
            <p className="text-[10px] font-mono text-stone-500 mt-1.5 uppercase tracking-widest flex items-center gap-2">
              <span>Values Extract: {session.espousedValues.length}</span>
              {canAnalyze && !isComplete && (
                <>
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-amber-500/80">Threshold Met</span>
                </>
              )}
              {isComplete && (
                <>
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                  <span className="text-emerald-500/80">Synthesis Complete</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-full transition text-stone-400 hover:text-stone-200"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Values Pills — with remove buttons */}
        {session.espousedValues.length > 0 && (
          <div className="px-6 pt-4 pb-3 bg-stone-900/40 border-b border-stone-800/80 flex flex-wrap gap-2 relative z-10">
            {session.espousedValues.map((value, idx) => (
              <div
                key={idx}
                className="bg-stone-900 border border-stone-700/60 rounded-full pl-3 pr-2 py-1 text-[11px] font-mono text-amber-500/90 flex items-center gap-1.5 group shadow-sm"
              >
                <span>{value}</span>
                {!isComplete && (
                  <button
                    onClick={() => removeValue(value)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-500 hover:text-amber-400 p-0.5 rounded-full hover:bg-stone-800"
                    title="Remove this value"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Behavioral Findings Collapsible */}
        {session.behavioralFindings.length > 0 && (
          <div className="px-6 py-2.5 bg-stone-900/20 border-b border-stone-800/80 relative z-10">
            <button
              onClick={() => setShowBehavioralPanel(!showBehavioralPanel)}
              className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-stone-500 hover:text-stone-300 transition uppercase"
            >
              {showBehavioralPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Behavioral Signal ({session.behavioralFindings.length})
            </button>
            {showBehavioralPanel && (
              <div className="mt-3 space-y-1.5 text-xs text-stone-400 font-mono tracking-tight pb-1">
                {session.behavioralFindings.map((finding, idx) => (
                  <p key={idx} className="flex gap-2"><span className="text-stone-600">›</span> {finding}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div
          ref={chatMessagesRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-sm relative z-10 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent"
        >
          {session.conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user'
                    ? 'px-5 py-3.5 rounded-2xl bg-stone-800/80 text-stone-200 border border-stone-700/50 rounded-tr-sm'
                    : 'bg-transparent text-stone-300 border-l-2 border-amber-600/40 rounded-none py-1 px-4 leading-relaxed font-serif text-[15px]'
                  }`}
              >
                {msg.text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start animate-in fade-in duration-500">
              <div className="bg-transparent text-stone-500 border-l-2 border-stone-800 rounded-none py-1 px-4 text-xs italic flex items-center gap-3 font-serif">
                <span className="inline-flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </span>
                Sensing...
              </div>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-transparent text-amber-500/60 border-l-2 border-amber-500/30 rounded-none py-1 px-4 text-sm font-serif italic">
                Synthesizing gaps and shadow elements...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Analysis Results */}
        {isComplete && session.coherenceAnalysis && (
          <div className="px-6 py-5 border-t border-amber-900/30 bg-stone-900/60 space-y-5 max-h-[35vh] overflow-y-auto text-sm text-stone-300 relative z-10 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
              <DharmaLotusIcon size={18} color="rgb(217, 119, 6)" />
              <p className="font-serif text-lg text-amber-50 tracking-wide">Synthesis Report</p>
            </div>

            {/* Gaps */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Espoused vs. Operative</p>
              <div className="space-y-2">
                {session.coherenceAnalysis.espousedVsOperativeGaps.map((gap, idx) => (
                  <div key={idx} className="bg-stone-950/50 border border-stone-800/80 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-amber-500/90 font-mono text-xs uppercase tracking-wider shrink-0 w-24">"{gap.value}"</span>
                    <span className="text-stone-600 hidden sm:inline">|</span>
                    <span className="text-stone-300 text-xs sm:text-sm">{gap.evidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadow Work */}
            {session.coherenceAnalysis.shadowWork && (
              <div className="pt-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">Shadow Material</p>
                <div className="border-l-2 border-purple-900/40 pl-4 py-1">
                  <p className="text-stone-300 font-serif leading-relaxed">{session.coherenceAnalysis.shadowWork}</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {session.coherenceAnalysis.recommendations && session.coherenceAnalysis.recommendations.length > 0 && (
              <div className="pt-2 pb-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-3">Recommended Formats</p>
                <div className="grid gap-2">
                  {session.coherenceAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 bg-stone-900/40 p-3 rounded-lg border border-stone-800/50">
                      <span className="text-amber-600/60 font-mono shrink-0">0{idx + 1}</span>
                      <p className="text-stone-300 text-xs leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-stone-800/80 bg-stone-950/90 relative z-10 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isThinking) handleSend();
              }}
              placeholder="Reflect on your values..."
              className="flex-1 px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm font-serif text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/50 transition-all shadow-inner"
              disabled={isThinking || isAnalyzing}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isThinking || isAnalyzing}
              className="px-5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-900 disabled:text-stone-700 disabled:cursor-not-allowed text-stone-300 rounded-xl transition-all shadow-sm flex items-center justify-center border border-stone-700/50 disabled:border-stone-800"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between items-center h-9">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-300 hover:bg-stone-900 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              {canAnalyze && !isComplete && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isThinking}
                  className="px-5 py-2 hover:bg-stone-800 bg-stone-900 disabled:bg-stone-900 text-amber-500/90 text-[10px] font-mono tracking-widest uppercase rounded-lg border border-amber-900/30 transition-all hover:border-amber-600/50"
                >
                  {isAnalyzing ? 'Synthesizing...' : 'Distill Insights'}
                </button>
              )}
              {isComplete && (
                <button
                  onClick={handleFinish}
                  className="px-5 py-2 bg-amber-600/90 hover:bg-amber-600 text-stone-950 font-bold text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all"
                >
                  Integrate & Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
