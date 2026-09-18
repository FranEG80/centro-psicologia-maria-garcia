import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { consentimiento } from './consentimiento.js';

gsap.registerPlugin(ScrollTrigger);

const movimientoReducido = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ==========================================================================
   1. Scroll suave. Lenis solo cuando el usuario no ha pedido menos
      movimiento: el scroll interpolado es movimiento.
   ========================================================================== */
async function scrollSuave() {
  if (movimientoReducido) return null;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    syncTouch: false, // el scroll táctil nativo se respeta
  });
  // Lenis mueve el documento de verdad, pero el evento «scroll» nativo no
  // llega de forma fiable mientras él manda: lo que dependa del scroll se
  // engancha aquí, no a window.
  lenis.on('scroll', () => {
    ScrollTrigger.update();
    avisarScroll();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los anclajes del menú pasan por Lenis para que el destino sea exacto.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const destino = document.querySelector(a.getAttribute('href'));
      if (!destino) return;
      e.preventDefault();
      lenis.scrollTo(destino, { offset: -8 });
      // El foco tiene que seguir al scroll o el teclado se queda atrás.
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });
  // En desarrollo, para poder auditar la página sin que el scroll interpolado
  // pise las posiciones que se fijan a mano.
  if (import.meta.env.DEV) window.__lenis = lenis;
  return lenis;
}

/* ==========================================================================
   2. Primer cuadro. Pin + scrub de la cámara.
   ========================================================================== */
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

/* Empieza a pedir el módulo pesado en paralelo con el montaje de la interfaz.
   Sigue siendo una importación dinámica: si WebGL no existe, three no baja. */
const webglDisponible = !!document.querySelector('[data-hero]') && hayWebGL();
const escenaVidrioEnCarga = webglDisponible
  ? import('./hero-scene.js')
  : null;

/* El recorrido de la firma. Empieza grande en mitad de la pantalla, con el
   nombre debajo, y aterriza en la barra a su tamaño definitivo en el primer
   30% del recorrido de cámara. Viaja el mismo elemento que se queda, así que
   no hay traspaso de una copia grande a una pequeña: no hay costura que ver.

   Las medidas se toman del sitio final, no se inventan. Se mide dónde cae el
   monograma en la barra, se calcula dónde tiene que caer grande, y lo que se
   escribe cada fotograma es la resta de las dos. El aterrizaje es, por
   construcción, transformada cero. */
const ATERRIZAJE = 0.3;

