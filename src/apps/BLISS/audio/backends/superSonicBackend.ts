import type { AudioBackend, NoteOnParams, BackendTrackInfo, VoiceType } from './types';

const SYNTHDEF_FOR_VOICE: Record<VoiceType, string> = {
  kick: 'bliss_kick',
  snare: 'bliss_snare',
  hat: 'bliss_hat',
  bass: 'bliss_bass',
  lead: 'bliss_lead',
  sampler: 'bliss_sampler',
};

export function synthDefForVoice(voice: VoiceType): string {
  return SYNTHDEF_FOR_VOICE[voice] ?? 'bliss_lead';
}

export function buildNoteControls(note: NoteOnParams): Array<[string, number]> {
  const freq = note.baseFreq * Math.pow(2, note.pitchOffset / 12);
  return [
    ['freq', freq],
    ['amp', Math.max(0, Math.min(1, note.velocity / 127))],
    ['pitch_offset', note.pitchOffset],
    ['gate', 1],
  ];
}

const ASSET_BASE = '/supersonic/';

type SuperSonicClient = {
  init(): Promise<void>;
  send(...args: any[]): void;
  loadSynthDef?(...args: any[]): Promise<void>;
};

let client: SuperSonicClient | null = null;
let initPromise: Promise<void> | null = null;
let nodeIdCounter = 1000;
const liveNodes = new Set<number>();

async function loadClient(audioContext?: AudioContext): Promise<SuperSonicClient | null> {
  try {
    const mod: any = await import('supersonic-scsynth');
    // SuperSonic is exported as a class — must be constructed with `new`.
    const Ctor = mod.default ?? mod.SuperSonic ?? mod;
    if (typeof Ctor !== 'function') return null;
    const instance = new Ctor({
      audioContext,
      autoConnect: true,
      // postMessage transport works without COOP/COEP cross-origin isolation
      // (unlike the lower-latency 'sab' mode, which needs those headers).
      mode: 'postMessage',
      baseURL: ASSET_BASE,
      wasmUrl: `${ASSET_BASE}wasm/scsynth-nrt.wasm`,
      workletUrl: `${ASSET_BASE}workers/scsynth_audio_worklet.js`,
      workerBaseURL: `${ASSET_BASE}workers/`,
    });
    await instance.init();
    for (const def of Object.values(SYNTHDEF_FOR_VOICE)) {
      try { await instance.loadSynthDef?.(def); } catch { /* bliss_* synthdefs not shipped yet */ }
    }
    return instance as SuperSonicClient;
  } catch (err) {
    console.warn('[SuperSonic] engine boot failed — staying unavailable:', err);
    return null;
  }
}

export const superSonicBackend: AudioBackend = {
  id: 'supersonic',
  label: 'SuperSonic (scsynth)',
  available: false,

  async init(audioContext?: AudioContext) {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const loaded = await loadClient(audioContext);
      if (!loaded) return;
      client = loaded;
      (superSonicBackend as { available: boolean }).available = true;
    })();
    return initPromise;
  },

  noteOn(note: NoteOnParams, _track: BackendTrackInfo) {
    if (!client) return;
    const def = synthDefForVoice(note.voice);
    const nodeId = nodeIdCounter++;
    const controls = buildNoteControls(note);
    const flat = controls.flat();
    try {
      client.send('/s_new', def, nodeId, 0, 1, ...flat);
    } catch { return; }
    liveNodes.add(nodeId);

    const gateDurMs = Math.max(20, (note.gateEnd - note.audioTime) * 1000);
    setTimeout(() => {
      if (!client || !liveNodes.has(nodeId)) return;
      try { client.send('/n_set', nodeId, 'gate', 0); } catch { /* freed */ }
      liveNodes.delete(nodeId);
    }, gateDurMs);
  },

  allNotesOff() {
    if (!client) return;
    liveNodes.forEach(id => {
      try { client!.send('/n_free', id); } catch { /* already gone */ }
    });
    liveNodes.clear();
    try { client.send('/g_freeAll', 1); } catch { /* no group */ }
  },

  setParam(_trackId: string, _slotIndex: number, _paramName: string, _value: number) {
    if (!client) return;
    // Slot/param → control-bus mapping is adapter-specific and deferred until
    // a concrete synthdef contract exists. Safe no-op for now.
  },
};
