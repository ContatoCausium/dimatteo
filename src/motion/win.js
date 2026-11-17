// A janela que muda de forma e liga três cenas: a boca do forno (arco baixo) abre num card de largura inteira (a
// massa), e o card encolhe até a caixa aberta. Dentro dela, cada foto nova sobe por cima da anterior. Tudo preso ao
// scroll suavizado; nada aqui é texto.
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const ramp = (s, a, b) => clamp01((s - a) / (b - a));
export const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const out = (t) => 1 - Math.pow(1 - t, 3);
const mix = (a, b, t) => a + (b - a) * t;

import { M } from './marks.js';

export function win(root) {
  const forno = root.querySelector('.win__layer--forno');
  const massa = root.querySelector('.win__layer--massa');
  const kraft = root.querySelector('.win__layer--kraft');
  const caixa = root.querySelector('.win__layer--caixa');
  const lip = root.querySelector('.win__lip');
  let L, shapes;

  const rect = (el, r) => Object.assign(el.style, { left: `${r.l}px`, top: `${r.t}px`, width: `${r.r - r.l}px`, height: `${r.b - r.t}px` });

  function build(lay) {
    L = lay;
    const A = L.arch, rad = L.radius;
    const arch = { l: A.x - A.w / 2, r: A.x + A.w / 2, t: A.b - A.h, b: A.b };
    const sq = { l: L.box.x - L.box.s / 2, r: L.box.x + L.box.s / 2, t: L.box.y - L.box.s / 2, b: L.box.y + L.box.s / 2 };
    // raios: [sup. esq., sup. dir., inf. dir., inf. esq.] na horizontal e na vertical
    shapes = {
      arch: { ...arch, rx: [A.w / 2, A.w / 2, 6, 6], ry: [A.h * 0.8, A.h * 0.8, 6, 6] },
      card: { ...L.card, rx: [rad, rad, rad, rad], ry: [rad, rad, rad, rad] },
      box: { ...sq, rx: [8, 8, 8, 8], ry: [8, 8, 8, 8] },
    };
    const pad = A.w * 0.16;
    rect(forno, { l: arch.l - pad, r: arch.r + pad, t: arch.t - pad * 0.6, b: arch.b + pad * 0.2 });
    rect(massa, L.card);
    rect(kraft, L.card);
    rect(caixa, sq);
  }

  const lerpShape = (a, b, t) => ({
    l: mix(a.l, b.l, t), r: mix(a.r, b.r, t), t: mix(a.t, b.t, t), b: mix(a.b, b.b, t),
    rx: a.rx.map((v, i) => mix(v, b.rx[i], t)), ry: a.ry.map((v, i) => mix(v, b.ry[i], t)),
  });

  let last = '';
  /** dark: quanto a página já escureceu (0 farinha, 1 preto-brasa): o fogo nunca aparece sobre a farinha */
  function render(s, hidden, dark = 1) {
    const show = s >= M.lit[0] && !hidden;
    if (!show) {
      if (last !== 'off') { root.style.visibility = 'hidden'; last = 'off'; }
      return;
    }
    root.style.visibility = 'visible';
    const open = io(ramp(s, ...M.open));
    const shut = io(ramp(s, ...M.shut));
    const sh = shut > 0 ? lerpShape(shapes.card, shapes.box, shut) : lerpShape(shapes.arch, shapes.card, open);
    const f = (v) => v.toFixed(1);
    const clip = `inset(${f(sh.t)}px ${f(L.W - sh.r)}px ${f(L.H - sh.b)}px ${f(sh.l)}px round ${sh.rx.map(f).join('px ')}px / ${sh.ry.map(f).join('px ')}px)`;
    if (clip !== last) { root.style.clipPath = clip; last = clip; }

    // o forno acende de baixo para cima e, quando a boca abre, desce e apaga
    const lit = out(ramp(s, ...M.lit)) * Math.min(1, dark * 1.4);
    forno.style.opacity = (lit * (1 - ramp(s, M.massaUp[0] + 0.3, M.massaUp[1]))).toFixed(3);
    forno.style.transform = `translate3d(0,${(open * 22).toFixed(2)}%,0)`;
    forno.style.setProperty('--lit', lit.toFixed(3));
    // a borda escura da boca nasce com o fogo: antes dele, sobre a farinha, virava uma sombra cinza sem motivo
    lip.style.opacity = (lit * (1 - open)).toFixed(3);
    Object.assign(lip.style, { left: `${sh.l}px`, top: `${sh.t}px`, width: `${sh.r - sh.l}px`, height: `${sh.b - sh.t}px` });

    // a macro da massa sobe por dentro da janela; depois o kraft da caixa sobe por cima dela
    const up = io(ramp(s, ...M.massaUp));
    const kr = io(ramp(s, ...M.kraft));
    massa.style.visibility = up > 0 && kr < 1 ? 'inherit' : 'hidden'; // inherit: a janela escondida esconde as camadas
    massa.style.transform = `translate3d(0,${((1 - up) * 100 - kr * 28).toFixed(2)}%,0)`;
    kraft.style.visibility = kr > 0 ? 'inherit' : 'hidden';
    kraft.style.transform = `translate3d(0,${((1 - kr) * 100).toFixed(2)}%,0)`;
    caixa.style.opacity = ramp(s, ...M.tray).toFixed(3);
  }

  return { root, build, render, get shapes() { return shapes; } };
}
