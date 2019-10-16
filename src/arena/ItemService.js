/**
  * Items Service
  *
  * @description Набор функций для работы с вещами.
  * @module Service/Item
  */

module.exports = {
/**
  * @description Парсер hark itema
  * @param {Object} data параметры вещи из базы
  * @return {Object} обьект стандартизированных параметров вещи
  */
  itemAtrParser: (data) => {
  // eslint-disable-next-line consistent-return
    return JSON.parse(JSON.stringify(data), (key, value) => {
      const minmaxarr = [
        'hp_drain',
        'mp_drain',
        'en_drain',
        'hit',
        'fire',
        'acid',
        'lighting',
        'frost',
      ];
      // eslint-disable-next-line no-bitwise
      const isFound = ~minmaxarr.indexOf(key);
      if (((key === 'hark') || (key === 'plushark')) && (value !== '')) {
        return JSON.parse(value);
      }
      if ((isFound) && value) {
        const x = value.split(',');
        return ({
          min: x[0],
          max: x[1],
        });
      }
      if (value !== '') return value;
    });
  },
  /**
  * @param {String} nick
  * @param {Number} itemCode ID итема
  * @return {Boolean}
  *
  */
  harkCheck(nick, itemCode) {
  // функция проверяет проходит ли чар по харкам
  // проверку шмотки или нет
    const char = arena.players[nick];
    const item = arena.shop[itemCode];
    if ((char) && (item)) {
      for (const i in char.hrks) {
        if (char.hrks[i] < item.hark[i]) {
          return false;
        }
      }
      return true;
    }
  },
};
