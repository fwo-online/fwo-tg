import { type Item, ItemComponent } from '@fwo/shared';
import Arcanite from '$lib/assets/components/arcanite.png';
import Fabric from '$lib/assets/components/fabric.png';
import Iron from '$lib/assets/components/iron.png';
import Leather from '$lib/assets/components/leather.png';
import Steel from '$lib/assets/components/steel.png';
import Wood from '$lib/assets/components/wood.png';

export const components = [
  ItemComponent.Fabric,
  ItemComponent.Leather,
  ItemComponent.Wood,
  ItemComponent.Iron,
  ItemComponent.Steel,
  ItemComponent.Arcanite,
];

export const componentsImageMap = {
  [ItemComponent.Fabric]: Fabric,
  [ItemComponent.Leather]: Leather,
  [ItemComponent.Wood]: Wood,
  [ItemComponent.Iron]: Iron,
  [ItemComponent.Steel]: Steel,
  [ItemComponent.Arcanite]: Arcanite,
};

export const getItemComponents = (item: Item) => {
  return components.filter((component) => Boolean(item.craft?.components[component]));
};
