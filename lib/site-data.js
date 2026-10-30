// Shared content tables from site/build.py (nav menus, demo form options). Same order and wording.

// slug (route), title, one line, menu icon paths
export const PLATFORM = [
  ['how-it-works', 'How it works', 'From cameras to real-time actions',
    '<path d="M4 18h4v-4H4zM10 12h4V8h-4zM16 6h4V2h-4M8 16l2-2M14 10l2-2"/>'],
  ['analytics', 'AI analytics', 'What the cameras read and flag, live',
    '<path d="M3 20h18M6 16V9M11 16V5M16 16v-6M21 16v-3"/>'],
  ['deployment', 'Deployment', 'Installs on your own servers, works with the cameras you own',
    '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>'],
  ['integrations', 'Integrations', 'Cameras, radar, call boxes, signs and e-challan',
    '<path d="M9 7H6a3 3 0 0 0 0 6h3M15 7h3a3 3 0 0 1 0 6h-3M8 10h8"/>'],
];

// INFRAX.AI product map: slug, name, one line. Slugs are /products#<slug> stations, in the highway tunnel's order
export const PRODUCTS = [
  ['vides', 'InfraX AI VIDES', 'Plate, speed and class at the gantry'],
  ['astraalert', 'AstraAlert', 'Every emergency call answered and located'],
  ['tollcloud', 'TollCloud', 'Toll lanes that keep running offline'],
  ['mlff', 'MLFF', 'Free-flow tolling gantry, no stopping'],
  ['cygnus', 'Cygnus', 'Video management with AI'],
  ['central-plexus', 'Central Plexus (ATMS / ICCC)', 'One live map, incidents, e-challan and signs'],
  ['ops', 'InfraX AI Ops', 'Field operations, workforce and assets, run by AI agents'],
  ['access-parking', 'Access and parking', 'Entry and exit, plate reads'],
];
// each product's mark in the menu: the InfraX AI logo mark in its own colour, turned to its own angle
export const MARKS = {
  vides: ['#2673B5', 0], astraalert: ['#D6453D', 45], tollcloud: ['#0E8A7E', 90], mlff: ['#2E9E5B', 135],
  cygnus: ['#4C5FD5', 180], 'central-plexus': ['#0E3B66', 225], ops: ['#C9861A', 270], 'access-parking': ['#5A7A99', 315],
};

export const DEMO_PRODUCTS = ['InfraX AI VIDES', 'AstraAlert', 'TollCloud', 'MLFF', 'Cygnus', 'Central Plexus (ATMS / ICCC)', 'InfraX AI Ops', 'Access and parking'];
export const DEMO_DOMAINS = ['Highways', 'Cities', 'Campuses', 'Ports', 'Warehouses', 'Construction', 'System integrator'];

// route -> body[data-page] (build.py set data-page from each page's META line)
export const PAGES = { '/': 'home', '/products': 'products', '/analytics': 'analytics', '/deployment': 'deployment',
  '/how-it-works': 'how-it-works', '/integrations': 'integrations', '/services': 'services' };
export function pageForPath(pathname) { return PAGES[(pathname || '/').replace(/\/+$/, '') || '/'] || ''; }
