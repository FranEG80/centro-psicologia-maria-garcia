/* ==========================================================================
   Primer cuadro. Nave de hormigón pálido, suelo y pared, un haz de luz
   diagonal, el nombre rotulado en el muro a tamaño arquitectónico, y tres
   láminas de vidrio dicroico laminado en pie, giradas como las hojas de un
   biombo.

   ── El encuadre está medido, no interpretado ──────────────────────────────
   Sobre la referencia de la clienta (1536 x 1024) se leen las juntas y los
   cantos, y de ahí sale toda la geometría:

     · la junta pared/suelo cae a v = 0.542 y es horizontal en todo el ancho,
       y las verticales del hormigón no convergen: la cámara mira
       perpendicular a la pared, sin guiñada, con una caída de 2.55°;
     · las bases de las láminas caen a v = 0.610 / 0.620 / 0.635 y sus
       cúspides a 0.271 / 0.217 / 0.207, lo que a 1.62 m de altura de cámara y
       32° de campo vertical las sitúa a 15.1 / 14.4 / 13.3 m: la primera es
       la más lejana, la tercera la más cercana;
     · cada lámina proyecta un trapecio. La relación entre sus dos cantos
       verticales (344/322, 413/345, 377/438) da giros de +27°, +57° y -48°:
       es un biombo que se abre hacia la cámara;
     · el «05» de la referencia ocupa u 0.495 a 0.892 y v 0.054 a 0.444, que
       con la pared a 23.9 m son 8.2 x 5.3 m. Esa caja se conserva tal cual y
       ahora la ocupa el rótulo: mismo hueco de muro, mismo peso en el
       encuadre, pero con el nombre en lugar del dígito.

   La sonda window.__hero.medir() reproyecta todos esos puntos para poder
   comparar el resultado con los valores leídos, en lugar de a ojo.

   ── El vidrio se compone, no se refracta ─────────────────────────────────
   La transmisión de MeshPhysicalMaterial excluye del render de refracción a
   los propios objetos transmisivos: un cristal detrás de otro cristal
   desaparece. En la referencia las tres láminas se solapan y se ven unas a
   través de otras, así que el vidrio aquí se construye como lo que es:

     cuerpo   una malla en blending de MULTIPLICACIÓN, con un degradado
              vertical de color transmitido. Multiplicar sí compone: dos
              láminas superpuestas dan el producto de sus dos densidades,
              que es exactamente la física del vidrio coloreado;
     brillo   una segunda malla en aditivo, con color negro y reflejo de
              entorno alto, que aporta solo el especular y el Fresnel;
     canto    una línea de ancho real en píxeles, porque a 14 m un bisel de
              1.4 cm no llega a un píxel y en la referencia mide tres.

   Los colores de multiplicación no son inventados: son el cociente entre el
   color observado en la referencia y el hormigón que hay detrás.
   ========================================================================== */

import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
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
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';

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
/* multiplicaSup / multiplicaInf: el color transmitido arriba y abajo, medido
   sobre la referencia como cociente contra el hormigón. Arriba casi
   incoloro, abajo densidad plena: es el film dicroico.

   filtro / charco: el suelo es hormigón MATE, así que lo que se ve a los pies
   de las láminas no es un reflejo sino la luz que las ha atravesado. Se
   construye con dos capas: filtro multiplica (quita el rojo del hormigón allí
   donde la luz ha pasado por el vidrio) y charco suma (devuelve el azul que
   el vidrio concentra). Multiplicar solo no llega: en la referencia esas
   manchas tienen MÁS azul que el hormigón limpio, y eso no sale de un
   producto.

   canto: cian saturado, nunca blanco. Los cantos de la referencia son
   claramente de color. */
