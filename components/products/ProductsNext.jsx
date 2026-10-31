// Next band: link to How it works.
// Markup from site/src/products.html, unchanged apart from JSX syntax.
export default function ProductsNext() {
  return (
    <div className="wrap">
      <a className="next-band" href="/how-it-works">
        <div><p className="eyebrow">Next</p><span className="h-1">From camera to action, in real time.</span></div>
        <span className="arrow" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span>
      </a>
    </div>
  );
}
