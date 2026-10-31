"""Build the INFRAX.AI multi-page site.

src/<page>.html holds only the page body (sections + page scripts). First line must be
<!--META title="..." page="..." libs="gsap,three"-->. The build wraps each page with the shared head,
nav, footer and scripts, and writes:
  out/<page>.html  full documents (published as extra files of the artifact)
  out/index.html   the home page without <html>/<head>/<body> (the artifact's main page)
usage: python build.py [page ...]   (default: every page in src/)
"""
import base64, json
import pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC, OUT = ROOT / "src", ROOT / "out"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400..800'
         '&family=Geist+Mono:wght@400..800&display=swap">')
LIBS = {
    "gsap": ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
             'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
             'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js'],
    "three": ['https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js'],
}
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'

PLATFORM = [
    ("how-it-works", "How it works", "From cameras to real-time actions",
     '<path d="M4 18h4v-4H4zM10 12h4V8h-4zM16 6h4V2h-4M8 16l2-2M14 10l2-2"/>'),
    ("analytics", "AI analytics", "What the cameras read and flag, live",
     '<path d="M3 20h18M6 16V9M11 16V5M16 16v-6M21 16v-3"/>'),
    ("deployment", "Deployment", "Installs on your own servers, works with the cameras you own",
     '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>'),
    ("integrations", "Integrations", "Cameras, radar, call boxes, signs and e-challan",
     '<path d="M9 7H6a3 3 0 0 0 0 6h3M15 7h3a3 3 0 0 1 0 6h-3M8 10h8"/>'),
]

# INFRAX.AI product map (from the team): slug, name, one line. Slugs are products.html#<slug> stations.
# Same order as the highway tunnel on the Products page, then the gate product
PRODUCTS = [
    ("vides", "InfraX AI VIDES", "Plate, speed and class at the gantry"),
    ("astraalert", "AstraAlert", "Every emergency call answered and located"),
    ("tollcloud", "TollCloud", "Toll lanes that keep running offline"),
    ("mlff", "MLFF", "Free-flow tolling gantry, no stopping"),
    ("cygnus", "Cygnus", "Video management with AI"),
    ("central-plexus", "Central Plexus (ATMS / ICCC)", "One live map, incidents, e-challan and signs"),
    ("ops", "InfraX AI Ops", "Field operations, workforce and assets, run by AI Beings"),
    ("access-parking", "Access and parking", "Entry and exit, plate reads"),
]
# each product's mark in the menu: the InfraX AI logo mark in its own colour, turned to its own angle
MARKS = {"vides": ("#2673B5", 0), "astraalert": ("#D6453D", 45), "tollcloud": ("#0E8A7E", 90), "mlff": ("#2E9E5B", 135),
         "cygnus": ("#4C5FD5", 180), "central-plexus": ("#0E3B66", 225), "ops": ("#C9861A", 270), "access-parking": ("#5A7A99", 315)}

def products_menu():
    items = "".join(
        f'<a href="products.html#{s}" data-nav="products"><i style="--pc:{MARKS[s][0]};--pr:{MARKS[s][1]}deg" aria-hidden="true"></i><b>{n}</b><span>{d}</span></a>'
        for s, n, d in PRODUCTS)
    return f'<div class="menu menu-products"><div class="pm-row">{items}</div><a class="pm-all" href="products.html">See every product in action &rarr;</a></div>'

def nav():
    items = "".join(
        f'<a href="{p}.html" data-nav="{p}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
        f'aria-hidden="true">{icon}</svg><b>{t}</b><span>{d}</span></a>' for p, t, d, icon in PLATFORM)
    sheet = "".join(f'<a href="{p}.html" data-nav="{p}">{t}<small>Platform</small></a>' for p, t, _, _ in PLATFORM)
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-nav"><div class="wrap">
  <a class="brand" href="home.html" aria-label="INFRAX.AI home"><img src="assets/logo.svg" alt="INFRAX.AI" width="110" height="32"></a>
  <ul class="nav-links">
    <li class="has-menu"><button type="button" aria-expanded="false" aria-haspopup="true" data-menu="products">Products <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></button>
      {products_menu()}</li>
    <li class="has-menu"><button type="button" aria-expanded="false" aria-haspopup="true" data-menu="platform">Platform <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></button>
      <div class="menu">{items}</div></li>
    <li><a href="services.html" data-nav="services">Services</a></li>
    <li><a href="home.html#company" data-nav="company">Company</a></li>
  </ul>
  <div class="nav-cta"><a class="btn btn-primary" href="home.html#demo" data-magnetic>Book a demo {ARROW}</a></div>
  <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navSheet"><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path class="nt-open" d="M3 6h14M3 10h14M3 14h14"/><path class="nt-close" d="M5 5l10 10M15 5L5 15"/></svg></button>
