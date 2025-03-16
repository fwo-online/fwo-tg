import { ButtonCell, Info, Section } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import type { FC } from 'react';
import type { Action } from '@fwo/schemas';

export const GameActionList: FC<{ onSelect: (action: Action) => void }> = ({ onSelect }) => {
  const actions = useGameStore((state) => state.actions);
  const magics = useGameStore((state) => state.magics);
  const skills = useGameStore((state) => state.skills);

  return (
    <Section>
      <Section.Header>Действия</Section.Header>
      {actions.map((action) => (
        <ButtonCell key={action.name} onClick={() => onSelect(action)}>
          {action.displayName}
        </ButtonCell>
      ))}
      {magics.length ? (
        <>
          <Section.Header>Магии</Section.Header>
          {magics.map((action) => (
            <ButtonCell
              key={action.name}
              after={
                <Info style={{ marginLeft: 'auto' }} type="text">
                  {action.cost}💧
                </Info>
              }
              onClick={() => onSelect(action)}
            >
              {action.displayName}
            </ButtonCell>
          ))}
        </>
      ) : null}

      {skills.length ? (
        <>
          <Section.Header>Умения</Section.Header>
          {skills.map((action) => (
            <ButtonCell
              key={action.name}
              after={
                <Info style={{ marginLeft: 'auto' }} type="text">
                  {action.cost}🔋
                </Info>
              }
              onClick={() => onSelect(action)}
            >
              {action.displayName}
            </ButtonCell>
          ))}
        </>
      ) : null}
    </Section>
  );
};
