import { type Action, getClanName, type Player, reservedClanName } from '@fwo/shared';

type Params = {
  action?: Action;
  players: Record<string, Player>;
  characterID: string;
};

export const getAvailableTargets = ({ action, players, characterID }: Params): Player[] => {
  const clanID = getClanName(players[characterID]?.clan);
  const alivePlayers = Object.values(players).filter(({ alive }) => alive);

  switch (action?.orderType) {
    case 'enemy':
      return clanID === reservedClanName
        ? alivePlayers.filter((player) => player.id !== characterID)
        : alivePlayers.filter((player) => player.clan?.id !== clanID);

    case 'self':
      return alivePlayers.filter((player) => player.id === characterID);

    case 'teamExceptSelf':
      return clanID === reservedClanName
        ? []
        : alivePlayers.filter((player) => player.clan?.id === clanID && player.id !== characterID);

    case 'team':
      return clanID === reservedClanName
        ? alivePlayers.filter((player) => player.id === characterID)
        : alivePlayers.filter((player) => player.clan?.id === clanID);

    default:
      return alivePlayers;
  }
};

/** @deprecated alias for typo compatibility */
export const getAvaiableTargets = getAvailableTargets;
