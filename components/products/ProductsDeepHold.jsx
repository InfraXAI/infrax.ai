// The <head> snippet of site/src/products.html, run before the first paint on a full page load: a deep link
// (/products#cygnus, #d-ports ...) hides <main> until the tunnel script has jumped to the station, so the intro never
// flashes. After a client-side navigation React does not run inline scripts; lib/pages/products.js init() does the
// same thing first. The script is unchanged.
const HOLD = `(function () {
  var h = location.hash.slice(1);
  if (!/^(vides|astraalert|tollcloud|cygnus|central-plexus|atms|command|ops|access-parking|d-(highways|cities|campuses|ports|warehouses|construction))$/.test(h)) return;
  var s = document.createElement('style'); s.id = 'cyDeepCss';
  s.textContent = 'html.cy-deep #main{visibility:hidden}';
  document.head.appendChild(s); document.documentElement.classList.add('cy-deep');
  // safety net: never keep the page hidden if the tunnel script fails
  setTimeout(function () { document.documentElement.classList.remove('cy-deep'); }, 2500);
})();`;

export default function ProductsDeepHold() {
  return <script dangerouslySetInnerHTML={{ __html: HOLD }} />;
}