</div></header>
<nav class="sheet" id="navSheet" aria-label="Mobile">
  <a href="home.html" data-nav="home">Home<small>INFRAX.AI</small></a>
  <a href="products.html" data-nav="products">Products<small>Our products</small></a>
  {sheet}
  <a href="services.html" data-nav="services">Services<small>Integration &amp; delivery</small></a>
  <a href="home.html#company">Company<small>About</small></a>
  <a class="btn btn-primary" href="home.html#demo">Book a demo {ARROW}</a>
</nav>'''

FOOTER = '''<footer class="site-foot"><div class="wrap">
  <div class="foot-grid">
    <div class="foot-brand">
      <img src="assets/logo.svg" alt="INFRAX.AI" width="104" height="30">
      <p>InfraX AI builds control-room software and AI Beings for infrastructure: video, plates, call boxes and field work in one place. Built in India.</p>
      <address><a class="foot-addr" href="https://www.google.com/maps/search/?api=1&query=WeWork+DLF+Forum+Cyber+City+Gurugram+122002" target="_blank" rel="noopener">WeWork DLF Forum, Cyber City<br>Gurugram, Haryana 122002, India</a><span class="foot-contact"><span class="foot-h">Contact</span><a href="mailto:info@infrax.ai">info@infrax.ai</a></span><span class="foot-contact"><span class="foot-h">Social</span><span class="foot-social"><a href="https://www.linkedin.com/company/infrax-ai/" target="_blank" rel="noopener" aria-label="InfraX AI on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.937 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a><a href="https://www.youtube.com/@infraxai" target="_blank" rel="noopener" aria-label="InfraX AI on YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a><a href="https://github.com/InfraXAI" target="_blank" rel="noopener" aria-label="InfraX AI on GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a></span></span></address>
    </div>
    <div><p class="foot-h">Products</p><ul><li><a href="products.html#central-plexus">Central Plexus (ATMS / ICCC)</a></li><li><a href="products.html#cygnus">Cygnus</a></li><li><a href="products.html#vides">InfraX AI VIDES</a></li><li><a href="products.html#astraalert">AstraAlert</a></li><li><a href="products.html#tollcloud">TollCloud</a></li><li><a href="products.html#mlff">MLFF</a></li><li><a href="products.html#access-parking">Access and parking</a></li><li><a href="products.html#ops">InfraX AI Ops</a></li></ul></div>
    <div><p class="foot-h">Domains</p><ul><li><a href="products.html#d-highways">Highways</a></li><li><a href="products.html#d-cities">Cities</a></li><li><a href="products.html#d-campuses">Campuses</a></li><li><a href="products.html#d-ports">Ports</a></li><li><a href="products.html#d-warehouses">Warehouses</a></li><li><a href="products.html#d-construction">Construction</a></li></ul></div>
    <div><p class="foot-h">Platform</p><ul><li><a href="how-it-works.html">How it works</a></li><li><a href="analytics.html">AI analytics</a></li><li><a href="deployment.html">Deployment</a></li><li><a href="integrations.html">Integrations</a></li><li><a href="services.html">Services</a></li><li><a href="home.html#company">About</a></li><li><a href="home.html#demo">Book a demo</a></li></ul></div>
  </div>
  <div class="foot-base"><span>&copy; <span data-year>2026</span> NaturNest AI Private Limited</span><span>Made in Gurugram, India</span></div>
