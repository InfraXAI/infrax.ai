// TODO(page agent): port site/src/integrations.html here, following the Services pattern (see README.md).
// Placeholder: renders the shared shell plus a heading so the route builds.
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import PageRuntime from '@/components/site/PageRuntime';

export const metadata = pageMetadata('integrations');

export default function IntegrationsPage() {
  return (
    <>
      <JsonLd page="integrations" />
      <section className="scene"><div className="wrap"><h1 className="h-hero">Integrations</h1></div></section>
      <PageRuntime page="integrations" />
    </>
  );
}
