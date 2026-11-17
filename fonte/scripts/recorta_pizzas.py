"""Recorta as pizzas geradas em fundo azul (#0000FF) e alinha a borda no mesmo círculo (92% de 1400 px),
como o alinha.py da Fermento, mas só com PIL (sem o Vision do macOS).
uso: py fonte/scripts/recorta_pizzas.py   (da raiz do projeto)"""
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageDraw

OUT, CRUST = 1400, 0.92
src = Path('fonte/azul')
for f in sorted(src.glob('pizza-*.jpg')):
    im = Image.open(f).convert('RGB')
    r, g, b = im.split()
    dom = ImageChops.subtract(b, ImageChops.lighter(r, g))  # quanto o azul domina
    alpha = dom.point(lambda v: 255 if v <= 40 else 0 if v >= 110 else int(255 * (1 - (v - 40) / 70)))
    # só o disco: fecha buracos (ingredientes azulados não existem, mas por garantia) e acha o círculo pelo bbox
    hard = alpha.point(lambda v: 255 if v > 128 else 0)
    x0, y0, x1, y1 = hard.getbbox()
    cx, cy, R = (x0 + x1) / 2, (y0 + y1) / 2, ((x1 - x0) + (y1 - y0)) / 4
    disc = Image.new('L', im.size, 0)
    ImageDraw.Draw(disc).ellipse((cx - R * 0.9, cy - R * 0.9, cx + R * 0.9, cy + R * 0.9), fill=255)
    alpha = ImageChops.lighter(alpha, disc).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    b = ImageChops.darker(b, ImageChops.lighter(r, g))  # tira o reflexo azul da beira
    cut = Image.merge('RGBA', (r, g, b, alpha))
    s = (CRUST * OUT) / (2 * R)
    big = cut.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', (OUT, OUT), (0, 0, 0, 0))
    canvas.paste(big, (round(OUT / 2 - cx * s), round(OUT / 2 - cy * s)), big)
    dst = Path('public/img') / (f.stem + '.webp')
    canvas.save(dst, 'WEBP', quality=88, method=6)
    print(f'{dst} centro {cx:.0f},{cy:.0f} raio {R:.0f} escala {s:.3f}')

# folha de conferência: as cinco lado a lado sobre a farinha e sobre o vinho
names = ['marguerita', 'calabresa', 'frango', 'lombo', 'costelinha']
sheet = Image.new('RGB', (1500, 600), (240, 232, 219))
sheet.paste((146, 31, 49), (0, 300, 1500, 600))
for i, n in enumerate(names):
    p = Image.open(f'public/img/pizza-{n}.webp').resize((290, 290), Image.LANCZOS)
    sheet.paste(p, (5 + i * 300, 5), p); sheet.paste(p, (5 + i * 300, 305), p)
sheet.save('fonte/conferencia-pizzas.jpg', quality=88)
