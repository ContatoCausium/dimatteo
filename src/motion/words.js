// As palavras gigantes (Fermento, os sabores, 48 h): letra a letra, para crescer como massa a partir da linha de base.
// As letras viram blocos separados, então o kerning do par some; ele volta como margem medida no canvas.
import { gsap } from 'gsap';
import { pace } from './texts.js';

const ctx = document.createElement('canvas').getContext('2d');

/** quebra o texto em letras e guarda a fonte para medir; o texto inteiro fica para leitor de tela */
export function word(el, { family, weight = 700, style = 'normal', tracking = 0 }) {
  const inner = el.firstElementChild || el;
  const text = inner.textContent.trim();
  inner.textContent = '';
  inner.setAttribute('aria-hidden', 'true');
  const chars = [...text];
  const spans = chars.map((c) => {
    const s = document.createElement('span');
    s.className = c === ' ' ? 'ch ch--sp' : 'ch';
    s.textContent = c;
    inner.append(s);
    return s;
  });
  if (!el.hasAttribute('aria-hidden')) {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.append(sr);
  }
  const w = { el, inner, text, chars, spans, family, weight, style, tracking, fs: 100 };
  measure(w);
  return w;
}

/** mede a 100 px: avanço de cada letra, kerning do par, contorno da tinta e altura de versal */
export function measure(w) {
  ctx.font = `${w.style} ${w.weight} 100px ${w.family}`;
  const adv = w.chars.map((c) => ctx.measureText(c).width);
  const kern = w.chars.map((c, i) => {
    const n = w.chars[i + 1];
    // o espaço da Clash Display é estreito: "Di Matteo" lia "DiMatteo". Ganha 14% do corpo de folga.
    return (n ? ctx.measureText(c + n).width - adv[i] - adv[i + 1] : 0) + (c === ' ' ? 14 : 0);
  });
  const first = ctx.measureText(w.chars[0]);
  const last = ctx.measureText(w.chars.at(-1));
  const tr = w.tracking * 100;
  let x = 0;
  for (let i = 0; i < w.chars.length - 1; i++) x += adv[i] + kern[i] + tr;
  const all = ctx.measureText(w.text);
  w.m = {
    left: first.actualBoundingBoxLeft, // a tinta começa este tanto à esquerda da origem (negativo: à direita)
    ink: first.actualBoundingBoxLeft + x + last.actualBoundingBoxRight,
    cap: ctx.measureText('H').actualBoundingBoxAscent,
    asc: all.fontBoundingBoxAscent,
    desc: all.fontBoundingBoxDescent,
    top: all.actualBoundingBoxAscent, // topo da tinta acima da base
  };
  w.spans.forEach((s, i) => { s.style.marginRight = `${(kern[i] + (i < w.spans.length - 1 ? tr : 0)) / 100}em`; });
  return w;
}

/**
 * Põe a palavra no palco: corpo `fs`, tinta começando em `x` e a linha de base em `base` (px do palco).
 * Devolve a geometria em px: { fs, x0, x1, cap, base, capTop }.
 */
export function place(w, { fs, x, base }) {
  const k = fs / 100;
  const box = fs; // line-height: 1
  const baseInBox = (box - (w.m.asc + w.m.desc) * k) / 2 + w.m.asc * k;
  w.fs = fs;
  Object.assign(w.el.style, {
    fontSize: `${fs}px`,
    left: `${x + w.m.left * k}px`,
    top: `${base - baseInBox}px`,
  });
  w.el.style.setProperty('--base', `${baseInBox}px`);
  return { fs, x0: x, x1: x + w.m.ink * k, cap: w.m.cap * k, base, capTop: base - w.m.cap * k, inkTop: base - w.m.top * k };
}

/** corpo para a tinta ocupar `width` px */
export const fitSize = (w, width) => (100 * width) / w.m.ink;

/** cresce como massa: cada letra sobe de `from` até 100% a partir da base, com o assentamento elástico.
 *  O tween fica na palavra e é morto à mão (o GSAP não cancela tween escalonado que ainda está no atraso). */
export function rise(w, { from = 0.6, dur = 0.95, each = 0.045, delay = 0, reduced = false } = {}) {
  w.tw?.kill();
  gsap.set(w.el, { visibility: 'visible' });
  if (reduced) { gsap.set(w.spans, { scaleY: 1, scaleX: 1, opacity: 1 }); w.tw = null; return null; }
  w.tw = gsap.fromTo(w.spans,
    { scaleY: from, scaleX: 1 + (1 - from) * 0.25, opacity: 1 },
    { scaleY: 1, scaleX: 1, duration: dur, ease: 'fm-rise', delay, stagger: { each, from: 'random' } });
  return w.tw;
}

/** murcha: as letras afundam na linha de base */
export function fall(w, { dur = 0.38, reduced = false } = {}) {
  w.tw?.kill();
  const hide = () => gsap.set(w.el, { visibility: 'hidden' });
  if (reduced) { gsap.set(w.spans, { scaleY: 0 }); hide(); w.tw = null; return null; }
  w.tw = gsap.to(w.spans, {
    scaleY: 0, scaleX: 1.14, duration: pace.rush ? Math.min(dur, 0.12) : dur, ease: 'fm-in',
    stagger: { each: 0.016, from: 'random' }, onComplete: hide,
  });
  return w.tw;
}

/** estado parado (sem animar): de pé ou murcha */
export function setUp(w, up) {
  w.tw?.kill();
  w.tw = null;
  gsap.set(w.spans, { scaleY: up ? 1 : 0, scaleX: 1, opacity: 1 });
  gsap.set(w.el, { visibility: up ? 'visible' : 'hidden' });
}
