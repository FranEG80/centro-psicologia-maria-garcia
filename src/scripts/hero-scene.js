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
     canto    las cuatro caras estrechas de la propia caja, sombreadas por la
              escena. Nada de líneas dibujadas encima: a 14 m el cuadro abarca
              12.04 m sobre 1536 px, o sea 7.84 mm por píxel, así que un canto
              de 52 mm ocupa 6.6 px, que es justo lo que mide en la referencia.
              La geometría ya da el ancho correcto y lo único que hacía falta
              era sombrearla bien.

   Los colores de multiplicación no son inventados: son el cociente entre el
   color observado en la referencia y el hormigón que hay detrás.

   ── Todo lo demás también se mide, y se mide contra el RENDER ─────────────
   Leer la referencia no basta. Un cociente correcto aplicado sobre un fondo
   equivocado da un compuesto equivocado, y este cuadro estuvo varias vueltas
   pareciendo verde porque el muro tiraba a amarillo por debajo. Así que el
   bucle es: se leen los valores de la referencia en un punto, se leen los del
   render EN EL MISMO punto con window.__hero.muestrear(), y se corrige canal a
   canal por el cociente entre los dos. Converge en dos o tres vueltas.

   Sobre veintitrés puntos de control (muro dentro y fuera del haz, pavimento
   limpio, cinco alturas de cada lámina y tres distancias de cada huella) el
   desvío medio está en el 3%.

   Lo que ese bucle destapó, y que a ojo no se habría encontrado:

     · el muro fuera del haz no es una rampa de izquierda a derecha, es una
       LOMA: 0.58 en el borde izquierdo, 0.81 hacia el centro, 0.67 a la
       derecha. Ninguna de las dos mitades se deduce de la otra;
     · el haz no se puede SUMAR. El hormigón está a 246 de luminancia y por
       arriba no queda recorrido. Se cubre la pared de sombra y se le abre un
       hueco: la luz no se pinta, se destapa;
     · las manchas del suelo tampoco se suman. Medidas, son (0.72, 0.90, 0.98)
       contra el pavimento limpio, o sea una multiplicación; sumarlas recortaba
       el suelo a blanco y borraba el azul que pretendían poner;
     · el canto de las láminas es lo MÁS oscuro del cuadro, no lo más claro, y
       su filo blanco lo pone el especular, así que se apaga solo hacia abajo.
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
/* transmision: el color que multiplica el vidrio, medido sobre la referencia
   como COCIENTE entre la lámina y el fondo que tiene justo al lado a esa misma
   altura, y no contra un hormigón genérico. Es la diferencia entre medir y
   estimar: el muro de la referencia cae de 246 a 148 de izquierda a derecha,
   así que dividir por un valor único daba láminas cada vez más falsas cuanto
   más a la derecha estaban.

   Cada entrada es [altura, color], con altura 1 en el canto de arriba y 0 en el
   suelo. Cinco paradas y no dos porque el degradado real no es lineal ni de
   lejos: en la lámina central el rojo pasa de 0.62 a 0.40 entre el 92% y el 70%
   de altura, y de 0.40 a 0.19 en todo el resto. Con dos paradas el tercio alto
   salía denso y el bajo claro, o sea al revés.

   Y el vidrio NO oscurece el azul: en el pie de la lámina tercera el cociente
   es (0.19, 0.53, 0.69). Se come el rojo, deja pasar el azul. Los valores que
   había aquí bajaban el azul a 0.68, y bajar el azul de un vidrio azul no lo
   satura, lo apaga.

   La tabla se ha cerrado midiendo el RENDER contra la referencia en los mismos
   quince puntos y dividiendo canal a canal por el error. El desvío no era
   parejo: el rojo salía entre 1.4 y 1.8 veces por encima mientras el azul ya
   estaba en su sitio, o sea que el vidrio absorbía poco justo en el canal que
   le da el color. Corregido el cociente del rojo, el azul aparece solo; no ha
   hecho falta saturar nada.

   suelo: la huella sobre el hormigón, medida igual, como cociente contra el
   pavimento limpio a la misma v. Tres paradas a 0.55 m, 2.7 m y 4.7 m del
   apoyo. Aquí había un error de partida que dejaba el suelo sin una gota de
   azul: se daba por hecho que estas manchas tenían MÁS azul que el hormigón y
   que hacía falta SUMAR. Medido, la mancha más cargada da #34626d sobre un
   limpio de #dcd2c0, o sea (0.24, 0.47, 0.57): es una multiplicación. Y sumar
   sobre un pavimento a 0.85 llevaba los tres canales por encima de 1, así que
   la capa que tenía que poner el azul lo recortaba a BLANCO.

   canto / cantoLuz: el perímetro, cian, nunca blanco. cantoLuz es el canto de
   arriba, que mira a la ventana, y canto el de abajo, contra el hormigón. */
