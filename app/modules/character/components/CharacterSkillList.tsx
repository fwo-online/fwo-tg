import type { Skill } from '@fwo/schemas';
import { ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import { type FC, useState } from 'react';
import { CharacterSkillModal } from '@/modules/character/components/CharacterSkillModal';
import { useCharacter } from '@/hooks/useCharacter';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { learnSkill } from '@/client/skill';
import { useRequest } from '@/hooks/useRequest';

export const CharacterSkillList: FC<{
  skillsPromise: Promise<Skill[]>;
}> = ({ skillsPromise }) => {
  const { character } = useCharacter();
  const [skills, setSkill] = useState<Skill[]>([]);
  const { updateCharacter } = useUpdateCharacter();
  const { isPending, makeRequest } = useRequest();

  const handleLearn = async (skill: Skill) => {
    makeRequest(async () => {
      await learnSkill(skill.name);
      await updateCharacter();
    });
  };

  skillsPromise.then(setSkill);

  if (!skills.length) {
    throw skillsPromise;
  }

  return (
    <>
      {skills.map((skill) => (
        <CharacterSkillModal
          key={skill.name}
          skill={skill}
          loading={isPending}
          onLearn={handleLearn}
          trigger={
            <ButtonCell
              key={skill.name}
              after={
                <Info style={{ marginLeft: 'auto' }} type="text">
                  {character.skills[skill.name]}
                </Info>
              }
            >
              <Navigation>{skill.displayName}</Navigation>
            </ButtonCell>
          }
        />
      ))}
    </>
  );
};
