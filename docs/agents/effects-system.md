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
  onBeforeHealDeal?, onCastFail?
}

Effect     = BaseAffect & { type: 'effect' }        // 1 раунд
LongEffect = BaseAffect & { type: 'long-effect', duration: number }  // N раундов
Passive    = BaseAffect & { type: 'passive' }        // Перманент
```

## PlayerAffects

Файл: `server/arena/PlayersService/PlayerAffects.ts`

Каждый `PlayerService` (игрок в бою) имеет `affects: PlayerAffects` (массив `Affect[]`).

### Методы

| Метод                         | Описание                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `addEffect(e)`                | Добавить `{ ...e, type: 'effect' }`                                            |
| `addLongEffect(e)`            | Добавить `{ ...e, type: 'long-effect' }`                                       |
| `addPassive(p)`               | Добавить `{ ...p, type: 'passive' }`                                           |
| `getEffectsByAction(name)`    | Найти все аффекты по action (не фильтрует по type!)                            |
| `removeEffectsByAction(name)` | Удалить по action                                                              |
| `refresh()`                   | Конец раунда: удаляет 'effect', декрементит 'long-effect', оставляет 'passive' |

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
  1. ctx.initiator.affects.withOnCastFail(() => onBeforeDamageDeal)  // атакующий: подготовка урона / перехват промаха (miss)
  2. ctx.initiator.affects.withOnCastFail(() => onBeforeDamageRecieve) // цель: защита/уклонение / перехват (dodge/shieldBlock)
  3. this.applyDamage(ctx, action)                                   // применение урона
  4. ctx.target.affects.onDamageReceived(ctx, action)               // цель: пост-фактум
  5. ctx.initiator.affects.onDamageDealt(ctx, action)               // атакующий: пост-фактум (DoT, кураж)
```

**Ключевой момент**: если `onBeforeDamageDeal` или `onBeforeDamageRecieve` бросает `CastError`, он может быть перехвачен через `withOnCastFail` (пассивками вроде `eagleEye`, `rangeWeapon` или защитой `fieldMedic`). Если ошибка не перехвачена → цепочка прерывается, урон не наносится. Так работают блокирующие эффекты (затмение, магическая стена, промах).

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

### Блокировка конкретных действий (`onBeforeAction`)
Используется для запрета каста определенных скиллов или магий (например, блокировка `dodge` в `cripplingShotDebuff`, блокировка действий в `stun`/`asleep`, запрет магии в `silence`).

Чтобы в логе боя и отчётах отображалась точная причина срыва действия, выбрасывается `CastError` с `SuccessArgs` блокирующего действия/дебаффа:

```typescript
onBeforeAction(actionCtx: BaseActionContext, actionToCast: BaseAction, affect?: Affect) {
  if (actionToCast.name === 'dodge') {
    const { initiator: target, game } = actionCtx;
    const caster = affect?.initiator ?? this.params?.initiator;
    this.createContext(caster, target, game);
    throw new CastError(this.getSuccessResult(this.context));
  }
}
```

### Переприменение дебаффов характеристик в раундах (`onCast`)
В конце каждого раунда характеристики персонажей сбрасываются до базовых через `StatsService.refresh()`. Поэтому для `long-effect`, снижающих статы (например, срез ловкости на 2 раунда в `cripplingShotDebuff`), логика дебаффа должна повторно накладываться в начале каждого последующего раунда через хук `onCast`:

```typescript
// В дебаффе:
apply(target, initiator, debuffPercent) {
  this.applyDebuff(target, debuffPercent); // раунд 1
  target.affects.addLongEffect({
    action: this.name,
    duration: 2,
    initiator,
    value: debuffPercent,
    onCast: (_game, affect) => this.onCast(target, affect), // раунд 2+
    onBeforeAction: (actionCtx, actionToCast, affect) => this.onBeforeAction(actionCtx, actionToCast, affect),
  });
}

onCast(target: Player, affect: Affect) {
  this.applyDebuff(target, affect.value ?? 25);
}
```

Движок боя (`EngineService`) вызывает `player.affects.onCast(game, stage)` при прохождении каждой стадии умения.

### Игнорирование защиты цели (`onCastFail`)
Хук `onCastFail` позволяет атакующему или защитнику отменить срыв действия. Например, «Прицельный выстрел» (`aimedShot`) игнорирует уклонение цели:

```typescript
onCastFail(ctx: BaseActionContext, action: BaseAction, reason: BreaksMessage | SuccessArgs | SuccessArgs[]): boolean {
  if (action.actionType !== 'phys' || !this.checkWeapon(ctx.initiator)) {
    return false;
  }
  // hasReasonActionType проверяет наличие 'dodge' в строке ошибки или объекте SuccessArgs
  return hasReasonActionType(reason, 'dodge');
}
```
Если метод возвращает `true`, срыв по причине уклонения отменяется, и цепочка урона продолжается. При этом увёртка цели остаётся активной против других нападающих в раунде.

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
  global: {}, // раньше было { isEclipsed: [...] }, убрано
};

refreshRoundFlags(); // очистка в конце раунда (пока пустая)
```

**Правило**: глобальные флаги — только если данные нужны вне контекста эффектов и не выводятся из состояния игроков. Эффекты — источник истины.
