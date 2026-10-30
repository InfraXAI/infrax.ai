// Client bootstrap for the libraries the original site loaded from CDNs.
// The ported page scripts are unchanged imperative programs that read window.gsap, window.ScrollTrigger, window.Lenis
// (and window.THREE on 3D pages), so these npm packages are pinned to the CDN versions and exposed as the same globals.
// Importing this module is SSR-safe; nothing touches window until installGlobals() runs in an effect.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function installGlobals() {
  if (typeof window === 'undefined' || window.__infraxGlobals) return;
  window.__infraxGlobals = true;
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
  window.Lenis = Lenis;
  // the CDN ScrollTrigger build registered itself when it loaded after gsap
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger, Lenis };
