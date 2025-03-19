import type { CharacterService } from './CharacterService';
import ValidationError from './errors/ValidationError';
import * as weaponMastery from './weaponMastery';

export type PassiveSkillNames = keyof typeof weaponMastery;

export default class PassiveSkillService {
  static passiveSkills = weaponMastery;

  static async learnPassiveSkill(char: CharacterService, id: string): Promise<CharacterService> {
    if (!this.isPassiveSkill(id)) {
      throw new ValidationError('Неизвестное умение');
    }

    const passiveSkill = PassiveSkillService.passiveSkills[id];
    const charPassiveSkillLvl = char.passiveSkills[id] ?? 0;

    if (passiveSkill.bonusCost[charPassiveSkillLvl] > char.bonus) {
      throw new ValidationError('Не хватает бонусов');
    }
    if (charPassiveSkillLvl + 1 > passiveSkill.bonusCost.length) {
      throw new ValidationError(`Умение ${passiveSkill.displayName} имеет максимальный уровень`);
    }

    char.bonus -= passiveSkill.bonusCost[charPassiveSkillLvl];
    await char.learnPassiveSkill(id, charPassiveSkillLvl + 1);
    return char;
  }

  static isPassiveSkill(id: string): id is keyof typeof this.passiveSkills {
    return id in this.passiveSkills;
  }

  static toObject(passiveSkill: (typeof this.passiveSkills)[keyof typeof this.passiveSkills]) {
    return {
      name: passiveSkill.name,
      displayName: passiveSkill.displayName,
      description: passiveSkill.description,
      bonusCost: passiveSkill.bonusCost,
      effect: passiveSkill.effect,
      chance: passiveSkill.chance,
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
