// Book a demo band (its canvas[data-net] is run by the shared runtime).
// Markup from site/src/home.html, unchanged apart from JSX syntax.
export default function HomeDemo() {
  return (
    <section className="scene" id="demo" aria-labelledby="hmDemoT">
      <div className="wrap">
        <div className="hm-demo">
          <div className="hm-demo-side">
            <canvas className="hm-demo-net" data-net="" aria-hidden="true"></canvas>
            <div>
              <h2 className="h-2" id="hmDemoT">See it on a <em>site like yours.</em></h2>
              <p className="body" style={{ 'marginTop': 'calc(14*var(--s))' }}>Tell us what you run. We'll show the products that fit.</p>
            </div>
            <ol className="hm-steps">
              <li><i>1</i><span>A 30-minute call about your sites and cameras.</span></li>
              <li><i>2</i><span>A live walkthrough of the control room for your domain.</span></li>
              <li><i>3</i><span>A rollout plan for your sites and servers.</span></li>
            </ol>
          </div>
          <div className="hm-demo-cta">
            <h3 className="h-3" style={{ 'fontSize': 'var(--fs-h3)' }}>Tell us about your sites.</h3>
            <p className="body">It takes about a minute.</p>
            <div className="btn-row" style={{ 'marginTop': 'calc(22*var(--s))' }}><a className="btn btn-primary" href="/#demo" data-magnetic="">Book a demo <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></a><span className="hm-demo-mail">or email <a href="mailto:info@infrax.ai">info@infrax.ai</a></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
