import type { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { ItemService } from '@/arena/ItemService';
import type { Item } from '@fwo/shared';

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

  static async craftItem(character: CharacterService, code: string) {
    const baseItem = ItemService.getItemByCode(code);

    if (!baseItem) {
      throw new ValidationError('Предмет не найден');
    }

    if (!baseItem.craft) {
      throw new ValidationError('Этот предмет нельзя скрафтить');
    }

    await character.resources.takeResources({
      components: baseItem.craft.components,
      gold: baseItem.price * 0.2,
    });

    const item = await ItemService.createItem(baseItem, character.charObj);

    await character.inventory.addItem(item);

    return item.toObject();
  }
}
