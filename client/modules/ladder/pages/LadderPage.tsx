import { getLadderList } from '@/api/laddet';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { LadderList } from '@/modules/ladder/components/LadderList';
import { Suspense, type FC } from 'react';
import { suspend } from 'suspend-react';

const LadderListLoader = () => {
  const ladderList = suspend(() => getLadderList(), ['ladder'], { lifespan: 1 });

  return <LadderList ladderList={ladderList} />;
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
