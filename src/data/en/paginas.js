// Versión inglesa de src/data/paginas.js. Solo textos; las fotos de cada área
// se heredan del español. Las páginas legales (aviso, privacidad, cookies) no
// se traducen hasta que la asesoría entregue los textos definitivos, así que
// `avisoBorrador` e `identificacion` no aparecen aquí.
// Borrador pendiente de revisión por la clienta.

import * as es from '../paginas.js';
import { fusiona } from '../../i18n/fusiona.js';

const textosAreas = {
  infancia: {
    entradilla:
      'A child doesn’t say “I have anxiety”. They stop sleeping, flare up over the smallest thing, go quiet, or get a tummy ache every school morning or when facing new situations.',
    cuerpo:
      'The work begins with translating that: understanding what is going on beneath the symptom, and from there deciding what to do, together with the child and their family.',
    cierre: {
      epigrafe: 'When to book an appointment',
      texto:
        'When something has gone on for a while and isn’t easing by itself. When the school mentions something you don’t see at home, or the other way round. When there has been a major change (a house move, a separation, a loss) and the child doesn’t settle back into their usual self. Or when the question is whether they are developing as expected for their age; that question can also be answered in an assessment.',
    },
    imagen: {
      alt: 'The centre’s children’s area, a space of its own designed for children.',
      pie: 'Spaces at the centre for children and adolescents',
    },
    imagenComplementaria: {
      alt: 'Consulting room at the centre, bright and calm, for working with teenagers.',
    },
  },

  escolares: {
    entradilla:
      'Working hard and making little progress is not a lack of will. Behind a bad school year there is usually something specific: a particular difficulty with reading or arithmetic, an attention problem, or a high ability that gets bored and switches off.',
    cuerpo:
      'Giving it a name changes the conversation with the school and with the child.',
    cierre: {
      epigrafe: 'When to book an appointment',
      texto:
        'When grades don’t match the effort. When a child reads but doesn’t retain what they have read, or writes with a difficulty that doesn’t improve with practice. When the school suggests an assessment. When homework has become the daily conflict at home.',
    },
    imagen: {
      alt: 'Small red, white and blue pieces arranged on a light surface.',
    },
  },

  adultos: {
    cita: {
      // Cita aportada por la clienta. No se ha localizado la frase literal en la
      // obra de Hayes, así que es traducción de la española.
      texto: 'The problem is not the pain itself, but what we do to avoid it.',
      autor: 'S. Hayes',
    },
    entradilla:
      'People come for something that can no longer be sustained: anxiety that won’t ease, a low mood that won’t lift, a loss that never quite settles, a decision that has been on hold for months.',
    cuerpo:
      'It doesn’t have to be serious to deserve attention. It is enough that it is taking up too much space.',
    cierre: {
      epigrafe: 'When to book an appointment',
      texto:
        'When the distress lasts longer than seems reasonable or comes back in cycles. When it affects your sleep, your work or the people around you. When there has been a major life change —a bereavement, a separation, losing a job, an illness— and adjustment hasn’t come. When talking it over with someone outside the situation would help more than going round in circles inside it.',
    },
    imagen: {
      alt: 'Plate with colourful ink blots on a light background.',
    },
  },

  familia: {
    cita: {
      // Texto original en inglés: Carl R. Rogers, On Becoming a Person (1961).
      texto: 'The curious paradox is that when I accept myself just as I am, then I can change.',
      autor: 'C. Rogers',
    },
    entradilla:
      'In a family the problem is rarely in one person: it is in how they talk to each other, in what is taken for granted and in what nobody says.',
    cuerpo:
      'The work here is with the relationship, not with someone to blame. When there is a dispute at stake, mediation can also help: reaching agreements without turning it into a battle, especially when there are children.',
    acreditacion: {
      epigrafe: 'Family mediation',
      texto:
        'Family Mediator of the Junta de Andalucía (regional government), registration no. 631.',
    },
    cierre: {
      epigrafe: 'When to book an appointment',
      texto:
        'When the same arguments keep repeating without getting anywhere. When living together has become tense and nobody knows where to start. When a separation is under way and agreements about the children are needed. When the relationship with a teenage child has broken down and there is no way to pick it up again.',
    },
    imagen: {
      alt: 'The consulting room, set up for couples and family sessions.',
      pie: 'The same room is used for a couples session or a family session',
    },
  },

  juridica: {
    listadoTitulo: 'Support and advice',
    entradilla: 'Psychological support and advice in judicial and legal proceedings.',
    cuerpo:
      'It brings scientific rigour and objective information to help judges and courts in their decision-making, while looking after the emotional wellbeing of those going through the process.',
    cierre: {
      epigrafe: 'Who it is for',
      texto:
        'People who need psychological guidance during legal proceedings, and professionals who need advice to work on a case.',
    },
    imagen: {
      alt: 'The consulting room, bright and calm.',
      pie: 'The consulting room, with natural light',
    },
  },

  forense: {
    listadoTitulo: 'How the expert assessment is carried out',
    entradilla:
      'Preparation of expert reports based on clinical interviews and standardised tests.',
    cuerpo:
      'The results are set out in opinions valid for use in court, which can be ratified before the court.',
    ambitos: [
      {
        titulo: 'Criminal matters',
        texto:
          'Assessment of psychological after-effects in victims and of the credibility of testimony.',
      },
      {
        titulo: 'Civil and family matters',
        texto:
          'Reports on child custody, visiting arrangements, guardianship (curatorship) and legal capacity.',
      },
      {
        titulo: 'Employment matters',
        texto:
          'Assessment of psychological harassment, of after-effects of workplace accidents and of work incapacity.',
      },
    ],
    cierre: {
      epigrafe: 'When to request an expert assessment',
      texto:
        'When proceedings require an objective assessment of psychological harm, a report on minors or an assessment in an employment context.',
    },
    imagen: {
      alt: 'Consulting room, private and calm.',
      pie: 'The consulting room',
    },
  },

  neuropsicologia: {
    cita: {
      // Traducción publicada: Advice for a Young Investigator (MIT Press, 1999),
      // trad. Neely Swanson y Larry W. Swanson, prefacio a la 2.ª edición.
      // Original: Reglas y consejos sobre investigación científica.
      texto: 'Any man could, if he were so inclined, be the sculptor of his own brain.',
      autor: 'Ramón y Cajal',
    },
    entradilla:
      'Memory, attention, language and the ability to plan can be measured. And when something is going wrong —because of age, an injury or a developmental disorder— it is possible to know exactly what is failing and to what degree.',
    cuerpo:
      'From there, a cognitive stimulation programme is designed to suit that person.',
    cierre: {
      epigrafe: 'When to book an appointment',
      texto:
        'When memory lapses start to interfere with daily life. When an older relative is often disoriented or loses the thread. After a brain injury, to find out which functions have been affected. Or when a full cognitive assessment is needed to guide a diagnosis.',
    },
    imagen: {
      alt: 'Wooden structure with rings of different sizes and colours.',
    },
  },
};

