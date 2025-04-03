import { connect } from '@/models';
import { ItemModel } from '@/models/item';
import arena from '@/arena';

const main = async () => {
  await connect();

  await ItemModel.load();
  const items = Object.values(arena.items);

  await ItemModel.bulkWrite(
    items.map((item) => ({
      updateMany: {
        filter: { code: item.code },
        update: item,
      },
    })),
  );

  process.exit(0);
};

void main();
