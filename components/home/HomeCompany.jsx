// Company facts.
// Markup from site/src/home.html, unchanged apart from JSX syntax.
export default function HomeCompany() {
  return (
    <section className="scene" id="company" aria-labelledby="hmCoT">
      <div className="wrap hm-co">
        <div>
          <h2 className="h-1" id="hmCoT" data-reveal="">Field-tested before it ships.</h2>
          <p className="lead">A product company in Gurugram, built in India. Every feature is used in the field first.</p>
        </div>
        <dl className="hm-facts">
          <div><dt>Who we are</dt><dd>InfraX AI, by NaturNest AI Private Limited. Built in India.<br /><a href="https://www.google.com/maps/search/?api=1&query=WeWork+DLF+Forum+Cyber+City+Gurugram+122002" target="_blank" rel="noopener">WeWork DLF Forum, Cyber City, Gurugram, Haryana 122002</a></dd></div>
          <div><dt>Services</dt><dd>Integration and delivery for operators and system integrators. <a className="link-arrow" href="/services" style={{ 'minHeight': '44px' }}>See services</a></dd></div>
          <div><dt>Contact</dt><dd><a href="mailto:info@infrax.ai">info@infrax.ai</a></dd></div>
        </dl>
      </div>
    </section>
  );
}
