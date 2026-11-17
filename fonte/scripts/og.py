"""Imagem de compartilhamento (WhatsApp, Instagram, Google): 1200 x 630, o espelho da hero do site.
uso: py fonte/scripts/og.py <pasta com ClashDisplay-Bold.otf e CabinetGrotesk-Medium.otf>"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

F = Path(sys.argv[1])
W, H = 1200, 630
FARINHA, VINHO, TINTA = (240, 232, 219), (146, 31, 49), (21, 17, 14)
img = Image.new('RGB', (W, H), FARINHA)
d = ImageDraw.Draw(img)

# "Di Matteo" na largura toda, como na hero
big = ImageFont.truetype(str(F / 'ClashDisplay-Bold.otf'), 100)
word = 'Di Matteo'
x0, y0, x1, y1 = d.textbbox((0, 0), word, font=big)
size = 100 * (W - 2 * 34) / (x1 - x0)
big = ImageFont.truetype(str(F / 'ClashDisplay-Bold.otf'), round(size))
x0, y0, x1, y1 = d.textbbox((0, 0), word, font=big)
top = 70
d.text((34 - x0, top - y0), word, font=big, fill=VINHO)
base = top + (y1 - y0)

# a pizza na frente do pé das letras, cortada pelo pé da imagem
pz = Image.open('public/img/pizza-marguerita.webp').convert('RGBA')
side = 720
pz = pz.resize((side, side), Image.LANCZOS)
img.paste(pz, ((W - side) // 2, base - 70), pz)

# os textos laterais
small = ImageFont.truetype(str(F / 'CabinetGrotesk-Medium.otf'), 30)
y = base + 26
for i, line in enumerate(['Massa de 48 horas', 'e molho pomodoro', 'pelati.']):
    d.text((40, y + i * 38), line, font=small, fill=TINTA)
for i, line in enumerate(['Delivery em Recife', 'Campo Grande']):
    w = d.textlength(line, font=small)
    d.text((W - 40 - w, y + i * 38), line, font=small, fill=TINTA)

img.save('public/og.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
print('public/og.jpg', Path('public/og.jpg').stat().st_size // 1024, 'KB')
