// A geometria do palco em px, recalculada a cada resize: onde a pizza fica em cada cena, a janela (forno, massa,
// caixa), o prato giratório e as palavras gigantes. Celular é outro desenho, não o desktop encolhido.
import { place, fitSize } from './words.js';

// a foto da pizza é quadrada; a borda ocupa este tanto do lado (alinhado em fonte/alinha.py)
export const CRUST = 0.92;

export function layout(stage, words) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const mobile = W < 760 || W / H < 0.8;
  // tablet em pé usa o desenho do celular, com a pizza e as janelas menores em relação à largura
  const tab = mobile && W > 560;
  const L = { W, H, mobile, tab };
  const g = mobile ? 18 : Math.min(56, Math.max(18, W * 0.036));
  L.gutter = g;

  // "Fermento": a tinta encosta nas bordas, como na hero aprovada
  const m = mobile ? 10 : Math.max(6, W * 0.006);
  const wfs = fitSize(words.hero, W - 2 * m);
  const capTop = mobile ? 86 : Math.max(96, H * 0.16);
  const cap = (words.hero.m.cap * wfs) / 100;
  L.word = place(words.hero, { fs: wfs, x: m, base: capTop + cap });
  const base = L.word.base;

  // pizza na hero: na frente do pé das letras e cortada pelo pé da tela (no celular, embaixo do título)
  if (mobile) {
    const d = W * (tab ? 1.08 : 1.36);
    L.hero = { x: W / 2, y: Math.max(base + 112, H * 0.31) + d / 2, d, rot: 0 };
    L.cta = { x: W / 2, y: H - 64 };
  } else {
    const d = Math.min(W * 0.56, H * 1.04);
    const top = base - H * 0.068;
    L.hero = { x: W / 2, y: top + d / 2, d, rot: 0 };
    L.cta = { x: W / 2, y: H * 0.865 };
  }

  // o corte: a pizza inteira no centro
  L.center = mobile
    ? { x: W / 2, y: H * 0.47, d: W * (tab ? 0.7 : 0.86), rot: 40 }
    : { x: W / 2, y: H * 0.53, d: Math.min(W * 0.44, H * 0.7), rot: 40 };

  // cardápio: o nome do sabor na mesma base da palavra; a pizza por cima do pé dele (no celular, embaixo)
  const nm = mobile ? 10 : Math.max(6, W * 0.012);
  L.names = words.names.map((w) => {
    const fs = Math.min(fitSize(w, W - 2 * nm), mobile ? 999 : H * 0.34);
    const x = (W - (w.m.ink * fs) / 100) / 2;
    return place(w, { fs, x, base });
  });
  if (mobile) {
    const d = W * (tab ? 0.7 : 0.86);
    L.menu = { x: W / 2, y: base + 34 + d / 2, d, rot: 40 };
  } else {
    const d = Math.min(W * 0.4, H * 0.62);
    // por cima do pé do nome, mas inteira: a borda de baixo fica uma margem acima do pé da tela
    L.menu = { x: W / 2, y: Math.min(base - H * 0.035 + d / 2, H * 0.965 - d / 2), d, rot: 40 };
  }
  // raio do prato: o menor em que os vizinhos (a 72°) ficam fora da tela em repouso, pelo lado ou por baixo; assim,
  // no meio do giro, as duas pizzas aparecem se cruzando em arco, sem o centro vazio
  {
    const m = L.menu, a = (2 * Math.PI) / words.names.length;
    const r = (m.d / 2) * 1.06; // a borda mais a sombra que a pizza faz no fundo
    const byX = (W / 2 + r) / Math.sin(a) + 4;
    const byY = (H - m.y + r) / (1 - Math.cos(a)) + 4;
    L.R = Math.max(W * (mobile ? 0.5 : 0.58), Math.min(byX, byY));
  }

  // forno: a boca em arco baixo, mais larga que alta, como a de um forno napolitano; a pizza deitada no chão dele
  if (mobile) {
    const aw = W * (tab ? 0.72 : 0.86);
    L.arch = { x: W / 2, b: H * 0.6, w: aw, h: aw * 0.64 };
  } else {
    const aw = Math.min(W * 0.46, H * 1.02);
    L.arch = { x: W / 2, b: H * 0.86, w: aw, h: aw * 0.6 };
  }
  const A = L.arch;
  L.oven = { x: A.x, y: A.b - A.h * 0.2, d: A.w * 0.44, rot: 70, tilt: 66 };
  L.ovenOut = { x: W / 2, y: H + L.hero.d * 0.5, d: L.hero.d * 1.25, rot: 96, tilt: 48 };

  // massa e pedido: card de largura inteira com cantos arredondados, abaixo da nav
  const cm = mobile ? 10 : Math.max(12, W * 0.012);
  const ct = mobile ? 70 : Math.max(84, H * 0.105);
  L.card = { l: cm, t: ct, r: W - cm, b: H - cm };
  L.radius = mobile ? 20 : Math.min(30, Math.max(18, W * 0.018));

  // caixa: um quadrado no centro; a pizza cai dentro dele
  const bs = mobile ? W * (tab ? 0.62 : 0.74) : Math.min(H * 0.54, W * 0.4); // a tampa aberta projeta mais larga que a caixa
  const by = mobile ? H * 0.53 : H * 0.615;
  L.box = { x: W / 2, y: by, s: bs };
  L.inBox = { x: W / 2, y: by, d: bs * 0.8, rot: 128 };
  L.aboveBox = { x: W / 2, y: -bs * 0.75, d: bs * 0.92, rot: 70 };
  return L;
}
