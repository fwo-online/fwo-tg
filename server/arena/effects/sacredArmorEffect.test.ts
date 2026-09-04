import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { sacredArmorEffect } from './sacredArmorEffect';

// npm t server/arena/effects/sacredArmorEffect.test.ts

describe('sacredArmorEffect', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
    sacredArmorEffect.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply sacredArmorEffect on cast', () => {
    const [p1] = game.players.players;
    p1.proc = 1;
    sacredArmorEffect.duration = 1;
    sacredArmorEffect.cast(p1, p1, game, 35);

    const effects = p1.affects.getEffectsByAction(sacredArmorEffect.name);
    expect(effects).toHaveLength(1);
    expect(effects[0].value).toBe(35);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should reduce incoming physical damage of affected target', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p2.proc = 1;

    sacredArmorEffect.duration = 1;
    sacredArmorEffect.cast(p1, p1, game, 50);

    const initialHp = p1.stats.val('hp');
    attack.cast(p2, p1, game);

    expect(p1.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should be removed by removeGoodEffects and not by removeBadEffects', () => {
    const [p1] = game.players.players;
    p1.proc = 1;
    sacredArmorEffect.duration = 1;
    sacredArmorEffect.cast(p1, p1, game, 25);

    expect(p1.affects.getEffectsByAction(sacredArmorEffect.name)).toHaveLength(1);

    p1.affects.removeBadEffects();
    expect(p1.affects.getEffectsByAction(sacredArmorEffect.name)).toHaveLength(1);

    p1.affects.removeGoodEffects();
    expect(p1.affects.getEffectsByAction(sacredArmorEffect.name)).toHaveLength(0);
  });
});
