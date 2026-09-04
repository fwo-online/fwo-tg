import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/PlayersService/PlayerAffects.test.ts

describe('PlayerAffects', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {},
      {},
    ]);
  });

  it('should remove bad effects and preserve good effects and passives', () => {
    const [p1, p2] = game.players.players;

    p1.affects.addLongEffect({ action: 'burning', duration: 2, initiator: p2 });
    p1.affects.addLongEffect({ action: 'corpsePoison', duration: 2, initiator: p2 });
    p1.affects.addLongEffect({ action: 'bleeding', duration: 2, initiator: p2 });
    p1.affects.addEffect({ action: 'asleep', initiator: p2 });
    p1.affects.addEffect({ action: 'stun', initiator: p2 });

    p1.affects.addLongEffect({ action: 'blessing', duration: 3, initiator: p1 });
    p1.affects.addLongEffect({ action: 'lightShield', duration: 3, initiator: p1 });
    p1.affects.addPassive({ action: 'divineIntervention', initiator: p1 });

    const initialCount = p1.affects.affects.length;
    expect(p1.affects.affects).toHaveLength(initialCount);

    p1.affects.removeBadEffects();

    expect(p1.affects.getEffectsByAction('burning')).toHaveLength(0);
    expect(p1.affects.getEffectsByAction('corpsePoison')).toHaveLength(0);
    expect(p1.affects.getEffectsByAction('bleeding')).toHaveLength(0);
    expect(p1.affects.getEffectsByAction('asleep')).toHaveLength(0);
    expect(p1.affects.getEffectsByAction('stun')).toHaveLength(0);

    expect(p1.affects.getEffectsByAction('blessing')).toHaveLength(1);
    expect(p1.affects.getEffectsByAction('lightShield')).toHaveLength(1);
    expect(p1.affects.getEffectsByAction('divineIntervention')).toHaveLength(1);
  });

  it('should remove good effects and preserve bad effects and passives', () => {
    const [p1, p2] = game.players.players;

    p1.affects.addLongEffect({ action: 'burning', duration: 2, initiator: p2 });
    p1.affects.addLongEffect({ action: 'blessing', duration: 3, initiator: p1 });
    p1.affects.addPassive({ action: 'divineIntervention', initiator: p1 });

    p1.affects.removeGoodEffects();

    expect(p1.affects.getEffectsByAction('blessing')).toHaveLength(0);
    expect(p1.affects.getEffectsByAction('burning')).toHaveLength(1);
    expect(p1.affects.getEffectsByAction('divineIntervention')).toHaveLength(1);
  });
});