const LAMINAS = [
  {
    x: -0.23,
    z: -15.14,
    w: 2.19,
    h: 2.94,
    rotY: 0.475,
    inclinacion: -0.02,
    multiplicaSup: 0xecfafc,
    multiplicaInf: 0xcaeef5,
    filtro: 0xe8f8f7,
    charco: 0xd8f0ee,
    cargaCharco: 0.2,
    canto: 0xa9cfcb,
    cantoLuz: 0xcfe9e3,
    cantoLuzCarga: 0.2,
    brillo: 0.5,
  },
  {
    x: 1.79,
    z: -14.36,
    w: 3.287,
    h: 3.32,
    rotY: 0.9024,
    inclinacion: -0.014,
    multiplicaSup: 0xaed8e9,
    multiplicaInf: 0x5494b9,
    filtro: 0xc6e2ee,
    charco: 0x7fc4e0,
    cargaCharco: 0.42,
    canto: 0x6ba3b8,
    cantoLuz: 0x9ed3e6,
    cantoLuzCarga: 0.26,
    brillo: 0.72,
  },
  {
    x: 3.77,
    z: -13.34,
    w: 2.419,
    h: 3.27,
    rotY: -0.974,
    inclinacion: -0.018,
    multiplicaSup: 0x7cbae7,
    multiplicaInf: 0x2672ae,
    filtro: 0xa8d3ec,
    charco: 0x55b0d8,
    cargaCharco: 0.56,
    canto: 0x3f7fa4,
    cantoLuz: 0x7cc0e0,
    cantoLuzCarga: 0.3,
    brillo: 0.86,
  },
];

const GROSOR = 0.052;
const CENTRAL = LAMINAS[1];

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
const ROTULO_RELIEVE = 'plano'; // 'hundido' | 'plano'
const ROTULO_TINTA = 0.62; // alfa del trazo, solo en 'plano'
/* Grabado: ancho del filo en em, y carga de las tres capas del surco. */
/* La cara va muy baja a propósito. De cerca el surco se sostiene con los dos
   filos; subir la cara oscurece el trazo entero y a tamaño de pantalla el
   grabado se convierte en un texto oscuro pintado, que es lo contrario. */
/* El trabajo lo hacen los dos FILOS; el fondo del surco va casi sin tinta.
   Con la cara cargada, el interior de cada letra se oscurece entero y el
   grabado se lee como un texto pintado en gris: es lo que había que evitar.
   Bajarla no le quita nada al hueco, porque el hueco lo dan los cantos.

   Y los tres tonos son TIERRA CÁLIDA, no gris neutro. Un surco no es negro: es
   el mismo hormigón recibiendo menos luz, y la luz de esta sala es cálida
   (HemisphereLight 0xfff7e8 arriba, 0xd2ccbe de rebote). Con un gris neutro a
   poca alfa el trazo sale ceniciento y se despega del muro; con el tono del
   propio muro apagado, el ojo lo lee como sombra y no como tinta. Al ser un
   color más claro, además, admite más alfa para el mismo efecto, y eso deja el
   filo mejor definido a distancia. */
const ROTULO_BISEL = 0.014;
const ROTULO_TONO_CARA = 0xcfc5b1;
const ROTULO_TONO_SOMBRA = 0xa2947c;
const ROTULO_TONO_LUZ = 0xfffdf4;
const ROTULO_CARA = 0.01;
const ROTULO_SOMBRA = 0.42;
/* El filo encendido, a la mitad que el de sombra. Sobre hormigón crema un blanco
   a plena carga no lee como luz rasante sino como un contorno pintado. */
const ROTULO_LUZ = 0.42;
const ROTULO_OPACIDAD = ROTULO_RELIEVE === 'plano' ? 0.5 : 0.8; // opacidad del material
/* Algo más presente que el «05» (0.52 x 0.5): un dígito tan fantasma es
   decoración, pero un nombre a ese nivel se lee como un fallo de render. */
