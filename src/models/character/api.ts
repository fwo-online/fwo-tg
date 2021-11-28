import type { FilterQuery, LeanDocument, UpdateQuery } from "mongoose";
import { CharDocument, CharModel } from "@/models/character";
import type { ClanDocument } from "@/models/clan";
import { InventoryDocument, InventoryModel } from "@/models/inventory";
import { dbErr } from "@/models/utils";

type PopulatePaths = {
  inventory?: InventoryDocument[];
  clan?: ClanDocument
}

const populatePaths = ['inventory', 'clan'];

export type Character = LeanDocument<Omit<CharDocument, keyof PopulatePaths> & PopulatePaths>

// const x: Character
// x.clan
/**
 * Загрузка чара из базы
 * @param query
 */
export async function loadCharacter(query: FilterQuery<CharDocument>) {
  try {
    const x = await CharModel
      .findOne({ ...query, deleted: false })
      .populate<PopulatePaths>(populatePaths)
    return x?.toObject();
  } catch (e) {
    dbErr(e);
  }
}

export async function removeCharacter(tgId: number) {
  try {
    return await CharModel
      .findOneAndUpdate({ tgId, deleted: false }, { deleted: true })
      .populate<PopulatePaths>(populatePaths);
  } catch (e) {
    dbErr(e);
  }
}

/**
 * Создание персонажа
 * @param charObj
 */
export async function createCharacter(charObj): Promise<Character | undefined> {
  try {
    const char = await CharModel.create(charObj);
    const item = await InventoryModel.firstCreate(char);
    return await char
      .update({tgId: charObj.tgId}, { inventory: [item] })
      .populate<PopulatePaths>(populatePaths);
  } catch (e) {
    dbErr(e);
  }
}

/*
@param Nick string имя персонажа
 */
export async function findCharacterByNick(nickname: string) {
  try {
    return await CharModel
      .findOne({ nickname, deleted: false })
      .populate<PopulatePaths>(populatePaths);
  } catch (e) {
    dbErr(e);
  }
}

export async function updateCharacter(tgId: number, params: UpdateQuery<CharDocument>) {
  try {
    return await CharModel
      .findOneAndUpdate({ tgId, deleted: false }, params)
      .populate<PopulatePaths>(populatePaths);
  } catch (e) {
    dbErr(e);
  }
}
