import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDaw } from '../context/DawContext';
import { Terminal, CornerDownLeft, ArrowUp, ArrowDown, Trash2, Zap } from 'lucide-react';

const COMMAND_REFERENCE: Array<{ cmd: string; desc: string }> = [
  { cmd: 'play <track>', desc: 'Launch a clip (e.g. play kick / play acid in peak)' },
  { cmd: 'stop <track> | stop all', desc: 'Stop one track or everything' },
  { cmd: 'mute <track> · unmute <track> · solo <track>', desc: 'Mixer state' },
  { cmd: 'bpm <n> · swing <n>', desc: 'Tempo (30–300) · global swing (0–1)' },
  { cmd: 'scene <name|n> [@ <bpm>]', desc: 'Launch a scene, optional tempo' },
  { cmd: 'set <param> <v>', desc: 'Set a param: delay.feedback, filter.cutoff, reverb.mix…' },
  { cmd: 'ramp <param> to <v> over <bars>', desc: 'Smoothly ramp a param' },
  { cmd: 'euclid <track> <hits> [steps] [offset]', desc: 'Even rhythm, e.g. euclid hat 5 16 4' },
  { cmd: 'prob <track> <p> [step…]', desc: 'Step probability 0–1, e.g. prob hat 0.5' },
  { cmd: 'vel <track> <v> [step…]', desc: 'Velocity 1–127, e.g. vel kick 127 0' },
  { cmd: 'notes <track> <n1> [n2…]', desc: 'Semitone offsets on active steps, e.g. notes acid 0 3 7' },
  { cmd: 'panic', desc: 'Hard-stop everything' },
];

export function LiveCommandView() {
  const { runCommand, liveHistory, clearLiveHistory, session } = useDaw();
  const [input, setInput] = useState('');
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pastCommands = useMemo(
    () => liveHistory.map(h => h.source).filter(Boolean),
    [liveHistory]
  );

  // Auto-scroll the log to the newest entry.
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [liveHistory]);

  const submit = async () => {
    const raw = input.trim();
    if (!raw) return;
    await runCommand(raw);
    setInput('');
    setHistoryIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const next = historyIdx === -1 ? pastCommands.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(pastCommands[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const next = historyIdx + 1;
      if (next >= pastCommands.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(next);
        setInput(pastCommands[next] ?? '');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-zinc-300">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-mono tracking-[0.2em] uppercase">Live Command</span>
          <span className="text-[10px] text-zinc-600 font-mono ml-2">
            {session.tracks.length} tracks · {session.scenes.length} scenes
          </span>
        </div>
        <button
          onClick={() => {
            clearLiveHistory();
            inputRef.current?.focus();
          }}
          className="flex items-center gap-1.5 text-[11px] font-sans text-zinc-500 hover:text-zinc-300 bg-zinc-900 border border-zinc-800 py-1.5 px-2.5 rounded-md hover:border-zinc-700 transition-all cursor-pointer"
          title="Clear log"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto px-6 py-4 font-mono text-[12px] leading-relaxed min-h-0"
      >
        {liveHistory.length === 0 ? (
          <div className="text-zinc-600 italic">
            No commands yet. Type below — try <span className="text-amber-500">bpm 140</span>,{' '}
            <span className="text-amber-500">play kick</span>, or{' '}
            <span className="text-amber-500">scene groove</span>.
          </div>
        ) : (
          liveHistory.map(h => (
            <div key={h.id} className="mb-2.5">
              <div className="text-zinc-500">
                <span className="text-zinc-600">›</span> {h.source}
              </div>
              <div className={h.ok ? 'text-emerald-400/90 pl-3' : 'text-rose-400 pl-3'}>
                {h.ok ? `↳ ${h.message}` : `↳ error: ${h.error}`}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Command reference */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 shrink-0">
        <div className="flex items-center gap-1.5 mb-2 text-zinc-500">
          <Zap className="w-3 h-3 text-amber-500/70" />
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase">Reference</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-1">
          {COMMAND_REFERENCE.map(r => (
            <div key={r.cmd} className="flex flex-col">
              <code className="text-[11px] text-amber-300/90 font-mono">{r.cmd}</code>
              <span className="text-[10px] text-zinc-600">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-amber-500/50 rounded-md px-3 py-2 transition-colors">
          <span className="text-amber-500 font-mono text-xs select-none">›</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            placeholder="enter a command…"
            className="flex-1 bg-transparent outline-none font-mono text-[13px] text-zinc-100 placeholder:text-zinc-700"
          />
          <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono">
            <kbd className="flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              history
            </kbd>
            <kbd className="flex items-center gap-1 ml-2 text-zinc-500">
              <CornerDownLeft className="w-3 h-3" />
              run
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
