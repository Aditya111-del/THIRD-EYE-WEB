import { createFileRoute, Link } from '@tanstack/react-router';
import { ContentPage, pageHead } from '@/components/third-eye';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
export const Route = createFileRoute('/makers')({ head: () => pageHead('Makers', 'The people and principles behind Third eye.'), component: Page });
function Page() { return <ContentPage title="Made for the makers." eyebrow="BEHIND THIRD EYE"><p className="page-lead">For the curious. The persistent. The people who turn “what if” into what’s next.</p><div className="maker-mark" aria-hidden="true"><span className="brand-mark"><i/><i/><i/><i/><i/></span></div><h2>Ideas first. Always.</h2><p>Third eye is shaped by a belief that building software should feel more connected to the idea that started it.</p><h2>The people behind the perspective.</h2><p>Meet the team soon. Maker profiles and their stories will be shared here.</p><Button variant="glow" asChild><Link to="/contact">Get in touch <ArrowUpRight/></Link></Button></ContentPage>; }
