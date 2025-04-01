import _ from 'lodash';
import type { HarksLvl } from '@/data/harks';
import type { Char } from '@/models/character';
import { sum } from 'es-toolkit';
import ValidationError from '@/arena/errors/ValidationError';
import { every } from 'es-toolkit/compat';
import type { CharacterService } from '@/arena/CharacterService';
import { profsData } from '@/data/profs';
import type { Resources } from '@/arena/CharacterService/CharacterResources';
import { assignWithSum } from '@/utils/assignWithSum';
import { calculateDynamicAttributes } from '@fwo/shared';

/**
 * Класс описывающий персонажа внутри игры
 */
export class CharacterAttributes {
  private character: CharacterService;
  private charObj: Char;

  constructor(character: CharacterService) {
    this.character = character;
    this.charObj = character.charObj;
  }

  // Базовые harks без учёта надетых вещей
  get attributes() {
    return structuredClone(this.charObj.harks);
  }

  // Суммарный объект характеристик + вещей.
  getDynamicAttributes(attributes = this.attributes) {
    const inventoryAttributes = this.character.inventory.attributes;
    assignWithSum(attributes, inventoryAttributes);

    const dynamicHarks = calculateDynamicAttributes({
      class: this.charObj.prof,
      attributes,
      lvl: this.character.lvl,
    });

    assignWithSum(dynamicHarks, this.character.inventory.harksFromItems);
    return dynamicHarks;
  }

  async increaseAttributes(harks: HarksLvl) {
    const isValid = every(harks, (value, key) => value >= this.charObj.harks[key]);
    if (!isValid) {
      throw new ValidationError('Аттрибут не может быть уменьшен');
    }

    const free = sum(Object.values(harks)) - sum(Object.values(this.charObj.harks));

    await this.character.resources.takeResources({ free });
    this.charObj.harks = harks;

    await this.character.saveToDb();
  }

  async resetAttributes(cost: Partial<Resources>) {
    const defaultAttributes = profsData[this.character.class].hark;

    const free = sum(Object.values(this.charObj.harks)) - sum(Object.values(defaultAttributes));

    await this.character.resources.takeResources(cost);
    this.charObj.harks = defaultAttributes;

    await this.character.resources.addResources({ free });
  }
}
