import type { Item, ItemComponent } from '@fwo/shared';
import type { FC } from 'react';

import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { useCharacter } from '@/contexts/character';
import classNames from 'classnames';

export const ItemComponents: FC<{ item: Item }> = ({ item }) => {
  const { getComponents, getComponentImage } = useItemComponents();
  const { character } = useCharacter();

  const hasComponents = (component: ItemComponent) => {
    return (character.components[component] ?? 0) >= (item.craft?.components[component] ?? 0);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {getComponents(item).map((component) => (
        <div key={component} className="flex items-center gap-1">
          <img height={20} width={20} src={getComponentImage(component)} />
          <span className={classNames({ 'text-red-500': !hasComponents(component) })}>
            {item.craft?.components[component]}/{character.components[component] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
};
