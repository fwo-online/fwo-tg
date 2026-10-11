# Унификация веток магии и физических навыков: план следующего спринта

> **Для Hermes:** выполнять план последовательно, небольшими задачами, с TDD и отдельной проверкой каждого серверного контракта. Существующие audit/spec-документы не изменять; расхождения фиксировать в решениях, коде и тестах.

**Goal:** заменить `magicBranches` единой валидируемой моделью `branches: BranchKey[]`, добавить одну опциональную дополнительную профессию без отдельной прогрессии, закрыть обходы авторизации для магий, активных и пассивных умений, реализовать выбор веток и полный branch-aware каталог для магических и физических классов, а также выпустить общий UI для Лучника и Воина.

**Architecture:** текущая профессия остаётся первичной в `prof: CharacterClass`; модель получает опциональное `secondProf?: CharacterClass`, а getter `classes` возвращает `[prof]` и добавляет `secondProf`, если он задан. Это совместимый шов для проверки принадлежности ветки, а не реализация смешанной прогрессии: независимые уровни, отдельная экономика и полноценная механика комбинаций классов остаются будущей работой. Персонаж хранит один глобальный массив `branches` максимум из двух элементов; второй слот открывается на 10-м уровне. Единый каталоговый/access validator используется для магий, active skills и passive skills.

**Tech Stack:** Bun, TypeScript, `@fwo/shared`, Hono, Valibot, Hono RPC, Mongoose/MongoDB, Bun Test, Svelte 5/SvelteKit, Biome.

---

## 1. Текущий контекст и подтверждённые факты

- `shared/actions/branches.ts` уже содержит `BranchKey`, ветки Воинов/Лучников/Магов/Жрецов, `BranchMeta.prof` и `MAX_BRANCHES = 2`; значение `SECOND_BRANCH_MIN_CHAR_LVL` нужно привести к уровню 10 и проверить по всем consumers.
- `shared/character/characterSchema.ts` и `server/models/character.ts` сейчас используют `magicBranches`; канонического `branches` нет.
- `Char.prof`/`Character.class` — фактическая первичная профессия. Поля `secondProf` и `classes` getter ещё не реализованы.
- `CharacterService` имеет `magicBranches`, `setMagicBranches`, `resetMagics`; `saveToDb()` ловит и только логирует ошибки. Эта модель сохранения не расширяется в атомарный/concurrency-aware механизм в данном спринте.
- `MagicService` умеет выбирать магическую ветку и изучать магию, но использует только `character.prof`, legacy `magicBranches` и отдельные записи. `POST /magic/:lvl` остаётся legacy-путём; `/magic/reset` закомментирован.
- `SkillService` и `PassiveSkillService` не обеспечивают единое branch enforcement; active skill допускает чужой класс при обходном условии, а пассивный каталог смешивает learnable, item-only, monster/internal записи.
- `GET /skill`, `GET /skill/:id`, `GET /passiveSkill`, `GET /passiveSkill/:id` не фильтруют каталог по персонажу. Магические списки и `GET /magic/:id` также требуют строгой проверки профессии, ветки и неизвестного ID.
- Клиент — Svelte 5 в `client/`. Текущие экраны: `client/src/routes/(app)/character/skills/+page.{ts,svelte}`, `passiveSkills/+page.{ts,svelte}`, `magics/+page.{ts,svelte}`. У магий уже есть выбор ветки; у физического дерева общего выбора веток нет.
- Документация фиксирует отсутствие физического выбора веток, неполное branch enforcement, неатомарное изучение, каталоговые расхождения и нехватку HTTP/failure/concurrency-тестов. Аудиты и specs — входные требования, но сами файлы документации в спринте не менять.
- Все документированные branch abilities входят в текущий scope. В частности, отсутствующие документированные Warrior abilities (`shieldBash`, `bloodRage`, `execute`, `vitalStrike` и остальные записи из `docs/agents/warrior-archer-skills.md`/`docs/agents/subclasses.md`) нужно сверить с каталогом и либо реализовать, либо явно привести каталог и исполняющую механику к согласованному рабочему контракту в рамках отдельных задач этого плана; нельзя молча исключать их из спринта.

