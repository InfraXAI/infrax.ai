// Sticky domain filter; counts and aria-pressed are driven by lib/pages/analytics.js.
export default function AnalyticsFilter() {
  return (
    <div className="an-bar"><div className="wrap">
      <div className="an-filter" role="group" aria-label="Filter analytics by domain" id="anFilter">
        <button type="button" data-f="all" aria-pressed="true">All<span className="count"></span></button>
        <button type="button" data-f="hwy" aria-pressed="false">Highways<span className="count"></span></button>
        <button type="button" data-f="city" aria-pressed="false">Cities<span className="count"></span></button>
        <button type="button" data-f="campus" aria-pressed="false">Campuses<span className="count"></span></button>
        <button type="button" data-f="ports" aria-pressed="false">Ports<span className="count"></span></button>
        <button type="button" data-f="wh" aria-pressed="false">Warehouses<span className="count"></span></button>
        <button type="button" data-f="cons" aria-pressed="false">Construction<span className="count"></span></button>
      </div>
    </div></div>
  );
}
