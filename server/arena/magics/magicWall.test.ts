import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import arena from '@/arena';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import magicWall from './magicWall';

// npm t server/arena/magics/magicWall.test.ts

describe('magicWall', () => {
  let game: GameService;

  beforeEach(async () => {
    arena.actions.attack.registerPreAffects([magicWall]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { magicWall: 1 },
      },
      {
        prof: CharacterClass.Mage,
        magics: { magicWall: 1 },
      },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should protect player behind wall', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[0].stats.set('phys.defence', 100);
    game.players.players[2].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[0], game);
    arena.actions.attack.cast(game.players.players[2], game.players.players[0], game);
    arena.actions.attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not cast if behind wall', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[1].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[2], game);
    arena.actions.attack.cast(game.players.players[2], game.players.players[0], game);

    expect(game.players.players[1].stats.val('phys.defence')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several wall casters', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('mp', magicWall.cost);
    game.players.players[2].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[0], game);
    magicWall.cast(game.players.players[1], game.players.players[0], game);
    arena.actions.attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
