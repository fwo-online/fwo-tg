import { describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import arena from '@/arena';
import TestUtils from '@/utils/testUtils';
import BranchService from './BranchService';
import SkillService from './SkillService';

describe('SkillService branch learning', () => {
  it('requires own class, selected branch, level and bonus before spending', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Warrior, bonus: 10 });
    const char = arena.characters[doc.id];
    await expect(SkillService.learnSkill(char, 'dodge')).rejects.toThrow('класса');
    await expect(SkillService.learnSkill(char, 'parry')).rejects.toThrow('невыбранной');
    await BranchService.selectBranch(char, 'duelist');
    await SkillService.learnSkill(char, 'parry');
    expect(char.skills.parry).toBe(1);
    expect(char.resources.bonus).toBe(0);
    await expect(SkillService.learnSkill(char, 'parry')).rejects.toThrow('бонусов');
    await expect(SkillService.learnSkill(char, 'disarm')).rejects.toThrow('уровень');
  });

  it('allows a hybrid through its first-class branch', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Archer, bonus: 100, exp: 100000 });
    const char = arena.characters[doc.id];
    await BranchService.selectBranch(char, 'scout');
    await SkillService.learnSkill(char, 'disarm');
    expect(char.skills.disarm).toBe(1);
  });
});