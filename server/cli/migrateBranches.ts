import mongoose from 'mongoose';
import { connect } from '@/models';
import { CharModel } from '@/models/character';

const validExperience = {
  $expr: { $and: [{ $isNumber: '$exp' }, { $gte: ['$exp', 0] }] },
};

async function main() {
  await connect();
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Could not connect to MongoDB');
  }

  try {
    // MongoDB $round uses banker's rounding; XP is non-negative, so adding
    // 0.5 and flooring matches Math.round(exp / 100) in CharacterResources.
    const result = await CharModel.collection.updateMany(validExperience, [
      {
        $set: {
          magics: {},
          skills: {},
          passiveSkills: {},
          bonus: { $floor: { $add: [{ $divide: ['$exp', 100] }, 0.5] } },
        },
      },
    ]);
    console.log(`Reset abilities on ${result.modifiedCount} characters`);
    const skipped = await CharModel.collection.countDocuments({
      $nor: [validExperience],
    });
    if (skipped > 0) {
      console.warn(`${skipped} characters have invalid experience and need manual review`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
