import type PlayersService from '@/arena/PlayersService';
import { differenceBy, mapValues } from 'es-toolkit';
import { reservedClanName } from '@fwo/shared';
import { getRandomComponent } from '@/utils/getRandomComponent';
import { CharacterService } from '@/arena/CharacterService';

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
        return this.players.getPlayersByClan(clan);
      }
      return players ?? [];
    });

    return Object.values(winnersByClan).flat();
  }

  private getLosers() {
    return differenceBy(this.players.players, this.getWinners(), ({ id }) => id);
  }

  private giveWinnerRewards() {
    const winners = this.getWinners();
    const goldForGame = this.getGoldForGame();

    winners.forEach((winner) => {
      winner.stats.addGold(goldForGame);
      winner.stats.addComponent(getRandomComponent(60));
    });
  }

  private giveLoserRewards() {
    const losers = this.getLosers();

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
    this.giveGoldForKill();
    this.giveWinnerRewards();
    this.giveLoserRewards();

    const playersByClan = this.players.groupByClan();

    return mapValues(playersByClan, (players) =>
      players?.map((player) => ({
        nick: player.nick,
        exp: player.stats.collect.exp,
        gold: player.stats.collect.gold,
        component: player.stats.collect.component,
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
