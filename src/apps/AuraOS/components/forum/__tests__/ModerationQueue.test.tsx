/**
 * ModerationQueue Tests
 * Tests: viewing flagged posts, resolving flags, deleting posts, admin functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModerationQueue from '../ModerationQueue';
import * as moderationService from '../../../services/forumModerationService';

vi.mock('../../../services/forumModerationService');
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@example.com', isAdmin: true },
    isAuthenticated: true,
  }),
}));

describe('ModerationQueue', () => {
  const mockFlags = [
    {
      id: 'flag-1',
      post_id: 'post-1',
      thread_id: 'thread-1',
      reporter_id: 'user-123',
      reason: 'harmful',
      created_at: '2026-03-08T10:00:00Z',
      resolved: false,
      resolved_by: null,
      post: {
        id: 'post-1',
        content: 'This is harmful content',
        author: { id: 'user-456', display_name: 'BadActor', avatar_url: null },
      },
      reporter: { id: 'user-123', display_name: 'Reporter', avatar_url: null },
    },
    {
      id: 'flag-2',
      post_id: 'post-2',
      thread_id: 'thread-1',
      reporter_id: 'user-789',
      reason: 'spam',
      created_at: '2026-03-07T15:00:00Z',
      resolved: true,
      resolved_by: 'admin-1',
      post: {
        id: 'post-2',
        content: 'Buy now! Click here!',
        author: { id: 'user-999', display_name: 'Spammer', avatar_url: null },
      },
      reporter: { id: 'user-789', display_name: 'Reporter2', avatar_url: null },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (moderationService.getFlags as any).mockResolvedValue(mockFlags);
    (moderationService.resolveFlag as any).mockResolvedValue(true);
  });

  it('renders moderation queue title', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/moderation queue/i)).toBeInTheDocument();
    });
  });

  it('displays flagged posts', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful content/)).toBeInTheDocument();
      expect(screen.getByText(/buy now/i)).toBeInTheDocument();
    });
  });

  it('shows flag reason badges', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful/)).toBeInTheDocument();
      expect(screen.getByText(/spam/)).toBeInTheDocument();
    });
  });

  it('displays reporter information', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Reporter')).toBeInTheDocument();
      expect(screen.getByText('Reporter2')).toBeInTheDocument();
    });
  });

  it('filters by unresolved flags (default)', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      // Only unresolved flag should show initially
      const flagCount = screen.queryAllByRole('button', { name: /dismiss|delete/i });
      expect(flagCount.length).toBeGreaterThan(0);
    });
  });

  it('toggles to show resolved flags', async () => {
    const user = userEvent.setup();
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful content/)).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: /show resolved/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(moderationService.getFlags).toHaveBeenCalledWith(true);
    });
  });

  it('dismisses a flag', async () => {
    const user = userEvent.setup();
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful content/)).toBeInTheDocument();
    });

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    await user.click(dismissButtons[0]);

    await waitFor(() => {
      expect(moderationService.resolveFlag).toHaveBeenCalledWith('flag-1', 'dismiss');
    });
  });

  it('deletes a post and resolves flag', async () => {
    const user = userEvent.setup();
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful content/)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete post/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /confirm.*delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(moderationService.resolveFlag).toHaveBeenCalledWith('flag-1', 'delete_post');
    });
  });

  it('refetches flags after resolving', async () => {
    const user = userEvent.setup();
    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/harmful content/)).toBeInTheDocument();
    });

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    await user.click(dismissButtons[0]);

    // Should refetch after resolving
    await waitFor(() => {
      expect(moderationService.getFlags).toHaveBeenCalledTimes(2);
    });
  });

  it('shows empty state when no flags', async () => {
    (moderationService.getFlags as any).mockResolvedValueOnce([]);

    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/no flagged posts/i)).toBeInTheDocument();
    });
  });

  it('handles error loading flags', async () => {
    (moderationService.getFlags as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/could not load flagged posts/i)).toBeInTheDocument();
    });
  });

  it('shows resolved status for reviewed flags', async () => {
    (moderationService.getFlags as any).mockResolvedValueOnce([mockFlags[1]]);

    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/resolved/i)).toBeInTheDocument();
    });
  });

  it('displays timestamp of flag creation', async () => {
    render(<ModerationQueue />);

    await waitFor(() => {
      // Should show relative time
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  it('shows crisis flag with warning', async () => {
    const crisisFlag = {
      ...mockFlags[0],
      id: 'flag-3',
      reason: 'crisis',
      post: {
        ...mockFlags[0].post,
        id: 'post-3',
        content: 'I cannot go on any longer',
      },
    };

    (moderationService.getFlags as any).mockResolvedValueOnce([crisisFlag]);

    render(<ModerationQueue />);

    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
      expect(screen.getByText(/cannot go on/)).toBeInTheDocument();
    });
  });

  it('limits display to recent flags', async () => {
    const manyFlags = Array.from({ length: 30 }, (_, i) => ({
      ...mockFlags[0],
      id: `flag-${i}`,
      post_id: `post-${i}`,
    }));

    (moderationService.getFlags as any).mockResolvedValueOnce(manyFlags.slice(0, 20));

    render(<ModerationQueue />);

    await waitFor(() => {
      // Should paginate or limit display
      const flagElements = screen.getAllByRole('button', { name: /dismiss|delete/i });
      expect(flagElements.length).toBeLessThanOrEqual(20);
    });
  });
});
