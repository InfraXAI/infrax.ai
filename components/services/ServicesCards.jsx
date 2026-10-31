// The five service cards (three, then two wider). Each card's mini SVG is animated by lib/pages/services.js (data-k picks the animation).
// Markup from site/src/services.html, unchanged apart from JSX syntax.
export default function ServicesCards() {
  return (
    <section className="scene tight" aria-labelledby="sv-svc-title" style={{ 'overflowX': 'clip' }}><div className="wrap">
      <h2 className="h-sub" id="sv-svc-title" data-reveal="">Built around your systems, to your acceptance tests.</h2>
      <p className="lead">Built to your interfaces. You own the configuration and integrations we build for you.</p>
      <div className="sv-cards" id="svCards">
        <article className="sv-card" data-k="api">
          <div className="sv-miniwrap"><svg className="sv-mini" viewBox="0 0 300 96" aria-hidden="true">
            <g fill="none" stroke="#2673B5" strokeWidth="1.5"><rect x="14" y="30" width="58" height="36" rx="6" fill="#fff" /><rect x="228" y="30" width="58" height="36" rx="6" fill="#fff" /></g>
            <path d="M72 42 L228 42 M72 54 L228 54" stroke="#C5D4E2" strokeWidth="1.4" /><rect className="pk" width="14" height="10" rx="2" y="37" fill="#2673B5" /><rect className="pk2" width="12" height="9" rx="2" y="49.5" fill="#fff" stroke="#2673B5" strokeWidth="1.4" />
          </svg><span className="sv-mi" style={{ 'left': '14.3%' }} aria-hidden="true"><span className="ix" data-ix="server" data-size="20"></span></span><span className="sv-mi" style={{ 'left': '85.7%' }} aria-hidden="true"><span className="ix" data-ix="api" data-size="20"></span></span></div>
          <span className="ix sv-ico" data-ix="api" data-size="28" aria-hidden="true"></span><span className="n">01</span><h3>Software &amp; API integration</h3>
          <p>Connect applications, device feeds and operational data into one path.</p>
          <ul><li>Interfaces mapped and tested</li><li>Events into your systems</li></ul>
        </article>
        <article className="sv-card" data-k="apps">
          <svg className="sv-mini" viewBox="0 0 300 96" aria-hidden="true">
            <rect x="14" y="12" width="272" height="72" rx="8" fill="#fff" stroke="#C5D4E2" />
            <g className="bars" fill="#2673B5"></g>
            <rect x="200" y="22" width="76" height="14" rx="3" fill="#DCEBF7" /><rect x="200" y="42" width="58" height="8" rx="2" fill="#F2F7FC" /><rect x="200" y="56" width="66" height="8" rx="2" fill="#F2F7FC" />
          </svg>
          <span className="ix sv-ico" data-ix="operator" data-size="28" aria-hidden="true"></span><span className="n">02</span><h3>Operator applications</h3>
          <p>Dashboards, event views and review workflows built for the people on shift.</p>
          <ul><li>Event and review screens</li><li>Reports operators use</li></ul>
        </article>
        <article className="sv-card" data-k="video">
          <svg className="sv-mini" viewBox="0 0 300 96" aria-hidden="true">
            <g fill="none" stroke="#2673B5" strokeWidth="1.5"><rect x="16" y="34" width="34" height="22" rx="4" fill="#fff" /><path d="M50 40l12-6v22l-12-6" /></g>
            <path className="cone" d="M62 45 L176 14 L176 82 Z" fill="#2673B5" fillOpacity=".08" />
            <rect className="scanbar" x="62" y="14" width="2" height="68" fill="#2673B5" />
            <rect className="det" x="186" y="30" width="54" height="34" rx="2" fill="none" stroke="#2673B5" strokeWidth="1.6" />
            <rect x="186" y="12" width="88" height="16" rx="2" fill="#2673B5" /><text x="191" y="24" fontFamily="Geist Mono, monospace" fontSize="12" fill="#fff">ANPR · car</text>
            <rect x="246" y="38" width="46" height="16" rx="2" fill="#fff" stroke="#0A1A2B" strokeWidth="1" /><text x="250" y="50" fontFamily="Geist Mono, monospace" fontSize="12" fill="#0A1A2B">XX 26</text>
          </svg>
          <span className="ix sv-ico" data-ix="camera" data-size="28" aria-hidden="true"></span><span className="n">03</span><h3>Camera &amp; video AI integration</h3>
          <p>Cameras, video analytics and ANPR connected to review and reporting.</p>
          <ul><li>Any IP camera, ONVIF / RTSP</li><li>Detections with evidence</li></ul>
        </article>
        <article className="sv-card" data-k="handover">
          <svg className="sv-mini" viewBox="0 0 300 96" aria-hidden="true">
            <path d="M40 46 L262 46" stroke="#C5D4E2" strokeWidth="2" />
            <g className="ticks"></g>
          </svg>
          <span className="ix sv-ico" data-ix="server" data-size="28" aria-hidden="true"></span><span className="n">04</span><h3>Deployment &amp; handover</h3>
          <p>Target environment, tests, documentation and ownership agreed up front.</p>
          <ul><li>On your own servers</li><li>Docs and handover</li></ul>
        </article>
        {/* a new detection zone drawn on a camera view; the footage clips beside it tick off as it is checked */}
        <article className="sv-card" data-k="ai">
          <svg className="sv-mini" viewBox="0 0 300 96" aria-hidden="true">
            <rect x="14" y="12" width="160" height="72" rx="6" fill="#fff" stroke="#C5D4E2" />
            <path d="M70 12 L40 84 M118 12 L148 84" stroke="#DCE5EE" strokeWidth="1.2" />
            <path className="zone" d="M58 44 L128 44 L142 74 L46 74 Z" fill="#2673B5" fillOpacity=".06" stroke="#2673B5" strokeWidth="1.5" strokeDasharray="5 4" />
            <rect className="obj" x="86" y="16" width="16" height="11" rx="2" fill="#2673B5" />
            <g className="clips"></g>
            <text x="196" y="22" fontFamily="Geist Mono, monospace" fontSize="12" fill="#5B6E82">Your footage</text>
          </svg>
          <span className="ix sv-ico" data-ix="camera" data-size="28" aria-hidden="true"></span><span className="n">05</span><h3>Custom AI scenarios</h3>
          <p>New detection scenarios built for your cameras and checked against your footage.</p>
        </article>
      </div>
    </div></section>
  );
}
