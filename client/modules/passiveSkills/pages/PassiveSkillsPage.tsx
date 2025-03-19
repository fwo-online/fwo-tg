import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PassiveSkillsList } from '@/modules/passiveSkills/components/PassiveSkillsList';
import { Suspense } from 'react';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { getPassiveSkillsList } from '@/api/passiveSkills';

export const PassiveSkillsPage = () => {
  return (
    <Card header="Пассивные умения" className="m-4!">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки пассивных умений" />}>
        <Suspense fallback={<Placeholder description="Ищем пассивные умения..." />}>
          <PassiveSkillsList skillsSource={getPassiveSkillsList()} />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
};
