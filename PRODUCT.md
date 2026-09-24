# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tres audiencias llegan a esta web, casi siempre desde el móvil y casi siempre en
un momento malo:

1. **Padres y madres de Motril y la costa de Granada** preocupados por un hijo:
   conducta, sueño, lenguaje, notas que caen, un diagnóstico escolar que no
   entienden. Buscan a alguien que sepa de niños y que les explique qué pasa.
   Es la audiencia mayoritaria y la que más pesa en el diseño.
2. **Adultos** con ansiedad, estado de ánimo bajo, un duelo, una separación.
   Llegan discretamente y quieren saber si esto es para ellos antes de escribir.
3. **Profesionales y particulares que necesitan un peritaje**: abogados,
   trabajadores en proceso de incapacidad o acoso laboral, familias en un
   juzgado. Vienen a verificar credenciales y capacidad forense, no a que se
   les tranquilice.

El trabajo que hacen en la web es el mismo en los tres casos: decidir si esta
persona es la adecuada y dar el primer paso de contacto. Nadie viene a leer.

## Product Purpose

Centro de psicología de práctica privada en Motril (Granada), en activo desde
2005, dirigido por María García Molina. La web tiene un único objetivo:
convertir la duda en un primer contacto por WhatsApp o teléfono.

Éxito = un mensaje o una llamada. No hay reserva online, ni pago, ni área
privada, ni newsletter.

## Positioning

Un solo profesional cubre un recorrido que en la mayoría de gabinetes está
repartido entre varias personas o simplemente no está: clínica infantil y
adolescente, clínica de adultos, familia, **mediación familiar acreditada por la
Junta de Andalucía (nº 631)**, **neuropsicología** y **psicología jurídica y
forense con ratificación de informes en juzgados**.

Eso es lo que ningún gabinete vecino puede copiar sin las credenciales: una
familia en proceso de separación puede hacer la mediación, la valoración de los
menores y, si el caso llega al juzgado, el informe y su ratificación en el mismo
centro y con la misma persona. Veinte años de continuidad en el mismo sitio.

El trato es explícitamente el opuesto al del gabinete grande: «de tú a tú, de la
mano en todo momento» (palabras de la clienta).

## Operating Context

- Centro físico en C. Rafael Alberti, 3 · 18600 Motril, Granada. Fachada de
  granito negro con rotulación.
- El espacio importa y se usa como prueba: recepción con las titulaciones
  enmarcadas a la vista, sala de espera, **tres despachos distintos** (uno de
  madera oscura para adultos, uno claro con luz natural, uno preparado para
  familia y pareja) y un **rincón infantil** con mesa baja, sillas pequeñas y
  pizarra. Hay fotografía real de todos ellos.
- Material de evaluación real y fotografiado: lámina de Rorschach, cubos de
  diseño de bloques, torre de Hanoi.
- La valoración precede a la intervención en casi todas las áreas: primero se
  evalúa, después se interviene. Es la estructura del propio brief de la
  clienta y debe leerse en la web.

## Capabilities and Constraints

**Áreas confirmadas** (verbatim del brief, en `src/data/contenido.js`):
infancia y adolescencia · problemas escolares · adultos · familia y pareja ·
psicología jurídica y forense · neuropsicología. Cada una con su lista cerrada
de puntos.

**Formación confirmada**: Licenciada en Psicología (Universidad de Granada);
especialista en Neuropsicología; Máster en Psicología Jurídica y Forense;
Mediadora Familiar de la Junta de Andalucía nº 631.

**Trayectoria confirmada**: clínica privada continuada desde 2005; psicóloga y
mediadora en instituciones públicas; ponente en jornadas, cursos y talleres;
intervención con personas con diversidad funcional y sus familias.

**Registros**: Nº colegiada AO 05323 · Mediadora Familiar nº 631 · NICA 67672.

**Contacto**: 637 03 34 48 · WhatsApp wa.me/34637033448 ·
mariagarciamolina16@gmail.com. WhatsApp y teléfono son la única vía: **no hay
formulario y no habrá backend de envío** (decisión del usuario, 2026-09-10).

**Stack**: Astro 5 + Three.js + GSAP + Lenis, ya en marcha. Sitio estático.

**Arquitectura acordada** (decisión del usuario, 2026-09-10): deja de ser
landing de una página y pasa a multipágina — Home (resumen) · Áreas (índice) ·
Áreas/<área> (subpágina por área) · Consulta · Sobre mí · Contacto.

