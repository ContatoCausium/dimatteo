// A abertura: "Fermento" já está no lugar da hero, mas com as letras a 60% da altura, como massa antes de crescer.
// Enquanto as fotos carregam, cada letra sobe num ritmo um pouco diferente e o contador vai de 0 a 48 h. No fim,
// as letras assentam com o elástico curto. A pizza entra pelo pé, girando como na pá, assim que a foto dela fica pronta.
import { gsap } from 'gsap';
import { rise } from './words.js';

const READ = 0.45; // segundos: o mínimo de contador na tela antes de a pizza entrar (com tudo em cache)
const MIN = 1.0; // segundos: o contador precisa ser lido mesmo com tudo em cache (era 1,4; encurtado para a pizza
// da hero aparecer antes no celular, que o Google mede como "maior elemento da primeira tela")

export function loader({ words, st, assets, reduced, onDone }) {
  const box = document.querySelector('.loader');
  const num = box.querySelector('.loader__num');
  const w = words.hero;
  const jit = w.spans.map((_, i) => [0.55, 0.15, 0.8, 0.35, 0.95, 0.05, 0.65, 0.25][i % 8]);
  const shown = { p: 0 };
  let real = 0;
  let t0 = performance.now();

  gsap.set(w.el, { visibility: 'visible' });
  gsap.set(w.spans, { scaleY: 0.6, scaleX: 1.1 });

  let n = 0;
  const total = assets.length;
  const tick = () => { n++; real = n / total; };
  assets.forEach((p) => p.then(tick, tick));

  // A pizza não espera o contador: assim que a foto da hero está pronta (e o contador já foi lido por um instante),
  // ela entra pelo pé girando e o contador corre até 48 h e sai. Antes ela só entrava no fim do contador; agora a
  // primeira tela fica completa ~1 s antes no celular (o "maior elemento" que o Google mede é esta pizza).
  let intro = false;
  let rush = false;
  const startIntro = () => {
    if (intro || reduced) return;
    intro = true;
    rush = true;
    gsap.to(st, { intro: 1, duration: 1.9, ease: 'expo.out' });
  };
  Promise.allSettled(assets).then(() => {
    const wait = Math.max(0, READ - (performance.now() - t0) / 1000);
    gsap.delayedCall(wait, startIntro);
  });

  function frame() {
    const el = (performance.now() - t0) / 1000;
    const cap = Math.min(1, el / MIN);
    const goal = rush ? 1 : Math.min(real, cap);
    shown.p += (goal - shown.p) * (rush ? 0.22 : 0.12);
    if (goal >= 1 && shown.p > 0.995) shown.p = 1;
    num.textContent = String(Math.round(shown.p * 48));
    w.spans.forEach((s, i) => {
      const v = Math.min(1, Math.max(0, shown.p * 1.35 - jit[i] * 0.35));
      s.style.transform = `scale(${(1.1 - 0.06 * v).toFixed(4)},${(0.6 + 0.2 * v).toFixed(4)})`;
    });
    if (shown.p >= 1) return finish();
    requestAnimationFrame(frame);
  }

  function finish() {
    gsap.to(box, { autoAlpha: 0, y: 26, duration: 0.45, ease: 'fm-in' });
    gsap.set(w.spans, { clearProps: 'transform' });
    rise(w, { from: 0.8, dur: 1.0, each: 0.05, delay: 0.12 });
    if (!intro) { intro = true; gsap.to(st, { intro: 1, duration: 1.9, ease: 'expo.out', delay: 0.06 }); }
    onDone?.(0.95);
  }

  if (reduced) {
    num.textContent = '48';
    gsap.set(box, { autoAlpha: 0 });
    gsap.set(w.spans, { scaleY: 1, scaleX: 1 });
    st.intro = 1;
    Promise.allSettled(assets).then(() => onDone?.(0));
    return;
  }
  gsap.set(box, { autoAlpha: 1 });
  t0 = performance.now();
  requestAnimationFrame(frame);
}
