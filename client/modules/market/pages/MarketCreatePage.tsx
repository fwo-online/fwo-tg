import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Placeholder } from '@/components/Placeholder';
import { MarketCreateList } from '@/modules/market/components/MarketCreateList';
import { Suspense, type FC } from 'react';

export const MarketCreatePage: FC = () => {
  return (
    <Card header="Продажа предмета" className="m-4">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки товаров" />}>
        <Suspense fallback={<Placeholder description="Ищем товары..." />}>
          <MarketCreateList />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
};
