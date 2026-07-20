export type QuantizeValue = 'immediate' | 'beat' | 'bar';

export type RampSpec = {
  duration: number;  // in bars
};

export type ClipTarget = { sceneId: string; trackId: string };
export type TrackTarget = { trackId: string };
export type SceneTarget = { sceneId: string };

export type LiveCommand =
  | { type: 'play';   target: ClipTarget; quantize?: QuantizeValue }
  | { type: 'stop';   target: ClipTarget | TrackTarget | 'all'; quantize?: QuantizeValue }
  | { type: 'mute';   target: TrackTarget }
  | { type: 'unmute'; target: TrackTarget }
  | { type: 'solo';   target: TrackTarget }
  | { type: 'bpm';    value: number }
  | { type: 'scene';  target: SceneTarget; bpm?: number }
  | { type: 'set';    param: string; value: number }
  | { type: 'ramp';   param: string; to: number; ramp: RampSpec }
  | { type: 'euclid'; target: ClipTarget; hits: number; steps: number; offset: number }
  | { type: 'prob';   target: ClipTarget; probability: number; steps: number[] | null }
  | { type: 'vel';    target: ClipTarget; velocity: number; steps: number[] | null }
  | { type: 'notes';  target: ClipTarget; notes: number[] }
  | { type: 'swing';  value: number }
  | { type: 'panic' };

export type LiveCommandResult = {
  ok: boolean;
  message?: string;
  error?: string;
  command?: LiveCommand;
  source?: string;
};

export type LiveCommandHistoryItem = LiveCommandResult & {
  id: string;
  timestamp: number;
};

export interface LiveRuntimeHost {
  getSession: () => import('../types/daw').Session;
  getFxChains: () => import('../types/daw').TrackChain[];
  getBpm: () => number;
  getQuantization: () => import('../types/daw').Quantization;
  launchClip: (sceneId: string, trackId: string) => void;
  stopClip: (sceneId: string, trackId: string) => void;
  launchScene: (sceneId: string) => void;
  stopAll: () => void;
  setBpm: (bpm: number) => void;
  setTrackMute: (trackId: string, muted: boolean) => void;
  setTrackSolo: (trackId: string, solo: boolean) => void;
  setFxParam: (trackId: string, slotIndex: number, paramName: string, value: number) => void;
  updateClipSteps: (sceneId: string, trackId: string, steps: import('../types/daw').Step[]) => void;
  panic: () => void;
}