const LAMINAS = [
  {
    x: -0.23,
    z: -15.14,
    w: 2.19,
    h: 2.94,
    rotY: 0.475,
    inclinacion: -0.02,
    transmision: [
      [0.92, 0xdbf0ff],
      [0.7, 0xe4f8ff],
      [0.5, 0xddf8ff],
      [0.3, 0xe6feff],
      [0.1, 0xb8cbd6],
    ],
    suelo: [0x4783a0, 0xe3ebed, 0xfdfeff],
    canto: 0x456d76,
    cantoLuz: 0xe5f8f8,
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
    transmision: [
      [0.92, 0x8ab4da],
      [0.7, 0x44a3eb],
      [0.5, 0x2f9ff6],
      [0.3, 0x1291ef],
      [0.1, 0x287191],
    ],
    suelo: [0x13637f, 0xa3bac4, 0xffffff],
    canto: 0x346673,
    cantoLuz: 0xd9fcff,
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
    transmision: [
      [0.92, 0x9ec2e8],
      [0.7, 0x60a8e7],
      [0.5, 0x3f9cd7],
      [0.3, 0x1f84c7],
      [0.1, 0x186986],
    ],
    suelo: [0x4090ac, 0x859da4, 0xeae5e2],
    canto: 0x003447,
    cantoLuz: 0xb6e1f0,
    cantoLuzCarga: 0.3,
    brillo: 0.86,
  },
];

/* Dónde caen las tres paradas de la huella, en metros contados desde la línea
   de apoyo hacia la cámara, y dónde se ha apagado del todo. Medidos sobre la
   referencia reproyectando las v de las muestras contra el plano del suelo. */
const HUELLA_M = [0.55, 2.7, 4.7];
const HUELLA_LARGO = 5.4;


const GROSOR = 0.052;
const CENTRAL = LAMINAS[1];

