// After the engagement path: what the customer receives and what we need, example first scopes, a short FAQ and the
// closing call to action. Static markup; the icons are filled in by the shared runtime ([data-ix]).
import { Arrow } from '@/components/site/Arrow';

const RECEIVE = [
  'The agreed software, running in your environment',
  'The configuration and integrations we built for you',
  'Test results against the agreed acceptance cases',
  'Documentation',
];
const NEED = [
  ['api', 'API documents or sample data for each system'],
  ['camera', 'Sample video from your cameras'],
  ['server', 'Access to the target environment'],
  ['people', 'One owner on your side to sign off acceptance'],
];
const EXAMPLES = [
  ['plate', 'Send ANPR reads from one gantry into your existing system'],
  ['operator', 'Build a review screen for one incident type'],
  ['camera', 'Connect the cameras at one site to review and reporting'],
];
const FAQ = [
  ['Can Cygnus track a vehicle that has no number plate and trace its journey?', 'Partly. Cygnus traces a journey by plate across cameras. When the plate is missing or unreadable, it suggests likely matches at other cameras from the vehicle\u2019s appearance (class, colour and shape), and an operator confirms them. Treat those as leads, not proof.'],
  ['We only need Cygnus for the first year. Can it connect to other products later?', 'Yes. Every product runs on the same platform, so adding Plexus, Dhrishya or another product later is a licence and configuration step. Your cameras, users and recordings stay as they are.'],
  ['What if our requirement grows to more sites or cameras?', 'You add servers and cameras to the same installation. Cygnus runs on standard CPU servers, and we size the hardware for each new site before it goes live.'],
  ['How long does it take to integrate with our existing VMS, ATMS or other software?', 'It depends on what the other system exposes. We check its interfaces in the Discover step and give you a timeline before work starts; standard interfaces such as ONVIF, RTSP and REST APIs are the quickest. You see the integration working before handover.'],
  ['How long does it take to onboard 1,000 cameras on Cygnus?', 'Cameras are added in bulk from a spreadsheet, not one by one. Most of the time goes into network access and camera credentials on site, so we plan the rollout in batches by site and agree the dates in the Define step.'],
  ['What happens if the network link to a site drops?', 'Dhrishya and Naka keep working at the site and send their reads and transactions once the link returns.'],
  ['Can we get the data into our own systems?', 'Yes. We agree the format with you in the Define step and deliver the feed as part of the scope.'],
  ['Do we have to replace our cameras?', 'No, we work with IP cameras over ONVIF or RTSP.'],
  ['Can it run on our own servers?', 'Yes.'],
  ['Who owns the work?', 'You own the configuration and integrations we build for you.'],
];

export default function ServicesDetails() {
  return (
    <>
      <section className="scene tight sv-terms" aria-label="Handover and what we need"><div className="wrap sv-terms-grid">
        <div className="sv-panel">
          <h2 className="sv-panel-h" id="sv-receive-title">What you receive at handover</h2>
          <ul className="sv-checks" aria-labelledby="sv-receive-title">
            {RECEIVE.map((t) => (
              <li key={t}><span className="sv-tick" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2.6 6.3l2.2 2.3 4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="sv-panel">
          <h2 className="sv-panel-h" id="sv-need-title">What we need from you</h2>
          <ul className="sv-needs" aria-labelledby="sv-need-title">
            {NEED.map(([ix, t]) => (
              <li key={t}><span className="sv-need-ic" aria-hidden="true"><span className="ix" data-ix={ix} data-size="18"></span></span>{t}</li>
            ))}
          </ul>
        </div>
      </div></section>

      <section className="scene tight sv-ex" aria-labelledby="sv-ex-title"><div className="wrap">
        <div className="sv-ex-head">
          <h2 className="h-2 sv-h" id="sv-ex-title" data-reveal="">Example first scopes</h2>
          <p className="lead sv-tag">Start with one site or one workflow, for example:</p>
        </div>
        <ul className="sv-ex-grid">
          {EXAMPLES.map(([ix, t], i) => (
            <li key={t} className="sv-ex-card">
              <span className="sv-ex-top"><span className="sv-ex-ic" aria-hidden="true"><span className="ix" data-ix={ix} data-size="20"></span></span><span className="sv-ex-tag">Example {String(i + 1).padStart(2, '0')}</span></span>
              <p>{t}</p>
            </li>
          ))}
        </ul>
        <p className="sv-ex-note">These are examples of a first scope, not customer projects.</p>
      </div></section>

      <section className="scene tight sv-faq" aria-labelledby="sv-faq-title"><div className="wrap sv-faq-grid">
        <div className="sv-faq-head"><h2 className="h-2 sv-h" id="sv-faq-title">Common questions</h2><p className="lead sv-tag">Short answers to what teams ask first.</p></div>
        <div className="sv-qa">
          {FAQ.map(([q, a], i) => (
            <details key={q} name="sv-faq" open={i === 0}><summary>{q}<i aria-hidden="true" /></summary><p>{a}</p></details>
          ))}
        </div>
      </div></section>

      <section className="scene tight sv-cta" aria-labelledby="sv-cta-title"><div className="wrap">
        <div className="sv-cta-band">
          <h2 className="sv-cta-h" id="sv-cta-title">Have a site or workflow in mind?</h2>
          <a className="btn btn-primary" href="/#demo">Talk to us about a scope <Arrow /></a>
        </div>
      </div></section>
    </>
  );
}
