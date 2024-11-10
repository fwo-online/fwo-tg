import { InventoryModel } from "@/models/inventory";

function dbErr(e) {
  throw new Error(`Fail in inventory: ${e}`);
}

export async function getItems(charId: string) {
  try {
    return await InventoryModel.getItems(charId);
  } catch (e) {
    dbErr(e);
  }
}

type HandleItemParams = {
  charId: string;
  itemId: string;
};

export async function putOnItem({ charId, itemId }: HandleItemParams) {
  return InventoryModel.putOnItem(charId, itemId);
}

export async function putOffItem({ charId, itemId }: HandleItemParams) {
  return InventoryModel.putOffItem(charId, itemId);
}

export async function removeItem({ charId, itemId }: HandleItemParams) {
  return InventoryModel.removeItem(itemId, charId);
}

type AddItemParams = {
  charId: string;
  itemCode: string;
};

export async function addItem({ charId, itemCode }: AddItemParams) {
  return InventoryModel.addItem(charId, itemCode);
}