export const detallesAreas = Object.fromEntries(
  Object.entries(es.detallesAreas).map(([id, detalle]) => [id, fusiona(detalle, textosAreas[id])])
);

export const metaAreas = {
  infancia:
    'Assessment and intervention for children and adolescents in Motril: development, behaviour, sleep, language, emotions and adjustment.',
  escolares:
    'Learning difficulties, ADHD, high ability and academic stress. Assessment and intervention in Motril, Granada.',
  adultos:
    'Anxiety, mood, grief, conflicts and adjustment disorders. Psychology for adults in Motril, Granada.',
  familia:
    'Family and couples therapy, separation and divorce. Family mediation accredited by the Junta de Andalucía, in Motril.',
  juridica:
    'Psychological reports, advice and attendance at hearings in judicial and legal proceedings. Legal psychology in Motril, Granada.',
  forense:
    'Psychological expert assessments in criminal, civil, family and employment matters, with reports and ratification in court. Motril, Granada.',
  neuropsicologia:
    'Neuropsychological assessment and cognitive stimulation programmes for adults, children and adolescents, in Motril.',
};

export const indiceAreas = fusiona(es.indiceAreas, {
  marca: 'Areas',
  titulo: 'Assessment and intervention',
  entradilla:
    'Assessment and intervention in general, child and adolescent, and family psychology, neuropsychology, and legal and forensic psychology.',
  cuerpo:
    'Several areas, one way of working: first we look calmly and name what is happening; then we decide what to do.',
});

export const consulta = fusiona(es.consulta, {
  marca: 'The practice',
  titulo: 'By your side, every step of the way',
  entradilla:
    'Person to person, from start to finish. The same person assesses, treats and supports you: no internal referrals and no change of professional halfway through the process.',
  espacio: {
    epigrafe: 'The space',
    parrafos: [
      'There are rooms for individual, couples and family sessions, a teen room and a separate children’s area, designed so that children feel comfortable and safe.',
      'And a comfortable, quiet waiting room that protects each person’s privacy.',
    ],
  },
  donde: {
    epigrafe: 'Where to find us',
    nota: 'A private practice where you can feel comfortable and cared for, just minutes from the town centre of Motril.',
    comoLlegar: 'How to get here',
  },
});

export const sobreMi = fusiona(es.sobreMi, {
  marca: 'About me',
  sumario: 'Health psychologist and family mediator. In Motril since 2005.',
  entradilla:
    'Direct care from start to finish, with hands-on involvement and unified therapeutic attention.',
  cuerpo:
    'The same professional supports you from the first assessment interview until therapy is complete, with treatment adapted to your pace and needs.',
  quien: 'Who will see you',
  detalle:
    'The same professional carries out the assessment, provides the treatment and supports you throughout the process.',
  compromisoTitulo: 'My commitment to you',
  curriculo: 'Training and career',
  formacion: 'Training',
  trayectoria: 'Career',
  alcance: {
    titulo: 'Three specialisms, one consulting room',
    texto:
      'Neuropsychology, legal and forensic work, and family mediation are not often found in the same professional. Here they are, which is why the same consulting room can assess a child with learning difficulties, mediate in a separation and prepare an expert report.',
    boton: 'See the areas',
  },
});

