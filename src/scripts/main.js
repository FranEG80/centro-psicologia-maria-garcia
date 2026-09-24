import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { consentimiento } from './consentimiento.js';

gsap.registerPlugin(ScrollTrigger);

const movimientoReducido = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

async function scrollSuave() {
  if (movimientoReducido) return null;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    syncTouch: false,
  });
  lenis.on('scroll', () => {
    ScrollTrigger.update();
    avisarScroll();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const destino = document.querySelector(a.getAttribute('href'));
      if (!destino) return;
      e.preventDefault();
      lenis.scrollTo(destino, { offset: -8 });
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });
  if (import.meta.env.DEV) window.__lenis = lenis;
  return lenis;
}

function hayWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGL2RenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

const webglDisponible = !!document.querySelector('[data-hero]') && hayWebGL();
const escenaVidrioEnCarga = webglDisponible
  ? import('./hero-scene.js')
  : null;

const ATERRIZAJE = 0.3;

function marcaPortada() {
  const marca = document.querySelector('[data-nav-marca]');
  const monograma = marca?.querySelector('[data-nav-monograma]');
  const prefijo = marca?.querySelector('[data-nav-prefijo]');
  const nucleo = marca?.querySelector('[data-nav-nucleo]');
  const flecha = document.querySelector('[data-hero-flecha]');
  if (!marca || !monograma || !nucleo) return null;

  const suavizar = gsap.parseEase('power2.inOut');
  let plan = null;

  const medir = () => {
    plan = null;
    limpiarLogo();
    if (prefijo) prefijo.style.transform = '';
    nucleo.style.transform = '';

    const anchoVista = window.innerWidth;
    const altoVista = window.innerHeight;
    const rLogo = monograma.getBoundingClientRect();
    const rPrefijo = prefijo?.getBoundingClientRect();
    const rNombre = nucleo.getBoundingClientRect();
    if (!rLogo.width || !rNombre.width) return;

    const anchoGrande = gsap.utils.clamp(
      84,
      190,
      Math.min(anchoVista * 0.3, altoVista * 0.24)
    );
    const escalaLogo = anchoGrande / rLogo.width;

    const cuerpo = parseFloat(getComputedStyle(nucleo).fontSize) || 14;
    const cuerpoGrande = gsap.utils.clamp(
      15,
      27,
      Math.min(anchoVista * 0.034, altoVista * 0.028)
    );
    const escalaNombre = cuerpoGrande / cuerpo;

    const altoLogo = rLogo.height * escalaLogo;
    const altoPrefijo = rPrefijo?.width ? rPrefijo.height * escalaNombre : 0;
    const altoNombre = rNombre.height * escalaNombre;
    const hueco = altoLogo * 0.32;
    const huecoTexto = altoPrefijo ? altoNombre * 0.24 : 0;
    const altoTexto = altoPrefijo + huecoTexto + altoNombre;
    const arriba = altoVista * 0.47 - (altoLogo + hueco + altoTexto) / 2;
    const eje = anchoVista / 2;

    plan = {
      logo: {
        dx: eje - (rLogo.left + rLogo.width / 2),
        dy: arriba + altoLogo / 2 - (rLogo.top + rLogo.height / 2),
        escala: escalaLogo,
        ancho: rLogo.width,
        alto: rLogo.height,
      },
      nombre: {
        dx: eje - (rNombre.left + rNombre.width / 2),
        dy:
          arriba +
          altoLogo +
          hueco +
          altoPrefijo +
          huecoTexto +
          altoNombre / 2 -
          (rNombre.top + rNombre.height / 2),
        escala: escalaNombre,
      },
      prefijo: rPrefijo?.width
        ? {
            dx: eje - (rPrefijo.left + rPrefijo.width / 2),
            dy:
              arriba +
              altoLogo +
              hueco +
              altoPrefijo / 2 -
              (rPrefijo.top + rPrefijo.height / 2),
            escala: escalaNombre,
          }
        : null,
    };

    if (flecha) {
      flecha.style.top = `${(arriba + altoLogo + hueco + altoTexto + altoLogo * 0.36).toFixed(1)}px`;
      flecha.style.bottom = 'auto';
    }
  };

  const escribir = (el, paso, k) => {
    el.style.transform = `translate3d(${(paso.dx * k).toFixed(2)}px, ${(
      paso.dy * k
    ).toFixed(2)}px, 0) scale(${(1 + (paso.escala - 1) * k).toFixed(4)})`;
  };

  // Safari rasteriza el SVG a su tamaño de caja y escala el bitmap: se
  // redimensiona de verdad y el margen negativo conserva su hueco de 26px.
  const escribirLogo = (paso, k) => {
    const s = 1 + (paso.escala - 1) * k;
    const extraAncho = paso.ancho * (s - 1);
    const extraAlto = paso.alto * (s - 1);
    monograma.style.maxWidth = 'none';
    monograma.style.width = `${(paso.ancho * s).toFixed(2)}px`;
    monograma.style.margin = `${(-extraAlto / 2).toFixed(2)}px ${(
      -extraAncho / 2
    ).toFixed(2)}px`;
    monograma.style.transform = `translate3d(${(paso.dx * k).toFixed(2)}px, ${(
      paso.dy * k
    ).toFixed(2)}px, 0)`;
  };

  const limpiarLogo = () => {
    monograma.style.transform = '';
    monograma.style.width = '';
    monograma.style.maxWidth = '';
    monograma.style.margin = '';
  };

  const aplicar = (p) => {
    if (!plan) medir();
    marca.classList.add('esta-medida');
    if (!plan) return;
    const q = suavizar(gsap.utils.clamp(0, 1, p / ATERRIZAJE));
    const k = 1 - q;
    escribirLogo(plan.logo, k);
    if (prefijo && plan.prefijo) escribir(prefijo, plan.prefijo, k);
    escribir(nucleo, plan.nombre, k);
    marca.classList.toggle('ha-aterrizado', q >= 1);
  };

  const rematar = () => {
    plan = null;
    limpiarLogo();
    if (prefijo) prefijo.style.transform = '';
    nucleo.style.transform = '';
    marca.classList.add('esta-medida', 'ha-aterrizado');
    if (flecha) {
      flecha.style.top = '';
      flecha.style.bottom = '';
    }
  };

  return { aplicar, medir, rematar };
}

