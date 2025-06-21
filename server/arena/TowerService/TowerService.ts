import EventEmitter from 'node:events';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { createAlpha } from '@/arena/MonsterService/monsters/alpha';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { createTowerGame } from '@/helpers/gameHelper';
import { sumBy } from 'es-toolkit';

const timeout = 30 * 1000; // 30s
const time = timeout * 20; // 10m

export class TowerService extends EventEmitter<{
  start: [tower: TowerService];
  battleStart: [game: GameService, isBoss: boolean];
  battleEnd: [game: GameService, victory: boolean];
  end: [];
}> {
  id: string;
  players: string[];
  currentGame?: GameService;
  checkInterval?: Timer;
  timeSpent: number;
  startedAt: number;

  constructor(players: string[]) {
    super();
    this.id = `tower_${Date.now()}`;
    this.players = players;
    this.timeSpent = 0;
    this.startedAt = Date.now();
  }

  static emitter = new EventEmitter<{ start: [TowerService] }>();

  async createTower() {
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
    const game = await createTowerGame(this.players, isBoss);

    if (!game) {
      throw new Error('Failed to create game');
    }

    const averagePlayersLvl = Math.round(
      sumBy(game.players.nonBotPlayers, ({ lvl }) => lvl) / game.players.nonBotPlayers.length,
    );
    if (isBoss) {
      const bossLvl = Math.round(averagePlayersLvl * (game.players.nonBotPlayers.length * 0.75));
      const boss = await createAlpha(bossLvl);

      game.players.add(boss);
    } else {
      const monsterLvl = Math.round(averagePlayersLvl * (game.players.nonBotPlayers.length * 0.5));
      const monster = await createWolf(monsterLvl);

      game.players.add(monster);
    }

    this.currentGame = game;

    game.on('end', () => {
      const win = game.players.aliveNonBotPlayers.length > 0;
      this.handleBattleEnd(game, isBoss, win);
    });

    this.emit('battleStart', game, isBoss);
  }

  async handleBattleEnd(game: GameService, wasBossBattle: boolean, win: boolean) {
    this.currentGame = undefined;

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
      const timeLeft = time - this.timeSpent;

      if (timeLeft <= 0) {
        clearInterval(this.checkInterval);
        await this.startFight(true);
        return;
      }

      if (MiscService.dice('1d100') >= 80) {
        clearInterval(this.checkInterval);
        await this.startFight(false);
      }
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
