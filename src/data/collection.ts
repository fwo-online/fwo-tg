import type { Collection } from '../models/inventory';

export const collections: Record<string, Collection> = {
  coma: {
    name: 'Малый астральный комплект',
    harks: {
      wis: 3,
      int: 3,
    },
    statical: {
      hl: { min: 0, max: 10 },
    },
  },
  comaf: {
    name: 'Полный астральный комплект',
    harks: {
      wis: 10,
      int: 7,
    },
    statical: {
      hl: { min: 0, max: 20 },
    },
  },
  comi: {
    name: 'Малый стальной комплект',
    statical: {
      atc: 5,
      prt: 5,
    },
  },
  comif: {
    name: 'Полный стальной комплект',
    statical: {
      atc: 10,
      prt: 10,
    },
  },
  comd: {
    name: 'Малый драконий комплект',
    resists: {
      fire: 0.9,
      frost: 0.85,
      acid: 0.85,
      lighting: 0.85,
    },
  },
  come: {
    name: 'Полный драконий комплект',
    chance: {
      fail: {
        paralysis: 40,
        madness: 40,
        glitch: 40,
      },
    },
    statical: {
      atc: 25,
    },
  },
  comef: {
    name: 'Полный эльфийский комплект',
    chance: {
      fail: {
        paralysis: 80,
        madness: 80,
        glitch: 80,
      },
    },
    statical: {
      atc: 50,
    },
  },
  comg: {
    name: 'Малый готический комплект',
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
    },
    statical: {
      mgp: 50,
    },
  },
  comgf: {
    name: 'Полный готический комплект',
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
    },
    statical: {
      mgp: 90,
    },
  },
  comh: {
    name: 'Малый хиппический комплект',
    resists: {
      physical: 0.9,
    },
    statical: {
      mga: 10,
    },
  },
  comhf: {
    name: 'Полный хиппический комплект',
    resists: {
      physical: 0.7,
    },
    statical: {
      mga: 10,
    },
  },
  comjf: {
    name: 'Комплект бога',
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
      physical: 0.95,
    },
    statical: {
      hl: { min: 0, max: 100 },
      atc: 25,
      prt: 25,
      mga: 25,
      mgp: 25,
      add_hp: 2,
    },
  },
  comk: {
    name: 'Малый призрачный комплект',
    statical: {
      add_en: 5,
      add_mp: 5,
    },
  },
  comkf: {
    name: 'Полный кожаный комплект',
    statical: {
      add_en: 10,
      add_mp: 10,
    },
  },
  coml: {
    name: 'Малый призрачный комплект',
    chance: {
      fail: {
        paralysis: 40,
        madness: 40,
        glitch: 40,
      },
    },
    statical: {
      atc: 15,
      mgp: 25,
    },
  },
  comlf: {
    name: 'Полный призрачный комплект',
    chance: {
      fail: {
        paralysis: 80,
        madness: 80,
        glitch: 80,
      },
    },
    statical: {
      atc: 25,
      mgp: 50,
    },
  },
  comm: {
    name: 'Малый механический комплект',
    harks: {
      str: 3,
      dex: 3,
    },
  },
  commf: {
    name: 'Полный механический комплект',
    harks: {
      str: 10,
      dex: 3,
    },
  },
  comn: {
    name: 'Малый митолический комплект',
    statical: {
      mga: 10,
      mgp: 10,
    },
  },
  comnf: {
    name: 'Полный митолический комплект',
    statical: {
      mga: 10,
      mgp: 20,
    },
  },
  comr: {
    name: 'Малый рыцарский комплект',
    statical: {
      atc: 20,
      add_hp: 5,
      add_en: 10,
    },
  },
  comrf: {
    name: 'Полный рыцарский комплект',
    statical: {
      atc: 40,
      add_hp: 10,
      add_en: 15,
    },
  },
  coms: {
    name: 'Малый самурайский комплект',
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
      physical: 0.95,
    },
    chance: {
      fail: {
        paralysis: 40,
      },
    },
  },
  comsf: {
    name: 'Полный самурайский комплект',
    resists: {
      fire: 0.90,
      frost: 0.90,
      acid: 0.90,
      lighting: 0.90,
      physical: 0.90,
    },
    chance: {
      fail: {
        paralysis: 80,
      },
    },
    statical: {
      add_hp: 3,
    },
  },
  comt: {
    name: 'Малый тролий комплект',
    harks: {
      str: 5,
      con: 5,
    },
    resists: {
      fire: 0.95,
      acid: 0.95,
    },
    statical: {
      add_hp: 3,
      add_en: 10,
      add_mp: 10,
    },
  },
  comtf: {
    name: 'Полный тролий комплект',
    harks: {
      str: 10,
      con: 10,
    },
    resists: {
      fire: 0.95,
      acid: 0.95,
    },
    statical: {
      add_hp: 5,
      add_en: 20,
      add_mp: 20,
      reg_mp: 2,
      reg_en: 2,
    },
  },
};
