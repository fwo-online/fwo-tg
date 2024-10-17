import { beforeAll, afterAll, afterEach } from 'bun:test';
import { clearDatabase, closeDatabase, connect } from '@/models';

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
