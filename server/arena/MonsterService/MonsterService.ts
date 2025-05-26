import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import PlayerService from '@/arena/PlayersService/PlayerService';
import type { Char } from '@/models/character';
import { CharacterClass, type MonsterType } from '@fwo/shared';
import { Types } from 'mongoose';

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
    param: MonsterParams,
    type: MonsterType,
    AIClass: new (monster: MonsterService) => MonsterAI,
  ) {
    const monster = new CharacterService({
      ...param,
      _id: new Types.ObjectId(),
      owner: param.id,
      birthday: new Date(),
      prof: CharacterClass.Warrior,
      exp: 0,
      gold: 0,
      psr: 0,
      free: 0,
      bonus: 0,
      sex: 'm',
      penalty: [],
      expLimit: { earn: 0, expiresAt: new Date() },
      deleted: false,
      components: new Map(),
      lastFight: null,
      statistics: {
        games: 0,
        kills: 0,
        death: 0,
        runs: 0,
        wins: 0,
      },
    });

    arena.characters[monster.id] = monster;

    return new MonsterService(monster, type, AIClass);
  }
}