const ROTULO_ENTRADA = [
  [0.3, 0.6],
  [0.36, 0.66],
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (min, max, v) => (v < min ? min : v > max ? max : v);
const rgb = (hex, a) => {
  const c = new Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
    c.b * 255
  )},${a})`;
};

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
  v.addColorStop(0, '#fffdf8');
  v.addColorStop(0.32, '#f8f2e6');
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

function componerRotulo() {
  const FS = 200;

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

    if (ROTULO_RELIEVE === 'hundido') {
      /* Grabado, no rotulado: las letras están rehundidas en el hormigón y lo
         único que se ve son las dos paredes del surco.

         La dirección la manda el sol de la escena, que está arriba y a la
         izquierda (SOL). En un surco iluminado desde ahí, la pared interior que
         mira hacia arriba-izquierda queda a contraluz y la de abajo-derecha
         recibe el rayo: banda oscura pegada al canto superior izquierdo, banda
         clara al inferior derecho. Al revés sería un relieve saliente, que es el
         error clásico y se nota aunque no se sepa por qué.

         Las bandas son INTERIORES, así que no valen dos copias desplazadas: eso
         deja el reborde por fuera del trazo y vuelve a leerse como relieve. Cada
         banda se saca restando a la letra una copia de sí misma corrida hacia el
         lado contrario, que es lo que deja justo el filo de dentro. */
      const bisel = Math.max(1, Math.round(ROTULO_BISEL * FS));
      const banda = (color, dx, dy) => {
        const s = document.createElement('canvas');
        s.width = W;
        s.height = H;
        const sg = s.getContext('2d');
        preparar(sg);
        sg.fillStyle = color;
        glifos(sg);
        sg.globalCompositeOperation = 'destination-out';
        glifos(sg, dx, dy);
        return s;
      };

      // Cara del fondo del surco: algo más apagada que el muro, porque le llega
      // menos luz. Es lo que da el hueco antes incluso de ver los filos.
      g.fillStyle = rgb(ROTULO_TONO_CARA, ROTULO_CARA);
      glifos(g);

      g.save();
      // Desenfoque casi del ancho del filo: el canto queda deshecho y el surco
      // se insinúa en vez de dibujarse.
      g.filter = `blur(${(bisel * 0.45).toFixed(2)}px)`;
      g.drawImage(banda(rgb(ROTULO_TONO_SOMBRA, ROTULO_SOMBRA), bisel, bisel), 0, 0);
      g.drawImage(
        banda(rgb(ROTULO_TONO_LUZ, ROTULO_LUZ), -bisel, -bisel),
        0,
        0
      );
      g.restore();
    } else {
      g.fillStyle = `rgba(255,254,250,${ROTULO_TINTA})`;
      glifos(g);
    }

    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return { textura: t, w: W, h: H, letra: ancho / letras.length };
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
      textura: l.textura,
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
  v.addColorStop(0, `#${l.multiplicaSup.toString(16).padStart(6, '0')}`);
  v.addColorStop(1, `#${l.multiplicaInf.toString(16).padStart(6, '0')}`);
  g.fillStyle = v;
  g.fillRect(0, 0, 4, 512);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Dirección en la que cae sobre el suelo la luz que ha pasado por las
   láminas, en metros de desplazamiento por metro de altura.

   No es la dirección del sol, y es a propósito. La referencia de la clienta
   tiene dos luces que no cuadran entre sí: el haz entra en la pared por arriba
   a la izquierda, pero las manchas de color caen a la izquierda y HACIA la
   cámara, que es imposible con esa misma luz. Reproducirlo con una sola
   dirección obliga a elegir: o la pared queda iluminada y las manchas caen
   detrás de las láminas, donde no se ven, o las manchas se ven y la pared se
   queda a contraluz.

   La referencia es el encargo, así que se resuelve como está resuelta allí: el
   sol ilumina pared y suelo, y las manchas se sitúan donde la referencia las
   pone. Al ser un mapa de luz pintado, la decisión es explícita. */
const CAIDA_LUZ = { x: -0.55, z: 0.85 };

/* Huella de una lámina en el suelo: los cuatro puntos donde aterriza la luz
   que la ha atravesado. Los dos de la base son la propia base, porque ya
   están en y = 0. */
function huellaEnSuelo(l) {
  const dir = new Vector3(Math.cos(l.rotY), 0, -Math.sin(l.rotY));
  const bi = new Vector3(
    l.x - (dir.x * l.w) / 2,
    0,
    l.z - (dir.z * l.w) / 2
  );
  const bd = new Vector3(
    l.x + (dir.x * l.w) / 2,
    0,
    l.z + (dir.z * l.w) / 2
  );
  const desplazar = (p) =>
    new Vector3(p.x + CAIDA_LUZ.x * l.h, 0, p.z + CAIDA_LUZ.z * l.h);
  return { bi, bd, ci: desplazar(bi), cd: desplazar(bd) };
}

/* Mapa de luz de la pared. Un solo plano del tamaño exacto de la pared, con
   el haz diagonal trazado en coordenadas del mundo: entra por arriba a la
   izquierda y baja hasta el suelo, como en la referencia. Ninguna junta,
   ningún agujero, ninguna horizontal. */
