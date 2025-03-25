import { connect } from '@/models';
import { CharModel } from '@/models/character';
import { InventoryModel } from '@/models/inventory';
import arena from '@/arena';
import mongoose from 'mongoose';
import { ItemModel } from '@/models/item';

const main = async () => {
  await connect();

  const inventories = await InventoryModel.find({});

  await CharModel.bulkWrite(
    inventories.map(({ code, owner }) => ({
      updateMany: {
        filter: { id: owner },
        update: { $inc: { gold: arena.items[code].price } },
      },
    })),
  );

  mongoose.connection.dropCollection(InventoryModel.modelName);
  mongoose.connection.dropCollection(ItemModel.modelName);

  process.exit(0);
};

void main();
