import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import attack from './attack';

// npm t server/arena/actions/attack.test.ts

describe('attack', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);

    initiator = await TestUtils.createCharacter({}, { weapon: {} });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should reduce damage by target resists', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].resists.physical = 0;
    attack.cast(game.players.players[0], game.players.players[1], game);

    game.players.players[1].resists.physical = 0.5;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
