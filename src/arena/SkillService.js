/**
 * Сервис работы с умениями
 * @typedef {import ('./Constuructors/SkillConstructor')} Skill
 * @typedef {import ('./CharacterService')} Char
 */
/** @type {Object.<string, Skill>} */
const skills = require('./skills');

module.exports = {
  skills,
  /**
   * @param {string} charId идентификатор персонажа
   * @param {string} skillId идентификатор умения
   */
  learn(charId, skillId) {
    const skill = this.skills[skillId];
    /** @type {Char} */
    const char = global.arena.players[charId];
    if (skill.lvl > char.bonus) {
      throw Error('Не хватает бонусов');
    }

    const charSkillLvl = char.skills[skillId] || 0;
    if (charSkillLvl + 1 >= skill.cost.length) {
      throw Error(`Умение ${skill.name} имеет максимальный уровень`);
    }

    char.bonus -= skill.lvl;
    char.learnSkill(skillId, charSkillLvl + 1);
    return {
      bonus: char.bonus,
      skills: char.skills,
    };
  },
  /**
   * Возвращает название и описание умения
   * @param {string} skillId идентификатор умения
   */
  show(skillId) {
    const { name, desc, lvl } = this.skills[skillId];
    return { name, desc, lvl };
  },
};
