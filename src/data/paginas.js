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
        'Cuando algo lleva tiempo y no remite solo. Cuando el colegio comenta algo que en casa no se ve, o al revés. Cuando ha habido un cambio importante (una mudanza, una separación, una pérdida) y el niño no vuelve a su sitio. O si la duda es si evoluciona de forma adecuada para su edad; esa pregunta también se responde en una valoración.',
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
      alt: 'Cubos pequeños de colores rojo, blanco y azul dispuestos sobre una superficie clara.',
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
    imagenAdicional: {
      src: artInkblot,
      alt: 'Lámina con manchas de tinta de colores sobre fondo claro.',
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
      src: reception,
      alt: 'Recepción del centro, con mostrador claro y las titulaciones enmarcadas en la pared.',
      pie: 'Las titulaciones, a la vista en recepción',
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
      alt: 'Despacho de consulta con mesa de madera oscura y dos butacas.',
      pie: 'El despacho de consulta',
    },
  },

  neuropsicologia: {
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
    'Terapia familiar y de pareja, separación y divorcio, y mediación familiar acreditada por la Junta de Andalucía, en Motril.',
  juridica:
    'Acompañamiento y asesoramiento psicológico en procesos judiciales y legales en Motril, Granada.',
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
      'Hay salas para la atención de adultos, parejas y familias, una sala juvenil y una zona infantil independiente, con mesa baja, sillas pequeñas y pizarra.',
      'Y una sala de espera con las titulaciones a la vista, que es donde deben estar.',
    ],
  },
};

export const sobreMi = {
  marca: 'Sobre mí',
  titulo: 'María García Molina',
  sumario: 'Psicóloga sanitaria y mediadora familiar. En Motril desde 2005.',
  entradilla:
    'Trato directo de principio a fin, con implicación directa y atención terapéutica unificada.',
  cuerpo:
    'La misma profesional te acompaña desde la primera entrevista de valoración hasta concluir la terapia, con un tratamiento adaptado a tus tiempos y necesidades.',
};

export const contacto = {
  marca: 'Contacto',
  titulo: 'Escríbeme y lo vemos',
  entradilla:
    'Llama o escríbeme y lo vemos. Te contestaré en un máximo de 24 horas.',
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
