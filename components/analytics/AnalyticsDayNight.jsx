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
            <span className="an-dn-box big" style={{ 'left': '7.66%', 'top': '64.68%', 'width': '13.82%', 'height': '16.79%', 'animationDelay': '0.00s' }} aria-hidden="true"><i>Car · 0.97</i></span>
            <span className="an-dn-box" style={{ 'left': '30.67%', 'top': '49.56%', 'width': '7.48%', 'height': '9.74%', 'animationDelay': '0.12s' }} aria-hidden="true"><i>Car · 0.95</i></span>
            <span className="an-dn-box" style={{ 'left': '22.50%', 'top': '25.87%', 'width': '9.19%', 'height': '11.75%', 'animationDelay': '0.24s' }} aria-hidden="true"><i>Truck · 0.93</i></span>
            <span className="an-dn-box rt" style={{ 'left': '83.41%', 'top': '47.08%', 'width': '13.85%', 'height': '16.17%', 'animationDelay': '0.36s' }} aria-hidden="true"><i>Van · 0.96 · 64 km/h</i></span>
            <span className="an-dn-box rt" style={{ 'left': '67.09%', 'top': '75.21%', 'width': '17.29%', 'height': '21.00%', 'animationDelay': '0.48s' }} aria-hidden="true"><i>SUV · 0.94</i></span>
            <span className="an-dn-box" style={{ 'left': '58.39%', 'top': '44.83%', 'width': '6.60%', 'height': '7.82%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '30.94%', 'top': '31.98%', 'width': '3.54%', 'height': '4.71%', 'animationDelay': '0.72s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '42.87%', 'top': '28.92%', 'width': '2.32%', 'height': '4.11%', 'animationDelay': '0.00s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '35.63%', 'top': '27.75%', 'width': '2.54%', 'height': '3.99%', 'animationDelay': '0.12s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '38.31%', 'top': '28.92%', 'width': '2.51%', 'height': '3.76%', 'animationDelay': '0.24s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '70.15%', 'top': '35.39%', 'width': '4.87%', 'height': '4.95%', 'animationDelay': '0.36s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '64.62%', 'top': '28.69%', 'width': '3.71%', 'height': '4.58%', 'animationDelay': '0.48s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '53.19%', 'top': '28.45%', 'width': '2.83%', 'height': '3.76%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-plate" style={{ 'left': '7.39%', 'top': '83.39%' }} aria-hidden="true">XX 00 AB 1234</span>
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
