import arena from '@/arena';
import { ActionService } from '@/arena/ActionService';
import type { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export const getAvailableActions = (character: CharacterService) => {
  const game = new GameService([character.id]);
  if (!game) {
    throw new Error('game not found');
  }

  const player = game.players.getById(character.id);
  if (!player) {
    throw new Error('game not found');
  }

  return ActionsHelper.buildActions(player, game);
};

export abstract class ActionsHelper {
  static hasMagicOrder(player: Player, game: GameService, magicNames: string[]) {
    return !magicNames.some((magicName) => game.orders.checkPlayerOrder(player.id, magicName));
  }

  static hasSkillOrder(player: Player, game: GameService, skillName: string) {
    return game.orders.checkPlayerOrder(player.id, skillName);
  }

  static canProtect(player: Player, game: GameService) {
    const maxTargets = /w/.test(player.prof) ? 2 : 1;
    return maxTargets > game.orders.getNumberOfOrder(player.id, arena.actions.protect.name);
  }

  static canAttack(player: Player, game: GameService) {
    const maxTargets = player.stats.val('maxTarget');
    return maxTargets > game.orders.getNumberOfOrder(player.id, arena.actions.attack.name);
  }

  static getBasicActions(player: Player, game: GameService) {
    const actions: string[] = [];
    if (ActionsHelper.canAttack(player, game)) {
      actions.push(arena.actions.attack.name);
    }

    if (this.canProtect(player, game)) {
      actions.push(arena.actions.protect.name);
    }

    actions.push(arena.actions.regeneration.name);
    actions.push(arena.actions.handsHeal.name);

    return actions.map(ActionsHelper.formatAction).filter((action) => !!action);
  }

  static getPlayerMagics(player: Player) {
    const favoriteMagics = new Set(player.favoriteMagics);
    const magics = new Set(Object.keys(player.magics));

    return [...favoriteMagics, ...magics.difference(favoriteMagics)];
  }

  static getAvailableMagics(player: Player, game: GameService) {
    if (!/m|p/.test(player.prof)) return [];

    const magics = this.getPlayerMagics(player);

    if (this.hasMagicOrder(player, game, magics)) {
      return magics.map(ActionsHelper.formatAction).filter((action) => !!action);
    }

    return [];
  }

  static getAvailableSkills(player: Player, game: GameService) {
    if (/m|p/.test(player.prof)) return [];

    const skills = Object.keys(player.skills).filter(
      (skill) => !ActionsHelper.hasSkillOrder(player, game, skill),
    );

    return skills
      .map((skill) => ActionsHelper.formatAction(skill, player.getSkillLevel(skill)))
      .filter((action) => !!action);
  }

  static formatAction(action: string, lvl: number) {
    if (ActionService.isAction(action)) {
      return ActionService.toObject(action, lvl);
    }
  }

  static buildActions(player: Player, game: GameService) {
    const actions = this.getBasicActions(player, game);
    const magics = this.getAvailableMagics(player, game);
    const skills = this.getAvailableSkills(player, game);

    return { actions, magics, skills };
  }
}

export default ActionsHelper;
