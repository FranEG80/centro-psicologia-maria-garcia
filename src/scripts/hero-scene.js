
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  FrontSide,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MultiplyBlending,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  Raycaster,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { geometriaVidrio, microHormigon, reflejosVidrio } from './hero-surfaces.js';

const PARED_Z = -23.9;
const PARED_W = 96;
const PARED_H = 36;
const LATERAL_X = 26;
const FRENTE_Z = 30;
const TECHO_Y = 21;

const CAMARA_Y = 1.62;
const CAIDA = 2.55 * (Math.PI / 180);
const FOV_INICIO = 38;
const FOV_FINAL = 32;

const SOL = new Vector3(-16, 20, -6);
const SOL_MIRA = new Vector3(1.5, 0, -13);
const SOL_DIR = SOL_MIRA.clone().sub(SOL);

const LAMINAS = [
  {
    x: -0.23,
    z: -15.14,
    w: 2.19,
    h: 2.94,
    rotY: 0.475,
    inclinacion: 0,
    transmision: [
      [0.92, 0xdbf0ff],
      [0.7, 0xe4f8ff],
      [0.5, 0xddf8ff],
      [0.3, 0xe6feff],
      [0.1, 0xb8cbd6],
    ],
    suelo: 0x5d909d,
    canto: 0x456d76,
    cantoLuz: 0xe5f8f8,
    brillo: 0.5,
  },
  {
    x: 1.79,
    z: -14.36,
    w: 3.287,
    h: 3.32,
    rotY: 0.9024,
    inclinacion: 0,
    transmision: [
      [0.92, 0x8ab4da],
      [0.7, 0x44a3eb],
      [0.5, 0x2f9ff6],
      [0.3, 0x1291ef],
      [0.1, 0x287191],
    ],
    suelo: 0x075b66,
    canto: 0x346673,
    cantoLuz: 0xd9fcff,
    brillo: 0.72,
  },
  {
    x: 3.77,
    z: -13.34,
    w: 2.419,
    h: 3.27,
    rotY: -0.974,
    inclinacion: 0,
    transmision: [
      [0.92, 0x9ec2e8],
      [0.7, 0x60a8e7],
      [0.5, 0x3f9cd7],
      [0.3, 0x1f84c7],
      [0.1, 0x186986],
    ],
    suelo: 0x285661,
    canto: 0x003447,
    cantoLuz: 0xb6e1f0,
    brillo: 0.86,
  },
];

const GROSOR = 0.064;
const CENTRAL = LAMINAS[1];

const HOVER_ACTIVO = !['false', '0', 'off'].includes(
  String(import.meta.env.PUBLIC_HERO_HOVER ?? '').toLowerCase()
);
const HOVER_GIRO = 0.088;
const HOVER_TAU = 190;
const HOVER_DESDE = 0.34;
const HOVER_HASTA = 0.62;

const ARRANQUE = new Vector3(CENTRAL.x, 1.4, CENTRAL.z + 0.55);
const ARRANQUE_Y = 1.4;
const ARRANQUE_MARGEN = 0.2;

const ROTULO_W = 8.16;
const ROTULO_X = 3.98;
const ROTULO_Y = 4.01;

const ROTULO = ['MARÍA', 'GARCÍA'];
const ROTULO_PESO = 600;
const ROTULO_TRACKING = -0.1;
const ROTULO_SOLAPE = 0.2;
const ROTULO_ALINEACION = ['izquierda', 'derecha'];
const ROTULO_SANGRIA = [0, 1];
const ROTULO_RELIEVE = 'hundido';
const ROTULO_TINTA = 0.62;

const ROTULO_BISEL = 0.014;

const ROTULO_CARA = 0.025;
const ROTULO_SOMBRA = 0.06;
const ROTULO_LUZ_F = 0.03;
const ROTULO_OPACIDAD = ROTULO_RELIEVE === 'plano' ? 0.5 : 1;
const ROTULO_ENTRADA = [
  [0.3, 0.6],
  [0.36, 0.66],
];

const lerp = (a, b, t) => a + (b - a) * t;
const MURO_LUZ = [247, 237, 224];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (min, max, v) => (v < min ? min : v > max ? max : v);
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

const lienzoAparte = (() => {
  const cache = [];
  return (i, w, h) => {
    const g = (cache[i] ||= document.createElement('canvas').getContext('2d'));
    g.canvas.width = w;
    g.canvas.height = h;
    return g;
  };
})();

function desenfocar(destino, radio, silueta, tinte) {
  const { width: W, height: H } = destino.canvas;

  const forma = lienzoAparte(0, W, H);
  silueta(forma);

  const fuera = W + radio * 6;
  const borron = lienzoAparte(1, W, H);
  borron.save();
  borron.shadowColor = '#000';
  borron.shadowBlur = radio * 2;
  borron.shadowOffsetX = fuera;
  borron.drawImage(forma.canvas, -fuera, 0);
  borron.restore();

  borron.globalCompositeOperation = 'source-in';
  if (typeof tinte === 'function') {
    borron.save();
    tinte(borron);
    borron.restore();
  } else {
    borron.fillStyle = tinte;
    borron.fillRect(0, 0, W, H);
  }

  destino.drawImage(borron.canvas, 0, 0);
}