function marcaPortada() {
  const marca = document.querySelector('[data-nav-marca]');
  const monograma = marca?.querySelector('[data-nav-monograma]');
  const prefijo = marca?.querySelector('[data-nav-prefijo]');
  const nucleo = marca?.querySelector('[data-nav-nucleo]');
  // La flecha cuelga del grupo, no del borde de la pantalla: pegada al canto
  // inferior quedaba sola y muy abajo; bajo el nombre se lee como parte de la
  // misma pieza y se ve mucho antes.
  const flecha = document.querySelector('[data-hero-flecha]');
  if (!marca || !monograma || !nucleo) return null;

  const suavizar = gsap.parseEase('power2.inOut');
  let plan = null;

  const medir = () => {
    plan = null;
    monograma.style.transform = '';
    if (prefijo) prefijo.style.transform = '';
    nucleo.style.transform = '';

    const anchoVista = window.innerWidth;
    const altoVista = window.innerHeight;
    const rLogo = monograma.getBoundingClientRect();
    const rPrefijo = prefijo?.getBoundingClientRect();
    const rNombre = nucleo.getBoundingClientRect();
    if (!rLogo.width || !rNombre.width) return;

    // El monograma grande se limita por los dos lados de la pantalla: en móvil
    // manda el ancho, en portátil apaisado manda el alto.
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
    // El bloque se centra un punto por encima de la mitad: ópticamente, un
    // grupo centrado geométricamente se lee bajo.
    const arriba = altoVista * 0.47 - (altoLogo + hueco + altoTexto) / 2;
    const eje = anchoVista / 2;

    plan = {
      logo: {
        dx: eje - (rLogo.left + rLogo.width / 2),
        dy: arriba + altoLogo / 2 - (rLogo.top + rLogo.height / 2),
        escala: escalaLogo,
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

  const aplicar = (p) => {
    if (!plan) medir();
    marca.classList.add('esta-medida');
    if (!plan) return;
    const q = suavizar(gsap.utils.clamp(0, 1, p / ATERRIZAJE));
    const k = 1 - q;
    escribir(monograma, plan.logo, k);
    if (prefijo && plan.prefijo) escribir(prefijo, plan.prefijo, k);
    escribir(nucleo, plan.nombre, k);
    marca.classList.toggle('ha-aterrizado', q >= 1);
  };

  // Estado final sin recorrido: sin WebGL, con movimiento reducido o si la
  // escena no llega a montarse, la marca es barra desde el primer momento.
  const rematar = () => {
    plan = null;
    monograma.style.transform = '';
    if (prefijo) prefijo.style.transform = '';
    nucleo.style.transform = '';
    marca.classList.add('esta-medida', 'ha-aterrizado');
    // Sin recorrido no hay grupo del que colgar: la flecha vuelve al pie de la
    // pantalla, que es donde la deja el CSS.
    if (flecha) {
      flecha.style.top = '';
      flecha.style.bottom = '';
    }
  };

  return { aplicar, medir, rematar };
}

/* La flecha del arranque. Se retira al primer gesto de scroll y vuelve si se
   regresa arriba del todo: es una indicación, no un adorno permanente.

   El aviso vive fuera de la función porque hay dos fuentes de scroll: Lenis
   cuando el visitante acepta movimiento, y el scroll nativo cuando no. */
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
    // 0 = fuera, 1 = dentro. El texto solo entra cuando el suelo de hormigón
    // ya está en cuadro: sobre el azul del vidrio el carbón no contrasta.
    copia.style.opacity = String(v);
    copia.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
    copia.setAttribute('aria-hidden', v < 0.05 ? 'true' : 'false');
  };

  // La bandera es positiva a propósito. Si la clase fuera «estoy sobre el
  // vidrio», el estado de partida —barra montada— sería el que se pinta antes
  // de que corra una sola línea de script, y en la portada eso son unos cuantos
  // fotogramas de barra completa antes de que la escena la retire.
  const aplicarNav = (sobreVidrio) => {
    cuerpo.classList.toggle('sobre-vidrio', sobreVidrio);
    cuerpo.classList.toggle('barra-montada', !sobreVidrio);
  };

  // Desenfoque del arranque: 16 px pegados al vidrio, cero al 26% del
  // recorrido. Pasado ese punto la clase se retira, así que no queda un
  // filtro compuesto activo durante el resto del scroll.
  const esmeriladoDe = gsap.utils.mapRange(0.26, 0, 0, 16);
  const aplicarEsmerilado = (p) => {
    const px = gsap.utils.clamp(0, 16, esmeriladoDe(p));
    canvas.classList.toggle('esta-esmerilado', px > 0.3);
    // El filtro puede extenderse hasta ~3 radios fuera de la caja. El zoom
    // cubre esa expansión sin dejar que el fondo claro se cuele por el borde.
    const ladoCorto = Math.max(1, Math.min(window.innerWidth, window.innerHeight));
    const zoom = 1 + (px * 6) / ladoCorto;
    canvas.style.setProperty('--hero-esmerilado-zoom', zoom.toFixed(4));
    if (px > 0.3) canvas.style.setProperty('--hero-esmerilado', `${px.toFixed(2)}px`);
  };

  if (!webglDisponible || movimientoReducido) {
    // Con movimiento reducido la escena se monta, pero fija en el plano final
    // y sin scrub. Sin WebGL no hay escena: el ambiente vuelve a hormigón para
    // que el texto del cuadro se lea, y no se descarga three.
    aplicarCopia(1);
    aplicarNav(false);
    marca?.rematar();
    if (!webglDisponible) {
      ambiente?.classList.add('es-hormigon');
      return;
    }
  }

  // La firma se coloca antes de pedir three: si la descarga tarda, el visitante
  // ve el cuadro que le corresponde y no la marca esperando en la esquina.
  if (!movimientoReducido) marca?.aplicar(0);

  /* Dinámica, no estática.
     Se probó estática para que three.js bajase en paralelo desde el primer
     viaje en lugar del quinto, y el efecto secundario fue peor que la mejora:
     con una importación estática NINGUNA línea de este módulo corre hasta que
     los 466 K de three están descargados y parseados. Durante esa ventana no
     existía el pin, el documento era corto, y el navegador restauraba el
     scroll anterior dejando al visitante en la sección siguiente.

     Una página sanitaria no puede depender de una librería de 3D para ser
     usable. La latencia de los dos viajes extra se compensa de sobra con lo
     que sí está en nuestra mano: mapas de luz diferidos, lienzos a un cuarto
     de resolución, entorno diferido y texturas de 384 K a 39 K. */
  let crearEscenaVidrio;
  try {
    ({ crearEscenaVidrio } = await escenaVidrioEnCarga);
  } catch {
    // Si three no llega, esto sigue siendo una página que hay que poder usar:
    // hormigón detrás, texto del cuadro visible y barra montada en su sitio.
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
      // El azul sigue por encima mientras terminan las tareas diferidas de la
      // escena. Se retira en alEscenaLista, no en este primer render parcial.
    },
    alEscenaLista() {
      // El fondo de carga se retira solo cuando el canvas ya tiene montadas
      // sus capas diferidas; la transición sigue siendo únicamente opacity.
      ambiente?.classList.add('esta-oculto');
    },
  });

  // En desarrollo el controlador queda accesible para poder fijar el progreso
  // a mano y comparar el plano final con la referencia.
  if (import.meta.env.DEV) window.__heroCtrl = escena;

  if (movimientoReducido) {
    escena.setProgreso(1);
    aplicarEsmerilado(1);
    marca?.rematar();
    return;
  }

  /* El texto entra tarde a propósito, y el momento está calculado, no elegido
     a ojo. El bloque de copia ocupa de v = 0.66 hacia abajo. Con la cámara
     retrocediendo por su recta, la base de la lámina central proyecta a
     v = 0.706 al 60% del recorrido y a v = 0.654 al 80%: hasta ahí el texto
     caería encima del vidrio, y carbón sobre petróleo es 2.01:1. Desde el 76%
     la franja inferior ya es hormigón, que da 14.29:1. */
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
      // El material y los enlaces entran cuando la firma ya está puesta: el
      // umbral es el mismo número, no dos parecidos.
      aplicarNav(p < ATERRIZAJE);
    },
    onRefreshInit() {
      aplicarCopia(0);
      aplicarNav(true);
    },
    // Las medidas de la barra cambian con el ancho y con las fuentes: el plan
    // de la firma se rehace en cada refresco y se vuelve a escribir el
    // fotograma que toca, para que un cambio de tamaño no dé un salto.
    onRefresh(self) {
      marca?.medir();
      marca?.aplicar(self.progress);
    },
  });

  aplicarCopia(0);
  aplicarNav(true);
  aplicarEsmerilado(0);
  marca?.aplicar(0);

  // En desarrollo se puede matar el pin para fijar el progreso a mano y
  // comparar el plano final con la referencia sin que el scroll lo pise.
  if (import.meta.env.DEV) {
    window.__heroST = st;
    window.__heroFijar = (p) => {
      st.kill(true); // revertir: quita el pin y el espaciador
      window.scrollTo(0, 0);
      escena.setProgreso(p);
      aplicarEsmerilado(p);
      aplicarCopia(p > 0.5 ? 1 : 0);
      marca?.aplicar(p);
      aplicarNav(p < ATERRIZAJE);
    };
    // Encuadre reproducible para comparar materiales con la referencia.
    const revision = new URLSearchParams(location.search).get('hero');
    if (revision !== null && Number.isFinite(Number(revision))) {
      window.__heroFijar(gsap.utils.clamp(0, 1, Number(revision)));
    }
  }
}

