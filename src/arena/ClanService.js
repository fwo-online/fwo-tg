const arena = require('./index');
// const CharacterService = require('./CharacterService');
const db = require('../helpers/dataBase');
/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 * @typedef {import ('../models/clan').Clan} Clan
 * @typedef {import ('../models/clan').ClanDocument} ClanDocument
 */

module.exports = {
  lvlCost: [100, 250, 750, 1500],
  async getClanById(id) {
    if (arena.clans[id]) {
      return arena.clans[id];
    }
    const clan = await db.clan.find(id);
    arena.clans[clan.id] = clan;
    return clan;
  },
  /**
   * Создаёт новый
   * @param {string} charId - id создателя клана
   * @param {string} name - название клана
   */
  async createClan(charId, name) {
    const char = arena.characters[charId];
    if (char.gold < this.lvlCost[0]) {
      throw new Error('Нужно больше золота');
    }
    char.gold -= this.lvlCost[0];
    const clan = await db.clan.create(char.id, name);
    return char.joinClan(clan);
  },
  /**
   * Удаляет клан у всех участников и удаляет его
   * @param {string} clanId
   */
  async removeClan(clanId) {
    const clan = await this.getClanById(clanId);
    clan.players.forEach((player) => {
      const char = arena.characters[player.id];
      if (char) {
        char.leaveClan();
      }
    });
    return db.clan.remove(clan.id);
  },
  /**
   * Возвразает список всех кланов из бд
   */
  async getClanList() {
    const clans = await db.clan.list();
    return clans;
  },
  /**
   * Добавляет золото в клан и забирает у персонажа
   * @param {string} clanId
   * @param {string} charId - id персонажа
   * @param {number} gold - количество золота
   */
  async addGold(clanId, charId, gold) {
    const clan = await this.getClanById(clanId);
    const char = arena.characters[charId];
    if (char.gold < gold) {
      throw new Error('Недостаточно золота');
    }
    char.gold -= gold;
    await char.saveToDb();
    const updated = await db.clan.update(clan.id, { gold: clan.gold + gold });
    Object.assign(clan, updated);
  },
  /**
   * Снимает золото из казны и повышает уровань
   * @param {string} clanId
   */
  async levelUp(clanId) {
    const clan = await this.getClanById(clanId);
    const cost = this.lvlCost[clan.lvl];
    if (clan.gold < cost) {
      throw new Error('Недостаточно золота');
    }
    if (clan.lvl >= this.lvlCost.length) {
      throw new Error('Клан имеет максимальный уровень');
    }
    const newParams = {
      gold: clan.gold - cost,
      lvl: clan.lvl + 1,
    };
    const updated = await db.clan.update(clan.id, newParams);
    Object.assign(clan, updated);
  },
  /**
   * Создаёт заявку на вступление в клан
   * @param {string} clanId
   * @param {string} charId
   */
  async createRequest(clanId, charId) {
    const clan = await this.getClanById(clanId);
    const updated = await db.clan.update(clanId, { requests: clan.requests.concat(charId) });
    Object.assign(clan, updated);
  },
};
