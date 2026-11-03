'use client';
// Runs the Home page script (lib/pages/home.js) after the page markup mounts, and stops it on the way out.
// `logo` is public/assets/logo.svg as a data URI (read on the server by app/page.jsx), as build.py inlined it for
// __LOGO_URI__: the intro particles sample its pixels from a canvas.
import { useLayoutEffect } from 'react';
import { usePage } from '@/lib/use-page';
import { init, setLogoUri } from '@/lib/pages/home';
import { preIntro } from './hero-intro';

export default function HomeScript({ logo }) {
  setLogoUri(logo);
  // before first paint on a client-side arrival: decide whether the hero intro plays (the inline script's job on a full load)
  useLayoutEffect(preIntro, []);
  usePage('home', init);
  return null;
}
