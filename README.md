# INFRAX.AI website

The site is a static, animated multi-page site (GSAP, Lenis, Three.js from CDNs) built from `site/`
and served by Next.js from `public/`. The only Next.js code is the demo-lead API route.

## Layout

- `site/src/` — page bodies: home, products, analytics, how-it-works, deployment,
  integrations, services. Each starts with a `<!--META title desc page libs-->` line; `site/build.py`
  wraps it with the shared head, nav, footer and the Book a demo popup.
- `site/assets/` — `site.css`, `site.js` (plexus background, nav, smooth scroll, page transitions,
  demo popup, no-copy), `icons.js` (animated line icons) and `domains/*.js` (the 3D domain journeys
  on the Products page).
- `site/domainsrc/` — sources for the campuses and ports journeys (`kit.js` + `*.body.js`).
- `site/img/` — images (AI-generated for INFRAX.AI, or cropped and masked company footage).
- `app/api/leads/` — the demo-request API: `lead.ts` sends each request through Microsoft Graph
  (a notification to `BOOK_DEMO_TO`, then an acknowledgement to the customer), `template.ts` holds both
  mails, `route.test.ts` tests it against a mock of Graph (`npm test`). Settings: `.env.example`.

## Working on it

```bash
python site/publish.py   # build every page and copy it into public/
npm install
npm run dev              # http://localhost:3000
```

Edit files in `site/`, never the copies in `public/`. `/` serves `home.html`, and `/products`,
`/how-it-works` etc. serve the matching page.

The Book a demo popup posts to `/api/leads`. If that fails (or on a preview host without the settings) it
says so and shows the address to email instead.