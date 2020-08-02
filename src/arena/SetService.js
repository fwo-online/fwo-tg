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

    const combEntries = Object.keys(playerItemsByComb);
    const foundSet = combEntries.find((key) => {
      if (itemsByComb[key]) {
        return playerItemsByComb[key].length === itemsByComb[key].length;
      }
      return false;
    });

    if (foundSet) {
      const fullSet = combEntries.find((key) => {
        if (itemsByComb[key] && key.endsWith('f') && key.startsWith(foundSet)) {
          return playerItemsByComb[key].length === itemsByComb[key].length;
        }
        return false;
      });
      if (fullSet) {
        return sets[fullSet];
      }
      return sets[foundSet];
    }
    return {};
  }
}

module.exports = SetService;
