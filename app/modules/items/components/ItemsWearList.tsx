import { wearList, wearListTranslations } from '@/constants/inventory';
import { ButtonCell, Navigation } from '@telegram-apps/telegram-ui';
import type { FC, ReactNode } from 'react';

export const ItemsWearList: FC<{
  after?: (wear: string) => ReactNode;
  onClick: (wear: string) => void;
}> = ({ after, onClick }) => {
  return (
    <>
      {wearList.map((wear) => (
        <ButtonCell
          key={wear}
          after={after?.(wear)}
          style={{ justifyContent: 'space-between' }}
          onClick={() => onClick(wear)}
        >
          <Navigation style={{ background: 'red' }}>{wearListTranslations[wear]}</Navigation>
        </ButtonCell>
      ))}
    </>
  );
};
