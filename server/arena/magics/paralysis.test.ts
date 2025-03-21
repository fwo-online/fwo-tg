import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import paralysis from './paralysis';

// npm t server/arena/magics/paralysis.test.ts

describe('paralysis', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([paralysis]);
  });

  beforeEach(async () => {
    const initiator1 = await TestUtils.createCharacter({ prof: 'm', magics: { paralysis: 1 } });
    const initiator2 = await TestUtils.createCharacter({ prof: 'm', magics: { paralysis: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { weapon: {} });

    await Promise.all(
      [initiator1.id, target.id, initiator2.id].map(CharacterService.getCharacterById),
    );

    game = new GameService([initiator1.id, target.id, initiator2.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('initiator should be paralysed', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    paralysis.cast(game.players.players[0], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;
    game.players.players[2].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    paralysis.cast(game.players.players[0], game.players.players[1], game);
    paralysis.cast(game.players.players[2], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
