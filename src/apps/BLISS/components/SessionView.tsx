import React, { useState } from 'react';
import { useDaw } from '../context/DawContext';
import { clipKey, VoiceType } from '../types/daw';
import { Play, Square, Plus, PlusCircle, Check, UploadCloud, Sliders, Grid } from 'lucide-react';
import { loadSample } from '../audio/synth';
import { getContext } from '../audio/context';

export const SessionView: React.FC = () => {
  const {
    session,
    activeSteps,
    selectedTrackId,
    selectedSceneId,
    setSelectedCell,
    launchClip,
    stopClip,
    launchScene,
    addTrack,
    addScene,
    audioStatus,
    startAudioEngine,
    trackVolumes,
    trackMutes,
    trackPans,
    panLaw,
    setTrackVolume,
    setTrackMute,
    setTrackPan,
    setPanLaw,
    updateTrackParam,
    trackSends,
    setTrackSend,
    kickRumble,
    setKickRumbleParams,
    masterCompressor,
    setMasterCompressorParams,
    masterSaturatorTilt,
    setMasterSaturatorTiltParams,
    masterSidechain,
    setMasterSidechainParams,
    masterLimiter,
    setMasterLimiterParams,
    activeTab
  } = useDaw();

  // Dialog State for Add Track
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackVoice, setNewTrackVoice] = useState<VoiceType>('kick');
  const [newTrackFreq, setNewTrackFreq] = useState(60);
  const [newTrackColor, setNewTrackColor] = useState('#EC4899');

  // Dialog State for Add Scene
  const [showAddScene, setShowAddScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      
      if (audioStatus === 'uninitialized') {
        await startAudioEngine();
      }
      
      const ctx = getContext();
      if (ctx) {
        await loadSample(ctx, url);
        const name = file.name.replace(/\.[^/.]+$/, "");
        addTrack(name, 'sampler', 220, '#A855F7', url);
      }
    }
  };

  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;
    addTrack(newTrackName, newTrackVoice, newTrackFreq, newTrackColor);
    setNewTrackName('');
    setShowAddTrack(false);
  };

  const handleAddSceneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneName.trim()) return;
    addScene(newSceneName);
    setNewSceneName('');
    setShowAddScene(false);
  };

  // Helper to suggest frequency based on selected synth voice type
  const handleVoiceChange = (voice: VoiceType) => {
    setNewTrackVoice(voice);
    if (voice === 'kick') setNewTrackFreq(50);
    else if (voice === 'snare') setNewTrackFreq(180);
    else if (voice === 'hat') setNewTrackFreq(8000);
    else if (voice === 'bass') setNewTrackFreq(55); // A1
    else if (voice === 'lead') setNewTrackFreq(220); // A3
  };

  return (
    <div 
      className="flex-1 bg-zinc-900 p-6 flex flex-col font-sans select-none min-h-0 relative overflow-y-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-purple-900/40 backdrop-blur-sm flex items-center justify-center border-4 border-purple-500 border-dashed rounded-xl m-4 pointer-events-none">
          <div className="flex flex-col items-center text-purple-200">
            <UploadCloud className="w-16 h-16 mb-4 animate-bounce" />
            <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Drop Audio Sample Here</h2>
            <p className="mt-2 text-purple-300">Creates a new Sampler Track</p>
          </div>
        </div>
      )}

      {/* Session Header Controls */}
      {activeTab === 'grid' && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white font-display font-semibold text-sm uppercase tracking-wider">Session Launch Grid</h2>
            <p className="text-zinc-400 text-xs mt-1">Select a clip to edit its step sequence below, or launch clips/scenes to jam live.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddTrack(true)}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold py-2 px-3 border border-zinc-700 rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Track
            </button>
            <button
              onClick={() => setShowAddScene(true)}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold py-2 px-3 border border-zinc-700 rounded-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Scene
            </button>
          </div>
        </div>
      )}

      {/* Grid Container */}
      {activeTab === 'grid' && (
        <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 overflow-x-auto shadow-inner">
        <div className="min-w-max flex flex-col gap-1.5">
          {/* Header row with Track labels */}
          <div className="flex items-center gap-1.5 mb-1">
            {/* Corner spacer for Scene Name column */}
            <div className="w-24 text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase text-right pr-3">SCENE</div>

            {session.tracks.map((track) => {
              const isMuted = trackMutes[track.id] || false;
              return (
                <div
                  key={track.id}
                  className={`w-36 py-2 px-3 rounded-lg border flex flex-col items-center text-center justify-center select-none transition-colors relative ${
                    isMuted ? 'border-zinc-800 bg-zinc-950/40 text-zinc-500' : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                  style={{ borderTop: `3.5px solid ${track.color}` }}
                >
                  <span className={`font-sans font-bold text-xs truncate max-w-[125px] ${isMuted ? 'text-zinc-500' : 'text-white'}`}>{track.name}</span>
                  <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-zinc-800/40">
                    <span className="text-[8px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                      {track.voice}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackMute(track.id, !isMuted);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase cursor-pointer transition-all ${
                        isMuted 
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={isMuted ? 'Unmute Instrument' : 'Mute Instrument'}
                    >
                      {isMuted ? <span className="text-rose-500">MUTED</span> : <span>MUTE</span>}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* End spacer for Scene play triggers */}
            <div className="w-10 text-[10px] font-mono text-zinc-600 uppercase text-center font-bold tracking-wider">PLAY</div>
          </div>

          {/* Matrix Rows (Scenes) */}
          {session.scenes.map((scene) => (
            <div key={scene.id} className="flex items-center gap-1.5">
              {/* Scene Descriptor (Left Header) */}
              <div className="w-24 font-mono font-bold text-xs text-zinc-400 text-right pr-3 truncate uppercase tracking-wide">
                {scene.name}
              </div>

              {/* Clip Cells */}
              {session.tracks.map((track) => {
                const key = clipKey(scene.id, track.id);
                const clip = session.clips[key];
                const isSelected = selectedTrackId === track.id && selectedSceneId === scene.id;
                const activeStep = activeSteps[key];

                if (!clip) return <div key={track.id} className="w-36 h-14 bg-zinc-900/10 rounded-lg border border-zinc-900 border-dashed" />;

                // Calculate steps visual occupancy
                const activeStepsInClip = clip.steps.filter(s => s.active).length;
                const hasNotes = activeStepsInClip > 0;

                // Color profiles according to play state
                let cellBg = 'bg-zinc-900 hover:bg-zinc-850';
                let cellBorder = isSelected ? 'border-amber-400 border-2' : 'border-zinc-800';
                let textTone = 'text-zinc-500';
                let isPlaying = false;
                let isQueued = false;

                if (clip.state === 'playing') {
                  cellBg = 'bg-zinc-900';
                  cellBorder = isSelected ? 'border-amber-400 border-2 shadow-amber-500/20' : 'border-zinc-700';
                  textTone = 'text-white font-bold';
                  isPlaying = true;
                } else if (clip.state === 'queued') {
                  cellBg = 'bg-amber-950/20 animate-pulse';
                  cellBorder = isSelected ? 'border-amber-400 border-2' : 'border-amber-500/60 border border-dashed';
                  textTone = 'text-amber-400 font-bold';
                  isQueued = true;
                } else if (clip.state === 'stopped') {
                  cellBg = 'bg-zinc-900/80 hover:bg-zinc-800';
                  textTone = 'text-zinc-400';
                }

                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedCell(track.id, scene.id)}
                    className={`w-36 h-14 rounded-lg relative overflow-hidden transition-all flex flex-col justify-between p-2.5 cursor-pointer ${cellBg} border ${cellBorder}`}
                    style={clip.state === 'playing' ? {
                      boxShadow: `inset 0 0 12px ${track.color}15, 0 0 4px ${track.color}20`,
                      borderColor: isSelected ? undefined : `${track.color}60`
                    } : undefined}
                  >
                    {/* Live Playhead Progress Bar overlay */}
                    {isPlaying && typeof activeStep === 'number' && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800"
                        style={{ borderBottom: `2.5px solid ${track.color}` }}
                      >
                        <div
                          className="h-full bg-current opacity-80"
                          style={{
                            color: track.color,
                            width: `${((activeStep + 1) / clip.stepCount) * 100}%`,
                            transition: 'width 0.05s linear'
                          }}
                        />
                      </div>
                    )}

                    {/* Clip Content Layer */}
                    <div className="flex items-center justify-between z-10 w-full min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] tracking-wide uppercase truncate ${textTone}`}>
                          {hasNotes ? `${activeStepsInClip} Steps` : 'Empty'}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
                          {isPlaying ? `Step ${((activeStep ?? 0) + 1)}` : isQueued ? 'Syncing...' : 'Stopped'}
                        </span>
                      </div>

                      {/* Small Launch Button Inside Cell */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent select action
                          if (isPlaying || isQueued) {
                            stopClip(scene.id, track.id);
                          } else {
                            launchClip(scene.id, track.id);
                          }
                        }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            : isQueued
                            ? 'bg-amber-500/30 text-amber-400 animate-bounce'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                        aria-label={isPlaying ? 'Stop Clip' : 'Launch Clip'}
                      >
                        {isPlaying ? <Square className="w-2.5 h-2.5 fill-rose-400" /> : <Play className="w-2.5 h-2.5 fill-zinc-300" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Scene Play Trigger (Right Column) */}
              <button
                onClick={() => launchScene(scene.id)}
                className="w-10 h-14 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 rounded-lg flex items-center justify-center text-emerald-500 hover:text-emerald-400 transition-all font-mono font-bold cursor-pointer"
                aria-label={`Launch Scene ${scene.name}`}
              >
                <Play className="w-4 h-4 fill-emerald-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 3. MULTI-CHANNEL HARDWARE MIXER CONSOLE */}
      {activeTab === 'mixer' && (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 shadow-lg flex flex-col gap-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow shadow-rose-500/50 animate-pulse" />
            <h3 className="text-white font-display font-semibold text-xs uppercase tracking-wider">Multi-Channel Console Mixer</h3>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-850">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">PAN LAW:</span>
              <select
                value={panLaw}
                onChange={(e) => setPanLaw(e.target.value as any)}
                className="bg-transparent text-zinc-300 text-[10px] font-mono cursor-pointer outline-none hover:text-white"
                title="Pan Law determines how left/right volume scales: Constant Power (-3dB center gain, best for modern stereo), Balance (Linear panning), or Constant Sum (-6dB center gain, best for mono-compatibility)."
              >
                <option value="constantPower">Constant Power (-3dB)</option>
                <option value="balance">Balance (Linear)</option>
                <option value="constantSum">Constant Sum (-6dB)</option>
              </select>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest font-bold hidden md:inline">ANALOG MODELLED CHANNEL STRIPS</span>
          </div>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-1">
          {/* Label Spacer */}
          <div className="w-24 shrink-0 flex flex-col justify-end text-[10px] font-mono text-zinc-500 font-bold uppercase pb-3 pr-3 text-right">
            <span>FADER LEVEL</span>
          </div>

          {session.tracks.map((track) => {
            const vol = trackVolumes[track.id] ?? 1.0;
            const isMuted = trackMutes[track.id] ?? false;
            const applyVelocity = track.applyVelocity ?? true;
            const autoStopNote = track.autoStopNote ?? false;
            const muteGroup = track.muteGroup ?? 0;
            const velocitySelectionMode = track.velocitySelectionMode ?? 'first';
            const pan = trackPans[track.id] ?? 0.0;

            return (
              <div
                key={track.id}
                className="w-40 bg-zinc-900/40 border border-zinc-850 rounded-lg p-3 flex flex-col items-center gap-3 relative shrink-0"
                style={{ borderTop: `3px solid ${track.color}` }}
              >
                {/* Track label */}
                <div className="w-full text-center">
                  <span className="text-white text-[11px] font-semibold tracking-wide block truncate w-full" style={{ color: isMuted ? '#52525b' : '#ffffff' }}>
                    {track.name}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                    {track.voice}
                  </span>
                </div>

                {/* Level Meter (Simulated live peak meter animating to the beat) */}
                <div className="w-2.5 h-20 bg-zinc-950 rounded-full border border-zinc-850/80 p-0.5 relative flex flex-col justify-end overflow-hidden shadow-inner">
                  <div
                    className="w-full rounded-full transition-all duration-150"
                    style={{
                      height: isMuted ? '0%' : `${vol * (Math.random() * 30 + 60)}%`,
                      opacity: isMuted ? 0 : 0.85,
                      background: `linear-gradient(to top, ${track.color}, ${track.color}88, #10B981)`
                    }}
                  />
                </div>

                {/* Volume Slider */}
                <div className="w-full flex flex-col items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.01"
                    value={vol}
                    onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                    className="daw-fader w-full accent-rose-500"
                  />
                  <div className="flex items-center justify-between w-full text-[9px] font-mono text-zinc-400 font-bold px-1 mt-0.5">
                    <span>{Math.round(vol * 100)}%</span>
                    <span className="text-zinc-500">{vol > 1.0 ? '+1.6dB' : vol === 0 ? '-inf' : `${Math.round(20 * Math.log10(vol))}dB`}</span>
                  </div>
                </div>

                {/* Pan Slider */}
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="flex items-center justify-between w-full text-[8px] font-mono text-zinc-500 font-bold uppercase px-1">
                    <span>PAN</span>
                    <span className="text-zinc-400">
                      {pan === 0 ? 'C' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}L` : `${Math.round(pan * 100)}R`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.02"
                    value={pan}
                    onChange={(e) => setTrackPan(track.id, parseFloat(e.target.value))}
                    className="daw-fader w-full accent-amber-500 cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #27272a 45%, #e4e4e7 48%, #e4e4e7 52%, #27272a 55%)' }}
                  />
                </div>

                {/* Console Mute and Solo Buttons */}
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => setTrackMute(track.id, !isMuted)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all border cursor-pointer ${
                      isMuted
                        ? 'bg-rose-600 border-rose-500 text-white shadow shadow-rose-600/25 font-black'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    MUTE
                  </button>
                </div>

                {/* Track Aux Sends */}
                <div className="w-full bg-zinc-950/60 border border-zinc-850 p-2 rounded-lg flex flex-col gap-1.5 mt-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-black tracking-widest block border-b border-zinc-900 pb-0.5 mb-1 text-center">
                    Shared Sends
                  </span>
                  {(() => {
                    const sends = trackSends[track.id] || [0, 0, 0, 0];
                    return (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-mono">
                        {sends.map((sendLvl, idx) => {
                          const label = idx === 0 ? 'RVB' : idx === 1 ? 'DLY' : idx === 2 ? 'CMB' : 'SWP';
                          const colorClass = idx === 0 ? 'text-cyan-400 font-bold' : idx === 1 ? 'text-amber-400 font-bold' : idx === 2 ? 'text-purple-400 font-bold' : 'text-emerald-400 font-bold';
                          return (
                            <div key={idx} className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between">
                                <span className={colorClass}>{label}</span>
                                <span className="text-zinc-400 text-[8px]">{Math.round(sendLvl * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.05"
                                value={sendLvl}
                                onChange={(e) => setTrackSend(track.id, idx, parseFloat(e.target.value))}
                                className="daw-fader h-1 w-full cursor-pointer accent-zinc-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Advanced DSP/Groove Settings Toggle */}
                <div className="w-full border-t border-zinc-800/60 pt-2.5 flex flex-col gap-2 text-[10px]">
                  {/* Apply Velocity toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-sans uppercase text-[9px] font-bold">Velocity</span>
                    <button
                      onClick={() => updateTrackParam(track.id, 'applyVelocity', !applyVelocity)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase cursor-pointer transition-all ${
                        applyVelocity
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                          : 'bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Apply Velocity to note trigger volume"
                    >
                      {applyVelocity ? 'YES' : 'NO'}
                    </button>
                  </div>

                  {/* Auto-Stop-Note toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-sans uppercase text-[9px] font-bold">Choke</span>
                    <button
                      onClick={() => updateTrackParam(track.id, 'autoStopNote', !autoStopNote)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase cursor-pointer transition-all ${
                        autoStopNote
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                          : 'bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Auto-Stop previous note on retrigger (Solo Voice)"
                    >
                      {autoStopNote ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Mute Group Selector */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-zinc-500 font-sans uppercase text-[9px] font-bold">Mute Grp</span>
                    <select
                      value={muteGroup}
                      onChange={(e) => updateTrackParam(track.id, 'muteGroup', parseInt(e.target.value))}
                      className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10px] rounded px-1 py-0.5 font-mono cursor-pointer hover:border-zinc-700 outline-none w-16"
                    >
                      <option value="0">None</option>
                      {[1, 2, 3, 4, 5, 8, 12, 16].map(g => (
                        <option key={g} value={g}>Group {g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selection Mode Selector */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-zinc-500 font-sans uppercase text-[9px] font-bold">Layer Mode</span>
                    <select
                      value={velocitySelectionMode}
                      onChange={(e) => updateTrackParam(track.id, 'velocitySelectionMode', e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10px] rounded px-1 py-0.5 font-mono cursor-pointer hover:border-zinc-700 outline-none w-16"
                    >
                      <option value="first">First</option>
                      <option value="roundRobin">R-Robin</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dedicated Kick Cavernous Rumble Channel Strip */}
          <div
            className="w-40 bg-zinc-900/40 border border-amber-500/20 rounded-lg p-3.5 flex flex-col items-center gap-3 relative shrink-0"
            style={{ borderTop: `3px solid #f59e0b` }}
          >
            <div className="w-full text-center">
              <span className="text-amber-500 text-[10px] font-black tracking-wider block uppercase">
                Sub Rumble
              </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                    Techno Engine
              </span>
            </div>

            {/* Sub-bass Rumble Peak Meter */}
            <div className="w-2 h-14 bg-zinc-950 rounded-full border border-zinc-850/80 p-0.5 relative flex flex-col justify-end overflow-hidden shadow-inner">
              <div
                className="w-full rounded-full transition-all duration-150"
                style={{
                  height: kickRumble.amount === 0 ? '0%' : `${kickRumble.amount * (Math.random() * 35 + 55)}%`,
                  opacity: kickRumble.amount === 0 ? 0 : 0.85,
                  background: `linear-gradient(to top, #EF4444, #F59E0B)`
                }}
              />
            </div>

            {/* Rumble Amount */}
            <div className="w-full flex flex-col gap-1 text-[9px] font-mono">
              <div className="flex items-center justify-between text-zinc-400 font-bold px-1">
                <span>Rumble Mix</span>
                <span className="text-zinc-200">{Math.round(kickRumble.amount * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={kickRumble.amount}
                onChange={(e) => setKickRumbleParams(parseFloat(e.target.value), kickRumble.decay, kickRumble.filterFreq)}
                className="daw-fader w-full accent-amber-500"
              />
            </div>

            {/* Rumble Decay */}
            <div className="w-full flex flex-col gap-1 text-[9px] font-mono">
              <div className="flex items-center justify-between text-zinc-400 font-bold px-1">
                <span>Swell/Decay</span>
                <span className="text-zinc-200">{Math.round(kickRumble.decay * 1000)}ms</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={kickRumble.decay}
                onChange={(e) => setKickRumbleParams(kickRumble.amount, parseFloat(e.target.value), kickRumble.filterFreq)}
                className="daw-fader w-full accent-amber-400"
              />
            </div>

            {/* Rumble LPF cutoff */}
            <div className="w-full flex flex-col gap-1 text-[9px] font-mono">
              <div className="flex items-center justify-between text-zinc-400 font-bold px-1">
                <span>Sub Filter</span>
                <span className="text-zinc-200">{kickRumble.filterFreq}Hz</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                step="5"
                value={kickRumble.filterFreq}
                onChange={(e) => setKickRumbleParams(kickRumble.amount, kickRumble.decay, parseFloat(e.target.value))}
                className="daw-fader w-full accent-orange-500"
              />
            </div>

            <p className="text-[7.5px] text-zinc-500 font-sans text-center uppercase tracking-wide border-t border-zinc-800 pt-2.5 mt-1 leading-normal">
              Deep subterranean cavernous echo gated by direct dry Kick hits.
            </p>
          </div>

          {/* Dedicated Master Mastering Channel Strip */}
          <div
            className="w-52 bg-zinc-900/60 border border-rose-500/30 rounded-lg p-3 flex flex-col items-center gap-3 relative shrink-0 shadow-lg"
            style={{ borderTop: `3px solid #EC4899` }}
          >
            <div className="w-full text-center">
              <span className="text-rose-500 text-[10px] font-black tracking-widest block uppercase">
                MASTER STRIP
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                Pro Output Glue
              </span>
            </div>

            {/* Master Dynamics Glue Controls */}
            <div className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded flex flex-col gap-2 text-[9px] font-mono">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="text-zinc-400 font-bold uppercase">1. VCA Glue Comp</span>
                <button
                  onClick={() => setMasterCompressorParams({ enabled: !masterCompressor.enabled })}
                    className={`px-1 rounded text-[8px] font-bold cursor-pointer ${
                      masterCompressor.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                >
                  {masterCompressor.enabled ? 'GLUE' : 'BYP'}
                </button>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Threshold</span>
                  <span className="text-zinc-300 font-bold">{masterCompressor.threshold}dB</span>
                </div>
                <input
                  type="range"
                  min="-32"
                  max="0"
                  step="1"
                  value={masterCompressor.threshold}
                  onChange={(e) => setMasterCompressorParams({ threshold: parseInt(e.target.value) })}
                  className="daw-fader w-full accent-rose-500"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Ratio</span>
                  <span className="text-zinc-300 font-bold">{masterCompressor.ratio}:1</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="6.0"
                  step="0.5"
                  value={masterCompressor.ratio}
                  onChange={(e) => setMasterCompressorParams({ ratio: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-rose-500"
                />
              </div>
            </div>

            {/* Master Saturator & Shelving Tilt EQ */}
            <div className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded flex flex-col gap-2 text-[9px] font-mono">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="text-zinc-400 font-bold uppercase">2. Saturation &amp; Tilt</span>
                <button
                  onClick={() => setMasterSaturatorTiltParams({ enabled: !masterSaturatorTilt.enabled })}
                    className={`px-1 rounded text-[8px] font-bold cursor-pointer ${
                      masterSaturatorTilt.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                >
                  {masterSaturatorTilt.enabled ? 'ON' : 'BYP'}
                </button>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Analog Saturation</span>
                  <span className="text-zinc-300 font-bold">{Math.round(masterSaturatorTilt.drive * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterSaturatorTilt.drive}
                  onChange={(e) => setMasterSaturatorTiltParams({ drive: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-cyan-500"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Tilt EQ (Bright)</span>
                  <span className="text-zinc-300 font-bold">
                    {masterSaturatorTilt.tilt === 0.5 ? 'Flat' : masterSaturatorTilt.tilt < 0.5 ? 'Warm' : 'Bright'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.85"
                  step="0.05"
                  value={masterSaturatorTilt.tilt}
                  onChange={(e) => setMasterSaturatorTiltParams({ tilt: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-cyan-500"
                  style={{ background: 'linear-gradient(to right, #3b82f6, #10b981, #f59e0b)' }}
                />
              </div>
            </div>

            {/* Sidechain Pumping */}
            <div className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded flex flex-col gap-2 text-[9px] font-mono">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="text-zinc-400 font-bold uppercase">3. Kick Sidechain</span>
                <button
                  onClick={() => setMasterSidechainParams({ enabled: !masterSidechain.enabled })}
                    className={`px-1 rounded text-[8px] font-bold cursor-pointer ${
                      masterSidechain.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                >
                  {masterSidechain.enabled ? 'PUMP' : 'BYP'}
                </button>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Pump Depth</span>
                  <span className="text-zinc-300 font-bold">{Math.round(masterSidechain.amount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={masterSidechain.amount}
                  onChange={(e) => setMasterSidechainParams({ amount: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-amber-500"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Release Recovery</span>
                  <span className="text-zinc-300 font-bold">{Math.round(masterSidechain.release * 1000)}ms</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.01"
                  value={masterSidechain.release}
                  onChange={(e) => setMasterSidechainParams({ release: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Output Limiter */}
            <div className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded flex flex-col gap-1.5 text-[9px] font-mono">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="text-zinc-400 font-bold uppercase">4. Peak Limiter</span>
                <button
                  onClick={() => setMasterLimiterParams({ enabled: !masterLimiter.enabled })}
                    className={`px-1 rounded text-[8px] font-bold cursor-pointer ${
                      masterLimiter.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                >
                  {masterLimiter.enabled ? 'LIMIT' : 'BYP'}
                </button>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Ceiling Vol</span>
                  <span className="text-zinc-300 font-bold">{Math.round(masterLimiter.gain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={masterLimiter.gain}
                  onChange={(e) => setMasterLimiterParams({ gain: parseFloat(e.target.value) })}
                  className="daw-fader w-full accent-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* MODAL / DIALOGS FOR ADD TRACK */}
      {showAddTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-white font-display font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-rose-500" /> Add Synthesis Track
            </h3>
            <form onSubmit={handleAddTrackSubmit} className="flex flex-col gap-4 text-xs font-sans">
              <div>
                <label className="text-zinc-400 block mb-1">Track Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Arp"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  className="w-full bg-zinc-950 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Synthesis Voice Type</label>
                <select
                  value={newTrackVoice}
                  onChange={(e) => handleVoiceChange(e.target.value as VoiceType)}
                  className="w-full bg-zinc-950 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                >
                  <option value="kick">Deep Swept Kick (Percussive)</option>
                  <option value="snare">Dual-Layer Snare (Percussive)</option>
                  <option value="hat">Filtered Noise Hi-Hat (Percussive)</option>
                  <option value="bass">Warm Sawtooth Bass (Melodic)</option>
                  <option value="lead">Detuned Chorus Lead (Melodic)</option>
                  <option value="sampler">Sampler (Requires Sample)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Base Root Frequency (Hz)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="10000"
                    value={newTrackFreq}
                    onChange={(e) => setNewTrackFreq(parseInt(e.target.value))}
                    className="daw-fader flex-1"
                  />
                  <input
                    type="number"
                    value={newTrackFreq}
                    onChange={(e) => setNewTrackFreq(parseInt(e.target.value) || 220)}
                    className="w-16 bg-zinc-950 text-white p-1 rounded text-center border border-zinc-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Track Color Accent</label>
                <div className="flex gap-2">
                  {['#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTrackColor(c)}
                      className={`w-6 h-6 rounded-full border border-black/40 flex items-center justify-center transition-all cursor-pointer ${newTrackColor === c ? 'scale-110 shadow-lg shadow-white/10' : 'opacity-60'}`}
                      style={{ backgroundColor: c }}
                    >
                      {newTrackColor === c && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddTrack(false)}
                  className="bg-zinc-800 text-zinc-400 py-2 px-4 rounded-lg hover:bg-zinc-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-all font-semibold shadow-md cursor-pointer"
                >
                  Create Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG FOR ADD SCENE */}
      {showAddScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-white font-display font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-emerald-500" /> Create Session Scene
            </h3>
            <form onSubmit={handleAddSceneSubmit} className="flex flex-col gap-4 text-xs font-sans">
              <div>
                <label className="text-zinc-400 block mb-1">Scene Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chorus Fill"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  className="w-full bg-zinc-950 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2.5 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddScene(false)}
                  className="bg-zinc-800 text-zinc-400 py-2 px-4 rounded-lg hover:bg-zinc-700 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-md cursor-pointer"
                >
                  Create Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
