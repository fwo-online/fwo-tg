import type { Char } from '@/models/character';
import ValidationError from '@/arena/errors/ValidationError';
import type { ItemComponent } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import { forEach } from 'es-toolkit/compat';

export interface Resources {
  exp: number;
  gold: number;
  components: Partial<Record<ItemComponent, number>>;
  free: number;
  bonus: number;
  skipVigor?: boolean;
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
    return this.charObj.components;
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

  private addExp(value: number, skipVigor = false): { leveledUp: boolean; oldLvl: number; newLvl: number; freeAdded: number } {
    let effectiveExp = value;

    if (!skipVigor && !this.character.isBot) {
      const now = new Date();
      if (!this.charObj.vigor) {
        this.charObj.vigor = { energy: 100, lastResetDate: now };
      } else {
        const last = new Date(this.charObj.vigor.lastResetDate);
        const isSameDay =
          last.getUTCFullYear() === now.getUTCFullYear() &&
          last.getUTCMonth() === now.getUTCMonth() &&
          last.getUTCDate() === now.getUTCDate();
        if (!isSameDay) {
          this.charObj.vigor.energy = 100;
          this.charObj.vigor.lastResetDate = now;
        }
      }

      if (this.charObj.vigor.energy > 0) {
        // Бонус бодрости: +100% опыта (2x) для коротких/активных сессий
        effectiveExp = Math.round(value * 2);
        this.charObj.vigor.energy = Math.max(0, this.charObj.vigor.energy - 10);
      } else {
        // Усталость / антибот: после исчерпания бодрости и превышения лимита
        const dailyLimit = this.character.lvl * 20000;
        if ((this.charObj.expLimit?.earn ?? 0) > dailyLimit) {
          effectiveExp = Math.max(1, Math.round(value * 0.2)); // 80% штраф от непрерывного фарма
        }
      }

      if (this.charObj.expLimit) {
        this.charObj.expLimit.earn = (this.charObj.expLimit.earn ?? 0) + effectiveExp;
      }
    }

    const oldLvl = this.character.lvl;

    this.charObj.bonus += Math.round(effectiveExp / 100);
    this.charObj.exp += effectiveExp;

    const newLvl = this.character.lvl;
    const lvlDifference = newLvl - oldLvl;
    const freeAdded = Math.round(lvlDifference) * 10;

    if (lvlDifference > 0) {
      this.addFree(freeAdded);
    }

    return {
      leveledUp: lvlDifference > 0,
      oldLvl,
      newLvl,
      freeAdded,
    };
  }

  private addComponents(components: Partial<Record<ItemComponent, number>>) {
    forEach(components, (value, key) => {
      const oldValue = this.charObj.components.get(key) ?? 0;
      this.charObj.components.set(key, oldValue + (value ?? 0));
    });
  }

  private addGold(gold: number) {
    this.charObj.gold += gold;
  }

  private addFree(free: number) {
    this.charObj.free += free;
  }

  async addResources({ components, gold, exp, free, skipVigor }: Partial<Resources>) {
    let levelUpInfo: { leveledUp: boolean; oldLvl: number; newLvl: number; freeAdded: number } | undefined;

    if (components) {
      this.addComponents(components);
    }

    if (gold) {
      this.addGold(gold);
    }

    if (exp) {
      levelUpInfo = this.addExp(exp, skipVigor);
    }

    if (free) {
      this.addFree(free);
    }

    await this.character.saveToDb();

    return levelUpInfo;
  }

  /** @throws {ValidationError} */
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
    forEach(components, (value, key) => {
      if ((this.components.get(key) ?? 0) < (value ?? 0)) {
        throw new ValidationError('Недостаточно компонентов');
      }
    });
  }

  /** @throws {ValidationError} */
  validateResources({ gold, components, bonus, free }: Partial<Resources>) {
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
