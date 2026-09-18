/* Escena de vidrio laminado sobre hormigón, aproximada a /media/image.png.
   La absorción coloreada se compone por lámina; el especular y los biseles
   responden al entorno. El suelo calcula una huella difusa desde los planos
   actuales del vidrio. Los mapas de iluminación conservan la dirección de
   arte de la referencia; no representan una simulación de iluminación global. */

import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  FrontSide,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MultiplyBlending,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  Raycaster,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { geometriaVidrio, microHormigon, reflejosVidrio } from './hero-surfaces.js';

/* -- La sala, en metros ---------------------------------------------------- */
/* Cerrada por los cinco lados que la cámara puede alcanzar. El borde de la
   pared no debe entrar en cuadro en ningún punto del recorrido. */
const PARED_Z = -23.9;
const PARED_W = 96;
const PARED_H = 36;
const LATERAL_X = 26;
const FRENTE_Z = 30;
const TECHO_Y = 21;

const CAMARA_Y = 1.62;
const CAIDA = 2.55 * (Math.PI / 180);
const FOV_INICIO = 38;
const FOV_FINAL = 32;

/* -- La luz ---------------------------------------------------------------- */
/* Posición y objetivo del sol. De aquí sale la dirección con la que se
   proyecta sobre el suelo la luz que ha pasado por cada lámina. Está delante
   de la pared para que la pared quede iluminada, y alta y a la izquierda, así
   que las manchas de color caen a la derecha de cada lámina y se ven, en
   lugar de esconderse detrás. */
const SOL = new Vector3(-16, 20, -6);
const SOL_MIRA = new Vector3(1.5, 0, -13);
const SOL_DIR = SOL_MIRA.clone().sub(SOL); // (17.5, -20, -7)

/* -- Las tres láminas ------------------------------------------------------ */
/* Factores de absorción por altura, ajustados al fondo de esta escena.
   El azul se concentra en la parte baja y conserva la textura situada detrás.
   suelo es el tinte de la huella difusa, no una fuente de luz azul. */
const LAMINAS = [
  {
    x: -0.23,
    z: -15.14,
    w: 2.19,
    h: 2.94,
    rotY: 0.475,
    inclinacion: 0,
    transmision: [
      [0.92, 0xdbf0ff],
      [0.7, 0xe4f8ff],
      [0.5, 0xddf8ff],
      [0.3, 0xe6feff],
      [0.1, 0xb8cbd6],
    ],
    suelo: 0x5d909d,
    canto: 0x456d76,
    cantoLuz: 0xe5f8f8,
    brillo: 0.5,
  },
  {
    x: 1.79,
    z: -14.36,
    w: 3.287,
    h: 3.32,
    rotY: 0.9024,
    inclinacion: 0,
    transmision: [
      [0.92, 0x8ab4da],
      [0.7, 0x44a3eb],
      [0.5, 0x2f9ff6],
      [0.3, 0x1291ef],
      [0.1, 0x287191],
    ],
    suelo: 0x075b66,
    canto: 0x346673,
    cantoLuz: 0xd9fcff,
    brillo: 0.72,
  },
  {
    x: 3.77,
    z: -13.34,
    w: 2.419,
    h: 3.27,
    rotY: -0.974,
    inclinacion: 0,
    transmision: [
      [0.92, 0x9ec2e8],
      [0.7, 0x60a8e7],
      [0.5, 0x3f9cd7],
      [0.3, 0x1f84c7],
      [0.1, 0x186986],
    ],
    suelo: 0x285661,
    canto: 0x003447,
    cantoLuz: 0xb6e1f0,
    brillo: 0.86,
  },
];

const GROSOR = 0.064;
const CENTRAL = LAMINAS[1];

/* ── La hoja que tiene el puntero encima se gira ───────────────────────────
   Gesto de puntero, no de scroll: la hoja señalada se vuelve un poco hacia la
   cámara y vuelve sola al soltarla. Girar HACIA la cámara, o sea restando
   ángulo, y no en un sentido fijo: así las tres responden igual aunque la
   tercera esté girada al revés que las otras dos.

   Se enciende y se apaga con PUBLIC_HERO_HOVER. Vale apagarlo: es un adorno,
   y en una web de un centro de psicología puede sobrar. Apagado no se registra
   ningún listener ni se construye el raycaster.

   El giro está limitado a cinco grados para que la respuesta sea discreta.
   La huella del suelo sigue el ángulo de cada hoja en el mismo fotograma.

   ── Y solo con el biombo ya montado ───────────────────────────────────────
   A p = 0 la cámara está a 34 cm de la hoja central y el encuadre está
   RESUELTO para que sus cuatro esquinas caigan dentro de ella. Girarla allí,
   aunque sea un grado, saca una esquina fuera y por detrás aparece la sala. La
   amplitud entra con el retroceso: cero hasta HOVER_DESDE y entera en
   HOVER_HASTA, cuando la cámara ya está lejos y las hojas se leen como hojas.

   El suavizado es exponencial y en función del tiempo, no del fotograma: a 144
   Hz un lerp por fotograma llega cuatro veces más deprisa que a 30, y el gesto
   dejaría de ser el mismo según la máquina. */
const HOVER_ACTIVO = !['false', '0', 'off'].includes(
  String(import.meta.env.PUBLIC_HERO_HOVER ?? '').toLowerCase()
);
const HOVER_GIRO = 0.088; // 5.0°
const HOVER_TAU = 190; // ms hasta 1 - 1/e del recorrido
const HOVER_DESDE = 0.34;
const HOVER_HASTA = 0.62;

/* ── El arranque ──────────────────────────────────────────────────────────
   La cámara NO gira en ningún punto del recorrido: mantiene la orientación
   final de principio a fin (sin guiñada, caída de 2.55°) y solo se traslada.
   Eso descarta el plano evidente, pegar la cámara perpendicular a la cara de
   la lámina central, porque perpendicular a una lámina girada 52° obliga a
   girar la cámara.

   Y no vale poner la cámara a ojo. Mirando de frente a una lámina girada, el
   rayo del borde del cuadro y el plano de la lámina son casi paralelos: medio
   campo horizontal más el giro de la lámina dan 83.75° a 16:9, y la tangente
   de eso es 9.1. Cerca de esa singularidad, un grado más de campo mueve metros
   el punto de corte, así que un desplazamiento fijo que cuadre en un portátil
   se sale de la lámina en un monitor ancho.

   Así que el arranque se RESUELVE, no se tantea: se proyectan las cuatro
   esquinas del cuadro contra el plano de la lámina y se busca el retranqueo
   máximo y el desplazamiento lateral que dejan las cuatro dentro, con margen.
   Se recalcula con cada cambio de proporción. Lo hace resolverArranque().
   ────────────────────────────────────────────────────────────────────────── */
const ARRANQUE = new Vector3(CENTRAL.x, 1.4, CENTRAL.z + 0.55);
const ARRANQUE_Y = 1.4;
const ARRANQUE_MARGEN = 0.2;

/* La caja del rótulo, deducida de la medición del «05» con la pared a PARED_Z.
   Solo se conserva el ancho y el centro: el alto lo fija ahora la propia
   tipografía, porque dos líneas de altura de mayúscula no ocupan lo mismo que
   un dígito de 5.3 m y estirarlas hasta la caja medida las deformaría. */
const ROTULO_W = 8.16;
const ROTULO_X = 3.98;
const ROTULO_Y = 4.01;

/* El rótulo. Dos líneas, mayúsculas y tracking ancho: a 23.9 m del muro eso es
   rotulación de edificio, no un logotipo pegado.

   El peso NO es el del «05». Aquel iba en 300, pero con un cuerpo de 7.4 m el
   asta le salía de unos 59 cm; el rótulo, con dos líneas dentro del mismo
   ancho, tiene un cuerpo tres veces menor, y en 300 el asta baja a 15 cm: sobre
   hormigón y a media opacidad eso es un alambre. Se sube el peso para recuperar
   la mancha del dígito, no para gritar más.

   La segunda línea va alineada a la derecha de la caja y montada sobre la
   primera: las dos anclan en bordes opuestos y el bloque se traba. Con el
   solape, la zona en que se cruzan suma las dos capas y queda algo más
   encendida, que es justo lo que cose las dos líneas en una sola pieza.

   Entrada por SCROLL y no por reloj. A p = 0 la cámara está a 34 cm del vidrio
   y la pared va desenfocada detrás de la lámina: un temporizador se consumiría
   con el rótulo fuera de foco y sin que nadie lo vea aparecer. Ligado al
   retroceso, el nombre se revela justo cuando el muro se abre. La segunda línea
   entra desplazada, lo justo para que se lea como un gesto y no como un
   fundido de bloque. */
const ROTULO = ['MARÍA', 'GARCÍA'];
const ROTULO_PESO = 600;
const ROTULO_TRACKING = -0.1; // em entre letras, igual en las dos líneas
const ROTULO_SOLAPE = 0.2; // fracción de altura de mayúscula que se montan
const ROTULO_ALINEACION = ['izquierda', 'derecha'];
/* Sangría de cada línea, en anchos de letra de esa misma línea. La segunda sale
   corrida hacia la derecha, así que el bloque deja de ser un rectángulo y pasa a
   escalonarse. En letras y no en metros porque es lo que se ve: al cambiar el
   cuerpo o el texto, el escalón se mantiene proporcionado solo. */
const ROTULO_SANGRIA = [0, 1];
const ROTULO_RELIEVE = 'hundido'; // 'hundido' | 'plano'
const ROTULO_TINTA = 0.62; // alfa del trazo, solo en 'plano'

