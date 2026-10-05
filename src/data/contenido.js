
import centerExterior from '../assets/photo/center-exterior.webp';
import childrenRoom from '../assets/photo/children-room.webp';
import officeCalm from '../assets/photo/office-calm.webp';
import officeDarkwood from '../assets/photo/office-darkwood.webp';
import officeFamily from '../assets/photo/office-family.webp';
import reception from '../assets/photo/reception.webp';
import waitingRoom from '../assets/photo/waiting-room.webp';

export const centro = {
  nombre: 'Centro de Psicología María García',
  profesional: 'María García Molina',
  localidad: 'Motril',
  provincia: 'Granada',
  desde: '2005',
  telefono: '637 03 34 48',
  telefonoTel: '+34637033448',
  whatsapp: 'https://wa.me/34637033448',
  email: 'mariagarciamolina16@gmail.com',
  direccion: 'C. Rafael Alberti, Local 3',
  cp: '18600',
  mapa: 'https://maps.google.com/?q=C.+Rafael+Alberti+3,+18600+Motril,+Granada',
  coordenadas: { lat: 36.750956, lon: -3.5215472 },
  // `id` es estable entre idiomas: el código busca por él, no por la etiqueta.
  credenciales: [
    { id: 'colegiada', etiqueta: 'Nº colegiada', valor: 'AO 05323' },
    // Verificado con la clienta: Mediadora 631, NICA 67672. No intercambiar.
    { id: 'mediadora', etiqueta: 'Mediadora Familiar de la Junta de Andalucía', valor: 'nº 631' },
    { id: 'nica', etiqueta: 'NICA', valor: '67672' },
  ],
};

export const areasHero = [
  'Adultos',
  'Infantil y juvenil',
  'Mediación familiar',
  'Neuropsicología',
  'Jurídica',
  'Forense',
];

export const areas = [
  {
    id: 'adultos',
    titulo: 'Adultos',
    sumario: 'Valoración e intervención',
    puntos: [
      'Trastornos de ansiedad y estrés',
      'Trastornos del estado de ánimo',
      'Problemas de comunicación y habilidades sociales',
      'Resolución de conflictos y toma de decisiones',
      'Trastornos adaptativos',
      'Procesos de duelo',
    ],
  },
  {
    id: 'infancia',
    titulo: 'Infancia y adolescencia',
    sumario: 'Valoración e intervención',
    puntos: [
      'Trastornos del desarrollo',
      'Trastornos emocionales',
      'Problemas de conducta',
      'Trastornos del sueño',
      'Trastornos del lenguaje',
      'Trastornos en el control de esfínteres',
      'Problemas de comunicación y habilidades sociales',
      'Problemas de impulsividad y control de la conducta',
      'Problemas de adaptación',
      'Procesos de duelo',
    ],
  },
  {
    id: 'escolares',
    titulo: 'Problemas escolares',
    sumario: 'Aprendizaje y atención',
    puntos: [
      'Dificultades de aprendizaje: trastornos de lectoescritura, disgrafía, discalculia',
      'Trastorno por déficit de atención e hiperactividad (TDAH)',
      'Altas capacidades intelectuales',
      'Programas individualizados de estimulación cognitiva',
      'Estrés y ansiedad derivados de las demandas académicas',
      'Dificultades escolares relacionadas con TEA'
    ],
  },
  {
    id: 'familia',
    titulo: 'Familia y pareja',
    sumario: 'Valoración, intervención, mediación',
    puntos: [
      'Disfunciones familiares',
      'Terapia de pareja',
      'Procesos de separación y divorcio',
      'Problemas en las relaciones paterno-filiales',
    ],
  },
  {
    id: 'neuropsicologia',
    titulo: 'Neuropsicología',
    sumario: 'Valoración y estimulación cognitiva',
    puntos: [
      'Deterioros cognitivos',
      'Trastornos del desarrollo',
      'Terapia de estimulación cognitiva para adultos',
      'Terapia de estimulación cognitiva para niños y adolescentes',
    ],
  },
  {
    id: 'juridica',
    titulo: 'Psicología jurídica',
    sumario: 'Acompañamiento y asesoramiento',
    puntos: [
      'Elaboración de informes psicológicos',
      'Asesoramiento personal y asistencia a juicios',
      'Asesoramiento psicológico a profesionales relacionados con menores, víctimas de violencia de género y otros casos',
      'Proteger el bienestar emocional y minimizar el daño psíquico de los procesos judiciales prolongados',
      'Aportar información precisa y objetiva a los órganos judiciales para dictar resoluciones justas',
    ],
  },
  {
    id: 'forense',
    titulo: 'Psicología forense',
    sumario: 'Peritajes e informes',
    puntos: [
      'Entrevistas clínicas y aplicación de pruebas baremadas',
      'Elaboración de informes periciales y dictámenes para juicios',
      'Ratificación de informes en los juzgados',
      'Valoración de daños psicológicos derivados de situaciones vitales',
    ],
  },
];

