import { CANALES_HORMIGON, generarHormigon } from './hormigon.js';

self.onmessage = () => {
  const capas = CANALES_HORMIGON.map(([canal, semilla]) => generarHormigon(semilla, canal));
  self.postMessage(capas, capas.map((datos) => datos.buffer));
};
