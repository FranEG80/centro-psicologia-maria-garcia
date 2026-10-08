import artInkblot from '../assets/photo/art-inkblot.webp';
import childrenRoom from '../assets/photo/children-room.webp';
import gameForms from '../assets/photo/game-forms.webp';
import gameRings from '../assets/photo/game-rings.webp';
import officeCalm from '../assets/photo/office-calm.webp';
import officeFamily from '../assets/photo/office-family.webp';
import officeDarkwood from '../assets/photo/office-darkwood.webp';

export const detallesAreas = {
  infancia: {
    entradilla:
      'Un niño no dice «tengo ansiedad». Deja de dormir, estalla por cualquier cosa, se queda callado, le duele la barriga cada mañana de colegio o al enfrentar situaciones nuevas.',
    cuerpo:
      'El trabajo empieza por traducir eso: entender qué está pasando por debajo del síntoma, y desde ahí decidir qué hacer, con el niño y con su familia.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando algo lleva tiempo y no remite solo. Cuando el colegio comenta algo que en casa no se ve, o al revés. Cuando ha habido un cambio importante (una mudanza, una separación, una pérdida) y el niño no vuelve a su sitio. O si la duda es si evoluciona de forma adecuada para su edad; esa pregunta también se responde en una valoración.',
    },
    imagen: {
      src: childrenRoom,
      alt: 'Zona infantil del centro, un espacio propio pensado para los niños.',
      pie: 'Espacios del centro para la infancia y la adolescencia',
    },
    imagenComplementaria: {
      src: officeFamily,
      alt: 'Despacho del centro, luminoso y tranquilo, para la atención a adolescentes.',
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
      alt: 'Piezas pequeñas de colores rojo, blanco y azul dispuestas sobre una superficie clara.',
    },
  },

  adultos: {
    cita: {
      texto: 'El problema no es el dolor en sí, sino lo que hacemos con él para evitarlo.',
      autor: 'S. Hayes',
    },
    entradilla:
      'Se llega por algo que ya no se sostiene: la ansiedad que no baja, el ánimo que no levanta, una pérdida que no termina de colocarse, una decisión que lleva meses parada.',
    cuerpo:
      'No hace falta que sea grave para que merezca atención. Basta con que esté ocupando demasiado espacio.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando el malestar dura más de lo razonable o se repite en ciclos. Cuando afecta al sueño, al trabajo o a la gente de alrededor. Cuando ha habido un cambio vital —un duelo, una separación, un despido, una enfermedad— y la adaptación no llega. Cuando hablarlo con quien está fuera del asunto ayudaría más que seguir dándole vueltas dentro.',
    },
    imagen: {
      src: artInkblot,
      alt: 'Lámina con manchas de tinta de colores sobre fondo claro.',
    },
  },

  familia: {
    cita: {
      texto: 'La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar.',
      autor: 'C. Rogers',
    },
    entradilla:
      'En una familia el problema rara vez está en una sola persona: está en cómo se hablan, en lo que se da por sabido y en lo que nadie dice.',
    cuerpo:
      'Aquí se trabaja con el vínculo, no con un culpable. Cuando hay un problema de por medio, se puede trabajar además desde la mediación: llegar a acuerdos sin convertirlo en una batalla, sobre todo si hay hijos.',
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
      alt: 'El despacho de consulta, preparado para sesiones de pareja y familia.',
      pie: 'El mismo despacho sirve para una sesión de pareja o de familia',
    },
  },

  juridica: {
    listadoTitulo: 'Acompañamiento y asesoramiento',
    entradilla:
      'Acompañamiento y asesoramiento psicológico en procesos judiciales y legales.',
    cuerpo:
      'Aporta rigor científico e información objetiva para ayudar a jueces y tribunales en la toma de decisiones, mientras se atiende al bienestar emocional de quienes atraviesan el proceso.',
    cierre: {
      epigrafe: 'A quién se dirige',
      texto:
        'A personas que necesitan orientación psicológica durante un proceso legal y a profesionales que requieren asesoramiento para desarrollar un caso.',
    },
    imagen: {
      src: officeCalm,
      alt: 'El despacho de consulta, luminoso y tranquilo.',
      pie: 'El despacho, con luz natural',
    },
  },

  forense: {
    listadoTitulo: 'Cómo se realiza la peritación',
    entradilla:
      'Elaboración de informes periciales basados en entrevistas clínicas y pruebas baremadas.',
    cuerpo:
      'Los resultados se recogen en dictámenes válidos para juicios, que pueden ratificarse ante el juzgado.',
    ambitos: [
      {
        titulo: 'Ámbito penal',
        texto: 'Evaluación de secuelas psicológicas en víctimas y de la credibilidad del testimonio.',
      },
      {
        titulo: 'Ámbito civil y de familia',
        texto: 'Informes sobre custodias de menores, regímenes de visitas, curatelas y capacidad civil.',
      },
      {
        titulo: 'Ámbito laboral',
        texto: 'Valoración del acoso psicológico, de las secuelas por accidente de trabajo y de la incapacidad laboral.',
      },
    ],
    cierre: {
      epigrafe: 'Cuándo solicitar un peritaje',
      texto:
        'Cuando un procedimiento requiere una valoración objetiva del daño psicológico, un informe sobre menores o una evaluación en el ámbito laboral.',
    },
    imagen: {
      src: officeDarkwood,
      alt: 'Despacho de consulta, privado y tranquilo.',
      pie: 'El despacho de consulta',
    },
  },

  neuropsicologia: {
    cita: {
      texto: 'Toda persona puede ser, si se lo propones, escultor de su propio cerebro',
      autor: 'Ramón y Cajal',
    },
    entradilla:
      'La memoria, la atención, el lenguaje y la capacidad de planificar se pueden medir. Y cuando algo falla —por la edad, por una lesión, por un trastorno del desarrollo— se puede saber exactamente qué falla y en qué grado.',
    cuerpo:
      'A partir de ahí se diseña un programa de estimulación cognitiva ajustado a esa persona.',
    cierre: {
      epigrafe: 'Cuándo pedir cita',
      texto:
        'Cuando aparecen olvidos que empiezan a interferir en el día a día. Cuando un familiar mayor se desorienta o pierde el hilo con frecuencia. Tras una lesión cerebral, para saber qué funciones han quedado afectadas. O cuando hace falta una valoración cognitiva completa que oriente un diagnóstico.',
    },
    imagen: {
      src: gameRings,
      alt: 'Estructura de madera con anillas de distintos tamaños y colores.',
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
    'Terapia familiar y de pareja, separación y divorcio. Mediación familiar acreditada por la Junta de Andalucía, en Motril.',
  juridica:
    'Informes psicológicos, asesoramiento y asistencia a juicios en procesos judiciales y legales. Psicología jurídica en Motril, Granada.',
  forense:
    'Peritajes psicológicos en los ámbitos penal, civil, familiar y laboral, con informes y ratificación en juzgados. Motril, Granada.',
  neuropsicologia:
    'Valoración neuropsicológica y programas de estimulación cognitiva para adultos, niños y adolescentes, en Motril.',
};

export const indiceAreas = {
  marca: 'Áreas',
  titulo: 'Valoración e intervención',
  entradilla:
    'Valoración e intervención en psicología general, infantil y juvenil, familiar, neuropsicología, jurídica y forense.',
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
      'Hay salas para la atención de adultos, parejas y familias, una sala juvenil y una zona infantil independiente, pensada para que los niños se sientan cómodos y seguros.',
      'Y una sala de espera cómoda y tranquila, que cuida la privacidad de cada persona.',
    ],
  },
  donde: {
    epigrafe: 'Dónde está',
    nota: 'Una consulta privada para sentirte cómodo y atendido, a escasos minutos del centro urbano de Motril.',
    comoLlegar: 'Cómo llegar',
  },
};

