import { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import type { Item } from '@/models/item';
import { type MarketItem, MarketItemModel } from '@/models/market-item';
import { populatedDocGuard } from '@/utils/populatedDocGuard';
import type { Document } from 'mongoose';

export class MarketItemService {
  static async getMarketItems() {
    const marketItems = await MarketItemModel.find({ sold: false })
      .sort({ createdAt: -1 })
      .populate<{ item: Item }>('item')
      .populate<{ seller: Char }>({ path: 'seller', populate: { path: 'clan' } });

    return marketItems.map((marketItem) => this.toObject(marketItem));
  }

  static toObject(marketItem: MarketItem) {
    if (!populatedDocGuard(marketItem.item) || !populatedDocGuard(marketItem.seller)) {
      console.error('marketItem is not populated', marketItem);
      throw new ValidationError('Лот не найден');
    }

    return {
      id: marketItem.id,
      seller: CharacterService.toPublicObject(marketItem.seller),
      item: marketItem.item,
      price: marketItem.price,
      createdAt: marketItem.createdAt,
    };
  }

  static async createMarketItem(character: CharacterService, itemID: string, price: number) {
    const item = character.inventory.getItem(itemID);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }

    if (price < item.price * 0.25) {
      throw new ValidationError('Цена слишком низкая');
    }

    if (price > item.price * 2) {
      throw new ValidationError('Цена слишком высокая');
    }

    try {
      await character.inventory.removeItem(itemID);
      /**
       * @todo было бы здорово такие места в транзации делать
       */
      const marketItem = await MarketItemModel.create({
        seller: character.id,
        item,
        price,
      });

      return marketItem.toObject();
    } catch (e) {
      console.error(e);
      throw new ValidationError('Не удалось создать лот');
    }
  }

  static async removeMarketItem(character: CharacterService, marketItemID: string) {
    const marketItem = await MarketItemModel.findById(marketItemID)
      .populate<{ item: Document<Item> }>('item')
      .populate<{ seller: Char }>('seller');

    if (!marketItem) {
      throw new ValidationError('Лот не найден');
    }
    if (marketItem.sold) {
      throw new ValidationError('Лот уже продан');
    }
    if (!marketItem.seller._id.equals(character.id)) {
      throw new ValidationError('Вы не можете отменить чужой лот');
    }

    try {
      await marketItem.deleteOne();
      await character.inventory.addItem(marketItem.item.toObject());
    } catch (e) {
      console.error(e);
      throw new ValidationError('Не удалось отменить лот');
    }
  }

  static async buyMarketItem(character: CharacterService, marketItemID: string) {
    const marketItem = await MarketItemModel.findById(marketItemID)
      .populate<{ item: Document<Item> }>('item')
      .populate<{ seller: Char }>('seller');
    if (!marketItem) {
      throw new ValidationError('Лот не найден');
    }
    if (marketItem.sold) {
      throw new ValidationError('Лот уже продан');
    }
    if (marketItem.seller._id.equals(character.id)) {
      throw new ValidationError('Вы не можете купить свой собственный лот');
    }

    try {
      const result = await marketItem.updateOne({ sold: true });
      if (result.modifiedCount === 0) {
        throw new ValidationError('Лот больше не существует');
      }
      await character.resources.takeResources({ gold: marketItem.price });
      await character.inventory.addItem(marketItem.item.toObject());

      const seller = await CharacterService.getCharacterById(marketItem.seller.id);
      await seller.resources.addResources({ gold: Math.round(marketItem.price * 0.8) });
    } catch (e) {
      console.error(e);
      throw new ValidationError('Произошла ошибка при покупке лота');
    }
  }
}
