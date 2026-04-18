import { CharacterClass, type Character } from "@fwo/shared";

export const isArcher = (character: Character) =>  character.class === CharacterClass.Archer;
export const isMage = (character: Character) =>    character.class === CharacterClass.Mage;
export const isPriest = (character: Character) => character.class === CharacterClass.Priest;
export const isWarrior = (character: Character) =>  character.class === CharacterClass.Warrior;