import { CharacterService } from '@/arena/CharacterService';
import type { Item } from '@/models/item';
import { MarketItemModel } from '@/models/market-item';

export class MarketItemService {
  static async getMarketItems() {
    const marketItems = await MarketItemModel.find({ sold: false }).sort({ createdAt: -1 });

    return marketItems.map((marketItem) => marketItem.toObject());
  }

  static async createMarketItem(character: CharacterService, itemID: string, price: number) {
    const item = character.inventory.getItem(itemID);
    if (!item) {
      throw new Error('Предмет не найден');
    }

    if (price < item.price * 0.25) {
      throw new Error('Цена слишком низкая');
    }

    if (price > item.price * 2) {
      throw new Error('Цена слишком высокая');
    }

    try {
      await character.inventory.removeItem(itemID);
      /**
       * @todo было бы здорово такие места в транзации делать
       */
      const marketItem = await MarketItemModel.create({
        seller: character.id,
        item,
        price: item.price,
      });

      return marketItem.toObject();
    } catch (e) {
      console.error(e);
      throw new Error('Не удалось создать лот');
    }
  }

  static async buyMarketItem(character: CharacterService, itemID: string) {
    const marketItem = await MarketItemModel.findById(itemID).populate<{ item: Item }>('item');
    if (!marketItem) {
      throw new Error('Лот не найден');
    }
    if (marketItem.sold) {
      throw new Error('Лот уже продан');
    }

    try {
      await character.resources.takeResources({ gold: marketItem.price });
      await marketItem.updateOne({ sold: true });
      await character.inventory.addItem(marketItem.item);

      const seller = await CharacterService.getCharacterById(marketItem.seller.toString());
      await seller.resources.addResources({ gold: Math.round(marketItem.price * 0.8) });
    } catch (e) {
      console.error(e);
      throw new Error('Произошла ошибка при покупке лота');
    }
  }
}
