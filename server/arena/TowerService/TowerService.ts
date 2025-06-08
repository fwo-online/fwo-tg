import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import EventEmitter from 'node:events';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { createTowerGame } from '@/helpers/gameHelper';

export enum TowerStatus {
  WAITING = 'WAITING',
  BATTLE = 'BATTLE',
  BOSS_BATTLE = 'BOSS_BATTLE',
  FINISHED = 'FINISHED',
}

const timeout = 30 * 1000;
const time = timeout * 20;

export class TowerService extends EventEmitter<{
  start: [tower: TowerService];
  battleStart: [game: GameService, isBoss: boolean];
  battleEnd: [game: GameService, victory: boolean];
  finish: [];
}> {
  id: string;
  players: string[];
  status: TowerStatus = TowerStatus.WAITING;
  currentGame?: GameService;
  checkInterval?: Timer;
  timeSpent: number;

  constructor(players: string[]) {
    super();
    this.id = `tower_${Date.now()}`;
    this.players = players;
    this.timeSpent = 0;
  }

  async createTower() {
    arena.towers[this.id] = this;

    this.players.forEach((playerId) => {
      const char = arena.characters[playerId];
      if (char) {
        char.towerID = this.id;
        char.gameId = this.id;
      }
    });

    this.emit('start', this);
    await this.initHandlers();
  }

  async startFight(isBoss = false) {
    this.status = isBoss ? TowerStatus.BOSS_BATTLE : TowerStatus.BATTLE;

    const monsterLevel = isBoss ? 30 : MiscService.randInt(10, 20);
    const monster = await createWolf(monsterLevel);

    const game = await createTowerGame(this.players, isBoss);

    if (!game) {
      throw new Error('Failed to create game');
    }

    game.players.add(monster);

    this.currentGame = game;

    game.on('startOrders', () => {
      monster.ai.makeOrder(game);
    });

    game.on('end', () => {
      const win = game.players.aliveNonBotPlayers.length > 0;
      this.handleBattleEnd(game, isBoss, win);
    });

    this.emit('battleStart', game, isBoss);
  }

  async giveReward() {
    //...
  }

  async handleBattleEnd(game: GameService, wasBossBattle: boolean, win: boolean) {
    if (win) {
      await this.giveReward();
    }

    this.status = TowerStatus.WAITING;
    this.currentGame = undefined;

    this.emit('battleEnd', game, win);

    if (wasBossBattle || !win) {
      await this.finish();
    }
  }

  async initHandlers() {
    this.checkInterval = setInterval(async () => {
      this.timeSpent += timeout;
      const timeLeft = time - this.timeSpent;

      if (timeLeft <= 0) {
        clearInterval(this.checkInterval);
        await this.startFight(true);
        return;
      }

      if (MiscService.dice('1d100') <= 10) {
        clearInterval(this.checkInterval);
        await this.startFight(false);
      }
    }, timeout); // 30 секунд
  }

  async finish() {
    if (this.status === TowerStatus.FINISHED) {
      return;
    }

    this.status = TowerStatus.FINISHED;
    this.players.forEach((playerId) => {
      const char = arena.characters[playerId];
      if (char) {
        char.towerID = '';
        char.gameId = '';
      }
    });

    delete arena.towers?.[this.id];

    this.emit('finish');
  }

  static isPlayerInTower(playerId: string): boolean {
    const char = arena.characters[playerId];
    return Boolean(char?.towerID);
  }

  static async getTowerByCharacterID(characterID: string): Promise<TowerService | undefined> {
    const char = await CharacterService.getCharacterById(characterID);
    if (char?.towerID) {
      return arena.towers[char.towerID];
    }
    return undefined;
  }
}
