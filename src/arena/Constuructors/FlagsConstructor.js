/**
 * Класс флагов
 */
class FlagsConstructors {
  /**
   * Конструктор обьект флагов
   */
  constructor() {
    /** @type {{initiator: string, val: number}[]} */
    this.isProtected = [];
    this.isGlitched = {};
    /** @type {{initiator: string, val: number}[]} */
    this.isSilenced = [];
    this.isDead = {};
    /** @type {{initiator: string, val: number}[]} */
    this.isHealed = [];
    this.isHited = {};
    this.isKicked = '';
    this.isDodging = 0;
    this.isMad = false;
    this.isParalysed = false;
    return this;
  }

  /**
   * Обнуление флагов
   */
  refresh() {
    this.isProtected = [];
    this.isGlitched = {};
    this.isSilenced = [];
    this.isDead = {};
    this.isHealed = [];
    this.isHited = {};
    this.isDodging = 0;
    this.isMad = false;
    this.isParalysed = false;
    this.isHited = [];
  }
}

module.exports = FlagsConstructors;
