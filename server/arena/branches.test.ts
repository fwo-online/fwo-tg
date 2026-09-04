import { describe, expect, it } from 'bun:test';
import {
  BRANCHES,
  type BranchKey,
  getSubclass,
  isCrossArchetype,
  SUBCLASS_MATRIX,
} from '@fwo/shared';

describe('Branches & Subclass Matrix', () => {
  const branchKeys: BranchKey[] = [
    'guardian',
    'berserker',
    'duelist',
    'marksman',
    'barrage',
    'scout',
    'elements',
    'darkness',
    'arcana',
    'holy',
    'protection',
    'inquisition',
  ];

  it('should define all 12 branches with proper metadata', () => {
    expect(Object.keys(BRANCHES).length).toBe(12);
    for (const key of branchKeys) {
      const branch = BRANCHES[key];
      expect(branch).toBeDefined();
      expect(branch.id).toBe(key);
      expect(branch.name).toBeTruthy();
      expect(branch.icon).toBeTruthy();
      expect(['w', 'l', 'm', 'p']).toContain(branch.prof);
      expect(['physical', 'magical']).toContain(branch.archetype);
    }
  });

  it('should define a symmetric subclass matrix for all branch pairs', () => {
    for (const b1 of branchKeys) {
      for (const b2 of branchKeys) {
        const sub1 = getSubclass(b1, b2);
        const sub2 = getSubclass(b2, b1);
        expect(sub1).toBeDefined();
        expect(sub1).toBe(sub2);
        expect(typeof sub1).toBe('string');
      }
    }
  });

  it('should map all 16 canonical FWO subclasses correctly', () => {
    expect(getSubclass('guardian', 'berserker')).toBe('Варвар');
    expect(getSubclass('duelist', 'marksman')).toBe('Ассасин');
    expect(getSubclass('berserker', 'elements')).toBe('Элементалист');
    expect(getSubclass('guardian', 'holy')).toBe('Аббат');
    expect(getSubclass('guardian', 'barrage')).toBe('Рыцарь');
    expect(getSubclass('marksman', 'barrage')).toBe('Мастер лука');
    expect(getSubclass('scout', 'elements')).toBe('Друид');
    expect(getSubclass('scout', 'holy')).toBe('Монах');
    expect(getSubclass('guardian', 'arcana')).toBe('Тамплиер');
    expect(getSubclass('scout', 'arcana')).toBe('Рейнджер');
    expect(getSubclass('elements', 'arcana')).toBe('Архимаг');
    expect(getSubclass('darkness', 'inquisition')).toBe('Хаотик');
    expect(getSubclass('duelist', 'inquisition')).toBe('Инквизитор');
    expect(getSubclass('marksman', 'inquisition')).toBe('Назгул');
    expect(getSubclass('protection', 'arcana')).toBe('Отшельник');
    expect(getSubclass('holy', 'protection')).toBe('Епископ');
  });

  it('should correctly determine cross-archetype branches', () => {
    // Physical prof with physical branch -> not cross
    expect(isCrossArchetype('w', 'guardian')).toBe(false);
    expect(isCrossArchetype('w', 'marksman')).toBe(false);
    expect(isCrossArchetype('l', 'scout')).toBe(false);

    // Physical prof with magic branch -> IS cross
    expect(isCrossArchetype('w', 'elements')).toBe(true);
    expect(isCrossArchetype('l', 'holy')).toBe(true);

    // Magical prof with magic branch -> not cross
    expect(isCrossArchetype('m', 'elements')).toBe(false);
    expect(isCrossArchetype('p', 'inquisition')).toBe(false);

    // Magical prof with physical branch -> IS cross
    expect(isCrossArchetype('m', 'duelist')).toBe(true);
    expect(isCrossArchetype('p', 'guardian')).toBe(true);
  });

  it('should have exactly 78 subclass definitions (12 mono + 66 hybrid) with unique pairs', () => {
    const { SUBCLASSES } = require('@fwo/shared');
    expect(SUBCLASSES.length).toBe(78);

    const seen = new Set<string>();
    for (const [a, b, name] of SUBCLASSES) {
      expect(name).toBeTruthy();
      const canonical = a < b ? `${a}+${b}` : `${b}+${a}`;
      expect(seen.has(canonical)).toBe(false);
      seen.add(canonical);
    }
  });
});
