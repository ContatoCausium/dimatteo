// Teclado: o Tab segue o filme. O palco é um pin só e cada cena esconde o que não é dela, então o Tab do navegador
// pulava do botão da hero direto para o "Voltar ao topo" do rodapé, por cima do cardápio e do pedido. Aqui, quando o
// próximo clicável cairia no rodapé (ou numa cena que o rodapé já cobriu), a página anda até a próxima cena que tem
// clicáveis (cardápio, pedido, rodapé) e o foco vai para o primeiro dela assim que ela monta. Voltando do rodapé com
// Shift+Tab, a página sobe ao card de pedido e o foco vai para a última forma de pedir. Enquanto a página anda até
// lá, o Tab espera; mexer o mouse, a roda ou o dedo cancela a espera.
import { M } from './marks.js';

const SCENES = [
  { at: M.go.cardapio, first: '.plate-hit' },
  { at: M.go.pedido, first: '.opt__link' },
];
let token = 0, busy = false;

/** espera o elemento aparecer (a cena monta depois da rolagem) e põe o foco nele, sem rolar */
export function focusWhenShown(sel) {
  const mine = ++token;
  const t0 = performance.now();
  busy = true;
  const wait = () => {
    if (mine !== token) return;
    const el = document.querySelector(sel);
    if (el && getComputedStyle(el).visibility === 'visible') { el.focus({ preventScroll: true }); busy = false; return; }
    if (performance.now() - t0 < 6000) requestAnimationFrame(wait);
    else busy = false;
  };
  requestAnimationFrame(wait);
}

export function teclado({ film }) {
  const skip = document.querySelector('.skip');
  const top = document.querySelector('.nav');
  const stage = document.querySelector('.film');
  const foot = document.querySelector('.rodape');
  const shown = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible';
  const stops = () => [...document.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.tabIndex >= 0 && shown(el));
  const isTop = (el) => el === skip || top.contains(el);
  const cancel = () => { token++; busy = false; };
  ['pointerdown', 'wheel', 'touchstart'].forEach((t) => addEventListener(t, cancel, { passive: true }));

  addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;
    if (busy) { e.preventDefault(); return; }
    const a = document.activeElement;
    const list = stops();
    const i = list.indexOf(a);
    if (i < 0 || foot.contains(a) !== e.shiftKey) return; // só o Tab que sai do palco e o Shift+Tab que sai do rodapé
    // o rodapé sobe por cima do card no fim do pin: daí em diante o que sobra do palco está coberto
    const covered = film.s >= M.foot[0];
    if (!e.shiftKey) {
      const next = list[i + 1];
      if (next && (isTop(next) || (stage.contains(next) && !covered))) return;
      e.preventDefault();
      const scene = covered ? null : SCENES.find((c) => c.at > film.s + 0.05);
      if (scene) { film.to(scene.at); focusWhenShown(scene.first); }
      else { film.to(M.end); focusWhenShown('.rodape__cta'); }
    } else {
      const prev = list[i - 1];
      if (!prev || foot.contains(prev)) return;
      e.preventDefault();
      film.to(M.go.pedido);
      focusWhenShown('.opt:last-child .opt__link');
    }
  });
}
