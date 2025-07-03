import type { Player } from '../PlayersService';

type Flag = {
  initiator: Player;
  val: number;
};
/**
 * Класс флагов
 */
export default class FlagsConstructor {
  isProtected: Flag[] = [];
  isGlitched: Flag[] = [];
  isSilenced: Flag[] = [];
  isDead = '';
  isHealed: Flag[] = [];
  isHited?: Flag;
  isKicked?: 'run' | 'afk' = undefined;
  isDodging = 0;
  isParry = 0;
  isMad: Flag[] = [];
  isShielded = 0;
  isParalysed: Flag[] = [];
  isDisarmed: Flag[] = [];
  isSleeping: Flag[] = [];
  isLightShielded: Flag[] = [];
  isBehindWall: Flag[] = [];
  isCharmed: Flag[] = [];
  isMarkedByDarkness: Flag[] = [];

  /**
   * Обнуление флагов
   */
  refresh(): void {
    this.isProtected = [];
    this.isGlitched = [];
    this.isSilenced = [];
    this.isHealed = [];
    this.isHited = undefined;
    this.isDodging = 0;
    this.isMad = [];
    this.isParalysed = [];
    this.isSleeping = [];
    this.isParry = 0;
    this.isDisarmed = [];
    this.isShielded = 0;
    this.isLightShielded = [];
    this.isBehindWall = [];
    this.isCharmed = [];
    this.isMarkedByDarkness = [];
  }
}
