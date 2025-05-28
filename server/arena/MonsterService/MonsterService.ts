import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import { stubParams } from '@/arena/MonsterService/utils/stubParams';
import PlayerService from '@/arena/PlayersService/PlayerService';
import type { Char } from '@/models/character';
import type { MonsterType } from '@fwo/shared';

/**
 * Monster Service
 * @description Класс для создание монстра
 * @module Service/Monster
 * @todo Это нерабочий модуль, только прототип
 */

export abstract class MonsterAI {
  monster: MonsterService;
  constructor(monster: MonsterService) {
    this.monster = monster;
  }

  abstract makeOrder(game: GameService): void;
}

export type MonsterParams = Pick<
  Char,
  'id' | 'nickname' | 'harks' | 'magics' | 'skills' | 'passiveSkills' | 'items' | 'equipment'
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
  ) {
    const monster = new CharacterService(stubParams(params));

    arena.characters[monster.id] = monster;

    return new MonsterService(monster, type, AIClass);
  }
}
