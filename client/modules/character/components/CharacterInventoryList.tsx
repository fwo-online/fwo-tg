import type { FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemsModal';

import type { Inventory } from '@fwo/shared';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { useCharacterInventory } from '../hooks/useCharacterInventory';
import { wearList, wearListTranslations } from '@/constants/inventory';

export const CharacterInventoryList: FC<{ inventory: Inventory[] }> = ({ inventory }) => {
  const { inventoryByWear, handleEquip, handleSell, handleUnEquip } = useCharacterInventory();

  return inventory.length ? (
    <div className="flex flex-col gap-2">
      {wearList.map(
        (wear) =>
          inventoryByWear[wear] && (
            <>
              <h6 key={wear}>{wearListTranslations[wear]}</h6>
              {inventoryByWear[wear]?.map((inventory) => (
                <ItemModal
                  key={inventory.id}
                  item={inventory.item}
                  trigger={
                    <Button>
                      <div className="flex justify-between">
                        {inventory.item.info.name}
                        <div className="opacity-50">{inventory.putOn && 'Надето'}</div>
                      </div>
                    </Button>
                  }
                  footer={
                    inventory.putOn ? (
                      <Button onClick={() => handleUnEquip(inventory.id)}>Снять</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => handleEquip(inventory.id)}>
                          Надеть
                        </Button>
                        <Button className="flex-1" onClick={() => handleSell(inventory.id)}>
                          Продать {inventory.item.price / 2}💰
                        </Button>
                      </div>
                    )
                  }
                />
              ))}
            </>
          ),
      )}
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
