// The next-band link to Analytics.
// Markup from site/src/how-it-works.html, unchanged apart from JSX syntax.
export default function HowNext() {
  return (
    <div className="wrap"><a className="next-band" href="/analytics">
      <div><p className="eyebrow">Next</p><p className="h-1">What your cameras read and flag.</p></div>
      <span className="arrow" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span>
    </a></div>
  );
}
