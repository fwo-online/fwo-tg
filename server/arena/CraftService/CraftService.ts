import type { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { ItemService } from '@/arena/ItemService';
import MiscService from '@/arena/MiscService';
import { type Item, ItemWear } from '@fwo/shared';
import { mapValues } from 'es-toolkit';

export class CraftService {
  /**
   * Закладка для рандомных модификаторов предмета, например, "Крепкий Стальной шлем"
   * @todo
   */
  static getRandomModifiers() {
    const modifier = {
      heavy: {
        phys: { defence: 1 },
        magic: { defence: 1 },
        weight: 1,
      },
      arcane: {
        magic: { attack: 1, defence: 1 },
      },
    } satisfies Record<string, DeepPartial<Item>>;

    return modifier;
  }

  static checkChance(tier: number) {
    if (tier === 2 && MiscService.dice('1d100') > 30) {
      return false;
    }

    return true;
  }

  static async craftItem(character: CharacterService, code: string, tier?: number) {
    const baseItem = ItemService.getItemByCode(code);

    if (!baseItem) {
      throw new ValidationError('Предмет не найден');
    }

    if (!baseItem.craft || baseItem.tier !== tier) {
      throw new ValidationError('Этот предмет нельзя скрафтить');
    }

    if (!this.checkChance(baseItem.tier)) {
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
