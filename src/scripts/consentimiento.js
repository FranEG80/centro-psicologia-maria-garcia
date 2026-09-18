/* ==========================================================================
   Consentimiento de contenido de terceros.

   Regla que gobierna todo este módulo: nada de terceros se carga antes de un
   acto afirmativo. El marco del mapa se sirve como marcador sin iframe, y el
   iframe solo se inyecta cuando hay un «aceptado» guardado. Rechazar es tan
   directo como aceptar —mismo tamaño, misma franja, mismo clic— porque es lo
   que exige la AEPD, y porque un «no» que cuesta tres pasos no es un no.

   El único dato que se guarda es la propia elección, en localStorage. No es
   una cookie de seguimiento: sin ella no se puede recordar un «no» y habría
   que volver a preguntar en cada página, que es justo lo que molesta.
   ========================================================================== */
const CLAVE = 'mg-terceros';
const ACEPTADO = 'aceptado';
const RECHAZADO = 'rechazado';

/* Safari en privado y los navegadores con almacenamiento bloqueado lanzan al
   tocar localStorage. Si no se puede recordar la elección, el sitio sigue
   funcionando: se pregunta otra vez y el mapa sigue sin cargarse solo. */
function leer() {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === ACEPTADO || v === RECHAZADO ? v : null;
  } catch {
    return null;
  }
}

function guardar(valor) {
  try {
    localStorage.setItem(CLAVE, valor);
  } catch {
    /* sin persistencia: la elección vale para esta página */
  }
}

const TEXTOS = {
  [ACEPTADO]:
    'Has aceptado el contenido de terceros: el mapa de Google se carga donde aparece.',
  [RECHAZADO]:
    'Has rechazado el contenido de terceros: el mapa de Google no se carga.',
  sin: 'Todavía no has elegido. Mientras tanto, el mapa de Google no se carga.',
};

export function consentimiento() {
  const franja = document.querySelector('[data-consentimiento]');
  const marcos = [...document.querySelectorAll('[data-tercero]')];
  let valor = leer();

  /* ---- Marcos de terceros -------------------------------------------- */
  function montar(marco) {
    if (marco.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = marco.dataset.terceroSrc;
    iframe.title = marco.dataset.terceroTitulo || '';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.loading = 'eager'; // Lenis conduce el scroll: lazy no llega a disparar
    marco.append(iframe);
    marco.classList.add('esta-cargado');
    const aviso = marco.querySelector('[data-tercero-aviso]');
    if (aviso) aviso.hidden = true;
  }

  function desmontar(marco) {
    marco.querySelector('iframe')?.remove();
    marco.classList.remove('esta-cargado');
    const aviso = marco.querySelector('[data-tercero-aviso]');
    if (aviso) aviso.hidden = false;
  }

  function sincronizar() {
    marcos.forEach((m) => (valor === ACEPTADO ? montar(m) : desmontar(m)));
    document.querySelectorAll('[data-consentimiento-estado]').forEach((el) => {
      el.textContent = TEXTOS[valor] || TEXTOS.sin;
    });
  }

  /* ---- Franja --------------------------------------------------------- */
  function abrir({ foco = false } = {}) {
    if (!franja) return;
    franja.hidden = false;
    // Un fotograma entre mostrar y animar: desde `hidden` no hay transición.
    requestAnimationFrame(() => franja.classList.add('esta-visible'));
    if (foco) franja.querySelector('[data-consentimiento-aceptar]')?.focus();
  }

  function cerrar() {
    if (!franja) return;
    franja.classList.remove('esta-visible');
    // El atributo se pone al acabar el deslizamiento, no antes, o la franja
    // desaparece de golpe. Con movimiento reducido no hay transición y el
    // respaldo de tiempo se encarga.
    let hecho = false;
    const ocultar = () => {
      if (hecho) return;
      hecho = true;
      franja.hidden = true;
    };
    franja.addEventListener('transitionend', ocultar, { once: true });
    setTimeout(ocultar, 900);
  }

  function decidir(nuevo) {
    valor = nuevo;
    guardar(nuevo);
    sincronizar();
    cerrar();
    document.dispatchEvent(
      new CustomEvent('consentimiento:cambio', { detail: { valor: nuevo } })
    );
  }

  franja
    ?.querySelector('[data-consentimiento-aceptar]')
    ?.addEventListener('click', () => decidir(ACEPTADO));
  franja
    ?.querySelector('[data-consentimiento-rechazar]')
    ?.addEventListener('click', () => decidir(RECHAZADO));

  // Reabrir desde el pie o desde la política: la elección se puede cambiar
  // siempre, y retirarla tiene que ser tan fácil como darla.
  document.querySelectorAll('[data-consentimiento-abrir]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      abrir({ foco: true });
    });
  });

  // Botón del propio marco: consentimiento puntual y explícito para el mapa,
  // en el sitio donde se entiende qué se está aceptando.
  marcos.forEach((marco) => {
    marco
      .querySelector('[data-tercero-cargar]')
      ?.addEventListener('click', () => decidir(ACEPTADO));
  });

  sincronizar();

  /* Cuándo se pregunta. En las páginas con primer cuadro, al salir de él: la
     escena de vidrio ocupa la pantalla entera y un aviso encima la parte por
     la mitad. Se puede esperar porque mientras tanto no se ha cargado nada de
     terceros, así que no hay nada que consentir; el mapa del pie llega mucho
     después y lleva su propio botón. En el resto de páginas, tras un respiro
     para que no salte encima de la entrada. */
  if (!valor) {
    const cuadro = document.querySelector('[data-hero]');
    if (!cuadro) {
      setTimeout(() => abrir(), 700);
    } else {
      const io = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => {
            if (e.isIntersecting) return;
            io.disconnect();
            abrir();
          });
        },
        { threshold: 0 }
      );
      io.observe(cuadro);
    }
  }
}
