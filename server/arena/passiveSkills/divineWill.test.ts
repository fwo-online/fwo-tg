import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import { magicArrow } from '@/arena/magics';
import TestUtils from '@/utils/testUtils';
import divineWill from './divineWill';

// npm t server/arena/passiveSkills/divineWill.test.ts

describe('divineWill', () => {
  let game: GameService;
  let chance = 0;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        magics: { magicArrow: 3 },
      },
      {},
    ]);

    chance = divineWill.chance[0];
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
    divineWill.chance[0] = chance;
  });

  it('should break success cast', () => {
    magicArrow.registerPreAffects([divineWill]);
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[0].stats.set('magic.attack', 100);

    magicArrow.cast(game.players.players[0], game.players.players[1], game);
    divineWill.chance[0] = 100;
    magicArrow.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should succeed fail cast', () => {
    magicArrow.registerAffectHandlers([divineWill]);
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[0].stats.set('magic.attack', 1);

    magicArrow.cast(game.players.players[0], game.players.players[1], game);

    divineWill.chance[0] = 100;
    magicArrow.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
