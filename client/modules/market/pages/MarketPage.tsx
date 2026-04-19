import { itemMarketRequiredLevel } from '@fwo/shared';
import { Suspense } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { getMarketItems } from '@/api/market';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/modules/character/store/character';
import { MarketList } from '@/modules/market/components/MarketList';

const loader = async () => {
  const marketItems = await getMarketItems();

  return {
    marketItems,
  };
};

export const MarketPage = () => {
  const navigate = useNavigate();
  const character = useCharacter();
  const { marketItems } = useLoaderData<typeof loader>();

  const goToCreateMarketItem = () => {
    navigate('/agora/market/create');
  };

  return (
    <Card header="Барахолка" className="m-4">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки товаров" />}>
        <Suspense fallback={<Placeholder description="Ищем товары..." />}>
          <MarketList items={marketItems} />
        </Suspense>
      </ErrorBoundary>

      {character.lvl >= itemMarketRequiredLevel && (
        <div className="flex flex-col sticky mt-8 bottom-4 left-2 right-2">
          <Button onClick={goToCreateMarketItem}>Продать предмет</Button>
        </div>
      )}
    </Card>
  );
};

MarketPage.loader = loader;
