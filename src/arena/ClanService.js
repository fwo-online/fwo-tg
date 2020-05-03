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
  /**
   * Создаёт новый
   * @param {string} charId - id создателя клана
   * @param {string} name - название клана
   */
  async createClan(charId, name) {
    const char = arena.characters[charId];
    if (char.gold < 100) {
      throw new Error('Нужно больше золота');
    }
    char.gold -= 100;
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
};
