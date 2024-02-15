import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { handsHeal, protect } from '../actions';
import attack from '../actions/attack';
import { berserk } from '../skills';
import sleep from './sleep';

// npm t src/arena/magics/sleep.test.ts

describe('paralysis', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    handsHeal.registerPreAffects([sleep]);
    protect.registerPreAffects([sleep]);
    berserk.registerPreAffects([sleep]);
    attack.registerPreAffects([sleep]);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { sleep: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w', skills: { berserk: 1 } }, { withWeapon: true });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('target should sleep and not be able to attack', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('maxMp', 99);
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    sleep.cast(game.players.players[0], game.players.players[0], game);

    attack.cast(game.players.players[1], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    handsHeal.cast(game.players.players[1], game.players.players[0], game);
    berserk.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
