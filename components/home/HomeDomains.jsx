// Domains: heading; the tiles are built by the page script into #hmTiles.
// Markup from site/src/home.html, unchanged apart from JSX syntax.
export default function HomeDomains() {
  return (
    <section className="scene" id="domains" aria-labelledby="hmDomT">
      <div className="wrap">
        <div className="hm-head hm-c">
          <div>
            <h2 className="h-1" id="hmDomT" data-reveal="">Built for highways, cities,<br />campuses, ports and more.</h2>
          </div>
          <p className="body">Pick yours to travel through it in 3D.</p>
        </div>
        <div className="hm-tiles" id="hmTiles"></div>
      </div>
    </section>
  );
}
