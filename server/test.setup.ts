import { afterAll, afterEach, beforeAll, beforeEach } from 'bun:test';
import casual from 'casual';
import arena from '@/arena';
import { clearDatabase, closeDatabase, connect } from '@/models';
import { registerGlobals } from '@/utils/registerGlobals';

beforeAll(async () => {
  registerGlobals();
  await connect();
});

beforeEach(() => {
  casual.seed(1);
});

afterEach(async () => {
  await clearDatabase();
  Object.values(arena.actions).forEach((action) => action.clearAffects());
});

afterAll(async () => {
  await closeDatabase();
});
