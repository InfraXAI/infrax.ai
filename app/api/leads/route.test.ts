// Demo-request mail, tested against a local mock of Microsoft sign-in and Graph: no network, no real mail.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { REQUIRED, resetLimits, failure, GraphError } from './lead';
import { ackEmail, firstNameOnly, leadEmail } from './template';

const ENV = {
  MAIL_GRAPH_TENANT_ID: 'tenant-1', MAIL_GRAPH_CLIENT_ID: 'client-1', MAIL_GRAPH_CLIENT_SECRET: 'secret-1',
  MAIL_GRAPH_SENDER: 'donotreply@infrax.ai', BOOK_DEMO_TO: 'bookdemo@infrax.ai',
};
const LEAD = { name: 'Test Person', email: 'test@example.com', phone: '9000000000', domain: 'Ports', organization: 'Acme', products: ['Cygnus'], message: 'Two gates' };

type Call = { url: string; init: RequestInit };
let calls: Call[] = [], logs: string[] = [];
let tokenStatus = 200, sendStatus: number[] = [], hang = false;
const realFetch = globalThis.fetch, realError = console.error;

function mails() { return calls.filter((c) => c.url.includes('/sendMail')).map((c) => JSON.parse(String(c.init.body)).message); }
function req(body: unknown, ip = '1.1.1.1') {
  return new NextRequest('http://localhost/api/leads', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-real-ip': ip } });
}

beforeEach(() => {
  calls = []; logs = []; tokenStatus = 200; sendStatus = []; hang = false; resetLimits();
  Object.assign(process.env, ENV);
  console.error = (...a: unknown[]) => { logs.push(a.map(String).join(' ')); };
  globalThis.fetch = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input); calls.push({ url, init });
    if (hang) await new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason)));
    if (url.includes('login.microsoftonline.com')) {
      return tokenStatus === 200
        ? new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 })
        : new Response(JSON.stringify({ error: 'invalid_client', error_description: 'secret for test@example.com' }), { status: tokenStatus });
    }
    const s = sendStatus.length ? sendStatus.shift() as number : 202;
    return s === 202 ? new Response(null, { status: 202 }) : new Response(JSON.stringify({ error: { code: 'ErrorAccessDenied', message: 'test@example.com' } }), { status: s });
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; console.error = realError; });

