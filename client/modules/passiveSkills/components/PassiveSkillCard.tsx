import type { PassiveSkill } from '@fwo/shared';
import type { FC } from 'react';
import { learnPassiveSkill } from '@/api/passiveSkills';
import { ActionLevelValues } from '@/components/ActionLevelValues';
import { Button } from '@/components/Button';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';

export const PassiveSkillCard: FC<{
  passiveSkill: PassiveSkill;
}> = ({ passiveSkill }) => {
  const { syncCharacter } = useSyncCharacter();
  const [isPending, makeRequest] = useRequest();
  const bonus = useCharacter((character) => character.bonus);
  const passiveSkillLvl = useCharacter((character) => character.passiveSkills[passiveSkill.name]);

  const canLearn = passiveSkill.bonusCost.length;
  const hasMaxSkillLvl = passiveSkillLvl === passiveSkill.bonusCost.length;
  const hasRequiredBonus = bonus >= passiveSkill.bonusCost[passiveSkillLvl || 0];

  if (!canLearn && !passiveSkillLvl) {
    return;
  }

  const handleLearn = async (skill: PassiveSkill) => {
    makeRequest(async () => {
      await learnPassiveSkill(skill.name);
      await syncCharacter();
    });
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
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
      </div>

      <div className="flex pt-2">
        {hasMaxSkillLvl ? (
          <Button className="flex-1" disabled>
            Максимальный уровень
          </Button>
        ) : canLearn ? (
          <div className="flex flex-1 gap-4 items-center">
            <Button
              className="flex-1"
              onClick={() => handleLearn(passiveSkill)}
              disabled={!hasRequiredBonus || isPending}
            >
              Изучить за {passiveSkill.bonusCost[passiveSkillLvl || 0]}💡
            </Button>

            <div className="whitespace-nowrap">У тебя {bonus}💡</div>
          </div>
        ) : (
          <Button className="flex-1" disabled>
            Умение нельзя изучить
          </Button>
        )}
      </div>
    </div>
  );
};
