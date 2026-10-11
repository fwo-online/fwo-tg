import {
  canLearnMagic,
  getBranchesByProf,
  getLearnMagicCost,
  MAGIC_BRANCHES,
  MAX_MAGIC_BRANCHES,
  type MagicBranchId,
  SECOND_BRANCH_MIN_CHAR_LVL,
} from '@fwo/shared';
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
   * Выбор ветки специализации магии
   */
  static async selectBranch(character: CharacterService, branchId: MagicBranchId) {
    const branchMeta = MAGIC_BRANCHES[branchId];
    if (!branchMeta) {
      throw new ValidationError('Неизвестная ветка магии');
    }

    if (!character.classes.some((cls) => cls === branchMeta.prof)) {
      throw new ValidationError('Эта ветка недоступна для вашего класса');
    }

    const currentBranches = character.branches;
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
    await character.setBranches(updatedBranches);

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

    if (!character.classes.some((cls) => magic.profList.includes(cls))) {
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
   * Информация о ветках персонажа: выбранные, доступные для выбора, заблокированные
   */
  static getBranchesInfo(character: CharacterService) {
    const allBranches = character.classes
      .flatMap((cls) => getBranchesByProf(cls))
      .filter((branch) => branch.id in MAGIC_BRANCHES);
    const selectedBranches = character.branches;
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
    const allMagics = [
      ...new Map(
        character.classes
          .flatMap((cls) => MagicService.getMagicListByProf(cls))
          .map((m) => [m.name, m]),
      ).values(),
    ];
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
  static getMagicById(magic: string, _prof?: string) {
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

  static getMagicListForCharacter(character: CharacterService) {
    return Object.values(arena.magics)
      .filter((magic) => character.classes.some((cls) => magic.profList.includes(cls)))
      .map((magic) => magic.toObject())
      .sort((a, b) => a.lvl - b.lvl);
  }

  static getMagicListByIds(magics: string[], prof?: string) {
    return magics.map((m) => MagicService.getMagicById(m, prof)).sort((a, b) => a.lvl - b.lvl);
  }
}
