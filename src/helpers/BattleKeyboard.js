const Markup = require('telegraf/markup');
const Skill = require('../arena/Constuructors/SkillConstructor');
const arena = require('../arena');

class BattleKeyboard {
  /**
   * @param {import ('../arena/PlayerService')} player
   */
  constructor(player) {
    this.keyboard = [];
    this.player = player;

    this.game = arena.characters[player.id].currentGame;
    this.date = Date.now();
  }

  /** @private */
  concat(action) {
    this.keyboard = this.keyboard.concat(action);
  }

  /** @private */
  get orders() {
    return this.game.orders;
  }

  /**
   * @private
   * @todo добавить магу количество магий от spellLimit
   * @param {arena['magics'][]} magics
   */
  checkMagicOrder(magics) {
    return !magics.some((magic) => this.orders.checkPlayerOrder(this.player.id, magic.name));
  }

  /**
   * @private
   * @param {Skill} skill
   */
  checkSkillOrder(skill) {
    return !this.game.orders.checkPlayerOrder(this.player.id, skill.name);
  }

  /** @private */
  checkProtectOrder() {
    const maxTargets = /w/.test(this.player.prof) ? 2 : 1;
    return maxTargets > this.orders.getNumberOfOrder(this.player.id, arena.actions.protect.name);
  }

  /**
   * @private
   * @todo добавить лучнику количество целей от maxTargets
   */
  checkAttackOrder() {
    const maxTargets = arena.characters[this.player.id].def.maxTarget;
    return maxTargets > this.orders.getNumberOfOrder(this.player.id, arena.actions.attack.name);
  }

  /**
   * @private
   */
  setRepeatButton() {
    return [Markup.callbackButton(
      '🔁 Повторить',
      'action_repeat',
      this.player.proc !== 100
      || this.game.round.count === 1
      || !this.game.orders.checkPlayerOrderLastRound(this.player.id),
    )];
  }

  /**
   * @private
   */
  setResetButton() {
    return [Markup.callbackButton(
      '↩️ Очистить заказ',
      'action_reset',
      this.player.proc === 100,
    )];
  }

  setActions() {
    if (this.checkAttackOrder()) {
      this.concat(arena.actions.attack);
    }

    if (this.checkProtectOrder()) {
      this.concat(arena.actions.protect);
    }

    this.concat(arena.actions.regen);
    this.concat(arena.actions.handsHeal);

    return this;
  }

  setMagics() {
    if (!/m|p/.test(this.player.prof)) return this;

    const playerMagics = Object.values(arena.magics)
      .filter((magic) => this.player.magics[magic.name]);

    if (this.checkMagicOrder(playerMagics)) {
      this.concat(playerMagics);
    }

    return this;
  }

  setSkills() {
    if (/m|p/.test(this.player.prof)) return this;

    const playerSkills = Object.values(arena.skills)
      .filter((skill) => this.player.skills[skill.name] && this.checkSkillOrder(skill));
    this.concat(playerSkills);
    return this;
  }

  render() {
    return [...this.keyboard
      .map((action) => {
        if (action instanceof Skill) {
          return [Markup.callbackButton(`${action.displayName} (${action.proc}%)`, `action_${action.name}`, this.player.proc === 0)];
        }
        return [Markup.callbackButton(action.displayName, `action_${action.name}`, this.player.proc === 0)];
      }), this.setRepeatButton(), this.setResetButton()];
  }
}

module.exports = BattleKeyboard;
