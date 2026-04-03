import type { Player } from '../PlayersService';

type DeadFlag = {
  killer: Player;
  action: string;
};

/**
 * Класс флагов
 */
export default class FlagsConstructor {
  isDead?: DeadFlag = undefined;
  isKicked?: 'run' | 'afk' = undefined;
}
