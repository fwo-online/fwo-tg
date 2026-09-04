import EventEmitter from 'node:events';
import { monstersClanName, playersClanName, TowerState } from '@fwo/shared';
import { times } from 'es-toolkit/compat';
import { type HydratedDocument, Types } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { createAlpha } from '@/arena/MonsterService/monsters/alpha';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import type { Player } from '@/arena/PlayersService';
import { createTowerGame } from '@/helpers/gameHelper';
import { ClanModel } from '@/models/clan';
import { type Tower, TowerModel } from '@/models/tower';

const timeout = 2 * 1000; // 2s
const timeLeft = 120 * 1000; // 60s;

export class TowerService extends EventEmitter<{
  start: [tower: TowerService];
  battleStart: [game: GameService, isBoss: boolean];
  battleEnd: [game: GameService, victory: boolean];
  updateTime: [timeSpent: number, timeLeft: number];
  end: [tower: TowerService, win: boolean];
}> {
  timeSpent = 0;
  timeLeft = timeLeft;
  battlesCount = 0;
  private tower!: HydratedDocument<Tower>;

  lvl: number;
  init: string[];
  currentGame?: GameService;
  state: TowerState;
  accepted = new Set<string>();
  checkInterval?: Timer;

  constructor(init: string[], lvl: number) {
    super();
    this.init = init;
    this.lvl = lvl;
    this.state = TowerState.Waiting;
  }

  static emitter = new EventEmitter<{
    start: [TowerService];
    end: [tower: TowerService, win: boolean];
  }>();

  get id() {
    return this.tower.id;
  }

  get characters() {
    return this.init.map((id) => arena.characters[id]);
  }

  async createTower() {
    this.tower = await TowerModel.create({ players: this.init, lvl: this.lvl });
    console.debug('Tower debug:: create tower', this.id, this.lvl);
    arena.towers[this.id] = this;

    this.characters.forEach((character) => {
      character.towerID = this.id;
    });

    TowerService.emitter.emit('start', this);
    this.emit('start', this);
    this.startCountdownTimer();
    return this;
  }

  getMonsterLvl(isBoss: boolean) {
    const random = MiscService.randInt(-1, 2);
    if (isBoss) {
      return 10 + this.lvl * 15 + random;
    }

    return this.lvl * 10 + random;
  }

  createBoss(game: GameService) {
    const boss = createAlpha(this.getMonsterLvl(true));

    game.addPlayers([boss]);
  }

  getMonstersCount() {
    if (this.battlesCount === 1) {
      return Math.max(3, Math.ceil(this.init.length / 2));
    }

    if (this.battlesCount === 2) {
      return Math.max(5, this.init.length - 1);
    }

    return Math.max(3, Math.ceil(this.init.length / 2));
  }

  createMonsters(game: GameService) {
    const count = this.getMonstersCount();
    const wolfs = times(count).map((i) => createWolf(this.getMonsterLvl(false), i + 1));
    game.addPlayers(wolfs);
  }

  createPlayersClan(game: GameService) {
    const clan = new ClanModel({
      owner: new Types.ObjectId(),
      name: playersClanName,
    });

    game.players.nonBotPlayers.forEach((player) => {
      player.clan = clan;
      clan.players.push(arena.characters[player.id].charObj);
    });
  }

  createMonstersClan(game: GameService) {
    const clan = new ClanModel({
      owner: new Types.ObjectId(),
      name: monstersClanName,
    });

    game.players.botPlayers.forEach((monster) => {
      monster.clan = clan;
      clan.players.push(arena.characters[monster.id].charObj);
    });
  }

  async startFight(isBoss = false) {
    console.debug('Tower debug:: start game: boss', isBoss);
    const game = await createTowerGame(this, isBoss);

    if (!game) {
      throw new Error('Failed to create game');
    }

    this.accepted.clear();
    this.battlesCount++;
    this.currentGame = game;
    this.state = TowerState.Battle;

    if (isBoss) {
      this.createBoss(game);
      this.createMonsters(game);
    } else {
      this.createMonsters(game);
    }

    this.createPlayersClan(game);
    this.createMonstersClan(game);

    game.on('end', () => {
      this.handleBattleEnd(
        game,
        isBoss,
        game.players.aliveNonBotPlayers,
        game.players.aliveBotPlayers,
      );
    });

    game.on('endRound', ({ dead }) => {
      this.sortDead(dead);
    });

    game.on('kick', ({ player }) => {
      this.sortDead([player]);
    });

    this.emit('battleStart', game, isBoss);
  }

  async handleBattleEnd(
    game: GameService,
    wasBossBattle: boolean,
    alivePlayers: Player[],
    aliveMonsters: Player[],
  ) {
    this.currentGame = undefined;
    this.init = alivePlayers.map(({ id }) => id);
    const win = alivePlayers.length > 0 && aliveMonsters.length === 0;

    console.debug('Tower debug:: battle end', 'win:', win, 'boss:', wasBossBattle);
    this.emit('battleEnd', game, win);

    this.resetMonsters(game);

    if (wasBossBattle || !win) {
      await this.endTower(win);
    } else {
      this.state = TowerState.Waiting;
      this.startCountdownTimer();
    }
  }

  resetMonsters(game: GameService) {
    game.players.botPlayers.forEach(({ id }) => delete arena.characters[id]);
  }

  resetTowerIds(characters: CharacterService[], lose = true) {
    characters.forEach((character) => {
      character.towerID = '';
      character.lastTower = new Date();
      if (lose) {
        character.towerAvailable = false;
      }
      void character.saveToDb();
    });
  }

  sortDead(dead: Player[]) {
    const nonBotDead = dead.filter(({ isBot }) => !isBot);
    this.init = this.init.filter((id) => nonBotDead.some((player) => player.id === id));
    this.resetTowerIds(nonBotDead.map(({ id }) => arena.characters[id]));
  }

  async handleAcceptNext(character: CharacterService, accept: boolean) {
    if (accept) {
      this.accepted.add(character.id);
      await this.checkStartFight();
    } else {
      this.accepted.delete(character.id);
    }
  }

  async checkStartFight(force = false) {
    if (!force && this.accepted.size !== this.init.length) {
      return;
    }

    if (this.state !== TowerState.Waiting) {
      return;
    }

    clearInterval(this.checkInterval);
    await this.startFight(this.battlesCount > 2);
  }

  startCountdownTimer() {
    this.checkInterval = setInterval(async () => {
      this.timeSpent += timeout;
      this.timeLeft -= timeout;
      console.debug('Tower debug:: time left:', this.timeLeft, 'time spent:', this.timeSpent);

      if (this.timeLeft <= 0) {
        clearInterval(this.checkInterval);
        await this.checkStartFight(true);
      } else {
        this.emit('updateTime', this.timeSpent, this.timeLeft);
      }
    }, timeout);
  }

  async endTower(win: boolean) {
    this.resetTowerIds(this.characters, !win);

    this.state = TowerState.Finished;
    this.tower.win = win;
    this.tower.ended = true;
    await this.tower.save();

    delete arena.towers?.[this.id];

    TowerService.emitter.emit('end', this, win);
    this.emit('end', this, win);
    this.removeAllListeners();
  }

  static async getTowerByCharacterID(characterID: string): Promise<TowerService | undefined> {
    const char = await CharacterService.getCharacterById(characterID);
    if (char?.towerID) {
      return arena.towers[char.towerID];
    }
    return undefined;
  }
}
