import type { Player } from '@/arena/PlayersService';
import type { CharacterClass, CharacterPublic, PlayerPerformance } from '@fwo/shared';
import { LadderModel } from '@/models/ladder';
import { CharacterService } from '@/arena/CharacterService';
import { sumBy } from 'es-toolkit';
import type PlayersService from '@/arena/PlayersService';
import type { RoundService } from '@/arena/RoundService';
import { toPublicObject } from '@/arena/CharacterService/utils/toPublicObject';
import { getCharactersByPSR } from '@/api/character';

export class LadderService {
  players: PlayersService;
  round: RoundService;
  gamePSR: number;
  static cachedLadderList: CharacterPublic[] | null = null;

  constructor(players: PlayersService, round: RoundService) {
    this.players = players;
    this.round = round;
    this.gamePSR = this.calculateGamePSR(players.players);
  }

  static async getLadderList() {
    if (this.cachedLadderList) {
      return this.cachedLadderList;
    }

    const characters = await getCharactersByPSR();
    const ladderList = characters.map(toPublicObject);
    this.cachedLadderList = ladderList;

    return ladderList;
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
      await LadderModel.averagePerformance(playerPSR, prof);
    const rounds = this.round.count;

    let basePSR = performance.winner ? 15 : -10;
    if (performance.alive) {
      basePSR += 2.5;
    } else {
      basePSR -= 2.5;
    }

    if (performance.kills) {
      basePSR += performance.kills / rounds - avgKillsPerRound;
    }

    if (performance.damage) {
      basePSR += (performance.damage / rounds - avgDamagePerRound) * 0.33;
    }

    if (performance.heal) {
      basePSR += (performance.heal / rounds - avgHealPerRound) * 0.33;
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

  async setPSRForPlayers() {
    await Promise.all(
      this.players.players.map(async (player) => {
        const psr = await this.calculatePSR(
          player.psr,
          player.prof,
          player.stats.collect.performance,
        );
        player.stats.addPsr(psr);
      }),
    );
  }

  async saveGameStats(): Promise<void> {
    try {
      await this.setPSRForPlayers();

      await LadderModel.create(
        this.players.players.map((player) => ({
          player: player.id,
          psr: player.stats.collect.psr,
          winner: player.performance.winner,
          alive: player.performance.alive,
          kills: player.performance.kills,
          damage: player.performance.damage,
          heal: player.performance.heal,
          rounds: this.round.count,
        })),
      );

      await Promise.all(
        this.players.players.map(async (player) => {
          const character = await CharacterService.getCharacterById(player.id);
          await character.performance.addGameStat(player.performance, player.stats.collect.psr);
        }),
      );

      LadderService.cachedLadderList = null;
    } catch (e) {
      console.error('saveGameStats error:: ', e);
    }
  }
}
