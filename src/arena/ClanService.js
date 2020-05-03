const arena = require('./index');
// const CharacterService = require('./CharacterService');
const db = require('../helpers/dataBase');
/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 */

module.exports = {
  async createClan(charId, name) {
    const char = arena.characters[charId];
    if (char.gold < 100) {
      throw new Error('Нужно больше золота');
    }
    char.gold -= 100;
    const clan = await db.clan.create(char.id, name);
    return char.joinClan(clan);
  },
  async removeClan(clan) {
    clan.players.forEach((player) => {
      arena.characters[player.id].leaveClan();
    });
    return db.clan.remove(clan.id);
  },
  async getClanList() {
    const clans = await db.clan.list();
    return clans;
  },
};
