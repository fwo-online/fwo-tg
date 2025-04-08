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

    let basePSR = performance.winner ? 50 : -50;
    if (performance.alive) {
      basePSR += 5;
    }

    if (performance.kills) {
      basePSR += Math.max((performance.kills - averagePerformance.kills) * 3, 0);
    }

    if (performance.damage) {
      basePSR += Math.max(performance.damage - averagePerformance.damage, 0);
    }

    if (performance.heal) {
      basePSR += Math.max(performance.heal - averagePerformance.heal, 0);
    }

    if (!performance.alive) {
      basePSR = Math.min(basePSR, -25);
    }

    basePSR *= Math.max(1 - round * 0.05, 0.5);

    console.log(
      'PSR:: ',
      Math.round(basePSR),
      'game PSR::',
      Math.round(gamePSR),
      'total PSR::',
      Math.round(basePSR * (gamePSR / playerPSR)),
    );
    return Math.round(playerPSR + basePSR * (gamePSR / playerPSR));
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

        await characters.perfomance.addGameStat(
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
