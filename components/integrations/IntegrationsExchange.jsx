// "Our products work as one": the products exchange graph (nodes, links and travelling tags are built by lib/pages/integrations.js).
// Markup from site/src/integrations.html, unchanged apart from JSX syntax.
export default function IntegrationsExchange() {
  return (
    <section className="in-tog" aria-labelledby="in-tog-title"><div className="wrap">
      <div className="hm-xwrap" id="hmTog">
        <div className="hm-xhead">
          <h2 className="h-2" id="in-tog-title">Our products work as one.</h2>
          <p>Plates, clips, calls and work orders move between products as they happen.</p>
        </div>
        <div className="hm-ex" id="hmEx" role="img" aria-label="Animated diagram: products exchange data. The centre rotates between Cygnus, Central Plexus (ATMS / ICCC) and InfraX AI Ops; VIDES sends plates, speed, class and evidence and receives speed limits; AstraAlert, TollCloud and Access and parking send calls, toll sessions and gate reads.">
          <svg aria-hidden="true" id="hmExSvg"></svg>
        </div>
      </div>
    </div></section>
  );
}
