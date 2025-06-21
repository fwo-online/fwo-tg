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
import {
  type ClanPublic,
  type Clan as ClanSchema,
  clanAcceptCostPerLvl,
  clanForgeCostMultiplier,
  clanLvlCost,
  monstersClanName,
  reservedClanName,
} from '@fwo/shared';
import type { UpdateQuery } from 'mongoose';

/**
 * Clan Service
 *
 * @description Набор функций для работы с кланами.
 * @module Service/Clan
 */
export class ClanService {
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
    const char = await CharacterService.getCharacterById(charId);
    if (name === reservedClanName || name === monstersClanName) {
      throw new ValidationError('Недопустимое название клана');
    }
    await char.resources.takeResources({ gold: clanLvlCost[0] });

    const clan = await createClan(charId, name);
    await char.joinClan(clan);

    arena.clans.set(clan.id, clan);
    return ClanService.toObject(clan);
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
    if (!clan.owner._id.equals(ownerId)) {
      throw new ValidationError('Вы не являетесь владельцем клана');
    }

    const promises = clan.players.map(async (player) => {
      const char = await CharacterService.getCharacterById(player.id);
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
    if (clan.lvl >= clanLvlCost.length) {
      throw new ValidationError('Клан имеет максимальный уровень');
    }
    const cost = clanLvlCost[clan.lvl];
    if (clan.gold < cost) {
      throw new ValidationError('В казне недостаточно золота');
    }
    const updated = await this.updateClan(clan.id, { $inc: { gold: -cost, lvl: 1 } });
    return ClanService.toObject(updated);
  }

  /**
   * Добавляет золото в клан и забирает у персонажа
   * @param clanId - id клана
   * @param charId - id игрока
   * @param gold - количество золота
   */
  static async addGold(clanId: string, charId: string, gold: number) {
    const char = await CharacterService.getCharacterById(charId);
    await char.resources.takeResources({ gold });

    const clan = await this.updateClan(clanId, { $inc: { gold } });

    return ClanService.toObject(clan);
  }

  /**
   * Создаёт заявку на вступление в клан
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async createRequest(clanId: string, charId: string) {
    const char = await CharacterService.getCharacterById(charId);
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

    const requestClan = await getClanByPlayerRequest(charId);

    if (requestClan) {
      throw new ValidationError('Сначала отмени предыдущую заявку');
    }

    if (!clan.hasEmptySlot) {
      throw new ValidationError('Клан уже сформирован');
    }

    const updatedClan = await this.updateClan(clanId, { $push: { requests: charId } });

    return this.toObject(updatedClan);
  }

  /**
   * Отмена заявки игроком
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async removeRequest(clanId: string, charId: string) {
    const char = await CharacterService.getCharacterById(charId);
    const clan = await this.updateClan(clanId, { $pull: { requests: { $in: [charId] } } });
    await char.updatePenalty('clan_request', 60);

    return this.toObject(clan);
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
    const cost = char.lvl * clanAcceptCostPerLvl;

    if (clan.gold < cost) {
      throw new ValidationError('В казне недостаточно золота');
    }

    const updatedClan = await this.updateClan(clan.id, {
      $push: { players: requesterID },
      $pull: { requests: { $in: [requesterID] } },
      $inc: { gold: -cost },
    });

    await char?.joinClan(clan);

    return ClanService.toObject(updatedClan);
  }

  /**
   * Отклоняет запрос игрока
   * @param clanId - id клана
   * @param charId - id игрока
   */
  static async rejectRequest(clanId: string, charId: string) {
    const clan = await this.getClanById(clanId);

    const updatedClan = await this.updateClan(clan.id, {
      $pull: { requests: { $in: [charId] } },
    });

    return ClanService.toObject(updatedClan);
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

  static async updateChannel(clanID: string, ownerID: string, channel?: number) {
    const clan = await this.getClanById(clanID);
    if (!clan.owner._id.equals(ownerID)) {
      throw new ValidationError('Вы не являетесь владельцем клана');
    }
    await this.updateClan(clan.id, { channel });
  }

  static async openForge(clanId: string) {
    const clan = await this.getClanById(clanId);

    if (clan.isForgeActive) {
      throw new ValidationError('Кузница уже активна');
    }

    const cost = clanLvlCost[clan.lvl - 1] * clanForgeCostMultiplier;
    if (clan.gold < cost) {
      throw new ValidationError('В казне недостаточно золота');
    }

    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + 1));

    const updated = await this.updateClan(clanId, {
      $set: {
        'forge.openedAt': new Date(),
        'forge.expiresAt': expiresAt,
        'forge.lvl': this.getForgeLevel(clan.lvl),
      },
      $inc: { gold: -cost },
    });

    return this.toObject(updated);
  }

  static async checkForge(claiId: string) {
    const clan = await this.getClanById(claiId);

    if (!clan.isForgeActive) {
      throw new ValidationError('Кузница не активна');
    }
  }

  static getForgeLevel(clanLvl: number) {
    if (clanLvl >= 5) return 3;
    if (clanLvl >= 3) return 2;
    if (clanLvl >= 1) return 1;
    return 0;
  }

  static getForgeModifier(forgeLvl: number) {
    return forgeLvl * 0.1;
  }

  static toObject(clan: Clan): ClanSchema {
    return {
      id: clan._id?.toString(),
      name: clan.name,
      gold: clan.gold,
      lvl: clan.lvl,
      hasEmptySlot: clan.hasEmptySlot,
      requests: clan.requests.map(({ _id }) => _id.toString()),
      players: clan.players.map(({ _id }) => _id.toString()),
      owner: clan.owner._id.toString(),
      maxPlayers: clan.maxPlayers,
      forge: {
        active: clan.isForgeActive,
        lvl: clan.forge.lvl ?? this.getForgeLevel(clan.lvl),
        expiresAt: clan.forge?.expiresAt?.toString() ?? null,
      },
      channel: clan.channel,
    };
  }

  static toPublicObject(clan: Clan): ClanPublic {
    return {
      id: clan._id.toString(),
      name: clan.name,
      owner: clan.owner._id.toString(),
      players: clan.players.map(({ _id }) => _id.toString()),
    };
  }
}
