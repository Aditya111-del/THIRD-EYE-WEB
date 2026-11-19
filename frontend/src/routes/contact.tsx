import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ContentPage, ProductAction, pageHead } from '@/components/third-eye';
import { Mail, Copy, Check } from 'lucide-react';

const CONTACT_EMAIL = 'future@helmer.world';

export const Route = createFileRoute('/contact')({
  head: () =>
    pageHead(
      'Contact us',
      'Get in touch about Third eye, product questions, waiting list inquiries, and collaborations.',
    ),
  component: ContactPage,
});

function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <ContentPage title="Let’s talk." eyebrow="CONTACT THIRD EYE">
      <p className="page-lead">A question. An idea. A different perspective.</p>

      <div className="contact-card">
        <span className="auth-label" style={{ color: 'var(--peach)' }}>
          DIRECT CONTACT INFO
        </span>
        <p style={{ margin: '8px 0 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
          Reach our team directly for early access inquiries, desktop downloads, or product feedback.
        </p>

        <div className="contact-actions-row">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="contact-email-badge"
            aria-label={`Send email to ${CONTACT_EMAIL}`}
          >
            <Mail className="w-4 h-4" />
            <span>{CONTACT_EMAIL}</span>
          </a>

          <button
            type="button"
            className="contact-copy-btn"
            onClick={handleCopyEmail}
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--code)]" />
                <span className="text-[var(--code)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy email</span>
              </>
            )}
          </button>

          <ProductAction destination="contact" variant="glow">
            <Mail />
            Send email
          </ProductAction>
        </div>
      </div>

      <div className="contact-topic">
        <h2>Product & support</h2>
        <p>
          Questions about the desktop IDE, priority waiting list, or account authentication.
          We’re happy to help at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <div className="contact-topic">
        <h2>Say hello</h2>
        <p>
          Share an idea, a collaboration proposal, or what you’d love to build next with an
          agentic IDE. We review every note sent to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </ContentPage>
  );
}
