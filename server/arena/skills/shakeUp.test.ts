import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { attack } from '@/arena/actions';
import { effectService } from '@/arena/EffectService';
import { engine } from '@/arena/EngineService';
import { concussion } from '@/arena/effects';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import TestUtils from '@/utils/testUtils';
import { dodge } from './dodge';
import { help } from './help';
import { shakeUp } from './shakeUp';

describe('shakeUp', () => {
  let game: GameService;
  let roll: ReturnType<typeof spyOn<typeof MiscService, 'rndm'>>;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { skills: { shakeUp: 1 }, weapon: { type: 'cut' } },
      { skills: { dodge: 1 } },
      {},
    ]);
    for (const player of game.players.players) {
      player.affects.filterAffects(() => false);
      player.stats.set('hp', 100);
      player.stats.set('en', 50);
      player.stats.set('phys.attack', 100);
      player.stats.set('magic.attack', 100);
    }
    const [initiator] = game.players.players;
    initiator.stats.set('hit.physical.min', 10);
    initiator.stats.set('hit.physical.max', 10);
    TestUtils.mockRandom();
    roll = spyOn(MiscService, 'rndm').mockReturnValue(1);
  });

  afterEach(() => {
    roll.mockRestore();
    TestUtils.restoreRandom();
  });

  it('prepares and attacks in one round, applying concussion to the redirected target', () => {
    const [initiator, protectedTarget, rescuer] = game.players.players;
    help.createContext(rescuer, protectedTarget, game);
    help.run();
    game.orders.ordersList.push(
      {
        id: 'shake-up-prepare',
        action: 'shakeUp',
        initiator: initiator.id,
        target: initiator.id,
        proc: 25,
      },
      {
        id: 'shake-up-attack',
        action: 'attack',
        initiator: initiator.id,
        target: protectedTarget.id,
        proc: 75,
      },
    );
    expect(engine(game)).toBe(game);
    expect(initiator.stats.val('en')).toBe(40);
    expect(initiator.affects.getEffectsByAction('shakeUp')).toHaveLength(0);
    expect(protectedTarget.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(protectedTarget.stats.val('hp')).toBe(100);
    expect(rescuer.stats.val('hp')).toBe(92.5);
    expect(rescuer.stats.val('phys.attack')).toBe(90);
    expect(rescuer.stats.val('magic.attack')).toBe(90);
    expect(rescuer.affects.getEffectsByAction('concussion')[0]).toMatchObject({
      type: 'long-effect',
      value: 10,
      duration: 2,
    });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('keeps preparation after a dodge and zero damage, but clears it at round end', () => {
    const [initiator, target] = game.players.players;
    initiator.proc = 1;
    target.proc = 1;
    shakeUp.cast(initiator, initiator, game);
    dodge.cast(target, target, game);
    attack.cast(initiator, target, game);
    expect(initiator.affects.getEffectsByAction('shakeUp')).toHaveLength(1);

    target.affects.removeEffectsByAction('dodge');
    target.stats.set('resists.physical', 0);
    attack.cast(initiator, target, game);
    expect(initiator.affects.getEffectsByAction('shakeUp')).toHaveLength(1);
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(target.stats.val('hp')).toBe(100);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    game.players.reset();
    expect(initiator.affects.getEffectsByAction('shakeUp')).toHaveLength(0);
  });

  it('consumes preparation on the first raw splash only and allows another concussion record', () => {
    const [initiator, target, otherTarget] = game.players.players;
    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value: 10,
      duration: 2,
      onCast(game, affect) {
        concussion.castLongEffect(initiator, target, game, affect);
      },
    });
    const existing = target.affects.getEffectsByAction('concussion')[0];
    existing.onCast?.(game, existing);
    initiator.proc = 1;
    shakeUp.cast(initiator, initiator, game);

    const splash = attack.createContext(initiator, target, game);
    splash.status.effect = 10;
    effectService.rawDamage(splash, attack);
    attack.calculateExp(splash);
    attack.next(splash);
    expect(initiator.affects.getEffectsByAction('shakeUp')).toHaveLength(0);
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(2);
    expect(target.stats.val('phys.attack')).toBe(81);
    expect(target.stats.val('magic.attack')).toBe(81);

    const laterHit = attack.createContext(initiator, otherTarget, game);
    laterHit.status.effect = 10;
    effectService.rawDamage(laterHit, attack);
    attack.calculateExp(laterHit);
    attack.next(laterHit);
    expect(otherTarget.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(initiator.stats.val('en')).toBe(40);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
