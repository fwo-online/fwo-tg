import { describe, beforeEach, it, expect, beforeAll, spyOn, afterEach } from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import disarm from './disarm';
import beastCall from '@/arena/skills/beastCall';

// npm t server/arena/skills/beastCall.test.ts

describe('beastCall', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
    attack.registerPreAffects([disarm]);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'w', skills: { beastCall: 2 } }, { weapon: {} });

    game = new GameService([initiator.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(async () => {
    spyOn(global.Math, 'random').mockRestore();
  })

  it('should create wolfs', async () => {
    game.players.players[0].proc = 0.5;

    beastCall.cast(game.players.players[0], game.players.players[0], game)

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
    expect(game.players.players.length).toBe(4);
    expect(game.players.players).toMatchObject([{ nick: game.players.players[0].nick}, { nick: '🐺 Волк 1'}, { nick: '🐺 Волк 2'}, { nick: '🐺 Волк 3'}])
  });

});
