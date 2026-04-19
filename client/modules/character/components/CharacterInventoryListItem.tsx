import type { ItemWithID } from '@fwo/shared';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { ItemModal } from '@/modules/items/components/ItemModal';
import { useCharacterInventory } from '../hooks/useCharacterInventory';

export const CharacterInventoryListItem: FC<{ item: ItemWithID }> = ({ item }) => {
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
