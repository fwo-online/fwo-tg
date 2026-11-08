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
    // Use the raw collection because magicBranches is no longer in the schema.
    const branches = await CharModel.collection.updateMany(
      {
        magicBranches: { $type: 'array' },
        $expr: {
          $or: [
            { $eq: [{ $type: '$branches' }, 'missing'] },
            { $eq: [{ $type: '$branches' }, 'null'] },
            { $isArray: '$branches' },
          ],
        },
      },
      [
        {
          $set: {
            branches: {
              $reduce: {
                input: '$magicBranches',
                initialValue: { $ifNull: ['$branches', []] },
                in: {
                  $cond: [
                    { $in: ['$$this', '$$value'] },
                    '$$value',
                    { $concatArrays: ['$$value', ['$$this']] },
                  ],
                },
              },
            },
          },
        },
        { $unset: 'magicBranches' },
      ],
    );
    console.log(`Migrated branches on ${branches.modifiedCount} characters`);
    const remaining = await CharModel.collection.countDocuments({
      magicBranches: { $exists: true },
    });
    if (remaining > 0) {
      console.warn(`${remaining} characters have invalid branch data and need manual review`);
    }

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
