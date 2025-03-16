import type { Item } from '@fwo/shared';
import { Button, ButtonCell, Navigation, Placeholder } from '@telegram-apps/telegram-ui';
import { use, type FC } from 'react';
import { buyItem } from '@/api/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import { popup } from '@telegram-apps/sdk-react';

export const ShopList: FC<{ shopPromise: Promise<Item[]> }> = ({ shopPromise }) => {
  const items = use(shopPromise);
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const [_, makeRequest] = useRequest();

  const canBuy = (item: Item) => character.gold >= item.price;

  const handleBuy = async (item: Item) => {
    makeRequest(async () => {
      await buyItem(item.code);
      popup.open({ message: `Ты купил ${item.info.name}` });
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
