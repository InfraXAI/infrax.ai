'use client';
// Runs the Services page script (lib/pages/services.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/services';

export default function ServicesScript() {
  usePage('services', init);
  return null;
}
