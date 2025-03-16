import { getAvailableSkillList } from '@/api/skill';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { CharacterSkillList } from '@/modules/character/components/CharacterSkillList';
import { Suspense } from 'react';

export const CharacterSkillPage = () => {
  return (
    <List>
      <Section>
        <Section.Header>Умения</Section.Header>
        <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки умений" />}>
          <Suspense fallback={<Placeholder description="Ищем умения..." />}>
            <CharacterSkillList skillsSource={getAvailableSkillList()} />
          </Suspense>
        </ErrorBoundary>
      </Section>
    </List>
  );
};