/* ══ El rótulo grabado ═══════════════════════════════════════════════════════
   Las letras están rehundidas en el hormigón y lo único que se ve son las dos
   paredes del surco. No hay tinta: hay un hueco.

   ── La dirección la manda el sol, y equivocarla se nota ───────────────────
   El sol está arriba y a la izquierda (SOL). En un surco iluminado desde ahí,
   la pared interior que mira hacia arriba-izquierda queda a contraluz y la de
   abajo-derecha recibe el rayo: banda OSCURA pegada al canto superior
   izquierdo, banda CLARA al inferior derecho. Al revés sale un relieve
   saliente, que es el error clásico y se ve aunque no se sepa por qué.

   Las bandas son INTERIORES, así que no valen dos copias desplazadas: eso deja
   el reborde por fuera del trazo y vuelve a leerse como relieve. Cada banda se
   saca restando a la letra una copia de sí misma corrida hacia el lado
   contrario, que es lo que deja justo el filo de dentro.

   ── Por qué el filo encendido va en su propio plano ───────────────────────
   Porque un filo a contraluz se RESTA y un filo iluminado se SUMA, y eso son
   dos blendings distintos. Con los dos en la misma capa, el claro tenía que
   pintarse en blending normal, o sea acotado por el valor del muro: donde el
   muro está en penumbra, un blanco a media alfa apenas lo levanta y el surco
   se queda manco. Sumando, el filo aporta luz propia y funciona igual en la
   zona clara del muro que en la oscura.

   ── Y por qué el rótulo se ha adelantado ──────────────────────────────────
   Estaba a PARED_Z + 0.1, o sea DETRÁS del mapa de sombra del muro, que va a
   +0.2. Con ese orden, el filo encendido tenía que sumar sobre un framebuffer
   que todavía vale 247 y se recortaba a blanco antes de que la sombra llegara
   a bajarlo. Adelantado a +0.35 compone sobre el muro ya resuelto, que es lo
   que de verdad hay detrás de las letras.

   El precio de adelantarlo es que ya no hereda la caída de luz del muro, así
   que hay que dársela: tonoMuroEn() reconstruye el color local del hormigón a
   partir de la misma curva MURO_TONO con la que se pinta la pared, y los tres
   tonos del surco se expresan como FRACCIONES de ese color y no como valores
   fijos. Así el grabado sigue siendo correcto cuando el encuadre estrecho sube
   el rótulo por encima de las láminas, donde el muro es un 20% más claro. */
const ROTULO_BISEL = 0.014; // ancho del filo, en em

/* Las tres capas del surco.

   ── El fondo del surco tiene que verse, pero apenas ───────────────────────
   Aquí había escrito lo contrario, y era falso: que el hueco lo dan los dos
   filos y que la cara debe ir casi a cero. Con la cara invisible el resultado
   no era un surco, eran las letras REMARCADAS. Se ve en el perfil, midiendo la
   luminancia al cruzar un asta de la M:

     0.99  0.97  0.94  0.92  0.88  0.86  0.84  0.82  0.82  0.83  0.85  0.91  0.97

   Una V simétrica, con el interior del trazo al mismo valor que el muro: el
   dibujo de un contorno. Un hueco real no se parece a eso en dos cosas. Su
   FONDO está algo más apagado que el muro, porque a un canal de dos centímetros
   le llega menos cielo, y eso es lo que hace que la letra sea una zona y no una
   línea. Y sus dos filos son DISTINTOS, uno a contraluz y otro al sol; un
   perfil simétrico no lo produce ninguna luz.

   Pero el objetivo es un hundido DISIMULADO, y eso son números muy pequeños:
   dos puntos y medio de caída en el fondo y ocho en el filo. Subiendo a veinte,
   que fue lo segundo que se probó aquí, deja de ser un grabado y son letras
   pintadas de gris.

   ── Por qué el oscurecimiento es NEGRO y no un tono del muro ──────────────
   Porque tiene que ser proporcional, y porque el hormigón tiene que seguir
   viéndose por dentro de las letras.

   El primer intento pintaba un color absoluto sacado de MURO_TONO. Eso obliga a
   acertar el valor del muro detrás del rótulo, y el modelo no lo sabe: MURO_TONO
   describe la caída base pero no el haz, así que donde el rótulo cae en zona
   iluminada el modelo lo daba un 13% más oscuro que la realidad y el trazo se
   hundía por su cuenta esa misma cantidad. Además, un color plano tapa el grano
   del hormigón y la letra se despega del muro.

   Negro con alfa a es exactamente multiplicar por (1 - a): sale proporcional al
   muro que tenga detrás, sea cual sea, conserva su tono y deja pasar su
   textura. Y se funde bien, porque bajar la opacidad del material baja a y el
   surco se deshace hasta desaparecer, que es justo lo que hace falta con la
   entrada por scroll.

   El filo iluminado sí necesita saber cuánto vale el muro, porque suma en vez
   de restar: ahí sí se usa MURO_TONO, y un error del 13% sobre un 3% de subida
   es medio punto. */
const ROTULO_CARA = 0.025; // alfa del negro sobre el fondo del surco: x0.975
const ROTULO_SOMBRA = 0.06; // y en el filo a contraluz, encima: x0.916
const ROTULO_LUZ_F = 0.03; // filo al sol: fracción del muro local QUE SE SUMA
const ROTULO_OPACIDAD = ROTULO_RELIEVE === 'plano' ? 0.5 : 1; // opacidad del material
/* Algo más presente que el «05» (0.52 x 0.5): un dígito tan fantasma es
   decoración, pero un nombre a ese nivel se lee como un fallo de render. */
const ROTULO_ENTRADA = [
  [0.3, 0.6],
  [0.36, 0.66],
];

const lerp = (a, b, t) => a + (b - a) * t;
/* El color del hormigón a plena luz, o sea el muro dentro del haz. Es el mismo
   valor contra el que se resolvieron los cocientes de MURO_TONO. */
const MURO_LUZ = [247, 237, 224];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (min, max, v) => (v < min ? min : v > max ? max : v);
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
/* ==========================================================================
   Desenfoque de lienzo
   ========================================================================== */

/* Aquí NO se usa ctx.filter.

   WebKit no lo implementa (bug 198416 de WebKit, abierto) y descarta la
   asignación SIN lanzar error: en Safari ninguno de los desenfoques de esta
   escena llegaba a aplicarse nunca. El haz de la pared salía como un trapecio
   de aristas vivas, cada huella del suelo como un cuadrilátero recortado y el
   rótulo sin surco. El cuadro se leía como un collage de cartulina, y no había
   nada en consola que lo dijera.

   La ruta que sí existe en los cuatro motores es shadowBlur. Se dibuja la
   figura FUERA del lienzo y se trae de vuelta solo su sombra con shadowOffsetX,
   que por especificación no lo toca la matriz de transformación: entra el
   borrón y se queda fuera la figura nítida que lo ha generado.

   Y se usa en TODOS los navegadores, no como recambio solo para Safari. Con dos
   rutas habría dos núcleos de desenfoque distintos, y toda esta escena está
   calibrada contra una referencia: no puede depender del motor. Una ruta, un
   resultado.

   ALFA Y COLOR VAN POR SEPARADO. La sombra se pinta de un color plano, así que
   del paso solo sobrevive la silueta con su alfa; el color se repone después
   con source-in. No es un apaño: todas las formas de aquí son un degradado
   suave dentro de un contorno duro, y lo único que hay que deshacer es el
   contorno. Reponer el color después sale incluso mejor que desenfocarlo,
   porque un degradado de canvas se prolonga más allá de su última parada y el
   borde difuminado recibe color de verdad en vez de tirar hacia transparente.

   LOS RADIOS NO SON EL MISMO NÚMERO en las dos API. En CSS, blur(N) toma N como
   la sigma de la gaussiana; en canvas la sigma es shadowBlur/2. El helper
   duplica, para no volver a tantear ni uno de los radios ya medidos.

   Esto se monta una sola vez, en las tareas diferidas y ya con el primer
   fotograma en pantalla. No hay ningún desenfoque en el bucle de render. */

/* Dos lienzos reutilizados, no dos por llamada: son ocho desenfoques y los del
   suelo van a 1024², o sea 4 MB cada uno. Asignar el tamaño reinicia el bitmap
   entero, y con él la transformación, el recorte y el estado de sombra que
   dejara la llamada anterior. */
const lienzoAparte = (() => {
  const cache = [];
  return (i, w, h) => {
    const g = (cache[i] ||= document.createElement('canvas').getContext('2d'));
    g.canvas.width = w;
    g.canvas.height = h;
    return g;
  };
})();

/**
 * @param destino  contexto de llegada, con su transformación en identidad
 * @param radio    sigma en píxeles de lienzo, la misma que llevaba blur(Npx)
 * @param silueta  dibuja la forma. Solo se difumina su ALFA, así que el perfil
 *                 de opacidad va aquí; casi siempre basta con un relleno opaco
 * @param tinte    color, o función que pinta sobre la silueta ya difuminada.
 *                 Su alfa MULTIPLICA a la de la silueta, así que va opaco salvo
 *                 que se quiera justamente eso
 */
function desenfocar(destino, radio, silueta, tinte) {
  const { width: W, height: H } = destino.canvas;

  const forma = lienzoAparte(0, W, H);
  silueta(forma);

  /* El desplazamiento tiene que sacar la figura del lienzo entera (W) y dejar
     además sitio para que su propio borrón no vuelva a entrar por la izquierda.
     Una gaussiana de sigma r se da por acabada a las tres sigmas, así que con
     6r de margen lo que sobra muere tres sigmas antes del píxel cero. */
  const fuera = W + radio * 6;
  const borron = lienzoAparte(1, W, H);
  borron.save();
  borron.shadowColor = '#000';
  borron.shadowBlur = radio * 2;
  borron.shadowOffsetX = fuera;
  borron.drawImage(forma.canvas, -fuera, 0);
  borron.restore();

  borron.globalCompositeOperation = 'source-in';
  if (typeof tinte === 'function') {
    borron.save();
    tinte(borron);
    borron.restore();
  } else {
    borron.fillStyle = tinte;
    borron.fillRect(0, 0, W, H);
  }

  /* Sin transformación propia: el borrón ya está en coordenadas del destino, y
     hereda su globalCompositeOperation, que es como cada forma se componía
     antes (multiply en la capa de filtro del suelo, source-over en el resto). */
  destino.drawImage(borron.canvas, 0, 0);
}

/* ==========================================================================
   Texturas de canvas
   ========================================================================== */

/* Entorno equirectangular. La mancha de la izquierda es la ventana, y es lo
   que enciende los cantos y pone el especular en las caras. */
