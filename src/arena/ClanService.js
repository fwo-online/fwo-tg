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
  lvlCost: [100, 250, 750, 1000],
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
   * @param {ClanDocument} clan
   */
  async removeClan(clan) {
    clan.players.forEach((player) => {
      arena.characters[player.id].leaveClan();
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
   * @param {ClanDocument} clan
   * @param {string} charId - id персонажа
   * @param {number} gold - количество золота
   */
  async addGold(clan, char, gold) {
    if (char.gold < gold) {
      throw new Error('Недостаточно золота');
    }
    char.gold -= gold;
    await char.saveToDb();
    await db.clan.update(clan.id, { gold: clan.gold + gold });
    clan.gold += gold;
  },
};
