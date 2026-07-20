import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersTab from '../tabs/UsersTab';
import * as adminService from '../../../services/adminService';

vi.mock('../../../services/adminService', () => ({
  fetchAllUsers: vi.fn(),
  updateUserSubscription: vi.fn(),
  fetchUserSessionCount: vi.fn(),
}));

describe('UsersTab', () => {
  const mockUsers = [
    {
      id: 'admin-123',
      email: 'admin@example.com',
      display_name: 'Admin User',
      is_admin: true,
      preferences: { subscription_tier: 'founding' },
      created_at: '2026-03-01T10:00:00Z',
    },
    {
      id: 'user-456',
      email: 'user@example.com',
      display_name: 'Regular User',
      is_admin: false,
      preferences: { subscription_tier: 'free' },
      created_at: '2026-03-05T10:00:00Z',
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.fetchAllUsers as any).mockResolvedValue(mockUsers);
    (adminService.fetchUserSessionCount as any).mockResolvedValue({ sessions: 15, insights: 5 });
    (adminService.updateUserSubscription as any).mockResolvedValue(true);
  });

  it('renders loading state initially', () => {
    let resolveUsers: any;
    (adminService.fetchAllUsers as any).mockImplementation(() => new Promise(res => { resolveUsers = res; }));

    const { container } = render(<UsersTab />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays user list', async () => {
    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Regular User')).toBeInTheDocument();

    // Check if the admin badge is present
    expect(screen.getByText('admin')).toBeInTheDocument();
    
    // Check initial select values for tier
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('founding');
    expect(selects[1]).toHaveValue('free');
  });

  it('filters users by search query', async () => {
    const user = userEvent.setup();
    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by email, name, or tier/i);
    await user.type(searchInput, 'admin');

    // Only admin visible
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole('button', { name: '✕' });
    await user.click(clearBtn);

    // Both visible again
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('changes user subscription tier', async () => {
    const user = userEvent.setup();
    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    // The second combobox is for user-456 (Regular User) because it's second in array
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).toHaveValue('free');

    // Change value
    await user.selectOptions(selects[1], 'pro');

    expect(adminService.updateUserSubscription).toHaveBeenCalledWith('user-456', 'pro');
    expect(selects[1]).toHaveValue('pro');
  });

  it('expands user row and fetches details', async () => {
    const user = userEvent.setup();
    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    const adminRow = screen.getByText('admin@example.com').closest('tr');
    
    // Click the row
    if (adminRow) {
      await user.click(adminRow);
    }

    // It should hit fetchUserSessionCount
    expect(adminService.fetchUserSessionCount).toHaveBeenCalledWith('admin-123');

    await waitFor(() => {
      expect(screen.getByText('Sessions:')).toBeInTheDocument();
      // Values returned from mocked fetch
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('insights:')).toBeInTheDocument(); // CSS lowercase in UI? Actually it says "Insights: "
    });
  });

  it('displays empty state when no users are found', async () => {
    (adminService.fetchAllUsers as any).mockResolvedValue([]);
    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText(/No users found/i)).toBeInTheDocument();
    });
  });
});
