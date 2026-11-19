import { Link } from '@tanstack/react-router';
import { useState, useEffect, type ReactNode } from 'react';
import { ArrowUpRight, Menu, X, Monitor, Apple, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { productLinks } from '@/lib/product-links';
import { getStoredUser, subscribeAuth, submitWaitlist, type AuthUser } from '@/lib/auth-client';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    return subscribeAuth(setUser);
  }, []);

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Third eye home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="brand-name">Third eye</span>
      </Link>
      <nav aria-label="Main navigation" className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
        <Link to="/about">About</Link>
        <Link to="/makers">Makers</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact us</Link>
      </nav>
      <div className="header-actions">
        <Button variant="capsule" asChild>
          <Link to={user ? '/profile' : '/open-eye'}>
            {user ? 'Your eye' : 'Open eye'} <ArrowUpRight />
          </Link>
        </Button>
        <Button
          variant="navigation"
          size="icon"
          className="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/" className="footer-brand">
        Third eye <span>© {new Date().getFullYear()}</span>
      </Link>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/makers">Makers</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <span>
        <i className="footer-dot" />A new perspective.
      </span>
    </footer>
  );
}

export function DownloadWaitlistDialog({
  destination,
  open,
  onOpenChange,
}: {
  destination: 'macos' | 'windows';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [platform, setPlatform] = useState<'macos' | 'windows'>(destination);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(destination);
    setSuccess(false);
    setError(null);
    const currentUser = getStoredUser();
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [destination, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitWaitlist({
        email: cleanEmail,
        platform,
      });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Unable to join the waiting list. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const platformName = platform === 'macos' ? 'macOS' : 'Windows';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="destination-dialog waitlist-dialog">
        {success ? (
          <div className="waitlist-success">
            <div className="waitlist-success-icon" aria-hidden="true">
              <Check className="w-6 h-6" />
            </div>
            <DialogTitle className="waitlist-title text-center">You're on the list</DialogTitle>
            <DialogDescription className="waitlist-description text-center mt-2">
              We've reserved your early access spot for <strong>Third eye for {platformName}</strong>. We'll send your download invite to <strong>{email}</strong> the moment builds open.
            </DialogDescription>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="glow" onClick={() => onOpenChange(false)}>
                Got it
              </Button>
              <Button
                variant="navigation"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Add another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="waitlist-header">
              <span className="waitlist-eyebrow">EARLY ACCESS WAITING LIST</span>
              <DialogTitle className="waitlist-title">
                Third eye for {platformName}
              </DialogTitle>
              <DialogDescription className="waitlist-description">
                Direct installer downloads are opening soon. Join the priority waiting list to get early access and receive your download link the moment it's available.
              </DialogDescription>
            </div>

            <div className="waitlist-platform-selector">
              <button
                type="button"
                className={`waitlist-platform-btn ${platform === 'macos' ? 'active' : ''}`}
                onClick={() => setPlatform('macos')}
                aria-pressed={platform === 'macos'}
              >
                <Apple className="w-3.5 h-3.5" /> macOS
              </button>
              <button
                type="button"
                className={`waitlist-platform-btn ${platform === 'windows' ? 'active' : ''}`}
                onClick={() => setPlatform('windows')}
                aria-pressed={platform === 'windows'}
              >
                <Monitor className="w-3.5 h-3.5" /> Windows
              </button>
            </div>

            {error && <div className="auth-alert-error mb-3">{error}</div>}

            <form onSubmit={handleSubmit} className="waitlist-form">
              <div className="auth-field">
                <label className="auth-label" htmlFor="waitlist-email">
                  Email Address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="alex@thirdeye.dev"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <Button
                variant="glow"
                type="submit"
                disabled={loading}
                style={{ width: '100%', height: '42px', marginTop: '10px' }}
              >
                {loading ? 'Joining list...' : `Join ${platformName} waiting list`}
              </Button>

              <p className="waitlist-note">
                No spam. We will only contact you with download instructions and launch announcements.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ProductAction({
  destination,
  children,
  variant = 'glow',
  className,
}: {
  destination: keyof typeof productLinks;
  children: ReactNode;
  variant?: 'glow' | 'capsule' | 'outline';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const url = productLinks[destination];
  if (url) {
    if (url.startsWith('/')) {
      return (
        <Button variant={variant} className={className} asChild>
          <Link to={url}>{children}</Link>
        </Button>
      );
    }
    return (
      <Button variant={variant} className={className} asChild>
        <a href={destination === 'contact' ? `mailto:${url}` : url}>{children}</a>
      </Button>
    );
  }

  const isDownload = destination === 'windows' || destination === 'macos';

  if (isDownload) {
    return (
      <>
        <Button variant={variant} className={className} onClick={() => setOpen(true)}>
          {children}
        </Button>
        <DownloadWaitlistDialog
          destination={destination}
          open={open}
          onOpenChange={setOpen}
        />
      </>
    );
  }

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="destination-dialog">
          <DialogTitle>Contact details coming soon</DialogTitle>
          <DialogDescription>
            Our contact destination is not connected yet. Please check back soon.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DownloadButtons() {
  return (
    <div className="download-buttons">
      <ProductAction destination="macos">
        <Apple />
        Download for macOS
      </ProductAction>
      <ProductAction destination="windows" variant="outline">
        <Monitor />
        Download for Windows
      </ProductAction>
    </div>
  );
}

export function ContentPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="site-frame">
      <main className="content-scene">
        <div className="ambient-dots" aria-hidden="true" />
        <SiteHeader />
        <article className="content-body">
          <span className="content-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Third eye` },
      { name: 'description', content: description },
      { property: 'og:title', content: `${title} — Third eye` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  };
}
