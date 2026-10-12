import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ContentPage, pageHead } from '@/components/third-eye';
import { ArrowUpRight, LogOut, Code, User } from 'lucide-react';
import {
  getStoredUser,
  subscribeAuth,
  clearSession,
  fetchCurrentUser,
  type AuthUser,
} from '@/lib/auth-client';

export const Route = createFileRoute('/profile')({
  head: () =>
    pageHead('Your eye', 'Manage your Third eye workspace identity, authentication credentials, and account settings.'),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      navigate({ to: '/login' });
      return;
    }
    setUser(current);

    const unsub = subscribeAuth((updated) => {
      if (!updated) {
        navigate({ to: '/login' });
      } else {
        setUser(updated);
      }
    });

    fetchCurrentUser().then((u) => {
      if (!u) {
        navigate({ to: '/login' });
      } else {
        setUser(u);
      }
    });

    return unsub;
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate({ to: '/' });
  };

  if (!user) {
    return null;
  }

  return (
    <ContentPage title="Your eye." eyebrow="WORKSPACE IDENTITY">
      <p className="page-lead">Your unified developer account and workspace profile.</p>

      <div className="profile-card">
        <div className="profile-row">
          <span className="profile-row-label">Full Name</span>
          <span className="profile-row-val">{user.name || 'Third Eye Developer'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Email Address</span>
          <span className="profile-row-val">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Phone Number</span>
          <span className="profile-row-val">{user.phone || 'Not configured'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Auth Provider</span>
          <span className="profile-row-val" style={{ textTransform: 'uppercase' }}>
            {user.authProvider || 'local'}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Account Role</span>
          <span className="profile-row-val" style={{ textTransform: 'capitalize' }}>
            {user.role || 'Member'}
          </span>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button-glow"
            style={{ height: '42px', padding: '0 24px', fontSize: '12px' }}
            onClick={() => navigate({ to: '/' })}
          >
            Launch workspace <ArrowUpRight className="ml-1 w-4 h-4 inline" />
          </button>

          <button
            type="button"
            className="auth-social-button"
            style={{ width: 'auto', padding: '0 20px', height: '42px' }}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 inline" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </ContentPage>
  );
}
