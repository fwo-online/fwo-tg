import { CharacterClass } from '@fwo/shared';

export const characterClassList = Object.values(CharacterClass);

export const characterClassNameMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: 'Лучник',
  [CharacterClass.Mage]: 'Маг',
  [CharacterClass.Priest]: 'Жрец',
  [CharacterClass.Warrior]: 'Воин',
};

export const characterClassImageMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: '/character/Archer.png',
  [CharacterClass.Mage]: '/character/Mage.png',
  [CharacterClass.Priest]: '/character/Priest.png',
  [CharacterClass.Warrior]: '/character/Warrior.png',
};
