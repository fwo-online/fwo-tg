import type { PassiveSkill } from '@fwo/shared';
import type { FC } from 'react';
import { PassiveSkillButton } from '@/modules/passiveSkills/components/PassiveSkillButton';

export const PassiveSkillsList: FC<{
  skills: PassiveSkill[];
  selectedSkill?: PassiveSkill;
  onSelect: (skill: PassiveSkill) => void;
}> = ({ skills, selectedSkill, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <PassiveSkillButton
          selected={selectedSkill?.name === skill.name}
          key={skill.name}
          passiveSkill={skill}
          onClick={() => onSelect(skill)}
        />
      ))}
    </div>
  );
};
