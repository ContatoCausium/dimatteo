// Rodapé: o espelho da hero. Quando ele chega, "Fermento" cresce como massa atrás dos morros da gravura; a gravura
// sobe um pouco mais devagar que a página (só a imagem segue o scroll). A nav sai quando o rodapé chega nela.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { rise, fall, setUp, place, fitSize } from './words.js';
import { titleIn, fadeIn } from './texts.js';

export function rodape({ words, reduced, nav }) {
  const root = document.querySelector('.rodape');
  const scene = root.querySelector('.rodape__scene');
  const land = root.querySelector('.rodape__land');
  const lead = root.querySelector('.rodape__lead');
  const rest = [...root.querySelectorAll('.rodape__cta, .rodape__info p')];
  setUp(words.foot, false);
  gsap.set([lead, ...rest], { autoAlpha: 0 });

  // a palavra na largura toda, com a base um terço da altura de versal abaixo do topo dos morros: os morros cobrem o
  // pé das letras, como a pizza cobre na hero. A gravura preenche a altura da cena (2:1 no desktop, cover no celular),
  // então a fração medida na imagem vale direto na cena.
  const HILL = 0.344; // topo dos morros na gravura, em fração da altura (mediana, medida em fonte/gravura.py)
  function build() {
    const W = scene.clientWidth, H = scene.clientHeight;
    const m = W < 760 ? 10 : Math.max(6, W * 0.006);
    const fs = fitSize(words.foot, W - 2 * m);
    const cap = (words.foot.m.cap * fs) / 100;
    place(words.foot, { fs, x: m, base: H * HILL + cap * 0.34 });
  }
  build();
  ScrollTrigger.addEventListener('refresh', build);

  ScrollTrigger.create({
    trigger: root,
    start: 'top 80%',
    once: true,
    onEnter: () => { titleIn(lead); fadeIn(rest, { delay: 0.2, each: 0.06 }); },
  });
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 85%',
    onEnter: () => rise(words.foot, { from: 0.25, dur: 1.05, each: 0.05, reduced }),
    onLeaveBack: () => fall(words.foot, { reduced }),
  });
  ScrollTrigger.create({
    trigger: root,
    start: 'top 96px',
    onEnter: () => nav.away(true),
    onLeaveBack: () => nav.away(false),
  });
  if (!reduced) {
    gsap.fromTo(land, { yPercent: 10 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}