/* ── La hoja que tiene el puntero encima se gira ───────────────────────────
   Gesto de puntero, no de scroll: la hoja señalada se vuelve un poco hacia la
   cámara y vuelve sola al soltarla. Girar HACIA la cámara, o sea restando
   ángulo, y no en un sentido fijo: así las tres responden igual aunque la
   tercera esté girada al revés que las otras dos.

   Se enciende y se apaga con PUBLIC_HERO_HOVER. Vale apagarlo: es un adorno,
   y en una web de un centro de psicología puede sobrar. Apagado no se registra
   ningún listener ni se construye el raycaster.

   ── Cuánto se puede girar ─────────────────────────────────────────────────
   Las huellas del suelo no son geometría: son dos texturas de lienzo horneadas
   con las láminas en su ángulo final. Cuando una hoja gira, su línea de apoyo
   gira con ella pero la mancha y el filete se quedan donde están. En la hoja
   central, de 3.29 m, cada grado separa los extremos de la base 2.9 cm de su
   huella, que en el plano final son cuatro píxeles. A cinco grados son veinte,
   y sobre un filete desenfocado siguen sin leerse como despegue; el doble ya
   sí. Ese, y no el gusto, es el techo mientras las huellas sean pintadas.

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
const rgb = (color, a) => {
  const c = new Color(color);
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

      // Desenfoque casi del ancho del filo: el canto queda deshecho y el surco
      // se insinúa en vez de dibujarse.
      g.save();
      g.filter = `blur(${(bisel * 0.4).toFixed(2)}px)`;
      // Corrida hacia abajo-derecha: lo que queda es el filo de ARRIBA-izquierda,
      // que es el que está a contraluz.
      banda(g, `rgba(0,0,0,${ROTULO_SOMBRA})`, bisel, bisel);
      g.restore();

      gl.save();
      gl.filter = `blur(${(bisel * 0.5).toFixed(2)}px)`;
      // Y al revés para el de abajo-derecha, que es el que recibe el rayo.
      banda(gl, muroLocal(ROTULO_LUZ_F), -bisel, -bisel);
      gl.restore();
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

/* La huella de la luz que ha pasado por cada lámina cae ALINEADA con ella y
   hacia la cámara, no de lado. Medido: en la referencia el pavimento a la
   izquierda de la lámina primera (u 0.42 a 0.50 sobre la junta) marca 190 y
   183, o sea hormigón limpio, mientras que directamente bajo las láminas cae a
   102, 77 y 64. No hay lóbulo lateral que reproducir, así que la huella
   desplazada que había aquí sobraba: pintaba color donde la referencia no
   tiene ninguno.

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

  /* El haz, como UN trapecio y en un lienzo aparte.

     Antes iba en treinta y dos tramos, cada uno con su anchura, para poder
     estrecharse. Y salía a franjas: el desenfoque se aplicaba a cada fillRect
     por separado, así que también deshacía sus lados CORTOS, y en el medio
     píxel de solape entre tramos las dos alfas se componían dos veces. Cada
     junta entre tramos quedaba como una banda de sombra cruzando el haz.

     Un trapecio no necesita tramos para estrecharse, el degradado a lo largo
     del eje se resuelve con un createLinearGradient en la dirección del eje, y
     el desenfoque se aplica UNA vez sobre el conjunto ya montado. Sin lados
     cortos que deshacer y sin solapes, no hay dónde se formen franjas. */
  const hoja = document.createElement('canvas');
  hoja.width = W;
  hoja.height = H;
  const h = hoja.getContext('2d');
  h.translate((ax + bx) / 2, (ay + by) / 2);
  h.rotate(angulo);
  const largoRelleno = largo + 80;
  const aA = (HAZ_ANCHO_A * esc) / 2;
  const aB = (HAZ_ANCHO_B * esc) / 2;
  // Se prolonga por los dos extremos, que caen fuera de cuadro, manteniendo la
  // pendiente de las dos aristas.
  const dA = aA + ((aA - aB) * 40) / largo;
  const dB = aB - ((aA - aB) * 40) / largo;
  const alo = h.createLinearGradient(-largoRelleno / 2, 0, largoRelleno / 2, 0);
  alo.addColorStop(0, hex(HAZ_DENTRO_A));
  alo.addColorStop(1, hex(HAZ_DENTRO_B));
  h.fillStyle = alo;
  h.beginPath();
  h.moveTo(-largoRelleno / 2, -dA);
  h.lineTo(largoRelleno / 2, -dB);
  h.lineTo(largoRelleno / 2, dB);
  h.lineTo(-largoRelleno / 2, dA);
  h.closePath();
  h.fill();

  /* Un solo desenfoque, y grande: es lo que hace de feather de las dos aristas
     largas. En la referencia el canto de la banda se resuelve en poco más de
     medio metro de muro. */
  g.save();
  g.filter = `blur(${(0.55 * esc).toFixed(2)}px)`;
  g.drawImage(hoja, 0, 0);
  g.restore();

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
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
  const largo = HUELLA_LARGO;
  return {
    bi,
    bd,
    si: new Vector3(bi.x, 0, bi.z + largo),
    sd: new Vector3(bd.x, 0, bd.z + largo),
    largo,
  };
}

