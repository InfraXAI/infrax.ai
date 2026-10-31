'use client';
// Runs the Deployment page script (lib/pages/deployment.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/deployment';

export default function DeploymentScript() {
  usePage('deployment', init);
  return null;
}
