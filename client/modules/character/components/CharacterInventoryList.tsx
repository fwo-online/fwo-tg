import { Button, ButtonCell, Info, Navigation, Placeholder } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { equipItem, sellItem, unEquipItem } from '@/api/inventory';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import type { Inventory } from '@fwo/schemas';

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
    <>
      {inventory.map((inventory) => (
        <ItemModal
          key={inventory.id}
          item={inventory.item}
          trigger={
            <ButtonCell
              style={{ justifyContent: 'space-between' }}
              after={<Info type="text">{inventory.putOn && 'Надето'}</Info>}
            >
              <Navigation>{inventory.item.info.name}</Navigation>
            </ButtonCell>
          }
          footer={
            inventory.putOn ? (
              <Button stretched onClick={() => handleUnEquip(inventory.id)}>
                Снять
              </Button>
            ) : (
              <>
                <Button stretched onClick={() => handleEquip(inventory.id)}>
                  Надеть
                </Button>
                <Button stretched mode="bezeled" onClick={() => handleSell(inventory.id)}>
                  Продать {inventory.item.price / 2}💰
                </Button>
              </>
            )
          }
        />
      ))}
    </>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
