const { Markup } = require('telegraf');
const channerHelper = require('../helpers/channelHelper');
const db = require('../helpers/dataBase');
const { ClanModel } = require('../models/clan');
const CharacterService = require('./CharacterService');
const arena = require('./index');

/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 */

module.exports = {
  async getClanById(id) {
    if (arena.clans[id]) {
      return arena.clans[id];
    }
    const clan = await db.clan.findOne({ _id: id });
    arena.clans[clan.id] = clan;
    return clan;
  },
  /**
   * @param {string} clanId - id клана
   * @param {string} charId - id порсонажа
   */
  async handleRequest(charId, clanId) {
    const char = arena.characters[charId];
    const clan = await this.getClanById(clanId);
    const requestClan = await this.getPlayerClanRequest(charId);

    const remainingTime = (date) => ((date.valueOf() - Date.now()) / 60000).toFixed();

    const penaltyForRequest = char.getPenaltyDate('clan_request');
    if (penaltyForRequest) {
      throw new Error(`Определись и возвращайся через ${remainingTime(penaltyForRequest)} мин.`);
    }
    const penaltyForLeave = char.getPenaltyDate('clan_leave');
    if (penaltyForLeave) {
      throw new Error(`Вступить в новый клан ты сможешь через ${remainingTime(penaltyForLeave)} мин.`);
    }

    if (clan.requests.some((p) => p.tgId === char.tgId)) {
      await this.removeRequest(clan.id, char.id);
      throw new Error('Заявка на вступление отменена');
    }

    if (requestClan) {
      throw new Error('Сначала отмени предыдущую заявку');
    }

    if (clan.hasEmptySlot) {
      await this.createRequest(clan.id, char.id);
      throw new Error('Заявка на вступление отправлена');
    } else {
      throw new Error('Клан уже сформирован');
    }
  },
  /**
  * Возвращает клан, в который игрок делал заявку
  * @param {string} charId - id порсонажа
  */
  async getPlayerClanRequest(charId) {
    const clan = await db.clan.findOne({ requests: charId });
    return clan;
  },
  /**
   * Создаёт новый клан
   * @param {string} charId - id создателя клана
   * @param {string} name - название клана
   */
  async createClan(charId, name) {
    const char = arena.characters[charId];
    if (char.gold < ClanModel.lvlCost()[0]) {
      throw new Error('Нужно больше золота');
    }
    char.gold -= ClanModel.lvlCost()[0];
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
   * @returns {Promise<import ('telegraf/typings/markup').CallbackButton[][]>}
   */
  async getClanList(charId) {
    const char = arena.characters[charId];
    const clans = await db.clan.list();
    const requestClan = await this.getPlayerClanRequest(char.id) || {};
    return clans.map((clan) => [
      Markup.button.callback(
        `${clan.name} (👥${clan.players.length} / ${clan.maxPlayers})`,
        `info_${clan.id}`,
      ),
      Markup.button.callback(
        `${clan.id === requestClan.id ? 'Отменить' : 'Вступить'}`,
        `request_${clan.id}`,
      ),
    ]);
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
   * Отмена заявки игроком
   * @param {string} clanId
   * @param {string} charId
   */
  async removeRequest(clanId, charId) {
    const char = arena.characters[charId];
    const clan = await this.getClanById(clanId);
    const updated = await db.clan.update(clanId, {
      requests: clan.requests.filter((p) => p.tgId !== char.tgId),
    });
    await char.updatePenalty('clan_request', 60);
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
