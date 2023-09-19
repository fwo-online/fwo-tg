import { connect } from '@/models';
import { CharModel } from '@/models/character';
import { InventoryModel } from '@/models/inventory';
import { ItemModel } from '@/models/item';

const main = async () => {
  await connect();
  await ItemModel.load();

  const inventories = await InventoryModel.find();

  for await (const inventory of inventories) {
    const item = await ItemModel.findOne({ code: inventory.code });
    const character = await CharModel.findById(inventory.owner);

    if (!character || !item) {
      console.log('Entity not found for: ', inventory);
    } else {
      await inventory.deleteOne();
      await character.updateOne({
        $inc: {
          gold: item.price,
        },
      });
    }
  }

  process.exit(0);
};

void main();
