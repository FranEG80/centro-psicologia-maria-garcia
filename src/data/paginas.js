
import artInkblot from '../assets/photo/art-inkblot.webp';
import childrenRoom from '../assets/photo/children-room.webp';
import gameForms from '../assets/photo/game-forms.webp';
import gameRings from '../assets/photo/game-rings.webp';
import officeCalm from '../assets/photo/office-calm.webp';
import officeDarkwood from '../assets/photo/office-darkwood.webp';
import reception from '../assets/photo/reception.webp';

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
    muestraMateriales: true,
    imagen: {
      src: gameRings,
      alt: 'Torre de Hanoi de madera con anillas de distintos tamaños.',
      pie: 'Torre de Hanoi: planificación y control de impulsos',
    },
  },
};

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

export const indiceAreas = {
  marca: 'Áreas',
  titulo: 'Valoración e intervención',
  entradilla:
    'Valoración e intervención en psicología general, infantil y juvenil, familiar, jurídica y forense, y neuropsicología.',
  cuerpo:
    'Varias áreas, un mismo modo de trabajar: primero se mira con calma y se pone nombre a lo que pasa; después se decide qué hacer.',
};

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
};

export const sobreMi = {
  marca: 'Sobre mí',
  titulo: 'María García Molina',
  sumario: 'Psicóloga sanitaria y mediadora familiar. En Motril desde 2005.',
  entradilla:
    'Práctica clínica continuada en Motril desde 2005, y una formación que ha ido en tres direcciones a la vez: la neuropsicología, el ámbito jurídico y forense, y la mediación familiar.',
  cuerpo:
    'Esa combinación es poco habitual y explica el alcance del centro: el mismo despacho puede valorar a un niño con dificultades de aprendizaje, mediar en una separación y elaborar un informe pericial.',
};

export const contacto = {
  marca: 'Contacto',
  titulo: 'Escríbeme y lo vemos',
  entradilla:
    'Lo más rápido es WhatsApp. Si prefieres llamar, el mismo número funciona para las dos cosas.',
};

export const laminaRorschach = {
  src: artInkblot,
  alt: 'Lámina simétrica de manchas de tinta, del tipo empleado en la prueba de Rorschach.',
};

export const avisoBorrador =
  'Borrador. El texto definitivo lo entrega la asesoría que redactó el aviso legal del centro; este bloque se sustituye íntegro antes de publicar.';

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
