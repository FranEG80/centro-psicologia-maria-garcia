"""Mide el contraste real de cada línea de área contra el fondo que tiene
debajo, sobre el PNG ya renderizado. No estima: muestrea el píxel.

Para cada línea toma su banda de altura, separa trazo de fondo por
luminancia, y calcula la razón WCAG 2.1 entre la mediana del trazo y la
mediana del fondo local. El fondo local importa: el haz es un degradado, así
que cada línea tiene el suyo. Sin dependencias más allá de Pillow."""

import sys
from statistics import median
from PIL import Image


def lum_canal(v):
    c = v / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminancia(rgb):
    r, g, b = (lum_canal(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = luminancia(a), luminancia(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


ruta, top, alto = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
etiqueta = sys.argv[4] if len(sys.argv) > 4 else ''
# Ventana horizontal ajustable: en palabras cortas la ventana ancha muestrea
# sobre todo fondo vacío y el percentil bajo acaba cogiendo el antialias del
# borde en vez del trazo, lo que hunde la lectura sin motivo real.
xa = int(sys.argv[5]) if len(sys.argv) > 5 else 330
xb = int(sys.argv[6]) if len(sys.argv) > 6 else 1180

im = Image.open(ruta).convert('RGB')
# La columna de texto arranca en x=336 del frame de 1440, más 80 de recorte.
banda = im.crop((80 + xa, top, 80 + xb, top + alto))
pix = list(banda.getdata())

conluz = sorted(((luminancia(p), p) for p in pix), key=lambda t: t[0])
n = len(conluz)
trazo = [p for _, p in conluz[: max(1, n * 8 // 100)]]
fondo = [p for _, p in conluz[n * 82 // 100:]]

ct = tuple(int(median([p[i] for p in trazo])) for i in range(3))
cf = tuple(int(median([p[i] for p in fondo])) for i in range(3))
r = contraste(ct, cf)
hexa = lambda c: '#%02X%02X%02X' % c
estado = 'OK' if r >= 4.5 else 'FALLA AA'
print(f'{etiqueta:<26} {hexa(ct)} sobre {hexa(cf)}  =  {r:5.2f}:1   {estado}')
