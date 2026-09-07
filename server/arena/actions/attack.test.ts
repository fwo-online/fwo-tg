import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from './attack';

// npm t server/arena/actions/attack.test.ts

describe('attack', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {} },
      {
        passiveSkills: { criticalStrike: 6 },
        weapon: {
          type: 'range',
          hit: {
            physical: { min: 10, max: 10 },
            fire: { min: 2, max: 3 },
          },
        },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce damage by target resists', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].stats.set('resists.physical', 1);
    attack.cast(game.players.players[0], game.players.players[1], game);

    game.players.players[1].stats.set('resists.physical', 0.5);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should deal elemental damage from weapon and apply element resists', async () => {
    game.players.players[1].proc = 1;
    game.players.players[0].stats.set('resists.fire', 0.5);
    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should only double physical damage on critical strike', async () => {
    TestUtils.mockRandom(0.05); // Ensure critical strike triggers (35% chance)
    game.players.players[1].proc = 1;

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
