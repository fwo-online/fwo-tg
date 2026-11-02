import { beforeAll, describe, expect, it } from 'bun:test';
import { BRANCHES, getAbilityState, MAX_MAGIC_LVL, SECOND_BRANCH_MIN_CHAR_LVL } from '@fwo/shared';
import arena from '@/arena';
import AbilityTreeService from './AbilityTreeService';
import BranchService from './BranchService';
import type { CharacterService } from './CharacterService';
import MagicService from './MagicService';
import * as magics from './magics';
import PassiveSkillService from './PassiveSkillService';
import SkillService from './SkillService';

beforeAll(() => {
  arena.magics = magics;
});

const character = (
  prof: 'm' | 'w' | 'l' | 'p',
  branches: string[] = [],
  lvl = 1,
  bonus = 10000,
  magics: Record<string, number> = {},
) => {
  const char = {
    prof,
    class: prof,
    branches,
    lvl,
    bonus,
    magics,
    skills: {},
    passiveSkills: {},
    resources: { bonus },
    toObject: () => char,
  };
  return char as unknown as CharacterService;
};

const allAbilities = (tree: ReturnType<typeof AbilityTreeService.getTree>) =>
  tree.classes.flatMap((group) => group.branches.flatMap((branch) => branch.abilities));

describe('read-only ability tree', () => {
  it('exposes all twelve branches grouped by class without changing the own-class catalog', () => {
    const mage = character('m');
    const tree = AbilityTreeService.getTree(mage);
    expect(tree.classes.map((group) => group.prof)).toEqual(['w', 'l', 'm', 'p']);
    expect(tree.classes.flatMap((group) => group.branches.map((branch) => branch.id))).toEqual(
      Object.values(BRANCHES).map((branch) => branch.id),
    );
    expect(BranchService.getBranchesInfo(mage).branches).toHaveLength(3);
    expect(tree.classes.find((group) => group.prof === 'm')?.branches[0]).toMatchObject({
      id: 'elements',
    });
    for (const group of tree.classes.filter((group) => group.prof !== 'm')) {
      expect(
        group.branches
          .flatMap((branch) => branch.abilities)
          .every((ability) => !ability.canLearn && !!ability.lockReason),
      ).toBe(true);
    }
    expect(
      tree.classes
        .flatMap((group) => group.branches)
        .map((branch) => branch.abilities.length)
        .some(Boolean),
    ).toBe(true);
  });

  it('reflects selected branch eligibility without mutating the character', () => {
    const mage = character('m', ['elements']);
    const before = JSON.stringify(mage);
    const tree = AbilityTreeService.getTree(mage);
    const own = tree.classes.find((group) => group.prof === 'm');
    expect(own).toBeDefined();
    if (!own) throw new Error('Mage group missing');
    expect(
      own.branches
        .find((branch) => branch.id === 'elements')
        ?.abilities.some((ability) => ability.kind === 'magic' && ability.canLearn),
    ).toBe(true);
    expect(
      own.branches
        .find((branch) => branch.id === 'arcana')
        ?.abilities.every((ability) => !ability.canLearn),
    ).toBe(true);
    expect(JSON.stringify(mage)).toBe(before);
  });

  it('includes each branched catalog ability in every matching branch including hybrid passives', () => {
    const tree = AbilityTreeService.getTree(character('w'));
    const entries = allAbilities(tree);
    for (const magic of [
      ...MagicService.getMagicListByProf('m'),
      ...MagicService.getMagicListByProf('p'),
    ]) {
      for (const branch of magic.branches ?? []) {
        expect(
          tree.classes
            .flatMap((group) => group.branches)
            .find((b) => b.id === branch)
            ?.abilities.some((a) => a.kind === 'magic' && a.name === magic.name),
        ).toBe(true);
      }
    }
    for (const skill of [
      ...SkillService.getSkillListByProf('w'),
      ...SkillService.getSkillListByProf('l'),
    ]) {
      for (const branch of skill.branches ?? []) {
        expect(
          tree.classes
            .flatMap((group) => group.branches)
            .find((b) => b.id === branch)
            ?.abilities.some((a) => a.kind === 'skill' && a.name === skill.name),
        ).toBe(true);
      }
    }
    for (const passive of PassiveSkillService.getPassiveSkillList().filter(
      (p) => p.bonusCost.length,
    )) {
      for (const branch of passive.branches ?? []) {
        expect(
          tree.classes
            .flatMap((group) => group.branches)
            .find((b) => b.id === branch)
            ?.abilities.some((a) => a.kind === 'passive' && a.name === passive.name),
        ).toBe(true);
      }
    }
    for (const name of [
      'chopWeapon',
      'cutWeapon',
      'healingWeapon',
      'rangeWeapon',
      'stunWeapon',
      'thrustWeapon',
      'fatesMiss',
      'divineWill',
    ]) {
      expect(entries.some((ability) => ability.name === name)).toBe(false);
    }
  });

  it('never offers foreign abilities and keeps shared spells within the owning branch class', () => {
    const tree = AbilityTreeService.getTree(character('m', ['elements'], 30));
    const foreign = tree.classes.filter((group) => group.prof !== 'm');
    expect(
      foreign.every((group) =>
        group.branches.flatMap((b) => b.abilities).every((ability) => !ability.canLearn),
      ),
    ).toBe(true);
    expect(
      tree.classes
        .find((group) => group.prof === 'p')
        ?.branches.flatMap((b) => b.abilities)
        .find((a) => a.name === 'lightHeal')?.canLearn,
    ).toBe(false);
    expect(
      tree.classes
        .find((group) => group.prof === 'm')
        ?.branches.flatMap((b) => b.abilities)
        .find((a) => a.name === 'lightHeal')?.canLearn,
    ).toBe(false);
  });

  it('unifies bonusCost, classList, rank, maxRank, nextCost, and requiredLevel across magic, skill, and passive', () => {
    const mage = character('m', ['elements'], 1, 15, { magicArrow: 1 });
    const tree = AbilityTreeService.getTree(mage);
    const elements = tree.classes
      .find((g) => g.prof === 'm')
      ?.branches.find((b) => b.id === 'elements');

    const magicArrow = elements?.abilities.find((a) => a.name === 'magicArrow');
    expect(magicArrow).toBeDefined();
    if (!magicArrow) throw new Error('magicArrow missing');

    expect(magicArrow.bonusCost).toEqual([10, 10, 10]);
    expect(magicArrow.classList).toEqual({ m: 1 });
    expect(magicArrow.rank).toBe(1);
    expect(magicArrow.maxRank).toBe(MAX_MAGIC_LVL);
    expect(magicArrow.nextCost).toBe(10);
    expect(magicArrow.requiredLevel).toBe(1);
    expect(magicArrow.canLearn).toBe(true);

    const afterSpendState = getAbilityState(
      {
        class: 'm',
        lvl: 1,
        bonus: 5,
        branches: ['elements'],
        magics: { magicArrow: 2 },
      },
      magicArrow,
      'm',
    );
    expect(afterSpendState).toEqual({
      rank: 2,
      maxRank: 3,
      nextCost: 10,
      requiredLevel: 1,
      canLearn: false,
      lockReason: 'Не хватает бонусов',
    });
  });
});
