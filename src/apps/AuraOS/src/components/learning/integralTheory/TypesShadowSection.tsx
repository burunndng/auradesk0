import React, { useState } from 'react';
import { Users, Ghost, ArrowRight, AlertCircle } from 'lucide-react';
import { typography, getButtonClass } from '../../../../theme';

interface ShadowProcess {
  step: string;
  desc: string;
}

interface TypesData {
  agency: string;
  communion: string;
  lesson: string;
}

interface TypesShadowProps {
  data: {
    title: string;
    concept: string;
    types: TypesData;
    shadow: {
      intro: string;
      process: ShadowProcess[];
      prompt: string;
    };
  };
}

export const TypesShadowSection: React.FC<TypesShadowProps> = ({ data }) => {
  const [shadowInput, setShadowInput] = useState('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [responses, setResponses] = useState<string[]>(['', '', '']);
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    if (shadowInput.trim()) {
      setIsStarted(true);
      setResponses([shadowInput, '', '']);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentStep(0);
    setShadowInput('');
    setResponses(['', '', '']);
  };

  const stepPronoun = ['It', 'You', 'I'];
  const stepColor = ['text-red-400', 'text-amber-400', 'text-emerald-400'];

  return (
    <section className="grid lg:grid-cols-2 gap-8">
      {/* Left: Types */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-teal-400" />
          <h3 className={typography.h4}>Types</h3>
        </div>

        <div className="space-y-6">
          {/* Agency/Communion slider */}
          <div className="relative">
            <div className="h-32 bg-slate-950/50 rounded-xl border border-slate-800 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-pink-500/10" />

              {/* Labels */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="text-left">
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                    Agency
                  </div>
                  <div className="text-[10px] text-slate-500">Ascender • Freedom • Assertion</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">
                    Communion
                  </div>
                  <div className="text-[10px] text-slate-500">Descender • Connection • Harmony</div>
                </div>
              </div>

              {/* Quotes */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="grid grid-cols-2 gap-4 text-xs italic text-slate-300">
                  <div className="text-left">"{data.types.agency}"</div>
                  <div className="text-right">"{data.types.communion}"</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <p className={`${typography.body} italic text-center`}>
              {data.types.lesson}
            </p>
          </div>

          {/* Visual representation */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                ↑
              </div>
              <div className="text-xs text-slate-500 mt-2">Up & Out</div>
            </div>
            <div className="text-2xl text-slate-600">+</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                ↓
              </div>
              <div className="text-xs text-slate-500 mt-2">Down & In</div>
            </div>
            <div className="text-2xl text-slate-600">=</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                ⊗
              </div>
              <div className="text-xs text-slate-500 mt-2">Wholeness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Shadow 3-2-1 */}
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-3 mb-6">
          <Ghost className="text-purple-400" />
          <h3 className={typography.h4}>{data.title}</h3>
        </div>

        <p className={`${typography.body} mb-6`}>
          {data.shadow.intro}
        </p>

        {/* Safety note */}
        <div className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-500/30 flex gap-3">
          <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={16} />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-200">A note before you begin</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Shadow work is genuinely powerful—which means it can be genuinely activating. If strong
              emotions, dissociation, or overwhelm arise, pause. Open your eyes, feel your feet on the
              floor, look around the room. You're grounding, not escaping. This tool works best with
              minor charges—irritations, social friction, mild projections. For deeper material
              (trauma, grief, significant relational wounds), this process is a complement to
              professional support, not a replacement for it.
            </p>
          </div>
        </div>

        {!isStarted ? (
          /* Initial prompt */
          <div className="space-y-6">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
                {data.shadow.prompt}
              </label>
              <input
                type="text"
                value={shadowInput}
                onChange={(e) => setShadowInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                placeholder="e.g., That person is so arrogant..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={!shadowInput.trim()}
              className={`${getButtonClass('lg', 'primary')} w-full flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Begin 3-2-1 Process
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </button>

            {/* Preview steps */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              {data.shadow.process.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-300 mb-0.5">{step.step}</div>
                    <div className="text-slate-500">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active process */
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                    step <= currentStep ? 'bg-purple-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Current step */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-4xl font-black ${stepColor[currentStep]}`}>
                    {stepPronoun[currentStep]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {data.shadow.process[currentStep].step}
                    </div>
                    <div className="text-xs text-slate-500">
                      {data.shadow.process[currentStep].desc}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {currentStep === 0 ? (
                    /* Step 1: Display the original statement */
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-slate-200 italic">"{responses[0]}"</p>
                    </div>
                  ) : (
                    /* Steps 2 & 3: User types their perspective */
                    <textarea
                      value={responses[currentStep]}
                      onChange={(e) => {
                        const newResponses = [...responses];
                        newResponses[currentStep] = e.target.value;
                        setResponses(newResponses);
                      }}
                      placeholder={
                        currentStep === 1
                          ? "Address it directly... 'You think you're better than everyone...'"
                          : "Own it as yourself... 'I am arrogant sometimes when...'"
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                {currentStep < 2 ? (
                  <>
                    <button
                      onClick={handleReset}
                      className={getButtonClass('sm', 'secondary')}
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentStep > 0 && !responses[currentStep].trim()}
                      className={`${getButtonClass('lg', 'primary')} flex-1 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Continue to Step {currentStep + 2}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                  </>
                ) : (
                  /* Complete */
                  <div className="w-full space-y-4">
                    <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                      <div className="text-sm font-semibold text-emerald-300 mb-2">
                        Integration Complete
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        You've moved from projection (It) → dialogue (You) → ownership (I). This is
                        how shadows return home.
                      </p>
                    </div>

                    {/* Show all three steps */}
                    <div className="space-y-2 text-xs">
                      {responses.map((response, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-900/50 border border-slate-800"
                        >
                          <div className={`font-semibold mb-1 ${stepColor[idx]}`}>
                            {stepPronoun[idx]}: {data.shadow.process[idx].step}
                          </div>
                          <p className="text-slate-300 italic">"{response}"</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleReset}
                      className={`${getButtonClass('lg', 'secondary')} w-full`}
                    >
                      Try Another Shadow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
