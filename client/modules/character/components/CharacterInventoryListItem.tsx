import type { FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemModal';
import { Button } from '@/components/Button';
import { useCharacterInventory } from '../hooks/useCharacterInventory';
import type { Item } from '@fwo/shared';

export const CharacterInventoryListItem: FC<{ item: Item }> = ({ item }) => {
  const { equipment, handleEquip, handleUnEquip } = useCharacterInventory();
  const isEquipped = equipment.includes(item.id);

  return (
    <ItemModal
      key={item.id}
      item={item}
      trigger={
        <Button>
          <div className="flex justify-between">
            {item.info.name}
            <div className="opacity-50">{isEquipped && 'Надето'}</div>
          </div>
        </Button>
      }
      footer={
        isEquipped ? (
          <Button onClick={() => handleUnEquip(item.id)}>Снять</Button>
        ) : (
          <Button onClick={() => handleEquip(item.id)}>Надеть</Button>
        )
      }
    />
  );
};
