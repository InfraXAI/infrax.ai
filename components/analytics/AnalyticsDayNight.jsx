// Day / night plate reads (CSS-animated boxes over photos) and the next-band link to Deployment.
export default function AnalyticsDayNight() {
  return (
    <>
    <section className="scene tight an-dn" aria-labelledby="anDnH"><div className="wrap">
      <h2 className="h-2" id="anDnH" data-reveal="">Reads plates day and night, even on infrared.</h2>
      <div className="an-dn-grid">
        <figure className="an-dn-card">
          <div className="an-dn-shot"><img decoding="async" src="/img/site-day-sm.webp" srcSet="/img/site-day-sm.webp 768w, /img/site-day.webp 1536w" sizes="(min-width:1024.02px) 540px, (min-width:768.02px) 50vw, 100vw" alt="A median pole camera on a six-lane highway by day, trucks and cars in both carriageways" loading="lazy" width="768" height="432" />
            <span className="an-dn-scan" aria-hidden="true"></span>
            <span className="an-dn-box big" style={{ 'left': '58.97%', 'top': '15.41%', 'width': '5.47%', 'height': '13.62%', 'animationDelay': '0.00s' }} aria-hidden="true"><i>Truck · 0.94</i></span>
            <span className="an-dn-box s" style={{ 'left': '39.10%', 'top': '17.71%', 'width': '4.35%', 'height': '8.36%', 'animationDelay': '0.12s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '64.72%', 'top': '18.23%', 'width': '2.96%', 'height': '7.87%', 'animationDelay': '0.24s' }} aria-hidden="true"></span>
            <span className="an-dn-box" style={{ 'left': '56.35%', 'top': '27.19%', 'width': '3.39%', 'height': '5.54%', 'animationDelay': '0.36s' }} aria-hidden="true"><i>Car · 0.89</i></span>
            <span className="an-dn-box s" style={{ 'left': '45.96%', 'top': '7.51%', 'width': '1.93%', 'height': '3.94%', 'animationDelay': '0.48s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '54.98%', 'top': '16.19%', 'width': '2.05%', 'height': '3.33%', 'animationDelay': '0.60s' }} aria-hidden="true"></span>
            <span className="an-dn-box s" style={{ 'left': '49.46%', 'top': '7.76%', 'width': '0.94%', 'height': '1.35%', 'animationDelay': '0.72s' }} aria-hidden="true"></span>
            <span className="an-dn-plate" style={{ 'left': '56.35%', 'top': '33.40%' }} aria-hidden="true">XX 00 AB 1234</span>
            <span className="an-dn-tag" aria-hidden="true"><b></b>Day · live</span></div>
          <figcaption><b>Day</b><span>Plate, class and speed from the gantry and roadside cameras.</span></figcaption>
        </figure>
        <figure className="an-dn-card">
          <div className="an-dn-shot an-dn-night"><img decoding="async" src="/img/site-night-sm.webp" srcSet="/img/site-night-sm.webp 768w, /img/site-night.webp 1536w" sizes="(min-width:1024.02px) 540px, (min-width:768.02px) 50vw, 100vw" alt="The same median camera at night in infrared, a truck and a car in the left carriageway" loading="lazy" width="768" height="432" />
            <span className="an-dn-scan" aria-hidden="true"></span>
            <span className="an-dn-box big" style={{ 'left': '29.94%', 'top': '36.03%', 'width': '6.84%', 'height': '11.77%', 'animationDelay': '0.00s' }} aria-hidden="true"><i>Truck</i></span>
            <span className="an-dn-box" style={{ 'left': '40.45%', 'top': '29.79%', 'width': '4.02%', 'height': '6.18%', 'animationDelay': '0.12s' }} aria-hidden="true"><i>Car · 0.86</i></span>
            <span className="an-dn-plate" style={{ 'left': '40.45%', 'top': '36.60%' }} aria-hidden="true">XX 07 KD 4410</span>
            <span className="an-dn-count" aria-hidden="true">2 vehicles</span>
            <span className="an-dn-ir"><img decoding="async" src="/img/site-night-ir-sm.webp" alt="Infrared close-up of the truck from the same camera" loading="lazy" width="768" height="432" /><span className="an-dn-irbox car" style={{ 'left': '32.9%', 'top': '20.7%', 'width': '34.2%', 'height': '58.9%' }}></span><em>IR · zoom</em></span>
            <span className="an-dn-tag" aria-hidden="true"><b></b>Night · IR · live</span></div>
          <figcaption><b>Night</b><span>Infrared cameras keep the plate readable when the road goes dark.</span></figcaption>
        </figure>
      </div>
      <p className="an-dn-note mono">Real frames from one median camera, day and night · labels illustrative · dummy plates</p>
    </div></section>
    <div className="wrap"><a className="next-band" href="/deployment"><div><p className="eyebrow">Next</p><p className="h-1">Runs on your own servers</p></div><span className="arrow" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span></a></div>
    </>
  );
}
