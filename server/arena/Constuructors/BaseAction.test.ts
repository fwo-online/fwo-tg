import { EffectType } from '@fwo/shared';
import { describe, expect, it } from 'bun:test';
import { BaseActionStatus } from './BaseAction';

describe('BaseActionStatus', () => {
  it('should initialize with empty effect parts and 0 effect', () => {
    const status = new BaseActionStatus();
    expect(status.effect).toBe(0);
    expect(status.effectParts).toEqual({});
  });

  it('should set effect part and recalculate total effect', () => {
    const status = new BaseActionStatus();
    status.setEffectPart(EffectType.Physical, 10);
    status.setEffectPart(EffectType.Fire, 5.5);

    expect(status.effectParts[EffectType.Physical]).toBe(10);
    expect(status.effectParts[EffectType.Fire]).toBe(5.5);
    expect(status.effect).toBe(15.5);
  });

  it('should add to existing effect part with addEffectPart', () => {
    const status = new BaseActionStatus();
    status.setEffectPart(EffectType.Physical, 10);
    status.addEffectPart(EffectType.Physical, 4.25);
    status.addEffectPart(EffectType.Acid, 3);

    expect(status.effectParts[EffectType.Physical]).toBe(14.25);
    expect(status.effectParts[EffectType.Acid]).toBe(3);
    expect(status.effect).toBe(17.25);
  });

  it('should multiply specific effect part with mulEffectPart(type, multiplier)', () => {
    const status = new BaseActionStatus();
    status.setEffectPart(EffectType.Physical, 10);
    status.setEffectPart(EffectType.Fire, 4);

    status.mulEffectPart(EffectType.Physical, 2);

    expect(status.effectParts[EffectType.Physical]).toBe(20);
    expect(status.effectParts[EffectType.Fire]).toBe(4);
    expect(status.effect).toBe(24);
  });

  it('should multiply all existing effect parts with mulEffect(multiplier)', () => {
    const status = new BaseActionStatus();
    status.setEffectPart(EffectType.Physical, 10);
    status.setEffectPart(EffectType.Fire, 4);

    status.mulEffect(1.5);

    expect(status.effectParts[EffectType.Physical]).toBe(15);
    expect(status.effectParts[EffectType.Fire]).toBe(6);
    expect(status.effect).toBe(21);
  });

  it('should scale total effect when multiplying with mulEffect(multiplier) without parts', () => {
    const status = new BaseActionStatus();
    status.effect = 10;

    status.mulEffect(1.5);

    expect(status.effect).toBe(15);
  });

  it('should reset properly', () => {
    const status = new BaseActionStatus();
    status.setEffectPart(EffectType.Physical, 10);
    status.exp = 50;
    status.reset();

    expect(status.effect).toBe(0);
    expect(status.exp).toBe(0);
    expect(status.effectParts).toEqual({});
  });
});
