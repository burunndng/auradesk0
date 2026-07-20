/**
 * ThreadView Integration Tests
 * Tests: posting replies, liking, flagging, mentions, notifications, crisis detection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadView from '../ThreadView';
import * as forumService from '../../../services/forumService';
import * as moderationService from '../../../services/forumModerationService';
import { detectCrisisLevel } from '../../../utils/crisisDetection';

vi.mock('../../../services/forumService');
vi.mock('../../../services/forumModerationService');
vi.mock('../../../utils/crisisDetection');
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', displayName: 'TestUser', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));
vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}));

describe('ThreadView', () => {
  const mockThread = {
    id: 'thread-1',
    title: 'Test Discussion',
    description: 'Testing thread view',
    category: 'general-discussion',
    user_id: 'user-456',
    author: { id: 'user-456', display_name: 'ThreadAuthor', avatar_url: null },
    reply_count: 2,
    view_count: 10,
    created_at: '2026-03-08T10:00:00Z',
    is_pinned: false,
    is_archived: false,
    posts: [
      {
        id: 'post-1',
        thread_id: 'thread-1',
        user_id: 'user-456',
        content: 'This is the original post',
        author: { id: 'user-456', display_name: 'ThreadAuthor', avatar_url: null },
        likes_count: 3,
        created_at: '2026-03-08T10:00:00Z',
        is_deleted: false,
      },
      {
        id: 'post-2',
        thread_id: 'thread-1',
        user_id: 'user-789',
        content: 'Great question! @testuser you should try this approach',
        author: { id: 'user-789', display_name: 'Responder', avatar_url: null },
        likes_count: 1,
        created_at: '2026-03-08T11:00:00Z',
        is_deleted: false,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (forumService.getThread as any).mockResolvedValue(mockThread);
    (forumService.createPost as any).mockResolvedValue({
      id: 'post-3',
      thread_id: 'thread-1',
      user_id: 'user-123',
      content: 'New reply',
      author: { id: 'user-123', display_name: 'TestUser', avatar_url: null },
      likes_count: 0,
      created_at: '2026-03-08T12:00:00Z',
      is_deleted: false,
    });
    (detectCrisisLevel as any).mockReturnValue('none');
  });

  it('renders thread with posts', async () => {
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Discussion')).toBeInTheDocument();
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
      expect(screen.getByText(/Great question/)).toBeInTheDocument();
    });
  });

  it('posts a reply', async () => {
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, 'This is my reply');

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(forumService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          thread_id: 'thread-1',
          content: 'This is my reply',
        })
      );
    });
  });

  it('parses @mentions in replies', async () => {
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, '@testuser thanks for the insight');

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    await user.click(submitButton);

    // Verify createPost was called (mention parsing happens in service)
    await waitFor(() => {
      expect(forumService.createPost).toHaveBeenCalled();
    });
  });

  it('supports markdown preview in replies', async () => {
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, '**bold** and *italic*');

    // Click preview button
    const previewButton = screen.getByRole('button', { name: /preview/i });
    await user.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/bold/)).toBeInTheDocument();
    });
  });

  it('detects crisis content and blocks submission', async () => {
    (detectCrisisLevel as any).mockReturnValue('high');
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, 'I want to hurt myself');

    const submitButton = screen.getByRole('button', { name: /post reply/i });

    // Button should be disabled for HIGH crisis
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('banner')).toBeInTheDocument(); // SafetyBanner
    });
  });

  it('allows crisis submission with confirmation', async () => {
    (detectCrisisLevel as any).mockReturnValue('concern');
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, 'feeling a bit down today');

    // First submit is blocked with CONCERN level
    let submitButton = screen.getByRole('button', { name: /post reply/i });
    await user.click(submitButton);

    // User must confirm
    const confirmButton = await screen.findByRole('button', { name: /understand.*post anyway/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(forumService.createPost).toHaveBeenCalled();
    });
  });

  it('likes a post', async () => {
    const user = userEvent.setup();
    (forumService.likePost as any).mockResolvedValue(true);

    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByRole('button', { name: /like/i });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(forumService.likePost).toHaveBeenCalledWith('post-1');
    });
  });

  it('unlikes a post', async () => {
    const user = userEvent.setup();
    (forumService.unlikePost as any).mockResolvedValue(true);

    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
    });

    // Click like first
    let likeButtons = screen.getAllByRole('button', { name: /like/i });
    await user.click(likeButtons[0]);

    // Click again to unlike
    likeButtons = screen.getAllByRole('button', { name: /unlike|liked/i });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(forumService.unlikePost).toHaveBeenCalledWith('post-1');
    });
  });

  it('opens flag modal for post flagging', async () => {
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
    });

    const flagButtons = screen.getAllByRole('button', { name: /flag/i });
    await user.click(flagButtons[0]);

    // Flag modal should open
    await waitFor(() => {
      expect(screen.getByText(/flag post/i)).toBeInTheDocument();
      expect(screen.getByText(/spam/i)).toBeInTheDocument();
      expect(screen.getByText(/harmful/i)).toBeInTheDocument();
    });
  });

  it('submits flag with reason', async () => {
    const user = userEvent.setup();
    (moderationService.flagPost as any).mockResolvedValue(true);

    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
    });

    // Open flag modal
    const flagButtons = screen.getAllByRole('button', { name: /flag/i });
    await user.click(flagButtons[0]);

    // Select reason
    const harmfulButton = await screen.findByRole('button', { name: /harmful/i });
    await user.click(harmfulButton);

    // Submit flag
    const submitFlagButton = screen.getByRole('button', { name: /^flag$/i });
    await user.click(submitFlagButton);

    await waitFor(() => {
      expect(moderationService.flagPost).toHaveBeenCalledWith('post-1', 'thread-1', 'harmful');
    });
  });

  it('shows success message after flagging', async () => {
    const user = userEvent.setup();
    (moderationService.flagPost as any).mockResolvedValue(true);

    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the original post')).toBeInTheDocument();
    });

    // Flag and submit
    const flagButtons = screen.getAllByRole('button', { name: /flag/i });
    await user.click(flagButtons[0]);

    const harmfulButton = await screen.findByRole('button', { name: /harmful/i });
    await user.click(harmfulButton);

    const submitFlagButton = screen.getByRole('button', { name: /^flag$/i });
    await user.click(submitFlagButton);

    await waitFor(() => {
      expect(screen.getByText(/flagged for review/i)).toBeInTheDocument();
    });
  });

  it('saves reply as draft in localStorage', async () => {
    const user = userEvent.setup();
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(<ThreadView threadId="thread-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    await user.type(textarea, 'Draft reply text');

    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalledWith(
        expect.stringContaining('aura-forum-reply-draft'),
        'Draft reply text'
      );
    });

    localStorageSpy.mockRestore();
  });

  it('closes thread view on back button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ThreadView threadId="thread-1" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test Discussion')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to forum/i });
    await user.click(backButton);

    expect(onClose).toHaveBeenCalled();
  });
});
