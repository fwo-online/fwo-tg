import { wearList, wearListTranslations } from '@/constants/inventory';
import { ButtonCell, Navigation } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

export const ShopWearList: FC = () => {
  const navigate = useNavigate();
  const onClick = (wear: string) => {
    navigate(`/shop/${wear}`);
  };
  return (
    <>
      {wearList.map((wear) => (
        <ButtonCell key={wear} onClick={() => onClick(wear)}>
          <Navigation>{wearListTranslations[wear]}</Navigation>
        </ButtonCell>
      ))}
    </>
  );
};
