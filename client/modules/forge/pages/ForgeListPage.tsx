import { Suspense } from 'react';
import { type LoaderFunctionArgs, useLoaderData, useParams } from 'react-router';
import { getShopItems } from '@/api/shop';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { wearListTranslations } from '@/constants/inventory';
import { ForgeList } from '@/modules/forge/components/ForgeList';

const loader = async ({ params }: LoaderFunctionArgs) => {
  const { wear = '' } = params;
  const items = await getShopItems({ wear });

  return { items };
};

export const ForgeListPage = () => {
  const { wear } = useParams();
  const { items } = useLoaderData<typeof loader>();

  return (
    <Card header={wearListTranslations[wear]} className="m-4!">
      <Suspense fallback={<Placeholder description="Ищем предметы..." />}>
        <ForgeList items={items} />
      </Suspense>
    </Card>
  );
};

ForgeListPage.loader = loader;
