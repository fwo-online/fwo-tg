import type { Player } from './PlayersService';
import type { CharacterClass, PlayerPerfomance } from '@fwo/shared';
import { LadderModel } from '@/models/ladder';
import { CharacterService } from '@/arena/CharacterService';
import { sumBy } from 'es-toolkit';

export default class LadderService {
  static calculateGamePSR(players: Player[]): number {
    const totalMMR = sumBy(players, (player) => player.psr);
    return Math.round(totalMMR / players.length);
  }

  static async calculatePSR(
    playerPSR: number,
    prof: CharacterClass,
    gamePSR: number,
    performance: PlayerPerfomance,
    round: number,
  ): Promise<number> {
    const averagePerformance = await LadderModel.averagePerfomance(playerPSR, prof);

    let basePSR = performance.winner ? 10 : -10;
    if (performance.alive) {
      basePSR += 1;
    } else {
      basePSR -= 3;
    }

    if (performance.kills) {
      basePSR += performance.kills - averagePerformance.kills;
    }

    if (performance.damage) {
      basePSR += (performance.damage - averagePerformance.damage) * 0.25;
    }

    if (performance.heal) {
      basePSR += (performance.heal - averagePerformance.heal) * 0.25;
    }

    if (!performance.alive) {
      basePSR = Math.min(basePSR, -10);
    }

    if (performance.winner) {
      basePSR *= Math.exp((1 - playerPSR / gamePSR) * 3);
    } else {
      basePSR *= Math.exp((1 - gamePSR / playerPSR) * 3);
    }

    basePSR *= Math.max(1 - round * 0.05, 0.5);
    basePSR = Math.min(Math.max(basePSR, -50), 50);

    console.log(
      'player PSR::',
      Math.round(playerPSR),
      'base PSR::',
      Math.round(basePSR),
      'game PSR::',
      Math.round(gamePSR),
    );
    return Math.round(playerPSR + basePSR);
  }

  static async saveGameStats(
    playersPerfomance: Record<string, PlayerPerfomance>,
    players: Player[],
    round: number,
  ): Promise<void> {
    try {
      const gamePSR = this.calculateGamePSR(players);

      Object.entries(playersPerfomance).map(async ([id, perfomance]) => {
        const character = await CharacterService.getCharacterById(id);
        const psr = await this.calculatePSR(
          character.perfomance.psr,
          character.prof,
          gamePSR,
          perfomance,
          round,
        );

        await LadderModel.create([
          {
            player: id,
            psr,
            winner: perfomance.winner,
            alive: perfomance.alive,
            kills: perfomance.kills,
            damage: perfomance.damage,
            heal: perfomance.heal,
          },
        ]);

        await character.perfomance.addGameStat(
          {
            death: perfomance.alive ? 0 : 1,
            games: 1,
            kills: perfomance.kills,
            runs: 0,
          },
          psr,
        );
      });
    } catch (e) {
      console.log('savePSR error:: ', e);
    }
  }
}
