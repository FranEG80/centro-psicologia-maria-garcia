/* ==========================================================================
   Copia de las páginas interiores.

   Vive aparte de contenido.js a propósito: contenido.js es el inventario del
   centro (datos verificados, listados clínicos, fotografía) y lo tocan varias
   manos. Esto es solo el texto redactado de cada página, tal y como quedó en
   estructura-textos.md, pendiente todavía del visto bueno de la clienta.

   Regla de siempre: nada de precios, horarios, duración de sesión,
   testimonios ni plazos. No fueron facilitados y no se inventan. Donde falta
   el dato hay un PENDIENTE, no una suposición.
   ========================================================================== */

import artInkblot from '../assets/photo/art-inkblot.webp';
import childrenRoom from '../assets/photo/children-room.webp';
import gameForms from '../assets/photo/game-forms.webp';
import gameRings from '../assets/photo/game-rings.webp';
import officeCalm from '../assets/photo/office-calm.webp';
import officeDarkwood from '../assets/photo/office-darkwood.webp';
import reception from '../assets/photo/reception.webp';

/* --------------------------------------------------------------------------
   Las seis áreas. Cada entrada completa el registro de `areas` en
   contenido.js, del que salen el título, el sumario y el listado clínico.

   `cierre` cambia de epígrafe según el área: en las cinco clínicas la
   pregunta real del visitante es cuándo pedir cita; en la forense no —ahí el
   encargo suele venir de un abogado o de un particular con un procedimiento
   abierto—, así que la pregunta es quién lo encarga.
   -------------------------------------------------------------------------- */
export const detallesAreas = {
  infancia: {
    entradilla:
      'Un niño no dice «tengo ansiedad». Deja de dormir, estalla por cualquier cosa, se queda callado o le duele la barriga cada mañana de colegio.',
    cuerpo:
      'El trabajo empieza por traducir eso: entender qué está pasando por debajo del síntoma, y desde ahí decidir qué hacer, con el niño y con su familia.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando algo lleva tiempo y no remite solo. Cuando el colegio comenta algo que en casa no se ve, o al revés. Cuando ha habido un cambio fuerte —una mudanza, una separación, una pérdida— y el niño no vuelve a su sitio. O cuando la duda es simplemente si esto es normal para su edad: esa pregunta también se responde en una valoración.',
    },
    imagen: {
      src: childrenRoom,
      alt: 'Rincón de trabajo de la zona infantil, con mesa baja, sillas pequeñas y pizarra.',
      pie: 'La zona infantil, donde se trabaja a su altura',
    },
  },

  escolares: {
    entradilla:
      'Esforzarse mucho y avanzar poco no es falta de ganas. Detrás de un mal curso suele haber algo concreto: una dificultad específica con la lectura o el cálculo, un problema de atención, o una capacidad alta que se aburre y se apaga.',
    cuerpo:
      'Ponerle nombre cambia la conversación con el colegio y con el propio niño.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando las notas no se corresponden con el esfuerzo. Cuando lee y no retiene lo leído, o escribe con una dificultad que no mejora con la práctica. Cuando el colegio sugiere una valoración. Cuando los deberes se han convertido en el conflicto diario de casa.',
    },
    imagen: {
      src: gameForms,
      alt: 'Cubos de colores para la prueba de diseño de bloques, sobre una superficie clara.',
      pie: 'Material de evaluación del centro',
    },
  },

  adultos: {
    entradilla:
      'Se llega por algo que ya no se sostiene: la ansiedad que no baja, el ánimo que no levanta, una pérdida que no termina de colocarse, una decisión que lleva meses parada.',
    cuerpo:
      'No hace falta que sea grave para que merezca atención. Basta con que esté ocupando demasiado sitio.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando el malestar dura más de lo razonable o se repite en ciclos. Cuando afecta al sueño, al trabajo o a la gente de alrededor. Cuando ha habido un cambio vital —un duelo, una separación, un despido, una enfermedad— y la adaptación no llega. Cuando hablarlo con quien está fuera del asunto ayudaría más que seguir dándole vueltas dentro.',
    },
    imagen: {
      src: officeCalm,
      alt: 'El despacho de consulta desde detrás de la mesa, con la ventana y la luz natural al fondo.',
      pie: 'El despacho, con luz natural',
    },
  },

  familia: {
    entradilla:
      'En una familia el problema rara vez está en una sola persona: está en cómo se hablan, en lo que se da por sabido y en lo que nadie dice.',
    cuerpo:
      'Aquí se trabaja con el vínculo, no con un culpable. Y cuando hay una separación de por medio, se puede trabajar además desde la mediación: llegar a acuerdos sin convertirlo en una batalla, sobre todo si hay hijos.',
    /* La acreditación de mediación se repite aquí además de en el pie a
       propósito: en esta página es justo el dato que se viene a comprobar. */
    acreditacion: {
      epigrafe: 'Mediación familiar',
      texto: 'Mediadora Familiar de la Junta de Andalucía, nº de registro 631.',
    },
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando las mismas discusiones se repiten sin avanzar. Cuando la convivencia se ha vuelto tensa y nadie sabe por dónde empezar. Cuando hay una separación en curso y hacen falta acuerdos sobre los hijos. Cuando la relación con un hijo adolescente se ha roto y no hay manera de retomarla.',
    },
    imagen: {
      src: officeDarkwood,
      alt: 'El despacho de consulta visto desde la puerta, con mesa de madera oscura y dos butacas.',
      pie: 'El mismo despacho sirve para una sesión de pareja o de familia',
    },
  },

  forense: {
    entradilla:
      'Un procedimiento judicial a veces necesita una valoración psicológica rigurosa y por escrito: un informe que sirva como prueba y que su autora pueda defender ante el juzgado.',
    cuerpo:
      'Es un trabajo distinto del clínico. No busca tratar: busca evaluar con método y responder con precisión a lo que se pregunta.',
    cierre: {
      epigrafe: 'Quién suele encargarlo',
      texto:
        'Particulares que necesitan un informe para su procedimiento, despachos de abogados, y profesionales que trabajan con menores o con víctimas y necesitan asesoramiento psicológico para llevar un caso.',
    },
    imagen: {
      src: reception,
      alt: 'Recepción del centro, con mostrador claro y las titulaciones enmarcadas en la pared.',
      pie: 'Las titulaciones, a la vista en recepción',
    },
  },

  neuropsicologia: {
    entradilla:
      'La memoria, la atención, el lenguaje y la capacidad de planificar se pueden medir. Y cuando algo falla —por la edad, por una lesión, por un trastorno del desarrollo— se puede saber exactamente qué falla y en qué grado.',
    cuerpo:
      'A partir de ahí se diseña un programa de estimulación cognitiva ajustado a esa persona, no un cuaderno de ejercicios genérico.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando aparecen olvidos que empiezan a interferir en el día a día. Cuando un familiar mayor se desorienta o pierde el hilo con frecuencia. Tras una lesión cerebral, para saber qué funciones han quedado afectadas. O cuando hace falta una valoración cognitiva completa que oriente un diagnóstico.',
    },
    /* Solo esta área enseña el material: es la única en la que el instrumento
       de evaluación explica de verdad en qué consiste el trabajo. */
    muestraMateriales: true,
    imagen: {
      src: gameRings,
      alt: 'Torre de Hanoi de madera con anillas de distintos tamaños.',
      pie: 'Torre de Hanoi: planificación y control de impulsos',
    },
  },
};

