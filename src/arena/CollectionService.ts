import _ from 'lodash';
import arena from './index';
import { Item, Hark } from '../models/item';
import { Resists, Chance } from './PlayerService';

interface WComb {
  harks?: Partial<Hark>;
  resists?: Partial<Resists>;
  chance?: Chance;
  hl: number;
  atk: number;
  prt: number;
  mgp: number;
}

const sets: Record<string, Partial<WComb>> = {
  coma: {
    harks: {
      wis: 3,
      int: 3,
    },
    hl: 10,
  },
  comaf: {
    harks: {
      wis: 10,
      int: 7,
    },
    hl: 20,
  },
  comi: {
    atk: 5,
    prt: 5,
  },
  comif: {
    atk: 10,
    prt: 10,
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
    atk: 25,
    chance: {
      fail: {
        paralysis: 40,
        madness: 40,
        glitch: 40,
      },
    },
  },
  comef: {
    atk: 50,
    chance: {
      fail: {
        paralysis: 80,
        madness: 80,
        glitch: 80,
      },
    },
  },
  comg: {
    mgp: 50,
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
    },
  },
  comgf: {
    mgp: 90,
    resists: {
      fire: 0.95,
      frost: 0.95,
      acid: 0.95,
      lighting: 0.95,
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
