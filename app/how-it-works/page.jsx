// /how-it-works: port of site/src/how-it-works.html. Markup in components/how-it-works/*, page CSS in ./how-it-works.css,
// page script in lib/pages/how-it-works.js (run by HowItWorksScript).
import './how-it-works.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import HowHero from '@/components/how-it-works/HowHero';
import HowStack from '@/components/how-it-works/HowStack';
import HowDist from '@/components/how-it-works/HowDist';
import HowFed from '@/components/how-it-works/HowFed';
import HowNext from '@/components/how-it-works/HowNext';
import HowItWorksScript from '@/components/how-it-works/HowItWorksScript';

export const metadata = pageMetadata('how-it-works');

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd page="how-it-works" />
      <HowHero />
      <HowStack />
      <HowDist />
      <HowFed />
      <HowNext />
      <HowItWorksScript />
    </>
  );
}
