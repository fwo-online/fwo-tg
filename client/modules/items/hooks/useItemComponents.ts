import { type Item, ItemComponent } from '@fwo/shared';

const components = [
  ItemComponent.Fabric,
  ItemComponent.Leather,
  ItemComponent.Wood,
  ItemComponent.Iron,
  ItemComponent.Steel,
  ItemComponent.Arcanite,
];

const componentsMap = {
  [ItemComponent.Fabric]: '/components/fabric.png',
  [ItemComponent.Leather]: '/components/leather.png',
  [ItemComponent.Wood]: '/components/wood.png',
  [ItemComponent.Iron]: '/components/iron.png',
  [ItemComponent.Steel]: '/components/steel.png',
  [ItemComponent.Arcanite]: '/components/arcanite.png',
};

export const useItemComponents = () => {
  const getComponentImage = (component: ItemComponent) => {
    return componentsMap[component];
  };

  const getComponents = (item: Item) => {
    return components.filter((component) => Boolean(item.craft?.components[component]));
  };

  return {
    components,
    getComponents,
    getComponentImage,
  };
};
