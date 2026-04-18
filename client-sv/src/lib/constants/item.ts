import { ItemWear } from '@fwo/shared';

export const wearList = [
  ItemWear.Neck,
  ItemWear.Head,
  ItemWear.Ring,
  ItemWear.OffHand,
  ItemWear.Body,
  ItemWear.MainHand,
  ItemWear.Arms,
  ItemWear.Legs,
  ItemWear.Boots,
  ItemWear.TwoHands,
];

export const wearListTranslations: Partial<Record<ItemWear, string>> = {
  [ItemWear.Neck]: 'Шея',
  [ItemWear.Head]: 'Голова',
  [ItemWear.Ring]: 'Кольцо',
  [ItemWear.MainHand]: 'Правая рука',
  [ItemWear.Arms]: 'Руки',
  [ItemWear.OffHand]: 'Левая рука',
  [ItemWear.Body]: 'Тело',
  [ItemWear.Legs]: 'Ноги',
  [ItemWear.Boots]: 'Обувь',
  [ItemWear.TwoHands]: 'Обе руки',
};
