import EventEmitter from 'node:events';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { createAlpha } from '@/arena/MonsterService/monsters/alpha';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { createTowerGame } from '@/helpers/gameHelper';

const timeout = 10 * 1000; // 10s
const timeLeft = timeout * 48; // 8m;

export class TowerService extends EventEmitter<{
  start: [tower: TowerService];
  battleStart: [game: GameService, isBoss: boolean];
  battleEnd: [game: GameService, victory: boolean];
  updateTime: [timeSpent: number, timeLeft: number];
  end: [];
}> {
  id = `tower_${Date.now()}`;
  timeSpent = 0;
  timeLeft = timeLeft;
  battlesCount = 0;

  players: string[];
  currentGame?: GameService;
  checkInterval?: Timer;

  constructor(players: string[]) {
    super();
    this.id = `tower_${Date.now()}`;
    this.players = players;
  }

  static emitter = new EventEmitter<{ start: [TowerService] }>();

  async createTower() {
    console.debug('Tower debug:: create tower', this.id);
    arena.towers[this.id] = this;

    this.players.forEach((playerId) => {
      const char = arena.characters[playerId];
      if (char) {
        char.towerID = this.id;
        char.gameId = this.id;
      }
    });

    TowerService.emitter.emit('start', this);
    this.emit('start', this);
    await this.initHandlers();
    return this;
  }

  async startFight(isBoss = false) {
    console.debug('Tower debug:: start game: boss', isBoss);
    const game = await createTowerGame(this.players, isBoss);

    if (!game) {
      throw new Error('Failed to create game');
    }

    this.battlesCount++;

    const maxPlayerLvl = game.players.nonBotPlayers.reduce((max, { lvl }) => Math.max(lvl, max), 0);
    console.debug('Tower debug:: max player lvl', maxPlayerLvl);
    if (isBoss) {
      const bossLvl = Math.round(maxPlayerLvl * game.players.nonBotPlayers.length * 1.25);
      const boss = await createAlpha(bossLvl);

      game.players.add(boss);
    } else {
      const monsterLvl = Math.round(
        maxPlayerLvl * (game.players.nonBotPlayers.length * (0.33 + 0.2 * this.battlesCount)),
      );
      const monster = await createWolf(monsterLvl);

      game.players.add(monster);
    }

    this.currentGame = game;

    game.on('end', () => {
      const win = game.players.aliveNonBotPlayers.length > 0;
      this.handleBattleEnd(game, isBoss, win);
    });

    game.on('endRound', ({ dead }) => {
      dead.forEach((player) => {
        this.players.filter((id) => player.id !== id);
      });
    });

    this.emit('battleStart', game, isBoss);
  }

  async handleBattleEnd(game: GameService, wasBossBattle: boolean, win: boolean) {
    this.currentGame = undefined;

    console.debug('Tower debug:: battle end', 'win:', win, 'boss:', wasBossBattle);
    this.emit('battleEnd', game, win);

    if (wasBossBattle || !win) {
      await this.endTower();
    } else {
      this.initHandlers();
    }
  }

  async initHandlers() {
    this.checkInterval = setInterval(async () => {
      this.timeSpent += timeout;
      this.timeLeft -= timeout;
      console.debug('Tower debug:: time left:', this.timeLeft, 'time spent:', this.timeSpent);

      if (this.timeLeft <= 0) {
        clearInterval(this.checkInterval);
        await this.startFight(true);
        return;
      }

      if (this.battlesCount > 3) {
        this.emit('updateTime', this.timeSpent, this.timeLeft);
        return;
      }

      if (MiscService.dice('1d100') >= 95) {
        clearInterval(this.checkInterval);
        await this.startFight(false);
        return;
      }

      if (this.timeSpent > this.timeLeft && this.battlesCount === 0) {
        clearInterval(this.checkInterval);
        await this.startFight(false);
        return;
      }

      this.emit('updateTime', this.timeSpent, this.timeLeft);
    }, timeout);
  }

  async endTower() {
    this.players.forEach((playerId) => {
      const char = arena.characters[playerId];
      if (char) {
        char.towerID = '';
        char.gameId = '';
        char.lastTower = new Date();
        void char.saveToDb();
      }
    });

    delete arena.towers?.[this.id];

    this.emit('end');
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
