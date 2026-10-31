// /: port of site/src/home.html. Markup in components/home/*, page CSS in ./home.css,
// page script in lib/pages/home.js (run by HomeScript).
import './home.css';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import HomeHero from '@/components/home/HomeHero';
import HomeAgents from '@/components/home/HomeAgents';
import HomeTwin from '@/components/home/HomeTwin';
import HomeProducts from '@/components/home/HomeProducts';
import HomeDomains from '@/components/home/HomeDomains';
import HomeProof from '@/components/home/HomeProof';
import HomeCompany from '@/components/home/HomeCompany';
import HomeDemo from '@/components/home/HomeDemo';
import HomeScript from '@/components/home/HomeScript';

export const metadata = pageMetadata('home');

// the hero intro samples the real logo: inline it as a data URI (build.py did this for __LOGO_URI__) so a canvas can
// always read its pixels. Read at build time; the page is static.
const LOGO_URI = 'data:image/svg+xml;base64,' + readFileSync(join(process.cwd(), 'public/assets/logo.svg')).toString('base64');

export default function HomePage() {
  return (
    <>
      <JsonLd page="home" />
      <HomeHero />
      <HomeAgents />
      <HomeTwin />
      <HomeProducts />
      <HomeDomains />
      <HomeProof />
      <HomeCompany />
      <HomeDemo />
      <HomeScript logo={LOGO_URI} />
    </>
  );
}
