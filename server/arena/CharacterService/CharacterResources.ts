import type { Char } from '@/models/character';
import ValidationError from '@/arena/errors/ValidationError';
import type { ItemComponent } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';

export interface Resources {
  exp: number;
  gold: number;
  components: Partial<Record<ItemComponent, number>>;
  free: number;
  bonus: number;
}

export class CharacterResources {
  private character: CharacterService;
  private charObj: Char;

  constructor(character: CharacterService) {
    this.character = character;
    this.charObj = character.charObj;
  }

  get gold() {
    return this.charObj.gold;
  }

  get components() {
    return structuredClone(this.charObj.components);
  }

  get exp() {
    return this.charObj.exp;
  }

  get bonus() {
    return this.charObj.bonus;
  }

  get free() {
    return this.charObj.free;
  }

  private addExp(value: number) {
    const oldLvl = this.character.lvl;

    this.charObj.bonus += Math.round(value / 100) - Math.round(this.charObj.exp / 100);
    this.charObj.exp += value;
    this.charObj.free += (this.character.lvl - oldLvl) * 10;
  }

  private addComponents(components: Partial<Record<ItemComponent, number>>) {
    this.charObj.components.forEach((oldValue, key) => {
      if (components[key]) {
        this.charObj.components.set(key, oldValue + components[key]);
      }
    });
  }

  private addGold(gold: number) {
    this.charObj.gold += gold;
  }

  async addResources({ components, gold, exp }: Partial<Resources>) {
    if (components) {
      this.addComponents(components);
    }

    if (gold) {
      this.addGold(gold);
    }

    if (exp) {
      this.addExp(exp);
    }

    await this.character.saveToDb();
  }

  async takeResources({ components, gold, free, bonus }: Partial<Resources>) {
    this.validateResources({ components, gold, free, bonus });

    if (components) {
      this.charObj.components.forEach((value, key) => {
        if (components[key]) {
          this.charObj.components.set(key, value - components[key]);
        }
      });
    }

    if (gold) {
      this.charObj.gold -= gold;
    }

    if (free) {
      this.charObj.free -= free;
    }

    if (bonus) {
      this.charObj.bonus -= bonus;
    }

    await this.character.saveToDb();
  }

  /** @throws {ValidationError} */
  private validateBonus(bonus: number) {
    if (this.bonus < bonus) {
      throw new ValidationError('Недостаточно очков');
    }
  }

  /** @throws {ValidationError} */
  private validateFree(free: number) {
    if (this.free < free) {
      throw new ValidationError('Недостаточно очков');
    }
  }

  /** @throws {ValidationError} */
  private validateGold(gold: number) {
    if (this.gold < gold) {
      throw new ValidationError('Недостаточно золота');
    }
  }

  /** @throws {ValidationError} */
  private validateComponents(components: Partial<Record<ItemComponent, number>>) {
    this.components.forEach((value, key) => {
      if (components[key] && value < components[key]) {
        throw new ValidationError('Недостаточно компонентов');
      }
    });
  }

  /** @throws {ValidationError} */
  private validateResources({ gold, components, bonus, free }: Partial<Resources>) {
    if (components) {
      this.validateComponents(components);
    }

    if (gold) {
      this.validateGold(gold);
    }

    if (bonus) {
      this.validateBonus(bonus);
    }

    if (free) {
      this.validateFree(free);
    }
  }
}
