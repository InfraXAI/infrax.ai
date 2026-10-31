import { NextResponse } from 'next/server';
import { ackEmail, leadEmail } from './template';

// The demo-request handler behind app/api/leads/route.js. Requests are sent through Microsoft Graph as donotreply@: a notification to
// BOOK_DEMO_TO, then a "request received" acknowledgement to the customer. No mailbox password lives
// on the host. Settings come from the host's environment variables (see .env.example).
export const REQUIRED = ['MAIL_GRAPH_TENANT_ID', 'MAIL_GRAPH_CLIENT_ID', 'MAIL_GRAPH_CLIENT_SECRET', 'MAIL_GRAPH_SENDER', 'BOOK_DEMO_TO'];
const OWNER_TIMEOUT_MS = 10_000, ACK_TIMEOUT_MS = 4_000;
const MAX = { name: 120, organization: 200, email: 200, phone: 20, domain: 60, products: 400, message: 1500, source: 200 };

// one line, no control characters, trimmed to a length
function line(v, max) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}
function text(v, max) {
  return String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
}

// one plain address: no lists, display names or URL parameters, so reply-to and the mailto: link reach only the sender
const EMAIL = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

// the caller's address as the host proxy saw it: x-real-ip, else the last x-forwarded-for hop (the first one is client-supplied)
function clientIp(request) {
  const real = (request.headers.get('x-real-ip') || '').trim();
  if (real) return real;
  const hops = (request.headers.get('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean);
  return hops[hops.length - 1] || 'unknown';
}

// best effort, per server instance: true once `key` has been seen more than `max` times inside `windowMs`
const ipHits = new Map(), ackHits = new Map();
function limited(store, key, max, windowMs) {
  const now = Date.now(), recent = (store.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now); store.delete(key); store.set(key, recent);
  // drop the longest-idle keys (a Map keeps insertion order) instead of resetting everyone's count
  for (const k of store.keys()) { if (store.size <= 5000) break; store.delete(k); }
  return recent.length > max;
}
export function resetLimits() { ipHits.clear(); ackHits.clear(); token = null; }

function missing() {
  return REQUIRED.filter((k) => !(process.env[k] || '').trim());
}
function recipients() {
  return (process.env.BOOK_DEMO_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// carries only a step, an HTTP status and Graph's error code: never a message, which can quote addresses
export class GraphError extends Error {
  constructor(step, status, code) { super(`${step} ${status} ${code}`); this.step = step; this.status = status; this.code = code; }
}
export function failure(error) {
  if (error instanceof GraphError) return `step=${error.step} status=${error.status} code=${error.code}`;
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'timeout';
  return 'network';
}
async function graphCode(res) {
  try {
    const j = await res.json();
    return line(j?.error?.code ?? j?.error ?? 'unknown', 60).replace(/[^\w.-]/g, '') || 'unknown';
  } catch { return 'unknown'; }
}

// app-only sign-in (client credentials); the token is reused until a minute before it expires
let token = null;
async function accessToken(signal) {
  if (token && Date.now() < token.until) return token.value;
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(process.env.MAIL_GRAPH_TENANT_ID)}/oauth2/v2.0/token`, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MAIL_GRAPH_CLIENT_ID,
      client_secret: process.env.MAIL_GRAPH_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new GraphError('token', res.status, await graphCode(res));
  const j = await res.json();
  if (!j.access_token) throw new GraphError('token', res.status, 'no_token');
  token = { value: j.access_token, until: Date.now() + Math.max(0, (j.expires_in ?? 3600) - 60) * 1000 };
  return token.value;
}

const asRecipient = (a) => ({ emailAddress: a.name ? { name: a.name, address: a.address } : { address: a.address } });

// Graph answers 202 when it accepts the mail, not when it is delivered. No retries: a send that timed out
// may still have been accepted, and a retry could send it twice.
export async function sendMail(mail, timeoutMs) {
  const signal = AbortSignal.timeout(timeoutMs);
  const bearer = await accessToken(signal);
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(process.env.MAIL_GRAPH_SENDER)}/sendMail`, {
    method: 'POST', signal,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: mail.subject,
        body: { contentType: 'HTML', content: mail.html },
        toRecipients: mail.to.map((address) => asRecipient({ address })),
        replyTo: mail.replyTo.map(asRecipient),
      },
      saveToSentItems: false,
    }),
  });
  if (res.status !== 202) throw new GraphError('send', res.status, await graphCode(res));
}

export async function handleLead(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // the form's hidden field: people never fill it, bots usually do. Answer as if sent.
  if (line(body.website, 200)) return NextResponse.json({ success: true });

  if (limited(ipHits, clientIp(request), 5, 60_000)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const lead = {
    name: line(body.name, MAX.name),
    organization: line(body.organization, MAX.organization),
    email: line(body.email, MAX.email),
    phone: line(body.phone, MAX.phone),
    domain: line(body.domain ?? body.audience, MAX.domain),
    products: line(Array.isArray(body.products) ? body.products.join(', ') : body.products, MAX.products),
    message: text(body.message, MAX.message),
    source: line(body.source, MAX.source) || 'website',
  };

  if (!lead.name || !lead.domain || !EMAIL.test(lead.email) || lead.phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  // no built-in fallback address: an unset setting is a configuration error
  const unset = missing();
  if (unset.length) {
    console.error('Lead not sent, settings missing:', unset.join(', '));
    return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
  }

  // 1. notification to the team: decides what the customer sees
  const owner = leadEmail(lead, new Date());
  try {
    await sendMail({ to: recipients(), replyTo: [{ name: lead.name, address: lead.email }], subject: owner.subject, html: owner.html }, OWNER_TIMEOUT_MS);
  } catch (error) {
    console.error('Lead email failed:', failure(error));
    return NextResponse.json({ error: 'Could not send' }, { status: 502 });
  }

  // the team has the request: from here the customer always sees success
  if (limited(ackHits, lead.email.toLowerCase(), 3, 3_600_000)) {
    console.error('Lead acknowledgement skipped: limit for one mailbox');
    return NextResponse.json({ success: true });
  }

  // 2. acknowledgement to the customer: carries nothing they typed except a letters-only first name
  const ack = ackEmail(lead.name);
  try {
    await sendMail({ to: [lead.email], replyTo: recipients().map((address) => ({ address })), subject: ack.subject, html: ack.html }, ACK_TIMEOUT_MS);
  } catch (error) {
    console.error('Lead acknowledgement failed:', failure(error));
  }
  return NextResponse.json({ success: true });
}
