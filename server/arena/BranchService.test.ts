import { beforeEach, describe, expect, it } from 'bun:test';
import { BRANCHES, CharacterClass, SECOND_BRANCH_MIN_CHAR_LVL } from '@fwo/shared';
import arena from '@/arena';
import TestUtils from '@/utils/testUtils';
import BranchService from './BranchService';
import type { CharacterService } from './CharacterService/CharacterService';
import MagicService from './MagicService';

describe('BranchService', () => {
  it('owns branch selection without a MagicService forwarding method', () => {
    expect(Object.hasOwn(MagicService, 'selectBranch')).toBe(false);
  });

  describe('selectBranch for mage', () => {
    let mage: CharacterService;

    beforeEach(async () => {
      const doc = await TestUtils.createCharacter({ prof: CharacterClass.Mage });
      mage = arena.characters[doc.id];
    });

    it('selects a first branch', async () => {
      const result = await BranchService.selectBranch(mage, 'elements');
      expect(result.branches).toEqual(['elements']);
      expect(mage.branches).toEqual(['elements']);
    });

    it('rejects a branch from another class', async () => {
      await expect(BranchService.selectBranch(mage, 'holy')).rejects.toThrow(
        'Эта ветка недоступна для вашего класса',
      );
    });

    it('rejects mage branches for a priest', async () => {
      const doc = await TestUtils.createCharacter({ prof: CharacterClass.Priest });
      const priest = arena.characters[doc.id];
      await expect(BranchService.selectBranch(priest, 'elements')).rejects.toThrow(
        'Эта ветка недоступна для вашего класса',
      );
    });

    it('rejects a duplicate branch', async () => {
      await BranchService.selectBranch(mage, 'elements');
      await expect(BranchService.selectBranch(mage, 'elements')).rejects.toThrow(
        'Эта ветка уже выбрана',
      );
    });

    it('rejects a second branch before required level', async () => {
      await BranchService.selectBranch(mage, 'elements');
      expect(mage.lvl).toBe(1);
      await expect(BranchService.selectBranch(mage, 'darkness')).rejects.toThrow(
        `Вторая ветка открывается на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`,
      );
    });

    it('allows a second branch at required level', async () => {
      await BranchService.selectBranch(mage, 'elements');
      await mage.resources.addResources({ exp: 1000000 });
      expect(mage.lvl).toBeGreaterThanOrEqual(SECOND_BRANCH_MIN_CHAR_LVL);
      const result = await BranchService.selectBranch(mage, 'darkness');
      expect(result.branches).toEqual(['elements', 'darkness']);
      expect(mage.branches).toEqual(['elements', 'darkness']);
    });

    it('rejects a third branch', async () => {
      await BranchService.selectBranch(mage, 'elements');
      await mage.resources.addResources({ exp: 1000000 });
      await BranchService.selectBranch(mage, 'darkness');
      await expect(BranchService.selectBranch(mage, 'arcana')).rejects.toThrow(
        'Вы уже выбрали максимальное количество веток (2)',
      );
    });
  });

  it('returns only the branch catalog for a mage', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Mage });
    const char = arena.characters[doc.id];
    const info = BranchService.getBranchesInfo(char);

    expect(Object.keys(info)).toEqual(['branches']);
    expect(info.branches).toHaveLength(3);
    expect(info.branches.map((b) => b.id)).toEqual(['elements', 'darkness', 'arcana']);
    expect(info.branches[0]).toEqual(BRANCHES.elements);
    expect(char.branches).toEqual([]);
  });

  it('returns the priest branch catalog', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Priest });
    const info = BranchService.getBranchesInfo(arena.characters[doc.id]);

    expect(info.branches).toHaveLength(3);
    expect(info.branches.map((b) => b.id)).toEqual(['holy', 'protection', 'inquisition']);
  });

  it('selects only first-class branches', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
    const char = arena.characters[doc.id];
    expect(BranchService.getBranchesInfo(char).branches.map((b) => b.id)).toEqual([
      'guardian',
      'berserker',
      'duelist',
    ]);
    await expect(BranchService.selectBranch(char, 'marksman')).rejects.toThrow('недоступна');
    await BranchService.selectBranch(char, 'guardian');
    expect(char.toObject().branches).toEqual(['guardian']);
    await expect(BranchService.selectBranch(char, 'guardian')).rejects.toThrow('уже выбрана');
  });

  it('unlocks second slot at required level and rejects third', async () => {
    const doc = await TestUtils.createCharacter({ prof: CharacterClass.Archer });
    const char = arena.characters[doc.id];
    await BranchService.selectBranch(char, 'scout');
    await expect(BranchService.selectBranch(char, 'barrage')).rejects.toThrow(
      `${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне`,
    );
    await char.resources.addResources({ exp: 1000000 });
    expect(char.lvl).toBeGreaterThanOrEqual(SECOND_BRANCH_MIN_CHAR_LVL);
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
