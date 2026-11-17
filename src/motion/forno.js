// Forno: "90 segundos a 450 °C." O 90 conta junto quando o título entra.
import { gsap } from 'gsap';
import { titleIn, titleOut, fadeIn, fadeOut } from './texts.js';

export function forno({ reduced }) {
  const title = document.querySelector('.forno__title');
  const text = document.querySelector('.forno__text');
  const num = document.querySelector('.forno__num');
  const c = { v: 90 };
  let on = false;
  return {
    show() {
      if (on) return;
      on = true;
      titleIn(title, { delay: 0.1 });
      fadeIn(text, { delay: 0.35 });
      if (reduced || !num) return;
      gsap.fromTo(c, { v: 0 }, {
        v: 90, duration: 1.6, ease: 'power2.out', delay: 0.15, overwrite: true,
        onUpdate: () => { num.textContent = String(Math.round(c.v)).padStart(2, '0'); },
      });
    },
    hide() {
      if (!on) return;
      on = false;
      titleOut(title);
      fadeOut(text);
    },
  };
}
