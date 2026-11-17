// A pizza que atravessa o site: inteira, em 8 fatias (recortes em cunha da mesma foto, que por isso encaixam
// perfeito) e com a carretilha. A pose (posição, tamanho, giro, inclinação) vem do palco a cada quadro.
import { CRUST } from './layout.js';

const N = 8;
const RAYS = 4; // diâmetros da carretilha

// ruído pequeno e fixo ao longo de cada raio de corte: o corte não sai riscado a régua, e as duas fatias vizinhas
// usam o mesmo traçado, então se fecham sem fresta
function rayNoise(k) {
  let s = 1013 + k * 7919;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 9 }, (_, i) => (i === 0 || i === 8 ? 0 : (rnd() - 0.5) * 0.006));
}

export function pizza(root) {
  const body = root.querySelector('.pz__body');
  const whole = root.querySelector('.pz__whole');
  const box = root.querySelector('.pz__slices');
  const cuts = [...root.querySelectorAll('.pz__cuts i')];
  const fire = root.querySelector('.pz__fire');
  const shadow = root.querySelector('.pz__shadow');
  let S = 1000; // lado do elemento (px), igual ao maior tamanho em que a pizza aparece

  const noise = Array.from({ length: N }, (_, k) => rayNoise(k));
  const slices = [];
  for (let i = 0; i < N; i++) {
    const el = document.createElement('div');
    el.className = 'slice';
    el.innerHTML = '<div class="slice__img"></div>';
    box.append(el);
    // giro de cada fatia ao se soltar (graus) e um tico de atraso, para não saírem em bloco
    slices.push({ el, img: el.firstChild, v: 0, spin: [2.2, -1.6, 1.4, -2.6, 1.8, -1.2, 2.8, -2][i], bis: 0, cx: 0, cy: 0, ox: 0, oy: 0 });
  }

  // as fatias recortam a mesma foto que a <img> inteira: a do srcset que o navegador escolheu (só se sabe depois de
  // ela carregar; o corte vem bem depois da abertura, que espera esta foto)
  const useSrc = () => { const u = whole.currentSrc || whole.src; slices.forEach((sl) => { sl.img.style.backgroundImage = `url(${u})`; }); };
  if (whole.complete && whole.currentSrc) useSrc(); else whole.addEventListener('load', useSrc, { once: true });

  // geometria das cunhas em px do elemento (S × S)
  function build(size) {
    S = size;
    root.style.width = root.style.height = `${S}px`;
    const c = S / 2, far = S * 0.53;
    const ray = (k, t) => {
      const a = (k * 360) / N * (Math.PI / 180);
      const r = far * t, n = noise[k % N][Math.round(t * 8)] * S;
      return [c + Math.cos(a) * r - Math.sin(a) * n, c + Math.sin(a) * r + Math.cos(a) * n];
    };
    slices.forEach((sl, i) => {
      const pts = [[c, c]];
      for (let j = 1; j <= 8; j++) pts.push(ray(i, j / 8));
      const mid = ((i + 0.5) * 360) / N * (Math.PI / 180);
      pts.push([c + Math.cos(mid) * far * 1.04, c + Math.sin(mid) * far * 1.04]);
      for (let j = 8; j >= 1; j--) pts.push(ray(i + 1, j / 8));
      const xs = pts.map((p) => Math.min(S, Math.max(0, p[0])));
      const ys = pts.map((p) => Math.min(S, Math.max(0, p[1])));
      const x0 = Math.floor(Math.min(...xs)), y0 = Math.floor(Math.min(...ys));
      const x1 = Math.ceil(Math.max(...xs)), y1 = Math.ceil(Math.max(...ys));
      Object.assign(sl.el.style, { left: `${x0}px`, top: `${y0}px`, width: `${x1 - x0}px`, height: `${y1 - y0}px` });
      Object.assign(sl.img.style, {
        left: `${-x0}px`, top: `${-y0}px`, width: `${S}px`, height: `${S}px`,
        clipPath: `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(',')})`,
      });
      // a fatia gira em volta do próprio miolo e sai pela bissetriz
      sl.bis = mid;
      sl.cx = c + Math.cos(mid) * S * 0.28 - x0;
      sl.cy = c + Math.sin(mid) * S * 0.28 - y0;
      sl.el.style.transformOrigin = `${sl.cx}px ${sl.cy}px`;
    });
    cuts.forEach((el, k) => {
      const a = (k * 180) / RAYS, r = S * CRUST * 0.49; // a carretilha corre de borda a borda, sem passar para o fundo
      const rad = (a * Math.PI) / 180;
      Object.assign(el.style, {
        left: `${c - Math.cos(rad) * r}px`, top: `${c - Math.sin(rad) * r}px`, width: `${2 * r}px`,
      });
      el.dataset.a = a;
    });
  }

  let last = '';
  /** pose: { x, y, d, rot, tilt, fire, show } — d é o diâmetro da borda na tela */
  function render(p) {
    if (!p.show) {
      if (last !== 'off') { root.style.visibility = 'hidden'; last = 'off'; }
      return;
    }
    const k = p.d / CRUST / S;
    const t = `translate3d(${(p.x - S / 2).toFixed(2)}px,${(p.y - S / 2).toFixed(2)}px,0) scale(${k.toFixed(5)})${
      p.tilt ? ` perspective(${(S * 2.1).toFixed(0)}px) rotateX(${p.tilt.toFixed(3)}deg)` : ''}`;
    const key = t + p.rot.toFixed(3) + (p.fire || 0).toFixed(3) + lift.toFixed(3) + (p.front ? 'f' : '');
    if (key === last) return;
    last = key;
    root.style.visibility = 'visible';
    root.style.zIndex = p.front ? 5 : '';
    root.style.transform = t;
    body.style.transform = `rotate(${p.rot.toFixed(3)}deg)`;
    fire.style.opacity = (p.fire || 0).toFixed(3);
    shadow.style.opacity = ((1 - (p.fire || 0) * 0.85) * (1 - 0.8 * lift)).toFixed(3);
  }

  let sliced = false;
  let lift = 0; // quanto as fatias estão soltas: a sombra única dá lugar à sombra de cada fatia
  /** v: separação de cada fatia (0 inteira, 1 solta); lines: progresso de cada risco da carretilha */
  function renderSlices(lines) {
    const any = slices.some((s) => s.v > 0.0005);
    lift = any ? Math.max(...slices.map((s) => s.v)) : 0;
    if (any !== sliced) {
      sliced = any;
      whole.style.visibility = any ? 'hidden' : 'inherit'; // inherit: 'visible' furava o pai escondido
      box.style.display = any ? 'block' : 'none';
    }
    if (any) {
      const d = S * 0.07;
      for (const s of slices) {
        const e = s.v;
        s.el.style.transform = `translate3d(${(Math.cos(s.bis) * d * e).toFixed(2)}px,${(Math.sin(s.bis) * d * e).toFixed(2)}px,0) rotate(${(s.spin * e).toFixed(3)}deg)`;
      }
    }
    cuts.forEach((el, k) => {
      const v = lines[k];
      el.style.transform = `rotate(${el.dataset.a}deg) scaleX(${v.p.toFixed(4)})`;
      el.style.opacity = v.o.toFixed(3);
    });
  }

  return { root, slices, build, render, renderSlices, get size() { return S; } };
}
