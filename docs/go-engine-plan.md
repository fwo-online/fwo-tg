# Архитектурный план и дизайн игрового движка боя на Go

Документ описывает архитектуру, структуру данных, боевой пайплайн и план поэтапной реализации боевого движка Fight World Online (FWO) на языке Go.

---

## 1. Цели и Архитектурные принципы

### 1.1. Главные цели
- **Полный отказ от ООП/наследования**: замена 5-уровневой иерархии классов на **Data-Driven (табличный)** подход, композицию структур и функциональные хуки (interceptor pipeline).
- **Stateless & Thread-Safe**: действия (Actions) не содержат изменяемого состояния (`context`, `status`). Состояние боя передаётся явно через `*ActionContext`.
- **Отказ от исключений в бизнес-логике**: прерывания атак (уворот, блок Затмением, нехватка маны, парирование) обрабатываются через структуры решений `HookDecision` и `ActionResult`, без `panic` / `CastError`.
- **Высокая производительность**: возможность обсчитывать десятки тысяч раундов в секунду в параллельных горутинах с минимальными аллокациями памяти.
- **Простота расширения**: добавление 80% новых заклинаний/скиллов через декларативные конфигурационные структуры без написания нового кода.

---

## 2. Структура проекта (Go Package Layout)

```
fwo-engine-go/
├── cmd/
│   └── engine-sim/              # CLI-симулятор для прогона тестовых боёв
├── internal/
│   ├── domain/
│   │   ├── affect/              # Система аффектов, баффов и хуков
│   │   │   ├── affect.go
│   │   │   ├── manager.go
│   │   │   └── types.go
│   │   ├── player/              # Модель игрока, статов и резистов
│   │   │   ├── player.go
│   │   │   ├── stats.go
│   │   │   └── weapon.go
│   │   ├── action/              # Определение умений и реестр
│   │   │   ├── action.go
│   │   │   ├── registry.go
│   │   │   └── types.go
│   │   └── battle/              # Сущность боя, команды, заказы
│   │       ├── battle.go
│   │       ├── order.go
│   │       └── result.go
│   ├── engine/
│   │   ├── pipeline/            # Боевой пайплайн (урон, хил, затраты, опыт)
│   │   │   ├── pipeline.go
│   │   │   ├── damage.go
│   │   │   ├── heal.go
│   │   │   └── exp.go
│   │   ├── stages/              # Исполнитель стадий раунда
│   │   │   ├── runner.go
│   │   │   └── config.go
│   │   └── actions/             # Реализация конкретных скиллов/магий
│   │       ├── base/            # Базовые действия (атака, защита)
│   │       ├── magics/          # Заклинания (eclipse, glitch, fireball...)
│   │       ├── skills/          # Воинские скиллы (dodge, parry, disarm...)
│   │       └── passives/        # Пассивки (sweepingBlow, lacerate...)
│   └── pkg/
│       ├── dice/                # Парсер и калькулятор дайсов (1d80+20, 2d6...)
│       ├── rng/                 # Псевдо-RNG, расчет шансов со стриками неудач
│       └── events/              # Боевые события и структурированный лог
├── docs/                        # Документация движка
├── go.mod
└── go.sum
```

---

## 3. Схема данных и Типы (Domain Models)

### 3.1. Статы и Игрок (`internal/domain/player`)

