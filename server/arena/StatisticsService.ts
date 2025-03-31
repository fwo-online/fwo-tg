import type PlayersService from '@/arena/PlayersService';
import { differenceBy, mapValues } from 'es-toolkit';
import { reservedClanName } from '@fwo/shared';
import { getRandomComponent } from '@/utils/getRandomComponent';
import { CharacterService } from '@/arena/CharacterService';
import type { Player } from '@/arena/PlayersService';

export class StatisticsService {
  players: PlayersService;

  constructor(players: PlayersService) {
    this.players = players;
  }

  private getGoldForGame() {
    return this.players.deadPlayers.length ? 5 : 1;
  }

  private getWinners() {
    const aliveByClan = this.players.groupByClan(this.players.alivePlayers);
    const winnersByClan = mapValues(aliveByClan, (players, clan) => {
      if (clan !== reservedClanName) {
        return this.players.getPlayersByClan(players?.[0].clan?.id); // все союзники считаются победителями
      }
      return players ?? [];
    });

    return Object.values(winnersByClan).flat();
  }

  private getLosers(winners: Player[]) {
    return differenceBy(this.players.players, winners, ({ id }) => id);
  }

  private giveWinnerRewards(winners: Player[]) {
    const goldForGame = this.getGoldForGame();

    winners.forEach((winner) => {
      winner.stats.addGold(goldForGame);
      winner.stats.addComponent(getRandomComponent(60));
    });
  }

  private giveLoserRewards(losers: Player[]) {
    losers.forEach((loser) => {
      loser.stats.addComponent(getRandomComponent(20));
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

  giveRewards() {
    const winners = this.getWinners();
    const losers = this.getLosers(winners);
    this.giveGoldForKill();
    this.giveWinnerRewards(winners);
    this.giveLoserRewards(losers);

    const playersByClan = this.players.groupByClan();
    const winnerIDs = new Set(winners.map(({ id }) => id));

    return mapValues(playersByClan, (players) =>
      players?.map((player) => ({
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
   * @todo нужен общий метод сохраняющий всю статистику
   */
  async saveRewards() {
    try {
      await Promise.all(
        this.players.players.map(async (player) => {
          const char = await CharacterService.getCharacterById(player.id);

          await char.resources.addResources({
            gold: player.stats.collect.gold,
            exp: player.stats.collect.exp,
            components: player.stats.collect.component
              ? { [player.stats.collect.component]: 1 }
              : undefined,
          });

          await char.addGameStat({
            games: 1,
            death: player.alive ? 0 : 1,
            kills: this.players.getKills(player.id).length,
          });
        }),
      );
    } catch (e) {
      console.log('Game:', e);
    }
  }
}
