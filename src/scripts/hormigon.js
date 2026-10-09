// Ruido del microhormigón: gris opaco, un juego por canal. Lo calcula
// hormigon.worker.js; este módulo no toca el DOM para poder usarse en los dos
// lados.

export const LADO_HORMIGON = 1024;

export const CANALES_HORMIGON = [
  ['albedo', 5231],
  ['altura', 1709],
  ['rugosidad', 8213],
];

// Las filas se escriben de abajo arriba, que es como WebGL lee una
// DataTexture (sin flipY): el grano cae donde caía cuando salía de un canvas.
export function generarHormigon(semilla, canal, N = LADO_HORMIGON) {
  const datos = new Uint8ClampedArray(N * N * 4);
  let estado = semilla;
  const random = () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
  for (let y = 0; y < N; y++) {
    let j = (N - 1 - y) * N * 4;
    for (let x = 0; x < N; x++, j += 4) {
      const grano = random();
      const poro = random() > 0.988 ? random() * 55 : 0;
      const v = canal === 'albedo' ? 205 + grano * 36 - poro
        : canal === 'rugosidad' ? 205 + grano * 44 : 116 + grano * 28 - poro;
      datos[j] = datos[j + 1] = datos[j + 2] = v;
      datos[j + 3] = 255;
    }
  }
  return datos;
}
