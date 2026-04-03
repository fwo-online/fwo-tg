import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import { blessing } from './blessing';

// npm t server/arena/magics/blessing.test.ts

describe('blessing', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { blessing: 1 },
        harks: { ...profsData[CharacterClass.Mage].hark, wis: 20 },
      },
      {},
    ]);
  });

  beforeEach(() => {
    TestUtils.mockRandom(0.5);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it("should increase target's attack and defence", () => {
    game.players.players[0].proc = 1;
    expect(game.players.players[1].stats.val('phys.attack')).toMatchSnapshot();
    expect(game.players.players[1].stats.val('phys.defence')).toMatchSnapshot();

    blessing.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('phys.attack')).toMatchSnapshot();
    expect(game.players.players[1].stats.val('phys.defence')).toMatchSnapshot();

    expect(game.players.players[1].affects.getEffectsByAction('blessing')).toHaveLength(0);
  });

  it('should apply long effect if magic level is enough', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].magics.blessing = 3;

    blessing.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].affects.getEffectsByAction('blessing')).toHaveLength(1);
  });
});
