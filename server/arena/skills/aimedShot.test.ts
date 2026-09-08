import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { aimedShot } from './aimedShot';
import { dodge } from './dodge';

// npm t server/arena/skills/aimedShot.test.ts

describe('aimedShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { aimedShot: 1 } },
      { skills: { dodge: 1 } },
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

  it('should bypass dodge on target via onCastFail without removing dodge for others', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { aimedShot: 1 } },
      { skills: { dodge: 1 } },
      { weapon: { type: 'thrust' } },
    ]);
    const [p1, p2, p3] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p2.proc = 1;
    p2.stats.set('en', 50);
    p2.stats.set('attributes.dex', 20);
    p3.proc = 1;

    // p2 casts dodge
    dodge.chance[0] = 100;
    dodge.cast(p2, p2, game);
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(1);

    // p1 uses aimedShot and attacks p2
    const initialHp = p2.stats.val('hp');
    aimedShot.chance[0] = 100;
    aimedShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    // p1 hits through dodge and damages p2
    expect(p2.stats.val('hp')).toBeLessThan(initialHp);

    // p2 still keeps dodge effect for other attackers!
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(1);

    // p3 attacks p2 - p2 can still dodge p3
    const hpAfterAimed = p2.stats.val('hp');
    TestUtils.mockRandom(0.01);
    attack.cast(p3, p2, game);
    // p2 dodged p3, hp did not decrease
    expect(p2.stats.val('hp')).toBe(hpAfterAimed);
  });
});
