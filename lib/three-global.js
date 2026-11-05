// three.js as the global the 3D page scripts expect (window.THREE, r149 = the CDN build the static site used).
// Only pages with 3D import this module (home, how-it-works, products), so other routes don't ship three.js.
// A copy of the module namespace is used because ES namespaces are frozen and some scripts attach helpers to THREE.
import * as THREE_NS from 'three';

export function installThree() {
  if (typeof window === 'undefined') return;
  if (!window.THREE) window.THREE = Object.assign({}, THREE_NS);
  return window.THREE;
}
