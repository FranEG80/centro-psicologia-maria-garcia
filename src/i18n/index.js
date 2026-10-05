// Punto de entrada de i18n para componentes y páginas.
// Rutas por idioma: ./rutas.js · textos de interfaz: ./ui.js · contenido: ./datos.js

import { idiomas, idiomaPorDefecto, ruta } from './rutas.js';
import { ui } from './ui.js';
import { datos } from './datos.js';

export {
  bilingue,
  idiomas,
  idiomaPorDefecto,
  ruta,
  rutasEstaticas,
  alternas,
} from './rutas.js';

export function idiomaDe(Astro) {
  return idiomas.includes(Astro.currentLocale) ? Astro.currentLocale : idiomaPorDefecto;
}

// Todo lo que un componente necesita para pintarse en el idioma de la página:
//   t  textos de interfaz (src/i18n/ui.js)
//   d  contenido y copy de página (src/data/*.js, con src/data/en/* encima)
//   ruta(clave, id)  URL en el idioma actual
export function i18n(Astro) {
  const lang = idiomaDe(Astro);
  return {
    lang,
    t: ui[lang],
    d: datos[lang],
    ruta: (clave, id) => ruta(lang, clave, id),
  };
}
