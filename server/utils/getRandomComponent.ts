import MiscService from '@/arena/MiscService';
import { ItemComponent } from '@fwo/shared';

const components = [
  { name: ItemComponent.Fabric, cost: 10 },
  { name: ItemComponent.Leather, cost: 25 },
  { name: ItemComponent.Iron, cost: 50 },
  { name: ItemComponent.Wood, cost: 25 },
  { name: ItemComponent.Steel, cost: 100 },
  // { name: ItemComponent.Arcanite, cost: 500 },
];

const weights = components.map((c) => 1 / c.cost);
const totalWeight = weights.reduce((sum, w) => sum + w, 0);
const probabilities = weights.map((w) => w / totalWeight);

export function getRandomComponent(chance: number) {
  if (MiscService.randInt(0, 100) > chance) {
    return;
  }

  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < components.length; i++) {
    sum += probabilities[i];
    if (random <= sum) {
      return components[i].name;
    }
  }
}
