'use client';
// Runs the Integrations page script (lib/pages/integrations.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/integrations';

export default function IntegrationsScript() {
  usePage('integrations', init);
  return null;
}
