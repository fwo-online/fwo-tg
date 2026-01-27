import { ItemComponent } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import { pickByWeight, type Weighted } from '@/utils/pickByWeight';

const components: Weighted<ItemComponent>[] = [
  { value: ItemComponent.Fabric, weight: 10 },
  { value: ItemComponent.Leather, weight: 25 },
  { value: ItemComponent.Iron, weight: 50 },
  { value: ItemComponent.Wood, weight: 25 },
  { value: ItemComponent.Steel, weight: 100 },
  // { value: ItemComponent.Arcanite, weight: 500 },
];

export function getRandomComponent(chance: number) {
  if (MiscService.randInt(0, 100) > chance) {
    return;
  }

  return pickByWeight(components, { inverse: true });
}
