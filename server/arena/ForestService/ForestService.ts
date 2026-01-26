import EventEmitter from 'node:events';
import {
  FOREST_EVENT_TIMEOUT,
  FOREST_MAX_EVENT_INTERVAL,
  FOREST_MAX_TIME,
  FOREST_MIN_EVENT_INTERVAL,
  ForestEventAction,
  type ForestEventResult,
  ForestEventType,
  ForestState,
  type ForestStatus,
} from '@fwo/shared';
import { type HydratedDocument } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { type Forest, type ForestEventData, ForestModel } from '@/models/forest';
import { createForestGame } from '@/helpers/gameHelper';

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
  private character!: CharacterService;
  private checkInterval?: Timer;
  private nextEventTime = 0; // Время до следующего события в миллисекундах
  currentGame?: GameService;

  constructor(private playerId: string) {
    super();
  }

  static emitter = new EventEmitter<{ start: [ForestService] }>();

  get id() {
    return this.forest.id;
  }

  get player() {
    return arena.characters[this.playerId];
  }

  async createForest() {
    this.character = arena.characters[this.playerId];
    if (!this.character) {
      throw new Error(`Character ${this.playerId} not found`);
    }

    const playerMaxHP = this.character.stats.val('base.hp');
    const playerHP = this.character.stats.val('hp');

    this.forest = await ForestModel.create({
      player: this.playerId,
      state: ForestState.Waiting,
      playerHP,
      playerMaxHP,
      startedAt: new Date(),
    });

    console.debug('Forest debug:: create forest', this.id, 'for player', this.playerId);
    arena.forests[this.id] = this;

    // Установить forestId у персонажа
    this.character.forestID = this.id;
    await this.character.saveToDb();

    ForestService.emitter.emit('start', this);
    this.emit('start', this);
    this.scheduleNextEvent();
    this.initHandlers();

    return this;
  }

  private scheduleNextEvent() {
    // Рандомное время до следующего события (5-30 секунд)
    const baseInterval = MiscService.randInt(
      FOREST_MIN_EVENT_INTERVAL,
      FOREST_MAX_EVENT_INTERVAL,
    );

    // Увеличиваем интервал по мере прохождения времени (события становятся реже)
    const timeProgress = this.forest.timeInForest / FOREST_MAX_TIME;
    const multiplier = 1 + timeProgress * 2; // От 1x до 3x
    this.nextEventTime = baseInterval * multiplier;

    console.debug(
      'Forest debug:: next event in',
      this.nextEventTime / 1000,
      'seconds',
      'progress:',
      (timeProgress * 100).toFixed(1) + '%',
    );
  }

  private async triggerRandomEvent() {
    // Проверяем, не истекло ли максимальное время
    if (this.forest.timeInForest >= FOREST_MAX_TIME) {
      console.debug('Forest debug:: max time reached, ending forest');
      await this.endForest('maxTime');
      return;
    }

    // Проверяем, не слишком ли поздно для новых событий (последние 2 минуты)
    const timeLeft = FOREST_MAX_TIME - this.forest.timeInForest;
    if (timeLeft < 2 * 60 * 1000) {
      // Последние 2 минуты - редкие события или вообще нет
      if (MiscService.chance(80)) {
        // 80% шанс что событие не произойдёт
        this.scheduleNextEvent();
        return;
      }
    }

    const eventType = this.selectRandomEvent();
    await this.createEvent(eventType);
  }

  private selectRandomEvent(): ForestEventType {
    const events = [
      { type: ForestEventType.Wolf, weight: 15 },
      { type: ForestEventType.FallenTree, weight: 20 },
      { type: ForestEventType.Chest, weight: 10 },
      { type: ForestEventType.Campfire, weight: 15 },
      { type: ForestEventType.AbandonedCamp, weight: 15 },
      { type: ForestEventType.OldTrap, weight: 10 },
      { type: ForestEventType.AbandonedSword, weight: 8 },
      { type: ForestEventType.GlowingCrystal, weight: 7 }, // Самое редкое
    ];

    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let random = MiscService.randInt(0, totalWeight);

    for (const event of events) {
      random -= event.weight;
      if (random <= 0) {
        return event.type;
      }
    }

    return ForestEventType.Wolf; // Fallback
  }

  private async createEvent(eventType: ForestEventType) {
    console.debug('Forest debug:: creating event', eventType);

    const expiresAt = new Date(Date.now() + FOREST_EVENT_TIMEOUT);
    const eventData: ForestEventData = {
      type: eventType,
      createdAt: new Date(),
      expiresAt,
      resolved: false,
    };

    this.forest.currentEvent = eventData;
    this.forest.state = ForestState.Event;
    this.forest.eventsEncountered++;
    this.forest.lastEventAt = new Date();
    await this.forest.save();

    this.emit('event', this, eventType);
    this.emitStatus();
  }

  async handleEventAction(action: ForestEventAction): Promise<ForestEventResult> {
    if (!this.forest.currentEvent) {
      throw new Error('No current event');
    }

    if (this.forest.state !== ForestState.Event) {
      throw new Error('Not in event state');
    }

    if (new Date() > this.forest.currentEvent.expiresAt) {
      throw new Error('Event expired');
    }

    const eventType = this.forest.currentEvent.type;
    console.debug('Forest debug:: handling event action', eventType, action);

    let result: ForestEventResult;

    // Обработка действия в зависимости от типа события
    switch (eventType) {
      case ForestEventType.Wolf:
        result = await this.handleWolfEvent(action);
        break;
      case ForestEventType.FallenTree:
        result = await this.handleFallenTreeEvent(action);
        break;
      case ForestEventType.Chest:
        result = await this.handleChestEvent(action);
        break;
      case ForestEventType.Campfire:
        result = await this.handleCampfireEvent(action);
        break;
      case ForestEventType.AbandonedCamp:
        result = await this.handleAbandonedCampEvent(action);
        break;
      case ForestEventType.OldTrap:
        result = await this.handleOldTrapEvent(action);
        break;
      case ForestEventType.AbandonedSword:
        result = await this.handleAbandonedSwordEvent(action);
        break;
      case ForestEventType.GlowingCrystal:
        result = await this.handleGlowingCrystalEvent(action);
        break;
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    // Сохраняем результат события
    this.forest.currentEvent.resolved = true;
    this.forest.currentEvent.action = action;
    this.forest.currentEvent.result = JSON.stringify(result);
    this.forest.events.push(this.forest.currentEvent);
    this.forest.currentEvent = undefined;

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

  private async handleWolfEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты осторожно прошёл мимо, не привлекая внимания.',
      };
    }

    if (action === ForestEventAction.Sneak) {
      // Проверка ловкости
      const playerDex = this.character.stats.val('harks.dex');
      const wolfLevel = this.character.lvl;
      const wolfDex = Math.round(wolfLevel * 1 + 10); // Формула из wolf.ts

      const sneakChance = playerDex / (playerDex + wolfDex);
      const success = Math.random() < sneakChance;

      if (success) {
        return {
          success: true,
          message: 'Ты бесшумно прокрался мимо волка!',
        };
      } else {
        return {
          success: false,
          message: 'Ты хрустнул веткой! Волк заметил тебя и атакует!',
          startBattle: true,
        };
      }
    }

    if (action === ForestEventAction.AttackWolf) {
      return {
        success: true,
        message: 'Ты решил атаковать волка!',
        startBattle: true,
      };
    }

    throw new Error(`Invalid action for wolf event: ${action}`);
  }

  private async handleFallenTreeEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо упавшего дерева.',
      };
    }

    if (action === ForestEventAction.ChopTree) {
      // Шанс появления паука (пока заглушка)
      const spiderChance = 0.3; // 30% шанс
      if (Math.random() < spiderChance) {
        return {
          success: false,
          message: 'Из дерева выполз огромный паук! (TODO: бой с пауком)',
          // startBattle: true, // Пока закомментировано, т.к. паука нет
        };
      }

      const woodAmount = MiscService.randInt(1, 2);
      return {
        success: true,
        message: `Ты разрубил дерево и получил ${woodAmount} досок!`,
        reward: {
          components: {
            wood: woodAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for fallen tree event: ${action}`);
  }

  private async handleChestEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо сундука.',
      };
    }

    if (action === ForestEventAction.OpenChest) {
      // Маленький шанс встретить сильного врага
      const enemyChance = 0.1; // 10% шанс
      if (Math.random() < enemyChance) {
        return {
          success: false,
          message: 'Из сундука вылетел злой дух! (TODO: бой с духом)',
          // startBattle: true, // Пока закомментировано
        };
      }

      // Награда по стандартной формуле (TODO: использовать RewardService)
      const goldAmount = MiscService.randInt(10, 50) * this.character.lvl;
      return {
        success: true,
        message: `Ты открыл сундук и нашёл ${goldAmount} золота!`,
        reward: {
          gold: goldAmount,
        },
      };
    }

    throw new Error(`Invalid action for chest event: ${action}`);
  }

  private async handleCampfireEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо костра.',
      };
    }

    if (action === ForestEventAction.Rest) {
      const healAmount = Math.floor(this.forest.playerMaxHP * 0.5); // 50% восстановления
      return {
        success: true,
        message: `Ты отдохнул у костра и восстановил ${healAmount} HP!`,
        reward: {
          hp: healAmount,
        },
      };
    }

    throw new Error(`Invalid action for campfire event: ${action}`);
  }

  private async handleAbandonedCampEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо заброшенного лагеря.',
      };
    }

    if (action === ForestEventAction.ScavengeCamp) {
      // Шанс появления паука/крыс
      const dangerChance = 0.25; // 25% шанс
      if (Math.random() < dangerChance) {
        return {
          success: false,
          message: 'Из палатки выскочил паук! (TODO: бой с пауком)',
          // startBattle: true,
        };
      }

      const fabricAmount = MiscService.randInt(1, 2);
      return {
        success: true,
        message: `Ты разобрал палатку и получил ${fabricAmount} ткани!`,
        reward: {
          components: {
            fabric: fabricAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for abandoned camp event: ${action}`);
  }

  private async handleOldTrapEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты осторожно обошёл старый капкан.',
      };
    }

    if (action === ForestEventAction.DisarmTrap) {
      // Шанс получить урон или встретить паука
      const failChance = 0.3; // 30% шанс
      if (Math.random() < failChance) {
        const damage = Math.floor(this.forest.playerMaxHP * 0.1); // 10% урона
        return {
          success: false,
          message: `Капкан сработал и нанёс тебе ${damage} урона!`,
          reward: {
            hp: -damage,
          },
        };
      }

      const ironAmount = MiscService.randInt(1, 2);
      return {
        success: true,
        message: `Ты разобрал капкан и получил ${ironAmount} железа!`,
        reward: {
          components: {
            iron: ironAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for old trap event: ${action}`);
  }

  private async handleAbandonedSwordEvent(action: ForestEventAction): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёl мимо заброшенного меча.',
      };
    }

    if (action === ForestEventAction.TakeSword) {
      // Шанс призрака
      const ghostChance = 0.2; // 20% шанс
      if (Math.random() < ghostChance) {
        return {
          success: false,
          message: 'Меч был проклят! Появился призрак владельца! (TODO: бой с призраком)',
          // startBattle: true,
        };
      }

      const steelAmount = MiscService.randInt(1, 2);
      return {
        success: true,
        message: `Ты забрал меч и получил ${steelAmount} стали!`,
        reward: {
          components: {
            steel: steelAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for abandoned sword event: ${action}`);
  }

  private async handleGlowingCrystalEvent(
    action: ForestEventAction,
  ): Promise<ForestEventResult> {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо мерцающего кристалла.',
      };
    }

    if (action === ForestEventAction.TakeCrystal) {
      // Шанс элементаля
      const elementalChance = 0.15; // 15% шанс
      if (Math.random() < elementalChance) {
        return {
          success: false,
          message: 'Кристалл охранял элементаль! (TODO: бой с элементалем)',
          // startBattle: true,
        };
      }

      const arcaniteAmount = 1; // Редкий ресурс, всегда 1
      return {
        success: true,
        message: `Ты забрал кристалл и получил ${arcaniteAmount} арканит!`,
        reward: {
          components: {
            arcanite: arcaniteAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for glowing crystal event: ${action}`);
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
    this.character.gameId = game.id;

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
      this.forest.playerHP = player.stats.val('hp');
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
      for (const [component, amount] of Object.entries(reward.components)) {
        if (amount > 0) {
          const current = this.character.components.get(component as any) || 0;
          this.character.components.set(component as any, current + amount);

          // Обновляем статистику леса
          this.forest.resourcesGathered[component] =
            (this.forest.resourcesGathered[component] || 0) + amount;
        }
      }
    }

    // Применяем золото
    if (reward.gold) {
      this.character.gold += reward.gold;
    }

    // Применяем HP
    if (reward.hp) {
      const newHP = Math.max(0, Math.min(this.forest.playerHP + reward.hp, this.forest.playerMaxHP));
      this.forest.playerHP = newHP;
      this.character.stats.change('hp', reward.hp);

      // Проверка на смерть
      if (newHP <= 0) {
        await this.endForest('death');
        return;
      }
    }

    await this.character.saveToDb();
    await this.forest.save();
  }

  async handleEventTimeout() {
    if (!this.forest.currentEvent) return;

    console.debug('Forest debug:: event timeout');

    // Игрок прошёл мимо
    this.forest.currentEvent.resolved = true;
    this.forest.currentEvent.action = ForestEventAction.PassBy;
    this.forest.currentEvent.result = JSON.stringify({ success: true, message: 'Прошёл мимо' });
    this.forest.events.push(this.forest.currentEvent);
    this.forest.currentEvent = undefined;
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
        this.forest.timeInForest += CHECK_INTERVAL;
        await this.forest.save();

        // Уменьшаем время до следующего события
        this.nextEventTime -= CHECK_INTERVAL;

        if (this.nextEventTime <= 0) {
          await this.triggerRandomEvent();
        }

        // Проверяем максимальное время
        if (this.forest.timeInForest >= FOREST_MAX_TIME) {
          await this.endForest('maxTime');
          return;
        }

        this.emitStatus();
      } else if (this.forest.state === ForestState.Event) {
        // Проверяем timeout события
        if (this.forest.currentEvent && new Date() > this.forest.currentEvent.expiresAt) {
          await this.handleEventTimeout();
        }
      }
    }, CHECK_INTERVAL);
  }

  private emitStatus() {
    const status: ForestStatus = {
      id: this.id,
      playerId: this.playerId,
      state: this.forest.state,
      currentEvent: this.forest.currentEvent
        ? {
            type: this.forest.currentEvent.type,
            availableActions: this.getAvailableActions(this.forest.currentEvent.type),
            expiresAt: this.forest.currentEvent.expiresAt,
          }
        : undefined,
      playerHP: this.forest.playerHP,
      playerMaxHP: this.forest.playerMaxHP,
      timeInForest: this.forest.timeInForest,
      eventsEncountered: this.forest.eventsEncountered,
    };

    this.emit('updateStatus', status);
  }

  private getAvailableActions(eventType: ForestEventType): ForestEventAction[] {
    const actions: ForestEventAction[] = [ForestEventAction.PassBy];

    switch (eventType) {
      case ForestEventType.Wolf:
        actions.push(ForestEventAction.Sneak, ForestEventAction.AttackWolf);
        break;
      case ForestEventType.FallenTree:
        actions.push(ForestEventAction.ChopTree);
        break;
      case ForestEventType.Chest:
        actions.push(ForestEventAction.OpenChest);
        break;
      case ForestEventType.Campfire:
        actions.push(ForestEventAction.Rest);
        break;
      case ForestEventType.AbandonedCamp:
        actions.push(ForestEventAction.ScavengeCamp);
        break;
      case ForestEventType.OldTrap:
        actions.push(ForestEventAction.DisarmTrap);
        break;
      case ForestEventType.AbandonedSword:
        actions.push(ForestEventAction.TakeSword);
        break;
      case ForestEventType.GlowingCrystal:
        actions.push(ForestEventAction.TakeCrystal);
        break;
    }

    return actions;
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
