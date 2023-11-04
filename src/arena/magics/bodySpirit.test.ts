import casual from 'casual';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import bodySpirit from './bodySpirit';

// npm t src/arena/magics/bodySpirit.test.ts

describe('bodySpirit', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    initiator = await TestUtils.createCharacter({ prof: 'm', magics: { bodySpirit: 3 } });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit target and get mp', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', bodySpirit.cost);

    bodySpirit.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('mp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