## 2. Решения до начала кодирования

Это обязательная design-gate задача. Остальные задачи начинаются только после фиксации решений в PR/issue или в комментарии к плану.

### Зафиксированные решения

- Порог второй ветки — уровень 10 (`character.lvl >= 10`).
- В игре нет пользователей: не переносить существующие записи персонажей, прогресс или ресурсы. Удалить `magicBranches` напрямую из схемы, модели, сервиса и consumers; канонический `branches: BranchKey[]` для новых персонажей имеет default `[]`. Legacy reader не нужен.
- Не сбрасывать `magics`, `skills`, `passiveSkills` и не выдавать компенсацию, XP, `free` или `bonus`. Не создавать миграционный CLI, backup, rollback, marker или dry-run.
- Старые `branch`-поля удаляются после перевода consumers на `branches`; не оставлять deprecated alias.
- Legacy `POST /magic/:lvl` и его клиентский caller удаляются, не заменяются endpoint-ом с кодом 410.
- Для контролируемых ошибок валидации ветки/действия используется существующий `ValidationError`; ошибки сохранения не подавляются и не выдаются за успешный ответ.

### 2.1. Поле дополнительной профессии и getter

Зафиксировать канонический контракт:

```ts
prof: CharacterClass;
secondProf?: CharacterClass;
get classes(): CharacterClass[]; // [prof] плюс secondProf, если он задан
```

- `prof` всегда первый и не дублируется в `classes`.
- `secondProf` опционален, не имеет собственного уровня и не создаёт отдельную веточную квоту.
- `classes` возвращает уникальный массив и является единственной точкой, которую branch eligibility использует для проверки принадлежности класса.
- `secondProf` — единственное имя поля во всех слоях; optional/nullable storage допускается только для представления персонажа без второй профессии. Публичный DTO использует то же имя и семантику, без параллельного `professions` contract.
- Это compatibility seam для одной или двух доступных профессий, не полноценная реализация смешанных классов: независимые уровни, независимые skill trees и cross-class progression не входят в sprint.

### 2.2. Канонический `branches`

Зафиксировать `branches: BranchKey[]` как единственный источник истины:

- максимум 2 уникальные ветки на персонажа в целом;
- первая ветка доступна по текущему правилу, второй слот открывается при `character.lvl >= 10`;
- ветка допускается, если `BranchMeta.prof` входит в `character.classes`;
- `magicBranches` удаляется напрямую из schema/model, domain и consumers; `branches` для новых персонажей по умолчанию `[]`. Не читать legacy поле и не преобразовывать старые записи;
- старые `branch`-поля в DTO/definition удаляются после перевода consumers на канонический `branches`; alias первого элемента не оставляется.

## 3. Scope и non-goals

### Входит в спринт

- Shared/storage-контракт `prof` + optional `secondProf` + `classes` getter и единый `branches: BranchKey[]`.
- Прямое удаление `magicBranches` и введение `branches: BranchKey[]` с default `[]` для новых персонажей без обработки существующих записей.
- Глобальный лимит в 2 ветки и открытие второго слота на уровне 10.
- Общий branch/class/level/rank/source-category validator для `magics`, `skills` и `passiveSkills`.
- Branch selection/enforcement/catalog для магических и физических веток, включая Warrior и Archer.
- Reconciliation всех документированных branch abilities и каталогов, включая отсутствующие Warrior abilities; если объём велик, разделить на несколько задач, но не переносить их в non-goals.
- Защищённые branch-aware HTTP read/write API и закрытие legacy bypass.
- Archer/Warrior UI на общем selector/catalog контракте.
- Unit, HTTP, failure-path и regression tests.