/* Los dos lienzos del suelo van a 1024 y no a 256, y todos sus desenfoques se
   expresan en METROS y no en píxeles de lienzo.

   A 256 sobre 56 m el rastro de una lámina medía trece píxeles de ancho, y
   esos trece se estiraban a doscientos en pantalla: el resultado no era luz
   difusa sobre hormigón, era un degradado con banding y sin borde reconocible,
   y por eso en el render no se veía nada azul a los pies de las láminas. Con
   los radios en metros se puede cambiar la resolución sin volver a tantear
   ningún desenfoque. */
const N_SUELO = 1024;
const desenfoque = (g, e, metros) => {
  g.filter = `blur(${(metros * e.esc).toFixed(2)}px)`;
};

/* El tono de la sombra de esta sala, para las dos capas que oscurecen.

   No es gris. Toda la luz de aquí es cálida (HemisphereLight 0xfff7e8 arriba,
   0xd2ccbe de rebote), así que la penumbra es el mismo hormigón recibiendo
   menos luz y se va a tierra. Se ha comprobado contra la referencia: el muro
   sin luz mide #8e826d, y si a la pared iluminada (246, 237, 224) se le compone
   este tono al 56% sale (142, 131, 113), que es ese valor con dos puntos de
   diferencia. Con un gris neutro no cuadra ni un canal. */
const SOMBRA = 'rgba(60,48,26,';

