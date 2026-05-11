import type { PassiveSkill } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';

export const PassiveSkillButton: FC<{
  selected: boolean;
  passiveSkill: PassiveSkill;
  onClick: () => void;
}> = ({ selected, passiveSkill, onClick }) => {
  const passiveSkillLvl = useCharacter((character) => character.passiveSkills[passiveSkill.name]);

  const canLearn = passiveSkill.bonusCost.length;

  if (!canLearn && !passiveSkillLvl) {
    return;
  }

  return (
    <Button onClick={onClick} className={classNames({ 'is-primary': selected })}>
      <div className="flex justify-between items-center text-sm">
        {passiveSkill.displayName}
        <div className="opacity-50">{passiveSkillLvl}</div>
      </div>
    </Button>
  );
};
