// Hero: headline and lead.
// Markup from site/src/integrations.html, unchanged apart from JSX syntax.
export default function IntegrationsHero() {
  return (
    <section className="in-hero" aria-labelledby="in-title"><div className="wrap" data-reveal-now="">
      <h1 className="h-hero" id="in-title" data-reveal="">Every camera, gantry and site device, in one control room.</h1>
      <p className="lead">We connect what you already run and open the data through REST APIs, webhooks and an events feed. Every connection here shows its real status.</p>
    </div></section>
  );
}
