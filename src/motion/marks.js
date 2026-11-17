// Os marcos do palco, em telas de rolagem (100vh) desde o começo do pin. Tudo que segue o scroll (imagem) usa as
// faixas [início, fim]; o que troca por tempo (texto, fatias, prato, tampa, card) dispara quando o marco passa.
export const M = {
  end: 13.5,
  rise: [0, 1], // a pizza sobe ao centro
  heroOut: 0.03,
  cut: 0.95, // carretilha e fatias
  menu: 1.9, // as fatias fecham e o disco desce para o prato
  steps: [1.9, 2.65, 3.4, 4.15, 4.9], // um sabor por marco
  menuOut: 5.65, // o prato devolve a margherita (o giro leva ~1 s; o forno só começa depois)
  toDark: [5.95, 6.45], // farinha → preto-brasa
  lit: [6.05, 6.8], // o fogo acende (só depois que a página escureceu um pouco)
  ovenIn: [6.1, 6.95], // a pizza deita e entra pela boca do forno
  forno: [7.0, 7.95], // "90 segundos a 450 °C"
  ovenOut: [7.95, 8.55], // a pizza sai pela frente
  open: [8.0, 8.7], // a boca vira card de largura inteira
  massaUp: [8.05, 8.65], // a macro da massa sobe dentro dele
  massa: [8.7, 9.65], // "48 h"
  shut: [9.65, 10.3], // o card encolhe até a caixa
  kraft: [9.67, 10.2], // o kraft sobe por cima da massa
  toLight: [9.7, 10.1], // preto-brasa → farinha
  tray: [10.05, 10.3], // aparece a caixa aberta (fotografia)
  drop: 10.3, // a pizza cai na caixa
  lid: 10.7, // a tampa fecha
  card: 11.15, // a caixa vira o card de pedido
  foot: [12.5, 13.5], // o rodapé sobe por cima do card, com a borda de papel rasgado
  go: { topo: 0, cardapio: 1.95, forno: 7.1, pedido: 11.7, reservas: 11.7 },
};
