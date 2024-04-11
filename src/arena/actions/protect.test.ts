import casual from 'casual';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import attack from './attack';
import protect from './protect';

// npm t src/arena/actions/protect.test.ts

describe('protect', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPreAffects([protect]);

    initiator = await TestUtils.createCharacter();
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

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not get exp if protect enemy', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    protect.cast(game.players.players[0], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