/* Capa de FILTRO del suelo, en multiplicación. Blanco es identidad. Hace dos
   cosas, y las dos son cocientes leídos sobre la referencia:

     · el CAMPO de luz del pavimento, que no es plano ni de lejos. Medido en
       luminancia sobre la referencia, el suelo va de 240 en el charco del haz
       a 132 en el fondo por la derecha: casi el doble. El render lo tenía todo
       a un mismo tono, y por eso el cuadro se leía como una cartulina;
     · la HUELLA de cada lámina, con la tabla suelo[] de cada una. */
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
  g.fillRect(0, 0, N, e.py(-13));

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

  /* Las tres piezas de cada lámina y las de láminas distintas se MULTIPLICAN
     entre sí, no se tapan. Con source-over, el derrame ancho se dibujaba encima
     de la huella nítida y, al ser opaco, borraba su núcleo: la textura salía
     con el azul flojo y el suelo del render se quedaba casi limpio. Dos filtros
     superpuestos dan el producto de sus densidades, que además es la física. */
  g.globalCompositeOperation = 'multiply';

  LAMINAS.forEach((l) => {
    const r = rastroEnSuelo(l);
    const z0 = (r.bi.z + r.bd.z) / 2;
    const parada = (m) => m / r.largo;

    /* La HUELLA. Arranca en el cociente medido a 55 cm del apoyo y se apaga a
       los 4.7 m. Antes arrancaba en el color del vidrio a contraluz, que va
       mucho más cargado que su propia huella, y se compensaba con una capa que
       sumaba: entre las dos dejaban el suelo recortado a blanco. */
    g.save();
    desenfoque(g, e, 0.3);
    const rampa = g.createLinearGradient(0, e.py(z0), 0, e.py(z0 + r.largo));
    rampa.addColorStop(0, hex(l.suelo[0]));
    rampa.addColorStop(parada(HUELLA_M[0]), hex(l.suelo[0]));
    rampa.addColorStop(parada(HUELLA_M[1]), hex(l.suelo[1]));
    rampa.addColorStop(parada(HUELLA_M[2]), hex(l.suelo[2]));
    rampa.addColorStop(1, '#ffffff');
    g.fillStyle = rampa;
    trazarQuad(g, e, r.bi, r.bd, r.sd, r.si);
    g.fill();
    g.restore();

    /* Derrame lateral. La huella recta solo cubre la anchura exacta de la
       lámina y en la referencia la mancha no tiene canto: la luz que ha cruzado
       tres metros de vidrio llega al suelo ya muy abierta. Va desenfocada más
       de un metro y con el color de la parada intermedia, para que no compita
       con la huella nítida que se pinta encima. */
    g.save();
    desenfoque(g, e, 1.2);
    const abierto = g.createLinearGradient(
      0,
      e.py(z0 - 0.5),
      0,
      e.py(z0 + r.largo * 0.85)
    );
    abierto.addColorStop(0, hex(l.suelo[1]));
    abierto.addColorStop(1, '#ffffff');
    g.fillStyle = abierto;
    trazarQuad(
      g,
      e,
      new Vector3(r.bi.x - 0.7, 0, r.bi.z - 0.5),
      new Vector3(r.bd.x + 0.7, 0, r.bd.z - 0.5),
      new Vector3(r.sd.x + 1.2, 0, r.sd.z - r.largo * 0.15),
      new Vector3(r.si.x - 1.2, 0, r.si.z - r.largo * 0.15)
    );
    g.fill();
    g.restore();

    /* CONTACTO. Un canto de vidrio apoyado en hormigón deja una oclusión de
       pocos centímetros, y es lo único que distingue una lámina apoyada de una
       lámina flotando. Va en tono tierra y no en gris: es el propio pavimento
       recibiendo menos rebote. */
    g.save();
    desenfoque(g, e, 0.09);
    const contacto = g.createLinearGradient(
      0,
      e.py(z0 - 0.05),
      0,
      e.py(z0 + 0.38)
    );
    contacto.addColorStop(0, '#9d9384');
    contacto.addColorStop(0.4, '#c9c1b4');
    contacto.addColorStop(1, '#ffffff');
    g.fillStyle = contacto;
    trazarQuad(
      g,
      e,
      new Vector3(r.bi.x, 0, r.bi.z - 0.05),
      new Vector3(r.bd.x, 0, r.bd.z - 0.05),
      new Vector3(r.bd.x, 0, r.bd.z + 0.38),
      new Vector3(r.bi.x, 0, r.bi.z + 0.38)
    );
    g.fill();
    g.restore();
  });

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* Capa de LUZ del suelo, en aditivo, y solo con lo que de verdad SUMA luz: el
   charco donde el haz llega al pavimento y el filete de la línea de apoyo. El
   azul de las huellas ya no está aquí, porque medido es un producto. */
