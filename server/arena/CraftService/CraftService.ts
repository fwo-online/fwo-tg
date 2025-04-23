import type { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { ItemService } from '@/arena/ItemService';
import MiscService from '@/arena/MiscService';
import { mapValues } from 'es-toolkit';

export class CraftService {
  static baseCraftChance: Record<number, number> = {
    1: 100,
    2: 60,
    3: 30,
  };

  static checkChance(tier: number, modifier = 0) {
    if (tier === 1) {
      return true;
    }

    const chance = this.baseCraftChance[tier] + modifier * 100;
    console.debug('craft item chance:', chance, 'modifier:', modifier, 'tier:', tier);

    return MiscService.dice('1d100') <= chance;
  }

  static async craftItem(character: CharacterService, code: string, modifier: number) {
    const baseItem = ItemService.getItemByCode(code);

    if (!baseItem) {
      throw new ValidationError('Предмет не найден');
    }

    if (!baseItem.craft) {
      throw new ValidationError('Этот предмет нельзя скрафтить');
    }

    if (!this.checkChance(baseItem.tier, modifier)) {
      const modifier = Math.min(baseItem.tier - 1 * 0.33, 1);
      await character.resources.takeResources({
        components: mapValues(baseItem.craft.components, (val = 0) => Math.ceil(val * modifier)),
        gold: baseItem.price * 0.4 * modifier,
      });

      throw new ValidationError('Не удалось скрафтить предмет');
    }

    await character.resources.takeResources({
      components: baseItem.craft.components,
      gold: baseItem.price * 0.4,
    });

    const item = await ItemService.createItem(baseItem, character.charObj);

    await character.inventory.addItem(item.toObject());

    return item.toObject();
  }
}
