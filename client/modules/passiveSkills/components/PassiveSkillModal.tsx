import type { FC, ReactNode } from 'react';
import { useCharacter } from '@/contexts/character';
import type { PassiveSkill } from '@fwo/shared';
import { Modal } from '@telegram-apps/telegram-ui';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export const PassiveSkillModal: FC<{
  passiveSkill: PassiveSkill;
  loading?: boolean;
  trigger?: ReactNode;
  onLearn: (skill: PassiveSkill) => void;
}> = ({ passiveSkill, loading, trigger, onLearn }) => {
  const { character } = useCharacter();
  const hasMaxSkillLvl =
    character.passiveSkills[passiveSkill.name] === passiveSkill.bonusCost.length;
  const hasRequiredBonus =
    character.bonus >= passiveSkill.bonusCost[character.passiveSkills[passiveSkill.name] || 0];

  return (
    <Modal trigger={trigger}>
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
                Изучить за {passiveSkill.bonusCost[character.passiveSkills[passiveSkill.name] || 0]}
                💡
              </Button>

              <div>У тебя {character.bonus}💡</div>
            </div>
          )}
        </div>
      </Card>
    </Modal>
  );
};
