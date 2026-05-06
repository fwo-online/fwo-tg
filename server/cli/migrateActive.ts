import { connect } from '@/models';
import { CharModel } from '@/models/character';

const main = async () => {
  await connect();

  const result = await CharModel.updateMany(
    { deleted: false, active: { $exists: false } },
    { active: true },
  );

  console.log(`Migrated: set active=true on ${result.modifiedCount} characters`);
  process.exit(0);
};

void main();
