/**
 * @description Просто мусорка с кастомными функциями
 * @module Service/Misc
 */
/**
 * Константа дефотлный параметров професcий при создание чара
 */
const PROF = {
  Warrior: {
    prof: 'w',
    hark: {
      str: 10, dex: 8, int: 3, wis: 3, con: 6,
    },
  },
  Archer: {
    prof: 'l',
    hark: {
      str: 3, dex: 8, int: 10, wis: 3, con: 6,
    },
  },
  Mage: {
    prof: 'm',
    hark: {
      str: 3, dex: 3, int: 8, wis: 10, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
  },
  Priest: {
    prof: 'p',
    hark: {
      str: 3, dex: 3, int: 10, wis: 8, con: 6,
    },
    mag: {
      lightHeal: 1,
    },
  },
};
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
  max = +max;
  min = +min;
  return (Math.random() * (max - min) + min);
}

module.exports = {
  // чистим Online при перезапуске сервака.
  async onlineCleaner() {
    try {
      await Online.update({}, { online: false });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, /**
   * @description Проверяем является ли req GET && isSocket
   * @param {req} req принимает входящий req из контроллера
   * @return {Boolean}
   */
  isPostSock: (req) => (req.isSocket) && (req.method === 'POST'),
  prof: PROF,
  stores: STORES, /**
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
