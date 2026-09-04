import type { CostType, Skill } from '@fwo/shared';
import type { Prof } from '@/data/profs';
import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';
import * as skills from './skills';

export type SkillsNames = keyof typeof skills;

export default class SkillService {
  static skills = skills;

  static async learnSkill(char: CharacterService, id: string): Promise<CharacterService> {
    if (!SkillService.isSkill(id)) {
      throw new ValidationError('Неизвестное умение');
    }

    const skill = SkillService.skills[id];
    const charSkillLvl = char.skills[id] ?? 0;
    const skillLvl = skill.profList[char.prof] ?? 0;

    if (skill.profList) {
      if (!(char.prof in skill.profList)) {
        throw new ValidationError('Умение недоступно для твоего класса');
      }

      if (skillLvl > char.lvl) {
        throw new ValidationError('Твой уровень ниже уровня умения');
      }
    }

    if (char.branches?.length > 0) {
      if ('branches' in skill && skill.branches?.length) {
        if (!skill.branches.some((b) => char.branches.includes(b))) {
          throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
        }
      } else if ('branch' in skill && skill.branch) {
        if (!char.branches.includes(skill.branch)) {
          throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
        }
      }
    } else if (!skill.profList && ('branch' in skill && skill.branch || 'branches' in skill && skill.branches?.length)) {
      throw new ValidationError('Умение принадлежит невыбранной ветке специализации');
    }
    if (skill.bonusCost[charSkillLvl] > char.resources.bonus) {
      throw new ValidationError('Не хватает бонусов');
    }
    if (charSkillLvl + 1 > skill.bonusCost.length) {
      throw new ValidationError(`Умение ${skill.displayName} имеет максимальный уровень`);
    }

    await char.resources.takeResources({ bonus: skill.bonusCost[charSkillLvl] });
    await char.learnSkill(id, charSkillLvl + 1);
    return char;
  }

  static isSkill(id: string): id is keyof typeof skills {
    return id in skills;
  }

  static toObject(skill: (typeof skills)[keyof typeof skills]): Skill {
    return {
      name: skill.name,
      displayName: skill.displayName,
      description: skill.desc,
      classList: skill.profList,
      bonusCost: skill.bonusCost,
      cost: skill.cost[0],
      costType: skill.costType as CostType,
      orderType: skill.orderType,
      chance: skill.chance,
      effect: skill.effect,
      branch: 'branch' in skill ? skill.branch : undefined,
      branches: 'branches' in skill ? (skill.branches as any) : undefined,
    };
  }

  static getSkillById(id: string) {
    if (!SkillService.isSkill(id)) {
      throw new Error();
    }

    return SkillService.toObject(this.skills[id]);
  }

  static getSkillListByProf(prof: Prof) {
    return Object.values(skills)
      .filter(({ profList }) => prof in profList)
      .map(SkillService.toObject);
  }

  static getSkillList(ids: string[]) {
    return ids.map(SkillService.getSkillById);
  }
}
