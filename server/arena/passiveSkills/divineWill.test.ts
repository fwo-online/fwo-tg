import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import divineWill from './divineWill';
import { magicArrow } from '@/arena/magics';

// npm t server/arena/passiveSkills/divineWill.test.ts

describe('divineWill', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);

    initiator = await TestUtils.createCharacter({ magics: { magicArrow: 1 } });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
    divineWill.chance[0] = 0;
    magicArrow.clearAffects();
  });

  it('should break success cast', () => {
    magicArrow.registerPreAffects([divineWill]);
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[0].stats.set('magic.attack', 100);

    spyOn(global.Math, 'random').mockReturnValue(0.5);

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

    spyOn(global.Math, 'random').mockReturnValue(0.95);

    magicArrow.cast(game.players.players[0], game.players.players[1], game);
    divineWill.chance[0] = 100;
    magicArrow.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
