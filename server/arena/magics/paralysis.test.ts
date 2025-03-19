import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import paralysis from './paralysis';

// npm t server/arena/magics/paralysis.test.ts

describe('paralysis', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);

    attack.registerPreAffects([paralysis]);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { paralysis: 1 } });
    const target = await TestUtils.createCharacter({ prof: 'w' }, { withWeapon: true });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('initiator should be blinded by eclipse', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('base.mp', 99);
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    paralysis.cast(game.players.players[0], game.players.players[0], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
