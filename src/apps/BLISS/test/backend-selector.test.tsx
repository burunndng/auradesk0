// @vitest-environment jsdom
/**
 * Component tests for the BackendSelector (TransportBar engine switch).
 *
 * The backend registry is mocked with mutable availability so we can exercise
 * the dynamic probe flow: an offline backend becomes available only after
 * init() runs. Audio/context modules are mocked like in session-view.test.tsx.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

// ── Mutable backend fixture (hoisted so vi.mock can close over it) ─────────────
const state = vi.hoisted(() => ({
  activeId: 'bliss',
  bliss: {
    id: 'bliss', label: 'BLISS Web Audio', available: true,
    init: vi.fn(), noteOn: vi.fn(), allNotesOff: vi.fn(), setParam: vi.fn(),
  },
  supersonic: {
    id: 'supersonic', label: 'SuperSonic (scsynth)', available: false,
    init: vi.fn(async () => {}),
    noteOn: vi.fn(), allNotesOff: vi.fn(), setParam: vi.fn(),
  },
}));

vi.mock('../audio/backends', () => ({
  listBackends: () => [state.bliss, state.supersonic],
  getActiveBackendId: () => state.activeId,
  getBackend: () => (state.activeId === 'supersonic' ? state.supersonic : state.bliss),
  setBackend: (id: string) => {
    const b = id === 'supersonic' ? state.supersonic : id === 'bliss' ? state.bliss : undefined;
    if (!b || !b.available) return false;
    state.activeId = id;
    return true;
  },
  registerBackend: vi.fn(),
}));

vi.mock('../audio/context', () => ({ initAudio: vi.fn(), suspendAudio: vi.fn(), getContext: () => undefined }));
vi.mock('../audio/clock', () => ({ clock: { bpm: 132, swing: 0, humanizeTime: 0, humanizeVelocity: 0, start: vi.fn(), stop: vi.fn() } }));
vi.mock('../audio/launcher', () => ({
  launcher: {
    attach: vi.fn(), detach: vi.fn(), onNoteOn: vi.fn(),
    launchClip: vi.fn(), stopClip: vi.fn(), launchScene: vi.fn(),
    stopAll: vi.fn(), getClipStepIndex: vi.fn(() => -1),
  },
}));
vi.mock('../audio/patchgraph', () => ({
  patchGraph: {
    init: vi.fn(), addTrack: vi.fn(), removeTrack: vi.fn(),
    getLiveChain: vi.fn(() => null), getTrackInput: vi.fn(() => null),
    getMasterGainNode: vi.fn(() => ({ gain: { setValueAtTime: vi.fn() }, context: { currentTime: 0 } })),
    setSlotFx: vi.fn(), updateParam: vi.fn(),
    setTrackPan: vi.fn(), setTrackSend: vi.fn(),
    setKickRumble: vi.fn(), setMasterCompressor: vi.fn(),
    setMasterSaturatorTilt: vi.fn(), setMasterLimiter: vi.fn(),
    masterSidechainAmount: 0, masterSidechainRelease: 0, masterSidechainEnabled: false,
  },
}));
vi.mock('../audio/synth', () => ({ playNote: vi.fn(), loadSample: vi.fn() }));

import { DawProvider } from '../context/DawContext';
import { BackendSelector } from '../components/BackendSelector';

function renderSelector() {
  return render(
    React.createElement(DawProvider, null, React.createElement(BackendSelector))
  );
}

describe('BackendSelector', () => {
  beforeEach(() => {
    state.activeId = 'bliss';
    state.bliss.available = true;
    state.supersonic.available = false;
    state.supersonic.init.mockReset();
    state.bliss.init.mockReset();
  });

  afterEach(() => cleanup());

  it('renders the Engine label and a select with the active backend', () => {
    renderSelector();
    expect(screen.getByText('Engine')).toBeTruthy();
    const select = screen.getByRole('combobox', { name: 'Audio engine backend' }) as HTMLSelectElement;
    expect(select.value).toBe('bliss');
  });

  it('marks the offline backend as an unavailable option', () => {
    renderSelector();
    // The SuperSonic option exists and is disabled (unavailable).
    const options = screen.getAllByRole('option');
    const supersonic = options.find((o) => (o as HTMLOptionElement).value === 'supersonic') as HTMLOptionElement;
    expect(supersonic).toBeTruthy();
    expect(supersonic.disabled).toBe(true);
    expect(supersonic.textContent).toContain('unavailable');
  });

  it('probes offline backends via init() and refreshes availability', async () => {
    // Arrange: probing SuperSonic flips it available.
    state.supersonic.init.mockImplementation(async () => {
      state.supersonic.available = true;
    });

    renderSelector();
    const probeBtn = screen.getByRole('button', { name: 'Re-probe backend availability' });

    fireEvent.click(probeBtn);

    await waitFor(() => {
      expect(state.supersonic.init).toHaveBeenCalled();
    });
    // After probing, the option is no longer disabled/marked unavailable.
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const supersonic = options.find((o) => (o as HTMLOptionElement).value === 'supersonic') as HTMLOptionElement;
      expect(supersonic.disabled).toBe(false);
      expect(supersonic.textContent).not.toContain('unavailable');
    });
  });

  it('does not call init() on already-available backends during probe-all', async () => {
    renderSelector();
    const probeBtn = screen.getByRole('button', { name: 'Re-probe backend availability' });
    fireEvent.click(probeBtn);
    await waitFor(() => expect(state.supersonic.init).toHaveBeenCalled());
    // bliss is already available — its init must not be invoked.
    expect(state.bliss.init).not.toHaveBeenCalled();
  });
});
