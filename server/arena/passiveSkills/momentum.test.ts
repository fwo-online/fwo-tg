import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { momentum } from './momentum';

// npm t arena/passiveSkills/momentum.test.ts

describe('momentum', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    momentum.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should restore energy and stack damage bonus on ranged hits', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, passiveSkills: { momentum: 1 } },
      {},
    ]);

    const [archer, enemy] = game.players.players;
    archer.proc = 1;
    archer.stats.set('en', 10);

    // 1st attack: restores energy and adds 1st stack
    attack.cast(archer, enemy, game);

    expect(archer.stats.val('en')).toBe(12); // 10 + 2
    const stackEffect = archer.affects.getEffectsByAction('momentum').find((a) => a.type === 'effect');
    expect(stackEffect?.value).toBe(1);

    // 2nd attack: gets damage bonus and adds 2nd stack
    attack.cast(archer, enemy, game);
    expect(archer.stats.val('en')).toBe(14); // 12 + 2
    expect(stackEffect?.value).toBe(2);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
