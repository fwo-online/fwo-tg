const arena = require('./index');
const Inventory = require('../models/Inventory');
const MiscService = require('./MiscService');
const floatNumber = require('./floatNumber');
const db = require('../helpers/dataBase');
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
function getDynHarks(charObj) {
  const harks = charObj.hark;
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
   * @param {String} nickName имя персонажа
   * @param {String} prof имя профессии персонажа
   * @param {Object} charObj обьект персонажа из базы
   */
  constructor(nickName, prof) {
    this.nickname = nickName;
    const defaults = defHarks(prof);
    this.clearHarks = defaults.hark;
    this.prof = defaults.prof;
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
   * @param {Number} charId идентификатор чара (tgId)
   * @type {Promise}
   */
  static async loading(charId) {
    /**
     * @todo организовать нормальную загрузку
     */
    const harksFromItems = await Inventory.getAllHarks(charId)
      || { hit: { min: 0, max: 0 } };
    const p = await db.char.find({ _id: charId });
    p.harksFromItems = harksFromItems;
    p.def = getDynHarks(p);
    // изменяем прототип
    // eslint-disable-next-line no-proto
    p.__proto__ = Object.create(this.prototype);
    arena.players[charId] = p;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(arena.players));
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
    this.mag[magicId] = lvl;
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
      const self = { ...this };
      delete self.inventory;
      await db.char.update({ tgId: this.id }, self);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Fail on CharSave:', e);
    }
  }
}

module.exports = Char;
