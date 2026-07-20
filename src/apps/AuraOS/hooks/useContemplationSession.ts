import { useCallback, useRef, useEffect } from 'react';
import { useWizardDraft } from './useWizardDraft';
import { MajorArcanaCard } from '../data/majorArcana';
import { ResonanceResponse, ClosingResponse } from '../services/archetypalResonanceGenerator';
import { StorageManager } from '../.claude/lib/storageManager';

export type ExperienceLevel = 'new' | 'some' | 'experienced';
export type PreferredFace = 'first' | 'second' | 'third';
export type SessionDepth = 1 | 2 | 3 | 4 | 5;

export type ContemplationStep =
  | 'gateway' | 'ground' | 'draw' | 'gaze'
  | 'first-face' | 'second-face' | 'third-face'
  | 'resonance' | 'release' | 'harvest' | 'closing';

export interface ContemplationSessionState {
  step: ContemplationStep;
  experienceLevel: ExperienceLevel | null;
  card: MajorArcanaCard | null;
  gazeComplete: boolean;
  gazeElapsed: number;
  hasRedrawn: boolean;
  firstFaceResponse: string;
  secondFaceResponse: string;
  thirdFaceResponse: string;
  resonanceData: ResonanceResponse | null;
  harvestSentence: string;
  preferredFace: PreferredFace | null;
  sessionDepth: SessionDepth | null;
  closingData: ClosingResponse | null;
}

export interface SavedContemplationSession {
  id: string;
  date: string;
  cardId: string;
  cardName: string;
  harvestSentence: string;
  preferredFace: PreferredFace;
  sessionDepth: SessionDepth;
}

const DRAFT_KEY = 'aura-draft-archetypal-contemplation';
const SESSIONS_KEY = 'aura-archetypal-contemplation-sessions';

const initialState: ContemplationSessionState = {
  step: 'gateway',
  experienceLevel: null,
  card: null,
  gazeComplete: false,
  gazeElapsed: 0,
  hasRedrawn: false,
  firstFaceResponse: '',
  secondFaceResponse: '',
  thirdFaceResponse: '',
  resonanceData: null,
  harvestSentence: '',
  preferredFace: null,
  sessionDepth: null,
  closingData: null,
};

export function useContemplationSession() {
  const [state, updateState, , clearDraft] = useWizardDraft<ContemplationSessionState>(DRAFT_KEY, initialState);
  const gazeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up gaze timer on unmount
  useEffect(() => {
    return () => {
      if (gazeInterval.current) clearInterval(gazeInterval.current);
    };
  }, []);

  const startGaze = useCallback(() => {
    if (gazeInterval.current) clearInterval(gazeInterval.current);
    gazeInterval.current = setInterval(() => {
      updateState((prev: ContemplationSessionState) => {
        const next = prev.gazeElapsed + 1;
        const threshold = prev.experienceLevel === 'experienced' ? 90 : 45;
        return {
          ...prev,
          gazeElapsed: next,
          gazeComplete: next >= threshold,
        };
      });
    }, 1000);
  }, [updateState]);

  const stopGaze = useCallback(() => {
    if (gazeInterval.current) {
      clearInterval(gazeInterval.current);
      gazeInterval.current = null;
    }
  }, []);

  const getPreviousSessions = useCallback((): SavedContemplationSession[] => {
    try {
      const raw = StorageManager.getUntyped(SESSIONS_KEY);
      if (Array.isArray(raw)) return raw as SavedContemplationSession[];
      return [];
    } catch {
      return [];
    }
  }, []);

  const getContemplatedCardIds = useCallback((): string[] => {
    return getPreviousSessions().map((s) => s.cardId);
  }, [getPreviousSessions]);

  const saveSession = useCallback(() => {
    if (!state.card || !state.preferredFace || !state.sessionDepth) return;
    const session: SavedContemplationSession = {
      id: `ac-${Date.now()}`,
      date: new Date().toISOString(),
      cardId: state.card.id,
      cardName: state.card.name,
      harvestSentence: state.harvestSentence,
      preferredFace: state.preferredFace,
      sessionDepth: state.sessionDepth,
    };
    const existing = getPreviousSessions();
    existing.push(session);
    StorageManager.setUntyped(SESSIONS_KEY, existing);
  }, [state, getPreviousSessions]);

  const clearSession = useCallback(() => {
    stopGaze();
    clearDraft();
  }, [stopGaze, clearDraft]);

  return {
    state,
    updateState,
    saveSession,
    getPreviousSessions,
    getContemplatedCardIds,
    startGaze,
    stopGaze,
    gazeComplete: state.gazeComplete,
    clearSession,
  };
}
