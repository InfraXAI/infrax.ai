// Edge: the roadside-cabinet photo with numbered hotspots (aria-pressed set by the script) and the notes they light.
// Markup from site/src/deployment.html, unchanged apart from JSX syntax.
export default function DeploymentEdge() {
  return (
    <>
    <section className="scene" aria-labelledby="dp-edge-h">
      <div className="wrap dp-edge">
        <figure className="dp-photo" id="dpPhoto">
          <img decoding="async" src="/img/edge-box-sm.webp" srcSet="/img/edge-box-sm.webp 768w, /img/edge-box.webp 1536w" sizes="(min-width:1024.02px) 55vw, 100vw" alt="An engineer connecting the AI box inside a roadside cabinet, next to a network switch and fibre patch panel" loading="lazy" width="1536" height="864" />
          <button className="dp-hot" style={{ 'left': '39%', 'top': '19%' }} data-n="0" aria-label="Note 1: the box on the gantry">1</button>
          <button className="dp-hot" style={{ 'left': '32%', 'top': '37%' }} data-n="1" aria-label="Note 2: keeps reading offline">2</button>
          <button className="dp-hot" style={{ 'left': '48.5%', 'top': '40%' }} data-n="2" aria-label="Note 3: what goes to the control room">3</button>
          <button className="dp-hot" style={{ 'left': '37%', 'top': '79%' }} data-n="3" aria-label="Note 4: the network you already have">4</button>
        </figure>
        <div>
          <h2 className="h-2" id="dp-edge-h" data-reveal="">Keeps working<br />when the link drops.</h2>
          <ul className="dp-notes" id="dpNotes">
            <li data-n="0"><b>1</b><p><strong>The AI runs in the box on the gantry,</strong> next to the cameras and radar.</p></li>
            <li data-n="1"><b>2</b><p><strong>If the link drops, it keeps reading.</strong> Reads sync once the link is back.</p></li>
            <li data-n="2"><b>3</b><p><strong>Results go to Plexus (ATMS / ICCC)</strong> with images attached, ready for e-challan.</p></li>
            <li data-n="3"><b>4</b><p><strong>It plugs into the gantry network you already have.</strong></p></li>
          </ul>
          <div className="dp-up">
            <figure><figcaption><b>Raw video</b> · stays at the gantry</figcaption></figure>
            <figure><figcaption><b>Plates, classes &amp; cases</b> · go to Plexus (ATMS / ICCC)</figcaption></figure>
          </div>
          <div className="dp-chips"><a className="dp-chip" href="/products#d-highways">Highways &amp; expressways</a><a className="dp-chip" href="/products#vides">Speed enforcement gantries</a><a className="dp-chip" href="/products#central-plexus">Control rooms</a></div>
        </div>
      </div>
    </section>
    </>
  );
}
