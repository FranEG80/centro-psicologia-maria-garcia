/* Genera el raster que se ve detrás del marco del mapa, antes de aceptar a
   Google.
 *
 * Por qué existe este archivo y no una captura: el mapa de Google no puede
 * cargarse sin consentimiento, así que el sustituto tiene que salir de
 * nuestro propio dominio. Las teselas se bajan UNA vez de OpenStreetMap, se
 * componen, se tiñen con la paleta y se guardan desenfocadas: el desenfoque
 * va horneado en el archivo, no en un filter de CSS, porque así no hay coste
 * de composición en cada pintado ni halo en los bordes, y el webp pesa una
 * décima parte.
 *
 * El resultado es reconocible como plano —la trama de calles, la manzana, el
 * mar abajo— sin ser legible, que es justo lo que tiene que comunicar: aquí
 * hay un mapa, y se carga si lo pides.
 *
 * OpenStreetMap es ODbL y exige atribución: la línea «© OpenStreetMap» va
 * dentro del marco, en Pie.astro. No se puede quitar.
 *
 * Uso:  node herramientas/mapa-previo.mjs
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const LAT = 36.750956;
const LON = -3.5215472;
const Z = 16; // la manzana y las calles de alrededor, el mismo zoom que el iframe
const TESELA = 256;
const RADIO = 1; // 3x3 teselas: sobra para recortar centrado en el portal

const SALIDA = new URL('../public/media/mapa-previo.webp', import.meta.url);
const ANCHO = 760;
const ALTO = 470;

const n = 2 ** Z;
const xf = ((LON + 180) / 360) * n;
const latRad = (LAT * Math.PI) / 180;
const yf =
  ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
const x0 = Math.floor(xf);
const y0 = Math.floor(yf);

/* La política de teselas de OSM exige un agente identificable y descargas
   puntuales. Esto se ejecuta a mano cuando cambia la dirección, no en cada
   build. */
const AGENTE =
  'centro-psicologia-maria-garcia/1.0 (generador del mapa estático del pie)';

async function tesela(x, y) {
  const url = `https://tile.openstreetmap.org/${Z}/${x}/${y}.png`;
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

const piezas = [];
for (let dx = -RADIO; dx <= RADIO; dx++) {
  for (let dy = -RADIO; dy <= RADIO; dy++) {
    piezas.push({
      dx,
      dy,
      buffer: await tesela(x0 + dx, y0 + dy),
    });
  }
}

const lado = (RADIO * 2 + 1) * TESELA;
const mosaico = await sharp({
  create: {
    width: lado,
    height: lado,
    channels: 3,
    background: { r: 242, g: 239, b: 233 },
  },
})
  .composite(
    piezas.map((p) => ({
      input: p.buffer,
      left: (p.dx + RADIO) * TESELA,
      top: (p.dy + RADIO) * TESELA,
    }))
  )
  .png()
  .toBuffer();

// Píxel exacto del portal dentro del mosaico, para recortar centrado en él.
const cx = Math.round((xf - x0 + RADIO) * TESELA);
const cy = Math.round((yf - y0 + RADIO) * TESELA);
const left = Math.max(0, Math.min(lado - ANCHO, cx - Math.round(ANCHO / 2)));
const top = Math.max(0, Math.min(lado - ALTO, cy - Math.round(ALTO / 2)));

/* Desenfoque corto y contraste alto, en ese orden. Con el desenfoque largo
   que se probó primero (7 px) el plano dejaba de leerse como plano: era una
   mancha gris, y entonces el marco no dice «aquí hay un mapa», que es lo
   único que tiene que decir. A 3,5 px el viario se sigue reconociendo y
   ninguna etiqueta es legible.

   Sale en gris y el color lo pone la página, no el archivo. Teñir aquí se
   probó primero y no funciona: el estilo de OSM es casi todo luminancia alta,
   y un duotono que conserva la luminancia deja el plano lavado. En el marco,
   la imagen entra en `screen` sobre el carbón del pie y el azul lo da la
   lámina de encima, que es como se tiñe todo lo demás en esta página. */
const webp = await sharp(mosaico)
  .extract({ left, top, width: ANCHO, height: ALTO })
  .greyscale()
  .blur(3.5)
  .linear(1.18, -16)
  .webp({ quality: 70 })
  .toBuffer();

await writeFile(SALIDA, webp);
console.log(
  `mapa-previo.webp  ${ANCHO}x${ALTO}  ${(webp.length / 1024).toFixed(1)} kB`
);
