import assert from 'node:assert';
import mongoose, { type ConnectOptions } from 'mongoose';

// MONGO - полный mongo uri:
// "mongodb://user:password@db:27017/fwo?retryWrites=true&w=majority&authSource=admin&replicaSet=rs0

mongoose.set('toObject', { virtuals: true });
mongoose.set('transactionAsyncLocalStorage', true);

export async function connect(onConnect?: () => void): Promise<void> {
  assert(process.env.MONGO, 'MONGO is not defined');

  try {
    const options: ConnectOptions = {
      retryWrites: true,
      w: 'majority',
    };

    if (process.env.NODE_ENV === 'production') {
      options.authSource = 'admin';
    }

    await mongoose.connect(process.env.MONGO, options);

    onConnect?.();
  } catch (e) {
    console.log(e);
  }
}

export async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

export async function clearDatabase() {
  const promises: Promise<unknown>[] = [];
  // eslint-disable-next-line guard-for-in,  no-restricted-syntax
  for (const key in mongoose.connection.collections) {
    const collection = mongoose.connection.collections[key];
    promises.push(collection.deleteMany({}));
  }
  await Promise.all(promises);
}
