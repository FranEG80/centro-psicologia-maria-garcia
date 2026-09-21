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

  function montar(marco) {
    if (marco.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = marco.dataset.terceroSrc;
    iframe.title = marco.dataset.terceroTitulo || '';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.loading = 'eager';
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

  function abrir({ foco = false } = {}) {
    if (!franja) return;
    franja.hidden = false;
    requestAnimationFrame(() => franja.classList.add('esta-visible'));
    if (foco) franja.querySelector('[data-consentimiento-aceptar]')?.focus();
  }

  function cerrar() {
    if (!franja) return;
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
