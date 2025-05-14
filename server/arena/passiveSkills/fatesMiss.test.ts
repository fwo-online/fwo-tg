import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import fatesMiss from './fatesMiss';
import { attack } from '@/arena/actions';

// npm t server/arena/passiveSkills/fatesMiss.test.ts

describe('fatesMiss', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPreAffects([fatesMiss]);
    initiator = await TestUtils.createCharacter({}, { weapon: { type: 'stun' } });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should break success cast', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[0].stats.set('magic.attack', 100);

    spyOn(global.Math, 'random').mockReturnValue(0.5);

    attack.cast(game.players.players[0], game.players.players[1], game);
    fatesMiss.chance[0] = 100;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
