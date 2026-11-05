// /integrations: port of site/src/integrations.html. Markup in components/integrations/*, page CSS in ./integrations.css,
// page script in lib/pages/integrations.js (run by IntegrationsScript).
import './integrations.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import IntegrationsHero from '@/components/integrations/IntegrationsHero';
import IntegrationsHub from '@/components/integrations/IntegrationsHub';
import IntegrationsCatalogue from '@/components/integrations/IntegrationsCatalogue';
import IntegrationsExchange from '@/components/integrations/IntegrationsExchange';
import IntegrationsNext from '@/components/integrations/IntegrationsNext';
import IntegrationsScript from '@/components/integrations/IntegrationsScript';

export const metadata = pageMetadata('integrations');

export default function IntegrationsPage() {
  return (
    <>
      <JsonLd page="integrations" />
      <IntegrationsHero />
      <IntegrationsHub />
      <IntegrationsCatalogue />
      <IntegrationsExchange />
      <IntegrationsNext />
      <IntegrationsScript />
    </>
  );
}
