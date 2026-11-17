// O palco: um pin só, do hero ao card de pedido, e a pizza em todas as cenas. Duas fontes movem a cena, cada uma
// com as suas propriedades: o progresso do scroll suavizado (só imagem: a pizza subindo e entrando no forno, a
// janela, o fundo) e o estado animado por tempo (fatias, prato, descida ao cardápio, queda na caixa, tampa, card).
// Os textos entram e saem por marco. Unidade de tudo: telas de rolagem (100vh) desde o começo do pin.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { layout, CRUST } from './layout.js';
import { place, fitSize } from './words.js';
import { pizza } from './pizza.js';
import { platter } from './platter.js';
import { win, ramp, io } from './win.js';
import { corte } from './corte.js';
import { cardapio } from './cardapio.js';
import { forno } from './forno.js';
import { massa } from './massa.js';
import { pedido } from './pedido.js';
import { hero } from './hero.js';
import { M } from './marks.js';
import { pace } from './texts.js';

export { M };

const lerp = (a, b, t) => a + (b - a) * t;
const out3 = (t) => 1 - Math.pow(1 - t, 3);
const lerpPose = (a, b, t) => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), d: lerp(a.d, b.d, t), rot: lerp(a.rot, b.rot, t),
  tilt: lerp(a.tilt || 0, b.tilt || 0, t), fire: lerp(a.fire || 0, b.fire || 0, t),
});
// o fundo assa: farinha → casca dourada → brasa → preto do forno (nunca passa por cinza)
const BAKE = [[240, 232, 219], [214, 158, 96], [104, 44, 16], [18, 11, 8]];
const bake = (t) => {
  const x = Math.min(0.9999, Math.max(0, t)) * (BAKE.length - 1), i = Math.floor(x), f = x - i;
  return BAKE[i].map((v, k) => Math.round(v + (BAKE[i + 1][k] - v) * f));
};