function texturaEntorno() {
  const c = document.createElement('canvas');
  // Alimenta a PMREM, que lo va a difuminar de todas formas: 512 sobra.
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');

  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, '#ffffff');
  v.addColorStop(0.32, '#faf6ee');
  v.addColorStop(0.5, '#e7e0d2');
  v.addColorStop(0.63, '#d0ccc3');
  v.addColorStop(1, '#a6a39b');
  g.fillStyle = v;
  g.fillRect(0, 0, 512, 256);

  const ventana = g.createRadialGradient(86, 66, 3, 86, 66, 105);
  ventana.addColorStop(0, 'rgba(255,255,255,1)');
  ventana.addColorStop(0.38, 'rgba(255,253,247,0.66)');
  ventana.addColorStop(1, 'rgba(255,251,243,0)');
  g.fillStyle = ventana;
  g.fillRect(0, 0, 512, 256);

  const rebote = g.createRadialGradient(371, 104, 3, 371, 104, 70);
  rebote.addColorStop(0, 'rgba(255,255,255,0.5)');
  rebote.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rebote;
  g.fillRect(0, 0, 512, 256);

  const t = new CanvasTexture(c);
  t.mapping = EquirectangularReflectionMapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* El rótulo del muro. Más claro que el hormigón, no más oscuro.

   Una línea por lienzo, y cada lienzo del tamaño exacto de su línea: así la
   textura no se estira y las dos líneas pueden fundirse por separado.

   El tracking se aplica letra a letra en lugar de con ctx.letterSpacing, que no
   está en todos los navegadores, y de paso deja el ancho exacto con el que se
   dimensiona la malla: sin eso, el ancho habría que estimarlo y las dos líneas
   no cuadrarían por la izquierda. */
const fuenteRotulo = (px) =>
  `${ROTULO_PESO} ${px}px 'Host Grotesk', "Helvetica Neue", Helvetica, Arial, sans-serif`;

function componerRotulo(xMuro) {
  const FS = 200;

  /* El hormigón que hay DETRÁS de las letras, en esta x del muro. Los tres
     tonos del surco se expresan como fracciones de él, no como valores fijos:
     el rótulo va por delante del mapa de sombra y ya no hereda su caída, así
     que hay que dársela.

     Se toma de la x en la que el bloque está colocado de verdad, no de la caja
     medida: en pantallas estrechas el rótulo se desplaza y sube, y allí el muro
     está un 13% más claro. */
  const muro = tonoMuroEn(xMuro);
  const muroLocal = (f, a = 1) =>
    `rgba(${muro
      .map((v) => Math.round(Math.min(255, v * f)))
      .join(',')},${a})`;

  const medidor = document.createElement('canvas').getContext('2d');
  medidor.font = fuenteRotulo(FS);

  const avances = ROTULO.map((t) =>
    [...t].map((ch) => medidor.measureText(ch).width)
  );

  /* Mismo cuerpo y mismo tracking en las dos líneas.

     Se probó cuadrarlas al mismo ancho, primero repartiendo el sobrante entre
     las letras de la corta y después subiéndole el cuerpo. Las dos cosas
     estropean lo que importa aquí, que es que las letras vayan juntas y las dos
     líneas midan lo mismo de alto. Así que las líneas van con su ancho natural:
     «GARCÍA» es más larga que «MARÍA» y se nota, que es lo normal en un nombre
     apilado. Cada una se ancla al borde de ROTULO_ALINEACION. */
  const TRACKING = ROTULO_TRACKING * FS;
  const PAD = Math.round(FS * 0.08);

  /* Las dos líneas llevan Í, así que el acento sube lo mismo en las dos y las
     cajas salen de idéntica altura: se apilan sin corregir la línea de base. */
  const ascenso = Math.max(
    ...ROTULO.map((t) => medidor.measureText(t).actualBoundingBoxAscent)
  );
  const H = Math.ceil(ascenso) + PAD * 2;

  /* El solape se mide sobre la altura de MAYÚSCULA, no sobre la caja del
     lienzo: la caja incluye el acento y el margen, y un 15% de eso no es un 15%
     de lo que se ve. */
  const mayuscula = medidor.measureText('M').actualBoundingBoxAscent;

  const lineas = ROTULO.map((texto, i) => {
    const letras = [...texto];
    const ancho =
      avances[i].reduce((x, y) => x + y, 0) + TRACKING * (letras.length - 1);
    const W = Math.ceil(ancho) + PAD * 2;

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.clearRect(0, 0, W, H);

    const preparar = (ctx) => {
      ctx.font = fuenteRotulo(FS);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    };
    const glifos = (ctx, dx = 0, dy = 0) => {
      let x = PAD + dx;
      letras.forEach((ch, j) => {
        ctx.fillText(ch, x, H - PAD + dy);
        x += avances[i][j] + TRACKING;
      });
    };

    preparar(g);

    /* Segundo lienzo, para el filo iluminado. Va aparte porque se compone
       SUMANDO y el resto del surco restando: en la misma capa, el claro
       quedaría acotado por el valor del muro y en la zona en penumbra el surco
       se quedaría manco. */
    const cl = document.createElement('canvas');
    cl.width = W;
    cl.height = H;
    const gl = cl.getContext('2d');
    gl.clearRect(0, 0, W, H);
    preparar(gl);

    if (ROTULO_RELIEVE === 'hundido') {
      const bisel = Math.max(1, Math.round(ROTULO_BISEL * FS));
      const banda = (ctx, color, dx, dy) => {
        const s = document.createElement('canvas');
        s.width = W;
        s.height = H;
        const sg = s.getContext('2d');
        preparar(sg);
        sg.fillStyle = color;
        glifos(sg);
        sg.globalCompositeOperation = 'destination-out';
        /* Opaco, y esto NO es un detalle. destination-out borra según la alfa
           de lo que se dibuja, así que con el fillStyle anterior todavía puesto
           (que es semitransparente, porque el filo se pinta con poca carga) el
           recorte solo quitaba esa misma fracción. El resultado no era una
           banda: era la letra entera con una carga uniforme, sin filo ninguno,
           y por eso el perfil salía plano de lado a lado del asta. */
        sg.fillStyle = '#000';
        glifos(sg, dx, dy);
        ctx.drawImage(s, 0, 0);
      };

      // Cara del fondo del surco. Es lo que da el hueco: sin ella, los dos
      // filos solos dibujan un contorno y no un rehundido.
      g.fillStyle = `rgba(0,0,0,${ROTULO_CARA})`;
      glifos(g);

      /* Desenfoque casi del ancho del filo: el canto queda deshecho y el surco
         se insinúa en vez de dibujarse.

         La banda se traza OPACA y la carga de cada filo la pone el tinte: es la
         silueta lo que se difumina, y su alfa multiplica después a la del
         color. Con la banda ya semitransparente saldría al cuadrado. */
      // Corrida hacia abajo-derecha: lo que queda es el filo de ARRIBA-izquierda,
      // que es el que está a contraluz.
      desenfocar(
        g,
        bisel * 0.4,
        (s) => banda(s, '#000', bisel, bisel),
        `rgba(0,0,0,${ROTULO_SOMBRA})`
      );

      // Y al revés para el de abajo-derecha, que es el que recibe el rayo.
      desenfocar(
        gl,
        bisel * 0.5,
        (s) => banda(s, '#000', -bisel, -bisel),
        muroLocal(ROTULO_LUZ_F)
      );
    } else {
      g.fillStyle = `rgba(255,254,250,${ROTULO_TINTA})`;
      glifos(g);
    }

    const textura = (lienzo) => {
      const t = new CanvasTexture(lienzo);
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    return {
      oscura: textura(c),
      clara: ROTULO_RELIEVE === 'hundido' ? textura(cl) : null,
      w: W,
      h: H,
      letra: ancho / letras.length,
    };
  });

  const escala = ROTULO_W / Math.max(...lineas.map((l) => l.w));
  const sep = mayuscula * (1 - ROTULO_SOLAPE) * escala;
  const alto = (ROTULO.length - 1) * sep + H * escala;
  const puestas = lineas.map((l, i) => ({
    ...l,
    y: ((ROTULO.length - 1) * sep) / 2 - i * sep,
  }));

  const colocadas = puestas.map((l, i) => {
    const w = l.w * escala;
    // El margen es simétrico, así que el centro del lienzo es el centro del
    // trazo: basta con llevar el borde del lienzo al borde de la caja.
    const dentro = ROTULO_W / 2 - w / 2;
    const anclada = ROTULO_ALINEACION[i] === 'derecha' ? dentro : -dentro;
    return {
      oscura: l.oscura,
      clara: l.clara,
      w,
      h: l.h * escala,
      x: anclada + ROTULO_SANGRIA[i] * l.letra * escala,
      y: l.y,
    };
  });

  /* Con la sangría, el bloque ya no está centrado en la caja medida: se mide su
     extensión real y se devuelve el desvío, para que el encuadre sepa dónde
     está de verdad y no lo saque de cuadro al ajustarlo a pantallas estrechas. */
  const izquierda = Math.min(...colocadas.map((l) => l.x - l.w / 2));
  const derecha = Math.max(...colocadas.map((l) => l.x + l.w / 2));
  const centro = (izquierda + derecha) / 2;

  /* Coordenadas RELATIVAS al centro del bloque, no absolutas: se coloca y se
     escala después como un todo, según lo que quepa de pared en cada
     proporción de pantalla. */
  return {
    alto,
    ancho: derecha - izquierda,
    centro,
    lineas: colocadas.map((l) => ({ ...l, x: l.x - centro })),
  };
}

/* Degradado vertical de color transmitido de una lámina, para multiplicar.
   En UV de caja v = 0 es la base, y en canvas la base es la fila de abajo. */
function texturaTransmitida(l) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 512);
  // El offset del degradado corre de arriba abajo y la altura medida al revés.
  // Fuera del rango medido, addColorStop no extrapola: repite la parada del
  // extremo, que es justo lo que se quiere. No hay que inventar el canto.
  l.transmision.forEach(([altura, color]) =>
    v.addColorStop(1 - altura, hex(color))
  );
  g.fillStyle = v;
  g.fillRect(0, 0, 4, 512);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Mapa de luz de la pared.

   ── Por qué el haz no se veía, y por qué el muro salía oliva ──────────────
   Dos errores, y el segundo lo destapó el primero.

   El haz estaba SUMADO. El hormigón renderiza a 246 de luminancia, así que por
   arriba solo quedaba un 4% de recorrido: subir su alfa de 0.13 a 0.26 llevaba
   el resultado de 236 a 242, y ninguna de las dos cosas es una diagonal. En la
   referencia el haz tampoco es una banda clara sobre un muro claro: es un muro
   OSCURO con una banda que se ha quedado a la luz, 235 dentro contra 128 fuera.
   El recorrido que hace falta está todo hacia abajo, así que se cubre la pared
   de sombra y al haz se le abre un hueco. La luz no se pinta: se DESTAPA.

   Pero cubrirla con un tono oscuro en blending NORMAL fue el segundo error. Un
   marrón a media alfa no oscurece: tiñe. El muro se iba a oliva, y como el
   cuerpo del vidrio multiplica lo que tiene detrás, las láminas heredaban ese
   amarillo y salían verdes en vez de azules. La sombra de un muro no es un
   color encima, es el mismo muro recibiendo menos luz, así que esta capa va en
   MULTIPLICACIÓN y sus valores son cocientes por canal.

   ── La curva ──────────────────────────────────────────────────────────────
   MURO_TONO es el muro FUERA del haz dividido por el muro a plena luz
   (246, 237, 224), leído a v ≈ 0.50 en la mitad izquierda (donde a esa altura
   el haz ya ha pasado) y a v ≈ 0.02 en la derecha (donde el haz no llega
   nunca), y reproyectado a la x del mundo. Es una loma y no una rampa: 0.58 en
   el borde izquierdo, 0.81 hacia el centro y 0.67 por la derecha; ninguna de
   las dos mitades se deduce de la otra.

   Y la caída no es neutra. En el borde izquierdo el cociente es
   (0.577, 0.549, 0.487): el azul cae un 9% más que el rojo, porque lo que
   queda allí es rebote de hormigón cálido y no luz de ventana. Un gris habría
   dado la luminancia correcta y el tono equivocado. */
