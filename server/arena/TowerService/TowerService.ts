import EventEmitter from 'node:events';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { createAlpha } from '@/arena/MonsterService/monsters/alpha';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import type { Player } from '@/arena/PlayersService';
import { createTowerGame } from '@/helpers/gameHelper';
import { ClanModel } from '@/models/clan';
import { Types } from 'mongoose';

const timeout = 10 * 500; // 10s
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

  lvl: number;
  init: string[];
  currentGame?: GameService;
  checkInterval?: Timer;

  constructor(init: string[], lvl: number) {
    super();
    this.id = `tower_${Date.now()}`;
    this.init = init;
    this.lvl = lvl;
  }

  static emitter = new EventEmitter<{ start: [TowerService] }>();

  get characters() {
    return this.init.map((id) => arena.characters[id]);
  }

  createTower() {
    console.debug('Tower debug:: create tower', this.id);
    arena.towers[this.id] = this;

    this.characters.forEach((character) => {
      character.towerID = this.id;
      character.gameId = this.id;
    });

    TowerService.emitter.emit('start', this);
    this.emit('start', this);
    this.initHandlers();
    return this;
  }

  getMonsterLvl(isBoss: boolean) {
    if (isBoss) {
      return Math.max(this.lvl * 5, 15);
    }

    return Math.round(Math.max(this.lvl * 2.5 + 1 * this.battlesCount, 10));
  }

  createMonster(isBoss: boolean) {
    const game = this.currentGame;

    if (!game) {
      throw new Error('Failed to create monster');
    }

    const maxPlayerLvl = game.players.nonBotPlayers.reduce((max, { lvl }) => Math.max(lvl, max), 0);
    console.debug('Tower debug:: max player lvl', maxPlayerLvl);
    if (isBoss) {
      const boss = createAlpha(this.getMonsterLvl(true));

      game.addPlayers([boss]);
    } else {
      const monster = createWolf(this.getMonsterLvl(false));

      game.addPlayers([monster]);
    }
  }

  async startFight(isBoss = false) {
    console.debug('Tower debug:: start game: boss', isBoss);
    const game = await createTowerGame(this.init, isBoss);

    if (!game) {
      throw new Error('Failed to create game');
    }

    const clan = new ClanModel({ owner: new Types.ObjectId(), name: 'Путники' });

    game.players.nonBotPlayers.forEach((player) => {
      player.clan = clan;
    });

    this.battlesCount++;
    this.currentGame = game;

    this.createMonster(isBoss);

    game.on('end', () => {
      this.handleBattleEnd(game, isBoss, game.players.aliveNonBotPlayers);
    });

    game.on('endRound', ({ dead }) => {
      this.sortDead(dead);
    });

    this.emit('battleStart', game, isBoss);
  }

  async handleBattleEnd(game: GameService, wasBossBattle: boolean, alivePlayers: Player[]) {
    this.currentGame = undefined;
    this.init = alivePlayers.map(({ id }) => id);
    const win = alivePlayers.length > 0;

    console.debug('Tower debug:: battle end', 'win:', win, 'boss:', wasBossBattle);
    this.emit('battleEnd', game, win);

    if (wasBossBattle || !win) {
      await this.endTower();
    } else {
      this.initHandlers();
    }
  }

  resetTowerIds(characters: CharacterService[]) {
    characters.forEach((character) => {
      character.towerID = '';
      character.lastTower = new Date();
      void character.saveToDb();
    });
  }

  sortDead(dead: Player[]) {
    this.init = this.init.filter((id) => dead.some((player) => player.id === id));
    this.resetTowerIds(dead.map(({ id }) => arena.characters[id]));
  }

  initHandlers() {
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

      if (MiscService.dice('1d100') >= 93) {
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
    this.characters.forEach((character) => {
      character.towerID = '';
      character.lastTower = new Date();
      void character.saveToDb();
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
