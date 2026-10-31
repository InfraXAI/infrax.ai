// Hero: the intro canvas (particles -> logo -> globe -> India map inside two rings), headline and calls to action.
// Markup from site/src/home.html, unchanged apart from JSX syntax.
import { HX_PRE } from './hero-intro';

export default function HomeHero() {
  return (
    <section className="hm-hero" aria-labelledby="hmTitle" suppressHydrationWarning>
      {/* PORT: the static page's inline intro script, run during HTML parsing on a full load (see hero-intro.js) */}
      <script dangerouslySetInnerHTML={{ __html: HX_PRE }} />
      <canvas className="hx-pt" id="hxPt" aria-hidden="true"></canvas>
      <div className="wrap hx">
        <div className="hx-vis" id="hxStage">
          <div className="hx-map" role="img" aria-label="Animated map: a globe turns to India, whose dots settle into a map of live sites on a highway, a port, a campus, a city, a warehouse and a construction site, all linked to one command centre near Gurugram, inside two revolving rings"><canvas id="hxGl" aria-hidden="true"></canvas></div>
          <svg className="hx-rings" id="hxRings" aria-hidden="true" focusable="false"></svg>
          <canvas className="hx-rc" id="hxRc" aria-hidden="true"></canvas>
          <div className="hx-lbs" id="hxLbs" aria-hidden="true"></div>
        </div>
        <div className="hx-copy">
          <h1 className="h-hero hm-h1" id="hmTitle"><span className="hx-brand">InfraX AI</span> — where infrastructure runs itself.</h1>
          <p className="hx-sub"><strong>The agentic OS for infrastructure.</strong> AI Beings run the routine work across every camera, asset and site; your people approve what matters.</p>
          <div className="btn-row">
            <a className="btn btn-primary" href="/#demo" data-magnetic="">Book a demo <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></a>
            <a className="btn btn-ghost" href="/products">See the products <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></a>
          </div>
        </div>
      </div>
    </section>
  );
}
