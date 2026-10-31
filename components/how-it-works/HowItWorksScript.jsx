'use client';
// Runs the How it works page script (lib/pages/how-it-works.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/how-it-works';

export default function HowItWorksScript() {
  usePage('how-it-works', init);
  return null;
}
