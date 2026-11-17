// Massa: "48 h" cresce como massa por cima da macro da borda; o painel de vidro fosco sobe no canto.
import { rise, fall } from './words.js';
import { fadeIn, fadeOut } from './texts.js';

export function massa({ words, reduced }) {
  const cap = document.querySelector('.massa__cap');
  const glass = document.querySelector('.massa__glass');
  let on = false;
  let t0 = 0;
  return {
    show() {
      if (on) return;
      on = true;
      t0 = performance.now();
      rise(words.massa, { from: 0.2, dur: 1.05, each: 0.06, reduced });
      fadeIn(cap, { delay: 0.35 });
      fadeIn(glass, { delay: 0.5, y: 28, dur: 1.1 });
    },
    hide() {
      if (!on) return;
      on = false;
      // passou rápido (a palavra nem assentou): sai num instante, para não cair por cima da caixa
      fall(words.massa, { reduced, dur: performance.now() - t0 < 900 ? 0.14 : 0.38 });
      fadeOut([cap, glass]);
    },
  };
}
