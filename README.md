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
- `app/api/leads/route.ts` — saves demo requests to Notion (`NOTION_API_KEY`, `NOTION_DATABASE_ID`).

## Working on it

```bash
python site/publish.py   # build every page and copy it into public/
npm install
npm run dev              # http://localhost:3000
```

Edit files in `site/`, never the copies in `public/`. `/` serves `home.html`, and `/products`,
`/how-it-works` etc. serve the matching page.

The Book a demo popup posts to `/api/leads` on the live site. If that fails (or on a preview host) it says so
and shows the request to email to sales@infrax.ai.
