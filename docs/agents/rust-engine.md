# Rust Combat Engine Architecture & Design Guide

Документация по архитектуре нативного Rust движка боя (`@fwo/engine`), опыту интеграции с TypeScript-сервером, ключевым выводам, антипаттернам и целевому дизайну для будущей реализации.

---

## 1. Цели и видение (Vision)

- **Вынос боевого ядра в Rust**: Вся логика раунда, пошаговое выполнение стадий боя, расчет урона, лечений, сопротивлений, проверка шансов с псевдорандомом, система хуков перехвата (увороты, парирования, щиты, контроль) и распределение опыта должны быть изолированы в детерминированном, тестируемом и быстром Rust-модуле.
- **Чистое разделение слоев**:
  - **Rust Engine (`@fwo/engine`)**: Чистая предметная область (domain logic), чистые функции перехода состояния `(State, Defs, Orders) -> (NextState, Events, IsEnd)`. Никакого UI, никакого прямого знания о MongoDB / WebSockets.
  - **TypeScript Server Layer**: Сеть, WebSockets, MongoDB, роутинг, Telegram Bot, форматирование логов и локализованных сообщений боя на основе эмитированных движком `BattleEvent`.
  - **TypeScript Bridge (`NativeEngine.ts`)**: Тонкая прослойка (adapter), которая лишь сериализует контекст `GameService`/`PlayerService` в структуры Rust и применяет обратно `NextState` и `Events`. **Никаких `if (action === '...')` в Bridge быть не должно!**

---

## 2. Ключевые выводы и антипаттерны (Learnings & Pitfalls)

### 2.1. Опасность «толстого» Bridge
- **Проблема**: Попытка «по-быстрому» дописать поведение конкретных магий/скиллов в `NativeEngine.ts` (например, `if (event.actionKey === 'magicWall') { exp = 4 }`) приводит к дублированию логики, расползанию условий и превращению Bridge в помойку костылей.
- **Решение**: Все правила (расчет опыта, длительности эффектов, поглощение урона, стоимость ресурсов) обязаны считаться в Rust. Движок отдает в `BattleEvent` уже готовые `exp`, `value`, `reason`, `duration`.

### 2.2. Множественные эффекты перехвата (Multi-Hook Blocking)
- **Проблема**: Если на цели висят эффекты от нескольких игроков (например, 2 союзника повесили `magicWall` или 2 врага повесили `paralysis`), хук перехвата не должен прерывать цикл по первому попавшемуся аффекту через немедленный `return`.
- **Решение**: Конвейер (`pipeline.rs` и `dispatcher.rs`) собирает список всех сработавших аффектов (`Vec<(CasterId, Reason, Exp)>`) и эмитит `BattleEvent::blocked` для **каждого** кастера. Это позволяет TypeScript-логгеру сгенерировать точный лог: `_Паралич_ *Игрок 1*\n_Паралич_ *Игрок 3*`.

### 2.3. Единый конвейер урона (`pipeline.rs`)
- **Проблема**: Дублирование расчетов `roll_dice -> apply_magic_attack -> apply_resists -> apply_damage -> calculate_exp` в каждом отдельном действии.
- **Решение**: Единый конвейер `execute_damage_pipeline(DamageRequest, &mut state, &defs, &hooks)`:
  1. Хуки до начала действия (`on_before_action` на атакующем: Стан, Сон, Безмолвие, Паралич).
  2. Хуки перед нанесением урона (`on_before_damage_deal` на атакующем: Затмение, Глюки, Обезоруживание).
  3. Хуки перед получением урона (`on_before_damage_receive` на цели: Уворот, Парирование, Блок щитом, Защита, Магстена).
  4. Применение сопротивлений цели (`apply_resists`).
  5. Нанесение урона и проверка смерти цели.
  6. Расчет и начисление опыта (физ/маг/лечение с учетом союзников и глюков).
  7. Пост-хуки (`on_damage_received` / `on_damage_dealt`: Световой щит, Вампиризм, Кровотечение).

---

## 3. Что изменить в следующий раз (Next Time Strategy & Improvements)

### 3.1. Data-Driven архетипы вместо копипасты хендлеров (Declarative Actions)
- **Что было в 1-й итерации**: Под каждый скилл/магию (`fireball.rs`, `frost_touch.rs`, `madness.rs`, `paralysis.rs`) писался отдельный `struct Handler` с дублированием `defs.get_player()`, `roll_dice()`, списания маны и вызова `execute_damage_pipeline`.
- **Как делать**: 85% способностей в игре укладываются всего в **4 базовых параметризуемых архетипа**:
  1. `DirectDamageMagic` (`magicArrow`, `blight`, `fireRain`...) — конфиг: `{ dice, cost, base_exp, resist, damage_type }`.
  2. `AoeBouncingMagic` (`fireBall`, `chainLightning`) — конфиг: `{ main_dice, bounce_dice, bounces, cost, base_exp }`.
  3. `ApplyStatusAction` (`paralysis`, `sleep`, `silence`, `madness`, `glitch`) — конфиг: `{ affect_key, duration, cost, base_exp, target_type }`.
  4. `SelfBuffAction` (`dodge`, `parry`, `shieldBlock`, `berserk`, `lightShield`) — конфиг: `{ affect_key, duration, cost, base_exp }`.
