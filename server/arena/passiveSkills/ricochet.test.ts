import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { EffectType } from '@fwo/shared';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { ricochet } from '@/arena/passiveSkills/ricochet';
import TestUtils from '@/utils/testUtils';

describe('ricochet', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'range' } },
      { weapon: {} },
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom(0.05);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it.each([
    { level: 6, rolls: [51], damage: [] },
    { level: 6, rolls: [50, 26], damage: [70] },
    { level: 6, rolls: [50, 51], damage: [70] },
    { level: 6, rolls: [50, 25, 14], damage: [70, 49] },
    { level: 6, rolls: [50, 25, 13, 8], damage: [70, 49, 34.3] },
    { level: 1, rolls: [16], damage: [] },
    { level: 1, rolls: [15, 9], damage: [20] },
  ])(
    'uses one initial chance roll and halves subsequent chances: %j',
    async ({ level, rolls, damage }) => {
      const bounceGame = await TestUtils.createGame([
        { passiveSkills: { ricochet: level }, weapon: { type: 'range' } },
        { weapon: {} },
        { weapon: {} },
        { weapon: {} },
        { weapon: {} },
        { weapon: {} },
      ]);
      const [initiator, target, ...otherTargets] = bounceGame.players.players;
      for (const player of bounceGame.players.players) {
        player.stats.set('hp', 1000);
        player.stats.set('resists.physical', 1);
      }

      const ctx = attack.createContext(initiator, target, bounceGame);
      ctx.status.setEffectPart(EffectType.Physical, 100);
      let rollIndex = 0;
      const rndm = spyOn(MiscService, 'rndm').mockImplementation(() => rolls[rollIndex++] ?? 100);

      try {
        ricochet.onDamageDealt(ctx, attack);

        expect(ctx.status.expArr.map(({ val }) => val)).toEqual([...damage]);
        const targets = ctx.status.expArr.map(({ target }) => target);
        expect(new Set(targets).size).toBe(damage.length);
        for (const [index, bounceTarget] of targets.entries()) {
          expect(otherTargets).toContain(bounceTarget);
          expect(bounceTarget.stats.val('hp')).toBeCloseTo(1000 - damage[index]);
        }
        expect(target.stats.val('hp')).toBe(1000);
        expect(initiator.stats.val('hp')).toBe(1000);
        expect(rndm.mock.calls).toEqual(rolls.map(() => ['1d100']));
      } finally {
        rndm.mockRestore();
      }
    },
  );

  it('should ricochet to other enemies without hitting the same target twice', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);
    game.players.players[1].stats.set('hp', 50);
    game.players.players[2].stats.set('hp', 50);
    game.players.players[3].stats.set('hp', 50);

    attack.cast(game.players.players[0], game.players.players[1], game);

    const results = TestUtils.normalizeRoundHistory(game.getRoundResults());

    // Primary target (Player 2) was hit
    expect(game.players.players[1].stats.val('hp')).toBeLessThan(50);
    // Secondary targets were hit
    expect(game.players.players[2].stats.val('hp')).toBeLessThan(50);
    expect(game.players.players[3].stats.val('hp')).toBeLessThan(50);

    expect(game.players.players[0].stats.val('exp')).toBe(18 + 13 + 9);
    // Each target is hit once
    expect(results).toContain('Рикошет');
    expect(results).toMatchSnapshot();
  });

  it('should not ricochet when there are no other alive enemies', async () => {
    const duelGame = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'range' } },
      { weapon: {} },
    ]);

    duelGame.players.players[0].proc = 1;
    duelGame.players.players[0].stats.set('hp', 10);
    duelGame.players.players[1].stats.set('hp', 50);

    attack.cast(duelGame.players.players[0], duelGame.players.players[1], duelGame);

    const results = TestUtils.normalizeRoundHistory(duelGame.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });

  it('should not ricochet if weapon is not range', async () => {
    const meleeGame = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'cut' } },
      { weapon: {} },
      { weapon: {} },
    ]);

    meleeGame.players.players[0].proc = 1;
    meleeGame.players.players[0].stats.set('hp', 10);

    attack.cast(meleeGame.players.players[0], meleeGame.players.players[1], meleeGame);

    const results = TestUtils.normalizeRoundHistory(meleeGame.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });

  it('should not ricochet if chance fails', () => {
    TestUtils.restoreRandom();
    TestUtils.mockRandom(0.99); // 99 > 50%

    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);

    attack.cast(game.players.players[0], game.players.players[1], game);

    const results = TestUtils.normalizeRoundHistory(game.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });
});
