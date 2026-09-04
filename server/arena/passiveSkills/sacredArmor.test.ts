import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import { sacredArmorEffect } from '@/arena/effects';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { sacredArmor } from './sacredArmor';

// npm t server/arena/passiveSkills/sacredArmor.test.ts

describe('sacredArmor', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    sacredArmor.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should add defense buff on weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { sacredArmor: 1 }, branches: ['protection'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    attack.cast(p1, p2, game);

    const effects = p1.affects.getEffectsByAction(sacredArmorEffect.name);
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
