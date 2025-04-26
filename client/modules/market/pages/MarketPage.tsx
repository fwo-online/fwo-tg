import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Placeholder } from '@/components/Placeholder';
import { MarketList } from '@/modules/market/components/MarketList';
import { useMarketItems } from '@/modules/market/hooks/useMarketItems';
import { Suspense, type FC } from 'react';
import { useNavigate } from 'react-router';

const MarketListLoader = () => {
  const { marketItems } = useMarketItems();

  return <MarketList items={marketItems} />;
};

export const MarketPage: FC = () => {
  const navigate = useNavigate();

  const goToCreateMarketItem = () => {
    navigate('/agora/market/create');
  };

  return (
    <Card header="Барахолка" className="m-4">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки товаров" />}>
        <Suspense fallback={<Placeholder description="Ищем товары..." />}>
          <MarketListLoader />
        </Suspense>
      </ErrorBoundary>

      <div className="flex flex-col sticky mt-8 bottom-4 left-2 right-2">
        <Button onClick={goToCreateMarketItem}>Продать предмет</Button>
      </div>
    </Card>
  );
};
