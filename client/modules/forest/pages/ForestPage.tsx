import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useForest } from '@/modules/forest/hooks/useForest';
import {
  ForestEventAction,
  ForestEventType,
  FOREST_MAX_TIME,
} from '@fwo/shared';

const EVENT_TITLES: Record<ForestEventType, string> = {
  [ForestEventType.Wolf]: '🐺 Волк!',
  [ForestEventType.FallenTree]: '🌳 Упавшее дерево',
  [ForestEventType.Chest]: '📦 Сундук',
  [ForestEventType.Campfire]: '🔥 Костёр',
  [ForestEventType.AbandonedCamp]: '⛺ Заброшенный лагерь',
  [ForestEventType.OldTrap]: '🪤 Старый капкан',
  [ForestEventType.AbandonedSword]: '⚔️ Заброшенный меч',
  [ForestEventType.GlowingCrystal]: '💎 Мерцающий кристалл',
};

const EVENT_DESCRIPTIONS: Record<ForestEventType, string> = {
  [ForestEventType.Wolf]: 'Ты заметил волка впереди. Что будешь делать?',
  [ForestEventType.FallenTree]: 'Перед тобой упавшее дерево. Можно разрубить на доски.',
  [ForestEventType.Chest]: 'Ты нашёл спрятанный сундук!',
  [ForestEventType.Campfire]: 'Ты нашёл тлеющий костёр. Можно отдохнуть.',
  [ForestEventType.AbandonedCamp]: 'Заброшенный лагерь охотников. Можно поискать полезное.',
  [ForestEventType.OldTrap]: 'Старый ржавый капкан. Осторожно!',
  [ForestEventType.AbandonedSword]: 'В земле торчит старый меч.',
  [ForestEventType.GlowingCrystal]: 'Редкий мерцающий кристалл!',
};

const ACTION_LABELS: Record<ForestEventAction, string> = {
  [ForestEventAction.PassBy]: 'Пройти мимо',
  [ForestEventAction.AttackWolf]: 'Атаковать',
  [ForestEventAction.Sneak]: 'Прокрасться',
  [ForestEventAction.ChopTree]: 'Разрубить',
  [ForestEventAction.OpenChest]: 'Открыть',
  [ForestEventAction.Rest]: 'Отдохнуть',
  [ForestEventAction.ScavengeCamp]: 'Обыскать',
  [ForestEventAction.DisarmTrap]: 'Разобрать',
  [ForestEventAction.TakeSword]: 'Взять',
  [ForestEventAction.TakeCrystal]: 'Взять',
};

export const ForestPage = () => {
  const {
    status,
    lastResult,
    loading,
    handleAction,
    handleExit,
    clearLastResult,
    isWaiting,
    isEvent,
  } = useForest();

  if (!status) {
    return (
      <Card header="Лес" className="m-4">
        <div className="text-center">Загрузка...</div>
      </Card>
    );
  }

  const timeProgress = status.timeInForest / FOREST_MAX_TIME;
  const timeLeftMinutes = Math.ceil((FOREST_MAX_TIME - status.timeInForest) / 60000);

  return (
    <Card header="Лес" className="m-4">
      {/* Прогресс времени */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Время в лесу</span>
          <span>{timeLeftMinutes} мин. осталось</span>
        </div>
        <progress
          className="nes-progress h-4"
          value={status.timeInForest}
          max={FOREST_MAX_TIME}
        />
      </div>

      {/* Статус игрока */}
      <div className="mb-4 p-2 border-2 border-dashed">
        <div className="flex justify-between items-center">
          <span>❤️ HP:</span>
          <span>
            {status.status.hp} / {status.status.maxHP}
          </span>
        </div>
        <progress
          className="nes-progress is-error h-3"
          value={status.status.hp}
          max={status.status.maxHP}
        />
      </div>

      {/* Статистика */}
      <div className="text-xs mb-4">
        Событий встречено: {status.eventsEncountered}
      </div>

      {/* Последний результат */}
      {lastResult && (
        <div
          className={`mb-4 p-2 border-2 ${lastResult.success ? 'border-green-500' : 'border-red-500'}`}
        >
          <p className="text-sm">{lastResult.message}</p>
          {lastResult.reward && (
            <div className="text-xs mt-1">
              {lastResult.reward.gold && <span>+{lastResult.reward.gold} 💰</span>}
              {lastResult.reward.hp && lastResult.reward.hp > 0 && (
                <span className="ml-2">+{lastResult.reward.hp} ❤️</span>
              )}
              {lastResult.reward.hp && lastResult.reward.hp < 0 && (
                <span className="ml-2 text-red-500">{lastResult.reward.hp} ❤️</span>
              )}
              {lastResult.reward.components && (
                <span className="ml-2">
                  {Object.entries(lastResult.reward.components).map(([k, v]) => (
                    <span key={k}>+{v} {k}</span>
                  ))}
                </span>
              )}
            </div>
          )}
          <Button className="mt-2 text-xs" onClick={clearLastResult}>
            OK
          </Button>
        </div>
      )}

      {/* Состояние ожидания */}
      {isWaiting && !lastResult && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🌲</div>
          <p>Ты идёшь по лесу...</p>
          <p className="text-xs mt-2">Ожидание события</p>
        </div>
      )}

      {/* Событие */}
      {isEvent && status.currentEvent && (
        <div className="text-center">
          <h3 className="text-lg mb-2">
            {EVENT_TITLES[status.currentEvent.type]}
          </h3>
          <p className="text-sm mb-4">
            {EVENT_DESCRIPTIONS[status.currentEvent.type]}
          </p>

          {/* Таймер события */}
          <div className="text-xs mb-4">
            Осталось времени:{' '}
            {Math.max(
              0,
              Math.ceil(
                (new Date(status.currentEvent.expiresAt).getTime() - Date.now()) / 1000,
              ),
            )}{' '}
            сек
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col gap-2">
            {status.currentEvent.availableActions.map((action) => (
              <Button
                key={action}
                onClick={() => handleAction(action)}
                disabled={loading}
                className={action === ForestEventAction.PassBy ? '' : 'is-primary'}
              >
                {ACTION_LABELS[action]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      {isWaiting && (
        <div className="mt-4">
          <Button onClick={handleExit} disabled={loading} className="w-full">
            Выйти из леса
          </Button>
        </div>
      )}
    </Card>
  );
};
