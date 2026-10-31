# InfraX AI site — Next.js port

Next.js 16.1.6 App Router + React 19.2.3, **JavaScript only** (`.js` / `.jsx`, no TypeScript).
The static site in `../infrax.ai/site/` is the source of truth; this app must look and behave identically.

```
npm install
npm run dev            # http://localhost:3000
npm run build && npm run start
NEXT_DIST_DIR=.next-products npm run build   # build into your own folder (parallel agents/CI don't clobber .next)
npx next start -p 3101                       # start uses the same NEXT_DIST_DIR, so set it there too
```

Demo form email: copy `.env.example` to `.env.local` and fill in the five Microsoft Graph settings (all required). Tests: `npm test` (mock Graph, no real mail).

## Layout

```
app/
  layout.jsx            shell: <head> (Google Fonts link, arrival-wave flag), body[data-page] flag, SiteNav, <main>, SiteFooter, DemoModal, SiteRuntime
  globals.css           site/assets/site.css verbatim (only change: mask url(icon.svg) -> url(/assets/icon.svg))
  page.jsx              /            (placeholder, TODO)
  services/page.jsx     /services    (DONE: the reference port)
  services/services.css the page's inline <style>, verbatim
  products|analytics|deployment|how-it-works|integrations/page.jsx   (placeholders, TODO)
  api/leads/route.js    demo form backend: lead.js sends two mails via Microsoft Graph, template.js = the mails, route.test.js = tests
components/
  site/                 SiteNav (client, active state from usePathname), SiteFooter, DemoModal, SiteRuntime,
                        PageRuntime (pages without a script), JsonLd, Arrow
  services/             ServicesHero, ServicesCards, ServicesPath (markup), ServicesScript (client, runs the page script)
lib/
  globals.js            npm gsap 3.12.5 / ScrollTrigger / lenis 1.1.13 -> window.gsap, window.ScrollTrigger, window.Lenis
  three-global.js       three 0.149.0 -> window.THREE (import only on 3D pages: home, how-it-works, products)
  site-runtime.js       site/assets/site.js, split into bootSite() (once) and enterPage(page) (every page mount)
  icons.js              site/assets/icons.js (window.INFRAX_ICONS, INFRAX.icons.render)
  use-page.js           usePage(page, init): the hook every page script component calls
  site-data.js          nav/menu/demo-form tables from build.py, route -> data-page map
  seo.js                pageMetadata(page): title/description/canonical/OG/Twitter from each META line
  pages/services.js     the Services inline <script>, as init()
public/
  img/                  photos (WebP + the OG JPEG), copied from ../infrax.ai/public/img
  assets/               logo.svg, icon.svg, domains/*.js (3D domain scenes loaded at runtime by Products)
next.config.js          permanent redirects /home.html -> /, /<page>.html -> /<page>; distDir from NEXT_DIST_DIR
```

## How the old build maps to this app

| static site (build.py) | here |
|---|---|
| head(): title/desc/OG/canonical | `export const metadata = pageMetadata('<page>')` in `app/<route>/page.jsx` |
| ld(): JSON-LD | `<JsonLd page="<page>" />` first thing in the page |
| nav(), FOOTER, demo_modal() | `components/site/*` (rendered by the layout) |
| `<body data-page>` | set before paint by the layout's inline script, and by `enterPage()` on client navigation |
| CDN `<script>`s | npm packages exposed as the same globals (`lib/globals.js`, `lib/three-global.js`) |
| site.js | `lib/site-runtime.js` |
| page `<style>` | `app/<route>/<page>.css`, imported by the page |
| page markup | `components/<page>/*.jsx` server components |
| page `<script>` after `<!--PAGE-SCRIPTS-->` | `lib/pages/<page>.js` `export function init()`, run by `components/<page>/<Page>Script.jsx` |
| `href="products.html#cygnus"` | `href="/products#cygnus"` (plain `<a>`, not next/link; the runtime does the transition) |
| `src="img/x.jpg"` | `src="/img/x.webp"` (build.py `webp()` turned every `.jpg` into `.webp`; do the same) |

## The pattern for a page agent (copy Services)

Example for `products` (replace names accordingly):

1. **CSS** — `app/products/products.css` = the page's inline `<style>`, verbatim; `import './products.css'` in the page.
   Class names unchanged. Page CSS is not unloaded on client-side navigation, so any rule in it that targets a
   *shared* selector (`body`, `.site-nav`, `.h-hero`, `.scene`, `main` ...) must be scoped:
   `body[data-page="products"] .h-hero {...}`. Page-prefixed classes (`.pr-…`) need nothing.
2. **Markup** — `components/products/<Section>.jsx`, one server component per `<section>` (or one per page if the
   sections are tightly coupled). Convert HTML -> JSX mechanically and keep **every** class, id, `data-*`, `aria-*`,
   inline style and inline SVG: `class`->`className`, `for`->`htmlFor`, `tabindex`->`tabIndex`, `stroke-width`->`strokeWidth`
   (all hyphenated SVG presentation attributes camelCase), `style="a:b"`->`style={{ a: 'b' }}` (keep `--vars` as
   `'--pc': '#123'`), void tags self-closed, `<!-- -->` -> `{/* */}`. Boolean attributes must be real booleans
   (`hidden`, `required`, `muted`, `playsInline`, `autoPlay` — **not** `hidden=""`, React drops empty strings).
   Bare `data-reveal` becomes `data-reveal=""`. Use plain `<img>` (keep `srcSet`/`sizes`/`loading`/`decoding`), not next/image.
   Paths: absolute (`/img/...`, `/assets/...`); internal links: `/`, `/products#x`, `/#demo` (opens the dialog).
   `tools/h2jsx.py` does most of this (`python tools/h2jsx.py body.html > body.jsx`); afterwards fix boolean
   attributes (it emits `hidden=""`), `.jpg`->`.webp`, and relative `src`s.
