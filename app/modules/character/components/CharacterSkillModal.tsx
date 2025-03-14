import type { FC, ReactNode } from 'react';
import { useCharacter } from '@/contexts/character';
import type { Skill } from '@fwo/schemas';
import { Banner, Button, List, Modal } from '@telegram-apps/telegram-ui';

export const CharacterSkillModal: FC<{
  skill: Skill;
  loading?: boolean;
  trigger?: ReactNode;
  onLearn: (skill: Skill) => void;
}> = ({ skill, loading, trigger, onLearn }) => {
  const { character } = useCharacter();
  const hasMaxSkillLvl = character.skills[skill.name] === skill.bonusCost.length;
  const hasRequiredLvl = character.lvl >= (skill.classList[character.class] ?? 0);
  const hasRequiredBonus = character.bonus >= skill.bonusCost[character.skills[skill.name] || 0];

  return (
    <Modal trigger={trigger}>
      <List>
        <Banner header={skill.displayName} description={skill.description}>
          {hasMaxSkillLvl ? (
            <Button stretched disabled>
              Максимальный уровень
            </Button>
          ) : hasRequiredLvl ? (
            <>
              <Button
                stretched
                loading={loading}
                onClick={() => onLearn(skill)}
                disabled={!hasRequiredBonus || loading}
              >
                Изучить за {skill.bonusCost[character.skills[skill.name] || 0]}💡
              </Button>

              <Button stretched mode="plain">
                У тебя {character.bonus}💡
              </Button>
            </>
          ) : (
            <Button stretched disabled>
              Откроется на уровне {skill.classList[character.class]}
            </Button>
          )}
        </Banner>
      </List>
    </Modal>
  );
};
