/* Genera un .docx editable a partir del mismo markdown que alimenta el PDF.

   Se escribe el OOXML a mano y se empaqueta con `zip`. Es más código que
   tirar de una librería, pero evita añadir una dependencia al proyecto para
   un documento, y da control exacto sobre los estilos, que es lo que hace
   falta para que Google Drive lo convierta bien: títulos como títulos de
   verdad —para que el índice automático funcione— y tablas como tablas.

   Las listas usan viñeta literal en vez de numbering.xml. Es deliberado: la
   numeración automática de OOXML es la parte que peor sobrevive a la
   conversión a Google Docs, y aquí importa más que el documento se abra
   limpio y se pueda editar que conservar una lista automática. */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const aqui = dirname(fileURLToPath(import.meta.url));
const tmp = resolve(aqui, '.docx-tmp');

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');

/* -- Runs con formato en línea ------------------------------------------- */

const PROC = {
  V: { color: '35617F', texto: 'V' },
  R: { color: '6E665A', texto: 'R' },
  P: { color: '35617F', texto: 'P' },
};

/* Convierte una línea de markdown en una secuencia de <w:r>. Se recorre con
   una sola expresión regular alternativa para no anidar reemplazos y que el
   orden de negrita, cursiva y código no se pise. */
function runs(texto, base = {}) {
  const patron = /(\*\*\[[VRP]\]\*\*|\[[VRP]\]|`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  const trozos = texto.split(patron).filter((x) => x !== '' && x !== undefined);
  return trozos
    .map((t) => {
      let contenido = t;
      const props = { ...base };

      const marca = t.match(/^\*\*\[([VRP])\]\*\*$|^\[([VRP])\]$/);
      if (marca) {
        const k = marca[1] || marca[2];
        return run(`[${PROC[k].texto}]`, { ...props, negrita: true, color: PROC[k].color });
      }
      if (/^`.+`$/.test(t)) {
        contenido = t.slice(1, -1);
        return run(contenido, { ...props, mono: true, color: '2A4B62' });
      }
      if (/^\*\*.+\*\*$/.test(t)) {
        contenido = t.slice(2, -2);
        props.negrita = true;
      } else if (/^\*.+\*$/.test(t)) {
        contenido = t.slice(1, -1);
        props.cursiva = true;
      }
      return run(contenido, props);
    })
    .join('');
}

function run(texto, { negrita, cursiva, mono, color, tam, mayus } = {}) {
  const rPr = [
    mono ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>' : '',
    negrita ? '<w:b/>' : '',
    cursiva ? '<w:i/>' : '',
    color ? `<w:color w:val="${color}"/>` : '',
    tam ? `<w:sz w:val="${tam}"/><w:szCs w:val="${tam}"/>` : '',
    mayus ? '<w:caps/><w:spacing w:val="40"/>' : '',
  ].join('');
  return `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(texto)}</w:t></w:r>`;
}

const parrafo = (contenido, estilo, extra = '') =>
  `<w:p><w:pPr>${estilo ? `<w:pStyle w:val="${estilo}"/>` : ''}${extra}</w:pPr>${contenido}</w:p>`;

/* -- Tablas ---------------------------------------------------------------- */

const BORDE = 'w:val="single" w:sz="4" w:space="0" w:color="D6D2CA"';

function tabla(cabecera, filas) {
  const anchoTotal = 9360;
  const cols = (cabecera.length ? cabecera : filas[0]).length;
  const ancho = Math.floor(anchoTotal / cols);

  const celda = (txt, { cab = false } = {}) => {
    const sombra = cab ? '<w:shd w:val="clear" w:fill="35617F"/>' : '';
    const props = cab
      ? { negrita: true, color: 'FFFFFF', tam: 17, mayus: true }
      : {};
    return `<w:tc><w:tcPr><w:tcW w:w="${ancho}" w:type="dxa"/>${sombra}<w:tcMar>` +
      `<w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/>` +
      `<w:left w:w="110" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tcMar></w:tcPr>` +
      parrafo(runs(txt, props), 'Celda') + '</w:tc>';
  };

  const filaCab = cabecera.length
    ? `<w:tr><w:trPr><w:tblHeader/></w:trPr>${cabecera.map((c) => celda(c, { cab: true })).join('')}</w:tr>`
    : '';
  const cuerpo = filas
    .map((f) => `<w:tr>${f.map((c) => celda(c)).join('')}</w:tr>`)
    .join('');

  return (
    `<w:tbl><w:tblPr><w:tblW w:w="${anchoTotal}" w:type="dxa"/>` +
    `<w:tblBorders><w:top ${BORDE}/><w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>` +
    `<w:bottom ${BORDE}/><w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>` +
    `<w:insideH ${BORDE}/><w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/></w:tblBorders>` +
    `<w:tblLayout w:type="fixed"/></w:tblPr>${filaCab}${cuerpo}</w:tbl>` +
    parrafo('', 'Hueco')
  );
}

/* -- Conversor ------------------------------------------------------------- */

function convertir(md) {
  const L = md.split('\n');
  const out = [];
  let i = 0;
  const esFila = (l) => /^\s*\|.*\|\s*$/.test(l || '');
  const celdas = (l) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

  while (i < L.length) {
    const l = L[i];

    if (/^\s*$/.test(l)) { i++; continue; }
    if (/^---+\s*$/.test(l)) { i++; continue; }

    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const n = h[1].length;
      /* Los H2 del markdown son las secciones numeradas: cada una abre página
         nueva, igual que en el PDF. */
      const salto = n === 2 ? '<w:pageBreakBefore/>' : '';
      out.push(parrafo(runs(h[2]), `Titulo${n}`, salto));
      i++;
      continue;
    }

    if (l.startsWith('```')) {
      i++;
      const buf = [];
      while (i < L.length && !L[i].startsWith('```')) buf.push(L[i++]);
      i++;
      buf.forEach((b) => out.push(parrafo(run(b, { mono: true }), 'Codigo')));
      out.push(parrafo('', 'Hueco'));
      continue;
    }

    if (esFila(l) && esFila(L[i + 1]) && /^[\s|:-]+$/.test(L[i + 1])) {
      const cab = celdas(l);
      i += 2;
      const filas = [];
      while (i < L.length && esFila(L[i])) filas.push(celdas(L[i++]));
      out.push(tabla(cab.every((c) => c === '') ? [] : cab, filas));
      continue;
    }

    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < L.length && /^>\s?/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, ''));
      buf
        .join('\n')
        .split(/\n\s*\n/)
        .forEach((p) => out.push(parrafo(runs(p.replace(/\n/g, ' ').trim()), 'Cita')));
      continue;
    }

    if (/^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) {
      const ordenada = /^\s*\d+\.\s+/.test(l);
      const items = [];
      while (
        i < L.length &&
        (/^\s*[-*]\s+/.test(L[i]) || /^\s*\d+\.\s+/.test(L[i]) || /^\s{2,}\S/.test(L[i]))
      ) {
        if (/^\s{2,}\S/.test(L[i]) && items.length) items[items.length - 1] += ' ' + L[i].trim();
        else items.push(L[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''));
        i++;
      }
      items.forEach((t, n) => {
        const vineta = ordenada ? `${n + 1}.  ` : '•  ';
        out.push(parrafo(run(vineta, { color: '8C8375' }) + runs(t), 'Lista'));
      });
      continue;
    }

    const buf = [];
    while (i < L.length && !/^\s*$/.test(L[i]) && !/^[#>\-|`]/.test(L[i])) buf.push(L[i++]);
    if (buf.length) out.push(parrafo(runs(buf.join(' ')), 'Cuerpo'));
    else i++;
  }
  return out.join('');
}

