// Mezcla `sobre` encima de `base` sin mutar ninguno. Los objetos planos se
// fusionan en profundidad; todo lo demás (cadenas, listas, imágenes importadas
// que solo están en `base`) se toma tal cual. Sirve para que una traducción
// declare únicamente los textos y herede fotos, ids y enlaces del español.
const plano = (v) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

export function fusiona(base, sobre) {
  if (sobre === undefined) return base;
  if (!plano(base) || !plano(sobre)) return sobre;

  const resultado = { ...base };
  for (const [clave, valor] of Object.entries(sobre)) {
    resultado[clave] = fusiona(base[clave], valor);
  }
  return resultado;
}
