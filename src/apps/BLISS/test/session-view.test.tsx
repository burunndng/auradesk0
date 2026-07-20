/**
 * Component tests for the Session Grid UI.
 * Audio modules are mocked; DawContext is provided via a helper wrapper.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ── Audio mocks ───────────────────────────────────────────────────────────────
vi.mock('../audio/context',  () => ({ initAudio: vi.fn(), suspendAudio: vi.fn(), getContext: vi.fn() }));
vi.mock('../audio/clock',    () => ({ clock: { bpm: 132, swing: 0, humanizeTime: 0, humanizeVelocity: 0, start: vi.fn(), stop: vi.fn() } }));
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
    setSlotFx: vi.fn(), updateParam: vi.fn(),
    setTrackPan: vi.fn(), setTrackSend: vi.fn(),
    setKickRumble: vi.fn(), setMasterCompressor: vi.fn(),
    setMasterSaturatorTilt: vi.fn(), setMasterLimiter: vi.fn(),
    masterSidechainAmount: 0, masterSidechainRelease: 0, masterSidechainEnabled: false,
  },
}));
vi.mock('../audio/synth', () => ({ playNote: vi.fn(), loadSample: vi.fn() }));

import { DawProvider, useDaw } from '../context/DawContext';
import { SessionView } from '../components/SessionView';

// Helper: renders SessionView with the mixer tab active
function MixerWrapper() {
  const { setActiveTab } = useDaw();
  React.useEffect(() => { setActiveTab('mixer'); }, []);
  return React.createElement(SessionView);
}

function renderSession() {
  return render(
    React.createElement(DawProvider, null, React.createElement(SessionView))
  );
}

function renderMixer() {
  return render(
    React.createElement(DawProvider, null, React.createElement(MixerWrapper))
  );
}

// ── Session grid visibility ───────────────────────────────────────────────────
describe('SessionView — grid tab', () => {
  it('mounts without crashing', () => {
    renderSession(); // defaults to intro tab — component renders empty shell
  });
});

// ── Track headers ─────────────────────────────────────────────────────────────
describe('SessionView — mixer tab track names', () => {
  it('shows all 8 track names in the mixer channel strips', async () => {
    const { findAllByText } = renderMixer();
    const expectedNames = ['Kick', 'Snare', 'Clap', 'Cl.Hat', 'Op.Hat', 'Sub', 'Acid', 'Lead'];
    for (const name of expectedNames) {
      const matches = await findAllByText(new RegExp(`^${name}$`, 'i'));
      expect(matches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows MUTE button for every track', async () => {
    const { findAllByText } = renderMixer();
    const muteButtons = await findAllByText(/^MUTE$/i);
    expect(muteButtons.length).toBe(8);
  });
});
