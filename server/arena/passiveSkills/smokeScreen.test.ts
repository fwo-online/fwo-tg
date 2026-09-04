import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { smokeScreen } from './smokeScreen';

// npm t server/arena/passiveSkills/smokeScreen.test.ts

describe('smokeScreen', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    smokeScreen.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should trigger smoke screen when damaged', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { smokeScreen: 1 }, branches: ['scout'] },
      { weapon: {} },
    ]);

    const [scout, attacker] = game.players.players;
    attacker.proc = 1;

    attack.cast(attacker, scout, game);

    const effects = scout.affects.getEffectsByAction('smokeScreen');
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
