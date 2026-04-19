import { Suspense } from 'react';
import { useLoaderData } from 'react-router';
import { getLadderList } from '@/api/laddet';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { LadderList } from '@/modules/ladder/components/LadderList';

const loader = async () => {
  const ladderList = await getLadderList();

  return {
    ladderList,
  };
};

export const LadderPage = () => {
  const { ladderList } = useLoaderData<typeof loader>();

  return (
    <Card header="Рейтинг" className="m-4">
      <Suspense fallback={<Placeholder description="Загружаем рейтинг..." />}>
        <LadderList ladderList={ladderList} />
      </Suspense>
    </Card>
  );
};

LadderPage.loader = loader;
