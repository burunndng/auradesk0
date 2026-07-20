import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForumTab from '../tabs/ForumTab';
import * as adminService from '../../../services/adminService';
import * as forumModerationService from '../../../services/forumModerationService';
import * as forumService from '../../../services/forumService';

// Mock dependencies
vi.mock('../../../services/adminService', () => ({
  deleteForumThread: vi.fn(),
}));

vi.mock('../../../services/forumModerationService', () => ({
  getFlags: vi.fn(),
  resolveFlag: vi.fn(),
}));

vi.mock('../../../services/forumService', () => ({
  getThreads: vi.fn(),
}));

describe('Admin ForumTab', () => {
  const mockFlags = [
    {
      id: 'flag-1',
      reason: 'spam',
      post_id: 'post-1',
      reporter_id: 'user-1',
      reporter_name: 'Alice',
      created_at: '2026-03-08T10:00:00Z',
      resolved: false,
      post_content: 'Buy cheap items here!',
    },
    {
      id: 'flag-2',
      reason: 'crisis',
      post_id: 'post-2',
      reporter_id: 'user-2',
      reporter_name: 'Bob',
      created_at: '2026-03-09T10:00:00Z',
      resolved: true,
      post_content: 'Triggering content',
    }
  ];

  const mockThreads = {
    threads: [
      {
        id: 'thread-1',
        title: 'Thread title 1',
        category: 'general',
        reply_count: 5,
        is_pinned: true,
      }
    ],
    total: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (forumModerationService.getFlags as any).mockResolvedValue(mockFlags);
    (forumModerationService.resolveFlag as any).mockResolvedValue(true);
    (forumService.getThreads as any).mockResolvedValue(mockThreads);
    (adminService.deleteForumThread as any).mockResolvedValue(true);
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('renders moderation queue by default', async () => {
    render(<ForumTab />);

    await waitFor(() => {
      // Sub tabs
      expect(screen.getByRole('button', { name: /Moderation Queue/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Threads/i })).toBeInTheDocument();
    });

    // Check if flags load
    await waitFor(() => {
      expect(screen.getByText('spam')).toBeInTheDocument();
      expect(screen.getByText(/Buy cheap items here!/i)).toBeInTheDocument();
    });
  });

  it('resolves a flag by dismissing it', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    await waitFor(() => {
      // Find dismiss button attached to the active flag
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissBtn);

    expect(forumModerationService.resolveFlag).toHaveBeenCalledWith('flag-1', 'dismiss');
    
    // Optimistic UI updates
    await waitFor(() => {
      expect(screen.queryByText(/Buy cheap items here!/i)).not.toBeInTheDocument();
    });
  });

  it('resolves a flag by deleting the post', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Post' })).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: 'Delete Post' });
    await user.click(deleteBtn);

    expect(forumModerationService.resolveFlag).toHaveBeenCalledWith('flag-1', 'delete_post');
  });

  it('switches to threads sub-tab and loads threads', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Threads/i })).toBeInTheDocument();
    });

    const threadsTab = screen.getByRole('button', { name: /Threads/i });
    await user.click(threadsTab);

    expect(forumService.getThreads).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Thread title 1')).toBeInTheDocument();
      expect(screen.getByText('general')).toBeInTheDocument();
      expect(screen.getByText('5 replies')).toBeInTheDocument();
      expect(screen.getByText('📌 pinned')).toBeInTheDocument();
    });
  });

  it('deletes a thread successfully after confirmation', async () => {
    const user = userEvent.setup();
    render(<ForumTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Threads/i })).toBeInTheDocument();
    });

    // switch to threads
    await user.click(screen.getByRole('button', { name: /Threads/i }));

    await waitFor(() => {
      expect(screen.getByText('Thread title 1')).toBeInTheDocument();
    });

    // Delete button
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Delete this thread and all its posts?');
    expect(adminService.deleteForumThread).toHaveBeenCalledWith('thread-1');

    await waitFor(() => {
      expect(screen.queryByText('Thread title 1')).not.toBeInTheDocument();
    });
  });
});
