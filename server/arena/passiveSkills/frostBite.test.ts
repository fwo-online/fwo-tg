import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions';
import { frostbite } from '@/arena/effects';
import { frostTouch } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { frostBite } from './frostBite';

// npm t server/arena/passiveSkills/frostBite.test.ts

describe('frostBite', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    frostBite.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply slow on weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { frostBite: 1 }, branches: ['elements'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    attack.cast(p1, p2, game);

    const effects = p2.affects.getEffectsByAction(frostbite.name);
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should apply slow on frost magic', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { frostTouch: 1 }, passiveSkills: { frostBite: 1 }, branches: ['elements'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('mp', 100);
    frostTouch.cast(p1, p2, game);

    const touchEffects = p2.affects.getEffectsByAction('frostTouch');
    touchEffects[0].onCast?.(game, touchEffects[0]);

    const effects = p2.affects.getEffectsByAction(frostbite.name);
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
