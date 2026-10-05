// Versión inglesa de src/data/contenido.js. Solo textos: fotos, ids y números de
// registro se heredan del español (ver src/i18n/datos.js y fusiona.js).
// Inglés británico (centre, programme, behaviour): el público es la costa de
// Granada y su comunidad residente. Borrador pendiente de revisión por la clienta.

import * as es from '../contenido.js';
import { ruta } from '../../i18n/rutas.js';
import { fusiona } from '../../i18n/fusiona.js';

const etiquetasCredenciales = {
  colegiada: { etiqueta: 'College member no.' },
  // El número sale del español: aquí solo se traduce "nº".
  mediadora: {
    etiqueta: 'Family Mediator (Junta de Andalucía register)',
    valor: (c) => c.valor.replace('nº', 'no.'),
  },
  nica: { etiqueta: 'NICA' },
};

export const centro = {
  ...es.centro,
  credenciales: es.centro.credenciales.map((c) => {
    const { etiqueta, valor } = etiquetasCredenciales[c.id];
    return { ...c, etiqueta, valor: valor ? valor(c) : c.valor };
  }),
};

export const areasHero = [
  'Adults',
  'Children and teens',
  'Family mediation',
  'Neuropsychology',
  'Legal',
  'Forensic',
];

const textosAreas = {
  adultos: {
    titulo: 'Adults',
    sumario: 'Assessment and intervention',
    puntos: [
      'Anxiety and stress disorders',
      'Mood disorders',
      'Communication and social skills difficulties',
      'Conflict resolution and decision-making',
      'Adjustment disorders',
      'Grief and bereavement',
    ],
  },
  infancia: {
    titulo: 'Children and adolescents',
    sumario: 'Assessment and intervention',
    puntos: [
      'Developmental disorders',
      'Emotional disorders',
      'Behavioural problems',
      'Sleep disorders',
      'Language disorders',
      'Bladder and bowel control disorders',
      'Communication and social skills difficulties',
      'Impulsivity and behavioural control problems',
      'Adjustment problems',
      'Grief and bereavement',
    ],
  },
  escolares: {
    titulo: 'School difficulties',
    sumario: 'Learning and attention',
    puntos: [
      'Learning difficulties: reading and writing disorders, dysgraphia, dyscalculia',
      'Attention deficit hyperactivity disorder (ADHD)',
      'High intellectual ability',
      'Individualised cognitive stimulation programmes',
      'Stress and anxiety arising from academic demands',
      'School difficulties related to autism spectrum disorder (ASD)',
    ],
  },
  familia: {
    titulo: 'Family and couples',
    sumario: 'Assessment, intervention, mediation',
    puntos: [
      'Family dysfunction',
      'Couples therapy',
      'Separation and divorce processes',
      'Difficulties in parent–child relationships',
    ],
  },
  neuropsicologia: {
    titulo: 'Neuropsychology',
    sumario: 'Assessment and cognitive stimulation',
    puntos: [
      'Cognitive decline',
      'Developmental disorders',
      'Cognitive stimulation therapy for adults',
      'Cognitive stimulation therapy for children and adolescents',
    ],
  },
  juridica: {
    titulo: 'Legal psychology',
    sumario: 'Support and advice',
    puntos: [
      'Preparation of psychological reports',
      'Personal advice and attendance at trials',
      'Psychological advice for professionals working with minors, victims of gender-based violence and other cases',
      'Protecting emotional wellbeing and minimising psychological harm during lengthy court proceedings',
      'Providing accurate, objective information to the courts so that they can reach fair rulings',
    ],
  },
  forense: {
    titulo: 'Forensic psychology',
    sumario: 'Expert assessments and reports',
    puntos: [
      'Clinical interviews and standardised tests',
      'Expert reports and opinions for trials',
      'Ratifying reports before the courts',
      'Assessment of psychological harm arising from life events',
    ],
  },
};

export const areas = es.areas.map((a) => fusiona(a, textosAreas[a.id]));

