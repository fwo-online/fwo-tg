// import { floatNumber } from "../utils/float-number";
// import { CharacterEntity } from "./character-entity.schema";
// import { CharacterClass } from "./character-class.schema";

// function calcHit(character: CharacterEntity) {
//   const { int, str} = character.attributes
//   const dmgFromAttributes = character.class === CharacterClass.Archer ? (int - 2) / 10 : (str - 3) / 10;

//   return {
//     min: floatNumber(dmgFromAttributes),
//     max: floatNumber(dmgFromAttributes),
//   };
// }

// export function getCharacterDynamicAttributes(character: CharacterEntity) {
//   const { dex, int, str, wis, con } = character.attributes

//   const patk = character.class === CharacterClass.Archer
//     ? floatNumber(dex + int * 0.5)
//     : floatNumber(dex + str * 0.4);
//   const pdef = floatNumber(con * 0.6 + dex * 0.4);
//   const maxHp = floatNumber(6 + con / 3);
//   const maxMp = floatNumber(wis * 1.5);
//   const maxEn = character.class === CharacterClass.Archer
//     ? dex + int * 0.5 + con * 0.25
//     : dex + str * 0.5 + con * 0.25;

//   const mga = floatNumber(wis * 0.6 + int * 0.4);
//   const mgp = floatNumber(wis * 0.6 + int * 0.4);
//   const hl = {
//     min: floatNumber(int / 10),
//     max: floatNumber(int / 5),
//   };

//   const reg_mp = floatNumber(wis * 0.4 + int * 0.6);

//   const reg_en = floatNumber(con * 0.4 + dex * 0.6);

//   const hit = calcHit(character);
//   const maxTarget = character.class === CharacterClass.Archer ? Math.round(character.lvl + 3 / 2) : 1;
//   const lspell = character.class === CharacterClass.Mage || character.class === CharacterClass.Priest
//     ? Math.round((int - 4) / 3)
//     : 0;
//   return {
//     patk,
//     pdef,
//     maxHp,
//     maxMp,
//     maxEn,
//     mga,
//     mgp,
//     hl,
//     reg_mp,
//     reg_en,
//     hit,
//     maxTarget,
//     lspell,
//   };
// }
