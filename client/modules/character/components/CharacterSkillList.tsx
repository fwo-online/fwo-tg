import type { Skill } from '@fwo/shared';
import type { FC } from 'react';
import { CharacterSkillModal } from '@/modules/character/components/CharacterSkillModal';
import { learnSkill } from '@/api/skill';
import { useRequest } from '@/hooks/useRequest';
import { Button } from '@/components/Button';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';

export const CharacterSkillList: FC<{ skills: Skill[] }> = ({ skills }) => {
  const character = useCharacter();
  const { syncCharacter } = useSyncCharacter();
  const [isPending, makeRequest] = useRequest();

  const handleLearn = async (skill: Skill) => {
    makeRequest(async () => {
      await learnSkill(skill.name);
      await syncCharacter();
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
