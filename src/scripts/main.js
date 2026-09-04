import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  lenis.on('scroll', ScrollTrigger.update);
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

async function primerCuadro() {
  const seccion = document.querySelector('[data-hero]');
  if (!seccion) return;

  const escenario = seccion.querySelector('[data-hero-escenario]');
  const canvas = seccion.querySelector('[data-hero-canvas]');
  const ambiente = seccion.querySelector('[data-hero-ambiente]');
  const copia = seccion.querySelector('[data-hero-copia]');
  const cuerpo = document.body;

  const aplicarCopia = (v) => {
    // 0 = fuera, 1 = dentro. El texto solo entra cuando el suelo de hormigón
    // ya está en cuadro: sobre el azul del vidrio el carbón no contrasta.
    copia.style.opacity = String(v);
    copia.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
    copia.setAttribute('aria-hidden', v < 0.05 ? 'true' : 'false');
  };

  const aplicarNav = (sobreVidrio) => {
    cuerpo.classList.toggle('sobre-vidrio', sobreVidrio);
  };

  // Desenfoque del arranque: 16 px pegados al vidrio, cero al 26% del
  // recorrido. Pasado ese punto la clase se retira, así que no queda un
  // filtro compuesto activo durante el resto del scroll.
  const esmeriladoDe = gsap.utils.mapRange(0.26, 0, 0, 16);
  const aplicarEsmerilado = (p) => {
    const px = gsap.utils.clamp(0, 16, esmeriladoDe(p));
    canvas.classList.toggle('esta-esmerilado', px > 0.3);
    if (px > 0.3) canvas.style.setProperty('--hero-esmerilado', `${px.toFixed(2)}px`);
  };

  if (!hayWebGL() || movimientoReducido) {
    // Con movimiento reducido la escena se monta, pero fija en el plano final
    // y sin scrub. Sin WebGL no hay escena: el ambiente vuelve a hormigón para
    // que el texto del cuadro se lea, y no se descarga three.
    aplicarCopia(1);
    aplicarNav(false);
    if (!hayWebGL()) {
      ambiente?.classList.add('es-hormigon');
      return;
    }
  }

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
  const { crearEscenaVidrio } = await import('./hero-scene.js');
  const escena = crearEscenaVidrio({
    canvas,
    alPrimerFotograma() {
      canvas.classList.add('esta-listo');
      // El sustituto se apaga en cuanto el lienzo pinta. Como el gradiente es
      // el mismo color del primer fotograma, el cambio no se ve.
      ambiente?.classList.add('esta-oculto');
    },
  });

  // En desarrollo el controlador queda accesible para poder fijar el progreso
  // a mano y comparar el plano final con la referencia.
  if (import.meta.env.DEV) window.__heroCtrl = escena;

  if (movimientoReducido) {
    escena.setProgreso(1);
    aplicarEsmerilado(1);
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
      aplicarNav(p < 0.32);
    },
    onRefreshInit() {
      aplicarCopia(0);
      aplicarNav(true);
    },
  });

  aplicarCopia(0);
  aplicarNav(true);
  aplicarEsmerilado(0);

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
      aplicarNav(p < 0.32);
    };
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
scrollSuave();
primerCuadro();
revelados();
areas();

// Con las fuentes y las imágenes dentro, las medidas del pin cambian.
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener('load', () => ScrollTrigger.refresh());
