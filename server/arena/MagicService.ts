import { canLearnMagic, getLearnMagicCost, type MagicBranchId } from '@fwo/shared';
import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { Prof } from '@/data/profs';
import type { CharacterService } from './CharacterService';

/**
 * @class Сервис работы с магиями
 */
export default class MagicService {
  static MAX_MAGIC_LVL = 3;

  static isMagic(maybeMagic: string): maybeMagic is keyof (typeof arena)['magics'] {
    return maybeMagic in arena.magics;
  }

  /**
   * Целенаправленное изучение/повышение уровня конкретного заклинания
   */
  static async learnSpecificMagic(character: CharacterService, magicName: string) {
    if (!MagicService.isMagic(magicName)) {
      throw new ValidationError('Заклинание не найдено');
    }

    const magic = arena.magics[magicName];

    if (!magic.profList.includes(character.prof)) {
      throw new ValidationError('Заклинание недоступно для вашего класса');
    }

    const spellBranches = magic.branches;

    if (!spellBranches || spellBranches.length === 0) {
      throw new ValidationError('Заклинание не привязано к ветке магии');
    }

    const hasMatchingBranch = spellBranches.some((b) => character.branches.includes(b));

    if (!hasMatchingBranch) {
      throw new ValidationError('Заклинание принадлежит невыбранной ветке специализации');
    }

    if (!canLearnMagic(character.lvl, magic.lvl)) {
      throw new ValidationError('Слишком низкий уровень персонажа для этого круга магии');
    }

    const currentCharMagicLvl = character.magics[magicName] ?? 0;
    if (currentCharMagicLvl >= MagicService.MAX_MAGIC_LVL) {
      throw new ValidationError('Заклинание уже развито до максимального уровня');
    }

    const cost = getLearnMagicCost(magic.lvl);
    if (character.resources.bonus < cost) {
      throw new ValidationError('Недостаточно очков бонусов');
    }

    await character.resources.takeResources({ bonus: cost });
    await character.learnMagic(magicName, currentCharMagicLvl + 1);

    return magic.toObject();
  }

  /**
   * Сброс всех выученных магий и веток специализации с возвратом очков bonus
   */
  static async resetMagics(character: CharacterService) {
    let totalRefundBonus = 0;

    for (const [magicName, lvl] of Object.entries(character.magics)) {
      if (MagicService.isMagic(magicName)) {
        const magic = arena.magics[magicName];
        const costPerLvl = getLearnMagicCost(magic.lvl);
        totalRefundBonus += costPerLvl * lvl;
      }
    }

    await character.resetMagics();

    if (totalRefundBonus > 0) {
      await character.resources.addResources({ bonus: totalRefundBonus });
    }

    return {
      refundedBonus: totalRefundBonus,
      magics: character.magics,
      branches: character.branches,
    };
  }

  /**
   * Получить заклинания конкретной ветки
   */
  static getBranchMagics(character: CharacterService, branchId: MagicBranchId) {
    const allMagics = MagicService.getMagicListByProf(character.prof);
    return allMagics
      .filter((m) => {
        return m.branches?.includes(branchId);
      })
      .sort((a, b) => a.lvl - b.lvl);
  }

  /**
   * Показываем описание магии
   * @param magId строка идентификатор магии
   */
  static getMagicById(magic: string) {
    return arena.magics[magic as keyof (typeof arena)['magics']].toObject();
  }

  /**
   * Список доступных магий для профы на заданном круге
   * @param prof профессия персонажа
   * @param lvl круг магии
   * @returns возвращает магии всех кругов если не передан круг
   */
  static getMagicListByProf(prof: Prof, lvl?: number) {
    return Object.values(arena.magics)
      .filter((magic) => {
        if (!lvl) {
          return magic.profList.includes(prof);
        }

        return magic.lvl === lvl && magic.profList.includes(prof);
      })
      .map((magic) => magic.toObject())
      .sort((a, b) => a.lvl - b.lvl);
  }

  static getMagicListByIds(magics: string[], prof?: string) {
    return magics.map((m) => MagicService.getMagicById(m, prof)).sort((a, b) => a.lvl - b.lvl);
  }
}