```go
package player

type StatKey string

const (
	StatHP           StatKey = "hp"
	StatMaxHP        StatKey = "base.hp"
	StatMP           StatKey = "mp"
	StatMaxMP        StatKey = "base.mp"
	StatEnergy       StatKey = "en"
	StatMaxEnergy    StatKey = "base.en"
	StatPhysAttack   StatKey = "phys.attack"
	StatPhysDefence  StatKey = "phys.defence"
	StatMagicAttack  StatKey = "magic.attack"
	StatMagicDefence StatKey = "magic.defence"
	StatHitMin       StatKey = "hit.min"
	StatHitMax       StatKey = "hit.max"
	StatMaxTarget    StatKey = "maxTarget"
)

type Stats struct {
	values    map[StatKey]float64
	failStreak map[string]int // Стрики неудач для псевдо-случайности
}

func (s *Stats) Val(key StatKey) float64
func (s *Stats) Modify(key StatKey, delta float64)
func (s *Stats) Consume(key StatKey, amount float64) bool

type Player struct {
	ID        string
	Nick      string
	ClanID    string
	IsBot     bool
	IsAlive   bool
	KillerID  string
	
	Stats     Stats
	Resists   map[string]float64 // Резисты по типам урона
	Skills    map[string]int     // Уровень скилла
	Magics    map[string]int     // Уровень магии
	Passives  map[string]int     // Уровень пассивки
	Weapon    WeaponInfo
	
	Affects   *affect.Manager    // Менеджер эффектов игрока
}
```

---

### 3.2. Система Аффектов и Хуков (`internal/domain/affect`)

```go
package affect

type AffectType int

const (
	AffectInstant AffectType = iota // Действует в рамках раунда/действия
	AffectRound                     // 1 раунд
	AffectLong                      // N раундов (duration--)
	AffectPassive                   // Перманентный эффект
)

type HookDecision int

const (
	DecisionContinue HookDecision = iota
	DecisionBlockAction           // Прерывание всего действия (например, стан, затмение)
	DecisionNegateDamage          // Урон обнулен (уворот, парирование)
)

type HookResult struct {
	Decision   HookDecision
	Reason     string
	NewTarget  *player.Player
	DamageMod  float64
	Events     []events.BattleEvent
}

type AffectCallback func(ctx *ActionContext, affect *Affect) HookResult

type Affect struct {
	ID         string
	ActionKey  string
	Initiator  *player.Player
	Type       AffectType
	Duration   int
	Value      float64
	Proc       float64

	// Хуки жизненного цикла
	OnBeforeAction        AffectCallback // Прерывание до выполнения (стан, сон)
	OnBeforeDamageDeal    AffectCallback // Перехват урона атакующего (затмение, глюки)
	OnBeforeDamageReceive AffectCallback // Защитные реакции цели (уворот, блок, щит)
	OnDamageDealt         AffectCallback // Пост-эффекты атакующего (вампиризм, сплеш)
	OnDamageReceived      AffectCallback // Пост-эффекты цели (шипы, ответный урон)
	OnHeal                AffectCallback // Модификаторы лечения
	OnCastFail            AffectCallback // Реакция на неудачный каст
}

type Manager struct {
	affects []*Affect
}

func (m *Manager) Add(a *Affect)
func (m *Manager) RemoveByAction(actionKey string)
func (m *Manager) GetByAction(actionKey string) []*Affect
func (m *Manager) TickRoundEnd() // Очищает 1-раундовые, уменьшает duration у long, оставляет passives
```

---

### 3.3. Декларативное Описание Умения (`internal/domain/action`)

```go
package action

type Category string

const (
	CategoryPhys       Category = "phys"
	CategoryMagic      Category = "magic"
	CategorySkill      Category = "skill"
	CategoryProtect    Category = "protect"
	CategoryHeal       Category = "heal"
	CategoryPassive    Category = "passive"
)

type OrderTargetType string

const (
	TargetSelf           OrderTargetType = "self"
	TargetEnemy          OrderTargetType = "enemy"
	TargetAlly           OrderTargetType = "team"
	TargetAllyExceptSelf OrderTargetType = "teamExceptSelf"
	TargetAll            OrderTargetType = "all"
)

type ActionDef struct {
	Key          string
	DisplayName  string
	Category     Category
	TargetType   OrderTargetType
	StageIndex   int
	
	// Ресурсные требования
	CostType     player.StatKey
	CostFormula  func(lvl int) float64
	
	// Шанс прохождения (псевдо-рандом)
	ChanceFormula func(initiator, target *player.Player, lvl int) float64
	
	// Формула эффекта
	EffectFormula func(initiator, target *player.Player, lvl int) float64
	
	// Опциональный кастомный обработчик (для нестандартных скиллов)
	CustomHandler func(ctx *ActionContext) ActionResult
}
```

