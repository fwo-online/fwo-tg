import type { Skill } from '@fwo/shared';
import type { FC } from 'react';
import { learnSkill } from '@/api/skill';
import { ActionLevelValues } from '@/components/ActionLevelValues';
import { Button } from '@/components/Button';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';

export const SkillCard: FC<{
  skill: Skill;
}> = ({ skill }) => {
  const { syncCharacter } = useSyncCharacter();
  const [isPending, makeRequest] = useRequest();
  const bonus = useCharacter((character) => character.bonus);
  const passiveSkillLvl = useCharacter((character) => character.passiveSkills[skill.name]);
  const character = useCharacter();
  const hasMaxSkillLvl = character.skills[skill.name] === skill.bonusCost.length;
  const hasRequiredLvl = character.lvl >= (skill.classList[character.class] ?? 0);
  const hasRequiredBonus = character.bonus >= skill.bonusCost[character.skills[skill.name] || 0];

  const canLearn = skill.bonusCost.length;

  if (!canLearn && !passiveSkillLvl) {
    return;
  }

  const handleLearn = async (skill: Skill) => {
    makeRequest(async () => {
      await learnSkill(skill.name);
      await syncCharacter();
    });
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div className="flex flex-col gap-2">
        <ActionLevelValues label="Шанс" values={skill.chance} currentLevel={passiveSkillLvl} />
        {/* <ActionLevelValues label="Эффект" values={skill.effect} currentLevel={passiveSkillLvl} /> */}
        <span className="text-sm">{skill.description}</span>
      </div>

      <div className="flex pt-2">
        {hasMaxSkillLvl ? (
          <Button className="flex-1" disabled>
            Максимальный уровень
          </Button>
        ) : hasRequiredLvl ? (
          <div className="flex flex-1 gap-4 items-center">
            <Button
              className="flex-1"
              onClick={() => handleLearn(skill)}
              disabled={!hasRequiredBonus || isPending}
            >
              Изучить за {skill.bonusCost[passiveSkillLvl || 0]}💡
            </Button>

            <div className="whitespace-nowrap">У тебя {bonus}💡</div>
          </div>
        ) : (
          <Button className="flex-1" disabled>
            Откроется на уровне {skill.classList[character.class]}
          </Button>
        )}
      </div>
    </div>
  );
};
