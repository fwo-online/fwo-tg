import type { Item, ItemComponent } from '@fwo/shared';
import type { FC } from 'react';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import classNames from 'classnames';
import { useCharacter } from '@/modules/character/store/character';

export const ItemComponents: FC<{ item: Item }> = ({ item }) => {
  const { getComponents, getComponentImage } = useItemComponents();
  const components = useCharacter((character) => character.components);

  const hasComponents = (component: ItemComponent) => {
    return (components[component] ?? 0) >= (item.craft?.components[component] ?? 0);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {getComponents(item).map((component) => (
        <div key={component} className="flex items-center gap-1">
          <img height={20} width={20} src={getComponentImage(component)} />
          <span className={classNames({ 'text-red-500': !hasComponents(component) })}>
            {item.craft?.components[component]}/{components[component] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
};
