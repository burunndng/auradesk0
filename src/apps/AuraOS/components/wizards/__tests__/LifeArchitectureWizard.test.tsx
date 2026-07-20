import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../tests/utils/test-utils';
import LifeArchitectureWizard from '../LifeArchitectureWizard';
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
    structuralIssues: ['Time scarcity', 'Energy depletion'],
    energyBottlenecks: ['Too many roles', 'Unclear boundaries'],
    habitRecommendations: ['Morning anchor practice', 'Evening wind-down'],
    architectureRefinement: 'Consolidate roles and create time blocks',
    nextWizard: 'role-alignment',
  }),
}));

vi.mock('../../../services/insightGenerator', () => ({
  generateInsightFromSession: vi.fn().mockResolvedValue(undefined),
}));

describe('LifeArchitectureWizard', () => {
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
        <LifeArchitectureWizard {...defaultProps} isOpen={false} />
      </AuthProvider>
    );
    expect(screen.queryByText(/Life Architecture/i)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <AuthProvider>
        <LifeArchitectureWizard {...defaultProps} />
      </AuthProvider>
    );
    expect(screen.getByText(/Its Quadrant: Structural Design/i)).toBeInTheDocument();
  });
});
