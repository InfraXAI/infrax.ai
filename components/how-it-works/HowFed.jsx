// Federation: six sites around one control room (#hwFedStage); the page script fills the site list and the card.
// Markup from site/src/how-it-works.html, unchanged apart from JSX syntax.
export default function HowFed() {
  return (
    <section className="scene hw-fed" aria-labelledby="hw-fed-title"><div className="wrap">
      <div className="hw-fed-head">
        <div>      <h2 className="h-1" id="hw-fed-title" data-reveal="">Many sites, one control room.</h2>
          </div>
        <p className="body">Each site keeps working on its own; one control room sees every alert. Pick a site.</p>
      </div>
      <div className="hw-fed-grid">
        <div className="hw-stage hw-fed-stage" id="hwFedStage" role="img" aria-label="Six site miniatures in a ring (two highway stretches, a call box network, city junctions, a campus and an industrial site) linked by flowing data to one control room in the centre.">
          <canvas id="hwFedGL"></canvas>
          <div className="hw-nogl"><img src="/img/control-room-sm.webp" srcSet="/img/control-room-sm.webp 768w, /img/control-room.webp 1536w" sizes="(min-width:1024.02px) 60vw, 100vw" alt="Control room with a video wall and a map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} width="768" height="432" loading="lazy" decoding="async" /></div>
        </div>
        <div className="hw-fed-side">
          <ul className="hw-fed-list" id="hwFedList" aria-label="Choose a site"></ul>
          <article className="hw-card" id="hwFedCard" aria-live="polite"></article>
        </div>
      </div>
    </div></section>
  );
}