const MURO_TONO = [
  [-9.8, 0xa39a8d],
  [-8.1, 0xa39b8c],
  [-6.5, 0xaca596],
  [-1.6, 0xcec8bd],
  [0.0, 0xc6c0b3],
  [1.7, 0xbbb4a4],
  [3.3, 0xafa996],
  [5.0, 0xb2ac9d],
  [7.4, 0xafa797],
  [10.3, 0xaaa192],
];

/* Color del hormigón en una x del muro, reconstruido con la misma curva con la
   que se pinta la pared. Lo usa el rótulo grabado, que va por delante del mapa
   de sombra y por tanto ya no hereda su caída: tiene que pedírsela. */
function tonoMuroEn(x) {
  let a = MURO_TONO[0];
  let b = MURO_TONO[MURO_TONO.length - 1];
  for (let i = 0; i < MURO_TONO.length - 1; i++) {
    if (x >= MURO_TONO[i][0] && x <= MURO_TONO[i + 1][0]) {
      a = MURO_TONO[i];
      b = MURO_TONO[i + 1];
      break;
    }
  }
  const t = b[0] === a[0] ? 0 : clamp01((x - a[0]) / (b[0] - a[0]));
  /* Los bytes se sacan del entero a mano y NO con new Color(hex).

     Con la gestión de color activada, que lo está por defecto desde r152, el
     constructor de Color convierte de sRGB a LINEAL: el 0xaf de MURO_TONO sale
     por 0.43 en vez de por 0.69. Estos cocientes son de sRGB, porque se
     midieron sobre píxeles de la referencia, y aquí se van a volver a usar como
     sRGB para pintar un lienzo 2D. Pasarlos por Color los convertía dos veces y
     el surco salía al doble de hondo de lo pedido. */
  const canal = (hex, k) => ((hex >> (16 - 8 * k)) & 255) / 255;
  return MURO_LUZ.map((v, k) => v * lerp(canal(a[1], k), canal(b[1], k), t));
}

/* El haz: eje, anchura perpendicular en cada extremo, y lo que vale dentro.

   No es una banda de anchura constante, se ESTRECHA al bajar, y eso está
   medido: proyectando las muestras sobre la normal del eje, a la altura de
   v = 0.11 va de -2.0 a +2.2 m del eje y a la de v = 0.44 solo de -0.4 a +1.5.
   Con anchura constante hay que elegir entre perder la esquina superior
   izquierda, que en la referencia está a 240, o inundar el arranque del biombo,
   que está a 174.

   Y pierde fuelle a lo largo: dentro del haz el cociente pasa de (1.00, 1.00,
   1.00) arriba del todo a (0.955, 0.941, 0.911) al llegar al suelo.

   El eje no solo se corrió, se GIRÓ. Proyectando las muestras sobre su normal,
   el centro de la banda cae en -0.8 m a la altura del borde superior del cuadro
   y en +0.4 m a la altura de v = 0.44: no es la misma recta trasladada, es una
   recta con otra pendiente. Con el eje anterior, la esquina superior izquierda
   quedaba dentro del feather y la multiplicación daba 0.87 donde tiene que dar
   1.00, que es justo lo que hacía que el haz siguiera sin verse aunque ya
   estuviera resuelto como hueco. */
const HAZ_A = { x: -21.7, y: 26.55 };
const HAZ_B = { x: 2.51, y: -8.8 };
const HAZ_ANCHO_A = 9.5;
const HAZ_ANCHO_B = 1.6;
const HAZ_DENTRO_A = 0xffffff;
const HAZ_DENTRO_B = 0xf3f0e8;

function texturaLuzPared() {
  const W = 1024;
  const H = Math.round((W * PARED_H) / PARED_W);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const px = (x) => ((x + PARED_W / 2) / PARED_W) * W;
  const py = (y) => ((PARED_H - y) / PARED_H) * H;
  const esc = W / PARED_W;

  /* El tono base, de un solo trazo y de borde a borde del lienzo.

     Un degradado de canvas repite la parada del extremo fuera de su tramo, así
     que no hace falta rellenar los laterales aparte: hacerlo dejaba dos
     costuras verticales en mitad del muro, justo donde acababa el rango medido,
     y a plena pantalla se leían como dos juntas más claras. */
  const base = g.createLinearGradient(px(MURO_TONO[0][0]), 0, px(MURO_TONO.at(-1)[0]), 0);
  const x0 = MURO_TONO[0][0];
  const tramo = MURO_TONO.at(-1)[0] - x0;
  MURO_TONO.forEach(([x, color]) => base.addColorStop((x - x0) / tramo, hex(color)));
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  const ax = px(HAZ_A.x);
  const ay = py(HAZ_A.y);
  const bx = px(HAZ_B.x);
  const by = py(HAZ_B.y);
  const largo = Math.hypot(bx - ax, by - ay);
  const angulo = Math.atan2(by - ay, bx - ax);

  /* El haz, como UN trapecio y de una sola pieza.

     Antes iba en treinta y dos tramos, cada uno con su anchura, para poder
     estrecharse. Y salía a franjas: el desenfoque se aplicaba a cada fillRect
     por separado, así que también deshacía sus lados CORTOS, y en el medio
     píxel de solape entre tramos las dos alfas se componían dos veces. Cada
     junta entre tramos quedaba como una banda de sombra cruzando el haz.

     Un trapecio no necesita tramos para estrecharse, el degradado a lo largo
     del eje se resuelve con un createLinearGradient en la dirección del eje, y
     el desenfoque se aplica UNA vez sobre el conjunto. Sin lados cortos que
     deshacer y sin solapes, no hay dónde se formen franjas. */
  const largoRelleno = largo + 80;
  const aA = (HAZ_ANCHO_A * esc) / 2;
  const aB = (HAZ_ANCHO_B * esc) / 2;
  // Se prolonga por los dos extremos, que caen fuera de cuadro, manteniendo la
  // pendiente de las dos aristas.
  const dA = aA + ((aA - aB) * 40) / largo;
  const dB = aB - ((aA - aB) * 40) / largo;

  /* Mismo encuadre en los dos pasos: el degradado corre a lo largo del eje del
     haz, así que tanto la silueta como el tinte tienen que ver el trapecio en
     sus propias coordenadas. */
  const encuadrar = (ctx) => {
    ctx.translate((ax + bx) / 2, (ay + by) / 2);
    ctx.rotate(angulo);
  };

  /* Un solo desenfoque, y grande: es lo que hace de feather de las dos aristas
     largas. En la referencia el canto de la banda se resuelve en poco más de
     medio metro de muro. */
  desenfocar(
    g,
    0.55 * esc,
    (s) => {
      encuadrar(s);
      s.beginPath();
      s.moveTo(-largoRelleno / 2, -dA);
      s.lineTo(largoRelleno / 2, -dB);
      s.lineTo(largoRelleno / 2, dB);
      s.lineTo(-largoRelleno / 2, dA);
      s.closePath();
      s.fill();
    },
    (s) => {
      encuadrar(s);
      const alo = s.createLinearGradient(
        -largoRelleno / 2,
        0,
        largoRelleno / 2,
        0
      );
      alo.addColorStop(0, hex(HAZ_DENTRO_A));
      alo.addColorStop(1, hex(HAZ_DENTRO_B));
      s.fillStyle = alo;
      /* De borde a borde en el sistema girado: un cuadrado del tamaño de la
         diagonal cubre el lienzo esté como esté el ángulo. Un degradado lineal
         repite sus paradas extremas fuera de su tramo, así que pasarse no
         inventa color ninguno. */
      const d = Math.hypot(W, H);
      s.fillRect(-d, -d, d * 2, d * 2);
    }
  );

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Sombra baja y tenue en toda la pared. La intensidad de la luz atenúa la
// sombra hasta anularla dentro del haz. Esta máscara lee una copia del campo
// de iluminación; no altera ni ese mapa ni la textura del hormigón.
function texturaSombraPared(luzPared) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 768;
  const g = c.getContext('2d');
  g.drawImage(luzPared.image, 0, 0, c.width, c.height);
  const luz = g.getImageData(0, 0, c.width, c.height).data;
  const pixels = g.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    const altura = PARED_H * (1 - (y + 0.5) / c.height);
    const vertical = Math.exp(-Math.pow(altura / 0.55, 2));
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const intensidad = (0.2126 * luz[i] + 0.7152 * luz[i + 1] + 0.0722 * luz[i + 2]) / 255;
      const t = clamp01((intensidad - 0.7) / 0.25);
      const penumbra = 1 - t * t * (3 - 2 * t);
      pixels.data[i + 3] = Math.round(
        255 * 0.11 * penumbra * vertical
      );
    }
  }
  g.putImageData(pixels, 0, 0);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Helpers de canvas del suelo. El plano del suelo se gira -90° en x, así que
   el eje y local va al -z del mundo: la fila 0 del canvas es el fondo. */
