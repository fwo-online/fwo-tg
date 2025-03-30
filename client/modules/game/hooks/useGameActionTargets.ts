import { useGameStore } from '@/modules/game/store/useGameStore';
import { useMemo } from 'react';
import { reservedClanName, type Action, type PublicGameStatus } from '@fwo/shared';
import { useCharacter } from '@/contexts/character';
import { omit, pick } from 'es-toolkit';
import { groupBy, isEmpty } from 'es-toolkit/compat';

export const useGameActionTargets = ({
  action,
}: {
  action: Action;
}) => {
  const { character } = useCharacter();
  const players = useGameStore((state) => state.players);
  const playersByClan = groupBy(Object.values(players), ({ clan }) => clan?.id || reservedClanName);

  const clanID = character.clan?.id ?? reservedClanName;

  const availableTargets: Record<string, PublicGameStatus[]> = useMemo(() => {
    switch (action.orderType) {
      case 'all':
      case 'any':
        return playersByClan;
      case 'enemy':
        return clanID === reservedClanName
          ? {
              ...playersByClan,
              [clanID]: playersByClan[clanID]?.filter(({ id }) => id !== character.id),
            }
          : omit(playersByClan, [clanID]);
      case 'self':
        return {
          [clanID]: playersByClan[clanID]?.filter(({ id }) => id === character.id),
        };
      case 'teamExceptSelf':
        return {
          [clanID]: playersByClan[clanID]?.filter(({ id }) => id !== character.id),
        };
      case 'team':
        return clanID === reservedClanName
          ? {
              [clanID]: playersByClan[clanID]?.filter(({ id }) => id === character.id),
            }
          : pick(playersByClan, [clanID]);
      default:
        return playersByClan;
    }
  }, [action.orderType, playersByClan, character.id, clanID]);

  const hasTargets = Object.values(availableTargets).every(isEmpty);

  return {
    hasTargets,
    availableTargets,
  };
};
