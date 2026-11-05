// Distributed analytics: the lead and the camera-cost diagram (#hwDist, drawn by the page script).
// Markup from site/src/how-it-works.html, unchanged apart from JSX syntax.
export default function HowDist() {
  return (
    <section className="scene hw-dist" aria-labelledby="hw-dist-title"><div className="wrap hw-dist-grid">
      <div>
        <h2 className="h-1" id="hw-dist-title" data-reveal="">A new scenario is cheap. A new camera is the real cost.</h2>
        <p className="lead">Each camera is decoded once and every scenario on it shares the same frames, so a new scenario costs far less than a new camera.</p>
      </div>
      <figure className="hw-dist-fig" style={{ margin: '0' }}>
        <svg id="hwDist" viewBox="0 0 640 430" role="img" aria-label="One Cygnus server on standard CPUs. Each camera feeds its own decode slot once, and one shared detection pass feeds every scenario: plates, vehicles, watchlist, journeys and camera health. Adding a camera lights more CPU cores and grows recording disk and stream bandwidth; ANPR cameras add the most. Adding a scenario barely moves the meters."></svg>
        <div className="ctl"><small id="hwDistNote" aria-live="polite">2 cameras · 2 scenarios · one decode per camera</small><span className="btns"><button type="button" id="hwDistCam">+ Add a camera</button><button type="button" id="hwDistScn">+ Add a scenario</button></span></div>
      </figure>
    </div></section>
  );
}
