import { getLadderList } from '@/api/laddet';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { LadderList } from '@/modules/ladder/components/LadderList';
import { Suspense, type FC } from 'react';
import useSWR from 'swr';

const LadderListLoader = () => {
  const { data } = useSWR('ladder', getLadderList, { suspense: true });

  return <LadderList ladderList={data} />;
};

export const LadderPage: FC = () => {
  return (
    <Card header="Рейтинг" className="m-4">
      <Suspense fallback={<Placeholder description="Загружаем рейтинг..." />}>
        <LadderListLoader />
      </Suspense>
    </Card>
  );
};
