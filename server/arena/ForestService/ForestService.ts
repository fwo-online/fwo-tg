import EventEmitter from 'node:events';
import {
  FOREST_EVENT_INTERVALS,
  FOREST_EVENT_PER_PHASE,
  FOREST_EVENT_TIMEOUT,
  FOREST_MAX_EVENTS,
  ForestEventAction,
  type ForestEventResult,
  type ForestEventType,
  ForestPhase,
  ForestState,
  type ForestStatus,
  type GameResult,
  keys,
} from '@fwo/shared';
import type { HydratedDocument } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { Player } from '@/arena/PlayersService';
import { deathEcho } from '@/arena/passiveSkills';
import { type Forest, type ForestEventData, ForestModel } from '@/models/forest';
import { getActionByType, getEventHandler, getRandomEvent } from './events';

const CHECK_INTERVAL = 2000; // Проверка каждую секунду

export class ForestService extends EventEmitter<{
  start: [forest: ForestService];
  event: [forest: ForestService, eventType: ForestEventType];
  eventResolved: [forest: ForestService, result: ForestEventResult];
  battleStart: [game: GameService];
  battleEnd: [game: GameService, victory: boolean];
  updateStatus: [status: ForestStatus];
  end: [forest: ForestService, reason: 'death' | 'maxTime' | 'exit', result: GameResult];
}> {
  forest!: HydratedDocument<Forest>;
  currentEvent?: ForestEventData;
  character!: CharacterService;
  player!: Player;
  private checkInterval?: Timer;
  private nextEventTime = 0; // Время до следующего события в миллисекундах
  currentGame?: GameService;
  escaping = false;
  debuffLevel = 0;

  constructor(private playerId: string) {
    super();
  }

  static emitter = new EventEmitter<{ start: [ForestService] }>();

  get id() {
    return this.forest.id;
  }

  getPhase(): ForestPhase {
    const eventsCount = this.getEventsCount();
    if (eventsCount < FOREST_EVENT_PER_PHASE) {
      return ForestPhase.Edge;
    }
    if (eventsCount < FOREST_EVENT_PER_PHASE * 2) {
      return ForestPhase.Wilds;
    }

    return ForestPhase.Deep;
  }

  private getEventsCount() {
    return this.forest.events.length;
  }

  // get player() {
  //   return arena.characters[this.playerId];
  // }

  /** Повышает шанс в зависимости от уровня лесного дебаффа */
  checkEventChance(chance: number) {
    if (this.debuffLevel) {
      return MiscService.chance(chance + deathEcho.chance[this.debuffLevel - 1] / 100);
    }

    return MiscService.chance(chance);
  }

  async createForest() {
    this.character = arena.characters[this.playerId];
    this.player = new Player(this.character);
    this.applyForestDebuff();

    if (!this.character) {
      throw new Error(`Character ${this.playerId} not found`);
    }

    this.forest = await ForestModel.create({
      player: this.playerId,
      state: ForestState.Waiting,
    });

    console.debug(`Forest debug:: ${this.id} create forest for player ${this.playerId}`);
    arena.forests[this.id] = this;

    // Установить forestId у персонажа
    this.character.forestID = this.id;

    ForestService.emitter.emit('start', this);
    this.emit('start', this);
    this.scheduleNextEvent();
    this.initHandlers();

    return this;
  }

  private applyForestDebuff() {
    const penalties = this.character.getPenalties('forest_death');
    this.debuffLevel = Math.min(penalties.length, deathEcho.effect.length);

    if (this.debuffLevel) {
      this.player.passiveSkills[deathEcho.name] = this.debuffLevel;
      deathEcho.cast(this.player);
    }
  }

  private scheduleNextEvent() {
    const phase = this.getPhase();
    const interval = FOREST_EVENT_INTERVALS[phase];
    this.nextEventTime = MiscService.randInt(interval.min, interval.max);

    console.debug(
      `Forest debug:: ${this.id} next event in ${(this.nextEventTime / 1000).toFixed()} seconds`,
    );
  }

  private async triggerRandomEvent() {
    const eventType = getRandomEvent(this.getPhase());
    await this.createEvent(eventType);
  }

  async createEvent(eventType: ForestEventType) {
    console.debug(`Forest debug:: ${this.id} creating event ${eventType}`);

    this.currentEvent = {
      type: eventType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + FOREST_EVENT_TIMEOUT),
      resolved: false,
      escaping: this.escaping,
    };
    this.forest.state = ForestState.Event;
    await this.forest.save();

    this.emit('event', this, eventType);
    this.emitStatus();
  }

  async handleEventAction(action: ForestEventAction): Promise<ForestEventResult> {
    if (!this.currentEvent) {
      throw new ValidationError('Нет активного события');
    }

    if (this.forest.state !== ForestState.Event) {
      throw new ValidationError('Не в состоянии события');
    }

    const eventType = this.currentEvent.type;
    console.debug(`Forest debug:: ${this.id} handling event action ${eventType} ${action}`);

    const handleEvent = getEventHandler(eventType);
    const result = await handleEvent(action, this);

    // Сохраняем результат события
    this.forest.events.push({
      ...this.currentEvent,
      action: action,
      result: JSON.stringify(result),
    });
    this.currentEvent = undefined;

    if (this.forest.state === ForestState.Event) {
      this.forest.state = ForestState.Waiting;
    }

    if (result.reward) {
      await this.applyRewards(result.reward);
    }

    if (result.resolved) {
      this.scheduleNextEvent();
    }

    this.emit('eventResolved', this, result);
    this.emitStatus();

    return result;
  }

  async startBattle(game: GameService, reward: Partial<GameResult>) {
    console.debug(`Forest debug:: ${this.id} starting battle`);

    this.forest.state = ForestState.Battle;
    await this.forest.save();

    this.currentGame = game;
    this.character.gameId = game.info.id;

    game.on('end', async () => {
      await this.handleBattleEnd(game, reward);
    });

    setTimeout(() => {
      this.emit('battleStart', game);
    }, 3000);
  }

  async handleBattleEnd(game: GameService, reward: Partial<GameResult>) {
    console.debug(`Forest debug:: ${this.id} battle ended`);

    this.currentGame = undefined;
    this.character.gameId = '';

    const playerAlive = game.players.aliveNonBotPlayers.some((p) => p.id === this.playerId);

    // Обновляем HP игрока после боя
    const player = game.players.getById(this.playerId);
    if (player) {
      await this.forest.save();
    }

    this.emit('battleEnd', game, playerAlive);

    if (!playerAlive) {
      // Игрок умер
      await this.endForest('death');
    } else {
      await this.applyRewards(reward);
      // Игрок выжил, увеличиваем счётчик побед
      this.forest.battlesWon++;
      this.forest.state = ForestState.Waiting;
      await this.forest.save();
      this.scheduleNextEvent();
      this.emitStatus();
    }
  }

  private async applyRewards(reward: ForestEventResult['reward']) {
    if (!reward) return;

    // Применяем компоненты
    if (reward.components) {
      for (const component of keys(reward.components)) {
        const amount = reward.components[component] ?? 0;
        if (amount > 0) {
          this.player.stats.addComponent(component, amount);
        }
      }
    }

    // Применяем золото
    if (reward.gold) {
      this.player.stats.addGold(reward.gold);
    }

    // Применяем HP
    if (reward.hp) {
      this.player.stats.up('hp', reward.hp);

      // Проверка на смерть
      if (this.player.stats.val('hp') <= 0) {
        await this.endForest('death');
        return;
      }
    }

    await this.forest.save();
  }

  async handleEventTimeout() {
    if (!this.currentEvent) return;

    console.debug(`Forest debug:: ${this.id} event timeout`);

    // Игрок прошёл мимо
    this.handleEventAction(ForestEventAction.PassBy);
  }

  private initHandlers() {
    this.checkInterval = setInterval(() => this.tick(), CHECK_INTERVAL);
  }

  tick() {
    switch (this.forest.state) {
      case ForestState.Waiting:
        this.tickWaiting();
        break;
      case ForestState.Event:
        this.tickEvent();
        break;
    }
  }

  async tickWaiting() {
    // Уменьшаем время до следующего события
    this.nextEventTime -= CHECK_INTERVAL;

    if (this.nextEventTime <= 0) {
      const isEnd = this.checkEndForest();

      if (!isEnd) {
        await this.triggerRandomEvent();
      }
    }

    this.emitStatus();
  }

  private checkEndForest() {
    const eventsCount = this.getEventsCount();
    if (eventsCount > FOREST_MAX_EVENTS) {
      console.debug(`Forest debug:: ${this.id} max time reached, ending forest`);
      this.endForest('maxTime');
      return true;
    }

    if (this.escaping) {
      const escapingEvents = this.forest.events.filter(({ escaping }) => escaping);

      if (escapingEvents.length) {
        this.endForest('exit');
        return true;
      }
    }

    return false;
  }

  async tickEvent() {
    // Проверяем timeout события
    if (this.currentEvent && new Date() > this.currentEvent.expiresAt) {
      await this.handleEventTimeout();
    }
  }

  getStatus(): ForestStatus {
    return {
      id: this.id,
      playerId: this.playerId,
      state: this.forest.state,
      currentEvent: this.currentEvent
        ? {
            type: this.currentEvent.type,
            availableActions: getActionByType(this.currentEvent.type),
            expiresAt: this.currentEvent.expiresAt,
          }
        : undefined,
      status: this.player.getStatus(),
      phase: this.getPhase(),
      escaping: this.escaping,
    };
  }

  private emitStatus() {
    this.emit('updateStatus', this.getStatus());
  }

  async exitForest() {
    console.debug(`Forest debug:: ${this.id} player exit forest`);
    this.escaping = true;

    this.scheduleNextEvent();
    this.emitStatus();
    // await this.endForest('exit');
  }

  pauseForest() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  resumeForest() {
    this.currentEvent = undefined;
    this.forest.state = ForestState.Waiting;
    this.scheduleNextEvent();
  }

  async endForest(reason: 'death' | 'maxTime' | 'exit') {
    if (this.forest.state === ForestState.Finished) {
      return;
    }

    console.debug(`Forest debug:: ${this.id} ending forest`, reason);

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    this.forest.state = ForestState.Finished;
    this.forest.ended = true;
    await this.forest.save();

    // Обновляем персонажа
    this.character.forestID = '';
    this.character.lastForest = new Date();

    const winner = reason !== 'death';

    if (!winner) {
      await this.character.updatePenalty('forest_death', 60);
    }

    const gold = winner ? this.player.stats.collect.gold : 0;
    const components = winner ? this.player.stats.collect.components : {};
    const exp = this.player.stats.collect.exp;

    await this.character.resources.addResources({ gold, exp, components });

    const result: GameResult = {
      player: this.player.toObject(),
      exp,
      gold,
      components,
      winner,
    };

    delete arena.forests?.[this.id];

    this.emit('end', this, reason, result);
    this.removeAllListeners();
  }

  static isPlayerInForest(playerId: string): boolean {
    const char = arena.characters[playerId];
    return Boolean(char?.forestID);
  }

  static async getForestByCharacterId(characterId: string): Promise<ForestService | undefined> {
    const char = await CharacterService.getCharacterById(characterId);
    if (char?.forestID) {
      return arena.forests[char.forestID];
    }
    return undefined;
  }
}
