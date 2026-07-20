import React from 'react';
import { HelpCircle, Play, Sliders, Radio, Activity, Sparkles, Layers } from 'lucide-react';

export const HelpGuide: React.FC = () => {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-sans text-xs flex flex-col gap-5 shadow-lg select-none">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <HelpCircle className="w-5 h-5 text-amber-500 animate-pulse" />
        <h3 className="text-white font-display font-bold text-xs uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-400">BLISS Ambient Guide</h3>
      </div>

      <div className="flex flex-col gap-4 text-zinc-400">
        {/* Step 1: Activation */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-amber-500/10 text-amber-400 p-1.5 rounded-md mt-0.5">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold">1. Activate Audio Engine</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Modern browsers block automatic audio generation. Click <span className="text-amber-400 font-bold">ACTIVATE AUDIO NODE</span> in the transport bar first. This safely boots the BLISS synthesis engine.
            </p>
          </div>
        </div>

        {/* Step 2: Play/Stop */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-md mt-0.5">
            <Play className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold">2. Start Master Transport</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Toggle <span className="text-emerald-400 font-bold">START TRANSPORT</span> to start the lookahead clock. The clock ticks at 16th-note boundaries according to the BPM value.
            </p>
          </div>
        </div>

        {/* Step 3: Session Launching */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-blue-500/10 text-blue-400 p-1.5 rounded-md mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold">3. Session Launch Grid</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Launch columns independently or click the green <span className="text-emerald-500 font-bold">▶</span> button at the end of rows to trigger whole Scenes. State transitions (stopped → queued → playing) are quantized to the nearest bar boundary.
            </p>
          </div>
        </div>

        {/* Step 4: Step Sequencer */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-amber-500/10 text-amber-400 p-1.5 rounded-md mt-0.5">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold">4. Sequence Editing</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Click anywhere on a cell in the matrix to load it in the 16-step grid. Toggle active triggers on the grid. Select a step (golden border) to tweak its parameters (velocity, pitch offsets, trigger probability, and gate decay time).
            </p>
          </div>
        </div>

        {/* Step 5: Generative Probability & Pitch */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-violet-500/10 text-violet-400 p-1.5 rounded-md mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold">5. Generative Features</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Lower the <span className="text-amber-400 font-semibold">Probability</span> slider on hi-hat steps to create complex organic rolls, or set <span className="text-amber-400 font-semibold">Pitch Offset</span> semitones on Synth Bass and Synth Lead steps to write melodies.
            </p>
          </div>
        </div>

        {/* Step 6: FX Rack */}
        <div className="flex items-start gap-3 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-md mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold">6. Modular Insert FX Rack</h4>
            <p className="mt-1 leading-relaxed text-zinc-500">
              Switch to the <span className="text-zinc-300 font-bold">FX Rack</span> view. Add serial effects to channels. Turn up delay feed times or room reverb size to expand the space of your drum beats and basslines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
