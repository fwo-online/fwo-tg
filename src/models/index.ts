import mongoose from 'mongoose';

// MONGO - полный mongo uri:
// "mongodb://user:password@db:27017/fwo?retryWrites=true&w=majority&authSource=admin
export async function connect(onConnect?: () => void): Promise<void> {
  try {
    await mongoose.connect(
      process.env.MONGO ?? 'mongodb://root:fworootpassword@db:27017/fwo?retryWrites=true&w=majority&authSource=admin',
    );
    onConnect?.();
  } catch (e) {
    console.log(e);
  }
}
