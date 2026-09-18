/* Convierte estructura-y-textos.md en un PDF con el estilo de los documentos
   ya entregados al cliente: Playfair Display para los títulos, Inter para el
   texto, filetes finos, versalitas espaciadas y el azul petróleo como único
   acento. Papel blanco: este es un documento de trabajo para leer y anotar,
   no una pieza de presentación, así que no lleva ni fondo de color ni muestras
   de paleta.

   Las fuentes van empotradas en base64 para que el HTML intermedio se pueda
   abrir y reimprimir en cualquier máquina sin depender de Google Fonts.

   El markdown se convierte con un conversor propio acotado al subconjunto que
   usa el documento. No es un parser general y no pretende serlo: convertir
   solo lo que hay evita arrastrar una dependencia para seis construcciones. */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const fuente = (f) =>
  `data:font/ttf;base64,${readFileSync(resolve(aqui, 'fuentes', f)).toString('base64')}`;

const FUENTES = {
  playfair: fuente('playfair-regular.ttf'),
  playfairIt: fuente('playfair-italic.ttf'),
  playfairSb: fuente('playfair-semibold.ttf'),
  inter: fuente('inter-regular.ttf'),
  interMd: fuente('inter-medium.ttf'),
  interSb: fuente('inter-semibold.ttf'),
};

/* -- Conversor de markdown ------------------------------------------------ */

const escapar = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Las marcas de procedencia se convierten en píldoras. Es la única
   transformación con criterio propio: en el MD son texto y aquí son un
   elemento con significado visual, porque el lector las va a usar para
   saber qué puede publicar tal cual y qué necesita revisión. */
const PILDORAS = { V: 'verificado', R: 'redactado', P: 'pendiente' };

const enLinea = (s) => {
  let t = escapar(s);
  t = t.replace(/\*\*\[([VRP])\]\*\*/g, (_, k) => `<b class="marca m-${PILDORAS[k]}">${k}</b>`);
  t = t.replace(/\[([VRP])\]/g, (_, k) => `<b class="marca m-${PILDORAS[k]}">${k}</b>`);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  /* Cursiva con un solo asterisco, después de la negrita para que `**x**` ya
     esté consumido y no se parta por la mitad. */
  t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  t = t.replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:)]|$)/g, '$1<em>$2</em>');
  t = t.replace(/⚠/g, '<span class="aviso">⚠</span>');
  return t;
};

