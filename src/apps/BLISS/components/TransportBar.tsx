import React, { useState, useEffect } from 'react';
import { useDaw } from '../context/DawContext';
import { patchGraph } from '../audio/patchgraph';
import { Play, Square, Volume2, Radio, ShieldAlert } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { BackendSelector } from './BackendSelector';

export const TransportBar: React.FC = () => {
  const {
    bpm,
    setBpm,
    playing,
    togglePlay,
    quantization,
    setQuantization,
    audioStatus,
    startAudioEngine,
    stopAll,
    triggerPanic,
    recoverEngine,
    activeTab,
    setActiveTab
  } = useDaw();

  const [masterVolume, setMasterVolume] = useState(0.8);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMasterVolume(vol);
    if (audioStatus !== 'uninitialized') {
      try {
        const node = patchGraph.getMasterGainNode();
        node.gain.setValueAtTime(vol, node.context.currentTime);
      } catch (err) {}
    }
  };

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 font-sans select-none shadow-lg">
      {/* Brand Logo & Engine Indicator & Visualizer */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab('intro')}
          className="flex items-center gap-3.5 hover:opacity-90 active:scale-95 transition-all text-left cursor-pointer group"
          title="Return to BLISS Intro Cover"
        >
          <div className="relative w-10 h-10 rounded-full border border-amber-500/30 overflow-hidden shadow-lg shadow-amber-500/10 flex items-center justify-center bg-zinc-900">
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full select-none" referrerPolicy="no-referrer">
              <rect width="40" height="40" fill="#09090b"/>
              <circle cx="20" cy="20" r="12" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6"/>
              <circle cx="20" cy="20" r="6" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4"/>
              <line x1="20" y1="8" x2="20" y2="32" stroke="#f59e0b" strokeWidth="0.3" opacity="0.4"/>
              <line x1="8" y1="20" x2="32" y2="20" stroke="#f59e0b" strokeWidth="0.3" opacity="0.4"/>
              <polygon points="20,8 28,16 20,24 12,16" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
          <div>
            <span className="text-white font-display font-bold text-lg tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" aria-label="BLISS">
              BLISS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${audioStatus === 'running' ? 'bg-amber-400 shadow-amber-400/50 shadow' : 'bg-rose-500 shadow shadow-rose-500/40 animate-pulse'}`} />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-500 font-bold">
                {audioStatus === 'running' ? 'ambient engine active' : audioStatus === 'uninitialized' ? 'engine offline' : 'engine suspended'}
              </span>
            </div>
          </div>
        </button>
        <AudioVisualizer />
      </div>

      {/* Main Transport Controls */}
      <div className="flex items-center gap-3">
        {audioStatus === 'uninitialized' ? (
          <button
            onClick={startAudioEngine}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-95 transition-all text-white font-sans font-semibold text-xs py-2.5 px-5 rounded-lg shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-bounce" />
            ACTIVATE AUDIO NODE
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-lg text-xs font-semibold tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                playing
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {playing ? 'STOP TRANSPORT' : 'START TRANSPORT'}
            </button>

            {audioStatus === 'suspended' && (
              <button
                onClick={recoverEngine}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 transition-all text-black font-sans font-bold text-xs py-2.5 px-4 rounded-lg shadow-lg cursor-pointer"
              >
                RECOVER ENGINE
              </button>
            )}

            {audioStatus === 'running' && (
              <button
                onClick={triggerPanic}
                className="flex items-center gap-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-400 font-sans font-bold text-xs py-2.5 px-4 rounded-lg active:scale-95 transition-all shadow-md cursor-pointer"
                title="Immediate Audio Thread Suspension"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                PANIC
              </button>
            )}
          </div>
        )}

        <button
          onClick={stopAll}
          disabled={audioStatus === 'uninitialized'}
          className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[11px] py-2.5 px-4 rounded-lg border border-zinc-700 transition-all uppercase tracking-wider cursor-pointer"
        >
          Stop Clips
        </button>
      </div>

      {/* Tempo (BPM) Dial & Quantization */}
      <div className="flex flex-wrap items-center gap-6">
        {/* BPM Input Slider */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">TEMPO</span>
          <input
            type="range"
            min="60"
            max="300"
            step="1"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="daw-fader w-24"
          />
          <input
            type="number"
            min="60"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            className="w-12 bg-transparent text-white font-mono font-bold text-sm text-center border-b border-zinc-700 focus:outline-none focus:border-rose-500"
          />
          <span className="text-[10px] font-mono text-rose-500 font-bold">BPM</span>
        </div>

        {/* Quantization Select */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">QUANTIZE</span>
          <select
            value={quantization}
            onChange={(e) => setQuantization(e.target.value as any)}
            className="bg-transparent text-zinc-200 font-mono text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="immediate">None (Instant)</option>
            <option value="beat">1/4 Note (Beat)</option>
            <option value="bar" defaultChecked>1 Bar (Bar)</option>
          </select>
        </div>

        {/* Master Output Meter & Slider */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.01"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="daw-fader w-24"
          />
          <span className="text-xs font-mono text-zinc-300 w-8 text-right font-bold">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>

        <BackendSelector />
      </div>
    </div>
  );
};
