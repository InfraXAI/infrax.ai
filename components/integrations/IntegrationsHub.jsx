// Interactive hub: the SVG (lanes, dots and nodes are drawn by lib/pages/integrations.js), the chips and the detail card.
// Markup from site/src/integrations.html, unchanged apart from JSX syntax and the status key (Live only: every status on the site is Live).
export default function IntegrationsHub() {
  return (
    <section className="in-hub" aria-labelledby="in-hub-title"><div className="wrap">
      <h2 className="h-sub" id="in-hub-title" data-reveal="">Data flows both ways.</h2>
      <p className="lead in-hint" style={{ margin: '10px 0 28px' }}>Pick a connection to see what flows each way.</p>
      <div className="in-grid">
        <div className="in-svgbox">
          <svg id="inHub" viewBox="0 0 900 700" role="group" aria-label="Integration hub: your control room in the centre with ten connection types around it, each with its status">
            <g id="inLanes"></g><g id="inDots"></g>
            <g className="in-core" id="inCore">
              <circle cx="450" cy="350" r="78" fill="#2673B5" /><circle cx="450" cy="350" r="92" fill="none" stroke="#2673B5" strokeOpacity=".25" strokeWidth="1.5" id="inCoreRing" />
              <text x="450" y="334" textAnchor="middle">Your</text><text x="450" y="356" textAnchor="middle">control room</text><text className="sm" x="450" y="378" textAnchor="middle">ON YOUR SERVERS</text>
            </g>
            <g id="inNodes"></g>
          </svg>
          <div className="in-stats" aria-label="Status key"><span><span className="st st-live">Live</span><span>In production today</span></span></div>
          <div className="in-legend"><span><i className="n"></i>Into the control room</span><span><i className="o"></i>Out to the road, your systems and the team</span><span className="in-note">Typical integrations, confirmed per project.</span></div>
        </div>
        <div>
          <ul className="in-chips" id="inChips" aria-label="Connection types"></ul>
          <article className="in-card" id="inCard" aria-live="polite"></article>
        </div>
      </div>
    </div></section>
  );
}
