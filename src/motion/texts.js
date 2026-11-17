// Texto entra e sai por tempo, nunca preso ao scroll. Títulos sobem por máscara de linha (com folga para acento e
// descendente) e saem no lugar, sem atravessar a máscara; textos curtos sobem um pouco e aparecem.
// Cada elemento guarda o próprio tween: o killTweensOf do GSAP não cancela um tween escalonado que ainda está no
// atraso, e com rolagem rápida o texto antigo voltava depois de ter saído.
import { gsap } from 'gsap';

const live = new WeakMap();
const list = (els) => (Array.isArray(els) ? els : [els]);
function stop(els) {
  const done = new Set();
  for (const e of list(els)) {
    const t = live.get(e);
    if (t && !done.has(t)) { done.add(t); t.kill(); }
    live.delete(e);
  }
}
function keep(els, t) { for (const e of list(els)) live.set(e, t); return t; }

/** quebra o título nas linhas do <br> e embrulha cada uma numa máscara */
export function lines(el) {
  if (el._lines) return el._lines;
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map((h) => `<span class="ln"><span class="ln__in">${h}</span></span>`).join('');
  el._lines = [...el.querySelectorAll('.ln__in')];
  return el._lines;
}

let reduced = false;
export const setReduced = (v) => { reduced = v; };

/** rolagem correndo (o palco liga e desliga): as saídas encurtam para o texto da cena anterior não sobrar na próxima */
export const pace = { rush: false };
const outDur = (d) => (pace.rush ? 0.12 : d);

export function titleIn(el, { delay = 0, each = 0.08 } = {}) {
  const ls = lines(el);
  stop([el, ...ls]);
  gsap.set(el, { autoAlpha: 1, y: 0 });
  if (reduced) { gsap.set(ls, { yPercent: 0 }); return null; }
  return keep([el, ...ls], gsap.fromTo(ls, { yPercent: 118 }, { yPercent: 0, duration: 1.05, ease: 'fm-out', stagger: each, delay }));
}

export function titleOut(el) {
  const ls = lines(el);
  stop([el, ...ls]);
  if (reduced) { gsap.set(el, { autoAlpha: 0 }); return null; }
  return keep([el, ...ls], gsap.to(el, { autoAlpha: 0, y: -12, duration: outDur(0.4), ease: 'fm-in', onComplete: () => gsap.set(ls, { yPercent: 118 }) }));
}

export function fadeIn(els, { delay = 0, each = 0.07, y = 16, dur = 0.9 } = {}) {
  stop(els);
  if (reduced) { gsap.set(els, { autoAlpha: 1, y: 0 }); return null; }
  return keep(els, gsap.fromTo(els, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: dur, ease: 'fm-out', stagger: each, delay }));
}

export function fadeOut(els, { dur = 0.38 } = {}) {
  stop(els);
  if (reduced) { gsap.set(els, { autoAlpha: 0 }); return null; }
  return keep(els, gsap.to(els, { autoAlpha: 0, y: -10, duration: outDur(dur), ease: 'fm-in' }));
}
