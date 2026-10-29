// The email the sales inbox receives for each demo request: table-based HTML with inline styles
// (renders the same in Gmail, Outlook and Apple Mail) plus a plain-text version.

export type Lead = {
  name: string; organization: string; email: string; phone: string;
  domain: string; products: string; message: string; source: string;
};

const BLUE = '#2673B5', DEEP = '#0E3B66', INK = '#0A1A2B', MUTED = '#5B6E82', LINE = '#E3EAF2', MIST = '#F2F7FC';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function button(href: string, label: string, primary: boolean): string {
  const bg = primary ? BLUE : '#FFFFFF', fg = primary ? '#FFFFFF' : DEEP, bd = primary ? BLUE : '#C9D7E6';
  return `<td style="padding:0 8px 8px 0"><a href="${esc(href)}" style="display:inline-block;padding:11px 18px;border-radius:8px;border:1px solid ${bd};background:${bg};color:${fg};font:600 14px/1 ${FONT};text-decoration:none">${esc(label)}</a></td>`;
}

export function leadEmail(lead: Lead, receivedAt: Date) {
  const when = receivedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' IST';
  const ist = new Date(receivedAt.getTime() + 330 * 60000).toISOString(); // the reference carries the Indian date
  const ref = 'DR-' + ist.slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const first = lead.name.split(/\s+/)[0];
  const digits = lead.phone.replace(/\D/g, '');
  const wa = digits.length === 10 ? '91' + digits : digits; // a 10-digit number is taken as Indian
  const org = lead.organization || 'Organisation not given';
  const products = lead.products ? lead.products.split(/\s*,\s*/).filter(Boolean) : [];

  const subject = `Demo request · ${lead.name}${lead.organization ? ', ' + lead.organization : ''} · ${lead.domain}`;
  const replySubject = encodeURIComponent('Your InfraX AI demo');
  const preheader = `${lead.name} (${org}) wants a demo for ${lead.domain}. Call ${lead.phone}.`;

  const row = (k: string, v: string, link?: string) =>
    `<tr><td style="padding:12px 0;border-top:1px solid ${LINE};width:150px;vertical-align:top;font:500 13px/1.5 ${FONT};color:${MUTED}">${esc(k)}</td>` +
    `<td style="padding:12px 0;border-top:1px solid ${LINE};vertical-align:top;font:500 15px/1.5 ${FONT};color:${INK}">` +
    (link ? `<a href="${esc(link)}" style="color:${BLUE};text-decoration:none">${esc(v)}</a>` : esc(v)) + '</td></tr>';

  const chips = products.length
    ? products.map((p) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 10px;border-radius:999px;background:${MIST};border:1px solid ${LINE};font:600 12px/1.2 ${FONT};color:${DEEP}">${esc(p)}</span>`).join('')
    : `<span style="font:500 15px/1.5 ${FONT};color:${MUTED}">None picked</span>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEF3F8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid ${LINE}">
  <tr><td style="background:${DEEP};padding:22px 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font:700 20px/1 ${FONT};color:#FFFFFF;letter-spacing:-.01em">InfraX<span style="color:#7FB6E6"> AI</span></td>
      <td align="right" style="font:600 11px/1 ${FONT};color:#BFD6EC;letter-spacing:.12em;text-transform:uppercase">New demo request</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:30px 32px 6px">
    <p style="margin:0 0 6px;font:600 13px/1.4 ${FONT};color:${BLUE}">${esc(lead.domain)} &nbsp;·&nbsp; ${esc(when)}</p>
    <h1 style="margin:0;font:700 24px/1.25 ${FONT};color:${INK};letter-spacing:-.015em">${esc(lead.name)} wants a demo</h1>
    <p style="margin:8px 0 0;font:400 15px/1.55 ${FONT};color:${MUTED}">${esc(org)}. Reply within one working day, as the website promises.</p>
  </td></tr>
  <tr><td style="padding:20px 32px 6px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      ${button(`mailto:${lead.email}?subject=${replySubject}`, `Reply to ${first}`, true)}
      ${button(`tel:${lead.phone.replace(/[^\d+]/g, '')}`, `Call ${lead.phone}`, false)}
      ${wa ? button(`https://wa.me/${wa}`, 'WhatsApp', false) : ''}
    </tr></table>
  </td></tr>
  <tr><td style="padding:14px 32px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Name', lead.name)}
      ${row('Organisation', org)}
      ${row('Work email', lead.email, `mailto:${lead.email}`)}
      ${row('Mobile', lead.phone, `tel:${lead.phone.replace(/[^\d+]/g, '')}`)}
      ${row('Domain', lead.domain)}
      <tr><td style="padding:12px 0;border-top:1px solid ${LINE};width:150px;vertical-align:top;font:500 13px/1.5 ${FONT};color:${MUTED}">Products</td><td style="padding:12px 0 6px;border-top:1px solid ${LINE}">${chips}</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:10px 32px 8px">
    <p style="margin:0 0 8px;font:500 13px/1.5 ${FONT};color:${MUTED}">About their sites</p>
    <div style="padding:16px 18px;border-radius:10px;background:${MIST};border-left:3px solid ${BLUE};font:400 15px/1.6 ${FONT};color:${INK};white-space:pre-wrap">${lead.message ? esc(lead.message) : `<span style="color:${MUTED}">Nothing added.</span>`}</div>
  </td></tr>
  <tr><td style="padding:22px 32px 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE}"><tr>
      <td style="padding-top:14px;font:400 12px/1.6 ${FONT};color:${MUTED}">Reference ${esc(ref)}<br>Sent from ${esc(lead.source)}</td>
      <td align="right" style="padding-top:14px;font:400 12px/1.6 ${FONT};color:${MUTED}">Replying to this email<br>goes straight to ${esc(first)}.</td>
    </tr></table>
  </td></tr>
</table>
<p style="margin:16px 0 0;font:400 12px/1.5 ${FONT};color:#8A9AAB">InfraX AI website · infrax.ai</p>
</td></tr></table>
</body></html>`;

  const text = [
    `NEW DEMO REQUEST · ${lead.domain} · ${when}`,
    '',
    `${lead.name} wants a demo.`,
    '',
    `Name:          ${lead.name}`,
    `Organisation:  ${org}`,
    `Work email:    ${lead.email}`,
    `Mobile:        ${lead.phone}`,
    `Domain:        ${lead.domain}`,
    `Products:      ${products.length ? products.join(', ') : 'None picked'}`,
    '',
    'About their sites:',
    lead.message || 'Nothing added.',
    '',
    `Reference ${ref} · sent from ${lead.source}`,
    `Reply to this email to answer ${first} directly.`,
  ].join('\n');

  return { subject, html, text };
}
