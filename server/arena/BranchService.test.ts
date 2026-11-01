import { describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import arena from '@/arena';
import TestUtils from '@/utils/testUtils';
import BranchService from './BranchService';
import MagicService from './MagicService';

describe('BranchService', () => {
  it('selects only first-class branches', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
    const char = arena.characters[doc.id];
    expect(BranchService.getBranchesInfo(char).branches.map((b) => b.id)).toEqual(['guardian', 'berserker', 'duelist']);
    await expect(BranchService.selectBranch(char, 'marksman')).rejects.toThrow('недоступна');
    await BranchService.selectBranch(char, 'guardian');
    expect(char.toObject().branches).toEqual(['guardian']);
    await expect(BranchService.selectBranch(char, 'guardian')).rejects.toThrow('уже выбрана');
  });

  it('unlocks second slot at level 5 and rejects third', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Archer });
    const char = arena.characters[doc.id];
    await BranchService.selectBranch(char, 'scout');
    expect(BranchService.getBranchesInfo(char).branches.find((b) => b.id === 'barrage')?.canSelect).toBe(false);
    await expect(BranchService.selectBranch(char, 'barrage')).rejects.toThrow('5-м уровне');
    await char.resources.addResources({ exp: 100000 });
    expect(char.lvl).toBeGreaterThanOrEqual(5);
    await BranchService.selectBranch(char, 'barrage');
    await expect(BranchService.selectBranch(char, 'marksman')).rejects.toThrow('максимальное');
  });

  it('does not wipe physical branches during a magic reset', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
    const char = arena.characters[doc.id];
    await BranchService.selectBranch(char, 'guardian');
    await MagicService.resetMagics(char);
    expect(char.branches).toEqual(['guardian']);
  });
});