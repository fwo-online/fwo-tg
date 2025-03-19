import {
  describe, beforeEach, it, expect, beforeAll,
  spyOn,
  afterEach,
} from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import parry from './parry';

// npm t server/arena/skills/parry.test.ts

describe('parry', () => {
  let game: GameService;

  beforeAll(() => {
    attack.registerPreAffects([parry]);
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'w' }, { withWeapon: true });
    const target = await TestUtils.createCharacter({ prof: 'l', skills: { parry: 1 } });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('target should parry attack if initiator has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 9999);

    parry.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('target should not parry attack if target has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('attributes.dex', 9999);

    parry.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
