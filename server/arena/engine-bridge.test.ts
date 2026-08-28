import { describe, expect, it } from 'bun:test';
import {
  type BattleDefs,
  type BattleState,
  type Order,
  checkPseudoChance,
  floatNumber,
  getEngineStatus,
  ping,
  rollDiceExpr,
  rollRndmExpr,
} from '@fwo/engine';

describe('Rust Engine NAPI Bridge', () => {
  it('should call ping and return formatted response', () => {
    const res = ping('FWO');
    expect(res).toBe('pong: FWO (from Rust engine)');
  });

  it('should round float numbers to 2 decimal places in Rust', () => {
    expect(floatNumber(10.5555)).toBe(10.56);
    expect(floatNumber(0.1 + 0.2)).toBe(0.3);
    expect(floatNumber(42)).toBe(42);
    expect(floatNumber(1.999)).toBe(2);
  });

  it('should return engine status', () => {
    const status = getEngineStatus();
    expect(status.ready).toBe(true);
    expect(status.version).toBe('0.1.0');
    expect(status.engineName).toBe('fwo-engine-rs');
  });

  it('should parse and evaluate dice expressions in Rust', () => {
    for (let i = 0; i < 20; i++) {
      const dice = rollDiceExpr('1d80+20');
      expect(dice).toBeGreaterThanOrEqual(21);
      expect(dice).toBeLessThanOrEqual(100);

      const rndm = rollRndmExpr('1d100');
      expect(rndm).toBeGreaterThanOrEqual(1);
      expect(rndm).toBeLessThanOrEqual(100);
    }
  });

  it('should calculate pseudo-random chances with streaks in Rust', () => {
    expect(checkPseudoChance(100, 0)).toBe(true);
    expect(checkPseudoChance(0, 0)).toBe(false);
    expect(checkPseudoChance(10, 50)).toBe(true);
  });

  it('should typecheck domain structures properly', () => {
    const defs: BattleDefs = {
      players: [
        {
          id: 0,
          nick: 'Player1',
          clanId: 'Alpha',
          weapon: { weaponType: 'cut', minHit: 1, maxHit: 5 },
          skills: { attack: 1 },
          magics: { fireBall: 2 },
          passives: { sweepingBlow: 1 },
          resists: { phys: 0.1 },
          baseStats: { 'phys.attack': 20 },
          maxTarget: 1,
        },
      ],
    };

    const state: BattleState = {
      players: [
        {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          energy: 100,
          maxEnergy: 100,
          expEarned: 0,
          isAlive: true,
          failStreaks: {},
          affects: [],
        },
      ],
      round: 1,
      noDamageStreak: 0,
    };

    const order: Order = {
      initiator: 0,
      target: 1,
      action: 'attack',
      proc: 100,
    };

    expect(defs.players[0].nick).toBe('Player1');
    expect(state.players[0].hp).toBe(100);
    expect(order.action).toBe('attack');
  });
});
