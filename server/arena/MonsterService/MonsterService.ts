import { MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import type { MonsterAI } from '@/arena/MonsterService/MonsterAI';
import { stubParams } from '@/arena/MonsterService/utils/stubParams';
import PlayerService from '@/arena/PlayersService/PlayerService';
import type { Char } from '@/models/character';
import * as monsters from './monsters';

/**
 * Monster Service
 * @description Класс для создание монстра
 * @module Service/Monster
 */
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

  static createByType(type: MonsterType | undefined, lvl: number, budgetScale = 1) {
    switch (type) {
      case MonsterType.Skeleton:
        return monsters.createSkeleton(lvl, '', budgetScale);
      case MonsterType.Ghost:
        return monsters.createGhost(lvl, '', budgetScale);
      case MonsterType.Spirit:
        return monsters.createSpirit(lvl, '', budgetScale);
      case MonsterType.Elemental:
        return monsters.createElemental(lvl, '', budgetScale);
      case MonsterType.Spider:
        return monsters.createSpider(lvl, '', budgetScale);
      case MonsterType.Wolf:
        return monsters.createWolf(lvl, '', budgetScale);
      default:
        throw new ValidationError(`MonsterService:: unknown monster type: ${type}`);
    }
  }

  static isMonster(player: PlayerService): player is MonsterService {
    return player.isBot;
  }
}
