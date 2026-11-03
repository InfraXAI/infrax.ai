"""Tiny HTML -> JSX converter for the static site's markup (attributes, void tags, links). Not general purpose."""
import re, sys
ATTR = {'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray', 'fill-opacity': 'fillOpacity', 'stroke-opacity': 'strokeOpacity',
        'font-family': 'fontFamily', 'font-size': 'fontSize', 'font-weight': 'fontWeight', 'text-anchor': 'textAnchor', 'viewbox': 'viewBox',
        'maxlength': 'maxLength', 'autocomplete': 'autoComplete', 'inputmode': 'inputMode', 'srcset': 'srcSet', 'crossorigin': 'crossOrigin',
        'readonly': 'readOnly', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'novalidate': 'noValidate', 'stop-color': 'stopColor',
        'stop-opacity': 'stopOpacity', 'clip-path': 'clipPath', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'dominant-baseline': 'dominantBaseline',
        'letter-spacing': 'letterSpacing', 'stroke-dashoffset': 'strokeDashoffset', 'stroke-miterlimit': 'strokeMiterlimit', 'paint-order': 'paintOrder',
        'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', 'fetchpriority': 'fetchPriority', 'playsinline': 'playsInline', 'autoplay': 'autoPlay',
        'enterkeyhint': 'enterKeyHint', 'spellcheck': 'spellCheck', 'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
        'text-rendering': 'textRendering', 'gradientunits': 'gradientUnits', 'preserveaspectratio': 'preserveAspectRatio', 'marker-end': 'markerEnd'}
VOID = ('img', 'br', 'input', 'hr', 'source', 'meta', 'link', 'wbr')
def link(h):
    h = re.sub(r'^home\.html', '/', h)
    h = re.sub(r'^([a-z0-9-]+)\.html', r'/\1', h)
    return h.replace('//#', '/#')
def style(s):
    out = []
    for decl in [d for d in s.split(';') if d.strip()]:
        k, v = decl.split(':', 1); k = k.strip(); v = v.strip()
        if not k.startswith('--'): k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        out.append(f"'{k}': '{v}'")
    return '{{ ' + ', '.join(out) + ' }}'
def tag(m):
    t = m.group(0)
    if t.startswith('</') or t.startswith('<!'): return t
    name = re.match(r'<([a-zA-Z0-9:-]+)', t).group(1)
    body = t[len(name) + 1:].rstrip('>').rstrip('/')
    attrs = re.findall(r'''([^\s=/]+)(?:\s*=\s*("[^"]*"|'[^']*'))?''', body)
    parts = []
    for k, v in attrs:
        kl = k.lower(); nk = ATTR.get(kl, k)
        if v == '': v = '""'
        val = v[1:-1]
        if kl == 'style': parts.append(f'style={style(val)}'); continue
        if kl == 'href': val = link(val)
        parts.append(f'{nk}="{val}"')
    s = '<' + name + (' ' + ' '.join(parts) if parts else '')
    return s + (' />' if name.lower() in VOID or t.endswith('/>') else '>')
sys.stdout.reconfigure(encoding="utf-8")
src = open(sys.argv[1], encoding='utf-8').read()
src = re.sub(r'<!--(.*?)-->', lambda m: '{/*' + m.group(1) + '*/}', src, flags=re.S)
src = re.sub(r'<[^<>]+>', tag, src)
sys.stdout.write(src)
