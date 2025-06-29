import { type GameResult, ItemComponent, reservedClanName } from '@fwo/shared';
import { differenceBy, mapValues, noop, shuffle } from 'es-toolkit';
import { times } from 'lodash';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import type { HistoryService } from '@/arena/HistoryService';
import { ItemService } from '@/arena/ItemService';
import type PlayersService from '@/arena/PlayersService';
import type { Player } from '@/arena/PlayersService';
import type { TowerService } from '@/arena/TowerService/TowerService';
import { getRandomComponent } from '@/utils/getRandomComponent';

export type RewardServiceFactory = (game: GameService) => RewardService;

export abstract class RewardService {
  players: PlayersService;
  history: HistoryService;

  constructor(game: GameService) {
    this.players = game.players;
    this.history = game.history;
  }

  protected getGoldForGame() {
    return this.players.deadPlayers.length ? 5 : 1;
  }

  protected getWinners() {
    const aliveByClan = this.players.groupByClan(this.players.aliveNonBotPlayers);
    const winnersByClan = mapValues(aliveByClan, (players, clan) => {
      if (clan !== reservedClanName) {
        return this.players.getPlayersByClan(players?.[0].clan?.id); // все союзники считаются победителями
      }
      return players ?? [];
    });

    return Object.values(winnersByClan).flat();
  }

  protected getLosers(winners: Player[]) {
    return differenceBy(this.players.nonBotPlayers, winners, ({ id }) => id);
  }

  protected abstract giveWinnerRewards(winners: Player[]): MaybePromise<void>;
  protected abstract giveLoserRewards(losers: Player[]): MaybePromise<void>;

  protected giveGoldForKill(): void {
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
    await this.giveWinnerRewards(winners);
    await this.giveLoserRewards(losers);

    await this.saveRewards();

    return this.getStatistics(winners, losers);
  }

  getStatistics(winners: Player[], _losers: Player[]): GameResult[] {
    const winnerIDs = new Set(winners.map(({ id }) => id));
    return this.players.nonBotPlayers.map<GameResult>((player) => ({
      player: player.toObject(),
      exp: player.stats.collect.exp,
      gold: player.stats.collect.gold,
      components: player.stats.collect.components,
      item: player.stats.collect.item,
      winner: winnerIDs.has(player.id),
    }));
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
            components: player.stats.collect.components,
          });
        }),
      );
    } catch (e) {
      console.error('save revards error:: ', e);
    }
  }
}

export class LadderRewardService extends RewardService {
  protected giveWinnerRewards(winners: Player[]) {
    const goldForGame = this.getGoldForGame();

    winners.forEach((winner) => {
      winner.stats.addGold(goldForGame);
      winner.stats.addComponent(getRandomComponent(15));
    });
  }

  protected giveLoserRewards(_losers: Player[]) {
    // проигравшие не получают ничего
  }
}

export class TowerRewardService extends RewardService {
  protected isBoss: boolean;
  protected tower: TowerService;

  constructor(game: GameService, tower: TowerService, isBoss: boolean) {
    super(game);
    this.tower = tower;
    this.isBoss = isBoss;
  }

  protected async giveWinnerRewards(winners: Player[]) {
    const goldForGame = this.getGoldForGame();

    try {
      winners.forEach((winner) => {
        winner.stats.addGold(goldForGame);
        times(this.tower.battlesCount * this.tower.lvl, () =>
          winner.stats.addComponent(getRandomComponent(45)),
        );
      });

      if (this.isBoss) {
        shuffle(winners)
          .splice(0, this.tower.lvl * 2)
          .forEach((winner) => winner.stats.addComponent(ItemComponent.Arcanite));

        await Promise.all(
          shuffle(winners)
            .splice(0, this.tower.lvl * 2)
            .map(async (winner) => {
              const character = await CharacterService.getCharacterById(winner.id);
              const item = await ItemService.createRandomItem({
                createdBy: character.charObj,
                filter: ({ price }) =>
                  price > this.tower.lvl * 1000 && price < this.tower.lvl * 2000,
              });
              await character.inventory.addItem(item.toObject());
              winner.stats.addItem(item);
            }),
        );
      }
    } catch (e) {
      console.error('giveWinnerRewards::', e);
    }
  }

  protected giveLoserRewards(_losers: Player[]) {
    noop();
  }
}
