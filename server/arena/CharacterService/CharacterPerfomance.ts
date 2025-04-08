import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import type { Char } from '@/models/character';
import { forEach } from 'es-toolkit/compat';

export class CharacterPerfomance {
  character: CharacterService;
  private charObj: Char;

  constructor(character: CharacterService) {
    this.character = character;
    this.charObj = character.charObj;
  }

  get psr() {
    return this.charObj.psr;
  }

  get statistics() {
    return this.charObj.statistics;
  }

  async addGameStat(stat: Partial<Char['statistics']>, psr: number) {
    forEach(stat, (val, key) => {
      this.charObj.statistics[key] += val ?? 0;
    });

    this.charObj.psr = psr;

    this.character.saveToDb();
  }
}
