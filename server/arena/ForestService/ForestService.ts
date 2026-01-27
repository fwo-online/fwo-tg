import EventEmitter from 'node:events';
import {
  FOREST_EVENT_TIMEOUT,
  FOREST_MAX_EVENT_INTERVAL,
  FOREST_MAX_TIME,
  FOREST_MIN_EVENT_INTERVAL,
  ForestEventAction,
  type ForestEventResult,
  type ForestEventType,
  ForestState,
  type ForestStatus,
  keys,
} from '@fwo/shared';
import type { HydratedDocument } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { Player } from '@/arena/PlayersService';
import { createForestGame } from '@/helpers/gameHelper';
import { type Forest, type ForestEventData, ForestModel } from '@/models/forest';
import { getActionByType, getEventHandler, getRandomEvent } from './events';

const CHECK_INTERVAL = 1000; // Проверка каждую секунду

export class ForestService extends EventEmitter<{
  start: [forest: ForestService];
  event: [forest: ForestService, eventType: ForestEventType];
  eventResolved: [forest: ForestService, result: ForestEventResult];
  eventTimeout: [forest: ForestService];
  battleStart: [game: GameService];
  battleEnd: [game: GameService, victory: boolean];
  updateStatus: [status: ForestStatus];
  end: [forest: ForestService, reason: 'death' | 'maxTime' | 'exit'];
}> {
  private forest!: HydratedDocument<Forest>;
  currentEvent?: ForestEventData;
  private character!: CharacterService;
  player!: Player;
  private checkInterval?: Timer;
  private nextEventTime = 0; // Время до следующего события в миллисекундах
  currentGame?: GameService;
  timeInForest = 0;

  constructor(private playerId: string) {
    super();
  }

  static emitter = new EventEmitter<{ start: [ForestService] }>();

  get id() {
    return this.forest.id;
  }

  // get player() {
  //   return arena.characters[this.playerId];
  // }

  async createForest() {
    this.character = arena.characters[this.playerId];
    this.player = new Player(this.character);

    if (!this.character) {
      throw new Error(`Character ${this.playerId} not found`);
    }

    this.forest = await ForestModel.create({
      player: this.playerId,
      state: ForestState.Waiting,
      startedAt: new Date(),
    });

    console.debug('Forest debug:: create forest', this.id, 'for player', this.playerId);
    arena.forests[this.id] = this;

    // Установить forestId у персонажа
    this.character.forestID = this.id;

    ForestService.emitter.emit('start', this);
    this.emit('start', this);
    this.scheduleNextEvent();
    this.initHandlers();

    return this;
  }

  private scheduleNextEvent() {
    // Рандомное время до следующего события (5-30 секунд)
    const baseInterval = MiscService.randInt(FOREST_MIN_EVENT_INTERVAL, FOREST_MAX_EVENT_INTERVAL);

    // Увеличиваем интервал по мере прохождения времени (события становятся реже)
    const timeProgress = this.timeInForest / FOREST_MAX_TIME;
    const multiplier = 1 + timeProgress * 2; // От 1x до 3x
    this.nextEventTime = baseInterval * multiplier;

    console.debug(
      'Forest debug:: next event in',
      this.nextEventTime / 1000,
      'seconds',
      'progress:',
      `${(timeProgress * 100).toFixed(1)}%`,
    );
  }

  private async triggerRandomEvent() {
    // Проверяем, не истекло ли максимальное время
    if (this.timeInForest >= FOREST_MAX_TIME) {
      console.debug('Forest debug:: max time reached, ending forest');
      await this.endForest('maxTime');
      return;
    }

    // Проверяем, не слишком ли поздно для новых событий (последние 2 минуты)
    const timeLeft = FOREST_MAX_TIME - this.timeInForest;
    if (timeLeft < 2 * 60 * 1000) {
      // Последние 2 минуты - редкие события или вообще нет
      if (MiscService.chance(80)) {
        // 80% шанс что событие не произойдёт
        this.scheduleNextEvent();
        return;
      }
    }

    const eventType = getRandomEvent();
    await this.createEvent(eventType);
  }

  private async createEvent(eventType: ForestEventType) {
    console.debug('Forest debug:: creating event', eventType);

    this.currentEvent = {
      type: eventType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + FOREST_EVENT_TIMEOUT),
      resolved: false,
    };
    this.forest.state = ForestState.Event;
    await this.forest.save();

    this.emit('event', this, eventType);
    this.emitStatus();
  }

  async handleEventAction(action: ForestEventAction): Promise<ForestEventResult> {
    if (!this.currentEvent) {
      throw new Error('No current event');
    }

    if (this.forest.state !== ForestState.Event) {
      throw new Error('Not in event state');
    }

    if (new Date() > this.currentEvent.expiresAt) {
      throw new Error('Event expired');
    }

    const eventType = this.currentEvent.type;
    console.debug('Forest debug:: handling event action', eventType, action);

    const result = await getEventHandler(eventType)(action, this);

    // Сохраняем результат события
    this.currentEvent.resolved = true;
    this.currentEvent.action = action;
    this.currentEvent.result = JSON.stringify(result);
    this.forest.events.push(this.currentEvent);
    this.currentEvent = undefined;

    // Применяем награды (если есть и это не бой)
    if (result.reward && !result.startBattle) {
      await this.applyRewards(result.reward);
    }

    if (result.startBattle) {
      // Начинаем бой
      await this.startBattle();
    } else {
      this.forest.state = ForestState.Waiting;
      await this.forest.save();
      this.scheduleNextEvent();
    }

    this.emit('eventResolved', this, result);
    this.emitStatus();

    return result;
  }

  async startBattle() {
    console.debug('Forest debug:: starting battle');

    this.forest.state = ForestState.Battle;
    await this.forest.save();

    const game = await createForestGame(this);

    if (!game) {
      throw new Error('Failed to create forest game');
    }

    this.currentGame = game;
    this.character.gameId = game.info.id;

    game.on('end', async () => {
      await this.handleBattleEnd(game);
    });

    this.emit('battleStart', game);
  }

  async handleBattleEnd(game: GameService) {
    console.debug('Forest debug:: battle ended');

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

    console.debug('Forest debug:: event timeout');

    // Игрок прошёл мимо
    this.currentEvent.resolved = true;
    this.currentEvent.action = ForestEventAction.PassBy;
    this.currentEvent.result = JSON.stringify({ success: true, message: 'Прошёл мимо' });
    this.forest.events.push(this.currentEvent);
    this.currentEvent = undefined;
    this.forest.state = ForestState.Waiting;
    await this.forest.save();

    this.emit('eventTimeout', this);
    this.scheduleNextEvent();
    this.emitStatus();
  }

  private initHandlers() {
    this.checkInterval = setInterval(async () => {
      if (this.forest.state === ForestState.Waiting) {
        // Увеличиваем время в лесу
        this.timeInForest += CHECK_INTERVAL;
        await this.forest.save();

        // Уменьшаем время до следующего события
        this.nextEventTime -= CHECK_INTERVAL;

        if (this.nextEventTime <= 0) {
          await this.triggerRandomEvent();
        }

        // Проверяем максимальное время
        if (this.timeInForest >= FOREST_MAX_TIME) {
          await this.endForest('maxTime');
          return;
        }

        this.emitStatus();
      } else if (this.forest.state === ForestState.Event) {
        // Проверяем timeout события
        if (this.currentEvent && new Date() > this.currentEvent.expiresAt) {
          await this.handleEventTimeout();
        }
      }
    }, CHECK_INTERVAL);
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
      timeInForest: this.timeInForest,
    };
  }

  private emitStatus() {
    this.emit('updateStatus', this.getStatus());
  }

  async exitForest() {
    console.debug('Forest debug:: player exit forest');
    await this.endForest('exit');
  }

  async endForest(reason: 'death' | 'maxTime' | 'exit') {
    console.debug('Forest debug:: ending forest', reason);

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

    if (reason === 'death') {
      // Блокируем лес на 4 часа
      const FOUR_HOURS = 4 * 60 * 60 * 1000;
      this.character.forestBlockedUntil = new Date(Date.now() + FOUR_HOURS);
      this.character.forestAvailable = false;
    }

    await this.character.saveToDb();

    delete arena.forests?.[this.id];

    this.emit('end', this, reason);
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
