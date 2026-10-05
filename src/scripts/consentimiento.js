const CLAVE = 'mg-terceros';
const ACEPTADO = 'aceptado';
const RECHAZADO = 'rechazado';

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
  }
}

export function consentimiento() {
  const franja = document.querySelector('[data-consentimiento]');
  const anuncio = document.querySelector('[data-consentimiento-anuncio]');
  // Los textos de estado llegan ya en el idioma de la página (Consentimiento.astro).
  const TEXTOS = {
    [ACEPTADO]: franja?.dataset.textoAceptado,
    [RECHAZADO]: franja?.dataset.textoRechazado,
    sin: franja?.dataset.textoSin,
  };
  const marcos = [...document.querySelectorAll('[data-tercero]')];
  let valor = leer();

  // Último elemento con foco fuera del aviso. Al decidir, el aviso se oculta
  // con el foco dentro y el navegador lo suelta en <body>: se devuelve aquí.
  let previo = null;
  document.addEventListener('focusin', (e) => {
    if (e.target !== document.body && !franja?.contains(e.target)) previo = e.target;
  });

  function devolverFoco() {
    const vale = (el) =>
      el?.isConnected && !el.closest('[hidden]') && el.getClientRects().length > 0;
    if (vale(previo)) previo.focus();
    else document.getElementById('contenido')?.focus({ preventScroll: true });
  }

  function montar(marco) {
    if (marco.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = marco.dataset.terceroSrc;
    iframe.title = marco.dataset.terceroTitulo || '';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.loading = 'eager';
    const aviso = marco.querySelector('[data-tercero-aviso]');
    // «Cargar el mapa» está dentro del aviso que se va a ocultar: el foco pasa
    // al mapa, que es lo que se acaba de pedir.
    const traiaFoco = aviso?.contains(document.activeElement);
    marco.append(iframe);
    marco.classList.add('esta-cargado');
    if (aviso) aviso.hidden = true;
    if (traiaFoco) iframe.focus();
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

  // El aviso es fijo y tapa el final de la página: mientras está abierto se
  // reserva su alto (margen del pie y scroll-padding-bottom) para que un
  // elemento enfocado no quede debajo de él (WCAG 2.4.11).
  function reservarAlto(abierto) {
    const alto = abierto
      ? Math.ceil(franja.offsetHeight + parseFloat(getComputedStyle(franja).bottom || '0'))
      : 0;
    document.documentElement.style.setProperty('--aviso-alto', `${alto}px`);
  }
  if (franja && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (!franja.hidden) reservarAlto(true);
    }).observe(franja);
  }
  // La reserva solo se aplica a quien navega con teclado (clase en <html>):
  // con ratón o táctil el aviso se cierra sin más y no queda hueco bajo el pie.
  const html = document.documentElement;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') html.classList.add('usa-teclado');
  });
  document.addEventListener('pointerdown', () => html.classList.remove('usa-teclado'));

  function abrir({ foco = false } = {}) {
    if (!franja) return;
    franja.hidden = false;
    reservarAlto(true);
    requestAnimationFrame(() => franja.classList.add('esta-visible'));
    if (foco) franja.querySelector('[data-consentimiento-aceptar]')?.focus();
    // Apertura automática: el foco no se mueve, se anuncia. Con un pequeño
    // retraso para que el lector no lo pise con lo que esté leyendo.
    else if (anuncio) setTimeout(() => (anuncio.textContent = anuncio.dataset.texto), 150);
  }

  function cerrar() {
    if (!franja) return;
    if (franja.contains(document.activeElement)) devolverFoco();
    if (anuncio) anuncio.textContent = '';
    reservarAlto(false);
    franja.classList.remove('esta-visible');
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

  document.querySelectorAll('[data-consentimiento-abrir]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      abrir({ foco: true });
    });
  });

  marcos.forEach((marco) => {
    marco
      .querySelector('[data-tercero-cargar]')
      ?.addEventListener('click', () => decidir(ACEPTADO));
  });

  sincronizar();

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
