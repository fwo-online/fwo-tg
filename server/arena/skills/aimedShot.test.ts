import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { aimedShot } from './aimedShot';

// npm t server/arena/skills/aimedShot.test.ts

describe('aimedShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { aimedShot: 1 } },
      {},
    ]);

    TestUtils.mockRandom();
    aimedShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should buff next ranged attack and deal increased damage', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    aimedShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should remove dodge from target when aimed shot attacks', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    p2.affects.addEffect({
      action: 'dodge',
      initiator: p2,
      value: 50,
    });
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(1);

    aimedShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.affects.getEffectsByAction('dodge').length).toBe(0);
  });
});
