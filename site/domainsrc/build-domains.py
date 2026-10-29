"""Concatenate kit.js + <slug>.body.js into self-contained site/assets/domains/<slug>.js (and out/ copy for testing)."""
import pathlib, sys
here = pathlib.Path(__file__).parent
site = here.parent  # domainsrc sits inside site
kit = (here / 'kit.js').read_text(encoding='utf-8')
for slug in sys.argv[1:] or ['campuses', 'ports']:
    body = (here / f'{slug}.body.js').read_text(encoding='utf-8')
    out = f"/* INFRAX.AI domain journey: {slug}. Self-contained module, loaded on demand by products.html. */\n(function () {{\n  'use strict';\n{kit}\n{body}\n}})();\n"
    for d in (site / 'assets' / 'domains', site / 'out' / 'assets' / 'domains'):
        d.mkdir(parents=True, exist_ok=True); (d / f'{slug}.js').write_text(out, encoding='utf-8')
    print('built', slug, len(out) // 1024, 'KB')