### Не входит

- Полноценная смешанная механика классов, независимые уровни/экономика для `secondProf`, cross-class progression и новые правила subclass progression.
- Respec/reset: нет реализации endpoint, сервисов, возврата ресурсов, reset UI или кнопок в этом спринте.
- Перенос/изменение существующих записей персонажей и прогресса, очистка изученных действий и компенсация XP/ресурсов.
- Углубление Mongo persistence до транзакционного или concurrency-safe протокола; atomic persistence/concurrency hardening — отдельный future follow-up. В этом спринте не добавлять новую транзакционную инфраструктуру и не выдавать текущие последовательные saves за атомарность.
- Изменение существующих audit/spec-документов.
- Переписывание клиентского navigation shell; используются существующие SvelteKit routes и store/context.

## 4. Последовательные задачи

### Task 1: Зафиксировать domain decisions и контракт новых персонажей

**Цель:** закрыть неоднозначности до изменения схем и сервисов.

**Статус:** design gate закрыт: решения утверждены, контракт зафиксирован ниже. Можно переходить к Task 2.

**Файлы для решения/проверки:**
- `shared/character/characterSchema.ts`
- `shared/character/characterClassSchema.ts`
- `shared/actions/branches.ts`
- `server/models/character.ts`
- `docs/agents/subclasses.md` — только прочитать, не изменять
- `docs/agents/magic-system.md` и `docs/specs/magic-branches-plan.md` — только прочитать, не изменять

**Действия:**
1. Зафиксировать каноническое имя `secondProf`, тип `CharacterClass`, optional/nullable storage только для отсутствующей второй профессии и одноимённый публичный DTO.
2. Зафиксировать, что `classes` — `[prof]` плюс `secondProf` без дублей и без независимых уровней.
3. Зафиксировать global `MAX_BRANCHES = 2`, `SECOND_BRANCH_MIN_CHAR_LVL = 10` и прямое удаление `magicBranches` без legacy reader.
4. Зафиксировать default `branches: []` для новых персонажей; не изменять существующие записи, изученные действия, прогресс или ресурсы.
5. Составить contract matrix: новый single-class, character с `secondProf`, invalid/duplicate/foreign branch.

**Contract matrix:**

| Состояние | Каноническое чтение/проверка | Запись |
|---|---|---|
| Новый персонаж с одной профессией | `classes` равно `[prof]`; разрешены только ветки, у которых `BranchMeta.prof` совпадает с `prof`; лимит глобальный — две ветки, второй слот с уровня 10. | `branches: []` по умолчанию; `secondProf` отсутствует либо `null` в storage. |
| Персонаж с `secondProf` | `classes` — уникальные `[prof, secondProf]`; ветка допустима, если её профессия входит в `classes`. Уровень и квота веток общие; отдельная прогрессия второго класса не появляется. | Пишутся `secondProf` и `branches`; дубликат `secondProf === prof` не дублирует класс в `classes`. |
| Неизвестная, повторная или чужая ветка в selection/API | Отклонить с `ValidationError`, без изменения состояния. Для чужой ветки принадлежность проверяется по `character.classes`, не по одному `prof`. | Не сохранять невалидный список и не нормализовать его молча; невалидный selection не меняет документ. |

**Проверка:** decision record содержит все пять пунктов; в плане/issue нет альтернативного имени поля, альтернативного порога ветки или требований переноса данных.

### Task 2: Расширить shared character и branch contract

**Файлы:**
- Modify: `shared/character/characterSchema.ts`
- Modify: `shared/character/characterPublic.ts` при необходимости публичного DTO
- Modify: `shared/actions/branches.ts`
- Modify: `shared/actions/index.ts`
- Create/modify: `shared/actions/branches.test.ts`

