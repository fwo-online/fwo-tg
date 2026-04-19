import type { PassiveSkill } from '@fwo/shared';
import type { FC, ReactNode } from 'react';
import { ActionLevelValues } from '@/components/ActionLevelValues';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { useCharacter } from '@/modules/character/store/character';

export const PassiveSkillModal: FC<{
  passiveSkill: PassiveSkill;
  loading?: boolean;
  trigger?: ReactNode;
  onLearn: (skill: PassiveSkill) => void;
}> = ({ passiveSkill, loading, onLearn }) => {
  const bonus = useCharacter((character) => character.bonus);
  const passiveSkillLvl = useCharacter((character) => character.passiveSkills[passiveSkill.name]);

  const canLearn = passiveSkill.bonusCost.length;
  const hasMaxSkillLvl = passiveSkillLvl === passiveSkill.bonusCost.length;
  const hasRequiredBonus = bonus >= passiveSkill.bonusCost[passiveSkillLvl || 0];

  if (!canLearn && !passiveSkillLvl) {
    return;
  }

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
          <ActionLevelValues
            label="Шанс"
            values={passiveSkill.chance}
            currentLevel={passiveSkillLvl}
          />
          <ActionLevelValues
            label="Эффект"
            values={passiveSkill.effect}
            currentLevel={passiveSkillLvl}
          />
          <span className="text-sm">{passiveSkill.description}</span>

          {hasMaxSkillLvl ? (
            <Button className="flex-1" disabled>
              Максимальный уровень
            </Button>
          ) : canLearn ? (
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
          ) : (
            <Button className="flex-1" disabled>
              Умение нельзя изучить
            </Button>
          )}
        </div>
      </Card>
    </Modal>
  );
};
