import type { UpdateQuery } from 'mongoose';
import {
  createClan,
  deleteClan,
  getClanById,
  getClanByPlayerRequest,
  getClans,
  updateClan,
} from '@/api/clan';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import type { Clan } from '@/models/clan';
import { reservedClanName } from '@fwo/schemas';

/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 */
export class ClanService {
  static readonly lvlCost = [100, 250, 750, 1500];

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
    const char: CharacterService = arena.characters[charId];
    if (name === reservedClanName) {
      throw new ValidationError('Недопустимое название клана');
    }
    if (char.gold < this.lvlCost[0]) {
      throw new ValidationError('Нужно больше золота');
    }
    char.gold -= this.lvlCost[0];
    await char.saveToDb();

    const clan = await createClan(charId, name);
    await char.joinClan(clan);

    arena.clans.set(clan.id, clan);
    return clan;
  }

  private static async updateClan(id: string, query: UpdateQuery<Clan>) {
    const updated = await updateClan(id, query);

    arena.clans.set(updated.id, updated);
    return updated;
  }

  /**
   * Удаляет клан у всех участников и удаляет его
   * @param clanId
   */
  static async removeClan(clanId: string, ownerId: string) {
    const clan = await this.getClanById(clanId);

    const promises = clan.players.map((player) => {
      const char: CharacterService = arena.characters[player.id];
      if (char) {
        return char.leaveClan();
      }
      return CharacterService.getCharacterById(player.id).then((char) => char?.leaveClan());
    });

    await Promise.all(promises);

    await deleteClan(clan.id, ownerId);
    arena.clans.delete(clan.id);
  }

  /**
   * Снимает золото из казны и повышает уровень
   * @param clanId
   * @throws {ValidationError}
   */
  static async levelUp(clanId: string) {
    const clan = await this.getClanById(clanId);
    if (clan.lvl >= this.lvlCost.length) {
      throw new ValidationError('Клан имеет максимальный уровень');
    }
    const cost = this.lvlCost[clan.lvl];
    if (clan.gold < cost) {
      throw new ValidationError('Недостаточно золота');
    }
    const updated = await this.updateClan(clan.id, { $inc: { gold: -cost, lvl: 1 } });
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
      throw new ValidationError('Недостаточно золота');
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
  static async handleRequest(clanId: string, charId: string) {
    const char = arena.characters[charId];
    const clan = await this.getClanById(clanId);

    const remainingTime = (date: Date) => ((date.valueOf() - Date.now()) / 60000).toFixed();

    const penaltyForRequest = char.getPenaltyDate('clan_request');
    if (penaltyForRequest) {
      throw new ValidationError(
        `Определись и возвращайся через ${remainingTime(penaltyForRequest)} мин.`,
      );
    }
    const penaltyForLeave = char.getPenaltyDate('clan_leave');
    if (penaltyForLeave) {
      throw new ValidationError(
        `Вступить в новый клан ты сможешь через ${remainingTime(penaltyForLeave)} мин.`,
      );
    }

    if (clan.requests.some((p) => p.owner === char.owner)) {
      await this.removeRequest(clan.id, char.id);
      return 'Заявка на вступление отменена';
    }

    const requestClan = await getClanByPlayerRequest(charId);

    if (requestClan) {
      throw new ValidationError('Сначала отмени предыдущую заявку');
    }

    if (!clan.hasEmptySlot) {
      throw new ValidationError('Клан уже сформирован');
    }
    await this.createRequest(clan.id, char.id);
    return 'Заявка на вступление отправлена';
  }

  /**
   * Создаёт заявку на вступление в клан
   * @param clanId - id клана
   * @param charId - id игрока
   */
  private static async createRequest(clanId: string, charId: string) {
    await this.updateClan(clanId, { $push: { requests: charId } });
  }

  /**
   * Отмена заявки игроком
   * @param clanId - id клана
   * @param charId - id игрока
   */
  private static async removeRequest(clanId: string, charId: string) {
    const char: CharacterService = arena.characters[charId];
    await this.updateClan(clanId, { $pull: { requests: { $in: [charId] } } });
    await char.updatePenalty('clan_request', 60);
  }

  /**
   * Добавляет игрока в клан и отправляет ему сообщение
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async acceptRequest(clanId: string, requesterID: string) {
    const clan = await this.getClanById(clanId);
    if (!clan.requests.some(({ id }) => id === requesterID)) {
      throw new ValidationError('Такой заявки не существует');
    }

    if (clan.players.find(({ id }) => id === requesterID)) {
      throw new ValidationError('Заявка уже принята');
    }

    if (!clan.hasEmptySlot) {
      throw new ValidationError('Клан уже сформирован');
    }
    const char = await CharacterService.getCharacterById(requesterID);

    await this.updateClan(clan.id, {
      $push: { players: requesterID },
      $pull: { requests: { $in: [requesterID] } },
    });

    await char?.joinClan(clan);
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
  static async leaveClan(clanId: string, charId: string) {
    const clan = await ClanService.getClanById(clanId);
    if (clan.owner.id === charId) {
      throw new ValidationError('Невозможно покинуть клан, где вы являетесь владельцем');
    }
    await this.updateClan(clanId, {
      $pull: { players: { $in: [charId] } },
    });
    const char = await CharacterService.getCharacterById(charId);
    await char?.leaveClan();
  }
}
