export enum ItemComponent {
  Fabric = 'fabric',
  Leather = 'leather',
  Wood = 'wood',
  Iron = 'iron',
  Steel = 'steel',
  Arcanite = 'arcanite',
}

export const itemComponentName: Record<ItemComponent, string> = {
  [ItemComponent.Fabric]: 'Ткань',
  [ItemComponent.Leather]: 'Кожа',
  [ItemComponent.Wood]: 'Дерево',
  [ItemComponent.Iron]: 'Железо',
  [ItemComponent.Steel]: 'Сталь',
  [ItemComponent.Arcanite]: 'Арканит',
};
