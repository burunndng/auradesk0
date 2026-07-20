import { useEffect, useRef } from 'react';
import { useDaw } from '../context/DawContext';

/**
 * Keyboard shortcuts for live performance.
 *
 * Space          — play / stop
 * Escape         — stop all clips (quantized)
 * `  (backtick)  — PANIC (hard suspend + silence)
 * Tab            — cycle tabs: grid → mixer → fx → grid
 * 1 – 8          — launch scene 1–8
 * Shift + 1–8    — stop all clips in scene 1–8
 * q w e r t y u i — launch clip for track 1–8 in the selected/first scene
 * Shift + q–i    — toggle mute for track 1–8
 */
export function useKeyboardShortcuts() {
  const {
    session,
    togglePlay,
    launchScene,
    launchClip,
    stopClip,
    stopAll,
    triggerPanic,
    setActiveTab,
    activeTab,
    trackMutes,
    setTrackMute,
    selectedSceneId,
  } = useDaw();

  // Keep refs so the stable event handler always sees fresh values
  const sessionRef        = useRef(session);
  const trackMutesRef     = useRef(trackMutes);
  const selectedSceneRef  = useRef(selectedSceneId);
  const activeTabRef      = useRef(activeTab);

  useEffect(() => { sessionRef.current       = session;       }, [session]);
  useEffect(() => { trackMutesRef.current    = trackMutes;    }, [trackMutes]);
  useEffect(() => { selectedSceneRef.current = selectedSceneId; }, [selectedSceneId]);
  useEffect(() => { activeTabRef.current     = activeTab;     }, [activeTab]);

  useEffect(() => {
    const TRACK_KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
    const TABS: Array<'grid' | 'mixer' | 'fx'> = ['grid', 'mixer', 'fx'];

    const onKeyDown = (e: KeyboardEvent) => {
      // Never fire while typing inside an input / textarea / select
      const el = e.target as HTMLElement;
      if (
        el.tagName === 'INPUT'    ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT'   ||
        el.isContentEditable
      ) return;

      const key = e.key.toLowerCase();

      // ── Space: toggle play / stop ────────────────────────────────────────
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // ── Escape: stop all clips ───────────────────────────────────────────
      if (e.key === 'Escape') {
        e.preventDefault();
        stopAll();
        return;
      }

      // ── Backtick: PANIC ──────────────────────────────────────────────────
      if (key === '`') {
        e.preventDefault();
        triggerPanic();
        return;
      }

      // ── Tab: cycle visible tabs ──────────────────────────────────────────
      if (e.key === 'Tab') {
        e.preventDefault();
        const cur  = activeTabRef.current as string;
        const idx  = TABS.indexOf(cur as any);
        const next = TABS[(idx + 1) % TABS.length];
        setActiveTab(next);
        return;
      }

      // ── 1–8: launch / stop scene ─────────────────────────────────────────
      const sceneNum = parseInt(e.key, 10);
      if (!isNaN(sceneNum) && sceneNum >= 1 && sceneNum <= 8) {
        const scenes = sessionRef.current.scenes;
        const scene  = scenes[sceneNum - 1];
        if (!scene) return;
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + number: stop all clips in that scene row
          sessionRef.current.tracks.forEach((t) => {
            stopClip(scene.id, t.id);
          });
        } else {
          launchScene(scene.id);
        }
        return;
      }

      // ── q–i: launch clip / toggle mute ───────────────────────────────────
      const trackIdx = TRACK_KEYS.indexOf(key);
      if (trackIdx !== -1) {
        const { tracks, scenes } = sessionRef.current;
        const track = tracks[trackIdx];
        if (!track) return;
        e.preventDefault();

        if (e.shiftKey) {
          // Shift + track key: toggle mute
          const muted = trackMutesRef.current[track.id] ?? false;
          setTrackMute(track.id, !muted);
        } else {
          // Plain track key: launch clip in selected (or first) scene
          const sceneId = selectedSceneRef.current ?? scenes[0]?.id;
          if (!sceneId) return;
          launchClip(sceneId, track.id);
        }
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    togglePlay, stopAll, triggerPanic, setActiveTab,
    launchScene, launchClip, stopClip, setTrackMute,
  ]);
}
