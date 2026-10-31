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
  ['vides', 'Dhrishya', 'Plate, speed and class at the gantry'],
  ['astraalert', 'AstraAlert', 'Every emergency call answered and located'],
  ['tollcloud', 'TollCloud', 'Toll lanes that keep running offline'],
  ['mlff', 'Halley', 'Free-flow tolling gantry, no stopping'],
  ['cygnus', 'Cygnus', 'Video management with AI'],
  ['central-plexus', 'Plexus (ATMS / ICCC)', 'One live map, incidents, e-challan and signs'],
  ['ops', 'Ulka', 'Field operations, workforce and assets, run by AI Beings'],
  ['access-parking', 'Toran', 'Entry and exit, plate reads'],
];
// product logos from the brand zip (mark and name only; lockups wait for approved taglines). TollCloud has none yet.
// slug -> [file stem in /assets/products, display name, wordmark width at a height of 80]
export const PRODUCT_LOGOS = {
  'central-plexus': ['plexus', 'Plexus', 342.17], cygnus: ['cygnus', 'Cygnus', 366.47], vides: ['dhrishya', 'Dhrishya', 446.26],
  astraalert: ['astraalert', 'AstraAlert', 522.76], mlff: ['halley', 'Halley', 335.47], 'access-parking': ['toran', 'Toran', 300.05],
  ops: ['ulka', 'Ulka', 231.25],
};
// each product's mark in the menu: the InfraX AI logo mark in its own colour, turned to its own angle
export const MARKS = {
  vides: ['#2673B5', 0], astraalert: ['#D6453D', 45], tollcloud: ['#0E8A7E', 90], mlff: ['#2E9E5B', 135],
  cygnus: ['#4C5FD5', 180], 'central-plexus': ['#0E3B66', 225], ops: ['#C9861A', 270], 'access-parking': ['#5A7A99', 315],
};

export const DEMO_PRODUCTS = ['Dhrishya', 'AstraAlert', 'TollCloud', 'Halley', 'Cygnus', 'Plexus (ATMS / ICCC)', 'Ulka', 'Toran'];
export const DEMO_DOMAINS = ['Highways', 'Cities', 'Campuses', 'Ports', 'Warehouses', 'Construction', 'System integrator'];

// route -> body[data-page] (build.py set data-page from each page's META line)
export const PAGES = { '/': 'home', '/products': 'products', '/analytics': 'analytics', '/deployment': 'deployment',
  '/how-it-works': 'how-it-works', '/integrations': 'integrations', '/services': 'services' };
export function pageForPath(pathname) { return PAGES[(pathname || '/').replace(/\/+$/, '') || '/'] || ''; }
// Products: the six domains (the intro tiles and the tunnel's domain switcher)
export const PRODUCT_DOMAINS = [
    { slug: 'highways', label: 'Highways', sub: 'Gantries, call boxes, toll plazas, Plexus', icon: '<path d="M4 21L9 3M20 21L15 3M12 5v2M12 11v2M12 17v2"/>' },
    { slug: 'cities', label: 'Cities', sub: 'Junction cameras, plate search, one wall', icon: '<path d="M3 21h18M5 21V9l5-3v15M10 21V4l6 3v14M16 21v-9l4 2v7"/>' },
    { slug: 'campuses', label: 'Campuses', sub: 'Gates, parking, many buildings', icon: '<path d="M3 21h18M5 21V10h6v11M13 21V6h6v15M7 13h2M7 16h2M15 9h2M15 12h2M15 15h2"/>' },
    { slug: 'ports', label: 'Ports', sub: 'Gate lanes, yards, remote cameras', icon: '<path d="M3 17h18l-2 4H5zM6 17V9h5v8M13 17v-5h5v5M14 4l5 0M16.5 4v8"/>' },
    { slug: 'warehouses', label: 'Warehouses', sub: 'Docks, gates, yard trucks', icon: '<path d="M3 21V9l9-5 9 5v12M7 21v-7h10v7M7 17h10"/>' },
    { slug: 'construction', label: 'Construction', sub: 'Site gates, deliveries, cameras', icon: '<path d="M4 21h16M7 21V8M7 8h12M7 8l4-5M15 8v5M13 13h4v4h-4z"/>' }
];
