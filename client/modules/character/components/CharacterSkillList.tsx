import type { Skill } from '@fwo/shared';
import { type FC, use } from 'react';
import { CharacterSkillModal } from '@/modules/character/components/CharacterSkillModal';
import { useCharacter } from '@/contexts/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { learnSkill } from '@/api/skill';
import { useRequest } from '@/hooks/useRequest';
import { Button } from '@/components/Button';

export const CharacterSkillList: FC<{
  skillsSource: Promise<Skill[]>;
}> = ({ skillsSource }) => {
  const { character } = useCharacter();
  const skills = use(skillsSource);
  const { updateCharacter } = useUpdateCharacter();
  const [isPending, makeRequest] = useRequest();

  const handleLearn = async (skill: Skill) => {
    makeRequest(async () => {
      await learnSkill(skill.name);
      await updateCharacter();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <CharacterSkillModal
          key={skill.name}
          skill={skill}
          loading={isPending}
          onLearn={handleLearn}
          trigger={
            <Button>
              <div className="flex justify-between">
                {skill.displayName}
                <div className="opacity-50">{character.skills[skill.name]}</div>
              </div>
            </Button>
          }
        />
      ))}
    </div>
  );
};
