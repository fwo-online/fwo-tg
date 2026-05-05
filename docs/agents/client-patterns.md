# Клиентские паттерны

## Роутинг

Файл: `client/router.tsx`

```
/                          → редирект на /character
/create                    → CharacterCreatePage (без ProtectedRoute!)
--- ProtectedRoute ---     (middleware: WebSocket, loader: getCharacter)
  /character/*             → страницы персонажа
  /lobby/*                 → лобби (арена, практика, лес)
  /settings                → настройки
  /agora/*                 → рынок
  /game/:gameID            → игра
  /tower/:towerID          → башня
  /forest/:forestID        → лес
/error                     → ошибка
/connection-error          → ошибка подключения
*                          → редирект на /character
```

**Важно**: `/create` — **единственная** страница вне ProtectedRoute. Не имеет WebSocket, не требует активного персонажа.

## ProtectedRoute

Файл: `client/components/ProtectedRoute.tsx`

```typescript
middleware (WebSocket) → loader (GET /character) → компонент
                                                        ├─ useEffect: setCharacter(character)
                                                        ├─ !character     → Navigate /
                                                        ├─ !hydrated      → HydrateFallback
                                                        └─ hydrated       → ProtectedRouteGuards + дети
```

**Гидратация стора** (`hydrated` state): `setCharacter` вызывается в `useEffect`, а не в теле компонента (избегает «Cannot update a component while rendering»).

**HydrateFallback**: показывает «Загрузка...» пока стор не готов.

## Zustand сторы

### useCharacterStore (`client/modules/character/store/character.ts`)

```typescript
interface CharacterState {
  character: Character | undefined;
  setCharacter: (c?: Character) => void;
  setGame: (game?: string) => void;
  setTower: (tower?: string) => void;
  setForest: (forest?: string) => void;
  setClan: (clan: Clan) => void;
}
```

`useCharacter()` — хук-селектор, бросает `'Character is not loaded'` если `character === undefined`.

## API клиент

Файл: `client/api/index.ts`

```typescript
// Типизированный Hono RPC клиент
export const client = hc<Server>(VITE_API_URL, {
  headers: () => ({ Authorization: `tma ${initData.raw()}` }),
});

// Обработчик запросов: ok → json, не ok → throw
export const createRequest = (method) => async (args) => {
  const res = await method(args);
  if (res.ok) return res.json();
  throw new Error(await res.text());
};
```

### API персонажа (`client/api/character.ts`)

```typescript
getCharacter()            → GET /character
getMyCharacters()         → GET /character/my
createCharacter(dto)      → POST /character
activateCharacter(id)     → PATCH /character/:id/activate
deleteCharacter()         → DELETE /character
getCharacterList(ids)     → GET /character/list?ids=...
```

## WebSocket

```typescript
createWebSocket() → Socket.IO connect
  auth: { authorization: `tma ${initData.raw()}` }
```

Контекст: `SocketContext` (из `client/context/socket.tsx`)

## Страницы

### CharacterCreatePage
- Вне ProtectedRoute → нет WebSocket, нет активного персонажа
- `getMyCharacters()` на mount
- Если 0 персонажей → сразу форма создания (SelectCharacter)
- Если есть → список + кнопка «Создать нового»
- Активный: кнопка «Войти» → navigate /character
- Неактивный: кнопка «Сменить» → activateCharacter + reload
- Создание: `window.location.href = '/'` (чтобы пройти ProtectedRoute)

### SettingsPage
- Внутри ProtectedRoute → есть активный персонаж
- Секция «Персонажи»: список всех, кнопки «Активен»/«Сменить»
- «Создать нового» → navigate /create
- «Удалить текущего» → deleteCharacter + reload
- «Управление аккаунтом» — только если есть клан

### CharacterPage
- Главная страница персонажа: карточка с классом/уровнем/опытом
- Навигация: Характеристики, Магии/Умения, Пассивные, Инвентарь, Клан

## Общие компоненты

| Компонент | Файл | Назначение |
|---|---|---|
| `AppLayout` | `client/components/AppLayout.tsx` | Нижняя навигация (Персонаж, Мир, Рынок) + Outlet |
| `ProtectedRoute` | `client/components/ProtectedRoute.tsx` | WebSocket + загрузка персонажа |
| `Card` | `client/components/Card/Card.tsx` | Карточка с заголовком |
| `Button` | `client/components/Button/Button.tsx` | Кнопка (NES.css стиль) |
| `withSettingsButton` | `client/hocs/withSettingsButton.tsx` | Кнопка настроек Telegram Mini App |

## Важные хуки

```typescript
useCharacter()              // Текущий персонаж из стора (бросает если undefined)
useRequest()                // [AsyncState, makeRequest] — асинхронные операции с состоянием загрузки
usePopup()                  // popup.confirm / popup.alert — диалоги подтверждения
useSyncCharacter()          // syncCharacter / clearCharacter — обновление стора
useCharacterGuard()         // Следит за gameId персонажа → навигация в игру
useGameGuard()              // Следит за статусом игры
useMountEffect()            // useEffect с пустыми deps
```

## Стили

- NES.css — ретро-игровая библиотека стилей
- Tailwind CSS — утилитарные классы
- CSS Modules — для специфичных компонентов (CharacterSelect, CharacterExp)
- Telegram Mini App: `var(--tg-theme-*)` — цвета темы Telegram
