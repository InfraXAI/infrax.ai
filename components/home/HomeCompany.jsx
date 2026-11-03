// Company: heading and who we are, what we do as four cards, then office and contact in one strip.
const WHAT = [
  ['gantry', 'Highway and city traffic management', 'ATMS / ICCC control rooms, incident detection, enforcement.'],
  ['camera', 'Video intelligence', 'Cygnus, our AI-native video management system, with our own plate recognition for Indian roads.'],
  ['api', 'Integration', 'We connect the cameras, signals, toll and parking systems you already have, so you don’t rip and replace.'],
  ['people', 'Operations and support', 'Deployment, training and long-term maintenance by our own team.'],
];

export default function HomeCompany() {
  return (
    <section className="scene" id="company" aria-labelledby="hmCoT">
      <div className="wrap">
        <div className="hm-co-top">
          <div>
            <h2 className="h-1" id="hmCoT" data-reveal="">Field-tested before it ships.</h2>
            <p className="lead">A product company in Gurugram, built in India. Every feature is used in the field first.</p>
          </div>
          <div className="hm-co-who">
            <p className="hm-co-k">Who we are</p>
            <p className="hm-co-intro">InfraX AI builds the operating system for infrastructure. Cameras, sensors and control-room software come together on one platform, and AI Beings run the routine work across it: they watch, flag and propose, and a person approves before anything moves. We are a product company from India, built by NaturNest AI Private Limited, and our software runs live on a national highway today.</p>
          </div>
        </div>

        <h3 className="hm-co-k hm-co-k2" id="hmCoWhat">What we do</h3>
        <ul className="hm-co-cards" aria-labelledby="hmCoWhat">
          {WHAT.map(([ix, t, d]) => (
            <li key={t}><span className="hm-co-ic" aria-hidden="true"><span className="ix" data-ix={ix} data-size="20"></span></span><b>{t}</b><p>{d}</p></li>
          ))}
        </ul>

        <div className="hm-co-foot">
          <div><span className="hm-co-k">Office</span><a href="https://www.google.com/maps/search/?api=1&query=WeWork+DLF+Forum+Cyber+City+Gurugram+122002" target="_blank" rel="noopener">WeWork DLF Forum, Cyber City, Gurugram, Haryana 122002</a></div>
          <div><span className="hm-co-k">Contact</span><a className="hm-co-mail" href="mailto:info@infrax.ai">info@infrax.ai</a><span className="hm-co-ask">Tell us about your road, city or site, and we&rsquo;ll get back to you.</span></div>
          <a className="link-arrow hm-co-more" href="/services" style={{ 'minHeight': '44px' }}>See services</a>
        </div>
      </div>
    </section>
  );
}
