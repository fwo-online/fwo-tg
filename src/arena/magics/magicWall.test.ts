import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import magicWall from './magicWall';

// npm t src/arena/magics/magicWall.test.ts

describe('magicWall', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([magicWall]);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { magicWall: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { withWeapon: true });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('initiator should be blinded by eclipse', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', magicWall.cost);
    game.players.players[1].proc = 1;

    magicWall.cast(game.players.players[0], game.players.players[1], game);
    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(game.players.players[1].stats.val('pdef')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
