import {
  type Ability,
  CharacterClass,
  getAbilityState,
  getBranchesByProf,
  isInBranch,
  type TreeAbility,
} from '@fwo/shared';
import { keyBy } from 'es-toolkit';
import MagicService from '@/arena/MagicService';
import type { CharacterService } from './CharacterService';
import PassiveSkillService from './PassiveSkillService';
import SkillService from './SkillService';

/** Read-only catalog. All purchases still go through their existing validated endpoints. */
export default class AbilityTreeService {
  static getClassAbilities(characterClass: CharacterClass): Ability[] {
    const passives = PassiveSkillService.getPassiveSkillListByClass(characterClass);
    const magics = MagicService.getMagicListByProf(characterClass);
    const skills = SkillService.getSkillListByProf(characterClass);

    return [
      ...magics.map((magic) => ({ kind: 'magic' as const, ...magic })),
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
    const tree = Object.values(CharacterClass).map((characterClass) => {
      const abilities = AbilityTreeService.getClassAbilities(characterClass);
      const decorate = (ability: Ability) =>
        AbilityTreeService.decorateAbility(character, ability, characterClass);

      return {
        class: characterClass,
        branches: getBranchesByProf(characterClass).map((branch) => ({
          ...branch,
          abilities: abilities
            .filter((ability) => isInBranch(ability, branch.id))
            .map(decorate)
            .sort((a, b) => a.requiredLevel - b.requiredLevel),
        })),
      };
    });

    return keyBy(tree, (item) => item.class);
  }
}
