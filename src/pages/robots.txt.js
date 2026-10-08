// /robots.txt con la URL del sitemap tomada de `site` (PUBLIC_SITE_URL), igual
// que el canonical y el sitemap.
export function GET({ site }) {
  const cuerpo = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`;
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
