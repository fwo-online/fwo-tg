const _ = require('lodash');
const db = require('../helpers/dataBase');
const { default: { lvlRatio } } = require('./config');
const floatNumber = require('./floatNumber');
const arena = require('./index');

/**
 * @typedef {import ('../models/clan').Clan} Clan
 * @typedef {Object} Statistics
 * @property {number} kills
 * @property {number} death
 * @property {number} games
 * @property {number} runs
 */

const sum = (a, b) => {
  if (_.isObject(b)) {
    return _.assignWith(a, b, sum);
  }
  if (_.isEmpty(a)) {
    return +b;
  }
  return +a + +b;
};

const assignWithSum = (a, b) => _.assignWith(a, b, sum);

/**
 * Конструктор персонажа
 * @todo сюда нужны будет get/set функции для intreface части
 * @todo Сейчас массив arena.player не является массивом обьектов Character,
 * нужно переработать
 */
/**
 * Возвращает список динамических характеристик
 * @param {Char} charObj инстанс Char
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
   * @return {{min: number, max: number}} {min:xx,max:xx}
   */
  function calcHit() {
    const h = {};
    let dmgFromHarks = 0;
    let dmgFromItems = {};
    if (charObj.prof === 'l') {
      dmgFromHarks = (harks.int - 2) / 10;
    } else {
      dmgFromHarks = (harks.str - 3) / 10;
    }
    if (!_.isEmpty(charObj.harksFromItems.hit)) {
      dmgFromItems = {
        max: charObj.harksFromItems.hit.max,
        min: charObj.harksFromItems.hit.min,
      };
    } else {
      dmgFromItems = { min: 0, max: 0 };
    }

    h.min = floatNumber(dmgFromHarks + +dmgFromItems.min);
    h.max = floatNumber(dmgFromHarks + +dmgFromItems.max);
    return h;
  }

  const hit = calcHit();
  const maxTarget = (charObj.prof === 'l') ? Math.round(charObj.lvl + 3 / 2) : 1;
  const lspell = (charObj.prof === 'm' || charObj.prof === 'p') ? Math.round((harks.int - 4) / 3) : 0;
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
   * @property {import('../models/character').Prof} prof
   * @property {Number} lvl
   * @property {Number} tgId
   * @property {String} nickname
   * @property {Number} gold
   * @property {Number} exp
   * @property {Statistics} statistics
   * @property {import('../models/inventory').InventoryDocument[]} inventory
   * @property {import('../models/item').Hark} harks
   * @property {Object.<string, number>} magics
   * @property {Number} free
   * @property {Number} bonus
   * @property {Object} mm
   * @property {Object.<string, number>} skills
   * @property {Clan} clan
   * @property {import ('./GameService')} currentGame
   * @property {Number} mm
   * @property {{reason: string, date: Date}[]} penalty
   */
  constructor(charObj) {
    this.charObj = charObj;
    this.tempHarks = {
      ...charObj.harks,
      free: charObj.free,
    };
    this.updateHarkFromItems();
    this.mm = {};
    this.autoreg = false;
    this.modifiers = undefined;
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

  // Суммарный обьект характеристик + вещей.
  get def() {
    const dynHarks = getDynHarks(this);
    /**
    * Проблематика на подумать:
    * характеристики внутри чара имеют имена patk/pdef и т.д, а обьект который
    * был получен после возвращения updateHarkFromItems, имеет ключи типа:
    * atk/prt (models/item). Это не позволяет прозрачно проводить сложение.
    */
    _.forEach(this.harksFromItems, (h, i) => {
      if (_.isObject(h)) {
        assignWithSum(dynHarks[i], h);
      } else {
        if (!_.isUndefined(dynHarks[i])) dynHarks[i] += +h;
        if (i === 'atc') dynHarks.patk += +h;
        if (i === 'prt') dynHarks.pdef += +h;
        if (i === 'add_hp') dynHarks.maxHp += +h;
        if (i === 'add_mp') dynHarks.maxMp += +h;
        if (i === 'add_en') dynHarks.maxEn += +h;
        if (!dynHarks[i]) dynHarks[i] = h;
      }
    });
    console.log('dyn', dynHarks);
    return dynHarks;
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

  get runs() {
    return this.charObj.statistics.runs;
  }

  get death() {
    return this.charObj.statistics.death;
  }

  get free() {
    return this.tempHarks.free;
  }

  set free(value) {
    this.tempHarks.free = value;
  }

  // Нужно помнить, что this.harks это суммарный обьект, с уже полученными от
  // вещей характеристиками.
  get harks() {
    const hark = { ...this.charObj.harks };
    if (!_.isEmpty(this.plushark)) {
      assignWithSum(hark, this.plushark);
    }
    if (!_.isUndefined(this.collection.harks)) {
      assignWithSum(hark, this.plushark);
    }
    return hark;
  }

  get magics() {
    return this.charObj.magics;
  }

  get plushark() {
    return this.harksFromItems.plushark;
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

  get collection() {
    return db.inventory.getCollection(this.getPutonedItems()) || {};
  }

  get resists() {
    const { resists } = this.collection;
    return resists || {};
  }

  get chance() {
    return this.collection.chance || {};
  }

  get statical() {
    return this.collection.statical;
  }

  /** Суммарное количество опыта, требуемое для следующего уровня */
  get nextLvlExp() {
    return 2 ** (this.lvl - 1) * 1000 * lvlRatio;
  }

  /**
   * @param {Partial<Statistics>} stat
   */
  addGameStat(stat) {
    _.forEach(stat, (val, key) => {
      this.charObj.statistics[key] += val;
    });
  }

  /**
   * @param {string} reason
   */
  getPenaltyDate(reason) {
    const penalty = this.charObj.penalty.find((p) => p.reason === reason);
    if (penalty && penalty.date.valueOf() > Date.now()) {
      return penalty.date;
    }
    return false;
  }

  /**
   * @param {string} reason
   * @param {number} minutes
   */
  async updatePenalty(reason, minutes) {
    const date = new Date();
    date.setHours(date.getHours(), date.getMinutes() + minutes);

    const penalty = { reason, date };
    const index = this.charObj.penalty.findIndex((p) => p.reason === reason);

    if (index === -1) {
      this.charObj.penalty.push(penalty);
    } else {
      this.charObj.penalty[index] = penalty;
    }
    await this.saveToDb();
  }

  /**
   * Проверяет количество опыта для следующего уровня. Добавляет уровень, если опыта достаточно
   * @param {number} currentExp - текущее количество опыта
   */
  addLvl(currentExp) {
    if (this.nextLvlExp < currentExp) {
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

  getPutonedItems() {
    return this.items.filter((item) => item.putOn);
  }

  getPutonedWeapon() {
    return this.getPutonedItems().find((item) => /^ab?$/.test(item.wear) && item.putOn);
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
    const inventory = await this.putOffItemsCantPutOned();
    this.charObj.inventory = inventory;
  }

  /** @returns {import('../models/inventory').InventoryDocument[]} */
  async putOffItemsCantPutOned() {
    const inventory = await db.inventory.getItems(this.id);
    if (!inventory) return [];
    this.charObj.inventory = inventory;
    await this.updateHarkFromItems();

    const items = this.getPutonedItems().filter((i) => !this.hasRequeredHarks(arena.items[i.code]));
    if (items.length) {
      const putOffItems = items.map((i) => db.inventory.putOffItem(this.id, i._id));
      await Promise.all(putOffItems);
      const inventoryFiltered = await this.putOffItemsCantPutOned();
      this.charObj.inventory = inventoryFiltered;
      return inventoryFiltered;
    }
    return inventory;
  }

  async putOnItem(itemId) {
    const charItem = this.getItem(itemId);
    const item = arena.items[charItem.code];

    if (!this.hasRequeredHarks(item) || !this.isCanPutOned(item)) {
      return false;
    }

    await db.inventory.putOnItem(this.id, itemId);
    const inventory = await db.inventory.getItems(this.id);
    this.charObj.inventory = inventory;
    await this.updateHarkFromItems();
    return true;
  }

  /**
   *
   * @param {import('../models/item').Item} item
   */
  hasRequeredHarks(item) {
    if (item.hark) {
      return _.every(item.hark, (val, hark) => val < this.harks[hark]);
    }
    return true;
  }

  // В функциях прокачки харок следует использоваться this.charObj.harks
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

  /**
  * Продажа предмета.
  */
  async sellItem(itemId) {
    const charItem = this.getItem(itemId);
    const item = arena.items[charItem.code];

    this.removeItem(itemId);
    this.gold += item.price / 2;
    const inventory = await this.putOffItemsCantPutOned();
    this.charObj.inventory = inventory;
    await this.saveToDb();
  }

  /**
  * Функция пересчитывает все характеристики которые были получены от надетых
  * вещей в инвентаре персонажа
  * @returns {Promise<void>}
  */
  async updateHarkFromItems() {
    this.harksFromItems = await db.inventory.getAllHarks(this.id);
    if (!this.harksFromItems || !Object.keys(this.harksFromItems).length) {
      this.harksFromItems = { hit: { min: 0, max: 0 } };
    }

    if (this.statical) {
      assignWithSum(this.harksFromItems, this.statical);
    }
  }

  /**
   * @param {Clan} clan
   */
  async joinClan(clan) {
    this.charObj.clan = clan;
    await this.saveToDb();
    const char = await Char.getCharacter(this.tgId);
    return char;
  }

  async leaveClan() {
    this.charObj.clan = undefined;
    await this.updatePenalty('clan_leave', 5 * 24 * 60);
    return this;
  }

  /**
   * @desc Получает идентификатор игры из charId участника
   * @return {string} gameId идентификатор игры
   */
  get gameId() {
    return this.mm.status || '';
  }

  /**
   * Setter gameId
   * @param {string} newStatus новый статус mm персонажа
   */
  set gameId(newStatus) {
    this.mm.status = newStatus;
  }

  get currentGame() {
    return arena.games[this.gameId];
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
   * @return {this} Обьект игры
   * @todo нужно перенести это не в static а во внутрь экземпляра класса
   */
  static getGameFromCharId(charId) {
    const { gameId } = arena.characters[charId];
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
   * Сохраняет состояние чара в базу
   * @todo важная функция которая сохраняет параметры чара в базу
   */
  async saveToDb() {
    try {
      // eslint-disable-next-line no-console
      console.log('Saving char :: id', this.id);
      const {
        gold, exp, magics, bonus, items, skills, lvl, clan, free,
      } = this;
      return await db.char.update(this.tgId, {
        gold,
        exp,
        magics,
        bonus,
        skills,
        lvl,
        clan,
        penalty: this.charObj.penalty,
        free,
        inventory: items,
        statistics: this.charObj.statistics,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Fail on CharSave:', e);
    }
  }
}

module.exports = Char;
