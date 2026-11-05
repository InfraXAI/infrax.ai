// Digital twin: the GIS map -> street twin -> live camera 3D scene (canvas filled by the page script).
// Markup from site/src/home.html, unchanged apart from JSX syntax.
export default function HomeTwin() {
  return (
    <section className="scene" id="twin" aria-labelledby="hmTwT">
      <div className="tw-g" id="hmTwStage" data-plexus-off="">
        <div className="tx">
          <h2 id="hmTwT">Your whole network, live —<br /><em>from city map to street corner.</em></h2>
          <p>A living 3D copy of your roads, fed by every camera.</p>
          <div className="lyr" id="hmTwSteps" role="group" aria-label="Twin views"><button type="button" className="on" aria-current="step">GIS map<b></b></button><button type="button">Street twin<b></b></button><button type="button">Live camera<b></b></button></div>
          <button type="button" className="tw-rp" id="hmTwReplay"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Replay</button>
        </div>
        <div className="tw-vp" id="hmTwVp">
          <canvas className="gl" id="hmTwin" role="img" aria-label="Digital twin of the road network: a GIS map of the expressway. Selecting camera CAM-07 tilts the map into a living 3D copy of the street at km 42.6 with traffic, trees and a gantry, then the camera's live feed opens. All data is illustrative."></canvas>
          <div className="fadeL" aria-hidden="true"></div>
          <div className="tw-pins" id="hmTwPins" role="group" aria-label="Devices on the map"></div>
          <div className="pcard" id="hmTwPcard" role="dialog" aria-label="Device"><div className="r1"><i></i><span></span></div><div className="tt"></div><button type="button" className="go">Open street twin <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
          <div className="chrome" aria-hidden="true"><span>+</span><span>&minus;</span></div>
          <div className="tw-badge" aria-hidden="true"><i></i>Digital Twin &middot; Live</div>
          <div className="scl" aria-hidden="true"><i></i>100 m</div>
          <div className="gcard"><div className="r1"><i></i>Online &middot; PTZ</div><div className="tt">CAM-07 &middot; km 42.6</div><button type="button" className="go">Open street twin <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
          <div className="live" id="hmTwLive" aria-hidden="true"><div className="hd"><b>LIVE</b>CAM-07 &middot; km 42.6<em id="hmTwClk">10:42:18</em></div><div className="fr"><img src="/img/real/tiles/w02.webp" alt="" width="320" height="200" loading="lazy" decoding="async" /><div className="bx" style={{ 'left': '68.4%', 'top': '12.6%', 'width': '7.6%', 'height': '16.4%' }}><span>truck .91</span></div></div></div>
          <div className="rip" aria-hidden="true"></div>
          <div className="cur" aria-hidden="true"><svg viewBox="0 0 22 22"><path d="M4 2.5l13.5 9.2-6.1 1.2 3.6 6.4-2.6 1.4-3.6-6.4L4.4 18.2z" fill="#0A1A2B" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg></div>
        </div>
      </div>
    </section>
  );
}
