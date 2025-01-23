import type { FC } from 'react';
import { useParams } from 'react-router';
import { ShopList } from '../components/ShopList';
import { getShopItems } from '@/client/shop';
import { List, Section } from '@telegram-apps/telegram-ui';
import { wearListTranslations } from '@/constants/inventory';

export const ShopListPage: FC = () => {
  const { wear } = useParams();
  return (
    <List>
      <Section>
        <Section.Header>{wearListTranslations[wear]}</Section.Header>
        <ShopList shopPromise={getShopItems({ wear })} />
      </Section>
    </List>
  );
};
