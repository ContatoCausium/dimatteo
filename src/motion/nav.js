// Nav fixa: os links levam à cena certa dentro do palco (o cardápio, o forno, o card de pedido) e a cor segue o
// fundo da cena (tinta na farinha, creme no preto-brasa).
// Os links de exemplo (data-demo: as formas de pedir, Instagram, WhatsApp) não saem da página na demo; no site da
// marca recebem o link de verdade. Pelo teclado, o link leva também o foco para dentro da cena (data-focus: o prato,
// a primeira forma de pedir, "Reservar mesa"), quando ela monta; o "pular para o pedido" é desse jeito.
import { focusWhenShown } from './teclado.js';

export function nav({ go }) {
  const root = document.querySelector('.nav');
  document.querySelectorAll('[data-go]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      go(a.dataset.go);
      // detail 0: o clique veio do teclado (Enter); no mouse o foco fica onde está, para o espaço continuar rolando
      if (a.dataset.focus && e.detail === 0) focusWhenShown(a.dataset.focus);
    });
  });
  document.querySelectorAll('[data-demo]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
  let theme = 'claro';
  return {
    root,
    theme(t) {
      if (t === theme) return;
      theme = t;
      root.dataset.theme = t;
      document.documentElement.dataset.theme = t;
    },
    show(on) { root.classList.toggle('is-on', on); },
    away(on) { root.classList.toggle('is-away', on); },
  };
}
