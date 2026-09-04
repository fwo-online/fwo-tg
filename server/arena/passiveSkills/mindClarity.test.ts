import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions';
import { magicArrow } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { mindClarity } from './mindClarity';

// npm t server/arena/passiveSkills/mindClarity.test.ts

describe('mindClarity', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    mindClarity.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
    magicArrow.chance = [92, 94, 95];
  });

  it('should remove madness and glitch effects on action', async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { mindClarity: 1 }, branches: ['arcana'] },
      {},
    ]);

    const p1 = game.players.players[0];
    p1.affects.addEffect({
      action: 'madness',
      initiator: p1,
    });
    expect(p1.affects.getEffectsByAction('madness').length).toBe(1);

    p1.affects.onBeforeAction({ params: { initiator: p1 } } as any, attack);
    expect(p1.affects.getEffectsByAction('madness').length).toBe(0);
  });

  it('should save spell on cast fail and record affect', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { magicArrow: 1 }, passiveSkills: { mindClarity: 1 }, branches: ['arcana'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('mp', 100);
    magicArrow.chance = [0, 0, 0];

    magicArrow.cast(p1, p2, game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
