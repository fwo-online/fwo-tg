import { type Item, ItemComponent } from '@fwo/shared';

export const components = [
  ItemComponent.Fabric,
  ItemComponent.Leather,
  ItemComponent.Wood,
  ItemComponent.Iron,
  ItemComponent.Steel,
  ItemComponent.Arcanite,
];

export const componentsImageMap = {
  [ItemComponent.Fabric]: '/components/fabric.png',
  [ItemComponent.Leather]: '/components/leather.png',
  [ItemComponent.Wood]: '/components/wood.png',
  [ItemComponent.Iron]: '/components/iron.png',
  [ItemComponent.Steel]: '/components/steel.png',
  [ItemComponent.Arcanite]: '/components/arcanite.png',
};

export const getItemComponents = (item: Item) => {
  return components.filter((component) => Boolean(item.craft?.components[component]));
};
