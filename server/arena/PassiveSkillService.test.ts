import { describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import arena from '@/arena';
import PassiveSkillService from '@/arena/PassiveSkillService';
import BranchService from '@/arena/BranchService';
import TestUtils from '@/utils/testUtils';

describe('PassiveSkillService', () => {
  it('should allow archer to learn ricochet and criticalStrike', async () => {
    const charDoc = await TestUtils.createCharacter({
      prof: CharacterClass.Archer,
      bonus: 100,
      lvl: 10,
    });
    const char = arena.characters[charDoc.id];

    await expect(PassiveSkillService.learnPassiveSkill(char, 'ricochet')).rejects.toThrow('невыбранной');
    await BranchService.selectBranch(char, 'marksman');
    await PassiveSkillService.learnPassiveSkill(char, 'ricochet');
    expect(char.passiveSkills.ricochet).toBe(1);
    expect(char.resources.bonus).toBe(90); // 100 - 10 (lvl 1 cost)

    await PassiveSkillService.learnPassiveSkill(char, 'criticalStrike');
    expect(char.passiveSkills.criticalStrike).toBe(1);
    expect(char.resources.bonus).toBe(80); // 90 - 10 (lvl 1 cost)
  });

  it('keeps shared weapon mastery branch-free and checks bonus', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Warrior, bonus: 30 });
    const char = arena.characters[doc.id];
    await PassiveSkillService.learnPassiveSkill(char, 'chopWeapon');
    expect(char.charObj.passiveSkills.chopWeapon).toBe(1);
    await expect(PassiveSkillService.learnPassiveSkill(char, 'chopWeapon')).rejects.toThrow('бонусов');
    const archerDoc = await TestUtils.createCharacter({ prof: CharacterClass.Archer, bonus: 100 });
    const archer = arena.characters[archerDoc.id];
    await expect(PassiveSkillService.learnPassiveSkill(archer, 'fieldMedic')).rejects.toThrow('невыбранной');
    await BranchService.selectBranch(archer, 'scout');
    await PassiveSkillService.learnPassiveSkill(archer, 'fieldMedic');
  });

  it('should reject non-archer from learning archer-specific passive skills', async () => {
    const warriorDoc = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      bonus: 100,
      lvl: 10,
    });
    const warrior = arena.characters[warriorDoc.id];

    await expect(
      PassiveSkillService.learnPassiveSkill(warrior, 'ricochet'),
    ).rejects.toThrow('Умение недоступно для твоего класса');

    await expect(
      PassiveSkillService.learnPassiveSkill(warrior, 'criticalStrike'),
    ).rejects.toThrow('Умение недоступно для твоего класса');
  });

  it('should reject learning beyond max level 6', async () => {
    const charDoc = await TestUtils.createCharacter({
      prof: CharacterClass.Archer,
      bonus: 1000,
      lvl: 10,
    });
    const char = arena.characters[charDoc.id];

    // Learn all 6 levels
    for (let i = 1; i <= 6; i++) {
      await PassiveSkillService.learnPassiveSkill(char, 'criticalStrike');
      expect(char.passiveSkills.criticalStrike).toBe(i);
    }

    // 7th level should fail
    await expect(
      PassiveSkillService.learnPassiveSkill(char, 'criticalStrike'),
    ).rejects.toThrow('имеет максимальный уровень');
  });

  it('should return classList in toObject', () => {
    const ricochetData = PassiveSkillService.getPassiveSkillById('ricochet');
    expect(ricochetData.classList).toEqual({ l: 1 });
    expect(ricochetData.bonusCost.length).toBe(6);

    const critData = PassiveSkillService.getPassiveSkillById('criticalStrike');
    expect(critData.classList).toEqual({ l: 1 });
    expect(critData.bonusCost.length).toBe(6);
  });
});
