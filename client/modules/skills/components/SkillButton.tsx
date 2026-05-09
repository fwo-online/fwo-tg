import type { Skill } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';

export const SkillButton: FC<{
  selected: boolean;
  skill: Skill;
  onClick: () => void;
}> = ({ selected, skill, onClick }) => {
  const passiveSkillLvl = useCharacter((character) => character.skills[skill.name]);

  const canLearn = skill.bonusCost.length;

  if (!canLearn && !passiveSkillLvl) {
    return;
  }

  return (
    <Button onClick={onClick} className={classNames({ 'is-primary': selected })}>
      <div className="flex justify-between items-center text-sm">
        {skill.displayName}
        <div className="opacity-50">{passiveSkillLvl}</div>
      </div>
    </Button>
  );
};
