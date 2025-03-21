import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import magicWall from './magicWall';

// npm t server/arena/magics/magicWall.test.ts

describe('magicWall', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([magicWall]);
  });

  beforeEach(async () => {
    const initiator1 = await TestUtils.createCharacter({ prof: 'm', magics: { magicWall: 1 } });
    const initiator2 = await TestUtils.createCharacter({ prof: 'm', magics: { magicWall: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { weapon: {} });

    await Promise.all(
      [initiator1.id, initiator2.id, target.id].map(CharacterService.getCharacterById),
    );

    game = new GameService([initiator1.id, initiator2.id, target.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should protect player behind wall', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[0].stats.set('phys.defence', 100);
    game.players.players[2].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[0], game);
    attack.cast(game.players.players[2], game.players.players[0], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not cast if behind wall', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[1].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[2], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(game.players.players[1].stats.val('phys.defence')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several wall casters', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('mp', magicWall.cost);
    game.players.players[2].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[0], game);
    magicWall.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
