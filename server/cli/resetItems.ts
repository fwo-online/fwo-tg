import { connect } from '@/models';
import { CharModel } from '@/models/character';
import { InventoryModel } from '@/models/inventory';
import mongoose from 'mongoose';
import { ItemModel } from '@/models/item';
import { keyBy } from 'es-toolkit';

const main = async () => {
  await connect();

  const inventories = await InventoryModel.find({});
  const items = await ItemModel.find({});
  const itemsByCode = keyBy(items, ({ code }) => code);

  await CharModel.bulkWrite(
    inventories.map(({ code, owner }) => ({
      updateOne: {
        filter: { _id: owner },
        update: { $inc: { gold: itemsByCode[code].price } },
      },
    })),
  );

  mongoose.connection.dropCollection(InventoryModel.modelName);
  mongoose.connection.dropCollection(ItemModel.modelName);

  process.exit(0);
};

void main();