function convertir(md) {
  const lineas = md.split('\n');
  const salida = [];
  let i = 0;

  const esFilaTabla = (l) => /^\s*\|.*\|\s*$/.test(l);
  const celdas = (l) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

  while (i < lineas.length) {
    const l = lineas[i];

    if (/^\s*$/.test(l)) { i++; continue; }

    if (/^---+\s*$/.test(l)) { salida.push('<hr>'); i++; continue; }

    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const n = h[1].length;
      salida.push(`<h${n}>${enLinea(h[2])}</h${n}>`);
      i++;
      continue;
    }

    if (l.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lineas.length && !lineas[i].startsWith('```')) buf.push(lineas[i++]);
      i++;
      salida.push(`<pre>${escapar(buf.join('\n'))}</pre>`);
      continue;
    }

    if (esFilaTabla(l) && esFilaTabla(lineas[i + 1] || '') && /^[\s|:-]+$/.test(lineas[i + 1])) {
      const cab = celdas(l);
      i += 2;
      const filas = [];
      while (i < lineas.length && esFilaTabla(lineas[i])) filas.push(celdas(lineas[i++]));
      const vacia = cab.every((c) => c === '');
      const thead = vacia
        ? ''
        : `<thead><tr>${cab.map((c) => `<th>${enLinea(c)}</th>`).join('')}</tr></thead>`;
      const tbody = filas
        .map((f) => `<tr>${f.map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`)
        .join('');
      salida.push(`<table class="${vacia ? 'sin-cabecera' : ''}">${thead}<tbody>${tbody}</tbody></table>`);
      continue;
    }

    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i])) {
        buf.push(lineas[i].replace(/^>\s?/, ''));
        i++;
      }
      const parrafos = buf
        .join('\n')
        .split(/\n\s*\n/)
        .map((p) => `<p>${enLinea(p.replace(/\n/g, ' ').trim())}</p>`)
        .join('');
      salida.push(`<blockquote>${parrafos}</blockquote>`);
      continue;
    }

    if (/^(\s*)[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) {
      const ordenada = /^\s*\d+\.\s+/.test(l);
      const items = [];
      while (
        i < lineas.length &&
        (/^(\s*)[-*]\s+/.test(lineas[i]) ||
          /^\s*\d+\.\s+/.test(lineas[i]) ||
          /^\s{2,}\S/.test(lineas[i]))
      ) {
        if (/^\s{2,}\S/.test(lineas[i]) && items.length) {
          items[items.length - 1] += ' ' + lineas[i].trim();
        } else {
          items.push(lineas[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''));
        }
        i++;
      }
      const tag = ordenada ? 'ol' : 'ul';
      salida.push(`<${tag}>${items.map((x) => `<li>${enLinea(x)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const buf = [];
    while (i < lineas.length && !/^\s*$/.test(lineas[i]) && !/^[#>\-|`]/.test(lineas[i])) {
      buf.push(lineas[i++]);
    }
    if (buf.length) salida.push(`<p>${enLinea(buf.join(' '))}</p>`);
    else i++;
  }

  return salida.join('\n');
}

/* -- Documento ------------------------------------------------------------ */

const md = readFileSync(resolve(aqui, 'estructura-y-textos.md'), 'utf8');

/* El encabezado del documento se compone aparte: en el markdown es un H1 con
   subtítulo, y aquí tiene que ser la portadilla con filete y metadatos que
   llevan los otros documentos entregados. */
const cuerpo = convertir(
  md
    .replace(/^# .*\n## .*\n/, '')
    /* El párrafo de entrada se retira entero, hasta la línea en blanco: si se
       corta solo la primera línea queda su cola suelta en el cuerpo. */
    .replace(/^María: esto es todo[\s\S]*?\n\s*\n/m, '')
);

const css = `
@font-face { font-family:'Playfair Display'; src:url('${FUENTES.playfair}') format('truetype'); font-weight:400; font-style:normal; }
@font-face { font-family:'Playfair Display'; src:url('${FUENTES.playfairIt}') format('truetype'); font-weight:400; font-style:italic; }
@font-face { font-family:'Playfair Display'; src:url('${FUENTES.playfairSb}') format('truetype'); font-weight:600; font-style:normal; }
@font-face { font-family:'Inter'; src:url('${FUENTES.inter}') format('truetype'); font-weight:400; }
@font-face { font-family:'Inter'; src:url('${FUENTES.interMd}') format('truetype'); font-weight:500; }
@font-face { font-family:'Inter'; src:url('${FUENTES.interSb}') format('truetype'); font-weight:600; }

:root {
  --crema:#F8F4EB; --lino:#EDE6D8; --petroleo:#35617F;
  --topo:#A79E90; --piedra:#8C8375; --carbon:#1F2426;
  --piedra-oscura:#6E665A; --petroleo-800:#2A4B62;
}

@page { size:A4; margin:17mm 16mm 16mm; }

* { box-sizing:border-box; }
html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }

/* Papel blanco. El crema se queda como acento —filetes, rellenos y
   píldoras—, no como fondo: puesto en body no sangraba al borde del folio,
   porque los márgenes de @page caen fuera de esa caja y dejaban un marco
   blanco alrededor del color. */
body {
  margin:0; background:#FFFFFF; color:var(--carbon);
  font-family:'Inter', sans-serif; font-size:9.4pt; line-height:1.62;
}

/* -- Portadilla ---------------------------------------------------------- */
.portada { margin-bottom:13mm; }
.cintillo {
  display:flex; justify-content:space-between; align-items:baseline;
  font-size:7.2pt; letter-spacing:.2em; font-weight:500; color:var(--piedra);
  text-transform:uppercase;
  padding-bottom:4mm; border-bottom:1px solid #C9C4B8;
}
.portada h1 {
  font-family:'Playfair Display', serif; font-weight:400;
  font-size:30pt; line-height:1.1; letter-spacing:-.005em;
  margin:8mm 0 0; color:var(--carbon);
}
.portada .lede {
  font-family:'Playfair Display', serif; font-style:italic;
  font-size:12.5pt; color:var(--petroleo); margin:4mm 0 0;
}
.portada .entrada { margin:6mm 0 0; max-width:150mm; color:var(--piedra-oscura); }

/* -- Jerarquía ------------------------------------------------------------ */
/* Cada sección numerada empieza en folio nuevo. Dejarlas fluir partía las
   tablas largas —el mapa del sitio, sobre todo— entre dos páginas. */
h2 {
  font-family:'Playfair Display', serif; font-weight:400; font-size:17pt;
  margin:0 0 0; padding-bottom:2.5mm; border-bottom:1px solid #C9C4B8;
  break-before:page; break-after:avoid;
}
h3 {
  font-family:'Playfair Display', serif; font-weight:600; font-size:11.5pt;
  margin:7mm 0 0; color:var(--petroleo-800); break-after:avoid;
}
h4 {
  font-size:7.6pt; letter-spacing:.18em; text-transform:uppercase;
  font-weight:600; color:var(--piedra); margin:5.5mm 0 0; break-after:avoid;
}
p { margin:2.5mm 0 0; }
hr { display:none; }

ul, ol { margin:2.5mm 0 0; padding-left:5mm; }
li { margin:.9mm 0; }
li::marker { color:#B4AEA1; }

strong { font-weight:600; }
em { font-style:italic; }
code {
  font-family:'Inter', monospace; font-size:8.4pt;
  background:#F1F0EC; padding:.3mm 1.4mm; border-radius:2px;
  color:var(--petroleo-800);
}
pre {
  font-family:'Inter', monospace; font-size:8.2pt; line-height:1.55;
  background:#FAFAF9; border:1px solid #E6E4DF; border-left:2px solid var(--petroleo);
  padding:4mm 5mm; margin:3.5mm 0 0; white-space:pre-wrap; break-inside:avoid;
  color:var(--piedra-oscura);
}

/* -- Citas: los textos que van a la web ---------------------------------- */
blockquote {
  margin:3.5mm 0 0; padding:4mm 6mm; background:#FAFAF9;
  border-left:2px solid var(--petroleo); break-inside:avoid;
}
blockquote p {
  margin:0 0 2mm; font-family:'Playfair Display', serif; font-size:10.5pt;
  line-height:1.55; color:var(--carbon);
}
blockquote p:last-child { margin-bottom:0; }

/* -- Tablas --------------------------------------------------------------- */
table {
  width:100%; border-collapse:collapse; margin:3.5mm 0 0;
  font-size:8.6pt;
}
th {
  text-align:left; font-size:7pt; letter-spacing:.16em; text-transform:uppercase;
  font-weight:600; color:var(--crema); background:var(--petroleo);
  padding:2.2mm 3mm;
}
td { padding:2.2mm 3mm; border-bottom:1px solid #E6E4DF; vertical-align:top; }
tbody tr:nth-child(even) td { background:#FAFAF9; }
table.sin-cabecera td:first-child {
  font-weight:500; color:var(--piedra-oscura); width:42%;
}

/* -- Marcas de procedencia ------------------------------------------------ */
.marca {
  display:inline-block; min-width:4.6mm; text-align:center;
  font-size:6.6pt; font-weight:600; letter-spacing:.06em;
  padding:.35mm 1.5mm; border-radius:2.5px; vertical-align:.4mm;
  border:1px solid transparent;
}
.m-verificado { background:var(--petroleo); color:var(--crema); }
.m-redactado  { background:#F1F0EC; color:var(--piedra-oscura); border-color:#C9C4B8; }
.m-pendiente  { background:#FFFFFF; color:var(--petroleo); border-color:var(--petroleo); }
.aviso { color:var(--petroleo); font-weight:600; }

/* -- Leyenda de marcas ---------------------------------------------------- */
.leyenda { display:flex; gap:4mm; margin:5mm 0 0; flex-wrap:wrap; }
.leyenda span {
  font-size:7.4pt; border:1px solid #C9C4B8; border-radius:20px;
  padding:1.2mm 3.5mm; color:var(--piedra-oscura); background:#FFFFFF;
}

/* -- Pie ------------------------------------------------------------------ */
.pie {
  margin-top:12mm; padding-top:4mm; border-top:1px solid #C9C4B8;
  display:flex; justify-content:space-between; align-items:baseline;
}
.pie .nombre { font-family:'Playfair Display', serif; font-size:12pt; }
.pie .datos { font-size:8pt; color:var(--piedra-oscura); }
.pie .fecha {
  font-size:7.2pt; letter-spacing:.2em; text-transform:uppercase; color:var(--piedra);
}

h2, h3, h4 { break-after:avoid-page; }
blockquote, pre { break-inside:avoid-page; }
/* Las tablas cortas no se parten, pero las largas sí: forzar avoid en todas
   empujaba tablas de doce filas a la página siguiente y dejaba medio folio
   en blanco. Se protegen las filas, que es lo que de verdad no debe partirse. */
table { break-inside:auto; }
tr { break-inside:avoid; break-after:auto; }
thead { display:table-header-group; }
`;

const hoy = new Date().toLocaleDateString('es-ES', {
  day: 'numeric', month: 'long', year: 'numeric',
});

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Las páginas de la web y sus textos · Centro de Psicología María García</title>
<style>${css}</style></head>
<body>

<header class="portada">
  <div class="cintillo">
    <span>Centro de Psicología María García</span>
    <span>Textos de la web</span>
  </div>
  <h1>Las páginas de la web y sus textos</h1>
  <p class="lede">Las páginas de la web y sus textos.</p>
  <p class="entrada">
    María: esto es todo lo que va a decir tu web, página por página. Los
    listados de cada área son los que me pasaste, tal cual. El resto lo he
    escrito yo, así que léelo con calma y dime qué cambiarías, qué no suena a
    ti y qué falta. Al final tienes unas preguntas que necesito que me
    contestes para poder terminar.
  </p>
</header>

${cuerpo}

<footer class="pie">
  <div>
    <div class="nombre">Fran Enríquez</div>
    <div class="datos">625 391 654 · fran.enriquez.dev@gmail.com</div>
  </div>
  <div class="fecha">${hoy}</div>
</footer>

</body></html>`;

const destino = resolve(aqui, 'estructura-y-textos.html');
writeFileSync(destino, html, 'utf8');
console.log(destino, (Buffer.byteLength(html) / 1024 / 1024).toFixed(2) + ' MB');
