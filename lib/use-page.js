// usePage(page, init): the one hook every page's client Script component calls.
//   1. boots the shared runtime once (lib/site-runtime.js bootSite)
//   2. runs the per-page part of site.js for this page (enterPage: body[data-page], reveals, icons, scroll to top ...)
//   3. runs the page's own script, init() from lib/pages/<page>.js, inside a gsap.context
// On unmount (client-side navigation away) it calls init's returned cleanup, reverts every gsap tween/ScrollTrigger the
// init created synchronously, then undoes enterPage. `init` must be a stable module-level function.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bootSite, enterPage } from './site-runtime';
import { gsap } from './globals';

export function usePage(page, init) {
  const router = useRouter();
  useEffect(() => {
    bootSite(router);
    const leave = enterPage(page);
    let dispose = null;
    // a failing page script must not take the shell down with it (a script error on the static site stopped only that script)
    const ctx = gsap.context(() => {
      if (!init) return;
      try { dispose = init(); } catch (err) { console.error('[' + page + '] page script failed:', err); }
    });
    return () => {
      try { if (typeof dispose === 'function') dispose(); } catch (err) { console.error('[' + page + '] cleanup failed:', err); }
      ctx.revert();
      leave();
    };
    // router is left out on purpose: the effect must run once per page mount, never again on a re-render
  }, [page, init]); // eslint-disable-line react-hooks/exhaustive-deps
}
