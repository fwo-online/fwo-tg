import { itemSchema } from "@/schemas/item/itemSchema";
import { writeFile } from "node:fs/promises";
import csv from 'csvtojson'

export const generateItems = async () => {
  const rawItems = await csv().fromFile('items.csv')

  const items = itemSchema.array().parse(rawItems);

  await writeFile('./src/items.json', JSON.stringify(items, null, 2))
}
