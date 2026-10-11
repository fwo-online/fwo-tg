import {
  BRANCHES,
  type BranchKey,
  type CharacterClass,
  MAX_BRANCHES,
  SECOND_BRANCH_MIN_CHAR_LVL,
} from '@fwo/shared';

/** Error message for an invalid complete branch selection, or undefined if valid. */
export function validateBranches(
  branches: readonly BranchKey[],
  classes: readonly CharacterClass[],
  level: number,
): string | undefined {
  if (!Array.isArray(branches) || branches.length > MAX_BRANCHES) {
    return `Вы уже выбрали максимальное количество веток (${MAX_BRANCHES})`;
  }
  if (new Set(branches).size !== branches.length) {
    return 'Эта ветка уже выбрана';
  }
  for (const branch of branches) {
    if (typeof branch !== 'string' || !Object.hasOwn(BRANCHES, branch)) {
      return 'Неизвестная ветка';
    }
    if (!classes.includes(BRANCHES[branch as BranchKey].prof as CharacterClass)) {
      return 'Эта ветка недоступна для вашего класса';
    }
  }
  if (branches.length === 2 && level < SECOND_BRANCH_MIN_CHAR_LVL) {
    return `Вторая ветка открывается на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`;
  }
}
