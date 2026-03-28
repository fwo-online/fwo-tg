import type { GameStatus } from '@/game';
import type { ItemComponent } from '@/item';

// Типы событий в лесу
export enum ForestEventType {
  Wolf = 'wolf', // Встреча с волком
  FallenTree = 'fallen_tree', // Упавшее дерево
  Chest = 'chest', // Спрятанный сундук
  Campfire = 'campfire', // Костёр для отдыха
  AbandonedCamp = 'abandoned_camp', // Заброшенный лагерь (fabric)
  OldTrap = 'old_trap', // Старый капкан (iron)
  AbandonedSword = 'abandoned_sword', // Заброшенный меч (steel)
  GlowingCrystal = 'glowing_crystal', // Мерцающий кристалл (arcanite)
  OtherPlayer = 'other_player', // Встреча другого игрока
}

// Состояния леса
export enum ForestState {
  Waiting = 'waiting', // Ожидание события
  Event = 'event', // Событие произошло, ждём ответа игрока
  Battle = 'battle', // Идёт бой
  Finished = 'finished', // Лес завершён
}

// Действия игрока на события
export enum ForestEventAction {
  // Общие
  PassBy = 'pass_by', // Пройти мимо

  // Волк
  AttackWolf = 'attack_wolf', // Атаковать волка
  Sneak = 'sneak', // Попытаться пройти незамеченным

  // Упавшее дерево
  ChopTree = 'chop_tree', // Разрубить дерево

  // Сундук
  OpenChest = 'open_chest', // Открыть сундук

  // Костёр
  Rest = 'rest', // Отдохнуть у костра

  // Заброшенный лагерь
  ScavengeCamp = 'scavenge_camp', // Разобрать лагерь

  // Старый капкан
  DisarmTrap = 'disarm_trap', // Разобрать капкан

  // Заброшенный меч
  TakeSword = 'take_sword', // Взять меч

  // Мерцающий кристалл
  TakeCrystal = 'take_crystal', // Взять кристалл

  // Другой игрок
  Attack = 'attack', // Атаковать другого игрока
}

// Результат события
export interface ForestEventResult {
  success: boolean;
  resolved: boolean;
  message: string;
  reward?: {
    exp?: number;
    components?: Partial<Record<ItemComponent, number>>;
    gold?: number;
    hp?: number; // Для костра и урона
  };
}

// Текущее событие
export interface ForestEvent {
  type: ForestEventType;
  availableActions: ForestEventAction[];
  expiresAt: Date; // Когда истекает время на ответ (30 сек)
}

// Статус леса для клиента
export interface ForestStatus {
  id: string;
  playerId: string;
  state: ForestState;
  currentEvent?: ForestEvent;
  status: GameStatus;
  timeInForest: number; // Время в лесу в секундах
}

// Константы
export const FOREST_MAX_TIME = 15 * 60 * 1000; // 15 минут в миллисекундах
export const FOREST_EVENT_TIMEOUT = 30 * 1000; // 30 секунд на ответ
export const FOREST_MIN_EVENT_INTERVAL = 5 * 1000; // Минимум 5 секунд между событиями
export const FOREST_MAX_EVENT_INTERVAL = 30 * 1000; // Максимум 30 секунд между событиями
export const FOREST_DEATH_BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа блокировки после смерти
