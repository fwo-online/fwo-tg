import { getAvailableSkillList, learnSkill } from '@/client/skill';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkillList } from '@/modules/skill/components/SkillList';
import type { Skill } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';
import { Headline, List, Placeholder } from '@telegram-apps/telegram-ui';
import { CharacterSkillModal } from '@/modules/character/components/CharacterSkillModal';
import { useTransition } from 'react';
import { getCharacter } from '@/client/character';
import { useCharacter } from '@/hooks/useCharacter';

export const CharacterSkillPage = () => {
  const [isPending, startTransition] = useTransition();
  const { setCharacter } = useCharacter();

  const learn = async (skill: Skill) => {
    startTransition(async () => {
      try {
        await learnSkill(skill.name);
      } catch (e) {
        console.log(e);
        await popup.open({ message: e.message });
      }
      setCharacter(await getCharacter());
    });
  };

  return (
    <List>
      <Headline>Умения</Headline>
      <ErrorBoundary fallback={<Placeholder description="Ошибка загрузки умений" />}>
        <SkillList
          skillsPromise={getAvailableSkillList()}
          after={(skill) => (
            <CharacterSkillModal skill={skill} loading={isPending} onClick={learn} />
          )}
        />
      </ErrorBoundary>
    </List>
  );
};
