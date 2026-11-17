import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// O CSS do site (25 KB) entra direto no <head> de cada página, como <style>: o navegador não espera baixar um
// arquivo antes de desenhar a primeira tela (o Lighthouse apontava o .css como "bloqueando a renderização").
// As fontes dentro dele continuam com o endereço /assets/... e font-display: swap.
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const css = Object.values(bundle).filter((f) => f.type === 'asset' && f.fileName.endsWith('.css'));
      const pages = Object.values(bundle).filter((f) => f.type === 'asset' && f.fileName.endsWith('.html'));
      for (const page of pages) {
        let html = String(page.source);
        for (const c of css) {
          const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${c.fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
          if (tag.test(html)) html = html.replace(tag, () => `<style>${c.source}</style>`);
        }
        page.source = html;
      }
      // o .css que ficou embutido em todas as páginas não precisa ir para o dist/
      for (const c of css) {
        const used = pages.some((p) => String(p.source).includes(`/${c.fileName}`));
        if (!used) delete bundle[c.fileName];
      }
    },
  };
}

export default defineConfig({
  plugins: [inlineCss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacidade: resolve(import.meta.dirname, 'privacidade.html'),
      },
    },
  },
});
