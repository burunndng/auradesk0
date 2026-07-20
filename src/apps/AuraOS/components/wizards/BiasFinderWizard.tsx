/**
 * Bias Finder Wizard - Chatbot interface for cognitive bias detection
 * Implements a 5-phase protocol with visual state management
 */

import React, { useState, useEffect, useRef } from 'react';
import { BiasFinderSession, BiasFinderPhase, BiasFinderParameters, BiasHypothesis, BiasFinderMessage, BiasFinderDiagnosticReport, IntegratedInsight } from '../../types.ts';
import { X, ArrowLeft, Download, BrainCircuit, CheckCircle, Circle, BookOpen } from 'lucide-react';
import {
  generateOnboardingMessage,
  processTargetDecision,
  generateParameterRequest,
  generateHypotheses,
  generateSocraticQuestions,
  generateDiagnostic,
  generateFinalReport,
  generateBiasFinderResponseStream,
  generateHypothesesStreaming,
  generateSocraticQuestionsStreaming,
  generateDiagnosticStreaming
} from '../../services/biasFinderService';
import { getBiasById } from '../../data/biasLibrary';
import BiasFinderAudioPlayer from '../shared/BiasFinderAudioPlayer';
import BiasPracticeSessionGenerator from '../shared/BiasPracticeSessionGenerator';

