// Pedido: a pizza cai na caixa, a tampa fecha (CSS 3D, dobradiça na borda de cima) e a caixa fechada vira o card de
// pedido. Três estados por marco, sempre nessa ordem: um sequenciador pequeno garante que, com rolagem rápida, a
// tampa espera a pizza cair e o card espera a tampa fechar (e o contrário na volta).
import { gsap } from 'gsap';
import { fadeIn, fadeOut, titleIn, titleOut } from './texts.js';
import { ramp } from './win.js';
import { M } from './marks.js';

const OPEN = 100; // graus da tampa aberta: passou um tico da vertical, como uma caixa aberta no balcão

export function pedido({ st, reduced }) {
  const lid = document.querySelector('.lid');
  const flap = lid.querySelector('.lid__flap');
  const shadeOut = lid.querySelector('.lid__face--out .lid__shade');
  const shadeIn = lid.querySelector('.lid__face--in .lid__shade');
  const faceOut = lid.querySelector('.lid__face--out');
  const faceIn = lid.querySelector('.lid__face--in');
  let persp = 1800, half = 225;
  let flipAt = 83; // graus em que a face de fora deixa de olhar para a câmera (depende da perspectiva)
  const lidStamp = lid.querySelector('.stamp');
  const card = document.querySelector('.order__card');
  const stamp = card.querySelector('.order__stamp');
  const title = card.querySelector('.order__title');
  const opts = [...card.querySelectorAll('.opt')];
  const want = { drop: false, lid: false, card: false };
  const tgt = { drop: 0, lid: 0, card: 0 };
  const tw = {};
  let texts = false;
  let L, flip = { x: 0, y: 0, k: 1 };

  const DUR = { drop: [0.5, 0.78], lid: [0.75, 1.0], card: [0.7, 1.0] };
  const EASE = { drop: ['power2.in', 'fm-drop'], lid: ['fm-io', 'fm-io'], card: ['fm-io', 'fm-io'] };

  // cada estado tem o seu alvo; a tampa só desce com a pizza quase assentada e o card só cresce com a tampa quase
  // fechada (e o contrário na volta). null = segura o que está fazendo.
  // com rolagem rápida que pula marcos, a sequência encurta (mais rápida e emendada) para o card não demorar
  const hurry = () => (want.card && st.lid < 0.94) || (want.lid && st.drop < 0.86);
  function aim(key) {
    const h = hurry();
    if (key === 'drop') return want.drop ? 1 : st.lid <= 0.12 ? 0 : null;
    if (key === 'lid') return want.lid ? (st.drop >= (h ? 0.6 : 0.86) ? 1 : null) : st.card <= 0.06 ? 0 : null;
    return want.card ? (st.lid >= (h ? 0.8 : 0.94) ? 1 : null) : 0;
  }

  function drive() {
    for (const key of ['drop', 'lid', 'card']) {
      const to = aim(key);
      if (to === null || to === tgt[key]) continue;
      tgt[key] = to;
      tw[key]?.kill();
      const dist = Math.abs(to - st[key]);
      if (dist < 0.0001) continue;
      tw[key] = gsap.to(st, {
        [key]: to,
        duration: reduced ? 0 : DUR[key][to] * Math.max(0.4, dist) * (hurry() ? 0.6 : 1),
        ease: EASE[key][to],
        onComplete: () => {
          if (key === 'lid' && to === 1 && !reduced) gsap.fromTo(st, { bump: 1 }, { bump: 0, duration: 0.5, ease: 'fm-out' });
        },
      });
    }
    const on = want.card && st.card >= 0.9;
    if (on !== texts) {
      texts = on;
      if (on) { titleIn(title, { delay: 0.02 }); fadeIn(opts, { delay: 0.18, each: 0.08, y: 22 }); }
      else { titleOut(title); fadeOut(opts); }
    }
  }

  function update(s) {
    want.drop = s >= M.drop;
    want.lid = s >= M.lid;
    want.card = s >= M.card;
    drive();
  }

  function build(lay) {
    L = lay;
    const b = L.box, s = b.s;
    Object.assign(lid.style, { left: `${b.x - s / 2}px`, top: `${b.y - s / 2}px`, width: `${s}px`, height: `${s}px` });
    persp = s * 4;
    half = s / 2;
    lid.style.setProperty('--bs', `${s}px`);
    flipAt = (Math.atan2(2 * s * 4, s) * 180) / Math.PI;
    const c = L.card;
    Object.assign(card.style, { left: `${c.l}px`, top: `${c.t}px`, width: `${c.r - c.l}px`, height: `${c.b - c.t}px` });
    // o kraft da tampa e do card é a mesma textura no mesmo lugar da tela, para a troca não pular
    lid.style.setProperty('--kx', `${-(b.x - s / 2)}px`);
    lid.style.setProperty('--ky', `${-(b.y - s / 2)}px`);
    card.style.setProperty('--kx', `${-c.l}px`);
    card.style.setProperty('--ky', `${-c.t}px`);
    // de onde o carimbo do card sai: o carimbo da tampa fechada (medidos sem transformação)
    flap.style.transform = lid.style.transform = stamp.style.transform = 'none';
    const sr = stamp.getBoundingClientRect(), lr = lidStamp.getBoundingClientRect();
    flip = { x: lr.left - sr.left, y: lr.top - sr.top, k: lr.width / sr.width };
    last = '';
  }

  let last = '';
  function render(s) {
    const t = st.card;
    const lidOn = s >= M.tray[0] && t < 0.14;
    lid.style.visibility = lidOn ? 'visible' : 'hidden';
    if (lidOn) {
      const th = OPEN * (1 - st.lid);
      const bump = 1 - 0.014 * st.bump;
      lid.style.opacity = (ramp(s, ...M.tray) * (1 - ramp(t, 0.02, 0.14))).toFixed(3);
      lid.style.transform = `scale(${bump.toFixed(4)})`;
      // a perspectiva vai na própria transformação (o Safari ignora a propriedade perspective do pai aqui), com o
      // ponto de fuga no centro da caixa e o giro na dobradiça (borda de cima)
      flap.style.transform = `perspective(${persp.toFixed(0)}px) translateY(${-half}px) rotateX(${th.toFixed(2)}deg) translateY(${half}px)`;
      const outSide = th < flipAt;
      faceOut.style.visibility = outSide ? 'inherit' : 'hidden';
      faceIn.style.visibility = outSide ? 'hidden' : 'inherit';
      const r = (th * Math.PI) / 180;
      shadeOut.style.opacity = (0.62 * Math.sin(r)).toFixed(3);
      shadeIn.style.opacity = (0.12 + 0.4 * Math.max(0, Math.sin(r) - 0.6)).toFixed(3);
    }
    if (t <= 0) {
      if (last !== 'off') { card.style.visibility = 'hidden'; last = 'off'; }
      return;
    }
    card.style.visibility = 'visible';
    const b = L.box, c = L.card, k = 1 - t;
    const ins = [b.y - b.s / 2 - c.t, c.r - (b.x + b.s / 2), c.b - (b.y + b.s / 2), b.x - b.s / 2 - c.l].map((v) => (v * k).toFixed(1));
    const rad = (8 + (L.radius - 8) * t).toFixed(1);
    const clip = `inset(${ins.join('px ')}px round ${rad}px)`;
    if (clip !== last) { card.style.clipPath = clip; last = clip; }
    stamp.style.transform = `translate3d(${(flip.x * k).toFixed(2)}px,${(flip.y * k).toFixed(2)}px,0) scale(${(1 + (flip.k - 1) * k).toFixed(4)})`;
  }

  return { update, build, render };
}
