// /sitemap.xml generado desde la tabla de rutas (src/i18n/rutas.js). Cada página
// lista sus versiones en los idiomas activos (hreflang), así que con
// PUBLIC_BILINGUE=false sale solo el español.
import { idiomaPorDefecto, todasLasPaginas } from '../i18n/rutas.js';

// Misma forma que el canonical del build: barra final salvo en la raíz.
const conBarra = (ruta) => (ruta.endsWith('/') ? ruta : `${ruta}/`);

export function GET({ site }) {
  const absoluta = (ruta) => new URL(conBarra(ruta), site).href;

  const urls = todasLasPaginas().flatMap((versiones) => {
    const idiomas = Object.keys(versiones);
    const alternas =
      idiomas.length > 1
        ? [
            ...idiomas.map(
              (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluta(versiones[l])}"/>`
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluta(versiones[idiomaPorDefecto])}"/>`,
          ]
        : [];
    return idiomas.map((l) =>
      ['  <url>', `    <loc>${absoluta(versiones[l])}</loc>`, ...alternas, '  </url>'].join('\n')
    );
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
