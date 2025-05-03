import { getAvailableSkillList } from '@/api/skill';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CharacterSkillList } from '@/modules/character/components/CharacterSkillList';
import { Suspense } from 'react';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import useSWR from 'swr';

const CharacterSkillLoader = () => {
  const { data } = useSWR('skills', getAvailableSkillList, { suspense: true });

  return <CharacterSkillList skills={data} />;
};

export const CharacterSkillPage = () => {
  return (
    <Card header="Умения" className="m-4!">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки умений" />}>
        <Suspense fallback={<Placeholder description="Ищем умения..." />}>
          <CharacterSkillLoader />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
};
