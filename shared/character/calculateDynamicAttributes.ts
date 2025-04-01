import {
  type Character,
  type CharacterAttributes,
  CharacterClass,
  type CharacterDynamicAttributes,
} from '@fwo/shared';

const floatNumber = (str: string | number): number => +Number.parseFloat(str.toString()).toFixed(2);

const calculateBaseAttributes = (
  { wis, int, con, dex, str }: CharacterAttributes,
  characterClass: CharacterClass,
) => {
  const hp = floatNumber(6 + con / 3);
  const mp = floatNumber(wis * 1.5);
  const en =
    characterClass === CharacterClass.Archer
      ? floatNumber(dex + int * 0.5 + con * 0.25)
      : floatNumber(dex + str * 0.5 + con * 0.25);

  return { hp, mp, en };
};

const calculatePhysAttributes = (
  { dex, int, str, con }: CharacterAttributes,
  characterClass: CharacterClass,
) => {
  const attack =
    characterClass === CharacterClass.Archer
      ? floatNumber(dex + int * 0.5)
      : floatNumber(dex + str * 0.4);
  const defence = floatNumber(con * 0.6 + dex * 0.4);

  return { attack, defence };
};

const calculateMagicAttributes = ({ wis, int }: CharacterAttributes) => {
  const attack = floatNumber(wis * 0.6 + int * 0.4);
  const defence = floatNumber(wis * 0.6 + int * 0.4);

  return { attack, defence };
};

const calculateHit = ({ str, int }: CharacterAttributes, characterClass: CharacterClass) => {
  const hit =
    characterClass === CharacterClass.Archer
      ? floatNumber((int - 2) / 10)
      : floatNumber((str - 3) / 10);

  return { min: hit, max: hit };
};

const calculateHeal = ({ int }: CharacterAttributes) => {
  const min = floatNumber(int / 10);
  const max = floatNumber(int / 5);

  return { min, max };
};

const calculateRegenAttributes = ({ wis, int, dex, con }: CharacterAttributes) => {
  const mp = floatNumber(wis * 0.4 + int * 0.6);
  const en = floatNumber(con * 0.4 + dex * 0.6);

  return { mp, en, hp: 0 };
};

export const calculateDynamicAttributes = ({
  attributes,
  ...charObj
}: Pick<Character, 'class' | 'lvl' | 'attributes'>): CharacterDynamicAttributes => {
  const maxTarget = charObj.class === 'l' ? Math.round(charObj.lvl + 3 / 2) : 1;
  const spellLength =
    charObj.class === 'm' || charObj.class === 'p' ? Math.round((attributes.int - 4) / 3) : 0;

  return {
    phys: calculatePhysAttributes(attributes, charObj.class),
    magic: calculateMagicAttributes(attributes),
    base: calculateBaseAttributes(attributes, charObj.class),
    regen: calculateRegenAttributes(attributes),
    attributes,
    heal: calculateHeal(attributes),
    hit: calculateHit(attributes, charObj.class),
    maxTarget,
    spellLength,
    resists: { acid: 0, fire: 0, frost: 0, lightning: 0 },
  };
};
