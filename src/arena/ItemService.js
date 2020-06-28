const _ = require('lodash');
const arena = require('./index');
const { mono } = require('./MiscService');
/**
 * Items Service
 *
 * @description Набор функций для работы с вещами.
 * @module Service/Item
 */

const itemToCharHark = {
  s: 'str',
  d: 'dex',
  w: 'wis',
  i: 'int',
  c: 'con',
};

const attrNames = {
  name: 'Название',
  atc: 'Атака',
  prt: 'Защита',
  price: 'Цена',
  race: 'Раса',
  weight: 'Вес',
  hark: {
    s: 'Сила',
    d: 'Ловкость',
    w: 'Мудрость',
    i: 'Интеллект',
    c: 'Телосложение',
  },
  plushark: {
    s: 'Сила',
    d: 'Ловкость',
    w: 'Мудрость',
    i: 'Интеллект',
    c: 'Телосложение',
  },
  mga: 'Магическая атака',
  mgp: 'Магическая защита',
  hl: 'Эффективность лечения',
  r_fire: '🔥 Защита от огня',
  r_acid: '🧪 Защита от яда',
  r_lighting: '⚡️ Защита от молнии',
  r_frost: '❄️ Защита от холода',
  r_physical: 'Физическая защита',
  descr: 'Описание',
  add_hp: 'Здоровье',
  add_mp: 'Мана',
  add_en: 'Энергия',
  reg_hp: 'Восстановление здоровья',
  reg_en: 'Восстановление энергии',
  reg_mp: 'Восстановление маны',
  hp_drain: 'Похищение здоровья',
  mp_drain: 'Похищение маны',
  en_drain: 'Похищение энергии',
  type: 'Тип',
  hit: 'Удар',
  edinahp: '',
  eff: '',
  '2handed': 'Двуручное',
  fire: '🔥 Урон огнём',
  acid: '🧪 Урон ядом',
  lighting: '⚡️ Урон молнией',
  frost: '❄️ Урон холодом',
};

const getRequiredHark = (char, value, key) => {
  const name = attrNames.hark[key];
  const hark = itemToCharHark[key];
  const pointToPutOn = char.harks[hark] - value;
  const canPutOn = pointToPutOn <= 0;
  return `\t\t${canPutOn ? '❗️' : '✅'} ${name}: ${value} ${canPutOn ? `(${pointToPutOn})` : ''}`;
};

const getPlusHark = (value, key) => {
  if (value > 0) {
    return `\t\t➕ ${attrNames.hark[key]}: ${value}`;
  }
  return '';
};

const getAdditionalDamage = (item) => {
  const elementMessage = (key) => {
    const value = item[key];
    if (value) {
      if (typeof value === 'object') {
        return `\t\t➕ ${attrNames[key]}: ${value.min}-${value.max}`;
      }
      return `\t\t➕ ${attrNames[key]}: ${value}`;
    }
    return '';
  };

  return [
    'fire',
    'acid',
    'lighting',
    'frost',

    'r_fire',
    'r_acid',
    'r_lighting',
    'r_frost',
    'r_physical',

    'add_hp',
    'add_mp',
    'add_en',

    'reg_hp',
    'reg_en',
    'reg_mp',

    'hp_drain',
    'mp_drain',
    'en_drain',
  ].map(elementMessage).filter((x) => x).join('\n');
};

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
      `${i.name} ${i.price ? `(💰 ${i.price})` : ''}`,
      i.descr && `\n${i.descr}\n`,
      i.atc && mono(`  🗡 Атака: ${i.atc}`),
      i.hit && mono(`  ⚔️ Удар: ${i.hit.min}-${i.hit.max}`),
      i.prt && mono(`  🛡 Защита: ${i.prt}`),

      i.hark && `\n👤 Требуемые характеристики:\n${mono(
        _.map(i.hark, (val, key) => getRequiredHark(char, val, key)).join('\n'),
      )}\n`,

      '↗️ Дополнительные характеристики:',
      i.plushark && `${mono(
        _.map(i.plushark, getPlusHark).filter((x) => x).join('\n'),
      )}\n`,

      mono(`${getAdditionalDamage(i)}`),

      i.weight && `\nВес: ${i.weight} кг`,
    ]
      .filter((currentItem) => currentItem)
      .join('\n');
  },
};
