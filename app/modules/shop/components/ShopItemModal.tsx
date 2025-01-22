import { useCharacter } from '@/hooks/useCharacter';
import type { Item } from '@fwo/schemas';
import { Banner, Button, ButtonCell, List, Modal } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

export const ShopItemModal: FC<{ item: Item; onBuy: (item: Item) => void }> = ({ item, onBuy }) => {
  const { character } = useCharacter();
  const canBuy = character.gold >= item.price;

  return (
    <Modal trigger={<ButtonCell>»</ButtonCell>}>
      <List>
        <Banner header={item.info.name} subheader={item.info.description}>
          <Button stretched disabled={!canBuy} onClick={() => onBuy(item)}>
            Купить за {item.price}💰
          </Button>
          <Button stretched mode="plain">
            У тебя {character.gold}💰
          </Button>
        </Banner>
      </List>
    </Modal>
  );
};
