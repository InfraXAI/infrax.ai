// Products: the product grid and the Ulka strip.
// Markup from site/src/home.html; product headings use the product logos (ProductBrand).
import ProductBrand from '@/components/site/ProductBrand';
export default function HomeProducts() {
  return (
    <section className="scene" id="products" aria-labelledby="hmPrT">
      <div className="wrap">
        <div className="hm-head hm-c">
          <div>
            <h2 className="h-1" id="hmPrT" data-reveal="">Our products.</h2>
          </div>
          <p className="body">Each one does its own job and shares data with the others, so operators work from one screen.</p>
        </div>
    
        <div className="hm-pgrid" id="hmPgrid">
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/control-room-sm.webp" srcSet="/img/control-room-sm.webp 768w, /img/control-room.webp 1536w" sizes="(min-width:1024.02px) 66vw, (min-width:768.02px) 50vw, 100vw" alt="Operators at a control-room desk with a live map and camera wall" loading="lazy" width="768" height="432" /><span className="ov-tag al" style={{ 'right': '3%', 'top': '60%' }}>Incident · km 41</span><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="map" data-size="16" aria-hidden="true"></span>Command centre</p>
              <h3><ProductBrand slug="central-plexus"><span className="pb-x">ATMS / ICCC</span></ProductBrand></h3>
              <p className="d">One live map of cameras, gantries, signs and call boxes, with incidents tracked to closure.</p>
              <div className="hm-chips"><span className="st st-live">Live map</span><span className="st st-live">Incidents</span><span className="st st-live">E-challan</span></div>
              <a className="link-arrow" href="/products#central-plexus" aria-label="Explore Plexus">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/real/wall-corridor-sm.webp" srcSet="/img/real/wall-corridor-sm.webp 976w, /img/real/wall-corridor.webp 1952w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="A video wall of corridor camera feeds" loading="lazy" width="768" height="432" /><span className="ov-box" style={{ 'left': '33.7%', 'top': '31.8%', 'width': '32.6%', 'height': '36.4%' }}><span>CAM-05 · live</span></span><span className="ov-box" data-minor="" style={{ 'left': '6.6%', 'top': '33.6%', 'width': '4.6%', 'height': '8.4%' }}><span>Truck<em>93%</em></span></span><span className="ov-rec">REC · 24×7</span><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="wall" data-size="16" aria-hidden="true"></span>Video management</p>
              <h3><ProductBrand slug="cygnus" /></h3>
              <p className="d">Live walls, 24×7 recording, playback and plate search on standard CPU servers.</p>
              <div className="hm-chips"><span className="st st-live">Video walls</span><span className="st st-live">Plate search</span><span className="st st-live">Camera health</span></div>
              <a className="link-arrow" href="/products#cygnus" aria-label="Explore Cygnus">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/highway-sm.webp" srcSet="/img/highway-sm.webp 768w, /img/highway.webp 1536w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="Highway traffic under an overhead camera gantry" loading="lazy" width="768" height="432" /><span className="ov-box" style={{ 'left': '37.1%', 'top': '60.2%', 'width': '15.4%', 'height': '20.4%' }}><span>Car<em>97% · 62 km/h</em></span></span><span className="ov-box b" style={{ 'left': '42.9%', 'top': '73.4%', 'width': '5.1%', 'height': '3.2%' }}><span>XX 00 AB 1234</span></span><span className="ov-box r" data-minor="" style={{ 'left': '78.1%', 'top': '43.1%', 'width': '19.5%', 'height': '30.1%' }}><span>Truck<em>95%</em></span></span><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="gantry" data-size="16" aria-hidden="true"></span>At the gantry</p>
              <h3><ProductBrand slug="vides" /></h3>
              <p className="d">Plate, speed and class for every vehicle at the gantry, day or night.</p>
              <div className="hm-chips"><span className="st st-live">Plate read</span><span className="st st-live">Vehicle class</span><span className="st st-live">Radar speed</span></div>
              <a className="link-arrow" href="/products#vides" aria-label="Explore Dhrishya">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/ecb-sm.webp" srcSet="/img/ecb-sm.webp 768w, /img/ecb.webp 1536w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="An emergency call box on the highway shoulder" loading="lazy" width="768" height="432" /><span className="ov-box" style={{ 'left': '21.9%', 'top': '16.7%', 'width': '11%', 'height': '77%' }}><span>Call box · ECB-07</span></span><span className="ov-ring" style={{ 'left': '28.1%', 'top': '46.5%' }}></span><span className="ov-ring" style={{ 'left': '28.1%', 'top': '46.5%', 'animationDelay': '.9s' }}></span><span className="ov-tag" style={{ 'right': '4%', 'top': '30%' }}>Call connected · 00:42</span><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="callbox" data-size="16" aria-hidden="true"></span>Emergency call boxes</p>
              <h3><ProductBrand slug="astraalert" /></h3>
              <p className="d">Every call box press reaches the control room, located on the map and recorded.</p>
              <div className="hm-chips"><span className="st st-live">Call located</span><span className="st st-live">Box health</span><span className="st st-live">AI voice Being</span></div>
              <a className="link-arrow" href="/products#astraalert" aria-label="Explore AstraAlert">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/toll-lane-sm.webp" srcSet="/img/toll-lane-sm.webp 768w, /img/toll-lane.webp 1536w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="A toll lane with a barrier lifting for a car" loading="lazy" width="768" height="432" /><span className="ov-box r" style={{ 'left': '51.8%', 'top': '45.1%', 'width': '22.4%', 'height': '27.8%' }}><span>Car<em>98%</em></span></span><span className="ov-box b" style={{ 'left': '57.9%', 'top': '56.2%', 'width': '6.2%', 'height': '3%' }}><span>XX 07 CD 5521</span></span><span className="ov-tag dk" style={{ 'left': '4%', 'top': '8%' }}>Lane ↔ cloud · synced</span><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="toll" data-size="16" aria-hidden="true"></span>Toll plazas</p>
              <h3><ProductBrand slug="tollcloud" /></h3>
              <p className="d">FASTag, ANPR, UPI and RFID lanes that keep running when the link drops.</p>
              <div className="hm-chips"><span className="st st-live">FASTag</span><span className="st st-live">ANPR</span><span className="st st-live">UPI</span><span className="st st-live">RFID</span></div>
              <a className="link-arrow" href="/products#tollcloud" aria-label="Explore Naka">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><img decoding="async" src="/img/aerial-corridor-sm.webp" srcSet="/img/aerial-corridor-sm.webp 768w, /img/aerial-corridor.webp 1536w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="Aerial view of an expressway at sunrise with gantries over the open road" loading="lazy" width="768" height="432" /><span className="hm-ill">Illustrative</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="gantry" data-size="16" aria-hidden="true"></span>Free-flow tolling</p>
              <h3><ProductBrand slug="mlff" /></h3>
              <p className="d">Tolling on a gantry over the open road: FASTag and plate read at speed, no barriers.</p>
              <div className="hm-chips"><span className="st st-live">FASTag</span><span className="st st-live">Plate read</span><span className="st st-live">No stopping</span></div>
              <a className="link-arrow" href="/products#mlff" aria-label="Explore Halley">Explore</a>
            </div>
          </article>
          <article className="hm-pc">
            <div className="hm-pc-vis"><div className="hm-fr" style={{ '--fy': '.78' }}><img decoding="async" src="/img/campus-sm.webp" srcSet="/img/campus-sm.webp 768w, /img/campus.webp 1536w" sizes="(min-width:1024.02px) 66vw, 100vw" alt="A campus parking entrance with a boom barrier" loading="lazy" width="768" height="432" /><span className="ov-box" data-minor="" style={{ 'left': '40.9%', 'top': '67.6%', 'width': '5.7%', 'height': '7%' }}><span>Car<em>94%</em></span></span><span className="ov-box r b" data-flip="" style={{ 'left': '68%', 'top': '74.8%', 'width': '25.3%', 'height': '3.4%' }}><span>Gate 2 · barrier down</span></span></div><span className="hm-ill">Illustrative</span><span className="ov-time" data-clock="" aria-hidden="true">--:--:--</span></div>
            <div className="hm-pc-body">
              <p className="hm-pc-k"><span className="ix" data-ix="gate" data-size="16" aria-hidden="true"></span>Gates and parking</p>
              <h3><ProductBrand slug="access-parking" /></h3>
              <p className="d">Entry and exit with plate reads at every gate.</p>
              <div className="hm-chips"><span className="st st-live">Plate read</span><span className="st st-live">Entry & exit</span></div>
              <a className="link-arrow" href="/products#access-parking" aria-label="Explore Toran">Explore</a>
            </div>
          </article>
        </div>
    
        <a className="hm-ops" href="/products#ops">
          <img decoding="async" src="/img/atms-cabinet-sm.webp" alt="" loading="lazy" width="220" height="124" />
          <div><h3><ProductBrand slug="ops" /> <span className="st st-live">Live</span></h3><p>Field operations, workforce and assets, run by AI Beings. Hosted at ops.infrax.ai.</p></div>
          <span className="link-arrow">Explore</span>
        </a>
    
      </div>
    </section>
  );
}
