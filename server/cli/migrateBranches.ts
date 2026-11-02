import mongoose from 'mongoose';
import { connect } from '@/models';
import { CharModel } from '@/models/character';

async function main() {
  await connect();
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Could not connect to MongoDB');
  }

  try {
    // Use the raw collection: magicBranches is intentionally absent from the new Mongoose schema.
    const result = await CharModel.collection.updateMany(
      {
        magicBranches: { $type: 'array' },
        $or: [{ branches: { $exists: false } }, { branches: { $size: 0 } }],
      },
      [{ $set: { branches: '$magicBranches' } }, { $unset: 'magicBranches' }],
    );
    console.log(`Migrated branches on ${result.modifiedCount} characters`);
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
