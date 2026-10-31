// Security row and the Next band to Integrations.
// Markup from site/src/deployment.html, unchanged apart from JSX syntax.
export default function DeploymentSecurity() {
  return (
    <>
    <section className="scene tight" aria-labelledby="dp-sec-h" style={{ 'paddingTop': '0' }}>
      <div className="wrap">
        <h2 className="h-2" id="dp-sec-h">Built for public-sector data rules.</h2>
        <div className="dp-sec" id="dpSec">
          <div><span className="ix" data-ix="server" data-size="28" aria-hidden="true"></span><h3>Data stays on site</h3><p>Video, evidence and records never leave your premises.</p></div>
          <div><span className="ix" data-ix="operator" data-size="28" aria-hidden="true"></span><h3>Roles and audit log</h3><p>Five roles, rights per feature, and a full audit trail.</p></div>
          <div><span className="ix" data-ix="lock" data-size="28" aria-hidden="true"></span><h3>Encryption</h3><p>Data is encrypted in transit and at rest.</p></div>
          <div><span className="ix" data-ix="server" data-size="28" aria-hidden="true"></span><h3>Backups with tested restores</h3><p>Recovery is tested, not assumed.</p></div>
          <div><span className="ix" data-ix="check" data-size="28" aria-hidden="true"></span><h3>DPDP Act, 2023</h3><p>Designed for India's Digital Personal Data Protection Act, 2023 (DPDP), including how face data is handled.</p></div>
        </div>
        <a className="next-band" href="/integrations" style={{ 'marginTop': 'calc(72*var(--s))' }}>
          <div><p className="eyebrow">Next</p><p className="h-1">How InfraX AI connects<br />with your systems</p></div>
          <span className="arrow" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 13h16M14 6l7 7-7 7" /></svg></span>
        </a>
      </div>
    </section>
    </>
  );
}
