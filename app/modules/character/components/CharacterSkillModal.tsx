import type { FC } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import type { Skill } from '@fwo/schemas';
import { Banner, Button, ButtonCell, List, Modal } from '@telegram-apps/telegram-ui';

export const CharacterSkillModal: FC<{
  skill: Skill;
  loading?: boolean;
  onClick: (skill: Skill) => void;
}> = ({ skill, loading, onClick }) => {
  const { character } = useCharacter();
  const isKnownSkill = character.skills[skill.name] !== undefined;
  const hasRequiredLvl = character.lvl >= (skill.classList[character.class] ?? 0);
  const hasRequiredBonus = character.bonus >= skill.bonusCost[character.skills[skill.name] || 0];

  return (
    <Modal
      trigger={
        <ButtonCell>{isKnownSkill ? character.skills[skill.name] : 'Не изучено'} »</ButtonCell>
      }
    >
      <List>
        <Banner header={skill.displayName} subheader={skill.description}>
          {hasRequiredLvl ? (
            <>
              <Button
                stretched
                loading={loading}
                onClick={() => onClick(skill)}
                disabled={!hasRequiredBonus}
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
