# Система эффектов

> Подробная документация: навык `fwo-effects-system`

## Типы аффектов

Файл: `server/arena/Constuructors/interfaces/Affect.ts`

```typescript
BaseAffect {
  initiator: Player;       // Кто наложил
  action: ActionKey;       // Ключ действия ('eclipse', 'glitch'...)
  value?: number;
  proc?: number;

  // Колбэки жизненного цикла (все опциональны, 3-й параметр — affect)
  onBeforeAction?, onBeforeReceive?, onCast?,
  onBeforeDamageDeal?, onBeforeDamageRecieve?,
  onDamageDealt?, onDamageReceived?,
  onHeal?, onCastFail?
}

Effect     = BaseAffect & { type: 'effect' }        // 1 раунд
LongEffect = BaseAffect & { type: 'long-effect', duration: number }  // N раундов
Passive    = BaseAffect & { type: 'passive' }        // Перманент
```

## PlayerAffects

Файл: `server/arena/PlayersService/PlayerAffects.ts`

Каждый `PlayerService` (игрок в бою) имеет `affects: PlayerAffects` (массив `Affect[]`).

### Методы

| Метод | Описание |
|---|---|
| `addEffect(e)` | Добавить `{ ...e, type: 'effect' }` |
| `addLongEffect(e)` | Добавить `{ ...e, type: 'long-effect' }` |
| `addPassive(p)` | Добавить `{ ...p, type: 'passive' }` |
| `getEffectsByAction(name)` | Найти все аффекты по action (не фильтрует по type!) |
| `removeEffectsByAction(name)` | Удалить по action |
| `refresh()` | Конец раунда: удаляет 'effect', декрементит 'long-effect', оставляет 'passive' |

### Жизненный цикл

```
Раунд N:
  1. Каст магии → player.affects.addEffect(...)
  2. Действие → onBeforeDamageDeal / onBeforeDamageRecieve / ...
  3. Конец раунда → refresh()
     - 'effect'     → удаляется
     - 'long-effect' → duration--; если 0 → удаляется
     - 'passive'    → остаётся
```

## EffectService — пайплайн урона

Файл: `server/arena/EffectService.ts`

```typescript
damage(ctx, action):
  1. ctx.initiator.affects.onBeforeDamageDeal(ctx, action)     // атакующий: может заблокировать
  2. ctx.initiator.affects.withOnCastFail(...)                  // перехват CastError
  3. ctx.target.affects.onBeforeDamageRecieve(ctx, action)      // цель: может блокировать
  4. this.applyDamage(ctx, action)                               // применение урона
  5. ctx.target.affects.onDamageReceived(ctx, action)           // цель: пост-фактум
  6. ctx.initiator.affects.onDamageDealt(ctx, action)           // атакующий: пост-фактум
```

**Ключевой момент**: если `onBeforeDamageDeal` бросает `CastError` → цепочка прерывается, урон не наносится. Так работают блокирующие эффекты (затмение, магическая стена).

## Паттерн: блокирующий эффект

```typescript
// В run() магии:
game.players.alivePlayers.forEach((player) => {
  player.affects.addEffect({
    action: this.name,
    initiator,
    proc: initiator.proc,
    onBeforeDamageDeal(ctx, action, affect) {
      magic.onBeforeDamageDeal(ctx, action, affect);
    },
  });
});

// В колбэке:
onBeforeDamageDeal(ctx, action, affect) {
  if (action.actionType !== 'phys') return;
  throw new CastError(
    this.getSuccessResult({ initiator: affect.initiator, target: ctx.initiator, game })
  );
}
```

## Правила

1. **Всегда передавай `affect` 3-м параметром** в колбэк (glitch, madness, eclipse после рефакторинга)
2. **Используй `affect.initiator`** для получения кастера (не глобальный флаг)
3. **Для агрегации инициаторов** — `getEffectsByAction()` + обход `alivePlayers`
4. **Не создавай глобальных флагов** без крайней необходимости
5. **Тип эффекта**: `'effect'` (1 раунд), `'long-effect'` (N раундов), `'passive'` (перманент)

## Глобальные флаги

Файл: `server/arena/GameService.ts`

```typescript
this.flags = {
  noDamageRound: 0,
  global: {},       // раньше было { isEclipsed: [...] }, убрано
};

refreshRoundFlags()  // очистка в конце раунда (пока пустая)
```

**Правило**: глобальные флаги — только если данные нужны вне контекста эффектов и не выводятся из состояния игроков. Эффекты — источник истины.
