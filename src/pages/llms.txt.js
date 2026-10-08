// /llms.txt (llmstxt.org): resumen en Markdown para asistentes de IA, sacado de
// los mismos datos que la web para que no se desfase. Solo en español.
import { areas, centro, formacion } from '../data/contenido.js';
import { metaAreas } from '../data/paginas.js';
import { ruta } from '../i18n/rutas.js';

export function GET({ site }) {
  // Con barra final, como el canonical y el sitemap.
  const url = (clave, id) => new URL(`${ruta('es', clave, id).replace(/\/$/, '')}/`, site).href;
  const credenciales = centro.credenciales.map((c) => `${c.etiqueta} ${c.valor}`).join('; ');

  const cuerpo = `# ${centro.nombre}

> Consulta de psicología en ${centro.localidad} (${centro.provincia}) dirigida por ${centro.profesional}, psicóloga sanitaria y mediadora familiar con consulta privada desde ${centro.desde}. Atiende a adultos, niños, adolescentes, parejas y familias, y hace valoraciones neuropsicológicas, informes jurídicos y peritajes forenses.

- Dirección: ${centro.direccion}, ${centro.cp} ${centro.localidad} (${centro.provincia}), España
- Teléfono y WhatsApp: +34 ${centro.telefono}
- Correo: ${centro.email}
- Registros: ${credenciales}
- Formación: ${formacion.join('; ')}

## Áreas de atención

${areas.map((a) => `- [${a.titulo}](${url('area', a.id)}): ${metaAreas[a.id]}`).join('\n')}

## Más información

- [Sobre ${centro.profesional}](${url('sobreMi')}): trayectoria y formación.
- [Instalaciones](${url('consulta')}): despachos, zona infantil y sala juvenil.
- [Contacto y cita](${url('contacto')}): teléfono, WhatsApp y cómo llegar.
`;

  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
