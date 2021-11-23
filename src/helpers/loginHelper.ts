import type { UpdateQuery } from 'mongoose';
import CharacterService from '@/arena/CharacterService';
import type { Profs } from '@/data';
import { profsData } from '@/data/profs';
import type { CharDocument } from '@/models/character';
import { findCharacterByNick, createCharacter, updateCharacter, removeCharacter } from '@/models/character/api';

/*
@func проверка ника
@return Boolean Наличие живого ника в базе
*/
export async function checkNick(nickname: string) {
  const re = await findCharacterByNick(nickname);
  return !!re;
}

export async function regChar(tgId: number, prof: Profs.Prof, nickname: string, sex: string) {
  if (!profsData[prof]) throw new Error('prof error');
  return createCharacter({
    prof,
    sex,
    tgId,
    nickname,
    harks: profsData[prof].hark,
    magics: profsData[prof].mag,
  });
}

export async function remove(tgId?: number) {
  if (!tgId) {
    return false;
  }
  const resp = await removeCharacter(tgId);
  return !!resp;
}

export async function getChar(tgId: number) {
  try {
    return await CharacterService.getCharacter(tgId);
  } catch (e) {
    console.log(e);
  }
}

export async function saveHarks(tgId: number, params: UpdateQuery<CharDocument>) {
  try {
    const resp = await updateCharacter(tgId, params);
    return !!resp;
  } catch (e) {
    console.log(e);
  }
}
