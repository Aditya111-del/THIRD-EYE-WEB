import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ContentPage, pageHead } from '@/components/third-eye';
import { ArrowUpRight, Apple } from 'lucide-react';
import {
  registerUser,
  continueWithGoogle,
  continueWithApple,
  getStoredUser,
} from '@/lib/auth-client';

export const Route = createFileRoute('/register')({
  head: () =>
    pageHead('Create account', 'Create your Third eye account to start building with agentic workflows.'),
  component: RegisterPage,
});

function GoogleVector() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredUser()) {
      navigate({ to: '/' });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (res.success) {
        navigate({ to: '/' });
      } else {
        setError(res.message || 'Registration was unsuccessful.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to authentication service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await continueWithGoogle();
      if (res.success) {
        navigate({ to: '/' });
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApple = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await continueWithApple();
      if (res.success) {
        navigate({ to: '/' });
      } else {
        setError(res.message || 'Apple authentication failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Apple authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentPage title="Create account." eyebrow="YOUR THIRD EYE ACCOUNT">
      <p className="page-lead">Join the next generation of agentic coding.</p>

      <div className="auth-form-card">
        {error && <div className="auth-alert-error">{error}</div>}

        <div className="auth-social-grid">
          <button
            type="button"
            className="auth-social-button"
            onClick={handleGoogle}
            disabled={submitting}
          >
            <GoogleVector />
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            className="auth-social-button"
            onClick={handleApple}
            disabled={submitting}
          >
            <Apple className="w-4 h-4" />
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="auth-separator">
          <span>or create with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Mercer"
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@thirdeye.dev"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-phone">
              Phone Number
            </label>
            <input
              id="reg-phone"
              type="tel"
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="button-glow"
            style={{ width: '100%', height: '44px', marginTop: '12px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create account'}{' '}
            <ArrowUpRight className="ml-1 w-4 h-4 inline" />
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Already have an account?</span>
          <Link to="/login">Log in</Link>
        </div>
      </div>
    </ContentPage>
  );
}