function texturaLuzPared() {
  const W = 512;
  const H = Math.round((W * PARED_H) / PARED_W);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.clearRect(0, 0, W, H);

  const px = (x) => ((x + PARED_W / 2) / PARED_W) * W;
  const py = (y) => ((PARED_H - y) / PARED_H) * H;
  const esc = W / PARED_W;

  // Caída general de la luz hacia la derecha, suave y sin bordes.
  const caida = g.createLinearGradient(px(-12), 0, px(20), py(0));
  caida.addColorStop(0, 'rgba(48,44,38,0)');
  caida.addColorStop(0.55, 'rgba(48,44,38,0.05)');
  caida.addColorStop(1, 'rgba(42,39,34,0.15)');
  g.fillStyle = caida;
  g.fillRect(0, 0, W, H);

  // El haz. Trazado entre dos puntos del mundo, ambos fuera de cuadro por los
  // extremos, con la anchura perpendicular feathered.
  const A = { x: -21, y: 27 };
  const B = { x: 2.2, y: -9 };
  const ax = px(A.x);
  const ay = py(A.y);
  const bx = px(B.x);
  const by = py(B.y);
  const largo = Math.hypot(bx - ax, by - ay);
  const angulo = Math.atan2(by - ay, bx - ax);
  const ancho = 8.4 * esc;

  g.save();
  g.filter = 'blur(6px)';
  g.translate((ax + bx) / 2, (ay + by) / 2);
  g.rotate(angulo);
  const haz = g.createLinearGradient(0, -ancho / 2, 0, ancho / 2);
  haz.addColorStop(0, 'rgba(255,252,244,0)');
  haz.addColorStop(0.24, 'rgba(255,252,244,0.13)');
  haz.addColorStop(0.62, 'rgba(255,250,239,0.11)');
  haz.addColorStop(1, 'rgba(255,249,236,0)');
  g.fillStyle = haz;
  g.fillRect(-largo / 2 - 40, -ancho / 2, largo + 80, ancho);
  g.restore();

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Oclusión del rincón, lado PARED. Se apoya en el suelo y se deshace hacia
   arriba. Curva en tres tramos, no lineal: un rincón real cae rápido en los
   primeros centímetros y se alarga después. */
function texturaContactoPared() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, 'rgba(44,40,34,0)');
  v.addColorStop(0.55, 'rgba(44,40,34,0.035)');
  v.addColorStop(0.84, 'rgba(44,40,34,0.1)');
  v.addColorStop(1, 'rgba(44,40,34,0.19)');
  g.fillStyle = v;
  g.fillRect(0, 0, 8, 512);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Oclusión del rincón, lado SUELO. Sin esto la junta es una línea falsa: la
   pared llega oscurecida y el suelo arranca a plena luz justo debajo, con un
   salto que ninguna arista real tiene. Va más lejos que la de la pared porque
   el suelo mira al muro y recibe su rebote.

   El suelo se gira -90° en x, así que el +y local cae en el -z del mundo: la
   v = 1 de la textura es el borde pegado a la pared, o sea la fila 0 del
   canvas. */
function texturaContactoSuelo() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, 'rgba(48,44,37,0.2)');
  v.addColorStop(0.16, 'rgba(48,44,37,0.11)');
  v.addColorStop(0.45, 'rgba(48,44,37,0.04)');
  v.addColorStop(1, 'rgba(48,44,37,0)');
  g.fillStyle = v;
  g.fillRect(0, 0, 8, 512);
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

function trazarQuad(g, e, a, b, c, d) {
  g.beginPath();
  g.moveTo(e.px(a.x), e.py(a.z));
  g.lineTo(e.px(b.x), e.py(b.z));
  g.lineTo(e.px(c.x), e.py(c.z));
  g.lineTo(e.px(d.x), e.py(d.z));
  g.closePath();
}

/* El rastro de cada lámina sobre el hormigón.

   En la referencia, debajo de cada lámina y ALINEADO con ella hay un rastro
   vertical alargado de su propio color, que se deshace al alejarse. Eso es
   geometría de reflejo, no de sombra proyectada: una sombra se desplaza de
   lado, un reflejo cae justo debajo. Pero el suelo es hormigón mate, así que
   no se resuelve con un espejo, que daría un borde duro y una copia nítida.

   Se pinta: el rastro se extiende desde la línea de apoyo hacia la cámara, con
   el color transmitido de esa lámina, y se desvanece. Es a la vez lo que se ve
   en la referencia y lo que pediste, luz de color sobre un suelo mate. */
