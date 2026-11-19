import { createFileRoute } from '@tanstack/react-router';
import { ContentPage, DownloadButtons, pageHead } from '@/components/third-eye';

export const Route = createFileRoute('/faq')({
  head: () =>
    pageHead(
      'FAQ',
      'Learn about Third eye desktop downloads, waiting list, accounts, and the product showcase.',
    ),
  component: Page,
});

function Page() {
  return (
    <ContentPage title="A little more clarity." eyebrow="FREQUENTLY ASKED QUESTIONS">
      <details open>
        <summary>What is Third eye?</summary>
        <p>
          Third eye is a desktop agentic coding IDE. This website is where you can discover the
          product, see it in action, and join the waiting list for desktop downloads.
        </p>
      </details>
      <details>
        <summary>Can I code on this website?</summary>
        <p>
          No. Your coding workspace lives in the desktop application. This website showcases the
          product.
        </p>
      </details>
      <details>
        <summary>Where can I download the IDE?</summary>
        <p>
          Click either the macOS or Windows download buttons to join our priority waiting list.
          You'll be notified with an installer link the moment the desktop builds launch.
        </p>
      </details>
      <details>
        <summary>How can I reach the team directly?</summary>
        <p>
          You can write to us anytime at{' '}
          <a
            href="mailto:future@helmer.world"
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            future@helmer.world
          </a>{' '}
          for product questions, feedback, or collaborations.
        </p>
      </details>
      <details>
        <summary>How do I log in or register?</summary>
        <p>
          Open eye takes you to the account authentication page, with Log in and Create an account
          options powered by our authentication backend.
        </p>
      </details>
      <details>
        <summary>Are these actual product screenshots?</summary>
        <p>
          The screenshots and video currently displayed are concept previews. They will be
          replaced with actual product media.
        </p>
      </details>
      <details>
        <summary>Who is behind Third eye?</summary>
        <p>
          Visit Makers for the vision behind the product. Team profiles will be shared there soon.
        </p>
      </details>
      <div className="faq-downloads">
        <DownloadButtons />
      </div>
    </ContentPage>
  );
}
