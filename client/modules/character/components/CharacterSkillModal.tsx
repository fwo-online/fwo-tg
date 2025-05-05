import type { FC, ReactNode } from 'react';
import type { Skill } from '@fwo/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';
import { Modal } from '@/components/Modal';

export const CharacterSkillModal: FC<{
  skill: Skill;
  loading?: boolean;
  trigger?: ReactNode;
  onLearn: (skill: Skill) => void;
}> = ({ skill, loading, trigger, onLearn }) => {
  const character = useCharacter();
  const hasMaxSkillLvl = character.skills[skill.name] === skill.bonusCost.length;
  const hasRequiredLvl = character.lvl >= (skill.classList[character.class] ?? 0);
  const hasRequiredBonus = character.bonus >= skill.bonusCost[character.skills[skill.name] || 0];

  return (
    <Modal trigger={trigger}>
      <Card header={skill.displayName}>
        <div className="flex flex-col gap-2">
          <span className="text-sm">{skill.description}</span>
          {hasMaxSkillLvl ? (
            <Button className="flex-1" disabled>
              Максимальный уровень
            </Button>
          ) : hasRequiredLvl ? (
            <div className="flex gap-4 items-center">
              <Button
                className="flex-1"
                onClick={() => onLearn(skill)}
                disabled={!hasRequiredBonus || loading}
              >
                Изучить за {skill.bonusCost[character.skills[skill.name] || 0]}💡
              </Button>

              <div>У тебя {character.bonus}💡</div>
            </div>
          ) : (
            <Button className="flex-1" disabled>
              Откроется на уровне {skill.classList[character.class]}
            </Button>
          )}
        </div>
      </Card>
    </Modal>
  );
};
