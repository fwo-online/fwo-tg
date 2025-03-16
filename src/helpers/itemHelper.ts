import { itemSchema } from '@fwo/shared';
import { itemSetSchema } from '@fwo/shared';
import assert from 'node:assert';
import csv from 'csvtojson';
import { parse, array } from 'valibot';

export const generateItems = async () => {
  assert(process.env.SHOP_SPREADSHEET_URL, 'SHOP_SPREADSHEET_URL is not defined');
  const csvItems = await fetch(process.env.SHOP_SPREADSHEET_URL).then((res) => res.text());

  const rawItems = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      class: (value) => value.split(', '),
    },
  }).fromString(csvItems);

  return parse(array(itemSchema), rawItems);
};

export const generateItemsSets = async () => {
  assert(process.env.SETS_SPREADSHEET_URL, 'SETS_SPREADSHEET_URL is not defined');
  const csvItemsSets = await fetch(process.env.SETS_SPREADSHEET_URL).then((res) => res.text());

  const rawItemsSets = await csv({
    checkType: true,
    ignoreEmpty: true,
    colParser: {
      items: (value) => value.split(', '),
    },
  }).fromString(csvItemsSets);

  const mergeModifiers = (acc: any, curr: any) => {
    const prev = acc.at(-1);
    if (prev?.code === curr.code) {
      prev.modifiers ??= [];
      if (curr.modifiers) {
        prev.modifiers.push(curr.modifiers);
      }
      return acc;
    }

    curr.modifiers = [];
    acc.push(curr);
    return acc;
  };

  const mergedItemsSets = rawItemsSets.reduce(mergeModifiers, []);

  const itemsSets = parse(array(itemSetSchema), mergedItemsSets);

  return itemsSets;
};
