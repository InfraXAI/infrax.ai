// Intro: the page heading, the six domain tiles (rendered here from lib/site-data.js) and the scroll cue.
import { PRODUCT_DOMAINS } from '@/lib/site-data';
// Markup from site/src/products.html, unchanged apart from JSX syntax.
export default function ProductsIntro() {
  return (
    <section className="cy-intro" aria-labelledby="cy-h">
      <div className="wrap">
        <div className="cy-intro-grid">
          <h1 className="h-hero" id="cy-h" data-reveal="">Every road,<br />every gate,<br /><em>every dock.</em></h1>
          <p className="cy-lead">Multiple products, from the gantry to the control room. Pick a domain to travel through them.</p>
        </div>
        {/* rendered here (same markup as products.js domBtn) so the intro does not grow when the script runs */}
        <div className="cy-dgrid" id="cyDgrid" role="group" aria-label="Choose a domain">
          {PRODUCT_DOMAINS.map((d) => (
            <button key={d.slug} type="button" className="cy-dbtn" data-dom={d.slug} aria-pressed={d.slug === 'highways' ? 'true' : 'false'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d.icon }} /><b>{d.label}</b><span>{d.sub}</span>
            </button>
          ))}
        </div>
        <a className="cy-cue" href="#cy-tunnel" id="cyCue"><i aria-hidden="true"></i>Scroll</a>
      </div>
    </section>
  );
}
