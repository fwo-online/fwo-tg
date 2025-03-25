import { useItemAttributes } from '@/modules/items/hooks/useItemAttributes';
import type { Item } from '@fwo/shared';
import { get } from 'es-toolkit/compat';
import type { FC } from 'react';

export const ItemAttributes: FC<{ item: Item }> = ({ item }) => {
  const { filteredSections, normalizeValue } = useItemAttributes(item);

  return (
    <>
      {filteredSections.map(({ key, attributes }) => (
        <div key={key}>
          {attributes.map(({ name, key }) => (
            <div key={key} className="flex gap-2">
              <span key={key}>{name}</span>
              <span className="flex-1 border-dotted border-b-2 -translate-y-1.5" />
              <span>{normalizeValue(get(item, key))}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
