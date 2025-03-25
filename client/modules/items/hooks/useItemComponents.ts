import { ItemComponent } from '@fwo/shared';

const components = [
  ItemComponent.Fabric,
  ItemComponent.Leather,
  ItemComponent.Wood,
  ItemComponent.Iron,
  ItemComponent.Steel,
  ItemComponent.Arcanite,
];

const componentsMap = {
  [ItemComponent.Fabric]: '/components/Fabric.png',
  [ItemComponent.Leather]: '/components/Leather.png',
  [ItemComponent.Wood]: '/components/Wood.png',
  [ItemComponent.Iron]: '/components/Iron.png',
  [ItemComponent.Steel]: '/components/Steel.png',
  [ItemComponent.Arcanite]: '/components/Arcanit.png',
};

export const useItemComponents = () => {
  const getComponentImage = (component: ItemComponent) => {
    return componentsMap[component];
  };

  return {
    components,
    getComponentImage,
  };
};
