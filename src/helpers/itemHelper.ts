import { itemSchema } from "@/schemas/item/itemSchema";
import csv from 'csvtojson'

export const generateItems = async () => {
  const rawItems = await csv({
    checkType: true,
    ignoreEmpty: true
  }).fromFile('items.csv')

  return itemSchema.array().parse(rawItems);
}
