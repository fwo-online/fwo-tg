import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import madness from './madness';

// npm t server/arena/magics/madness.test.ts

describe('madness', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([madness]);
  });

  beforeEach(async () => {
    const initiator1 = await TestUtils.createCharacter({ prof: 'm', magics: { madness: 2 } });
    const initiator2 = await TestUtils.createCharacter({ prof: 'm', magics: { madness: 2 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { weapon: {} });

    const ids = [initiator1.id, initiator2.id, target.id];
    await Promise.all(ids.map(CharacterService.getCharacterById));

    game = new GameService(ids);

    spyOn(global.Math, 'random').mockReturnValue(0.05);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should change target', async () => {
    game.players.players[0].proc = 1;
    game.players.players[2].proc = 1;

    madness.cast(game.players.players[0], game.players.players[2], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle multiple casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[2].proc = 1;

    madness.cast(game.players.players[0], game.players.players[2], game);
    madness.cast(game.players.players[1], game.players.players[2], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
