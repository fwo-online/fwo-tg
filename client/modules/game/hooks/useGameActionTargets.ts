import { useGameStore } from '@/modules/game/store/useGameStore';
import { useMemo } from 'react';
import { reservedClanName, type Action, type PublicGameStatus } from '@fwo/shared';
import { useCharacter } from '@/contexts/character';
import { omit, pick } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

export const useGameActionTargets = ({
  action,
}: {
  action: Action;
}) => {
  const { character } = useCharacter();
  const statusByClan = useGameStore((state) => state.statusByClan);

  const clanID = character.clan?.id ?? reservedClanName;

  const availableTargets: Record<string, PublicGameStatus[]> = useMemo(() => {
    switch (action.orderType) {
      case 'all':
      case 'any':
        return statusByClan;
      case 'enemy':
        return omit(statusByClan, [clanID]);
      case 'self':
        return {
          [clanID]: statusByClan[clanID]?.filter(({ id }) => id === character.id),
        };
      case 'teamExceptSelf':
        return {
          [clanID]: statusByClan[clanID]?.filter(({ id }) => id !== character.id),
        };
      case 'team':
        return pick(statusByClan, [clanID]);
      default:
        return statusByClan;
    }
  }, [action.orderType, statusByClan, character.id, clanID]);

  const hasTargets = Object.values(availableTargets).every(isEmpty);

  return {
    hasTargets,
    availableTargets,
  };
};