---

## 4. Боевой Пайплайн (Combat Pipeline Flow)

```mermaid
flowchart TD
    Start([Execute Action]) --> CostCheck{Хватает ресурсов?}
    CostCheck -- Нет --> RetNoRes[Return: StatusNoResource]
    CostCheck -- Да --> ConsumeRes[Списать MP/Energy]
    
    ConsumeRes --> BeforeActionHook[Вызов OnBeforeAction у инициатора]
    BeforeActionHook --> CheckBlocked1{Заблокировано?<br/>(Стан/Сон)}
    CheckBlocked1 -- Да --> RetBlocked1[Return: StatusBlocked]
    
    CheckBlocked1 -- Нет --> ChanceCheck{Проверка шанса<br/>RNG / Streak}
    ChanceCheck -- Фейл --> RetFailChance[Return: StatusFailedChance]
    
    ChanceCheck -- Успех --> CustomCheck{Есть CustomHandler?}
    CustomCheck -- Да --> ExecCustom[Вызов CustomHandler]
    
    CustomCheck -- Нет --> PreDamageHook[Вызов OnBeforeDamageDeal<br/>(Eclipse / Glitch)]
    PreDamageHook --> CheckGlitch{Glitch / Override?}
    CheckGlitch -- Да --> RedirectTarget[Сменить Target]
    CheckGlitch -- Нет --> CheckEclipse{Eclipse / Block?}
    CheckEclipse -- Да --> RetBlocked2[Return: StatusBlocked]
    
    CheckEclipse -- Нет --> DefenderHook[Вызов OnBeforeDamageReceive<br/>(Dodge / Parry / Protect)]
    DefenderHook --> CheckDefended{Уворот / Парирование?}
    CheckDefended -- Да --> RetDefended[Return: StatusDodged/Parried]
    
    CheckDefended -- Нет --> ApplyResists[Применить резисты цели]
    ApplyResists --> ApplyHP[Уменьшить HP цели]
    ApplyHP --> CheckKill[Проверить смерть цели]
    
    CheckKill --> PostDamageHooks[Вызов OnDamageReceived и OnDamageDealt<br/>(SweepingBlow / Lifesteal / Thorns)]
    PostDamageHooks --> CalcExp[Расчет и начисление опыта]
    CalcExp --> Finish([Return: StatusSuccess])
```

---

## 5. Раундовый цикл и Выполнение стадий (`internal/engine/stages`)

Стадии раунда строго упорядочены:
1. **Silence / Control / Dispel**: снятие баффов, запреты магии.
2. **Defensive Buffs / Auras**: щиты, каменная кожа, магическая стена.
3. **Crowd Control**: Glitch, Madness, Paralysis, Eclipse.
4. **Combat Skills**: Dodge, Parry, Disarm, ShieldBlock, Protect, Regeneration.
5. **Physical Attacks**: базовая атака.
6. **Damaging Magic & DoTs**: Fireball, MagicArrow, Lightning, Bleeding.
7. **Heals & Revives**: Heal spells, HandsHeal, SecondLife, NineLives.

### Исполнение стадии:
```go
func (r *StageRunner) RunStage(stageKey string, b *battle.Battle) {
	orders := b.GetOrdersForAction(stageKey)
	
	for _, order := range orders {
		initiator := b.GetPlayer(order.InitiatorID)
		target := b.GetPlayer(order.TargetID)
		
		if initiator == nil || target == nil || !initiator.IsAlive {
			continue
		}
		
		actionDef := r.registry.Get(stageKey)
		if actionDef == nil {
			continue
		}
		
		ctx := &pipeline.ActionContext{
			Battle:    b,
			Initiator: initiator,
			Target:    target,
			Action:    actionDef,
			Proc:      order.ProcFraction, // 0.0 - 1.0
		}
		
		result := r.pipeline.Execute(ctx)
		b.RecordResult(result)
	}
	
	// Вызов триггеров окончания каста стадии
	for _, p := range b.AlivePlayers() {
		p.Affects.TriggerOnCast(stageKey, b)
	}
}
```

