import type { FC } from 'react';

import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { useCharacter } from '@/contexts/character';

export const CharacterInventoryComponents: FC = () => {
  const { components, getComponentImage } = useItemComponents();
  const { character } = useCharacter();

  return (
    <div className="flex gap-4 flex-wrap">
      {components.map((component) => (
        <div key={component} className="flex items-center gap-1">
          <img height={20} width={20} src={getComponentImage(component)} />
          <span>{character.components[component] ?? 0}</span>
        </div>
      ))}
    </div>
  );
};
