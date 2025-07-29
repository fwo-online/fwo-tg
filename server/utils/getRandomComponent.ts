import { ItemComponent } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import { getRandomItemByWeight } from '@/utils/getRandomItemByWeight';

const components = [
  { name: ItemComponent.Fabric, cost: 10 },
  { name: ItemComponent.Leather, cost: 25 },
  { name: ItemComponent.Iron, cost: 50 },
  { name: ItemComponent.Wood, cost: 25 },
  { name: ItemComponent.Steel, cost: 100 },
  // { name: ItemComponent.Arcanite, cost: 500 },
];

export function getRandomComponent(chance: number) {
  if (MiscService.randInt(0, 100) > chance) {
    return;
  }

  return getRandomItemByWeight(components, ({ cost }) => 1 / cost);
}
