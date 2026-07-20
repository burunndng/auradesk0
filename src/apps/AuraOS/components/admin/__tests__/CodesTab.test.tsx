import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodesTab from '../tabs/CodesTab';
import * as promoCodeService from '../../../services/promoCodeService';

vi.mock('../../../services/promoCodeService', () => ({
  listPromoCodes: vi.fn(),
  generatePromoCode: vi.fn(),
  revokePromoCode: vi.fn(),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('CodesTab', () => {
  const mockCodes = [
    {
      id: 'code-1',
      code: 'PROMO-XYZ',
      created_by: 'admin-id',
      redeemed_by: null,
      days_valid: 30,
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      redeemed_at: null,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'code-2',
      code: 'PROMO-ABC',
      created_by: 'admin-id',
      redeemed_by: 'user-id',
      days_valid: 14,
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      redeemed_at: new Date().toISOString(),
      status: 'redeemed',
      created_at: new Date().toISOString(),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (promoCodeService.listPromoCodes as any).mockResolvedValue(mockCodes);
    (promoCodeService.generatePromoCode as any).mockResolvedValue('NEW-PROMO-123');
    (promoCodeService.revokePromoCode as any).mockResolvedValue(true);
  });

  it('renders loading state initially', () => {
    let resolveList: any;
    (promoCodeService.listPromoCodes as any).mockImplementation(() => new Promise(res => { resolveList = res; }));

    const { container } = render(<CodesTab />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays promo codes', async () => {
    render(<CodesTab />);

    await waitFor(() => {
      expect(screen.getByText('PROMO-XYZ')).toBeInTheDocument();
      expect(screen.getByText('PROMO-ABC')).toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('redeemed')).toBeInTheDocument();
  });

  it('displays empty state if no promo codes are found', async () => {
    (promoCodeService.listPromoCodes as any).mockResolvedValue([]);
    render(<CodesTab />);

    await waitFor(() => {
      expect(screen.getByText('No codes yet.')).toBeInTheDocument();
    });
  });

  it('generates a new promo code', async () => {
    const user = userEvent.setup();
    render(<CodesTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    });

    const generateBtn = screen.getByRole('button', { name: 'Generate' });
    await user.click(generateBtn);

    expect(promoCodeService.generatePromoCode).toHaveBeenCalledWith(30);

    // new code should appear in list and top display
    await waitFor(() => {
      expect(screen.getByText('NEW-PROMO-123')).toBeInTheDocument();
    });
  });

  it('copies generated promo code to clipboard', async () => {
    const user = userEvent.setup();
    render(<CodesTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    });

    const generateBtn = screen.getByRole('button', { name: 'Generate' });
    await user.click(generateBtn);

    const copyBtn = await screen.findByRole('button', { name: 'Copy' });
    await user.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('NEW-PROMO-123');
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('revokes an active promo code', async () => {
    const user = userEvent.setup();
    render(<CodesTab />);

    await waitFor(() => {
      expect(screen.getByText('PROMO-XYZ')).toBeInTheDocument();
    });

    // Code-1 is active and should have Revoke button
    const revokeBtns = screen.getAllByRole('button', { name: /Revoke/i });
    expect(revokeBtns.length).toBeGreaterThan(0);
    
    await user.click(revokeBtns[0]);

    expect(promoCodeService.revokePromoCode).toHaveBeenCalledWith('code-1');
    
    // Status should update to revoked (or at least no longer active if optimistic update works)
    await waitFor(() => {
      expect(screen.getAllByText('revoked').length).toBeGreaterThan(0);
    });
  });
});
