import { createFileRoute } from '@tanstack/react-router';
import { ContentPage, pageHead } from '@/components/third-eye';
export const Route = createFileRoute('/blog')({ head: () => pageHead('The Third eye journal', 'Thoughts on a new era of building software.'), component: Page });
function Page() { return <ContentPage title='The Third eye journal' eyebrow='IDEAS & UPDATES'><h2>A new perspective on coding</h2><p>The best tools leave more room for your ideas. Third eye explores what happens when your editor becomes a collaborator, not just a place to type.</p><p>More stories are coming soon.</p></ContentPage>; }
