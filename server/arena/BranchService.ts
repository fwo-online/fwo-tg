import {
  BRANCHES,
  type BranchKey,
  getBranchesByProf,
  hasSelectedBranchForProf,
  MAX_BRANCHES,
  SECOND_BRANCH_MIN_CHAR_LVL,
} from '@fwo/shared';
import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';

export default class BranchService {
  static async selectBranch(character: CharacterService, branchKey: BranchKey) {
    const branch = BRANCHES[branchKey];
    if (!branch) {
      throw new ValidationError('Неизвестная ветка');
    }
    if (branch.class !== character.prof) {
      throw new ValidationError('Эта ветка недоступна для вашего класса');
    }
    const selectedBranches = character.branches;
    if (selectedBranches.includes(branchKey)) {
      throw new ValidationError('Эта ветка уже выбрана');
    }
    if (selectedBranches.length >= MAX_BRANCHES) {
      throw new ValidationError(`Вы уже выбрали максимальное количество веток (${MAX_BRANCHES})`);
    }
    if (selectedBranches.length === 1 && character.lvl < SECOND_BRANCH_MIN_CHAR_LVL) {
      throw new ValidationError(
        `Вторая ветка открывается на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`,
      );
    }
    const branches = [...selectedBranches, branch.id];
    await character.setBranches(branches);
    return { branches, selectedBranch: branch };
  }

  static getBranchesInfo(character: CharacterService) {
    return {
      branches: getBranchesByProf(character.prof),
    };
  }

  static hasSelectedBranch(
    character: CharacterService,
    action: { branch?: BranchKey; branches?: readonly BranchKey[] | BranchKey[] },
  ) {
    return hasSelectedBranchForProf(character.prof, character.branches, action);
  }
}