export function film({ words, reduced, nav, onFlavor }) {
  const section = document.querySelector('.film');
  const stage = section.querySelector('.stage');
  const bg = stage.querySelector('.stage__bg');
  const dim = stage.querySelector('.stage__dim');
  const order = stage.querySelector('.order');
  const pz = pizza(stage.querySelector('.pz'));
  const pl = platter(stage.querySelector('.platter'));
  const wn = win(stage.querySelector('.win'));
  // nudge, lift e press: o prato cedendo, a pizza subindo e afundando sob a mão (prato.js)
  const st = { intro: 0, menu: 0, plat: 0, platOn: false, catch: 1, drop: 0, lid: 0, card: 0, bump: 0, nudge: 0, lift: 0, press: 0 };
  const ct = corte({ pz, reduced });
  const menu = cardapio({ st, words, corte: ct, reduced, onShow: (i) => onFlavor?.(i) });
  const fo = forno({ reduced });
  const ma = massa({ words, reduced });
  const pe = pedido({ st, reduced });
  const he = hero();
  let L;
  let lenis = null;
  let raw = 0, s = 0, live = false;

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${M.end * innerHeight}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    refreshPriority: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => { raw = self.progress * M.end; },
  });

  function build() {
    L = layout(stage, words);
    const S = Math.ceil(L.hero.d / CRUST);
    pz.build(S);
    pl.build(S);
    wn.build(L);
    pe.build(L);
    // "48 h" no card da massa
    const c = L.card;
    const fs = L.mobile ? fitSize(words.massa, (c.r - c.l) * 0.6) : Math.min(fitSize(words.massa, (c.r - c.l) * 0.4), L.H * 0.44);
    L.massaWord = place(words.massa, {
      fs, x: c.l + (L.mobile ? 18 : L.gutter * 1.1),
      base: L.mobile ? c.t + 34 + (words.massa.m.cap * fs) / 100 : c.t + (c.b - c.t) * 0.6,
    });
    const v = (k, px) => stage.style.setProperty(k, `${px.toFixed(1)}px`);
    v('--wb', L.word.base);
    v('--wcap', L.word.cap);
    v('--cta-y', L.cta.y);
    v('--c-top', L.center.y - L.center.d / 2);
    v('--c-bot', L.center.y + L.center.d / 2);
    v('--m-top', L.menu.y - L.menu.d / 2);
    v('--m-bot', L.menu.y + L.menu.d / 2);
    v('--m-x', L.menu.x);
    v('--m-y', L.menu.y);
    v('--m-r', L.menu.d / 2);
    v('--a-l', L.arch.x - L.arch.w / 2);
    v('--a-r', L.arch.x + L.arch.w / 2);
    v('--a-t', L.arch.b - L.arch.h);
    v('--a-b', L.arch.b);
    v('--cd-l', c.l); v('--cd-t', c.t); v('--cd-r', c.r); v('--cd-b', c.b);
    v('--mw-b', L.massaWord.base);
  }

  const dark = () => io(ramp(s, ...M.toDark)) - io(ramp(s, ...M.toLight));

  function pose() {
    // hero → centro, preso ao scroll; na abertura a pizza vem de baixo da tela girando como na pá
    let p = lerpPose(L.hero, L.center, io(ramp(s, ...M.rise)));
    if (st.intro < 1) {
      const k = 1 - st.intro;
      p.y += k * (L.H + L.hero.d * 0.55 - p.y);
      p.rot -= 55 * k;
    }
    // centro → topo do prato (por tempo, na ida ao cardápio)
    if (st.menu > 0) p = lerpPose(p, L.menu, st.menu);
    // forno: deita para trás e entra pela boca; lá dentro o pizzaiolo ainda gira a pizza
    const oiRaw = ramp(s, ...M.ovenIn) * st.catch;
    const oi = io(oiRaw);
    if (oi > 0) {
      // a pizza deita antes de andar: inclinada já na metade do caminho, como na pá
      const tilt = L.oven.tilt * out3(Math.min(1, oiRaw * 1.7));
      p = lerpPose(p, { ...L.oven, fire: 1 }, oi);
      p.tilt = tilt;
    }
    p.rot += 34 * ramp(s, M.ovenIn[1], M.forno[1]);
    // sai da boca vindo na direção de quem olha e desce para fora da tela
    const oo = io(ramp(s, ...M.ovenOut));
    if (oo > 0) p = lerpPose(p, { ...L.ovenOut, fire: 0.25 }, oo);
    p.show = !st.platOn && s < M.ovenOut[1] + 0.05;
    // caixa: cai do alto, por tempo
    if (s >= M.ovenOut[1] + 0.05) {
      p = lerpPose(L.aboveBox, L.inBox, st.drop);
      p.show = st.drop > 0 && st.card < 0.14;
      p.front = st.lid < 0.01; // caindo do alto, passa na frente da tampa aberta
    }
    return p;
  }

  let lastDark = -1;
  function render() {
    const dk = dark();
    if (Math.abs(dk - lastDark) > 0.0005) {
      lastDark = dk;
      bg.style.backgroundColor = `rgb(${bake(dk)})`;
    }
    pz.render(pose());
    pz.renderSlices(ct.lines);
    pl.render(st.plat + st.nudge, L, st.platOn, st);
    wn.render(s, st.card > 0.14, s < M.toDark[1] ? dk : 1);
    wn.root.style.transform = st.bump > 0 ? `scale(${(1 - 0.014 * st.bump).toFixed(4)})` : '';
    pe.render(s);
    // o rodapé sobe por cima: o card fica na sombra dele e sobe um pouco mais devagar (só imagem)
    const f = io(ramp(s, ...M.foot));
    dim.style.opacity = (0.26 * f).toFixed(3);
    order.style.transform = f > 0 ? `translate3d(0,${(-8 * f).toFixed(2)}vh,0)` : '';
  }

  function zones() {
    // varrendo a página, nenhuma entrada de texto começa (só saídas); parou numa cena, ela entra
    const calm = !pace.rush;
    if (s < M.heroOut) { if (calm) he.show(); } else he.hide();
    if (menu.phase === 'above') {
      if (s >= M.cut && s < M.menu) { if (calm) ct.cut(); } else if (ct.open) ct.join();
    }
    let i = -1;
    if (s >= M.menuOut) i = M.steps.length;
    else if (s >= M.menu) M.steps.forEach((m, k) => { if (s >= m) i = k; });
    menu.update(i);
    if (s >= M.forno[0] && s < M.forno[1]) { if (calm) fo.show(); } else fo.hide();
    if (s >= M.massa[0] && s < M.massa[1]) { if (calm) ma.show(); } else ma.hide();
    pe.update(s);
    nav.theme(dark() > 0.5 ? 'escuro' : 'claro');
  }

  let prevRaw = 0, speed = 0;
  function tick(_t, dt) {
    // velocidade do scroll em telas por segundo, suavizada: acima de ~2,5 a página está sendo varrida
    speed += (Math.abs(raw - prevRaw) / Math.max(0.008, dt / 1000) - speed) * 0.25;
    prevRaw = raw;
    pace.rush = speed > 2.5;
    const k = reduced ? 1 : 1 - Math.pow(1 - (L.mobile ? 0.13 : 0.16), Math.min(4, dt / 16.67));
    s += (raw - s) * k;
    if (Math.abs(raw - s) < 0.0004) s = raw;
    if (live) zones();
    render();
  }

  build();
  ScrollTrigger.addEventListener('refresh', build);
  gsap.ticker.add(tick);

  return {
    st,
    words,
    get s() { return s; },
    setLenis(l) { lenis = l; },
    start() { live = true; he.show(0.05); },
    /** rola até um ponto do palco (em telas); os marcos do caminho disparam em ordem */
    to(at, duration = 1.8, easing = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)) {
      const y = trigger.start + at * innerHeight;
      if (lenis) lenis.scrollTo(y, { duration, easing });
      else window.scrollTo({ top: y, behavior: 'auto' });
    },
    go(name) { this.to(M.go[name] ?? 0); },
    rebuild: build,
    get phase() { return menu.phase; },
  };
}
