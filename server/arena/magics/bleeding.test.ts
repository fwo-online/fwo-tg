import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import bleeding from './bleeding';
import { attack } from '@/arena/actions';

// npm t server/arena/magics/bleeding.test.ts

describe('bleeding', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPostAffects([bleeding]);

    initiator = await TestUtils.createCharacter(
      { magics: { bleeding: 3 } },
      { weapon: { type: 'cut' } },
    );
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
    spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should cast long debuff', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);

    game.round.count++;

    bleeding.castLong(game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should cast long debuff', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
