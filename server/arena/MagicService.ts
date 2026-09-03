import {
  canLearnMagic,
  getBranchesByProf,
  getLearnMagicCost,
  MAGIC_BRANCHES,
  MAX_MAGIC_BRANCHES,
  type MagicBranchId,
  SECOND_BRANCH_MIN_CHAR_LVL,
} from '@fwo/shared';
import { mapValues } from 'es-toolkit';
import arena from '@/arena';
import config from '@/arena/config';
import ValidationError from '@/arena/errors/ValidationError';
import MiscService from '@/arena/MiscService';
import type { Prof } from '@/data/profs';
import type { CharacterService } from './CharacterService';

const chance = config.magic.learnChance;

function learnChance() {
  return chance > MiscService.dice('1d100');
}

/**
 * @class Сервис работы с магиями
 */
export default class MagicService {
  static MAX_MAGIC_LVL = 3;

  static isMagic(maybeMagic: string): maybeMagic is keyof (typeof arena)['magics'] {
    return maybeMagic in arena.magics;
  }

  /**
   * Выбор ветки специализации магии
   */
  static async selectBranch(character: CharacterService, branchId: MagicBranchId) {
    const branchMeta = MAGIC_BRANCHES[branchId];
    if (!branchMeta) {
      throw new ValidationError('Неизвестная ветка магии');
    }

    if (branchMeta.prof !== character.prof) {
      throw new ValidationError('Эта ветка недоступна для вашего класса');
    }

    const currentBranches = character.magicBranches;
    if (currentBranches.includes(branchId)) {
      throw new ValidationError('Эта ветка уже выбрана');
    }

    if (currentBranches.length >= MAX_MAGIC_BRANCHES) {
      throw new ValidationError(
        `Вы уже выбрали максимальное количество веток (${MAX_MAGIC_BRANCHES})`,
      );
    }

    if (currentBranches.length === 1 && character.lvl < SECOND_BRANCH_MIN_CHAR_LVL) {
      throw new ValidationError(
        `Вторая ветка открывается на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`,
      );
    }

    const updatedBranches = [...currentBranches, branchId];
    await character.setMagicBranches(updatedBranches);

    return {
      branches: updatedBranches,
      selectedBranch: branchMeta,
    };
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

    const magicBranches = magic.branches;

    if (!magicBranches || magicBranches.length === 0) {
      throw new ValidationError('Заклинание не привязано к ветке магии');
    }

    const hasMatchingBranch = magicBranches.some((b) => character.magicBranches.includes(b));

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
      magicBranches: character.magicBranches,
    };
  }

  /**
   * Информация о ветках персонажа: выбранные, доступные для выбора, заблокированные
   */
  static getBranchesInfo(character: CharacterService) {
    const allBranches = getBranchesByProf(character.prof);
    const selectedBranches = character.magicBranches;
    const canSelectSecondBranch =
      selectedBranches.length === 1 && character.lvl >= SECOND_BRANCH_MIN_CHAR_LVL;
    const canSelectAny = selectedBranches.length < MAX_MAGIC_BRANCHES;

    const branches = allBranches.map((branch) => {
      const isSelected = selectedBranches.includes(branch.id);
      let canSelect = false;
      let lockReason: string | undefined;

      if (isSelected) {
        canSelect = false;
      } else if (!canSelectAny) {
        canSelect = false;
        lockReason = `Достигнут лимит специализаций (${MAX_MAGIC_BRANCHES} ветки)`;
      } else if (selectedBranches.length === 1 && character.lvl < SECOND_BRANCH_MIN_CHAR_LVL) {
        canSelect = false;
        lockReason = `Откроется на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`;
      } else {
        canSelect = true;
      }

      return {
        ...branch,
        isSelected,
        canSelect,
        lockReason,
      };
    });

    return {
      branches,
      selectedBranches,
      canSelectSecondBranch,
      maxBranches: MAX_MAGIC_BRANCHES,
      secondBranchMinLvl: SECOND_BRANCH_MIN_CHAR_LVL,
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
   * @deprecated
   * Изучение магии со случайным выбором (обратная совместимость)
   * @param lvl круг проучиваемой магии
   */
  static async learnMagic(character: CharacterService, lvl: number) {
    if (!canLearnMagic(character.lvl, lvl)) {
      throw new ValidationError('Слишком низкий уровень персонажа');
    }

    const magicsToLearn = MagicService.getMagicsToLearn(character, lvl);
    if (!magicsToLearn.length) {
      throw new ValidationError('Нет магий для изучения');
    }

    const magic = magicsToLearn[MiscService.randInt(0, magicsToLearn.length)];

    await character.resources.takeResources({ bonus: getLearnMagicCost(lvl) });

    if (!learnChance()) {
      throw new ValidationError('Не удалось выучить. Удача не на твоей стороне');
    }

    const charMagicLvl = character.magics[magic.name] || 0;
    await character.learnMagic(magic.name, charMagicLvl + 1);

    return magic;
  }

  /**
   * @deprecated
   * Возвращает доступные магии на данном круге для изучения
   * @param lvl круг проучиваемой магии
   */
  static getMagicsToLearn(character: CharacterService, lvl: number) {
    const magicsByLvl = MagicService.getMagicListByProf(character.prof, lvl);

    return magicsByLvl.filter((magic) => {
      // Если у персонажа есть выбранные ветки, фильтруем по ним
      if (
        character.magicBranches.length > 0 &&
        !magic.branches?.some((b) => character.magicBranches.includes(b))
      ) {
        return false;
      }
      return (character.magics[magic.name] ?? 0) < MagicService.MAX_MAGIC_LVL;
    });
  }

  /** @deprecated */
  static getAvaiableLevels(character: CharacterService) {
    const magics = MagicService.getMagicListByProf(character.class);

    const magicsToLearn = magics.filter((magic) => {
      if (
        character.magicBranches.length > 0 &&
        !magic.branches?.some((b) => character.magicBranches.includes(b))
      ) {
        return false;
      }
      return (character.magics[magic.name] ?? 0) < MagicService.MAX_MAGIC_LVL;
    });

    const magicsByLvl = Object.groupBy(magicsToLearn, ({ lvl }) => lvl);
    return mapValues(magicsByLvl, (magics) => Boolean(magics?.length));
  }

  /**
   * Показываем описание магии
   * @param magId строка идентификатор магии
   */
  static getMagicById(magic: string, prof?: string) {
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
