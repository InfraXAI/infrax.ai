// Hero: the headline and the one-line lead.
// Markup from site/src/how-it-works.html, unchanged apart from JSX syntax.
export default function HowHero() {
  return (
    <section className="hw-hero" aria-labelledby="hw-title"><div className="wrap" data-reveal-now="">
      <h1 className="h-hero" id="hw-title" data-reveal="">From camera to action, in real time.</h1>
      <p className="lead">AI does the watching. Your operator makes the call.</p>
    </div></section>
  );
}
