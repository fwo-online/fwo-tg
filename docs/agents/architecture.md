# Архитектура проекта

## Монорепо

```
fwo-tg/
├── server/                    # @fwo/server
│   ├── api/                   # DB-операции (character, clan, item, invoice...)
│   ├── arena/                 # Игровая логика
│   │   ├── CharacterService/  # Обёртка над персонажем (inventory, attributes, resources...)
│   │   ├── Constuructors/     # Базовые классы магий, умений, защиты
│   │   ├── magics/            # Конкретные магии (eclipse, glitch, madness...)
│   │   ├── skills/            # Умения
│   │   ├── passiveSkills/     # Пассивные навыки
│   │   ├── effects/           # Эффекты (stun, asleep...)
│   │   ├── GameService.ts     # Игровой цикл, управление боем
│   │   ├── PlayersService/    # Игроки внутри боя (PlayerService, PlayerAffects)
│   │   ├── MatchMakingService.ts
│   │   ├── TowerService/      # Башня
│   │   └── ForestService/     # Лес
│   ├── bot/                   # Telegram бот (старт, платежи, кланы)
│   ├── helpers/               # Вспомогательные функции (login, game, tower, forest)
│   ├── models/                # Mongoose схемы (character, item, clan, game...)
│   ├── server/                # Hono роуты + WebSocket
│   │   ├── character.ts       # Роуты персонажа
│   │   ├── middlewares/       # userMiddleware, characterMiddleware
│   │   └── ws/                # WebSocket обработчики (character, lobby, game, tower, forest)
│   ├── data/                  # Статические данные (профессии, предметы)
│   ├── cli/                   # CLI скрипты (миграции, сбросы)
│   └── utils/                 # Утилиты
├── client/                    # @fwo/client
│   ├── api/                   # API-клиент (типизированный Hono RPC)
│   ├── modules/               # Модули (character, lobby, game, settings, clan, market...)
│   │   └── */store/           # Zustand сторы модуля
│   ├── components/            # Общие компоненты (Button, Card, AppLayout, ProtectedRoute)
│   ├── hooks/                 # Общие хуки
│   ├── hocs/                  # HOC (withSettingsButton)
│   ├── context/               # React контексты (socket)
│   └── constants/             # Константы (классы персонажей, магии)
├── shared/                    # @fwo/shared
│   ├── character/             # Типы Character, CharacterAttributes, CharacterClass
│   ├── item/                  # Типы Item, ItemWear, ItemComponent
│   ├── clan/                  # Типы Clan
│   └── actions/               # ActionKey, OrderType, GameType
└── docker-compose.yml         # MongoDB + приложение
```

## Алиасы путей

### server/tsconfig.json
- `@/` → `server/`
- `@fwo/shared` → `shared/`

### client/tsconfig.json
- `@/` → `client/`
- `@fwo/shared` → `shared/`
- `@fwo/server` → `server/server/index.ts` (для типов Hono RPC)

## Поток данных

### Загрузка приложения
```
Клиент: App → router → ProtectedRoute → middleware (WebSocket)
                                       → loader (GET /character)
                                       → setCharacter в Zustand
                                       → ProtectedRouteGuards → дети
```

### HTTP запрос
```
Клиент: client.character.$get()  ──→  Hono RPC (типизированный)
Сервер: userMiddleware → characterMiddleware → handler → CharacterService
```

### Игровой WebSocket
```
Клиент: socket.emit('lobby:start', ...)
Сервер: ws/lobby.ts → MatchMakingService → GameService → PlayersService
```

## Конфигурация

- `server/arena/config.ts` — игровые настройки (лимиты опыта, шансы, стадии)
- `server/arena/config.stages.ts` — стадии конфига (development, production)
- `client/vite.config.ts` — Vite + path aliases
- `docker-compose.yml` — MongoDB (порт 27017), сервер
- `.env` / `.env.example` — BOT_TOKEN, APP_URL, MONGO_URI, VITE_API_URL
