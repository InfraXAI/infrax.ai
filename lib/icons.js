// Port of site/assets/icons.js. The original IIFE body is unchanged inside bootIcons(), which the site runtime
// calls once on the client. It defines window.INFRAX_ICONS and INFRAX.icons.render(root); the runtime calls
// INFRAX.icons.render() again after every page mounts, so page scripts don't need to load or render it.
/* INFRAX.AI animated LINE icons (style A, chosen by the client).
   Usage: <span class="ix" data-ix="camera" aria-hidden="true"></span>  (optional data-size="32", default 24).
   Rendered on DOMContentLoaded; call INFRAX.icons.render(root) after inserting new markup.
   Each icon draws its strokes in when it scrolls into view, then plays a quiet idle loop that says what it does.
   Hover/focus on the icon or its nearest link/button/card replays it. Reduced motion: static and fully drawn.
   Classes inside the SVGs (lens, ring, boom, …) are scoped under .ix in site.css. */
export function bootIcons() {
  if (window.INFRAX_ICONS) return;
  var I = window.INFRAX_ICONS = {
    camera: '<rect x="2.5" y="7" width="13" height="10" rx="2"/><path d="M15.5 10.2 21 7.5v9l-5.5-2.7z"/><circle class="lens" cx="9.5" cy="12" r="2.4"/><circle class="rec red" cx="5.4" cy="9.4" r="1"/>',
    ptz: '<path d="M8 3h8M12 3v3"/><g class="pan"><rect x="5.5" y="6" width="13" height="7.5" rx="3.75"/><circle cx="15" cy="9.75" r="1.7"/><circle class="rec red" cx="8.4" cy="9.75" r=".9"/></g><path d="M7 20.5h10M9.5 20.5l1.2-5h2.6l1.2 5"/>',
    gantry: '<path d="M3.5 21V6M20.5 21V6M3.5 6h17M3.5 9h17"/><rect x="10" y="9" width="4" height="3.5" rx=".6"/><g class="sweep"><path d="M12 12.5 8.6 19.5M12 12.5l3.4 7"/><path d="M9.6 17.5a4 4 0 0 0 4.8 0" opacity=".7"/></g>',
    callbox: '<rect x="7" y="3.5" width="8" height="17.5" rx="1.6"/><path d="M9.2 7.5h3.6M9.2 9.6h3.6"/><circle cx="11" cy="14.2" r="1.7"/><path d="M5 21h12"/><path class="ring" d="M17.6 7.6a3.2 3.2 0 0 1 0 4.4"/><path class="ring r2" d="M19.6 5.8a5.8 5.8 0 0 1 0 8"/>',
    toll: '<rect x="2.5" y="8.5" width="5.5" height="12.5" rx=".8"/><path d="M1.8 8.5h7M4 12h2.5"/><rect x="9.8" y="14" width="2.4" height="7" rx=".5"/><g class="boom"><path d="M11 15h11" stroke-width="2.2"/></g>',
    gate: '<path d="M3 21V7.5M21 21V7.5M2 7.5h2M20 7.5h2"/><g class="slide"><rect x="4.5" y="10" width="9" height="9.5" rx=".8"/><path d="M7.5 10v9.5M10.5 10v9.5"/></g><path d="M14.5 21h6"/>',
    wall: '<rect x="2.5" y="3.5" width="19" height="15" rx="1.6"/><g><rect class="tf dot" x="4.5" y="5.5" width="4.4" height="3.2" rx=".4" style="animation-delay:0s"/><rect class="tf dot" x="9.8" y="5.5" width="4.4" height="3.2" rx=".4" style="animation-delay:.2s"/><rect class="tf dot" x="15.1" y="5.5" width="4.4" height="3.2" rx=".4" style="animation-delay:.4s"/><rect class="tf dot" x="4.5" y="9.4" width="4.4" height="3.2" rx=".4" style="animation-delay:.6s"/><rect class="tf dot" x="9.8" y="9.4" width="4.4" height="3.2" rx=".4" style="animation-delay:.8s"/><rect class="tf dot" x="15.1" y="9.4" width="4.4" height="3.2" rx=".4" style="animation-delay:1s"/><rect class="tf dot" x="4.5" y="13.3" width="4.4" height="3.2" rx=".4" style="animation-delay:1.2s"/><rect class="tf dot" x="9.8" y="13.3" width="4.4" height="3.2" rx=".4" style="animation-delay:1.4s"/><rect class="tf dot" x="15.1" y="13.3" width="4.4" height="3.2" rx=".4" style="animation-delay:1.6s"/></g><path d="M9 21h6M12 18.5V21"/>',
    map: '<path d="M2.5 7 8.5 4l7 3 6-3v13l-6 3-7-3-6 3z"/><path d="M8.5 4v13M15.5 7v13" opacity=".5"/><ellipse class="shadow dot" cx="15" cy="19" rx="2" ry=".7" opacity=".5"/><g class="drop"><path d="M15 6.2a3.2 3.2 0 0 0-3.2 3.2c0 2.4 3.2 5.6 3.2 5.6s3.2-3.2 3.2-5.6A3.2 3.2 0 0 0 15 6.2z"/><circle cx="15" cy="9.4" r="1.1"/></g>',
    alert: '<circle class="aring" cx="12" cy="13" r="9" opacity=".6"/><path d="M12 3.5 21 19.5H3z"/><path d="M12 9.5v4.5"/><circle class="dot" cx="12" cy="16.8" r=".9"/>',
    clip: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M2.5 8h19" opacity=".55"/><path d="M6 4.5 7.5 8M10 4.5 11.5 8M14 4.5 15.5 8M18 4.5 19.5 8" opacity=".55"/><path class="play dot" d="M10.5 10.6v4.8l4.2-2.4z"/><path class="prog" d="M5 17.5h14"/>',
    plate: '<rect x="2" y="8" width="20" height="8" rx="1.6"/><path d="M4.4 8v8" opacity=".5"/><rect class="ch dot" x="6" y="10.4" width="2" height="3.2" rx=".3" style="animation-delay:0s"/><rect class="ch dot" x="9.2" y="10.4" width="2" height="3.2" rx=".3" style="animation-delay:.25s"/><rect class="ch dot" x="12.4" y="10.4" width="2" height="3.2" rx=".3" style="animation-delay:.5s"/><rect class="ch dot" x="15.6" y="10.4" width="2" height="3.2" rx=".3" style="animation-delay:.75s"/><path class="scan" d="M3 5.5v13" opacity=".55"/>',
    speed: '<path d="M3.5 16.5a8.5 8.5 0 0 1 17 0z"/><path d="M5.6 11.2l1.2.8M12 7.8V9.3M18.4 11.2l-1.2.8"/><path class="needle" d="M12 16V9.6" stroke-width="2"/><circle class="dot" cx="12" cy="16" r="1.4"/><path d="M3.5 19.5h17"/>',
    server: '<rect x="3.5" y="3.5" width="17" height="7.5" rx="1.4"/><rect x="3.5" y="13" width="17" height="7.5" rx="1.4"/><circle class="led dot" cx="7" cy="7.25" r="1" style="animation-delay:0s"/><circle class="led dot" cx="7" cy="16.75" r="1" style="animation-delay:.55s"/><path d="M11 7.25h6.5M11 16.75h6.5"/>',
    edge: '<path d="M6 4.5v3M9 4.5v3M12 4.5v3M15 4.5v3M18 4.5v3"/><rect x="3" y="7.5" width="18" height="11" rx="2"/><rect class="bar dot" x="6" y="11" width="2" height="5" rx=".4" style="animation-delay:0s"/><rect class="bar dot" x="9.5" y="11" width="2" height="5" rx=".4" style="animation-delay:.2s"/><rect class="bar dot" x="13" y="11" width="2" height="5" rx=".4" style="animation-delay:.4s"/><circle class="led dot" cx="18" cy="12" r=".9"/>',
    api: '<rect x="2" y="8.5" width="6.5" height="7" rx="1.5"/><rect x="15.5" y="8.5" width="6.5" height="7" rx="1.5"/><path d="M8.5 12h7" stroke-dasharray="1.6 2"/><circle class="packet dot" cx="9.5" cy="12" r="1.3"/><path d="M5.25 8.5V6M18.75 8.5V6M5.25 15.5V18M18.75 15.5V18" opacity=".55"/>',
    operator: '<circle cx="12" cy="9" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/><path d="M7.4 9a4.6 4.6 0 0 1 9.2 0"/><rect x="6.3" y="8.4" width="1.8" height="3" rx=".7"/><rect x="15.9" y="8.4" width="1.8" height="3" rx=".7"/><path d="M16.8 11.4v.8a1.8 1.8 0 0 1-1.8 1.8h-1.4"/><circle class="talk" cx="15" cy="13" r="2" opacity=".7"/>',
    /* new in the site library */
    check: '<circle cx="12" cy="12" r="9"/><path class="tick" d="M7.8 12.3l2.9 2.9 5.5-5.7"/>',
    lock: '<g class="shackle"><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></g><rect x="5" y="10.5" width="14" height="10" rx="2"/><circle cx="12" cy="15" r="1.4"/><path d="M12 16.4v1.8"/>',
    signboard: '<path d="M5 21V12.5M19 21V12.5"/><rect x="2.5" y="4.5" width="19" height="8" rx="1.2"/><circle class="led dot" cx="6.5" cy="8.5" r=".8" style="animation-delay:0s"/><circle class="led dot" cx="9.2" cy="8.5" r=".8" style="animation-delay:.15s"/><circle class="led dot" cx="11.9" cy="8.5" r=".8" style="animation-delay:.3s"/><circle class="led dot" cx="14.6" cy="8.5" r=".8" style="animation-delay:.45s"/><circle class="led dot" cx="17.3" cy="8.5" r=".8" style="animation-delay:.6s"/>',
    truck: '<g class="roll"><rect x="2" y="6.5" width="11.5" height="9" rx="1"/><path d="M13.5 9.5h4.2l3.3 3.5v2.5h-7.5z"/><path d="M15.2 10.8h2l1.6 1.8h-3.6z" opacity=".6"/><circle cx="6" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></g><path class="road" d="M1.5 20.5h21" stroke-dasharray="3 2.2"/>',
    crane: '<path d="M6 21V5M9 21V5M6 8l3 3M9 8l-3 3M6 13l3 3M9 13l-3 3M3.5 21h8"/><path d="M4 5h17.5M7.5 5V2.5L4 5M7.5 2.5 21.5 5"/><rect x="2" y="5" width="2.5" height="2.2" rx=".3"/><g class="hoist"><path d="M17 5v6.5"/><path d="M15.6 11.5h2.8v2.2h-2.8z"/></g>',
    people: '<circle cx="8.5" cy="7.5" r="3"/><path d="M3 20a5.5 5.5 0 0 1 11 0"/><g class="nod"><circle cx="16.5" cy="8.5" r="2.5"/><path d="M14.6 13.5A4.6 4.6 0 0 1 21 17.8V20"/></g>'
  };

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ix-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;

  function build(span) {
    var name = span.getAttribute('data-ix'), markup = I[name];
    if (!markup || span.getAttribute('data-ix-done')) return;
    var size = parseFloat(span.getAttribute('data-size')) || 24;
    span.setAttribute('data-ix-done', '1');
    if (!span.hasAttribute('aria-hidden') && !span.hasAttribute('aria-label')) span.setAttribute('aria-hidden', 'true');
    // sized on the site-wide scale (--s) so icons grow with the rest of the composition
    span.style.width = span.style.height = 'calc(' + size + '*var(--s,1px))';
    // keep the stroke at ~1.6px on screen whatever the size
    var sw = (1.6 * 24 / size).toFixed(3);
    span.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" focusable="false" style="width:100%;height:100%;stroke-width:' + sw + '">' + markup + '</svg>';
    span.querySelectorAll('path,rect,circle,ellipse,line').forEach(function (el, i) {
      if (el.classList.contains('dot') || el.classList.contains('red') || el.hasAttribute('stroke-dasharray')) return;
      if (el.classList.contains('prog') || el.classList.contains('scan') || el.classList.contains('road')) return;
      el.setAttribute('pathLength', '1');
      el.classList.add('ixs');
      el.style.setProperty('--ixd', (i * 0.05) + 's');
    });
    if (reduce || !io) span.classList.add('ix-in', 'ix-still'); else io.observe(span);
  }
  function replay(span) {
    if (reduce || !span.classList.contains('ix-in')) return;
    span.classList.remove('ix-in'); void span.getBoundingClientRect(); span.classList.add('ix-in');
  }
  function render(root) { (root || document).querySelectorAll('.ix[data-ix]').forEach(build); }

  // replay when the icon itself, or the link/button/card it sits in, is hovered or focused
  function host(t) { return t && t.closest && t.closest('a,button,[tabindex],.card,[class*="card"],[class*="tile"]'); }
  function onEnter(e) {
    var h = host(e.target) || e.target; if (!h || !h.querySelectorAll) return;
    if (e.type === 'mouseover' && h.contains(e.relatedTarget)) return;
    var list = h.classList && h.classList.contains('ix') ? [h] : h.querySelectorAll('.ix.ix-in');
    [].forEach.call(list, replay);
  }
  document.addEventListener('mouseover', onEnter);
  document.addEventListener('focusin', onEnter);

  window.INFRAX = window.INFRAX || {};
  window.INFRAX.icons = { render: render, list: Object.keys(I) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { render(); });
  else render();
}
