import { Link } from '@tanstack/react-router';
import { useState, useEffect, type ReactNode } from 'react';
import { ArrowUpRight, Download, Menu, X, Monitor, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { productLinks } from '@/lib/product-links';

import { getStoredUser, subscribeAuth, type AuthUser } from '@/lib/auth-client';

export function SiteHeader() {
 const [menuOpen, setMenuOpen] = useState(false);
 const [user, setUser] = useState<AuthUser | null>(null);

 useEffect(() => {
  setUser(getStoredUser());
  return subscribeAuth(setUser);
 }, []);

 return <header className="site-header">
  <Link to="/" className="brand" aria-label="Third eye home"><span className="brand-mark" aria-hidden="true"><i/><i/><i/><i/><i/></span><span className="brand-name">Third eye</span></Link>
  <nav aria-label="Main navigation" className={`nav-links ${menuOpen ? 'nav-open' : ''}`}><Link to="/about">About</Link><Link to="/makers">Makers</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact us</Link></nav>
  <div className="header-actions">
    <Button variant="capsule" asChild>
      <Link to={user ? "/profile" : "/open-eye"}>
        {user ? 'Your eye' : 'Open eye'} <ArrowUpRight/>
      </Link>
    </Button>
    <Button variant="navigation" size="icon" className="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</Button>
  </div>
 </header>;
}
export function SiteFooter() { return <footer className="site-footer"><Link to="/" className="footer-brand">Third eye <span>© {new Date().getFullYear()}</span></Link><div className="footer-links"><Link to="/about">About</Link><Link to="/makers">Makers</Link><Link to="/contact">Contact</Link></div><span><i className="footer-dot"/>A new perspective.</span></footer>; }
export function ProductAction({ destination, children, variant = 'glow', className }: { destination: keyof typeof productLinks; children: ReactNode; variant?: 'glow' | 'capsule' | 'outline'; className?: string }) {
 const [open, setOpen] = useState(false);
 const url = productLinks[destination];
 if (url) {
   if (url.startsWith('/')) {
     return <Button variant={variant} className={className} asChild><Link to={url}>{children}</Link></Button>;
   }
   return <Button variant={variant} className={className} asChild><a href={destination === 'contact' ? `mailto:${url}` : url}>{children}</a></Button>;
 }
 const downloading = destination === 'windows' || destination === 'macos';
 return <><Button variant={variant} className={className} onClick={() => setOpen(true)}>{children}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="destination-dialog"><DialogTitle>{downloading ? 'Download link coming soon' : 'Contact details coming soon'}</DialogTitle><DialogDescription>{downloading ? 'The installer link is not connected yet. Please check back soon.' : 'Our contact destination is not connected yet. Please check back soon.'}</DialogDescription></DialogContent></Dialog></>;
}
export function DownloadButtons() { return <div className="download-buttons"><ProductAction destination="macos"><Apple/>Download for macOS</ProductAction><ProductAction destination="windows" variant="outline"><Monitor/>Download for Windows</ProductAction></div>; }
export function ContentPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) { return <div className="site-frame"><main className="content-scene"><div className="ambient-dots" aria-hidden="true"/><SiteHeader/><article className="content-body"><span className="content-eyebrow">{eyebrow}</span><h1>{title}</h1>{children}</article></main><SiteFooter/></div>; }
export function pageHead(title: string, description: string) { return { meta: [{ title: `${title} — Third eye` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — Third eye` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; }
