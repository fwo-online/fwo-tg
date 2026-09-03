# AGENTS.md — fwo-tg

Fight World Online — Telegram Mini App RPG. Игроки выбирают класс, участвуют в PvP-боях на арене, башне и в лесу, прокачивают магии/умения, вступают в кланы.

## Быстрый старт для AI-агента

```bash
bun install
cd server && bun run migrate-active  # миграция для multiple characters
bun run dev                          # запуск из корня
```

## Структура

```
fwo-tg/
├── server/           # Бекенд: Hono HTTP + Socket.IO + Mongoose + Telegram Bot (grammy)
├── client/           # Фронтенд: React + React Router + Zustand + tma.js (Telegram Mini App)
├── shared/           # Общие типы и схемы (Character, Item, Clan, Magic, etc.)
├── AGENTS.md         # ← этот файл
└── docs/agents/      # Детальная документация по подсистемам
```

## Ключевые технологии

| Слой | Технологии |
|---|---|
| Server HTTP | Hono (роутинг), Valibot (валидация), hono/client (типизированный RPC) |
| Server WS | Socket.IO (игровые события, лобби, бои) |
| Server DB | Mongoose 8, MongoDB |
| Server Bot | grammy (Telegram Bot API) |
| Client | React 19, React Router 7, Zustand, tma.js SDK |
| Сборка | Bun, Biome (линтер/форматтер) |
| Монорепо | Bun workspaces |

## Документация по подсистемам

- **[Архитектура](docs/agents/architecture.md)** — монорепо, алиасы путей, пайплайн данных, конфигурация
- **[Сервер](docs/agents/server-patterns.md)** — CharacterService, API layer, `arena.characters` кеш, middleware
- **[Клиент](docs/agents/client-patterns.md)** — роутинг, Zustand-сторы, ApiClient, хуки
- **[Система эффектов](docs/agents/effects-system.md)** — Affect/Effect/LongEffect/Passive, PlayerAffects, EffectService, глобальные флаги
- **[Система магий](docs/agents/magic-system.md)** — каталог заклинаний кругов 1–7, статус реализации, механика изучения
- **[План: Ветки магий](docs/specs/magic-branches-plan.md)** — новая система специализаций (1–2 ветки), целенаправленное изучение без рандома
- **[Подклассы и улучшение класса](docs/agents/subclasses.md)** — 16 комбинаций классов, 8-й круг магии, активные и пассивные умения
- **[Multiple Characters](docs/agents/multiple-characters.md)** — добавленная фича: несколько персонажей, `active`, кеш, клиентский UX

## Конвенции

- Все DB-операции над персонажами — только через `server/api/character.ts`
- `CharacterService` — in-memory обёртка над `Char` документом, с бизнес-логикой
- `arena.characters[id]` — глобальный кеш CharacterService по `_id`
- `owner` = Telegram user ID (строка), **не уникальный** идентификатор
- HTTP хендлеры используют `withValidation()` для единообразной обработки ошибок
- Клиент использует `createRequest()` поверх типизированного Hono RPC клиента
- Zustand store: `useCharacterStore` — единственный источник текущего персонажа на клиенте
- ProtectedRoute: гидратация стора через `useEffect` (не в теле компонента)
