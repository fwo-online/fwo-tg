import { type Item, ItemWear } from '@fwo/shared';

const getWeaponType = (item: Item) => {
  switch (item.type) {
    case 'cut':
      return 'режущее';
    case 'thrust':
      return 'колющее';
    case 'chop':
      return 'рубящее';
    case 'range':
      return 'дальнобойное';
    case 'stun':
      return 'оглушающее';
    default:
      return item.type ?? '';
  }
};

const getItemType = (item: Item) => {
  switch (item.wear) {
    case ItemWear.MainHand:
      return 'одноручное';
    case ItemWear.TwoHands:
      return 'двуручное';
    case ItemWear.OffHand:
      return 'дополнительное';
    default:
      return '';
  }
};

export const useItemType = (item: Item) => {
  return [getItemType(item), getWeaponType(item)].filter(Boolean);
};
