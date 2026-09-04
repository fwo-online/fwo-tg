import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { registerGlobals } from '@/utils/registerGlobals';
import TestUtils from '@/utils/testUtils';
import { CharacterService } from './CharacterService/CharacterService';
import MagicService from './MagicService';

registerGlobals();

describe('MagicService with branches', () => {
  let mage: CharacterService;
  let priest: CharacterService;

  beforeEach(async () => {
    const mageChar = await TestUtils.createCharacter({
      prof: CharacterClass.Mage,
      harks: { str: 10, dex: 10, wis: 20, int: 20, con: 10 },
    });
    mage = await CharacterService.getCharacterById(mageChar.id);
    // @ts-expect-error
    spyOn(mage, 'saveToDb').mockImplementation(async () => mage.charObj);

    const priestChar = await TestUtils.createCharacter({
      prof: CharacterClass.Priest,
      harks: { str: 10, dex: 10, wis: 20, int: 20, con: 10 },
    });
    priest = await CharacterService.getCharacterById(priestChar.id);
    // @ts-expect-error
    spyOn(priest, 'saveToDb').mockImplementation(async () => priest.charObj);
  });

  describe('getBranchesInfo', () => {
    it('should return 3 branches for mage with all canSelect initially', () => {
      const info = MagicService.getBranchesInfo(mage);
      expect(info.branches).toHaveLength(3);
      expect(info.branches.map((b) => b.id)).toEqual(['elements', 'darkness', 'arcana']);
      expect(info.branches.every((b) => b.canSelect)).toBe(true);
      expect(info.selectedBranches).toHaveLength(0);
    });

    it('should return 3 branches for priest', () => {
      const info = MagicService.getBranchesInfo(priest);
      expect(info.branches).toHaveLength(3);
      expect(info.branches.map((b) => b.id)).toEqual(['holy', 'protection', 'inquisition']);
    });
  });

  describe('selectBranch', () => {
    it('should select first branch successfully', async () => {
      const result = await MagicService.selectBranch(mage, 'elements');
      expect(result.branches).toEqual(['elements']);
      expect(mage.magicBranches).toEqual(['elements']);
    });

    it('should throw if branch belongs to another class', async () => {
      expect(MagicService.selectBranch(mage, 'holy')).rejects.toThrow(
        'Эта ветка недоступна для вашего класса',
      );
    });

    it('should throw if selecting already selected branch', async () => {
      await MagicService.selectBranch(mage, 'elements');
      expect(MagicService.selectBranch(mage, 'elements')).rejects.toThrow('Эта ветка уже выбрана');
    });

    it('should throw if selecting second branch before level 10', async () => {
      await MagicService.selectBranch(mage, 'elements');
      // mage is lvl 1
      expect(mage.lvl).toBe(1);
      expect(MagicService.selectBranch(mage, 'darkness')).rejects.toThrow(
        'Вторая ветка открывается на 10-м уровне персонажа',
      );
    });

    it('should allow selecting second branch at level 10+', async () => {
      await MagicService.selectBranch(mage, 'elements');
      // Level up to 5: need 1000 * 3 * lvl
      await mage.resources.addResources({ exp: 10000000 });
      expect(mage.lvl).toBeGreaterThanOrEqual(10);

      const result = await MagicService.selectBranch(mage, 'darkness');
      expect(result.branches).toEqual(['elements', 'darkness']);
      expect(mage.magicBranches).toEqual(['elements', 'darkness']);
    });

    it('should throw if selecting third branch', async () => {
      await MagicService.selectBranch(mage, 'elements');
      await mage.resources.addResources({ exp: 100000 });
      await MagicService.selectBranch(mage, 'darkness');

      expect(MagicService.selectBranch(mage, 'arcana')).rejects.toThrow(
        'Вы уже выбрали максимальное количество веток (2)',
      );
    });
  });

  describe('learnSpecificMagic', () => {
    beforeEach(async () => {
      await MagicService.selectBranch(mage, 'elements');
      await mage.resources.addResources({ bonus: 50 });
    });

    it('should learn magic with 100% chance and deduct bonus', async () => {
      // magicArrow is lvl 1, cost = 1^2 = 1
      const initialBonus = mage.resources.bonus;
      const learned = await MagicService.learnSpecificMagic(mage, 'magicArrow');

      expect(learned.name).toBe('magicArrow');
      expect(mage.magics.magicArrow).toBe(1);
      expect(mage.resources.bonus).toBe(initialBonus - 10);
    });

    it('should throw if magic is not from selected branch', async () => {
      // poisonBreath is in darkness branch
      expect(MagicService.learnSpecificMagic(mage, 'poisonBreath')).rejects.toThrow(
        'Заклинание принадлежит невыбранной ветке специализации',
      );
    });

    it('should throw if character level is too low for magic circle', async () => {
      // fireRain is lvl 3, requires character lvl 5 (ceil(5/2) = 3)
      expect(mage.lvl).toBe(1);
      expect(MagicService.learnSpecificMagic(mage, 'fireRain')).rejects.toThrow(
        'Слишком низкий уровень персонажа для этого круга магии',
      );
    });

    it('should throw if not enough bonus', async () => {
      // Spend all bonus
      await mage.resources.takeResources({ bonus: mage.resources.bonus });
      expect(MagicService.learnSpecificMagic(mage, 'magicArrow')).rejects.toThrow(
        'Недостаточно очков бонусов',
      );
    });

    it('should level up magic up to max level (3)', async () => {
      await MagicService.learnSpecificMagic(mage, 'magicArrow');
      expect(mage.magics.magicArrow).toBe(1);

      await MagicService.learnSpecificMagic(mage, 'magicArrow');
      expect(mage.magics.magicArrow).toBe(2);

      await MagicService.learnSpecificMagic(mage, 'magicArrow');
      expect(mage.magics.magicArrow).toBe(3);

      expect(MagicService.learnSpecificMagic(mage, 'magicArrow')).rejects.toThrow(
        'Заклинание уже развито до максимального уровня',
      );
    });

    describe('hybrid spells (multi-school)', () => {
      it('should allow learning hybrid spell from either branch (frostTouch in elements or darkness)', async () => {
        // Mage has 'elements' branch: can learn frostTouch
        const learnedInElements = await MagicService.learnSpecificMagic(mage, 'frostTouch');
        expect(learnedInElements.name).toBe('frostTouch');
        expect(mage.magics.frostTouch).toBe(1);

        // Another mage with 'darkness' branch can ALSO learn frostTouch
        const darkMageChar = await TestUtils.createCharacter({
          prof: CharacterClass.Mage,
          harks: { str: 10, dex: 10, wis: 20, int: 20, con: 10 },
        });
        const darkMage = await CharacterService.getCharacterById(darkMageChar.id);
        // @ts-expect-error
        spyOn(darkMage, 'saveToDb').mockImplementation(async () => darkMage.charObj);
        await MagicService.selectBranch(darkMage, 'darkness');
        await darkMage.resources.addResources({ bonus: 200 });

        const learnedInDarkness = await MagicService.learnSpecificMagic(darkMage, 'frostTouch');
        expect(learnedInDarkness.name).toBe('frostTouch');
        expect(darkMage.magics.frostTouch).toBe(1);
      });

      it('should allow priest with protection branch to learn dispel (hybrid with inquisition)', async () => {
        await MagicService.selectBranch(priest, 'protection');
        await priest.resources.addResources({ exp: 10000, bonus: 500 }); // lvl up to 3+
        expect(priest.lvl).toBeGreaterThanOrEqual(3);

        const dispel = await MagicService.learnSpecificMagic(priest, 'dispel');
        expect(dispel.name).toBe('dispel');
        expect(priest.magics.dispel).toBe(1);
      });

      it('should include hybrid spell in both branch spell lists', () => {
        const protectionMagics = MagicService.getBranchMagics(priest, 'protection');
        const inquisitionMagics = MagicService.getBranchMagics(priest, 'inquisition');

        expect(protectionMagics.some((m) => m.name === 'dispel')).toBe(true);
        expect(inquisitionMagics.some((m) => m.name === 'dispel')).toBe(true);
      });
    });
  });

  describe('resetMagics', () => {
    it('should reset all learned magics and branches, and refund bonus', async () => {
      await MagicService.selectBranch(mage, 'elements');
      await mage.resources.addResources({ bonus: 50 });

      const initialBonus = mage.resources.bonus;
      await MagicService.learnSpecificMagic(mage, 'magicArrow'); // -10
      await MagicService.learnSpecificMagic(mage, 'magicArrow'); // -10
      expect(mage.resources.bonus).toBe(initialBonus - 20);

      const resetResult = await MagicService.resetMagics(mage);
      // 2 from magicArrow (lvl 2 * 1) + 1 from starter lightHeal (lvl 1 * 1) = 3
      expect(resetResult.refundedBonus).toBe(20);
      expect(mage.magics).toEqual({});
      expect(mage.magicBranches).toEqual([]);
      expect(mage.resources.bonus).toBe(initialBonus);
    });
  });
});
