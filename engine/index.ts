import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Загрузка нативного Rust бинарника
const binding = require(join(__dirname, 'fwo-engine.linux-x64-gnu.node'));

export interface EngineStatus {
  ready: boolean;
  version: string;
  engineName: string;
}

export const ping = (msg: string): string => binding.ping(msg);
export const floatNumber = (val: number): number => binding.floatNumber(val);
export const getEngineStatus = (): EngineStatus => binding.getEngineStatus();

export default {
  ping,
  floatNumber,
  getEngineStatus,
};
