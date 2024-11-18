import { itemSchema } from "@/schemas/item/itemSchema";
import { itemSetSchema } from "@/schemas/itemSet/itemSetSchema";
import csv from 'csvtojson'

export const generateItems = async () => {
  const rawItems = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      class: (value) => value.split(', '),
    },
  }).fromFile('./items.csv')

  const items = itemSchema.array().parse(rawItems);

  return items;
}

export const generateItemsSets = async () => {
  const rawItemsSets = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      items: (value) => value.split(', '),
    },
  }).fromFile('./items-sets.csv')

  const mergeBonuses = (acc, curr) => {
    const prev = acc.at(-1)
    if (prev?.code === curr.code) {
      prev.bonus ??= [];
      if (curr.bonus) {
        prev.bonus.push(curr.bonus);
      }
      return acc
    }

    curr.bonus = [];
    acc.push(curr);
    return acc;
  }

  const mergedItemsSets = rawItemsSets.reduce(mergeBonuses, [])

  const itemsSets = itemSetSchema.array().parse(mergedItemsSets);

  return itemsSets;
}
