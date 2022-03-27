import mongoose from 'mongoose';

mongoose.set('toObject', { virtuals: true });
// MONGO - полный mongo uri:
// "mongodb://user:password@db:27017/fwo?retryWrites=true&w=majority&authSource=admin
export async function connect(onConnect?: () => void): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.connect(
        process.env.MONGO ?? 'mongodb://root:fworootpassword@db:27017/fwo?retryWrites=true&w=majority&authSource=admin',
      );
    } else {
      await mongoose.connect(
        process.env.MONGO ?? 'mongodb://root:fworootpassword@localhost:27017/fwo?retryWrites=true&w=majority&authSource=admin',
      );
    }
    onConnect?.();
  } catch (e) {
    console.log(e);
  }
}
