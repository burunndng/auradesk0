import type { AudioBackend, NoteOnParams, BackendTrackInfo } from './types';
import { playNote, allNotesOff } from '../synth';
import { patchGraph } from '../patchgraph';

export const blissBackend: AudioBackend = {
  id: 'bliss',
  label: 'BLISS Web Audio',
  available: true,

  noteOn(note: NoteOnParams, track: BackendTrackInfo) {
    const dest = patchGraph.getTrackInput(note.trackId);
    if (!dest) return;
    const freq = note.baseFreq * Math.pow(2, note.pitchOffset / 12);
    playNote(
      note.voice,
      note.velocity,
      note.audioTime,
      note.gateEnd,
      freq,
      dest,
      note.sampleUrl,
      note.pitchOffset,
      track.trackId,
      track.muteGroup,
      track.autoStopNote,
      track.applyVelocity,
      track.velocitySelectionMode
    );
  },

  allNotesOff() {
    allNotesOff();
  },

  setParam(trackId, slotIndex, paramName, value) {
    patchGraph.updateParam(trackId, slotIndex, paramName, value);
  },
};
