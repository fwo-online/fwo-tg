import { Suspense, type FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { ShopList } from '@/modules/shop/components/ShopList';
import { getShopItems } from '@/api/shop';
import { wearListTranslations } from '@/constants/inventory';
import { validateWear } from '@/utils/inventory';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';

export const ShopListPage: FC = () => {
  const { wear } = useParams();

  if (!validateWear(wear)) {
    return <Navigate to="/error" />;
  }

  return (
    <Card header={wearListTranslations[wear]} className="m-4!">
      <Suspense fallback={<Placeholder description="Ищем предметы..." />}>
        <ShopList shopPromise={getShopItems({ wear })} />
      </Suspense>
    </Card>
  );
};