let avisarScroll = () => {};

function flechaArranque() {
  const flecha = document.querySelector('[data-hero-flecha]');
  if (!flecha) return;
  avisarScroll = () =>
    flecha.classList.toggle('esta-oculta', window.scrollY > 12);
  avisarScroll();
  window.addEventListener('scroll', avisarScroll, { passive: true });
}

async function primerCuadro() {
  const seccion = document.querySelector('[data-hero]');
  if (!seccion) return;

  const escenario = seccion.querySelector('[data-hero-escenario]');
  const canvas = seccion.querySelector('[data-hero-canvas]');
  const ambiente = seccion.querySelector('[data-hero-ambiente]');
  const copia = seccion.querySelector('[data-hero-copia]');
  const cuerpo = document.body;
  const marca = marcaPortada();

  const aplicarCopia = (v) => {
    copia.style.opacity = String(v);
    copia.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
    copia.setAttribute('aria-hidden', v < 0.05 ? 'true' : 'false');
  };

  const aplicarNav = (sobreVidrio) => {
    cuerpo.classList.toggle('sobre-vidrio', sobreVidrio);
    cuerpo.classList.toggle('barra-montada', !sobreVidrio);
  };

  const esmeriladoDe = gsap.utils.mapRange(0.26, 0, 0, 16);
  const aplicarEsmerilado = (p) => {
    const px = gsap.utils.clamp(0, 16, esmeriladoDe(p));
    canvas.classList.toggle('esta-esmerilado', px > 0.3);
    const ladoCorto = Math.max(1, Math.min(window.innerWidth, window.innerHeight));
    const zoom = 1 + (px * 6) / ladoCorto;
    canvas.style.setProperty('--hero-esmerilado-zoom', zoom.toFixed(4));
    if (px > 0.3) canvas.style.setProperty('--hero-esmerilado', `${px.toFixed(2)}px`);
  };

  if (!webglDisponible || movimientoReducido) {
    aplicarCopia(1);
    aplicarNav(false);
    marca?.rematar();
    if (!webglDisponible) {
      ambiente?.classList.add('es-hormigon');
      return;
    }
  }

  if (!movimientoReducido) marca?.aplicar(0);

  let crearEscenaVidrio;
  try {
    ({ crearEscenaVidrio } = await escenaVidrioEnCarga);
  } catch {
    ambiente?.classList.add('es-hormigon');
    aplicarCopia(1);
    aplicarNav(false);
    marca?.rematar();
    return;
  }

  const escena = crearEscenaVidrio({
    canvas,
    alPrimerFotograma() {
      canvas.classList.add('esta-listo');
    },
    alEscenaLista() {
      ambiente?.classList.add('esta-oculto');
    },
  });

  if (import.meta.env.DEV) window.__heroCtrl = escena;

  if (movimientoReducido) {
    escena.setProgreso(1);
    aplicarEsmerilado(1);
    marca?.rematar();
    return;
  }

  const progresoCopia = gsap.utils.mapRange(0.76, 0.95, 0, 1);

  const st = ScrollTrigger.create({
    trigger: seccion,
    start: 'top top',
    end: '+=250%',
    pin: escenario,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const p = self.progress;
      escena.setProgreso(p);
      aplicarEsmerilado(p);
      aplicarCopia(gsap.utils.clamp(0, 1, progresoCopia(p)));
      marca?.aplicar(p);
      aplicarNav(p < ATERRIZAJE);
    },
    onRefreshInit() {
      aplicarCopia(0);
      aplicarNav(true);
    },
    onRefresh(self) {
      marca?.medir();
      marca?.aplicar(self.progress);
    },
  });

  aplicarCopia(0);
  aplicarNav(true);
  aplicarEsmerilado(0);
  marca?.aplicar(0);

  if (import.meta.env.DEV) {
    window.__heroST = st;
    window.__heroFijar = (p) => {
      st.kill(true);
      window.scrollTo(0, 0);
      escena.setProgreso(p);
      aplicarEsmerilado(p);
      aplicarCopia(p > 0.5 ? 1 : 0);
      marca?.aplicar(p);
      aplicarNav(p < ATERRIZAJE);
    };
    const revision = new URLSearchParams(location.search).get('hero');
    if (revision !== null && Number.isFinite(Number(revision))) {
      window.__heroFijar(gsap.utils.clamp(0, 1, Number(revision)));
    }
  }
}

