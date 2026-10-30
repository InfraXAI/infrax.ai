// The engagement path: rail + four phases, filled once by lib/pages/services.js when it scrolls into view.
// Markup from site/src/services.html, unchanged apart from JSX syntax.
export default function ServicesPath() {
  return (
    <section className="scene tight sv-path" id="sv-path" aria-labelledby="sv-path-title"><div className="wrap">
      <div className="sv-path-head">
        <div><h2 className="h-1" id="sv-path-title" data-reveal="">A small first scope. Clear acceptance.</h2></div>
        <p className="body">Nothing moves to the next step until you have seen it work.</p>
      </div>
      <div className="sv-rail" id="svRail">
        <div className="sv-rail-track" aria-hidden="true"><span className="sv-rail-fill" id="svRailFill"></span>
          <span className="sv-rail-dot" style={{ 'left': '12.5%' }}><span className="ix" data-ix="people" data-size="20" aria-hidden="true"></span></span><span className="sv-rail-dot" style={{ 'left': '37.5%' }}><span className="ix" data-ix="map" data-size="20" aria-hidden="true"></span></span><span className="sv-rail-dot" style={{ 'left': '62.5%' }}><span className="ix" data-ix="server" data-size="20" aria-hidden="true"></span></span><span className="sv-rail-dot" style={{ 'left': '87.5%' }}><span className="ix" data-ix="check" data-size="20" aria-hidden="true"></span></span></div>
        <ol className="sv-phases" id="svPhases">
          <li><h3>Discover</h3><p>Review interfaces, sample data, constraints and the operator journey.</p></li>
          <li><h3>Define</h3><p>Agree scope, responsibilities, test cases and acceptance criteria.</p></li>
          <li><h3>Build and validate</h3><p>Demonstrate the agreed workflow against representative inputs.</p></li>
          <li><h3>Handover</h3><p>Deliver the agreed software, documentation and deployment support.</p></li>
        </ol>
      </div>
    </div></section>
  );
}
