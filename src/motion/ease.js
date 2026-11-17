// Curvas da Fermento. As mesmas ficam em variáveis CSS (tokens.css) para as transições de hover.
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

CustomEase.create('fm-out', '0.16,1,0.3,1'); // entradas
CustomEase.create('fm-in', '0.7,0,0.84,0'); // saídas
CustomEase.create('fm-io', '0.76,0,0.24,1'); // passagens grandes (fatias, card)
CustomEase.create('fm-swing', '0.62,0,0.22,1'); // o prato giratório
// a massa crescendo: passa de 100%, volta um pouco abaixo e assenta
CustomEase.create('fm-rise', 'M0,0 C0.14,0 0.2,1.09 0.4,1.085 C0.56,1.08 0.6,0.976 0.74,0.982 C0.86,0.988 0.9,1 1,1');
// o clique solto (botões e o prato): volta passando um tico, como massa apertada; o mesmo --fm-back do CSS
CustomEase.create('fm-back', '0.2,1.6,0.38,1');
// a pizza caindo na caixa: chega, afunda um tico e assenta
CustomEase.create('fm-drop', 'M0,0 C0.3,0 0.42,0.72 0.62,1.018 C0.7,1.03 0.8,0.996 1,1');