function rastroEnSuelo(l) {
  const dir = new Vector3(Math.cos(l.rotY), 0, -Math.sin(l.rotY));
  const bi = new Vector3(l.x - (dir.x * l.w) / 2, 0, l.z - (dir.z * l.w) / 2);
  const bd = new Vector3(l.x + (dir.x * l.w) / 2, 0, l.z + (dir.z * l.w) / 2);
  const largo = l.h * 0.95;
  return {
    bi,
    bd,
    si: new Vector3(bi.x, 0, bi.z + largo),
    sd: new Vector3(bd.x, 0, bd.z + largo),
    largo,
  };
}

/* Capa de FILTRO del suelo, en multiplicación. Blanco es identidad: solo se
   pinta donde el vidrio interviene, y allí quita del hormigón el rojo que el
   vidrio se ha quedado. Esto es la sombra de color: en toda la escena no hay
   ni una sombra oscura de las láminas, porque el vidrio no bloquea la luz, la
   tiñe. */
function texturaFiltroSuelo(tam, centroZ) {
  const N = 256;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d');
  const e = ejesSuelo(tam, centroZ, N);

  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, N, N);

  LAMINAS.forEach((l) => {
    const r = rastroEnSuelo(l);
    const h = huellaEnSuelo(l);

    // 1. El rastro alineado bajo la lámina. Es el gesto principal.
    g.save();
    g.filter = 'blur(1.25px)';
    const rampa = g.createLinearGradient(
      0,
      e.py((r.bi.z + r.bd.z) / 2),
      0,
      e.py((r.bi.z + r.bd.z) / 2 + r.largo)
    );
    rampa.addColorStop(0, `#${l.multiplicaInf.toString(16).padStart(6, '0')}`);
    rampa.addColorStop(0.26, `#${l.multiplicaSup.toString(16).padStart(6, '0')}`);
    rampa.addColorStop(0.62, `#${l.filtro.toString(16).padStart(6, '0')}`);
    rampa.addColorStop(1, '#ffffff');
    g.fillStyle = rampa;
    trazarQuad(g, e, r.bi, r.bd, r.sd, r.si);
    g.fill();
    g.restore();

    // 2. El lavado ancho que se abre hacia la izquierda, muy tenue.
    g.save();
    g.filter = 'blur(7.5px)';
    g.fillStyle = `#${l.filtro.toString(16).padStart(6, '0')}`;
    trazarQuad(g, e, h.bi, h.bd, h.cd, h.ci);
    g.fill();
    g.restore();
  });

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* Capa de LUZ del suelo, en aditivo: el charco cálido del haz, el azul que
   cada lámina concentra sobre su huella, y el filete encendido de la línea de
   apoyo. Es lo que hace que esas manchas tengan más azul que el hormigón
   limpio, que multiplicando solo es imposible. */
