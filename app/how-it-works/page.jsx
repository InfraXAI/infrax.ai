// TODO(page agent): port site/src/how-it-works.html here, following the Services pattern (see README.md).
// Placeholder: renders the shared shell plus a heading so the route builds.
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import PageRuntime from '@/components/site/PageRuntime';

export const metadata = pageMetadata('how-it-works');

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd page="how-it-works" />
      <section className="scene"><div className="wrap"><h1 className="h-hero">How it works</h1></div></section>
      <PageRuntime page="how-it-works" />
    </>
  );
}
