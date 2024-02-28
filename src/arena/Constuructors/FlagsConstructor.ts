type Flag = {
  initiator: string;
  val: number;
}
/**
 * Класс флагов
 */
export default class FlagsConstructor {
  isProtected: Flag[] = [];
  isGlitched = false;
  isSilenced: Flag[] = [];
  isDead = '';
  isHealed: Flag[] = [];
  isHited?: Flag;
  isKicked?: 'run' | 'afk' = undefined;
  isDodging = 0;
  isParry = 0;
  isMad = false;
  isShielded = 0;
  isParalysed = false;
  isDisarmed = false;
  isSleeping = false;
  isLightShielded: Flag[] = [];
  isBehindWall?: Flag;

  /**
   * Обнуление флагов
   */
  refresh(): void {
    this.isProtected = [];
    this.isGlitched = false;
    this.isSilenced = [];
    this.isHealed = [];
    this.isHited = undefined;
    this.isDodging = 0;
    this.isMad = false;
    this.isParalysed = false;
    this.isSleeping = false;
    this.isParry = 0;
    this.isDisarmed = false;
    this.isShielded = 0;
    this.isLightShielded = [];
    this.isBehindWall = undefined;
  }
}