</div></footer>'''

DEMO_PRODUCTS = ["InfraX AI VIDES", "AstraAlert", "TollCloud", "MLFF", "Cygnus", "Central Plexus (ATMS / ICCC)", "InfraX AI Ops", "Access and parking"]
DEMO_DOMAINS = ["Highways", "Cities", "Campuses", "Ports", "Warehouses", "Construction", "System integrator"]
TICK = '<i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 5.2l2 2L8 3"/></svg></i>'

def demo_modal():
    """Shared 'Book a demo' dialog. Opened by site.js for any a[href$="#demo"]."""
    opts = "".join(f'<label><input type="checkbox" name="interest" value="{p}">{TICK}{p.replace("InfraX AI VIDES", "VIDES")}</label>'
                   for p in DEMO_PRODUCTS)
    doms = "".join(f"<option>{d}</option>" for d in DEMO_DOMAINS)
    return f'''<div class="dm" id="demoModal" hidden>
  <div class="dm-backdrop" data-dm-close></div>
  <div class="dm-dialog" role="dialog" aria-modal="true" aria-labelledby="dmTitle" tabindex="-1" data-lenis-prevent>
    <button class="dm-x" type="button" aria-label="Close" data-dm-close><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>
    <div class="dm-side">
      <canvas class="dm-net" aria-hidden="true"></canvas>
      <div class="dm-brand" aria-hidden="true"><img src="assets/logo.svg" alt="" width="84" height="24"><span>infrax.ai</span></div>
      <div class="dm-glass">
        <h2 class="h-2" id="dmTitle">See it on a site like yours.</h2>
        <p class="body dm-intro">Tell us what you run. We'll show the products that fit.</p>
      </div>
      <ol class="dm-steps">
        <li><i>1</i><span>A 30-minute call about your sites and cameras.</span></li>
        <li><i>2</i><span>A live walkthrough of the control room for your domain.</span></li>
        <li><i>3</i><span>A rollout plan for your sites and servers.</span></li>
      </ol>
    </div>
    <div class="dm-main">
      <form class="dm-form" id="dmForm" novalidate>
        <div class="dm-f"><label for="dmName">Name <span class="req" aria-hidden="true">*</span></label><input id="dmName" aria-describedby="dmNameErr" name="name" autocomplete="name" required><span class="err" id="dmNameErr" aria-live="polite"></span></div>
        <div class="dm-f"><label for="dmOrg">Organisation <small>(optional)</small></label><input id="dmOrg" aria-describedby="dmOrgErr" maxlength="200" name="org" autocomplete="organization"><span class="err" id="dmOrgErr" aria-live="polite"></span></div>
        <div class="dm-f"><label for="dmEmail">Email <span class="req" aria-hidden="true">*</span></label><input id="dmEmail" aria-describedby="dmEmailErr" name="email" type="email" autocomplete="email" required><span class="err" id="dmEmailErr" aria-live="polite"></span></div>
        <div class="dm-f"><label for="dmPhone">Mobile number <span class="req" aria-hidden="true">*</span></label><input id="dmPhone" aria-describedby="dmPhoneErr" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required><span class="err" id="dmPhoneErr" aria-live="polite"></span></div>
        <div class="dm-f full"><label for="dmDomain">Domain <span class="req" aria-hidden="true">*</span></label>
          <select id="dmDomain" aria-describedby="dmDomainErr" name="domain" required><option value="">Choose the closest match</option>{doms}</select><span class="err" id="dmDomainErr" aria-live="polite"></span></div>
        <fieldset class="dm-f full"><legend>Products of interest <small>(optional)</small></legend><div class="dm-opts">{opts}</div></fieldset>
        <div class="dm-hp" aria-hidden="true"><label for="dmWebsite">Website</label><input id="dmWebsite" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="dm-f full"><label for="dmMsg">About your sites <small>(optional)</small></label><textarea id="dmMsg" maxlength="1500" name="message" placeholder="e.g. a warehouse with two gates and existing IP cameras"></textarea></div>
        <div class="dm-submit"><button class="btn btn-primary" type="submit">Request a demo {ARROW}</button><p><span class="req" aria-hidden="true">*</span> Required. We use your details only to arrange the demo.</p></div>
        <p class="dm-senderr" id="dmSendErr" role="alert" tabindex="-1" hidden>We couldn't send your request. Please try again, or email <a href="mailto:bookdemo@infrax.ai">bookdemo@infrax.ai</a>.</p>
      </form>
      <div class="dm-ok" id="dmOk" hidden tabindex="-1">
        <div class="tick"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h3 class="h-2" id="dmOkH">Request received.</h3>
        <p class="body" id="dmOkText">Thank you. We'll reply within one working day to set up the demo.</p>
        <div class="dm-okrow"><button class="btn btn-primary" type="button" data-dm-close>Done</button></div>
      </div>
    </div>
  </div>