**Intocable**: el hero de la home, incluida su escena WebGL
(`src/components/Hero.astro`, `src/scripts/hero-scene.js`,
`src/scripts/hero-surfaces.js`). Fijado por el usuario.

**Sin decidir / no facilitado**: tarifas, horarios, duración de sesión, si hay
sesiones online, si el centro es accesible, política de cancelación, idiomas.

## Brand Commitments

- Nombre: **Centro de Psicología María García**. Profesional: **María García
  Molina**. Logos en `public/media/logo-maria-garcia.svg` y
  `logo-maria-garcia-crema.svg`.
- Voz fijada por la clienta: «elegante, sencillo, distinto, moderno con
  animaciones» y «trato de tú a tú, de la mano en todo momento». Sin jerga
  clínica gratuita, sin promesas de resultado.
- **Paleta vinculante**, elegida por la clienta (captura entregada por el
  usuario 2026-09-10). Confirmadas: crema fondo `#F9F6F0` · lino `#EAE3DA` ·
  gris vapor `#F2F1EE` · **azul marino `#1B2E43`**. La captura tiene muestras
  cortadas a ambos lados, entre ellas un tono tostado/topo a la derecha:
  **pendiente de que el usuario pase los hex que faltan.** Sustituye a la
  paleta anterior de `src/styles/tokens.css` (crema `#F8F4EB`, lino `#EDE6D8`,
  petróleo `#35617F`), que queda como estado previo.
- El brief de la clienta pide «colores topos y grises» y, en la zona de
  niños/adolescentes, **un topo más llamativo**: el registro infantil tiene
  permiso de color propio dentro de la paleta.
- Tipografía: **abierta a cambio**. La Host Grotesk actual no es un compromiso.
- Se pide explícitamente nivel de acabado tipo web premiada (awwwards) y
  animación como parte del producto, no como adorno.

## Evidence on Hand

Real y utilizable:

- El retrato de María está pendiente. Los marcos de Home y «Sobre mí» permanecen vacíos hasta que se aporte la fotografía real.
- Fotografía del centro (7 imágenes): fachada de granito, recepción con
  titulaciones, sala de espera, los tres despachos, rincón infantil.
  `src/assets/photo/`.
- Material de evaluación (3 imágenes): Rorschach, cubos, torre de Hanoi.
- Texturas de la escena del hero: `public/media/tex/`.
- Credenciales verificables (colegiada, mediadora, NICA) — la prueba más
  fuerte que tiene el centro y la que la competencia local no publica.

Explícitamente ausente y **no inventable**: testimonios de pacientes, número de
casos, tasas de éxito, tarifas, valoraciones, premios, prensa, colaboraciones.

**Estado del entregable** (decisión del usuario, 2026-09-10): esto es un
**mockup de presentación para la clienta**. El usuario autoriza redactar copia
descriptiva propia para cada área y para cada punto de cada área, y la copia de
las páginas nuevas, con la información definitiva pendiente. Todo texto
autorado va marcado en la lista de reemplazo al cierre. La autorización cubre
**copia descriptiva**, nunca datos que solo la clienta puede dar (precios,
horarios, modalidad online) ni pruebas sociales inexistentes.

## Product Principles

1. **La credencial es la prueba.** Sin testimonios, lo único que sostiene la
   confianza son el registro profesional, veinte años en el mismo sitio y el
   espacio real fotografiado. Se muestran, no se declaran.
2. **Valoración antes que intervención.** La estructura del brief es la
   estructura del contenido: primero se mira, después se trabaja.
3. **Seis áreas, un solo profesional.** La amplitud es la posición; la web debe
   hacerla legible sin que parezca un directorio.
4. **De tú a tú.** Una persona, no una institución. La primera persona del
   singular es válida y preferible.
5. **El primer paso es un mensaje.** Cada página termina con el contacto a
   mano; nada compite con él.

## Accessibility & Inclusion

Web sanitaria leída por gente en mal momento y por adultos mayores en el área
de neuropsicología: el contenido nunca depende de que un revelado o un WebGL
funcione (regla ya implantada en `Base.astro` y de obligado cumplimiento),
texto real de 18px hacia arriba, AA como suelo y `prefers-reduced-motion`
respetado en todo movimiento nuevo.
