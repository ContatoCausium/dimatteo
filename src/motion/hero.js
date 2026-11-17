// Os textos da hero: saem no primeiro toque de rolagem e voltam quando a página volta ao topo.
import { fadeIn, fadeOut } from './texts.js';

export function hero() {
  const els = [...document.querySelectorAll('.hero__left, .hero__right, .hero__cta')];
  let on = false;
  return {
    els,
    show(delay = 0) { if (on) return; on = true; fadeIn(els, { delay, each: 0.08, y: 18, dur: 1 }); },
    hide() { if (!on) return; on = false; fadeOut(els); },
  };
}
