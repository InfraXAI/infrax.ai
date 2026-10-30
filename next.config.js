// Next.js config for the InfraX AI site.
// The old static site served /<page>.html; those URLs redirect permanently to the clean routes.
const PAGES = ['products', 'analytics', 'deployment', 'how-it-works', 'integrations', 'services'];

/** @type {import('next').NextConfig} */
module.exports = {
  // each agent / CI job can build into its own folder: NEXT_DIST_DIR=.next-services npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // the page scripts are imperative DOM programs written to run once per page load (they split headings into lines,
  // inject icon SVGs, start canvas loops). Strict mode's dev-only double effect run would initialise them twice.
  reactStrictMode: false,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/home.html', destination: '/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      ...PAGES.map((p) => ({ source: `/${p}.html`, destination: `/${p}`, permanent: true })),
    ];
  },
};
