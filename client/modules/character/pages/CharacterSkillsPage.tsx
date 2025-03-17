import { getAvailableSkillList } from '@/api/skill';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Placeholder } from '@telegram-apps/telegram-ui';
import { CharacterSkillList } from '@/modules/character/components/CharacterSkillList';
import { Suspense } from 'react';
import { Card } from '@/components/Card';

export const CharacterSkillPage = () => {
  return (
    <Card header="Умения" className="m-4!">
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки умений" />}>
        <Suspense fallback={<Placeholder description="Ищем умения..." />}>
          <CharacterSkillList skillsSource={getAvailableSkillList()} />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
};
