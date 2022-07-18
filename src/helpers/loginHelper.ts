import {
  findCharacter, createCharacter, removeCharacter,
} from '@/api/character';
import type { Profs } from '@/data';
import CharacterService from '../arena/CharacterService';
import { profsData } from '../data/profs';

/*
  @func проверка ника
  @return Boolean Наличие живого ника в базе
 */
export async function checkNick(nickname: string) {
  try {
    await findCharacter({ nickname });
    return true;
  } catch {
    return false;
  }
}

type RegCharParams = {
  tgId: number;
  prof: Profs.Prof;
  nickname: string;
  sex: 'm' | 'f';
}

export async function regChar({
  tgId, prof, nickname, sex,
}: RegCharParams) {
  if (!profsData[prof]) {
    throw new Error('prof error');
  }
  return createCharacter({
    prof,
    sex,
    tgId,
    nickname,
    harks: profsData[prof].hark,
    magics: profsData[prof].mag,
  });
}
/*
  @func удаления
  @return Boolean
   */
export async function remove(tgId: number) {
  const resp = await removeCharacter(tgId);
  return !!resp;
}

export async function getChar(tgId: number) {
  try {
    return await CharacterService.getCharacter(tgId);
  } catch (e) {
    if (e.message !== 'Персонаж не найден') {
      console.log(e);
    }
  }
}
