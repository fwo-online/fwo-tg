import { describe, expect, it } from 'bun:test';
import { floatNumber, getEngineStatus, ping } from '@fwo/engine';

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
});
