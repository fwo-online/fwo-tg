import type { Player } from '@/arena/PlayersService';
import { italic } from '@/utils/formatString';

export const formatDead = (players: Player[]): string => {
  return `Погибшие в этом раунде: ${players
    .map((player) => {
      const info = player.getKiller();
      if (!info) {
        return player.nick;
      }

      return `${player.nick} (${italic(info.action)} ${info.killer.nick})`;
    })
    .join(', ')}`;
};
