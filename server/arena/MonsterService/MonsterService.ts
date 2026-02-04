import { MonsterType } from '@fwo/shared';
import arena from '@/arena';
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

  protected orderAttack(
    game: GameService,
    target: PlayerService,
    proc = this.monster.proc,
  ): boolean {
    try {
      game.orders.orderAction({
        action: 'attack',
        initiator: this.monster.id,
        target: target.id,
        proc,
      });
      return true;
    } catch {
      return false;
    }
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

  // Lazy-load monster creators to avoid circular dependency at module load time
  static createByType(type: MonsterType | undefined, lvl: number) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const monsters = require('./monsters');
    switch (type) {
      case MonsterType.Skeleton:
        return monsters.createSkeleton(lvl);
      case MonsterType.Ghost:
        return monsters.createGhost(lvl);
      case MonsterType.Spirit:
        return monsters.createSpirit(lvl);
      case MonsterType.Elemental:
        return monsters.createElemental(lvl);
      case MonsterType.Spider:
        return monsters.createSpider(lvl);
      default:
        return monsters.createWolf(lvl);
    }
  }

  static isMonster(player: PlayerService): player is MonsterService {
    return player.isBot;
  }
}