test('sends the notification, then the acknowledgement', async () => {
  const res = await POST(req(LEAD));
  assert.equal(res.status, 200);
  const [owner, ack] = mails();
  assert.deepEqual(owner.toRecipients, [{ emailAddress: { address: 'bookdemo@infrax.ai' } }]);
  assert.deepEqual(ack.toRecipients, [{ emailAddress: { address: 'test@example.com' } }]);
});
test('notification replies go to the customer', async () => {
  await POST(req(LEAD));
  assert.deepEqual(mails()[0].replyTo, [{ emailAddress: { name: 'Test Person', address: 'test@example.com' } }]);
});
test('acknowledgement replies go to bookdemo@', async () => {
  await POST(req(LEAD));
  assert.deepEqual(mails()[1].replyTo, [{ emailAddress: { address: 'bookdemo@infrax.ai' } }]);
});
test('sends as MAIL_GRAPH_SENDER, without saving to sent items', async () => {
  await POST(req(LEAD));
  const send = calls.find((c) => c.url.includes('/sendMail')) as Call;
  assert.match(send.url, /\/users\/donotreply%40infrax\.ai\/sendMail$/);
  assert.equal(JSON.parse(String(send.init.body)).saveToSentItems, false);
  assert.equal((send.init.headers as Record<string, string>).authorization, 'Bearer tok');
});
test('signs in with client credentials for the tenant', async () => {
  await POST(req(LEAD));
  const t = calls[0];
  assert.match(t.url, /login\.microsoftonline\.com\/tenant-1\/oauth2\/v2\.0\/token$/);
  const p = new URLSearchParams(String(t.init.body));
  assert.equal(p.get('grant_type'), 'client_credentials');
  assert.equal(p.get('scope'), 'https://graph.microsoft.com/.default');
});
test('reuses the token across requests', async () => {
  await POST(req(LEAD)); await POST(req({ ...LEAD, email: 'b@example.com' }));
  assert.equal(calls.filter((c) => c.url.includes('login.')).length, 1);
});
test('several BOOK_DEMO_TO addresses all get the notification', async () => {
  process.env.BOOK_DEMO_TO = 'bookdemo@infrax.ai, sales@infrax.ai';
  await POST(req(LEAD));
  assert.equal(mails()[0].toRecipients.length, 2);
});
test('mail bodies are HTML', async () => {
  await POST(req(LEAD));
  for (const m of mails()) assert.equal(m.body.contentType, 'HTML');
});
test('hidden bot field: success shown, no mail', async () => {
  const res = await POST(req({ ...LEAD, website: 'spam' }));
  assert.equal(res.status, 200); assert.equal(calls.length, 0);
});
test('bad JSON is a 400', async () => {
  assert.equal((await POST(req('{nope'))).status, 400);
});
test('missing name is a 400, no mail', async () => {
  assert.equal((await POST(req({ ...LEAD, name: '' }))).status, 400); assert.equal(calls.length, 0);
});
test('an address list in the email field is a 400', async () => {
  assert.equal((await POST(req({ ...LEAD, email: 'a@example.com,b@example.com' }))).status, 400);
});
test('a short phone number is a 400', async () => {
  assert.equal((await POST(req({ ...LEAD, phone: '12345' }))).status, 400);
});
test('a sixth request in a minute from one address is a 429', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await POST(req({ ...LEAD, email: `p${i}@example.com` }))).status, 200);
  assert.equal((await POST(req(LEAD))).status, 429);
});
test('every required setting unset: 503, no mail, log names them all', async () => {
  for (const k of REQUIRED) delete process.env[k];
  const res = await POST(req(LEAD));
  assert.equal(res.status, 503); assert.equal(calls.length, 0);
  for (const k of REQUIRED) assert.ok(logs.join('\n').includes(k), k);
});
test('one setting unset (BOOK_DEMO_TO): 503, no mail', async () => {
  delete process.env.BOOK_DEMO_TO;
  assert.equal((await POST(req(LEAD))).status, 503); assert.equal(calls.length, 0);
});
test('sign-in refused: 502, nothing sent', async () => {
  tokenStatus = 401;
  assert.equal((await POST(req(LEAD))).status, 502);
  assert.equal(mails().length, 0);
  assert.match(logs.join('\n'), /step=token status=401 code=invalid_client/);
});
test('notification refused (403): 502 and no acknowledgement', async () => {
  sendStatus = [403];
  assert.equal((await POST(req(LEAD))).status, 502);
  assert.equal(mails().length, 1);
  assert.match(logs.join('\n'), /step=send status=403 code=ErrorAccessDenied/);
});
test('acknowledgement refused: customer still sees success', async () => {
  sendStatus = [202, 500];
  assert.equal((await POST(req(LEAD))).status, 200);
  assert.match(logs.join('\n'), /acknowledgement failed: step=send status=500/);
});
test('a hung Graph call times out as a 502, logged as timeout', { timeout: 15_000 }, async () => {
  hang = true;
  assert.equal((await POST(req(LEAD))).status, 502);
  assert.match(logs.join('\n'), /Lead email failed: timeout/);
});
test('logs never carry addresses, names, phone numbers or secrets', async () => {
  tokenStatus = 401; await POST(req(LEAD));
  tokenStatus = 200; sendStatus = [202, 500]; await POST(req({ ...LEAD, email: 'c@example.com' }));
  const all = logs.join('\n');
  for (const s of ['test@example.com', 'c@example.com', 'Test Person', '9000000000', 'secret-1']) assert.ok(!all.includes(s), s);
});
test('a fourth acknowledgement in an hour to one address is skipped', async () => {
  for (let i = 0; i < 3; i++) await POST(req(LEAD, `9.9.9.${i}`));
  calls = [];
  assert.equal((await POST(req(LEAD, '9.9.9.9'))).status, 200);
  assert.equal(mails().length, 1);
  assert.match(logs.join('\n'), /acknowledgement skipped/);
});
test('the acknowledgement limit ignores letter case', async () => {
  for (let i = 0; i < 3; i++) await POST(req({ ...LEAD, email: i % 2 ? 'TEST@example.com' : 'test@example.com' }, `8.8.8.${i}`));
  calls = []; await POST(req(LEAD, '8.8.8.9'));
  assert.equal(mails().length, 1);
});
test('the acknowledgement carries only a first name, never other typed text', async () => {
  await POST(req({ ...LEAD, organization: 'Visit evil.example', message: 'click http://evil.example' }));
  const html = mails()[1].body.content as string;
  assert.ok(html.includes('Hello Test,'));
  assert.ok(!html.includes('evil.example')); assert.ok(!html.includes('Acme'));
});
test('firstNameOnly keeps letters only, in any script', () => {
  assert.equal(firstNameOnly('Mehul Dadhich'), 'Mehul');
  assert.equal(firstNameOnly('मेहुल'), 'मेहुल');
  assert.equal(firstNameOnly('http://x.y'), '');
  assert.equal(firstNameOnly('<b>Bob</b>'), '');
  assert.equal(ackEmail('www.spam.example now').html.includes('Hello,'), true);
});
test('the notification escapes unusual names and text', () => {
  const { html, subject } = leadEmail({ ...LEAD, name: '<script>x</script>', products: 'Cygnus', organization: '"&', message: '<img src=x>', source: 'website' }, new Date());
  assert.ok(!html.includes('<script>x')); assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<img src=x>'));
  assert.match(subject, /^A customer has requested a demo/);
});
test('failure() reports codes only', () => {
  assert.equal(failure(new GraphError('send', 404, 'ErrorInvalidUser')), 'step=send status=404 code=ErrorInvalidUser');
  assert.equal(failure(new Error('mail to test@example.com failed')), 'network');
});
