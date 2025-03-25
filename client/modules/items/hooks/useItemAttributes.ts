import type { Item, MinMax } from '@fwo/shared';
import { get, isNumber } from 'es-toolkit/compat';
import { useMemo } from 'react';

const attributeSections = [
  {
    key: 'base',
    attributes: [
      { name: 'Урон', key: 'hit' },
      { name: 'Здоровье', key: 'base.hp' },
      { name: 'Энергия', key: 'base.en' },
      { name: 'Мана', key: 'base.mp' },
    ],
  },
  {
    key: 'phys',
    attributes: [
      { name: 'Атака', key: 'phys.attack' },
      { name: 'Защита', key: 'phys.defence' },
    ],
  },
  {
    key: 'magic',
    attributes: [
      { name: 'Магическая атака', key: 'magic.attack' },
      { name: 'Магическая защита', key: 'magic.defence' },
    ],
  },
  {
    key: 'heal',
    attributes: [{ name: 'Лечение', key: 'heal' }],
  },
];

const isEmpty = (value: number | MinMax) => {
  return isNumber(value) ? !value : !value.min && !value.max;
};

const normalizeValue = (value: number | MinMax) => {
  return isNumber(value) ? value : `${value.min} - ${value.max}`;
};

const filterSections = (item: Item) => {
  return attributeSections
    .map(({ attributes, ...rest }) => ({
      ...rest,
      attributes: attributes.filter(({ key }) => !isEmpty(get(item, key))),
    }))
    .filter(({ attributes }) => Boolean(attributes.length));
};

export const useItemAttributes = (item: Item) => {
  const filteredSections = useMemo(() => filterSections(item), [item]);

  return {
    filteredSections,
    normalizeValue,
  };
};
