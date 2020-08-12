import _ from 'lodash';
import arena from './index';
import { Item, Hark } from '../models/item';
import { Resists, Chance, Statical } from './PlayerService';

interface WComb {
  harks?: Partial<Hark>;
  resists?: Partial<Resists>;
  chance?: Chance;
  statical?: Partial<Statical>;
}

const sets: Record<string, Partial<WComb>> = {
  coma: {
    harks: {
      wis: 3,
      int: 3,
    },
    statical: {
      hl: { min: 0, max: 10 },
    },
  },
  comaf: {
    harks: {
      wis: 10,
      int: 7,
    },
    statical: {
      hl: { min: 0, max: 20 },
    },
  },
  comi: {
    statical: {
      atc: 5,
      prt: 5,
    },
  },
  comif: {
    statical: {
      atc: 10,
      prt: 10,
    },
  },
  comd: {
    resists: {
      fire: 0.9,
      frost: 0.85,
      acid: 0.85,
      lighting: 0.85,
    },
  },
  come: {
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
  // ...
};

const groupByComb = (item: Item) => {
  const key = item.wcomb.split(',')[0];
  if (sets[key]) {
    return key;
  }
  return undefined;
};

class CollectionService {
  static getCollectionStats(inventory): Partial<WComb> {
    const items: Item[] = inventory.map(({ code }) => arena.items[code]);
    const playerItemsByComb = _.groupBy(items, groupByComb);
    const itemsByComb = _.groupBy(arena.items, groupByComb);

    const playerSetKeys: Array<keyof typeof sets> = Object.keys(playerItemsByComb);
    const [fullSets, smallSets] = _.partition(playerSetKeys, (key) => key.endsWith('f'));

    const foundSmallSet = smallSets.find((key) => {
      if (itemsByComb[key]) {
        return playerItemsByComb[key].length === itemsByComb[key].length;
      }
      return false;
    });

    if (foundSmallSet) {
      const foundFullSet = fullSets.find((key) => {
        if (itemsByComb[key] && key.startsWith(foundSmallSet)) {
          return playerItemsByComb[key].length === itemsByComb[key].length;
        }
        return false;
      });

      if (foundFullSet) {
        return sets[foundFullSet];
      }
      return sets[foundSmallSet];
    }
    return {};
  }
}

export default CollectionService;
