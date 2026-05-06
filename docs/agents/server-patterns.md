# Серверные паттерны

## CharacterService

Файл: `server/arena/CharacterService/CharacterService.ts`

**Это НЕ PlayerService (игрок в бою).** CharacterService — обёртка над Mongoose-документом `Char`, представляет персонажа вне боя.

### Ключевые методы

| Метод | Описание |
|---|---|
| `static getCharacter(owner)` | Загружает **активного** персонажа по tgId. Фильтр: `{ owner, active: true, deleted: false }` |
| `static getCharacterById(id)` | Загружает персонажа по `_id` (без фильтра `active`). Используется для списков, игр |
| `static getAllCharacters(owner)` | Все не-удалённые персонажи пользователя. Синхронизирует `active` с кешем |
| `saveToDb()` | Сохраняет **все** поля персонажа в БД |
| `save(query)` | Частичное обновление через `updateCharacter` |
| `remove()` | Soft-delete (`deleted: true`) + авто-активация другого персонажа |
| `activate()` | Делает персонажа активным, деактивирует остальных, чистит кеш |
| `toObject()` | Возвращает `Character` для API |

### in-memory поля
```typescript
mm: { status?, time? }    // matchmaking статус и время
isBot: boolean             // true для ботов/монстров
towerID, forestID          // ID текущей башни/леса
gameId                     // ID текущей игры (get/set через mm.status)
```

### Кеш `arena.characters`

```typescript
// Глобальный объект, ключ — character._id.toString()
arena.characters[id] = CharacterService

// Жизненный цикл:
// - Добавляется при getCharacter / getCharacterById / getAllCharacters
// - Удаляется при remove() и activate() (для деактивированных)
// - getAllCharacters синхронизирует active с БД
```

**Важно**: кеш хранит `CharacterService`, у которого `charObj.active` может устареть. `activate()` явно удаляет деактивированных из кеша. `getAllCharacters()` обновляет `cached.charObj.active` из БД.

## API layer (`server/api/`)

Все DB-операции над персонажем — **только через `server/api/character.ts`**:

| Функция | DB-операция | Примечание |
|---|---|---|
| `findCharacter(query)` | `findOne` + populate + toObject | Добавляет `deleted: false` |
| `findCharacters(query)` | `find` + populate + toObject | Без `.lean()` (нужны виртуалы) |
| `hasCharacter(query)` | `exists` | Добавляет `deleted: false, active: true` |
| `createCharacter(obj)` | `create` + деактивация остальных | Убирает старый лимит «1 на owner» |
| `updateCharacter(id, query)` | `findByIdAndUpdate` | |
| `removeCharacter(id)` | `findOneAndUpdate({ deleted: true })` | Soft-delete |
| `deactivateOtherCharacters(owner, excludeId)` | `updateMany` | Явный `new Types.ObjectId(excludeId)` |
| `activateCharacter(id)` | `findByIdAndUpdate` | |
| `activateAnyCharacter(owner)` | `findOne` + `updateOne` | Для авто-активации после удаления |
| `getCharactersByPSR()` | `find` + sort + limit | Ладдер |

## Middleware

### userMiddleware (`server/server/middlewares/userMiddleware.ts`)
- Извлекает Telegram init data из заголовка `Authorization: tma <raw>`
- Валидирует через `@tma.js/init-data-node`
- Сохраняет `user` в контекст Hono (`c.get('user')`)

### characterMiddleware (`server/server/middlewares/characterMiddleware.ts`)
- Вызывает `CharacterService.getCharacter(user.id)` (только активный)
- Если не найден → `HTTPException(401)`
- Сохраняет `character` в контекст (`c.get('character')`)

## HTTP роуты персонажа

Файл: `server/server/character.ts`

```
POST   /character              → userMiddleware → создать (деактивирует старых)
GET    /character/my           → userMiddleware → список своих (все, не только активные)
PATCH  /character/:id/activate → userMiddleware → переключить активного
--- characterMiddleware ---
GET    /character              → активный персонаж
DELETE /character              → удалить активного
PATCH  /character/attributes   → изменить характеристики
GET    /character/dynamic-attributes → расчёт динамических атрибутов
PATCH  /character/notification-settings → настройки уведомлений
GET    /character/list?ids=…   → публичные объекты по ID
```

## WebSocket

### middleware (`server/server/ws/character.ts`)
- Валидирует токен (как userMiddleware)
- Вызывает `CharacterService.getCharacter(user.id)` (активный)
- Сохраняет в `socket.data.character`
- Отклоняет множественные подключения (`checkActiveConnection`)

### Обработчики
- `character` — отправляет `character.toObject()` клиенту
- `lobby:*` — вход/выход из лобби, старт/стоп поиска игры
- `game:*` — действия в бою
- `tower:*`, `forest:*` — аналогично
