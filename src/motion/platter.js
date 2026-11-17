// O prato giratório do cardápio: um prato grande e invisível com o centro abaixo da tela; os cinco sabores ficam na
// borda dele, a 72° um do outro. Girar o prato traz o próximo pela borda da tela, em arco e já girando junto.
import { CRUST } from './layout.js';


export function platter(root) {
  const plates = [...root.querySelectorAll('.plate')].map((el) => ({ el, img: el.querySelector('img'), shadow: el.querySelector('.plate__shadow'), on: false, last: '' }));
  const STEP = 360 / plates.length; // os sabores dividem a volta do prato
  let S = 1000;

  function build(size) {
    S = size;
    plates.forEach((p) => { p.el.style.width = p.el.style.height = `${S}px`; p.last = ''; });
  }

  /** a: ângulo do prato em passos (0 = margherita no topo; o número de sabores = volta inteira, margherita de novo) */
  /** hand: a mão no prato (prato.js): lift, a pizza da vez subindo do prato (hover); press, afundando (clique) */
  function render(a, L, show, hand = { lift: 0, press: 0 }) {
    root.style.visibility = show ? 'visible' : 'hidden';
    if (!show) return;
    const top = L.menu, R = L.R;
    const k = top.d / CRUST / S;
    plates.forEach((p, i) => {
      // ângulo da pizza i em relação ao topo do prato (positivo: à direita), no menor caminho
      let th = (i - a) * STEP;
      th = ((((th + 180) % 360) + 360) % 360) - 180;
      const on = Math.abs(th) < Math.min(84, STEP * 1.17);
      if (on !== p.on) { p.on = on; p.el.style.display = on ? 'block' : 'none'; }
      if (!on) return;
      const r = (th * Math.PI) / 180;
      const x = top.x + R * Math.sin(r), y = top.y + R * (1 - Math.cos(r));
      // a mão só pega a pizza da vez: ela sobe do prato (a sombra fica e cresce) ou afunda
      const mine = Math.abs(th) < STEP / 2;
      const lift = mine ? hand.lift : 0, press = mine ? hand.press : 0;
      const kk = k * (1 + 0.025 * lift - 0.04 * press);
      const t = `translate3d(${(x - S / 2).toFixed(2)}px,${(y - S / 2).toFixed(2)}px,0) scale(${kk.toFixed(5)})`;
      const rot = `translate3d(0,${(-0.011 * S * lift).toFixed(2)}px,0) rotate(${(top.rot + th).toFixed(3)}deg)`;
      if (t + rot === p.last) return;
      p.last = t + rot;
      p.el.style.transform = t;
      p.img.style.transform = rot;
      p.shadow.style.transform = lift ? `scale(${(1 + 0.035 * lift).toFixed(4)})` : '';
    });
  }

  return { root, plates, build, render };
}
