import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { attack } from '@/arena/actions';
import GameService from '@/arena/GameService';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import lacerate from './lacerate';
import { bleeding } from '@/arena/magics';

// npm t server/arena/passiveSkills/lacerate.test.ts

describe('lacerate', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPostAffects([lacerate]);

    initiator = await TestUtils.createCharacter({ passiveSkills: { lacerate: 1 }, magics: { bleeding: 1 }, harks: { int: 20, str: 10, wis: 10, con: 10, dex: 10}}, { weapon: {type: "cut"}, });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
    spyOn(global.Math, 'random').mockReturnValue(0.5);
    lacerate.chance[0] = 100
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should apply bleeding', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    game.round.count++;
    bleeding.castLong(game)

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
