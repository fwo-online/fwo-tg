import type { PassiveSkill, Skill } from '@fwo/shared';
import { type FC, use } from 'react';
import { CharacterSkillModal } from '@/modules/character/components/CharacterSkillModal';
import { useCharacter } from '@/contexts/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { learnSkill } from '@/api/skill';
import { useRequest } from '@/hooks/useRequest';
import { Button } from '@/components/Button';
import { PassiveSkillModal } from './PassiveSkillModal';
import { learnPassiveSkill } from '@/api/passiveSkills';

export const PassiveSkillsList: FC<{
  skillsSource: Promise<PassiveSkill[]>;
}> = ({ skillsSource }) => {
  const { character } = useCharacter();
  const skills = use(skillsSource);
  const { updateCharacter } = useUpdateCharacter();
  const [isPending, makeRequest] = useRequest();

  const handleLearn = async (skill: PassiveSkill) => {
    makeRequest(async () => {
      await learnPassiveSkill(skill.name);
      await updateCharacter();
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
          trigger={
            <Button>
              <div className="flex justify-between items-center text-sm">
                {skill.displayName}
                <div className="opacity-50">{character.passiveSkills[skill.name]}</div>
              </div>
            </Button>
          }
        />
      ))}
    </div>
  );
};
