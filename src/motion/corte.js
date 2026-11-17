// O corte: a carretilha passa quatro vezes pelo centro e a pizza se parte em 8 fatias que se afastam em ordem.
// Por marco, com duração fixa; o scroll só decide se a pizza está cortada ou inteira.
import { gsap } from 'gsap';
import { titleIn, titleOut, fadeIn, fadeOut } from './texts.js';

export function corte({ pz, reduced }) {
  const title = document.querySelector('.corte__title');
  const text = document.querySelector('.corte__text');
  const lines = [0, 1, 2, 3].map(() => ({ p: 0, o: 0 }));
  let open = false;
  let tl;

  function cut() {
    if (open) return;
    open = true;
    tl?.kill();
    titleIn(title, { delay: 0.35 });
    fadeIn(text, { delay: 0.55 });
    if (reduced) { gsap.set(pz.slices, { v: 1 }); return; }
    tl = gsap.timeline();
    // quatro passadas da carretilha, alternando o sentido, e só então as fatias se soltam
    lines.forEach((l, i) => {
      tl.set(l, { p: 0, o: 1 }, 0);
      tl.to(l, { p: 1, duration: 0.2, ease: 'power2.inOut' }, i * 0.11);
    });
    tl.to(pz.slices, { v: 1, duration: 1.05, ease: 'fm-out', stagger: { each: 0.04 } }, 0.52);
    tl.to(lines, { o: 0, duration: 0.3, ease: 'fm-in' }, 0.56);
  }

  /** fecha as fatias; devolve a duração para quem precisa esperar (a ida ao cardápio) */
  function join() {
    titleOut(title);
    fadeOut(text);
    if (!open && !pz.slices.some((s) => s.v > 0)) return 0;
    open = false;
    tl?.kill();
    if (reduced) { gsap.set(pz.slices, { v: 0 }); gsap.set(lines, { o: 0 }); return 0; }
    tl = gsap.timeline();
    tl.to(lines, { o: 0, duration: 0.15 }, 0);
    tl.to(pz.slices, { v: 0, duration: 0.5, ease: 'fm-io', stagger: { each: 0.018, from: 'end' } }, 0);
    return 0.5 + 7 * 0.018;
  }

  return { cut, join, lines, get open() { return open; } };
}
