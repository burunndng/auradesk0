/**
 * PostCard Tests
 * Tests: like/unlike, flagging, editing, deletion, author display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';
import * as forumService from '../../../services/forumService';
import * as moderationService from '../../../services/forumModerationService';

vi.mock('../../../services/forumService');
vi.mock('../../../services/forumModerationService');

describe('PostCard', () => {
  const mockPost = {
    id: 'post-1',
    thread_id: 'thread-1',
    user_id: 'user-456',
    content: 'This is a helpful response with **markdown** support',
    author: { id: 'user-456', display_name: 'HelpfulUser', avatar_url: null },
    likes_count: 5,
    created_at: '2026-03-08T10:00:00Z',
    is_deleted: false,
  };

  const currentUserId = 'user-123';
  const isOwnPost = false;

  beforeEach(() => {
    vi.clearAllMocks();
    (forumService.likePost as any).mockResolvedValue(true);
    (forumService.unlikePost as any).mockResolvedValue(true);
  });

  it('renders post content with markdown', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    expect(screen.getByText(/helpful response/)).toBeInTheDocument();
    const boldElement = screen.getByText('markdown');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('displays author information', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    expect(screen.getByText('HelpfulUser')).toBeInTheDocument();
  });

  it('displays like count', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('allows liking a post', async () => {
    const user = userEvent.setup();
    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(forumService.likePost).toHaveBeenCalledWith(mockPost.id);
    });
  });

  it('toggles like on second click (unlike)', async () => {
    const user = userEvent.setup();
    (forumService.likePost as any).mockResolvedValueOnce(true);
    (forumService.unlikePost as any).mockResolvedValueOnce(true);

    const { rerender } = render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(forumService.likePost).toHaveBeenCalledWith(mockPost.id);
    });

    // Like button should now show "Unlike" or be in liked state
    const unlikeButton = screen.getByRole('button', { name: /unlike|liked/i });
    await user.click(unlikeButton);

    await waitFor(() => {
      expect(forumService.unlikePost).toHaveBeenCalledWith(mockPost.id);
    });
  });

  it('prevents liking own post', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId={mockPost.user_id}
        isOwnPost={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    const likeButton = screen.queryByRole('button', { name: /like/i });
    expect(likeButton).not.toBeInTheDocument();
  });

  it('opens flag modal when flag button clicked', async () => {
    const user = userEvent.setup();
    const onFlag = vi.fn();

    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={onFlag}
      />
    );

    const flagButton = screen.getByRole('button', { name: /flag/i });
    await user.click(flagButton);

    expect(onFlag).toHaveBeenCalledWith(mockPost.id, mockPost.thread_id);
  });

  it('edits own post', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    const ownPost = { ...mockPost, user_id: currentUserId };

    render(
      <PostCard
        post={ownPost}
        currentUserId={currentUserId}
        isOwnPost={true}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Edit form should appear
    const editInput = await screen.findByDisplayValue(/helpful response/i);
    await user.clear(editInput);
    await user.type(editInput, 'Updated response');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(mockPost.id, 'Updated response');
    });
  });

  it('deletes own post with confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    const ownPost = { ...mockPost, user_id: currentUserId };

    render(
      <PostCard
        post={ownPost}
        currentUserId={currentUserId}
        isOwnPost={true}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onFlag={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirmation dialog
    const confirmDelete = await screen.findByRole('button', { name: /confirm.*delete/i });
    await user.click(confirmDelete);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockPost.id);
    });
  });

  it('displays bot badge for AI Coach posts', () => {
    const botPost = {
      ...mockPost,
      user_id: '55d1241a-2f4e-4a31-bf0d-46c4e6a8ce5d',
      author: { id: '55d1241a-2f4e-4a31-bf0d-46c4e6a8ce5d', display_name: 'AI Coach', avatar_url: null },
    };

    render(
      <PostCard
        post={botPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    expect(screen.getByText(/ai coach|bot/i)).toBeInTheDocument();
  });

  it('displays deleted post placeholder', () => {
    const deletedPost = { ...mockPost, is_deleted: true, content: '' };

    render(
      <PostCard
        post={deletedPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    expect(screen.getByText(/post was deleted/i)).toBeInTheDocument();
  });

  it('shows timestamp', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId={currentUserId}
        isOwnPost={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFlag={vi.fn()}
      />
    );

    // Should show relative time (e.g., "2 hours ago")
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });
});