interface BiasFinderWizardProps {
  onClose: () => void;
  onSave: (session: BiasFinderSession) => void;
  session: BiasFinderSession | null;
  setDraft: (session: BiasFinderSession | null) => void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const PHASE_LABELS: Record<BiasFinderPhase, string> = {
  ONBOARDING: 'Target Selection',
  PARAMETERS: 'Context',
  HYPOTHESIS: 'Hypothesis',
  INTERROGATION: 'Investigation',
  DIAGNOSTIC: 'Diagnosis',
  REPORT: 'Report'
};

const PHASES: BiasFinderPhase[] = ['ONBOARDING', 'PARAMETERS', 'HYPOTHESIS', 'INTERROGATION', 'DIAGNOSTIC', 'REPORT'];

export default function BiasFinderWizard({ onClose, onSave, session: draft, setDraft, insightContext, markInsightAsAddressed }: BiasFinderWizardProps) {
  const [currentPhase, setCurrentPhase] = useState<BiasFinderPhase>(draft?.currentPhase || 'ONBOARDING');
  const [targetDecision, setTargetDecision] = useState(draft?.targetDecision || '');
  const [parameters, setParameters] = useState<BiasFinderParameters | undefined>(draft?.parameters);
  const [hypotheses, setHypotheses] = useState<BiasHypothesis[]>(draft?.hypotheses || []);
  const [currentHypothesisIndex, setCurrentHypothesisIndex] = useState(draft?.currentHypothesisIndex ?? -1);
  const [messages, setMessages] = useState<BiasFinderMessage[]>(draft?.messages || []);
  const [diagnosticReport, setDiagnosticReport] = useState<BiasFinderDiagnosticReport | undefined>(draft?.diagnosticReport);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [questionCount, setQuestionCount] = useState(0); // Track questions in interrogation
  const [showPracticeGenerator, setShowPracticeGenerator] = useState(false); // Practice session modal
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(draft?.linkedInsightId || insightContext?.id);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Focus input on mount and when phase changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPhase]);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext]);

  // Initialize with onboarding message
  useEffect(() => {
    if (messages.length === 0 && !draft) {
      initializeSession();
    }
  }, []);

  const initializeSession = async () => {
    setIsLoading(true);
    try {
      const onboardingMsg = await generateOnboardingMessage();
      addMessage('assistant', onboardingMsg, 'ONBOARDING');
    } catch (error) {
      console.error('Error initializing session:', error);
      addMessage('system', 'Error initializing Bias Finder. Please try again.', 'ONBOARDING');
    }
    setIsLoading(false);
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, phase: BiasFinderPhase) => {
    const newMessage: BiasFinderMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      phase,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const saveDraft = () => {
    const session: BiasFinderSession = {
      id: draft?.id || `biasfinder-${Date.now()}`,
      date: draft?.date || new Date().toISOString(),
      currentPhase,
      targetDecision,
      parameters,
      hypotheses,
      currentHypothesisIndex,
      messages,
      diagnosticReport,
      linkedInsightId, // Intelligence Hub integration
    };
    setDraft(session);
  };

  // Auto-save draft on changes
  useEffect(() => {
    if (messages.length > 0) {
      saveDraft();
    }
  }, [currentPhase, targetDecision, parameters, hypotheses, currentHypothesisIndex, messages, diagnosticReport]);

  /**
   * Helper function to consume async generators and display streaming text
   * Properly captures both yielded values and the return value of the generator
   */
  const consumeStreaming = async <T extends string,>(
    generator: AsyncGenerator<string, T, unknown>,
    onChunk: (chunk: string) => void,
    onComplete: (result: T) => void
  ): Promise<void> => {
    let result: IteratorResult<string, T>;

    // Manually iterate to capture both yielded values and return value
    result = await generator.next();
    while (!result.done) {
      if (result.value) {
        onChunk(result.value);
      }
      result = await generator.next();
    }

    // When done === true, result.value contains the generator's return value
    if (result.value) {
      onComplete(result.value);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    addMessage('user', userMessage, currentPhase);
    setIsLoading(true);

    try {
      // Route to appropriate handler based on current phase
      switch (currentPhase) {
        case 'ONBOARDING':
          await handleOnboardingInput(userMessage);
          break;
        case 'PARAMETERS':
          await handleParametersInput(userMessage);
          break;
        case 'HYPOTHESIS':
          await handleHypothesisSelection(userMessage);
          break;
        case 'INTERROGATION':
          await handleInterrogationInput(userMessage);
          break;
        case 'DIAGNOSTIC':
          await handleDiagnosticInput(userMessage);
          break;
        default:
          addMessage('system', 'Invalid phase', currentPhase);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('system', 'An error occurred. Please try again.', currentPhase);
    }

    setIsLoading(false);
  };

  const handleOnboardingInput = async (userMessage: string) => {
    // User provided their target decision
    setTargetDecision(userMessage);
    const confirmation = await processTargetDecision(userMessage);
    addMessage('assistant', confirmation, 'ONBOARDING');

    // Move to parameters phase
    setTimeout(async () => {
      setCurrentPhase('PARAMETERS');
      const paramRequest = await generateParameterRequest();
      addMessage('assistant', paramRequest, 'PARAMETERS');
    }, 500);
  };

  const handleParametersSubmit = async (params: BiasFinderParameters) => {
    setParameters(params);
    setIsLoading(true);
    setStreamingMessage('');

    const userMessage = `Stakes: ${params.stakes}, Time Pressure: ${params.timePressure}, Emotional State: ${params.emotionalState}${params.decisionType ? `, Decision Type: ${params.decisionType}` : ''}${params.context ? `, Context: ${params.context}` : ''}`;
    addMessage('user', userMessage, 'PARAMETERS');

    try {
      // Generate hypotheses with streaming
      const generator = generateHypothesesStreaming(targetDecision, params);

      await consumeStreaming(
        // @ts-ignore - complex generator type mismatch
        generator,
        (chunk) => setStreamingMessage(prev => prev + chunk),
        // @ts-ignore - complex generator type mismatch
        ({ message, hypotheses: newHypotheses }) => {
          if (!newHypotheses || newHypotheses.length === 0) {
            throw new Error('No biases identified for this decision. This might be a temporary issue.');
          }

          setHypotheses(newHypotheses);
          setCurrentPhase('HYPOTHESIS');
          addMessage('assistant', message, 'HYPOTHESIS');
          setStreamingMessage('');
        }
      );
    } catch (error) {
      console.error('Error generating hypotheses:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while analyzing your parameters. Please try again.';
      addMessage('system', `I encountered an issue: ${errorMessage}. Would you like to try again with different parameters?`, 'PARAMETERS');
      setParameters(undefined); // Reset parameters so form stays visible
      setStreamingMessage('');
    }

    setIsLoading(false);
  };

  const handleParametersInput = async (userMessage: string) => {
    // This shouldn't be used - parameters are submitted via form
    addMessage('assistant', 'Please use the form above to submit your parameters.', 'PARAMETERS');
  };

  const handleHypothesisSelection = async (userMessage: string) => {
    // Parse user's selection (could be "1", "first", bias name, etc.)
    const lowerInput = userMessage.toLowerCase();
    let selectedIndex = -1;

    // Try to match by number
    const numberMatch = userMessage.match(/\d+/);
    if (numberMatch) {
      selectedIndex = parseInt(numberMatch[0]) - 1;
    }
    // Try to match by bias name
    else {
      selectedIndex = hypotheses.findIndex(h =>
        h.biasName.toLowerCase().includes(lowerInput) ||
        lowerInput.includes(h.biasName.toLowerCase())
      );
    }

    if (selectedIndex >= 0 && selectedIndex < hypotheses.length) {
      setCurrentHypothesisIndex(selectedIndex);
      setCurrentPhase('INTERROGATION');
      setQuestionCount(0);
      setIsLoading(true);
      setStreamingMessage('');

      try {
        const selectedBias = hypotheses[selectedIndex];
        const generator = generateSocraticQuestionsStreaming(
          targetDecision,
          parameters!,
          selectedBias.biasId,
          messages
        );

        await consumeStreaming(
          generator,
          (chunk) => setStreamingMessage(prev => prev + chunk),
          (questions) => {
            addMessage('assistant', questions, 'INTERROGATION');
            setStreamingMessage('');
          }
        );
      } catch (error) {
        console.error('Error generating Socratic questions:', error);
        const errorMsg = error instanceof Error ? error.message : 'An error occurred';
        addMessage('system', `I had trouble generating questions for this bias: ${errorMsg}. Would you like to try another bias?`, 'HYPOTHESIS');
        setCurrentPhase('HYPOTHESIS');
        setStreamingMessage('');
      }

      setIsLoading(false);
    } else {
      addMessage('assistant', 'I didn\'t understand your selection. Please specify the number or name of the bias you\'d like to investigate.', 'HYPOTHESIS');
    }
  };

  const handleInterrogationInput = async (userMessage: string) => {
    // Store user's answer as evidence
    const currentHypothesis = hypotheses[currentHypothesisIndex];
    if (currentHypothesis) {
      currentHypothesis.evidence = currentHypothesis.evidence || [];
      currentHypothesis.evidence.push(userMessage);
    }

    setQuestionCount(prev => prev + 1);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // After 3-5 questions, move to diagnostic
      if (questionCount >= 3) {
        setCurrentPhase('DIAGNOSTIC');
        const generator = generateDiagnosticStreaming(
          targetDecision,
          parameters!,
          currentHypothesis.biasId,
          currentHypothesis.evidence || []
        );

        await consumeStreaming(
          // @ts-ignore - complex generator type mismatch
          generator,
          (chunk) => setStreamingMessage(prev => prev + chunk),
          // @ts-ignore - complex generator type mismatch
          ({ conclusion, confidence }) => {
            if (conclusion) {
              const updatedHypotheses = [...hypotheses];
              updatedHypotheses[currentHypothesisIndex].confidence = confidence;
              updatedHypotheses[currentHypothesisIndex].evidence = [...(updatedHypotheses[currentHypothesisIndex].evidence || []), `CONCLUSION: ${conclusion}`];
              setHypotheses(updatedHypotheses);

              addMessage('assistant', conclusion, 'INTERROGATION');
              setStreamingMessage('');

              // Move to diagnostic phase
              setTimeout(() => {
                setCurrentPhase('DIAGNOSTIC');
                addMessage('assistant', "Based on our investigation, does this analysis of the bias seem accurate to you? (Yes/No/Partially)", 'DIAGNOSTIC');
              }, 1000);
            }
          }
        );
      } else {
        // Ask next question with streaming
        const generator = generateSocraticQuestionsStreaming(
          targetDecision,
          parameters!,
          currentHypothesis.biasId,
          [...messages, { id: 'temp', role: 'user', content: userMessage, phase: 'INTERROGATION', timestamp: new Date().toISOString() }]
        );

        await consumeStreaming(
          generator,
          (chunk) => setStreamingMessage(prev => prev + chunk),
          (nextQuestions) => {
            addMessage('assistant', nextQuestions, 'INTERROGATION');
            setStreamingMessage('');
          }
        );
      }
    } catch (error) {
      console.error('Error during interrogation:', error);
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while processing your response';
      addMessage('system', `I encountered a temporary issue: ${errorMsg}. Let's try the next question.`, 'INTERROGATION');
      setStreamingMessage('');
    }

    setIsLoading(false);
  };

  const handleDiagnosticInput = async (userMessage: string) => {
    const lowerInput = userMessage.toLowerCase();

    // Check for concurrence
    if (lowerInput.includes('yes') || lowerInput.includes('agree') || lowerInput.includes('correct')) {
      hypotheses[currentHypothesisIndex].userConcurrence = true;
    } else if (lowerInput.includes('no') || lowerInput.includes('disagree')) {
      hypotheses[currentHypothesisIndex].userConcurrence = false;
    }

    setHypotheses([...hypotheses]);

    // Check if user wants to investigate another bias
    if (lowerInput.includes('another') || lowerInput.includes('next') || lowerInput.includes('more')) {
      setCurrentPhase('HYPOTHESIS');
      addMessage('assistant', 'Which bias would you like to investigate next?', 'HYPOTHESIS');
    } else if (lowerInput.includes('done') || lowerInput.includes('finish') || lowerInput.includes('complete') || lowerInput.includes('conclude')) {
      // Generate final report
      setCurrentPhase('REPORT');
      setIsLoading(true);
      try {
        const report = await generateFinalReport(targetDecision, parameters!, hypotheses);
        setDiagnosticReport(report);
        addMessage('assistant', 'Diagnostic protocol complete. Your report is ready.', 'REPORT');
      } catch (error) {
        console.error('Error generating final report:', error);
        const errorMsg = error instanceof Error ? error.message : 'An error occurred while generating your report';
        addMessage('system', `I encountered an issue generating your report: ${errorMsg}. Your data has been saved. Please try again or download what we have so far.`, 'REPORT');
        // Keep report phase but show error
      }
      setIsLoading(false);
    } else {
      addMessage('assistant', 'Would you like to investigate another bias, or are we done? (Type "another" or "done")', 'DIAGNOSTIC');
    }
  };

  const handleFinalize = () => {
    const session: BiasFinderSession = {
      id: draft?.id || `biasfinder-${Date.now()}`,
      date: draft?.date || new Date().toISOString(),
      currentPhase: 'REPORT',
      targetDecision,
      parameters: parameters!,
      hypotheses,
      currentHypothesisIndex,
      messages,
      diagnosticReport,
      linkedInsightId, // Intelligence Hub integration
      completedAt: new Date().toISOString()
    };
    onSave(session);

    // Mark Intelligence Hub insight as addressed
    if (linkedInsightId) {
      markInsightAsAddressed(linkedInsightId, 'Bias Finder', session.id);
    }

    setDraft(null);
    onClose();
  };

  const handleDownloadReport = () => {
    if (!diagnosticReport) return;

    const reportText = `BIAS FINDER DIAGNOSTIC REPORT
Generated: ${new Date(diagnosticReport.generatedAt).toLocaleString()}

DECISION ANALYZED:
${diagnosticReport.decisionAnalyzed}

PARAMETERS:
- Stakes: ${diagnosticReport.parameters.stakes}
- Time Pressure: ${diagnosticReport.parameters.timePressure}
- Emotional State: ${diagnosticReport.parameters.emotionalState}

BIASES INVESTIGATED:
${diagnosticReport.biasesInvestigated.map((b, i) => `
${i + 1}. ${b.biasName}
   Confidence: ${b.confidence}%
   User Concurrence: ${b.userConcurrence ? 'Yes' : 'No'}
   Key Findings:
   ${b.keyFindings.map(f => `   - ${f}`).join('\n')}
`).join('\n')}

RECOMMENDATIONS:
${diagnosticReport.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

NEXT TIME CHECKLIST:
${diagnosticReport.nextTimeChecklist.map((item, i) => `[ ] ${item}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bias-finder-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl w-full max-w-6xl h-[95dvh] sm:h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrainCircuit className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Bias Finder</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Phase Progress Bar */}
          <div className="flex items-center justify-between">
            {PHASES.map((phase, index) => {
              const isComplete = PHASES.indexOf(currentPhase) > index;
              const isCurrent = currentPhase === phase;

              return (
                <React.Fragment key={phase}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-purple-600 text-white' :
                      isCurrent ? 'bg-purple-200 text-purple-700 border-2 border-purple-600' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isComplete ? <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5" /> : <Circle className="w-3 h-3 sm:w-5 sm:h-5" />}
                    </div>
                    <span className={`text-[9px] sm:text-xs mt-1 text-center ${isCurrent ? 'font-bold text-purple-700' : 'text-gray-500'}`}>
                      {PHASE_LABELS[phase]}
                    </span>
                  </div>
                  {index < PHASES.length - 1 && (
                    <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${isComplete ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
          {insightContext && (
            <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-teal-800">
                <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${msg.role === 'user' ? 'max-w-[85%] sm:max-w-[70%]' : 'max-w-[90%] sm:max-w-[85%]'} rounded-lg p-3 sm:p-5 ${
                msg.role === 'user' ? 'bg-purple-600 text-white' :
                msg.role === 'assistant' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' :
                'bg-yellow-50 text-yellow-900 border border-yellow-200'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="text-[10px] sm:text-xs font-semibold mb-2 text-purple-600">Bias Finder</div>
                )}
                <div className="whitespace-pre-wrap text-xs sm:text-base leading-relaxed break-words">{msg.content}</div>
                <div className="text-[10px] sm:text-xs mt-2 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[90%] sm:max-w-[85%] rounded-lg p-3 sm:p-5 bg-white text-gray-900 shadow-sm border border-gray-200">
                <div className="text-[10px] sm:text-xs font-semibold mb-2 text-purple-600">Bias Finder</div>
                <div className="whitespace-pre-wrap text-xs sm:text-base leading-relaxed break-words">{streamingMessage}</div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-600"></div>
                  <span className="text-gray-700 text-xs sm:text-base">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Parameter Form (shown in PARAMETERS phase) */}
        {currentPhase === 'PARAMETERS' && !parameters && (
          <div className="border-t border-gray-200 p-3 sm:p-6 bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Decision Parameters</h3>

            {/* Error message display */}
            {userInput && userInput.startsWith('ERROR:') && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs sm:text-sm">
                {userInput.replace('ERROR:', '').trim()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Stakes <span className="text-red-500">*</span></label>
                <select
                  id="stakes-select"
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Select...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Time Pressure <span className="text-red-500">*</span></label>
                <select
                  id="time-select"
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Select...</option>
                  <option value="Ample">Ample</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Rushed">Rushed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Emotional State <span className="text-red-500">*</span></label>
                <input
                  id="emotion-input"
                  type="text"
                  placeholder="e.g., Calm, Anxious, Excited..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Decision Type <span className="text-gray-500">(optional)</span></label>
                <select
                  id="decision-type-select"
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm"
                  defaultValue=""
                >
                  <option value="">Not specified</option>
                  <option value="hiring">Hiring</option>
                  <option value="financial">Financial</option>
                  <option value="strategic">Strategic/Planning</option>
                  <option value="interpersonal">Interpersonal</option>
                  <option value="evaluation">Evaluation/Review</option>
                  <option value="technical">Technical/Data</option>
                  <option value="belief">Belief/Opinion</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Additional Context <span className="text-gray-500">(optional)</span></label>
              <textarea
                id="context-input"
                placeholder="e.g., group decision, involves team, time-sensitive, involves money, performance review..."
                className="w-full border border-gray-300 rounded-lg p-2 h-16 sm:h-20 resize-none text-xs sm:text-sm"
              />
            </div>

            <button
              onClick={() => {
                const stakes = (document.getElementById('stakes-select') as HTMLSelectElement).value.trim() as 'Low' | 'Medium' | 'High';
                const timePressure = (document.getElementById('time-select') as HTMLSelectElement).value.trim() as 'Ample' | 'Moderate' | 'Rushed';
                const emotionalState = (document.getElementById('emotion-input') as HTMLInputElement).value.trim();
                const decisionType = (document.getElementById('decision-type-select') as HTMLSelectElement).value.trim() as any;
                const context = (document.getElementById('context-input') as HTMLTextAreaElement).value.trim();

                // Validation
                const errors: string[] = [];
                if (!stakes) errors.push('Please select stakes level');
                if (!timePressure) errors.push('Please select time pressure');
                if (!emotionalState) errors.push('Please describe your emotional state');
                if (emotionalState && emotionalState.length < 3) errors.push('Emotional state should be at least 3 characters');

                if (errors.length > 0) {
                  setUserInput('ERROR: ' + errors.join('. '));
                  return;
                }

                setUserInput(''); // Clear error
                handleParametersSubmit({
                  stakes,
                  timePressure,
                  emotionalState,
                  decisionType: decisionType || undefined,
                  context: context || undefined
                });
              }}
              className="w-full bg-purple-600 text-white rounded-lg p-2.5 sm:p-3 font-semibold hover:bg-purple-700 text-xs sm:text-sm"
            >
              Submit Parameters
            </button>
          </div>
        )}

        {/* Hypothesis Selection (shown in HYPOTHESIS phase) */}
        {currentPhase === 'HYPOTHESIS' && hypotheses.length > 0 && (
          <div className="border-t border-gray-200 p-3 sm:p-6 bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Select Bias to Investigate</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {hypotheses.map((h, index) => (
                <button
                  key={h.biasId}
                  onClick={() => handleHypothesisSelection((index + 1).toString())}
                  className="p-2.5 sm:p-3 border border-purple-300 rounded-lg hover:bg-purple-50 text-left"
                >
                  <div className="font-semibold text-purple-700 text-xs sm:text-sm">{index + 1}. {h.biasName}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 mt-1 break-words">
                    {getBiasById(h.biasId)?.definition.substring(0, 80)}...
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Report Display */}
        {currentPhase === 'REPORT' && diagnosticReport && (
          <div className="border-t border-gray-200 p-3 sm:p-6 bg-gray-50 overflow-y-auto max-h-96">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-xl font-bold text-gray-800">Diagnostic Report</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowPracticeGenerator(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm"
                  title="Generate a guided practice session based on identified biases"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  Practice
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">Decision Analyzed:</h4>
                <p className="text-gray-600 text-xs sm:text-sm break-words">{diagnosticReport.decisionAnalyzed}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">Biases Identified:</h4>
                {diagnosticReport.biasesInvestigated.map((bias, i) => (
                  <div key={i} className="bg-white p-2.5 sm:p-3 rounded-lg mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm min-w-0 break-words">{bias.biasName}</span>
                      <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                        {bias.confidence}%
                      </span>
                    </div>
                    {bias.userConcurrence && (
                      <div className="text-[10px] sm:text-xs text-green-600 mt-1">User confirmed</div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">Recommendations:</h4>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  {diagnosticReport.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs sm:text-sm break-words">{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">Next Time Checklist:</h4>
                <ul className="space-y-1 mt-2">
                  {diagnosticReport.nextTimeChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="rounded mt-0.5" />
                      <span className="text-gray-600 text-xs sm:text-sm break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full mt-4 sm:mt-6 bg-purple-600 text-white rounded-lg p-2.5 sm:p-3 font-semibold hover:bg-purple-700 text-xs sm:text-sm"
            >
              Save to History
            </button>
          </div>
        )}

        {/* Input Area */}
        {currentPhase !== 'PARAMETERS' && currentPhase !== 'REPORT' && (
          <div className="border-t border-gray-200 p-3 sm:p-6 bg-white">
            <div className="flex gap-2 sm:gap-3">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your response..."
                className="flex-1 border-2 border-gray-300 rounded-lg p-2 sm:p-3 resize-none text-gray-900 text-xs sm:text-base focus:border-purple-500 focus:outline-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Send
              </button>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        {currentPhase !== 'REPORT' && (
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex justify-between">
            <button
              onClick={() => { saveDraft(); onClose(); }}
              className="text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm"
            >
              Save Draft & Exit
            </button>
          </div>
        )}
      </div>

      {/* Practice Session Generator Modal */}
      {parameters && hypotheses.length > 0 && (
        <BiasPracticeSessionGenerator
          isOpen={showPracticeGenerator}
          onClose={() => setShowPracticeGenerator(false)}
          decision={targetDecision}
          parameters={parameters}
          identifiedBiases={hypotheses}
        />
      )}
    </div>
  );
}
