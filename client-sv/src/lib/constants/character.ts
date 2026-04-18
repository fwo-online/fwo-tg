import { CharacterClass } from '@fwo/shared';

export const characterClassNameMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: 'Лучник',
  [CharacterClass.Mage]: 'Маг',
  [CharacterClass.Priest]: 'Жрец',
  [CharacterClass.Warrior]: 'Воин',
};
