import { useRef, useState, useEffect } from 'react';
import { Maximize2, Play, Pause, ArrowUpRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import workspace from '@/assets/third-eye-workspace.jpg';
import review from '@/assets/third-eye-review.jpg';
import context from '@/assets/third-eye-context.jpg';
import showcase from '@/assets/third-eye-showcase.mp4';
import { DownloadButtons } from '@/components/third-eye';
import { getStoredUser, subscribeAuth, type AuthUser } from '@/lib/auth-client';

interface ScreenItem {
  asset: string;
  name: string;
  detail: string;
}

const screens: ScreenItem[] = [
  { asset: workspace, name: 'A workspace with perspective.', detail: 'Your code. Your agent. In one place.' },
  { asset: review, name: 'Every change, in focus.', detail: 'A clearer view of the work ahead.' },
  { asset: context, name: 'See the bigger picture.', detail: 'Keep your project context close.' },
];

export function ProductShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    return subscribeAuth(setUser);
  }, []);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(0);

  const currentScreen = screens[selected] ?? screens[0]!;

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setError(false);
      } catch {
        setError(true);
      }
    } else {
      video.pause();
    }
  };

  return (
    <>
      <section className="showcase-section">
        <div className="section-intro">
          <span className="content-eyebrow">MEET YOUR NEXT WORKSPACE</span>
          <div className="showcase-downloads">
            <DownloadButtons />
            <span className="hero-platform-note">Made for your desktop. macOS & Windows.</span>
          </div>
        </div>
        <div className="video-platform">
          <div className="media-topline">
            <span><i className="footer-dot" />Third eye / in motion</span>
            <span>CONCEPT FILM · 00:12</span>
          </div>
          <video
            ref={videoRef}
            src={showcase}
            poster={workspace}
            width={1280}
            height={800}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setError(true)}
            aria-label="Third eye concept product video"
          />
          <div className="video-controls">
            <Button
              variant="navigation"
              size="icon"
              aria-label={playing ? 'Pause product video' : 'Play product video'}
              onClick={togglePlayback}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <span>
              {error
                ? 'Video unavailable. Product screenshots are below.'
                : playing
                ? 'A new perspective, in motion.'
                : 'Watch the product concept'}
            </span>
            <Button
              variant="navigation"
              size="icon"
              aria-label="View video fullscreen"
              onClick={() => {
                videoRef.current?.requestFullscreen?.().catch(() => setError(true));
              }}
            >
              <Maximize2 />
            </Button>
          </div>
        </div>
      </section>

      <section className="screenshots-section">
        <div className="section-intro">
          <span className="content-eyebrow">A CLOSER LOOK</span>
          <h2>Designed around your ideas.</h2>
        </div>
        <div className="screenshot-tabs" role="tablist" aria-label="Product screenshots">
          {screens.map((screen, index) => (
            <Button
              key={screen.name}
              variant="navigation"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`product-screen-${index}`}
              id={`product-tab-${index}`}
              onClick={() => setSelected(index)}
            >
              {['Workspace', 'Review', 'Context'][index]}
            </Button>
          ))}
        </div>
        <figure
          className="product-screen"
          role="tabpanel"
          id={`product-screen-${selected}`}
          aria-labelledby={`product-tab-${selected}`}
        >
          <img
            src={currentScreen.asset}
            alt={`Third eye concept screenshot: ${currentScreen.name}`}
            width={1440}
            height={900}
            loading="lazy"
          />
          <figcaption>
            <div>
              <h3>{currentScreen.name}</h3>
              <p>{currentScreen.detail}</p>
            </div>
            <span>CONCEPT PREVIEW</span>
          </figcaption>
        </figure>
      </section>

      <section className="download-section" id="downloads">
        <span className="content-eyebrow">YOUR NEXT CHAPTER</span>
        <h2>Meet Third eye.<br />On your desktop.</h2>
        <DownloadButtons />
        <p>macOS & Windows · Download links coming soon</p>
        <Button variant="navigation" asChild>
          <Link to={user ? "/profile" : "/login"}>
            {user ? "Your eye" : "Already have an account? Log in"} <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
