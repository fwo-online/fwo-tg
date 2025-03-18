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

    if (skillLvl > char.lvl) {
      throw new ValidationError('Твой уровень ниже уровня умения');
    }
    if (skill.bonusCost[charSkillLvl] > char.bonus) {
      throw new ValidationError('Не хватает бонусов');
    }
    if (charSkillLvl + 1 > skill.bonusCost.length) {
      throw new ValidationError(`Умение ${skill.displayName} имеет максимальный уровень`);
    }

    char.bonus -= skill.bonusCost[charSkillLvl];
    await char.learnSkill(id, charSkillLvl + 1);
    return char;
  }

  static isSkill(id: string): id is keyof typeof skills {
    return id in skills;
  }

  static toObject(skill: (typeof skills)[keyof typeof skills]) {
    return {
      name: skill.name,
      displayName: skill.displayName,
      description: skill.desc,
      classList: skill.profList,
      bonusCost: skill.bonusCost,
    };
  }

  static getSkillById(id: string) {
    if (!SkillService.isSkill(id)) {
      throw new Error();
    }

    return SkillService.toObject(skills[id]);
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
