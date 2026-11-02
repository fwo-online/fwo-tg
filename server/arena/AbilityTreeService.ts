import {
  type Ability,
  BRANCHES,
  CharacterClass,
  getAbilityState,
  getBranchesByProf,
  isInBranch,
  type TreeAbility,
} from '@fwo/shared';
import arena from '@/arena';
import type { CharacterService } from './CharacterService';
import PassiveSkillService from './PassiveSkillService';
import SkillService from './SkillService';

/** Read-only catalog. All purchases still go through their existing validated endpoints. */
export default class AbilityTreeService {
  static getClassAbilities(prof: `${CharacterClass}`): Ability[] {
    const passives = PassiveSkillService.getPassiveSkillList().filter(
      (skill) => skill.bonusCost.length > 0 && (!skill.classList || prof in skill.classList),
    );
    const spells = Object.values(arena.magics).filter((spell) =>
      spell.branches.some((branch) => BRANCHES[branch].prof === prof),
    );
    const skills = SkillService.getSkillListByProf(prof);

    return [
      ...spells.map((spell) => ({ kind: 'magic' as const, ...spell.toObject() })),
      ...skills.map((skill) => ({ kind: 'skill' as const, ...skill })),
      ...passives.map((skill) => ({ kind: 'passive' as const, ...skill })),
    ];
  }

  static decorateAbility(
    character: CharacterService,
    ability: Ability,
    prof: CharacterClass,
  ): TreeAbility {
    const state = getAbilityState(character.toObject(), ability, prof);

    return {
      ...ability,
      ...state,
    };
  }

  static getTree(character: CharacterService) {
    return {
      classes: Object.values(CharacterClass).map((prof) => {
        const abilities = AbilityTreeService.getClassAbilities(prof);
        const decorate = (ability: Ability) =>
          AbilityTreeService.decorateAbility(character, ability, prof);

        return {
          prof,
          branches: getBranchesByProf(prof).map((branch) => ({
            ...branch,
            abilities: abilities
              .filter((ability) => isInBranch(ability, branch.id))
              .map(decorate)
              .sort((a, b) => a.requiredLevel - b.requiredLevel),
          })),
        };
      }),
    };
  }
}
