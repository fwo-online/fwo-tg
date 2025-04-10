import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import type { Char } from '@/models/character';
import { LadderModel } from '@/models/ladder';
import type { PlayerPerformance } from '@fwo/shared';

export class CharacterPerformance {
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
    return structuredClone(this.charObj.statistics);
  }

  async addGameStat(performance: PlayerPerformance, psr: number) {
    this.charObj.statistics.games += 1;

    if (!performance.alive) {
      this.charObj.statistics.death += 1;
    }
    if (performance.kills) {
      this.charObj.statistics.kills += 1;
    }

    this.charObj.psr = Math.max(0, psr);

    await this.character.saveToDb();
  }

  async addGameRun() {
    this.charObj.statistics.games += 1;
    this.charObj.statistics.runs += 1;
    this.charObj.psr = Math.max(0, this.charObj.psr - 15);

    await this.character.saveToDb();
  }

  async getAveragePerformance() {
    return await LadderModel.averagePerformance(this.psr, this.charObj.prof);
  }
}
