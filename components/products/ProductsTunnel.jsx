// The pinned three.js highway tunnel: canvas, domain layer, HUD, panel, side cards, rail, and the "Show more detail" dialog.
// Every empty container (#cyDsw, #cyRail, #cyPBody ...) is filled by lib/pages/products.js.
// Markup from site/src/products.html, unchanged apart from JSX syntax.
export default function ProductsTunnel() {
  return (
    <>
      <section className="cy-tunnel" id="cy-tunnel" aria-label="InfraX AI products, one domain at a time">
        <div className="cy-stage" id="cyStage" data-plexus-off="">
          <canvas className="cy-gl" id="cyGL" aria-hidden="true"></canvas>
          <div className="cy-dom" id="cyDom" aria-hidden="true" hidden></div>
          <div className="cy-labels" id="cyLabels" aria-hidden="true"></div>
          <div className="cy-dsw" id="cyDsw" role="group" aria-label="Switch domain"></div>
          <div className="cy-soon" id="cySoon" hidden><b id="cySoonT">Coming soon</b><p>This journey is being finished. The products work here today; ask us for a walkthrough.</p></div>
          <div className="cy-swap" id="cySwap" aria-hidden="true"></div>

          <div className="cy-hud-l">
            <p className="eyebrow" id="cyHudEye">Highways</p>
            <div className="cy-bignum" id="cyNum" aria-hidden="true"><span>01</span><small>/ 07</small></div>
            <p className="cy-hud-name" id="cyHudName" aria-hidden="true">InfraX AI VIDES</p>
          </div>
          <div className="cy-hud-r" aria-hidden="true"><b>CAM G04-02 · LIVE</b><br /><span id="cyClock">--:--:-- IST</span> · <span className="fps">25 FPS</span></div>

          <aside className="cy-panel" data-lenis-prevent="" id="cyPanel" aria-live="polite">
            <div className="cy-p-head"><span id="cyPStep">Station 01 / 07</span><span id="cyPTag">Roadside</span></div>
            <figure className="cy-rw" id="cyRW" aria-label="Real-world view of this product, illustrative">
              <div className="cy-rw-ov" id="cyRWov" aria-hidden="true"></div>
              <span className="cy-rw-cap">Real-world view · illustrative</span><span className="cy-rw-live" aria-hidden="true">LIVE</span>
            </figure>
            <div id="cyPBody"></div>
            <span className="cy-sample">Illustrative data</span>
          </aside>

          <div className="cy-card alert" id="cyEvi" aria-hidden="true">
            <div className="cy-card-h">Central Plexus · #4471 <span id="cyEviT">14:32:07</span></div>
            <div className="cy-frames"><i></i><i></i><i></i></div>
            <dl><dt>Where</dt><dd>Lane 1 · shoulder · km 41.2</dd><dt>Camera</dt><dd>CAM G04-02</dd><dt>Evidence</dt><dd>12 s clip · 3 frames</dd></dl>
            <ol className="cy-flow" id="cyFlow">
              <li><i></i>Event in, with its evidence<small>Incident #4471 opened</small></li>
              <li><i></i>Patrol 3 assigned<small>From the incident desk</small></li>
              <li><i></i>LED sign updated<small>SIGN-14 · upstream</small></li>
              <li><i></i>Closed · history saved<small>On record</small></li>
            </ol>
          </div>

          <div className="cy-card" id="cyCall" aria-hidden="true">
            <div className="cy-card-h">AstraAlert · ECB-07 <span id="cyCallT">00:00</span></div>
            <svg className="cy-mini" viewBox="0 0 280 44" aria-hidden="true">
              <path d="M6 30 C70 18 120 34 170 24 S250 14 274 20" fill="none" stroke="#5A9FD4" strokeWidth="3" strokeLinecap="round" />
              <g fill="#fff" stroke="#2673B5" strokeWidth="2"><circle cx="26" cy="27" r="4" /><circle cx="78" cy="24" r="4" /><circle cx="178" cy="23" r="4" /><circle cx="226" cy="18" r="4" /></g>
              <circle cx="128" cy="29" r="5" fill="#D6453D"><animate attributeName="r" values="5;8;5" dur="1.2s" repeatCount="indefinite" /></circle>
              <text x="138" y="12" fontFamily="Geist Mono, monospace" fontSize="12" fill="#0E3B66">ECB-07 · km 41.2</text>
            </svg>
            <ol className="cy-call" id="cyCallList"></ol>
            <div className="cy-wave" id="cyVoice"></div>
          </div>

          <div className="cy-card cy-tollcard" id="cyToll" aria-hidden="true">
            <div className="cy-card-h">TollCloud · plaza P2 <span id="cyTollT">Lane 3</span></div>
            <p className="cy-tstat" id="cyTStat"><i></i><span>Edge ↔ cloud · synced</span></p>
            <ol className="cy-call cy-sess" id="cyTollList"></ol>
          </div>

          <div className="cy-card cy-opscard" id="cyOps" aria-hidden="true">
            <div className="cy-card-h">InfraX AI Ops · WO-2219 <span id="cyOpsT">--:--</span></div>
            <div className="cy-phone">
              <div className="cy-ph-bar"><span>Field team 2</span><b>On shift</b></div>
              <p className="cy-ph-t">CAM R-14 · no video <span className="cy-ph-pill" id="cyOpsPill">Assigned</span></p>
              <p className="cy-ph-s">km 41.6 · left shoulder · raised from Central Plexus</p>
              <ol className="cy-flow" id="cyOpsFlow">
                <li><i></i>Assigned<small>--:--</small></li>
                <li><i></i>On site<small>--:--</small></li>
                <li><i></i>Closed<small>--:--</small></li>
              </ol>
              <div className="cy-ph-photo" id="cyOpsPhoto"><i></i><span>Photo · lens cleaned, video back</span><b>✓</b></div>
            </div>
          </div>

          <div className="cy-timeline" id="cyTimeline" aria-hidden="true">
            <span>REC</span><span className="bar" id="cyTBar"><i style={{ 'left': '22%' }}></i><i className="ev" style={{ 'left': '47%' }}></i><i style={{ 'left': '71%' }}></i><b id="cyHead" style={{ 'left': '30%' }}></b></span><span id="cyTTime">14:31:52</span><span>Export clip ↗</span><span className="live">● LIVE</span>
          </div>

          <button type="button" className="cy-more" id="cyMore" aria-haspopup="dialog" aria-controls="cyPd"><span>Show more detail</span><i aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg></i></button>
          <button type="button" className="cy-fs" id="cyFs" aria-pressed="false" hidden><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path className="fs-on" d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /><path className="fs-off" d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" /></svg><span>Full screen</span></button>

          <nav className="cy-rail" aria-label="Product stations">
            <ol id="cyRail"></ol>
          </nav>
        </div>
      </section>

      <dialog className="cy-pd" id="cyPd" aria-labelledby="cyPdName" data-lenis-prevent="">
        <div className="cy-pd-in">
          <canvas className="cy-pd-net" aria-hidden="true"></canvas>
          <img className="cy-pd-logo" src="/assets/logo.svg" alt="" width="96" height="28" />
          <button type="button" className="cy-pd-x" id="cyPdX" aria-label="Close"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg></button>
          <p className="cy-pd-tag" id="cyPdTag"></p>
          <h2 className="cy-pd-name" id="cyPdName"></h2>
          <p className="cy-pd-line" id="cyPdLine"></p>
          <p className="cy-pd-desc" id="cyPdDesc"></p>
          <h3 className="cy-pd-h">Key capabilities</h3>
          <ul className="cy-pd-caps" id="cyPdCaps"></ul>
          <div className="cy-pd-cta"><a className="btn btn-primary" href="#demo">Book a demo</a></div>
        </div>
      </dialog>
    </>
  );
}
