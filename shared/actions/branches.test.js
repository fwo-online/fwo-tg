import { describe, expect, it } from 'bun:test';
import {
  CharacterClass,
  getBranchSelectionReason,
  getBranchSelectionState,
  getUniqueClasses,
  isBranchKey,
} from '@fwo/shared';

describe('shared branch contract', () => {
  it('returns unique classes in primary-first order', () => {
    expect(getUniqueClasses(CharacterClass.Mage)).toEqual([CharacterClass.Mage]);
    expect(getUniqueClasses(CharacterClass.Mage, CharacterClass.Mage)).toEqual([
      CharacterClass.Mage,
    ]);
    expect(getUniqueClasses(CharacterClass.Mage, CharacterClass.Priest)).toEqual([
      CharacterClass.Mage,
      CharacterClass.Priest,
    ]);
  });

  it('recognizes only own branch IDs from the catalog', () => {
    expect(isBranchKey('guardian')).toBe(true);
    expect(isBranchKey('holy')).toBe(true);
    expect(isBranchKey('unknown')).toBe(false);
    expect(isBranchKey('toString')).toBe(false);
    expect(isBranchKey('__proto__')).toBe(false);
    expect(isBranchKey(null)).toBe(false);
  });

  it('rejects unknown and inherited branch IDs in complete selections', () => {
    const classes = [CharacterClass.Mage];
    expect(getBranchSelectionReason(['unknown'], classes, 10)).toBe('UNKNOWN_BRANCH');
    expect(getBranchSelectionReason(['toString'], classes, 10)).toBe('UNKNOWN_BRANCH');
    expect(getBranchSelectionReason([null], classes, 10)).toBe('UNKNOWN_BRANCH');
  });

  it('rejects duplicate branches in a complete selection', () => {
    expect(getBranchSelectionReason(['elements', 'elements'], [CharacterClass.Mage], 10)).toBe(
      'DUPLICATE_BRANCH',
    );
  });

  it('rejects more than the global branch limit', () => {
    expect(
      getBranchSelectionReason(['elements', 'darkness', 'arcana'], [CharacterClass.Mage], 10),
    ).toBe('TOO_MANY_BRANCHES');
  });

  it('rejects a foreign-class branch but accepts a secondary-class branch', () => {
    expect(getBranchSelectionReason(['holy'], [CharacterClass.Mage], 10)).toBe(
      'FOREIGN_CLASS_BRANCH',
    );
    expect(
      getBranchSelectionReason(
        ['holy'],
        getUniqueClasses(CharacterClass.Mage, CharacterClass.Priest),
        10,
      ),
    ).toBeUndefined();
  });

  it('requires level 10 for a second branch and accepts it at level 10', () => {
    const branches = ['elements', 'holy'];
    const classes = getUniqueClasses(CharacterClass.Mage, CharacterClass.Priest);
    expect(getBranchSelectionReason(branches, classes, 9)).toBe('SECOND_BRANCH_LEVEL');
    expect(getBranchSelectionReason(branches, classes, 10)).toBeUndefined();
    expect(getBranchSelectionReason([], classes, 9)).toBeUndefined();
  });

  it('offers a secondary-class branch for the first slot', () => {
    expect(
      getBranchSelectionState('holy', {
        prof: CharacterClass.Mage,
        secondProf: CharacterClass.Priest,
        branches: [],
        level: 1,
      }),
    ).toEqual({ selected: false, canSelect: true });
  });

  it('marks an existing branch selected without offering it again', () => {
    expect(
      getBranchSelectionState('elements', {
        prof: CharacterClass.Mage,
        branches: ['elements'],
        level: 10,
      }),
    ).toEqual({ selected: true, canSelect: false, reason: 'ALREADY_SELECTED' });
  });

  it('rejects malformed existing selections before offering another branch', () => {
    const context = { prof: CharacterClass.Mage, branches: ['elements', 'elements'], level: 10 };
    expect(getBranchSelectionState('arcana', context)).toEqual({
      selected: false,
      canSelect: false,
      reason: 'DUPLICATE_BRANCH',
    });
    expect(getBranchSelectionState('arcana', { ...context, branches: ['unknown'] })).toEqual({
      selected: false,
      canSelect: false,
      reason: 'UNKNOWN_BRANCH',
    });
    expect(getBranchSelectionState('arcana', { ...context, branches: null })).toEqual({
      selected: false,
      canSelect: false,
      reason: 'INVALID_BRANCHES',
    });
  });

  it('shares the second slot across primary and secondary classes at level 10', () => {
    const context = {
      prof: CharacterClass.Mage,
      secondProf: CharacterClass.Priest,
      branches: ['elements'],
      level: 9,
    };
    expect(getBranchSelectionState('holy', context)).toEqual({
      selected: false,
      canSelect: false,
      reason: 'SECOND_BRANCH_LEVEL',
    });
    expect(getBranchSelectionState('holy', { ...context, level: 10 })).toEqual({
      selected: false,
      canSelect: true,
    });
  });

  it('explains unavailable candidate branches with controlled codes', () => {
    const context = { prof: CharacterClass.Mage, branches: [], level: 10 };
    expect(getBranchSelectionState('unknown', context).reason).toBe('UNKNOWN_BRANCH');
    expect(getBranchSelectionState('guardian', context).reason).toBe('FOREIGN_CLASS_BRANCH');
    expect(
      getBranchSelectionState('arcana', { ...context, branches: ['elements', 'darkness'] }).reason,
    ).toBe('TOO_MANY_BRANCHES');
  });
});
