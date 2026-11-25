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
  onBeforeHealDeal?, onCastFail?, onAfterCast?
}

Effect     = BaseAffect & { type: 'effect' }        // 1 раунд
LongEffect = BaseAffect & { type: 'long-effect', duration: number }  // N раундов
Passive    = BaseAffect & { type: 'passive' }        // Перманент
```

## PlayerAffects

Файл: `server/arena/PlayersService/PlayerAffects.ts`

Каждый `PlayerService` (игрок в бою) имеет `affects: PlayerAffects` (массив `Affect[]`).

### Порядок

Единственный источник приоритета — `config.stages`. `stages.ts` присваивает ранг
каждому листу `config.stages.flat()`: вложенные группы идут последовательно слева
направо, как в `EngineService`. Дубликаты стадий запрещены тестом.

`affects`, `getEffectsByAction` и все dispatch-хуки используют стабильные
отсортированные снимки. Тип (`effect`, `long-effect`, `passive`) и раунд создания
не меняют приоритет: старые длительные эффекты после `refresh()` тоже следуют stages.
Одинаковые action/rank сохраняют порядок добавления. Все действия без стадии имеют
общий последний ранг и стабильный insertion order; новые стадии для пассивок
автоматически не добавляются (это запустило бы их `onCast` и изменило gameplay).

Все dispatch-хуки используют общий приватный генератор `iterateAffects` с новым
локальным `Set<Affect>` для каждого dispatch. Перед выдачей экземпляра генератор
пропускает уже обработанные и отсутствующие в живой исходной коллекции (`has(affect)`).
Экземпляр отмечается до вызова хука, даже если соответствующего колбэка у него нет.
Колбэки вызываются как методы аффекта, с `this = affect`.

`add*` только добавляет в исходное хранилище. Добавление или удаление во время хука
не перестраивает текущий снимок: новые эффекты видны лишь следующему снимку
(в том числе при возврате к цели внутри receive-dispatch), но удалённые до своей
очереди экземпляры текущего снимка уже не вызываются благодаря проверке `has`.
Только `onBeforeDamageRecieve` динамически выбирает коллекцию через
`() => ctx.target.affects`; остальные dispatch-хуки обходят фиксированную `this`.
`refresh()` по-прежнему удаляет однократные эффекты, уменьшает duration длительных
и сохраняет пассивки.

### Методы

| Метод                         | Описание                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `addEffect(e)`                | Добавить `{ ...e, type: 'effect' }`                                            |
| `addLongEffect(e)`            | Добавить `{ ...e, type: 'long-effect' }`                                       |
| `addPassive(p)`               | Добавить `{ ...p, type: 'passive' }`                                           |
| `has(affect)`                 | Проверить наличие конкретного экземпляра в живом хранилище                    |
| `getEffectsByAction(name)`    | Найти все аффекты по action (не фильтрует по type!)                            |
| `removeEffectsByAction(name)` | Удалить по action                                                              |
| `iterateAffects(getAffects?)` | Приватный генератор общего обхода: snapshot, live membership и Set за dispatch |
| `onAfterCast(ctx, action)`    | Вызывает `affect.onAfterCast?.(ctx, action, affect)` для всех аффектов         |
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

### Перенаправление цели и ограничения

`PlayerAffects.onBeforeDamageRecieve` итеративно обходит полный отсортированный
снимок аффектов фактической `ctx.target` через общий `iterateAffects`
([правила обхода](#порядок)). После каждого хука сравнивается ссылка на коллекцию
`ctx.target.affects` с коллекцией текущего снимка — не ID игрока и не сам `ctx.target`.
При смене коллекции старый снимок немедленно прекращается, полный снимок новой
коллекции обходится с первой стадии. Предполагается, что у каждого игрока своя
`PlayerAffects`: смена игрока с той же коллекцией не перезапустит обход.

Возврат к уже встречавшейся цели допустим: её ещё не обработанные и всё ещё
присутствующие защиты сработают, а обработанные экземпляры будут пропущены.
При возврате берётся новый снимок, включая добавленные за время предыдущих хуков
эффекты; текущий снимок без смены коллекции по-прежнему не перестраивается.
Обход заканчивается, когда снимок текущей коллекции завершён без её смены.
Следующий dispatch получает новый Set, даже внутри одного действия/раунда:
на следующем попадании все оставшиеся «Спасения» снова доступны.

Гарантия завершения предполагает конечное число экземпляров эффектов за dispatch
и завершающиеся хуки: локальный Set ограничивает повторное выполнение экземпляров,
а не создание новых. Бесконечное создание новых эффектов, каждый из которых
снова перенаправляет удар, этим алгоритмом не предотвращается.

«Спасение» прикрывает союзника от всех физических атак (`actionType: 'phys'`)
до конца раунда (`refresh()`) или замены эффекта. Счётчика зарядов нет:
`affect.value = 1` проверяется как признак активности и не уменьшается,
эффект при перехвате не удаляется. Это не гарантирует блокирование урона:
атака перенаправляется на спасателя. Обработчик не проверяет, жив ли спасатель:
погибший персонаж тоже может перехватить удар.

Само перенаправление не вызывает `damage` повторно. Если удар не отменён,
сопротивления, списание HP, проверка смерти и `onDamageReceived` используют
фактическую `ctx.target` и выполняются единожды штатным `EffectService`.
`ctx.params.target` при этом остаётся исходной целью, как и при «Глюках».
Отдельный маркер прерывания лечения также остаётся у исходной цели атаки.
`rawDamage` обходит подготовительные deal/receive-хуки, поэтому «Спасение»
не перехватывает такой вторичный урон.

### Результаты и лог

При стандартном вызове результаты успеха и ошибки используют фактическую цель
контекста. `getFailResult` копирует уже выполненные аффекты из
`rootCtx.status.affects` в отдельный массив `FailArgs.affects`, не смешивая с
`reason`: `formatError` выводит их в порядке выполнения **после** причины отмены.
`giveExp` при ошибке по-прежнему обрабатывает только `reason`, не повторяя опыт
накопленных аффектов. Запись перехвата «Спасения» получает
`actionType: 'passive'` и собственный `msg`; для этого типа `formatCause` выводит
сообщение «перехватил атаку по…» без `📖0`. Поле `event?: 'intercept'`
объявлено в типе, но не выставляется и не участвует в форматировании.
Активация остаётся обычным skill-результатом (20 опыта), с сообщением о прикрытии
союзника; выполненный перехват — 0 опыта.

`help` расположен после `bodySpirit`, перед группой `smallAura`…`magicWall`,
а значит и перед `dodge`/`parry`/`shieldBlock`/`protect`. Он также теперь раньше
`paralysis`: паралич текущего раунда уже не отменяет выполненное «Спасение», но
блокирует последующие действия спасателя. `sleep` остаётся раньше `help`.

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
В конце каждого раунда характеристики персонажей сбрасываются до базовых через `StatsService.refresh()`. Поэтому для `long-effect`, снижающих статы (например, срез ловкости на 2 раунда в `cripplingShot`), логика дебаффа должна повторно накладываться в начале каждого последующего раунда через хук `onCast`:

```typescript
// В скилле (cripplingShot):
onDamageDealt(ctx: BaseActionContext, action: BaseAction, value: number) {
  if (action.isOfType('phys') && this.checkWeapon(ctx.initiator)) {
    const { initiator, target } = ctx;
    this.onCast(target, value); // применение в текущем раунде

    target.affects.addLongEffect({
      action: this.name,
      duration: 2,
      initiator,
      value,
      onCast() {
        cripplingShot.onCast(target, this.value); // раунд 2+
      },
      onBeforeAction(ctx, action, affect) {
        cripplingShot.onBeforeAction(ctx, action, affect);
      },
    });

    ctx.addAffect(this);
  }
}

