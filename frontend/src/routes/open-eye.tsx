import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ContentPage, pageHead } from '@/components/third-eye';
import { ArrowUpRight, UserPlus } from 'lucide-react';
import { getStoredUser, subscribeAuth, type AuthUser } from '@/lib/auth-client';

export const Route = createFileRoute('/open-eye')({
  head: () =>
    pageHead(
      'Open eye',
      'Log in or create your Third eye account on the account platform.'
    ),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  useEffect(() => {
    if (getStoredUser()) {
      navigate({ to: '/profile' });
      return;
    }
    const unsub = subscribeAuth((u) => {
      if (u) {
        navigate({ to: '/profile' });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, [navigate]);

  return (
    <ContentPage title="Open eye." eyebrow="YOUR THIRD EYE ACCOUNT">
      <p className="page-lead">A new perspective starts with you.</p>

      <div className="account-actions">
        <Link to="/login" className="button-glow inline-flex items-center justify-center px-6 text-xs h-[43px] no-underline">
          Log in <ArrowUpRight className="ml-1 w-4 h-4 inline" />
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-6 text-xs h-[43px] rounded-[30px] border border-[var(--border)] text-[var(--foreground)] font-bold hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] transition-colors no-underline"
        >
          Create an account <UserPlus className="ml-1.5 w-4 h-4 inline" />
        </Link>
      </div>
    </ContentPage>
  );
}
