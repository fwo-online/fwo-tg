import { useParams } from 'react-router';
import { Button, ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { equipItem, sellItem, unEquipItem } from '@/client/inventory';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export const CharacterInventoryList: FC = () => {
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const { wear } = useParams();
  const { makeRequest } = useRequest();

  const inventory = character.inventory.filter((item) => item.wear === wear);

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

  return (
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
  );
};