function texturaEntorno() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');

  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, '#ffffff');
  v.addColorStop(0.32, '#faf6ee');
  v.addColorStop(0.5, '#e7e0d2');
  v.addColorStop(0.63, '#d0ccc3');
  v.addColorStop(1, '#a6a39b');
  g.fillStyle = v;
  g.fillRect(0, 0, 512, 256);

  const ventana = g.createRadialGradient(86, 66, 3, 86, 66, 105);
  ventana.addColorStop(0, 'rgba(255,255,255,1)');
  ventana.addColorStop(0.38, 'rgba(255,253,247,0.66)');
  ventana.addColorStop(1, 'rgba(255,251,243,0)');
  g.fillStyle = ventana;
  g.fillRect(0, 0, 512, 256);

  const rebote = g.createRadialGradient(371, 104, 3, 371, 104, 70);
  rebote.addColorStop(0, 'rgba(255,255,255,0.5)');
  rebote.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rebote;
  g.fillRect(0, 0, 512, 256);

  const t = new CanvasTexture(c);
  t.mapping = EquirectangularReflectionMapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

const fuenteRotulo = (px) =>
  `${ROTULO_PESO} ${px}px 'Host Grotesk', "Helvetica Neue", Helvetica, Arial, sans-serif`;

function componerRotulo(xMuro) {
  const FS = 200;

  const muro = tonoMuroEn(xMuro);
  const muroLocal = (f, a = 1) =>
    `rgba(${muro
      .map((v) => Math.round(Math.min(255, v * f)))
      .join(',')},${a})`;

  const medidor = document.createElement('canvas').getContext('2d');
  medidor.font = fuenteRotulo(FS);

  const avances = ROTULO.map((t) =>
    [...t].map((ch) => medidor.measureText(ch).width)
  );

  const TRACKING = ROTULO_TRACKING * FS;
  const PAD = Math.round(FS * 0.08);

  const ascenso = Math.max(
    ...ROTULO.map((t) => medidor.measureText(t).actualBoundingBoxAscent)
  );
  const H = Math.ceil(ascenso) + PAD * 2;

  const mayuscula = medidor.measureText('M').actualBoundingBoxAscent;

  const lineas = ROTULO.map((texto, i) => {
    const letras = [...texto];
    const ancho =
      avances[i].reduce((x, y) => x + y, 0) + TRACKING * (letras.length - 1);
    const W = Math.ceil(ancho) + PAD * 2;

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.clearRect(0, 0, W, H);

    const preparar = (ctx) => {
      ctx.font = fuenteRotulo(FS);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    };
    const glifos = (ctx, dx = 0, dy = 0) => {
      let x = PAD + dx;
      letras.forEach((ch, j) => {
        ctx.fillText(ch, x, H - PAD + dy);
        x += avances[i][j] + TRACKING;
      });
    };

    preparar(g);

    const cl = document.createElement('canvas');
    cl.width = W;
    cl.height = H;
    const gl = cl.getContext('2d');
    gl.clearRect(0, 0, W, H);
    preparar(gl);

    if (ROTULO_RELIEVE === 'hundido') {
      const bisel = Math.max(1, Math.round(ROTULO_BISEL * FS));
      const banda = (ctx, color, dx, dy) => {
        const s = document.createElement('canvas');
        s.width = W;
        s.height = H;
        const sg = s.getContext('2d');
        preparar(sg);
        sg.fillStyle = color;
        glifos(sg);
        sg.globalCompositeOperation = 'destination-out';
        sg.fillStyle = '#000';
        glifos(sg, dx, dy);
        ctx.drawImage(s, 0, 0);
      };

      g.fillStyle = `rgba(0,0,0,${ROTULO_CARA})`;
      glifos(g);

      desenfocar(
        g,
        bisel * 0.4,
        (s) => banda(s, '#000', bisel, bisel),
        `rgba(0,0,0,${ROTULO_SOMBRA})`
      );

      desenfocar(
        gl,
        bisel * 0.5,
        (s) => banda(s, '#000', -bisel, -bisel),
        muroLocal(ROTULO_LUZ_F)
      );
    } else {
      g.fillStyle = `rgba(255,254,250,${ROTULO_TINTA})`;
      glifos(g);
    }

    const textura = (lienzo) => {
      const t = new CanvasTexture(lienzo);
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    return {
      oscura: textura(c),
      clara: ROTULO_RELIEVE === 'hundido' ? textura(cl) : null,
      w: W,
      h: H,
      letra: ancho / letras.length,
    };
  });

  const escala = ROTULO_W / Math.max(...lineas.map((l) => l.w));
  const sep = mayuscula * (1 - ROTULO_SOLAPE) * escala;
  const alto = (ROTULO.length - 1) * sep + H * escala;
  const puestas = lineas.map((l, i) => ({
    ...l,
    y: ((ROTULO.length - 1) * sep) / 2 - i * sep,
  }));

  const colocadas = puestas.map((l, i) => {
    const w = l.w * escala;
    const dentro = ROTULO_W / 2 - w / 2;
    const anclada = ROTULO_ALINEACION[i] === 'derecha' ? dentro : -dentro;
    return {
      oscura: l.oscura,
      clara: l.clara,
      w,
      h: l.h * escala,
      x: anclada + ROTULO_SANGRIA[i] * l.letra * escala,
      y: l.y,
    };
  });

  const izquierda = Math.min(...colocadas.map((l) => l.x - l.w / 2));
  const derecha = Math.max(...colocadas.map((l) => l.x + l.w / 2));
  const centro = (izquierda + derecha) / 2;

  return {
    alto,
    ancho: derecha - izquierda,
    centro,
    lineas: colocadas.map((l) => ({ ...l, x: l.x - centro })),
  };
}

function texturaTransmitida(l) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 512);
  l.transmision.forEach(([altura, color]) =>
    v.addColorStop(1 - altura, hex(color))
  );
  g.fillStyle = v;
  g.fillRect(0, 0, 4, 512);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const MURO_TONO = [
  [-9.8, 0xa39a8d],
  [-8.1, 0xa39b8c],
  [-6.5, 0xaca596],
  [-1.6, 0xcec8bd],
  [0.0, 0xc6c0b3],
  [1.7, 0xbbb4a4],
  [3.3, 0xafa996],
  [5.0, 0xb2ac9d],
  [7.4, 0xafa797],
  [10.3, 0xaaa192],
];

