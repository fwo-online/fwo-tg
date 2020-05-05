const arena = require('./index');
const channerHelper = require('../helpers/channelHelper');
const CharacterService = require('./CharacterService');
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
  /**
   * Добавляет игрока в клан и отправляет ему сообщение
   * @param {string} clanId
   * @param {number} tgId
   */
  async acceptRequest(clanId, tgId) {
    const clan = await this.getClanById(clanId);
    if (clan.hasEmptySlot) {
      const char = await CharacterService.getCharacter(tgId);
      const updated = await db.clan.update(clan.id, {
        players: [...clan.players, char.id],
        requests: clan.requests.filter((player) => player.tgId !== char.tgId),
      });
      Object.assign(clan, updated);

      /** @todo не сохраняется клан у игрока */
      arena.characters[char.id] = await char.joinClan(clan);
      channerHelper.broadcast(
        `Твоя заявка на вступление в клан *${clan.name}* была одобрена`,
        char.tgId,
      );
    } else {
      throw new Error('Клан уже сформирован');
    }
  },
  /**
   * Отклоняет запрос игрока
   * @param {string} clanId
   * @param {number} tgId
   */
  async rejectRequest(clanId, tgId) {
    const clan = await this.getClanById(clanId);
    const char = await CharacterService.getCharacter(tgId);
    const updated = await db.clan.update(clan.id, {
      requests: clan.requests.filter((player) => player.tgId !== char.tgId),
    });
    Object.assign(clan, updated);
    channerHelper.broadcast(
      `Твоя заявка на вступление в клан *${clan.name}* была отклонена`,
      char.tgId,
    );
  },
  /**
   * Удаляет игрока из клана
   * @param {string} clanId
   * @param {number} tgId
   */
  async leaveClan(clanId, tgId) {
    const clan = await this.getClanById(clanId);
    const char = await CharacterService.getCharacter(tgId);
    const updated = await db.clan.update(clan.id, {
      players: clan.players.filter((player) => player.tgId !== char.tgId),
    });
    Object.assign(clan, updated);
    await char.leaveClan();
    return char;
  },
};
