import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import lightShield from './lightShield';

// npm t src/arena/magics/lightShield.test.ts

describe('lightShield', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPostAffects([lightShield]);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { lightShield: 2 } });
    const target = await TestUtils.createCharacter();
    const attacker = await TestUtils.createCharacter({ prof: 'w' }, { withWeapon: true });

    const ids = [initiator.id, target.id, attacker.id];
    await Promise.all(ids.map(CharacterService.getCharacterById));

    game = new GameService(ids);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.01);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('initiator should be hit by light shield', async () => {
    game.players.players[0].proc = 1;
    game.players.players[2].proc = 1;

    lightShield.cast(game.players.players[0], game.players.players[1], game);
    game.players.players[0].proc = 0.5;

    lightShield.cast(game.players.players[0], game.players.players[1], game);
    attack.cast(game.players.players[2], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
