// Root layout = the shared shell build.py wrapped around every page: head (fonts, icon, arrival-wave flag), the nav,
// <main>, the footer, the Book a demo dialog and the client runtime. Per-page titles/descriptions come from each
// page's `metadata` export (lib/seo.js pageMetadata).
import './globals.css';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import DemoModal from '@/components/site/DemoModal';
import SiteRuntime from '@/components/site/SiteRuntime';
import { PAGES } from '@/lib/site-data';

export const metadata = {
  metadataBase: new URL('https://infrax.ai'),
  icons: { icon: [{ url: '/assets/icon.svg', type: 'image/svg+xml' }] },
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// arriving from another page by a full load: start the bottom-to-top reveal at first paint, not after scripts load
const WAVE_IN = 'try{if(sessionStorage.getItem("infrax-wave")==="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)'
  + 'document.documentElement.classList.add("wave-in")}catch(e){}';
// body[data-page] drives page-level CSS (inner pages use a calmer type scale): set it before first paint.
// The runtime keeps it in sync on client-side navigation.
const DATA_PAGE =`(function(){var m=${JSON.stringify(PAGES)},p=location.pathname;while(p.length>1&&p.slice(-1)==="/")p=p.slice(0,-1);if(m[p])document.body.setAttribute("data-page",m[p])})()`;

export default function RootLayout({ children }) {
  return (
    // the runtime adds classes/styles to <html> and <body> (wave-in, dm-lock, data-page, scroll lock)
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* the real family names "Onest" and "Geist Mono" are needed: canvases measure text with them (no next/font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400..800&family=Geist+Mono:wght@400..800&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: WAVE_IN }} />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: DATA_PAGE }} />
        <SiteNav />
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter />
        <DemoModal />
        <SiteRuntime />
      </body>
    </html>
  );
}
