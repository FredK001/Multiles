/* Lecture (CP) : la voix dit un son, une syllabe ou un petit mot ; l'enfant touche la bonne écriture parmi trois.
   Les intrus sont ceux qu'on confond au CP : lettres en miroir (b/d, p/q), voisines (m/n), syllabe à l'envers (la/al).
   Jamais deux écritures qui se prononcent pareil (et/est, an/en, mais/mes) : la voix ne pourrait pas les départager.
   Une île = une étape de l'apprentissage : voyelles, syllabes simples, sons de deux lettres, petits mots. */

export type ReadId = 'voy' | 'syl1' | 'syl2' | 'sons' | 'mots';

export interface ReadItem {
  /** Ce qui est écrit sur le bon bouton. */
  w: string;
  /** Les deux intrus. */
  x: readonly [string, string];
  /** Ce que lit la voix, si l'écriture seule se lit mal (« e » → « eu »). */
  say?: string;
}

export interface ReadSet {
  id: ReadId;
  title: string;
  items: readonly ReadItem[];
}

const r = (w: string, x1: string, x2: string, say?: string): ReadItem => ({ w, x: [x1, x2], ...(say ? { say } : {}) });

export const READ_SETS: readonly ReadSet[] = [
  {
    id: 'voy', title: 'Les voyelles',
    items: [
      r('a', 'o', 'e'), r('i', 'l', 'u'), r('o', 'a', 'u'), r('u', 'n', 'o'), r('é', 'e', 'a', 'é'), r('e', 'é', 'a', 'euh'),
      r('ou', 'on', 'u'), r('y', 'v', 'u', 'i'), r('au', 'ou', 'an', 'oh'),
    ],
  },
  {
    id: 'syl1', title: 'la, mi, ro…',
    items: [
      r('la', 'al', 'le'), r('li', 'il', 'lu'), r('lo', 'ol', 'la'), r('ma', 'na', 'am'), r('mi', 'ni', 'im'), r('mo', 'no', 'om'),
      r('ra', 'ar', 'na'), r('ri', 'ir', 'ru'), r('ro', 'or', 'ra'), r('sa', 'za', 'as'), r('si', 'is', 'su'), r('so', 'os', 'sa'),
      r('lu', 'ul', 'lo'), r('mu', 'nu', 'um'), r('ru', 'ur', 'ri'), r('su', 'us', 'si'),
    ],
  },
  {
    id: 'syl2', title: 'pa, to, di…',
    items: [
      r('pa', 'ga', 'ba'), r('pi', 'bi', 'ip'), r('po', 'bo', 'op'), r('ta', 'at', 'da'), r('ti', 'it', 'di'), r('to', 'ot', 'do'),
      r('da', 'ba', 'ad'), r('di', 'bi', 'id'), r('do', 'bo', 'od'), r('ba', 'da', 'pa'), r('bi', 'di', 'pi'), r('bo', 'do', 'po'),
      r('na', 'ma', 'an'), r('ni', 'mi', 'in'), r('fa', 'va', 'af'), r('vo', 'fo', 'ov'),
    ],
  },
  {
    id: 'sons', title: 'ou, on, an, ch…',
    items: [
      r('ou', 'on', 'au', 'ou'), r('on', 'ou', 'an', 'on'), r('an', 'on', 'in', 'an'), r('in', 'an', 'on', 'hein'), r('oi', 'io', 'on', 'oi'),
      r('ch', 'c', 'j', 'che'), r('chat', 'chou', 'char', 'chat'), r('loup', 'lion', 'long', 'loup'), r('moi', 'mon', 'mou', 'moi'),
      r('lapin', 'lampe', 'lavant', 'lapin'), r('maman', 'manon', 'mamie', 'maman'), r('mouton', 'monton', 'moutan', 'mouton'),
    ],
  },
  {
    id: 'mots', title: 'Les petits mots',
    items: [
      r('le', 'la', 'les'), r('un', 'une', 'on'), r('et', 'en', 'te'), r('il', 'li', 'elle'), r('elle', 'il', 'les'), r('les', 'des', 'le'),
      r('des', 'les', 'de'), r('dans', 'des', 'sans'), r('avec', 'aussi', 'avant'), r('mais', 'moi', 'mon'), r('pour', 'par', 'peur'),
      r('sur', 'sous', 'sœur'), r('une', 'un', 'lune'),
    ],
  },
];

export const readSetOf = (id: ReadId): ReadSet => READ_SETS.find((s) => s.id === id)!;

/** Ce que dit la voix pour un élément. */
export const sayOf = (it: ReadItem): string => it.say ?? it.w;

/** Éléments d'une étape : 0 = première moitié, 1 = seconde moitié, null ou 2 = tous. */
export function stepReadItems(s: ReadSet, step: number | null): readonly ReadItem[] {
  const half = Math.ceil(s.items.length / 2);
  return step === 0 ? s.items.slice(0, half) : step === 1 ? s.items.slice(half) : s.items;
}
