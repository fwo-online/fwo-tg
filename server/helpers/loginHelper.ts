import { findCharacter, removeCharacter } from '@/api/character';
import { CharacterService } from '../arena/CharacterService';

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

/*
  @func удаления
  @return Boolean
   */
export async function remove(tgId?: number) {
  try {
    const resp = await removeCharacter(tgId);
    return resp;
  } catch {
    return false;
  }
}

export async function getChar(tgId: number) {
  try {
    return await CharacterService.getCharacter(tgId.toString());
  } catch (e) {
    if (e.message !== 'Персонаж не найден') {
      console.log(e);
    }
  }
}