/* Resumen SEO de cada área. La descripción del <head> no puede ser la
   entradilla literal: empieza con una escena y no con lo que se atiende. */
export const metaAreas = {
  infancia:
    'Valoración e intervención en infancia y adolescencia en Motril: desarrollo, conducta, sueño, lenguaje, emociones y adaptación.',
  escolares:
    'Dificultades de aprendizaje, TDAH, altas capacidades y estrés académico. Valoración e intervención en Motril, Granada.',
  adultos:
    'Ansiedad, estado de ánimo, duelo, conflictos y trastornos adaptativos. Psicología para adultos en Motril, Granada.',
  familia:
    'Terapia familiar y de pareja, separación y divorcio, y mediación familiar acreditada por la Junta de Andalucía, en Motril.',
  forense:
    'Peritaje psicológico, informes forenses y ratificación en juzgados. Psicología jurídica y forense en Motril, Granada.',
  neuropsicologia:
    'Valoración neuropsicológica y programas de estimulación cognitiva para adultos, niños y adolescentes, en Motril.',
};

/* --------------------------------------------------------------------------
   Índice de áreas
   -------------------------------------------------------------------------- */
export const indiceAreas = {
  marca: 'Seis áreas',
  titulo: 'Valoración e intervención',
  entradilla:
    'Valoración e intervención en psicología general, infantil y juvenil, familiar, jurídica y forense, y neuropsicología.',
  cuerpo:
    'Seis áreas, un mismo modo de trabajar: primero se mira con calma y se pone nombre a lo que pasa; después se decide qué hacer.',
};

/* --------------------------------------------------------------------------
   El centro
   -------------------------------------------------------------------------- */