function texturaLuzSuelo(tam, centroZ) {
  const N = N_SUELO;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d');
  const e = ejesSuelo(tam, centroZ, N);
  g.clearRect(0, 0, N, N);

  /* El charco del haz. La posición no es de tanteo: en la referencia el máximo
     del pavimento está en u 0.34, v 0.58, que reproyectado contra el plano del
     suelo cae en x = -2.4, z = -18.5, y vale 240 contra los 190 del pavimento
     de alrededor. Antes estaba puesto en x = -6.2, casi cuatro metros a la
     izquierda, y con la mitad de carga. */
  g.save();
  desenfoque(g, e, 1.7);
  g.translate(e.px(-2.4), e.py(-18.5));
  g.rotate(-0.62);
  const calido = g.createRadialGradient(0, 0, 2, 0, 0, 7.5 * e.esc);
  calido.addColorStop(0, 'rgba(255,251,240,0.3)');
  calido.addColorStop(0.45, 'rgba(255,250,238,0.19)');
  calido.addColorStop(1, 'rgba(255,249,235,0)');
  g.fillStyle = calido;
  g.scale(1, 1.5);
  g.fillRect(-9 * e.esc, -9 * e.esc, 18 * e.esc, 18 * e.esc);
  g.restore();

  LAMINAS.forEach((l) => {
    const r = rastroEnSuelo(l);

    /* Línea de apoyo: donde el canto inferior toca el hormigón hay un filete
       encendido, justo encima de la oclusión de contacto. Es el par sombra +
       filete lo que planta la lámina; con uno solo de los dos, flota. */
    g.save();
    desenfoque(g, e, 0.07);
    g.strokeStyle = rgb(l.cantoLuz, 0.4);
    g.lineWidth = 0.05 * e.esc;
    g.beginPath();
    g.moveTo(e.px(r.bi.x), e.py(r.bi.z));
    g.lineTo(e.px(r.bd.x), e.py(r.bd.z));
    g.stroke();
    g.restore();
  });

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
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
  /* Exposición medida, no elegida. El muro sin sombra de la referencia marca
     246 de luminancia y el pavimento de la franja media 205; con 0.97 este
     render daba 215 y 160. Faltaba un 14% en el muro y un 28% en el suelo, y
     ese déficit es lo que hacía que ninguna capa de luz se viese: las curvas de
     sombra estaban resueltas contra un blanco de 246 que la escena no
     alcanzaba, así que al aplicarlas el resultado se iba al gris entero. */
  renderer.toneMappingExposure = 1.295;

  const scene = new Scene();
  scene.background = new Color(0xf3eee4);
    /* Plano cercano a 2 cm. El arranque deja la cámara a menos de 20 cm del
     vidrio, y con near a 5 cm la lámina entera podía caer dentro del plano de
     recorte: se recortaba y por detrás aparecía la pared. */
  const camera = new PerspectiveCamera(FOV_INICIO, 1.5, 0.02, 220);

  /* -- Hormigón ---------------------------------------------------------- */
  const cargador = new TextureLoader();

  /* Los dos mapas de hormigón son NEUTROS de origen, y eso no es un detalle.

     Los que había multiplicaban el muro por (0.967, 0.945, 0.868): se comían un
     13% del azul y solo un 3% del rojo. Ese sesgo era el que ponía toda la
     escena amarilla, y como el cuerpo del vidrio multiplica lo que tiene
     detrás, las láminas lo heredaban: por eso salían verdes en vez de azules.

     Compensarlo en el color del material no llega. Para devolver el azul había
     que pedir más de 255 en ese canal, así que el muro se quedaba un 12% corto
     justo dentro del haz, que es donde la referencia tiene su máximo. Y
     corregirlo en el navegador al cargar cuesta un getImageData del mapa entero
     en el hilo principal, cada arranque, para llegar al mismo sitio.

     Un mapa de hormigón es un mapa de DETALLE: aporta el grano, no el color. Así
     que se corrigió el asset. wall.webp se ha regenerado neutro y sin costura;
     floor.webp conserva su grano fotográfico y solo se le han igualado las
     medias de los tres canales (x1.000 / x1.028 / x1.088). Los dos tienen ahora
     los tres canales dentro del 0.5%.

     La calidez de la sala la ponen las luces, que sin textura ya dan #f3ebdb
     contra el #f7ede0 de la referencia. Se conserva; lo que se ha quitado es el
     exceso. */
  const mapa = (url, rx, ry) => {
    const t = cargador.load(url, () => pedirFotograma());
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  /* repeat.y siempre 1: cualquier repeticion vertical mete una costura
     horizontal en mitad de la pared, y la pared es UNA sola zona.

     El mapa ya viene neutro de origen, así que estos
     colores vuelven a ser lo que dicen ser: tonos de hormigón. */
  const matPared = (color, rx, ry) =>
    new MeshStandardMaterial({
      map: mapa('/media/tex/wall.webp', rx, ry),
      color,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.75,
    });

  const pared = new Mesh(new PlaneGeometry(PARED_W, PARED_H), matPared(0xfbfaf7, 5, 1));
  pared.position.set(0, PARED_H / 2, PARED_Z);
  scene.add(pared);

  // La sala se cierra: el borde de la pared no puede entrar en cuadro en
  // ningún punto del recorrido de cámara.
  const largoLateral = FRENTE_Z - PARED_Z;
  [-1, 1].forEach((s) => {
    const m = new Mesh(
      new PlaneGeometry(largoLateral, PARED_H),
      matPared(s < 0 ? 0xf1efeb : 0xebe9e5, 3, 1)
    );
    m.position.set(s * LATERAL_X, PARED_H / 2, PARED_Z + largoLateral / 2);
    m.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(m);
  });

  const frente = new Mesh(
    new PlaneGeometry(PARED_W, PARED_H),
    matPared(0xefedea, 5, 1)
  );
  frente.position.set(0, PARED_H / 2, FRENTE_Z);
  frente.rotation.y = Math.PI;
  scene.add(frente);

  const techo = new Mesh(
    new PlaneGeometry(PARED_W, largoLateral),
    matPared(0xfdfcfa, 5, 1)
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
      /* Con el mapa ya neutro, la calidez del
         pavimento la pone este color y no la textura. Salió de medir: con el
         mapa neutro el suelo daba (1.00, 0.98, 0.94) de proporción y la
         referencia pide (1.00, 0.95, 0.87). */
      color: 0xf8e9db,
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
        texturaLuzPared(),
        { blending: MultiplyBlending, premultipliedAlpha: true }
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

    /* CANTO. Son las cuatro caras estrechas de la lámina, y se sombrean solas.

       Barrido el borde derecho de la lámina segunda en la referencia, la fila
       de píxeles da: vidrio #547d7f, #5f909b, #346673, #66919e, #d9fcff,
       #abbfbf, muro. O sea NÚCLEO OSCURO y FILO BLANCO, alternando, en unos
       nueve píxeles. Las dos bandas claras son las dos caras del vidrio
       devolviendo la ventana; la oscura es el canto visto de través, donde el
       rayo recorre el ancho de la lámina en vez de su espesor.

       Así que el color base es el núcleo (#003447 en la tercera lámina, casi
       negro azulado) y el filo lo pone el especular, no una emisión: con el
       entorno alto y la rugosidad muy baja, la mancha de la ventana se refleja
       en la cara de canto que la mira y deja el filo encendido, mientras la
       opuesta se queda en el tono base. Pintarlo con emissive lo encendía por
       igual en las cuatro caras, que es lo que hacía que pareciese rotulado. */
    const canto = new MeshPhysicalMaterial({
      color: new Color(l.canto),
      roughness: 0.045,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      specularColor: new Color(l.cantoLuz),
      envMapIntensity: 1.8,
      /* Nada de emisión. El filo de la referencia NO es continuo: en el
         recorte se ve encendido en el tramo alto, donde la cara de canto mira
         a la ventana, y apagándose hacia abajo a la vez que el vidrio gana
         densidad. Eso lo hace solo un especular, que depende de hacia dónde
         mire cada punto; una emisión enciende las cuatro caras por igual de
         arriba abajo y es exactamente lo que hacía que pareciese rotulado. */
      emissive: new Color(0x000000),
      emissiveIntensity: 0,
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
          /* Muy bajo, y ahora aún más. Medido, en el tercio bajo de la lámina
             central el rojo del render se quedaba un 23% por encima de la
             referencia por mucho que se cargase la multiplicación, y no podía
             bajar: multiplicar no resta, y este plano SUMA por debajo un
             residuo constante en las tres bandas. En las zonas claras no se
             nota; en las densas es justo lo que impide que el azul llegue. */
          specularIntensity: 0.3,
          envMapIntensity: 0.02 * l.brillo,
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
    hojas.forEach((h) => {
      // Hacia la cámara siempre: se le RESTA ángulo, sea cual sea su signo.
      h.objetivo = h.malla === tocada ? -Math.sign(h.l.rotY) * amplitud : 0;
      h.actual += (h.objetivo - h.actual) * k;
      if (Math.abs(h.objetivo - h.actual) < 1e-5) h.actual = h.objetivo;
      const y = h.l.rotY + h.actual;
      h.mallas.forEach((m) => (m.rotation.y = y));
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
