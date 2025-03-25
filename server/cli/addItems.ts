import { connect } from '@/models';
import { CharModel } from '@/models/character';
import { ItemModel } from '@/models/item';
import { ItemWear } from '@fwo/shared';

const main = async () => {
  await connect();

  const characters = await CharModel.find({});
  await ItemModel.load();

  await Promise.all(
    characters.map(async (character) => {
      const item = await ItemModel.firstCreate(character);
      await character.updateOne({ items: [item], equipment: { [ItemWear.MainHand]: item } });
    }),
  );

  process.exit(0);
};

void main();
