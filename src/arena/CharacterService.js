const arena = require('./index');
const floatNumber = require('./floatNumber');
const db = require('../helpers/dataBase');
const { lvlRatio } = require('./config');

/**
 * Конструктор персонажа
 * @todo сюда нужны будет get/set функции для intreface части
 * @todo Сейчас массив arena.player не является массивом обьектов Character,
 * нужно переработать
 */
const harkArr = ['str', 'dex', 'int', 'wis', 'con'];
/**
 * Возвращает список динамических характеристик
 * @param {Object} charObj инстанс Char
 * @return {{patk: number, pdef: number, maxHp: number, maxMp: number,
 * maxEn: number,mga: number, mgp: number, hl: {min: *, max: *}, manaReg: *,
 * enReg: number, hit: boolean, maxTarget: number, lspell: number}}
 * @todo проверить что функция используется при загрузке игрока в игру
 */
// eslint-disable-next-line no-unused-vars
function getDynHarks(charObj) {
  const { harks } = charObj;
  const patk = (charObj.prof === 'l')
    ? floatNumber(harks.dex + (harks.int * 0.5))
    : floatNumber(harks.dex + (harks.str * 0.4));
  const pdef = floatNumber(((harks.con * 0.6) + (harks.dex * 0.4)));
  const maxHp = floatNumber(6 + (harks.con / 3));
  const maxMp = floatNumber(harks.wis * 1.5);
  const maxEn = (charObj.prof === 'l') ? (harks.dex + harks.int * 0.5
    + harks.con * 0.25) : (harks.dex + harks.str * 0.5 + harks.con * 0.25);

  const mga = floatNumber((harks.wis * 0.6) + (harks.int * 0.4));
  const mgp = floatNumber((harks.wis * 0.6) + (harks.int * 0.4));
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
   * @param {char} charObj обьект персонажа из базы
   * @typedef {Object} char
   * @property {String} id
   * @property {String} _id
   * @property {String} prof
   * @property {Number} lvl
   * @property {Number} tgId
   * @property {String} nickname
   * @property {Number} gold
   * @property {Number} exp
   * @property {Object} statistics
   * @property {Object} inventory
   * @property {Object} harks
   * @property {Object.<string, number>} magics
   * @property {Number} free
   * @property {Number} bonus
   * @property {Object} mm
   * @property {Object.<string, number>} skills
   * @property {Number} clan
   * @property {import ('./GameService')} currentGame
   * @property {Number} mm
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
    this.currentGame = null;
    this.updateHarkFromItems();
    this.mm = null;
    this.autoreg = false;
  }

  get id() {
    return this.charObj.id || this.charObj._id;
  }

  get prof() {
    return this.charObj.prof;
  }

  get lvl() {
    return this.charObj.lvl;
  }

  get def() {
    return getDynHarks(this);
  }

  get tgId() {
    return this.charObj.tgId;
  }

  get nickname() {
    return this.charObj.nickname;
  }

  get gold() {
    return this.charObj.gold;
  }

  set gold(value) {
    this.charObj.gold = value;
  }

  get exp() {
    return this.charObj.exp;
  }

  set exp(value) {
    this.bonus += Math.round(value / 100) - Math.round(this.charObj.exp / 100);
    this.addLvl(value);
    this.charObj.exp = value;
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

  set free(value) {
    this.tempHarks.free = value;
  }

  get harks() {
    return this.charObj.harks;
  }

  get magics() {
    return this.charObj.magics;
  }

  get skills() {
    return this.charObj.skills;
  }

  get bonus() {
    return this.charObj.bonus;
  }

  set bonus(value) {
    this.charObj.bonus = value;
  }

  get items() {
    return this.charObj.inventory;
  }

  set items(items) {
    this.charObj.inventory = items;
  }

  get clan() {
    return this.charObj.clan;
  }

  /**
   * Проверяет количество опыта для следующего уровня. Добавляет уровень, если опыта достаточно
   * @param {number} currentExp - текущее количество опыта
   */
  addLvl(currentExp) {
    const nextLvlExp = 2 ** (this.lvl - 1) * 1000 * lvlRatio;
    if (nextLvlExp < currentExp) {
      this.charObj.lvl += 1;
      this.free += 10;
      this.addLvl(currentExp);
    }
  }

  async addItem(itemCode) {
    const item = await db.inventory.addItem(this.id, itemCode);
    this.charObj.inventory.push(item);
    return this.saveToDb();
  }

  getItem(itemId) {
    return this.items.find((item) => item._id.equals(itemId));
  }

  getPutonedWeapon() {
    return this.items.find((item) => /^ab?$/.test(item.wear) && item.putOn);
  }

  isCanPutOned(item) {
    return !this.items.find((currentItem) => currentItem.putOn
      && (item.wear.indexOf(currentItem.wear) !== -1
      || currentItem.wear.indexOf(item.wear) !== -1));
  }

  async removeItem(itemId) {
    this.items = this.items.filter((item) => !item._id.equals(itemId));
    await db.inventory.removeItem(itemId, this.id);
    return this.saveToDb();
  }

  async putOffItem(itemId) {
    await db.inventory.putOffItem(this.id, itemId);
    const inventory = await db.inventory.getItems(this.id);
    this.charObj.inventory = inventory;
    return this.updateHarkFromItems();
  }

  async putOnItem(itemId) {
    const charItem = this.getItem(itemId);
    const item = arena.items[charItem.code];
    const {
      str, dex, wis, int, con,
    } = this.harks;

    if (item.hark) {
      const {
        s, d, w, i, c,
      } = JSON.parse(item.hark);
      if (s > str || d > dex || w > wis || i > int || c > con) {
        return false;
      }
    }

    if (!this.isCanPutOned(item)) {
      return false;
    }

    await db.inventory.putOnItem(this.id, itemId);
    const inventory = await db.inventory.getItems(this.id);
    this.charObj.inventory = inventory;

    await this.updateHarkFromItems();
    return true;
  }

  getIncreaseHarkCount(hark) {
    const count = this.tempHarks[hark] - this.charObj.harks[hark];
    return count || '';
  }

  increaseHark(harkName) {
    if (this.tempHarks.free < 1) {
      throw Error('Недостаточно очков');
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

  async buyItem(itemCode) {
    const item = arena.items[itemCode];

    if (this.gold < item.price) {
      return false;
    }

    this.gold -= item.price;
    this.addItem(itemCode);
    return this.saveToDb();
  }

  sellItem(itemId) {
    const charItem = this.getItem(itemId);
    const item = arena.items[charItem.code];

    this.removeItem(itemId);
    this.gold += item.price / 2;

    return this.saveToDb();
  }

  async updateHarkFromItems() {
    this.harksFromItems = await db.inventory.getAllHarks(this.id);
    console.log('fff:', this.id);
    console.log(this.harksFromItems.hit);
    if (!this.harksFromItems || !Object.keys(this.harksFromItems).length) {
      this.harksFromItems = { hit: { min: 0, max: 0 } };
    }
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
   * @return {Promise<Char>}
   */
  static async getCharacter(tgId) {
    const charFromDb = await db.char.load({ tgId });
    if (!charFromDb) {
      return null;
    }

    const char = new Char(charFromDb);
    arena.characters[char.id] = char;
    return char;
  }

  /**
   * Возвращает обьект игры по Id чара
   * @param {String} charId идентификатор чара;
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
   * Получение нового умения
   * @param {string} skillId идентификатор умения
   * @param {number} lvl уровень проученного умения
   */
  learnSkill(skillId, lvl) {
    this.skills[skillId] = lvl;
    this.saveToDb();
  }

  /**
   * Метод для работы с harks персонажа
   * @param {String} hark str/dex/wis/int/con
   * @param {Number} val кол-во на которое будет поднята характеристика
   * @todo нужно поправить
   */
  async upHark(hark, val) {
    if (!(harkArr.indexOf(hark) + 1) && val <= this.free) {
      this.free -= +val;
      this.harks[hark] += +val;
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
        gold, exp, magics, bonus, items, skills, lvl,
      } = this;
      return await db.char.update(this.tgId, {
        gold,
        exp,
        magics,
        bonus,
        skills,
        lvl,
        inventory: items,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Fail on CharSave:', e);
    }
  }
}

module.exports = Char;
