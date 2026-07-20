/**
 * ForumTab Integration Tests
 * Tests: thread listing, creation, search, filtering, pagination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForumTab from '../ForumTab';
import * as forumService from '../../../services/forumService';
import * as authService from '../../../services/authService';

// Mock dependencies
vi.mock('../../../services/forumService');
vi.mock('../../../services/authService');
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com', isAdmin: false },
    isAuthenticated: true,
  }),
}));

describe('ForumTab', () => {
  const mockThreads = [
    {
      id: 'thread-1',
      title: 'Getting Started with AOS',
      description: 'How do I begin my integral practice?',
      category: 'general-discussion',
      user_id: 'user-456',
      author: { id: 'user-456', display_name: 'Alex', avatar_url: null },
      reply_count: 5,
      view_count: 42,
      created_at: '2026-03-08T10:00:00Z',
      is_pinned: false,
      is_archived: false,
    },
    {
      id: 'thread-2',
      title: 'Shadow Work Breakthrough',
      description: 'Had a major insight during IFS session',
      category: 'shadow-work',
      user_id: 'user-789',
      author: { id: 'user-789', display_name: 'Jordan', avatar_url: null },
      reply_count: 12,
      view_count: 89,
      created_at: '2026-03-07T15:30:00Z',
      is_pinned: false,
      is_archived: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (forumService.getThreads as any).mockResolvedValue({
      threads: mockThreads,
      total: 2,
    });
  });

  it('renders forum threads list', async () => {
    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started with AOS')).toBeInTheDocument();
      expect(screen.getByText('Shadow Work Breakthrough')).toBeInTheDocument();
    });
  });

  it('displays thread metadata (replies, views)', async () => {
    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByText(/5 replies/)).toBeInTheDocument();
      expect(screen.getByText(/42 views/)).toBeInTheDocument();
    });
  });

  it('filters threads by category', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    // Click shadow-work category filter
    const shadowFilter = await screen.findByRole('button', { name: /shadow-work/i });
    await user.click(shadowFilter);

    await waitFor(() => {
      expect(forumService.getThreads).toHaveBeenCalledWith('shadow-work', expect.any(Object));
    });
  });

  it('searches threads by title/description', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    const searchInput = await screen.findByPlaceholderText(/search threads/i);
    await user.type(searchInput, 'shadow');

    await waitFor(() => {
      expect(forumService.getThreads).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: 'shadow',
        })
      );
    });
  });

  it('sorts by trending (most recent engagement)', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    const sortButton = await screen.findByRole('button', { name: /trending/i });
    await user.click(sortButton);

    await waitFor(() => {
      expect(forumService.getThreads).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ sort: 'trending' })
      );
    });
  });

  it('opens thread detail on click', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    await waitFor(() => {
      const threadLink = screen.getByText('Getting Started with AOS');
      expect(threadLink).toBeInTheDocument();
    });

    const threadLink = screen.getByText('Getting Started with AOS');
    await user.click(threadLink);

    // ThreadView modal should open
    await waitFor(() => {
      expect(screen.getByText(/add your reply/i)).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    (forumService.getThreads as any).mockResolvedValueOnce({
      threads: mockThreads,
      total: 50, // 3 pages
    });

    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started with AOS')).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(forumService.getThreads).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ offset: 20 })
      );
    });
  });

  it('handles error state gracefully', async () => {
    (forumService.getThreads as any).mockRejectedValue(new Error('Network error'));

    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByText(/could not load threads/i)).toBeInTheDocument();
    });
  });

  it('shows unread indicator for threads with new activity', async () => {
    const threadsWithUnread = [
      { ...mockThreads[0], unread: true },
      mockThreads[1],
    ];

    (forumService.getThreads as any).mockResolvedValueOnce({
      threads: threadsWithUnread,
      total: 2,
    });

    render(<ForumTab />);

    await waitFor(() => {
      const unreadIndicators = screen.getAllByTestId('unread-badge');
      expect(unreadIndicators.length).toBe(1);
    });
  });

  it('displays empty state when no threads exist', async () => {
    (forumService.getThreads as any).mockResolvedValueOnce({
      threads: [],
      total: 0,
    });

    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByText(/no discussions yet/i)).toBeInTheDocument();
    });
  });
});
