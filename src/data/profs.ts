import type { Harks } from '.';

export const profsList = ['m', 'w', 'p', 'l'] as const;

export type Prof = typeof profsList[number];

export type ProfsLvl = Partial<Record<Prof, number>>;

type ProfItem = {
  hark: Harks.HarksLvl;
  descr: string;
  name: string;
  icon: string;
  mag?: Record<string, number>;
}

export const profsData: Record<Prof, ProfItem> = {
  w: {
    hark: {
      str: 10, dex: 8, int: 3, wis: 3, con: 6,
    },
    descr: 'стронг',
    name: 'Воин',
    icon: '🛡',
  },
  l: {
    hark: {
      str: 3, dex: 8, int: 10, wis: 3, con: 6,
    },
    descr: 'ахуенный',
    name: 'Лучник',
    icon: '🏹',
  },
  m: {
    hark: {
      str: 3, dex: 3, int: 8, wis: 10, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
    descr: 'волшебный',
    name: 'Маг',
    icon: '🔮',
  },
  p: {
    hark: {
      str: 3, dex: 3, int: 10, wis: 8, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
    descr: 'хилит',
    name: 'Лекарь',
    icon: '♱',
  },
};