/* -- Estilos --------------------------------------------------------------- */

const estilo = (id, nombre, { fuente = 'Inter', tam, color, negrita, cursiva, antes = 0, despues = 120, interlineado = 276, borde = false, sangria = 0 } = {}) => `
<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${nombre}"/>
  <w:pPr><w:spacing w:before="${antes}" w:after="${despues}" w:line="${interlineado}" w:lineRule="auto"/>
    ${sangria ? `<w:ind w:left="${sangria}"/>` : ''}
    ${borde ? `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="6" w:color="C9C4B8"/></w:pBdr>` : ''}
  </w:pPr>
  <w:rPr><w:rFonts w:ascii="${fuente}" w:hAnsi="${fuente}"/>
    ${tam ? `<w:sz w:val="${tam}"/><w:szCs w:val="${tam}"/>` : ''}
    ${color ? `<w:color w:val="${color}"/>` : ''}
    ${negrita ? '<w:b/>' : ''}${cursiva ? '<w:i/>' : ''}
  </w:rPr>
</w:style>`;

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
  <w:rFonts w:ascii="Inter" w:hAnsi="Inter"/><w:sz w:val="20"/><w:szCs w:val="20"/>
  <w:color w:val="1F2426"/></w:rPr></w:rPrDefault></w:docDefaults>

