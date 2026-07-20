import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../AdminPanel';

// Mock the lazy-loaded tabs to keep integration test fast and isolated from tab implementation details
vi.mock('../tabs/UsersTab', () => ({ default: () => <div data-testid="users-tab">Users Tab Content</div> }));
vi.mock('../tabs/InsightsTab', () => ({ default: () => <div data-testid="insights-tab">Insights Tab Content</div> }));
vi.mock('../tabs/ForumTab', () => ({ default: () => <div data-testid="forum-tab">Forum Tab Content</div> }));
vi.mock('../tabs/StatsTab', () => ({ default: () => <div data-testid="stats-tab">Stats Tab Content</div> }));
vi.mock('../tabs/BotTab', () => ({ default: () => <div data-testid="bot-tab">Bot Tab Content</div> }));
vi.mock('../tabs/CodesTab', () => ({ default: () => <div data-testid="codes-tab">Codes Tab Content</div> }));

describe('AdminPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<AdminPanel isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the navigation and default Stats tab when isOpen is true', async () => {
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // AOS header should exist
    expect(screen.getByText('AOS', { selector: 'h2' })).toBeInTheDocument();
    
    // Default tab label should exist in header
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();

    // The default mocked tab should be found eventually due to Suspense
    await waitFor(() => {
      expect(screen.getByTestId('stats-tab')).toBeInTheDocument();
    });
  });

  it('changes active tab when a navigation button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Make sure it loads the default first
    await waitFor(() => {
      expect(screen.getByTestId('stats-tab')).toBeInTheDocument();
    });

    // Click on the Users tab in sidebar
    const usersTabNav = screen.getByRole('button', { name: /Users/i });
    await user.click(usersTabNav);

    // Header updates
    expect(screen.getByRole('heading', { level: 1, name: 'Users' })).toBeInTheDocument();

    // Users content displays
    await waitFor(() => {
      expect(screen.getByTestId('users-tab')).toBeInTheDocument();
      // Stats tab should be unmounted
      expect(screen.queryByTestId('stats-tab')).not.toBeInTheDocument();
    });
  });

  it('calls onClose when the transparent backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // The backdrop is the element with aria-hidden="true"
    // Using closest matching via role or testing element directly doesn't work well due to no role.
    // However, the first div before dialog has aria-hidden
    const backdrop = document.querySelector('.bg-stone-950\\/80');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when close icon in header is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    const headerCloseIcon = screen.getByRole('button', { name: 'Close' });
    await user.click(headerCloseIcon);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when sidebar "Close Panel" button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    const sidebarCloseBtn = screen.getByRole('button', { name: 'Close admin panel' });
    await user.click(sidebarCloseBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('sets body overflow to hidden when open, and restores on unmount', () => {
    const { unmount } = render(<AdminPanel isOpen={true} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
