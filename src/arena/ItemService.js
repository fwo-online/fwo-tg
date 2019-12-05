const arena = require('./index');
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
  itemAtrParser: (data) =>
  // eslint-disable-next-line consistent-return, implicit-arrow-linebreak
    JSON.parse(JSON.stringify(data), (key, value) => {
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
    }),
  /**
   * @param {String} nick
   * @param {Number} itemCode ID итема
   * @return {Boolean}
   *
   */
  // eslint-disable-next-line consistent-return
  harkCheck(nick, itemCode) {
    // функция проверяет проходит ли чар по харкам
    // проверку шмотки или нет
    const char = arena.players[nick];
    const item = arena.shop[itemCode];
    if ((char) && (item)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const i in char.hrks) {
        if (char.hrks[i] < item.hark[i]) {
          return false;
        }
      }
      return true;
    }
  },

  itemDescription(char, item) {
    const i = this.itemAtrParser(item);

    return [
      `${item.name} ${item.price ? `(💰 ${item.price})` : ''}`,
      item.descr && `\n${item.descr}\n`,
      i.atc && `🗡 Атака: ${i.atc}`,
      i.hit && `⚔️ Удар: ${i.hit.min}-${i.hit.max}`,
      i.prt && `🛡 Защита: ${i.prt}`,
      i.hark && `\n👤 Требуемые характеристики:
      ${i.hark.s > char.harks.str ? '❗️' : '✅'} Сила: ${i.hark.s} ${i.hark.s > char.harks.str
  ? `(${char.harks.str - i.hark.s})` : ''}
      ${i.hark.d > char.harks.dex ? '❗️' : '✅'} Ловкость:  ${i.hark.d} ${i.hark.d > char.harks.dex
  ? `(${char.harks.dex - i.hark.d})` : ''}
      ${i.hark.w > char.harks.wis ? '❗️' : '✅'} Мудрость:  ${i.hark.w} ${i.hark.w > char.harks.wis
  ? `(${char.harks.wis - i.hark.w})` : ''}
      ${i.hark.i > char.harks.int ? '❗️' : '✅'} Интелект:  ${i.hark.i} ${i.hark.i > char.harks.int
  ? `(${char.harks.int - i.hark.i})` : ''}
      ${i.hark.c > char.harks.con ? '❗️' : '✅'} Телосложение:  ${i.hark.c} ${i.hark.c > char.harks.con
  ? `(${char.harks.con - i.hark.c})` : ''}\n`,
      item.weight && `Вес ${item.weight} кг`,
    ]
      .filter((currentItem) => currentItem)
      .join('\n');
  },
};
