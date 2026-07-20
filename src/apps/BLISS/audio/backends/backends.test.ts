import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../synth', () => ({
  playNote: vi.fn(),
  allNotesOff: vi.fn(),
}));
vi.mock('../patchgraph', () => ({
  patchGraph: {
    getTrackInput: vi.fn(() => 'DEST_NODE'),
    updateParam: vi.fn(),
  },
}));

import { blissBackend } from './blissBackend';
import { superSonicBackend, synthDefForVoice, buildNoteControls } from './superSonicBackend';
import {
  getBackend, setBackend, listBackends, registerBackend, getActiveBackendId,
} from './registry';
import { playNote, allNotesOff } from '../synth';
import { patchGraph } from '../patchgraph';
import type { NoteOnParams, BackendTrackInfo, AudioBackend } from './types';

const NOTE: NoteOnParams = {
  trackId: 'track-acid', voice: 'bass', baseFreq: 110, velocity: 100,
  pitchOffset: 12, audioTime: 1.5, gateEnd: 2.0, sampleUrl: undefined,
};
const TRACK: BackendTrackInfo = {
  trackId: 'track-acid', muteGroup: 0, autoStopNote: false,
  applyVelocity: true, velocitySelectionMode: 'first',
};

describe('registry', () => {
  beforeEach(() => { setBackend('bliss'); });

  it('defaults to the bliss backend', () => {
    expect(getActiveBackendId()).toBe('bliss');
    expect(getBackend()).toBe(blissBackend);
  });

  it('listBackends includes bliss + supersonic', () => {
    const ids = listBackends().map(b => b.id);
    expect(ids).toContain('bliss');
    expect(ids).toContain('supersonic');
  });

  it('setBackend rejects unknown ids', () => {
    expect(setBackend('nope')).toBe(false);
    expect(getActiveBackendId()).toBe('bliss');
  });

  it('setBackend rejects unavailable backends (supersonic)', () => {
    expect(setBackend('supersonic')).toBe(false);
    expect(getActiveBackendId()).toBe('bliss');
  });

  it('registerBackend + setBackend round-trip', () => {
    const fake: AudioBackend = {
      id: 'fake', label: 'Fake', available: true,
      noteOn: vi.fn(), allNotesOff: vi.fn(), setParam: vi.fn(),
    };
    registerBackend(fake);
    expect(setBackend('fake')).toBe(true);
    expect(getBackend()).toBe(fake);
    setBackend('bliss');
  });
});

describe('blissBackend — delegation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('noteOn computes freq from baseFreq + pitchOffset and routes to playNote', () => {
    blissBackend.noteOn(NOTE, TRACK);
    expect(playNote).toHaveBeenCalledTimes(1);
    const args = (playNote as any).mock.calls[0];
    expect(args[0]).toBe('bass');            // voice
    expect(args[1]).toBe(100);               // velocity
    expect(args[2]).toBe(1.5);               // audioTime
    expect(args[3]).toBe(2.0);               // gateEnd
    expect(args[4]).toBe(220);               // freq = 110 * 2^(12/12)
    expect(args[5]).toBe('DEST_NODE');       // dest from patchGraph.getTrackInput
    expect(args[7]).toBe(12);                // pitchOffset
    expect(args[8]).toBe('track-acid');      // trackId
  });

  it('noteOn is a no-op when patchGraph has no input for the track', () => {
    (patchGraph.getTrackInput as any).mockReturnValueOnce(null);
    blissBackend.noteOn(NOTE, TRACK);
    expect(playNote).not.toHaveBeenCalled();
  });

  it('allNotesOff delegates to synth.allNotesOff', () => {
    blissBackend.allNotesOff();
    expect(allNotesOff).toHaveBeenCalledTimes(1);
  });

  it('setParam delegates to patchGraph.updateParam', () => {
    blissBackend.setParam('track-acid', 1, 'cutoff', 800);
    expect(patchGraph.updateParam).toHaveBeenCalledWith('track-acid', 1, 'cutoff', 800);
  });
});

describe('superSonicBackend — unavailable by default', () => {
  it('available is false when the package is absent', () => {
    expect(superSonicBackend.available).toBe(false);
  });

  it('init() resolves without throwing when the package is absent', async () => {
    await expect(superSonicBackend.init()).resolves.toBeUndefined();
    expect(superSonicBackend.available).toBe(false);
  });

  it('noteOn / allNotesOff / setParam are safe no-ops when unavailable', () => {
    expect(() => superSonicBackend.noteOn(NOTE, TRACK)).not.toThrow();
    expect(() => superSonicBackend.allNotesOff()).not.toThrow();
    expect(() => superSonicBackend.setParam('t', 0, 'x', 1)).not.toThrow();
  });
});

describe('superSonicBackend — pure helpers', () => {
  it('synthDefForVoice maps each voice to a bliss_* synthdef', () => {
    expect(synthDefForVoice('kick')).toBe('bliss_kick');
    expect(synthDefForVoice('bass')).toBe('bliss_bass');
    expect(synthDefForVoice('lead')).toBe('bliss_lead');
  });

  it('buildNoteControls computes freq + normalised amp', () => {
    const controls = buildNoteControls(NOTE);
    const map = Object.fromEntries(controls);
    expect(map.freq).toBe(220);          // 110 * 2^(12/12)
    expect(map.amp).toBeCloseTo(100 / 127, 3);
    expect(map.gate).toBe(1);
  });
});
