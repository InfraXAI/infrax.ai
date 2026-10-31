// Hero: copy, the four-model tablist, the topology stage (filled by lib/pages/deployment.js), foundation row and tab panel.
// Markup from site/src/deployment.html, unchanged apart from JSX syntax.
export default function DeploymentHero() {
  return (
    <>
    <section className="dp-hero" aria-labelledby="dp-h">
      <div className="wrap">
        <div className="dp-head">
          <div>
            <h1 className="h-hero" id="dp-h" data-reveal="">Runs on your<br />own servers.</h1>
          </div>
          <div><p className="lead">Standard CPU servers are enough. Add a GPU for more cameras and faster analytics.</p>
            <p className="dp-roadmap">Four ways to deploy, mixed per site. InfraX AI Ops is already hosted at ops.infrax.ai; hosted Cygnus is on our roadmap.</p></div>
        </div>
    
        <div role="tablist" aria-label="Deployment model" className="dp-tabs" id="dpTabs">
          <span className="dp-pill" id="dpPill" aria-hidden="true"></span>
          <button className="dp-tab" role="tab" id="tab-centralised" aria-controls="dpPanel" aria-selected="true" data-mode="centralised"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="7" y="4" width="10" height="16" rx="1.5" /><path d="M10 8h4M10 12h4M10 16h4" /></svg>Centralised</button>
          <button className="dp-tab" role="tab" id="tab-edge" aria-controls="dpPanel" aria-selected="false" tabIndex="-1" data-mode="edge"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="9" rx="1.5" /><path d="M6 8V5M9 8V5M12 8V5M15 8V5M18 8V5" /></svg>Edge</button>
          <button className="dp-tab" role="tab" id="tab-hybrid" aria-controls="dpPanel" aria-selected="false" tabIndex="-1" data-mode="hybrid"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="7" height="6" rx="1" /><rect x="3" y="14" width="7" height="6" rx="1" /><rect x="15" y="7" width="6" height="10" rx="1" /><path d="M10 7c3 0 3 5 5 5M10 17c3 0 3-5 5-5" /></svg>Hybrid</button>
          <button className="dp-tab" role="tab" id="tab-federated" aria-controls="dpPanel" aria-selected="false" tabIndex="-1" data-mode="federated"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="M12 7.5v4M12 11.5L6.5 16M12 11.5l5.5 4.5" /></svg>Federated</button>
        </div>
        <span className="dp-auto" id="dpAuto">Cycling through the four models · pick one to stop</span>
    
        <div className="dp-stage" id="dpStage">
          <svg className="dp-svg" id="dpSvg" viewBox="0 0 1200 560" role="img" aria-labelledby="dpSvgTitle">
            <title id="dpSvgTitle">Deployment topology for the selected size</title>
            <g id="dpZones"></g><g id="dpLinks"></g><g id="dpPackets"></g><g id="dpNodes"></g>
          </svg>
          <div className="dp-legend" aria-hidden="true"><span><i style={{ 'background': '#5A9FD4' }}></i>Video</span><span><i style={{ 'background': '#2673B5' }}></i>Results: plates, events, clips, alerts</span><span><i className="ai"></i>Where the AI runs</span></div>
        </div>
    
        <div className="dp-found" aria-label="Common foundation in every model">
          <span className="lbl">In every model</span>
          <span className="it"><span className="ix" data-ix="camera" data-size="20" aria-hidden="true"></span>Central CCTV registry</span>
          <span className="it"><span className="ix" data-ix="map" data-size="20" aria-hidden="true"></span>GIS map of every camera</span>
          <span className="it"><span className="ix" data-ix="lock" data-size="20" aria-hidden="true"></span>Role-based access and audit</span>
          <span className="it"><span className="ix" data-ix="wall" data-size="20" aria-hidden="true"></span>One console in the browser</span>
        </div>
    
        <div className="dp-panel" id="dpPanel" role="tabpanel" aria-labelledby="tab-centralised" aria-live="polite"></div>
      </div>
    </section>
    </>
  );
}