</div>'''

SITE = "https://infrax.ai"
ORG = '{"@context":"https://schema.org","@type":"Organization","name":"InfraX AI","legalName":"NaturNest AI Private Limited","url":"https://infrax.ai","logo":"https://infrax.ai/assets/logo.svg","email":"info@infrax.ai","address":{"@type":"PostalAddress","streetAddress":"WeWork DLF Forum, Cyber City","addressLocality":"Gurugram","addressRegion":"Haryana","postalCode":"122002","addressCountry":"IN"}}'
# clean public paths (next.config.ts rewrites them to the .html files); canonical tags point here
PATHS = {"home": "/", "products": "/products", "analytics": "/analytics", "how-it-works": "/how-it-works",
         "deployment": "/deployment", "integrations": "/integrations", "services": "/services"}
NAMES = {"products": "Products", "analytics": "AI analytics", "how-it-works": "How it works", "deployment": "Deployment",
         "integrations": "Integrations", "services": "Services"}

def ld(name):
    """JSON-LD: the organisation and website on Home, a breadcrumb on every other page"""
    if name == "home":
        web = {"@context": "https://schema.org", "@type": "WebSite", "name": "InfraX AI", "url": SITE + "/"}
        data = [json.loads(ORG), web]
    else:
        data = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": NAMES.get(name, name), "item": SITE + PATHS.get(name, "/" + name)}]}]
    return "".join(f'<script type="application/ld+json">{json.dumps(d, separators=(",", ":"))}</script>\n' for d in data)

def head(title, desc, name="home"):
    url, img = SITE + PATHS.get(name, "/" + name), SITE + "/img/real/wall-corridor.jpg"
    og = ('<meta property="og:type" content="website">\n<meta property="og:site_name" content="InfraX AI">\n<meta property="og:locale" content="en_IN">\n'
          f'<meta property="og:url" content="{url}">\n<meta property="og:title" content="{title}">\n<meta property="og:description" content="{desc}">\n'
          f'<meta property="og:image" content="{img}">\n<meta property="og:image:alt" content="A control-room video wall of highway camera feeds">\n'
          f'<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="{title}">\n'
          f'<meta name="twitter:description" content="{desc}">\n<meta name="twitter:image" content="{img}">\n')
    return (f'<title>{title}</title>\n'
            f'<meta name="description" content="{desc}">\n<link rel="canonical" href="{url}">\n<link rel="icon" href="assets/icon.svg" type="image/svg+xml">\n{og}{ld(name)}{FONTS}\n<link rel="stylesheet" href="assets/site.css">\n'
            # arriving from another page: start the bottom-to-top reveal at first paint, not after scripts load
            '<script>try{if(sessionStorage.getItem("infrax-wave")==="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)'
            'document.documentElement.classList.add("wave-in")}catch(e){}</script>\n')

# photos are served as WebP (generated next to each JPEG in img/); the social-share image in <head> stays JPEG
def webp(text):
    return re.sub(r"\.jpg(?=['\"`)\s])", ".webp", text)

# warm the CDN connections early; three.js loads only on pages whose META libs list it (home, how-it-works, products)
def hints(libs):
    return ('<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>\n'
            '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\n')

def scripts(libs):
    tags = [f'<script src="{u}"></script>' for lib in libs for u in LIBS.get(lib, [])]
    return "\n".join(tags) + '\n<script src="assets/site.js"></script>\n<script src="assets/icons.js"></script>\n'

def build(name):
    raw = (SRC / f"{name}.html").read_text(encoding="utf-8")
    m = re.match(r'<!--META (.*?)-->\s*', raw, re.S)
    assert m, f"{name}: first line must be <!--META ...-->"
    meta = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    body = raw[m.end():]
    # page scripts that need the shared runtime go after site.js: mark them with <!--PAGE-SCRIPTS--> split
    content, _, page_js = body.partition("<!--PAGE-SCRIPTS-->")
    libs = [x for x in meta.get("libs", "gsap").split(",") if x]
    inner = webp(f'{nav()}\n<main id="main" tabindex="-1">\n{content}\n</main>\n{FOOTER}\n{demo_modal()}\n{scripts(libs)}{page_js}')
    title, desc, page = meta["title"], meta.get("desc", ""), meta.get("page", name)
    full = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            f'{head(title, desc, name)}{hints(libs)}</head>\n<body data-page="{page}">\n{inner}</body></html>\n')
    # the hero intro samples the real logo: inline it as a data URI so a canvas can always read its pixels
    if "__LOGO_URI__" in full:
        svg = (OUT / "assets" / "logo.svg").read_bytes()
        uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode("ascii")
        full, inner = full.replace("__LOGO_URI__", uri), inner.replace("__LOGO_URI__", uri)
    (OUT / f"{name}.html").write_text(full, encoding="utf-8")
    if name == "home":
        main = (f'<meta name="claude:viewport-fit-sides" content="cover">\n{head(title, desc, name)}{hints(libs)}<script>document.documentElement.lang="en";document.body.setAttribute("data-page","home")</script>\n{inner}')
        (OUT / "index.html").write_text(main, encoding="utf-8")
    print(f"built {name} ({len(full)//1024} KB)")

(OUT / "assets").mkdir(parents=True, exist_ok=True)
for asset in ("site.css", "site.js", "icons.js", "icon.svg"):
    (OUT / "assets" / asset).write_text((ROOT / "assets" / asset).read_text(encoding="utf-8"), encoding="utf-8")
# the original INFRAX.AI logo, byte for byte (never redrawn)
(OUT / "assets" / "logo.svg").write_bytes((ROOT / "assets" / "logo.svg").read_bytes())
# domain journey modules (assets/domains/<slug>.js) are copied with their photos switched to WebP
(OUT / "assets" / "domains").mkdir(parents=True, exist_ok=True)
for mod in (ROOT / "assets" / "domains").glob("*.js") if (ROOT / "assets" / "domains").exists() else []:
    (OUT / "assets" / "domains" / mod.name).write_text(webp(mod.read_text(encoding="utf-8")), encoding="utf-8")

names = sys.argv[1:] or sorted(p.stem for p in SRC.glob("*.html"))
for n in names:
    build(n)
