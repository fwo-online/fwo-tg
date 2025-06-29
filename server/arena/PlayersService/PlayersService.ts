import { reservedClanName } from '@fwo/shared';
import { keyBy } from 'lodash';
import Player from './PlayerService';

export default class PlayersService {
  init: string[];
  private list: Record<string, Player>;
  /**
   * Конструктор объекта
   * @param init [charId,charId,...]
   */
  constructor(init: string[]) {
    this.init = init;

    const players = init.map(Player.load);
    this.list = keyBy(players, ({ id }) => id);
  }

  get players(): Player[] {
    return Object.values(this.list);
  }

  get alivePlayers(): Player[] {
    return this.players.filter(({ alive }) => alive);
  }

  get deadPlayers(): Player[] {
    return this.players.filter(({ alive }) => !alive);
  }

  get botPlayers(): Player[] {
    return this.players.filter(({ isBot }) => isBot);
  }

  get nonBotPlayers(): Player[] {
    return this.players.filter(({ isBot }) => !isBot);
  }

  get aliveBotPlayers(): Player[] {
    return this.botPlayers.filter(({ alive }) => alive);
  }

  get aliveNonBotPlayers(): Player[] {
    return this.nonBotPlayers.filter(({ alive }) => alive);
  }

  getById(id: string): Player | undefined {
    return this.list[id];
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param clan объект клана
   */
  getMyTeam(id: string): Player[] {
    const player = this.getById(id);
    if (!player?.clan) {
      return [];
    }
    return this.players.filter((p) => p.clan?.id === player.clan?.id);
  }

  getAliveAllies(player: Player) {
    if (player.clan) {
      return this.alivePlayers.filter((p) => p.clan?.id === player.clan?.id && p.id !== player.id);
    }
    return [];
  }

  getAliveEnemies(player: Player) {
    if (player.clan) {
      return this.alivePlayers.filter((p) => p.clan?.id !== player.clan?.id);
    }
    return this.alivePlayers.filter((p) => p.id !== player.id);
  }

  getPlayersByClan(clanId: string | undefined): Player[] {
    if (!clanId) {
      return this.players.filter((player) => !player.clan);
    }
    return this.players.filter((player) => player.clan?.id === clanId);
  }

  /**
   * Функция возвращает рандомного игрока из массива живых
   * @return
   */
  get randomAlive(): Player {
    const alive = this.alivePlayers;
    return alive[Math.floor(Math.random() * alive.length)];
  }

  groupByClan(players = this.players) {
    return Object.groupBy(players, ({ clan }) => clan?.name || reservedClanName);
  }

  /**
   * Сбрасываем всем игрокам кол-во доступных процентов на 100
   */
  reset() {
    this.players.forEach((player) => player.reset());
  }

  sortDead(): Player[] {
    const dead: Player[] = [];
    this.players.forEach((player) => {
      if (player.stats.val('hp') <= 0 && player.alive) {
        dead.push(player);
        player.setDead();
      }
    });

    return dead;
  }

  getKills(id: string): Player[] {
    return this.players.filter((player) => player.getKiller() === id);
  }

  kick(id: string) {
    delete this.list[id];
  }

  add(player: Player) {
    this.list[player.id] = player;
  }
}
