const { default: arena } = require('./index');

/**
 * @description Просто мусорка с кастомными функциями
 * @module Service/Misc
 */
/**
 * @typedef {Object} weaponType
 * @property {string} name
 * @property {Boolean} dodge
 * @property {function} action
 */
/** @type {Object.<string, weaponType>} */
const WEAPON_TYPES = {
  s: {
    name: 'колющее',
    dodge: true,
    action: (target, weapon) => `вонзил _${weapon.name}_ в *${target}*`,
  },
  c: {
    name: 'режущее',
    dodge: true,
    action: (target, weapon) => `пустил кровь *${target}* с помощью _${weapon.name}_`,
  },
  h: {
    name: 'рубящее',
    dodge: true,
    action: (target, weapon) => `рубанул *${target}* _${weapon.case}_`,
  },
  g: {
    name: 'лечащее',
    dodge: false,
    action: (target, weapon) => `вонзил _${weapon.name}_ в *${target}*`,
  },
  l: {
    name: 'метательное',
    dodge: true,
    action: (target, weapon) => `швырнул в *${target}* _${weapon.case}_`,
  },
  m: {
    name: 'дальнобойное',
    dodge: false,
    action: (target, weapon) => `стрельнул в *${target}* _${weapon.case}_`,
  },
  f: {
    name: 'зажигательное',
    dodge: false,
    action: (target, weapon) => `обжег *${target}* с помощью _${weapon.case}_`,
  },
  d: {
    name: 'оглушающее',
    dodge: true,
    action: (target, weapon) => `дал по башке *${target}* _${weapon.case}_`,
  },
  r: {
    name: 'спецоружие',
    dodge: false,
    action: (target, weapon) => `атаковал *${target}* _${weapon.case}_`,
  },
};
/**
 * Константа дефотлный параметров професcий при создание чара
 */
const STORES = {
  a: 'Пр.рука',
  b: 'Лв.рука',
  c: 'Тело',
  d: 'Голова',
  e: 'Ноги',
  f: 'Пояс',
  h: 'Пр.запястье',
  i: 'Лв.запястье',
  j: 'Плечи',
  k: 'Пр.больш.палец',
  l: 'Пр.указ.палец',
  m: 'Пр.сред.палец',
  n: 'Пр.безым.палец',
  o: 'Пр.мизинец',
  p: 'Лв.больш.палец',
  r: 'Лв.указ.палец',
  s: 'Лв.сред.палец',
  t: 'Лв.безым.палец',
  u: 'Лв.мизинец',
  1: 'Свитки',
  x: 'Зелья',
  y: 'Сырье',
  z: 'Промтовары',
  q: 'Руки',
  v: 'Ухо',
  w: 'Обувь',
  ab: 'Двуручное оружие',
};

/**
 * Рандомное значние между min - max
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Рандомное floatNumber значение
 */
function randInt(min, max) {
  const tempMax = +max;
  const tempMin = +min;
  return (Math.random() * (tempMax - tempMin) + tempMin);
}

module.exports = {
  weaponTypes: WEAPON_TYPES,
  stores: STORES,
  /**
   * Функция рандома по формату 1d100+10;
   * @param {String} diceStr параметры рандома в формате 1d100
   * @return {Number} число в разбросе от diceStr (1d100)
   */
  dice(diceStr) {
    let result = 0;
    const sec = diceStr.split('+');
    if (sec.length === 2) {
      const parts = sec[0].split('d');
      result = randInt(parts[0], parts[1]) + Number(sec[1]);
    } else {
      const parts = diceStr.split('d');
      result = randInt(parts[0], parts[1]);
    }
    return result;
  }, /**
   * Функция рандома по формату 1d100;
   * @param {String} dstr параметры рандома в формате 1d100
   * @return {Number} число в разбросе от diceStr (1d100)
   */
  rndm(dstr) {
    const part = dstr.split('d');
    const min = +part[0] || 1;
    const max = +part[1];
    return Math.floor(Math.random() * (max - min + 1) + min);
  }, /**
   * Проверка, является ли экшен магией
   * @param {String} action идентификатор действия
   *@return {Boolean}
   */
  isMagic(action) {
    return arena.magics[action]._proto_.constructor === 'magic';
  },
  randInt, /**
   * генератор уникальных идентификаторов для тим
   * @return {GUID String}
   */
  guid() {
    /**
     * random numb gen
     * @return {string}
     */
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()
    }${s4()}${s4()}`;
  },
};
