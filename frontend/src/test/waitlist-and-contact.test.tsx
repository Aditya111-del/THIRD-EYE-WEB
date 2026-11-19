import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { productLinks } from '@/lib/product-links';
import { submitWaitlist } from '@/lib/auth-client';
import { ProductAction, DownloadButtons } from '@/components/third-eye';

describe('Contact destination configuration', () => {
  it('configures contact email as future@helmer.world', () => {
    expect(productLinks.contact).toBe('future@helmer.world');
  });

  it('renders a mailto link for contact destination', () => {
    render(
      <ProductAction destination="contact">
        Contact us
      </ProductAction>
    );

    const link = screen.getByRole('link', { name: /contact us/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:future@helmer.world');
  });
});

describe('Download waiting list option', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('opens waiting list dialog when download button is clicked', async () => {
    render(<DownloadButtons />);

    const macDownload = screen.getByRole('button', { name: /download for macos/i });
    expect(macDownload).toBeInTheDocument();

    fireEvent.click(macDownload);

    // Dialog should open with waitlist title and options
    await waitFor(() => {
      expect(screen.getByText(/early access waiting list/i)).toBeInTheDocument();
      expect(screen.getByText(/third eye for macos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join macos waiting list/i })).toBeInTheDocument();
    });
  });

  it('submits waitlist data successfully with fallback persistence', async () => {
    const res = await submitWaitlist({
      email: 'tester@thirdeye.dev',
      platform: 'macos',
    });

    expect(res.success).toBe(true);
    expect(res.entry?.email).toBe('tester@thirdeye.dev');

    // Should be saved in localStorage
    const saved = JSON.parse(localStorage.getItem('thirdeye_waitlist') || '[]');
    expect(saved.length).toBeGreaterThan(0);
    expect(saved[0].email).toBe('tester@thirdeye.dev');
    expect(saved[0].platform).toBe('macos');
  });
});

