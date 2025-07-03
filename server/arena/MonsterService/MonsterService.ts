import type { MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { type ActionKey, ActionService } from '@/arena/ActionService';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import { stubParams } from '@/arena/MonsterService/utils/stubParams';
import PlayerService from '@/arena/PlayersService/PlayerService';
import type { Char } from '@/models/character';

/**
 * Monster Service
 * @description Класс для создание монстра
 * @module Service/Monster
 */

export abstract class MonsterAI {
  monster: MonsterService;
  constructor(monster: MonsterService) {
    this.monster = monster;
  }

  abstract makeOrder(game: GameService): void;

  protected orderRegeneration(game: GameService) {
    game.orders.orderAction({
      initiator: this.monster.id,
      target: this.monster.id,
      action: 'regeneration',
      proc: this.monster.proc,
    });
  }
}

export type MonsterParams = Pick<
  Char,
  | 'nickname'
  | 'harks'
  | 'magics'
  | 'skills'
  | 'passiveSkills'
  | 'items'
  | 'equipment'
  | 'exp'
  | 'prof'
>;

export class MonsterService extends PlayerService {
  type: MonsterType;
  ai: MonsterAI;

  private constructor(
    params: CharacterService,
    type: MonsterType,
    AIClass: new (monster: MonsterService) => MonsterAI,
  ) {
    super(params, true);

    this.type = type;
    this.ai = new AIClass(this);
  }

  static create(
    params: MonsterParams,
    type: MonsterType,
    AIClass: new (monster: MonsterService) => MonsterAI,
  ): MonsterService {
    const monster = new CharacterService(stubParams(params), true);
    arena.characters[monster.id] = monster;

    return new MonsterService(monster, type, AIClass);
  }

  static isMonster(player: PlayerService): player is MonsterService {
    return player.isBot;
  }

  checkCost(action: ActionKey) {
    if (ActionService.isMagicAction(action)) {
      const cost = arena.magics[action].cost;
      return this.stats.val(arena.magics[action].costType) >= cost;
    }

    if (ActionService.isSkillAction(action)) {
      const cost = arena.skills[action].cost[this.skills[action] - 1];
      return this.stats.val(arena.skills[action].costType) >= cost;
    }

    return false;
  }
}
