import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader, SiteFooter, pageHead } from '@/components/third-eye';
import { ProductShowcase } from '@/components/product-showcase';
import agentImage from '@/assets/third-eye-agent.jpg';

export const Route = createFileRoute('/')({
  head: () =>
    pageHead(
      'Third eye — Your desktop agentic coding IDE',
      'Discover Third eye, explore the product, and download the agentic coding IDE for macOS and Windows.',
    ),
  component: Index,
});

function Index() {
  return (
    <div className="site-frame">
      <main className="hero-scene">
        <div className="ambient-dots" aria-hidden="true" />
        <SiteHeader />
        <div className="hero-copy">
          <h1>
            <strong>Third eye</strong>
            <span>Agentic coding IDE</span>
          </h1>
          <p>
            Third eye isn’t here to make you code harder. It’s here to
            <br className="desktop-break" /> help you build better. Your ideas matter most.
          </p>
        </div>
        <div className="portrait-stage">
          <div className="visor-dots" aria-hidden="true" />
          <img
            className="agent-portrait"
            src={agentImage}
            alt="Third eye's futuristic identity with an illuminated red visor"
            width={1024}
            height={1024}
            fetchPriority="high"
          />
        </div>
        <span className="scene-caption">A NEW PERSPECTIVE ON CODING</span>
      </main>
      <ProductShowcase />
      <SiteFooter />
    </div>
  );
}