function ejesSuelo(tam, centroZ, N) {
  return {
    px: (x) => ((x + tam / 2) / tam) * N,
    py: (z) => ((z - centroZ + tam / 2) / tam) * N,
    esc: N / tam,
  };
}

const N_SUELO = 1024;

/* El tono de la sombra de esta sala, para las dos capas que oscurecen.

   No es gris. Toda la luz de aquí es cálida (HemisphereLight 0xfff7e8 arriba,
   0xd2ccbe de rebote), así que la penumbra es el mismo hormigón recibiendo
   menos luz y se va a tierra. Se ha comprobado contra la referencia: el muro
   sin luz mide #8e826d, y si a la pared iluminada (246, 237, 224) se le compone
   este tono al 56% sale (142, 131, 113), que es ese valor con dos puntos de
   diferencia. Con un gris neutro no cuadra ni un canal. */
const SOMBRA = 'rgba(60,48,26,';

/* Campo de iluminación del pavimento. El reflejo del vidrio se compone
   después, en un material separado que sigue la cámara y las hojas. */
function texturaFiltroSuelo(tam, centroZ) {
  const N = N_SUELO;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d');
  const e = ejesSuelo(tam, centroZ, N);

  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, N, N);

  /* Campo, primer término: el fondo por la izquierda se apaga. Medido a
     z = -20.8, el pavimento pasa de 235 en x = -2.8 a 150 en x = -8.6. */
  const izquierda = g.createLinearGradient(e.px(-11), 0, e.px(-3.5), 0);
  izquierda.addColorStop(0, `${SOMBRA}0.34)`);
  izquierda.addColorStop(1, `${SOMBRA}0)`);
  g.fillStyle = izquierda;
  desenfocar(g, 1.1 * e.esc, (s) => {
    s.fillRect(0, 0, N, e.py(-13));
  }, (s) => {
    s.fillStyle = izquierda;
    s.fillRect(0, 0, N, N);
  });

  /* Campo, segundo término: todo lo que queda a la derecha del biombo. Es la
     caída más fuerte del cuadro y la que asienta el peso de la composición:
     132 contra 235, o sea 0.56. */
  const derecha = g.createLinearGradient(e.px(1.2), 0, e.px(9.5), 0);
  derecha.addColorStop(0, `${SOMBRA}0)`);
  derecha.addColorStop(0.5, `${SOMBRA}0.14)`);
  derecha.addColorStop(1, `${SOMBRA}0.34)`);
  g.fillStyle = derecha;
  g.fillRect(0, 0, N, N);

  /* Campo, tercer término: el primer plano baja un punto respecto de la franja
     media. En la referencia el pavimento pegado a la cámara marca 165 a 180
     contra los 205 de la franja de z = -9.6. */
  const cerca = g.createLinearGradient(0, e.py(-9), 0, e.py(-2));
  cerca.addColorStop(0, `${SOMBRA}0)`);
  cerca.addColorStop(1, `${SOMBRA}0.12)`);
  g.fillStyle = cerca;
  g.fillRect(0, e.py(-11), N, N);

  // El haz aclara el propio campo antes de componer el reflejo. No se suma
  // después del vidrio: eso blanqueaba tanto la sombra como el poro del suelo.
  const haz = g.createRadialGradient(e.px(-2.4), e.py(-19), 0,
                                    e.px(-2.4), e.py(-19), 7 * e.esc);
  haz.addColorStop(0, 'rgba(255,253,247,0.88)');
  haz.addColorStop(0.35, 'rgba(255,253,247,0.58)');
  haz.addColorStop(1, 'rgba(255,253,247,0)');
  g.fillStyle = haz;
  g.fillRect(0, 0, N, N);

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ==========================================================================
   Montaje
   ========================================================================== */

