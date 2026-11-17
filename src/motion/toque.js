// Toque: o celular não tem hover. Tocar num link ou botão dá a ele a classe .is-touch, com o mesmo visual do hover
// (interacoes.css), enquanto o dedo está nele e 380 ms depois de soltar, para o toque curto também mostrar a resposta.
// Começar a rolar em cima de um link não acende nada: a classe só entra depois de 70 ms parado (ou na hora, se o
// dedo sair antes disso) e some se o dedo andar ou a rolagem começar.
// Quem anima por JS (o prato giratório) ouve o evento 'toque' (detail: aceso ou não) em vez da classe.
const SEL = 'a, button';

export function toque() {
  let el = null, timer = 0, x0 = 0, y0 = 0;
  const set = (e, on) => {
    if (e.classList.contains('is-touch') === on) return;
    e.classList.toggle('is-touch', on);
    e.dispatchEvent(new CustomEvent('toque', { detail: on }));
  };
  const reset = () => { clearTimeout(timer); el = null; };
  // o toque curto fica aceso um instante depois de soltar; um toque novo na mesma peça cancela o apagar
  const offLater = (t) => { clearTimeout(t._toque); t._toque = setTimeout(() => set(t, false), 380); };

  addEventListener('pointerdown', (ev) => {
    if (ev.pointerType !== 'touch') return;
    reset();
    el = ev.target.closest(SEL);
    if (!el) return;
    clearTimeout(el._toque);
    x0 = ev.clientX; y0 = ev.clientY;
    const t = el;
    timer = setTimeout(() => set(t, true), 70);
  }, { passive: true });

  addEventListener('pointermove', (ev) => {
    if (!el || ev.pointerType !== 'touch') return;
    if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) { set(el, false); reset(); }
  }, { passive: true });

  addEventListener('pointerup', (ev) => {
    if (!el || ev.pointerType !== 'touch') return;
    const t = el;
    reset();
    set(t, true);
    offLater(t);
  }, { passive: true });

  addEventListener('pointercancel', () => {
    if (!el) return;
    set(el, false);
    reset();
  }, { passive: true });

  // o Safari do iPhone só aplica :active (o estado de clique) se a página escuta toques
  addEventListener('touchstart', () => {}, { passive: true });
}