**Действия:**
- Добавить typed `secondProf?: CharacterClass` (nullable/отсутствующий только когда второй профессии нет) и getter/эквивалентный shared helper `classes`, реализующий `[prof]` плюс дополнительный класс без дублей.
- Добавить typed `branches: BranchKey[]` с default `[]` при создании нового персонажа; удалить `magicBranches` из контракта без compatibility type.
- Привести `SECOND_BRANCH_MIN_CHAR_LVL` к 10 и обеспечить `MAX_BRANCHES = 2`.
- Добавить `ActionSourceCategory = 'learnable' | 'itemOnly' | 'combatInternal' | 'monsterOnly'` или утверждённый эквивалент.
- Добавить helpers для валидного branch id, уникальности, лимита, класса ветки и branch selection state.

**TDD:** сначала тесты на `classes`, неизвестную ветку, дубликаты, больше двух веток, ветку чужого класса и границы уровней 9/10; затем минимальная реализация.

**Проверка:** из корня `bun run --filter '@fwo/shared' types` и целевой `bun test` для shared-тестов.

### Task 3: Перевести Mongoose Character и CharacterService на storage contract

**Файлы:**
- Modify: `server/models/character.ts`
- Modify: `server/api/character.ts`
- Modify: `server/arena/CharacterService/CharacterService.ts`
- Modify: `server/utils/testUtils.ts`
- Tests: `server/arena/CharacterService/CharacterService.test.ts`

**Действия:**
- Добавить `secondProf: CharacterClass` и `branches: BranchKey[]` в `Char`/schema; хранить `secondProf` optional/nullable только для персонажей без второй профессии, default `branches: []` для новых персонажей и валидировать безопасно.
- Реализовать `classes` getter на CharacterService/domain object по решению Task 1.
- Удалить `magicBranches`/`setMagicBranches` из схемы, модели, CharacterService и consumers напрямую. Читать и писать только `branches`, без fallback на старое поле и без преобразования существующих документов.
- Перенести `toObject()` и публичные DTO на `branches`/`secondProf`; не сбрасывать `magics`, `skills`, `passiveSkills` и не трогать прогресс/ресурсы.
- Оставить текущую модель `saveToDb()` без попытки сделать её транзакционной; ошибки не маскировать в новых branch endpoints.

**Тесты:** создание нового персонажа с `branches: []`, round-trip новых полей, отсутствие `magicBranches` в новом контракте, unique classes, rejection invalid/duplicate/foreign branches, level 9/10 boundary, отсутствие второй профессии; без проверки преобразования старых записей.

### Task 4: Провести полную catalog reconciliation для всех branch abilities

**Файлы:**
- Modify: `server/arena/skills/index.ts` и definitions в `server/arena/skills/*.ts`
- Modify: `server/arena/passiveSkills/index.ts` и definitions в `server/arena/passiveSkills/*.ts`
- Modify: `server/arena/weaponMastery/index.ts` и definitions в `server/arena/weaponMastery/*.ts`
- Modify: `server/arena/magics/*.ts`
- Modify: соответствующие effect/constructor/battle files для реально отсутствующих abilities
- Create/modify: `server/arena/catalog-invariants.test.ts`

**Действия:**
- Составить inventory по `docs/agents/warrior-archer-skills.md`, `docs/agents/subclasses.md`, `docs/specs/magic-branches-plan.md` и текущим exports.
- Для каждой документированной Warrior/Archer/Mage/Priest ability определить рабочий action id, branch, class, required level, max rank, cost, source category и runtime effect.
- Реализовать отсутствующие документированные Warrior abilities, включая `shieldBash`, `bloodRage`, `execute`, `vitalStrike` и остальные найденные в inventory, либо в тех же задачах привести их definition, constructor и battle/effect wiring к рабочему контракту. Нельзя просто объявить их `missing` или исключить из learn catalog.
- Согласовать hybrid definitions, `mediumAura`, weapon mastery и passive entries; убрать противоречивые `branch`/`branches`.
- Разделить learnable, item-only, combat-internal и monster-only записи; последние три не должны попадать в character learn catalog.

