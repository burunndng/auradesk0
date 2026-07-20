import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../tests/utils/test-utils';
import RelationalFieldMapper from '../RelationalFieldMapper';
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
    dominantRole: 'Caretaker',
    projectionTargets: ['Partner', 'Boss'],
    shadowHypothesis: 'Disowned assertiveness',
    attachmentPattern: 'anxious',
    developmentalEdge: 'Learning to prioritize own needs',
    practicePerStrain: [{ relationship: 'Partner', practice: 'IFS Session' }],
    recommendedWizard: '321',
  }),
}));

vi.mock('../../../services/insightGenerator', () => ({
  generateInsightFromSession: vi.fn().mockResolvedValue(undefined),
}));

describe('RelationalFieldMapper', () => {
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
        <RelationalFieldMapper {...defaultProps} isOpen={false} />
      </AuthProvider>
    );
    expect(screen.queryByText(/Relational Field Mapper/i)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <AuthProvider>
        <RelationalFieldMapper {...defaultProps} />
      </AuthProvider>
    );
    expect(screen.getByText(/relational.*we.*quadrants/i)).toBeInTheDocument();
  });
});
