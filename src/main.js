import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './sections/nav.css';
import './sections/stage.css';
import './sections/hero.css';
import './sections/corte.css';
import './sections/cardapio.css';
import './sections/forno.css';
import './sections/massa.css';
import './sections/pedido.css';
import './sections/rodape.css';
import './sections/loader.css';
import './styles/interacoes.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './motion/ease.js';
import { word } from './motion/words.js';
import { setReduced } from './motion/texts.js';
import { film } from './motion/film.js';
import { nav } from './motion/nav.js';
import { rodape } from './motion/rodape.js';
import { loader } from './motion/loader.js';
import { smooth } from './motion/smooth.js';
import { scrollbar } from './motion/scrollbar.js';
import { toque } from './motion/toque.js';
import { prato } from './motion/prato.js';
import { teclado } from './motion/teclado.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
setReduced(reduced);

const fonts = Promise.all([
  document.fonts.load('700 100px "Clash Display"'),
  document.fonts.load('600 100px "Clash Display"'),
  document.fonts.load('italic 600 100px Gambetta'),
  document.fonts.load('italic 400 100px Gambetta'),
  document.fonts.load('500 16px "Cabinet Grotesk"'),
  document.fonts.load('700 16px "Cabinet Grotesk"'),
]);
// A abertura espera só o que a primeira tela mostra: as fontes e a pizza da hero (a mesma <img> do palco, com o
// srcset já resolvido). Os outros sabores carregam por trás e só aparecem duas telas depois, no cardápio.
const decode = (img) => (img.complete ? img.decode() : new Promise((ok) => img.addEventListener('load', ok, { once: true })).then(() => img.decode())).catch(() => {});
const assets = [fonts, decode(document.querySelector('.pz__whole'))];

// O resto das fotos (os outros sabores, forno, massa, caixa e a gravura do rodapé) só aparece depois de rolar.
// Elas vêm com data-src no HTML e só começam a baixar no primeiro gesto da pessoa (rolar, tocar, clicar, teclar):
// assim a pizza da hero não divide a banda do 4G com 2 MB de fotos que ninguém está vendo ainda.
let scenesLoaded = false;
function loadScenes() {
  if (scenesLoaded) return;
  scenesLoaded = true;
  GESTURES.forEach((ev) => removeEventListener(ev, loadScenes, true));
  document.querySelectorAll('img[data-src]').forEach((img) => {
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  });
}
const GESTURES = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
GESTURES.forEach((ev) => addEventListener(ev, loadScenes, { capture: true, passive: true }));

await fonts;

const words = {
  hero: word(document.querySelector('.word'), { family: '"Clash Display"', weight: 700, tracking: -0.035 }),
  names: [...document.querySelectorAll('.name')].map((el) => word(el, { family: 'Gambetta', weight: 600, style: 'italic', tracking: -0.012 })),
  massa: word(document.querySelector('.massa__num'), { family: '"Clash Display"', weight: 700, tracking: -0.03 }),
  foot: word(document.querySelector('.rodape__word'), { family: '"Clash Display"', weight: 700, tracking: -0.035 }),
};

let f;
const n = nav({ go: (name) => f.go(name) });
let pr;
f = film({ words, reduced, nav: n, onFlavor: (i) => pr?.show(i) }); // o pin nasce antes do Lenis
pr = prato({ film: f, st: f.st, reduced });
toque();
teclado({ film: f });
rodape({ words, reduced, nav: n });
const lenis = reduced ? null : smooth();
f.setLenis(lenis);
lenis?.stop();
scrollbar({ lenis });

loader({
  words,
  st: f.st,
  assets,
  reduced,
  onDone: (wait) => gsap.delayedCall(wait, () => {
    document.body.classList.remove('is-loading');
    n.show(true);
    f.start();
    lenis?.start();
  }),
});

requestAnimationFrame(() => requestAnimationFrame(() => { ScrollTrigger.refresh(); lenis?.resize(); }));
if (import.meta.env.DEV) { window.__fm = () => f.s; window.__st = f.st; window.__film = f; window.__gsap = gsap; }
