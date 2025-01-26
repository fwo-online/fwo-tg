import type { Item } from '@fwo/schemas';
import { Button, ButtonCell, Navigation, Placeholder } from '@telegram-apps/telegram-ui';
import { use, useState, type FC } from 'react';
import { buyItem } from '@/client/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { useCharacter } from '@/hooks/useCharacter';
import { useRequest } from '@/hooks/useRequest';

export const ShopList: FC<{ shopPromise: Promise<Item[]> }> = ({ shopPromise }) => {
  const [items] = useState(use(shopPromise));
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const { makeRequest } = useRequest();

  const canBuy = (item: Item) => character.gold >= item.price;

  const handleBuy = async (item: Item) => {
    makeRequest(async () => {
      await buyItem(item.code);
      await updateCharacter();
    });
  };

  return items.length ? (
    <>
      {items.map((item) => (
        <ItemModal
          key={item.code}
          item={item}
          trigger={
            <ButtonCell>
              <Navigation>{item.info.name}</Navigation>
            </ButtonCell>
          }
          footer={
            <>
              <Button stretched disabled={!canBuy(item)} onClick={() => handleBuy(item)}>
                Купить за {item.price}💰
              </Button>
              <Button stretched mode="plain">
                У тебя {character.gold}💰
              </Button>
            </>
          }
        />
      ))}
    </>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