3. **Script** — `lib/pages/products.js`:
   ```js
   export function init() {
     /* the original IIFE body, unchanged */
     return function stop() { /* cancel rAF loops, disconnect observers, remove window/document listeners,
                                 dispose three.js renderers (renderer.dispose(); renderer.forceContextLoss()) */ };
   }
   ```
   Mark every edit with a `// PORT:` comment. Drop the `icons.js` loader snippet at the end of the old scripts
   (the runtime renders icons on every page). If the page uses three.js: `import { installThree } from '@/lib/three-global'`
   and call `installThree()` at the top of `init()`.
4. **Runner** — `components/products/ProductsScript.jsx`:
   ```jsx
   'use client';
   import { usePage } from '@/lib/use-page';
   import { init } from '@/lib/pages/products';
   export default function ProductsScript() { usePage('products', init); return null; }
   ```
5. **Page** — `app/products/page.jsx`:
   ```jsx
   import './products.css';
   import { pageMetadata } from '@/lib/seo';
   import JsonLd from '@/components/site/JsonLd';
   // ...section components...
   import ProductsScript from '@/components/products/ProductsScript';
   export const metadata = pageMetadata('products');
   export default function ProductsPage() {
     return (<><JsonLd page="products" />{/* sections in source order */}<ProductsScript /></>);
   }
   ```
   (The script component goes last. A page with no script uses `<PageRuntime page="..." />` instead.)
6. **Verify** against `http://localhost:8765/<page>.html` (the static original): screenshots at 1440x900 and 390x844,
   same document height, no console/page errors, no horizontal scroll at 320/390/1440/3840, and navigate away and
   back client-side (e.g. click a footer link, then the nav link back) — the page must re-initialise cleanly, with one
   plexus canvas in `body > canvas` and no doubled loops.

## What usePage / the runtime do for you

Order on every page mount (same order as the static site's scripts): `bootSite()` once (INFRAX helpers, plexus
background, nav, Lenis, demo dialog, transitions) -> `enterPage(page)` (body[data-page], `[data-reveal]` split reveals,
`[data-magnetic]`, `canvas[data-net]`, mailto -> Gmail compose, icons, `[data-plexus-off]` covers, section `data-off`
observer, scroll to top or `#anchor`, ScrollTrigger.refresh after load) -> your `init()` inside a `gsap.context`.

On unmount: your returned `stop()` -> `gsap.context.revert()` (kills every tween/ScrollTrigger **created synchronously in
init**) -> enterPage's cleanup. On the next page mount, ScrollTriggers and tweens whose elements left the DOM are killed
as a safety net. Anything else — rAF loops, `setInterval`, observers, `window`/`document` listeners, WebGL contexts,
tweens/ScrollTriggers created later inside callbacks — is yours to stop in `stop()`.

`window.INFRAX` (X) offers what site.js offered: `reduce`, `mq`, `lite`, `lowGPU`, `warmGL`, `isMobile`, `covered` +
the `infrax:cover` event, `pausePlexus`, `makeNet`, `anchorY`, `split`, `reveal`, `magnetic`, `lenis`, `demo.open/close`,
`icons.render`.

## Risks for page agents

- **No fresh page load.** Pages switch client-side: `window.load` and `DOMContentLoaded` have already fired when
  `init()` runs. Replace `addEventListener('load', fn)` with
  `document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true })`.
- Scripts that read `location.hash` on start still work (the URL is updated before the page mounts); `hashchange`
  listeners must be removed in `stop()`.
- Module state survives navigation: anything stored on `window` (`window.__foo`, caches, "already initialised" flags)
  persists. Don't let such a flag stop init the second time the page mounts.
- WebGL: browsers allow ~16 live contexts. Every three.js renderer must be disposed and its context lost in `stop()`,
  or Home -> Products -> Home will eventually blank a canvas. Keep `setPixelRatio(Math.min(devicePixelRatio, 2))` and
  `antialias: true` exactly as today — never lower quality.
- `assets/domains/*.js` are loaded by Products at runtime with `<script src>`; use `/assets/domains/<slug>.js` and don't
  inject the same script twice on re-mount (they define globals; check before appending).
- Home's hero samples the logo via `__LOGO_URI__` (build.py inlined `assets/logo.svg` as a base64 data URI there). Do the
  same (read `public/assets/logo.svg` at build time in the server component, or hardcode the data URI).
- `reactStrictMode` is off on purpose (dev's double effects would run the imperative scripts twice).
- If a page script genuinely cannot be torn down, add its route to `HARD_NAV` in `lib/site-runtime.js`: links to it then
  do a full document load with the wave, like the static site. Use only as a last resort.
- Don't edit `components/site/*`, `lib/site-runtime.js`, `app/layout.jsx` or `app/globals.css` from a page agent
  without coordinating — every page shares them.

## Status

| route | source | status |
|---|---|---|
| `/services` | site/src/services.html | **done** |
| `/` | site/src/home.html | done — gsap + three |
| `/products` | site/src/products.html | done — gsap + three, loads /assets/domains/*.js |
| `/how-it-works` | site/src/how-it-works.html | done — gsap + three |
| `/analytics` | site/src/analytics.html | done |
| `/deployment` | site/src/deployment.html | done |
| `/integrations` | site/src/integrations.html | done |

All page CSS is scoped as `:where(body[data-page="<page>"]) <selector>` (no added specificity), because page CSS stays loaded after client-side navigation and several pages share class prefixes (Home uses `.hw-*`, Integrations uses `hm-*`).
