const arena = require('./index');
const MiscService = require('./MiscService');
const floatNumber = require('./floatNumber');
const db = require('../helpers/dataBase');

global.arena.players = {};
/**
 * Конструктор персонажа
 * @todo сюда нужны будет get/set функции для intreface части
 * @todo Сейчас массив arena.player не является массивом обьектов Character,
 * нужно переработать
 */
const harkArr = ['str', 'dex', 'int', 'wis', 'con'];
/**
 * Функция возвращающая дефолтные параметры чара в зависимости от профы
 * @param {String} prof строка профессии
 * @return {Object} обьект harks {str:x,dex:x,wis:x,int:x,con:x}
 */
// @todo првоерить что после правок чар создается с нужным набором дефолтных характеристрик
// eslint-disable-next-line no-unused-vars
function defHarks(prof) {
  return MiscService.prof[prof];
}

/**
 * Возвращает список динамических характеристик
 * @param {Object} charObj обьект персонажа из базы
 * @return {{patk: number, pdef: number, maxHp: number, maxMp: number,
 * maxEn: number,mga: number, mgp: number, hl: {min: *, max: *}, manaReg: *,
 * enReg: number, hit: boolean, maxTarget: number, lspell: number}}
 */
// eslint-disable-next-line no-unused-vars
function getDynHarks(charObj) {
  const { harks } = charObj;
  const patk = (charObj.prof === 'l')
    ? floatNumber(harks.dex + (harks.int * 0.5))
    : floatNumber(harks.dex + (harks.str * 0.4));
  const pdef = ((harks.con * 0.6) + (harks.dex * 0.4));
  const maxHp = floatNumber(6 + (harks.con / 3));
  const maxMp = floatNumber(harks.wis * 1.5);
  const maxEn = (charObj.prof === 'l') ? (harks.dex + harks.int * 0.5
    + harks.con * 0.25) : (harks.dex + harks.str * 0.5 + harks.con * 0.25);

  const mga = (harks.wis * 0.6) + (harks.int * 0.4);
  const mgp = (harks.wis * 0.6) + (harks.int * 0.4);
  const hl = ({
    min: floatNumber(harks.int / 10), max: floatNumber(harks.int / 5),
  });

  const manaReg = floatNumber((harks.wis * 0.4) + (harks.int * 0.6));

  const enReg = floatNumber((harks.con * 0.4) + (harks.dex * 0.6));

  /**
   * Функция расчета наносимого урона
   * @return {Object} {min:xx,max:xx}
   */
  function calcHit() {
    const h = {};
    if (charObj.prof === 'l') {
      const intDmg = (harks.int - 2) / 10;
      h.min = floatNumber(intDmg + +charObj.harksFromItems.hit.min);
      h.max = floatNumber(intDmg + +charObj.harksFromItems.hit.max);
    } else {
      const strDmg = (harks.str - 3) / 10;
      h.min = floatNumber(strDmg + +charObj.harksFromItems.hit.min);
      h.max = floatNumber(strDmg + +charObj.harksFromItems.hit.max);
    }
    return h;
  }

  const hit = calcHit();
  const maxTarget = (charObj.prof === 'l') ? Math.round(charObj.lvl + 3 / 2) : 1;
  const lspell = (charObj.prof === 'l') ? Math.round((harks.int - 4) / 3) : 0;
  return {
    patk,
    pdef,
    maxHp,
    maxMp,
    maxEn,
    mga,
    mgp,
    hl,
    manaReg,
    enReg,
    hit,
    maxTarget,
    lspell,
  };
}
/**
 * Класс описывающий персонажа внутри игры
 */
class Char {
  /**
   * Конструктор игрока
   * @param {Object} charObj обьект персонажа из базы
   */
  constructor(charObj) {
    // const defaults = defHarks(charObj.prof);
    // this.clearHarks = defaults.hark;
    // this.prof = defaults.prof;
    this.charObj = charObj;
    this.tempHarks = {
      ...charObj.harks,
      free: charObj.free,
    };
  }

