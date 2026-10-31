// The hero intro decision, from the inline <script> at the top of the hero in site/src/home.html.
// The intro plays on the first visit in a tab and on a reload; coming back to Home (link, back button) shows the finished hero.
//
// HX_PRE is that script verbatim; HomeHero renders it inside the section, so on a full document load it runs while the HTML
// is parsed, before first paint (sessionStorage 'hx-seen', html.nav-wait, window.INFRAX_HX_SKIP / INFRAX_NAV_IN), exactly
// like the static page. PORT: it also records its section in window.INFRAX_HX_DOC.
// React never executes a <script> it inserts on client-side navigation, so preIntro() (run by HomeScript in a layout
// effect, i.e. before that paint too) makes the same decision for a hero the inline script did not see. A client-side
// arrival is never a reload, so it skips the intro whenever Home was already seen in this tab.
export const HX_PRE = 'try{window.INFRAX_HX_DOC=document.currentScript.parentNode}catch(e){}\n' + "  try{var nv=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0],seen=false;try{seen=sessionStorage.getItem('hx-seen')==='1';sessionStorage.setItem('hx-seen','1')}catch(e){}\n    window.INFRAX_HX_SKIP=seen&&!(nv&&nv.type==='reload')}catch(e){}\n  try{if(!window.INFRAX_HX_SKIP&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.currentScript.parentNode.classList.add('hx-intro');\n    var de=document.documentElement,show=function(){de.classList.remove('nav-wait');removeEventListener('scroll',onS)},onS=function(){if(scrollY>8)show()};\n    de.classList.add('nav-wait');addEventListener('scroll',onS,{passive:true});setTimeout(show,9000);var sn=document.querySelector('.site-nav');if(sn)sn.addEventListener('focusin',show);window.INFRAX_NAV_IN=show}}catch(e){}";

export function preIntro() {
  var hero = document.querySelector('.hm-hero');
  if (!hero || window.INFRAX_HX_DOC === hero) return; // the inline script already ran for this hero
  window.INFRAX_HX_DOC = hero;
  try { var seen = false; try { seen = sessionStorage.getItem('hx-seen') === '1'; sessionStorage.setItem('hx-seen', '1'); } catch (e) {}
    window.INFRAX_HX_SKIP = seen; } catch (e) {}
  try {
    if (!window.INFRAX_HX_SKIP && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.classList.add('hx-intro');
      var de = document.documentElement, sn = document.querySelector('.site-nav'), tm = 0;
      // PORT: show() also drops its timer and the focusin listener, since .site-nav outlives this page on client-side navigation
      var show = function () { de.classList.remove('nav-wait'); removeEventListener('scroll', onS); clearTimeout(tm); if (sn) sn.removeEventListener('focusin', show); };
      var onS = function () { if (scrollY > 8) show(); };
      de.classList.add('nav-wait'); addEventListener('scroll', onS, { passive: true }); tm = setTimeout(show, 9000);
      if (sn) sn.addEventListener('focusin', show);
      window.INFRAX_NAV_IN = show;
    }
  } catch (e) {}
}
