/* Genera un HTML standalone con las dos alternativas, todo empotrado en
   base64, para importarlo en Figma con html.to.design.

   Decisiones tomadas pensando en el importador, no en el navegador:
   - Los degradados entran en Figma como degradados nativos; el desenfoque y
     el mix-blend-mode se pierden o se rasterizan. Así que la luz transmitida
     se construye con degradados de alfa, no con filter: blur().
   - Todo va a 1440 px fijos: el importador mapea cada sección a un frame.
   - Sin CSS grid ni variables tipográficas exóticas: cajas simples. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const b64 = (rel, mime) =>
  `data:${mime};base64,${readFileSync(resolve(raiz, rel)).toString('base64')}`;

const A = {
  fuente: b64('public/fonts/host-grotesk-variable.woff2', 'font/woff2'),
  hero: b64('artifacts/hero-review/final.png', 'image/png'),
  muro: b64('public/media/tex/wall.webp', 'image/webp'),
  suelo: b64('public/media/tex/floor.webp', 'image/webp'),
  madera: b64('src/assets/photo/office-darkwood.webp', 'image/webp'),
  clara: b64('src/assets/photo/office-calm.webp', 'image/webp'),
  infantil: b64('src/assets/photo/children-room.webp', 'image/webp'),
  retrato: b64('src/assets/retrato.webp', 'image/webp'),
};

const areas = [
  ['01', 'INFANCIA Y ADOLESCENCIA', 'Desarrollo, conducta, sueño, lenguaje y emociones.'],
  ['02', 'PROBLEMAS ESCOLARES', 'Aprendizaje, TDAH, altas capacidades, estrés académico.'],
  ['03', 'ADULTOS', 'Ansiedad, estado de ánimo, duelo, adaptación.'],
  ['04', 'FAMILIA Y PAREJA', 'Mediación familiar, pareja, separación, relaciones.'],
  ['05', 'JURÍDICA Y FORENSE', 'Peritaje, informes y ratificación en juzgados.'],
  ['06', 'NEUROPSICOLOGÍA', 'Deterioro cognitivo y estimulación cognitiva.'],
];

/* La rampa vive en la luz, no en la tinta.
   La idea de A es que la jerarquía sea luminancia. Aplicada al texto no se
   sostiene: medido sobre el render, la rampa pálida daba 3,41 · 3,69 · 1,67
   y 4,49 en las cuatro primeras áreas, y son los enlaces principales de la
   web, no decoración. Así que la densidad se traslada al haz, que sigue
   cruzando las líneas y variando el fondo, y las seis áreas comparten una
   sola tinta que aguanta en cualquier punto del degradado. */
const TINTA_AREA = '#2A4B62';

const nav = (tinta, filete) => `
  <div class="nav" style="border-bottom:1px solid ${filete}">
    <div class="marca" style="color:${tinta}">CENTRO DE PSICOLOGÍA MARÍA GARCÍA</div>
    <div class="enlaces">
      <span style="color:${tinta}">ÁREAS</span>
      <span style="color:${tinta}">CONSULTA</span>
      <span style="color:${tinta}">SOBRE MÍ</span>
      <span style="color:${tinta}">CONTACTO</span>
      <span style="color:#35617F">637 03 34 48</span>
    </div>
  </div>`;

/* El render trae su propia barra de navegación cocida en la imagen. Se
   recorta con desbordamiento y desplazamiento negativo en lugar de duplicar
   la nav: 64 px de origen a 1536 de ancho son 60 px a los 1440 de destino. */
const hero = `<div class="hero"><img src="${A.hero}" alt="Tres láminas de vidrio sobre hormigón, con el titular del centro"></div>`;

const cierre = (creditos) => `
  <section class="s-cierre">
    <div class="canto"></div>
    <h2 class="d-cierre">ESCRÍBEME Y LO VEMOS</h2>
    <div class="fila-cta">
      <span class="boton">ESCRIBIR POR WHATSAPP</span>
      <span class="tel">637 03 34 48</span>
    </div>
    ${creditos ? `<div class="creditos">Nº COLEGIADA AO 05323&nbsp;&nbsp;·&nbsp;&nbsp;MEDIADORA FAMILIAR Nº 631&nbsp;&nbsp;·&nbsp;&nbsp;NICA 67672</div>` : ''}
  </section>`;