- **Выигрыш**: Вместо 25 отдельных файлов с бойлерплейтом — реестр декларативных конфигов, а кастомные хендлеры пишутся *только* для сложных исключений (`vampirism`, `secondLife`, `handsHeal`).

### 3.2. Сначала 100% Rust TDD, затем подключение к TypeScript
- **Что было в 1-й итерации**: Мы сразу включили проксирование из `MagicConstructor.ts` / `PhysConstructor.ts` через флаг `USE_RUST_ENGINE`. Из-за мелких несовпадений в формате логов и полях событий возникало искушение подправить логику прямо в TypeScript-мосте (`NativeEngine.ts`).
- **Как делать**:
  1. **Этап 1 (Чистый Rust)**: Пишем Rust unit/integration-тесты на все стадии, формулы и комбинации аффектов в `engine/tests/`. Добиваемся идеальной работы боевого ядра в изоляции.
  2. **Этап 2 (CLI / Runner)**: Делаем простой JSON-раннер для прогона раундов.
  3. **Этап 3 (Мост)**: Подключаем тонкий `NativeEngine.ts`, который **только** конвертирует типы без единой строчки бизнес-логики.

### 3.3. Строгая типизация `Proc` на уровне Rust компилятора
- **Что было в 1-й итерации**: В TypeScript `initiator.proc` исторически где-то равен `1` (100% эффективности), а где-то `100` (процент из формы заказов), что приводило к багам вроде `exp = 8000` вместо `80` или урона `720` вместо `7.2`.
- **Как делать**: Преобразовать `proc` на входе в структуру:
  ```rust
  pub struct ActionProc {
      pub fraction: f64, // 0.0 .. 1.0 (для расчёта урона, хита, шансов)
      pub raw: f64,      // исходное значение (для формул экспы в старых тестах)
  }
  ```
  Это исключит ошибки масштабирования на этапе компиляции.

### 3.4. Мутируемый контекст конвейера (`DamageContext`) для составных хуков
- **Что было в 1-й итерации**: Хуки возвращали жесткий `HookDecision::Block { reason }` или `HookDecision::Continue`. Из-за этого было неудобно:
  - Частично поглощать урон (как в `magicWall`);
  - Перенаправлять цель (как в `glitch`);
  - Собирать нескольких блокирующих кастеров без прерывания цепочки.
- **Как делать**: Хук получает `&mut DamageContext` и может:
  - Модифицировать `ctx.damage` (впитать часть урона);
  - Сменить `ctx.target_id` (глюки);
  - Записать `ctx.blocks.push(BlockEvent { caster_id, reason, exp })`.

### 3.5. Исчерпывающий контракт `BattleEvent` с первого дня
- **Что было в 1-й итерации**: Поля `exp`, `reason`, `action_key` добавлялись в события поэтапно по мере обнаружения расхождений в тестах.
- **Как делать**: Сразу зафиксировать исчерпывающий enum/структуру событий, где каждое событие (`DamageDealt`, `Healed`, `AffectApplied`, `ActionBlocked`, `ResourceDrained`) уже несет все метаданные, необходимые логгеру сервера для генерации красивых сообщений без обращения к глобальному состоянию.

---

## 4. Архитектура Rust движка (`engine/src`)

```
engine/
├── Cargo.toml
├── src/
│   ├── lib.rs                  # NAPI экспорт: execute_round, execute_single_action, status, rng
│   ├── round.rs                # Стадийный конвейер раунда (стадии 1..24), старение аффектов, победа
│   ├── domain/                 # Доменные структуры
│   │   ├── defs.rs             # Неизменяемые параметры боя (PlayerDef, WeaponDef, Resists)
│   │   ├── state.rs            # Изменяемое состояние (BattleState, DynamicState, Affect)
│   │   ├── events.rs           # BattleEvent (damage, heal, blocked, dodged, parried, etc.)
│   │   └── order.rs            # Заказы раунда (Order, OrderTargetType, ActionProc)
│   ├── combat/                 # Боевые вычисления
│   │   ├── pipeline.rs         # execute_damage_pipeline & execute_physical_attack
│   │   ├── damage.rs           # Расчет базовых хитов оружия/магии и резистов
│   │   ├── exp.rs              # Формулы начисления опыта (физ, маг, лечение, аое)
│   │   └── result.rs           # ActionResult enum (Success, Blocked, Dodged, Parried, NoResource)
│   ├── actions/                # Реестр и архетипы действий
│   │   ├── trait_def.rs        # ActionDef, ActionHandler, ActionCategory, ResourceCost
│   │   ├── archetypes/         # Базовые конфигурируемые типы действий (Direct, AoE, Status, Buff)
│   │   ├── registry.rs         # ActionRegistry (список стадий и регистрация всех 24 действий)
│   │   ├── dispatcher.rs       # dispatch_action (контроль, списание MP/EN, псевдорандом, вызов)
│   │   └── custom/             # Нестандартные действия (vampirism, secondLife, etc.)
│   ├── hooks/                  # Система перехватов
│   │   ├── trait_def.rs        # AffectHook, HookDecision, ActionContext, DamageContext
│   │   └── registry.rs         # HookRegistry
│   └── rng/                    # Детерминированный рандом и псевдорандом
│       ├── dice.rs             # roll_dice ("1d3+5"), rand_float
│       └── streak.rs           # check_pseudo_random_chance (защита от полос неудач)
```

