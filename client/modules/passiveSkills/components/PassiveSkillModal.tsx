import type { FC, ReactNode } from 'react';
import type { PassiveSkill } from '@fwo/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';
import { Modal } from '@/components/Modal';

export const PassiveSkillModal: FC<{
  passiveSkill: PassiveSkill;
  loading?: boolean;
  trigger?: ReactNode;
  onLearn: (skill: PassiveSkill) => void;
}> = ({ passiveSkill, loading, onLearn }) => {
  const bonus = useCharacter((character) => character.bonus);
  const passiveSkillLvl = useCharacter((character) => character.passiveSkills[passiveSkill.name]);

  const hasMaxSkillLvl = passiveSkillLvl === passiveSkill.bonusCost.length;
  const hasRequiredBonus = bonus >= passiveSkill.bonusCost[passiveSkillLvl || 0];

  return (
    <Modal
      trigger={
        <Button>
          <div className="flex justify-between items-center text-sm">
            {passiveSkill.displayName}
            <div className="opacity-50">{passiveSkillLvl}</div>
          </div>
        </Button>
      }
    >
      <Card header={passiveSkill.displayName} className="mt-1">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 text-sm opacity-50">
            <span>Шанс (%):</span>
            <span>{passiveSkill.chance.join('/')}</span>
          </div>
          <div className="flex gap-2  text-sm opacity-50">
            <span>Эффект (%):</span>
            <span>{passiveSkill.effect.join('/')}</span>
          </div>
          <span className="text-sm">{passiveSkill.description}</span>
          {hasMaxSkillLvl ? (
            <Button className="flex-1" disabled>
              Максимальный уровень
            </Button>
          ) : (
            <div className="flex gap-4 items-center">
              <Button
                className="flex-1"
                onClick={() => onLearn(passiveSkill)}
                disabled={!hasRequiredBonus || loading}
              >
                Изучить за {passiveSkill.bonusCost[passiveSkillLvl || 0]}💡
              </Button>

              <div>У тебя {bonus}💡</div>
            </div>
          )}
        </div>
      </Card>
    </Modal>
  );
};