export const resumenAreas = {
  infancia: 'Development, behaviour, sleep, language and emotions.',
  escolares: 'Learning, ADHD, high ability, academic stress.',
  adultos: 'Anxiety, mood, grief, adjustment.',
  familia: 'Family mediation, couples, separation, relationships.',
  juridica: 'Psychological advice in judicial and legal proceedings.',
  forense: 'Expert assessment, reports and ratification in court.',
  neuropsicologia: 'Cognitive decline and cognitive stimulation.',
};

export const formacion = [
  'Degree in Psychology, University of Granada',
  'Specialist in Neuropsychology',
  'Specialised in Legal and Forensic Psychology',
  'Expert in Family Mediation, entered in the official register of the Junta de Andalucía (regional government), registration no. 631',
];

export const perfil = {
  apertura:
    'Direct care from start to finish, with hands-on involvement and unified therapeutic attention.',
  trayectoria:
    'Professional career in private practice since 2005, combined with work in the public sector and the publicly funded private sector.',
  compromiso: [
    'My commitment is direct and exclusive, from the first assessment interview until therapy is complete.',
    'I adapt treatment, safely, to each person’s pace and needs, building a solid, caring therapeutic bond with professional rigour.',
  ],
};

export const trayectoria = [
  'Health psychologist and family mediator with active, continuous practice in private clinical work, offering services since 2005',
  'Psychologist and family mediator in various public-sector institutions',
  'Speaker at conferences, training courses and psychology workshops, as part of raising awareness of mental health and preventing mental health problems',
  'Work with people with disabilities and their families',
];

const textosGaleria = [
  {
    alt: 'Dark granite façade of the centre, with the sign “Centro de Psicología María García” above the glazed entrance and María García Molina’s signature on the shop window.',
    pie: 'Façade of the María García psychology centre on C. Rafael Alberti',
  },
  {
    alt: 'Reception at the centre: a calm, discreet first welcome.',
    pie: 'Reception, with waiting room',
  },
  {
    alt: 'Quiet waiting room, with privacy.',
    pie: 'Waiting room',
  },
  {
    alt: 'The consulting room, a private space to talk things through calmly.',
    pie: 'The consulting room, a private space to talk things through calmly',
  },
  {
    alt: 'The same consulting room, bright and calm.',
    pie: 'Natural light and calm during the session',
  },
  {
    alt: 'The centre’s second consulting room, set up for couples and family sessions.',
    pie: 'The second consulting room',
  },
  {
    alt: 'The centre’s children’s area, a space of its own designed for children.',
    pie: 'A space of their own, designed to help them feel at ease',
  },
];

export const galeria = es.galeria.map((g, i) => fusiona(g, textosGaleria[i]));

export const navegacion = [
  { href: ruta('en', 'areas'), texto: 'Areas' },
  { href: ruta('en', 'consulta'), texto: 'The practice' },
  { href: ruta('en', 'sobreMi'), texto: 'About me' },
  { href: ruta('en', 'contacto'), texto: 'Contact' },
];

export const prisma = {
  ...es.prisma,
  texto:
    'Seeing your reality through another lens does not change what happened. It changes what you can do about it.',
};

const textosAmbientes = {
  adultos: {
    titulo: 'Consulting rooms',
    sumario: 'Adults, couples and families',
    texto: 'Different rooms for individual, couples and family sessions.',
    alt: 'Consulting room, private and calm.',
  },
  infantil: {
    titulo: 'Children’s area',
    sumario: 'Children',
    texto:
      'A room of its own, comfortable and safe, designed so that children feel at ease.',
    alt: 'The centre’s children’s area, a space of its own for children.',
  },
  juvenil: {
    titulo: 'Teen room',
    sumario: 'Adolescents',
    texto:
      'A room of their own for teenagers, calm and private, where they can talk with confidence.',
    alt: 'Consulting room at the centre, bright and calm, for working with teenagers.',
  },
};

export const ambientes = es.ambientes.map((a) => ({
  ...fusiona(a, textosAmbientes[a.id]),
  href: ruta('en', 'espacio', a.id),
}));
