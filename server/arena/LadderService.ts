import type { Player } from './PlayersService';
import type { CharacterClass, PlayerPerfomance } from '@fwo/shared';
import { LadderModel } from '@/models/ladder';
import { CharacterService } from '@/arena/CharacterService';
import { sumBy } from 'es-toolkit';
import type PlayersService from './PlayersService';
import type { RoundService } from '@/arena/RoundService';

export default class LadderService {
  players: PlayersService;
  round: RoundService;
  gamePSR: number;

  constructor(players: PlayersService, round: RoundService) {
    this.players = players;
    this.round = round;
    this.gamePSR = this.calculateGamePSR(players.players);
  }

  calculateGamePSR(players: Player[]): number {
    const totalMMR = sumBy(players, (player) => player.psr);
    return Math.round(totalMMR / players.length);
  }

  async calculatePSR(
    playerPSR: number,
    prof: CharacterClass,
    performance: PlayerPerfomance,
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
      basePSR *= Math.exp((1 - playerPSR / this.gamePSR) * 3);
    } else {
      basePSR *= Math.exp((1 - this.gamePSR / playerPSR) * 3);
    }

    basePSR *= Math.max(1 - this.round.count * 0.05, 0.5);
    basePSR = Math.min(Math.max(basePSR, -50), 50);

    console.debug(
      'player PSR::',
      Math.round(playerPSR),
      'base PSR::',
      Math.round(basePSR),
      'game PSR::',
      Math.round(this.gamePSR),
    );
    return Math.max(Math.round(playerPSR + basePSR), 0);
  }

  async saveGameStats(playersPerfomance: Record<string, PlayerPerfomance>): Promise<void> {
    try {
      Object.entries(playersPerfomance).map(async ([id, perfomance]) => {
        const character = await CharacterService.getCharacterById(id);
        const psr = await this.calculatePSR(character.perfomance.psr, character.prof, perfomance);

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
      console.error('savePSR error:: ', e);
    }
  }
}
