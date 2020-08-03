const _ = require('lodash');
const arena = require('./index');

const sets = {
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
  // ...
};
const groupByComb = (item) => item.wcomb && item.wcomb.split(',')[0];

class SetService {
  static getModifiers(inventory) {
    const items = inventory.map(({ code }) => arena.items[code]);
    const playerItemsByComb = _.groupBy(items, groupByComb);
    const itemsByComb = _.groupBy(arena.items, groupByComb);

    const playerSetKeys = Object.keys(playerItemsByComb);
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

module.exports = SetService;
