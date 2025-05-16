import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import eclipse from './eclipse';
// npm t server/arena/magics/eclipse.test.ts

describe('eclipse', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([eclipse]);
  });

  beforeEach(async () => {
    const initiator1 = await TestUtils.createCharacter({ prof: 'm', magics: { eclipse: 1 } });
    const initiator2 = await TestUtils.createCharacter({ prof: 'm', magics: { eclipse: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { weapon: {} });

    await Promise.all(
      [initiator1.id, initiator2.id, target.id].map(CharacterService.getCharacterById),
    );

    game = new GameService([initiator1.id, initiator2.id, target.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('initiator should be blinded by eclipse', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;

    eclipse.cast(game.players.players[0], game.players.players[0], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('mp', 99);
    game.players.players[2].proc = 1;

    eclipse.cast(game.players.players[0], game.players.players[0], game);
    eclipse.cast(game.players.players[1], game.players.players[1], game);

    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
