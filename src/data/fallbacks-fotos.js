import childrenRoom from '../assets/photo/children-room.webp';
import mariaGarcia from '../assets/photo/maria-garcia.webp';
import officeCalm from '../assets/photo/office-calm.webp';
import officeDarkwood from '../assets/photo/office-darkwood.webp';
import officeFamily from '../assets/photo/office-family.webp';
import reception from '../assets/photo/reception.webp';
import waitingRoom from '../assets/photo/waiting-room.webp';

import childrenRoomOriginal from '../assets/photo/originales/children-room.png';
import mariaGarciaOriginal from '../assets/photo/originales/maria-garcia.jpeg';
import officeCalmOriginal from '../assets/photo/originales/office-calm.jpeg';
import officeDarkwoodOriginal from '../assets/photo/originales/office-darkwood.jpeg';
import officeFamilyOriginal from '../assets/photo/originales/office-family.jpeg';
import receptionOriginal from '../assets/photo/originales/reception.jpeg';
import waitingRoomOriginal from '../assets/photo/originales/waiting-room.jpeg';

// Each original supplies only the JPEG fallback for its existing WebP.
export const originalesPorWebp = new Map([
  [childrenRoom.src, childrenRoomOriginal],
  [mariaGarcia.src, mariaGarciaOriginal],
  [officeCalm.src, officeCalmOriginal],
  [officeDarkwood.src, officeDarkwoodOriginal],
  [officeFamily.src, officeFamilyOriginal],
  [reception.src, receptionOriginal],
  [waitingRoom.src, waitingRoomOriginal],
]);
