import * as v from 'valibot';

export enum CharacterClass {
  Warrior = 'w',
  Mage = 'm',
  Archer = 'l',
  Priest = 'p',
}

export const characterClassSchema = v.enum(CharacterClass);
