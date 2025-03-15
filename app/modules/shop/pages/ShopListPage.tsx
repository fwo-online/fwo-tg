import { Suspense, type FC } from 'react';
import { useParams } from 'react-router';
import { ShopList } from '@/modules/shop/components/ShopList';
import { getShopItems } from '@/client/shop';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { wearListTranslations } from '@/constants/inventory';

export const ShopListPage: FC = () => {
  const { wear } = useParams();

  return (
    <List>
      <Section>
        <Section.Header>{wearListTranslations[wear]}</Section.Header>
        <Suspense fallback={<Placeholder description="Ищем предметы..." />}>
          <ShopList shopPromise={getShopItems({ wear })} />
        </Suspense>
      </Section>
    </List>
  );
};
