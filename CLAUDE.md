# Di Matteo Pizzaria — site (base: template Fermento, ProfitizeBuild)

Landing page da Di Matteo Pizzaria (Estr. de Belém, 1462, Campo Grande, Recife). Construída a partir da template
**Fermento** (ProfitizeBuild, item `fermento`, já é da conta: o guia completo sai de graça com `abrir_meu_item`).
Vite sem framework, GSAP (ScrollTrigger, CustomEase) + Lenis. A mesma pizza atravessa o site: hero → corte em 8 →
cardápio giratório → forno → massa → caixa → card de pedido → rodapé rasgado.

## O que mudou em relação à demo
- Marca: palavra gigante e carimbo "Di Matteo"; `--vermelho` virou o vinho do logo (#921f31) e há `--vermelho-aceso`
  (#d9475a) para o forno e o "48 h", onde o vinho apaga no preto-brasa. `words.js` dá 14% de folga ao espaço.
- Gravura do rodapé repintada em vinho (original em `fonte/gravura-fermento.webp`).
- Sabores (preços reais do Cardápio Web, nov/2026): Marguerita 59, Calabresa 59, Frango com Catupiry 65,
  Lombo com cream cheese 65, Costelinha bacon e barbecue 80,99. Os botões "Pedir …" e "Delivery" levam ao
  cardápio online (app.cardapioweb.com/di_matteo).
- Pizzas geradas por IA (OpenRouter, `../hamburgueria/scripts/gerar_imagem.py`), prompts em `fonte/prompts/`,
  em fundo azul e recortadas/alinhadas por `fonte/scripts/recorta_pizzas.py` (PIL, sem o Vision do macOS).
- Forno sem "90 segundos a 450 °C" (fato não confirmado): o `forno.js` pula o contador quando não há `.forno__num`.

## Regras (da Fermento, continuam valendo)
- Scroll dirige imagem; tempo dirige texto. Títulos com 2 linhas no máximo. Curvas só de `ease.js`/`--fm-*`.
- As cinco pizzas no mesmo círculo (92% de 1400 px), mesma luz: senão o prato giratório "pula".
- Nada de fato inventado (preço, horário, tempo de entrega): o que não se sabe fica `[preencher]`.
- Todo clicável novo entra no sistema de interações (`lnk`/`btn`, `interacoes.css`).
- Mudar número de sabores: `index.html` + `steps` em `marks.js` (o prato divide a volta sozinho).

## Rodar
`npm run dev` (porta 5182) · `npm run build` → `dist/` em qualquer hospedagem estática.

## Desempenho e SEO (Raio-X ProfitizeBuild, nov/2026)
- Pizzas em 3 larguras (800, 1100, 1400) em `<picture>`: AVIF q50 na frente, WebP q78 de reserva; as fatias usam o
  `currentSrc` da `<img>` inteira. Gere de novo com `py fonte/scripts/recorta_pizzas.py`.
- Na abertura só baixa a pizza da hero (preload AVIF). Os outros sabores, forno, massa, caixa e a gravura vêm com
  `data-src`/`data-srcset` e baixam no primeiro gesto (rolar, tocar, clicar, teclar): `loadScenes()` em `main.js`.
  Imagem nova abaixo da primeira tela segue o mesmo esquema.
- O rodapé fica `visibility: hidden` enquanto `body.is-loading` (antes do pin ele cai na primeira tela).
- Abertura com mínimo de 1,0 s (`loader.js`). PageSpeed celular (nov/2026): 92, LCP 3,3 s, SEO/acessibilidade 100.
- O CSS vai embutido no `<head>` no build (plugin `inlineCss` em `vite.config.js`): nada bloqueia a primeira tela.
- `public/og.jpg` (1200x630, `fonte/scripts/og.py`), tags og/twitter, JSON-LD `Restaurant` (sem horário: os dias
  ainda não foram confirmados), `robots.txt`, `sitemap.xml`, página `/privacidade` (`privacidade.html`,
  `cleanUrls` no `vercel.json`).
