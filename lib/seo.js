// Per-page <head> data from each site/src/<page>.html META line and build.py head(): title, description,
// canonical URL, Open Graph and Twitter cards. Use: export const metadata = pageMetadata('services');
export const SITE = 'https://infrax.ai';
export const PATHS = { home: '/', products: '/products', analytics: '/analytics', 'how-it-works': '/how-it-works',
  deployment: '/deployment', integrations: '/integrations', services: '/services' };
export const NAMES = { products: 'Products', analytics: 'AI analytics', 'how-it-works': 'How it works', deployment: 'Deployment',
  integrations: 'Integrations', services: 'Services' };

const META = {
  home: ['InfraX AI', 'The agentic OS for infrastructure. AI agents run the routine work across every camera, asset and site; your people approve what matters. On your own servers or hosted.'],
  products: ['Products', 'Seven InfraX AI products for highways, cities, campuses, ports and warehouses: VIDES, AstraAlert, TollCloud, Cygnus, Central Plexus, Ops, Access.'],
  analytics: ['AI analytics', 'Number plates, vehicle classes, watchlist alerts, plate search and camera health on your cameras, running on standard CPU servers.'],
  deployment: ['Deployment', 'Every InfraX AI product installs on servers you own: central, edge or hybrid, on the IP cameras you already have.'],
  'how-it-works': ['How it works', 'From camera to action in real time: site devices capture events, AI at the site raises alerts even offline, and operators act from one control room.'],
  integrations: ['Integrations', 'InfraX AI connects to any IP camera, your VMS or NVR, REST APIs and webhooks, call boxes, LED signs and e-challan review.'],
  services: ['Services', 'Scoped engineering from InfraX AI: API integration, operator apps, camera and video AI integration, deployment and handover.'],
};

export function pageMetadata(page) {
  const [title, description] = META[page];
  const url = SITE + PATHS[page];
  const image = SITE + '/img/real/wall-corridor.jpg';
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'InfraX AI', locale: 'en_IN', url, title, description,
      images: [{ url: image, alt: 'A control-room video wall of highway camera feeds' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
