import { afterEach, beforeAll, beforeEach } from 'bun:test';
import arena from '@/arena';
import { registerGlobals } from '@/utils/registerGlobals';
import TestUtils from '@/utils/testUtils';

beforeAll(async () => {
  registerGlobals();
});

beforeEach(() => {
  TestUtils.resetCount();
});

afterEach(async () => {
  arena.characters = {};
  arena.games = {};
  TestUtils.cleanupForests();
});
