import mongoose, { type ConnectOptions } from 'mongoose';

// MONGO - полный mongo uri:
// "mongodb://user:password@db:27017/fwo?retryWrites=true&w=majority&authSource=admin

mongoose.set('toObject', { virtuals: true });

export async function connect(onConnect?: () => void): Promise<void> {
  try {
    const options: ConnectOptions = {
      retryWrites: true,
      w: 'majority',
      authSource: 'admin',
    };

    switch (process.env.NODE_ENV) {
      case 'production':
        await mongoose.connect(
          process.env.MONGO ?? 'mongodb://root:fworootpassword@db:27017/fwo',
          options,
        );
        break;
      case 'development':
      case 'test':
        await mongoose.connect(
          process.env.MONGO ?? 'mongodb://root:fworootpassword@localhost:27017/fwo',
          options,
        );
        break;
      default:
        console.log('unknown env', process.env.NODE_ENV);
    }
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
