import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { frostbite } from './frostbite';

// npm t server/arena/effects/frostbite.test.ts

describe('frostbite', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
    frostbite.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply frostbite effect on cast', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    frostbite.duration = 2;
    frostbite.cast(p1, p2, game, 20);

    const effects = p2.affects.getEffectsByAction(frostbite.name);
    expect(effects).toHaveLength(1);
    expect(effects[0].value).toBe(20);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should reduce outgoing physical damage of affected target', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p2.proc = 1;

    frostbite.duration = 2;
    frostbite.cast(p1, p2, game, 50);

    const initialHp = p1.stats.val('hp');
    attack.cast(p2, p1, game);

    expect(p1.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should be removed by removeBadEffects', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    frostbite.duration = 2;
    frostbite.cast(p1, p2, game, 20);

    expect(p2.affects.getEffectsByAction(frostbite.name)).toHaveLength(1);

    p2.affects.removeBadEffects();
    expect(p2.affects.getEffectsByAction(frostbite.name)).toHaveLength(0);
  });
});
