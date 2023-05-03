import mongoose from 'mongoose';
import { closeDatabase, connect } from '@/models';

beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  global.session = await mongoose.startSession();

  await global.session.startTransaction();
});

afterEach(async () => {
  await global.session.abortTransaction();
});

afterAll(async () => {
  await closeDatabase();
});