---

## 6. Детализированный план реализации (Phases)

| Фаза | Модуль | Описание задач |
|---|---|---|
| **Фаза 1** | **pkg/dice & pkg/rng** | - Парсер выражений дайсов (`1d20+80`, `2d6`).<br>- Модуль псевдослучайности (`PseudoRandomChance`) с накоплением `FailStreak`.<br>- Табличные unit-тесты распределения вероятностей. |
| **Фаза 2** | **domain/player & domain/affect** | - Структуры `Player`, `Stats`, `Resists`, `Weapon`.<br>- Менеджер аффектов `affect.Manager` с поддержкой хуков жизненного цикла.<br>- Логика старения эффектов `TickRoundEnd()`. |
| **Фаза 3** | **domain/action & registry** | - Определение структуры `ActionDef`.<br>- Реестр умений `ActionRegistry`.<br>- Валидация заказов игроков по типам целей (`OrderType`) и ресурсам. |
| **Фаза 4** | **engine/pipeline** | - Ядро `CombatPipeline` (урон, хил, распределение опыта).<br>- Система перехватчиков (`OnBeforeAction`, `OnBeforeDamageDeal`, `OnBeforeDamageReceive` и др.).<br>- Формирование структурированного боевого лога (`BattleEvent`). |
| **Фаза 5** | **engine/actions (Портирование)** | - Базовая атака и защита (`attack`, `protect`).<br>- Скиллы уклонения/парирования/разоружения (`dodge`, `parry`, `disarm`).<br>- Магии контроля (`eclipse`, `glitch`, `madness`, `paralysis`).<br>- Боевая и длительная магия (`fireball`, `magicArrow`, DoT эффекты).<br>- Лечение (`lightHeal`, `handsHeal`, `regeneration`).<br>- Пассивные умения (`sweepingBlow`, `lacerate`, `nineLives`). |
| **Фаза 6** | **engine/battle & stages** | - Стейт-машина раундов: `INIT` &rarr; `ORDERS` &rarr; `EXECUTE_STAGES` &rarr; `ROUND_END`.<br>- Проверка условий победы (`isTeamWin`, `noDamageRound`, тайм-аут).<br>- Обработка киков/AFK игроков. |
| **Фаза 7** | **Тестирование & Бенчмарки** | - Сравнительные тесты расчёта урона Go vs TypeScript.<br>- Тесты на выявление race conditions (`go test -race`).<br>- Бенчмарки производительности на 10 000 одновременных боёв. |

---

## 7. Верификация и стратегия тестирования

1. **Unit-тесты формул**:
   - `TestDamagePipeline_ResistsAndMods`: проверка совпадения расчёта урона с точностью до тысячных с TS-версией.
   - `TestGlitch_RedirectTarget`: проверка корректности перенаправления цели атаки.
   - `TestEclipse_BlockPhysDamage`: проверка прерывания физической атаки и отсутствия урона.
   - `TestSweepingBlow_Splash`: проверка нанесения вторичного урона и распределения опыта.
2. **Stress & Concurrency Tests**:
   - `TestBattle_ConcurrentRooms`: запуск 5 000 комнат боя параллельно в горутинах.
   - `go test -race -v ./...` без гонок данных.
3. **Симулятор боёв (CLI Simulator)**:
   - Утилита `cmd/engine-sim`, воспроизводящая лог реального боя из Mongo и проверяющая совпадение результатов каждого раунда.
