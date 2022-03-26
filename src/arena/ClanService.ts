import type { UpdateQuery } from 'mongoose';
import {
  createClan, deleteClan, getClanById, getClanByPlayerRequest, getClans, updateClan,
} from '@/api/clan';
import arena from '@/arena';
import type { ClanDocument } from '@/models/clan';
import CharacterService from './CharacterService';
import ValidationError from './errors/ValidationError';
/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 */
export class ClanService {
  static lvlCost = [100, 250, 750, 1500];

  static async getClanById(id: string) {
    const cachedClan = arena.clans.get(id);
    if (cachedClan) {
      return cachedClan;
    }
    const clan = await getClanById(id);
    arena.clans.set(clan.id, clan);

    return clan;
  }

  /**
   * Возвращает список всех кланов из бд
   */
  static async getClanList() {
    return getClans();
  }

  /**
   * Возвращает клан в который пользователь делал запрос на вступление
   */
  static async getClanByPlayerRequest(charId: string) {
    return getClanByPlayerRequest(charId);
  }

  /**
   * Создаёт новый клан
   * @param charId - id создателя клана
   * @param name - название клана
   */
  static async createClan(charId: string, name: string) {
    const clan = await createClan(charId, name);

    const char: CharacterService = arena.characters[charId];
    if (char.gold < this.lvlCost[0]) {
      throw new Error('Нужно больше золота');
    }
    char.gold -= this.lvlCost[0];
    char.joinClan(clan);

    return clan;
  }

  private static async updateClan(id: string, query: UpdateQuery<ClanDocument>) {
    const updated = await updateClan(id, query);
    arena.clans.set(updated.id, updated);

    return updated;
  }

  /**
   * Удаляет клан у всех участников и удаляет его
   * @param clanId
   */
  static async removeClan(clanId: string, owner: string) {
    const clan = await this.getClanById(clanId);

    const promises = clan.players.map((player) => {
      // todo: брать персонажей из бд
      const char: CharacterService = arena.characters[player.id];
      if (char) {
        return char.leaveClan();
      }
      return Promise.resolve();
    });

    await Promise.all(promises);

    await deleteClan(clan.id, owner);
  }

  /**
   * Снимает золото из казны и повышает уровень
   * @param clanId
   * @throws {ValidationError}
   */
  static async levelUp(clanId) {
    const clan = await this.getClanById(clanId);
    if (clan.lvl >= this.lvlCost.length) {
      throw new ValidationError('Клан имеет максимальный уровень');
    }
    const cost = this.lvlCost[clan.lvl];
    if (clan.gold < cost) {
      throw new ValidationError('Недостаточно золота');
    }
    const updated = await this.updateClan(clanId, { $inc: { gold: -cost, lvl: 1 } });
    return updated;
  }

  /**
   * Добавляет золото в клан и забирает у персонажа
   * @param clanId - id клана
   * @param charId - id игрока
   * @param gold - количество золота
   */
  static async addGold(clanId: string, charId: string, gold: number) {
    const char: CharacterService = arena.characters[charId];
    if (char.gold < gold) {
      throw new Error('Недостаточно золота');
    }
    char.gold -= gold;
    await char.saveToDb();

    const clan = await this.updateClan(clanId, { $inc: { gold } });

    return clan;
  }

  /**
   * @param clanId - id клана
   * @param charId - id порсонажа
   */
  static async handleRequest(charId: string, clanId: string) {
    const char = arena.characters[charId];
    const clan = await this.getClanById(clanId);
    const requestClan = await getClanByPlayerRequest(charId);

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
  }

  /**
   * Создаёт заявку на вступление в клан
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async createRequest(clanId: string, charId: string) {
    await this.updateClan(clanId, { $push: { requests: charId } });
  }

  /**
   * Отмена заявки игроком
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async removeRequest(clanId: string, charId: string) {
    const char: CharacterService = arena.characters[charId];
    await this.updateClan(clanId, { $pull: { requests: { $in: [charId] } } });
    await char.updatePenalty('clan_request', 60);
  }

  /**
   * Добавляет игрока в клан и отправляет ему сообщение
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async acceptRequest(clanId: string, charId: string) {
    const clan = await this.getClanById(clanId);
    if (!clan.hasEmptySlot) {
      throw new Error('Клан уже сформирован');
    }
    const char: CharacterService = arena.characters[charId];

    await this.updateClan(clan.id, {
      $push: { players: charId },
      $pull: { requests: { $in: [charId] } },
    });

    /** @todo не сохраняется клан у игрока */
    arena.characters[char.id] = await char.joinClan(clan);
  }

  /**
   * Отклоняет запрос игрока
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async rejectRequest(clanId: string, charId: string) {
    const clan = await this.getClanById(clanId);

    await this.updateClan(clan.id, {
      $pull: { requests: { $in: [charId] } },
    });
  }

  /**
   * Удаляет игрока из клана
   * @param clanId - id клана
   * @param tgId - telegram id игрока
   */
  static async leaveClan(clanId: string, tgId: number) {
    const char = await CharacterService.getCharacter(tgId);
    await this.updateClan(clanId, {
      $pull: { players: { $in: [tgId] } },
    });
    await char.leaveClan();
  }
}
