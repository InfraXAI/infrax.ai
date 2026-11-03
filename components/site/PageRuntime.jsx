'use client';
// For a page with no script of its own: runs the shared per-page runtime only (reveals, icons, scroll to top ...).
// Pages with a script use their own components/<page>/<Page>Script.jsx instead (see README).
import { usePage } from '@/lib/use-page';

export default function PageRuntime({ page }) {
  usePage(page, null);
  return null;
}