**Инварианты:** каждый learnable action имеет допустимые class/branches, source category, положительный max rank/cost и исполняемую механику; все документированные branch abilities либо работают, либо имеют зафиксированное в коде согласованное поведение, подтверждённое тестом.

### Task 5: Собрать единый catalog/access validator

**Файлы:**
- Create: `server/arena/ActionAccessService.ts` (или утверждённое имя общего доменного сервиса)
- Create: `server/arena/ActionAccessService.test.ts`
- Modify: `server/arena/MagicService.ts`
- Modify: `server/arena/SkillService.ts`
- Modify: `server/arena/PassiveSkillService.ts`
- Modify: `server/arena/Constuructors/SkillConstructor.ts`
- Modify: `server/arena/Constuructors/PassiveSkillConstructor.ts`

**Контракт:** `canAccessAction(character, action, sourceCategory)` в одном месте проверяет:

1. source/category: только `learnable` доступен в learn API;
2. class: хотя бы один класс из `character.classes` соответствует `profList`;
3. level: required level по текущему общему `character.lvl` и утверждённому контракту, без независимых уровней `secondProf`;
4. branch: action имеет canonical non-empty `branches`, и хотя бы одна ветка выбрана персонажем;
5. rank: current rank в `0..maxRank`, следующая ступень существует;
6. controlled reason code/message для HTTP и UI.

Для hybrid actions использовать OR по подходящим классам и веткам. `character.classes` здесь только совместимый шов для одной/двух профессий, а не разрешение полноценной cross-class progression. Не доверять отдельному `branch` вместо `branches`.

**Тесты:** class × branch × action × level × rank × source category, включая `beastCall`, `terrifyingHowl`, `criticalStrike`, weapon mastery, magic hybrids, `bonusCost: []`, missing/invalid catalog entries и все новые Warrior abilities.

### Task 6: Реализовать общий BranchService и selection API

**Файлы:**
- Create: `server/arena/BranchService.ts`
- Create: `server/arena/BranchService.test.ts`
- Create: `server/server/branch.ts`
- Modify: `server/server/index.ts`
- Modify: `server/server/magic.ts` для временных compatibility aliases

**API-контракт:**
- `GET /branch` возвращает ветки, допустимые для `character.classes`, `selectedBranches`, `maxBranches: 2`, `secondBranchMinLvl: 10`, `canSelect` и `lockReason`.
- `POST /branch/select` с body `{ branch: BranchKey }` проверяет существование, class ownership, duplicate, global limit и level gate, затем сохраняет выбранную ветку.
- Старые `/magic/branches` и `/magic/branch` временно делегируют тот же service, но не принимают произвольный `string` cast.
- Не добавлять `/branch/reset`, `/magic/reset` или иной respec endpoint.

**Тесты:** wrong class, unknown branch, duplicate, уровень 9/10, третья ветка, alias API, unauthorized character middleware, invalid body и выбор ветки новым персонажем с `branches: []`.

### Task 7: Перенести branch enforcement в magic и закрыть magic bypass

**Файлы:**
- Modify: `server/arena/MagicService.ts`
- Modify: `server/server/magic.ts`
- Modify: `server/lib`/utilities, если legacy `learnMagic` вызывается клиентом
- Tests: `server/arena/MagicService.test.ts`

**Действия:**
- Все magic learn/read paths используют `ActionAccessService`, `character.classes` и canonical `branches`.
- `getBranchMagics` валидирует branch id и class ownership до фильтрации.
- Удалить `POST /magic/:lvl` вместе с client caller; не заменять его endpoint-ом 410 и не допускать обхода branch/class/rank/source validation.
- Unknown id, чужая ветка, невыбранная ветка и недоступный source дают контролируемый `ValidationError`.
- Не добавлять reset/respec route и не возвращать старое поведение `resetMagics` как пользовательский API.

