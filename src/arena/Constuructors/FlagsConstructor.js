/**
 * Класс флагов
 */
class FlagsConstructors {
  /**
   * Конструктор обьект флагов
   */
  constructor() {
    this.isProtected = [];
    this.isGlitched = {};
    this.isSilenced = [];
    this.isDead = '';
    this.isHealed = [];
    this.isHited = [];
    this.isKicked = false;
    return this;
  }

  /**
   * Обнуление флагов
   */
  refresh() {
    this.isProtected = [];
    this.isGlitched = {};
    this.isSilenced = [];
    this.isDead = '';
    this.isHealed = [];
    this.isHited = [];
  }
}

module.exports = FlagsConstructors;
