/**
 * Passive Skill Constructor
 * Конструктор для пассивных скилов.
 */
class PassiveSkill {
  /**
    * Создание скила
    * @params {pskill} params параметры создания нового скилла
    * @typedef {Object} skill
    * @property {String} name
    * @property {String} displayName
    * @property {String} description
    * @property {Array} chance
   */
  constructor(params) {
    this.name = params.name;
    this.displayName = params.displayName;
    this.description = params.description;
    this.chance = params.chance;
  }
}
module.exports = PassiveSkill;
