import { Info, Placeholder } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { equipItem, sellItem, unEquipItem } from '@/api/inventory';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import type { Inventory } from '@fwo/shared';
import { Button } from '@/components/Button';

export const CharacterInventoryList: FC<{ inventory: Inventory[] }> = ({ inventory }) => {
  const { updateCharacter } = useUpdateCharacter();
  const [_, makeRequest] = useRequest();

  const handleEquip = async (id: string) => {
    makeRequest(async () => {
      await equipItem(id);
      await updateCharacter();
    });
  };

  const handleUnEquip = async (id: string) => {
    makeRequest(async () => {
      await unEquipItem(id);
      await updateCharacter();
    });
  };

  const handleSell = async (id: string) => {
    makeRequest(async () => {
      await sellItem(id);
      await updateCharacter();
    });
  };

  return inventory.length ? (
    <div className="flex flex-col gap-2">
      {inventory.map((inventory) => (
        <ItemModal
          key={inventory.id}
          item={inventory.item}
          trigger={
            <Button>
              <div className="flex justify-between">
                {inventory.item.info.name}
                <Info type="text">{inventory.putOn && 'Надето'}</Info>
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
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
