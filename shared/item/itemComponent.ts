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

export function componentsToString(components?: Partial<Record<ItemComponent, number>>): string {
  return Object.entries(components ?? {})
    .map(([component, value]) => `${value ?? 0} ${itemComponentName[component]}`)
    .join(', ');
}
