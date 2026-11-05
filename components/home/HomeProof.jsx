// Live on national highways: proof figures and the corridor video wall (tiles built by the page script).
// Markup from site/src/home.html, unchanged apart from JSX syntax.
export default function HomeProof() {
  return (
    <section className="scene" id="proof" aria-labelledby="hmPfT">
      <div className="wrap hw">
        <div className="hm-head">
          <h2 className="h-1" id="hmPfT" data-reveal="">Live on national highways.</h2>
          <p className="lead">Every camera on the corridor, watched by AI and your operators.</p>
          <dl className="hw-proof">
            <div><dt>108 km</dt><dd>of national-highway corridor in India</dd></div>
            <div><dt>108</dt><dd>PTZ and ANPR cameras on the corridor</dd></div>
            <div><dt>24&times;7</dt><dd>control room, running since Feb 2025</dd></div>
            <div><dt>May 2026</dt><dd>Cygnus in production on standard CPU servers</dd></div>
          </dl>
        </div>
        <figure className="hw-fig" id="hwFig">
          <div className="hw-top" aria-hidden="true"><span id="hwTitle">Corridor wall · 12 feeds</span><span className="hw-rec"><i id="hwDot"></i><span id="hwClk">10:41:07</span></span></div>
          <div className="hw-wall" id="hwWall" role="img" aria-label="A live video wall of highway corridor cameras, day and night, with AI detection boxes and a stopped-vehicle alert">
            <noscript><img src="/img/real/wall-corridor-sm.webp" srcSet="/img/real/wall-corridor-sm.webp 976w, /img/real/wall-corridor.webp 1952w" sizes="(min-width:1024.02px) 60vw, 100vw" alt="" width="976" height="616" loading="lazy" decoding="async" style={{ 'gridColumn': '1/-1', 'width': '100%', 'height': 'auto' }} /></noscript>
          </div>
          <div className="hw-bot" aria-hidden="true"><div className="hw-lg"><span style={{ '--c': '#5CB8FF' }}>car</span><span style={{ '--c': '#F2B544' }}>truck</span><span style={{ '--c': '#5FDDB0' }}>bus</span></div><span id="hwEdge">Edge AI · on-prem</span></div>
        </figure>
      </div>
    </section>
  );
}
