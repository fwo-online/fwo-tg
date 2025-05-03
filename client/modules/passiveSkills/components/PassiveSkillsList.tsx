import type { PassiveSkill } from '@fwo/shared';
import type { FC } from 'react';
import { useRequest } from '@/hooks/useRequest';
import { learnPassiveSkill } from '@/api/passiveSkills';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { PassiveSkillModal } from '@/modules/passiveSkills/components/PassiveSkillModal';

export const PassiveSkillsList: FC<{
  skills: PassiveSkill[];
}> = ({ skills }) => {
  const { syncCharacter } = useSyncCharacter();
  const [isPending, makeRequest] = useRequest();

  const handleLearn = async (skill: PassiveSkill) => {
    makeRequest(async () => {
      await learnPassiveSkill(skill.name);
      await syncCharacter();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <PassiveSkillModal
          key={skill.name}
          passiveSkill={skill}
          loading={isPending}
          onLearn={handleLearn}
        />
      ))}
    </div>
  );
};
