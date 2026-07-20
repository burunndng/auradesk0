import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../tests/utils/test-utils';
import CulturalShadowExcavator from '../CulturalShadowExcavator';
import { AuthProvider } from '../../../contexts/AuthContext';
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../contexts/InsightsContext', () => ({
  useInsightsContext: () => ({ setIntegratedInsights: vi.fn(), integratedInsights: [] }),
  InsightsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../../services/ai/aiCore', () => ({
  callGrokThenAIJson: vi.fn().mockResolvedValue({
    collectiveShadowThemes: ['Denial of privilege', 'Bootstrap myth'],
    personalAlignment: 'Strong internalization of scarcity mindset',
    altitudeEstimate: 'orange',
    liberationMoves: [
      { pattern: 'Scarcity identity', practice: 'Golden Shadow on abundance' },
    ],
    inheritedBeliefs: ['Hard work = worth', 'Emotions = weakness'],
    recommendedWizard: '321',
  }),
}));

vi.mock('../../../services/insightGenerator', () => ({
  generateInsightFromSession: vi.fn().mockResolvedValue(undefined),
}));

describe('CulturalShadowExcavator', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSaveSession: vi.fn(),
    markInsightAsAddressed: vi.fn(),
    userId: 'test-user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AuthProvider>
        <CulturalShadowExcavator {...defaultProps} isOpen={false} />
      </AuthProvider>
    );
    expect(screen.queryByText(/Cultural Shadow Excavation/i)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <AuthProvider>
        <CulturalShadowExcavator {...defaultProps} />
      </AuthProvider>
    );
    expect(screen.getByText(/Lower-Left.*Quadrant/i)).toBeInTheDocument();
  });
});
