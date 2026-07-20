import { useEffect, useRef, useState } from 'react';
import { useDaw } from '../context/DawContext';

export interface MidiState {
  supported: boolean;
  connected: boolean;
  devices: string[];
}

/**
 * Web MIDI API integration for live performance.
 *
 * - Note On (any channel) → launch clip for that track in the selected scene
 *   (note 36..43 maps to track index 0..7, i.e. C2..G2 on a 49-key controller)
 * - CC 1..8 → launch scene 1..8
 * - Program Change 1..8 → launch scene 1..8
 *
 * MIDI access is only requested AFTER the audio engine boots, so the
 * permission prompt never blocks the intro screen.
 */
export function useMidiInput() {
  const {
    session,
    selectedSceneId,
    audioStatus,
    launchClip,
    launchScene,
  } = useDaw();

  const [midi, setMidi] = useState<MidiState>({ supported: false, connected: false, devices: [] });
  const selectedSceneRef = useRef(selectedSceneId);

  useEffect(() => { selectedSceneRef.current = selectedSceneId; }, [selectedSceneId]);

  // Check support on mount — no permission prompt
  useEffect(() => {
    setMidi((s) => ({ ...s, supported: 'requestMIDIAccess' in navigator }));
  }, []);

  // Only request MIDI access after the audio engine is running
  useEffect(() => {
    if (audioStatus === 'uninitialized') return;
    if (!('requestMIDIAccess' in navigator)) return;

    let access: any = null;
    let cancelled = false;

    const onMessage = (e: any) => {
      if (!e.data || e.data.length < 2) return;
      const [status, data1, data2] = e.data;
      const command = status & 0xf0;

      // Note On (0x90) with velocity > 0
      if (command === 0x90 && data2 > 0) {
        const trackIdx = data1 - 36; // C2 = note 36 → track 0
        if (trackIdx >= 0 && trackIdx < 8) {
          const track = session.tracks[trackIdx];
          const sceneId = selectedSceneRef.current ?? session.scenes[0]?.id;
          if (track && sceneId) launchClip(sceneId, track.id);
        }
        return;
      }

      // Control Change (0xB0)
      if (command === 0xb0) {
        if (data1 >= 1 && data1 <= 8 && data2 > 0) {
          const scene = session.scenes[data1 - 1];
          if (scene) launchScene(scene.id);
        }
        return;
      }

      // Program Change (0xC0)
      if (command === 0xc0) {
        const sceneIdx = data1;
        const scene = session.scenes[sceneIdx];
        if (scene) launchScene(scene.id);
        return;
      }
    };

    const refreshDevices = (a: any) => {
      const devices: string[] = [];
      a.inputs.forEach((inp: any) => {
        devices.push(inp.name ?? 'Unknown');
        inp.onmidimessage = onMessage;
      });
      if (!cancelled) setMidi({ supported: true, connected: devices.length > 0, devices });
    };

    (async () => {
      try {
        access = await (navigator as any).requestMIDIAccess();
        if (cancelled) return;
        refreshDevices(access);
        access.onstatechange = () => { if (access) refreshDevices(access); };
      } catch (err) {
        // Permission denied — silently ignore
      }
    })();

    return () => {
      cancelled = true;
      if (access) {
        access.inputs.forEach((inp: any) => { inp.onmidimessage = null; });
        access.onstatechange = null;
      }
    };
  }, [audioStatus, session, launchClip, launchScene]);
}
