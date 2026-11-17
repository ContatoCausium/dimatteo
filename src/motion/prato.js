// O prato giratório também gira com a mão. Um botão redondo fica em cima da pizza da vez (só no cardápio):
// - hover: a pizza sobe do prato, como massa crescendo (a sombra fica embaixo), e o prato cede uns graus para o
//   próximo sabor, que aponta no canto da tela;
// - apertar: a pizza afunda (0,97), como apertada na pá; ao soltar, volta passando um tico;
// - clique, toque, Enter, espaço ou seta para a direita: o prato gira para o próximo sabor (do último, volta ao
//   primeiro); seta para a esquerda: volta um;
// - foco pelo teclado: a pizza sobe e um anel vermelho a cerca (interacoes.css); o prato não cede, para o anel
//   continuar em volta dela;
// - toque: a resposta do hover e do aperto vem pelo evento 'toque' (toque.js), com o mesmo atraso de 70 ms dos
//   links, para um arrasto que começa na pizza (rolar o cardápio) não fazer o prato tremer;
// - rolando a página com o cursor parado em cima da pizza, o hover descansa (rolando.js) e volta quando o mouse
//   se mexe.
// O giro é a própria rolagem até o marco do sabor: o palco continua preso ao scroll e tudo assenta igual. Com
// movimento reduzido, a pizza sobe e afunda na hora e o prato não cede.
import { gsap } from 'gsap';
import { M } from './marks.js';
import { rolando } from './rolando.js';

const NUDGE = 0.05; // em passos do prato: 0,05 × 72° = 3,6°
// a rolagem do clique (que não aparece: no cardápio o palco está parado) dispara e para a 60% da janela do sabor,
// então o marco passa logo e o prato começa a girar uns 0,3 s depois do clique, em vez de esperar a rolagem acabar
const QUICK = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function prato({ film, st, reduced }) {
  const hit = document.querySelector('.plate-hit');
  const names = [...document.querySelectorAll('.flavor h3')].map((h) => h.textContent.trim());
  const N = names.length;
  let shown = -1, pending = -1, clear = 0;

  const set = (key, on, vars) => {
    if (reduced) { if (key !== 'nudge') st[key] = on ? 1 : 0; return; }
    gsap.to(st, { [key]: on ? (key === 'nudge' ? NUDGE : 1) : 0, ...vars, overwrite: 'auto' });
  };
  const nudge = (on) => set('nudge', on, on ? { duration: 0.6, ease: 'fm-out' } : { duration: 0.45, ease: 'fm-io' });
  const lift = (on) => set('lift', on, on ? { duration: 0.6, ease: 'fm-out' } : { duration: 0.4, ease: 'fm-in' });
  const press = (on) => set('press', on, on ? { duration: 0.12, ease: 'fm-out' } : { duration: 0.5, ease: 'fm-back' });

  // o sabor que a rolagem pede agora (não o que está na tela): cliques seguidos andam um sabor por vez
  function current() {
    if (pending >= 0) return pending;
    let i = 0;
    M.steps.forEach((m, k) => { if (film.s >= m - 0.001) i = k; });
    return i;
  }

  function go(dir) {
    const i = current();
    const n = (i + dir + N) % N;
    pending = n;
    clearTimeout(clear);
    const far = Math.abs(n - i);
    const end = M.steps[n + 1] ?? M.menuOut;
    film.to(M.steps[n] + (end - M.steps[n]) * 0.6, 0.9 + 0.22 * (far - 1), QUICK);
    clear = setTimeout(() => { pending = -1; }, 1400 + 220 * far);
  }

  const mouse = (e) => e.pointerType !== 'touch';
  const hover = matchMedia('(hover: hover)');
  hit.addEventListener('pointerenter', (e) => { if (mouse(e) && !rolando.on) { nudge(true); lift(true); } });
  rolando.sub((scrolling) => {
    // a rolagem do próprio clique no prato não conta: o prato não volta os graus cedidos antes de girar
    if (scrolling) { if (pending < 0) { nudge(false); if (!hit.matches(':focus-visible')) lift(false); } }
    else if (hover.matches && hit.matches(':hover')) { nudge(true); lift(true); }
  });
  hit.addEventListener('pointerleave', (e) => {
    if (!mouse(e)) return;
    nudge(false); press(false);
    if (!hit.matches(':focus-visible')) lift(false);
  });
  hit.addEventListener('focus', () => { if (hit.matches(':focus-visible')) lift(true); });
  hit.addEventListener('blur', () => { if (!hit.matches(':hover')) lift(false); });
  hit.addEventListener('pointerdown', (e) => { if (mouse(e)) press(true); });
  hit.addEventListener('pointerup', (e) => { if (mouse(e)) press(false); });
  hit.addEventListener('pointercancel', () => { press(false); nudge(false); lift(false); });
  // no toque, o dedo parado faz o que o hover e o aperto fazem no mouse
  hit.addEventListener('toque', (e) => { press(e.detail); nudge(e.detail); lift(e.detail); });
  hit.addEventListener('click', () => go(1));
  hit.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.key === 'Enter' || e.key === ' ') press(true);
  });
  hit.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') press(false); });

  return {
    /** chamado pelo cardápio quando o sabor da tela muda (-1 antes do cardápio, N depois) */
    show(i) {
      if (i === shown) return;
      shown = i;
      const on = i >= 0 && i < N;
      hit.classList.toggle('is-on', on);
      if (!on) { nudge(false); lift(false); press(false); return; }
      hit.setAttribute('aria-label', `Sabor ${i + 1} de ${N}, ${names[i]}. Girar o prato para ${names[(i + 1) % N]}`);
    },
  };
}
