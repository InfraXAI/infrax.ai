// Day / night plate reads (CSS-animated boxes over photos) and the next-band link to Deployment.
export default function AnalyticsDayNight() {
  return (
    <>
    <section className="scene tight an-dn" aria-labelledby="anDnH"><div className="wrap">
      <h2 className="h-2" id="anDnH" data-reveal="">Reads plates day and night, even on infrared.</h2>
      <div className="an-dn-grid">
        <figure className="an-dn-card">
          <div className="an-dn-shot"><img decoding="async" src="/img/day-highway-sm.webp" srcSet="/img/day-highway-sm.webp 768w, /img/day-highway.webp 1536w" sizes="(min-width:1024.02px) 540px, (min-width:768.02px) 50vw, 100vw" alt="Daytime highway camera view with cars, a van and a truck (illustrative)" loading="lazy" width="768" height="432" />
            <span className="an-dn-scan" aria-hidden="true"></span>
            <span className="an-dn-box big" style={{ 'left': '16.90%', 'top': '65.20%', 'width': '10.20%', 'height': '14.00%', 'animationDelay': '0.00s' }} aria-hidden="true"><i>Car · 0.97</i></span>
            <span className="an-dn-box" style={{ 'left': '34.60%', 'top': '52.50%', 'width': '5.50%', 'height': '8.20%', 'animationDelay': '0.12s' }} aria-hidden="true"><i>Car · 0.95</i></span>
            <span className="an-dn-box" style={{ 'left': '24.80%', 'top': '32.40%', 'width': '6.80%', 'height': '10.00%', 'animationDelay': '0.24s' }} aria-hidden="true"><i>Truck · 0.93</i></span>
            <span className="an-dn-box rt" style={{ 'left': '81.70%', 'top': '50.40%', 'width': '10.60%', 'height': '13.60%', 'animationDelay': '0.36s' }} aria-hidden="true"><i>Van · 0.96 · 64 km/h</i></span>
            <span className="an-dn-box rt" style={{ 'left': '70.80%', 'top': '74.00%', 'width': '13.00%', 'height': '17.40%', 'animationDelay': '0.48s' }} aria-hidden="true"><i>SUV · 0.94</i></span>
            <span className="an-dn-box" style={{ 'left': '58.40%', 'top': '48.50%', 'width': '5.00%', 'height': '6.60%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '32.20%', 'top': '37.60%', 'width': '2.60%', 'height': '4.00%', 'animationDelay': '0.72s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '42.40%', 'top': '35.00%', 'width': '1.60%', 'height': '3.50%', 'animationDelay': '0.00s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '35.80%', 'top': '34.00%', 'width': '1.80%', 'height': '3.40%', 'animationDelay': '0.12s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '38.30%', 'top': '35.00%', 'width': '1.80%', 'height': '3.20%', 'animationDelay': '0.24s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '67.50%', 'top': '40.50%', 'width': '3.80%', 'height': '4.20%', 'animationDelay': '0.36s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '61.80%', 'top': '34.80%', 'width': '2.80%', 'height': '3.90%', 'animationDelay': '0.48s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '51.50%', 'top': '34.60%', 'width': '2.10%', 'height': '3.20%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-plate" style={{ 'left': '16.90%', 'top': '80.80%' }} aria-hidden="true">XX 00 AB 1234</span>
            <span className="an-dn-tag" aria-hidden="true"><b></b>Day · live</span></div>
          <figcaption><b>Day</b><span>Plate, class and speed from the gantry and roadside cameras.</span></figcaption>
        </figure>
        <figure className="an-dn-card">
          <div className="an-dn-shot an-dn-night"><img decoding="async" src="/img/night-highway-sm.webp" srcSet="/img/night-highway-sm.webp 768w, /img/night-highway.webp 1536w" sizes="(min-width:1024.02px) 540px, (min-width:768.02px) 50vw, 100vw" alt="Night highway camera view with headlights and streetlights (illustrative)" loading="lazy" width="768" height="432" />
            <span className="an-dn-scan" aria-hidden="true"></span>
            <span className="an-dn-box big" style={{ 'left': '21.90%', 'top': '66.00%', 'width': '11.70%', 'height': '16.90%', 'animationDelay': '0.00s' }} aria-hidden="true"><i>Car · 0.97</i></span>
            <span className="an-dn-box" style={{ 'left': '35.30%', 'top': '42.80%', 'width': '4.40%', 'height': '6.50%', 'animationDelay': '0.12s' }} aria-hidden="true"></span>
            <span className="an-dn-box" style={{ 'left': '30.20%', 'top': '29.60%', 'width': '4.40%', 'height': '10.60%', 'animationDelay': '0.24s' }} aria-hidden="true"><i>Truck · 0.93</i></span>
            <span className="an-dn-box s" style={{ 'left': '36.20%', 'top': '35.40%', 'width': '2.60%', 'height': '3.90%', 'animationDelay': '0.36s' }} aria-hidden="true"></span>
            <span className="an-dn-box" style={{ 'left': '54.20%', 'top': '49.10%', 'width': '5.10%', 'height': '9.00%', 'animationDelay': '0.48s' }} aria-hidden="true"><i>Car · 0.95</i></span>
            <span className="an-dn-box below" style={{ 'left': '58.60%', 'top': '54.60%', 'width': '7.20%', 'height': '13.20%', 'animationDelay': '0.60s' }} aria-hidden="true"><i>Car · 0.96</i></span>
            <span className="an-dn-box" style={{ 'left': '66.70%', 'top': '30.10%', 'width': '5.30%', 'height': '12.00%', 'animationDelay': '0.72s' }} aria-hidden="true"><i>Truck · 0.94</i></span>
            <span className="an-dn-box s" style={{ 'left': '57.40%', 'top': '34.30%', 'width': '2.70%', 'height': '5.10%', 'animationDelay': '0.00s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '52.60%', 'top': '31.90%', 'width': '2.60%', 'height': '4.20%', 'animationDelay': '0.12s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '61.50%', 'top': '35.20%', 'width': '2.60%', 'height': '4.20%', 'animationDelay': '0.24s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '71.60%', 'top': '33.60%', 'width': '2.30%', 'height': '4.20%', 'animationDelay': '0.36s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '36.80%', 'top': '27.30%', 'width': '2.20%', 'height': '2.80%', 'animationDelay': '0.48s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '44.90%', 'top': '28.90%', 'width': '2.00%', 'height': '3.00%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '54.20%', 'top': '27.80%', 'width': '1.80%', 'height': '2.80%', 'animationDelay': '0.72s' }} aria-hidden="true"></span>
            <span className="an-dn-plate" style={{ 'left': '21.90%', 'top': '84.50%' }} aria-hidden="true">XX 07 KD 4410</span>
            <span className="an-dn-count" aria-hidden="true">14 vehicles</span>
            <span className="an-dn-ir"><img decoding="async" src="/img/night-ir-sm.webp" alt="Infrared night view of the same lane (illustrative)" loading="lazy" width="768" height="432" /><span className="an-dn-irbox car" style={{ 'left': '33.9%', 'top': '23.1%', 'width': '22.1%', 'height': '39.8%' }}></span><span className="an-dn-irbox car" style={{ 'left': '37.5%', 'top': '0%', 'width': '10.9%', 'height': '3.4%' }}></span><span className="an-dn-irbox" style={{ 'left': '41.9%', 'top': '51.4%', 'width': '6.8%', 'height': '3.7%' }}></span><em>IR · plate</em></span>
            <span className="an-dn-tag" aria-hidden="true"><b></b>Night · IR · live</span></div>
          <figcaption><b>Night</b><span>Infrared cameras keep the plate readable when the road goes dark.</span></figcaption>
        </figure>
      </div>
      <p className="an-dn-note mono">Day and night views illustrative · dummy plates</p>
    </div></section>
    <div className="wrap"><a className="next-band" href="/deployment"><div><p className="eyebrow">Next</p><p className="h-1">Runs on your own servers</p></div><span className="arrow" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span></a></div>
    </>
  );
}
