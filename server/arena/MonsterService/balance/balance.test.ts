import { describe, expect, it } from 'bun:test';
import { MonsterType } from '@fwo/shared';
import config from '@/arena/config';
import {
  buildMonsterHarks,
  MONSTER_BALANCE,
  PLAYER_BASE_HARKS,
  pickAbilities,
  playerHarkBudget,
} from './balance';

describe('balance', () => {
  describe('playerHarkBudget', () => {
    it('should be ~40 at lvl 1', () => {
      expect(playerHarkBudget(1)).toBe(PLAYER_BASE_HARKS + config.freePerLvl);
    });

    it('should grow by 10 per level', () => {
      expect(playerHarkBudget(5) - playerHarkBudget(4)).toBe(config.freePerLvl);
    });
  });

  describe('buildMonsterHarks', () => {
    it('should distribute total ≈ budget * multiplier', () => {
      const config = MONSTER_BALANCE[MonsterType.Wolf];
      const budget = playerHarkBudget(5) * config.budgetMultiplier;
      const harks = buildMonsterHarks(5, config);
      const total = Object.values(harks).reduce((a, b) => a + b, 0);

      // Within 4 of expected (rounding tolerance)
      expect(Math.abs(total - Math.round(budget))).toBeLessThanOrEqual(4);
    });

    it('should respect budgetScale', () => {
      const config = MONSTER_BALANCE[MonsterType.Wolf];
      const base = buildMonsterHarks(3, config, 1.0);
      const scaled = buildMonsterHarks(3, config, 1.5);
      const baseTotal = Object.values(base).reduce((a, b) => a + b, 0);
      const scaledTotal = Object.values(scaled).reduce((a, b) => a + b, 0);

      // scaled should be ~1.5x base (within rounding)
      expect(scaledTotal).toBeGreaterThan(baseTotal + 5);
    });

    it('should have min 1 per hark', () => {
      // Skeleton has con weight 1 out of sum 10 → at low lvl * 0.4 multiplier con stays >= 1
      const config = MONSTER_BALANCE[MonsterType.Skeleton];
      for (let lvl = 1; lvl <= 5; lvl++) {
        const harks = buildMonsterHarks(lvl, config);
        expect(harks.str).toBeGreaterThanOrEqual(1);
        expect(harks.dex).toBeGreaterThanOrEqual(1);
        expect(harks.int).toBeGreaterThanOrEqual(1);
        expect(harks.wis).toBeGreaterThanOrEqual(1);
        expect(harks.con).toBeGreaterThanOrEqual(1);
      }
    });

    it('lvl-1 wolf harks should be ≤ lvl-1 player budget × wolf multiplier', () => {
      const config = MONSTER_BALANCE[MonsterType.Wolf];
      const harks = buildMonsterHarks(1, config);
      const total = Object.values(harks).reduce((a, b) => a + b, 0);
      const maxBudget = playerHarkBudget(1) * config.budgetMultiplier;

      // The wolf at lvl 1 should not exceed a same-level player's hark total
      expect(total).toBeLessThanOrEqual(Math.round(maxBudget) + 2);
    });
  });

  describe('pickAbilities', () => {
    it('should return empty for lvl below all minLvl', () => {
      const ab = pickAbilities({ magics: { fireball: 10 } }, 1);
      expect(ab.magics).toEqual({});
    });

    it('should include abilities where lvl >= minLvl', () => {
      const ab = pickAbilities({ magics: { fireball: 5, spark: 1 } }, 5);
      expect(ab.magics).toEqual({ fireball: 1, spark: 1 });
    });

    it('should handle empty gating', () => {
      const ab = pickAbilities({}, 99);
      expect(ab.magics).toEqual({});
      expect(ab.skills).toEqual({});
      expect(ab.passiveSkills).toEqual({});
    });

    it('wolf at lvl 1 should have bleeding + nightcall but not terrifyingHowl or lacerate', () => {
      const ab = pickAbilities(MONSTER_BALANCE[MonsterType.Wolf].abilities, 1);
      expect(ab.magics.bleeding).toBe(1);
      expect(ab.passiveSkills.nightcall).toBe(1);
      expect(ab.skills.terrifyingHowl).toBeUndefined();
      expect(ab.passiveSkills.lacerate).toBeUndefined();
    });

    it('wolf at lvl 6 should have all abilities unlocked', () => {
      const ab = pickAbilities(MONSTER_BALANCE[MonsterType.Wolf].abilities, 6);
      expect(ab.magics.bleeding).toBe(1);
      expect(ab.skills.terrifyingHowl).toBe(1);
      expect(ab.passiveSkills.nightcall).toBe(1);
      expect(ab.passiveSkills.lacerate).toBe(1);
    });
  });

  describe('Alpha', () => {
    it('should have higher budget than wolf', () => {
      expect(MONSTER_BALANCE[MonsterType.Alpha].budgetMultiplier).toBeGreaterThan(
        MONSTER_BALANCE[MonsterType.Wolf].budgetMultiplier,
      );
    });
  });

  describe('all configs', () => {
    const configs: [string, MonsterType, number][] = [
      ['Wolf', MonsterType.Wolf, 5],
      ['Spider', MonsterType.Spider, 5],
      ['Ghost', MonsterType.Ghost, 5],
      ['Spirit', MonsterType.Spirit, 5],
      ['Elemental', MonsterType.Elemental, 5],
      ['Skeleton', MonsterType.Skeleton, 5],
      ['Alpha', MonsterType.Alpha, 5],
    ];

    for (const [name, type, lvl] of configs) {
      it(`${name} lvl ${lvl}: buildMonsterHarks does not throw`, () => {
        const config = MONSTER_BALANCE[type];
        const harks = buildMonsterHarks(lvl, config);
        expect(Object.keys(harks)).toHaveLength(5);
      });

      it(`${name}: abilities not empty object literal`, () => {
        const config = MONSTER_BALANCE[type];
        const ab = pickAbilities(config.abilities, 99); // max level
        // At max level, check that we get abilities (unless the type has none)
        const totalAbilities =
          Object.keys(ab.magics).length +
          Object.keys(ab.skills).length +
          Object.keys(ab.passiveSkills).length;
        // Skeleton legitimately has 0
        if (type === MonsterType.Skeleton) {
          expect(totalAbilities).toBe(0);
        } else {
          expect(totalAbilities).toBeGreaterThan(0);
        }
      });
    }
  });
});
