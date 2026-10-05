import * as contenidoEs from '../data/contenido.js';
import * as paginasEs from '../data/paginas.js';
import * as contenidoEn from '../data/en/contenido.js';
import * as paginasEn from '../data/en/paginas.js';

// El inglés se apoya en el español: src/data/en/* solo exporta lo que cambia de
// texto y lo que no (fotos, ids, enlaces) se hereda. Si algo no está traducido
// todavía, la página sale con el texto español en lugar de romperse.
const es = { ...contenidoEs, ...paginasEs };

export const datos = {
  es,
  en: { ...es, ...contenidoEn, ...paginasEn },
};
