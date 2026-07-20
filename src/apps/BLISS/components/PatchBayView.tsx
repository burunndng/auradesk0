import React from 'react';
import { useDaw } from '../context/DawContext';
import { FxType, FX_PARAM_RANGES, FX_DEFAULT_PARAMS } from '../types/daw';
import { Sliders, HelpCircle, Layers, ToggleLeft } from 'lucide-react';

export const PatchBayView: React.FC = () => {
  const { session, fxChains, setFxType, setFxParam } = useDaw();

  const handleFxTypeChange = (trackId: string, slotIndex: number, type: FxType) => {
    setFxType(trackId, slotIndex, type);
  };

  const handleParamChange = (trackId: string, slotIndex: number, paramName: string, value: number) => {
    setFxParam(trackId, slotIndex, paramName, value);
  };

  const getFxSlotsAvailable = (): FxType[] => {
    return [
      'none',
      'gain',
      'lowpass',
      'highpass',
      'bandpass',
      'delay',
      'reverb',
      'saturation_wavefolder',
      'modulated_filter',
      'transient_shaper',
      'bitcrusher',
      'freq_shifter',
      'comb_filter'
    ];
  };

  return (
    <div className="flex-1 bg-zinc-900 p-6 flex flex-col font-sans select-none overflow-y-auto min-h-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-display font-semibold text-sm uppercase tracking-wider">Modular Insert FX Rack</h2>
          <p className="text-zinc-400 text-xs mt-1">
            Apply DSP insert effects (Gain, Filter EQ modes, Delay, or Reverb) to shape the timbre of individual tracks in series.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono font-bold uppercase border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-lg">
          <Layers className="w-3.5 h-3.5 text-rose-500" /> Inserts Serial Routing
        </div>
      </div>

      {/* Tracks FX Columns Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-0">
        {session.tracks.map((track) => {
          const chain = fxChains[track.id];
          if (!chain) return null;

          return (
            <div
              key={track.id}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl"
              style={{ borderTop: `3.5px solid ${track.color}` }}
            >
              {/* Channel Label */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-white font-sans font-bold text-xs uppercase truncate max-w-[100px]">{track.name}</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">CH Input</span>
              </div>

              {/* 3 FX Insert Slots */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                {chain.slots.map((slot, slotIndex) => {
                  const isNone = slot.type === 'none';

                  return (
                    <div
                      key={slotIndex}
                      className={`p-3 rounded-lg border flex flex-col gap-2.5 transition-all text-xs ${
                        isNone
                          ? 'border-zinc-900 bg-zinc-900/10'
                          : 'border-zinc-800 bg-zinc-900/40 shadow-inner'
                      }`}
                    >
                      {/* Slot Header with Selector */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">
                          Insert {slotIndex + 1}
                        </span>
                        <select
                          value={slot.type}
                          onChange={(e) => handleFxTypeChange(track.id, slotIndex, e.target.value as FxType)}
                          className="bg-zinc-950 text-zinc-300 font-mono text-[10px] font-bold py-1 px-2 border border-zinc-850 focus:outline-none focus:border-rose-500 rounded cursor-pointer max-w-[90px]"
                        >
                          {getFxSlotsAvailable().map((fx) => (
                            <option key={fx} value={fx}>
                              {fx.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Live FX Parameters Sliders */}
                      {!isNone && (
                        <div className="flex flex-col gap-3 pt-1">
                          {Object.keys(FX_DEFAULT_PARAMS[slot.type]).map((paramName) => {
                            const config = FX_PARAM_RANGES[paramName];
                            if (!config) return null;

                            // Fetch current param value, or fall back to default
                            const value =
                              slot.params[paramName] !== undefined
                                ? slot.params[paramName]
                                : FX_DEFAULT_PARAMS[slot.type][paramName];

                            return (
                              <div key={paramName} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans">
                                  <span>{config.label}</span>
                                  <span className="font-mono text-zinc-300 font-bold">
                                    {value.toFixed(config.step < 0.1 ? 2 : 1)}
                                    {config.unit || ''}
                                  </span>
                                </div>
                                  <input
                                  type="range"
                                  min={config.min}
                                  max={config.max}
                                  step={config.step}
                                  value={value}
                                  onChange={(e) =>
                                    handleParamChange(track.id, slotIndex, paramName, parseFloat(e.target.value))
                                  }
                                  className="daw-fader w-full"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
