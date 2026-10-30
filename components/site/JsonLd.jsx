// JSON-LD from build.py ld(): the organisation and website on Home, a breadcrumb on every other page.
// Rendered by each page (structured data is valid anywhere in the document).
import { SITE, PATHS, NAMES } from '@/lib/seo';

const ORG = { '@context': 'https://schema.org', '@type': 'Organization', name: 'InfraX AI', legalName: 'NaturNest AI Private Limited', url: 'https://infrax.ai', logo: 'https://infrax.ai/assets/logo.svg', email: 'info@infrax.ai', address: { '@type': 'PostalAddress', streetAddress: 'WeWork DLF Forum, Cyber City', addressLocality: 'Gurugram', addressRegion: 'Haryana', postalCode: '122002', addressCountry: 'IN' } };

export default function JsonLd({ page }) {
  const data = page === 'home'
    ? [ORG, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'InfraX AI', url: SITE + '/' }]
    : [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: NAMES[page] || page, item: SITE + (PATHS[page] || '/' + page) }] }];
  return data.map((d, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\u003c') }} />
  ));
}
