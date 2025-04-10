import type { Player } from '@/arena/PlayersService';
import type { CharacterClass, PlayerPerformance } from '@fwo/shared';
import { LadderModel } from '@/models/ladder';
import { CharacterService } from '@/arena/CharacterService';
import { sumBy } from 'es-toolkit';
import type PlayersService from '@/arena/PlayersService';
import type { RoundService } from '@/arena/RoundService';

export class LadderService {
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
    performance: PlayerPerformance,
  ): Promise<number> {
    const { avgDamagePerRound, avgKillsPerRound, avgHealPerRound } =
      await LadderModel.averagePerfomance(playerPSR, prof);
    const rounds = this.round.count;

    let basePSR = performance.winner ? 15 : -10;
    if (performance.alive) {
      basePSR += 1;
    } else {
      basePSR -= 2;
    }

    if (performance.kills) {
      basePSR += performance.kills / rounds - avgKillsPerRound;
    }

    if (performance.damage) {
      basePSR += (performance.damage / rounds - avgDamagePerRound) * 0.5;
    }

    if (performance.heal) {
      basePSR += (performance.heal / rounds - avgHealPerRound) * 0.5;
    }

    if (!performance.alive) {
      basePSR = Math.min(basePSR, -10);
    }

    if (performance.winner) {
      basePSR *= Math.exp((1 - playerPSR / this.gamePSR) * 3);
    } else {
      basePSR *= Math.exp((1 - this.gamePSR / playerPSR) * 3);
    }

    basePSR *= Math.max(1 - Math.exp((rounds - 1) * 0.33) / 10, 0.3);
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

  async saveGameStats(playersPerfomance: Record<string, PlayerPerformance>): Promise<void> {
    try {
      await Promise.all(
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
              rounds: this.round.count,
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
        }),
      );
    } catch (e) {
      console.error('savePSR error:: ', e, { playersPerfomance });
    }
  }
}
