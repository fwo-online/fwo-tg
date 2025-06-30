import { ItemWear } from '@fwo/shared';

export const wearList = [
  ItemWear.Head,
  ItemWear.Neck,
  ItemWear.Body,
  ItemWear.Arms,
  ItemWear.Legs,
  ItemWear.Boots,
  ItemWear.Ring,
  ItemWear.MainHand,
  ItemWear.OffHand,
  ItemWear.TwoHands,
];

export const wearListTranslations: Partial<Record<ItemWear, string>> = {
  [ItemWear.Head]: 'Голова',
  [ItemWear.Neck]: 'Шея',
  [ItemWear.Body]: 'Тело',
  [ItemWear.Arms]: 'Руки',
  [ItemWear.Legs]: 'Ноги',
  [ItemWear.Boots]: 'Обувь',
  [ItemWear.Ring]: 'Кольцо',
  [ItemWear.MainHand]: 'Правая рука',
  [ItemWear.OffHand]: 'Левая рука',
  [ItemWear.TwoHands]: 'Обе руки',
};
