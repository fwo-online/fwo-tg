import { Suspense, type FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { ShopList } from '@/modules/shop/components/ShopList';
import { getShopItems } from '@/client/shop';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { wearListTranslations } from '@/constants/inventory';
import { validateWear } from '@/utils/inventory';

export const ShopListPage: FC = () => {
  const { wear } = useParams();

  if (!validateWear(wear)) {
    return <Navigate to="/error" />;
  }

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