function revelados() {
  const objetivos = document.querySelectorAll('[data-revelar]');
  window.__revelado = true;
  if (!objetivos.length) return;

  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('es-visible');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  document.querySelectorAll('[data-revelar-grupo]').forEach((grupo) => {
    grupo.querySelectorAll('[data-revelar]').forEach((el, i) => {
      el.style.setProperty('--revelar-retardo', `${Math.min(i, 6) * 60}ms`);
    });
  });

  objetivos.forEach((el) => io.observe(el));
}

function areas() {
  const seccion = document.querySelector('[data-areas]');
  if (!seccion) return;

  const enlaces = [...seccion.querySelectorAll('[data-areas-enlace]')];
  const bloques = [...seccion.querySelectorAll('[data-areas-bloque]')];
  if (!bloques.length) return;

  const marcar = (id) => {
    enlaces.forEach((a) => {
      const activo = a.dataset.areasEnlace === id;
      a.classList.toggle('esta-activo', activo);
      a.setAttribute('aria-current', activo ? 'true' : 'false');
    });
    const i = bloques.findIndex((b) => b.id === id);
    if (i >= 0) {
      seccion.style.setProperty(
        '--areas-tinte',
        String(0.03 + (i / (bloques.length - 1)) * 0.075)
      );
    }
  };

  const io = new IntersectionObserver(
    (entradas) => {
      const dentro = entradas
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (dentro) marcar(dentro.target.id);
    },
    { rootMargin: '-30% 0px -55% 0px' }
  );

  bloques.forEach((b) => io.observe(b));
  marcar(bloques[0].id);
}

function menu() {
  const boton = document.querySelector('[data-nav-boton]');
  const panel = document.querySelector('[data-nav-panel]');
  if (!boton || !panel) return;

  const fijar = (abierto) => {
    boton.setAttribute('aria-expanded', String(abierto));
    boton.querySelector('.solo-lectores').textContent = abierto
      ? 'Cerrar el menú'
      : 'Abrir el menú';
    panel.hidden = !abierto;
  };

  boton.addEventListener('click', () => {
    const abierto = boton.getAttribute('aria-expanded') === 'true';
    fijar(!abierto);
    if (!abierto) panel.querySelector('a')?.focus();
  });

  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) fijar(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panel.hidden) return;
    fijar(false);
    boton.focus();
  });

  document.addEventListener('pointerdown', (e) => {
    if (panel.hidden) return;
    if (e.target.closest('[data-nav]')) return;
    fijar(false);
  });

  window.matchMedia('(min-width: 641px)').addEventListener('change', (e) => {
    if (e.matches) fijar(false);
  });
}

menu();
consentimiento();
scrollSuave();
flechaArranque();
primerCuadro();
revelados();
areas();

if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener('load', () => ScrollTrigger.refresh());
