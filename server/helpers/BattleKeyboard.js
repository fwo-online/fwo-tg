const { Markup } = require('telegraf');
const { default: arena } = require('../arena');
const { Magic } = require('../arena/Constuructors/MagicConstructor');
const { Skill } = require('../arena/Constuructors/SkillConstructor');

class BattleKeyboard {
  /**
   * @param {import ('../arena/PlayersService').Player} player
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
  setRepeatButton(hidden = false) {
    return [Markup.button.callback(
      '🔁 Повторить',
      'action_repeat',
      hidden
      || this.player.proc !== 100
      || this.game.round.count === 1
      || !this.game.orders.checkPlayerOrderLastRound(this.player.id),
    )];
  }

  /**
   * @private
   */
  setResetButton(hidden = false) {
    return [Markup.button.callback(
      '↩️ Очистить заказ',
      'action_reset',
      hidden || this.player.proc === 100,
    )];
  }

  setActions() {
    if (this.checkAttackOrder()) {
      this.concat(arena.actions.attack);
    }

    if (this.checkProtectOrder()) {
      this.concat(arena.actions.protect);
    }

    this.concat(arena.actions.regeneration);
    this.concat(arena.actions.handsHeal);

    return this;
  }

  /**
   * @private
   * @param {boolean} ignoreFavorites
   */
  getPlayerMagics(ignoreFavorites) {
    if (ignoreFavorites || !this.player.favoriteMagics.length) {
      return Object.keys(this.player.magics);
    }
    return this.player.favoriteMagics;
  }

  /** @param {boolean} ignoreFavorites */
  setMagics(ignoreFavorites = false) {
    if (!/m|p/.test(this.player.prof)) return this;

    const magicsSet = new Set(this.getPlayerMagics(ignoreFavorites));

    const playerMagics = Object.values(arena.magics)
      .filter((magic) => magicsSet.has(magic.name) && this.player.magics[magic.name]);

    if (this.checkMagicOrder(playerMagics)) {
      this.concat(playerMagics);
    }

    return this;
  }

  /**
   * @private
   */
  setAllMagicsButton(hidden = false) {
    return [
      Markup.button.callback(
        'Все магии',
        'all_magics',
        hidden || !/m|p/.test(this.player.prof) || !this.player.favoriteMagics.length,
      ),
    ];
  }

  setSkills() {
    if (/m|p/.test(this.player.prof)) return this;

    const playerSkills = Object.values(arena.skills)
      .filter((skill) => this.player.skills[skill.name] && this.checkSkillOrder(skill));
    this.concat(playerSkills);
    return this;
  }

  render(hideAdditionalButtons = false) {
    return [...this.keyboard
      .map((action) => {
        const button = (text) => [Markup.button.callback(text, `action_${action.name}`, this.player.proc === 0)];

        if (action instanceof Skill) {
          const skillLvl = this.player.skills[action.name] - 1;
          return button(`${action.displayName} (${action.proc}%  🔋${action.cost[skillLvl]})`);
        }
        if (action instanceof Magic) {
          return button(`${action.displayName} (💧${action.cost})`);
        }
        return button(`${action.displayName}`);
      }),
    this.setAllMagicsButton(hideAdditionalButtons),
    this.setRepeatButton(hideAdditionalButtons),
    this.setResetButton(hideAdditionalButtons)];
  }
}

module.exports = BattleKeyboard;
