import { getAvailableSkillList } from '@/client/skill';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { CharacterSkillList } from '@/modules/character/components/CharacterSkillList';

export const CharacterSkillPage = () => {
  return (
    <List>
      <Section>
        <Section.Header>Умения</Section.Header>
        <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки умений" />}>
          <CharacterSkillList skillsPromise={getAvailableSkillList()} />
        </ErrorBoundary>
      </Section>
    </List>
  );
};
