import {
  CanvasTexture,
  SRGBColorSpace,
  Color,
  ExtrudeGeometry,
  Mesh,
  MultiplyBlending,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Shape,
  Vector3,
} from 'three';

// Un bisel real separa el filo especular del volumen oscuro del canto.
// Las dimensiones exteriores se conservan, incluidas las del apoyo.
export function geometriaVidrio(ancho, alto, grosor) {
  const bisel = 0.003;
  const x = ancho / 2 - bisel;
  const y = alto / 2 - bisel;
  const perfil = new Shape();
  perfil.moveTo(-x, -y);
  perfil.lineTo(x, -y);
  perfil.lineTo(x, y);
  perfil.lineTo(-x, y);
  perfil.closePath();
  const geo = new ExtrudeGeometry(perfil, {
    depth: grosor - 2 * bisel,
    bevelEnabled: true,
    bevelSize: bisel,
    bevelThickness: bisel,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
    material: 0,
    extrudeMaterial: 1,
  });
  geo.translate(0, 0, -grosor / 2 + bisel);
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, p.getX(i) / ancho + 0.5, p.getY(i) / alto + 0.5);
  }
  // Distinguir las normales del bisel de las caras estrechas. El filo tiene
  // un recorrido óptico corto y conserva más luz que el núcleo del canto.
  const normales = geo.attributes.normal;
  const grupos = geo.groups.slice();
  geo.clearGroups();
  for (const grupo of grupos) {
    for (let i = grupo.start; i < grupo.start + grupo.count; i += 3) {
      const nz = Math.abs(normales.getZ(i));
      const material = grupo.materialIndex === 0 ? 0 : nz > 0.1 ? 2 : 1;
      const previo = geo.groups.at(-1);
      if (previo?.materialIndex === material) previo.count += 3;
      else geo.addGroup(i, 3, material);
    }
  }
  return geo;
}

// Canales independientes del albedo fotográfico. Semilla fija: el poro no
// cambia al recargar y no se confunde una mancha de color con un relieve.
export function microHormigon() {
  const N = 1024;
  const hacer = (semilla, canal) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = N;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.createImageData(N, N);
    let estado = semilla;
    const random = () => {
      estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
      return estado / 4294967296;
    };
    for (let i = 0; i < N * N; i++) {
      const grano = random();
      const poro = random() > 0.988 ? random() * 55 : 0;
      const v = canal === 'albedo' ? 205 + grano * 36 - poro
        : canal === 'rugosidad' ? 205 + grano * 44 : 116 + grano * 28 - poro;
      const j = i * 4;
      pixels.data[j] = pixels.data[j + 1] = pixels.data[j + 2] = v;
      pixels.data[j + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    const t = new CanvasTexture(canvas);
    if (canal === 'albedo') t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  return { albedo: hacer(5231, 'albedo'), altura: hacer(1709, 'altura'),
           rugosidad: hacer(8213, 'rugosidad') };
}

// Reflejo difuso aproximado sobre hormigón. Cada fragmento del suelo lanza
// un rayo de vista reflejado hacia los planos de vidrio; la huella cambia con
// la cámara y con el giro de cada hoja. No es un trazador de cáusticas.
// Los factores son cocientes de color de pantalla, no colores de albedo.
export function reflejosVidrio(laminas, direccionSol) {
  const centros = laminas.map((l) => new Vector3(l.x, 0, l.z));
  const ejes = laminas.map((l) => new Vector3(Math.cos(l.rotY), 0, -Math.sin(l.rotY)));
  const tamanos = laminas.map((l) => new Vector3(l.w, l.h, 0));
  const tintes = laminas.map((l) => new Color(l.suelo).convertLinearToSRGB());
  const material = new ShaderMaterial({
    uniforms: {
      centros: { value: centros },
      ejes: { value: ejes },
      tamanos: { value: tamanos },
      tintes: { value: tintes },
      luz: { value: direccionSol.clone().negate().normalize() },
    },
    vertexShader: `
      varying vec3 sueloWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        sueloWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform vec3 centros[3];
      uniform vec3 ejes[3];
      uniform vec3 tamanos[3];
      uniform vec3 tintes[3];
      uniform vec3 luz;
      varying vec3 sueloWorld;

      float huella(vec3 p, vec3 rayo, int i, bool reflejo) {
        vec3 normal = vec3(-ejes[i].z, 0.0, ejes[i].x);
        float den = dot(normal, rayo);
        if (abs(den) < 0.0001) return 0.0;
        float t = dot(normal, centros[i] - p) / den;
        if (t <= 0.0) return 0.0;
        vec3 hit = p + rayo * t - centros[i];
        float h = hit.y;
        float lateral = abs(dot(hit, ejes[i]));
        float blur = reflejo ? 0.075 + h * 0.55 : 0.04 + h * 0.14;
        float borde = 1.0 - smoothstep(tamanos[i].x * 0.5 - blur,
                                     tamanos[i].x * 0.5 + blur, lateral);
        float cima = 1.0 - smoothstep(tamanos[i].y - blur, tamanos[i].y + blur, h);
        float caida = reflejo ? exp(-h * 1.65) : exp(-h * 0.35);
        return borde * cima * caida;
      }

      void main() {
        vec3 p = vec3(sueloWorld.x, 0.0, sueloWorld.z);
        vec3 vista = normalize(vec3(p.x - cameraPosition.x, cameraPosition.y,
                                   p.z - cameraPosition.z));
        vec3 filtro = vec3(1.0);
        for (int i = 0; i < 3; i++) {
          vec3 local = p - centros[i];
          float s = clamp(dot(local, ejes[i]), -tamanos[i].x * 0.5, tamanos[i].x * 0.5);
          float distancia = length(local - ejes[i] * s);
          float contacto = exp(-pow(distancia / 0.048, 2.0)) * 0.24;
          float reflejo = huella(p, vista, i, true);
          // El lóbulo amplio aporta difusión, sin duplicar una mancha opaca.
          float difuso = (huella(p + vec3(0.13, 0.0, 0.08), vista, i, true)
                        + huella(p - vec3(0.13, 0.0, 0.08), vista, i, true)) * 0.5;
          float sombra = huella(p, luz, i, false) * 0.12;
          float densidad = clamp(reflejo * 0.96 + difuso * 0.2 + sombra, 0.0, 0.97);
          filtro *= mix(vec3(1.0), tintes[i], densidad);
          filtro *= 1.0 - contacto;
        }
        gl_FragColor = vec4(filtro, 1.0);
      }
    `,
    transparent: true,
    blending: MultiplyBlending,
    premultipliedAlpha: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
    toneMapped: false,
  });
  const malla = new Mesh(new PlaneGeometry(56, 56), material);
  malla.rotation.x = -Math.PI / 2;
  malla.position.set(0, 0.006, -14);
  malla.renderOrder = 5;
  return {
    malla,
    actualizar(indice, rotacion) {
      ejes[indice].set(Math.cos(rotacion), 0, -Math.sin(rotacion));
    },
  };
}
