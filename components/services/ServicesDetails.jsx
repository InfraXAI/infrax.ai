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
          <h2 className="h-sub" id="sv-ex-title" data-reveal="">Example first scopes</h2>
          <p className="lead">Start with one site or one workflow, for example:</p>
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
        <h2 className="h-sub" id="sv-faq-title">Common questions</h2>
        <dl className="sv-qa">
          {FAQ.map(([q, a]) => (
            <div key={q}><dt>{q}</dt><dd>{a}</dd></div>
          ))}
        </dl>
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
