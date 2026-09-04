/* ==========================================================================
   Contenido. Todo lo que hay aquí está verificado en el brief de la clienta.
   Nada de precios, horarios, duración de sesión, testimonios, número de
   pacientes ni valoraciones: no fueron facilitados y no se inventan.
   Las fotografías se importan como assets: Astro las procesa con sharp,
   deriva ancho y alto del archivo y genera las variantes responsive.
   ========================================================================== */

import artInkblot from '../assets/photo/art-inkblot.webp';
import centerExterior from '../assets/photo/center-exterior.webp';
import childrenRoom from '../assets/photo/children-room.webp';
import gameForms from '../assets/photo/game-forms.webp';
import gameRings from '../assets/photo/game-rings.webp';
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
  direccion: 'C. Rafael Alberti, 3',
  cp: '18600',
  mapa: 'https://maps.google.com/?q=C.+Rafael+Alberti+3,+18600+Motril,+Granada',
  credenciales: [
    { etiqueta: 'Nº colegiada', valor: 'AO 05323' },
    { etiqueta: 'Mediadora Familiar de la Junta de Andalucía', valor: 'nº 631' },
    { etiqueta: 'NICA', valor: '67672' },
  ],
};

/* Las cinco áreas del primer cuadro, en una sola línea horizontal. */
export const areasHero = [
  'General',
  'Infantil y juvenil',
  'Mediación familiar',
  'Neuropsicología',
  'Jurídica y forense',
];

export const areas = [
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
    ],
  },
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
    id: 'familia',
    titulo: 'Familia y pareja',
    sumario: 'Valoración, intervención y mediación',
    puntos: [
      'Disfunciones familiares',
      'Terapia de pareja',
      'Procesos de separación y divorcio',
      'Problemas en las relaciones paterno-filiales',
    ],
  },
  {
    id: 'forense',
    titulo: 'Psicología jurídica y forense',
    sumario: 'Peritaje e informes',
    puntos: [
      'Evaluación jurídica',
      'Peritaciones forenses',
      'Elaboración de informes psicológicos',
      'Ratificación de informes en los juzgados',
      'Asesoramiento psicológico a profesionales relacionados con menores, víctimas de violencia de género, o cualquier profesional que lo requiera para el desarrollo de un caso',
      'Peritajes y valoraciones de incapacidad laboral',
      'Acoso laboral',
      'Valoración de daños psicológicos derivados de situaciones vitales',
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
];

export const formacion = [
  'Licenciada en Psicología. Universidad de Granada',
  'Especialista en Neuropsicología',
  'Máster en Psicología Jurídica y Forense',
  'Mediadora Familiar de la Junta de Andalucía, nº de registro 631',
];

export const trayectoria = [
  'Psicóloga sanitaria y mediadora familiar con práctica profesional activa y continua en clínica privada desde 2005',
  'Psicóloga y mediadora familiar en distintas instituciones de la administración pública',
  'Ponente en jornadas, cursos formativos y talleres de psicología, como parte de la sensibilización, divulgación y prevención de la salud mental',
  'Intervención con personas con diversidad funcional y sus familias',
];

/* Fotografía real del centro. */
export const galeria = [
  {
    src: centerExterior,
    alt: 'Fachada del centro en granito negro, con la rotulación del Centro de Psicología María García.',
    pie: 'Granito negro y rotulación, en C. Rafael Alberti',
  },
  {
    src: reception,
    alt: 'Recepción del centro, con mostrador claro y las titulaciones enmarcadas en la pared.',
    pie: 'Recepción, con las titulaciones enmarcadas detrás',
  },
  {
    src: waitingRoom,
    alt: 'Sala de espera con asientos y las titulaciones enmarcadas.',
    pie: 'Sala de espera, con las titulaciones a la vista',
  },
  {
    src: officeDarkwood,
    alt: 'Despacho de María García, con mesa de madera oscura y dos butacas.',
    pie: 'El despacho de María, mesa de madera oscura y dos butacas',
  },
  {
    src: officeCalm,
    alt: 'Segundo despacho del centro, de tonos claros y con luz natural.',
    pie: 'Segundo despacho, de tonos claros y luz natural',
  },
  {
    src: officeFamily,
    alt: 'Tercer despacho, preparado para sesiones de familia y de pareja.',
    pie: 'Tercer despacho, preparado para familia y pareja',
  },
  {
    src: childrenRoom,
    alt: 'Rincón infantil con mesa baja, sillas pequeñas y una pizarra.',
    pie: 'El rincón infantil: mesa baja, sillas pequeñas y pizarra',
  },
];

/* Material de evaluación real, fotografiado en el centro. */
export const materiales = [
  {
    src: artInkblot,
    alt: 'Lámina simétrica de manchas de tinta, del tipo empleado en la prueba de Rorschach.',
    titulo: 'Lámina de Rorschach',
    nota: 'Prueba proyectiva. La misma mancha, y lo que cada persona ve en ella.',
  },
  {
    src: gameForms,
    alt: 'Cubos de colores para la prueba de diseño de bloques, sobre una superficie clara.',
    titulo: 'Diseño de bloques',
    nota: 'Organización visoespacial y razonamiento no verbal.',
  },
  {
    src: gameRings,
    alt: 'Torre de Hanoi de madera con anillas de distintos tamaños.',
    titulo: 'Torre de Hanoi',
    nota: 'Planificación, memoria de trabajo y control de impulsos.',
  },
];

export const navegacion = [
  { href: '#areas', texto: 'Áreas' },
  { href: '#sobre-mi', texto: 'Sobre mí' },
  { href: '#centro', texto: 'El centro' },
  { href: '#contacto', texto: 'Contacto' },
];
