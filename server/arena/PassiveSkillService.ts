import type { PassiveSkill } from '@fwo/shared';
import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';
import * as passiveSkills from './passiveSkills';
import * as weaponMastery from './weaponMastery';

export type PassiveSkillNames = keyof typeof weaponMastery | keyof typeof passiveSkills;

export default class PassiveSkillService {
  static passiveSkills = { ...weaponMastery, ...passiveSkills };

  static async learnPassiveSkill(char: CharacterService, id: string): Promise<CharacterService> {
    if (!this.isPassiveSkill(id)) {
      throw new ValidationError('Неизвестное умение');
    }

    const passiveSkill = PassiveSkillService.passiveSkills[id];
    const charPassiveSkillLvl = char.passiveSkills[id] ?? 0;

    if (passiveSkill.profList) {
      if (!(char.prof in passiveSkill.profList)) {
        throw new ValidationError('Умение недоступно для твоего класса');
      }

      const requiredLvl = passiveSkill.profList[char.prof] ?? 0;
      if (char.lvl < requiredLvl) {
        throw new ValidationError('Твой уровень ниже уровня умения');
      }
    }

    if (char.branches?.length > 0) {
      if ('branches' in passiveSkill && passiveSkill.branches?.length) {
        if (!passiveSkill.branches.some((b: any) => char.branches.includes(b))) {
          throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
        }
      } else if ('branch' in passiveSkill && passiveSkill.branch) {
        if (!char.branches.includes(passiveSkill.branch)) {
          throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
        }
      }
    } else if (!passiveSkill.profList && ('branch' in passiveSkill && passiveSkill.branch || 'branches' in passiveSkill && passiveSkill.branches?.length)) {
      throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
    }

    if (charPassiveSkillLvl + 1 > passiveSkill.bonusCost.length) {
      throw new ValidationError(`Умение ${passiveSkill.displayName} имеет максимальный уровень`);
    }
    await char.resources.takeResources({ bonus: passiveSkill.bonusCost[charPassiveSkillLvl] });

    await char.learnPassiveSkill(id, charPassiveSkillLvl + 1);
    return char;
  }

  static isPassiveSkill(id: string): id is keyof typeof this.passiveSkills {
    return id in this.passiveSkills;
  }

  static toObject(passiveSkill: (typeof this.passiveSkills)[keyof typeof this.passiveSkills]): PassiveSkill {
    return {
      name: passiveSkill.name,
      displayName: passiveSkill.displayName,
      description: passiveSkill.description,
      bonusCost: passiveSkill.bonusCost,
      effect: passiveSkill.effect,
      chance: passiveSkill.chance,
      classList: passiveSkill.profList,
      branch: 'branch' in passiveSkill ? (passiveSkill.branch as any) : undefined,
      branches: 'branches' in passiveSkill ? (passiveSkill.branches as any) : undefined,
    };
  }

  static getPassiveSkillById(id: string) {
    if (!PassiveSkillService.isPassiveSkill(id)) {
      throw new Error();
    }

    return PassiveSkillService.toObject(PassiveSkillService.passiveSkills[id]);
  }

  static getPassiveSkillList(ids: string[] = Object.keys(PassiveSkillService.passiveSkills)) {
    return ids.map(PassiveSkillService.getPassiveSkillById);
  }
}
