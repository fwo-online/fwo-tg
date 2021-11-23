import type { FilterQuery, LeanDocument, UpdateQuery } from "mongoose";
import type { CharDocument } from "@/models/character";
import { ClanDocument, ClanModel } from "@/models/clan";

const dbErr = (e) => console.log(e);

type PopulatePaths = {
  owner: CharDocument;
  requests: CharDocument[];
  players: CharDocument[];
}

const populatePaths = ['owner', 'requests', 'players'];

export type Clan = LeanDocument<ClanDocument & PopulatePaths>

/**
 * Создаёт новый клан
 * @param owner - id создателя клана
 * @param name - название клана
 */
export async function createClan(owner: string, name: string) {
  try {
    const newClan = new ClanModel({
      owner,
      name,
      players: [owner],
    });
    await newClan.save();
    const clan = await newClan.populate<PopulatePaths>(populatePaths)

    return clan.toObject();
  } catch (e) {
    dbErr(e);
  }
}
/**
 * Возвращает клан по query
 * @param query
 */
export async function findClan(query: FilterQuery<ClanDocument>) {
  try {
    const clan = await ClanModel
      .findOne(query)
      .populate<PopulatePaths>(populatePaths)
    return clan?.toObject();
  } catch (e) {
    dbErr(e);
  }
}

/**
 * Возвращает список всех кланов
 */
export async function clanList() {
  try {
    const clans = await ClanModel.find();
    return clans.map((clan) => clan.toObject());
  } catch (e) {
    dbErr(e);
  }
}

/**
 * Ищет название клана в базе без учёта регистра
 * @param name - название клана
 */
export async function checkClanName(name) {
  try {
    return await ClanModel.exists({ name: { $regex: name, $options: 'i' } });
  } catch (e) {
    dbErr(e);
  }
}

/**
 * @param clanId - id клана
 * @param params - параметры, которые требуется обновить
 */
export async function updateClan(clanId: string, params: UpdateQuery<ClanDocument>) {
  try {
    const clan = await ClanModel
      .findByIdAndUpdate(clanId, params, { new: true })
      .populate<PopulatePaths>(populatePaths);
    return clan?.toObject()
  } catch (e) {
    dbErr(e);
  }
}

/**
 * @param clanId - id клана
 */
export async function removeClan(clanId: string) {
  try {
    return await ClanModel.deleteOne({ _id: clanId });
  } catch (e) {
    dbErr(e);
  }
}
