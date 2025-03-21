import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { handsHeal, protect } from '../actions';
import attack from '../actions/attack';
import { berserk } from '../skills';
import sleep from './sleep';

// npm t server/arena/magics/sleep.test.ts

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
    const initiator1 = await TestUtils.createCharacter({ prof: 'm', magics: { sleep: 1 } });
    const initiator2 = await TestUtils.createCharacter({ prof: 'm', magics: { sleep: 1 } });
    const target = await TestUtils.createCharacter(
      { prof: 'w', skills: { berserk: 1 } },
      { weapon: {} },
    );

    await Promise.all(
      [initiator1.id, target.id, initiator2.id].map(CharacterService.getCharacterById),
    );

    game = new GameService([initiator1.id, target.id, initiator2.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.05);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('target should sleep and not be able to attack', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 0.25;

    sleep.cast(game.players.players[0], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);
    berserk.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;
    game.players.players[2].stats.set('mp', 99);
    game.players.players[1].proc = 0.25;

    sleep.cast(game.players.players[0], game.players.players[1], game);
    sleep.cast(game.players.players[2], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);
    berserk.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
