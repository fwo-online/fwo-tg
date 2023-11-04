import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import disarm from './disarm';

// npm t src/arena/skills/disarm.test.ts

describe('disarm', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'w' }, { withWeapon: true });
    const target = await TestUtils.createCharacter({ prof: 'l', skills: { disarm: 1 } });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('target should be disarmed if initiator has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('dex', 9999);

    disarm.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('target should not be disarmed if initiator has less dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('dex', 9999);

    disarm.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
