import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { frostTouch } from './frostTouch';

// npm t server/arena/magics/frostTouch.test.ts

describe('frostTouch', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { frostTouch: 3 } },
      { prof: CharacterClass.Warrior },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('initiator should be hitted by frostTouch', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);

    frostTouch.cast(game.players.players[0], game.players.players[1], game);
    game.players.players[1].affects.affects[0].onCast?.(
      {
        initiator: game.players.players[0],
        target: game.players.players[1],
        game,
      },
      game.players.players[1].affects.affects[0],
    );

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
