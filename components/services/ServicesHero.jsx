// Hero: headline, the two calls to action and who we work with.
// Markup from site/src/services.html, unchanged apart from JSX syntax.
export default function ServicesHero() {
  return (
    <section className="sv-hero" aria-labelledby="sv-title"><div className="wrap" data-reveal-now="">
      <h1 className="h-hero" id="sv-title" data-reveal="">Start with one site or one workflow.</h1>
      <p className="lead">We connect what you already run, build the operator workflow around it, and deliver a defined software scope.</p>
      <div className="btn-row">
        <a className="btn btn-primary" href="/#demo" data-magnetic="">Talk to us about a scope <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></a>
        <a className="btn btn-ghost" href="#sv-path">See how an engagement runs</a>
      </div>
      <ul className="sv-for" aria-label="Who we work with"><li>Highway operators &amp; concessionaires</li><li>EPC &amp; O&amp;M contractors</li><li>Authorities</li><li>System integrators</li><li>Security teams</li></ul>
    </div></section>
  );
}
