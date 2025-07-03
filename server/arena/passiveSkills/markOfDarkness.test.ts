import { afterEach, beforeAll, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import { eclipse, vampirism } from '@/arena/magics';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import markOfDarkness from './markOfDarkness';

// npm t server/arena/passiveSkills/markOfDarkness.test.ts

describe('markOfDarkness', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    eclipse.registerPostAffects([markOfDarkness]);

    initiator = await TestUtils.createCharacter({
      passiveSkills: { markOfDarkness: 3 },
      magics: { vampirism: 3 },
    });
    target = await TestUtils.createCharacter({
      magics: { eclipse: 3 },
    });
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should apply mark', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('mp', 100);

    eclipse.cast(game.players.players[1], game.players.players[0], game);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
    expect(game.players.players[1].flags.isMarkedByDarkness).toHaveLength(1);
  });

  it('mark should increase effect', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('magic.attack', 100);
    game.players.players[0].stats.set('mp', 100);
    game.players.players[1].flags.isMarkedByDarkness.push({
      initiator: game.players.players[0],
      val: 0,
    });

    vampirism.cast(game.players.players[0], game.players.players[1], game);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    vampirism.registerPreAffects([markOfDarkness]);
    vampirism.cast(game.players.players[0], game.players.players[1], game);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
