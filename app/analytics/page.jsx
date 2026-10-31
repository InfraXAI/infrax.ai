// /analytics: port of site/src/analytics.html. Markup in components/analytics/*, page CSS in ./analytics.css,
// page script in lib/pages/analytics.js (run by AnalyticsScript).
import './analytics.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import AnalyticsHero from '@/components/analytics/AnalyticsHero';
import AnalyticsFilter from '@/components/analytics/AnalyticsFilter';
import AnalyticsGroups from '@/components/analytics/AnalyticsGroups';
import AnalyticsDayNight from '@/components/analytics/AnalyticsDayNight';
import AnalyticsScript from '@/components/analytics/AnalyticsScript';

export const metadata = pageMetadata('analytics');

export default function AnalyticsPage() {
  return (
    <>
      <JsonLd page="analytics" />
      <AnalyticsHero />
      <AnalyticsFilter />
      <AnalyticsGroups />
      <AnalyticsDayNight />
      <AnalyticsScript />
    </>
  );
}
