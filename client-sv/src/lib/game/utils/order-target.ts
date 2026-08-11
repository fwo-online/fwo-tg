import { type Action, getClanName, type Player, reservedClanName } from '@fwo/shared';
import { groupBy, omit, pick } from 'es-toolkit';

type Params = {
  action: Action;
  players: Record<string, Player>;
  characterID: string;
};

export const getAvaiableTargets = ({ action, players, characterID }: Params) => {
  const clanID = getClanName(players[characterID]?.clan);
  const alivePlayers = Object.values(players).filter(({ alive }) => alive);
  const byClan = groupBy(alivePlayers, ({ clan }) => getClanName(clan));

  switch (action.orderType) {
    case 'all':
    case 'any':
      return byClan;
    case 'enemy':
      return clanID === reservedClanName
        ? {
            ...byClan,
            [clanID]: byClan[clanID]?.filter(({ id }) => id !== characterID) ?? [],
          }
        : omit(byClan, [clanID]);
    case 'self':
      return {
        [clanID]: byClan[clanID]?.filter(({ id }) => id === characterID) ?? [],
      };
    case 'teamExceptSelf':
      return {
        [clanID]: byClan[clanID]?.filter(({ id }) => id !== characterID) ?? [],
      };
    case 'team':
      return clanID === reservedClanName
        ? {
            [clanID]: byClan[clanID]?.filter(({ id }) => id === characterID) ?? [],
          }
        : pick(byClan, [clanID]);
    default:
      return byClan;
  }
};
