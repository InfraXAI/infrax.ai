'use client';
// Runs the Analytics page script (lib/pages/analytics.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/analytics';

export default function AnalyticsScript() {
  usePage('analytics', init);
  return null;
}
