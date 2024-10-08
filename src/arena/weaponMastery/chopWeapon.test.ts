import casual from 'casual';
import attack from '@/arena/actions/attack';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import chopWeapon from './chopWeapon';

// npm t src/arena/weaponMastery/chopWeapon.test.ts

describe('chopWeapon', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);

    attack.registerPreAffects([chopWeapon]);

    initiator = await TestUtils.createCharacter({
      skills: {
        chopWeapon: 1,
      },
    }, { withWeapon: 'a100' });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.01);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should increase damage with chance', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    jest.spyOn(global.Math, 'random').mockReturnValue(0.06);
    attack.cast(game.players.players[0], game.players.players[1], game);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