  get id() {
    return this.charObj.id || this.charObj._id;
  }

  get nickname() {
    return this.charObj.nickname;
  }

  get lvl() {
    return this.charObj.lvl;
  }

  get gold() {
    return this.charObj.gold;
  }

  get exp() {
    return this.charObj.exp;
  }

  get games() {
    return this.charObj.statistics.games;
  }

  get kills() {
    return this.charObj.statistics.kills;
  }

  get free() {
    return this.tempHarks.free;
  }

  get harks() {
    return this.tempHarks;
  }

  get magics() {
    return this.charObj.magics;
  }

  get bonus() {
    return this.charObj.bonus;
  }

  getIncreaseHarkCount(hark) {
    const count = this.tempHarks[hark] - this.charObj.harks[hark];
    return count || '';
  }

  increaseHark(harkName) {
    if (this.tempHarks.free < 1) {
      return;
    }

    this.tempHarks[harkName] += 1;
    this.tempHarks.free -= 1;
  }

  resetHarks() {
    this.tempHarks = {
      ...this.charObj.harks,
      free: this.charObj.free,
    };
  }

  async submitIncreaseHarks() {
    const { free, ...harks } = this.tempHarks;
    this.charObj.harks = harks;
    this.charObj.free = free;

    // @todo сюда нужно будет предусмотреть проверки на корректность сохраняемых данных
    return db.char.update(this.charObj.tgId, this.charObj);
  }

  /**
   * @desc Получает идентификатор игры из charId участника
   * @return {String|Number} gameId идентификатор игры
   */
  get gameId() {
    return this.mm.status || '';
  }

  /**
   * Setter gameId
   * @param {String|Number} newStatus новый статус mm персонажа
   */
  set gameId(newStatus) {
    this.mm.status = newStatus;
  }

  /**
   * Загрузка чара в память
   * @param {Number} tgId идентификатор пользователя в TG (tgId)
   * @type {Promise<Char>}
   */
  static async getCharacter(tgId) {
    const charFromDb = await db.char.load({ tgId });
    if (!charFromDb) {
      return null;
    }
    const char = new Char(charFromDb);
    if (!global.arena.players) global.arena.players = {};
    global.arena.players[char.id] = char;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(global.arena.players));
    return char;
  }

  /**
   * Возвращает обьект игры по Id чара
   * @param {Number} charId идентификатор чара;
   * @return {Object} Обьект игры
   * @todo нужно перенести это не в static а во внутрь экземпляра класса
   */
  static getGameFromCharId(charId) {
    const gameId = arena.players[charId].mm;
    if (arena.games[gameId]) {
      return arena.games[gameId];
    } throw Error('gameId_error');
  }

  /**
   * Функция получения новой магии
   * @param {String} magicId идентификатор магии
   * @param {Number} lvl уровень проученной магии
   */
  learnMagic(magicId, lvl) {
    this.magics[magicId] = lvl;
    // опасный тест
    this.saveToDb();
  }

  /**
   * Метод для работы с harks персонажа
   * @param {String} hark str/dex/wis/int/con
   * @param {Number} val кол-во на которое будет поднята характеристика
   * @todo нужно поправить
   */
  async upHark(hark, val) {
    if (!harkArr.indexOf(hark) + 1 && val <= this.free) {
      this.free -= +val;
      this.hark[hark] += +val;
    } else {
      throw Error('UPHARK_ERR');
    }
    await this.saveToDb();
  }

  /**
   * Сохраняет состояние чара в базу
   * @todo важная функция которая сохраняет параметры чара в базу
   */
  async saveToDb() {
    try {
      // eslint-disable-next-line no-console
      console.log('Saving char :: id', this.id);
      const {
        gold, exp, magics, bonus,
      } = this;
      await db.char.update(this.tgId, {
        gold, exp, magics, bonus,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Fail on CharSave:', e);
    }
  }
}

module.exports = Char;
