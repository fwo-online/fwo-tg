import type { LeanDocument } from "mongoose";
import { InventoryDocument, InventoryModel } from "@/models/inventory";

const dbErr = (e) => console.log(e);

export type Inventory = LeanDocument<InventoryDocument>

export async function getAllHarks(charId: string) {
  try {
    return await InventoryModel.fullHarks(charId);
  } catch (e) {
    dbErr(e);
  }
}
export async function getItems(charId: string) {
  try {
    const items = await InventoryModel.getItems(charId);
    return items.map((item) => item.toObject());
  } catch (e) {
    dbErr(e);
  }
}
export async function putOffItem(charId: string, itemId: string) {
  const item = await InventoryModel.putOffItem(charId, itemId);
  return item?.toObject();
}
export async function putOnItem(charId: string, itemId: string) {
  const item = await InventoryModel.putOnItem(charId, itemId);
  return item?.toObject();
}
export async function getItem(itemCode: string, charId: string) {
  const item = await InventoryModel.getItem(itemCode, charId);
  return item?.toObject();
}
export async function removeItem(itemId: string, charId: string) {
  return InventoryModel.removeItem(itemId, charId);
}
export async function addItem(charId: string, itemCode: string) {
  const item = await InventoryModel.addItem(charId, itemCode);
  return item.toObject();
}

export function getCollection(inventory: Inventory[]) {
  return InventoryModel.getCollection(inventory);
}