export const contacto = fusiona(es.contacto, {
  marca: 'Contact',
  titulo: 'Write to me and we’ll talk it through',
  entradilla:
    'Call or message me and we’ll talk it through. You will get a reply within 24 hours at most.',
  vias: {
    epigrafe: 'How to write or call',
    whatsapp: { marca: 'The quickest way', valor: 'Message me on WhatsApp' },
    telefono: { marca: 'Phone', nota: 'If you’d rather speak on the phone.' },
    correo: { marca: 'Email', nota: 'You can also email us.' },
    aviso:
      'Choose whichever way suits you best and tell me what you need; I’ll be glad to help, answer your questions and help you find the information you are looking for.',
  },
  donde: {
    epigrafe: 'Where we are',
    nota: 'A private practice where you can feel comfortable and cared for, just minutes from the town centre of Motril.',
    mapa: 'Open in Google Maps',
  },
  registros: 'Registration details',
});

export const espacios = {
  adultos: {
    titulo: 'The consulting rooms',
    sumario: 'Adults, couples and families',
    entradilla:
      'Quiet consulting rooms where you can talk calmly, whether you come alone, as a couple or with your family.',
    alts: [
      'Consulting room at the Centro de Psicología María García.',
      'The same consulting room, bright and calm.',
      'The centre’s second consulting room, set up for couples and family sessions.',
    ],
    notas: [
      'Individual, couples and family sessions.',
      'Assessment, intervention and follow-up in the same space and with the same person.',
      'Different rooms to suit each patient’s needs.',
    ],
  },
  infantil: {
    titulo: 'The children’s area',
    sumario: 'A space for children',
    entradilla:
      'A separate room, at their level and with its own materials. Work here happens through play, because play is how a child tells you what is going on.',
    alts: ['The centre’s children’s area, a space of its own designed for children.'],
    notas: [
      'Assessment and intervention with children.',
      'Tests and working materials designed for their age.',
      'A comfortable, safe environment where the child feels at ease.',
    ],
  },
  juvenil: {
    titulo: 'The teen room',
    sumario: 'A space for adolescents',
    entradilla:
      'Teenagers have a room of their own, quiet and private, where they can talk with confidence and in their own way.',
    alts: [],
    notas: [
      'Privacy and trust to talk about what is going on.',
      'The space adapts to each patient’s age and needs.',
    ],
  },
  resto: {
    epigrafe: 'The rest of the centre',
    recepcion: 'Reception at the centre.',
    espera: 'Waiting room at the centre.',
    pasillo: 'Corridor at the centre, lined with dark wood panels leading to the consulting rooms.',
  },
};

export const metas = {
  inicio: {
    titulo: (c) => `Psychologist in ${c.localidad}, ${c.provincia} · ${c.nombre}`,
    descripcion: (c) =>
      `Health psychologist in ${c.localidad} since ${c.desde}: adults, children and teens, couples and family, family mediation, neuropsychology and forensic psychology.`,
  },
  areas: {
    titulo: (c) => `Psychology services in ${c.localidad} · ${c.nombre}`,
  },
  consulta: {
    titulo: (c) => `Facilities in ${c.localidad} · ${c.nombre}`,
    descripcion: (c) =>
      `Spaces adapted to each patient’s age and needs at ${c.direccion}, ${c.localidad}. Discover the different working areas of the centre.`,
  },
  sobreMi: {
    titulo: (c) => `About me · ${c.profesional}, psychologist in ${c.localidad}`,
    descripcion: (c) =>
      `${c.profesional}, health psychologist and family mediator in ${c.localidad} since ${c.desde}. Specialist in Neuropsychology and Legal and Forensic Psychology.`,
  },
  contacto: {
    titulo: (c) => `Contact and appointments · ${c.nombre}`,
    descripcion: (c) =>
      `Book an appointment with ${c.profesional}, psychologist in ${c.localidad}. WhatsApp and phone ${c.telefono}. ${c.direccion}, ${c.cp} ${c.localidad} (${c.provincia}).`,
  },
};

export const titulosAreas = {
  adultos: 'Psychology for adults in Motril',
  infancia: 'Child and adolescent psychology in Motril',
  escolares: 'School difficulties, ADHD and learning in Motril',
  familia: 'Couples therapy and family mediation in Motril',
  neuropsicologia: 'Neuropsychology and cognitive stimulation in Motril',
  juridica: 'Legal psychology in Motril',
  forense: 'Forensic psychology and expert reports in Motril',
};