/* ---------------------------------------------------------------- A ----- */
const opcionA = `
<div class="pagina" id="opcion-a">
  ${nav('#1F2426', 'rgba(167,158,144,.34)')}
  ${hero}

  <section class="s-areas-muro">
    <div class="poro"></div>
    <div class="haz"></div>
    <div class="cuerpo-muro">
      <div class="versalita">SEIS ÁREAS</div>
      <div class="lineas">
        ${areas.map(([, titulo]) => `<div class="linea" style="color:${TINTA_AREA}">${titulo}</div>`).join('')}
      </div>
    </div>
  </section>

  <section class="s-centro-muro">
    <div class="poro"></div>
    <div class="haz-estrecho"></div>
    <div class="col-texto">
      <div class="versalita">EL CENTRO</div>
      <h2 class="d-medio">TRES DESPACHOS Y<br>UN RINCÓN INFANTIL</h2>
      <p class="cuerpo">Recepción, sala de espera y tres despachos distintos, en C. Rafael Alberti, 3. El rincón infantil tiene mesa baja, sillas pequeñas y pizarra.</p>
      <div class="acreditacion">
        <div>Nº COLEGIADA AO 05323</div>
        <div>MEDIADORA FAMILIAR Nº 631</div>
        <div>NICA 67672</div>
      </div>
    </div>
    <div class="foto-suelta"><img src="${A.madera}" alt="Despacho con mesa de madera oscura y dos butacas"></div>
  </section>

  ${cierre(false)}
</div>`;

/* ---------------------------------------------------------------- B ----- */
const opcionB = `
<div class="pagina" id="opcion-b">
  ${nav('#1F2426', 'rgba(167,158,144,.34)')}
  ${hero}

  <section class="s-areas-lamina">
    <div class="poro"></div>
    <div class="versalita" style="position:relative;margin:0 0 34px 120px;color:#4A6274">SEIS ÁREAS</div>
    <div class="filas">
      ${areas
        .map(
          ([n, titulo, nota]) => `
        <div class="fila">
          <span class="numero">${n}</span>
          <span class="titulo-fila">${titulo}</span>
          <span class="nota-fila">${nota}</span>
        </div>`
        )
        .join('')}
    </div>
  </section>

  <section class="s-centro-lamina">
    <div class="cabeza-lamina">
      <div class="versalita" style="color:#A9DCEF">EL CENTRO</div>
      <h2 class="d-medio" style="color:#F8F4EB;margin-top:20px">TRES DESPACHOS Y UN RINCÓN INFANTIL</h2>
      <p class="cuerpo" style="color:#C8D7E1;max-width:820px;margin-top:18px">Recepción, sala de espera y tres despachos distintos, en C. Rafael Alberti, 3, Motril.</p>
    </div>
    <div class="tira-fotos">
      <div class="hueco"><img src="${A.madera}" alt="Despacho con mesa de madera oscura y dos butacas"></div>
      <div class="hueco"><img src="${A.clara}" alt="Segundo despacho, de tonos claros y luz natural"></div>
      <div class="hueco"><img src="${A.infantil}" alt="Rincón infantil con mesa baja, sillas pequeñas y pizarra"></div>
    </div>
  </section>

  ${cierre(true)}
</div>`;

/* Tablero de estados. El importador captura el DOM pintado, así que un
   :hover en CSS no llega nunca a Figma. Para que el estado viaje hay que
   pintarlo como un elemento visible más: aquí está cada control en reposo y
   en foco, uno al lado del otro, listo para combinarlo en Figma como
   componente con variante. */
const estados = (id, titulo, fondo, filas) => `
<div class="rotulo">${titulo}</div>
<div class="pagina tablero" id="${id}" style="background:${fondo}">
  ${filas}
</div>`;

const parEstado = (etiqueta, reposo, foco) => `
  <div class="par">
    <div class="etiqueta-par">${etiqueta}</div>
    <div class="celda"><div class="mini">REPOSO</div>${reposo}</div>
    <div class="celda"><div class="mini">HOVER</div>${foco}</div>
  </div>`;

