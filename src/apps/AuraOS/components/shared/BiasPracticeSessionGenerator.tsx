import React, { useState } from 'react';
import { X, Sparkles, Play, Pause, RotateCcw, Download, Clock, BookOpen, AlertCircle, Loader } from 'lucide-react';
import { BiasFinderParameters, BiasHypothesis } from '../../types';
import { generateBiasPracticeSession, generateAudioForBiasFinder } from '../../services/biasFinderService';
import BiasFinderAudioPlayer from '../shared/BiasFinderAudioPlayer';

interface BiasPracticeSessionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  decision: string;
  parameters: BiasFinderParameters;
  identifiedBiases: BiasHypothesis[];
}

interface GeneratedPractice {
  id: string;
  title: string;
  script: string;
  audioBase64: string;
  duration: number;
  approach: string;
  biasesAddressed: string[];
  createdAt: string;
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createWavBlob(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < dataSize; i++) {
    view.setUint8(44 + i, pcmData[i]);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export default function BiasPracticeSessionGenerator({
  isOpen,
  onClose,
  decision,
  parameters,
  identifiedBiases,
}: BiasPracticeSessionGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPractice, setGeneratedPractice] = useState<GeneratedPractice | null>(null);
  const [therapeuticApproach, setTherapeuticApproach] = useState<'act' | 'dbt' | 'mixed'>('mixed');
  const [showScript, setShowScript] = useState(false);

  const generatePractice = async () => {
    if (identifiedBiases.length === 0) {
      setError('No biases identified yet. Please complete the analysis first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate the practice script
      const session = await generateBiasPracticeSession(
        decision,
        parameters,
        identifiedBiases,
        therapeuticApproach
      );

      // Generate audio for the script
      const audioBase64 = await generateAudioForBiasFinder(session.script);

      const practice: GeneratedPractice = {
        id: `practice-${Date.now()}`,
        title: session.title,
        script: session.script,
        audioBase64,
        duration: session.duration,
        approach: session.approach,
        biasesAddressed: session.biasesAddressed,
        createdAt: new Date().toISOString(),
      };

      setGeneratedPractice(practice);
      setError('');
    } catch (err) {
      console.error('Error generating practice session:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate practice session');
      setGeneratedPractice(null);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAudio = () => {
    if (!generatedPractice || !generatedPractice.audioBase64) {
      setError('Audio data is not available');
      return;
    }

    try {
      const audioData = decode(generatedPractice.audioBase64);
      const blob = createWavBlob(audioData, 24000, 1, 16);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedPractice.title.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download audio');
      console.error('Download error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-800/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950/60 to-purple-900/40 text-white p-6 flex items-center justify-between sticky top-0 z-10 border-b border-purple-800/30">
          <div className="flex items-center gap-3">
            <BookOpen size={24} />
            <div>
              <h2 className="text-xl font-bold">Practice Session</h2>
              <p className="text-sm text-purple-300">Guided therapeutic exercise</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-purple-800/30 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Therapeutic Approach Selection */}
          {!generatedPractice && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                Therapeutic Approach
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['act', 'dbt', 'mixed'] as const).map((approach) => (
                  <button
                    key={approach}
                    onClick={() => setTherapeuticApproach(approach)}
                    className={`p-3 rounded-lg transition ${therapeuticApproach === approach
                        ? 'bg-purple-800 text-purple-100 border border-purple-600'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800/80'
                      }`}
                  >
                    <div className="font-semibold capitalize">{approach}</div>
                    <div className="text-xs mt-1">
                      {approach === 'act'
                        ? 'Values & Acceptance'
                        : approach === 'dbt'
                          ? 'Mindfulness & Emotion'
                          : 'Combined approach'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-rose-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-rose-300">Error</p>
                <p className="text-rose-200/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Generated Practice Display */}
          {generatedPractice ? (
            <div className="space-y-4">
              {/* Practice Info */}
              <div className="bg-purple-950/20 border border-purple-800/40 rounded-lg p-4">
                <h3 className="font-bold text-lg text-slate-100 mb-3">{generatedPractice.title}</h3>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="font-semibold text-slate-200 flex items-center gap-1">
                      <Clock size={16} />
                      ~{generatedPractice.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Approach</p>
                    <p className="font-semibold text-slate-200">{generatedPractice.approach.split('-')[0]}</p>
                  </div>
                </div>

                {generatedPractice.biasesAddressed.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Addresses these biases:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedPractice.biasesAddressed.map((bias) => (
                        <span
                          key={bias}
                          className="bg-purple-800/50 text-purple-200 text-xs px-3 py-1 rounded-full border border-purple-700/50"
                        >
                          {bias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {generatedPractice.audioBase64 && (
                <BiasFinderAudioPlayer
                  audioBase64={generatedPractice.audioBase64}
                  isVisible={true}
                  onError={setError}
                />
              )}

              {/* Script Preview */}
              <div className="border border-slate-700/50 rounded-lg bg-slate-800/30">
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                >
                  <span className="font-semibold text-slate-200">Script Preview</span>
                  <span className="text-slate-400">{showScript ? '−' : '+'}</span>
                </button>
                {showScript && (
                  <div className="border-t border-slate-700/50 p-4 bg-slate-800/50 max-h-60 overflow-y-auto">
                    <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedPractice.script}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={downloadAudio}
                className="w-full bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 text-purple-100 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 border border-purple-600/50"
              >
                <Download size={20} />
                Download Practice Audio
              </button>

              {/* Generate New Button */}
              <button
                onClick={() => {
                  setGeneratedPractice(null);
                  setShowScript(false);
                }}
                className="w-full bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 font-semibold py-3 px-4 rounded-lg transition border border-slate-700/50"
              >
                Generate Different Version
              </button>
            </div>
          ) : (
            <button
              onClick={generatePractice}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-purple-100 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 border border-purple-600/50 disabled:border-slate-600/50"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Generating practice session...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Personalized Practice Session
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
