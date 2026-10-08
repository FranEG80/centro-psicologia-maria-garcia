// PUBLIC_NO_DISPONIBLE=true (o 1, on) sustituye cada página HTML por un aviso de
// «NO DISPONIBLE». Sirve para tener el dominio publicado (DNS, certificado)
// antes de enseñar la web. Se lee al construir: cambiarla exige otro build.
const noDisponible = ['true', '1', 'on'].includes(
  String(import.meta.env.PUBLIC_NO_DISPONIBLE ?? '').toLowerCase()
);

const pagina = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>No disponible</title>
    <style>
      html, body { height: 100%; margin: 0; }
      body {
        display: grid;
        place-items: center;
        background: #f8f4eb;
        color: #1f2426;
        font-family: system-ui, sans-serif;
        letter-spacing: 0.08em;
      }
      h1 { font-size: clamp(1.25rem, 4vw, 2rem); font-weight: 500; margin: 0; }
    </style>
  </head>
  <body>
    <h1>NO DISPONIBLE</h1>
  </body>
</html>`;

export async function onRequest(_context, next) {
  const respuesta = await next();
  if (!noDisponible) return respuesta;
  // Solo las páginas: el sitemap y las redirecciones de /en/ siguen igual.
  if (!(respuesta.headers.get('content-type') ?? '').includes('text/html')) return respuesta;
  return new Response(pagina, {
    status: respuesta.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
