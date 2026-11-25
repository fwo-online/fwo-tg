import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { ItemWear } from '@fwo/shared';
import { engine } from '@/arena/EngineService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import TestUtils from '@/utils/testUtils';
import { shieldBash } from './shieldBash';

describe('shieldBash', () => {
  let game: GameService;
  let roll: ReturnType<typeof spyOn<typeof MiscService, 'rndm'>>;

  beforeEach(async () => {
    const shield = await TestUtils.createItem({
      type: 'shield',
      wear: ItemWear.OffHand,
      phys: { defence: 10 },
    });
    game = await TestUtils.createGame([
      {
        skills: { shieldBash: 1 },
        items: [shield],
        equipment: new Map([[ItemWear.OffHand, shield]]),
      },
      { weapon: { type: 'cut' } },
    ]);
    for (const player of game.players.players) {
      player.affects.filterAffects(() => false);
      player.stats.set('hp', 100);
      player.stats.set('en', 50);
    }
    const [, target] = game.players.players;
    target.stats.set('hit.physical.min', 10);
    target.stats.set('hit.physical.max', 10);
    TestUtils.mockRandom();
    roll = spyOn(MiscService, 'rndm').mockReturnValue(1);
  });

  afterEach(() => {
    roll.mockRestore();
    TestUtils.restoreRandom();
  });

  it('stuns without damage and cancels subsequent actions until round cleanup', () => {
    const [initiator, target] = game.players.players;
    game.orders.ordersList.push(
      {
        id: 'shield-bash',
        action: 'shieldBash',
        initiator: initiator.id,
        target: target.id,
        proc: 25,
      },
      {
        id: 'stunned-attack',
        action: 'attack',
        initiator: target.id,
        target: initiator.id,
        proc: 75,
      },
      {
        id: 'stunned-heal',
        action: 'handsHeal',
        initiator: target.id,
        target: target.id,
        proc: 25,
      },
    );
    expect(engine(game)).toBe(game);
    expect(initiator.stats.val('en')).toBe(40);
    expect(initiator.stats.val('hp')).toBe(100);
    expect(target.stats.val('hp')).toBe(100);
    expect(target.affects.getEffectsByAction('stun')).toHaveLength(1);
    expect(roll).toHaveBeenCalledTimes(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
    game.players.reset();
    expect(target.affects.getEffectsByAction('stun')).toHaveLength(0);
  });

  it('rejects a missing shield before charging energy or rolling chance', () => {
    const [initiator, target] = game.players.players;
    initiator.offHand.item = undefined;
    shieldBash.cast(initiator, target, game);
    expect(initiator.stats.val('en')).toBe(50);
    expect(target.affects.getEffectsByAction('stun')).toHaveLength(0);
    expect(roll).not.toHaveBeenCalled();
    expect(game.getRoundResults()[0]).toMatchObject({ reason: 'NO_SHIELD' });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('charges energy but does not stun when the skill chance fails', () => {
    const [initiator, target] = game.players.players;
    roll.mockReturnValue(51);
    shieldBash.cast(initiator, target, game);
    expect(initiator.stats.val('en')).toBe(40);
    expect(target.stats.val('hp')).toBe(100);
    expect(target.affects.getEffectsByAction('stun')).toHaveLength(0);
    expect(roll).toHaveBeenCalledTimes(1);
    expect(game.getRoundResults()[0]).toMatchObject({ reason: 'SKILL_FAIL' });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