/* ==========================================================================
   3. Revelados. Un solo gesto, escalonado 60 ms.
   ========================================================================== */
function revelados() {
  const objetivos = document.querySelectorAll('[data-revelar]');
  // Señal de vida para el plazo de gracia de Base.astro: si esto no se pone,
  // la clase js se retira y todo el contenido vuelve a ser visible.
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

  // El escalonado se reparte por grupo, no por documento: así una sección
  // que entra tarde no arrastra un retardo de dos segundos.
  document.querySelectorAll('[data-revelar-grupo]').forEach((grupo) => {
    grupo.querySelectorAll('[data-revelar]').forEach((el, i) => {
      el.style.setProperty('--revelar-retardo', `${Math.min(i, 6) * 60}ms`);
    });
  });

  objetivos.forEach((el) => io.observe(el));
}

/* ==========================================================================
   4. Áreas. Índice fijo con estado activo, y el tinte del panel cambiando
      de densidad al pasar de un área a la siguiente: es la misma idea que
      las tres láminas, mirar lo mismo a través de otro cristal.
   ========================================================================== */
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

/* ==========================================================================
   6. Menú compacto. Disclosure real: aria-expanded, Escape, clic fuera y el
      foco vuelve al botón.
   ========================================================================== */
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

  // Al pasar a escritorio el conmutador desaparece: el panel no puede
  // quedarse abierto detrás de él.
  window.matchMedia('(min-width: 641px)').addEventListener('change', (e) => {
    if (e.matches) fijar(false);
  });
}

/* ==========================================================================
   Arranque
   ========================================================================== */
menu();
consentimiento();
scrollSuave();
flechaArranque();
primerCuadro();
revelados();
areas();

// Con las fuentes y las imágenes dentro, las medidas del pin cambian.
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener('load', () => ScrollTrigger.refresh());
