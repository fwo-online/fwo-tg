import { type Action, type Player, reservedClanName } from '@fwo/shared';
import { omit, pick } from 'es-toolkit';
import { groupBy, isEmpty } from 'es-toolkit/compat';
import { useMemo } from 'react';
import { useCharacter } from '@/modules/character/store/character';
import { useGameStore } from '@/modules/game/store/useGameStore';

export const useGameActionTargets = ({ action }: { action: Action }) => {
  const characterID = useCharacter((character) => character.id);
  const clanID = useGameStore((state) => state.players[characterID].clan?.name ?? reservedClanName);
  const players = useGameStore((state) => state.players);
  const alivePlayers = Object.values(players).filter(({ alive }) => alive);
  const playersByClan = groupBy(alivePlayers, ({ clan }) => clan?.name ?? reservedClanName);

  const availableTargets: Record<string, Player[]> = useMemo(() => {
    switch (action.orderType) {
      case 'all':
      case 'any':
        return playersByClan;
      case 'enemy':
        return clanID === reservedClanName
          ? {
              ...playersByClan,
              [clanID]: playersByClan[clanID]?.filter(({ id }) => id !== characterID),
            }
          : omit(playersByClan, [clanID]);
      case 'self':
        return {
          [clanID]: playersByClan[clanID]?.filter(({ id }) => id === characterID),
        };
      case 'teamExceptSelf':
        return {
          [clanID]: playersByClan[clanID]?.filter(({ id }) => id !== characterID),
        };
      case 'team':
        return clanID === reservedClanName
          ? {
              [clanID]: playersByClan[clanID]?.filter(({ id }) => id === characterID),
            }
          : pick(playersByClan, [clanID]);
      default:
        return playersByClan;
    }
  }, [action.orderType, playersByClan, characterID, clanID]);

  const hasTargets = Object.values(availableTargets).every(isEmpty);

  return {
    hasTargets,
    availableTargets,
  };
};