function texturaLuzSuelo(tam, centroZ) {
  const N = 256;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d');
  const e = ejesSuelo(tam, centroZ, N);
  g.clearRect(0, 0, N, N);

  // Charco cálido donde el haz de la pared llega al suelo, por delante y a la
  // izquierda de las láminas.
  g.save();
  g.filter = 'blur(8.5px)';
  g.translate(e.px(-6.2), e.py(-16.5));
  g.rotate(-0.5);
  const calido = g.createLinearGradient(-4.2 * e.esc, 0, 4.2 * e.esc, 0);
  calido.addColorStop(0, 'rgba(255,251,240,0)');
  calido.addColorStop(0.44, 'rgba(255,251,240,0.16)');
  calido.addColorStop(1, 'rgba(255,250,238,0)');
  g.fillStyle = calido;
  g.fillRect(-4.3 * e.esc, -7 * e.esc, 8.6 * e.esc, 14 * e.esc);
  g.restore();

  LAMINAS.forEach((l) => {
    const r = rastroEnSuelo(l);

    // El azul que el vidrio concentra, sobre el mismo rastro. Multiplicar solo
    // no llega: en la referencia esas manchas tienen MÁS azul que el hormigón
    // limpio, y eso no sale de un producto.
    g.save();
    g.filter = 'blur(2px)';
    const rampa = g.createLinearGradient(
      0,
      e.py((r.bi.z + r.bd.z) / 2),
      0,
      e.py((r.bi.z + r.bd.z) / 2 + r.largo)
    );
    rampa.addColorStop(0, rgb(l.charco, l.cargaCharco));
    rampa.addColorStop(0.3, rgb(l.charco, l.cargaCharco * 0.66));
    rampa.addColorStop(1, rgb(l.charco, 0));
    g.fillStyle = rampa;
    trazarQuad(g, e, r.bi, r.bd, r.sd, r.si);
    g.fill();
    g.restore();

    // Línea de apoyo: donde el canto inferior toca el hormigón, un filete algo
    // más encendido. Es lo que planta la lámina en el suelo.
    g.save();
    g.filter = 'blur(0.75px)';
    g.strokeStyle = rgb(l.canto, 0.5);
    g.lineWidth = 0.11 * e.esc;
    g.beginPath();
    g.moveTo(e.px(r.bi.x), e.py(r.bi.z));
    g.lineTo(e.px(r.bd.x), e.py(r.bd.z));
    g.stroke();
    g.restore();
  });

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* ==========================================================================
   Montaje
   ========================================================================== */

export function crearEscenaVidrio({ canvas, alPrimerFotograma }) {
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
  renderer.toneMappingExposure = 0.97;

  const scene = new Scene();
  scene.background = new Color(0xf3eee4);
    /* Plano cercano a 2 cm. El arranque deja la cámara a menos de 20 cm del
     vidrio, y con near a 5 cm la lámina entera podía caer dentro del plano de
     recorte: se recortaba y por detrás aparecía la pared. */
  const camera = new PerspectiveCamera(FOV_INICIO, 1.5, 0.02, 220);

  /* -- Hormigón ---------------------------------------------------------- */
  const cargador = new TextureLoader();
  const mapa = (url, rx, ry) => {
    const t = cargador.load(url, () => pedirFotograma());
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  /* repeat.y siempre 1: cualquier repeticion vertical mete una costura
     horizontal en mitad de la pared, y la pared es UNA sola zona. */
  const matPared = (color, rx, ry) =>
    new MeshStandardMaterial({
      map: mapa('/media/tex/wall.webp', rx, ry),
      color,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.32,
    });

  const pared = new Mesh(new PlaneGeometry(PARED_W, PARED_H), matPared(0xfdfaf3, 5, 1));
  pared.position.set(0, PARED_H / 2, PARED_Z);
  scene.add(pared);

  // La sala se cierra: el borde de la pared no puede entrar en cuadro en
  // ningún punto del recorrido de cámara.
  const largoLateral = FRENTE_Z - PARED_Z;
  [-1, 1].forEach((s) => {
    const m = new Mesh(
      new PlaneGeometry(largoLateral, PARED_H),
      matPared(s < 0 ? 0xf6f0e6 : 0xf0e9dd, 3, 1)
    );
    m.position.set(s * LATERAL_X, PARED_H / 2, PARED_Z + largoLateral / 2);
    m.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(m);
  });

  const frente = new Mesh(
    new PlaneGeometry(PARED_W, PARED_H),
    matPared(0xf4eee3, 5, 1)
  );
  frente.position.set(0, PARED_H / 2, FRENTE_Z);
  frente.rotation.y = Math.PI;
  scene.add(frente);

  const techo = new Mesh(
    new PlaneGeometry(PARED_W, largoLateral),
    matPared(0xfffdf7, 5, 1)
  );
  techo.position.set(0, TECHO_Y, PARED_Z + largoLateral / 2);
  techo.rotation.x = Math.PI / 2;
  scene.add(techo);

  /* Suelo. Hormigón MATE, una sola capa opaca. Nada de espejo: lo que se ve a
     los pies de las láminas no es un reflejo, es la luz que las ha
     atravesado, y eso se pinta en las dos capas de más abajo. */
  const suelo = new Mesh(
    new PlaneGeometry(220, 220),
    new MeshStandardMaterial({
      map: mapa('/media/tex/floor.webp', 42, 42),
      color: 0xe9e3d9,
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.16,
    })
  );
  suelo.rotation.x = -Math.PI / 2;
  scene.add(suelo);

  /* ══ Lo que NO entra en el primer fotograma ═══════════════════════════════
     A p=0 la cámara está a 34 cm de la lámina central y el cuadro es vidrio de
     lado a lado: el «05», los mapas de luz de la pared, las franjas de
     contacto y las dos capas del suelo están TODOS fuera de cámara.

     Construirlos antes de pintar es pagar por adelantado seis desenfoques
     gaussianos en canvas 2D y un pase de PMREM que nadie ve. Y el desenfoque
     de canvas es de lo más lento que existe en el hilo principal.

     Así que se montan después, cada uno en su propia tarea, para que ninguna
     bloquee un fotograma. El orden es el de aparición según retrocede la
     cámara: primero el entorno, que afecta a lo que ya está en pantalla, y al
     final las dos capas del suelo, que no se ven hasta bien entrado el scroll.
     ══════════════════════════════════════════════════════════════════════════ */
  const TAM_SUELO = 56;
  const CENTRO_SUELO = -14;
  const desechables = [];

  const planoLuz = (geo, mapa, extra = {}) =>
    new Mesh(
      geo,
      new MeshBasicMaterial({
        map: mapa,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
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

    // 4. Haz de la pared y las dos franjas de contacto del rincón.
    () => {
      const luzPared = planoLuz(
        new PlaneGeometry(PARED_W, PARED_H),
        texturaLuzPared()
      );
      luzPared.position.set(0, PARED_H / 2, PARED_Z + 0.2);
      scene.add(luzPared);

      const contactoPared = planoLuz(
        new PlaneGeometry(PARED_W, 2.6),
        texturaContactoPared()
      );
      contactoPared.position.set(0, 1.3, PARED_Z + 0.3);
      scene.add(contactoPared);

      const contactoSuelo = planoLuz(
        new PlaneGeometry(PARED_W, 4.2),
        texturaContactoSuelo()
      );
      contactoSuelo.rotation.x = -Math.PI / 2;
      contactoSuelo.position.set(0, 0.004, PARED_Z + 2.1);
      contactoSuelo.renderOrder = 3;
      scene.add(contactoSuelo);
    },

    // 5. Filtro del suelo: multiplica y quita el rojo del hormigón dentro de la
    //    huella de cada lámina. Es la sombra de color.
    () => {
      const filtroSuelo = planoLuz(
        new PlaneGeometry(TAM_SUELO, TAM_SUELO),
        texturaFiltroSuelo(TAM_SUELO, CENTRO_SUELO),
        { blending: MultiplyBlending, premultipliedAlpha: true }
      );
      filtroSuelo.rotation.x = -Math.PI / 2;
      filtroSuelo.position.set(0, 0.008, CENTRO_SUELO);
      filtroSuelo.renderOrder = 4;
      scene.add(filtroSuelo);
    },

    // 6. Luz del suelo: suma el azul que el vidrio concentra. Multiplicar solo
    //    no llega, porque esas manchas tienen más azul que el hormigón limpio.
    () => {
      const luzSuelo = planoLuz(
        new PlaneGeometry(TAM_SUELO, TAM_SUELO),
        texturaLuzSuelo(TAM_SUELO, CENTRO_SUELO),
        { blending: AdditiveBlending, opacity: 0.66 }
      );
      luzSuelo.rotation.x = -Math.PI / 2;
      luzSuelo.position.set(0, 0.012, CENTRO_SUELO);
      luzSuelo.renderOrder = 5;
      scene.add(luzSuelo);
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
    const compuesto = componerRotulo();
    rotuloAlto = compuesto.alto;
    rotuloAncho = compuesto.ancho;
    rotuloCentro = compuesto.centro;
    compuesto.lineas.forEach((l) => {
      const m = planoLuz(new PlaneGeometry(l.w, l.h), l.textura, { opacity: 0 });
      m.position.set(l.x, l.y, 0);
      rotulo.add(m);
    });
    encuadrarRotulo(camera.aspect);
    actualizarRotulo(progreso);
  }

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
    rotulo.position.set(x, y, PARED_Z + 0.1);
  }

  /* Fundido por progreso de scroll, con suavizado en los dos extremos: una
     rampa lineal arranca y frena de golpe, y sobre hormigón quieto eso se ve. */
  function actualizarRotulo(p) {
    rotulo.children.forEach((m, i) => {
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
    if (!tarea) return;
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
  scene.add(new HemisphereLight(0xfff7e8, 0xd2ccbe, 0.42));
  scene.add(new AmbientLight(0xfff8ee, 0.2));

  const sol = new DirectionalLight(0xfff3df, 0.88);
  sol.position.copy(SOL);
  sol.target.position.copy(SOL_MIRA);
  scene.add(sol.target);
  scene.add(sol);

  /* -- Las láminas ------------------------------------------------------- */
  const suciedad = cargador.load('/media/tex/glass-smudge.webp', () =>
    pedirFotograma()
  );
  suciedad.wrapS = suciedad.wrapT = RepeatWrapping;
  suciedad.colorSpace = LinearSRGBColorSpace;

  const vidrios = new Group();
  scene.add(vidrios);

  LAMINAS.forEach((l, i) => {
    const geo = new BoxGeometry(l.w, l.h, GROSOR);
    const transmitida = texturaTransmitida(l);
    desechables.push(transmitida);

    const colocar = (m) => {
      m.position.set(l.x, l.h / 2 - 0.001, l.z);
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

    /* CANTO. No es una línea de un color: son las cuatro caras estrechas de la
       lámina, y se sombrean solas. El vidrio tiene 5.2 cm y a 14 m eso son
       unos 6 px de canto, de sobra para que cada cara reciba su propia luz. La
       de arriba mira al cielo y sale encendida, la que da a la ventana coge el
       especular, la opuesta queda densa, y la de abajo, contra el hormigón,
       casi apagada. Es lo que hace la referencia, y ninguna línea de un solo
       tono lo reproduce.

       Material opaco muy pulido, del color del vidrio visto de perfil, más un
       brillo interno bajo, porque un canto laminado conduce luz por el borde. */
    const canto = new MeshPhysicalMaterial({
      color: new Color(l.canto),
      roughness: 0.14,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.06,
      specularIntensity: 0.7,
      envMapIntensity: 0.55,
      emissive: new Color(l.cantoLuz),
      emissiveIntensity: l.cantoLuzCarga,
      // DoubleSide obligatorio: con FrontSide se descartan las caras de canto
      // cuya normal se aleja de la cámara, que en una lámina girada 52° son
      // precisamente el canto izquierdo y el inferior.
      side: DoubleSide,
    });
    desechables.push(canto);

    // Orden de las caras de BoxGeometry: +x, -x, +y, -y, +z, -z. Las cuatro
    // primeras son el canto; las dos últimas, el cuerpo del vidrio.
    const malla = colocar(
      new Mesh(geo, [canto, canto, canto, canto, cuerpo, cuerpo])
    );
    malla.renderOrder = 6 + i;
    vidrios.add(malla);

    /* BRILLO. Plano del tamaño de la cara, en aditivo y con color negro: solo
       aporta el especular. Va en un plano aparte y no en la caja para no pisar
       el canto, que ya tiene su propia luz.

       Muy bajo a propósito. Una cara de vidrio a incidencia normal refleja un
       4%, y en la referencia las caras casi no reflejan: lo que se ve es
       transmisión, y lo único brillante son los cantos. Con el entorno alto la
       lámina se cubre de un velo blanquecino y deja de parecer cristal. Por eso
       el reflejo de entorno se queda en un residuo y el brillo lo pone el sol,
       que da un destello acotado en vez de un velo. */
    const brillo = colocar(
      new Mesh(
        new PlaneGeometry(l.w, l.h),
        new MeshPhysicalMaterial({
          color: 0x000000,
          roughness: 0.11,
          roughnessMap: suciedad, // polvo y huellas: el vidrio tiene superficie
          metalness: 0,
          specularIntensity: 0.42,
          envMapIntensity: 0.03 * l.brillo,
          iridescence: 0,
          iridescenceIOR: 1.32,
          iridescenceThicknessRange: [140, 460],
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        })
      )
    );
    brillo.renderOrder = 10 + i;
    vidrios.add(brillo);
  });

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

    // Traslación en línea recta. Ni un grado de giro en todo el recorrido.
    punto.lerpVectors(ARRANQUE, finalPos, tt);
    camera.position.copy(punto);

    if (!movimientoReducido) {
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
  }

  function medir() {
    const caja = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(caja.width));
    const h = Math.max(1, Math.round(caja.height));
    camera.aspect = w / h;
    resolverPlanoFinal(camera.aspect);
    renderer.setSize(w, h, false);
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
    window.__hero = {
      camera,
      rotulo,
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
      medir: () => ({
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
          lineas: rotulo.children.map((m) => {
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
      }),
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
