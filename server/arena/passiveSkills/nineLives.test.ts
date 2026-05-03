import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { nineLives } from './nineLives';

// npm t server/arena/passiveSkills/nineLives.test.ts

describe('nineLives', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([{ passiveSkills: { nineLives: 1 } }]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('initiator should be revived', () => {
    nineLives.chance = [100];

    nineLives.cast(game.players.players[0]);
    game.players.players[0].stats.set('hp', -1);
    expect(game.players.players[0].stats.val('hp')).toBe(-1);

    const effects = game.players.players[0].affects.getEffectsByAction('nineLives');
    effects[0]?.onCast?.(game, effects[0]);

    expect(game.players.players[0].stats.val('hp')).toBe(0.05);
    expect(game.players.players[0].getKiller()).toBeUndefined();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
