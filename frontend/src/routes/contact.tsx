import { createFileRoute } from '@tanstack/react-router';
import { ContentPage, ProductAction, pageHead } from '@/components/third-eye';
import { Mail } from 'lucide-react';
export const Route = createFileRoute('/contact')({ head: () => pageHead('Contact us', 'Get in touch about Third eye, product questions, and collaborations.'), component: Page });
function Page() { return <ContentPage title="Let’s talk." eyebrow="CONTACT THIRD EYE"><p className="page-lead">A question. An idea. A different perspective.</p><div className="contact-topic"><h2>Product & support</h2><p>Questions about the desktop IDE, downloads, or your account.</p></div><div className="contact-topic"><h2>Say hello</h2><p>Share an idea, a collaboration, or what you’d love to build next.</p></div><ProductAction destination="contact"><Mail/>Contact us</ProductAction><p className="destination-note">Contact details coming soon.</p></ContentPage>; }
