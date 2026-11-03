'use client';
// Boots the shared runtime (lib/site-runtime.js) once. Pages also boot it from usePage(), whose effect runs first
// (page effects run before this sibling's), so this mainly hands over the router for client-side page transitions.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bootSite } from '@/lib/site-runtime';

export default function SiteRuntime() {
  const router = useRouter();
  useEffect(() => { bootSite(router); }, [router]);
  return null;
}
