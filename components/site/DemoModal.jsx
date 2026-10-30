// The shared "Book a demo" dialog: JSX port of build.py demo_modal() (server component; it never re-renders, which
// matters because the runtime rewrites parts of it: the title's word spans and the custom Domain dropdown).
// Opened by lib/site-runtime.js for any a[href$="#demo"]; the form posts to /api/leads.
export default function DemoModal() {
  return (
      <div className="dm" id="demoModal" hidden>
        <div className="dm-backdrop" data-dm-close=""></div>
        <div className="dm-dialog" role="dialog" aria-modal="true" aria-labelledby="dmTitle" tabIndex="-1" data-lenis-prevent="">
          <button className="dm-x" type="button" aria-label="Close" data-dm-close=""><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg></button>
          <div className="dm-side">
            <canvas className="dm-net" aria-hidden="true"></canvas>
            <div className="dm-brand" aria-hidden="true"><img src="/assets/logo.svg" alt="" width="84" height="24" /><span>infrax.ai</span></div>
            <div className="dm-glass">
              <h2 className="h-2" id="dmTitle">See it on a site like yours.</h2>
              <p className="body dm-intro">Tell us what you run. We'll show the products that fit.</p>
            </div>
            <ol className="dm-steps">
              <li><i>1</i><span>A 30-minute call about your sites and cameras.</span></li>
              <li><i>2</i><span>A live walkthrough of the control room for your domain.</span></li>
              <li><i>3</i><span>A rollout plan for your sites and servers.</span></li>
            </ol>
          </div>
          <div className="dm-main">
            <form className="dm-form" id="dmForm" noValidate>
              <div className="dm-f"><label htmlFor="dmName">Name <span className="req" aria-hidden="true">*</span></label><input id="dmName" aria-describedby="dmNameErr" name="name" autoComplete="name" required /><span className="err" id="dmNameErr" aria-live="polite"></span></div>
              <div className="dm-f"><label htmlFor="dmOrg">Organisation <small>(optional)</small></label><input id="dmOrg" aria-describedby="dmOrgErr" maxLength="200" name="org" autoComplete="organization" /><span className="err" id="dmOrgErr" aria-live="polite"></span></div>
              <div className="dm-f"><label htmlFor="dmEmail">Email <span className="req" aria-hidden="true">*</span></label><input id="dmEmail" aria-describedby="dmEmailErr" name="email" type="email" autoComplete="email" required /><span className="err" id="dmEmailErr" aria-live="polite"></span></div>
              <div className="dm-f"><label htmlFor="dmPhone">Mobile number <span className="req" aria-hidden="true">*</span></label><input id="dmPhone" aria-describedby="dmPhoneErr" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength="20" required /><span className="err" id="dmPhoneErr" aria-live="polite"></span></div>
              <div className="dm-f full"><label htmlFor="dmDomain">Domain <span className="req" aria-hidden="true">*</span></label>
                <select id="dmDomain" aria-describedby="dmDomainErr" name="domain" required><option value="">Choose the closest match</option><option>Highways</option><option>Cities</option><option>Campuses</option><option>Ports</option><option>Warehouses</option><option>Construction</option><option>System integrator</option></select><span className="err" id="dmDomainErr" aria-live="polite"></span></div>
              <fieldset className="dm-f full"><legend>Products of interest <small>(optional)</small></legend><div className="dm-opts"><label><input type="checkbox" name="interest" value="InfraX AI VIDES" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>VIDES</label><label><input type="checkbox" name="interest" value="AstraAlert" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>AstraAlert</label><label><input type="checkbox" name="interest" value="TollCloud" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>TollCloud</label><label><input type="checkbox" name="interest" value="MLFF" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>MLFF</label><label><input type="checkbox" name="interest" value="Cygnus" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>Cygnus</label><label><input type="checkbox" name="interest" value="Central Plexus (ATMS / ICCC)" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>Central Plexus (ATMS / ICCC)</label><label><input type="checkbox" name="interest" value="InfraX AI Ops" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>InfraX AI Ops</label><label><input type="checkbox" name="interest" value="Access and parking" /><i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3" /></svg></i>Access and parking</label></div></fieldset>
              <div className="dm-hp" aria-hidden="true"><label htmlFor="dmWebsite">Website</label><input id="dmWebsite" name="website" tabIndex="-1" autoComplete="off" /></div>
              <div className="dm-f full"><label htmlFor="dmMsg">About your sites <small>(optional)</small></label><textarea id="dmMsg" maxLength="1500" name="message" placeholder="e.g. a warehouse with two gates and existing IP cameras"></textarea></div>
              <div className="dm-submit"><button className="btn btn-primary" type="submit">Request a demo <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></button><p><span className="req" aria-hidden="true">*</span> Required. We use your details only to arrange the demo.</p></div>
              <p className="dm-senderr" id="dmSendErr" role="alert" tabIndex="-1" hidden>We couldn't send your request. Please try again, or email <a href="mailto:info@infrax.ai">info@infrax.ai</a>.</p>
            </form>
            <div className="dm-ok" id="dmOk" hidden tabIndex="-1">
              <div className="tick"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
              <h3 className="h-2" id="dmOkH">Request received.</h3>
              <p className="body" id="dmOkText">Thank you. We'll reply within one working day to set up the demo.</p>
              <div className="dm-okrow"><button className="btn btn-primary" type="button" data-dm-close="">Done</button></div>
            </div>
          </div>
        </div>
      </div>  );
}
