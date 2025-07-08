import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import secondLife from './secondLife';

// npm t server/arena/magics/secondLife.test.ts

describe('secondLife', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Priest,
        magics: { secondLife: 1 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('target should be alive', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set(secondLife.costType, secondLife.cost);
    game.players.players[0].stats.set('hp', -10);

    secondLife.cast(game.players.players[0], game.players.players[0], game);

    expect(game.players.players[0].stats.val('hp')).toBe(0.05);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
