// Textos de interfaz (menús, pie, avisos, etiquetas de accesibilidad) por idioma.
// El contenido propio del centro (áreas, perfil, páginas) vive en src/data/.
// Las dos columnas deben tener las mismas claves: lo que falte en 'en' se verá
// como `undefined`, no cae al español.

export const ui = {
  es: {
    saltar: 'Saltar al contenido',

    nav: {
      secciones: 'Secciones',
      abrirMenu: 'Abrir el menú',
      cerrarMenu: 'Cerrar el menú',
    },

    // Enlace al otro idioma: se escribe en ese idioma, no en el actual.
    otroIdioma: { lang: 'en', codigo: 'EN', aria: 'Read this page in English' },

    nuevaPestana: '(se abre en una pestaña nueva)',

    // Mensaje que aparece ya escrito al abrir WhatsApp. En las páginas de área
    // nombra el área: la clienta sabe que viene de la web y por qué escriben.
    whatsapp: {
      general: 'Hola, te escribo desde la web.',
      area: (titulo) => `Hola, te escribo desde la web, por el área de ${titulo}.`,
    },

    hero: {
      antetitulo: 'Psicología',
      titulo: ['Tu realidad, vista', 'con luz diferente'],
      areasAria: 'Áreas de atención',
      registros: {
        colegiada: 'Nº colegiada',
        mediadora: 'Mediadora familiar',
        nica: 'NICA',
        desde: 'Ofreciendo servicios desde',
      },
    },

    inicio: {
      areasMarca: 'Áreas',
      areasTitulo: 'Valoración e intervención',
      ambientesTitulo: 'Espacios adaptados según la edad y las necesidades del paciente',
      profesional: {
        marca: 'Quién atiende',
        titulo: 'Una misma profesional, todo el recorrido',
        formacion: 'Formación',
        sobreMi: 'Sobre mí',
      },
    },

    portico: { ruta: 'Ruta' },
    migas: { inicio: 'Inicio', areas: 'Áreas' },
    cita: { de: 'Cita de' },

    areas: {
      indiceAria: 'Las áreas',
      ver: 'Ver el área',
      listadoPorDefecto: 'Se valora e interviene en',
      ambitos: 'Áreas de actuación',
      otras: 'Otras áreas',
    },

    pie: {
      cierre: {
        titulo: 'Escríbeme y lo vemos',
        plomo: 'Llama o escríbeme y lo vemos. Se responderá en un plazo máximo de 24 horas.',
      },
      paginas: 'Páginas',
      areasAria: 'Áreas de atención',
      areas: 'Áreas',
      contacto: 'Contacto',
      donde: 'Dónde estamos',
      comoLlegar: 'Cómo llegar',
      mapa: {
        epigrafe: 'Mapa de Google',
        texto:
          'Este mapa lo sirve Google y deja cookies suyas en tu navegador. No se carga hasta que lo autorices.',
        cargar: 'Cargar el mapa',
        alterna: 'O abrirlo en Google Maps',
        titulo: (direccion, localidad) =>
          `Mapa con la ubicación del centro en ${direccion}, ${localidad}`,
      },
      copyright: (anio, nombre) => `© ${anio} ${nombre}. Todos los derechos reservados.`,
      legalesAria: 'Información legal',
      avisoLegal: 'Aviso legal',
      privacidad: 'Protección de datos',
      cookies: 'Cookies',
      accesibilidad: 'Accesibilidad',
      preferencias: 'Preferencias de cookies',
    },

    consentimiento: {
      epigrafe: 'Cookies',
      texto:
        'Sin analítica ni publicidad. Solo el mapa del pie es de Google y deja cookies suyas al cargarse.',
      mas: 'Más detalle',
      rechazar: 'Rechazar',
      aceptar: 'Aceptar',
      aceptado: 'Has aceptado el contenido de terceros: el mapa de Google se carga donde aparece.',
      rechazado: 'Has rechazado el contenido de terceros: el mapa de Google no se carga.',
      sin: 'Todavía no has elegido. Mientras tanto, el mapa de Google no se carga.',
      anuncio: 'Aviso de cookies abierto al principio de la página, en la región Cookies.',
    },
  },

  en: {
    saltar: 'Skip to content',

    nav: {
      secciones: 'Sections',
      abrirMenu: 'Open menu',
      cerrarMenu: 'Close menu',
    },

    otroIdioma: { lang: 'es', codigo: 'ES', aria: 'Ver esta página en español' },

    nuevaPestana: '(opens in a new tab)',

    whatsapp: {
      general: "Hi, I'm writing from your website.",
      area: (titulo) => `Hi, I'm writing from your website about the ${titulo} area.`,
    },

    hero: {
      antetitulo: 'Psychology',
      titulo: ['Your reality, seen', 'in a different light'],
      areasAria: 'Areas of care',
      registros: {
        colegiada: 'College member no.',
        mediadora: 'Family mediator',
        nica: 'NICA',
        desde: 'In practice since',
      },
    },

    inicio: {
      areasMarca: 'Areas',
      areasTitulo: 'Assessment and intervention',
      ambientesTitulo: 'Spaces adapted to each patient’s age and needs',
      profesional: {
        marca: 'Who will see you',
        titulo: 'One professional, the whole way through',
        formacion: 'Training',
        sobreMi: 'About me',
      },
    },

    portico: { ruta: 'Breadcrumb' },
    migas: { inicio: 'Home', areas: 'Areas' },
    cita: { de: 'Quote from' },

    areas: {
      indiceAria: 'The areas',
      ver: 'See the area',
      listadoPorDefecto: 'Assessment and intervention in',
      ambitos: 'Areas of work',
      otras: 'Other areas',
    },

    pie: {
      cierre: {
        titulo: 'Write to me and we’ll talk it through',
        plomo: 'Call or message me and we’ll talk it through. You will get a reply within 24 hours at most.',
      },
      paginas: 'Pages',
      areasAria: 'Areas of care',
      areas: 'Areas',
      contacto: 'Contact',
      donde: 'Where we are',
      comoLlegar: 'How to get here',
      mapa: {
        epigrafe: 'Google map',
        texto:
          'This map is served by Google, which sets its own cookies in your browser. It does not load until you allow it.',
        cargar: 'Load the map',
        alterna: 'Or open it in Google Maps',
        titulo: (direccion, localidad) =>
          `Map showing the location of the centre at ${direccion}, ${localidad}`,
      },
      copyright: (anio, nombre) => `© ${anio} ${nombre}. All rights reserved.`,
      legalesAria: 'Legal information',
      // Las páginas legales solo existen en español hasta que la asesoría
      // entregue los textos definitivos.
      avisoLegal: 'Legal notice (ES)',
      privacidad: 'Data protection (ES)',
      cookies: 'Cookies (ES)',
      accesibilidad: 'Accessibility (ES)',
      preferencias: 'Cookie preferences',
    },

    consentimiento: {
      epigrafe: 'Cookies',
      texto:
        'No analytics or advertising. Only the map in the footer is Google’s, and it sets its own cookies when it loads.',
      mas: 'More detail (in Spanish)',
      rechazar: 'Decline',
      aceptar: 'Accept',
      aceptado: 'You have accepted third-party content: the Google map loads where it appears.',
      rechazado: 'You have declined third-party content: the Google map does not load.',
      sin: 'You have not chosen yet. Until then, the Google map does not load.',
      anuncio: 'Cookie notice open at the top of the page, in the Cookies region.',
    },
  },
};
