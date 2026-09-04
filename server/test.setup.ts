import { afterEach, beforeAll, beforeEach } from 'bun:test';
import arena from '@/arena';
import { initAchievementSubscriber } from '@/arena/AchievementService';
import { registerGlobals } from '@/utils/registerGlobals';
import TestUtils from '@/utils/testUtils';

beforeAll(async () => {
  registerGlobals();
  initAchievementSubscriber();
});

beforeEach(() => {
  TestUtils.resetCount();
});

afterEach(async () => {
  arena.characters = {};
  arena.games = {};
  TestUtils.cleanupForests();
});
