import { beforeEach, describe, expect, it } from 'bun:test';
import { CharacterService } from '@/arena/CharacterService';
import { MarketItemModel } from '@/models/market-item';
import TestUtils from '@/utils/testUtils';
import { MarketItemService } from './MarketItemService';

describe('MarketItemService', () => {
  let seller: CharacterService;
  let buyer: CharacterService;

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ gold: 0, weapon: {} });
    const target = await TestUtils.createCharacter({ gold: 1000 });

    seller = await CharacterService.getCharacterById(initiator.id);
    buyer = await CharacterService.getCharacterById(target.id);
  });

  describe('getMarketItems', () => {
    it('should return unsold market items sorted by creation date', async () => {
      const [item1, item2] = await Promise.all([
        TestUtils.createItem({}),
        TestUtils.createItem({}),
      ]);
      const [marketItem2] = await MarketItemModel.create([
        { item: item2, seller: seller.id, price: 1000 },
      ]);

      const [marketItem1] = await MarketItemModel.create([
        { item: item1, seller: seller.id, price: 1000 },
      ]);

      const result = await MarketItemService.getMarketItems();

      expect(result).toMatchObject([{ id: marketItem1.id }, { id: marketItem2.id }]);
    });
  });

  describe('createMarketItem', () => {
    it('should create a market item and remove it from inventory', async () => {
      await seller.inventory.unEquipItem(seller.inventory.items[0].id);
      const result = await MarketItemService.createMarketItem(
        seller,
        seller.inventory.items[0].id,
        1000,
      );

      expect(seller.inventory.items).toHaveLength(0);
      expect(result).toMatchObject({});
    });

    it('should not create a market item if price less or more that can be accepted', async () => {
      await seller.inventory.unEquipItem(seller.inventory.items[0].id);
      const promise1 = MarketItemService.createMarketItem(
        seller,
        seller.inventory.items[0].id,
        100,
      );

      await expect(promise1).rejects.toMatchObject({ message: 'Цена слишком низкая' });

      const promise2 = MarketItemService.createMarketItem(
        seller,
        seller.inventory.items[0].id,
        10000,
      );

      await expect(promise2).rejects.toMatchObject({ message: 'Цена слишком высокая' });
    });
  });

  describe('buyMarketItem', () => {
    it('should allow a character to buy a market item and transfer gold to the seller', async () => {
      const itemID = seller.inventory.items[0].id.toString();
      await seller.inventory.unEquipItem(itemID);
      const result = await MarketItemService.createMarketItem(seller, itemID, 1000);

      await MarketItemService.buyMarketItem(buyer, result.id);

      expect(buyer.inventory.items).toHaveLength(1);
      expect(buyer.inventory.items[0].id).toBe(itemID);
      expect(buyer.resources.gold).toBe(0);
      expect(seller.resources.gold).toBe(800);
    });
  });
});
