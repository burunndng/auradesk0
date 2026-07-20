import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StatsTab from '../tabs/StatsTab';
import * as adminService from '../../../services/adminService';

vi.mock('../../../services/adminService', () => ({
  fetchAppStats: vi.fn(),
  fetchWizardBreakdown: vi.fn(),
  fetchActivityTimeline: vi.fn(),
}));

describe('StatsTab', () => {
  const mockStats = {
    totalUsers: 1540,
    newUsersLast7d: 120,
    newUsersLast30d: 400,
    totalSessions: 12500,
    totalInsights: 8900,
  };

  const mockBreakdown = [
    { wizard_type: 'Shadow Journaling', count: 500 },
    { wizard_type: 'Contemplative Inquiry', count: 300 },
  ];

  const mockTimeline = [
    { date: '2026-03-01', sessions: 50 },
    { date: '2026-03-02', sessions: 65 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.fetchAppStats as any).mockResolvedValue(mockStats);
    (adminService.fetchWizardBreakdown as any).mockResolvedValue(mockBreakdown);
    (adminService.fetchActivityTimeline as any).mockResolvedValue(mockTimeline);
  });

  it('renders loading spinner initially', () => {
    let resolveStats: any;
    (adminService.fetchAppStats as any).mockImplementation(() => new Promise(res => { resolveStats = res; }));

    const { container } = render(<StatsTab />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays total statistics correctly', async () => {
    render(<StatsTab />);

    await waitFor(() => {
      expect(screen.getByText('TOTAL USERS')).toBeInTheDocument();
      expect(screen.getByText('1,540')).toBeInTheDocument();
      
      expect(screen.getByText('NEW (7D)')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();

      expect(screen.getByText('NEW (30D)')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();

      expect(screen.getByText('SESSIONS')).toBeInTheDocument();
      expect(screen.getByText('12,500')).toBeInTheDocument();

      expect(screen.getByText('INSIGHTS')).toBeInTheDocument();
      expect(screen.getByText('8,900')).toBeInTheDocument();
    });
  });

  it('displays session activity timeline properly', async () => {
    render(<StatsTab />);

    await waitFor(() => {
      expect(screen.getByText('Session Activity (30 days)')).toBeInTheDocument();
    });
    
    // Check if the dates from timeline passed are visible
    // It extracts the date slice starting at index 5 (MM-DD)
    expect(screen.getByText('03-01')).toBeInTheDocument();
    expect(screen.getByText('03-02')).toBeInTheDocument();
  });

  it('displays wizard breakdown distribution', async () => {
    render(<StatsTab />);

    await waitFor(() => {
      expect(screen.getByText('Sessions by Wizard')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Shadow Journaling')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    
    expect(screen.getByText('Contemplative Inquiry')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('handles empty timeline and breakdown gracefully', async () => {
    (adminService.fetchWizardBreakdown as any).mockResolvedValue([]);
    (adminService.fetchActivityTimeline as any).mockResolvedValue([]);

    render(<StatsTab />);

    await waitFor(() => {
      expect(screen.getByText('TOTAL USERS')).toBeInTheDocument();
    });

    // Check that sections gracefully return null / don't show the headers if no data
    expect(screen.queryByText('Session Activity (30 days)')).not.toBeInTheDocument();
    expect(screen.queryByText('Sessions by Wizard')).not.toBeInTheDocument();
  });
});
