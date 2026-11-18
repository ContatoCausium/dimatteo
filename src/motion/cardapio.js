// Cardápio: um gesto, um sabor. A pizza do corte fecha as fatias enquanto desce e vira o disco no topo do prato
// giratório; cada marco gira o prato 72° e troca o nome gigante (o antigo murcha, o novo cresce como massa). No fim
// a pizza que está no prato (a última, rolando em ordem) sai do disco direto para o forno, sem um giro a mais: antes
// o prato devolvia a margherita, que passava sem nome nem preço. Os textos seguem o prato (o sabor que está chegando),
// não o scroll, para nome e pizza nunca se desencontrarem; uma máquina de estados pequena garante a ordem.
import { gsap } from 'gsap';
import { rise, fall } from './words.js';
import { fadeIn, fadeOut } from './texts.js';

export function cardapio({ st, words, corte, reduced, onShow }) {
  const items = [...document.querySelectorAll('.flavor')].map((li) => ({
    li,
    els: [...li.querySelectorAll('.flavor__step, .flavor__desc, .flavor__price, .flavor__cta')],
  }));
  const N = items.length; // quantos sabores (o prato tem N lugares; N = a volta inteira, margherita de novo)
  let phase = 'above'; // above · toMenu · menu · toAbove · toBelow · below
  let want = -1; // o que o scroll pede: -1 antes do cardápio, 0..N-1 os sabores, N depois (forno)
  let shown = -1; // o que está na tela: -1 "Fermento", 0..N-1 o sabor, N nenhum
  let platTo = 0;
  let out = 0; // o sabor que está na pizza do palco (a que vai ao forno e à caixa): 0 é a margherita da hero
  let tl;

  // a pizza do palco veste a foto do sabor que sai do prato (a mesma <picture>, trocando o srcset)
  const whole = document.querySelector('.pz__whole');
  const wholeSrc = whole.previousElementSibling;
  const plates = [...document.querySelectorAll('.plate picture')];
  function wear(i) {
    if (i === out) return;
    out = i;
    const pic = plates[i];
    const so = pic.querySelector('source'), img = pic.querySelector('img');
    if (wholeSrc && so?.srcset) wholeSrc.srcset = so.srcset;
    if (img.srcset) whole.srcset = img.srcset;
    if (img.getAttribute('src')) whole.src = img.getAttribute('src');
  }

  const isFlavor = (i) => i >= 0 && i < N;
  const nameOf = (i) => (i === -1 ? words.hero : isFlavor(i) ? words.names[i] : null);

  function texts(i) {
    if (i === shown) return;
    const prev = shown;
    shown = i;
    const out = nameOf(prev), inn = nameOf(i);
    // pulou o cardápio inteiro: a palavra sai num instante em vez de murchar por cima do forno
    if (out) fall(out, { reduced, dur: i === N && prev === -1 ? 0.16 : 0.38 });
    if (isFlavor(prev)) fadeOut(items[prev].els);
    if (inn) rise(inn, { from: 0, dur: 1, each: 0.035, delay: out ? 0.3 : 0, reduced });
    // os textos do lado esperam o prato passar: a pizza em arco cruza a faixa deles no meio do giro
    if (isFlavor(i)) fadeIn(items[i].els, { delay: isFlavor(prev) ? 0.68 : out ? 0.4 : 0.15, each: 0.06 });
    onShow?.(i);
  }

  function spin(to, done) {
    platTo = to;
    const dist = Math.abs(to - st.plat);
    if (reduced || dist < 0.001) { st.plat = to; done?.(); return; }
    gsap.to(st, { plat: to, duration: Math.min(1.7, 1.0 + 0.24 * (dist - 1)), ease: 'fm-swing', overwrite: 'auto', onComplete: done });
  }

  function sync() {
    if (phase === 'above') {
      if (want < 0) return;
      phase = 'toMenu';
      // rolagem rápida que já passou do cardápio: o nome nem aparece e o prato não gira
      const skip = want === N;
      texts(skip ? N : 0);
      corte.join();
      tl?.kill();
      tl = gsap.to(st, {
        menu: 1, duration: reduced ? 0 : skip ? 0.6 : 0.95, ease: 'fm-io', overwrite: 'auto',
        onComplete: () => {
          if (want === N) {
            phase = 'below';
            st.catch = 0;
            gsap.to(st, { catch: 1, duration: reduced ? 0 : 0.5, ease: 'fm-out', overwrite: 'auto' });
            return;
          }
          // a pizza chegou ao topo do prato: daqui em diante quem aparece é o prato
          st.plat = 0;
          platTo = 0;
          st.platOn = true;
          phase = 'menu';
          sync();
        },
      });
    } else if (phase === 'toMenu') {
      if (want === N) { texts(N); return; }
      if (want >= 0) { if (shown === N) texts(0); return; }
      tl?.kill();
      phase = 'above';
      texts(-1);
      gsap.to(st, { menu: 0, duration: reduced ? 0 : 0.7, ease: 'fm-io', overwrite: 'auto' });
    } else if (phase === 'menu') {
      if (isFlavor(want)) {
        // texts() não repete o que já está na tela; voltando do forno, o prato já está no sabor e só os textos entram
        texts(want);
        if (platTo !== want) spin(want);
      } else if (want < 0) {
        phase = 'toAbove';
        texts(-1);
        spin(st.plat > N / 2 ? N : 0, () => {
          wear(0); // de volta à hero: a margherita
          st.platOn = false;
          st.plat = 0;
          tl = gsap.to(st, {
            menu: 0, duration: reduced ? 0 : 0.8, ease: 'fm-io', overwrite: 'auto',
            onComplete: () => { phase = 'above'; sync(); },
          });
        });
      } else {
        phase = 'toBelow';
        texts(N);
        // o sabor da vez assenta no topo do prato (se o giro estava no meio) e é ele que vai ao forno
        const k = ((Math.round(platTo) % N) + N) % N;
        spin(platTo === N ? N : k, () => {
          wear(k);
          st.platOn = false;
          phase = 'below';
          st.catch = 0;
          gsap.to(st, { catch: 1, duration: reduced ? 0 : 0.6, ease: 'fm-out', overwrite: 'auto' });
          sync();
        });
      }
    } else if (phase === 'below') {
      if (want >= N) return;
      phase = 'menu';
      st.plat = out; // o prato volta com a pizza que desceu do forno no topo
      platTo = out;
      st.platOn = true;
      sync();
    }
  }

  /** chamado a cada quadro com o índice que o scroll pede */
  function update(i) {
    if (i === want) return;
    want = i;
    sync();
  }

  return { update, get phase() { return phase; } };
}
