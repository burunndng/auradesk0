import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InsightsTab from '../tabs/InsightsTab';
import * as adminService from '../../../services/adminService';

vi.mock('../../../services/adminService', () => ({
  fetchGlobalInsights: vi.fn(),
}));

describe('InsightsTab', () => {
  const mockInsights = [
    {
      id: 'ins-1',
      mind_tool_type: 'Shadow Journaling',
      detected_pattern: 'User consistently avoids conflict',
      confidence_score: 0.85,
      created_at: '2026-03-08T10:00:00Z',
      user_id: 'user-12345678',
    },
    {
      id: 'ins-2',
      mind_tool_type: 'Shadow Journaling',
      detected_pattern: 'Projecting insecurities onto coworkers',
      confidence_score: 0.65,
      created_at: '2026-03-09T10:00:00Z',
      user_id: 'user-87654321',
    },
    {
      id: 'ins-3',
      mind_tool_type: 'Contemplative Inquiry',
      detected_pattern: 'Deepening sense of spaciousness',
      confidence_score: 0.95,
      created_at: '2026-03-10T10:00:00Z',
      user_id: 'user-11111111',
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.fetchGlobalInsights as any).mockResolvedValue(mockInsights);
  });

  it('renders loading spinner initially', () => {
    let resolveInsights: any;
    (adminService.fetchGlobalInsights as any).mockImplementation(() => new Promise(res => { resolveInsights = res; }));

    const { container } = render(<InsightsTab />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays global insights distribution and list', async () => {
    render(<InsightsTab />);

    await waitFor(() => {
      // Aggregated counts by type
      expect(screen.getByText('Shadow Journaling')).toBeInTheDocument();
      expect(screen.getByText('Contemplative Inquiry')).toBeInTheDocument();
    });

    // Check count numbers inside the distribution buttons
    expect(screen.getByText('2')).toBeInTheDocument(); // Shadow journal count
    expect(screen.getByText('1')).toBeInTheDocument(); // Contemplative inquiry count

    // Check patterns in recent insights feed
    expect(screen.getByText('User consistently avoids conflict')).toBeInTheDocument();
    expect(screen.getByText('Deepening sense of spaciousness')).toBeInTheDocument();
  });

  it('filters insights by wizard type when a distribution item is clicked', async () => {
    const user = userEvent.setup();
    render(<InsightsTab />);

    await waitFor(() => {
      expect(screen.getByText('Contemplative Inquiry')).toBeInTheDocument();
    });

    // Both patterns visible initially
    expect(screen.getByText('User consistently avoids conflict')).toBeInTheDocument();
    expect(screen.getByText('Deepening sense of spaciousness')).toBeInTheDocument();

    // Click on Contemplative Inquiry to filter
    const filterBtn = screen.getByRole('button', { name: /Contemplative Inquiry/i });
    await user.click(filterBtn);

    // Filter indicator appears
    expect(screen.getByText('Filtered:')).toBeInTheDocument();

    // The feed should only show Contemplative Insight
    expect(screen.getByText('Deepening sense of spaciousness')).toBeInTheDocument();
    expect(screen.queryByText('User consistently avoids conflict')).not.toBeInTheDocument();
  });

  it('clears filter when clear button is clicked or type is toggled again', async () => {
    const user = userEvent.setup();
    render(<InsightsTab />);

    await waitFor(() => {
      expect(screen.getByText('Shadow Journaling')).toBeInTheDocument();
    });

    const filterBtn = screen.getByRole('button', { name: /Shadow Journaling/i });
    
    // Apply filter
    await user.click(filterBtn);
    expect(screen.queryByText('Deepening sense of spaciousness')).not.toBeInTheDocument();

    // Click "✕ Clear"
    const clearBtn = screen.getByRole('button', { name: /✕ Clear/i });
    await user.click(clearBtn);

    // Filter removed, all insights visible again
    expect(screen.getByText('Deepening sense of spaciousness')).toBeInTheDocument();
  });

  it('shows empty state when no insights exist in DB', async () => {
    (adminService.fetchGlobalInsights as any).mockResolvedValue([]);
    render(<InsightsTab />);

    await waitFor(() => {
      expect(screen.getByText('No insights in database.')).toBeInTheDocument();
      expect(screen.getByText('No insights found.')).toBeInTheDocument();
    });
  });
});
