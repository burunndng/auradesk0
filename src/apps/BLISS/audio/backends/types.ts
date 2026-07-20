import type { VoiceType } from '../../types/daw';

export interface NoteOnParams {
  trackId: string;
  voice: VoiceType;
  baseFreq: number;
  velocity: number;
  pitchOffset: number;
  audioTime: number;
  gateEnd: number;
  sampleUrl?: string;
}

export interface BackendTrackInfo {
  trackId: string;
  muteGroup: number;
  autoStopNote: boolean;
  applyVelocity: boolean;
  velocitySelectionMode: 'first' | 'roundRobin' | 'random';
}

export interface AudioBackend {
  readonly id: string;
  readonly label: string;
  readonly available: boolean;
  init?(audioContext?: AudioContext): Promise<void> | void;
  noteOn(note: NoteOnParams, track: BackendTrackInfo): void;
  allNotesOff(): void;
  setParam(trackId: string, slotIndex: number, paramName: string, value: number): void;
  dispose?(): void;
}

export type { VoiceType };
