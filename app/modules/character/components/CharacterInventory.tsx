import { wearList, wearListTranslations } from '@/constants/inventory';
import type { Inventory } from '@fwo/schemas';
import { useNavigate } from 'react-router';
import { ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

export const CharacterInventory: FC<{ inventory: Inventory[] }> = ({ inventory }) => {
  const navigate = useNavigate();
  const onClick = (wear: string) => {
    navigate(`/shop/${wear}`);
  };
  const getEquippedItem = (wear: string) => {
    return inventory.find((item) => item.wear === wear)?.code;
  };
  return (
    <>
      {wearList.map((wear) => (
        <ButtonCell
          key={wear}
          onClick={() => onClick(wear)}
          style={{ justifyContent: 'space-between' }}
          after={<Info type="text">{getEquippedItem(wear)}</Info>}
        >
          <Navigation>{wearListTranslations[wear]}</Navigation>
        </ButtonCell>
      ))}
    </>
  );
};
