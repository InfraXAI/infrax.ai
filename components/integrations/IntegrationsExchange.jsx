// "Where our products connect today": the products exchange graph (nodes, links and travelling tags are built by
// lib/pages/integrations.js) and the list of product-to-product links.
// Markup from site/src/integrations.html, unchanged apart from JSX syntax; every link shows Live (every status on the site is Live).

export default function IntegrationsExchange() {
  return (
    <section className="in-tog" aria-labelledby="in-tog-title"><div className="wrap">
      <div className="hm-xwrap" id="hmTog">
        <div className="hm-xhead">
          <h2 className="h-2" id="in-tog-title">Where our products connect today.</h2>
          <p>Gantries feed Plexus, and reviewed cases go on to e-challan.</p>
        </div>
        <div className="hm-ex" id="hmEx" role="img" aria-label="Animated diagram with Plexus (ATMS / ICCC) in the centre. Dhrishya sends plates, speed, class and evidence and receives speed limits; AstraAlert can file incidents; reviewed cases go to e-challan. Cygnus, Ulka and Toran sit around it.">
          <svg aria-hidden="true" id="hmExSvg"></svg>
        </div>
      </div>
    </div></section>
  );
}