// Las tres salas de /instalaciones/<espacio>. Las fotos de cada una están en la
// propia página; aquí solo el texto, para poder traducirlo.
export const espacios = {
  adultos: {
    titulo: 'Los despachos',
    sumario: 'Adultos, pareja y familia',
    entradilla:
      'Salas de consulta tranquilas para hablar con calma, ya vengas solo, en pareja o con tu familia.',
    alts: [
      'Despacho de consulta del Centro de Psicología María García.',
      'El mismo despacho, luminoso y tranquilo.',
      'Segundo despacho del centro, preparado para sesiones de pareja y familia.',
    ],
    notas: [
      'Sesiones individuales, de pareja y de familia.',
      'Valoración, intervención y seguimiento en el mismo espacio y con la misma persona.',
      'Distintas salas de trabajo según las necesidades de cada paciente.',
    ],
  },
  infantil: {
    titulo: 'La zona infantil',
    sumario: 'Un espacio para niños',
    entradilla:
      'Una sala aparte, a su altura y con su propio material. Aquí se trabaja jugando, porque jugando es como un niño cuenta lo que le pasa.',
    alts: ['Zona infantil del centro, un espacio propio pensado para los niños.'],
    notas: [
      'Valoración e intervención con niños.',
      'Pruebas y material de trabajo pensados para su edad.',
      'Un ambiente cómodo y seguro, donde el niño se siente a gusto.',
    ],
  },
  juvenil: {
    titulo: 'La sala juvenil',
    sumario: 'Un espacio para adolescentes',
    entradilla:
      'Los adolescentes cuentan con una sala propia, tranquila y reservada, donde hablar con confianza y a su manera.',
    alts: [],
    notas: [
      'Privacidad y confianza para contar lo que les pasa.',
      'El espacio se adapta a la edad y a las necesidades de cada paciente.',
    ],
  },
  resto: {
    epigrafe: 'El resto del centro',
    recepcion: 'Recepción del centro.',
    espera: 'Sala de espera del centro.',
    pasillo: 'Pasillo del centro, con paneles de madera oscura que llevan a los despachos.',
  },
};

