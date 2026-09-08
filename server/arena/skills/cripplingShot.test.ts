import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { cripplingShot } from './cripplingShot';
import { dodge } from './dodge';

// npm t arena/skills/cripplingShot.test.ts

describe('cripplingShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { cripplingShot: 1 } },
      { skills: { dodge: 1 } },
    ]);

    TestUtils.mockRandom();
    cripplingShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce target dex and strip current dodge', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    p2.affects.addEffect({
      action: 'dodge',
      initiator: p2,
      value: 50,
    });
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(1);

    const initialDex = p2.stats.val('attributes.dex');
    cripplingShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('attributes.dex')).toBeLessThan(initialDex);
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(0);
    expect(p2.affects.getEffectsByAction('cripplingShot').length).toBe(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should block dodge cast while crippled', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p2.proc = 1;
    p2.stats.set('en', 50);

    cripplingShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    // Now p2 has cripplingShot longEffect
    expect(p2.affects.getEffectsByAction('cripplingShot').length).toBe(1);

    // p2 tries to cast dodge
    dodge.cast(p2, p2, game);

    // Dodge should not be in affects because it threw CastError during cast
    expect(p2.affects.getEffectsByAction('dodge').length).toBe(0);
  });
});