### Task 8: Перенести enforcement в active/passive skills и physical catalog

**Файлы:**
- Modify: `server/arena/SkillService.ts`
- Modify: `server/arena/PassiveSkillService.ts`
- Modify: `server/server/skill.ts`
- Modify: `server/server/passiveSkill.ts`
- Modify: skill/passive constructors and definitions as needed
- Tests: `server/arena/SkillService.test.ts`, `server/arena/PassiveSkillService.test.ts`

**Действия:**
- Active/passive learn paths используют тот же validator и не допускают чужой class, unselected branch, item-only, internal или monster-only action.
- Устранить обход с `profList[char.prof] === undefined` и аналогичные truthiness/undefined checks.
- Обеспечить branch metadata для Warrior и Archer (`guardian`, `berserker`, `duelist`, `marksman`, `barrage`, `scout`) и всех документированных физических веток.
- Вернуть server-authoritative rank/cost/lock state; не считать client enabled state авторизацией.

### Task 9: Переписать character-aware read APIs

**Файлы:**
- Modify: `server/server/magic.ts`
- Modify: `server/server/skill.ts`
- Modify: `server/server/passiveSkill.ts`
- Modify: `server/arena/MagicService.ts`
- Modify: `server/arena/SkillService.ts`
- Modify: `server/arena/PassiveSkillService.ts`
- Create: `server/server/action-read-api.test.ts`

**Действия:**
- `GET` list/`/:id` возвращает только записи допустимого source и релевантных `character.classes`; unknown ID даёт controlled 400/ValidationError.
- Available endpoints возвращают `requiredLevel`, `currentRank`, `maxRank`, `nextCost`, `canLearn`, `lockReason`, `branches` и `sourceCategory`.
- Locked entries можно показывать только из классов персонажа, чтобы объяснить причину блокировки; чужие class/monster/internal entries не выдавать.
- Проверка branch ownership выполняется до фильтрации magic list и physical list.

### Task 10: Закрыть HTTP write authorization и явно оставить persistence hardening на будущее

**Файлы:**
- Modify: `server/server/branch.ts`
- Modify: `server/server/magic.ts`
- Modify: `server/server/skill.ts`
- Modify: `server/server/passiveSkill.ts`
- Modify: `server/server/utils/withValidation.ts` при необходимости error envelope
- Create: `server/server/action-write-api.test.ts`

**Проверки:**
- Все routes используют `userMiddleware` + `characterMiddleware` и не принимают произвольный character id из body.
- Valibot schemas используют enum/union для branch/action ids; unknown id/branch — 400.
- Контролируемые branch/action validation errors используют существующий `ValidationError` и проходят через `withValidation`; save/DB errors не подавляются и не маскируются под успешный 200.
- Direct POST на foreign class, unselected branch, source not learnable, max rank, insufficient resource и stale/invalid payload не проходит.
- Старые client utilities и legacy route не могут вызвать обход.

**Ограничение:** не менять в этом sprint модель последовательных saves на Mongo transaction/optimistic concurrency protocol. Полная атомарность ресурса + rank, failure injection и concurrency hardening фиксируются отдельным future follow-up; текущие тесты проверяют только текущий согласованный error behavior и отсутствие новых bypass.

### Task 11: Обновить client API и общий branch selector

**Файлы:**
- Create: `client/src/lib/branch/components/BranchSelector.svelte`
- Create: `client/src/lib/branch/utils/select-branch.svelte.ts`
- Modify: `client/src/lib/api.ts`
- Modify: `client/src/routes/(app)/character/+page.svelte`
- Modify: `client/src/routes/(app)/character/magics/+page.ts`
- Modify: `client/src/routes/(app)/character/magics/+page.svelte`

