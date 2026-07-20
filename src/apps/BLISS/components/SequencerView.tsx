import React, { useState, useRef, useEffect } from 'react';
import { useDaw } from '../context/DawContext';
import { clipKey, Step } from '../types/daw';
import { Music, Eye, Sliders, Sparkles, Volume, Dices, Shuffle, Timer, Activity, SlidersHorizontal, MousePointerClick } from 'lucide-react';

export const SequencerView: React.FC = () => {
  const {
    session,
    selectedTrackId,
    selectedSceneId,
    activeSteps,
    toggleStep,
    updateStepParam,
    updateClipSteps,
    fxChains,
    swing,
    setSwing,
    humanizeTime,
    setHumanizeTime,
    humanizeVelocity,
    setHumanizeVelocity
  } = useDaw();

  // Local state to keep track of which step button is focused for detail parameter editing
  const [focusedStepIndex, setFocusedStepIndex] = useState<number>(0);

  // Randomizer state
  const [randomizeDensity, setRandomizeDensity] = useState<number>(0.3);
  const [randomizeScale, setRandomizeScale] = useState<string>('minor_pentatonic');

  // Drawing state for the Hydrogen-style step-parameter grid fader bank
  const [drawParam, setDrawParam] = useState<'velocity' | 'pitchOffset' | 'probability' | 'gateLength' | 'leadLag'>('velocity');
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingContainerRef = useRef<HTMLDivElement | null>(null);

  if (!selectedTrackId || !selectedSceneId) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center font-sans">
        <Sliders className="w-10 h-10 text-zinc-600 mb-3 animate-pulse" />
        <h3 className="text-zinc-300 font-bold text-sm tracking-wide">No Clip Selected</h3>
        <p className="text-zinc-500 text-xs mt-1 max-w-xs">
          Click any cell in the Session Launch Grid above to load its 16-step sequence for deep, generative editing.
        </p>
      </div>
    );
  }

  const track = session.tracks.find((t) => t.id === selectedTrackId);
  const scene = session.scenes.find((s) => s.id === selectedSceneId);
  const key = clipKey(selectedSceneId, selectedTrackId);
  const clip = session.clips[key];

  if (!track || !scene || !clip) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center font-sans">
        <p className="text-rose-500 text-xs font-semibold">Error: Clip data mismatch. Select another cell.</p>
      </div>
    );
  }

  const focusedStep: Step = clip.steps[focusedStepIndex] || clip.steps[0];
  const isPlaying = clip.state === 'playing';
  const activeStepIdx = activeSteps[key];

  // Helper to change sliders
  const handleParamChange = (field: keyof Step, val: any) => {
    updateStepParam(selectedSceneId, selectedTrackId, focusedStepIndex, field, val);
  };

  const isMelodic = track.voice === 'bass' || track.voice === 'lead';

  const handleRandomize = () => {
    const scales: Record<string, number[]> = {
      minor_pentatonic: [0, 3, 5, 7, 10, 12, 15, 17],
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      harmonic_minor: [0, 2, 3, 5, 7, 8, 11, 12],
      chromatic: Array.from({length: 25}, (_, i) => i - 12),
    };
    
    const scale = scales[randomizeScale] || scales.minor_pentatonic;
    
    const newSteps = clip.steps.map(step => {
      const active = Math.random() < randomizeDensity;
      let pitchOffset = 0;
      if (active && isMelodic) {
        pitchOffset = scale[Math.floor(Math.random() * scale.length)];
      }
      return {
        ...step,
        active,
        pitchOffset,
        velocity: active ? Math.floor(Math.random() * 50) + 70 : step.velocity
      };
    });
    
    updateClipSteps(selectedSceneId, selectedTrackId, newSteps);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-sans select-none flex flex-col gap-6 shadow-xl">
      {/* Sequencer Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full shadow"
              style={{ backgroundColor: track.color, boxShadow: `0 0 8px ${track.color}` }}
            />
            <div>
              <h3 className="text-white font-display font-semibold text-sm uppercase tracking-wide">
                Step Editor: <span className="text-zinc-300">{scene.name}</span> — {track.name}
              </h3>
              <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                Voice Engine: {track.voice} | Base Pitch: {track.baseFreq}Hz
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            Step Count: {clip.stepCount} / 16
          </div>
        </div>

        {/* Randomizer Toolbar */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-2 mt-2">
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-[10px] font-bold py-1.5 px-3 rounded-md transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" /> Randomize
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">Density</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={randomizeDensity}
              onChange={(e) => setRandomizeDensity(parseFloat(e.target.value))}
              className="daw-fader w-24"
            />
          </div>

          {isMelodic && (
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">Scale</label>
              <select
                value={randomizeScale}
                onChange={(e) => setRandomizeScale(e.target.value)}
                className="bg-zinc-950 text-white text-[10px] p-1 rounded border border-zinc-800 focus:outline-none"
              >
                <option value="minor_pentatonic">Minor Pentatonic</option>
                <option value="major">Major</option>
                <option value="harmonic_minor">Harmonic Minor</option>
                <option value="chromatic">Chromatic</option>
              </select>
            </div>
          )}
        </div>

        {/* Hydrogen Groove Engine Toolbar */}
        <div className="flex flex-wrap items-center gap-6 bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Shuffle className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Hydrogen Groove Engine</span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden md:block" />

          {/* Swing */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Swing</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={swing}
              onChange={(e) => setSwing(parseFloat(e.target.value))}
              className="daw-fader w-20"
            />
            <span className="font-mono text-[10px] text-zinc-400 w-8">{Math.round(swing * 100)}%</span>
          </div>

          {/* Humanize Timing */}
          <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-4">
            <div className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Timing Jitter</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={humanizeTime}
              onChange={(e) => setHumanizeTime(parseFloat(e.target.value))}
              className="daw-fader w-20"
            />
            <span className="font-mono text-[10px] text-zinc-400 w-8">{Math.round(humanizeTime * 100)}%</span>
          </div>

          {/* Humanize Velocity */}
          <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-4">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Velocity Humanize</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={humanizeVelocity}
              onChange={(e) => setHumanizeVelocity(parseFloat(e.target.value))}
              className="daw-fader w-20"
            />
            <span className="font-mono text-[10px] text-zinc-400 w-8">{Math.round(humanizeVelocity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 16 Step Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 tracking-wider font-bold">
          <span>TRIGGER SEQUENCE GRID</span>
          <span>Click step to toggle trigger | Select step to edit velocity & pitch</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
          {clip.steps.map((step, idx) => {
            const isStepActive = step.active;
            const isCurrentlyPlayingStep = isPlaying && activeStepIdx === idx;
            const isCurrentlyFocused = focusedStepIndex === idx;

            // Compute border classes
            let borderStyle = 'border-zinc-800';
            if (isCurrentlyFocused) borderStyle = 'border-amber-400 ring-2 ring-amber-400/20';
            else if (isCurrentlyPlayingStep) borderStyle = 'border-white ring-2 ring-white/50';

            // Background dynamic fills depending on step triggers
            let bgFill = 'bg-zinc-900 hover:bg-zinc-800';
            let labelColor = 'text-zinc-500';
            if (isStepActive) {
              bgFill = '';
              labelColor = 'text-white font-bold';
            }

            return (
              <div
                key={idx}
                onClick={() => setFocusedStepIndex(idx)}
                className={`h-14 rounded-lg relative cursor-pointer flex flex-col justify-between p-1.5 transition-all select-none border border-b-2 ${borderStyle} ${bgFill}`}
                style={{
                  backgroundColor: isStepActive ? `${track.color}20` : undefined,
                  borderBottomColor: isStepActive ? track.color : undefined,
                }}
              >
                {/* Micro playhead line */}
                {isCurrentlyPlayingStep && (
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70 animate-pulse transform -translate-x-1/2" />
                )}

                {/* Step Marker Index */}
                  <span className={`text-[9px] font-mono ${labelColor}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Main Interactive Checkbox Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStep(selectedSceneId, selectedTrackId, idx);
                  }}
                  className={`daw-step-btn w-4 h-4 rounded-sm mx-auto transition-all flex items-center justify-center cursor-pointer ${
                    isStepActive
                      ? 'shadow-md shadow-black/40 text-white'
                      : 'border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-transparent'
                  }`}
                  style={{ backgroundColor: isStepActive ? track.color : undefined }}
                  aria-label={`Toggle step ${idx + 1}`}
                >
                  {isStepActive && <div className="w-1.5 h-1.5 bg-white rounded-sm opacity-80" />}
                </button>

                {/* Micro mini-bar visual for velocity */}
                {isStepActive && (
                  <div className="w-full bg-zinc-900/50 h-0.5 rounded-full overflow-hidden mt-1 opacity-70">
                    <div
                      className="h-full"
                      style={{
                        backgroundColor: track.color,
                        width: `${(step.velocity / 127) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hydrogen-Style 16-Step Simultaneous Parameter Draw Editor */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500 animate-pulse" />
            <h4 className="text-xs uppercase font-display font-semibold tracking-wider text-zinc-200">
              Hydrogen Multi-Step Draw Board
            </h4>
          </div>

          {/* Parameter Category Selector */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
            {(['velocity', 'pitchOffset', 'probability', 'gateLength', 'leadLag'] as const).map((p) => {
              const active = drawParam === p;
              const label = p === 'velocity' ? 'Velocity' : p === 'pitchOffset' ? 'Pitch' : p === 'probability' ? 'Probability' : p === 'gateLength' ? 'Decay/Gate' : 'Lead/Lag';
              return (
                <button
                  key={p}
                  onClick={() => setDrawParam(p)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    active ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono uppercase bg-zinc-950/40 border border-zinc-850 px-3.5 py-2 rounded-lg">
          <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
          <span>Click &amp; sweep/drag mouse left-to-right to draw values across all 16 steps instantly!</span>
        </div>

        {/* 16 Fader bar container */}
        <div
          ref={drawingContainerRef}
          className="relative h-32 bg-zinc-950 rounded-lg border border-zinc-850 p-4 flex gap-1.5 select-none cursor-crosshair overflow-hidden"
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        >
          {/* Accent horizontal rules */}
          <div className="absolute inset-x-0 inset-y-4 flex flex-col justify-between pointer-events-none opacity-[0.04]">
            <div className="h-px bg-white" />
            <div className="h-px bg-white" />
            <div className="h-px bg-white" />
          </div>

          {clip.steps.map((step, idx) => {
            const isActive = step.active;
            const isCurrentlyPlaying = isPlaying && activeStepIdx === idx;

            // Calculate height percent based on value
            let pct = 0;
            let displayValue = '';
            if (drawParam === 'velocity') {
              pct = step.velocity / 127;
              displayValue = String(step.velocity);
            } else if (drawParam === 'probability') {
              pct = step.probability;
              displayValue = `${Math.round(step.probability * 100)}%`;
            } else if (drawParam === 'gateLength') {
              pct = (step.gateLength - 0.1) / 1.4; // maps 0.1-1.5 range
              displayValue = `${Math.round(step.gateLength * 100)}%`;
            } else if (drawParam === 'pitchOffset') {
              pct = (step.pitchOffset + 24) / 48; // maps -24 to 24 range
              displayValue = step.pitchOffset >= 0 ? `+${step.pitchOffset} ST` : `${step.pitchOffset} ST`;
            } else if (drawParam === 'leadLag') {
              pct = (step.leadLag + 1) / 2; // maps -1 to 1 range
              displayValue = step.leadLag === 0 ? 'On-Beat' : step.leadLag > 0 ? `+${Math.round(step.leadLag * 15)}ms Lag` : `${Math.round(step.leadLag * 15)}ms Lead`;
            }

            pct = Math.max(0, Math.min(1, pct));

            const handleBarMouseEvent = (e: React.MouseEvent) => {
              if (e.type === 'mousedown' || (e.type === 'mouseenter' && isDrawing)) {
                if (!drawingContainerRef.current) return;
                const rect = drawingContainerRef.current.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const h = rect.height;
                const barPct = Math.max(0, Math.min(1, 1 - y / h));

                if (drawParam === 'velocity') {
                  const val = Math.round(barPct * 127);
                  updateStepParam(selectedSceneId, selectedTrackId, idx, 'velocity', val);
                } else if (drawParam === 'probability') {
                  const val = Math.round(barPct * 100) / 100;
                  updateStepParam(selectedSceneId, selectedTrackId, idx, 'probability', val);
                } else if (drawParam === 'gateLength') {
                  const val = Math.round((0.1 + barPct * 1.4) * 100) / 100;
                  updateStepParam(selectedSceneId, selectedTrackId, idx, 'gateLength', val);
                } else if (drawParam === 'pitchOffset') {
                  // Pitch offset only applies if melodic
                  const val = Math.round(barPct * 48 - 24);
                  updateStepParam(selectedSceneId, selectedTrackId, idx, 'pitchOffset', val);
                } else if (drawParam === 'leadLag') {
                  const val = Math.round((barPct * 2 - 1) * 100) / 100;
                  updateStepParam(selectedSceneId, selectedTrackId, idx, 'leadLag', val);
                }
              }
            };

            return (
              <div
                key={idx}
                onMouseDown={handleBarMouseEvent}
                onMouseEnter={handleBarMouseEvent}
                className={`flex-1 flex flex-col justify-end group/bar relative h-full rounded transition-all ${
                  isCurrentlyPlaying ? 'bg-zinc-800/20' : 'hover:bg-zinc-900/30'
                }`}
              >
                {/* Value bar */}
                <div
                  className={`w-full rounded-t transition-all ${
                    isActive
                      ? 'shadow'
                      : 'opacity-[0.12]'
                  }`}
                  style={{
                    height: `${pct * 100}%`,
                    backgroundColor: isActive ? track.color : '#71717a'
                  }}
                />

                {/* Vertical active playhead accent */}
                {isCurrentlyPlaying && (
                  <div className="absolute inset-0 bg-white/[0.04] border-x border-white/20 pointer-events-none" />
                )}

                {/* Column step indicator */}
                <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none select-none">
                  <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-zinc-200' : 'text-zinc-600'}`}>
                    {idx + 1}
                  </span>
                </div>

                {/* Floating tooltip badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-950 text-white border border-zinc-800 text-[8px] font-mono py-0.5 px-2 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity z-10 shadow-md">
                  {displayValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Parameters Panel */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sliders className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs uppercase font-display font-semibold tracking-wider">
              Step {String(focusedStepIndex + 1).padStart(2, '0')} Parameters
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
            Status: {focusedStep.active ? 'ACTIVE NOTE' : 'MUTED / SKIP'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-xs">
          {/* Velocity Control */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-850 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-sans">
              <span className="flex items-center gap-1">
                <Volume className="w-3.5 h-3.5 text-zinc-500" /> Velocity / Volume
              </span>
              <span className="font-mono text-zinc-300">{focusedStep.velocity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="127"
              step="1"
              value={focusedStep.velocity}
              disabled={!focusedStep.active}
              onChange={(e) => handleParamChange('velocity', parseInt(e.target.value))}
              className="daw-fader w-full"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Loudness/impact of this specific note trigger.</p>
          </div>

          {/* Probability Control */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-850 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-sans">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" /> Probability
              </span>
              <span className="font-mono text-zinc-300">{Math.round(focusedStep.probability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={focusedStep.probability}
              disabled={!focusedStep.active}
              onChange={(e) => handleParamChange('probability', parseFloat(e.target.value))}
              className="daw-fader w-full"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Chance of firing. 100% is constant, lower yields human feel.</p>
          </div>

          {/* Pitch Offset (Only for Melodic) */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-850 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-sans">
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-zinc-500" /> Pitch Offset
              </span>
              <span className="font-mono text-zinc-300">
                {focusedStep.pitchOffset >= 0 ? `+${focusedStep.pitchOffset}` : focusedStep.pitchOffset} ST
              </span>
            </div>
            <input
              type="range"
              min="-24"
              max="24"
              step="1"
              value={focusedStep.pitchOffset}
              disabled={!focusedStep.active || !isMelodic}
              onChange={(e) => handleParamChange('pitchOffset', parseInt(e.target.value))}
              className="daw-fader w-full"
            />
            {isMelodic ? (
              <p className="text-[10px] text-zinc-500 mt-1">Transposes note up/down by semitones (+/- 2 Octaves).</p>
            ) : (
              <p className="text-[10px] text-amber-500/80 font-bold mt-1">Fixed pitch. Not applicable to drum types.</p>
            )}
          </div>

          {/* Gate Length */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-850 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-sans">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-zinc-500" /> Note Gate / Decay
              </span>
              <span className="font-mono text-zinc-300">{Math.round(focusedStep.gateLength * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={focusedStep.gateLength}
              disabled={!focusedStep.active}
              onChange={(e) => handleParamChange('gateLength', parseFloat(e.target.value))}
              className="daw-fader w-full"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Length of note. Low is snappy staccato, high is ringing sustain.</p>
          </div>

          {/* Lead / Lag (Microtiming) */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-850 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-sans">
              <span className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-zinc-500" /> Microtiming (Lead/Lag)
              </span>
              <span className="font-mono text-zinc-300">
                {focusedStep.leadLag === 0 ? 'On-Beat' : focusedStep.leadLag > 0 ? `+${Math.round(focusedStep.leadLag * 15)}ms` : `${Math.round(focusedStep.leadLag * 15)}ms`}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={focusedStep.leadLag || 0}
              disabled={!focusedStep.active}
              onChange={(e) => handleParamChange('leadLag', parseFloat(e.target.value))}
              className="daw-fader w-full"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Shift timing relative to grid. Neg is early (rush); pos is late (lag).</p>
          </div>
        </div>

        {/* Per-Step FX Parameter Locks Automation */}
        <div className="border-t border-zinc-800/80 pt-5 mt-3 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h4 className="text-xs uppercase font-display font-bold tracking-wider text-zinc-200">
              Per-Step FX Parameter Locks (Automation)
            </h4>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
            Override any track insert slot effect or send aux mix parameter for this step. The values will snap exactly on this note hit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Box: Targets Selection */}
            <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-1">
                1. Select Parameter to Automate
              </span>

              {(() => {
                const chain = fxChains[track.id];
                if (!chain) return <span className="text-[10px] text-zinc-600 font-mono">No active inserts</span>;
                const activeLocks = focusedStep.paramLocks || {};

                return (
                  <div className="flex flex-col gap-4 max-h-52 overflow-y-auto pr-1">
                    {chain.slots.map((slot, slotIdx) => {
                      if (slot.type === 'none') return null;

                      // Available parameters based on effect type
                      const paramNames = slot.type === 'saturation_wavefolder'
                        ? ['drive', 'mix']
                        : slot.type === 'modulated_filter'
                        ? ['cutoff', 'Q', 'lfoRate', 'lfoDepth']
                        : slot.type === 'bitcrusher'
                        ? ['bits', 'frequencyReduction']
                        : slot.type === 'frequency_shifter'
                        ? ['frequency', 'mix']
                        : slot.type === 'comb_filter'
                        ? ['delayTime', 'feedback', 'mix']
                        : ['drive', 'mix'];

                      return (
                        <div key={slotIdx} className="border-b border-zinc-900 last:border-0 pb-3">
                          <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-widest block mb-1.5">
                            Slot {slotIdx + 1}: {slot.type.replace('_', ' ')}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {paramNames.map((pName) => {
                              const lockKey = `insert-${slotIdx}-${pName}`;
                              const isLocked = lockKey in activeLocks;

                              return (
                                <button
                                  key={pName}
                                  onClick={() => {
                                    const newLocks = { ...activeLocks };
                                    if (isLocked) {
                                      delete newLocks[lockKey];
                                    } else {
                                      newLocks[lockKey] = pName === 'cutoff' ? 1200 : 0.5;
                                    }
                                    handleParamChange('paramLocks' as any, newLocks);
                                  }}
                                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                                    isLocked
                                      ? 'bg-amber-500 text-zinc-950 border border-amber-400 shadow shadow-amber-500/10'
                                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                                  }`}
                                >
                                  {isLocked ? `● Lock ${pName}` : `+ Lock ${pName}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Aux Sends */}
                    <div className="border-t border-zinc-900 pt-3">
                          <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-widest block mb-1.5">
                        Shared Aux Sends
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3].map((sendIdx) => {
                          const lockKey = `send-${sendIdx}`;
                          const isLocked = lockKey in activeLocks;
                          const label = sendIdx === 0 ? 'Reverb' : sendIdx === 1 ? 'Delay' : sendIdx === 2 ? 'Comb' : 'Sweep';

                          return (
                            <button
                              key={sendIdx}
                              onClick={() => {
                                const newLocks = { ...activeLocks };
                                if (isLocked) {
                                  delete newLocks[lockKey];
                                } else {
                                  newLocks[lockKey] = 0.25;
                                }
                                handleParamChange('paramLocks' as any, newLocks);
                              }}
                              className={`px-2 py-1 rounded text-[8px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                                isLocked
                                  ? 'bg-amber-500 text-zinc-950 border border-amber-400'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                              }`}
                            >
                              {isLocked ? `● Send ${label}` : `+ Send ${label}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Box: Value Tuning (takes remaining space) */}
            <div className="col-span-2 bg-zinc-950/80 border border-zinc-850 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-1">
                2. Override Value Sliders
              </span>

              {(() => {
                const activeLocks = focusedStep.paramLocks || {};
                const lockKeys = Object.keys(activeLocks);

                if (lockKeys.length === 0) {
                  return (
                    <div className="h-40 border border-dashed border-zinc-850 rounded-lg flex flex-col items-center justify-center text-center p-6">
                      <SlidersHorizontal className="w-6 h-6 text-zinc-700 mb-2" />
                      <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-wider font-bold">
                        No overrides locked on this step
                      </span>
                            <p className="text-[10px] text-zinc-600 mt-1 max-w-xs leading-normal">
                        Click any parameter button in the selection list to start automating. Override sliders will populate here.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-52 overflow-y-auto pr-1">
                    {lockKeys.map((lockKey) => {
                      const val = activeLocks[lockKey];

                      let label = '';
                      let min = 0;
                      let max = 1.0;
                      let stepVal = 0.05;

                      if (lockKey.startsWith('insert-')) {
                        const parts = lockKey.split('-');
                        const slotIdx = parseInt(parts[1]);
                        const paramName = parts[2];
                        label = `Slot ${slotIdx + 1} ${paramName}`;
                        
                        if (paramName === 'cutoff') {
                          min = 50;
                          max = 12000;
                          stepVal = 10;
                        } else if (paramName === 'Q') {
                          min = 0.5;
                          max = 18;
                          stepVal = 0.1;
                        } else if (paramName === 'bits') {
                          min = 2;
                          max = 16;
                          stepVal = 1;
                        } else if (paramName === 'frequencyReduction') {
                          min = 0;
                          max = 0.98;
                          stepVal = 0.01;
                        } else if (paramName === 'lfoRate') {
                          min = 0.1;
                          max = 24;
                          stepVal = 0.1;
                        } else if (paramName === 'frequency') {
                          min = -2500;
                          max = 2500;
                          stepVal = 10;
                        } else if (paramName === 'delayTime') {
                          min = 0.001;
                          max = 0.1;
                          stepVal = 0.001;
                        }
                      } else if (lockKey.startsWith('send-')) {
                        const parts = lockKey.split('-');
                        const sendIdx = parseInt(parts[1]);
                        const name = sendIdx === 0 ? 'Reverb' : sendIdx === 1 ? 'Delay' : sendIdx === 2 ? 'Comb' : 'Sweep';
                        label = `Send ${name} Level`;
                      }

                      return (
                        <div key={lockKey} className="bg-zinc-900 border border-zinc-850 p-3 rounded-lg flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                            <span className="text-amber-500">{label}</span>
                            <span className="text-zinc-200">{val}</span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={stepVal}
                            value={val}
                            onChange={(e) => {
                              const newLocks = { ...activeLocks, [lockKey]: parseFloat(e.target.value) };
                              handleParamChange('paramLocks' as any, newLocks);
                            }}
                            className="daw-fader w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
