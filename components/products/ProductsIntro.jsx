// Intro: the page heading, the six domain tiles (filled by the page script) and the scroll cue.
// Markup from site/src/products.html, unchanged apart from JSX syntax.
export default function ProductsIntro() {
  return (
    <section className="cy-intro" aria-labelledby="cy-h">
      <div className="wrap">
        <div className="cy-intro-grid">
          <h1 className="h-hero" id="cy-h" data-reveal="">Every road,<br />every gate,<br /><em>every dock.</em></h1>
          <p className="cy-lead">Multiple products, from the gantry to the control room. Pick a domain to travel through them.</p>
        </div>
        <div className="cy-dgrid" id="cyDgrid" role="group" aria-label="Choose a domain"></div>
        <a className="cy-cue" href="#cy-tunnel" id="cyCue"><i aria-hidden="true"></i>Scroll</a>
      </div>
    </section>
  );
}