export const resumenAreas = {
  infancia: 'Desarrollo, conducta, sueño, lenguaje y emociones.',
  escolares: 'Aprendizaje, TDAH, altas capacidades, estrés académico.',
  adultos: 'Ansiedad, estado de ánimo, duelo, adaptación.',
  familia: 'Mediación familiar, pareja, separación, relaciones.',
  juridica: 'Asesoramiento psicológico en procesos judiciales y legales.',
  forense: 'Peritaje, informes y ratificación en juzgados.',
  neuropsicologia: 'Deterioro cognitivo y estimulación cognitiva.',
};

export const formacion = [
  'Licenciada en Psicología. Universidad de Granada',
  'Especialista en Neuropsicología',
  'Especializada en Psicología Jurídica y Forense',
  'Experta en Mediación Familiar inscrita en el registro oficial de la Junta de Andalucía, nº de registro 631',
];

export const perfil = {
  apertura: 'Trato directo de principio a fin, con implicación directa y atención terapéutica unificada.',
  trayectoria: 'Trayectoria profesional en clínica privada desde 2005, compaginada con el sector público y concertado.',
  compromiso: [
    'Mi compromiso es directo y exclusivo. Desde la primera entrevista de valoración hasta concluir la terapia.',
    'Adapto el tratamiento de forma segura a los tiempos y necesidades de cada persona, creando un vínculo terapéutico sólido, cuidado y con rigor profesional.',
  ],
};

export const trayectoria = [
  'Psicóloga sanitaria y mediadora familiar con práctica profesional activa y continua en clínica privada ofreciendo servicios desde 2005',
  'Psicóloga y mediadora familiar en distintas instituciones de la administración pública',
  'Ponente en jornadas, cursos formativos y talleres de psicología, como parte de la sensibilización, divulgación y prevención de la salud mental',
  'Intervención con personas con diversidad funcional y sus familias',
];

export const galeria = [
  {
    src: centerExterior,
    alt: 'Fachada de granito oscuro del centro, con el rótulo «Centro de Psicología María García» sobre la entrada acristalada y la firma de María García Molina en el cristal del escaparate.',
    pie: 'Fachada del centro psicológico María García en C. Rafael Alberti',
  },
  {
    src: reception,
    alt: 'Recepción del centro, un primer recibimiento tranquilo y discreto.',
    pie: 'Recepción, con sala de espera',
  },
  {
    src: waitingRoom,
    alt: 'Sala de espera tranquila, con privacidad.',
    pie: 'Sala de espera',
  },
  {
    src: officeDarkwood,
    alt: 'El despacho de consulta, un espacio reservado para hablar con calma.',
    pie: 'El despacho, un espacio reservado para hablar con calma',
  },
  {
    src: officeCalm,
    alt: 'El mismo despacho, luminoso y tranquilo.',
    pie: 'Luz natural y tranquilidad durante la sesión',
  },
  {
    src: officeFamily,
    alt: 'Segundo despacho del centro, preparado para sesiones de pareja y familia.',
    pie: 'El segundo despacho',
  },
  {
    src: childrenRoom,
    alt: 'Zona infantil del centro, un espacio propio pensado para los niños.',
    pie: 'Un espacio propio, pensado para que se sientan a gusto',
  },
];

export const navegacion = [
  { href: '/areas', texto: 'Áreas' },
  { href: '/instalaciones', texto: 'Consulta' },
  { href: '/sobre-mi', texto: 'Sobre mí' },
  { href: '/contacto', texto: 'Contacto' },
];

export const prisma = {
  texto:
    'Mirar tu realidad a través de otro cristal no cambia lo que pasó. Cambia lo que puedes hacer con ello.',
  autor: null,
};

export const ambientes = [
  {
    id: 'adultos',
    titulo: 'Despachos de consulta',
    sumario: 'Adultos, parejas y familias',
    texto:
      'Distintas salas para la atención individual, de pareja y de familia.',
    src: officeDarkwood,
    alt: 'Despacho de consulta, privado y tranquilo.',
    href: '/instalaciones/adultos',
  },
  {
    id: 'infantil',
    titulo: 'Zona infantil',
    sumario: 'Infancia',
    texto:
      'Una sala propia, cómoda y segura, pensada para que los niños se sientan a gusto.',
    src: childrenRoom,
    alt: 'Zona infantil del centro, un espacio propio para los niños.',
    href: '/instalaciones/infantil',
  },
  {
    id: 'juvenil',
    titulo: 'Sala juvenil',
    sumario: 'Adolescencia',
    texto: 'Una sala propia para adolescentes, tranquila y reservada, donde hablar con confianza.',
    src: officeFamily,
    alt: 'Despacho del centro, luminoso y tranquilo, para la atención a adolescentes.',
    href: '/instalaciones/juvenil',
  },
];
