import React, { useCallback, useState } from 'react';
import { useDaw } from '../context/DawContext';
import {
  listBackends,
  setBackend,
  getBackend,
  getActiveBackendId,
} from '../audio/backends';
import { getContext } from '../audio/context';
import { Cpu, RefreshCw } from 'lucide-react';

/**
 * Engine selector for BLISS's pluggable audio-backend layer.
 *
 * The registry (`src/audio/backends`) is a module singleton, not React state,
 * so this component mirrors the active id and per-backend availability into
 * local state and re-reads after every probe/switch via a `tick` bump.
 *
 * Availability is *dynamic*: the BLISS native backend is always available,
 * but the SuperSonic (scsynth) adapter only becomes available after a
 * successful async `init()` that lazy-imports the `supersonic-scsynth`
 * module. Offline backends are rendered as disabled `<option>`s; the
 * adjacent probe button re-runs `init()` for any still-offline backend
 * (useful after installing the module at runtime) and refreshes the list.
 *
 * Switching mid-session is safe: `allNotesOff()` is called on the outgoing
 * backend before the active pointer flips. `DawContext` reads `getBackend()`
 * live on every note, so new events route to the new engine immediately.
 */
export const BackendSelector: React.FC = () => {
  const { audioStatus } = useDaw();
  const [tick, setTick] = useState(0);
  const [activeId, setActiveId] = useState<string>(() => getActiveBackendId());
  const [probingAll, setProbingAll] = useState(false);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const backends = listBackends();
  const engineOn = audioStatus !== 'uninitialized';

  const notify = useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage((m) => (m === msg ? null : m)), 2800);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Attempt init() on a backend, returning whether it ended up available.
  // Needs the AudioContext; degrades gracefully if the engine isn't up yet.
  const tryInit = useCallback(async (id: string): Promise<boolean> => {
    const b = listBackends().find((x) => x.id === id);
    if (!b) return false;
    if (b.available) return true;
    let ctx: AudioContext | undefined;
    try {
      ctx = getContext();
    } catch {
      /* engine not booted — init may still self-resolve */
    }
    try {
      await b.init?.(ctx);
    } catch {
      /* ignored — availability flag is the source of truth */
    }
    return listBackends().find((x) => x.id === id)?.available ?? false;
  }, []);

  const handleSelect = useCallback(
    async (id: string) => {
      if (id === activeId) return;
      setProbingId(id);
      const ok = await tryInit(id);
      setProbingId(null);
      refresh();
      if (!ok) {
        const b = listBackends().find((x) => x.id === id);
        notify(`${b?.label ?? id} unavailable — module not loaded`);
        setActiveId(getActiveBackendId());
        return;
      }
      // Safe mid-session swap: silence the outgoing engine first.
      try {
        getBackend().allNotesOff();
      } catch {
        /* outgoing backend may not be initialised */
      }
      if (setBackend(id)) {
        setActiveId(id);
        const b = listBackends().find((x) => x.id === id);
        notify(`Engine: ${b?.label ?? id}`);
      }
    },
    [activeId, tryInit, refresh, notify]
  );

  const handleProbeAll = useCallback(async () => {
    setProbingAll(true);
    for (const b of listBackends()) {
      if (!b.available) await tryInit(b.id);
    }
    setProbingAll(false);
    refresh();
    const upNow = listBackends().filter((b) => b.available).map((b) => b.label);
    notify(upNow.length > 0 ? `Available: ${upNow.join(', ')}` : 'No backends available');
  }, [tryInit, refresh, notify]);

  // tick is read implicitly by `backends` recomputing each render.
  void tick;

  return (
    <div
      className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/60 rounded-md px-3 py-1.5"
      title={message ?? 'Audio synthesis engine'}
    >
      <Cpu className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Engine</span>
      <select
        value={activeId}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={!engineOn || probingAll || probingId !== null}
        className="bg-transparent text-zinc-300 font-mono text-[11px] focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Audio engine backend"
      >
        {backends.map((b) => (
          <option key={b.id} value={b.id} disabled={!b.available} className="bg-zinc-900 text-zinc-200">
            {b.label}
            {b.available ? '' : ' (unavailable)'}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleProbeAll}
        disabled={probingAll}
        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
        title="Re-probe backend availability (e.g. after installing SuperSonic)"
        aria-label="Re-probe backend availability"
      >
        <RefreshCw className={`w-3 h-3 ${probingAll ? 'animate-spin' : ''}`} />
      </button>
      {probingId && (
        <span className="text-[9px] font-mono text-amber-400/80 leading-none">loading…</span>
      )}
      {message && !probingId && (
        <span className="text-[9px] font-mono text-zinc-500 leading-none hidden lg:inline">{message}</span>
      )}
    </div>
  );
};

export default BackendSelector;
