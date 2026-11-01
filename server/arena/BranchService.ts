import { BRANCHES, getBranchesByProf, MAX_BRANCHES, SECOND_BRANCH_MIN_CHAR_LVL, type BranchKey } from '@fwo/shared';
import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';

export default class BranchService {
  static async selectBranch(character: CharacterService, branchId: string) {
    const branchMeta = BRANCHES[branchId as BranchKey];
    if (!branchMeta) throw new ValidationError('Неизвестная ветка');
    if (branchMeta.prof !== character.prof) {
      throw new ValidationError('Эта ветка недоступна для вашего класса');
    }
    const selectedBranches = character.branches;
    if (selectedBranches.includes(branchId as BranchKey)) {
      throw new ValidationError('Эта ветка уже выбрана');
    }
    if (selectedBranches.length >= MAX_BRANCHES) {
      throw new ValidationError(`Вы уже выбрали максимальное количество веток (${MAX_BRANCHES})`);
    }
    if (selectedBranches.length === 1 && character.lvl < SECOND_BRANCH_MIN_CHAR_LVL) {
      throw new ValidationError(`Вторая ветка открывается на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`);
    }
    const branches = [...selectedBranches, branchMeta.id];
    await character.setBranches(branches);
    return { branches, selectedBranch: branchMeta };
  }

  static getBranchesInfo(character: CharacterService) {
    const selectedBranches = character.branches;
    return {
      branches: getBranchesByProf(character.prof).map((branch) => {
        const isSelected = selectedBranches.includes(branch.id);
        const atLimit = selectedBranches.length >= MAX_BRANCHES;
        const lockedLevel = selectedBranches.length === 1 && character.lvl < SECOND_BRANCH_MIN_CHAR_LVL;
        return {
          ...branch,
          isSelected,
          canSelect: !isSelected && !atLimit && !lockedLevel,
          lockReason: !isSelected && atLimit
            ? `Достигнут лимит специализаций (${MAX_BRANCHES} ветки)`
            : !isSelected && lockedLevel
              ? `Откроется на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`
              : undefined,
        };
      }),
      selectedBranches,
      canSelectSecondBranch: selectedBranches.length === 1 && character.lvl >= SECOND_BRANCH_MIN_CHAR_LVL,
      maxBranches: MAX_BRANCHES,
      secondBranchMinLvl: SECOND_BRANCH_MIN_CHAR_LVL,
    };
  }

  static hasSelectedBranch(character: CharacterService, action: { branches: BranchKey[] }) {
    return action.branches.length === 0 || action.branches.some((branch) =>
      BRANCHES[branch].prof === character.prof && character.branches.includes(branch),
    );
  }
}