**UI contract:**
- Selector получает server `branchesInfo`, показывает только ветки `character.classes`, selected/available/locked и точную `lockReason`.
- Select action вызывает server и после success инвалидирует `app:character`, branch info и все три action catalogs; не добавлять optimistic respec/reset.
- Ошибки используют существующий request/popup pattern; pending блокирует повторный click.
- Магический UI прекращает использовать `magicBranches` и legacy `learnMagic`, использует общий response и сохраняет branch-specific tabs.
- В UI нет reset/respec controls, utilities или вызовов `/magic/reset`.

### Task 12: Выпустить branch-aware Archer и Warrior UI

**Файлы:**
- Modify: `client/src/routes/(app)/character/skills/+page.ts`
- Modify: `client/src/routes/(app)/character/skills/+page.svelte`
- Modify: `client/src/routes/(app)/character/passiveSkills/+page.ts`
- Modify: `client/src/routes/(app)/character/passiveSkills/+page.svelte`
- Modify: `client/src/lib/skill/utils/learn-skill.svelte.ts`
- Modify: `client/src/lib/passive-skill/utils/learn-passive-skill.svelte.ts`
- Modify: `client/src/lib/passive-skill/components/PassiveSkillDescription.svelte`
- Modify/create: shared components under `client/src/lib/branch/components/`

**Действия:**
- Загружать branch-aware active/passive catalogs из API, а не фильтровать доступ только по client `classList`.
- Для Лучника показать `marksman`, `barrage`, `scout`; для Воина — `guardian`, `berserker`, `duelist`, с labels, selected state, current rank, next cost, required level, lock reason, pending/error.
- Использовать один selector/catalog component без копирования branch logic.
- Не показывать learn button для non-learnable source; после learn перечитать character/catalog, чтобы resource/rank/lock state оставались server truth.
- Обработать empty catalog, invalid selected action, refresh с исчезнувшим action и duplicate labels.

### Task 13: Завершить HTTP/catalog regression matrix

**Файлы:**
- Modify/create: `server/arena/branches.contract.test.ts`
- Modify/create: `server/arena/BranchService.test.ts`
- Modify/create: `server/arena/ActionAccessService.test.ts`
- Modify: `server/arena/MagicService.test.ts`
- Modify: `server/arena/SkillService.test.ts`
- Modify: `server/arena/PassiveSkillService.test.ts`
- Modify: `server/server/action-read-api.test.ts`
- Modify: `server/server/action-write-api.test.ts`
- Modify: `server/arena/catalog-invariants.test.ts`

**Обязательная матрица:**
- single primary class и primary + `secondProf`; `classes` без дублей;
- first branch, second branch на уровне 9/10, third branch, unknown/duplicate/foreign branch;
- Warrior, Archer, Mage и Priest branch paths; все документированные branch abilities, включая новые Warrior abilities;
- active, passive, magic, hybrid action; learnable, item-only, internal, monster-only;
- current rank 0/max/malformed, missing catalog metadata, insufficient resource;
- создание нового персонажа с `branches: []`, отсутствие `magicBranches` в новых схемах/DTO/client paths, сохранение `magics`, `skills`, `passiveSkills` и ресурсов при выборе ветки; без тестов преобразования существующих записей;
- HTTP auth/middleware, invalid body, unknown id и legacy bypass closure.

HTTP tests вызывают реальный exported Hono `app` (`server/server/index.ts`) с test middleware/auth setup, а не только unit-call service. Не добавлять concurrency/transaction acceptance: это будущая отдельная работа.

### Task 14: Final client/server integration verification

**Действия:**
- Проверить generated Hono RPC types после route changes; client не должен содержать casts `as MagicBranchId` для обхода validator.
- Проверить, что после branch selection/learn client state и catalog lock state соответствуют server response и `branches`, а `magicBranches` нигде не используется production client code.
- Пройти browser smoke: новый Archer → выбрать `marksman` → увидеть catalog → изучить доступный skill → достичь/смоделировать уровень 10 → выбрать вторую ветку → увидеть physical hybrid action; повторить для Warrior.
- Проверить Mage/Priest magic path и создание нового персонажа с пустым `branches`.
- Убедиться, что в интерфейсе и API отсутствуют reset/respec controls/routes.