---

## 5. Контракт данных между TS и Rust

### 5.1. Входные структуры (`RoundInput`)
```typescript
interface RoundInput {
  defs: BattleDefs;    // Неизменяемые базовые статы, оружие, резисты, кланы игроков
  state: BattleState;  // Текущие HP, MP, EN, failStreaks, активные affects игроков, round
  orders: Order[];     // Список заказов игроков на раунд
}
```

### 5.2. Выходные структуры (`RoundOutput`)
```typescript
interface RoundOutput {
  nextState: BattleState;     // Обновленное состояние игроков и аффектов
  events: BattleEvent[];      // Полный упорядоченный список боевых событий
  isGameEnd: boolean;         // Закончился ли бой
  endReason?: string;         // 'LAST_PLAYER_STANDING', 'DRAW_MAX_ROUNDS', etc.
}
```

### 5.3. Унифицированное событие (`BattleEvent`)
```typescript
interface BattleEvent {
  eventType: 'damage' | 'heal' | 'blocked' | 'dodged' | 'parried' | 'failed_chance' | 'no_resource' | 'redirected' | 'affect_applied' | 'death';
  initiatorId: number;
  targetId: number;
  actionKey: string;
  value: number;            // Урон / лечение / эффект стены
  reason?: string;          // 'dodge', 'parry', 'magicWall', 'paralysis', 'SKILL_FAIL', 'NO_MANA'
  targetHpLeft?: number;    // Оставшееся HP цели
  exp?: number;             // Опыт, начисленный за это действие
}
```

---

## 6. Дизайн тонкого TypeScript Bridge (`NativeEngine.ts`)

```typescript
export class NativeEngine {
  // 1. Запуск полного раунда
  static runRound(game: GameService): NativeEngineResult {
    const input = this.buildRoundInput(game);
    const output = executeRound(input);
    this.syncStateBackToGame(game, output.nextState);
    return { output, eventsWithPlayerIds: this.enrichEvents(game, output.events) };
  }

  // 2. Выполнение одиночного действия (для пошаговых тестов или кастов)
  static castAction(actionKey: string, initiator: Player, target: Player, game: GameService, proc?: number): void {
    const input = this.buildSingleActionInput(actionKey, initiator, target, game, proc);
    const output = executeSingleAction(input);
    this.syncStateBackToGame(game, output.nextState);
    this.appendEventsToGameHistory(game, initiator, target, output.events);
  }
}
```

### Принцип `appendEventsToGameHistory`:
Никаких проверок по имени скилла! Маппинг строится чисто по типам событий:
- `eventType === 'damage'` $\rightarrow$ `SuccessArgs { actionType, effect, exp, hp }`
- `eventType === 'heal'` $\rightarrow$ `SuccessArgs { actionType: 'heal', effect, exp, hp }`
- `eventType === 'affect_applied'` $\rightarrow$ `SuccessArgs { actionType, effect, exp, duration }` (если у магии есть стоимость или опыт)
- `eventType === 'blocked' | 'dodged' | 'parried'` $\rightarrow$ `FailArgs { reason: [...] }`

---

## 7. Чеклист для повторного старта

1. [ ] **Сборка `@fwo/engine`**: `napi-rs` на чистых структурах без циклических зависимостей.
2. [ ] **4 Data-Driven архетипа**: Реализовать `DirectDamage`, `AoeBouncing`, `ApplyStatus`, `SelfBuff`.
3. [ ] **100% Rust Integration Tests**: Покрыть все 24 действия и их комбинации в `engine/tests/`.
4. [ ] **Тонкий Bridge в TS**: Подключить `NativeEngine.ts` без единого `if (actionKey === '...')`.
5. [ ] **Сквозные тесты**: Запуск полного набора `USE_RUST_ENGINE=true bun test` с проверкой 100% совпадения снапшотов.