onCast(target: Player, value: number) {
  const dex = target.stats.val('attributes.dex');
  target.stats.down('attributes.dex', floatNumber(dex * (value / 100)));
}
```

Движок боя (`EngineService`) вызывает `player.affects.onCast(game, stage)` при прохождении каждой стадии умения.

**«Контузия» (`concussion`) — длительный стат-дебафф с передачей сохранённого payload:**
- Источник — [`weightyArgument`](../../server/arena/passiveSkills/weightyArgument.ts) или [`shakeUp`](../../server/arena/skills/shakeUp.ts) — сначала вызывает `target.affects.addLongEffect` с `action: concussion.name`, `initiator`, `value` (сила в процентах), фиксированной `duration: 2` и `onCast`. Затем источник немедленно вызывает callback новой записи, чтобы эффект сработал уже в текущем раунде.
- Callback вызывает `concussion.castLongEffect(initiator, target, game, affect)`. [`WithLongEffect`](../../server/arena/Constuructors/mixins/WithLongEffect.ts) клонирует действие, копирует оставшуюся длительность и передаёт **весь `affect` четвёртым аргументом** в `clone.cast(initiator, target, game, affect)`. [`concussion.cast`](../../server/arena/effects/concussion.ts) читает `affect.value` и умножает только боевые `phys.attack` и `magic.attack` на `1 - power / 100`: это не прямое снижение конечного урона, не `stun` и не блокировка действий.
- Специальный `cast` не выполняет обычные магические проверки, списание ресурсов или масштабирование от магии/`proc`. Он не создаёт и не обновляет записи длительных эффектов, но **явно пишет результат** через `game.recordOrderResult(this.getSuccessResult())`, несмотря на `isAffect = true`. Лог показывает `⏳2 Контузия` при наложении и `⏳1 Контузия` в следующем раунде.
- Текущий раунд входит в два: в конце N `PlayerService.reset()` восстанавливает статы и уменьшает длительность `2 → 1`; ранняя стадия `concussion` в [`config.stages`](../../server/arena/config.ts) раунда N+1 вызывает `onCast` оставшейся записи и повторно применяет её сохранённую силу без новой регистрации. В конце N+1 длительность `1 → 0`, запись удаляется и статы восстановлены.
- Разные записи применяются независимо, обычным последовательным перемножением. Проверка «у цели уже есть Контузия — пропустить без RNG и продления» находится **только в пассивке `weightyArgument`**, до проверки её шанса. Активная `shakeUp` такой проверки не делает и может добавить ещё одну запись.

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

### Пост-обработка действий (`onAfterCast`)
Хук `onAfterCast(ctx, action, affect)` вызывается в конце выполнения `BaseAction.next()` после фиксации результатов первого действия:
```typescript
context.initiator.affects.onAfterCast(context, this);
```
Используется для безопасного логирования вторичных действий без взаимного повреждения контекстов. Например, в «Залпе стрел» (`doubleShot`) вторая стрела кастуется как дочернее действие (`isAffect = true`), а её результат фиксируется в `roundResults` через `onAfterCast` сразу после записи основного выстрела:
```typescript
ctx.initiator.affects.addEffect({
  action: this.name,
  initiator: ctx.initiator,
  onAfterCast() {
    ctx.game.recordOrderResult(actionClone.getSuccessResult());
  },
});
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
  global: {}, // раньше было { isEclipsed: [...] }, убрано
};

refreshRoundFlags(); // очистка в конце раунда (пока пустая)
```

**Правило**: глобальные флаги — только если данные нужны вне контекста эффектов и не выводятся из состояния игроков. Эффекты — источник истины.