### Task 15: Финальный quality gate и отчёт без изменения audit docs

**Точные команды:**

```bash
cd /home/evgewa/projects/fwo-tg/server
bun test arena/branches.contract.test.ts arena/BranchService.test.ts arena/ActionAccessService.test.ts
bun test arena/MagicService.test.ts arena/SkillService.test.ts arena/PassiveSkillService.test.ts
bun test server/action-read-api.test.ts server/action-write-api.test.ts
bun test
bun run types
bun run lint
```

Затем из клиентского workdir:

```bash
cd /home/evgewa/projects/fwo-tg/client
bun run check
bun run build
bun run lint
cd /home/evgewa/projects/fwo-tg
bun run test
bun run types
bun run lint
bun run build
```

В hand-off указать реальные команды, workdir и pass/fail counts. Перед merge проверить `git diff -- docs/agents docs/specs`: audit/spec-документы не должны быть изменены этим спринтом. Отдельно отметить, что persistence/concurrency hardening и respec не выдаются за выполненные задачи.

## 5. Acceptance criteria

- `Character` и Mongo documents имеют `prof`, `secondProf: CharacterClass` с optional/nullable storage только при отсутствии второй профессии и getter `classes`, который возвращает уникальный `[prof]` плюс `secondProf`; независимых уровней для второго класса нет.
- Один глобальный валидированный `branches: BranchKey[]` ограничен двумя ветками; второй слот открывается ровно с уровня 10; у новых персонажей default `[]`. `magicBranches` удалён напрямую из схемы, модели, сервиса, DTO и production consumers без legacy reader и обработки существующих записей.
- Branch eligibility для ветки использует `character.classes` и `BranchMeta.prof`; это совместимый шов для одной/двух профессий, а не полноценная mixed-class progression.
- Один validator проверяет branch existence/ownership, class membership, level, rank, source category и возвращает контролируемую причину для magic, active и passive learn paths.
- Direct HTTP requests не могут изучить чужую class/branch, невыбранную ветку, unknown или non-learnable action; read APIs не раскрывают нерелевантные/unknown entries и legacy bypass закрыт.
- Catalog reconciliation покрывает все документированные ветки и abilities, включая отсутствующие Warrior abilities; у каждого learnable action есть согласованные definition, branch metadata, rank/cost и runtime behavior.
- Нет переноса записей или сброса `magics`, `skills`, `passiveSkills`; прогресс и ресурсы не изменяются и не компенсируются. Нет миграционного CLI, backup/rollback, marker и dry-run.
- Archer UI поддерживает выбор `marksman`/`barrage`/`scout`, branch-aware active/passive catalogs, rank/cost/level/lock state, server errors и pending protection; тот же shared UI/API корректен для Warrior и магических веток.
- В sprint нет respec/reset endpoint, service, UI или acceptance requirement.
- Atomic persistence/concurrency hardening, включая новую Mongo transaction/optimistic concurrency infrastructure, явно оставлены отдельным future follow-up и не заявлены как результат этого sprint.
- Targeted/full Bun tests, `bun run types`, `bun run lint`, client check/build/lint и root gates проходят; audit/spec docs не изменены.

## 6. Риски и оставшиеся решения

- **Catalog reconciliation size:** inventory может выявить больше отсутствующих Warrior abilities, чем перечислено в текущем audit; работу можно разделить на несколько implementation tasks, но нельзя убрать найденные documented abilities из scope.
- **HTTP error shape:** контролируемые branch/action validation errors используют `ValidationError`; ошибки сохранения не подавляются.
- **Client test tooling:** если в `client/package.json` нет dedicated test script, использовать `bun run check/build` и browser smoke, не добавляя отдельный runner без отдельного решения.
