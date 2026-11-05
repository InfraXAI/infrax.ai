// /services: port of site/src/services.html. Markup in components/services/*, page CSS in ./services.css,
// page script in lib/pages/services.js (run by ServicesScript).
import './services.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesCards from '@/components/services/ServicesCards';
import ServicesPath from '@/components/services/ServicesPath';
import ServicesDetails from '@/components/services/ServicesDetails';
import ServicesScript from '@/components/services/ServicesScript';

export const metadata = pageMetadata('services');

export default function ServicesPage() {
  return (
    <>
      <JsonLd page="services" />
      <ServicesHero />
      <ServicesCards />
      <ServicesPath />
      <ServicesDetails />
      <ServicesScript />
    </>
  );
}