const tableroA = estados('estados-a', 'A · ESTADOS', '#F9F6F0', [
  parEstado('Enlace de navegación',
    `<span class="e-nav">ÁREAS</span>`,
    `<span class="e-nav es-hover">ÁREAS</span>`),
  parEstado('Línea de área',
    `<span class="e-linea">FAMILIA Y PAREJA</span>`,
    `<span class="e-linea es-hover">FAMILIA Y PAREJA</span>`),
  parEstado('Haz de luz',
    `<div class="e-haz"><span class="e-linea">JURÍDICA Y FORENSE</span></div>`,
    `<div class="e-haz e-haz-denso"><span class="e-linea">JURÍDICA Y FORENSE</span></div>`),
  parEstado('Botón de contacto',
    `<span class="e-boton">ESCRIBIR POR WHATSAPP</span>`,
    `<span class="e-boton es-hover">ESCRIBIR POR WHATSAPP</span>`),
].join(''));

const tableroB = estados('estados-b', 'B · ESTADOS', '#C3D8E2', [
  parEstado('Enlace de navegación',
    `<span class="e-nav">ÁREAS</span>`,
    `<span class="e-nav es-hover">ÁREAS</span>`),
  parEstado('Fila de área',
    `<div class="e-fila"><span class="numero">04</span><span class="titulo-fila">FAMILIA Y PAREJA</span><span class="nota-fila">Mediación familiar, pareja, separación, relaciones.</span></div>`,
    `<div class="e-fila es-hover"><span class="numero">04</span><span class="titulo-fila">FAMILIA Y PAREJA</span><span class="nota-fila">Mediación familiar, pareja, separación, relaciones.</span></div>`),
  parEstado('Botón de contacto',
    `<span class="e-boton">ESCRIBIR POR WHATSAPP</span>`,
    `<span class="e-boton es-hover">ESCRIBIR POR WHATSAPP</span>`),
].join(''));

