import { Suspense, type FC } from 'react';
import { useParams } from 'react-router';
import { ForgeList } from '@/modules/forge/components/ForgeList';
import { getShopItems } from '@/api/shop';
import { wearListTranslations } from '@/constants/inventory';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import useSWR from 'swr';

const ForgeListLoader = () => {
  const { wear } = useParams<{ wear: string }>();

  const { data = [] } = useSWR('forgeList', () => getShopItems({ wear }));

  return <ForgeList items={data} />;
};

export const ForgeListPage: FC = () => {
  const { wear } = useParams();

  return (
    <Card header={wearListTranslations[wear]} className="m-4!">
      <Suspense fallback={<Placeholder description="Ищем предметы..." />}>
        <ForgeListLoader />
      </Suspense>
    </Card>
  );
};
