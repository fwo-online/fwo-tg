import { Suspense, type FC } from 'react';
import { useParams } from 'react-router';
import { ForgeList } from '@/modules/forge/components/ForgeList';
import { getShopItems } from '@/api/shop';
import { wearListTranslations } from '@/constants/inventory';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import useSWR from 'swr';

const ClanForgeListLoader = () => {
  const { wear } = useParams<{ wear: string }>();

  const { data = [] } = useSWR('clanForgeList', () => getShopItems({ wear }), { suspense: true });

  return <ForgeList items={data} clanForge />;
};

export const ClanForgeListPage: FC = () => {
  const { wear } = useParams<{ wear: string }>();

  return (
    <Card header={wearListTranslations[wear]} className="m-4!">
      <Suspense fallback={<Placeholder description="Ищем предметы..." />}>
        <ClanForgeListLoader />
      </Suspense>
    </Card>
  );
};