function tonoMuroEn(x) {
  let a = MURO_TONO[0];
  let b = MURO_TONO[MURO_TONO.length - 1];
  for (let i = 0; i < MURO_TONO.length - 1; i++) {
    if (x >= MURO_TONO[i][0] && x <= MURO_TONO[i + 1][0]) {
      a = MURO_TONO[i];
      b = MURO_TONO[i + 1];
      break;
    }
  }
  const t = b[0] === a[0] ? 0 : clamp01((x - a[0]) / (b[0] - a[0]));
  const canal = (hex, k) => ((hex >> (16 - 8 * k)) & 255) / 255;
  return MURO_LUZ.map((v, k) => v * lerp(canal(a[1], k), canal(b[1], k), t));
}

const HAZ_A = { x: -21.7, y: 26.55 };
const HAZ_B = { x: 2.51, y: -8.8 };
const HAZ_ANCHO_A = 9.5;
const HAZ_ANCHO_B = 1.6;
const HAZ_DENTRO_A = 0xffffff;
const HAZ_DENTRO_B = 0xf3f0e8;

function texturaLuzPared() {
  const W = 1024;
  const H = Math.round((W * PARED_H) / PARED_W);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const px = (x) => ((x + PARED_W / 2) / PARED_W) * W;
  const py = (y) => ((PARED_H - y) / PARED_H) * H;
  const esc = W / PARED_W;

  const base = g.createLinearGradient(px(MURO_TONO[0][0]), 0, px(MURO_TONO.at(-1)[0]), 0);
  const x0 = MURO_TONO[0][0];
  const tramo = MURO_TONO.at(-1)[0] - x0;
  MURO_TONO.forEach(([x, color]) => base.addColorStop((x - x0) / tramo, hex(color)));
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  const ax = px(HAZ_A.x);
  const ay = py(HAZ_A.y);
  const bx = px(HAZ_B.x);
  const by = py(HAZ_B.y);
  const largo = Math.hypot(bx - ax, by - ay);
  const angulo = Math.atan2(by - ay, bx - ax);

  const largoRelleno = largo + 80;
  const aA = (HAZ_ANCHO_A * esc) / 2;
  const aB = (HAZ_ANCHO_B * esc) / 2;
  const dA = aA + ((aA - aB) * 40) / largo;
  const dB = aB - ((aA - aB) * 40) / largo;

  const encuadrar = (ctx) => {
    ctx.translate((ax + bx) / 2, (ay + by) / 2);
    ctx.rotate(angulo);
  };

  desenfocar(
    g,
    0.55 * esc,
    (s) => {
      encuadrar(s);
      s.beginPath();
      s.moveTo(-largoRelleno / 2, -dA);
      s.lineTo(largoRelleno / 2, -dB);
      s.lineTo(largoRelleno / 2, dB);
      s.lineTo(-largoRelleno / 2, dA);
      s.closePath();
      s.fill();
    },
    (s) => {
      encuadrar(s);
      const alo = s.createLinearGradient(
        -largoRelleno / 2,
        0,
        largoRelleno / 2,
        0
      );
      alo.addColorStop(0, hex(HAZ_DENTRO_A));
      alo.addColorStop(1, hex(HAZ_DENTRO_B));
      s.fillStyle = alo;
      const d = Math.hypot(W, H);
      s.fillRect(-d, -d, d * 2, d * 2);
    }
  );

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texturaSombraPared(luzPared) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 768;
  const g = c.getContext('2d');
  g.drawImage(luzPared.image, 0, 0, c.width, c.height);
  const luz = g.getImageData(0, 0, c.width, c.height).data;
  const pixels = g.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    const altura = PARED_H * (1 - (y + 0.5) / c.height);
    const vertical = Math.exp(-Math.pow(altura / 0.55, 2));
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const intensidad = (0.2126 * luz[i] + 0.7152 * luz[i + 1] + 0.0722 * luz[i + 2]) / 255;
      const t = clamp01((intensidad - 0.7) / 0.25);
      const penumbra = 1 - t * t * (3 - 2 * t);
      pixels.data[i + 3] = Math.round(
        255 * 0.11 * penumbra * vertical
      );
    }
  }
  g.putImageData(pixels, 0, 0);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function ejesSuelo(tam, centroZ, N) {
  return {
    px: (x) => ((x + tam / 2) / tam) * N,
    py: (z) => ((z - centroZ + tam / 2) / tam) * N,
    esc: N / tam,
  };
}

