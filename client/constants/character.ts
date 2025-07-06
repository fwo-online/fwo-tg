import { CharacterClass } from '@fwo/shared';

export const characterClassList = Object.values(CharacterClass);

export const characterClassNameMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: 'Лучник',
  [CharacterClass.Mage]: 'Маг',
  [CharacterClass.Priest]: 'Жрец',
  [CharacterClass.Warrior]: 'Воин',
};

export const characterDescriptionMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: 'Ловкий стрелок, поражает сразу несколько врагов с большого расстояния.',
  [CharacterClass.Mage]: 'Владеет разрушительной магией, наносит мощный урон по области.',
  [CharacterClass.Priest]: 'Целитель и поддержка, усиливает союзников и восстанавливает здоровье.',
  [CharacterClass.Warrior]:
    'Выносливый боец ближнего боя, принимает удары на себя и защищает команду.',
};

export const characterClassImageMap: Record<CharacterClass, string> = {
  [CharacterClass.Archer]: '/character/Archer.png',
  [CharacterClass.Mage]: '/character/Mage.png',
  [CharacterClass.Priest]: '/character/Priest.png',
  [CharacterClass.Warrior]: '/character/Warrior.png',
};
