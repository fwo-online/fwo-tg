import {
  Button,
  Cell,
  Info,
  Input,
  Section,
  Selectable,
  Slider,
  VisuallyHidden,
} from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { type FC, useCallback, useMemo, useState } from 'react';
import type { Action, PublicGameStatus } from '@fwo/schemas';
import { useCharacter } from '@/hooks/useCharacter';
import { omit, pick } from 'es-toolkit';
import { useFormStatus } from 'react-dom';

export const GameAction: FC<{
  action: Action;
}> = ({ action }) => {
  const { character } = useCharacter();
  const remainPower = useGameStore((state) => state.power);
  const statusByClan = useGameStore((state) => state.statusByClan);
  const [power, setPower] = useState(0);

  const handleSliderChange = useCallback(
    (value: number) => {
      setPower(Math.min(remainPower, value));
    },
    [remainPower],
  );

  const availableTargets: Record<string, PublicGameStatus[]> = useMemo(() => {
    switch (action.orderType) {
      case 'all':
      case 'any':
        return statusByClan;
      case 'enemy':
        return omit(statusByClan, [character.clan?.id ?? '__clan']);
      case 'self':
        return {
          [character.clan?.id ?? '__clan']: statusByClan[character.clan?.id ?? '__clan']?.filter(
            ({ id }) => id === character.id,
          ),
        };
      case 'team':
        return pick(statusByClan, [character.clan?.id ?? '__clan']);
      default:
        return statusByClan;
    }
  }, [action.orderType, statusByClan, character.id, character.clan?.id]);

  const { pending } = useFormStatus();

  return (
    <Section>
      <Section.Header>Выбери цель для {action.displayName}</Section.Header>
      {Object.entries(availableTargets).map(([clan, statuses]) => (
        <Section key={clan}>
          <Section.Header>{clan}</Section.Header>
          {statuses.map((status) => (
            <Cell
              Component="label"
              before={<Selectable name="target" value={status.id} />}
              key={status.id}
              after={
                <Info type="text" style={{ marginLeft: 'auto' }}>
                  ❤️ {status.hp}
                </Info>
              }
            >
              {status.name} ({status.hp})
            </Cell>
          ))}
        </Section>
      ))}
      <Slider
        before={0}
        after={remainPower}
        value={power}
        min={0}
        max={remainPower}
        onChange={handleSliderChange}
      />
      <VisuallyHidden>
        <Input name="power" value={power} readOnly />
      </VisuallyHidden>

      <Button stretched type="submit" disabled={pending} loading={pending}>
        Заказать {action.displayName} на {power}%
      </Button>
    </Section>
  );
};