export const consulta = {
  marca: 'La consulta',
  titulo: 'De la mano en todo momento',
  entradilla:
    'Trato de tú a tú, del principio al final. La misma persona valora, interviene y acompaña: no hay derivaciones internas ni cambio de profesional a mitad de proceso.',
  espacio: {
    epigrafe: 'El espacio',
    parrafos: [
      'El despacho sirve igual para una sesión individual, una de pareja o una con toda la familia sentada. Y la zona infantil es una sala aparte, con mesa baja, sillas pequeñas y pizarra, para que los niños trabajen a su altura y no a la del adulto.',
      'Y una sala de espera con las titulaciones a la vista, que es donde deben estar.',
    ],
  },
  /* PENDIENTE — «Cómo funciona», los cuatro pasos del proceso, no se publica
     todavía porque el dato es de la clienta y no consta. Preguntas abiertas en
     estructura-textos.md: vía preferida para pedir cita, duración y contenido
     de la primera sesión, cadencia de las siguientes, precios, sesiones
     online, presencia de los padres, encargo y plazos de un peritaje, horario,
     política de cancelaciones y aseguradoras. */
};

/* --------------------------------------------------------------------------
   Sobre mí
   -------------------------------------------------------------------------- */
export const sobreMi = {
  marca: 'Sobre mí',
  titulo: 'María García Molina',
  sumario: 'Psicóloga sanitaria y mediadora familiar. En Motril desde 2005.',
  entradilla:
    'Práctica clínica continuada en Motril desde 2005, y una formación que ha ido en tres direcciones a la vez: la neuropsicología, el ámbito jurídico y forense, y la mediación familiar.',
  cuerpo:
    'Esa combinación es poco habitual y explica el alcance del centro: el mismo despacho puede valorar a un niño con dificultades de aprendizaje, mediar en una separación y elaborar un informe pericial.',
};

/* --------------------------------------------------------------------------
   Contacto
   -------------------------------------------------------------------------- */
export const contacto = {
  marca: 'Contacto',
  titulo: 'Escríbeme y lo vemos',
  entradilla:
    'Lo más rápido es WhatsApp. Si prefieres llamar, el mismo número funciona para las dos cosas.',
  /* Sin formulario, y es una decisión, no un olvido: un formulario en el que
     alguien cuenta por qué quiere venir recoge datos de salud, categoría
     especial del art. 9 RGPD, con todo el papeleo que eso arrastra. WhatsApp y
     el teléfono ya cubren el caso. */
};

/* --------------------------------------------------------------------------
   Material de evaluación, tal y como se describe en la página de
   neuropsicología. Las fotografías y los pies ya están en contenido.js; aquí
   solo va la lámina, que no forma parte de aquel listado.
   -------------------------------------------------------------------------- */
export const laminaRorschach = {
  src: artInkblot,
  alt: 'Lámina simétrica de manchas de tinta, del tipo empleado en la prueba de Rorschach.',
};

/* --------------------------------------------------------------------------
   Páginas legales.

   ESTADO REAL, y conviene que quede escrito aquí:

   · Aviso legal. Existe un documento redactado por PROTECTION REPORT que debe
     publicarse tal cual. Ese documento NO está en el repositorio, así que lo
     que hay abajo es el armazón con los datos verificados del centro y los
     huecos marcados. Se sustituye por el texto del proveedor antes de
     publicar.
   · Política de privacidad. No existe. El documento que pasó la clienta es un
     aviso legal: no dice para qué se usan los datos, cuánto se conservan ni
     cómo ejercer los derechos, y no menciona los datos de salud, que aquí son
     los que importan.
   · Política de cookies. No existe, o falta confirmación por escrito de que no
     hace falta.

   Las tres páginas se publican con un aviso visible de borrador. Publicar un
   texto legal inventado como si fuera definitivo es peor que no tener página.
   -------------------------------------------------------------------------- */
export const avisoBorrador =
  'Borrador. El texto definitivo lo entrega la asesoría que redactó el aviso legal del centro; este bloque se sustituye íntegro antes de publicar.';

/* Datos de identificación que sí están verificados. El NIF y el dominio
   faltan, y sin ellos el aviso legal no cumple el art. 10 de la LSSI-CE. */
export const identificacion = [
  { etiqueta: 'Titular', valor: 'María García Molina' },
  { etiqueta: 'Actividad', valor: 'Psicóloga sanitaria y mediadora familiar' },
  { etiqueta: 'NIF', valor: 'PENDIENTE' },
  { etiqueta: 'Domicilio', valor: 'C. Rafael Alberti, 3 · 18600 Motril, Granada' },
  { etiqueta: 'Teléfono', valor: '637 03 34 48' },
  { etiqueta: 'Correo', valor: 'mariagarciamolina16@gmail.com' },
  { etiqueta: 'Nº colegiada', valor: 'AO 05323' },
  { etiqueta: 'Mediadora Familiar de la Junta de Andalucía', valor: 'nº 631' },
  { etiqueta: 'NICA', valor: '67672' },
  { etiqueta: 'Dominio', valor: 'PENDIENTE' },
];
