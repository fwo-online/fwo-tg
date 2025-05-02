import type { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { ItemService } from '@/arena/ItemService';
import MiscService from '@/arena/MiscService';
import { baseItemCostModifier, baseCraftChance, getItemPrice } from '@fwo/shared';
import { mapValues } from 'es-toolkit';

export class CraftService {
  static checkChance(tier: number, modifier = 0) {
    if (tier === 1) {
      return true;
    }

    const chance = Math.min(baseCraftChance[tier] + modifier * 100, 100);
    console.debug('craft item chance:', chance, 'modifier:', modifier, 'tier:', tier);

    return MiscService.dice('1d100') <= chance;
  }

  static getResourcesModifier(tier: number, modifier: number) {
    return Math.min(Math.max((tier - 1) * (baseItemCostModifier - modifier), 0), 1);
  }

  static async craftItem(character: CharacterService, code: string, modifier = 0) {
    const baseItem = ItemService.getItemByCode(code);

    if (!baseItem) {
      throw new ValidationError('Предмет не найден');
    }

    if (!baseItem.craft) {
      throw new ValidationError('Этот предмет нельзя скрафтить');
    }

    if (!this.checkChance(baseItem.tier, modifier)) {
      const resourcesModifier = this.getResourcesModifier(baseItem.tier, modifier);
      await character.resources.takeResources({
        components: mapValues(baseItem.craft.components, (val = 0) =>
          Math.ceil(val * resourcesModifier),
        ),
        gold: Math.ceil(baseItem.price * resourcesModifier),
      });

      throw new ValidationError('Не удалось скрафтить предмет');
    }

    await character.resources.takeResources({
      components: baseItem.craft.components,
      gold: getItemPrice(baseItem.price, baseItem.tier),
    });

    const item = await ItemService.createItem(baseItem, character.charObj);

    await character.inventory.addItem(item.toObject());

    return item.toObject();
  }
}
