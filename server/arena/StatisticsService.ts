import type PlayersService from '@/arena/PlayersService';
import { differenceBy, mapValues } from 'es-toolkit';
import { reservedClanName } from '@fwo/shared';
import { getRandomComponent } from '@/utils/getRandomComponent';
import { CharacterService } from '@/arena/CharacterService';
import type { Player } from '@/arena/PlayersService';
import type { HistoryService } from '@/arena/HistoryService';
import type GameService from '@/arena/GameService';

export class StatisticsService {
  players: PlayersService;
  history: HistoryService;

  constructor(game: GameService) {
    this.players = game.players;
    this.history = game.history;
  }

  private getGoldForGame() {
    return this.players.deadPlayers.length ? 5 : 1;
  }

  private getWinners() {
    const aliveByClan = this.players.groupByClan(this.players.aliveNonBotPlayers);
    const winnersByClan = mapValues(aliveByClan, (players, clan) => {
      if (clan !== reservedClanName) {
        return this.players.getPlayersByClan(players?.[0].clan?.id); // все союзники считаются победителями
      }
      return players ?? [];
    });

    return Object.values(winnersByClan).flat();
  }

  private getLosers(winners: Player[]) {
    return differenceBy(this.players.nonBotPlayers, winners, ({ id }) => id);
  }

  private giveWinnerRewards(winners: Player[]) {
    const goldForGame = this.getGoldForGame();

    winners.forEach((winner) => {
      winner.stats.addGold(goldForGame);
      winner.stats.addComponent(getRandomComponent(45));
    });
  }

  private giveLoserRewards(losers: Player[]) {
    losers.forEach((loser) => {
      loser.stats.addComponent(getRandomComponent(15));
    });
  }

  private giveGoldForKill(): void {
    this.players.deadPlayers.forEach((player) => {
      const killer = this.players.getById(player.getKiller());
      if (killer && killer.id !== player.id) {
        killer.stats.addGold(3 * player.lvl);
      }
    });
  }

  async giveRewards(draw: boolean) {
    const winners = draw ? [] : this.getWinners();
    const losers = this.getLosers(winners);
    this.giveGoldForKill();
    this.giveWinnerRewards(winners);
    this.giveLoserRewards(losers);
    this.setPerfomance(winners, losers);

    await this.saveRewards();

    return this.getStatistics(winners, losers);
  }

  async setPerfomance(winners: Player[], _losers: Player[]) {
    const playersPerformance = this.history.getPlayersPerformance();
    const winnerIDs = new Set(winners.map(({ id }) => id));

    this.players.nonBotPlayers.forEach((player) => {
      player.stats.addPerformance({
        ...(playersPerformance[player.id] ?? { damage: 0, heal: 0 }),
        alive: player.alive,
        kills: this.players.getKills(player.id).length,
        winner: winnerIDs.has(player.id),
      });
    });
  }

  getStatistics(winners: Player[], _losers: Player[]) {
    const playersByClan = this.players.groupByClan(this.players.nonBotPlayers);
    const winnerIDs = new Set(winners.map(({ id }) => id));

    return mapValues(playersByClan, (players) =>
      players?.map((player) => ({
        id: player.id,
        nick: player.nick,
        exp: player.stats.collect.exp,
        gold: player.stats.collect.gold,
        component: player.stats.collect.component,
        winner: winnerIDs.has(player.id),
      })),
    );
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   */
  async saveRewards() {
    try {
      await Promise.all(
        this.players.nonBotPlayers.map(async (player) => {
          const char = await CharacterService.getCharacterById(player.id);

          await char.resources.addResources({
            gold: player.stats.collect.gold,
            exp: player.stats.collect.exp,
            components: player.stats.collect.component
              ? { [player.stats.collect.component]: 1 }
              : undefined,
          });
        }),
      );
    } catch (e) {
      console.error('save revards error:: ', e);
    }
  }
}