const css = `
@font-face {
  font-family: 'Host Grotesk';
  src: url('${A.fuente}') format('woff2');
  font-weight: 100 900;
  font-display: block;
}

* { margin:0; padding:0; box-sizing:border-box; }

body {
  background:#6E665A;
  font-family:'Host Grotesk', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing:antialiased;
  display:flex; flex-direction:column; align-items:center; gap:80px;
  padding:80px 0;
}

.rotulo {
  width:1440px; color:#F8F4EB; font-size:13px; letter-spacing:.24em;
  font-weight:500; padding-bottom:14px;
}

.pagina { width:1440px; background:#F9F6F0; overflow:hidden; }

/* -- Nav ---------------------------------------------------------------- */
.nav {
  height:72px; background:#F8F4EB; display:flex; align-items:center;
  justify-content:space-between; padding:0 120px;
}
.marca { font-size:13px; letter-spacing:.22em; font-weight:500; }
.enlaces { display:flex; align-items:center; gap:40px; font-size:12px; letter-spacing:.2em; font-weight:500; }

/* -- Hero: la escena existente, sin tocar. El recorte superior elimina la
      barra que el render ya trae cocida, para no duplicar la navegación. -- */
.hero { width:1440px; height:823px; overflow:hidden; }
.hero img { width:1440px; height:883px; object-fit:cover; display:block; margin-top:-60px; }

/* -- Versalitas y tipos compartidos --------------------------------------
   El secundario es #6E665A y no #8C8375: sobre crema el primero da 5,16:1 y
   el segundo 3,41:1, que no llega a AA en texto pequeño. */
.versalita { font-size:13px; letter-spacing:.24em; font-weight:500; color:#6E665A; }
.cuerpo { font-size:17px; line-height:29px; color:#1F2426; }
.d-medio { font-size:44px; line-height:60px; font-weight:300; letter-spacing:.03em; color:#1F2426; }

/* -- El poro del hormigón como capa propia, no como fondo mezclado.
      background-blend-mode no sobrevive al importador; una capa con opacidad
      entra como relleno de imagen y se puede seguir editando en Figma. ----- */
.poro {
  position:absolute; inset:0;
  background-image:url('${A.muro}');
  background-size:760px auto;
  opacity:.3;
}

/* == A · EL MURO DE LUZ ==================================================
   El hormigón sigue sin costura y el contenido llega como campos de luz
   cayendo encima. Cero contenedores: ni tarjetas, ni cajas, ni filetes. */
/* El hormigón se calienta a #F4EFE4: el poro es gris neutro y a #F9F6F0
   dejaba la sección fría, con una costura visible contra el crema cálido
   del hero. */
.s-areas-muro {
  position:relative; height:730px;
  background-color:#F4EFE4;
}
/* Haz diagonal estrecho, no viñeta. El núcleo denso va deliberadamente al
   cuadrante inferior derecho: cruzando la columna de texto dejaba las dos
   primeras áreas en azul pálido sobre el fondo más oscuro del haz, que es
   justo donde el texto desaparece. La luz y la rampa tienen que ir en el
   mismo sentido, no en contra. */
.haz {
  position:absolute; inset:0;
  background:linear-gradient(148deg,
    rgba(53,97,127,0) 34%,
    rgba(53,97,127,.10) 52%,
    rgba(53,97,127,.34) 68%,
    rgba(42,75,98,.50) 80%,
    rgba(27,46,67,.16) 92%,
    rgba(27,46,67,0) 100%);
}
.cuerpo-muro { position:relative; padding:132px 0 0 336px; }
.lineas { margin-top:46px; display:flex; flex-direction:column; gap:4px; }
.linea {
  font-size:54px; line-height:72px; font-weight:300; letter-spacing:.04em;
  width:fit-content; transition:color .22s ease;
}
.linea:hover { color:#1F2426; }

.s-centro-muro {
  position:relative; height:820px; display:flex; align-items:flex-start;
  background-color:#F4EFE4;
}
/* El haz cubre la sección entera y se apaga en los cuatro extremos. Acotado
   a una caja de 420px dejaba un canto recto visible a media altura, que
   parecía un rectángulo y no luz. */
.haz-estrecho {
  position:absolute; inset:0;
  background:linear-gradient(168deg,
    rgba(53,97,127,0) 34%,
    rgba(53,97,127,.20) 58%,
    rgba(53,97,127,.26) 70%,
    rgba(53,97,127,0) 92%);
}
.col-texto { position:relative; width:560px; padding:140px 0 0 120px; }
.col-texto .d-medio { margin-top:22px; }
.col-texto .cuerpo { margin-top:26px; max-width:430px; }
.acreditacion { margin-top:44px; font-size:12px; letter-spacing:.2em; line-height:24px; font-weight:500; color:#6E665A; }
.foto-suelta { position:relative; margin:140px 0 0 40px; width:660px; height:540px; overflow:hidden; }
.foto-suelta img {
  width:660px; height:540px; object-fit:cover; display:block;
  transition:transform .5s ease;
}
.foto-suelta:hover img { transform:scale(1.03); }

/* == B · LA SECUENCIA DE LÁMINAS ==========================================
   Cada sección es una hoja más del laminado y el azul se hace más denso al
   bajar. Lo único que separa una hoja de la siguiente es el canto encendido
   de 1px. Sin huecos, sin márgenes. */
.s-areas-lamina {
  position:relative;
  padding:120px 0 110px;
  background-color:#C3D8E2;
  border-top:1px solid #CDEAF5;
}
.filas { position:relative; display:flex; flex-direction:column; }
/* El canto encendido tiene que verse sobre la hoja pálida: a #CDEAF5 puro
   sobre #C3D8E2 casi no hay salto, así que el filete va en el azul medio. */
.fila {
  display:flex; align-items:center; gap:0;
  height:104px; padding:0 120px;
  border-bottom:1px solid rgba(93,140,168,.55);
  transition:background-color .22s ease;
}
.fila:first-child { border-top:1px solid rgba(93,140,168,.55); }
.fila:hover { background-color:rgba(248,244,235,.42); }
.numero { width:88px; font-size:13px; letter-spacing:.2em; font-weight:500; color:#2A4B62; }
.titulo-fila { width:470px; font-size:30px; font-weight:300; letter-spacing:.05em; color:#1F2426; }
.nota-fila { flex:1; font-size:15px; line-height:26px; color:#284A60; }

.s-centro-lamina {
  background:#35617F;
  border-top:1px solid #CDEAF5;
}
.cabeza-lamina { padding:96px 120px 72px; }
.tira-fotos { display:flex; }
.hueco { width:480px; height:470px; overflow:hidden; border-right:1px solid #A9DCEF; }
.hueco:last-child { border-right:0; }
.hueco img {
  width:480px; height:470px; object-fit:cover; display:block;
  transition:transform .5s ease;
}
.hueco:hover img { transform:scale(1.04); }

/* -- Cierre -------------------------------------------------------------- */
.s-cierre { position:relative; background:#1B2E43; padding:150px 120px 130px; }
.canto { position:absolute; top:0; left:0; right:0; height:1px; background:#CDEAF5; }
.d-cierre { font-size:52px; font-weight:300; letter-spacing:.06em; color:#F8F4EB; }
.fila-cta { margin-top:56px; display:flex; align-items:center; gap:36px; }
.boton {
  display:inline-block; border:1px solid #F8F4EB; color:#F8F4EB;
  font-size:13px; letter-spacing:.2em; font-weight:500; padding:22px 34px;
  transition:background-color .22s ease, color .22s ease;
}
.boton:hover { background-color:#F8F4EB; color:#1B2E43; }
.tel { font-size:22px; font-weight:300; letter-spacing:.06em; color:#C8D7E1; }
.creditos {
  margin-top:96px; padding-top:26px; border-top:1px solid rgba(205,234,245,.34);
  font-size:12px; letter-spacing:.2em; font-weight:500; color:#9CB8CC;
}

/* -- Navegación: reposo y foco ------------------------------------------ */
.enlaces span { transition:color .2s ease; padding-bottom:3px; }
.enlaces span:hover { color:#35617F; box-shadow:inset 0 -1px 0 #35617F; }

/* == Tablero de estados ==================================================
   Cada control pintado en sus dos estados, para que el import los traiga
   como capas de verdad y se puedan combinar en variantes dentro de Figma. */
.tablero { padding:64px 96px; display:flex; flex-direction:column; gap:52px; }
.par { display:flex; align-items:flex-start; gap:40px; }
.etiqueta-par {
  width:210px; padding-top:26px; font-size:12px; letter-spacing:.2em;
  font-weight:500; color:#6E665A;
}
.celda { flex:1; }
.mini { font-size:10px; letter-spacing:.26em; font-weight:500; color:#8C8375; margin-bottom:14px; }

.e-nav { display:inline-block; font-size:12px; letter-spacing:.2em; font-weight:500; color:#1F2426; padding-bottom:3px; }
.e-nav.es-hover { color:#35617F; box-shadow:inset 0 -1px 0 #35617F; }

.e-linea { display:inline-block; font-size:44px; font-weight:300; letter-spacing:.04em; color:#2A4B62; }
.e-linea.es-hover { color:#1F2426; }

/* La densidad del haz como estado propio: el fondo cambia, la tinta no. */
.e-haz { padding:24px 28px; background:#F4EFE4; }
.e-haz-denso { background:#CBD4D8; }
.e-haz .e-linea { font-size:28px; white-space:nowrap; }

.e-fila {
  display:flex; align-items:center; height:96px; padding:0 26px;
  border-top:1px solid rgba(93,140,168,.55); border-bottom:1px solid rgba(93,140,168,.55);
}
.e-fila.es-hover { background-color:rgba(248,244,235,.42); }
.e-fila .titulo-fila { width:330px; font-size:26px; }
.e-fila .nota-fila { font-size:14px; }

.e-boton {
  display:inline-block; border:1px solid #1B2E43; color:#1B2E43;
  font-size:13px; letter-spacing:.2em; font-weight:500; padding:20px 30px;
}
.e-boton.es-hover { background-color:#1B2E43; color:#F8F4EB; }
`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1440">
<title>Centro de Psicología María García · dos alternativas de home</title>
<style>${css}</style>
</head>
<body>
  <div class="rotulo">A · EL MURO DE LUZ</div>
  ${opcionA}
  ${tableroA}
  <div class="rotulo">B · LA SECUENCIA DE LÁMINAS</div>
  ${opcionB}
  ${tableroB}
</body>
</html>`;

const destino = resolve(raiz, 'artifacts/figma-import/home-dos-alternativas.html');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, html, 'utf8');
console.log(destino, (Buffer.byteLength(html) / 1024 / 1024).toFixed(2) + ' MB');