// Título y descripción de cada página (<title>, meta y Open Graph).
// La búsqueda va delante («Psicóloga en Motril»): si Google corta el título,
// pierde la marca y no lo que se busca. Descripciones por debajo de 160.
export const metas = {
  inicio: {
    titulo: (c) => `Psicóloga en ${c.localidad} · ${c.nombre}`,
    descripcion: (c) =>
      `Psicóloga sanitaria en ${c.localidad} desde ${c.desde}: adultos, infancia y adolescencia, pareja y familia, mediación familiar, neuropsicología y psicología forense.`,
  },
  areas: {
    titulo: (c) => `Áreas de atención psicológica en ${c.localidad} · ${c.nombre}`,
  },
  consulta: {
    titulo: (c) => `Instalaciones en ${c.localidad} · ${c.nombre}`,
    descripcion: (c) =>
      `Espacios adaptados según la edad y las necesidades del paciente en ${c.direccion}, ${c.localidad}. Conoce las distintas zonas de trabajo del centro.`,
  },
  sobreMi: {
    titulo: (c) => `Sobre mí · ${c.profesional}, psicóloga en ${c.localidad}`,
    descripcion: (c) =>
      `${c.profesional}, psicóloga sanitaria y mediadora familiar en ${c.localidad} desde ${c.desde}. Especialista en Neuropsicología y Psicología Jurídica y Forense.`,
  },
  contacto: {
    titulo: (c) => `Contacto y cita · ${c.nombre}`,
    descripcion: (c) =>
      `Pide cita con ${c.profesional}, psicóloga en ${c.localidad}. WhatsApp y teléfono ${c.telefono}. ${c.direccion}, ${c.cp} ${c.localidad} (${c.provincia}).`,
  },
};

// <title> de cada área: lo que se busca, no el nombre de la sección.
export const titulosAreas = {
  adultos: 'Psicología para adultos en Motril',
  infancia: 'Psicología infantil y adolescente en Motril',
  escolares: 'Problemas escolares, TDAH y aprendizaje en Motril',
  familia: 'Terapia de pareja y mediación familiar en Motril',
  neuropsicologia: 'Neuropsicología y estimulación cognitiva en Motril',
  juridica: 'Psicología jurídica en Motril',
  forense: 'Psicología forense y peritajes en Motril',
};

