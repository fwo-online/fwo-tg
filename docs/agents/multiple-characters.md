# Multiple Characters — несколько персонажей

Фича, добавленная в ветке `feat-multiple-character`. Позволяет пользователю иметь несколько персонажей, переключаться между ними.

## Мотивация

- Раньше: 1 персонаж на Telegram-пользователя (`owner` = уникальный)
- Теперь: `owner` = не уникальный, несколько персонажей, один активный

## Схема

```
Char {
  owner: string;          // Telegram user ID (НЕ уникальный)
  active: boolean;        // default: true — только один активный
  deleted: boolean;       // default: false — soft-delete
  ...
}
```

## Миграция

```bash
cd server && bun run migrate-active
```

Устанавливает `active: true` всем существующим не-удалённым персонажам.

## Инварианты

- **Только один активный персонаж на owner** (поддерживается в `createCharacter`, `activate`, `remove`)
- `createCharacter` деактивирует остальных перед созданием нового
- `activate()` деактивирует остальных, оставляет только целевого
- `remove()` при удалении активного авто-активирует любого другого

## Проблемы с кешем (и их решения)

### Проблема
`arena.characters` кеширует `CharacterService` экземпляры. При деактивации персонажа его `charObj.active` остаётся `true` в кеше.

### Решения

1. **`activate()`** — удаляет деактивированных из `arena.characters`:
```typescript
for (const id of Object.keys(arena.characters)) {
  if (arena.characters[id].owner === this.owner && id !== this.id) {
    delete arena.characters[id];
  }
}
```

2. **`getAllCharacters()`** — синхронизирует `active` из БД:
```typescript
if (cached) {
  cached.charObj.active = char.active;  // свежие данные из БД
  return cached;
}
```

3. **`deactivateOtherCharacters()`** — явный `new Types.ObjectId(excludeId)` в `$ne`:
```typescript
{ owner, _id: { $ne: new Types.ObjectId(excludeId) }, deleted: false }
```
Mongoose не всегда авто-кастит строку в ObjectId внутри оператора `$ne`.

## API

### Сервер

| Метод | Путь | Описание |
|---|---|---|
| GET | `/character/my` | Список всех персонажей пользователя |
| PATCH | `/character/:id/activate` | Сделать персонажа активным (403 если чужой) |
| GET | `/character/list?ids=...` | Публичные объекты по ID (без изменений) |

### Клиент

```typescript
getMyCharacters()      → GET /character/my
activateCharacter(id)  → PATCH /character/:id/activate
```

## Клиентский UX

### `/create` (CharacterCreatePage)
- Вне ProtectedRoute (нет WebSocket)
- `getMyCharacters()` на mount
- 0 персонажей → сразу форма создания
- Есть персонажи → список + «Создать нового» (скрывает/показывает форму)
- Активный: «Войти» → `navigate('/character')`
- Неактивный: «Сменить» → `activateCharacter(id)` → `window.location.reload()`
- После создания: `window.location.href = '/'` (пройти ProtectedRoute)

### `/settings` (SettingsPage)
- Внутри ProtectedRoute
- Секция «Персонажи»: список + кнопки «Активен»(disabled)/«Сменить»
- «Создать нового» → `navigate('/create')`
- «Удалить текущего» → `deleteCharacter()` → `window.location.reload()`

## Перезагрузка страницы

После операций, меняющих активного персонажа, нужен **полный reload** (не SPA-навигация):
- WebSocket должен переподключиться с новым активным персонажем
- ProtectedRoute загружает нового персонажа через `getCharacter`

Точки reload:
- Создание персонажа → `window.location.href = '/'`
- Активация → `window.location.reload()`
- Удаление → `window.location.reload()`

## Файлы, затронутые фичей

### Сервер
- `server/models/character.ts` — поле `active`
- `server/api/character.ts` — `findCharacters`, `deactivateOtherCharacters`, `activateCharacter`, `activateAnyCharacter`
- `server/arena/CharacterService/CharacterService.ts` — `getCharacter(owner)` +active, `getAllCharacters`, `activate()`, `remove()` авто-активация
- `server/server/character.ts` — роуты `/my`, `/:id/activate`
- `server/cli/migrateActive.ts` — миграция
- `shared/character/characterSchema.ts` — `active?: boolean`

### Клиент
- `client/api/character.ts` — `getMyCharacters()`, `activateCharacter()`
- `client/modules/character/pages/CharacterCreatePage.tsx` — список + форма
- `client/modules/settings/pages/SettingsPage.tsx` — секция «Персонажи»
- `client/modules/settings/hooks/useSettingsCharacter.ts` — reload после удаления
- `client/components/ProtectedRoute.tsx` — `hydrated` state