export function crearEscenaVidrio({ canvas, alPrimerFotograma, alEscenaLista }) {
  const revisionFija = import.meta.env.DEV && new URLSearchParams(location.search).has('hero');
  const movimientoReducido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const estrecho = window.matchMedia('(max-width: 820px)').matches;
  const modesto = (navigator.hardwareConcurrency || 8) <= 4 || estrecho;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  /* dpr progresivo. El primer fotograma se paga casi entero en compilación de
     shaders, y ese coste escala con el número de píxeles: a dpr 2 sobre
     1440x900 son 4 Mpx. Se arranca a 1.2 y se sube al objetivo en cuanto hay
     algo en pantalla. */
  const DPR_OBJETIVO = modesto ? 1.3 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping; // ACES apaga el crema
  /* Exposición medida, no elegida. El muro sin sombra de la referencia marca
     246 de luminancia y el pavimento de la franja media 205; con 0.97 este
     render daba 215 y 160. Faltaba un 14% en el muro y un 28% en el suelo, y
     ese déficit es lo que hacía que ninguna capa de luz se viese: las curvas de
     sombra estaban resueltas contra un blanco de 246 que la escena no
     alcanzaba, así que al aplicarlas el resultado se iba al gris entero. */
  renderer.toneMappingExposure = 1.38;

  const scene = new Scene();
  scene.background = new Color(0xf3eee4);
    /* Plano cercano a 2 cm. El arranque deja la cámara a menos de 20 cm del
     vidrio, y con near a 5 cm la lámina entera podía caer dentro del plano de
     recorte: se recortaba y por detrás aparecía la pared. */
  const camera = new PerspectiveCamera(FOV_INICIO, 1.5, 0.02, 220);

  /* -- Hormigón ---------------------------------------------------------- */
  const cargador = new TextureLoader();

  // El suelo conserva su albedo fotográfico; pared, altura y rugosidad
  // utilizan canales independientes y una escala homogénea en metros.
  const mapa = (url, rx, ry) => {
    const t = cargador.load(url, () => pedirFotograma());
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  const micro = microHormigon();
  const detalle = (textura, rx, ry) => {
    const t = textura.clone();
    t.repeat.set(rx, ry);
    return t;
  };
  const matPared = (color) =>
    new MeshStandardMaterial({
      map: detalle(micro.albedo, 12, 4.5),
      color,
      roughness: 0.96,
      roughnessMap: detalle(micro.rugosidad, 24, 9),
      bumpMap: detalle(micro.altura, 24, 9),
      bumpScale: 0.004,
      metalness: 0,
      envMapIntensity: 0.75,
    });

  const pared = new Mesh(new PlaneGeometry(PARED_W, PARED_H), matPared(0xfbfaf7));
  pared.position.set(0, PARED_H / 2, PARED_Z);
  scene.add(pared);

  // La sala se cierra: el borde de la pared no puede entrar en cuadro en
  // ningún punto del recorrido de cámara.
  const largoLateral = FRENTE_Z - PARED_Z;
  [-1, 1].forEach((s) => {
    const m = new Mesh(
      new PlaneGeometry(largoLateral, PARED_H),
      matPared(s < 0 ? 0xf1efeb : 0xebe9e5)
    );
    m.position.set(s * LATERAL_X, PARED_H / 2, PARED_Z + largoLateral / 2);
    m.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(m);
  });

  const frente = new Mesh(
    new PlaneGeometry(PARED_W, PARED_H),
    matPared(0xefedea)
  );
  frente.position.set(0, PARED_H / 2, FRENTE_Z);
  frente.rotation.y = Math.PI;
  scene.add(frente);

  const techo = new Mesh(
    new PlaneGeometry(PARED_W, largoLateral),
    matPared(0xfdfcfa)
  );
  techo.position.set(0, TECHO_Y, PARED_Z + largoLateral / 2);
  techo.rotation.x = Math.PI / 2;
  scene.add(techo);

  // Hormigón satinado, con poro fino y reflejo difuso de las láminas.
  const suelo = new Mesh(
    new PlaneGeometry(220, 220),
    new MeshStandardMaterial({
      map: mapa('/media/tex/floor.webp', 42, 42),
      /* Con el mapa ya neutro, la calidez del
         pavimento la pone este color y no la textura. Salió de medir: con el
         mapa neutro el suelo daba (1.00, 0.98, 0.94) de proporción y la
         referencia pide (1.00, 0.95, 0.87). */
      color: 0xf3ebde,
      roughness: 0.86,
      roughnessMap: detalle(micro.rugosidad, 55, 55),
      bumpMap: detalle(micro.altura, 55, 55),
      bumpScale: 0.003,
      metalness: 0,
      envMapIntensity: 0.42,
    })
  );
  suelo.rotation.x = -Math.PI / 2;
  scene.add(suelo);

  // El entorno y los mapas de iluminación se montan en tareas diferidas.
  const TAM_SUELO = 56;
  const CENTRO_SUELO = -14;
  const desechables = [micro.albedo, micro.altura, micro.rugosidad];

  const planoLuz = (geo, mapa, extra = {}) =>
    new Mesh(
      geo,
      new MeshBasicMaterial({
        map: mapa,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        ...extra,
      })
    );

  const diferidas = [
    // 1. Entorno. Afecta al especular de lo que ya está en pantalla, así que va
    //    primero. El pase de PMREM es GPU, no hilo principal, pero no es gratis.
    () => {
      const pmrem = new PMREMGenerator(renderer);
      const equirect = texturaEntorno();
      const entorno = pmrem.fromEquirectangular(equirect).texture;
      scene.environment = entorno;
      desechables.push(entorno);
      equirect.dispose();
      pmrem.dispose();
    },

    // 2. Resolución definitiva, una vez pasada la compilación de shaders.
    () => {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, DPR_OBJETIVO)
      );
      medir();
    },

    // 3. El rótulo de la pared.
    () => {
      construirRotulo();

      /* La tipografía puede no estar lista cuando se dibuja el lienzo. Con el
         «05» bastaba con recalcar la textura, pero aquí el ancho de las dos
         líneas depende de la fuente real, y con él la escala y el apilado: si
         llega después, se rehace el rótulo entero una sola vez. */
      if (document.fonts?.load) {
        document.fonts.load("300 400px 'Host Grotesk'").then(() => {
          construirRotulo();
          pedirFotograma();
        });
      }
    },

    // 4. Haz y sombra ambiental independientes. Sin trazo en la unión.
    () => {
      // Geometría y posición idénticas a la pared: no adelantar este plano.
      // El sesgo de profundidad de planoLuz evita z-fighting sin desplazar
      // su silueta sobre el suelo. El material y el mapa de luz son propios.
      const luzPared = planoLuz(
        pared.geometry,
        texturaLuzPared(),
        { blending: MultiplyBlending, premultipliedAlpha: true }
      );
      luzPared.name = 'Iluminación de pared — capa independiente';
      luzPared.position.copy(pared.position);
      scene.add(luzPared);

      const sombraPared = planoLuz(pared.geometry, texturaSombraPared(luzPared.material.map));
      sombraPared.name = 'Sombra suave de pared — capa independiente';
      sombraPared.position.copy(pared.position);
      sombraPared.renderOrder = 2;
      scene.add(sombraPared);
    },

    // 5. Campo de luz del suelo, antes de la huella de vidrio.
    () => {
      // La capa termina físicamente en la pared. Si se prolonga detrás, el
      // sesgo de profundidad la hace asomar sobre la última fila del muro.
      const frente = CENTRO_SUELO + TAM_SUELO / 2;
      const largo = frente - PARED_Z;
      const geometriaLuzSuelo = new PlaneGeometry(TAM_SUELO, largo);
      const uv = geometriaLuzSuelo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setY(i, uv.getY(i) * largo / TAM_SUELO);
      }
      const filtroSuelo = planoLuz(
        geometriaLuzSuelo,
        texturaFiltroSuelo(TAM_SUELO, CENTRO_SUELO),
        { blending: MultiplyBlending, premultipliedAlpha: true }
      );
      filtroSuelo.name = 'Iluminación de suelo — capa independiente';
      filtroSuelo.rotation.x = -Math.PI / 2;
      filtroSuelo.position.set(0, 0, (frente + PARED_Z) / 2);
      filtroSuelo.renderOrder = 4;
      scene.add(filtroSuelo);
    },


  ];

  /* El rótulo va en su propio grupo porque se rehace entero cuando llega la
     tipografía, y porque cada línea lleva su propia opacidad. */
  const rotulo = new Group();
  scene.add(rotulo);

  let rotuloAlto = 0;
  let rotuloAncho = ROTULO_W;
  let rotuloCentro = 0;

  function construirRotulo() {
    rotulo.children.slice().forEach((m) => {
      rotulo.remove(m);
      m.geometry.dispose();
      m.material.map?.dispose();
      m.material.dispose();
    });
    /* El tono del surco sale del muro que el bloque tiene detrás DONDE está, y
       no donde se midió la caja: la primera vez todavía no se ha encuadrado, así
       que se parte del sitio de diseño. */
    const compuesto = componerRotulo(rotulo.position.x || ROTULO_X);
    rotuloAlto = compuesto.alto;
    rotuloAncho = compuesto.ancho;
    rotuloCentro = compuesto.centro;
    compuesto.lineas.forEach((l, i) => {
      const poner = (textura, extra = {}) => {
        const m = planoLuz(new PlaneGeometry(l.w, l.h), textura, {
          opacity: 0,
          ...extra,
        });
        m.position.set(l.x, l.y, 0);
        m.userData.linea = i;
        rotulo.add(m);
        return m;
      };
      // La capa que RESTA: cara del surco y filo a contraluz.
      poner(l.oscura).userData.capa = 'oscura';
      // Y la que SUMA: solo el filo iluminado.
      if (l.clara) {
        poner(l.clara, { blending: AdditiveBlending }).userData.capa = 'clara';
      }
    });
    encuadrarRotulo(camera.aspect);
    actualizarRotulo(progreso);
  }

  // Las dos capas de una línea comparten geometría y posición, así que para
  // medir y encuadrar basta con una de ellas.
  const lineasRotulo = () =>
    rotulo.children.filter((m) => m.userData.capa !== 'clara');

  /* Encuadre del rótulo según la proporción de pantalla.

     En 16:9 la caja medida cabe entera y el rótulo queda donde estaba el «05»,
     sin tocar nada. En vertical no: el campo horizontal se estrecha, la cámara
     retrocede, y de la pared solo quedan en cuadro unos 9.5 m, con lo que el
     rótulo se salía por la derecha. Con el dígito eso era un recorte cualquiera;
     con un nombre es un nombre partido, que no es una opción.

     Así que en pantallas estrechas el bloque se encoge hasta lo que cabe y se
     mete dentro del cuadro. Y si ha tenido que desplazarse, sube por encima de
     las cúspides de las láminas en lugar de cruzarlas: corrido Y cruzado a la
     vez deja de leerse. */
  function encuadrarRotulo(aspecto) {
    if (!rotulo.children.length) return;

    const dist = finalPos.z - PARED_Z;
    const medioAncho = dist * aspecto * Math.tan((FOV_FINAL * Math.PI) / 360);
    // 0.8 del ancho visible, no más: pegado a los bordes el rótulo deja de leerse
    // como pintado en un muro y pasa a leerse como una capa sobre el cuadro.
    const escala = Math.min(1, (medioAncho * 2 * 0.8) / rotuloAncho);
    const margen = medioAncho - (rotuloAncho * escala) / 2 - 0.3;
    // La sangría corre el bloque a la derecha de la caja medida, así que su
    // centro no es ROTULO_X: se parte del centro real y desde ahí se acota.
    const centro = ROTULO_X + rotuloCentro * escala;
    const x = clamp(finalPos.x - margen, finalPos.x + margen, centro);

    const cima = Math.max(...LAMINAS.map((l) => l.h));
    const y =
      x < centro - 0.05 ? cima + 0.5 + (rotuloAlto * escala) / 2 : ROTULO_Y;

    rotulo.scale.setScalar(escala);
    // Por DELANTE del mapa de sombra del muro, que va a +0.2: el filo
    // encendido tiene que sumar sobre el muro ya resuelto, no sobre el crudo.
    rotulo.position.set(x, y, PARED_Z + 0.35);
  }

  /* Fundido por progreso de scroll, con suavizado en los dos extremos: una
     rampa lineal arranca y frena de golpe, y sobre hormigón quieto eso se ve. */
  function actualizarRotulo(p) {
    rotulo.children.forEach((m) => {
      const i = m.userData.linea ?? 0;
      const [a, b] = ROTULO_ENTRADA[Math.min(i, ROTULO_ENTRADA.length - 1)];
      const t = clamp01((p - a) / (b - a));
      m.visible = t > 0;
      m.material.opacity = ROTULO_OPACIDAD * t * t * (3 - 2 * t);
    });
  }

  /* Una tarea por hueco de inactividad. requestIdleCallback si existe, y si no
     un setTimeout corto: lo que importa es que entre dos tareas haya al menos
     un fotograma, para que el scroll no se atasque mientras se montan. */
  function montarDiferidas() {
    const tarea = diferidas.shift();
    if (!tarea) {
      alEscenaLista?.();
      return;
    }
    tarea();
    pedirFotograma();
    const cola =
      window.requestIdleCallback || ((f) => setTimeout(f, 24));
    cola(montarDiferidas, { timeout: 500 });
  }

  /* -- Luces ------------------------------------------------------------- */
  /* Sin mapa de sombras en toda la escena: la única cosa que podría proyectar
     sombra es el vidrio, y el vidrio no bloquea la luz, la tiñe. Su sombra es
     la huella de color de las dos capas de arriba. */
  /* Tono y potencia medidos contra la referencia, no elegidos. El muro sin la
     capa de sombra renderizaba #e8d9b9 donde la referencia da #f7ede0: faltaba
     un 7% de rojo, un 9% de verde y un 21% de AZUL. O sea que no era solo que
     hubiera poca luz, es que la luz estaba demasiado cálida, y ese exceso de
     amarillo lo heredaban las láminas al multiplicar el fondo. */
  scene.add(new HemisphereLight(0xfffefd, 0xe4e0d8, 0.54));
  scene.add(new AmbientLight(0xfffcf6, 0.26));

  const sol = new DirectionalLight(0xfff9ee, 0.95);
  sol.position.copy(SOL);
  sol.target.position.copy(SOL_MIRA);
  scene.add(sol.target);
  scene.add(sol);

  const reflejos = reflejosVidrio(LAMINAS, SOL_DIR);
  scene.add(reflejos.malla);

  /* -- Las láminas ------------------------------------------------------- */
  const suciedad = cargador.load('/media/tex/glass-smudge.webp', () =>
    pedirFotograma()
  );
  suciedad.wrapS = suciedad.wrapT = RepeatWrapping;
  suciedad.colorSpace = LinearSRGBColorSpace;

  const vidrios = new Group();
  scene.add(vidrios);

  /* Las dos mallas de cada lámina, para poder girarlas por fotograma. Van
     juntas porque el plano de brillo tiene que seguir exactamente a la caja:
     si se desincronizan un grado, el especular se despega del vidrio. */
  const hojas = [];

  LAMINAS.forEach((l, i) => {
    const geo = geometriaVidrio(l.w, l.h, GROSOR);
    const transmitida = texturaTransmitida(l);
    desechables.push(transmitida);

    const colocar = (m) => {
      m.position.set(l.x, l.h / 2, l.z);
      m.rotation.set(l.inclinacion, l.rotY, 0);
      return m;
    };

    /* CUERPO. Multiplicación: compone con lo que haya detrás, incluidas las
       otras láminas. Es la única forma de que un cristal detrás de otro se
       vea, y es además la física del vidrio coloreado. */
    const cuerpo = new MeshBasicMaterial({
      map: transmitida,
      blending: MultiplyBlending,
      transparent: true,
      premultipliedAlpha: true, // MultiplyBlending lo exige en three
      depthWrite: false,
      toneMapped: false,
      side: FrontSide,
    });
    desechables.push(cuerpo);

    // Canto dieléctrico con bisel de 3 mm: la cara estrecha absorbe, el bisel
    // devuelve la ventana. Sin barniz adicional que duplique el especular.
    const canto = new MeshPhysicalMaterial({
      color: new Color(l.canto),
      roughness: 0.12,
      metalness: 0,
      ior: 1.5,
      clearcoat: 0,
      specularIntensity: 1,
      envMapIntensity: 0.85,
      side: FrontSide,
    });
    desechables.push(canto);

    const bisel = canto.clone();
    // El bisel transmite el fondo; su brillo procede del Fresnel, no de una
    // cara de color blanco que iluminaría el perímetro por igual.
    bisel.color.set(0xffffff);
    bisel.transmission = 1;
    bisel.thickness = GROSOR;
    bisel.attenuationColor.set(l.canto);
    bisel.attenuationDistance = 0.12;
    bisel.roughness = 0.09;
    bisel.envMapIntensity = 0.25;
    desechables.push(bisel);
    const malla = colocar(new Mesh(geo, [cuerpo, canto, bisel]));
    malla.renderOrder = 6 + i * 2;
    vidrios.add(malla);

    // Reflexión de la cara, con una contribución pequeña sobre la absorción.
    const brillo = colocar(
      new Mesh(
        new PlaneGeometry(l.w, l.h),
        new MeshPhysicalMaterial({
          color: 0x000000,
          roughness: 0.16,
          // El mapa oscuro original multiplicaba 0.11 por ~0.09 y dejaba
          // rugosidad 0.01. Variación acotada mediante un mínimo en el shader.
          metalness: 0,
          specularIntensity: 1,
          envMapIntensity: 0.3 * l.brillo,
          iridescence: 0,
          iridescenceIOR: 1.32,
          iridescenceThicknessRange: [140, 460],
          transparent: true,
          toneMapped: false,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        })
      )
    );
    brillo.material.roughnessMap = suciedad;
    brillo.material.forceSinglePass = true;
    brillo.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = 0.13 + roughnessFactor * 1.8;`
      );
      // Esta malla aporta luz a un framebuffer ya convertido a sRGB. Convertir
      // su negro especular por separado elevaba un reflejo pequeño a un velo
      // blanco. Mantener la contribución lineal limita ese error de composición.
      shader.fragmentShader = shader.fragmentShader.replace('#include <colorspace_fragment>', '');
    };
    brillo.material.customProgramCacheKey = () => 'vidrio-especular-lineal-v2';
    brillo.renderOrder = 7 + i * 2;
    vidrios.add(brillo);

    hojas.push({ l, malla, mallas: [malla, brillo], actual: 0, objetivo: 0 });
  });

  /* -- El puntero --------------------------------------------------------- */
  /* Solo con ratón. En táctil, pointermove llega con el dedo ya apoyado y deja
     la hoja girada hasta que se toca otra cosa: un estado de reposo que el
     usuario no puede deshacer. */
  const conRaton =
    HOVER_ACTIVO &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rayo = new Raycaster();
  const puntero = new Vector2();
  let punteroDentro = false;

  if (conRaton && !movimientoReducido) {
    const mover = (e) => {
      const caja = canvas.getBoundingClientRect();
      puntero.set(
        ((e.clientX - caja.left) / caja.width) * 2 - 1,
        -((e.clientY - caja.top) / caja.height) * 2 + 1
      );
      punteroDentro = true;
      pendiente = true;
    };
    const salir = () => {
      punteroDentro = false;
      pendiente = true;
    };
    /* En la SECCIÓN y no en el lienzo: encima del vidrio hay la copia del hero,
       que se come los eventos, y con el listener en el lienzo la hoja se
       soltaba al pasar por el titular. Los eventos siguen burbujeando hasta
       aquí, así que la posición es la misma y no hay agujeros. */
    const zona = canvas.closest('[data-hero-escenario]') || canvas;
    zona.addEventListener('pointermove', mover, { passive: true });
    zona.addEventListener('pointerleave', salir, { passive: true });
    zona.addEventListener('pointercancel', salir, { passive: true });
  }

  /* Reparto del giro entre las hojas y suavizado. Se llama con la cámara ya
     colocada, porque el rayo sale de ella. */
  let ultimoT = 0;
  function girarHojas(p, t) {
    const dt = ultimoT ? Math.min(64, t - ultimoT) : 16;
    ultimoT = t;

    const amplitud =
      HOVER_GIRO * clamp01((p - HOVER_DESDE) / (HOVER_HASTA - HOVER_DESDE));

    let tocada = null;
    if (punteroDentro && amplitud > 0) {
      // La matriz del mundo lleva el giro del fotograma anterior. Un fotograma
      // de retraso sobre un gesto de 190 ms no se percibe, y así no hay que
      // recalcularla dos veces.
      vidrios.updateMatrixWorld();
      rayo.setFromCamera(puntero, camera);
      const cortes = rayo.intersectObjects(
        hojas.map((h) => h.malla),
        false
      );
      if (cortes.length) tocada = cortes[0].object;
    }

    // Aproximación exponencial: el mismo gesto en cualquier refresco.
    const k = 1 - Math.exp(-dt / HOVER_TAU);
    hojas.forEach((h, i) => {
      // Hacia la cámara siempre: se le RESTA ángulo, sea cual sea su signo.
      h.objetivo = h.malla === tocada ? -Math.sign(h.l.rotY) * amplitud : 0;
      h.actual += (h.objetivo - h.actual) * k;
      if (Math.abs(h.objetivo - h.actual) < 1e-5) h.actual = h.objetivo;
      const y = h.l.rotY + h.actual;
      h.mallas.forEach((m) => (m.rotation.y = y));
      reflejos.actualizar(i, y);
    });
  }

  /* -- Recorrido de cámara ------------------------------------------------ */
  let fovArranque = FOV_INICIO;
  const finalPos = new Vector3(0, CAMARA_Y, 0);
  const finalMira = new Vector3(0, 0, PARED_Z);
  const punto = new Vector3();
  const mira = new Vector3();

  /* Encuadre de arranque: las cuatro esquinas del cuadro tienen que caer
     dentro de la lámina central, o se ve por detrás de ella. Se resuelve
     numéricamente porque la relación entre proporción de pantalla y punto de
     corte no es lineal ni de lejos: el rayo del borde y el plano de la lámina
     son casi paralelos. */
  function resolverArranque(aspecto) {
    /* Campo de arranque acotado por la proporción de pantalla.
       Con la lámina girada 51.7°, el rayo del borde del cuadro deja de cortar
       su plano cuando medio campo horizontal pasa de 38.3°: a partir de ahí el
       borde mira A LO LARGO de la lámina en vez de contra ella, y no hay
       retranqueo que lo arregle. Se acota en 80° la suma de medio campo más el
       giro, que deja margen, y nunca por debajo del campo final para que el
       retroceso no invierta el zoom. En pantallas normales no cambia nada; en
       una 21:9 es lo único que evita ver por detrás del vidrio. */
    const tope =
      (2 * Math.atan(Math.tan(((80 - 51.7) * Math.PI) / 180) / aspecto) * 180) /
      Math.PI;
    fovArranque = Math.max(FOV_FINAL, Math.min(FOV_INICIO, tope));

    const mediaAlto = (fovArranque * Math.PI) / 360;
    const mediaAncho = Math.atan(aspecto * Math.tan(mediaAlto));

    const normal = new Vector3(Math.sin(CENTRAL.rotY), 0, Math.cos(CENTRAL.rotY));
    const eje = new Vector3(Math.cos(CENTRAL.rotY), 0, -Math.sin(CENTRAL.rotY));
    const centro = new Vector3(CENTRAL.x, ARRANQUE_Y, CENTRAL.z);

    // Base de la cámara. No gira: solo cae 2.55°.
    const frente = new Vector3(0, -Math.sin(CAIDA), -Math.cos(CAIDA));
    const derecha = new Vector3(1, 0, 0);
    const arriba = new Vector3().crossVectors(derecha, frente).normalize();

    const esquinas = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        esquinas.push(
          frente
            .clone()
            .addScaledVector(derecha, sx * Math.tan(mediaAncho))
            .addScaledVector(arriba, sy * Math.tan(mediaAlto))
            .normalize()
        );
      }
    }

    const limite = CENTRAL.w / 2 - ARRANQUE_MARGEN;
    const suelo = ARRANQUE_MARGEN;
    const techo = CENTRAL.h - ARRANQUE_MARGEN;
    const punto = new Vector3();

    /* El parámetro libre es la distancia FÍSICA al plano de la lámina, no el
       desplazamiento en z. Planteado sobre z, mover la cámara a la izquierda
       reducía la distancia al vidrio sin que el solver se enterase, y el
       respaldo llegó a dejarla a 4.3 cm del plano: con la cara frontal a 2.6 cm
       y el recorte cercano a 5 cm, la lámina se recortaba entera y se veía la
       pared por detrás. */
    const zDe = (dx, d) =>
      (d - dx * Math.sin(CENTRAL.rotY)) / Math.cos(CENTRAL.rotY);

    const evaluar = (dx, d) => {
      const cam = new Vector3(CENTRAL.x + dx, ARRANQUE_Y, CENTRAL.z + zDe(dx, d));
      // Se recalcula en lugar de confiar en el parámetro: así el resultado no
      // depende de que zDe() y esta proyección estén de acuerdo.
      const dPlano = cam.clone().sub(centro).dot(normal);
      let min = Infinity;
      let max = -Infinity;
      let dentro = true;
      for (const rayo of esquinas) {
        const den = -rayo.dot(normal);
        // Rayo paralelo al plano o divergente: esa esquina nunca corta.
        if (den <= 1e-4) return { dentro: false, min, max };
        const t = dPlano / den;
        if (t <= 0) return { dentro: false, min, max };
        punto.copy(cam).addScaledVector(rayo, t);
        const s = punto.clone().sub(centro).dot(eje);
        min = Math.min(min, s);
        max = Math.max(max, s);
        if (punto.y < suelo || punto.y > techo) dentro = false;
      }
      return { dentro, min, max };
    };

    /* Suelo duro de distancia: media cara de vidrio (2.6 cm) más 18 cm de aire.
       Por debajo de esto la lámina entra en el plano de recorte de la cámara. */
    const D_MIN = GROSOR / 2 + 0.18;
    let d = 0.34;
    let dx = 0;
    let mejor = null;

    for (let i = 0; i < 48; i++) {
      const a = evaluar(dx, d);
      if (!a.dentro) {
        if (d <= D_MIN) break;
        d = Math.max(D_MIN, d * 0.82);
        continue;
      }
      const medio = (a.min + a.max) / 2;
      if (Math.abs(medio) > 0.01) {
        // Derivada numérica: el desplazamiento lateral mueve el corte con una
        // pendiente que depende del aspecto, así que no se puede asumir.
        const b = evaluar(dx + 0.02, d);
        const pendiente = b.dentro ? ((b.min + b.max) / 2 - medio) / 0.02 : 1;
        dx -= medio / (Math.abs(pendiente) < 1e-3 ? 1 : pendiente);
        continue;
      }
      if ((a.max - a.min) / 2 > limite) {
        if (d <= D_MIN) {
          mejor = { dx, d: D_MIN };
          break;
        }
        d = Math.max(D_MIN, d * 0.85);
        continue;
      }
      mejor = { dx, d };
      break;
    }

    /* Por encima de 2.4 de proporción (32:9) no hay solución geométrica: con la
       lámina girada 51.7°, el borde del cuadro queda paralelo a su plano y no
       lo corta a ninguna distancia. Se acepta la distancia mínima y que en el
       instante inicial se vea una franja de sala por el borde derecho. Lo que
       NO se acepta es acercarse más: eso mete la lámina en el plano de recorte
       y entonces se ve la pared entera, que es infinitamente peor. */
    if (!mejor) mejor = { dx: 0, d: D_MIN };

    ARRANQUE.set(
      CENTRAL.x + mejor.dx,
      ARRANQUE_Y,
      CENTRAL.z + zDe(mejor.dx, mejor.d)
    );
  }

  /* El plano final se recalcula con el aspecto: en vertical el campo
     horizontal se estrecha y las tres láminas dejarían de caber, así que la
     cámara retrocede y se centra sobre ellas. En 3:2 sale exactamente el
     plano medido en la referencia. */
  function resolverPlanoFinal(aspecto) {
    resolverArranque(aspecto);
    const medioFovH = Math.atan(aspecto * Math.tan((FOV_FINAL * Math.PI) / 360));
    const necesario = 3.45 / Math.tan(medioFovH);
    const z = Math.max(0, -14 + necesario);
    const x = z > 0 ? 1.75 * Math.min(1, z / 8) : 0;
    finalPos.set(x, CAMARA_Y + z * 0.02, z);
    const distPared = finalPos.z - PARED_Z;
    finalMira.set(x, finalPos.y - Math.tan(CAIDA) * distPared, PARED_Z);
    // La mira solo existe para la sonda de encuadre: la orientación de la
    // cámara se fija con rotation, no con lookAt.
    mira.copy(finalMira);
    // El rótulo depende del plano final, así que se reencuadra con él.
    encuadrarRotulo(aspecto);
  }

  let progreso = movimientoReducido ? 1 : 0;
  let pendiente = true;
  let visible = true;
  let vivo = true;
  let primero = true;

  function colocarCamara(p, t) {
    // El primer tramo de scroll mueve más, para que cualquier gesto mínimo
    // revele ya que el cuadro está vivo.
    const tt = Math.pow(clamp01(p), 0.8);

    // El rótulo se funde con el progreso crudo, no con tt: la curva de la
    // cámara acelera el arranque, y aplicada al fundido lo adelantaría.
    actualizarRotulo(p);

    // Traslación en línea recta. Ni un grado de giro de cámara en todo el
    // recorrido.
    punto.lerpVectors(ARRANQUE, finalPos, tt);
    camera.position.copy(punto);

    if (!movimientoReducido && !revisionFija) {
      // Deriva de reposo. Arranca casi a cero porque a 0.8 m de la lámina el
      // cuadro abarca medio metro y cualquier amplitud se nota.
      const amp = lerp(0.0015, 0.05, tt * tt);
      camera.position.x += Math.sin(t * 0.00021) * amp;
      camera.position.y += Math.cos(t * 0.00016) * amp * 0.55;
    }

    // Orientación fija: sin guiñada, con la caída medida en la referencia.
    camera.rotation.set(-CAIDA, 0, 0);
    camera.fov = lerp(fovArranque, FOV_FINAL, tt);
    camera.updateProjectionMatrix();

    // Con la cámara ya en su sitio: el rayo del puntero sale de ella.
    camera.updateMatrixWorld();
    girarHojas(p, t);
  }

  function medir() {
    const caja = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(caja.width));
    const h = Math.max(1, Math.round(caja.height));
    camera.aspect = w / h;
    resolverPlanoFinal(camera.aspect);
    renderer.setSize(w, h, false);
    /* En píxeles de BÚFER, no de CSS: el ancho de línea se resuelve contra el
       búfer de dibujo, así que con dpr 1.75 un valor en px de CSS daría un
       canto casi al doble de grueso. */
    pendiente = true;
  }

  function pedirFotograma() {
    pendiente = true;
  }

  function fotograma(t) {
    if (!vivo) return;
    requestAnimationFrame(fotograma);
    if (!visible) return;
    if (!pendiente && movimientoReducido) return;

    colocarCamara(progreso, t);
    renderer.render(scene, camera);
    pendiente = false;

    if (primero) {
      primero = false;
      alPrimerFotograma?.();
      // Con el cuadro ya visible, se monta el resto sin prisa.
      montarDiferidas();
    }
  }

  medir();
  // window.resize no cubre los cambios de caja del propio lienzo (pin de
  // ScrollTrigger, barras del móvil, panel del navegador). ResizeObserver sí.
  const ro = new ResizeObserver(medir);
  ro.observe(canvas);

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
    rootMargin: '160px',
  });
  io.observe(canvas);

  requestAnimationFrame(fotograma);

  /* Sonda de encuadre. Solo en desarrollo: reproyecta a coordenadas u, v de
     pantalla los mismos puntos que se midieron sobre la referencia. */
  if (import.meta.env.DEV) {
    const proyectar = (v3) => {
      const p = v3.clone().project(camera);
      return { u: +((p.x + 1) / 2).toFixed(4), v: +((1 - p.y) / 2).toFixed(4) };
    };
    /* Sonda de color. Sin ella la comparación con la referencia se hace a ojo,
       y a ojo se falla: la primera lectura de este cuadro daba el muro de la
       derecha en #e0d9cb cuando mide #aa9d86, y con ese error el haz se estuvo
       ajustando en la dirección contraria durante varias vueltas.

       readPixels tiene que ir en la MISMA tarea que el render, porque el búfer
       de dibujo se descarta al presentar el fotograma y sin preserveDrawingBuffer
       lo que se lee después es negro. Así que se pinta aquí mismo y se lee sin
       ceder el hilo. */
    const muestrear = (puntos) => {
      // Recolocar ANTES de pintar. El bucle de rAF se para cuando el lienzo
      // sale de vista, así que si se pinta con la cámara tal como quedó, lo
      // que se lee es el macro azul del arranque y no el plano final. Se
      // perdió una vuelta entera de medición por esto.
      colocarCamara(progreso, performance.now());
      renderer.render(scene, camera);
      const gl = renderer.getContext();
      const w = renderer.domElement.width;
      const h = renderer.domElement.height;
      const buf = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      const leer = (u, v, r = 4) => {
        const cx = Math.round(u * (w - 1));
        const cy = Math.round((1 - v) * (h - 1));
        let R = 0;
        let G = 0;
        let B = 0;
        let n = 0;
        for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
          for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
            const i = (y * w + x) * 4;
            R += buf[i];
            G += buf[i + 1];
            B += buf[i + 2];
            n++;
          }
        }
        return [R / n, G / n, B / n].map(Math.round);
      };
      return Object.fromEntries(
        Object.entries(puntos).map(([k, [u, v]]) => {
          const c = leer(u, v);
          return [
            k,
            {
              hex: `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`,
              lum: Math.round(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]),
            },
          ];
        })
      );
    };

    window.__hero = {
      camera,
      rotulo,
      muestrear,
      referencia: {
        juntaParedSuelo: 0.542,
        bases: [0.61, 0.62, 0.635],
        cimas: [0.271, 0.217, 0.207],
        cantosU: [
          [0.407, 0.557],
          [0.57, 0.706],
          [0.755, 0.911],
        ],
        // Leída sobre el «05» de la referencia: es la caja que hoy ocupa el
        // rótulo, y sigue siendo el patrón contra el que se comprueba.
        rotulo: { u: [0.495, 0.892], v: [0.054, 0.444] },
      },
      medir: () => {
        // Igual que muestrear(): recolocar antes de leer. El bucle de rAF se
        // para con el lienzo fuera de vista, y sin esto la sonda devuelve el
        // encuadre del arranque por muy fijado que esté el progreso.
        colocarCamara(progreso, performance.now());
        return {
          fov: +camera.fov.toFixed(2),
          aspecto: +camera.aspect.toFixed(3),
          camara: camera.position.toArray().map((v) => +v.toFixed(3)),
          caida: +(
            (Math.atan2(
              camera.position.y - mira.y,
              Math.hypot(camera.position.x - mira.x, camera.position.z - mira.z)
            ) *
              180) /
            Math.PI
          ).toFixed(2),
          juntaParedSuelo: proyectar(new Vector3(0, 0, PARED_Z)).v,
          laminas: LAMINAS.map((l) => {
            const dir = new Vector3(Math.cos(l.rotY), 0, -Math.sin(l.rotY));
            const iz = new Vector3(
              l.x - (dir.x * l.w) / 2,
              0,
              l.z - (dir.z * l.w) / 2
            );
            const de = new Vector3(
              l.x + (dir.x * l.w) / 2,
              0,
              l.z + (dir.z * l.w) / 2
            );
            return {
              base: proyectar(new Vector3(l.x, 0, l.z)).v,
              cima: proyectar(new Vector3(l.x, l.h, l.z)).v,
              u: [proyectar(iz).u, proyectar(de).u],
            };
          }),
          rotulo: {
            // El bloque se mueve y se escala con la proporción, así que se mide
            // donde está de verdad y no sobre las constantes de la caja.
            escala: +rotulo.scale.x.toFixed(3),
            centro: rotulo.position.toArray().map((v) => +v.toFixed(3)),
            lineas: lineasRotulo().map((m) => {
              const p = m.getWorldPosition(new Vector3());
              const mitad = (m.geometry.parameters.width * rotulo.scale.x) / 2;
              return {
                u: [
                  proyectar(new Vector3(p.x - mitad, p.y, PARED_Z)).u,
                  proyectar(new Vector3(p.x + mitad, p.y, PARED_Z)).u,
                ],
                v: proyectar(new Vector3(p.x, p.y, PARED_Z)).v,
                opacidad: +m.material.opacity.toFixed(3),
              };
            }),
          },
        };
      },
    };
  }

  return {
    setProgreso(p) {
      progreso = clamp01(p);
      pendiente = true;
    },
    destruir() {
      vivo = false;
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else if (m) {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        }
      });
      desechables.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