export const sobreMi = {
  marca: 'Sobre mí',
  titulo: 'María García Molina',
  sumario: 'Psicóloga sanitaria y mediadora familiar. En Motril desde 2005.',
  entradilla:
    'Trato directo de principio a fin, con implicación directa y atención terapéutica unificada.',
  cuerpo:
    'La misma profesional te acompaña desde la primera entrevista de valoración hasta concluir la terapia, con un tratamiento adaptado a tus tiempos y necesidades.',
  quien: 'Quién atiende',
  detalle:
    'La misma profesional realiza la valoración, interviene y acompaña durante todo el proceso.',
  compromisoTitulo: 'Mi compromiso contigo',
  curriculo: 'Formación y trayectoria',
  formacion: 'Formación',
  trayectoria: 'Trayectoria',
  alcance: {
    titulo: 'Tres formaciones, un solo despacho',
    texto:
      'La neuropsicología, el ámbito jurídico y forense y la mediación familiar no suelen coincidir en la misma profesional. Aquí sí, y por eso el mismo despacho puede valorar a un niño con dificultades de aprendizaje, mediar en una separación y elaborar un informe pericial.',
    boton: 'Ver las áreas',
  },
};

export const contacto = {
  marca: 'Contacto',
  titulo: 'Escríbeme y lo vemos',
  entradilla:
    'Llama o escríbeme y lo vemos. Se responderá en un plazo máximo de 24 horas.',
  vias: {
    epigrafe: 'Cómo escribir o llamar',
    whatsapp: { marca: 'Lo más rápido', valor: 'Escribir por WhatsApp' },
    telefono: { marca: 'Teléfono', nota: 'Si prefieres hablar por teléfono.' },
    correo: { marca: 'Correo', nota: 'Puedes escribirnos por email.' },
    aviso:
      'Escoge la vía que te resulte más cómoda y cuéntame qué necesitas; estaré encantada de atenderte, resolver tus dudas y ayudarte a encontrar la información que buscas.',
  },
  donde: {
    epigrafe: 'Dónde estamos',
    nota: 'Una consulta privada para sentirte cómodo y atendido, a escasos minutos del centro urbano de Motril.',
    mapa: 'Abrir en Google Maps',
  },
  registros: 'Registros del centro',
};

export const avisoBorrador =
  'Borrador. El texto definitivo lo entrega la asesoría que redactó el aviso legal del centro; este bloque se sustituye íntegro antes de publicar.';

// Literal del aviso legal de PROTECTION REPORT (23-06-2026); la clienta exige
// publicarlo tal cual. Solo se rellenan los huecos que el PDF dejó en blanco
// y se corrige el domicilio («3» en el PDF; es el Local 3, confirmado).
export const identificacion = [
  { etiqueta: 'Nombre de dominio', valor: 'psicologiamariagarcia.es' },
  { etiqueta: 'Denominación social', valor: 'MARÍA GARCÍA MOLINA' },
  { etiqueta: 'NIF', valor: '23808826P' },
  {
    etiqueta: 'Domicilio social',
    valor:
      'C/ RAFAEL ALBERTI, LOCAL 3, - 18600 MOTRIL (Granada). E-mail: mariagarciamolina16@gmail.com',
  },
  { etiqueta: 'Teléfono', valor: '637033448' },
  { etiqueta: 'E-mail', valor: 'mariagarciamolina16@gmail.com' },
  {
    etiqueta: 'Datos registrales',
    valor:
      'Nº colegiada AO 05323 · Mediadora Familiar de la Junta de Andalucía nº 631 · NICA 67672',
  },
];

// /404: la sirve el hosting para cualquier URL que no existe. Solo en español.
export const noEncontrada = {
  marca: 'Error 404',
  titulo: 'Esta página no existe',
  entradilla:
    'Puede que el enlace esté mal escrito o que la página haya cambiado de sitio. Desde aquí puedes volver al inicio o ir a lo que buscabas.',
  enlaces: { inicio: 'Volver al inicio', areas: 'Áreas de atención', contacto: 'Contacto' },
};
