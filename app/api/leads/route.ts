import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { leadEmail, type Lead } from './template';

// Demo requests from the website are emailed to the sales inbox over SMTP.
// Settings come from the host's environment variables (see .env.example).
export const runtime = 'nodejs';

// comma-separated list; each request goes to every address
const TO = process.env.LEAD_TO || 'info@infrax.ai';
const MAX = { name: 120, organization: 200, email: 200, phone: 20, domain: 60, products: 400, message: 1500, source: 200 };

// one line, no control characters (keeps header fields safe), trimmed to a length
function line(v: unknown, max: number): string {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}
function text(v: unknown, max: number): string {
  return String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
}

// one plain address: no lists, display names or URL parameters, so reply-to and the mailto: link reach only the sender
const EMAIL = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

// the caller's address as the host proxy saw it: x-real-ip, else the last x-forwarded-for hop (the first one is client-supplied)
function clientIp(request: NextRequest): string {
  const real = (request.headers.get('x-real-ip') || '').trim();
  if (real) return real;
  const hops = (request.headers.get('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean);
  return hops[hops.length - 1] || 'unknown';
}

// best effort: at most 5 requests a minute from one address on one server instance
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now); hits.delete(ip); hits.set(ip, recent);
  // drop the longest-idle addresses (a Map keeps insertion order) instead of resetting everyone's count
  for (const key of hits.keys()) { if (hits.size <= 5000) break; hits.delete(key); }
  return recent.length > 5;
}

type Mailer = ReturnType<typeof nodemailer.createTransport>;
let transport: Mailer | null = null;
function mailer(): Mailer | null {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 587);
    transport = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465, auth: { user, pass } });
  }
  return transport;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // the form's hidden field: people never fill it, bots usually do. Answer as if sent.
  if (line(body.website, 200)) return NextResponse.json({ success: true });

  const ip = clientIp(request);
  if (limited(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const lead: Lead = {
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

  const smtp = mailer();
  if (!smtp) {
    console.error('Lead not sent: SMTP_HOST, SMTP_USER and SMTP_PASS must be set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const mail = leadEmail(lead, new Date());

  try {
    await smtp.sendMail({
      from: { name: 'InfraX AI website', address: process.env.LEAD_FROM || (process.env.SMTP_USER as string) },
      to: TO,
      replyTo: { name: lead.name, address: lead.email },
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead email failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not send' }, { status: 502 });
  }
}