const N_SUELO = 1024;

const SOMBRA = 'rgba(60,48,26,';

function texturaFiltroSuelo(tam, centroZ) {
  const N = N_SUELO;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d');
  const e = ejesSuelo(tam, centroZ, N);

  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, N, N);

  const izquierda = g.createLinearGradient(e.px(-11), 0, e.px(-3.5), 0);
  izquierda.addColorStop(0, `${SOMBRA}0.34)`);
  izquierda.addColorStop(1, `${SOMBRA}0)`);
  g.fillStyle = izquierda;
  desenfocar(g, 1.1 * e.esc, (s) => {
    s.fillRect(0, 0, N, e.py(-13));
  }, (s) => {
    s.fillStyle = izquierda;
    s.fillRect(0, 0, N, N);
  });

  const derecha = g.createLinearGradient(e.px(1.2), 0, e.px(9.5), 0);
  derecha.addColorStop(0, `${SOMBRA}0)`);
  derecha.addColorStop(0.5, `${SOMBRA}0.14)`);
  derecha.addColorStop(1, `${SOMBRA}0.34)`);
  g.fillStyle = derecha;
  g.fillRect(0, 0, N, N);

  const cerca = g.createLinearGradient(0, e.py(-9), 0, e.py(-2));
  cerca.addColorStop(0, `${SOMBRA}0)`);
  cerca.addColorStop(1, `${SOMBRA}0.12)`);
  g.fillStyle = cerca;
  g.fillRect(0, e.py(-11), N, N);

  const haz = g.createRadialGradient(e.px(-2.4), e.py(-19), 0,
                                    e.px(-2.4), e.py(-19), 7 * e.esc);
  haz.addColorStop(0, 'rgba(255,253,247,0.88)');
  haz.addColorStop(0.35, 'rgba(255,253,247,0.58)');
  haz.addColorStop(1, 'rgba(255,253,247,0)');
  g.fillStyle = haz;
  g.fillRect(0, 0, N, N);

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function crearEscenaVidrio({ canvas, alPrimerFotograma, alEscenaLista }) {
  const revisionFija = import.meta.env.DEV && new URLSearchParams(location.search).has('hero');
  const movimientoReducido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const estrecho = window.matchMedia('(max-width: 820px)').matches;
  const modesto = (navigator.hardwareConcurrency || 8) <= 4 || estrecho;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  const DPR_OBJETIVO = modesto ? 1.3 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.38;

  const scene = new Scene();
  scene.background = new Color(0xf3eee4);
  const camera = new PerspectiveCamera(FOV_INICIO, 1.5, 0.02, 220);

  const cargador = new TextureLoader();

  const mapa = (url, rx, ry) => {
    const t = cargador.load(url, () => pedirFotograma());
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  const micro = microHormigon();
  const detalle = (textura, rx, ry) => {
    const t = textura.clone();
    t.repeat.set(rx, ry);
    return t;
  };
  const matPared = (color) =>
    new MeshStandardMaterial({
      map: detalle(micro.albedo, 12, 4.5),
      color,
      roughness: 0.96,
      roughnessMap: detalle(micro.rugosidad, 24, 9),
      bumpMap: detalle(micro.altura, 24, 9),
      bumpScale: 0.004,
      metalness: 0,
      envMapIntensity: 0.75,
    });

  const pared = new Mesh(new PlaneGeometry(PARED_W, PARED_H), matPared(0xfbfaf7));
  pared.position.set(0, PARED_H / 2, PARED_Z);
  scene.add(pared);

  const largoLateral = FRENTE_Z - PARED_Z;
  [-1, 1].forEach((s) => {
    const m = new Mesh(
      new PlaneGeometry(largoLateral, PARED_H),
      matPared(s < 0 ? 0xf1efeb : 0xebe9e5)
    );
    m.position.set(s * LATERAL_X, PARED_H / 2, PARED_Z + largoLateral / 2);
    m.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(m);
  });

  const frente = new Mesh(
    new PlaneGeometry(PARED_W, PARED_H),
    matPared(0xefedea)
  );
  frente.position.set(0, PARED_H / 2, FRENTE_Z);
  frente.rotation.y = Math.PI;
  scene.add(frente);

  const techo = new Mesh(
    new PlaneGeometry(PARED_W, largoLateral),
    matPared(0xfdfcfa)
  );
  techo.position.set(0, TECHO_Y, PARED_Z + largoLateral / 2);
  techo.rotation.x = Math.PI / 2;
  scene.add(techo);

  const suelo = new Mesh(
    new PlaneGeometry(220, 220),
    new MeshStandardMaterial({
      map: mapa('/media/tex/floor.webp', 42, 42),
      color: 0xf3ebde,
      roughness: 0.86,
      roughnessMap: detalle(micro.rugosidad, 55, 55),
      bumpMap: detalle(micro.altura, 55, 55),
      bumpScale: 0.003,
      metalness: 0,
      envMapIntensity: 0.42,
    })
  );
  suelo.rotation.x = -Math.PI / 2;
  scene.add(suelo);

  const TAM_SUELO = 56;
  const CENTRO_SUELO = -14;
  const desechables = [micro.albedo, micro.altura, micro.rugosidad];

  const planoLuz = (geo, mapa, extra = {}) =>
    new Mesh(
      geo,
      new MeshBasicMaterial({
        map: mapa,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        ...extra,
      })
    );

  const diferidas = [
    () => {
      const pmrem = new PMREMGenerator(renderer);
      const equirect = texturaEntorno();
      const entorno = pmrem.fromEquirectangular(equirect).texture;
      scene.environment = entorno;
      desechables.push(entorno);
      equirect.dispose();
      pmrem.dispose();
    },

    () => {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, DPR_OBJETIVO)
      );
      medir();
    },

    () => {
      construirRotulo();

      if (document.fonts?.load) {
        document.fonts.load("300 400px 'Host Grotesk'").then(() => {
          construirRotulo();
          pedirFotograma();
        });
      }
    },

    () => {
      const luzPared = planoLuz(
        pared.geometry,
        texturaLuzPared(),
        { blending: MultiplyBlending, premultipliedAlpha: true }
      );
      luzPared.name = 'Iluminación de pared — capa independiente';
      luzPared.position.copy(pared.position);
      scene.add(luzPared);

      const sombraPared = planoLuz(pared.geometry, texturaSombraPared(luzPared.material.map));
      sombraPared.name = 'Sombra suave de pared — capa independiente';
      sombraPared.position.copy(pared.position);
      sombraPared.renderOrder = 2;
      scene.add(sombraPared);
    },

    () => {
      const frente = CENTRO_SUELO + TAM_SUELO / 2;
      const largo = frente - PARED_Z;
      const geometriaLuzSuelo = new PlaneGeometry(TAM_SUELO, largo);
      const uv = geometriaLuzSuelo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setY(i, uv.getY(i) * largo / TAM_SUELO);
      }
      const filtroSuelo = planoLuz(
        geometriaLuzSuelo,
        texturaFiltroSuelo(TAM_SUELO, CENTRO_SUELO),
        { blending: MultiplyBlending, premultipliedAlpha: true }
      );
      filtroSuelo.name = 'Iluminación de suelo — capa independiente';
      filtroSuelo.rotation.x = -Math.PI / 2;
      filtroSuelo.position.set(0, 0, (frente + PARED_Z) / 2);
      filtroSuelo.renderOrder = 4;
      scene.add(filtroSuelo);
    },

  ];

  const rotulo = new Group();
  scene.add(rotulo);

  let rotuloAlto = 0;
  let rotuloAncho = ROTULO_W;
  let rotuloCentro = 0;

  function construirRotulo() {
    rotulo.children.slice().forEach((m) => {
      rotulo.remove(m);
      m.geometry.dispose();
      m.material.map?.dispose();
      m.material.dispose();
    });
    const compuesto = componerRotulo(rotulo.position.x || ROTULO_X);
    rotuloAlto = compuesto.alto;
    rotuloAncho = compuesto.ancho;
    rotuloCentro = compuesto.centro;
    compuesto.lineas.forEach((l, i) => {
      const poner = (textura, extra = {}) => {
        const m = planoLuz(new PlaneGeometry(l.w, l.h), textura, {
          opacity: 0,
          ...extra,
        });
        m.position.set(l.x, l.y, 0);
        m.userData.linea = i;
        rotulo.add(m);
        return m;
      };
      poner(l.oscura).userData.capa = 'oscura';
      if (l.clara) {
        poner(l.clara, { blending: AdditiveBlending }).userData.capa = 'clara';
      }
    });
    encuadrarRotulo(camera.aspect);
    actualizarRotulo(progreso);
  }

  const lineasRotulo = () =>
    rotulo.children.filter((m) => m.userData.capa !== 'clara');

  function encuadrarRotulo(aspecto) {
    if (!rotulo.children.length) return;

    const dist = finalPos.z - PARED_Z;
    const medioAncho = dist * aspecto * Math.tan((FOV_FINAL * Math.PI) / 360);
    const escala = Math.min(1, (medioAncho * 2 * 0.8) / rotuloAncho);
    const margen = medioAncho - (rotuloAncho * escala) / 2 - 0.3;
    const centro = ROTULO_X + rotuloCentro * escala;
    const x = clamp(finalPos.x - margen, finalPos.x + margen, centro);

    const cima = Math.max(...LAMINAS.map((l) => l.h));
    const y =
      x < centro - 0.05 ? cima + 0.5 + (rotuloAlto * escala) / 2 : ROTULO_Y;

    rotulo.scale.setScalar(escala);
    rotulo.position.set(x, y, PARED_Z + 0.35);
  }

  function actualizarRotulo(p) {
    rotulo.children.forEach((m) => {
      const i = m.userData.linea ?? 0;
      const [a, b] = ROTULO_ENTRADA[Math.min(i, ROTULO_ENTRADA.length - 1)];
      const t = clamp01((p - a) / (b - a));
      m.visible = t > 0;
      m.material.opacity = ROTULO_OPACIDAD * t * t * (3 - 2 * t);
    });
  }

  let escenaListaPendiente = false;
  function montarDiferidas() {
    while (diferidas.length) {
      diferidas.shift()();
    }
    escenaListaPendiente = true;
    pedirFotograma();
  }

  scene.add(new HemisphereLight(0xfffefd, 0xe4e0d8, 0.54));
  scene.add(new AmbientLight(0xfffcf6, 0.26));

  const sol = new DirectionalLight(0xfff9ee, 0.95);
  sol.position.copy(SOL);
  sol.target.position.copy(SOL_MIRA);
  scene.add(sol.target);
  scene.add(sol);

  const reflejos = reflejosVidrio(LAMINAS, SOL_DIR);
  scene.add(reflejos.malla);

  const suciedad = cargador.load('/media/tex/glass-smudge.webp', () =>
    pedirFotograma()
  );
  suciedad.wrapS = suciedad.wrapT = RepeatWrapping;
  suciedad.colorSpace = LinearSRGBColorSpace;

  const vidrios = new Group();
  scene.add(vidrios);

  const hojas = [];

  LAMINAS.forEach((l, i) => {
    const geo = geometriaVidrio(l.w, l.h, GROSOR);
    const transmitida = texturaTransmitida(l);
    desechables.push(transmitida);

    const colocar = (m) => {
      m.position.set(l.x, l.h / 2, l.z);
      m.rotation.set(l.inclinacion, l.rotY, 0);
      return m;
    };

    const cuerpo = new MeshBasicMaterial({
      map: transmitida,
      blending: MultiplyBlending,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
      toneMapped: false,
      side: FrontSide,
    });
    desechables.push(cuerpo);

    const canto = new MeshPhysicalMaterial({
      color: new Color(l.canto),
      roughness: 0.12,
      metalness: 0,
      ior: 1.5,
      clearcoat: 0,
      specularIntensity: 1,
      envMapIntensity: 0.85,
      side: FrontSide,
    });
    desechables.push(canto);

    const bisel = canto.clone();
    bisel.color.set(0xffffff);
    bisel.transmission = 1;
    bisel.thickness = GROSOR;
    bisel.attenuationColor.set(l.canto);
    bisel.attenuationDistance = 0.12;
    bisel.roughness = 0.09;
    bisel.envMapIntensity = 0.25;
    desechables.push(bisel);
    const malla = colocar(new Mesh(geo, [cuerpo, canto, bisel]));
    malla.renderOrder = 6 + i * 2;
    vidrios.add(malla);

    const brillo = colocar(
      new Mesh(
        new PlaneGeometry(l.w, l.h),
        new MeshPhysicalMaterial({
          color: 0x000000,
          roughness: 0.16,
          metalness: 0,
          specularIntensity: 1,
          envMapIntensity: 0.3 * l.brillo,
          iridescence: 0,
          iridescenceIOR: 1.32,
          iridescenceThicknessRange: [140, 460],
          transparent: true,
          toneMapped: false,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        })
      )
    );
    brillo.material.roughnessMap = suciedad;
    brillo.material.forceSinglePass = true;
    brillo.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = 0.13 + roughnessFactor * 1.8;`
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <colorspace_fragment>', '');
    };
    brillo.material.customProgramCacheKey = () => 'vidrio-especular-lineal-v2';
    brillo.renderOrder = 7 + i * 2;
    vidrios.add(brillo);

    hojas.push({ l, malla, mallas: [malla, brillo], actual: 0, objetivo: 0 });
  });

  const conRaton =
    HOVER_ACTIVO &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rayo = new Raycaster();
  const puntero = new Vector2();
  let punteroDentro = false;

  if (conRaton && !movimientoReducido) {
    const mover = (e) => {
      const caja = canvas.getBoundingClientRect();
      puntero.set(
        ((e.clientX - caja.left) / caja.width) * 2 - 1,
        -((e.clientY - caja.top) / caja.height) * 2 + 1
      );
      punteroDentro = true;
      pendiente = true;
    };
    const salir = () => {
      punteroDentro = false;
      pendiente = true;
    };
    const zona = canvas.closest('[data-hero-escenario]') || canvas;
    zona.addEventListener('pointermove', mover, { passive: true });
    zona.addEventListener('pointerleave', salir, { passive: true });
    zona.addEventListener('pointercancel', salir, { passive: true });
  }

  let ultimoT = 0;
  function girarHojas(p, t) {
    const dt = ultimoT ? Math.min(64, t - ultimoT) : 16;
    ultimoT = t;

    const amplitud =
      HOVER_GIRO * clamp01((p - HOVER_DESDE) / (HOVER_HASTA - HOVER_DESDE));

    let tocada = null;
    if (punteroDentro && amplitud > 0) {
      vidrios.updateMatrixWorld();
      rayo.setFromCamera(puntero, camera);
      const cortes = rayo.intersectObjects(
        hojas.map((h) => h.malla),
        false
      );
      if (cortes.length) tocada = cortes[0].object;
    }

    const k = 1 - Math.exp(-dt / HOVER_TAU);
    hojas.forEach((h, i) => {
      h.objetivo = h.malla === tocada ? -Math.sign(h.l.rotY) * amplitud : 0;
      h.actual += (h.objetivo - h.actual) * k;
      if (Math.abs(h.objetivo - h.actual) < 1e-5) h.actual = h.objetivo;
      const y = h.l.rotY + h.actual;
      h.mallas.forEach((m) => (m.rotation.y = y));
      reflejos.actualizar(i, y);
    });
  }

  let fovArranque = FOV_INICIO;
  const finalPos = new Vector3(0, CAMARA_Y, 0);
  const finalMira = new Vector3(0, 0, PARED_Z);
  const punto = new Vector3();
  const mira = new Vector3();

  function resolverArranque(aspecto) {
    const tope =
      (2 * Math.atan(Math.tan(((80 - 51.7) * Math.PI) / 180) / aspecto) * 180) /
      Math.PI;
    fovArranque = Math.max(FOV_FINAL, Math.min(FOV_INICIO, tope));

    const mediaAlto = (fovArranque * Math.PI) / 360;
    const mediaAncho = Math.atan(aspecto * Math.tan(mediaAlto));

    const normal = new Vector3(Math.sin(CENTRAL.rotY), 0, Math.cos(CENTRAL.rotY));
    const eje = new Vector3(Math.cos(CENTRAL.rotY), 0, -Math.sin(CENTRAL.rotY));
    const centro = new Vector3(CENTRAL.x, ARRANQUE_Y, CENTRAL.z);

    const frente = new Vector3(0, -Math.sin(CAIDA), -Math.cos(CAIDA));
    const derecha = new Vector3(1, 0, 0);
    const arriba = new Vector3().crossVectors(derecha, frente).normalize();

    const esquinas = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        esquinas.push(
          frente
            .clone()
            .addScaledVector(derecha, sx * Math.tan(mediaAncho))
            .addScaledVector(arriba, sy * Math.tan(mediaAlto))
            .normalize()
        );
      }
    }

    const limite = CENTRAL.w / 2 - ARRANQUE_MARGEN;
    const suelo = ARRANQUE_MARGEN;
    const techo = CENTRAL.h - ARRANQUE_MARGEN;
    const punto = new Vector3();

    const zDe = (dx, d) =>
      (d - dx * Math.sin(CENTRAL.rotY)) / Math.cos(CENTRAL.rotY);

    const evaluar = (dx, d) => {
      const cam = new Vector3(CENTRAL.x + dx, ARRANQUE_Y, CENTRAL.z + zDe(dx, d));
      const dPlano = cam.clone().sub(centro).dot(normal);
      let min = Infinity;
      let max = -Infinity;
      let dentro = true;
      for (const rayo of esquinas) {
        const den = -rayo.dot(normal);
        if (den <= 1e-4) return { dentro: false, min, max };
        const t = dPlano / den;
        if (t <= 0) return { dentro: false, min, max };
        punto.copy(cam).addScaledVector(rayo, t);
        const s = punto.clone().sub(centro).dot(eje);
        min = Math.min(min, s);
        max = Math.max(max, s);
        if (punto.y < suelo || punto.y > techo) dentro = false;
      }
      return { dentro, min, max };
    };

    const D_MIN = GROSOR / 2 + 0.18;
    let d = 0.34;
    let dx = 0;
    let mejor = null;

    for (let i = 0; i < 48; i++) {
      const a = evaluar(dx, d);
      if (!a.dentro) {
        if (d <= D_MIN) break;
        d = Math.max(D_MIN, d * 0.82);
        continue;
      }
      const medio = (a.min + a.max) / 2;
      if (Math.abs(medio) > 0.01) {
        const b = evaluar(dx + 0.02, d);
        const pendiente = b.dentro ? ((b.min + b.max) / 2 - medio) / 0.02 : 1;
        dx -= medio / (Math.abs(pendiente) < 1e-3 ? 1 : pendiente);
        continue;
      }
      if ((a.max - a.min) / 2 > limite) {
        if (d <= D_MIN) {
          mejor = { dx, d: D_MIN };
          break;
        }
        d = Math.max(D_MIN, d * 0.85);
        continue;
      }
      mejor = { dx, d };
      break;
    }

    if (!mejor) mejor = { dx: 0, d: D_MIN };

    ARRANQUE.set(
      CENTRAL.x + mejor.dx,
      ARRANQUE_Y,
      CENTRAL.z + zDe(mejor.dx, mejor.d)
    );
  }

  function resolverPlanoFinal(aspecto) {
    resolverArranque(aspecto);
    const medioFovH = Math.atan(aspecto * Math.tan((FOV_FINAL * Math.PI) / 360));
    const necesario = 3.45 / Math.tan(medioFovH);
    const z = Math.max(0, -14 + necesario);
    const x = z > 0 ? 1.75 * Math.min(1, z / 8) : 0;
    finalPos.set(x, CAMARA_Y + z * 0.02, z);
    const distPared = finalPos.z - PARED_Z;
    finalMira.set(x, finalPos.y - Math.tan(CAIDA) * distPared, PARED_Z);
    mira.copy(finalMira);
    encuadrarRotulo(aspecto);
  }

  let progreso = movimientoReducido ? 1 : 0;
  let pendiente = true;
  let visible = true;
  let vivo = true;
  let primero = true;
  let escenaPreparada = false;

  function colocarCamara(p, t) {
    const tt = Math.pow(clamp01(p), 0.8);

    actualizarRotulo(p);

    punto.lerpVectors(ARRANQUE, finalPos, tt);
    camera.position.copy(punto);

    if (!movimientoReducido && !revisionFija) {
      const amp = lerp(0.0015, 0.05, tt * tt);
      camera.position.x += Math.sin(t * 0.00021) * amp;
      camera.position.y += Math.cos(t * 0.00016) * amp * 0.55;
    }

    camera.rotation.set(-CAIDA, 0, 0);
    camera.fov = lerp(fovArranque, FOV_FINAL, tt);
    camera.updateProjectionMatrix();

    camera.updateMatrixWorld();
    girarHojas(p, t);
  }

  function medir() {
    const caja = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(caja.width));
    const h = Math.max(1, Math.round(caja.height));
    camera.aspect = w / h;
    resolverPlanoFinal(camera.aspect);
    renderer.setSize(w, h, false);
    pendiente = true;
  }

  function pedirFotograma() {
    pendiente = true;
  }

  function fotograma(t) {
    if (!vivo) return;
    requestAnimationFrame(fotograma);
    if (!visible) return;
    if (!pendiente && (movimientoReducido || !escenaPreparada)) return;

    colocarCamara(progreso, t);
    renderer.render(scene, camera);
    pendiente = false;

    if (escenaListaPendiente) {
      escenaListaPendiente = false;
      escenaPreparada = true;
      alEscenaLista?.();
    }

    if (primero) {
      primero = false;
      alPrimerFotograma?.();
      montarDiferidas();
    }
  }

  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(canvas);

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
    rootMargin: '160px',
  });
  io.observe(canvas);

  requestAnimationFrame(fotograma);

  if (import.meta.env.DEV) {
    const proyectar = (v3) => {
      const p = v3.clone().project(camera);
      return { u: +((p.x + 1) / 2).toFixed(4), v: +((1 - p.y) / 2).toFixed(4) };
    };
    const muestrear = (puntos) => {
      colocarCamara(progreso, performance.now());
      renderer.render(scene, camera);
      const gl = renderer.getContext();
      const w = renderer.domElement.width;
      const h = renderer.domElement.height;
      const buf = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      const leer = (u, v, r = 4) => {
        const cx = Math.round(u * (w - 1));
        const cy = Math.round((1 - v) * (h - 1));
        let R = 0;
        let G = 0;
        let B = 0;
        let n = 0;
        for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
          for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
            const i = (y * w + x) * 4;
            R += buf[i];
            G += buf[i + 1];
            B += buf[i + 2];
            n++;
          }
        }
        return [R / n, G / n, B / n].map(Math.round);
      };
      return Object.fromEntries(
        Object.entries(puntos).map(([k, [u, v]]) => {
          const c = leer(u, v);
          return [
            k,
            {
              hex: `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`,
              lum: Math.round(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]),
            },
          ];
        })
      );
    };

    window.__hero = {
      camera,
      rotulo,
      muestrear,
      referencia: {
        juntaParedSuelo: 0.542,
        bases: [0.61, 0.62, 0.635],
        cimas: [0.271, 0.217, 0.207],
        cantosU: [
          [0.407, 0.557],
          [0.57, 0.706],
          [0.755, 0.911],
        ],
        rotulo: { u: [0.495, 0.892], v: [0.054, 0.444] },
      },
      medir: () => {
        colocarCamara(progreso, performance.now());
        return {
          fov: +camera.fov.toFixed(2),
          aspecto: +camera.aspect.toFixed(3),
          camara: camera.position.toArray().map((v) => +v.toFixed(3)),
          caida: +(
            (Math.atan2(
              camera.position.y - mira.y,
              Math.hypot(camera.position.x - mira.x, camera.position.z - mira.z)
            ) *
              180) /
            Math.PI
          ).toFixed(2),
          juntaParedSuelo: proyectar(new Vector3(0, 0, PARED_Z)).v,
          laminas: LAMINAS.map((l) => {
            const dir = new Vector3(Math.cos(l.rotY), 0, -Math.sin(l.rotY));
            const iz = new Vector3(
              l.x - (dir.x * l.w) / 2,
              0,
              l.z - (dir.z * l.w) / 2
            );
            const de = new Vector3(
              l.x + (dir.x * l.w) / 2,
              0,
              l.z + (dir.z * l.w) / 2
            );
            return {
              base: proyectar(new Vector3(l.x, 0, l.z)).v,
              cima: proyectar(new Vector3(l.x, l.h, l.z)).v,
              u: [proyectar(iz).u, proyectar(de).u],
            };
          }),
          rotulo: {
            escala: +rotulo.scale.x.toFixed(3),
            centro: rotulo.position.toArray().map((v) => +v.toFixed(3)),
            lineas: lineasRotulo().map((m) => {
              const p = m.getWorldPosition(new Vector3());
              const mitad = (m.geometry.parameters.width * rotulo.scale.x) / 2;
              return {
                u: [
                  proyectar(new Vector3(p.x - mitad, p.y, PARED_Z)).u,
                  proyectar(new Vector3(p.x + mitad, p.y, PARED_Z)).u,
                ],
                v: proyectar(new Vector3(p.x, p.y, PARED_Z)).v,
                opacidad: +m.material.opacity.toFixed(3),
              };
            }),
          },
        };
      },
    };
  }

  return {
    setProgreso(p) {
      progreso = clamp01(p);
      pendiente = true;
    },
    destruir() {
      vivo = false;
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else if (m) {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        }
      });
      desechables.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
