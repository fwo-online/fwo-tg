import type { Skill } from '@fwo/shared';
import type { FC } from 'react';
import { SkillButton } from '@/modules/skills/components/SkillButton';

export const SkillsList: FC<{
  skills: Skill[];
  selectedSkill?: Skill;
  onSelect: (skill: Skill) => void;
}> = ({ skills, selectedSkill, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <SkillButton
          selected={selectedSkill?.name === skill.name}
          key={skill.name}
          skill={skill}
          onClick={() => onSelect(skill)}
        />
      ))}
    </div>
  );
};
