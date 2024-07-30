import casual from 'casual';
import attack from '@/arena/actions/attack';
import protect from '@/arena/actions/protect';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import thrustWeapon from './thrustWeapon';

// npm t src/arena/passiveSkills/thrustWeapon.test.ts

describe('protect', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPreAffects([protect]);
    attack.registerAffectHandlers([thrustWeapon]);

    initiator = await TestUtils.createCharacter({
      skills: {
        thrustWeapon: 1,
      },
    });
    target = await TestUtils.createCharacter({}, { withWeapon: true });
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should protect player', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    protect.cast(game.players.players[0], game.players.players[0], game);
    attack.cast(game.players.players[1], game.players.players[0], game);

    console.log(game.getRoundResults());
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
