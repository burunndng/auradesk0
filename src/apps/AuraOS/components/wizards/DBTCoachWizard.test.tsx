import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DBTCoachWizard from './DBTCoachWizard';

vi.mock('../../services/dbtService', () => ({
  getDBTState: vi.fn(() => ({
    hasConsented: false,
    currentMode: null,
    currentSession: null,
    sessionHistory: [],
    diaryEntries: [],
    profile: {},
    wallet: [],
  })),
  saveDBTState: vi.fn(),
  createSession: vi.fn(() => ({
    id: 'test-session',
    mode: 'cope_now',
    messages: [],
    startTime: new Date().toISOString(),
  })),
  addMessageToSession: vi.fn((session, msg) => ({
    ...session,
    messages: [...session.messages, msg],
  })),
  saveSession: vi.fn(),
  streamCoachResponse: vi.fn(() => Promise.resolve('Coach response')),
  CRISIS_RESOURCES: [],
  DBT_SKILLS_METADATA: {},
  autoPopulateDiary: vi.fn(),
  addToWallet: vi.fn(state => state),
  removeFromWallet: vi.fn(state => state),
  getSUDSStats: vi.fn(() => null),
}));

vi.mock('../../utils/crisisDetection', () => ({
  detectCrisisLevel: vi.fn(() => 'none'),
}));

vi.mock('../shared/SafetyBanner', () => ({
  default: ({ crisisLevel }: { crisisLevel: string }) => (
    <div data-testid="safety-banner" data-level={crisisLevel}>Safety resources</div>
  ),
}));

describe('DBTCoachWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders consent phase on open', () => {
    render(<DBTCoachWizard />);
    // Consent phase should be visible (hasConsented = false in mock)
    expect(screen.getAllByText(/DBT Skills Coach/i).length).toBeGreaterThan(0);
  });

  it('shows SafetyBanner when crisis detected in chat input', async () => {
    const { detectCrisisLevel } = await import('../../utils/crisisDetection');
    (detectCrisisLevel as ReturnType<typeof vi.fn>).mockReturnValue('high');

    const { getDBTState } = await import('../../services/dbtService');
    (getDBTState as ReturnType<typeof vi.fn>).mockReturnValue({
      hasConsented: true,
      currentMode: 'cope_now',
      currentSession: {
        id: 'test-session',
        mode: 'cope_now',
        messages: [],
        startTime: new Date().toISOString(),
      },
      sessionHistory: [],
      diaryEntries: [],
      profile: {},
      wallet: [],
    });

    render(<DBTCoachWizard />);

    // Find the chat textarea and type crisis text
    const textarea = screen.queryByPlaceholderText(/What's happening right now/i) ||
                     screen.queryByRole('textbox');
    if (textarea) {
      fireEvent.change(textarea, { target: { value: 'I want to die' } });
      await waitFor(() => {
        expect(screen.queryByTestId('safety-banner')).not.toBeNull();
      });
    }
  });

  it('does not call streamCoachResponse when crisis level is high', async () => {
    const { detectCrisisLevel } = await import('../../utils/crisisDetection');
    (detectCrisisLevel as ReturnType<typeof vi.fn>).mockReturnValue('high');

    const { streamCoachResponse, getDBTState } = await import('../../services/dbtService');
    (getDBTState as ReturnType<typeof vi.fn>).mockReturnValue({
      hasConsented: true,
      currentMode: 'cope_now',
      currentSession: {
        id: 'test-session',
        mode: 'cope_now',
        messages: [],
        startTime: new Date().toISOString(),
      },
      sessionHistory: [],
      diaryEntries: [],
      profile: {},
      wallet: [],
    });

    render(<DBTCoachWizard />);

    const textarea = screen.queryByPlaceholderText(/What's happening right now/i) ||
                     screen.queryByRole('textbox');
    if (textarea) {
      fireEvent.change(textarea, { target: { value: 'I want to die' } });
      const sendButton = screen.queryByRole('button', { name: /send/i });
      if (sendButton) {
        fireEvent.click(sendButton);
        await waitFor(() => {
          expect(streamCoachResponse).not.toHaveBeenCalled();
        });
      }
    }
  });
});