<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>
  <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:style>

${estilo('Portada', 'Title', { fuente: 'Playfair Display', tam: 56, despues: 60 })}
${estilo('Lede', 'Subtitle', { fuente: 'Playfair Display', tam: 26, color: '35617F', cursiva: true, despues: 200 })}
${estilo('Titulo2', 'heading 1', { fuente: 'Playfair Display', tam: 34, antes: 0, despues: 160, borde: true })}
${estilo('Titulo3', 'heading 2', { fuente: 'Playfair Display', tam: 23, color: '2A4B62', negrita: true, antes: 240, despues: 100 })}
${estilo('Titulo4', 'heading 3', { tam: 16, color: '6E665A', negrita: true, antes: 200, despues: 80 })}
${estilo('Cuerpo', 'Cuerpo', {})}
${estilo('Cita', 'Quote', { fuente: 'Playfair Display', tam: 22, sangria: 340, despues: 100 })}
${estilo('Lista', 'Lista', { sangria: 280, despues: 40 })}
${estilo('Codigo', 'Codigo', { fuente: 'Consolas', tam: 17, color: '6E665A', despues: 0, interlineado: 240 })}
${estilo('Celda', 'Celda', { tam: 18, despues: 0, interlineado: 240 })}
${estilo('Hueco', 'Hueco', { tam: 8, despues: 0 })}
</w:styles>`;

/* -- Documento ------------------------------------------------------------- */

const md = readFileSync(resolve(aqui, 'estructura-y-textos.md'), 'utf8');
const cuerpo = convertir(
  md.replace(/^# .*\n## .*\n/, '').replace(/^María: esto es todo[\s\S]*?\n\s*\n/m, '')
);

const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const portada =
  parrafo(run('CENTRO DE PSICOLOGÍA MARÍA GARCÍA   ·   TEXTOS DE LA WEB',
    { color: '8C8375', tam: 15, mayus: true }), 'Cuerpo') +
  parrafo(runs('Las páginas de la web y sus textos'), 'Portada') +
  parrafo(runs('Página por página, todo lo que va a decir.'), 'Lede') +
  parrafo(runs('María: esto es todo lo que va a decir tu web, página por página. Los listados de cada área son los que me pasaste, tal cual. El resto lo he escrito yo, así que léelo con calma y dime qué cambiarías, qué no suena a ti y qué falta. Al final tienes unas preguntas que necesito que me contestes para poder terminar.'), 'Cuerpo');

const pie =
  parrafo(runs('**Fran Enríquez** · 625 391 654 · fran.enriquez.dev@gmail.com · ' + hoy), 'Cuerpo');

const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${portada}${cuerpo}${pie}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>
<w:pgMar w:top="1100" w:right="1000" w:bottom="1100" w:left="1000" w:header="708" w:footer="708" w:gutter="0"/>
</w:sectPr></w:body></w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

rmSync(tmp, { recursive: true, force: true });
mkdirSync(resolve(tmp, '_rels'), { recursive: true });
mkdirSync(resolve(tmp, 'word/_rels'), { recursive: true });
writeFileSync(resolve(tmp, '[Content_Types].xml'), contentTypes);
writeFileSync(resolve(tmp, '_rels/.rels'), rels);
writeFileSync(resolve(tmp, 'word/document.xml'), document);
writeFileSync(resolve(tmp, 'word/styles.xml'), styles);
writeFileSync(resolve(tmp, 'word/_rels/document.xml.rels'), docRels);

const destino = resolve(aqui, 'Centro-Psicologia-Maria-Garcia-Textos-web.docx');
rmSync(destino, { force: true });
/* mimetype primero y sin comprimir no es obligatorio en OOXML (eso es EPUB),
   pero el orden con [Content_Types].xml al principio sí evita lectores
   quisquillosos. */
execSync(`cd "${tmp}" && zip -q -X -r "${destino}" '[Content_Types].xml' _rels word`);
rmSync(tmp, { recursive: true, force: true });

console.log(destino);
