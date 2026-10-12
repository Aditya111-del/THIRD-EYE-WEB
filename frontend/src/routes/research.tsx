import { createFileRoute } from '@tanstack/react-router';
import { ContentPage, pageHead } from '@/components/third-eye';
export const Route = createFileRoute('/research')({ head: () => pageHead('Looking beyond the editor', 'Exploring context, collaboration, and control in agentic coding.'), component: Page });
function Page() { return <ContentPage title='Looking beyond the editor' eyebrow='THIRD EYE RESEARCH'><h2>Context is everything</h2><p>Building software requires more than completing a line of code. We’re exploring how agents can reason about the bigger picture of a project.</p><h2>Human intent. Agent capability.</h2><p>Our direction is simple: keep developers in control while giving their ideas more room to grow.</p><p>Research publications are coming soon.</p></ContentPage>; }
