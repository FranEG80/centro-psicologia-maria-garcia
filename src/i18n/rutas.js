// Idiomas del sitio y rutas por idioma.
// El español es el idioma por defecto y no lleva prefijo (/areas); el inglés
// vive bajo /en/ con los nombres de ruta traducidos (/en/areas, /en/about…).
// Las páginas legales existen solo en español: ruta() devuelve la española
// cuando una página no tiene versión en el idioma pedido.

export const idiomaPorDefecto = 'es';

// PUBLIC_BILINGUE=false (o 0, off) apaga el inglés: desaparece el selector de
// idioma y los hreflang, y cada URL /en/ redirige a su página en español. Se
// lee al construir.
export const bilingue = !['false', '0', 'off'].includes(
  String(import.meta.env.PUBLIC_BILINGUE ?? '').toLowerCase()
);

// Idiomas activos. ruta() sigue conociendo el inglés aunque esté apagado.
export const idiomas = bilingue ? ['es', 'en'] : ['es'];

// Páginas con una sola URL por idioma. Sin clave de idioma = no traducida.
const paginas = {
  inicio: { es: '/', en: '/en/' },
  areas: { es: '/areas', en: '/en/areas' },
  consulta: { es: '/instalaciones', en: '/en/facilities' },
  sobreMi: { es: '/sobre-mi', en: '/en/about' },
  contacto: { es: '/contacto', en: '/en/contact' },
  avisoLegal: { es: '/aviso-legal' },
  privacidad: { es: '/privacidad' },
  cookies: { es: '/cookies' },
};

// Secciones con una página por elemento. `slugs` va de id interno a slug por
// idioma; los ids (claves de datos, iconos, fotos) no cambian entre idiomas.
const secciones = {
  area: {
    parametro: 'area',
    base: { es: '/areas', en: '/en/areas' },
    slugs: {
      adultos: { es: 'adultos', en: 'adults' },
      infancia: { es: 'infancia', en: 'children-and-teens' },
      escolares: { es: 'escolares', en: 'school-difficulties' },
      familia: { es: 'familia', en: 'family-and-couples' },
      neuropsicologia: { es: 'neuropsicologia', en: 'neuropsychology' },
      juridica: { es: 'juridica', en: 'legal-psychology' },
      forense: { es: 'forense', en: 'forensic-psychology' },
    },
  },
  espacio: {
    parametro: 'espacio',
    base: { es: '/instalaciones', en: '/en/facilities' },
    slugs: {
      adultos: { es: 'adultos', en: 'consulting-rooms' },
      infantil: { es: 'infantil', en: 'children' },
      juvenil: { es: 'juvenil', en: 'teens' },
    },
  },
};

const limpia = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

export function ruta(lang, clave, id) {
  const seccion = secciones[clave];
  if (seccion) return `${seccion.base[lang]}/${seccion.slugs[id][lang]}`;
  const pagina = paginas[clave];
  return pagina[lang] ?? pagina[idiomaPorDefecto];
}

// getStaticPaths de una sección dinámica en un idioma. Las props llevan solo el
// id: cada página recoge su texto del idioma en el que se renderiza.
export function rutasEstaticas(clave, lang) {
  const { parametro, slugs } = secciones[clave];
  return Object.entries(slugs).map(([id, slug]) => ({
    params: { [parametro]: slug[lang] },
    props: { id },
  }));
}

function versiones(clave, id) {
  const traducidas = secciones[clave]
    ? idiomas
    : idiomas.filter((l) => paginas[clave][l]);
  return Object.fromEntries(traducidas.map((l) => [l, ruta(l, clave, id)]));
}

// Todas las páginas del sitio, cada una con sus URL por idioma activo. Para el
// sitemap: lo que se añada a las tablas de arriba entra solo.
export function todasLasPaginas() {
  const sueltas = Object.keys(paginas).map((clave) => versiones(clave));
  const dinamicas = Object.entries(secciones).flatMap(([clave, seccion]) =>
    Object.keys(seccion.slugs).map((id) => versiones(clave, id))
  );
  return [...sueltas, ...dinamicas];
}

// Las URL de una misma página en cada idioma que la tiene: { es, en }.
// Devuelve null si la ruta no se reconoce (404).
export function alternas(pathname) {
  const actual = limpia(pathname);

  for (const lang of idiomas) {
    for (const [clave, pagina] of Object.entries(paginas)) {
      if (pagina[lang] && limpia(pagina[lang]) === actual) return versiones(clave);
    }

    for (const [clave, seccion] of Object.entries(secciones)) {
      const prefijo = `${limpia(seccion.base[lang])}/`;
      if (!actual.startsWith(prefijo)) continue;
      const slug = actual.slice(prefijo.length);
      const id = Object.keys(seccion.slugs).find((i) => seccion.slugs[i][lang] === slug);
      if (id) return versiones(clave, id);
    }
  }

  return null;
}
